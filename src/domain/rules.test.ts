import { describe, expect, it } from 'vitest';
import { cancellationBandFor, firstChartTime, maxPassengersFor, QUOTA_LABELS, tatkalCharge } from './rules';

/**
 * Acceptance tests for the rulebook — PLAN.md §15 "Correctness":
 * - firstChartTime() returns the right band for a 06:00, a 15:00 and
 *   a 02:00 departure.
 * - Tatkal blocks 1A (see TATKAL_EXCLUDED_CLASSES, checked in the
 *   allocator/booking-flow tests once those exist; here we pin the
 *   charge-band absence which is the pricing half of that rule).
 * - HP is Divyangjan; PH is not used.
 */
describe('firstChartTime — Railway Board circular, 12 Dec 2025', () => {
  it('05:01–14:00 departure: chart is prepared at 20:00 the previous day', () => {
    const departure = new Date('2026-08-28T06:00:00');
    const chart = firstChartTime(departure);
    expect(chart.toISOString().slice(0, 10)).toBe('2026-08-27');
    expect(chart.getHours()).toBe(20);
    expect(chart.getMinutes()).toBe(0);
  });

  it('14:01–23:59 departure: chart is at least 10 hours before departure', () => {
    const departure = new Date('2026-08-28T15:00:00');
    const chart = firstChartTime(departure);
    const hoursBefore = (departure.getTime() - chart.getTime()) / (60 * 60 * 1000);
    expect(hoursBefore).toBe(10);
  });

  it('00:00–05:00 departure: chart is at least 10 hours before departure', () => {
    const departure = new Date('2026-08-28T02:00:00');
    const chart = firstChartTime(departure);
    const hoursBefore = (departure.getTime() - chart.getTime()) / (60 * 60 * 1000);
    expect(hoursBefore).toBe(10);
  });
});

describe('tatkalCharge', () => {
  it('is absent (0) for 1A — Tatkal is not offered in AC First Class', () => {
    expect(tatkalCharge('1A', 457500)).toBe(0);
  });

  it('clamps to the published band for Sleeper', () => {
    // 30% of a very small base fare should clamp to the ₹100 minimum.
    expect(tatkalCharge('SL', 10000)).toBe(10000);
    // 30% of a very large base fare should clamp to the ₹200 maximum.
    expect(tatkalCharge('SL', 10000000)).toBe(20000);
  });

  it('uses the 10% rate for Second Sitting, 30% for other classes', () => {
    expect(tatkalCharge('2S', 100000)).toBe(1500); // 10% of 100000 = 10000, but clamped to max 1500
    expect(tatkalCharge('3A', 100000)).toBe(30000); // 30% of 100000 = 30000, within band
  });
});

describe('cancellationBandFor', () => {
  it('applies the flat-charge-only band beyond 72 hours', () => {
    expect(cancellationBandFor(96).deductionRate).toBe(0);
  });

  it('applies 25% deduction between 24 and 72 hours', () => {
    expect(cancellationBandFor(48).deductionRate).toBe(0.25);
  });

  it('applies 50% deduction between 8 and 24 hours', () => {
    expect(cancellationBandFor(12).deductionRate).toBe(0.5);
  });

  it('applies no refund inside 8 hours', () => {
    expect(cancellationBandFor(2).deductionRate).toBe(1);
  });
});

describe('quota codes — the HP/PH trap', () => {
  it('HP is Physically Handicapped / Divyangjan, never Parliament House', () => {
    expect(QUOTA_LABELS.HP).toBe('Person With Disability');
    expect('PH' in QUOTA_LABELS).toBe(false);
  });
});

describe('maxPassengersFor', () => {
  it('caps Tatkal and Premium Tatkal at 4 passengers', () => {
    expect(maxPassengersFor('TQ')).toBe(4);
    expect(maxPassengersFor('PT')).toBe(4);
  });

  it('defaults to 6 passengers for other quotas', () => {
    expect(maxPassengersFor('GN')).toBe(6);
  });
});
