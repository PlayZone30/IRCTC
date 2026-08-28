/**
 * Planner — PLAN.md §7.11. The deterministic brain: given an utterance
 * and the conversation state, it extracts entities, scores intent,
 * fills slots one at a time, runs the read-only tools, and returns a
 * TurnPlan describing what to say, what to trace, and how to drive the
 * real app. Pure and synchronous — no timers, no side effects, no
 * network. All timing/effects happen in the session store + drawer.
 */
import type { BookingDraft, ClassCode, ClassInventory, Passenger, Station } from '@/domain/types';
import type { AgentEffect, AgentSlots, PlannerContext, StepTraceEntry, SuggestionChip, TurnPlan } from './types';
import { extractEntities, resolveStationInPhrase } from './extract';
import { decideIntent } from './intents';
import { pick } from './compose';
import {
  allocateBerthsTool,
  baseFareFor,
  CLASS_LABELS,
  checkEligibilityTool,
  findAlternatesTool,
  formatRupees,
  getAvailabilityTool,
  getOrderByPnrTool,
  getOrderStateTool,
  listSavedPassengersTool,
  priceBookingTool,
  searchTrainsTool,
  shortStatus,
  stationName,
} from './tools';
import { trainByNumber } from '@/data/trains';
import { useOrdersStore } from '@/store/orders';
import { outcomeSummary } from '@/domain/payment';
import { CANCELLATION_BANDS, FLAT_CANCELLATION_CHARGE_PAISE } from '@/domain/rules';
import { translate } from '@/i18n';

// --- default suggestion chips ------------------------------------------------

function openingChips(): SuggestionChip[] {
  return [
    { label: 'Book a ticket', value: 'Book Kollam to Chennai on 12 September' },
    { label: 'Where is my refund', value: 'where is my refund' },
    { label: 'Check PNR', value: 'pnr 4728166390' },
    { label: 'Explain waitlist', value: 'what does tqwl mean' },
  ];
}

function helpTurn(ctx: PlannerContext): TurnPlan {
  return {
    messages: [translate('agent.unknown')],
    trace: [],
    chips: openingChips(),
    slots: ctx.slots,
    effects: [],
    awaiting: null,
  };
}

// --- passengers / draft ------------------------------------------------------

function passengersForBooking(accountId: string | null, count: number): Passenger[] {
  const saved = listSavedPassengersTool(accountId);
  const out: Passenger[] = [];
  for (let i = 0; i < count; i++) {
    out.push(
      saved[i] ?? {
        id: `agent-pax-${i + 1}`,
        name: `Passenger ${i + 1}`,
        age: 30,
        gender: 'M',
        country: 'India',
      },
    );
  }
  return out;
}

function draftFromSlots(slots: AgentSlots, accountId: string | null): BookingDraft {
  const passengers = passengersForBooking(accountId, slots.passengerCount ?? 1);
  return {
    trainNumber: slots.trainNumber!,
    date: slots.date!,
    classCode: slots.classCode!,
    quota: slots.quota ?? 'GN',
    fromStationCode: slots.ticketedFromCode ?? slots.fromCode!,
    toStationCode: slots.toCode!,
    boardingStationCode: slots.fromCode!,
    passengers,
    reservationChoice: 'book_even_if_waitlisted',
    considerAutoUpgradation: false,
  };
}

// --- availability helpers ----------------------------------------------------

function classStatusFor(inv: ClassInventory[], classCode: ClassCode): ClassInventory | undefined {
  return inv.find((c) => c.classCode === classCode);
}

function isBookable(c: ClassInventory): boolean {
  return c.status.kind !== 'NOT_AVAILABLE' && c.status.kind !== 'REGRET';
}

function isConfirmedish(c: ClassInventory): boolean {
  return c.status.kind === 'CNF' || c.status.kind === 'CNF_NO_BERTH' || c.status.kind === 'RAC';
}

/** Compact all-class line, e.g. "AC 2 Tier — Waitlist 38 · Sleeper — No booking". */
function classSummaryLine(inv: ClassInventory[]): string {
  return inv
    .filter((c) => c.status.kind !== 'NOT_AVAILABLE')
    .map((c) => `${CLASS_LABELS[c.classCode]} — ${shortStatus(c.status)}`)
    .join(' · ');
}

// --- berth explanation from the allocator trace -----------------------------

