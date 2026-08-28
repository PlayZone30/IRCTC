/**
 * Orders store — the live + seeded orders, shared across Payment (S5),
 * Order timeline (S6), Orders list (S10) and the agent's "where is my
 * money" intent. Seeded orders cover all four §15 payment outcomes so
 * every branch of the S6 timeline is demoable from a fresh load.
 */
import { create } from 'zustand';
import type { Order } from '@/domain/types';
import { DEMO_DATE, DEMO_DATE_PLUS_1, DEMO_DATE_PLUS_2 } from '@/data/inventory';

/** ISO timestamp helper anchored to the seeded demo "today". */
function at(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

/**
 * Priya's seeded orders — §10.4: one issued, one debit-without-ticket
 * awaiting release, one cancelled with a refund in progress, one
 * waitlisted near charting. `accountId` scopes them to the demo user.
 */
const seededOrders: (Order & { accountId: string })[] = [
  {
    accountId: 'priya',
    id: 'RI-4821-556193',
    createdAt: at(DEMO_DATE, '08:12'),
    outcome: 'issued',
    paymentState: 'captured',
    amountPaise: 267500 + 2360,
    authRef: 'AUTH 8846201',
    utr: 'UTR 526239104882',
    pnr: '4728166390',
    draft: {
      trainNumber: '12723',
      date: DEMO_DATE,
      classCode: '2A',
      quota: 'GN',
      fromStationCode: 'HYB',
      toStationCode: 'NDLS',
      boardingStationCode: 'HYB',
      passengers: [{ id: 'o1p1', name: 'Priya Menon', age: 34, gender: 'F', country: 'India', berthPreference: 'lower' }],
      reservationChoice: 'book_even_if_waitlisted',
      considerAutoUpgradation: false,
    },
  },
  {
    accountId: 'priya',
    id: 'RI-3390-118804',
    createdAt: at(DEMO_DATE, '11:00'),
    outcome: 'debit_failed',
    paymentState: 'release_pending',
    amountPaise: 195000 + 2360,
    authRef: 'AUTH 7761540',
    utr: 'UTR 903471228650',
    draft: {
      trainNumber: '12721',
      date: DEMO_DATE_PLUS_1,
      classCode: '3A',
      quota: 'TQ',
      fromStationCode: 'HYB',
      toStationCode: 'NZM',
      boardingStationCode: 'HYB',
      passengers: [
        { id: 'o2p1', name: 'Priya Menon', age: 34, gender: 'F', country: 'India' },
        { id: 'o2p2', name: 'Arjun Menon', age: 29, gender: 'M', country: 'India' },
      ],
      reservationChoice: 'book_even_if_waitlisted',
      considerAutoUpgradation: false,
    },
  },
  {
    accountId: 'priya',
    id: 'RI-2609-004421',
    createdAt: at(DEMO_DATE, '07:40'),
    outcome: 'cancelled_refund',
    paymentState: 'refund_initiated',
    amountPaise: 158000 + 2360,
    authRef: 'AUTH 5540982',
    utr: 'UTR 771230948821',
    pnr: '2231905567',
    draft: {
      trainNumber: '12624',
      date: DEMO_DATE_PLUS_2,
      classCode: '3A',
      quota: 'GN',
      fromStationCode: 'QLN',
      toStationCode: 'MAS',
      boardingStationCode: 'KYJ',
      passengers: [{ id: 'o3p1', name: 'Lakshmi Menon', age: 67, gender: 'F', country: 'India', berthPreference: 'lower' }],
      reservationChoice: 'book_even_if_waitlisted',
      considerAutoUpgradation: false,
    },
  },
  {
    accountId: 'priya',
    id: 'RI-9137-882045',
    createdAt: at(DEMO_DATE, '09:25'),
    outcome: 'partially_confirmed',
    paymentState: 'captured',
    amountPaise: 75500 * 2 + 2360,
    authRef: 'AUTH 6620713',
    utr: 'UTR 550119402277',
    pnr: '8890342156',
    draft: {
      trainNumber: '12723',
      date: DEMO_DATE_PLUS_1,
      classCode: 'SL',
      quota: 'GN',
      fromStationCode: 'HYB',
      toStationCode: 'NDLS',
      boardingStationCode: 'HYB',
      passengers: [
        { id: 'o4p1', name: 'Priya Menon', age: 34, gender: 'F', country: 'India' },
        { id: 'o4p2', name: 'Arjun Menon', age: 29, gender: 'M', country: 'India' },
      ],
      reservationChoice: 'book_even_if_waitlisted',
      considerAutoUpgradation: false,
    },
  },
];

interface OrdersState {
  orders: (Order & { accountId?: string })[];
  addOrder: (order: Order) => void;
  getOrder: (id: string) => (Order & { accountId?: string }) | undefined;
  ordersForAccount: (accountId: string | null) => (Order & { accountId?: string })[];
  cancelOrder: (id: string) => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: seededOrders,
  addOrder: (order) => set((s) => ({ orders: [{ ...order }, ...s.orders] })),
  getOrder: (id) => get().orders.find((o) => o.id === id),
  ordersForAccount: (accountId) => get().orders.filter((o) => !o.accountId || o.accountId === accountId),
  cancelOrder: (id) =>
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, outcome: 'cancelled_refund', paymentState: 'refund_initiated' } : o,
      ),
    })),
}));
