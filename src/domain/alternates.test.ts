import { describe, expect, it } from 'vitest';
import { alternatesForTrain } from './alternates';
import { trainByNumber } from '@/data/trains';
import { DEMO_DATE_PLUS_1, DEMO_DATE_PLUS_2 } from '@/data/inventory';

describe('the hero case — board earlier on 12624', () => {
  const train = trainByNumber('12624')!;

  it('offers a board-earlier alternate from QLN when KYJ->MAS in SL is REGRET', () => {
    const alts = alternatesForTrain(train, 'KYJ', 'MAS', DEMO_DATE_PLUS_2, 'SL');
    const boardEarlier = alts.find((a) => a.kind === 'board_earlier');
    expect(boardEarlier).toBeDefined();
    expect(boardEarlier!.ticketedFrom).toBe('QLN');
    expect(boardEarlier!.boardAt).toBe('KYJ');
    expect(boardEarlier!.ticketedTo).toBe('MAS');
  });

  it('shows a positive (more expensive) fare delta because the ticket starts earlier', () => {
    const alts = alternatesForTrain(train, 'KYJ', 'MAS', DEMO_DATE_PLUS_2, 'SL');
    const boardEarlier = alts.find((a) => a.kind === 'board_earlier')!;
    // QLN SL = 65000, KYJ SL = 62500 -> delta +2500.
    expect(boardEarlier.fareDeltaVsDirect).toBe(2500);
    expect(boardEarlier.fareDeltaVsDirect).toBeGreaterThan(0);
  });

  it('carries the mandatory disclosure block naming the board station and the delta', () => {
    const alts = alternatesForTrain(train, 'KYJ', 'MAS', DEMO_DATE_PLUS_2, 'SL');
    const boardEarlier = alts.find((a) => a.kind === 'board_earlier')!;
    expect(boardEarlier.disclosure.length).toBeGreaterThanOrEqual(3);
    const joined = boardEarlier.disclosure.join(' ');
    expect(joined).toContain('Kollam Jn'); // where the ticket starts
    expect(joined).toContain('Kayankulam'); // where the user actually boards
    expect(joined).toContain('cannot board before'); // the constraint note
  });

  it('the alternate leg is confirmed, not another waitlist', () => {
    const alts = alternatesForTrain(train, 'KYJ', 'MAS', DEMO_DATE_PLUS_2, 'SL');
    const boardEarlier = alts.find((a) => a.kind === 'board_earlier')!;
    expect(boardEarlier.legs[0].status.kind).toBe('CNF');
  });
});

describe('the two-leg case — 12951 Mumbai Rajdhani via BPL', () => {
  const train = trainByNumber('12951')!;

  it('offers a two-leg alternate split at BPL when direct 3A is REGRET', () => {
    const alts = alternatesForTrain(train, 'BCT', 'NDLS', DEMO_DATE_PLUS_1, '3A');
    const twoLeg = alts.find((a) => a.kind === 'two_leg');
    expect(twoLeg).toBeDefined();
    expect(twoLeg!.legs).toHaveLength(2);
    expect(twoLeg!.legs[0].fromStationCode).toBe('BCT');
    expect(twoLeg!.legs[0].toStationCode).toBe('BPL');
    expect(twoLeg!.legs[1].fromStationCode).toBe('BPL');
    expect(twoLeg!.legs[1].toStationCode).toBe('NDLS');
  });

  it('both legs are confirmed', () => {
    const alts = alternatesForTrain(train, 'BCT', 'NDLS', DEMO_DATE_PLUS_1, '3A');
    const twoLeg = alts.find((a) => a.kind === 'two_leg')!;
    expect(twoLeg.legs[0].status.kind).toBe('CNF');
    expect(twoLeg.legs[1].status.kind).toBe('CNF');
  });

  it('sums the two leg fares and discloses the separate-PNR consequence', () => {
    const alts = alternatesForTrain(train, 'BCT', 'NDLS', DEMO_DATE_PLUS_1, '3A');
    const twoLeg = alts.find((a) => a.kind === 'two_leg')!;
    // BCT->BPL 138000 + BPL->NDLS 96000 = 234000.
    expect(twoLeg.fare).toBe(234000);
    expect(twoLeg.disclosure.join(' ')).toContain('two separate PNRs');
  });
});

describe('no alternate when none is warranted', () => {
  it('returns nothing for a route the train does not serve', () => {
    const train = trainByNumber('12624')!;
    expect(alternatesForTrain(train, 'MAS', 'KYJ', DEMO_DATE_PLUS_2, 'SL')).toEqual([]);
  });
});
