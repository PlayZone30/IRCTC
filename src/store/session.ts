/**
 * Session store — which demo account is signed in.
 * PLAN.md §S1: "One click signs in and returns to /." This is the
 * brief's hard requirement (§1 Guardrails: "Demo credentials must be
 * visible on the landing page... one click to enter, no typing.")
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account } from '@/domain/types';
import { accounts } from '@/data/accounts';

interface SessionState {
  accountId: keyof typeof accounts | null;
  signIn: (id: keyof typeof accounts) => void;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accountId: null,
      signIn: (id) => set({ accountId: id }),
      signOut: () => set({ accountId: null }),
    }),
    { name: 'railindia.session' },
  ),
);

/** Convenience selector: the full Account object for whoever is signed in, or null. */
export function useCurrentAccount(): Account | null {
  const accountId = useSessionStore((s) => s.accountId);
  return accountId ? accounts[accountId] : null;
}
