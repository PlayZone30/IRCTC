import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Stepper } from '@/components/ui/Stepper';
import { cx } from '@/lib/cx';
import { formatRupees } from '@/lib/money';
import { computeFare } from '@/domain/pricing';
import { makeAuthRef, makeOrderId, makePnr, makeUtr } from '@/domain/payment';
import { CLASS_LABELS } from '@/domain/rules';
import { findInventory } from '@/data/inventory';
import { trainByNumber } from '@/data/trains';
import { useBookingStore } from '@/store/booking';
import { useOrdersStore } from '@/store/orders';
import type { Order, PaymentInstrument, PaymentOutcome } from '@/domain/types';

/**
 * Payment — PLAN.md §5 S5. Hold-then-capture as the default (§7.7).
 * The instrument list shows a readable fare table per method with the
 * lowest total flagged — the fix for IRCTC's dense unreadable gateway
 * charge string.
 */
const INSTRUMENTS: { value: PaymentInstrument; label: string; note: string }[] = [
  { value: 'upi', label: 'UPI / AutoPay', note: 'No gateway charge' },
  { value: 'rupay_debit', label: 'RuPay debit card', note: 'No gateway charge' },
  { value: 'other_debit', label: 'Other debit card', note: '0.4–0.9% gateway charge' },
  { value: 'credit_card', label: 'Credit card', note: '1.8% gateway charge' },
  { value: 'net_banking', label: 'Net banking', note: 'Flat ₹10 gateway charge' },
];

