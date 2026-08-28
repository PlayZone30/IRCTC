/**
 * Intent scoring — PLAN.md §7.11.2. Each intent declares weighted
 * signals; score is the sum of matched weights, capped at 1. The
 * highest score wins if it clears a floor of 0.35, else we fall through
 * to help. Two intents within 0.1 of each other trigger a clarifying
 * question rather than a guess.
 *
 * Pure and deterministic — the same utterance always scores identically.
 */
import type { Entities, IntentId, IntentScore } from './types';

const STRONG = 0.5;
const WEAK = 0.15;
const SCORE_FLOOR = 0.35;
const AMBIGUITY_BAND = 0.1;

interface IntentDef {
  id: IntentId;
  strong: RegExp[];
  weak: RegExp[];
  /** Extra weight from extracted entities — the strongest disambiguator. */
  entityBoost?: (e: Entities) => number;
}

const INTENTS: IntentDef[] = [
  {
    id: 'book_journey',
    strong: [
      /\bbook\b/, /\breserve\b/, /\bneed to (get|go|travel)\b/, /\bget me\b/,
      // Hindi Romanised aliases (§7.10, §14)
      /\bticket chahiye\b/, /\bticket karna\b/, /\bsafar\b/, /\bjaana hai\b/,
      /\bwant to (travel|go|get)\b/, /\btravel(l?ing)?\b/,
    ],
    weak: [/\bticket\b/, /\btrain\b/, /\bseat\b/, /\bberth\b/, /\bto\b/, /\bgoing to\b/, /\banything for\b/],
    // Two resolved stations is the decisive signal; one station + a date is strong too.
    entityBoost: (e) => {
      const stations = (e.fromCandidates.length ? 1 : 0) + (e.toCandidates.length ? 1 : 0);
      if (stations >= 2) return 0.45;
      if (stations === 1 && e.date) return 0.3;
      if (stations === 1) return 0.15;
      return 0;
    },
  },
  {
    id: 'arm_tatkal',
    strong: [/\btatkal\b/, /\btatkal chahiye\b/],
    weak: [/\barm\b/, /\bset up\b/, /\bready\b/, /\btomorrow\b/, /\bpremium tatkal\b/],
    // A train number with "tatkal" is the seeded "book me a tatkal for 12624" case.
    entityBoost: (e) => (e.trainNumber ? 0.25 : 0),
  },
  {
    id: 'check_money',
    strong: [
      /\brefund\b/, /\bmy money\b/, /money was (deducted|debited)/, /\bdeducted\b/, /\bdebited\b/,
      // Hindi aliases
      /\bpaise\b/, /\bpaisa\b/, /\bpaise kahan\b/, /\bpaise wapas\b/,
    ],
    weak: [/\bwhere\b/, /\bstatus of my (payment|order)\b/, /\bnot? ticket\b/, /\bmy orders?\b/, /\bshow.*order\b/],
    entityBoost: (e) => (e.orderRef ? 0.3 : 0),
  },
  {
    id: 'check_pnr',
    strong: [/\bpnr\b/, /\bpnr status\b/],
    weak: [/\bstatus\b/, /\bconfirmed\b/, /\bwaitlist\b/],
    entityBoost: (e) => (e.pnr ? 0.45 : 0),
  },
  {
    id: 'cancel_booking',
    strong: [/\bcancel\b/, /\bcancel karna\b/, /\bcancel karo\b/],
    weak: [/\bbooking\b/, /\bticket\b/, /\brefund\b/],
  },
  {
    id: 'explain_rule',
    strong: [
      /\bwhat does\b/, /\bwhat is\b/, /\bexplain\b/, /\bmean(s|ing)?\b/, /\bcan i board\b/, /\bhow does\b/, /\bwhat happens\b/,
      // Hindi aliases
      /\bmatlub\b/, /\bkya matlab\b/, /\bkya hota\b/, /\bbatao\b/, /\bsamjhao\b/,
    ],
    weak: [/\bwaitlist\b/, /\btqwl\b/, /\bgnwl\b/, /\brac\b/, /\bquota\b/, /\btatkal\b/, /\brule\b/, /\bcharge\b/, /\btdr\b/, /\bclerkage\b/, /\bkya hai\b/],
  },
  {
    id: 'find_alternates',
    strong: [/\balternat/, /\bsomething confirmed\b/, /\bany way\b/, /\banything confirmed\b/, /\bshow me something\b/],
    weak: [/\bconfirmed\b/, /\bfull\b/, /\bshow me\b/, /\boptions\b/, /\bany other\b/],
  },
  {
    id: 'change_boarding',
    strong: [/\bchange my boarding\b/, /\bboarding point\b/, /\bboard (from|at)\b/, /\bboarding change\b/],
    weak: [/\bboarding\b/, /\bpickup\b/, /\bchange.*board\b/],
  },
  {
    id: 'greeting',
    strong: [/^\s*(hi|hello|hey|namaste|namaskar|jai hind)\b/],
    weak: [],
  },
  {
    id: 'help',
    strong: [/\bhelp\b/, /\bwhat can you do\b/, /\bwhat do you do\b/, /\bhelp karo\b/, /\bkya kar sakte\b/],
    weak: [/\bhow\b/],
  },
];


function scoreOne(def: IntentDef, text: string, entities: Entities): number {
  let raw = 0;
  for (const re of def.strong) if (re.test(text)) raw += STRONG;
  for (const re of def.weak) if (re.test(text)) raw += WEAK;
  if (def.entityBoost) raw += def.entityBoost(entities);
  return Math.min(1, raw);
}

/** Ranked intent scores, highest first. */
export function scoreIntents(text: string, entities: Entities): IntentScore[] {
  return INTENTS.map((def) => ({ id: def.id, score: scoreOne(def, text, entities) })).sort((a, b) => b.score - a.score);
}

export interface IntentDecision {
  /** The chosen intent, or 'unknown' when nothing clears the floor. */
  id: IntentId;
  /** True when the top two are within the ambiguity band and should be clarified rather than guessed. */
  ambiguous: boolean;
  runnerUp?: IntentId;
  scores: IntentScore[];
}

export function decideIntent(text: string, entities: Entities): IntentDecision {
  const scores = scoreIntents(text, entities);
  const [top, second] = scores;

  if (!top || top.score < SCORE_FLOOR) {
    return { id: 'unknown', ambiguous: false, scores };
  }
  if (second && top.score - second.score < AMBIGUITY_BAND && second.score >= SCORE_FLOOR) {
    return { id: top.id, ambiguous: true, runnerUp: second.id, scores };
  }
  return { id: top.id, ambiguous: false, scores };
}
