/**
 * Payment state machine — PLAN.md §7.7, S6. Hold-then-capture is the
 * default (iPAY AutoPay semantics): money is held, not taken, and only
 * captured when the ticket is issued; if issuance fails, the hold is
 * released. This is the fix for the single most persistent complaint in
 * the evidence — "money debited, ticket not issued, status unclear".
 *
 * Every transition produces a visible, referenced timeline step (§S6),
 * so the citizen can always see where their money is. Deterministic and
 * mock — no real gateway, no network.
 */
import type { BookingDraft, Order, OrderTimelineStep, PaymentOutcome, PaymentState } from './types';
import { formatRupees } from '@/lib/money';
import { translate } from '@/i18n';

export type { PaymentOutcome } from './types';

/** Allowed transitions — the state machine, enforced so no screen invents an impossible jump. */
const TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  created: ['authorised', 'failed'],
  authorised: ['held', 'failed'],
  held: ['captured', 'release_pending', 'failed'],
  captured: ['refund_initiated'],
  release_pending: ['released'],
  released: [],
  refund_initiated: ['refund_credited'],
  refund_credited: [],
  failed: ['release_pending'],
};

export function canTransition(from: PaymentState, to: PaymentState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

// --- Deterministic reference generation (no Math.random, §11.4) --------------

function seed(...parts: (string | number)[]): number {
  let h = 2166136261;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeOrderId(draft: BookingDraft): string {
  const n = seed(draft.trainNumber, draft.date, draft.fromStationCode, draft.toStationCode, draft.passengers.map((p) => p.id).join(','));
  const a = (n % 9000) + 1000;
  const b = (Math.floor(n / 9000) % 900000) + 100000;
  return `RI-${a}-${b}`;
}

export function makeAuthRef(orderId: string): string {
  return `AUTH ${(seed(orderId, 'auth') % 9000000) + 1000000}`;
}

export function makeUtr(orderId: string): string {
  return `UTR ${(seed(orderId, 'utr') % 900000000000) + 100000000000}`;
}

export function makePnr(orderId: string): string {
  return String((seed(orderId, 'pnr') % 9000000000) + 1000000000);
}

// --- Timeline construction ---------------------------------------------------

export interface BuildTimelineOptions {
  order: Order;
  outcome: PaymentOutcome;
  /** ISO date the hold will be released / refund credited by (display only). */
  releaseByIso?: string;
}

/**
 * Build the ordered timeline steps for an order given its outcome. This
 * is the single source for the S6 timeline — the screen renders whatever
 * this returns, so the four §15 outcomes all flow through one code path.
 */
export function buildOrderTimeline({ order, outcome, releaseByIso }: BuildTimelineOptions): OrderTimelineStep[] {
  const created = order.createdAt;
  const t = (offsetSec: number) => new Date(new Date(created).getTime() + offsetSec * 1000).toISOString();

  const steps: OrderTimelineStep[] = [
    { key: 'created', label: 'Order created', timestamp: created, reference: order.id, state: 'done' },
    { key: 'authorised', label: 'Payment authorised', timestamp: t(4), detail: 'A hold was placed on your money. It is not captured yet.', reference: order.authRef, state: 'done' },
    { key: 'bank_ref', label: 'Bank reference received', timestamp: t(9), reference: order.utr, state: 'done' },
    { key: 'allocation', label: 'Seat allocation requested', timestamp: t(12), detail: 'Sent to the reservation system.', state: 'done' },
  ];

  if (outcome === 'issued') {
    steps.push(
      { key: 'issued', label: 'Ticket issued', timestamp: t(18), detail: 'Your PNR was generated.', reference: order.pnr ? `PNR ${order.pnr}` : undefined, state: 'done' },
      { key: 'captured', label: 'Payment captured', timestamp: t(20), detail: 'The hold was captured now that your ticket is confirmed.', state: 'done' },
      { key: 'chart', label: 'Chart preparation', timestamp: null, detail: 'Scheduled before departure. Any RAC or waitlist positions resolve here.', state: 'pending' },
    );
  } else if (outcome === 'debit_failed') {
    steps.push(
      { key: 'issue_failed', label: 'Ticket not issued', timestamp: t(18), detail: 'The reservation system did not confirm a ticket.', state: 'failed' },
      {
        key: 'release',
        label: 'Hold being released',
        timestamp: t(20),
        detail: translate('money.issuanceFailed', {
          amount: formatRupees(order.amountPaise),
          date: releaseByIso ? formatDate(releaseByIso) : 'the next working day',
          utr: order.utr ?? '',
        }),
        state: 'active',
      },
    );
  } else if (outcome === 'partially_confirmed') {
    steps.push(
      { key: 'issued', label: 'Ticket issued — partly confirmed', timestamp: t(18), detail: 'Some passengers are confirmed; others are RAC or waitlisted and resolve at charting.', reference: order.pnr ? `PNR ${order.pnr}` : undefined, state: 'done' },
      { key: 'captured', label: 'Payment captured', timestamp: t(20), state: 'done' },
      { key: 'chart', label: 'Chart preparation', timestamp: null, detail: 'The unconfirmed passengers resolve here.', state: 'pending' },
    );
  } else if (outcome === 'cancelled_refund') {
    steps.push(
      { key: 'issued', label: 'Ticket issued', timestamp: t(18), reference: order.pnr ? `PNR ${order.pnr}` : undefined, state: 'done' },
      { key: 'captured', label: 'Payment captured', timestamp: t(20), state: 'done' },
      { key: 'cancelled', label: 'Ticket cancelled', timestamp: t(3600), detail: 'You cancelled this booking.', state: 'done' },
      { key: 'refund_initiated', label: 'Refund initiated', timestamp: t(3610), state: 'done' },
      {
        key: 'refund_credited',
        label: 'Refund on its way',
        timestamp: null,
        detail: translate('money.refundInProgress', {
          amount: formatRupees(refundAmountFor(order)),
          instrument: 'your original payment method',
          date: releaseByIso ? formatDate(releaseByIso) : 'a few working days',
          utr: order.utr ?? '',
        }),
        state: 'active',
      },
    );
  }

  return steps;
}

/** A simple mock refund: full amount minus a flat clerkage, for the cancelled-refund demo order. */
export function refundAmountFor(order: Order): number {
  const clerkagePaise = 6000; // ₹60, §8.9
  return Math.max(0, order.amountPaise - clerkagePaise);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/** Overall state label + chip variant for the order header (§S6). */
export function outcomeSummary(outcome: PaymentOutcome): { label: string; variant: 'cnf' | 'rac' | 'wl' | 'regret' } {
  switch (outcome) {
    case 'issued':
      return { label: 'Ticket issued', variant: 'cnf' };
    case 'partially_confirmed':
      return { label: 'Partly confirmed', variant: 'rac' };
    case 'debit_failed':
      return { label: 'Not issued — money held, not taken', variant: 'wl' };
    case 'cancelled_refund':
      return { label: 'Cancelled — refund in progress', variant: 'regret' };
  }
}
