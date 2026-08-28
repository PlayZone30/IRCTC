/**
 * Chart simulation — PLAN.md §7.8, §9.5 "At charting". Resolves RAC and
 * waitlisted passengers against freed inventory once the chart is
 * prepared, so a citizen can *observe* the transition rather than be
 * told about it after the fact. Deterministic and mock: the number of
 * berths that free up is a seeded function of the train/date/class, not
 * `Math.random()` (§11.4), so the same order always resolves the same
 * way on replay.
 *
 * Scope for this build: RAC -> CNF and WL -> CNF/RAC (§9.5 step 1) plus
 * berth/coach assignment for newly-confirmed passengers (step 2, via the
 * existing allocator). Cabin/coupé rules (1A, step 3), auto-upgradation
 * cascades (step 4), Tatkal-leg release (step 5) and VIKALP (step 6) are
 * out of scope for the POC and are not simulated.
 */
import type { BookingStatus, ClassCode, DecisionTrace, Order, Passenger } from './types';
import { firstChartTime, secondChartTime } from './rules';
import { allocate, seededHash } from './allocator';
import { availabilityForTrain } from './availability';
import { trainByNumber } from '@/data/trains';

export type ChartStage = 'not_yet' | 'first_chart' | 'second_chart';

/**
 * Which chart applies at `now` for a train departing at `departure`, and
 * whether it has been prepared yet. Current booking closes at the first
 * chart and reopens until the second chart at T-30 (§8.5, §9.5 step 7).
 */
export function chartStageAt(now: Date, departure: Date): ChartStage {
  const first = firstChartTime(departure);
  const second = secondChartTime(departure);
  if (now.getTime() >= second.getTime()) return 'second_chart';
  if (now.getTime() >= first.getTime()) return 'first_chart';
  return 'not_yet';
}

/** How many berths freed up (by cancellation) for one train/date/class — deterministic, not random. */
function freedBerthCount(trainNumber: string, date: string, classCode: ClassCode): number {
  // 0-4 freed berths, seeded per train/date/class so it never changes on replay.
  return Math.floor(seededHash(trainNumber, date, classCode, 'freed') * 5);
}

export interface ChartedPassengerResult {
  passenger: Passenger;
  before: BookingStatus;
  after: BookingStatus;
  trace: DecisionTrace;
  /** True if anything changed at this chart — a lower WL/RAC number counts, not just a full promotion. */
  changed: boolean;
  /** True only for a full promotion to a confirmed berth (WL/RAC -> CNF or CNF_NO_BERTH). */
  promoted: boolean;
}

export interface ChartResult {
  stage: ChartStage;
  chartedAt: Date;
  passengers: ChartedPassengerResult[];
  /** True if every passenger in the order ended this chart fully confirmed with a berth. */
  fullyConfirmed: boolean;
}

/**
 * Run the chart job for one order at chart time `stage` (§9.5 steps
 * 1-2). RAC and WL positions move down by the number of freed berths;
 * anyone who reaches position 0 or better is promoted (WL -> RAC if the
 * RAC pool has room, else straight to CNF; RAC -> CNF) and the promoted
 * passengers are run back through the allocator so they get real
 * coach/berth assignments with the usual party-compaction trace.
 *
 * Pure and deterministic. Does not mutate the order — callers apply the
 * result (e.g. into a store) themselves.
 */
