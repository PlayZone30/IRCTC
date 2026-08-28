import { describe, expect, it } from 'vitest';
import { extractEntities, resolveStation } from './extract';
import { decideIntent } from './intents';
import { plan } from './planner';
import type { PlannerContext } from './types';
import * as tools from './tools';

// Resolve the seeded station codes once for assertions.
const QLN = resolveStation('kollam junction')[0].code;
const MAS = resolveStation('chennai')[0].code;
const SC = resolveStation('secunderabad')[0].code;
const HYB = resolveStation('hyderabad')[0].code;
const NDLS = resolveStation('delhi')[0].code;

function intentOf(utterance: string): string {
  const e = extractEntities(utterance);
  return decideIntent(utterance.toLowerCase(), e).id;
}

// -----------------------------------------------------------------------------
// The 40-utterance corpus (§7.11). Each must produce the right intent.
// -----------------------------------------------------------------------------

const CORPUS: [string, string][] = [
  // exact utterances from the PLAN
  ['book kollam to chennai on 12 september', 'book_journey'],
  ['i need to get to chennai next saturday', 'book_journey'],
  ['2 tickets hyderabad to delhi tomorrow 3a', 'book_journey'],
  ['book me a tatkal for 12624', 'arm_tatkal'],
  ['where is my refund', 'check_money'],
  ['money was deducted but no ticket', 'check_money'],
  ['pnr 4728166390', 'check_pnr'],
  ['what does tqwl mean', 'explain_rule'],
  ['can i board with a waitlisted ticket', 'explain_rule'],
  ['cancel my delhi booking', 'cancel_booking'],
  ['change my boarding point to secunderabad', 'change_boarding'],
  ['show me something confirmed', 'find_alternates'],
  // greetings & help
  ['hello', 'greeting'],
  ['hi there', 'greeting'],
  ['namaste', 'greeting'],
  ['help', 'help'],
  ['what can you do', 'help'],
  // more booking phrasings
  ['reserve a train from mumbai to delhi', 'book_journey'],
  ['i want to travel from hyderabad to delhi on 28th', 'book_journey'],
  ['book hyderabad to delhi tomorrow sleeper', 'book_journey'],
  ['2 adults delhi to mumbai next week 2a', 'book_journey'],
  ['get me to chennai from kollam junction on 12 september', 'book_journey'],
  ['book 12723 hyderabad to delhi tomorrow', 'book_journey'],
  // money / pnr
  ['where is my money', 'check_money'],
  ['refund status for RI-3390-118804', 'check_money'],
  ['my money was debited but the ticket did not come', 'check_money'],
  ['pnr status 8890342156', 'check_pnr'],
  ['check pnr 2231905567', 'check_pnr'],
  // cancel
  ['cancel booking', 'cancel_booking'],
  ['cancel my ticket', 'cancel_booking'],
  // rules
  ['what is gnwl', 'explain_rule'],
  ['explain rac', 'explain_rule'],
  ['what does rlwl mean', 'explain_rule'],
  ['what happens to a waitlisted ticket', 'explain_rule'],
  // alternates
  ['find me an alternate', 'find_alternates'],
  ['is there any way to get confirmed', 'find_alternates'],
  ['anything confirmed on this route', 'find_alternates'],
  // tatkal / boarding
  ['arm tatkal for 12721', 'arm_tatkal'],
  ['set up a premium tatkal for 12624', 'arm_tatkal'],
  ['change my boarding to hyderabad', 'change_boarding'],
];

describe('intent classification across the 40-utterance corpus (§7.11)', () => {
  it('has at least 40 utterances', () => {
    expect(CORPUS.length).toBeGreaterThanOrEqual(40);
  });

  for (const [utterance, expected] of CORPUS) {
    it(`"${utterance}" -> ${expected}`, () => {
      expect(intentOf(utterance)).toBe(expected);
    });
  }
});

// -----------------------------------------------------------------------------
// Entity extraction
// -----------------------------------------------------------------------------

describe('entity extraction (§7.11.1)', () => {
  it('resolves the Kollam ambiguity to two candidates', () => {
    const e = extractEntities('book kollam to chennai on 12 september');
    expect(e.fromCandidates.length).toBe(2); // Kollam Jn + Kollam Town
    expect(e.toCandidates.map((s) => s.code)).toContain(MAS);
    expect(e.date).toBe('2026-09-12');
  });

  it('a specific "kollam junction" is unambiguous', () => {
    expect(resolveStation('kollam junction').length).toBe(1);
    expect(resolveStation('kollam junction')[0].code).toBe(QLN);
  });

  it('parses passengers, class and relative date together', () => {
    const e = extractEntities('2 tickets hyderabad to delhi tomorrow 3a');
    expect(e.passengerCount).toBe(2);
    expect(e.classCode).toBe('3A');
    expect(e.date).toBe('2026-08-28'); // demo "tomorrow"
    expect(e.fromCandidates[0].code).toBe(HYB);
    expect(e.toCandidates[0].code).toBe(NDLS);
  });

  it('fuzzy-matches misspellings within Levenshtein 2', () => {
    expect(resolveStation('chenai')[0].code).toBe(MAS);
    expect(resolveStation('hydrabad')[0].code).toBe(HYB);
  });

  it('flags corrections and extracts the corrected value', () => {
    const e1 = extractEntities('no make it 2a');
    expect(e1.isCorrection).toBe(true);
    expect(e1.classCode).toBe('2A');
    const e2 = extractEntities('actually from secunderabad');
    expect(e2.isCorrection).toBe(true);
    expect(e2.fromCandidates[0].code).toBe(SC);
  });

  it('recognises PNRs, train numbers and order refs distinctly', () => {
    expect(extractEntities('pnr 4728166390').pnr).toBe('4728166390');
    expect(extractEntities('book me a tatkal for 12624').trainNumber).toBe('12624');
    expect(extractEntities('refund for RI-3390-118804').orderRef).toBe('RI-3390-118804');
  });

  it('rejects a date beyond the 60-day advance window', () => {
    const e = extractEntities('book hyderabad to delhi on 25 december');
    expect(e.date).toBeUndefined();
    expect(e.dateError).toBeTruthy();
  });
});

