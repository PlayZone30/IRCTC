/**
 * Seeded inventory — PLAN.md §10.3. Deliberately authored booking
 * statuses per train/class/date so no demo path is ever empty.
 * availability.ts (Task 4) reads this map; nothing else should define
 * inventory.
 *
 * `boardingStationCode` — optional. Indian Railways segments quota by
 * origin-station pair (§7.4, §8.10: GNWL vs RLWL vs PQWL), so the same
 * train/date/class can be REGRET for one boarding station and CNF for
 * an upstream one. Most seeded entries omit it, meaning "applies
 * regardless of boarding station" (the common case for trains where
 * we aren't demonstrating the alternates feature). The hero case
 * (12624) sets it explicitly: REGRET when boarding at KYJ, CNF when
 * boarding at the upstream station QLN. findInventory() falls back
 * from a station-specific entry to a station-agnostic one.
 */
import type { BookingStatus, ClassCode } from '@/domain/types';

export const DEMO_DATE = '2026-08-27'; // "today" for the whole seeded dataset
export const DEMO_DATE_PLUS_1 = '2026-08-28';
export const DEMO_DATE_PLUS_2 = '2026-08-29';
/**
 * The date used by the seeded agent demo ("book Kollam to Chennai on 12
 * September"). On this date 12624 is nothing-confirmed boarding at
 * Kollam Jn (QLN) but confirmed from the upstream origin Trivandrum
 * (TVC), so Sarathi's "propose an alternate because nothing is
 * confirmed" branch (§7.11) fires over real inventory.
 */
export const DEMO_AGENT_DATE = '2026-09-12';

export interface InventoryEntry {
  trainNumber: string;
  date: string;
  classCode: ClassCode;
  boardingStationCode?: string;
  /**
   * Segment destination. Only set on entries that model a specific
   * leg of a two-leg alternate (§7.4). When set, the entry is invisible
   * to the ordinary lookups (findInventory / inventoryForTrainAndDate)
   * and reachable only via segmentStatus() — so a segment leg never
   * leaks into the plain all-class comparison on Results.
   */
  toStationCode?: string;
  status: BookingStatus;
  baseFarePaise: number;
  updatedAgoSec: number;
}

function key(trainNumber: string, date: string, classCode: ClassCode, boardingStationCode?: string): string {
  return `${trainNumber}|${date}|${classCode}|${boardingStationCode ?? '*'}`;
}

