/**
 * Sarathi agent — shared types. PLAN.md §7.11.
 *
 * The agent is a fully simulated, deterministic natural-language layer
 * over the same domain functions the UI uses. No LLM, no network. These
 * types describe the pipeline: extract -> score intents -> resolve slots
 * -> plan -> execute tools -> compose reply.
 */
import type { BookingDraft, ClassCode, QuotaCode, Station } from '@/domain/types';

/** Everything the extractor can pull out of one utterance. All optional — extraction returns partial results happily. */
export interface Entities {
  /** Resolved origin candidates (>1 = ambiguous, ask). Empty = not mentioned. */
  fromCandidates: Station[];
  toCandidates: Station[];
  date?: string; // ISO yyyy-mm-dd
  dateError?: string; // e.g. beyond ARP
  classCode?: ClassCode;
  quota?: QuotaCode;
  passengerCount?: number;
  berthPreference?: 'lower' | 'middle' | 'upper' | 'side_lower' | 'window';
  pnr?: string;
  trainNumber?: string;
  orderRef?: string;
  /** True if the utterance is a correction ("no, make it 2a", "actually from secunderabad"). */
  isCorrection: boolean;
}

export type IntentId =
  | 'book_journey'
  | 'check_money'
  | 'check_pnr'
  | 'cancel_booking'
  | 'explain_rule'
  | 'arm_tatkal'
  | 'find_alternates'
  | 'change_boarding'
  | 'greeting'
  | 'help'
  | 'unknown';

export interface IntentScore {
  id: IntentId;
  score: number;
}

/** One line in the collapsible step-trace panel — the credibility artefact (§7.11). */
export interface StepTraceEntry {
  tool: string;
  result: string;
}

export type MessageAuthor = 'user' | 'agent';

export interface AgentMessage {
  id: string;
  author: MessageAuthor;
  text: string;
  /** Attached to the last bubble of an agent turn. */
  trace?: StepTraceEntry[];
}

/** Suggestion chips shown above the composer, contextual to the turn. */
export interface SuggestionChip {
  label: string;
  /** The text submitted when the chip is tapped. */
  value: string;
}

/** The conversation-scoped slots being filled toward a booking (§7.11.3). */
export interface AgentSlots {
  fromCode?: string;
  toCode?: string;
  /** Where the ticket is issued from, if it differs from the boarding station (board-earlier alternate). */
  ticketedFromCode?: string;
  date?: string;
  classCode?: ClassCode;
  quota?: QuotaCode;
  passengerCount?: number;
  berthPreference?: Entities['berthPreference'];
  /** Set once the user picks a train from search results. */
  trainNumber?: string;
}

/** What the agent is waiting for next, so a bare answer fills the right slot (§7.11.3). */
export type AwaitingSlot = 'origin' | 'destination' | 'date' | 'class' | 'clarify_from' | 'clarify_to' | null;

/** What the planner decided to do this turn — pure, no side effects. */
export interface TurnPlan {
  /** One or more agent bubbles to emit, in order (§7.11.5 sequenced turns). */
  messages: string[];
  /** Tool trace lines to show under the final bubble. */
  trace: StepTraceEntry[];
  /** Suggestion chips to offer after this turn. */
  chips: SuggestionChip[];
  /** Slots after this turn. */
  slots: AgentSlots;
  /** Side effects for the drawer to run against the real app (§7.11 "drive the app"). */
  effects: AgentEffect[];
  /** What the next bare answer should fill. */
  awaiting: AwaitingSlot;
  /** When clarifying an ambiguous station, the candidates to choose from. */
  ambiguousCandidates?: Station[];
}

/** Conversation state passed into the planner each turn. */
export interface PlannerContext {
  slots: AgentSlots;
  awaiting: AwaitingSlot;
  /** Candidates presented in a pending station clarification, if any. */
  pendingCandidates?: Station[];
  turnIndex: number;
  accountId: string | null;
}

/** Side effects the drawer executes so the agent drives the real UI, not a parallel reality. */
export type AgentEffect =
  | { type: 'search'; fromCode: string; toCode: string; date: string; classCode?: ClassCode; quota?: QuotaCode }
  | { type: 'navigate'; to: string }
  | { type: 'prepareDraft'; draft: BookingDraft } // stage the draft, then navigate to /book/review
  | { type: 'armForWindow'; draft: BookingDraft }; // add the draft to /ready