function explainAllotment(draft: BookingDraft, status: ClassInventory['status']): string {
  const result = allocateBerthsTool(draft, status);
  const first = result.allocations[0];
  if (!first) return '';
  const berthText = first.status.kind === 'CNF' ? `${first.status.coach}/${first.status.berth} ${first.status.berthType}` : shortStatus(first.status);
  const primary = first.trace[0];
  const reason = primary ? translate(`berthReason.${primary.code}`, primary.params as Record<string, string | number>) : '';
  return `${berthText}. ${reason}`.trim();
}

// =============================================================================
// Booking progression — fills origin -> destination -> date -> search -> class
// =============================================================================

function progressBooking(slots: AgentSlots, ctx: PlannerContext, trace: StepTraceEntry[], leadMessages: string[]): TurnPlan {
  // 1. Ambiguity is asked, never guessed (handled by caller before this).
  // 2. Missing origin.
  if (!slots.fromCode) {
    return turn([...leadMessages, pick('askOrigin', ctx.turnIndex)], trace, slots, [], 'origin');
  }
  // 3. Missing destination.
  if (!slots.toCode) {
    return turn([...leadMessages, pick('askDestination', ctx.turnIndex)], trace, slots, [], 'destination');
  }
  // 4. Missing date.
  if (!slots.date) {
    return turn([...leadMessages, pick('askDate', ctx.turnIndex)], trace, slots, [], 'date');
  }

  const route = `${stationName(slots.fromCode)} \u2192 ${stationName(slots.toCode)}`;

  // 5. Run the search — the results page behind the drawer populates.
  const results = searchTrainsTool(slots.fromCode, slots.toCode, slots.date, undefined, slots.quota);
  trace.push({ tool: 'searchTrains', result: `${results.length} trains` });
  const searchEffect: AgentEffect = { type: 'search', fromCode: slots.fromCode, toCode: slots.toCode, date: slots.date, quota: slots.quota };

  if (results.length === 0) {
    return turn(
      [...leadMessages, `I could not find a train from ${stationName(slots.fromCode)} to ${stationName(slots.toCode)} on ${slots.date}. Would you like to try another date?`],
      trace,
      slots,
      [searchEffect],
      'date',
    );
  }

  // Pick the train: the one the user named, else the first result.
  const chosen = (slots.trainNumber && results.find((r) => r.train.number === slots.trainNumber)) || results[0];
  const nextSlots: AgentSlots = { ...slots, trainNumber: chosen.train.number };
  const inv = getAvailabilityTool(chosen.train.number, slots.date, slots.fromCode);
  trace.push({ tool: 'getAvailability', result: `${chosen.train.number}: ${inv.filter((c) => c.status.kind !== 'NOT_AVAILABLE').length} classes` });

  const bookable = inv.filter(isBookable);
  const anyConfirmed = inv.some(isConfirmedish);

  // 6. Nothing confirmed anywhere -> do not stop; propose an alternate.
  if (!anyConfirmed) {
    const alternates = findAlternatesTool(chosen.train.number, slots.fromCode, slots.toCode, slots.date);
    trace.push({ tool: 'findAlternates', result: `${alternates.length} options` });
    if (alternates.length > 0) {
      const best = alternates[0];
      const legStatus = best.legs[best.legs.length - 1].status;
      const boardHalt = chosen.train.halts.find((h) => h.stationCode === best.boardAt);
      const boardTime = boardHalt?.departure ?? boardHalt?.arrival ?? '';
      const msg = translate('agent.nothingConfirmed', {
        train: `${chosen.train.name} (${chosen.train.number})`,
        station: stationName(best.ticketedFrom),
        status: shortStatus(legStatus),
        class: CLASS_LABELS[best.legs[0].classCode],
        delta: signed(best.fareDeltaVsDirect),
        time: boardTime ? `at ${boardTime} from ${stationName(best.boardAt)}` : `at ${stationName(best.boardAt)}`,
      });
      const chips: SuggestionChip[] = [
        { label: `Yes, set that up`, value: 'yes set that up' },
        ...bookable.map((c) => ({ label: CLASS_LABELS[c.classCode], value: CLASS_LABELS[c.classCode] })),
      ];
      return {
        messages: [...leadMessages, pick('searchFound', ctx.turnIndex, { count: results.length, route }), msg],
        trace,
        chips,
        slots: nextSlots,
        effects: [searchEffect],
        awaiting: 'class',
      };
    }
    // No alternate — honest, no dead end.
    return turn(
      [...leadMessages, `Nothing is confirmed on ${chosen.train.name} and I could not find a confirmed way through on ${slots.date}. Another date often helps — want me to check one?`],
      trace,
      nextSlots,
      [searchEffect],
      'date',
    );
  }

  // 7. Present all classes, ask which.
  const chips: SuggestionChip[] = bookable.map((c) => ({ label: `${CLASS_LABELS[c.classCode]} · ${shortStatus(c.status)}`, value: CLASS_LABELS[c.classCode] }));
  return {
    messages: [...leadMessages, pick('searchFound', ctx.turnIndex, { count: results.length, route }), pick('classSummary', ctx.turnIndex, { train: chosen.train.name, classes: classSummaryLine(inv) })],
    trace,
    chips,
    slots: nextSlots,
    effects: [searchEffect],
    awaiting: 'class',
  };
}

