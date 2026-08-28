/**
 * Availability — PLAN.md §7.1, §S2. Reads mock inventory and exposes
 * search over it. This is the layer that makes feature 1 (all-class
 * availability in one view) real: `availabilityForTrain` returns every
 * class a train runs on a date, all at once — no per-class fetch.
 */
import type { ClassCode, ClassInventory, QuotaCode, Train } from './types';
import { CLASS_ORDER } from './rules';
import { findInventory, inventoryForTrainAndDate } from '@/data/inventory';
import { trains } from '@/data/trains';

/**
 * A plain route query, decoupled from the Zustand store shape
 * (store/booking.ts's SearchQuery) — domain modules must not depend
 * on the store layer. Screens and the agent adapt their own state
 * into this shape when calling searchTrains().
 */
export interface RouteQuery {
  fromCode: string;
  toCode: string;
  date: string;
  classCode?: 'ALL' | ClassCode;
  quota?: QuotaCode;
}

/** True if `train` has a halt at `stationCode` where boarding is possible (i.e. not the terminus). */
function boardableAt(train: Train, stationCode: string): boolean {
  return train.halts.some((h) => h.stationCode === stationCode && h.departure !== null);
}

/** True if `train` has a halt at `stationCode` where alighting is possible (i.e. not the origin). */
function alightableAt(train: Train, stationCode: string): boolean {
  return train.halts.some((h) => h.stationCode === stationCode && h.arrival !== null);
}

/** Index of a station within a train's halt list, or -1 if the train doesn't call there. */
function haltIndex(train: Train, stationCode: string): number {
  return train.halts.findIndex((h) => h.stationCode === stationCode);
}

/**
 * True if `train` runs from `fromCode` to `toCode` in that order —
 * i.e. `toCode` is a later halt than `fromCode`, and both are usable
 * (boardable / alightable respectively).
 */
export function trainServesRoute(train: Train, fromCode: string, toCode: string): boolean {
  const fromIdx = haltIndex(train, fromCode);
  const toIdx = haltIndex(train, toCode);
  if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) return false;
  return boardableAt(train, fromCode) && alightableAt(train, toCode);
}

/** Distinct classes a train actually runs, in the canonical CLASS_ORDER. */
export function classesOnTrain(train: Train): ClassCode[] {
  const running = new Set(train.coaches.map((c) => c.classCode));
  return CLASS_ORDER.filter((c) => running.has(c));
}

/**
 * All-class availability for one train on one date, optionally scoped
 * to a boarding station (so the hero case — 12624 REGRET at KYJ, CNF
 * at QLN — resolves correctly). Every class the train runs is present
 * in the result, even if no inventory entry was seeded for it (falls
 * back to NOT_AVAILABLE) — the UI must never show a gap.
 */
export function availabilityForTrain(train: Train, date: string, boardingStationCode?: string): ClassInventory[] {
  const classes = classesOnTrain(train);
  const seeded = inventoryForTrainAndDate(train.number, date, boardingStationCode);
  const seededByClass = new Map(seeded.map((e) => [e.classCode, e]));

  return classes.map((classCode) => {
    const entry = seededByClass.get(classCode) ?? findInventory(train.number, date, classCode, boardingStationCode);
    if (entry) {
      return {
        classCode,
        status: entry.status,
        baseFare: entry.baseFarePaise,
        updatedAgoSec: entry.updatedAgoSec,
      };
    }
    // No seeded data for this class on this date — render honestly rather
    // than fabricating a fare or a status. §0 rule 5: fake nothing visible.
    return { classCode, status: { kind: 'NOT_AVAILABLE' as const }, baseFare: 0, updatedAgoSec: 0 };
  });
}

/** The "best" status across a set of classes, for the date-strip summary (§S2.B). Confirmed beats RAC beats waitlist beats regret. */
export function bestStatusAcrossClasses(inventories: ClassInventory[]): ClassInventory | undefined {
  const rank: Record<string, number> = { CNF: 0, CNF_NO_BERTH: 1, RAC: 2, WL: 3, NOT_AVAILABLE: 4, REGRET: 5 };
  return [...inventories].sort((a, b) => (rank[a.status.kind] ?? 9) - (rank[b.status.kind] ?? 9))[0];
}

export interface SearchResult {
  train: Train;
  inventories: ClassInventory[];
}

/**
 * Search trains matching a query. Filters to trains that serve the
 * requested route and run on the requested date's weekday, then
 * attaches all-class availability for that date.
 */
export function searchTrains(query: RouteQuery): SearchResult[] {
  if (!query.fromCode || !query.toCode) return [];

  const weekday = new Date(query.date).toLocaleDateString('en-US', { weekday: 'short' }) as Train['runsOn'][number];

  return trains
    .filter((t) => trainServesRoute(t, query.fromCode, query.toCode))
    .filter((t) => t.runsOn.includes(weekday))
    .map((train) => ({
      train,
      inventories: availabilityForTrain(train, query.date, query.fromCode),
    }));
}

/** Total scheduled duration of a train's run between two halts, in minutes. Handles day rollover via the halt's `day` field. */
export function journeyDurationMinutes(train: Train, fromCode: string, toCode: string): number | null {
  const from = train.halts.find((h) => h.stationCode === fromCode);
  const to = train.halts.find((h) => h.stationCode === toCode);
  if (!from?.departure || !to?.arrival) return null;
  const [fh, fm] = from.departure.split(':').map(Number);
  const [th, tm] = to.arrival.split(':').map(Number);
  const dayDelta = to.day - from.day;
  return dayDelta * 24 * 60 + (th * 60 + tm) - (fh * 60 + fm);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}
