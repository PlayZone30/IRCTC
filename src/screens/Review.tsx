import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon } from 'lucide-react';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { FareTable } from '@/components/ui/FareTable';
import { Sheet } from '@/components/ui/Sheet';
import { Stepper } from '@/components/ui/Stepper';
import { TimelineVertical } from '@/components/ui/TimelineVertical';
import { CoachMap } from '@/components/booking/CoachMap';
import { useI18n } from '@/i18n';
import { describeStatus } from '@/lib/status';
import { formatRupees } from '@/lib/money';
import { computeFare } from '@/domain/pricing';
import { allocate, berthTypeFor, occupiedBerths, type PassengerAllocation } from '@/domain/allocator';
import {
  CANCELLATION_BANDS,
  CLASS_LABELS,
  FLAT_CANCELLATION_CHARGE_PAISE,
  QUOTA_LABELS,
  firstChartTime,
} from '@/domain/rules';
import { findInventory } from '@/data/inventory';
import { stationByCode } from '@/data/stations';
import { trainByNumber } from '@/data/trains';
import { useBookingStore } from '@/store/booking';
import type { BookingStatus, DecisionTrace } from '@/domain/types';

/**
 * Review journey — PLAN.md §5 S4. Where we do the thing IRCTC does not:
 * explain the berth allotment before payment, and let the traveller
 * change it for free.
 */