function signed(paise: number): string {
  return `${paise >= 0 ? '+' : '-'}${formatRupees(Math.abs(paise))}`;
}

/** The user picked / accepted a class. Prepare the draft, allocate, explain, hand off. */
function prepareAndHandoff(slots: AgentSlots, ctx: PlannerContext, trace: StepTraceEntry[]): TurnPlan {
  const train = trainByNumber(slots.trainNumber!);
  const draft = draftFromSlots(slots, ctx.accountId);
  const inv = getAvailabilityTool(slots.trainNumber!, slots.date!, slots.fromCode!);

  // Determine the status this booking is confirmed against: if the user is
  // ticketing from an upstream station (accepted a board-earlier alternate),
  // use that station's inventory; else their own boarding station's.
  const statusSource = slots.ticketedFromCode ? getAvailabilityTool(slots.trainNumber!, slots.date!, slots.ticketedFromCode) : inv;
  const classInv = classStatusFor(statusSource, slots.classCode!);
  const status = classInv?.status ?? ({ kind: 'CNF_NO_BERTH' } as const);

  // Eligibility (§8.4) — state any rule that binds.
  const violations = checkEligibilityTool(draft.quota, draft.classCode, draft.passengers);
  trace.push({ tool: 'checkEligibility', result: violations.length ? violations[0].rule : 'no issues' });

  // Price + allocate.
  const baseFare = baseFareFor(draft.trainNumber, draft.date, draft.classCode, draft.fromStationCode);
  const fare = priceBookingTool(baseFare, draft.classCode, draft.passengers.length);
  trace.push({ tool: 'priceBooking', result: formatRupees(fare.totalPaise) });
  const allotment = explainAllotment(draft, status);
  trace.push({ tool: 'allocateBerths', result: allotment.split('.')[0] });

  const messages: string[] = [];
  const boardLine = slots.ticketedFromCode && slots.ticketedFromCode !== slots.fromCode
    ? `Prepared: ${train?.name} in ${CLASS_LABELS[draft.classCode]}, ticketed from ${stationName(draft.fromStationCode)}, you board at ${stationName(draft.boardingStationCode)}. `
    : `Prepared: ${train?.name} in ${CLASS_LABELS[draft.classCode]} for ${draft.passengers.length} — ${formatRupees(fare.totalPaise)}. `;
  messages.push(boardLine + pick('allocated', ctx.turnIndex, { berths: allotment.split('.')[0], reason: allotment.split('. ').slice(1).join('. ') }));
  if (violations.length) messages.push(violations[0].reason);
  messages.push(pick('handoff', ctx.turnIndex));

  return {
    messages,
    trace,
    chips: [],
    slots,
    effects: [{ type: 'prepareDraft', draft }],
    awaiting: null,
  };
}

// --- non-booking intents -----------------------------------------------------

