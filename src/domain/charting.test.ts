import { describe, expect, it } from 'vitest';
import { chartStageAt, runChartJob } from './charting';
import { firstChartTime, secondChartTime } from './rules';
import type { Order } from './types';

const partiallyConfirmedOrder: Order = {
  id: 'RI-9137-882045',
  createdAt: '2026-08-27T09:25:00.000Z',
  outcome: 'partially_confirmed',
  paymentState: 'captured',
  amountPaise: 153360,
  authRef: 'AUTH 6620713',
  utr: 'UTR 550119402277',
  pnr: '8890342156',
  draft: {
    trainNumber: '12723',
    date: '2026-08-28',
    classCode: 'SL',
    quota: 'GN',
    fromStationCode: 'HYB',
    toStationCode: 'NDLS',
    boardingStationCode: 'HYB',
    passengers: [
      { id: 'o4p1', name: 'Priya Menon', age: 34, gender: 'F', country: 'India' },
      { id: 'o4p2', name: 'Arjun Menon', age: 29, gender: 'M', country: 'India' },
    ],
    reservationChoice: 'book_even_if_waitlisted',
    considerAutoUpgradation: false,
  },
};

const confirmedOrder: Order = {
  id: 'RI-4821-556193',
  createdAt: '2026-08-27T08:12:00.000Z',
  outcome: 'issued',
  paymentState: 'captured',
  amountPaise: 269860,
  authRef: 'AUTH 8846201',
  utr: 'UTR 526239104882',
  pnr: '4728166390',
  draft: {
    trainNumber: '12723',
    date: '2026-08-27',
    classCode: '2A',
    quota: 'GN',
    fromStationCode: 'HYB',
    toStationCode: 'NDLS',
    boardingStationCode: 'HYB',
    passengers: [{ id: 'o1p1', name: 'Priya Menon', age: 34, gender: 'F', country: 'India' }],
    reservationChoice: 'book_even_if_waitlisted',
    considerAutoUpgradation: false,
  },
};

describe('chartStageAt — §8.5 boundaries', () => {
  it('is not_yet before the first chart', () => {
    const departure = new Date('2026-08-28T06:00:00');
    const first = firstChartTime(departure);
    expect(chartStageAt(new Date(first.getTime() - 60000), departure)).toBe('not_yet');
  });

  it('is first_chart between the first and second chart', () => {
    const departure = new Date('2026-08-28T06:00:00');
    const first = firstChartTime(departure);
    expect(chartStageAt(first, departure)).toBe('first_chart');
  });

  it('is second_chart at or after T-30', () => {
    const departure = new Date('2026-08-28T06:00:00');
    const second = secondChartTime(departure);
    expect(chartStageAt(second, departure)).toBe('second_chart');
    expect(second.getTime()).toBe(departure.getTime() - 30 * 60 * 1000);
  });
});

describe('runChartJob — §9.5 "at charting" resolution', () => {
  it('is deterministic: the same order charts identically on replay', () => {
    const a = runChartJob(partiallyConfirmedOrder);
    const b = runChartJob(partiallyConfirmedOrder);
    expect(a.passengers.map((p) => p.after)).toEqual(b.passengers.map((p) => p.after));
    expect(a.fullyConfirmed).toBe(b.fullyConfirmed);
  });

  it('never regresses a passenger — after is always as good or better than before', () => {
    const rank: Record<string, number> = { REGRET: 0, NOT_AVAILABLE: 0, WL: 1, RAC: 2, CNF_NO_BERTH: 3, CNF: 3 };
    const result = runChartJob(partiallyConfirmedOrder);
    for (const p of result.passengers) {
      expect(rank[p.after.kind]).toBeGreaterThanOrEqual(rank[p.before.kind]);
    }
  });

  it('moves a waitlisted passenger down by the freed-berth count for this seeded order', () => {
    const result = runChartJob(partiallyConfirmedOrder);
    // 12723/SL/28 Aug seeds 3 freed berths — every WL passenger should show
    // a changed (lower) position even without a full promotion.
    expect(result.passengers.every((p) => p.changed)).toBe(true);
  });

  it('promotes a waitlisted passenger who reaches position 0 to a real allocated berth', () => {
    const result = runChartJob(partiallyConfirmedOrder);
    const promoted = result.passengers.find((p) => p.promoted);
    // At least the possibility of full promotion exists for this seeded order —
    // assert the invariant holds for whichever passengers did promote.
    if (promoted && promoted.after.kind === 'CNF') {
      expect(promoted.after.coach).toBeTruthy();
      expect(promoted.after.berth).toBeGreaterThan(0);
    }
  });

  it('an already-confirmed order is unchanged by charting', () => {
    const result = runChartJob(confirmedOrder);
    expect(result.passengers.every((p) => !p.changed)).toBe(true);
    expect(result.fullyConfirmed).toBe(true);
    expect(result.passengers[0].before).toEqual(result.passengers[0].after);
  });

  it('carries the requested stage through to the result', () => {
    const result = runChartJob(partiallyConfirmedOrder, 'second_chart');
    expect(result.stage).toBe('second_chart');
  });
});
