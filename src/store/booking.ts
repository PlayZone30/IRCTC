/**
 * Booking store — the in-progress search and draft, shared across
 * Landing (S1) -> Results (S2) -> Passengers (S3) -> Review (S4) ->
 * Payment (S5). Landing writes the initial search; Results reads it
 * and may hand a selected class/itinerary forward into a draft.
 */
import { create } from 'zustand';
import type { BookingDraft, ClassCode, QuotaCode } from '@/domain/types';

export interface SearchQuery {
  fromCode: string | null;
  toCode: string | null;
  date: string; // ISO yyyy-mm-dd
  classCode: 'ALL' | ClassCode;
  quota: QuotaCode;
  flexibleWithDate: boolean;
  personWithDisabilityConcession: boolean;
  railwayPassConcession: boolean;
}

interface BookingState {
  search: SearchQuery;
  setSearch: (patch: Partial<SearchQuery>) => void;
  swapStations: () => void;
  draft: BookingDraft | null;
  setDraft: (draft: BookingDraft | null) => void;
  updateDraft: (patch: Partial<BookingDraft>) => void;
}

function todayIso(): string {
  // Fixed to the seeded demo "today" so search results are deterministic
  // out of the box. A real app would use `new Date()`; see data/inventory.ts.
  return '2026-08-27';
}

export const useBookingStore = create<BookingState>((set) => ({
  search: {
    fromCode: null,
    toCode: null,
    date: todayIso(),
    classCode: 'ALL',
    quota: 'GN',
    flexibleWithDate: false,
    personWithDisabilityConcession: false,
    railwayPassConcession: false,
  },
  setSearch: (patch) => set((s) => ({ search: { ...s.search, ...patch } })),
  swapStations: () =>
    set((s) => ({
      search: { ...s.search, fromCode: s.search.toCode, toCode: s.search.fromCode },
    })),
  draft: null,
  setDraft: (draft) => set({ draft }),
  updateDraft: (patch) => set((s) => (s.draft ? { draft: { ...s.draft, ...patch } } : {})),
}));
