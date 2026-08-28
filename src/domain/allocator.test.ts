import { describe, expect, it } from 'vitest';
import { allocate, berthTypeFor, isAutoLowerBerthEligible, type AllocationInput } from './allocator';
import type { BookingStatus, Passenger } from './types';

function pax(overrides: Partial<Passenger> = {}): Passenger {
  return { id: overrides.id ?? 'p1', name: 'Test', age: 30, gender: 'M', country: 'India', ...overrides };
}

const cnf: BookingStatus = { kind: 'CNF', coach: 'S3', berth: 19, berthType: 'LB' };

function baseInput(overrides: Partial<AllocationInput> = {}): AllocationInput {
  return {
    trainNumber: '12723',
    date: '2026-08-27',
    classCode: 'SL',
    boardingStationCode: 'HYB',
    classStatus: cnf,
    passengers: [pax()],
    reservationChoice: 'book_even_if_waitlisted',
    ...overrides,
  };
}

describe('berth geometry §9.4', () => {
  it('SL/3A follow the mod-8 cycle LB MB UB LB MB UB SL SU', () => {
    expect(berthTypeFor('SL', 1)).toBe('LB');
    expect(berthTypeFor('SL', 2)).toBe('MB');
    expect(berthTypeFor('SL', 3)).toBe('UB');
    expect(berthTypeFor('SL', 7)).toBe('SL');
    expect(berthTypeFor('SL', 8)).toBe('SU');
    expect(berthTypeFor('SL', 9)).toBe('LB'); // cycle repeats
    expect(berthTypeFor('3A', 8)).toBe('SU');
  });

  it('1A has no berth model — never returns a berth type', () => {
    expect(berthTypeFor('1A', 1)).toBeUndefined();
  });
});

describe('auto lower-berth eligibility §9.3', () => {
  it('is true for a man 60+ and a woman 45+', () => {
    expect(isAutoLowerBerthEligible(pax({ age: 63, gender: 'M' }))).toBe(true);
    expect(isAutoLowerBerthEligible(pax({ age: 45, gender: 'F' }))).toBe(true);
  });

  it('is false for a 34-year-old woman and a 59-year-old man', () => {
    expect(isAutoLowerBerthEligible(pax({ age: 34, gender: 'F' }))).toBe(false);
    expect(isAutoLowerBerthEligible(pax({ age: 59, gender: 'M' }))).toBe(false);
  });
});

describe('auto lower-berth allotment fires without a stated preference', () => {
  it('gives 63-year-old Ramesh a lower berth and records AUTO_LB_APPLIED', () => {
    const result = allocate(baseInput({ passengers: [pax({ id: 'ramesh', age: 63, gender: 'M' })] }));
    expect(result.rolledBack).toBe(false);
    const alloc = result.allocations[0];
    expect(alloc.status.kind).toBe('CNF');
    if (alloc.status.kind === 'CNF') {
      expect(alloc.status.berthType).toBe('LB');
    }
    expect(alloc.trace.some((t) => t.code === 'AUTO_LB_APPLIED')).toBe(true);
  });
});

describe('1A defers the berth to charting §9.2', () => {
  it('returns CNF_NO_BERTH with a DEFERRED_1A reason and never a berth number', () => {
    const result = allocate(baseInput({ classCode: '1A', classStatus: { kind: 'CNF_NO_BERTH' } }));
    const alloc = result.allocations[0];
    expect(alloc.status.kind).toBe('CNF_NO_BERTH');
    expect(alloc.trace.some((t) => t.code === 'DEFERRED_1A')).toBe(true);
  });
});

describe('reservation-choice hard constraint §9.5 step 4', () => {
  it('rolls back the whole booking when confirmed_only cannot be satisfied', () => {
    const result = allocate(
      baseInput({
        classStatus: { kind: 'WL', type: 'GNWL', number: 34 },
        reservationChoice: 'confirmed_only',
      }),
    );
    expect(result.rolledBack).toBe(true);
    expect(result.rollbackReason).toContain('not made');
  });

  it('does not roll back a confirmed booking under confirmed_only', () => {
    const result = allocate(baseInput({ reservationChoice: 'confirmed_only' }));
    expect(result.rolledBack).toBe(false);
  });

  it('rolls back two_lower when two lowers are not available', () => {
    // A single non-eligible passenger cannot get two lowers.
    const result = allocate(baseInput({ passengers: [pax({ age: 34, gender: 'F' })], reservationChoice: 'two_lower' }));
    // Either they got a lower (unlikely for one general passenger) or rolled back.
    if (!result.rolledBack) {
      const lowers = result.allocations.filter((a) => a.status.kind === 'CNF' && a.status.berthType === 'LB').length;
      expect(lowers).toBeGreaterThanOrEqual(2);
    } else {
      expect(result.rollbackReason).toContain('two lower');
    }
  });
});

describe('party compaction §9.2', () => {
  it('keeps a multi-passenger party in one coach and records COMPACTED', () => {
    const result = allocate(
      baseInput({
        passengers: [pax({ id: 'a', age: 30 }), pax({ id: 'b', age: 32 }), pax({ id: 'c', age: 28 })],
      }),
    );
    const coaches = new Set(result.allocations.map((a) => (a.status.kind === 'CNF' ? a.status.coach : 'x')));
    expect(coaches.size).toBe(1);
    expect(result.allocations.every((a) => a.trace.some((t) => t.code === 'COMPACTED'))).toBe(true);
  });
});

describe('RAC/WL get no berth at booking §9.5 steps 5-6', () => {
  it('mirrors an RAC class status onto passengers without assigning a berth', () => {
    const result = allocate(baseInput({ classStatus: { kind: 'RAC', number: 8 } }));
    expect(result.allocations[0].status.kind).toBe('RAC');
    expect(result.allocations[0].trace.some((t) => t.code === 'DEFERRED_CHART')).toBe(true);
  });

  it('increments waitlist numbers across a party so they read as consecutive', () => {
    const result = allocate(
      baseInput({
        classStatus: { kind: 'WL', type: 'GNWL', number: 20 },
        passengers: [pax({ id: 'a' }), pax({ id: 'b' })],
      }),
    );
    const a = result.allocations[0].status;
    const b = result.allocations[1].status;
    expect(a.kind).toBe('WL');
    expect(b.kind).toBe('WL');
    if (a.kind === 'WL' && b.kind === 'WL') {
      expect(a.number).toBe(20);
      expect(b.number).toBe(21);
    }
  });
});

describe('determinism', () => {
  it('produces the identical allocation for the identical input', () => {
    const a = allocate(baseInput({ passengers: [pax({ id: 'x', age: 40, gender: 'F' })] }));
    const b = allocate(baseInput({ passengers: [pax({ id: 'x', age: 40, gender: 'F' })] }));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