function checkMoneyTurn(orderRef: string | undefined, ctx: PlannerContext): TurnPlan {
  const orders = useOrdersStore.getState().orders;
  const order = (orderRef && getOrderStateTool(orderRef)) || orders.find((o) => o.outcome === 'debit_failed') || orders[0];
  const trace: StepTraceEntry[] = [{ tool: 'getOrderState', result: order ? order.id : 'none' }];
  if (!order) {
    return turn(["I can't see any orders on this account yet. Once you book, I can tell you exactly where your money is."], trace, ctx.slots, [], null);
  }
  const summary = outcomeSummary(order.outcome);
  let msg: string;
  if (order.outcome === 'debit_failed') {
    msg = translate('money.issuanceFailed', {
      amount: formatRupees(order.amountPaise),
      date: 'the next working day',
      utr: order.utr ?? '',
    });
  } else if (order.outcome === 'cancelled_refund') {
    msg = translate('money.refundInProgress', {
      amount: formatRupees(order.amountPaise),
      instrument: 'your original payment method',
      date: 'a few working days',
      utr: order.utr ?? '',
    });
  } else {
    msg = `Order ${order.id} is "${summary.label}". ${formatRupees(order.amountPaise)} was charged and your ticket is issued${order.pnr ? ` (PNR ${order.pnr})` : ''}.`;
  }
  return {
    messages: [msg],
    trace,
    chips: [{ label: 'Open the order', value: `open ${order.id}` }],
    slots: ctx.slots,
    effects: [],
    awaiting: null,
  };
}

function checkPnrTurn(pnr: string, ctx: PlannerContext): TurnPlan {
  const order = getOrderByPnrTool(pnr);
  const trace: StepTraceEntry[] = [{ tool: 'lookupPnr', result: order ? order.id : 'not found' }];
  if (!order) {
    return turn([`I could not find PNR ${pnr} on this account. Check the number, or open My bookings to see your PNRs.`], trace, ctx.slots, [], null);
  }
  const summary = outcomeSummary(order.outcome);
  const msg = `PNR ${pnr}: ${summary.label}. ${order.draft.passengers.length} passenger(s), ${CLASS_LABELS[order.draft.classCode]}, ${stationName(order.draft.fromStationCode)} to ${stationName(order.draft.toStationCode)} on ${order.draft.date}.`;
  return {
    messages: [msg],
    trace,
    chips: [{ label: 'Open the order', value: `open ${order.id}` }],
    slots: ctx.slots,
    effects: [],
    awaiting: null,
  };
}

function cancelTurn(ctx: PlannerContext, pnr?: string, orderRef?: string): TurnPlan {
  const orders = useOrdersStore.getState().orders;
  const order =
    (orderRef && getOrderStateTool(orderRef)) ||
    (pnr && getOrderByPnrTool(pnr)) ||
    orders.find((o) => o.outcome === 'issued' || o.outcome === 'partially_confirmed');
  const trace: StepTraceEntry[] = [{ tool: 'getOrderState', result: order ? order.id : 'none' }];
  if (!order) {
    return turn(['I could not find a booking to cancel. Open My bookings and I can walk you through it.'], trace, ctx.slots, [], null);
  }
  const flat = FLAT_CANCELLATION_CHARGE_PAISE[order.draft.classCode] ?? 0;
  const refund = Math.max(0, order.amountPaise - flat);
  const band = CANCELLATION_BANDS[0];
  void band;
  return {
    messages: [
      `Cancelling ${order.id} now (more than 72 hours before departure) deducts a ${formatRupees(flat)} flat charge, so you would get about ${formatRupees(refund)} back. I can't cancel for you — open the order and confirm it on the cancel screen.`,
    ],
    trace,
    chips: [{ label: 'Open the order', value: `open ${order.id}` }],
    slots: ctx.slots,
    effects: [],
    awaiting: null,
  };
}

// A small rule knowledge base — answered from §8/§13, never improvised.
function explainRuleTurn(text: string, ctx: PlannerContext): TurnPlan {
  const codes: [RegExp, string][] = [
    [/tqwl/, translate('status.TQWL.label') + '. ' + translate('status.TQWL.consequence')],
    [/gnwl/, translate('status.GNWL.label') + '. ' + translate('status.GNWL.consequence')],
    [/rlwl/, translate('status.RLWL.label') + '. ' + translate('status.RLWL.consequence')],
    [/pqwl/, translate('status.PQWL.label') + '. ' + translate('status.PQWL.consequence')],
    [/\brac\b/, translate('status.RAC.label') + '. ' + translate('status.RAC.consequence')],
    [/board.*(waitlist|wl)|waitlist.*board/, translate('status.waitlistWarning')],
    [/waitlist|wl/, translate('status.GNWL.consequence') + ' ' + translate('status.waitlistWarning')],
  ];
  for (const [re, answer] of codes) {
    if (re.test(text)) {
      return { messages: [answer], trace: [{ tool: 'explainRule', result: 'matched' }], chips: [], slots: ctx.slots, effects: [], awaiting: null };
    }
  }
  return helpTurn(ctx);
}

