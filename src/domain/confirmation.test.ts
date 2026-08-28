import { describe, expect, it } from 'vitest';
import { bandFromClearedCount, confirmationEvidenceFor, evidenceFromHistory } from './confirmation';
import type { ConfirmationHistory } from './types';

/**
 * Pins the band thresholds from confirmation.ts's own doc comment, so
 * a future edit to the thresholds is a deliberate, visible change
 * rather than a silent drift. §7.5: never a percentage anywhere.
 */
describe('bandFromClearedCount — pinned thresholds', () => {
  it('usually_clears when 8-10 of 10 historical departures would have cleared this position', () => {
    expect(bandFromClearedCount(10, 10)).toBe('usually_clears');
    expect(bandFromClearedCount(8, 10)).toBe('usually_clears');
  });

  it('often_clears when 5-7 of 10 would have cleared', () => {
    expect(bandFromClearedCount(7, 10)).toBe('often_clears');
    expect(bandFromClearedCount(5, 10)).toBe('often_clears');
  });

  it('rarely_clears when 1-4 of 10 would have cleared', () => {
    expect(bandFromClearedCount(4, 10)).toBe('rarely_clears');
    expect(bandFromClearedCount(1, 10)).toBe('rarely_clears');
  });

  it('unlikely_to_clear when 0 of 10 would have cleared', () => {
    expect(bandFromClearedCount(0, 10)).toBe('unlikely_to_clear');
  });
});

describe('evidenceFromHistory', () => {
  const history: ConfirmationHistory = {
    trainNumber: '99999',
    classCode: 'SL',
    clearedTo: [34, 31, 40, 28, 36, 22, 44, 30, 39, 26],
  };

  it('counts historical departures that cleared at least as far as the user\'s position', () => {
    // At WL 22, only the single departure that cleared to exactly 22 would
    // have confirmed this user — the rest cleared to a higher number, which
    // still means "cleared to N or beyond" includes them too.
    const evidence = evidenceFromHistory(history, 22);
    // Every value in the fixture is >= 22, so all 10 would have cleared.
    expect(evidence.clearedCount).toBe(10);
    expect(evidence.band).toBe('usually_clears');
  });

  it('returns a lower clearedCount for a deep waitlist position', () => {
    const evidence = evidenceFromHistory(history, 43);
    // Only 44 clears 43 or beyond.
    expect(evidence.clearedCount).toBe(1);
    expect(evidence.band).toBe('rarely_clears');
  });

  it('returns unlikely_to_clear when no historical departure reached that far', () => {
    const evidence = evidenceFromHistory(history, 100);
    expect(evidence.clearedCount).toBe(0);
    expect(evidence.band).toBe('unlikely_to_clear');
  });

  it('always returns the full, unmodified 10-value history for display', () => {
    const evidence = evidenceFromHistory(history, 30);
    expect(evidence.history).toEqual(history.clearedTo);
    expect(evidence.history).toHaveLength(10);
  });
});

describe('confirmationEvidenceFor — seeded data', () => {
  it('resolves real evidence for 12723 SL, the reference GNWL train', () => {
    const evidence = confirmationEvidenceFor('12723', 'SL', 34);
    expect(evidence).toBeDefined();
    expect(evidence!.history).toHaveLength(10);
  });

  it('returns undefined, not fabricated data, when no history was seeded', () => {
    const evidence = confirmationEvidenceFor('00000', 'SL', 10);
    expect(evidence).toBeUndefined();
  });

  it('the poorly-clearing TQWL train (12649, 3A) reads as rarely or unlikely to clear at a typical position', () => {
    const evidence = confirmationEvidenceFor('12649', '3A', 9);
    expect(evidence).toBeDefined();
    expect(['rarely_clears', 'unlikely_to_clear']).toContain(evidence!.band);
  });
});