// -----------------------------------------------------------------------------
// Multi-turn booking flow — the "done when" scenario (§7.11)
// -----------------------------------------------------------------------------

const baseCtx: PlannerContext = { slots: {}, awaiting: null, turnIndex: 0, accountId: 'priya' };

describe('the hero flow: Kollam ambiguity -> search -> alternate -> handoff', () => {
  it('turn 1 asks which Kollam, never guesses', () => {
    const p = plan('book kollam to chennai on 12 september', baseCtx);
    expect(p.awaiting).toBe('clarify_from');
    expect(p.ambiguousCandidates?.length).toBe(2);
    // destination + date were captured while origin is clarified
    expect(p.slots.toCode).toBe(MAS);
    expect(p.slots.date).toBe('2026-09-12');
  });

  it('turn 2 resolves the station, searches, and finds nothing confirmed -> proposes an alternate', () => {
    const ctx: PlannerContext = {
      slots: { toCode: MAS, date: '2026-09-12' },
      awaiting: 'clarify_from',
      pendingCandidates: resolveStation('kollam'),
      turnIndex: 1,
      accountId: 'priya',
    };
    const p = plan('kollam junction', ctx);
    expect(p.slots.fromCode).toBe(QLN);
    expect(p.awaiting).toBe('class');
    expect(p.trace.some((s) => s.tool === 'searchTrains')).toBe(true);
    expect(p.trace.some((s) => s.tool === 'findAlternates')).toBe(true);
    expect(p.effects.some((e) => e.type === 'search')).toBe(true);
    // the proposal names a boarding change and a fare delta
    expect(p.messages.join(' ')).toMatch(/board/i);
  });

  it('turn 3 accepts the alternate, prepares a draft, and hands off to review without paying', () => {
    const ctx: PlannerContext = {
      slots: { fromCode: QLN, toCode: MAS, date: '2026-09-12', trainNumber: '12624' },
      awaiting: 'class',
      turnIndex: 2,
      accountId: 'priya',
    };
    const p = plan('yes set that up', ctx);
    expect(p.awaiting).toBeNull();
    const prep = p.effects.find((e) => e.type === 'prepareDraft');
    expect(prep).toBeTruthy();
    if (prep && prep.type === 'prepareDraft') {
      // board-earlier: ticketed from the upstream origin, board at Kollam Jn
      expect(prep.draft.boardingStationCode).toBe(QLN);
      expect(prep.draft.fromStationCode).not.toBe(QLN);
    }
    // the handoff line makes the no-pay boundary explicit
    expect(p.messages.join(' ')).toMatch(/can'?t pay|confirm/i);
  });
});

describe('slot answers in context', () => {
  it('a bare "3a" fills the class slot when that is what is awaited', () => {
    const ctx: PlannerContext = {
      slots: { fromCode: HYB, toCode: NDLS, date: '2026-08-27', trainNumber: '12723' },
      awaiting: 'class',
      turnIndex: 1,
      accountId: 'priya',
    };
    const p = plan('3a', ctx);
    // 12723 3A is waitlisted on 27 Aug (bookable) -> prepares and hands off
    expect(p.effects.some((e) => e.type === 'prepareDraft')).toBe(true);
  });

  it('a bare station answer fills an awaited origin', () => {
    const ctx: PlannerContext = { slots: { toCode: NDLS, date: '2026-08-28' }, awaiting: 'origin', turnIndex: 1, accountId: 'priya' };
    const p = plan('hyderabad', ctx);
    expect(p.slots.fromCode).toBe(HYB);
  });
});

// -----------------------------------------------------------------------------
// The architectural guarantee: the agent cannot pay (§7.11.6)
// -----------------------------------------------------------------------------

describe('the agent cannot pay — payForBooking is absent by construction (§7.11.6)', () => {
  it('exposes no tool whose name mentions pay/charge/capture', () => {
    const names = Object.keys(tools);
    expect(names.some((n) => /pay|charge|capture|debit/i.test(n))).toBe(false);
  });

  it('no turn ever emits a navigate to /book/payment', () => {
    const utterances = CORPUS.map((c) => c[0]);
    for (const u of utterances) {
      const p = plan(u, baseCtx);
      const navs = p.effects.filter((e) => e.type === 'navigate');
      for (const n of navs) if (n.type === 'navigate') expect(n.to).not.toContain('/book/payment');
    }
  });
});

describe('check_money reads the real order state (§7.11 flow 2)', () => {
  it('reports the held-not-taken money for the failed order', () => {
    const p = plan('where is my refund', baseCtx);
    expect(p.messages.join(' ')).toMatch(/held, not taken/i);
  });
});
