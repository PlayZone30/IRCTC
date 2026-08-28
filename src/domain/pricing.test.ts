import { describe, expect, it } from 'vitest';
import { computeFare } from './pricing';
import { formatRupees } from '@/lib/money';

/**
 * Acceptance test — PLAN.md §15 "Correctness":
 * "₹4,575.00 + ₹23.60 = ₹4,598.60 reproduces exactly."
 */
describe('computeFare — reference figure', () => {
  it('reproduces ₹4,598.60 for a ₹4,575.00 AC-class fare paid via UPI/AutoPay', () => {
    const breakdown = computeFare(457500, '1A', 'upi');
    expect(breakdown.baseFarePaise).toBe(457500);
    expect(breakdown.convenienceFeeBasePaise).toBe(2000);
    expect(breakdown.convenienceFeeGstPaise).toBe(360);
    expect(breakdown.gatewayChargePaise).toBe(0);
    expect(breakdown.totalPaise).toBe(459860);
    expect(formatRupees(breakdown.totalPaise)).toBe('\u20B94,598.60');
  });

  it('uses the ₹30 + GST tier for AC classes paid by card', () => {
    const breakdown = computeFare(457500, '3A', 'credit_card');
    expect(breakdown.convenienceFeeBasePaise).toBe(3000);
    expect(breakdown.convenienceFeeGstPaise).toBe(540);
  });

  it('uses the non-AC tier for Sleeper class', () => {
    const breakdown = computeFare(75500, 'SL', 'upi');
    expect(breakdown.convenienceFeeBasePaise).toBe(1000);
  });

  it('never produces a non-integer paise value', () => {
    const breakdown = computeFare(123456, '2A', 'other_debit');
    for (const value of Object.values(breakdown)) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});