export function Payment() {
  const navigate = useNavigate();
  const { draft, setDraft } = useBookingStore();
  const addOrder = useOrdersStore((s) => s.addOrder);
  const [instrument, setInstrument] = useState<PaymentInstrument>('upi');

  // DEV-ONLY: ?seed=1 builds a confirmed draft so the pay screen can be
  // screenshotted without walking the whole flow. Flag for removal in
  // Task 16 alongside the other dev hooks.
  useEffect(() => {
    if (draft) return;
    if (new URLSearchParams(window.location.search).get('seed') !== '1') return;
    setDraft({
      trainNumber: '12285',
      date: '2026-08-28',
      classCode: '3A',
      quota: 'GN',
      fromStationCode: 'SC',
      toStationCode: 'NZM',
      boardingStationCode: 'SC',
      passengers: [
        { id: 'd1', name: 'Priya Menon', age: 34, gender: 'F', country: 'India', berthPreference: 'lower' },
        { id: 'd2', name: 'Arjun Menon', age: 29, gender: 'M', country: 'India', berthPreference: 'no_preference' },
      ],
      reservationChoice: 'book_even_if_waitlisted',
      considerAutoUpgradation: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const train = draft ? trainByNumber(draft.trainNumber) : undefined;
  const inventoryEntry = useMemo(() => {
    if (!draft) return undefined;
    return findInventory(draft.trainNumber, draft.date, draft.classCode, draft.boardingStationCode);
  }, [draft]);

  if (!draft || !train || !inventoryEntry) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <EmptyState
          icon={<CreditCard className="size-5" />}
          title="No booking to pay for"
          description="Start from a search to book a ticket."
          action={<Button onClick={() => navigate('/')}>Search trains</Button>}
        />
      </div>
    );
  }

  const baseFare = inventoryEntry.baseFarePaise * draft.passengers.length;
  const status = inventoryEntry.status;

  // Fare per instrument, so the list shows real per-method totals and the cheapest.
  const perInstrument = INSTRUMENTS.map((opt) => ({ ...opt, fare: computeFare(baseFare, draft.classCode, opt.value) }));
  const lowestTotal = Math.min(...perInstrument.map((p) => p.fare.totalPaise));
  const selected = perInstrument.find((p) => p.value === instrument)!;

  function authorise() {
    const orderId = makeOrderId(draft!);
    // Outcome for a live booking: confirmed classes issue; RAC/WL/1A also
    // "issue" (a valid ticket with a pending berth); nothing here fails —
    // the debit_failed branch is demonstrated by the seeded order, not
    // fabricated live. Partially-confirmed if the class is RAC/WL.
    const outcome: PaymentOutcome = status.kind === 'RAC' || status.kind === 'WL' ? 'partially_confirmed' : 'issued';
    const order: Order = {
      id: orderId,
      createdAt: new Date(`${draft!.date}T00:00:00`).toISOString(),
      draft: draft!,
      outcome,
      paymentState: 'captured',
      amountPaise: selected.fare.totalPaise,
      authRef: makeAuthRef(orderId),
      utr: makeUtr(orderId),
      pnr: makePnr(orderId),
    };
    addOrder(order);
    navigate(`/orders/${orderId}`);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
      <Stepper current={3} />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          {/* Hold-then-capture explainer */}
          <Banner variant="info">
            We place a hold on your money. It is captured only when your ticket is issued. If issuance fails, the hold is released.
          </Banner>

          {/* Method list */}
          <Card>
            <h2 className="mb-3 text-base font-bold text-[var(--ink)]">Choose how to pay</h2>
            <div className="flex flex-col gap-2">
              {perInstrument.map((opt) => {
                const isLowest = opt.fare.totalPaise === lowestTotal;
                const isSelected = opt.value === instrument;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setInstrument(opt.value)}
                    aria-pressed={isSelected}
                    className={cx(
                      'flex items-center justify-between gap-3 rounded-[var(--r-field)] border-2 p-3 text-left transition-colors duration-150',
                      isSelected ? 'border-[var(--primary)] bg-[var(--primary-weak)]' : 'border-[var(--hairline)] hover:bg-[var(--surface-2)]',
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--ink)]">{opt.label}</span>
                        {isLowest ? <Chip variant="solid-accent">Lowest total</Chip> : null}
                      </div>
                      <span className="text-xs text-[var(--ink-3)]">{opt.note}</span>
                    </div>
                    <span className="tnum text-sm font-bold text-[var(--primary-press)]">{formatRupees(opt.fare.totalPaise)}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Selected instrument breakdown */}
          <Card>
            <h2 className="mb-3 text-base font-bold text-[var(--ink)]">{selected.label} — breakdown</h2>
            <dl className="overflow-hidden rounded-[var(--r-field)] border border-[var(--hairline)]">
              <Row label={`Base fare × ${draft.passengers.length}`} value={formatRupees(selected.fare.baseFarePaise)} />
              <Row label="Convenience fee" value={formatRupees(selected.fare.convenienceFeeBasePaise)} border />
              <Row label="GST" value={formatRupees(selected.fare.convenienceFeeGstPaise)} border />
              {selected.fare.gatewayChargePaise > 0 ? (
                <Row label="Gateway charge" value={formatRupees(selected.fare.gatewayChargePaise)} border />
              ) : null}
              <div className="flex items-center justify-between bg-[var(--surface-2)] px-4 py-3">
                <span className="text-sm font-bold text-[var(--ink)]">Total to hold</span>
                <span className="tnum text-lg font-bold text-[var(--primary-press)]">{formatRupees(selected.fare.totalPaise)}</span>
              </div>
            </dl>
          </Card>
        </div>

        {/* Authorise */}
        <div>
          <div className="lg:sticky lg:top-24">
            <Card>
              <p className="text-sm text-[var(--ink-2)]">
                {train.name} · {CLASS_LABELS[draft.classCode]}
              </p>
              <p className="tnum mt-3 text-2xl font-bold text-[var(--primary-press)]">{formatRupees(selected.fare.totalPaise)}</p>
              <p className="text-xs text-[var(--ink-3)]">held now, captured only when your ticket is issued</p>
              <Button variant="accent" fullWidth className="mt-4" onClick={authorise}>
                Authorise {formatRupees(selected.fare.totalPaise)} hold
              </Button>
              <Button variant="ghost" fullWidth className="mt-2" onClick={() => navigate('/book/review')}>
                Back
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, border }: { label: string; value: string; border?: boolean }) {
  return (
    <div className={cx('flex items-center justify-between px-4 py-2.5', border && 'border-t border-[var(--hairline)]')}>
      <span className="text-sm text-[var(--ink-2)]">{label}</span>
      <span className="tnum text-sm font-medium text-[var(--ink)]">{value}</span>
    </div>
  );
}