function armTatkalTurn(entities: ReturnType<typeof extractEntities>, ctx: PlannerContext): TurnPlan {
  const trainNumber = entities.trainNumber ?? ctx.slots.trainNumber;
  const trace: StepTraceEntry[] = [];
  if (!trainNumber || !trainByNumber(trainNumber)) {
    return turn(
      ['Which train should I arm for Tatkal? Tell me the train number, or the route and date, and I will set it up on your Ready-to-book list.'],
      trace,
      { ...ctx.slots, quota: 'TQ' },
      [],
      null,
    );
  }
  const train = trainByNumber(trainNumber)!;
  const aadhaar = listSavedPassengersTool(ctx.accountId).some((p) => p.isAadhaarLinked);
  trace.push({ tool: 'armForWindow', result: `${trainNumber} armed` });
  const draft: BookingDraft = {
    trainNumber,
    date: ctx.slots.date ?? '',
    classCode: ctx.slots.classCode ?? '3A',
    quota: 'TQ',
    fromStationCode: ctx.slots.fromCode ?? train.halts[0].stationCode,
    toStationCode: ctx.slots.toCode ?? train.halts[train.halts.length - 1].stationCode,
    boardingStationCode: ctx.slots.fromCode ?? train.halts[0].stationCode,
    passengers: passengersForBooking(ctx.accountId, ctx.slots.passengerCount ?? 1),
    reservationChoice: 'book_even_if_waitlisted',
    considerAutoUpgradation: false,
  };
  return {
    messages: [
      `Armed ${train.name} (${trainNumber}) for Tatkal on your Ready-to-book list. ${aadhaar ? 'Your Aadhaar is verified, so you are ready the moment the window opens.' : 'You will need to complete Aadhaar OTP before the window opens.'} I have opened the Ready console — I still can't pay, you confirm when the window opens.`,
    ],
    trace,
    chips: [],
    slots: { ...ctx.slots, quota: 'TQ' },
    effects: [{ type: 'armForWindow', draft }],
    awaiting: null,
  };
}

// --- small builder -----------------------------------------------------------

function turn(messages: string[], trace: StepTraceEntry[], slots: AgentSlots, effects: AgentEffect[], awaiting: TurnPlan['awaiting'], chips: SuggestionChip[] = []): TurnPlan {
  return { messages, trace, chips, slots, effects, awaiting };
}

// --- merge extracted entities into slots ------------------------------------

function mergeEntities(slots: AgentSlots, e: ReturnType<typeof extractEntities>): { slots: AgentSlots; ambiguous?: { field: 'from' | 'to'; candidates: Station[] } } {
  const next: AgentSlots = { ...slots };
  let ambiguous: { field: 'from' | 'to'; candidates: Station[] } | undefined;

  if (e.fromCandidates.length === 1) next.fromCode = e.fromCandidates[0].code;
  else if (e.fromCandidates.length > 1) ambiguous = { field: 'from', candidates: e.fromCandidates };

  if (e.toCandidates.length === 1) next.toCode = e.toCandidates[0].code;
  else if (e.toCandidates.length > 1 && !ambiguous) ambiguous = { field: 'to', candidates: e.toCandidates };

  if (e.date) next.date = e.date;
  if (e.classCode) next.classCode = e.classCode;
  if (e.quota) next.quota = e.quota;
  if (e.passengerCount) next.passengerCount = e.passengerCount;
  if (e.berthPreference) next.berthPreference = e.berthPreference;
  if (e.trainNumber) next.trainNumber = e.trainNumber;

  return { slots: next, ambiguous };
}

function clarifyStation(field: 'from' | 'to', candidates: Station[], slots: AgentSlots): TurnPlan {
  const [a, b] = candidates;
  const msg = translate('agent.ambiguousStation', { query: a.city, optionA: a.name, optionB: b.name });
  return {
    messages: [msg],
    trace: [{ tool: 'resolveStation', result: `${candidates.length} candidates` }],
    chips: candidates.map((s) => ({ label: s.name, value: s.name })),
    slots,
    effects: [],
    awaiting: field === 'from' ? 'clarify_from' : 'clarify_to',
    ambiguousCandidates: candidates,
  };
}

