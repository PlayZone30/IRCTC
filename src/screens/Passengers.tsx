import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Stepper } from '@/components/ui/Stepper';
import { FareTable } from '@/components/ui/FareTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { describeStatus } from '@/lib/status';
import { computeFare } from '@/domain/pricing';
import { isAutoLowerBerthEligible } from '@/domain/allocator';
import {
  CLASS_LABELS,
  NO_CONCESSION_IN,
  QUOTA_LABELS,
  RESERVATION_CHOICE_OPTIONS,
  maxPassengersFor,
} from '@/domain/rules';
import { findInventory } from '@/data/inventory';
import { stationByCode } from '@/data/stations';
import { trainByNumber } from '@/data/trains';
import { useBookingStore } from '@/store/booking';
import { useCurrentAccount } from '@/store/session';
import type { Passenger, PaymentInstrument, ReservationChoice } from '@/domain/types';

/**
 * Passenger details — PLAN.md §5 S3. Field parity with IRCTC, with the
 * co-branded-card upsell removed and the rules surfaced (auto-lower-berth
 * notice, concession-not-available notice, reservation choice promoted
 * from a buried dropdown to a visible radio group).
 */
const BERTH_PREFS: { value: NonNullable<Passenger['berthPreference']>; label: string }[] = [
  { value: 'no_preference', label: 'No preference' },
  { value: 'lower', label: 'Lower' },
  { value: 'middle', label: 'Middle' },
  { value: 'upper', label: 'Upper' },
  { value: 'side_lower', label: 'Side lower' },
  { value: 'side_upper', label: 'Side upper' },
];

let rowCounter = 0;
function emptyRow(): Passenger {
  rowCounter += 1;
  return { id: `new-${rowCounter}`, name: '', age: 0, gender: 'M', country: 'India', berthPreference: 'no_preference' };
}