export function Review() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { draft, updateDraft, setDraft } = useBookingStore();
  const [mapForPassenger, setMapForPassenger] = useState<string | null>(null);
  // Per-passenger manual berth overrides (§7.6 free change).
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  // DEV-ONLY: ?seed=1 builds a representative confirmed draft (senior +
  // general lower-pref + a third passenger on 12285 3A) so the berth block
  // can be screenshotted without walking the whole flow. Flag for removal
  // in Task 16 alongside the other dev hooks.
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
        { id: 'd2', name: 'Lakshmi Menon', age: 67, gender: 'F', country: 'India', berthPreference: 'no_preference' },
        { id: 'd3', name: 'Arjun Menon', age: 29, gender: 'M', country: 'India', berthPreference: 'no_preference' },
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

  const coachId = inventoryEntry?.status.kind === 'CNF' ? inventoryEntry.status.coach : undefined;

  const allocation = useMemo(() => {
    if (!draft || !inventoryEntry) return undefined;
    return allocate({
      trainNumber: draft.trainNumber,
      date: draft.date,
      classCode: draft.classCode,
      boardingStationCode: draft.boardingStationCode,
      classStatus: inventoryEntry.status,
      passengers: draft.passengers,
      reservationChoice: draft.reservationChoice,
      coachId,
    });
  }, [draft, inventoryEntry, coachId]);

  if (!draft || !train || !inventoryEntry || !allocation) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <EmptyState
          icon={<MapIcon className="size-5" />}
          title="No booking to review"
          description="Start from a search to book a ticket."
          action={<Button onClick={() => navigate('/')}>Search trains</Button>}
        />
      </div>
    );
  }

  const status = inventoryEntry.status;
  const described = describeStatus(status, draft.classCode);
  const baseFare = inventoryEntry.baseFarePaise;
  const fare = computeFare(baseFare * draft.passengers.length, draft.classCode, draft.paymentInstrument ?? 'upi');
  const fromStation = stationByCode(draft.fromStationCode);
  const toStation = stationByCode(draft.toStationCode);

  // Effective per-passenger status, applying any manual berth override.
  function effectiveStatus(a: PassengerAllocation): BookingStatus {
    const override = overrides[a.passenger.id];
    if (override !== undefined && a.status.kind === 'CNF' && coachId) {
      return { kind: 'CNF', coach: coachId, berth: override, berthType: berthTypeFor(draft!.classCode, override) ?? a.status.berthType };
    }
    return a.status;
  }

  // Berths occupied in the coach = FCFS-taken set plus berths held by the party
  // (excluding the one being edited), so the map never lets two people pick the same berth.
  function occupiedForEditing(editingId: string): Set<number> {
    const base = coachId ? new Set(occupiedBerths(draft!.trainNumber, draft!.date, draft!.classCode, coachId)) : new Set<number>();
    for (const a of allocation!.allocations) {
      if (a.passenger.id === editingId) continue;
      const s = effectiveStatus(a);
      if (s.kind === 'CNF') base.add(s.berth);
    }
    const self = overrides[editingId];
    if (self !== undefined) base.delete(self);
    return base;
  }

  const departure = new Date(`${draft.date}T${train.halts.find((h) => h.stationCode === draft.fromStationCode)?.departure ?? '00:00'}:00`);
  const chartAt = firstChartTime(departure);

  function handleContinue() {
    // Persist the (possibly overridden) passenger list is unnecessary here —
    // payment reads the draft + re-runs allocation. Overrides are display-level
    // for the POC; the draft already carries everything payment needs.
    updateDraft({});
    navigate('/book/payment');
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
      <Stepper current={2} />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          {/* Journey card */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-bold text-[var(--ink)]">
                  {train.name} <span className="tnum text-[var(--ink-3)]">({train.number})</span>
                </p>
                <p className="tnum text-sm text-[var(--ink-2)]">
                  {fromStation?.name} &rarr; {toStation?.name} · {draft.date}
                </p>
              </div>
              <Chip variant={described.variant}>{described.chipText}</Chip>
            </div>
            {draft.boardingStationCode !== draft.fromStationCode ? (
              <p className="mt-2 text-xs text-[var(--rac)]">
                Ticketed from {fromStation?.name}; you board at {stationByCode(draft.boardingStationCode)?.name}.
              </p>
            ) : null}
          </Card>

          {/* Reservation-choice rollback notice */}
          {allocation.rolledBack ? (
            <Banner variant="danger">{allocation.rollbackReason}</Banner>
          ) : null}

          {/* Berth allotment block — the differentiator */}
          <Card>
            <h2 className="mb-3 text-base font-bold text-[var(--ink)]">Berth allotment</h2>

            {draft.classCode === '1A' ? (
              <Banner variant="info">
                First AC berths are assigned when the chart is prepared, so families stay together and coupés are allocated
                appropriately. You will see your coach and berth after charting.
              </Banner>
            ) : status.kind === 'WL' || status.kind === 'RAC' ? (
              <Banner variant="warn">
                {described.label}. {describeStatus(status, draft.classCode).consequence} No coach or berth is assigned yet — it is
                allotted at charting.
              </Banner>
            ) : (
              <div className="flex flex-col gap-3">
                {allocation.allocations.map((a) => {
                  const s = effectiveStatus(a);
                  return (
                    <div key={a.passenger.id} className="rounded-[var(--r-field)] border border-[var(--hairline)] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[var(--ink)]">{a.passenger.name || 'Passenger'}</span>
                        {s.kind === 'CNF' ? (
                          <Chip variant="cnf">
                            {s.coach} · {s.berth} · {berthTypeLabel(s.berthType)}
                          </Chip>
                        ) : (
                          <Chip variant="cnf">Confirmed — berth at charting</Chip>
                        )}
                      </div>
                      {a.trace.length > 0 ? (
                        <p className="mt-2 text-xs leading-relaxed text-[var(--ink-2)]">{reasonText(a.trace, t)}</p>
                      ) : null}
                      {s.kind === 'CNF' ? (
                        <Button variant="quiet" icon={<MapIcon className="size-4" />} className="mt-2" onClick={() => setMapForPassenger(a.passenger.id)}>
                          View coach map / change berth
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* What happens next */}
          <Card>
            <h2 className="mb-3 text-base font-bold text-[var(--ink)]">What happens next</h2>
            <TimelineVertical
              steps={[
                { key: 'pay', label: 'Payment held', timestamp: null, detail: 'Money is held, not taken, until your ticket is issued.', state: 'active' },
                { key: 'issue', label: 'Ticket issued', timestamp: null, detail: 'Your PNR is generated and the hold is captured.', state: 'pending' },
                { key: 'chart', label: 'Chart prepared', timestamp: chartAt.toISOString(), detail: 'Any RAC or waitlist positions are resolved. 1A berths are assigned here.', state: 'pending' },
              ]}
            />
          </Card>

          {/* Cancellation terms — inline, not behind a link */}
          <Card>
            <h2 className="mb-3 text-base font-bold text-[var(--ink)]">If you cancel</h2>
            <ul className="flex flex-col gap-1.5 text-sm text-[var(--ink-2)]">
              {CANCELLATION_BANDS.map((band, i) => {
                const flat = FLAT_CANCELLATION_CHARGE_PAISE[draft.classCode] ?? 0;
                const deducted = Math.round(baseFare * draft.passengers.length * band.deductionRate);
                const label =
                  band.deductionRate === 0
                    ? `More than 72 hours before departure: ${formatRupees(flat)} flat charge per passenger`
                    : band.deductionRate === 1
                      ? 'Less than 8 hours before departure: no refund'
                      : `${bandWindow(band)}: ${Math.round(band.deductionRate * 100)}% of fare deducted (${formatRupees(deducted)})`;
                return (
                  <li key={i} className="flex gap-2">
                    <span className="text-[var(--ink-3)]">·</span>
                    {label}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Fare + continue */}
        <div>
          <div className="lg:sticky lg:top-24">
            <Card>
              <h2 className="mb-3 text-base font-bold text-[var(--ink)]">Fare</h2>
              <FareTable
                lines={[
                  { label: `Base fare × ${draft.passengers.length}`, amountPaise: fare.baseFarePaise },
                  { label: 'Convenience fee', amountPaise: fare.convenienceFeeBasePaise, caption: 'via UPI / AutoPay' },
                  { label: 'GST', amountPaise: fare.convenienceFeeGstPaise },
                ]}
                totalLabel="Total fare"
                totalPaise={fare.totalPaise}
              />
              <Button variant="accent" fullWidth className="mt-4" disabled={allocation.rolledBack} onClick={handleContinue}>
                Continue to payment
              </Button>
              <Button variant="ghost" fullWidth className="mt-2" onClick={() => navigate('/book/passengers')}>
                Back
              </Button>
              <p className="mt-2 text-center text-xs text-[var(--ink-3)]">{QUOTA_LABELS[draft.quota]} quota · {CLASS_LABELS[draft.classCode]}</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Coach map override sheet */}
      <Sheet open={mapForPassenger !== null} onClose={() => setMapForPassenger(null)} title="Choose a berth" side="bottom">
        {mapForPassenger && coachId ? (
          <CoachMap
            classCode={draft.classCode}
            coachId={coachId}
            occupied={occupiedForEditing(mapForPassenger)}
            selectedBerth={
              overrides[mapForPassenger] ??
              (() => {
                const a = allocation.allocations.find((x) => x.passenger.id === mapForPassenger);
                return a && a.status.kind === 'CNF' ? a.status.berth : undefined;
              })()
            }
            onSelect={(berth) => {
              setOverrides((o) => ({ ...o, [mapForPassenger]: berth }));
              setMapForPassenger(null);
            }}
          />
        ) : null}
      </Sheet>
    </div>
  );
}

function berthTypeLabel(t: string): string {
  const map: Record<string, string> = { LB: 'Lower', MB: 'Middle', UB: 'Upper', SL: 'Side lower', SM: 'Side middle', SU: 'Side upper', WS: 'Window', M: 'Middle', A: 'Aisle' };
  return map[t] ?? t;
}

function bandWindow(band: (typeof CANCELLATION_BANDS)[number]): string {
  if ('upToHours' in band) return `${band.moreThanHours}–${band.upToHours} hours before departure`;
  return `over ${band.moreThanHours} hours before departure`;
}

/** Turn the allocator's decision trace into the primary human explanation (§13.3). */
function reasonText(trace: DecisionTrace, t: (key: string, vars?: Record<string, string | number>) => string): string {
  // Render the berth-determining reason first, then append QUOTA_HELD if present.
  const primary = trace.find((e) => e.code !== 'COMPACTED' && e.code !== 'QUOTA_HELD') ?? trace[0];
  const parts: string[] = [];
  if (primary) parts.push(t(`berthReason.${primary.code}`, primary.params));
  const quota = trace.find((e) => e.code === 'QUOTA_HELD');
  if (quota) parts.push(t('berthReason.QUOTA_HELD', quota.params));
  const compacted = trace.find((e) => e.code === 'COMPACTED');
  if (compacted) parts.push(t('berthReason.COMPACTED', compacted.params));
  return parts.join(' ');
}