export function runChartJob(order: Order, stage: ChartStage = 'first_chart'): ChartResult {
  const { draft } = order;
  const train = trainByNumber(draft.trainNumber);
  const chartedAt =
    stage === 'not_yet' || !train
      ? new Date()
      : stage === 'second_chart'
        ? secondChartTime(departureDate(train, draft))
        : firstChartTime(departureDate(train, draft));

  const freed = freedBerthCount(draft.trainNumber, draft.date, draft.classCode);
  const racFreed = Math.max(0, freed - 1); // one freed berth typically becomes a RAC-to-CNF, the rest resolve WL

  // Reconstruct each passenger's current status the same way the
  // allocator would have on booking day, then move WL/RAC numbers down
  // by the freed count and re-run the allocator for anyone promoted to
  // a real berth.
  const current = allocate({
    trainNumber: draft.trainNumber,
    date: draft.date,
    classCode: draft.classCode,
    boardingStationCode: draft.boardingStationCode,
    classStatus: seededClassStatus(train, draft) ?? classStatusHint(draft.classCode, order),
    passengers: draft.passengers,
    reservationChoice: draft.reservationChoice,
  });

  const promotedPassengers: Passenger[] = [];
  const results: ChartedPassengerResult[] = current.allocations.map((a) => {
    const before = a.status;
    if (before.kind === 'WL') {
      // TQWL does not get priority at charting (§8.10) — GNWL and the other
      // named pools clear first, so a TQWL position only moves down by half
      // the freed berths (rounded down) rather than the full count.
      const isTqwl = before.type === 'TQWL';
      const effectiveFreed = isTqwl ? Math.floor(freed / 2) : freed;
      const movedTo = before.number - effectiveFreed;
      if (movedTo <= 0) {
        promotedPassengers.push(a.passenger);
        // `after` is replaced once the promoted party runs back through the
        // allocator below; placeholder here so the shape is always valid.
        return { passenger: a.passenger, before, after: { kind: 'CNF_NO_BERTH' }, trace: [], changed: true, promoted: true };
      }
      if (movedTo <= racFreed) {
        return { passenger: a.passenger, before, after: { kind: 'RAC', number: movedTo }, trace: [{ code: 'DEFERRED_CHART', params: {} }], changed: true, promoted: false };
      }
      return { passenger: a.passenger, before, after: { kind: 'WL', type: before.type, number: movedTo }, trace: a.trace, changed: movedTo !== before.number, promoted: false };
    }
    if (before.kind === 'RAC') {
      const movedTo = before.number - freed;
      if (movedTo <= 0) {
        promotedPassengers.push(a.passenger);
        return { passenger: a.passenger, before, after: { kind: 'CNF_NO_BERTH' }, trace: [], changed: true, promoted: true };
      }
      return { passenger: a.passenger, before, after: { kind: 'RAC', number: movedTo }, trace: a.trace, changed: movedTo !== before.number, promoted: false };
    }
    // Already CNF/CNF_NO_BERTH/REGRET/NOT_AVAILABLE — unchanged at this chart.
    return { passenger: a.passenger, before, after: before, trace: a.trace, changed: false, promoted: false };
  });

  // Give promoted passengers a real berth via the allocator, run as a
  // fresh confirmed party so they get coach/berth + party compaction.
  if (promotedPassengers.length > 0 && draft.classCode !== '1A') {
    const promoted = allocate({
      trainNumber: draft.trainNumber,
      date: draft.date,
      classCode: draft.classCode,
      boardingStationCode: draft.boardingStationCode,
      classStatus: { kind: 'CNF', coach: defaultChartCoach(draft.classCode), berth: 1, berthType: 'LB' },
      passengers: promotedPassengers,
      reservationChoice: draft.reservationChoice,
    });
    const byId = new Map(promoted.allocations.map((a) => [a.passenger.id, a]));
    for (const r of results) {
      const match = byId.get(r.passenger.id);
      if (match) {
        r.after = match.status;
        r.trace = match.trace;
      }
    }
  }

  const fullyConfirmed = results.every((r) => r.after.kind === 'CNF' || r.after.kind === 'CNF_NO_BERTH');

  return { stage, chartedAt, passengers: results, fullyConfirmed };
}

/** The real seeded class-level status for this order's train/date/class, if any was seeded. */
function seededClassStatus(train: ReturnType<typeof trainByNumber>, draft: Order['draft']): BookingStatus | undefined {
  if (!train) return undefined;
  const inv = availabilityForTrain(train, draft.date, draft.boardingStationCode);
  return inv.find((c) => c.classCode === draft.classCode)?.status;
}

/** Best-effort departure Date for a draft, using the train's halt at the boarding station. */
function departureDate(train: ReturnType<typeof trainByNumber>, draft: Order['draft']): Date {
  const halt = train?.halts.find((h) => h.stationCode === draft.boardingStationCode);
  const time = halt?.departure ?? '00:00';
  return new Date(`${draft.date}T${time}:00`);
}

/** A representative coach id to model chart-time promotions against, mirroring allocator.ts's own default. */
function defaultChartCoach(classCode: ClassCode): string {
  switch (classCode) {
    case 'SL':
      return 'S3';
    case '3A':
      return 'B2';
    case '2A':
      return 'A1';
    default:
      return 'B1';
  }
}

/**
 * Reconstruct the class-level status the booking was originally made
 * against, from the order's outcome — the allocator needs this to
 * decide whether to treat the party as RAC/WL/CNF before re-deriving
 * each passenger's individual position.
 */
function classStatusHint(classCode: ClassCode, order: Order): BookingStatus {
  if (classCode === '1A') return { kind: 'CNF_NO_BERTH' };
  if (order.outcome === 'partially_confirmed') {
    // At least one passenger is unconfirmed; model the party as waitlisted
    // so the allocator mirrors WL/RAC numbers across it as it did on booking.
    return { kind: 'WL', type: 'GNWL', number: 1 };
  }
  return { kind: 'CNF', coach: defaultChartCoach(classCode), berth: 1, berthType: 'LB' };
}