export function Passengers() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { draft, updateDraft } = useBookingStore();
  const [rows, setRows] = useState<Passenger[]>(draft?.passengers.length ? draft.passengers : [emptyRow()]);
  const [reservationChoice, setReservationChoice] = useState<ReservationChoice>(draft?.reservationChoice ?? 'book_even_if_waitlisted');
  const [considerUpgrade, setConsiderUpgrade] = useState(draft?.considerAutoUpgradation ?? false);

  const train = draft ? trainByNumber(draft.trainNumber) : undefined;

  const inventoryEntry = useMemo(() => {
    if (!draft) return undefined;
    return findInventory(draft.trainNumber, draft.date, draft.classCode, draft.boardingStationCode);
  }, [draft]);

  if (!draft || !train) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <EmptyState
          icon={<Plus className="size-5" />}
          title="No booking in progress"
          description="Start from a search to book a ticket."
          action={<Button onClick={() => navigate('/')}>Search trains</Button>}
        />
      </div>
    );
  }

  const maxPax = maxPassengersFor(draft.quota);
  const baseFarePerPax = inventoryEntry?.baseFarePaise ?? 0;
  const status = inventoryEntry?.status ?? { kind: 'NOT_AVAILABLE' as const };
  const described = describeStatus(status, draft.classCode);
  const isWaitlisted = status.kind === 'WL';

  const concessionBlockedInQuota = NO_CONCESSION_IN.includes(draft.quota);
  const instrument: PaymentInstrument = draft.paymentInstrument ?? 'upi';
  const fare = computeFare(baseFarePerPax * rows.length, draft.classCode, instrument);

  const boardingHalts = train.halts.filter((h) => h.departure !== null);

  function updateRow(id: string, patch: Partial<Passenger>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    if (rows.length >= maxPax) return;
    setRows((rs) => [...rs, emptyRow()]);
  }

  function removeRow(id: string) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));
  }

  function fillFromSaved(p: Passenger) {
    if (rows.length >= maxPax) return;
    // Replace the first empty row, else append.
    setRows((rs) => {
      const firstEmpty = rs.findIndex((r) => !r.name);
      const cloned = { ...p, id: `saved-${p.id}-${Date.now()}` };
      if (firstEmpty >= 0) {
        const copy = [...rs];
        copy[firstEmpty] = cloned;
        return copy;
      }
      return [...rs, cloned];
    });
  }

  function canContinue(): boolean {
    return rows.every((r) => r.name.trim().length > 0 && r.age > 0);
  }

  function handleContinue() {
    updateDraft({
      passengers: rows,
      reservationChoice,
      considerAutoUpgradation: considerUpgrade,
    });
    navigate('/book/review');
  }

  const fromStation = stationByCode(draft.fromStationCode);
  const toStation = stationByCode(draft.toStationCode);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
      <Stepper current={1} />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          {/* Journey summary */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-bold text-[var(--ink)]">
                  {train.name} <span className="tnum text-[var(--ink-3)]">({train.number})</span>
                </p>
                <p className="tnum text-sm text-[var(--ink-2)]">
                  {fromStation?.name} &rarr; {toStation?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Chip variant="outline">
                  {CLASS_LABELS[draft.classCode]} · {QUOTA_LABELS[draft.quota]}
                </Chip>
                <Chip variant={described.variant}>{described.chipText}</Chip>
              </div>
            </div>
            <Button variant="quiet" className="mt-2" onClick={() => navigate('/search')}>
              Change train or class
            </Button>
          </Card>

          {/* Boarding point */}
          <Card>
            <label className="mb-1 block text-xs font-medium text-[var(--ink-2)]" htmlFor="boarding-point">
              Boarding point
            </label>
            <select
              id="boarding-point"
              value={draft.boardingStationCode}
              onChange={(e) => updateDraft({ boardingStationCode: e.target.value })}
              className="w-full rounded-[var(--r-field)] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2.5 text-[15px] text-[var(--ink)] outline-none focus:shadow-[var(--focus)]"
            >
              {boardingHalts.map((h) => {
                const st = stationByCode(h.stationCode);
                return (
                  <option key={h.stationCode} value={h.stationCode}>
                    {st?.name} · dep {h.departure} · day {h.day}
                  </option>
                );
              })}
            </select>
            {draft.boardingStationCode !== draft.fromStationCode ? (
              <Banner variant="warn" className="mt-3">
                You give up the right to board at {stationByCode(draft.fromStationCode)?.name}. This ticket is valid from{' '}
                {stationByCode(draft.fromStationCode)?.name} onward; you board at {stationByCode(draft.boardingStationCode)?.name}.
              </Banner>
            ) : null}
          </Card>

          {/* Eligibility notice — only when it applies */}
          {concessionBlockedInQuota ? (
            <Banner variant="warn">
              Concessions are not available in the {QUOTA_LABELS[draft.quota]} quota. The full fare applies to every passenger.
            </Banner>
          ) : null}

          {/* Passengers */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--ink)]">Passengers</h2>
              <span className="text-xs text-[var(--ink-3)]">
                Up to {maxPax} per {QUOTA_LABELS[draft.quota]} booking
              </span>
            </div>

            {account && account.savedPassengers.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-[var(--ink-2)]">Tap to add a saved passenger</p>
                <div className="flex flex-wrap gap-2">
                  {account.savedPassengers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => fillFromSaved(p)}
                      disabled={rows.length >= maxPax}
                      className="rounded-[var(--r-chip)] border border-[var(--hairline)] px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--surface-2)] disabled:opacity-40"
                    >
                      {p.name} · {p.age}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-4">
              {rows.map((row, i) => {
                const autoLb = row.age > 0 && isAutoLowerBerthEligible(row);
                return (
                  <div key={row.id} className="rounded-[var(--r-field)] border border-[var(--hairline)] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ink-3)]">Passenger {i + 1}</span>
                      {rows.length > 1 ? (
                        <IconButton icon={<Trash2 className="size-4" />} aria-label={`Remove passenger ${i + 1}`} onClick={() => removeRow(row.id)} />
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <input
                        type="text"
                        placeholder="Full name"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                        className="col-span-2 rounded-[var(--r-field)] border border-[var(--hairline)] px-3 py-2 text-sm outline-none focus:shadow-[var(--focus)]"
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="Age"
                        value={row.age || ''}
                        onChange={(e) => updateRow(row.id, { age: Number(e.target.value) })}
                        className="tnum rounded-[var(--r-field)] border border-[var(--hairline)] px-3 py-2 text-sm outline-none focus:shadow-[var(--focus)]"
                      />
                      <select
                        value={row.gender}
                        onChange={(e) => updateRow(row.id, { gender: e.target.value as Passenger['gender'] })}
                        className="rounded-[var(--r-field)] border border-[var(--hairline)] px-2 py-2 text-sm outline-none focus:shadow-[var(--focus)]"
                        aria-label={`Gender for passenger ${i + 1}`}
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                      <select
                        value={row.berthPreference}
                        onChange={(e) => updateRow(row.id, { berthPreference: e.target.value as Passenger['berthPreference'] })}
                        className="col-span-2 rounded-[var(--r-field)] border border-[var(--hairline)] px-2 py-2 text-sm outline-none focus:shadow-[var(--focus)] sm:col-span-4"
                        aria-label={`Berth preference for passenger ${i + 1}`}
                      >
                        {BERTH_PREFS.map((b) => (
                          <option key={b.value} value={b.value}>
                            Berth: {b.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {autoLb ? (
                      <Banner variant="info" className="mt-3">
                        A lower berth will be requested automatically for this passenger, subject to availability.
                      </Banner>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <Button variant="quiet" icon={<Plus className="size-4" />} className="mt-3" onClick={addRow} disabled={rows.length >= maxPax}>
              Add passenger
            </Button>
          </Card>

          {/* Reservation choice */}
          <Card>
            <h2 className="mb-3 text-base font-bold text-[var(--ink)]">Reservation choice</h2>
            <div className="flex flex-col gap-2">
              {RESERVATION_CHOICE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-start gap-3 rounded-[var(--r-field)] border border-[var(--hairline)] p-3">
                  <input
                    type="radio"
                    name="reservation-choice"
                    checked={reservationChoice === opt.value}
                    onChange={() => setReservationChoice(opt.value)}
                    className="mt-0.5 size-4 text-[var(--primary)] focus-visible:shadow-[var(--focus)]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[var(--ink)]">{opt.label}</span>
                    {opt.consequence ? <span className="block text-xs text-[var(--ink-3)]">{opt.consequence}</span> : null}
                  </span>
                </label>
              ))}
            </div>

            <label className="mt-4 flex items-start gap-3">
              <input
                type="checkbox"
                checked={considerUpgrade}
                onChange={(e) => setConsiderUpgrade(e.target.checked)}
                className="mt-0.5 size-4 rounded border-[var(--hairline)] text-[var(--primary)] focus-visible:shadow-[var(--focus)]"
              />
              <span>
                <span className="block text-sm font-medium text-[var(--ink)]">Consider for free auto-upgradation</span>
                <span className="block text-xs text-[var(--ink-3)]">
                  You may be moved up to a higher class at no extra charge. A lower berth is not assured after an upgrade.
                </span>
              </span>
            </label>
          </Card>

          {/* Contact */}
          <Card>
            <h2 className="mb-3 text-base font-bold text-[var(--ink)]">Contact</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--ink-2)]" htmlFor="contact-mobile">
                  Mobile
                </label>
                <input
                  id="contact-mobile"
                  type="tel"
                  defaultValue={account?.mobileMasked ?? ''}
                  className="tnum w-full rounded-[var(--r-field)] border border-[var(--hairline)] px-3 py-2 text-sm outline-none focus:shadow-[var(--focus)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--ink-2)]" htmlFor="contact-email">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  defaultValue={account?.emailMasked ?? ''}
                  className="w-full rounded-[var(--r-field)] border border-[var(--hairline)] px-3 py-2 text-sm outline-none focus:shadow-[var(--focus)]"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sticky fare panel */}
        <div>
          <div className="lg:sticky lg:top-24">
            <Card>
              <h2 className="mb-3 text-base font-bold text-[var(--ink)]">Fare</h2>
              <FareTable
                lines={[
                  { label: `Base fare × ${rows.length}`, amountPaise: fare.baseFarePaise },
                  { label: 'Convenience fee', amountPaise: fare.convenienceFeeBasePaise, caption: 'via UPI / AutoPay' },
                  { label: 'GST', amountPaise: fare.convenienceFeeGstPaise },
                ]}
                totalLabel="Total fare"
                totalPaise={fare.totalPaise}
              />
              {isWaitlisted ? (
                <Banner variant="warn" className="mt-3">
                  A fully waitlisted ticket does not let you board a reserved coach. If it does not clear, it is cancelled
                  automatically and refunded, minus ₹60 clerkage. The convenience fee is not refunded.
                </Banner>
              ) : null}
              <Button variant="accent" fullWidth className="mt-4" disabled={!canContinue()} onClick={handleContinue}>
                Continue to review
              </Button>
              <Button variant="ghost" fullWidth className="mt-2" onClick={() => navigate('/search')}>
                Back
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
