/**
 * Seeded inventory — PLAN.md §10.3. Deliberately authored booking
 * statuses per train/class/date so no demo path is ever empty.
 * Keyed by `${trainNumber}|${date}|${classCode}`. availability.ts
 * (Task 4) reads this map; nothing else should define inventory.
 */
import type { BookingStatus, ClassCode } from '@/domain/types';

export const DEMO_DATE = '2026-08-27'; // "today" for the whole seeded dataset
export const DEMO_DATE_PLUS_1 = '2026-08-28';
export const DEMO_DATE_PLUS_2 = '2026-08-29';

export interface InventoryEntry {
  trainNumber: string;
  date: string;
  classCode: ClassCode;
  status: BookingStatus;
  baseFarePaise: number;
  updatedAgoSec: number;
}

function key(trainNumber: string, date: string, classCode: ClassCode): string {
  return `${trainNumber}|${date}|${classCode}`;
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
  // confirmed from Kollam Jn (QLN). The alternates generator (§7.4)
  // finds this by scanning per-station-pair inventory in availability.ts.
  { trainNumber: '12624', date: DEMO_DATE_PLUS_2, classCode: 'SL', status: { kind: 'REGRET' }, baseFarePaise: 62500, updatedAgoSec: 10 },
  { trainNumber: '12624', date: DEMO_DATE_PLUS_2, classCode: '3A', status: { kind: 'REGRET' }, baseFarePaise: 158000, updatedAgoSec: 10 },
  { trainNumber: '12624', date: DEMO_DATE_PLUS_2, classCode: '2A', status: { kind: 'WL', type: 'GNWL', number: 46 }, baseFarePaise: 231000, updatedAgoSec: 10 },

  // 20635 Vande Bharat — confirmed-only, T-15 current booking.
  { trainNumber: '20635', date: DEMO_DATE, classCode: 'CC', status: { kind: 'CNF', coach: 'C3', berth: 22, berthType: 'A' }, baseFarePaise: 89500, updatedAgoSec: 5 },
  { trainNumber: '20635', date: DEMO_DATE, classCode: 'EC', status: { kind: 'CNF', coach: 'EC1', berth: 8, berthType: 'WS' }, baseFarePaise: 172500, updatedAgoSec: 5 },

  // 12951 Mumbai Rajdhani — two-leg-only demonstration (BCT->NDLS via BPL).
  { trainNumber: '12951', date: DEMO_DATE_PLUS_1, classCode: '3A', status: { kind: 'REGRET' }, baseFarePaise: 214000, updatedAgoSec: 8 },
  { trainNumber: '12951', date: DEMO_DATE_PLUS_1, classCode: '2A', status: { kind: 'WL', type: 'GNWL', number: 8 }, baseFarePaise: 305000, updatedAgoSec: 8 },
  { trainNumber: '12951', date: DEMO_DATE_PLUS_1, classCode: '1A', status: { kind: 'CNF_NO_BERTH' }, baseFarePaise: 512000, updatedAgoSec: 8 },
];

export function findInventory(trainNumber: string, date: string, classCode: ClassCode): InventoryEntry | undefined {
  const k = key(trainNumber, date, classCode);
  return inventory.find((e) => key(e.trainNumber, e.date, e.classCode) === k);
}

export function inventoryForTrainAndDate(trainNumber: string, date: string): InventoryEntry[] {
  return inventory.filter((e) => e.trainNumber === trainNumber && e.date === date);
}
