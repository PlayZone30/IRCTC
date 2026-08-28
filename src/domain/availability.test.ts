import { describe, expect, it } from 'vitest';
import { availabilityForTrain, classesOnTrain, searchTrains, trainServesRoute } from './availability';
import { trainByNumber } from '@/data/trains';
import { DEMO_DATE, DEMO_DATE_PLUS_2 } from '@/data/inventory';

describe('the hero case — 12624 Chennai Mail', () => {
  const train = trainByNumber('12624')!;

  it('is REGRET in SL and 3A when boarding at Kayankulam (KYJ)', () => {
    const inv = availabilityForTrain(train, DEMO_DATE_PLUS_2, 'KYJ');
    const sl = inv.find((i) => i.classCode === 'SL');
    const threeA = inv.find((i) => i.classCode === '3A');
    expect(sl?.status.kind).toBe('REGRET');
    expect(threeA?.status.kind).toBe('REGRET');
  });

  it('is CNF in SL and 3A when boarding at Kollam Jn (QLN), one halt upstream', () => {
    const inv = availabilityForTrain(train, DEMO_DATE_PLUS_2, 'QLN');
    const sl = inv.find((i) => i.classCode === 'SL');
    const threeA = inv.find((i) => i.classCode === '3A');
    expect(sl?.status.kind).toBe('CNF');
    expect(threeA?.status.kind).toBe('CNF');
  });

  it('falls back to the station-agnostic entry when no boarding station is given', () => {
    // Without a boarding station, the query should not silently inherit
    // either the KYJ or QLN override — it has no station-agnostic
    // entries for SL/3A/2A on this date, so it must render NOT_AVAILABLE
    // rather than fabricate a status.
    const inv = availabilityForTrain(train, DEMO_DATE_PLUS_2);
    const sl = inv.find((i) => i.classCode === 'SL');
    expect(sl?.status.kind).toBe('NOT_AVAILABLE');
  });
});

describe('trainServesRoute', () => {
  const telangana = trainByNumber('12723')!;

  it('is true for the train\'s actual origin and terminus', () => {
    expect(trainServesRoute(telangana, 'HYB', 'NDLS')).toBe(true);
  });

  it('is false when the stations are reversed', () => {
    expect(trainServesRoute(telangana, 'NDLS', 'HYB')).toBe(false);
  });

  it('is false for a station the train does not halt at', () => {
    expect(trainServesRoute(telangana, 'HYB', 'MAS')).toBe(false);
  });

  it('is true for an intermediate-to-terminus pair', () => {
    expect(trainServesRoute(telangana, 'KZJ', 'NDLS')).toBe(true);
  });
});

describe('classesOnTrain', () => {
  it('returns the Vande Bharat\'s chair-car classes, not sleeper classes', () => {
    const vb = trainByNumber('20635')!;
    const classes = classesOnTrain(vb);
    expect(classes).toContain('CC');
    expect(classes).toContain('EC');
    expect(classes).not.toContain('SL');
  });
});

describe('searchTrains', () => {
  it('returns every class for every matching train, never a partial row', () => {
    const results = searchTrains({ fromCode: 'HYB', toCode: 'NDLS', date: DEMO_DATE });
    const telangana = results.find((r) => r.train.number === '12723');
    expect(telangana).toBeDefined();
    // 12723's standard rake runs 1A/2A/3A/SL — all four must be present,
    // even the ones with no seeded inventory for this exact date.
    const classCodes = telangana!.inventories.map((i) => i.classCode).sort();
    expect(classCodes).toEqual(['1A', '2A', '3A', 'SL']);
  });

  it('returns an empty array when either station is missing', () => {
    expect(searchTrains({ fromCode: '', toCode: 'NDLS', date: DEMO_DATE })).toEqual([]);
  });
});