// =============================================================================
// The entry point
// =============================================================================

export function plan(rawInput: string, ctx: PlannerContext): TurnPlan {
  const text = rawInput.toLowerCase().trim();
  const entities = extractEntities(rawInput);

  // "open RI-...." / "open <id>" — a chip action to navigate to an order.
  const openMatch = rawInput.match(/open\s+(RI-\d{4}-\d{6})/i);
  if (openMatch) {
    return turn([`Opening ${openMatch[1].toUpperCase()}.`], [], ctx.slots, [{ type: 'navigate', to: `/orders/${openMatch[1].toUpperCase()}` }], null);
  }

  // start over / cancel the conversation
  if (/^(start over|reset|clear|forget it)$/.test(text)) {
    return { messages: ['Cleared. What would you like to do?'], trace: [], chips: openingChips(), slots: {}, effects: [], awaiting: null };
  }

  // --- resolving a pending station clarification ---
  if ((ctx.awaiting === 'clarify_from' || ctx.awaiting === 'clarify_to') && ctx.pendingCandidates) {
    const chosen = pickCandidate(rawInput, ctx.pendingCandidates);
    if (chosen) {
      const field = ctx.awaiting === 'clarify_from' ? 'from' : 'to';
      const nextSlots: AgentSlots = { ...ctx.slots, ...(field === 'from' ? { fromCode: chosen.code } : { toCode: chosen.code }) };
      return progressBooking(nextSlots, ctx, [{ tool: 'resolveStation', result: chosen.code }], [`${chosen.name} it is.`]);
    }
    // Couldn't tell which — re-ask.
    return clarifyStation(ctx.awaiting === 'clarify_from' ? 'from' : 'to', ctx.pendingCandidates, ctx.slots);
  }

  // --- filling a specific awaited slot with a bare answer ---
  if (ctx.awaiting === 'origin' || ctx.awaiting === 'destination') {
    // A bare answer ("hyderabad") has no direction words, so resolve the
    // whole phrase directly; fall back to any candidates the extractor found.
    const direct = resolveStationInPhrase(rawInput);
    const cands = direct.length ? direct : entities.fromCandidates.concat(entities.toCandidates);
    const resolved = cands;
    if (resolved.length === 1) {
      const nextSlots: AgentSlots = { ...ctx.slots, ...(ctx.awaiting === 'origin' ? { fromCode: resolved[0].code } : { toCode: resolved[0].code }) };
      return progressBooking(nextSlots, ctx, [], []);
    }
    if (resolved.length > 1) return clarifyStation(ctx.awaiting === 'origin' ? 'from' : 'to', resolved, ctx.slots);
    // fall through to full intent handling if nothing resolved
  }

  if (ctx.awaiting === 'date') {
    if (entities.dateError) return turn([entities.dateError], [], ctx.slots, [], 'date');
    if (entities.date) return progressBooking({ ...ctx.slots, date: entities.date }, ctx, [], []);
  }

  if (ctx.awaiting === 'class') {
    // Confirmed class pick, alternate acceptance, or a class name.
    const inv = ctx.slots.trainNumber && ctx.slots.date && ctx.slots.fromCode ? getAvailabilityTool(ctx.slots.trainNumber, ctx.slots.date, ctx.slots.fromCode) : [];
    const anyConfirmed = inv.some(isConfirmedish);
    const affirmative = /^(yes|yeah|yep|sure|ok|okay|set that up|do it|go ahead|please)\b/.test(text);

    if (!anyConfirmed && (affirmative || entities.classCode)) {
      // Accept the board-earlier alternate.
      const alternates = ctx.slots.trainNumber && ctx.slots.date && ctx.slots.fromCode
        ? findAlternatesTool(ctx.slots.trainNumber, ctx.slots.fromCode, ctx.slots.toCode!, ctx.slots.date)
        : [];
      const chosen = (entities.classCode && alternates.find((a) => a.legs[0].classCode === entities.classCode)) || alternates[0];
      if (chosen) {
        const nextSlots: AgentSlots = { ...ctx.slots, classCode: chosen.legs[0].classCode, ticketedFromCode: chosen.ticketedFrom };
        return prepareAndHandoff(nextSlots, ctx, [{ tool: 'findAlternates', result: `${alternates.length} options` }]);
      }
    }
    if (entities.classCode) {
      const classInv = classStatusFor(inv, entities.classCode);
      if (classInv && isBookable(classInv)) {
        return prepareAndHandoff({ ...ctx.slots, classCode: entities.classCode, ticketedFromCode: undefined }, ctx, []);
      }
      return turn([`${CLASS_LABELS[entities.classCode]} is not bookable on this train that day. Pick one of the classes I listed and I will prepare it.`], [], ctx.slots, [], 'class');
    }
  }

  // --- corrections mid-flow ("no make it 2a", "actually from secunderabad") ---
  if (entities.isCorrection && (ctx.slots.fromCode || ctx.slots.toCode || ctx.awaiting)) {
    const { slots: merged, ambiguous } = mergeEntities(ctx.slots, entities);
    if (ambiguous) return clarifyStation(ambiguous.field, ambiguous.candidates, merged);
    return progressBooking(merged, ctx, [], ['Updated.']);
  }

  // --- intent routing ---
  const decision = decideIntent(text, entities);

  switch (decision.id) {
    case 'book_journey': {
      const { slots: merged, ambiguous } = mergeEntities(ctx.slots, entities);
      if (entities.dateError) return turn([entities.dateError], [], merged, [], 'date');
      if (ambiguous) return clarifyStation(ambiguous.field, ambiguous.candidates, merged);
      return progressBooking(merged, ctx, [], []);
    }
    case 'find_alternates': {
      const { slots: merged, ambiguous } = mergeEntities(ctx.slots, entities);
      if (ambiguous) return clarifyStation(ambiguous.field, ambiguous.candidates, merged);
      if (merged.fromCode && merged.toCode && merged.date) return progressBooking(merged, ctx, [], []);
      return progressBooking(merged, ctx, [], ['I can find a confirmed way through — first, a couple of details.']);
    }
    case 'change_boarding': {
      // A station named as "...to X" or "from X" is the intended boarding point.
      const named = entities.fromCandidates.concat(entities.toCandidates);
      if (named.length > 1 && entities.fromCandidates.length !== 1 && entities.toCandidates.length !== 1) {
        return clarifyStation('from', named, ctx.slots);
      }
      const boarding = entities.fromCandidates[0] ?? entities.toCandidates[0];
      if (boarding) {
        const merged = { ...ctx.slots, fromCode: boarding.code };
        return turn(
          [`Boarding point set to ${stationName(boarding.code)}. Note: if you board after your ticketed origin, your berth can be released if you have not boarded within two stations of your point.`],
          [],
          merged,
          [],
          null,
        );
      }
      return turn(['Which station would you like to board at?'], [], ctx.slots, [], 'origin');
    }
    case 'check_money':
      return checkMoneyTurn(entities.orderRef, ctx);
    case 'check_pnr':
      if (entities.pnr) return checkPnrTurn(entities.pnr, ctx);
      return turn(['Tell me the 10-digit PNR and I will look it up.'], [], ctx.slots, [], null);
    case 'cancel_booking':
      return cancelTurn(ctx, entities.pnr, entities.orderRef);
    case 'explain_rule':
      return explainRuleTurn(text, ctx);
    case 'arm_tatkal':
      return armTatkalTurn(entities, ctx);
    case 'greeting':
      return { messages: [translate('agent.intro')], trace: [], chips: openingChips(), slots: ctx.slots, effects: [], awaiting: null };
    case 'help':
    case 'unknown':
    default:
      return helpTurn(ctx);
  }
}

/** Match a free-text answer to one of the clarification candidates. */
function pickCandidate(rawInput: string, candidates: Station[]): Station | undefined {
  const t = rawInput.toLowerCase();
  // Exact code or name/alias match first.
  for (const s of candidates) {
    if (t.includes(s.code.toLowerCase()) || t.includes(s.name.toLowerCase()) || s.aliases.some((a) => t.includes(a))) return s;
  }
  // "junction"/"jn" vs "town" style disambiguators.
  for (const s of candidates) {
    const distinct = s.name.toLowerCase().replace(s.city.toLowerCase(), '').trim();
    if (distinct && t.includes(distinct)) return s;
  }
  return undefined;
}
