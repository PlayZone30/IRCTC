/**
 * Ready-to-book store — armed drafts waiting for a booking window
 * (Tatkal / ARP) to open. The Sarathi agent arms drafts here (§7.11
 * "arm for Tatkal"); the Ready console (S9, Task 10) renders them.
 */
import { create } from 'zustand';
import type { BookingDraft } from '@/domain/types';
import { DEMO_DATE_PLUS_1, DEMO_DATE_PLUS_2 } from '@/data/inventory';
import { accounts } from '@/data/accounts';

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

/**
 * Two seeded armed drafts so the console is demoable on a fresh load,
 * before the agent arms anything: one Tatkal window already open (its
 * primary action is "Book now"), one still counting down.
 */
const seededArmed: ArmedDraft[] = [
  {
    id: 'armed-seed-open',
    draft: {
      trainNumber: '12723',
      date: DEMO_DATE_PLUS_1, // 28 Aug -> Tatkal AC opens 27 Aug 10:00 (open at demo now)
      classCode: '3A',
      quota: 'TQ',
      fromStationCode: 'HYB',
      toStationCode: 'NDLS',
      boardingStationCode: 'HYB',
      passengers: accounts.priya.savedPassengers.slice(0, 2),
      reservationChoice: 'book_even_if_waitlisted',
      considerAutoUpgradation: true,
      paymentInstrument: 'upi',
    },
    armedAt: '2026-08-27T08:00:00+05:30',
  },
  {
    id: 'armed-seed-countdown',
    draft: {
      trainNumber: '12721',
      date: DEMO_DATE_PLUS_2, // 29 Aug -> Tatkal non-AC opens 28 Aug 11:00 (counts down)
      classCode: 'SL',
      quota: 'TQ',
      fromStationCode: 'HYB',
      toStationCode: 'NZM',
      boardingStationCode: 'HYB',
      passengers: accounts.priya.savedPassengers.slice(0, 1),
      reservationChoice: 'confirmed_only',
      considerAutoUpgradation: false,
      paymentInstrument: 'upi',
    },
    armedAt: '2026-08-27T08:05:00+05:30',
  },
];

export const useReadyStore = create<ReadyState>((set) => ({
  armed: seededArmed,
  arm: (draft) =>
    set((s) => ({
      armed: [{ id: `armed-${Date.now()}`, draft, armedAt: new Date().toISOString() }, ...s.armed],
    })),
  remove: (id) => set((s) => ({ armed: s.armed.filter((a) => a.id !== id) })),
}));
