/**
 * Agent session store — PLAN.md §7.11.3, §7.11.5. Holds the
 * conversation (messages, slots, what we're awaiting) and orchestrates
 * a turn: run the pure planner, drive the real app via effect handlers,
 * and stream the reply with a simulated typing delay. Interruptible — a
 * new message cancels the pending turn.
 */
import { create } from 'zustand';
import type { AgentEffect, AgentMessage, AgentSlots, AwaitingSlot, StepTraceEntry, SuggestionChip } from './types';
import type { Station } from '@/domain/types';
import { plan } from './planner';
import { sleep, typingDelayFor } from './deliver';
import { translate } from '@/i18n';

/** Effect handlers the drawer supplies so the agent drives the real UI. */
export interface EffectHandlers {
  accountId: string | null;
  runSearch: (fromCode: string, toCode: string, date: string, quota?: string) => void;
  navigate: (to: string) => void;
  prepareDraft: (effect: Extract<AgentEffect, { type: 'prepareDraft' }>) => void;
  armForWindow: (effect: Extract<AgentEffect, { type: 'armForWindow' }>) => void;
}

let messageSeq = 0;
function nextId(): string {
  return `msg-${++messageSeq}`;
}

interface AgentState {
  open: boolean;
  /** Text to drop into the composer when the drawer opens (from the landing teaser). */
  prefill: string;
  messages: AgentMessage[];
  chips: SuggestionChip[];
  isTyping: boolean;
  // conversation control
  slots: AgentSlots;
  awaiting: AwaitingSlot;
  pendingCandidates?: Station[];
  turnIndex: number;
  /** Cancellation token: a new submit invalidates any in-flight streaming. */
  runId: number;

  openDrawer: (prefill?: string) => void;
  closeDrawer: () => void;
  reset: () => void;
  submit: (text: string, handlers: EffectHandlers) => Promise<void>;
}

const OPENING_CHIPS: SuggestionChip[] = [
  { label: translate('agent.suggestions.book'), value: 'Book Kollam to Chennai on 12 September' },
  { label: translate('agent.suggestions.refund'), value: 'where is my refund' },
  { label: translate('agent.suggestions.pnr'), value: 'pnr 4728166390' },
  { label: translate('agent.suggestions.waitlist'), value: 'what does tqwl mean' },
];

export const useAgentStore = create<AgentState>((set, get) => ({
  open: false,
  prefill: '',
  messages: [],
  chips: OPENING_CHIPS,
  isTyping: false,
  slots: {},
  awaiting: null,
  pendingCandidates: undefined,
  turnIndex: 0,
  runId: 0,

  openDrawer: (prefill) => {
    set({ open: true, prefill: prefill ?? '' });
    if (get().messages.length === 0) {
      set({
        messages: [{ id: nextId(), author: 'agent', text: translate('agent.intro') }],
        chips: OPENING_CHIPS,
      });
    }
  },

  closeDrawer: () => set({ open: false }),

  reset: () =>
    set({
      messages: [{ id: nextId(), author: 'agent', text: translate('agent.intro') }],
      chips: OPENING_CHIPS,
      slots: {},
      awaiting: null,
      pendingCandidates: undefined,
      turnIndex: 0,
      isTyping: false,
    }),

  submit: async (text, handlers) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Cancel any pending turn (interruptible §7.11.5).
    const myRun = get().runId + 1;
    set((s) => ({
      runId: myRun,
      isTyping: false,
      messages: [...s.messages, { id: nextId(), author: 'user', text: trimmed }],
      chips: [],
    }));

    // Run the pure planner synchronously.
    const { slots, awaiting, pendingCandidates, turnIndex } = get();
    const result = plan(trimmed, { slots, awaiting, pendingCandidates, turnIndex, accountId: handlers.accountId });

    // Commit the new conversation control state immediately.
    set({
      slots: result.slots,
      awaiting: result.awaiting,
      pendingCandidates: result.ambiguousCandidates,
      turnIndex: turnIndex + 1,
    });

    // Drive the app: run "populate" effects (search) up front so the page
    // behind the drawer updates in lockstep, then stream the reply, then
    // run "navigate/prepare" effects after the last bubble.
    const populateEffects = result.effects.filter((e) => e.type === 'search');
    const finishEffects = result.effects.filter((e) => e.type !== 'search');
    for (const e of populateEffects) {
      if (e.type === 'search') handlers.runSearch(e.fromCode, e.toCode, e.date, e.quota);
    }

    // Stream each bubble with a typing indicator; abort if superseded.
    for (let i = 0; i < result.messages.length; i++) {
      const isLast = i === result.messages.length - 1;
      set({ isTyping: true });
      await sleep(typingDelayFor(result.messages[i]));
      if (get().runId !== myRun) return; // interrupted
      const trace: StepTraceEntry[] | undefined = isLast && result.trace.length ? result.trace : undefined;
      set((s) => ({
        isTyping: false,
        messages: [...s.messages, { id: nextId(), author: 'agent', text: result.messages[i], trace }],
      }));
    }

    // Offer this turn's chips.
    set({ chips: result.chips });

    // Run finishing effects (navigate / prepareDraft / armForWindow).
    for (const e of finishEffects) {
      if (e.type === 'navigate') handlers.navigate(e.to);
      else if (e.type === 'prepareDraft') handlers.prepareDraft(e);
      else if (e.type === 'armForWindow') handlers.armForWindow(e);
    }
  },
}));
