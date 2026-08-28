/**
 * Entity extraction — PLAN.md §7.11.1. Pure and synchronous. Handles
 * the ways a real person types, not one canonical phrasing. Returns
 * partial results happily; missing entities become slots to ask for.
 */
import type { ClassCode, QuotaCode, Station } from '@/domain/types';
import { stations } from '@/data/stations';
import { DEMO_DATE } from '@/data/inventory';
import type { Entities } from './types';

// --- normalisation -----------------------------------------------------------

const CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, 'i am'],
  [/\bdon't\b/g, 'do not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bwhat's\b/g, 'what is'],
  [/\bwhere's\b/g, 'where is'],
  [/\bi'd\b/g, 'i would'],
  [/\bi've\b/g, 'i have'],
];

export function normalise(input: string): string {
  let t = ` ${input.toLowerCase()} `;
  for (const [re, rep] of CONTRACTIONS) t = t.replace(re, rep);
  // normalise arrows to " to "
  t = t.replace(/\s*(→|->|–|—)\s*/g, ' to ');
  // strip most punctuation but keep digits, hyphens (order refs), slashes (dates), ₹
  t = t.replace(/[^a-z0-9₹.\-/\s]/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

// --- Levenshtein for fuzzy alias matching (§7.11.1 "chenai", "hydrabad") -----

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 3; // early out — we only care about <=2
  const dp = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= m; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(dp[i] + 1, dp[i - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[m];
}

// --- station resolution ------------------------------------------------------

/** All the words/phrases that should resolve to a station, lowercased. */
function surfaceForms(s: Station): string[] {
  return [s.code.toLowerCase(), s.name.toLowerCase(), s.city.toLowerCase(), ...s.aliases];
}

function containsWord(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|\\s)${escaped}($|\\s)`).test(haystack);
}

/**
 * Resolve a single surface string to station candidates, applying the
 * alias-over-city priority: an exact alias/name/code match wins over a
 * shared city name. This is what makes "chennai" resolve to Chennai
 * Central (its alias) while "kollam" — a city shared by two stations
 * with no bare alias — stays ambiguous and gets asked about (§7.11.3).
 */
export function resolveStation(query: string): Station[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // 1. Unique station code.
  const byCode = stations.filter((s) => s.code.toLowerCase() === q);
  if (byCode.length) return byCode;

  // 2. Exact alias or full name.
  const byAlias = stations.filter((s) => s.aliases.includes(q) || s.name.toLowerCase() === q);
  if (byAlias.length) return byAlias;

  // 3. City name (may be shared -> ambiguous, ask).
  const byCity = stations.filter((s) => s.city.toLowerCase() === q);
  if (byCity.length) return byCity;

  // 4. Fuzzy (Levenshtein <= 2) against aliases and name tokens.
  const fuzzy = stations.filter((s) =>
    surfaceForms(s).some((form) => form.split(' ').some((tok) => tok.length >= 4 && levenshtein(tok, q) <= 2)),
  );
  return fuzzy;
}

/**
 * Find a station inside a free-text phrase (e.g. "book kollam"). Picks
 * the longest surface form present in the phrase, then resolves that.
 */
export function resolveStationInPhrase(phrase: string): Station[] {
  const p = ` ${phrase.trim().toLowerCase()} `;
  let best = '';
  for (const s of stations) {
    for (const form of surfaceForms(s)) {
      if (form.length > best.length && containsWord(p, form)) best = form;
    }
  }
  if (best) return resolveStation(best);

  // No surface form present — try a fuzzy match on each word.
  for (const word of phrase.trim().toLowerCase().split(' ')) {
    if (word.length < 4) continue;
    const hit = resolveStation(word);
    if (hit.length) return hit;
  }
  return [];
}

// --- direction ---------------------------------------------------------------

interface Direction {
  fromPhrase?: string;
  toPhrase?: string;
}

function extractDirection(text: string): Direction {
  // "from A to B"
  let m = text.match(/from\s+(.+?)\s+to\s+(.+)/);
  if (m) return { fromPhrase: m[1], toPhrase: m[2] };
  // "to B from A"
  m = text.match(/to\s+(.+?)\s+from\s+(.+)/);
  if (m) return { fromPhrase: m[2], toPhrase: m[1] };
  // "A to B" (greedy A so the last "to" is the separator)
  m = text.match(/(.+)\s+to\s+(.+)/);
  if (m) return { fromPhrase: m[1], toPhrase: m[2] };
  // "B from A"
  m = text.match(/(.+?)\s+from\s+(.+)/);
  if (m) return { fromPhrase: m[2], toPhrase: m[1] };
  return {};
}

// --- dates -------------------------------------------------------------------

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const ARP_DAYS = 60;

function demoNow(): Date {
  return new Date(`${DEMO_DATE}T00:00:00`);
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

/** Parse a date phrase relative to the demo clock. Returns ISO + optional out-of-range error. */
export function extractDate(text: string): { date?: string; error?: string } {
  const now = demoNow();
  let resolved: Date | undefined;

  if (/\bday after (tomorrow)?\b/.test(text)) resolved = addDays(now, 2);
  else if (/\btomorrow\b/.test(text)) resolved = addDays(now, 1);
  else if (/\btoday\b/.test(text)) resolved = now;
  else if (/\bnext week\b/.test(text)) resolved = addDays(now, 7);

  // "next saturday" / "this friday"
  if (!resolved) {
    const wd = text.match(/\b(next|this)\s+(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/);
    if (wd) {
      const target = WEEKDAYS.indexOf(wd[2]);
      let delta = (target - now.getDay() + 7) % 7;
      if (delta === 0) delta = 7; // "this/next <today's weekday>" -> next week
      if (wd[1] === 'next' && delta <= 0) delta += 7;
      resolved = addDays(now, delta);
    }
  }

  // "12 september" / "sept 12" / "12 sep"
  if (!resolved) {
    let d: number | undefined;
    let mon: number | undefined;
    const dm = text.match(/\b(\d{1,2})\s*(?:st|nd|rd|th)?\s+([a-z]{3,9})\b/);
    const md = text.match(/\b([a-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
    if (dm && MONTHS.some((mo) => dm[2].startsWith(mo))) {
      d = Number(dm[1]);
      mon = MONTHS.findIndex((mo) => dm[2].startsWith(mo));
    } else if (md && MONTHS.some((mo) => md[1].startsWith(mo))) {
      d = Number(md[2]);
      mon = MONTHS.findIndex((mo) => md[1].startsWith(mo));
    }
    if (d !== undefined && mon !== undefined) {
      let year = now.getFullYear();
      const candidate = new Date(year, mon, d);
      if (candidate < now) year += 1;
      resolved = new Date(year, mon, d);
    }
  }

  // numeric d/m, d-m, d-m-yyyy
  if (!resolved) {
    const num = text.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
    if (num) {
      const d = Number(num[1]);
      const mon = Number(num[2]) - 1;
      const year = num[3] ? Number(num[3].length === 2 ? `20${num[3]}` : num[3]) : now.getFullYear();
      if (mon >= 0 && mon < 12 && d >= 1 && d <= 31) resolved = new Date(year, mon, d);
    }
  }

  // bare "28th" — day of the current month (or next month if already past)
  if (!resolved) {
    const bare = text.match(/\b(\d{1,2})(?:st|nd|rd|th)\b/);
    if (bare) {
      const d = Number(bare[1]);
      let candidate = new Date(now.getFullYear(), now.getMonth(), d);
      if (candidate < now) candidate = new Date(now.getFullYear(), now.getMonth() + 1, d);
      resolved = candidate;
    }
  }

  if (!resolved) return {};

  const maxDate = addDays(now, ARP_DAYS);
  if (resolved > maxDate) {
    return { error: `That date is beyond the 60-day advance reservation window. The furthest you can book right now is ${iso(maxDate)}.` };
  }
  if (resolved < now) {
    return { error: 'That date is in the past.' };
  }
  return { date: iso(resolved) };
}

// --- class -------------------------------------------------------------------

const CLASS_PATTERNS: [RegExp, ClassCode][] = [
  [/\bac 3 economy\b|\b3e\b/, '3E'],
  [/\bac 3 tier\b|\b3a\b|\b3rd ac\b|\bthird ac\b/, '3A'],
  [/\bac 2 tier\b|\b2a\b|\b2nd ac\b|\bsecond ac\b/, '2A'],
  [/\bfirst class\b|\bfirst ac\b|\b1st ac\b|\b1a\b/, '1A'],
  [/\bexecutive chair\b|\bexec chair\b|\bec\b/, 'EC'],
  [/\bac chair car\b|\bac chair\b|\bchair car\b|\bcc\b/, 'CC'],
  [/\bsecond sitting\b|\b2s\b/, '2S'],
  [/\bsleeper\b|\bsl\b/, 'SL'],
];

export function extractClass(text: string): ClassCode | undefined {
  for (const [re, code] of CLASS_PATTERNS) if (re.test(text)) return code;
  return undefined;
}

// --- quota -------------------------------------------------------------------

const QUOTA_PATTERNS: [RegExp, QuotaCode][] = [
  [/\bpremium tatkal\b/, 'PT'],
  [/\btatkal\b/, 'TQ'],
  [/\bladies\b/, 'LD'],
  [/\bsenior citizen\b|\blower berth quota\b/, 'SS'],
  [/\bdivyangjan\b|\bdisability\b|\bhandicapped\b/, 'HP'],
  [/\bduty pass\b/, 'DP'],
];

export function extractQuota(text: string): QuotaCode | undefined {
  for (const [re, code] of QUOTA_PATTERNS) if (re.test(text)) return code;
  return undefined;
}

// --- passengers --------------------------------------------------------------

const WORD_NUMBERS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };

export function extractPassengerCount(text: string): number | undefined {
  if (/\bfamily of (four|4)\b/.test(text)) return 4;
  if (/\bme and my (wife|husband|partner)\b/.test(text)) return 2;
  const m = text.match(/\b(\d+|one|two|three|four|five|six)\s+(adults?|tickets?|passengers?|people|persons?|seats?)\b/);
  if (m) {
    const n = WORD_NUMBERS[m[1]] ?? Number(m[1]);
    if (n >= 1 && n <= 6) return n;
  }
  const forN = text.match(/\bfor\s+(\d+|two|three|four|five|six)\b/);
  if (forN) {
    const n = WORD_NUMBERS[forN[1]] ?? Number(forN[1]);
    if (n >= 1 && n <= 6) return n;
  }
  return undefined;
}

// --- berth preference --------------------------------------------------------

export function extractBerthPreference(text: string): Entities['berthPreference'] {
  if (/\bside lower\b/.test(text)) return 'side_lower';
  if (/\blower\b/.test(text)) return 'lower';
  if (/\bupper\b/.test(text)) return 'upper';
  if (/\bmiddle\b/.test(text)) return 'middle';
  if (/\bwindow\b/.test(text)) return 'window';
  return undefined;
}

// --- full extraction ---------------------------------------------------------

export function extractEntities(rawInput: string): Entities {
  const text = normalise(rawInput);

  const { date, error: dateError } = extractDate(text);
  const classCode = extractClass(text);
  const quota = extractQuota(text);
  const passengerCount = extractPassengerCount(text);
  const berthPreference = extractBerthPreference(text);

  const pnr = text.match(/\b\d{10}\b/)?.[0];
  const trainNumber = text.match(/\b\d{5}\b/)?.[0];
  const orderRef = rawInput.match(/RI-\d{4}-\d{6}/i)?.[0]?.toUpperCase();

  // Direction: strip the date phrase first so it does not leak into the
  // destination phrase ("chennai next saturday" -> "chennai").
  const dir = extractDirection(text);
  const fromCandidates = dir.fromPhrase ? resolveStationInPhrase(dir.fromPhrase) : [];
  const toCandidates = dir.toPhrase ? resolveStationInPhrase(dir.toPhrase) : [];

  const isCorrection = /\b(no|actually|change|make it|instead|rather)\b/.test(text);

  return {
    fromCandidates,
    toCandidates,
    date,
    dateError,
    classCode,
    quota,
    passengerCount,
    berthPreference,
    pnr,
    trainNumber,
    orderRef,
    isCorrection,
  };
}
