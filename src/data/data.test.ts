import { describe, expect, it } from 'vitest';
import { confirmationHistory } from './confirmationHistory';
import { inventory } from './inventory';
import { stationByCode, stations } from './stations';
import { trainByNumber, trains } from './trains';

/**
 * Referential-integrity checks for the mock dataset — not a PLAN.md
 * checklist item verbatim, but the natural extension of §15's
 * correctness discipline applied to data instead of rules. Catches
 * typoed train numbers or station codes before they surface as a
 * silent "undefined" in the UI.
 */
describe('mock data referential integrity', () => {
  it('every inventory entry references a real train', () => {
    for (const entry of inventory) {
      expect(trainByNumber(entry.trainNumber), `unknown train ${entry.trainNumber}`).toBeDefined();
    }
  });

  it('every confirmation history entry references a real train', () => {
    for (const entry of confirmationHistory) {
      expect(trainByNumber(entry.trainNumber), `unknown train ${entry.trainNumber}`).toBeDefined();
    }
  });

  it('every confirmation history entry has exactly 10 values', () => {
    for (const entry of confirmationHistory) {
      expect(entry.clearedTo).toHaveLength(10);
    }
  });

  it('every halt in every train references a real station', () => {
    for (const train of trains) {
      for (const halt of train.halts) {
        expect(stationByCode(halt.stationCode), `train ${train.number}: unknown station ${halt.stationCode}`).toBeDefined();
      }
    }
  });

  it('every train has an origin (null arrival) and a terminus (null departure)', () => {
    for (const train of trains) {
      const hasOrigin = train.halts.some((h) => h.arrival === null);
      const hasTerminus = train.halts.some((h) => h.departure === null);
      expect(hasOrigin, `train ${train.number} has no origin halt`).toBe(true);
      expect(hasTerminus, `train ${train.number} has no terminus halt`).toBe(true);
    }
  });

  it('the hero case exists: 12624 is REGRET at KYJ-side classes and has QLN upstream', () => {
    const train = trainByNumber('12624');
    expect(train).toBeDefined();
    const stationCodes = train!.halts.map((h) => h.stationCode);
    expect(stationCodes.indexOf('QLN')).toBeLessThan(stationCodes.indexOf('KYJ'));
  });

  it('the Kollam ambiguity pair exists for the agent to disambiguate', () => {
    const qln = stations.find((s) => s.code === 'QLN');
    const qlm = stations.find((s) => s.code === 'QLM');
    expect(qln).toBeDefined();
    expect(qlm).toBeDefined();
    // Both stations share the city "Kollam" but neither owns the bare word as
    // an alias, so "kollam" resolves to both and the agent must ask (§7.11.3).
    expect(qln!.city.toLowerCase()).toBe('kollam');
    expect(qlm!.city.toLowerCase()).toBe('kollam');
    expect(qln!.aliases).not.toContain('kollam');
    expect(qln!.aliases.some((a) => a.includes('kollam'))).toBe(true);
    expect(qlm!.aliases.some((a) => a.includes('kollam'))).toBe(true);
  });

  it('no duplicate station codes', () => {
    const codes = stations.map((s) => s.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('no duplicate train numbers', () => {
    const numbers = trains.map((t) => t.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});
