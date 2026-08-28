/**
 * Confirmation history — PLAN.md §10.5. Ten historical waitlist
 * clearance values per train x class, hand-authored to be internally
 * consistent (a usually-confirmed train doesn't get wild values).
 * Drives §7.5's evidence block. Must never be randomised at runtime.
 */
import type { ClassCode } from '@/domain/types';
import type { ConfirmationHistory } from '@/domain/types';

export const confirmationHistory: ConfirmationHistory[] = [
  // 12723 SL — a mid-range GNWL train, clears reasonably often.
  { trainNumber: '12723', classCode: 'SL', clearedTo: [34, 31, 40, 28, 36, 22, 44, 30, 39, 26] },
  { trainNumber: '12723', classCode: '3A', clearedTo: [26, 24, 30, 19, 28, 15, 33, 21, 29, 18] },

  // 22691 Rajdhani — premium train, clears poorly (small pool, high demand).
  { trainNumber: '22691', classCode: '2A', clearedTo: [10, 8, 12, 6, 9, 4, 11, 7, 10, 5] },
  { trainNumber: '22691', classCode: '3A', clearedTo: [22, 18, 25, 14, 20, 11, 24, 16, 21, 13] },

  // 12649 Sampark Kranti — TQWL, does not get priority at charting, clears rarely.
  { trainNumber: '12649', classCode: '3A', clearedTo: [3, 2, 4, 1, 3, 0, 4, 2, 3, 1] },

  // 12285 Duronto — RAC-heavy, moderate clearance for SL.
  { trainNumber: '12285', classCode: 'SL', clearedTo: [18, 16, 20, 14, 17, 12, 19, 15, 18, 13] },

  // 12721 Dakshin — usually clears comfortably.
  { trainNumber: '12721', classCode: 'SL', clearedTo: [22, 20, 25, 18, 21, 16, 24, 19, 23, 17] },

  // 12624 Chennai Mail — poor clearance in 2A on this leg (hero-case train).
  { trainNumber: '12624', classCode: '2A', clearedTo: [55, 50, 58, 44, 52, 40, 57, 48, 54, 43] },

  // 12951 Mumbai Rajdhani — 2A clears well; used by the two-leg demo.
  { trainNumber: '12951', classCode: '2A', clearedTo: [14, 12, 16, 10, 13, 9, 15, 11, 14, 10] },
];

export function historyFor(trainNumber: string, classCode: ClassCode): ConfirmationHistory | undefined {
  return confirmationHistory.find((h) => h.trainNumber === trainNumber && h.classCode === classCode);
}
