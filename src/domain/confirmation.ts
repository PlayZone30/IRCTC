/**
 * Confirmation guidance — PLAN.md §7.5. "Never a percentage." Every
 * band is derived from the seeded history and is accompanied by the
 * ten historical values it came from, so the user sees evidence
 * rather than a verdict. No model, no randomness — purely a lookup
 * against `data/confirmationHistory.ts`.
 */
import type { ClassCode, ConfirmationBand, ConfirmationHistory } from './types';
import { historyFor } from '@/data/confirmationHistory';

export interface ConfirmationEvidence {
  band: ConfirmationBand;
  history: number[]; // the 10 historical clearedTo values, oldest to newest
  userNumber: number;
  /** Of the 10 historical departures, how many cleared at least this far. */
  clearedCount: number;
}

/**
 * Band thresholds, by the fraction of the 10 historical departures
 * whose waitlist cleared to at least `userWlNumber` (i.e. a departure
 * where the historical clearance was >= the user's position would
 * have confirmed this user too):
 *
 *   fraction >= 0.8   -> usually_clears     (cleared in 8-10 of the last 10)
 *   fraction >= 0.5   -> often_clears       (cleared in 5-7 of the last 10)
 *   fraction >  0     -> rarely_clears      (cleared in 1-4 of the last 10)
 *   fraction === 0    -> unlikely_to_clear  (never cleared this far)
 *
 * These thresholds are the only place this logic exists. If they need
 * to change, change them here — do not duplicate the ratio math in a
 * component.
 */
export function bandFromClearedCount(clearedCount: number, historyLength: number): ConfirmationBand {
  const fraction = clearedCount / historyLength;
  if (fraction >= 0.8) return 'usually_clears';
  if (fraction >= 0.5) return 'often_clears';
  if (fraction > 0) return 'rarely_clears';
  return 'unlikely_to_clear';
}

/**
 * Confirmation evidence for a passenger sitting at `userWlNumber` on
 * `trainNumber`/`classCode`. Returns undefined when no history was
 * seeded for this train+class — callers must render an honest "no
 * history available" state rather than fabricate one (§0 rule 5).
 */
export function confirmationEvidenceFor(trainNumber: string, classCode: ClassCode, userWlNumber: number): ConfirmationEvidence | undefined {
  const history = historyFor(trainNumber, classCode);
  if (!history) return undefined;
  return evidenceFromHistory(history, userWlNumber);
}

export function evidenceFromHistory(history: ConfirmationHistory, userWlNumber: number): ConfirmationEvidence {
  const clearedCount = history.clearedTo.filter((v) => v >= userWlNumber).length;
  return {
    band: bandFromClearedCount(clearedCount, history.clearedTo.length),
    history: history.clearedTo,
    userNumber: userWlNumber,
    clearedCount,
  };
}

export const CONFIRMATION_BAND_LABEL: Record<ConfirmationBand, string> = {
  usually_clears: 'Usually clears',
  often_clears: 'Often clears',
  rarely_clears: 'Rarely clears',
  unlikely_to_clear: 'Unlikely to clear',
};

/** Chip variant per band — reuses the wl/cnf/rac status palette rather than inventing new colours. */
export const CONFIRMATION_BAND_VARIANT: Record<ConfirmationBand, 'cnf' | 'rac' | 'wl' | 'regret'> = {
  usually_clears: 'cnf',
  often_clears: 'rac',
  rarely_clears: 'wl',
  unlikely_to_clear: 'regret',
};