export const inventory: InventoryEntry[] = [
  // 12723 Telangana SF Express — the reference case from the screenshots.
  // SL is NOT_AVAILABLE on the searched date (27 Aug), available the next day.
  { trainNumber: '12723', date: DEMO_DATE, classCode: 'SL', status: { kind: 'NOT_AVAILABLE' }, baseFarePaise: 75500, updatedAgoSec: 42 },
  { trainNumber: '12723', date: DEMO_DATE_PLUS_1, classCode: 'SL', status: { kind: 'WL', type: 'GNWL', number: 34 }, baseFarePaise: 75500, updatedAgoSec: 42 },
  { trainNumber: '12723', date: DEMO_DATE, classCode: '3A', status: { kind: 'WL', type: 'GNWL', number: 22 }, baseFarePaise: 187500, updatedAgoSec: 42 },
  // CNF with few berths left — 12723 · 2A per §10.3
  { trainNumber: '12723', date: DEMO_DATE, classCode: '2A', status: { kind: 'CNF', coach: 'A1', berth: 6, berthType: 'SL' }, baseFarePaise: 267500, updatedAgoSec: 42 },
  { trainNumber: '12723', date: DEMO_DATE, classCode: '1A', status: { kind: 'REGRET' }, baseFarePaise: 457500, updatedAgoSec: 42 },

  // 22691 Rajdhani Express — premium, AC only, mostly waitlisted. 1A REGRET per §10.3.
  { trainNumber: '22691', date: DEMO_DATE_PLUS_1, classCode: '1A', status: { kind: 'REGRET' }, baseFarePaise: 890000, updatedAgoSec: 55 },
  { trainNumber: '22691', date: DEMO_DATE_PLUS_1, classCode: '2A', status: { kind: 'WL', type: 'GNWL', number: 18 }, baseFarePaise: 545000, updatedAgoSec: 55 },
  { trainNumber: '22691', date: DEMO_DATE_PLUS_1, classCode: '3A', status: { kind: 'WL', type: 'GNWL', number: 41 }, baseFarePaise: 375000, updatedAgoSec: 55 },

  // 12649 Sampark Kranti — nearby-station alternate (different origin, same cluster).
  { trainNumber: '12649', date: DEMO_DATE, classCode: 'SL', status: { kind: 'CNF', coach: 'S2', berth: 14, berthType: 'MB' }, baseFarePaise: 68000, updatedAgoSec: 30 },
  { trainNumber: '12649', date: DEMO_DATE, classCode: '3A', status: { kind: 'WL', type: 'TQWL', number: 9 }, baseFarePaise: 172000, updatedAgoSec: 30 },
  { trainNumber: '12649', date: DEMO_DATE, classCode: '2A', status: { kind: 'RAC', number: 3 }, baseFarePaise: 248000, updatedAgoSec: 30 },

  // 12285 Duronto — full range of classes. RAC · SL per §10.3.
  { trainNumber: '12285', date: DEMO_DATE_PLUS_1, classCode: 'SL', status: { kind: 'RAC', number: 8 }, baseFarePaise: 71000, updatedAgoSec: 20 },
  { trainNumber: '12285', date: DEMO_DATE_PLUS_1, classCode: '3A', status: { kind: 'CNF', coach: 'B4', berth: 55, berthType: 'SL' }, baseFarePaise: 179000, updatedAgoSec: 20 },
  { trainNumber: '12285', date: DEMO_DATE_PLUS_1, classCode: '2A', status: { kind: 'CNF', coach: 'A2', berth: 12, berthType: 'UB' }, baseFarePaise: 259000, updatedAgoSec: 20 },
  { trainNumber: '12285', date: DEMO_DATE_PLUS_1, classCode: '2S', status: { kind: 'CNF', coach: 'D1', berth: 44, berthType: 'WS' }, baseFarePaise: 21000, updatedAgoSec: 20 },

  // 12721 Dakshin SF Express — late-night departure, exercises the charting bands.
  { trainNumber: '12721', date: DEMO_DATE, classCode: 'SL', status: { kind: 'WL', type: 'GNWL', number: 12 }, baseFarePaise: 79500, updatedAgoSec: 15 },
  { trainNumber: '12721', date: DEMO_DATE, classCode: '3A', status: { kind: 'CNF', coach: 'B2', berth: 30, berthType: 'MB' }, baseFarePaise: 195000, updatedAgoSec: 15 },
  { trainNumber: '12721', date: DEMO_DATE, classCode: '2A', status: { kind: 'CNF', coach: 'A1', berth: 3, berthType: 'LB' }, baseFarePaise: 285000, updatedAgoSec: 15 },

  // 12624 Chennai Mail — THE HERO CASE. Sold out from Kayankulam (KYJ),
  // confirmed from Kollam Jn (QLN, one halt upstream). This is the
  // segment-quota exhaustion the "board earlier" alternate exploits.
  { trainNumber: '12624', date: DEMO_DATE_PLUS_2, classCode: 'SL', boardingStationCode: 'KYJ', status: { kind: 'REGRET' }, baseFarePaise: 62500, updatedAgoSec: 10 },
  { trainNumber: '12624', date: DEMO_DATE_PLUS_2, classCode: '3A', boardingStationCode: 'KYJ', status: { kind: 'REGRET' }, baseFarePaise: 158000, updatedAgoSec: 10 },
  { trainNumber: '12624', date: DEMO_DATE_PLUS_2, classCode: '2A', boardingStationCode: 'KYJ', status: { kind: 'WL', type: 'GNWL', number: 46 }, baseFarePaise: 231000, updatedAgoSec: 10 },
  // Upstream at Kollam Jn (QLN), the same train/date/class is confirmed —
  // unused per-segment quota from the originating end of the route.
  { trainNumber: '12624', date: DEMO_DATE_PLUS_2, classCode: 'SL', boardingStationCode: 'QLN', status: { kind: 'CNF', coach: 'S3', berth: 19, berthType: 'LB' }, baseFarePaise: 65000, updatedAgoSec: 10 },
  { trainNumber: '12624', date: DEMO_DATE_PLUS_2, classCode: '3A', boardingStationCode: 'QLN', status: { kind: 'CNF', coach: 'B2', berth: 41, berthType: 'SU' }, baseFarePaise: 163500, updatedAgoSec: 10 },
  { trainNumber: '12624', date: DEMO_DATE_PLUS_2, classCode: '2A', boardingStationCode: 'QLN', status: { kind: 'CNF', coach: 'A1', berth: 9, berthType: 'UB' }, baseFarePaise: 237000, updatedAgoSec: 10 },

  // 12624 Chennai Mail on the agent-demo date — nothing confirmed
  // boarding at Kollam Jn (QLN), confirmed from the upstream origin
  // Trivandrum (TVC). Same board-earlier shape as the KYJ hero, but
  // reachable from the literal "book Kollam to Chennai" utterance.
  { trainNumber: '12624', date: DEMO_AGENT_DATE, classCode: 'SL', boardingStationCode: 'QLN', status: { kind: 'REGRET' }, baseFarePaise: 62500, updatedAgoSec: 12 },
  { trainNumber: '12624', date: DEMO_AGENT_DATE, classCode: '3A', boardingStationCode: 'QLN', status: { kind: 'REGRET' }, baseFarePaise: 158000, updatedAgoSec: 12 },
  { trainNumber: '12624', date: DEMO_AGENT_DATE, classCode: '2A', boardingStationCode: 'QLN', status: { kind: 'WL', type: 'GNWL', number: 38 }, baseFarePaise: 231000, updatedAgoSec: 12 },
  { trainNumber: '12624', date: DEMO_AGENT_DATE, classCode: 'SL', boardingStationCode: 'TVC', status: { kind: 'CNF', coach: 'S4', berth: 23, berthType: 'LB' }, baseFarePaise: 68500, updatedAgoSec: 12 },
  { trainNumber: '12624', date: DEMO_AGENT_DATE, classCode: '3A', boardingStationCode: 'TVC', status: { kind: 'CNF', coach: 'B3', berth: 8, berthType: 'LB' }, baseFarePaise: 172000, updatedAgoSec: 12 },
  { trainNumber: '12624', date: DEMO_AGENT_DATE, classCode: '2A', boardingStationCode: 'TVC', status: { kind: 'CNF', coach: 'A1', berth: 15, berthType: 'UB' }, baseFarePaise: 246000, updatedAgoSec: 12 },

  // 20635 Vande Bharat — confirmed-only, T-15 current booking.
  { trainNumber: '20635', date: DEMO_DATE, classCode: 'CC', status: { kind: 'CNF', coach: 'C3', berth: 22, berthType: 'A' }, baseFarePaise: 89500, updatedAgoSec: 5 },
  { trainNumber: '20635', date: DEMO_DATE, classCode: 'EC', status: { kind: 'CNF', coach: 'EC1', berth: 8, berthType: 'WS' }, baseFarePaise: 172500, updatedAgoSec: 5 },

  // 12951 Mumbai Rajdhani — two-leg-only demonstration (BCT->NDLS via BPL).
  // Direct 3A is REGRET, but each leg is separately confirmed — the exact
  // situation the two-leg alternate (§7.4) exists for. The two segment
  // entries below carry a toStationCode, so they are only reachable via
  // segmentStatus(), never via the ordinary all-class lookups.
  { trainNumber: '12951', date: DEMO_DATE_PLUS_1, classCode: '3A', status: { kind: 'REGRET' }, baseFarePaise: 214000, updatedAgoSec: 8 },
  { trainNumber: '12951', date: DEMO_DATE_PLUS_1, classCode: '2A', status: { kind: 'WL', type: 'GNWL', number: 8 }, baseFarePaise: 305000, updatedAgoSec: 8 },
  { trainNumber: '12951', date: DEMO_DATE_PLUS_1, classCode: '1A', status: { kind: 'CNF_NO_BERTH' }, baseFarePaise: 512000, updatedAgoSec: 8 },
  { trainNumber: '12951', date: DEMO_DATE_PLUS_1, classCode: '3A', boardingStationCode: 'BCT', toStationCode: 'BPL', status: { kind: 'CNF', coach: 'B1', berth: 20, berthType: 'LB' }, baseFarePaise: 138000, updatedAgoSec: 8 },
  { trainNumber: '12951', date: DEMO_DATE_PLUS_1, classCode: '3A', boardingStationCode: 'BPL', toStationCode: 'NDLS', status: { kind: 'CNF', coach: 'B3', berth: 44, berthType: 'SL' }, baseFarePaise: 96000, updatedAgoSec: 8 },
];

