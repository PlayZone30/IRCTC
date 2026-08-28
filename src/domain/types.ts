/**
 * Core domain types — PLAN.md §11.3.
 * These are the shared vocabulary between availability, the allocator,
 * pricing, the agent, and every screen. Nothing user-facing should
 * invent a parallel shape for the same concept.
 */

export type ClassCode =
  | '1A'
  | '2A'
  | '3A'
  | '3E'
  | 'SL'
  | '2S'
  | 'CC'
  | 'EC'
  | 'EA'
  | 'EV'
  | 'VC'
  | 'VS'
  | 'FC';

export type QuotaCode = 'GN' | 'LD' | 'SS' | 'HP' | 'DP' | 'TQ' | 'PT';

export type BerthType = 'LB' | 'MB' | 'UB' | 'SL' | 'SM' | 'SU' | 'WS' | 'M' | 'A';

export type WaitlistType = 'GNWL' | 'RLWL' | 'PQWL' | 'RSWL' | 'RQWL' | 'TQWL';

export type BookingStatus =
  | { kind: 'CNF'; coach: string; berth: number; berthType: BerthType }
  | { kind: 'CNF_NO_BERTH' } // 1A, or cleared pre-chart
  | { kind: 'RAC'; number: number }
  | { kind: 'WL'; type: WaitlistType; number: number }
  | { kind: 'REGRET' }
  | { kind: 'NOT_AVAILABLE' };

export type PaymentState =
  | 'created'
  | 'authorised'
  | 'held'
  | 'captured'
  | 'release_pending'
  | 'released'
  | 'refund_initiated'
  | 'refund_credited'
  | 'failed';

/** Reason codes for the berth allocator's decision trace — PLAN.md §13.3. */
export type ReasonCode =
  | 'PREF_HONOURED'
  | 'PREF_EXHAUSTED'
  | 'QUOTA_HELD'
  | 'AUTO_LB_APPLIED'
  | 'AUTO_LB_LOST'
  | 'COMPACTED'
  | 'COMPACTED_COACH'
  | 'FCFS_LATE'
  | 'DEFERRED_1A'
  | 'DEFERRED_CHART';

export interface DecisionTraceEntry {
  code: ReasonCode;
  params: Record<string, string | number>;
}

export type DecisionTrace = DecisionTraceEntry[];

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  cluster: string;
  /** Alternate spellings/shortenings the agent's entity extractor must resolve. */
  aliases: string[];
}

export interface Halt {
  stationCode: string;
  arrival: string | null; // "HH:MM", null if origin
  departure: string | null; // "HH:MM", null if terminus
  day: number; // 1-indexed day of journey
  distanceKm: number;
}

export interface Coach {
  id: string; // e.g. "S5", "B3", "A1"
  classCode: ClassCode;
  capacity: number;
}

export type RunningDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Train {
  number: string;
  name: string;
  runsOn: RunningDay[];
  halts: Halt[];
  coaches: Coach[];
  /** Train type used for filtering, e.g. "Rajdhani", "Vande Bharat", "SF Express". */
  type: string;
}

/** Per-class inventory for a train on a specific journey date. */
export interface ClassInventory {
  classCode: ClassCode;
  status: BookingStatus;
  baseFare: number; // paise
  updatedAgoSec: number;
}

export interface Passenger {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  country: string;
  berthPreference?: 'lower' | 'middle' | 'upper' | 'side_lower' | 'side_upper' | 'window' | 'no_preference';
  concession?: 'divyangjan' | 'student' | 'patient';
  isAadhaarLinked?: boolean;
}

export type ReservationChoice =
  | 'book_even_if_waitlisted'
  | 'confirmed_only'
  | 'at_least_one_lower'
  | 'two_lower';

export interface BookingDraft {
  trainNumber: string;
  date: string; // ISO date, journey date
  classCode: ClassCode;
  quota: QuotaCode;
  fromStationCode: string; // ticketed origin (may differ from boarding for alternates)
  toStationCode: string; // ticketed destination
  boardingStationCode: string;
  passengers: Passenger[];
  reservationChoice: ReservationChoice;
  considerAutoUpgradation: boolean;
  paymentInstrument?: PaymentInstrument;
}

export type PaymentInstrument =
  | 'upi'
  | 'rupay_debit'
  | 'other_debit'
  | 'credit_card'
  | 'net_banking';

export type ItineraryKind =
  | 'direct'
  | 'board_earlier'
  | 'travel_further'
  | 'both'
  | 'two_leg'
  | 'nearby'
  | 'alt_train';

export interface ItineraryLeg {
  trainNumber: string;
  fromStationCode: string;
  toStationCode: string;
  classCode: ClassCode;
  status: BookingStatus;
}

export interface Itinerary {
  kind: ItineraryKind;
  legs: ItineraryLeg[];
  ticketedFrom: string;
  ticketedTo: string;
  boardAt: string;
  fare: number; // paise, all-inclusive
  fareDeltaVsDirect: number; // signed, paise
  disclosure: string[]; // i18n keys or plain strings, rendered before selection
}

export interface OrderTimelineStep {
  key: string;
  label: string;
  timestamp: string | null; // ISO, null if not yet reached
  detail?: string;
  reference?: string; // AUTH/UTR/PNR etc.
  state: 'done' | 'active' | 'pending' | 'failed';
}

/** Which of the four §15 payment outcomes an order ended in — drives the S6 timeline. */
export type PaymentOutcome = 'issued' | 'debit_failed' | 'partially_confirmed' | 'cancelled_refund';

export interface Order {
  id: string; // "RI-2609-004421"
  createdAt: string;
  draft: BookingDraft;
  paymentState: PaymentState;
  outcome: PaymentOutcome;
  pnr?: string;
  amountPaise: number;
  authRef?: string;
  utr?: string;
  decisionTrace?: DecisionTrace;
}

export interface Account {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  aadhaarVerified: boolean;
  savedPassengers: Passenger[];
  mobileMasked: string;
  emailMasked: string;
}

/** Ten historical waitlist-clearance values for one train+class — powers §7.5. */
export interface ConfirmationHistory {
  trainNumber: string;
  classCode: ClassCode;
  clearedTo: number[]; // exactly 10 values, oldest to newest
}

export type ConfirmationBand = 'usually_clears' | 'often_clears' | 'rarely_clears' | 'unlikely_to_clear';
