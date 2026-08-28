import { describe, expect, it } from 'vitest';
import {
  buildOrderTimeline,
  canTransition,
  makeAuthRef,
  makeOrderId,
  makePnr,
  makeUtr,
  outcomeSummary,
  refundAmountFor,
} from './payment';
import type { BookingDraft, Order, PaymentOutcome } from './types';

const draft: BookingDraft = {
  trainNumber: '12723',
  date: '2026-08-28',
  classCode: '2A',
  quota: 'GN',
  fromStationCode: 'HYB',
  toStationCode: 'NDLS',
  boardingStationCode: 'HYB',
  passengers: [{ id: 'p1', name: 'Priya Menon', age: 34, gender: 'F', country: 'India' }],
  reservationChoice: 'book_even_if_waitlisted',
  considerAutoUpgradation: false,
};

function orderWith(outcome: PaymentOutcome, overrides: Partial<Order> = {}): Order {
  return {
    id: 'RI-1234-567890',
    createdAt: '2026-08-27T08:00:00.000Z',
    draft,
    outcome,
    paymentState: 'captured',
    amountPaise: 269860,
    authRef: 'AUTH 1234567',
    utr: 'UTR 123456789012',
    pnr: '4728166390',
    ...overrides,
  };
}

describe('canTransition — the hold-then-capture state machine (§7.7)', () => {
  it('allows the happy path created -> authorised -> held -> captured', () => {
    expect(canTransition('created', 'authorised')).toBe(true);
    expect(canTransition('authorised', 'held')).toBe(true);
    expect(canTransition('held', 'captured')).toBe(true);
  });

  it('allows the failure branch held -> failed -> release_pending -> released', () => {
    expect(canTransition('held', 'failed')).toBe(true);
    expect(canTransition('failed', 'release_pending')).toBe(true);
    expect(canTransition('release_pending', 'released')).toBe(true);
  });

  it('allows the refund branch captured -> refund_initiated -> refund_credited', () => {
    expect(canTransition('captured', 'refund_initiated')).toBe(true);
    expect(canTransition('refund_initiated', 'refund_credited')).toBe(true);
  });

  it('rejects impossible jumps', () => {
    expect(canTransition('created', 'captured')).toBe(false);
    expect(canTransition('captured', 'released')).toBe(false);
    expect(canTransition('released', 'captured')).toBe(false);
    expect(canTransition('refund_credited', 'refund_initiated')).toBe(false);
  });

  it('has no outgoing transitions from terminal states', () => {
    expect(canTransition('released', 'refund_initiated')).toBe(false);
    expect(canTransition('refund_credited', 'captured')).toBe(false);
  });
});

describe('reference generation — deterministic, correct format (§11.4)', () => {
  it('makeOrderId has the RI-XXXX-XXXXXX shape and is stable for the same draft', () => {
    const id = makeOrderId(draft);
    expect(id).toMatch(/^RI-\d{4}-\d{6}$/);
    expect(makeOrderId(draft)).toBe(id);
  });

  it('different drafts produce different order ids', () => {
    const other = makeOrderId({ ...draft, trainNumber: '12624' });
    expect(other).not.toBe(makeOrderId(draft));
  });

  it('makeAuthRef / makeUtr / makePnr are deterministic and correctly shaped', () => {
    expect(makeAuthRef('RI-1234-567890')).toMatch(/^AUTH \d{7}$/);
    expect(makeUtr('RI-1234-567890')).toMatch(/^UTR \d{12}$/);
    expect(makePnr('RI-1234-567890')).toMatch(/^\d{10}$/);
    expect(makeAuthRef('RI-1234-567890')).toBe(makeAuthRef('RI-1234-567890'));
  });
});

describe('buildOrderTimeline — one code path, four outcomes (§15)', () => {
  it('issued: ends captured + a pending chart step, no failure step', () => {
    const steps = buildOrderTimeline({ order: orderWith('issued'), outcome: 'issued' });
    const keys = steps.map((s) => s.key);
    expect(keys).toContain('issued');
    expect(keys).toContain('captured');
    expect(keys).toContain('chart');
    expect(steps.some((s) => s.state === 'failed')).toBe(false);
    expect(steps.find((s) => s.key === 'chart')!.state).toBe('pending');
  });

  it('debit_failed: has a failed issuance step and an active release step stating money held', () => {
    const steps = buildOrderTimeline({
      order: orderWith('debit_failed', { pnr: undefined, paymentState: 'release_pending' }),
      outcome: 'debit_failed',
      releaseByIso: '2026-08-29T00:00:00.000Z',
    });
    expect(steps.find((s) => s.key === 'issue_failed')!.state).toBe('failed');
    const release = steps.find((s) => s.key === 'release')!;
    expect(release.state).toBe('active');
    // Copy must carry the reassurance: money held, not taken; do not retry.
    expect(release.detail).toMatch(/held, not taken/i);
    expect(release.detail).toMatch(/do not retry/i);
    // No captured step — money was never taken.
    expect(steps.some((s) => s.key === 'captured')).toBe(false);
  });

  it('partially_confirmed: issued + captured + pending chart where the rest resolves', () => {
    const steps = buildOrderTimeline({ order: orderWith('partially_confirmed'), outcome: 'partially_confirmed' });
    expect(steps.find((s) => s.key === 'issued')!.label).toMatch(/partly confirmed/i);
    expect(steps.find((s) => s.key === 'chart')!.state).toBe('pending');
  });

  it('cancelled_refund: cancellation + refund_initiated + an active refund step', () => {
    const steps = buildOrderTimeline({
      order: orderWith('cancelled_refund', { paymentState: 'refund_initiated' }),
      outcome: 'cancelled_refund',
      releaseByIso: '2026-08-30T00:00:00.000Z',
    });
    expect(steps.find((s) => s.key === 'cancelled')!.state).toBe('done');
    expect(steps.find((s) => s.key === 'refund_initiated')!.state).toBe('done');
    expect(steps.find((s) => s.key === 'refund_credited')!.state).toBe('active');
  });

  it('every step timestamp is either null or a valid ISO string ordered after createdAt', () => {
    const order = orderWith('issued');
    const steps = buildOrderTimeline({ order, outcome: 'issued' });
    const created = new Date(order.createdAt).getTime();
    for (const s of steps) {
      if (s.timestamp !== null) {
        expect(new Date(s.timestamp).getTime()).toBeGreaterThanOrEqual(created);
      }
    }
  });
});

describe('refundAmountFor + outcomeSummary', () => {
  it('deducts a flat clerkage from the paid amount', () => {
    const order = orderWith('cancelled_refund', { amountPaise: 160360 });
    expect(refundAmountFor(order)).toBe(160360 - 6000);
  });

  it('never returns a negative refund', () => {
    const order = orderWith('cancelled_refund', { amountPaise: 1000 });
    expect(refundAmountFor(order)).toBe(0);
  });

  it('maps each outcome to a distinct label + chip variant', () => {
    expect(outcomeSummary('issued').variant).toBe('cnf');
    expect(outcomeSummary('partially_confirmed').variant).toBe('rac');
    expect(outcomeSummary('debit_failed').variant).toBe('wl');
    expect(outcomeSummary('cancelled_refund').variant).toBe('regret');
  });
});