/**
 * Look up one train/date/class entry, optionally scoped to a boarding
 * station. If a station-specific entry exists it wins; otherwise falls
 * back to the station-agnostic entry (the common case). Passing no
 * boardingStationCode returns the station-agnostic entry only, which
 * is what a plain train-vs-train comparison (Results, §S2) wants —
 * it should not silently pick up a station-specific override.
 */
export function findInventory(trainNumber: string, date: string, classCode: ClassCode, boardingStationCode?: string): InventoryEntry | undefined {
  if (boardingStationCode) {
    const specific = inventory.find(
      (e) =>
        e.trainNumber === trainNumber &&
        e.date === date &&
        e.classCode === classCode &&
        e.boardingStationCode === boardingStationCode &&
        e.toStationCode === undefined,
    );
    if (specific) return specific;
  }
  return inventory.find(
    (e) => e.trainNumber === trainNumber && e.date === date && e.classCode === classCode && e.boardingStationCode === undefined && e.toStationCode === undefined,
  );
}

/**
 * Status for one leg of a journey, matching an entry that carries both
 * a boarding station and a segment destination. Used only by the
 * two-leg alternate generator (§7.4). Returns undefined when no such
 * segment was seeded — the generator then simply does not offer a
 * two-leg option for that split, rather than fabricating one.
 */
