/**
 * Berth allocator — PLAN.md §9. Pure, deterministic, seeded. Returns
 * per-passenger berths AND a decision trace of reason codes (§13.3) —
 * the trace is what powers the "explained allotment" on Review (§7.6).
 *
 * §9.1 FORBIDDEN: no "middle coach first", no "berths 30-40 first", no
 * "lower berths first for centre of gravity", no cross-coach load
 * balancing. That is folklore with no official source. The only two
 * objectives Indian Railways has ever published are FCFS and party
 * compaction (§9.2) — this file implements those and nothing invented.
 */
import type {
  BerthType,
  BookingStatus,
  ClassCode,
  DecisionTrace,
  Passenger,
  ReservationChoice,
} from './types';

// --- §9.4 Berth geometry -----------------------------------------------------
// Cycles are config, not magic constants. Each entry is the repeating
// berth-type pattern within a coach. 1A is deliberately absent — it is
// never assigned a berth at booking (§9.2 rule 5).

interface ClassGeometry {
  capacity: number;
  cycle: BerthType[];
}

export const BERTH_GEOMETRY: Partial<Record<ClassCode, ClassGeometry>> = {
  SL: { capacity: 72, cycle: ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'] },
  '3A': { capacity: 72, cycle: ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'] },
  '2A': { capacity: 46, cycle: ['LB', 'UB', 'LB', 'UB', 'SL', 'SU'] },
  '3E': { capacity: 81, cycle: ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SM', 'SU'] },
  CC: { capacity: 78, cycle: ['WS', 'M', 'A', 'A', 'WS'] },
  EC: { capacity: 52, cycle: ['WS', 'A', 'A', 'WS'] },
  '2S': { capacity: 108, cycle: ['WS', 'M', 'A', 'A', 'M', 'WS'] },
};

/** Berth type for a 1-indexed berth number in a class, or undefined if the class has no berth model (1A). */
export function berthTypeFor(classCode: ClassCode, berthNumber: number): BerthType | undefined {
  const geo = BERTH_GEOMETRY[classCode];
  if (!geo) return undefined;
  return geo.cycle[(berthNumber - 1) % geo.cycle.length];
}

function isLower(t: BerthType | undefined): boolean {
  return t === 'LB';
}

// --- §9.3 Quotas carved out before general booking ---------------------------

/** Combined senior-citizen / women-45+ / pregnant lower-berth quota, lower bound of the [min,max] per coach. */
export const LOWER_BERTH_QUOTA_PER_COACH: Partial<Record<ClassCode, number>> = { SL: 6, '3A': 4, '2A': 3 };

/** Auto lower-berth thresholds (§9.3) — applied even with no stated preference. */
export const AUTO_LOWER_BERTH = { maleMinAge: 60, femaleMinAge: 45 };

export function isAutoLowerBerthEligible(p: Passenger): boolean {
  if (p.gender === 'M' && p.age >= AUTO_LOWER_BERTH.maleMinAge) return true;
  if (p.gender === 'F' && p.age >= AUTO_LOWER_BERTH.femaleMinAge) return true;
  return false;
}

// --- Deterministic pseudo-randomness (no Math.random anywhere, §11.4) --------

export function seededHash(...parts: (string | number)[]): number {
  let h = 2166136261;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff; // 0..1
}

// --- Allocation --------------------------------------------------------------

export interface AllocationInput {
  trainNumber: string;
  date: string;
  classCode: ClassCode;
  boardingStationCode: string;
  /** Class-level status from inventory — decides whether we assign berths at all. */
  classStatus: BookingStatus;
  passengers: Passenger[];
  reservationChoice: ReservationChoice;
  /** Coach id to place the party in (from inventory sample); falls back to a derived id. */
  coachId?: string;
}

export interface PassengerAllocation {
  passenger: Passenger;
  status: BookingStatus;
  trace: DecisionTrace;
}

export interface AllocationResult {
  allocations: PassengerAllocation[];
  /** True when a reservation-choice hard constraint failed — the whole booking is rolled back (§9.5 step 4). */
  rolledBack: boolean;
  rollbackReason?: string;
}

/**
 * Allocate berths for a booking. Deterministic given the input, so the
 * same booking always yields the same berths and the same explanation.
 */
export function allocate(input: AllocationInput): AllocationResult {
  const { classCode, classStatus, passengers, reservationChoice } = input;

  // §9.2 rule 5: 1A is never assigned a berth at booking. Confirmed, deferred.
  if (classCode === '1A') {
    const allocations = passengers.map((p) => ({
      passenger: p,
      status: { kind: 'CNF_NO_BERTH' } as BookingStatus,
      trace: [{ code: 'DEFERRED_1A' as const, params: {} }],
    }));
    return finalize(allocations, reservationChoice, classStatus);
  }

  // §9.2 rule 4 + §9.5 steps 5-6: RAC / WL / REGRET get status only, no berth.
  if (classStatus.kind === 'RAC' || classStatus.kind === 'WL') {
    const allocations = passengers.map((p, i) => ({
      passenger: p,
      // Mirror the class status onto each passenger, incrementing WL/RAC numbers
      // so a party reads as consecutive positions rather than all identical.
      status: offsetStatus(classStatus, i),
      trace: [{ code: 'DEFERRED_CHART' as const, params: {} }],
    }));
    return finalize(allocations, reservationChoice, classStatus);
  }

  if (classStatus.kind === 'REGRET' || classStatus.kind === 'NOT_AVAILABLE' || classStatus.kind === 'CNF_NO_BERTH') {
    // Nothing to allocate berths against; pass the status through.
    const allocations = passengers.map((p) => ({ passenger: p, status: classStatus, trace: [] as DecisionTrace }));
    return finalize(allocations, reservationChoice, classStatus);
  }

  // --- Confirmed class: assign actual berths (§9.5 step 3) ---
  const geo = BERTH_GEOMETRY[classCode];
  const coachId = input.coachId ?? defaultCoachId(classCode);
  const quotaLowerCount = LOWER_BERTH_QUOTA_PER_COACH[classCode] ?? 0;

  if (!geo) {
    // Class with no berth model but somehow confirmed — treat as no-berth confirmed.
    const allocations = passengers.map((p) => ({
      passenger: p,
      status: { kind: 'CNF_NO_BERTH' } as BookingStatus,
      trace: [{ code: 'DEFERRED_CHART' as const, params: {} }],
    }));
    return finalize(allocations, reservationChoice, classStatus);
  }

  // Build the coach's berths, classify quota-held lowers, and derive a
  // deterministic "already taken" set representing FCFS depletion earlier
  // in the day. Quota lowers are reserved (never in the general taken set).
  const berths = Array.from({ length: geo.capacity }, (_, i) => i + 1);
  const lowerBerths = berths.filter((n) => isLower(berthTypeFor(classCode, n)));
  const quotaLowers = new Set(lowerBerths.slice(0, quotaLowerCount));

  function isTakenEarlier(n: number): boolean {
    if (quotaLowers.has(n)) return false; // reserved, not part of general FCFS pool
    // ~55% of general berths already taken — deterministic per train/class/date/coach/berth.
    return seededHash(input.trainNumber, input.date, classCode, coachId, n) < 0.55;
  }

  const generalFree = berths.filter((n) => !quotaLowers.has(n) && !isTakenEarlier(n));
  const quotaFree = [...quotaLowers]; // available only to auto-LB-eligible passengers

  const allocations: PassengerAllocation[] = [];
  const partySize = passengers.length;

  for (const p of passengers) {
    const trace: DecisionTrace = [];
    let berth: number | undefined;

    if (isAutoLowerBerthEligible(p)) {
      // (a) Automatic lower berth — even with no stated preference.
      const fromQuota = quotaFree.shift();
      if (fromQuota !== undefined) {
        berth = fromQuota;
        trace.push({ code: 'AUTO_LB_APPLIED', params: {} });
      } else {
        const generalLower = takeFirst(generalFree, (n) => isLower(berthTypeFor(classCode, n)));
        if (generalLower !== undefined) {
          berth = generalLower;
          trace.push({ code: 'AUTO_LB_APPLIED', params: {} });
        } else {
          berth = generalFree.shift();
          trace.push({ code: 'AUTO_LB_LOST', params: {} });
        }
      }
    } else if (p.berthPreference === 'lower') {
      // (c) Stated lower preference, general pool only (quota lowers are not for them).
      const generalLower = takeFirst(generalFree, (n) => isLower(berthTypeFor(classCode, n)));
      if (generalLower !== undefined) {
        berth = generalLower;
        trace.push({ code: 'PREF_HONOURED', params: { pref: 'lower' } });
      } else {
        berth = generalFree.shift();
        trace.push({ code: 'PREF_EXHAUSTED', params: { pref: 'lower' } });
        if (quotaLowerCount > 0) trace.push({ code: 'QUOTA_HELD', params: { n: quotaLowerCount } });
      }
    } else {
      // (d) Deterministic fallback by berth index, honouring a non-lower preference when it happens to match.
      berth = generalFree.shift();
      const gotType = berth !== undefined ? berthTypeFor(classCode, berth) : undefined;
      if (p.berthPreference && matchesPref(p.berthPreference, gotType)) {
        trace.push({ code: 'PREF_HONOURED', params: { pref: p.berthPreference } });
      } else {
        trace.push({ code: 'FCFS_LATE', params: {} });
      }
    }

    // (b) Party compaction — single-coach mock, so a multi-passenger party is
    // kept in one coach by construction. Name it explicitly (§9.2 rule 2).
    if (partySize > 1) trace.push({ code: 'COMPACTED', params: {} });

    const status: BookingStatus =
      berth !== undefined
        ? { kind: 'CNF', coach: coachId, berth, berthType: berthTypeFor(classCode, berth) ?? 'UB' }
        : { kind: 'CNF_NO_BERTH' };
    allocations.push({ passenger: p, status, trace });
  }

  return finalize(allocations, reservationChoice, classStatus);
}

/** Apply the reservation-choice hard constraint (§9.5 step 4): roll the whole booking back on failure. */
function finalize(allocations: PassengerAllocation[], choice: ReservationChoice, classStatus: BookingStatus): AllocationResult {
  const confirmedCount = allocations.filter((a) => a.status.kind === 'CNF' || a.status.kind === 'CNF_NO_BERTH').length;
  const lowerCount = allocations.filter((a) => a.status.kind === 'CNF' && isLower(a.status.berthType)).length;

  if (choice === 'confirmed_only' && confirmedCount < allocations.length) {
    return { allocations, rolledBack: true, rollbackReason: 'You chose "book only if confirmed", and not every passenger could be confirmed. The booking was not made and you were not charged.' };
  }
  if (choice === 'at_least_one_lower' && lowerCount < 1) {
    return { allocations, rolledBack: true, rollbackReason: 'You chose "book only if at least one lower berth is allotted", and no lower berth was available. The booking was not made and you were not charged.' };
  }
  if (choice === 'two_lower' && lowerCount < 2) {
    return { allocations, rolledBack: true, rollbackReason: 'You chose "book only if two lower berths are allotted", and two lower berths were not available. The booking was not made and you were not charged.' };
  }
  void classStatus;
  return { allocations, rolledBack: false };
}

function offsetStatus(status: BookingStatus, i: number): BookingStatus {
  if (status.kind === 'RAC') return { kind: 'RAC', number: status.number + i };
  if (status.kind === 'WL') return { kind: 'WL', type: status.type, number: status.number + i };
  return status;
}

function takeFirst(pool: number[], predicate: (n: number) => boolean): number | undefined {
  const idx = pool.findIndex(predicate);
  if (idx === -1) return undefined;
  return pool.splice(idx, 1)[0];
}

function matchesPref(pref: NonNullable<Passenger['berthPreference']>, type: BerthType | undefined): boolean {
  if (!type) return false;
  switch (pref) {
    case 'lower':
      return type === 'LB';
    case 'middle':
      return type === 'MB';
    case 'upper':
      return type === 'UB';
    case 'side_lower':
      return type === 'SL';
    case 'side_upper':
      return type === 'SU';
    case 'window':
      return type === 'WS';
    default:
      return false;
  }
}

/**
 * The set of berths in a coach that are unavailable to a late general
 * booking — quota-held lowers plus the deterministic FCFS-taken set.
 * Exported so the coach-map UI (§7.6 override) shows exactly the same
 * occupancy the allocator used, rather than a second, divergent guess.
 */
export function occupiedBerths(trainNumber: string, date: string, classCode: ClassCode, coachId: string): Set<number> {
  const geo = BERTH_GEOMETRY[classCode];
  if (!geo) return new Set();
  const quotaLowerCount = LOWER_BERTH_QUOTA_PER_COACH[classCode] ?? 0;
  const lowerBerths = Array.from({ length: geo.capacity }, (_, i) => i + 1).filter((n) => isLower(berthTypeFor(classCode, n)));
  const quotaLowers = new Set(lowerBerths.slice(0, quotaLowerCount));
  const occupied = new Set<number>();
  for (let n = 1; n <= geo.capacity; n++) {
    if (quotaLowers.has(n)) continue; // quota-held is rendered separately by the map
    if (seededHash(trainNumber, date, classCode, coachId, n) < 0.55) occupied.add(n);
  }
  return occupied;
}

function defaultCoachId(classCode: ClassCode): string {
  switch (classCode) {
    case 'SL':
      return 'S3';
    case '3A':
      return 'B2';
    case '2A':
      return 'A1';
    case '3E':
      return 'M1';
    case 'CC':
      return 'C3';
    case 'EC':
      return 'EC1';
    case '2S':
      return 'D1';
    default:
      return 'B1';
  }
}
