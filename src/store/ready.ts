/**
 * Ready-to-book store — armed drafts waiting for a booking window
 * (Tatkal / ARP) to open. The Sarathi agent arms drafts here (§7.11
 * "arm for Tatkal"); the Ready console (S9, Task 10) renders them.
 */
import { create } from 'zustand';
import type { BookingDraft } from '@/domain/types';

export interface ArmedDraft {
  id: string;
  draft: BookingDraft;
  armedAt: string;
}

interface ReadyState {
  armed: ArmedDraft[];
  arm: (draft: BookingDraft) => void;
  remove: (id: string) => void;
}

export const useReadyStore = create<ReadyState>((set) => ({
  armed: [],
  arm: (draft) =>
    set((s) => ({
      armed: [{ id: `armed-${Date.now()}`, draft, armedAt: new Date().toISOString() }, ...s.armed],
    })),
  remove: (id) => set((s) => ({ armed: s.armed.filter((a) => a.id !== id) })),
}));