export function segmentStatus(trainNumber: string, date: string, classCode: ClassCode, fromCode: string, toCode: string): InventoryEntry | undefined {
  return inventory.find(
    (e) =>
      e.trainNumber === trainNumber &&
      e.date === date &&
      e.classCode === classCode &&
      e.boardingStationCode === fromCode &&
      e.toStationCode === toCode,
  );
}

/**
 * All entries for a train/date, resolved per class for a given boarding
 * station (station-specific entries win over station-agnostic ones,
 * same fallback as findInventory). Used by Results (§S2) to render the
 * all-class comparison row for a specific search.
 */
export function inventoryForTrainAndDate(trainNumber: string, date: string, boardingStationCode?: string): InventoryEntry[] {
  const entries = inventory.filter((e) => e.trainNumber === trainNumber && e.date === date && e.toStationCode === undefined);
  const byClass = new Map<ClassCode, InventoryEntry>();
  for (const entry of entries) {
    const isSpecificMatch = boardingStationCode && entry.boardingStationCode === boardingStationCode;
    const isAgnostic = entry.boardingStationCode === undefined;
    const existing = byClass.get(entry.classCode);
    if (isSpecificMatch) {
      byClass.set(entry.classCode, entry); // station-specific always wins
    } else if (isAgnostic && (!existing || existing.boardingStationCode !== boardingStationCode)) {
      byClass.set(entry.classCode, entry);
    }
  }
  return Array.from(byClass.values());
}

/**
 * All boarding-station-specific (non-segment) entries for a
 * train/date/class — used by the board-earlier alternate generator
 * (§7.4). Excludes two-leg segment entries.
 */
export function inventoryVariantsForClass(trainNumber: string, date: string, classCode: ClassCode): InventoryEntry[] {
  return inventory.filter(
    (e) => e.trainNumber === trainNumber && e.date === date && e.classCode === classCode && e.toStationCode === undefined,
  );
}

export { key as inventoryKey };
