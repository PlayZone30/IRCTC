/**
 * The rulebook — PLAN.md §8. Every fare, quota, timing and refund rule
 * lives here as a typed constant or a pure function. Per §0 rule 1:
 * "Do not invent domain rules... if a rule is not in §8, do not make
 * one up." Nothing in this file may be hardcoded in a component.
 */
import type { ClassCode, QuotaCode, ReservationChoice, WaitlistType } from './types';

// ---------------------------------------------------------------------------
// §8.1 Booking windows
// ---------------------------------------------------------------------------

export const ARP_DAYS = 60; // excludes journey date; opens 08:00
export const ARP_OPEN_TIME = '08:00';

export const TATKAL_OPEN = { AC: '10:00', NON_AC: '11:00' } as const; // one day before, excl. journey date
export const TATKAL_AC_CLASSES: ClassCode[] = ['2A', '3A', '3E', 'CC', 'EC'];
export const TATKAL_NON_AC_CLASSES: ClassCode[] = ['SL', '2S', 'FC'];

export const AGENT_LOCKOUT_MIN = { tatkal: 30, arp: 10 } as const;
export const AADHAAR_REQUIRED_FOR: QuotaCode[] = ['TQ', 'PT']; // and the ARP-opening window
export const MONTHLY_LIMIT = { withAadhaar: 24, withoutAadhaar: 12 } as const;

// ---------------------------------------------------------------------------
// §8.2 Classes — the complete list, exactly as IRCTC offers it
// ---------------------------------------------------------------------------

export const CLASS_LABELS: Record<ClassCode, string> = {
  EA: 'Anubhuti Class (EA)',
  '1A': 'AC First Class (1A)',
  EV: 'Vistadome AC (EV)',
  EC: 'Exec. Chair Car (EC)',
  '2A': 'AC 2 Tier (2A)',
  FC: 'First Class (FC)',
  '3A': 'AC 3 Tier (3A)',
  '3E': 'AC 3 Economy (3E)',
  VC: 'Vistadome Chair Car (VC)',
  CC: 'AC Chair car (CC)',
  SL: 'Sleeper (SL)',
  VS: 'Vistadome Non AC (VS)',
  '2S': 'Second Sitting (2S)',
};

/** Dropdown order matches the reference screenshot exactly — do not re-sort. */
export const CLASS_ORDER: ClassCode[] = ['EA', '1A', 'EV', 'EC', '2A', 'FC', '3A', '3E', 'VC', 'CC', 'SL', 'VS', '2S'];

export const CLASS_OPTIONS: { value: 'ALL' | ClassCode; label: string }[] = [
  { value: 'ALL', label: 'All Classes' },
  ...CLASS_ORDER.map((c) => ({ value: c, label: CLASS_LABELS[c] })),
];

// ---------------------------------------------------------------------------
// §8.3 Quotas — the complete online list
// ---------------------------------------------------------------------------

export const QUOTA_LABELS: Record<QuotaCode, string> = {
  GN: 'General',
  LD: 'Ladies',
  SS: 'Lower Berth/Sr.Citizen',
  HP: 'Person With Disability', // HP = Physically Handicapped / Divyangjan. Never PH — that's Parliament House.
  DP: 'Duty Pass',
  TQ: 'Tatkal',
  PT: 'Premium Tatkal',
};

/** Dropdown order matches the reference screenshot exactly. */
export const QUOTA_ORDER: QuotaCode[] = ['GN', 'LD', 'SS', 'HP', 'DP', 'TQ', 'PT'];

export const QUOTA_OPTIONS: { value: QuotaCode; label: string }[] = QUOTA_ORDER.map((q) => ({
  value: q,
  label: QUOTA_LABELS[q],
}));

// ---------------------------------------------------------------------------
// §8.4 Quota constraints
// ---------------------------------------------------------------------------

export const MAX_PASSENGERS: Partial<Record<QuotaCode, number>> & { default: number } = {
  TQ: 4,
  PT: 4,
  default: 6,
};

export function maxPassengersFor(quota: QuotaCode): number {
  return MAX_PASSENGERS[quota] ?? MAX_PASSENGERS.default;
}

export const NO_CONCESSION_IN: QuotaCode[] = ['TQ', 'PT'];
export const TATKAL_EXCLUDED_CLASSES: ClassCode[] = ['1A', 'EA'];

export const LADIES_QUOTA_RULES = {
  requiresAllFemale: true,
  cannotCombineWith: ['TQ', 'PT'] as QuotaCode[],
};

/**
 * Tatkal charge — 10% of base fare for 2S, 30% for all other classes,
 * clamped to the published min/max band per class. §8.4.
 */
export const TATKAL_CHARGE_BAND: Partial<Record<ClassCode, { minPaise: number; maxPaise: number }>> = {
  '2S': { minPaise: 1000, maxPaise: 1500 },
  SL: { minPaise: 10000, maxPaise: 20000 },
  CC: { minPaise: 12500, maxPaise: 22500 },
  '3A': { minPaise: 30000, maxPaise: 40000 },
  '2A': { minPaise: 40000, maxPaise: 50000 },
  EC: { minPaise: 40000, maxPaise: 50000 },
};

export function tatkalCharge(classCode: ClassCode, baseFarePaise: number): number {
  const band = TATKAL_CHARGE_BAND[classCode];
  if (!band) return 0; // Tatkal not offered in this class (also see TATKAL_EXCLUDED_CLASSES)
  const rate = classCode === '2S' ? 0.1 : 0.3;
  const raw = Math.round(baseFarePaise * rate);
  return Math.min(band.maxPaise, Math.max(band.minPaise, raw));
}

// ---------------------------------------------------------------------------
// §8.5 Charting
// ---------------------------------------------------------------------------

export const SECOND_CHART_MIN_BEFORE_MIN = 30; // minutes before departure
export const VANDE_BHARAT_CURRENT_BOOKING_MIN = 15; // minutes before departure (vs the usual 30)
export const CURRENT_BOOKING_CLOSES_MIN = 30;

/**
 * First-chart timing — Railway Board circular, 12 Dec 2025 (§8.5).
 * `departure` is the scheduled departure Date from the ORIGINATING
 * station. Returns the Date the first chart is prepared.
 *
 *   depart 14:01–23:59  -> at least 10h before departure
 *   depart 00:00–05:00  -> at least 10h before departure
 *   depart 05:01–14:00  -> by 20:00 the previous day
 */
export function firstChartTime(departure: Date): Date {
  const hour = departure.getHours();
  const minute = departure.getMinutes();
  const minutesSinceMidnight = hour * 60 + minute;

  const isEarlyAfternoonToEarlyMorning = minutesSinceMidnight >= 14 * 60 + 1 || minutesSinceMidnight <= 5 * 60;

  if (isEarlyAfternoonToEarlyMorning) {
    return new Date(departure.getTime() - 10 * 60 * 60 * 1000);
  }

  // 05:01–14:00 departures: chart by 20:00 the previous day.
  const previousDay20h = new Date(departure);
  previousDay20h.setDate(previousDay20h.getDate() - 1);
  previousDay20h.setHours(20, 0, 0, 0);
  return previousDay20h;
}

export function secondChartTime(departure: Date): Date {
  return new Date(departure.getTime() - SECOND_CHART_MIN_BEFORE_MIN * 60 * 1000);
}

// ---------------------------------------------------------------------------
// §8.6 Fees
// ---------------------------------------------------------------------------

export const GST_RATE = 0.18;

/** All amounts in paise. §8.6. */
export const CONVENIENCE_FEE_PAISE = {
  nonAC: 1500,
  AC: 3000,
  upiNonAC: 1000,
  upiAC: 2000,
} as const;

export const NON_AC_CLASSES: ClassCode[] = ['SL', '2S', 'FC', 'VS'];

export function convenienceFeeBase(classCode: ClassCode, instrument: 'upi' | 'other'): number {
  const isNonAc = NON_AC_CLASSES.includes(classCode);
  if (instrument === 'upi') {
    return isNonAc ? CONVENIENCE_FEE_PAISE.upiNonAC : CONVENIENCE_FEE_PAISE.upiAC;
  }
  return isNonAc ? CONVENIENCE_FEE_PAISE.nonAC : CONVENIENCE_FEE_PAISE.AC;
}

/**
 * Payment gateway charge rates, §8.6/§8/S5. `netBanking` is a flat
 * paise amount, not a rate — handled specially in pricing.ts.
 */
export const PG_CHARGE_RATE = {
  upi: 0,
  rupayDebit: 0,
  debitUpto2000: 0.004,
  debitAbove2000: 0.009,
  creditCard: 0.018,
  netBankingFlatPaise: 1000,
  autopay: 0.018,
} as const;

// ---------------------------------------------------------------------------
// §8.7 Boarding point
// ---------------------------------------------------------------------------

export const BOARDING_POINT_RULES = {
  changeableUntil: 'second_chart', // ~T-30 min
  availableOnWaitlisted: false,
  forfeitsOriginalBoardingRight: true,
  availableOnCurrentBooking: false,
};

// ---------------------------------------------------------------------------
// §8.8 Auto-upgradation
// ---------------------------------------------------------------------------

export const SLEEPING_LADDER: ClassCode[] = ['2S', '3E', '3A', '2A', '1A']; // only 2A is eligible for 1A
export const SITTING_LADDER: ClassCode[] = ['2S', 'VS', 'CC', 'EC', 'EV', 'EA']; // only CC is eligible for EC/EV/EA
export const AUTO_UPGRADE_MAX_LEVELS = 2;
export const AUTO_UPGRADE_FULL_FARE_ONLY = true;
/** Only these classes may be upgraded past the first level, to the classes named. */
export const AUTO_UPGRADE_FINAL_LEVEL_ELIGIBLE: Partial<Record<ClassCode, ClassCode[]>> = {
  '2A': ['1A'],
  CC: ['EC', 'EV', 'EA'],
};

// ---------------------------------------------------------------------------
// §8.9 Cancellation and refunds
// ---------------------------------------------------------------------------

/** Cancellation bands effective 1–15 Apr 2026. Hours are "before scheduled departure". */
export const CANCELLATION_BANDS = [
  { moreThanHours: 72, deductionRate: 0, label: 'flat charge only' },
  { moreThanHours: 24, upToHours: 72, deductionRate: 0.25, label: '25% deducted' },
  { moreThanHours: 8, upToHours: 24, deductionRate: 0.5, label: '50% deducted' },
  { moreThanHours: 0, upToHours: 8, deductionRate: 1, label: 'no refund' },
] as const;

/** Flat cancellation charge per class, in paise. §8.9. */
export const FLAT_CANCELLATION_CHARGE_PAISE: Record<ClassCode, number> = {
  '1A': 24000,
  EA: 24000,
  EC: 24000,
  '2A': 20000,
  FC: 20000,
  '3A': 18000,
  CC: 18000,
  '3E': 18000,
  VC: 18000,
  EV: 18000,
  SL: 12000,
  VS: 12000,
  '2S': 6000,
};

export const CONFIRMED_TATKAL_REFUND_PAISE = 0;
export const RAC_TDR_CUTOFF_MIN = 30; // minutes before scheduled departure

export const WL_AUTOCANCEL = {
  automatic: true,
  clerkagePaise: 6000,
  convenienceFeeRefunded: false,
};

/** Abolished Mar 2026 "Reform Express" — refund is now automatic, no TDR needed. */
export const TDR_FILING_REQUIRED = false;

/**
 * Hours between now and scheduled departure, and the cancellation
 * band that applies. Returns the deduction rate (0–1) and the flat
 * charge that also applies regardless of band.
 */
export function cancellationBandFor(hoursBeforeDeparture: number) {
  const band = CANCELLATION_BANDS.find(
    (b) => hoursBeforeDeparture > b.moreThanHours && (!('upToHours' in b) || hoursBeforeDeparture <= b.upToHours),
  );
  return band ?? CANCELLATION_BANDS[CANCELLATION_BANDS.length - 1];
}

// ---------------------------------------------------------------------------
// §8.10 Waitlist and RAC
// ---------------------------------------------------------------------------

export const WL_CAP_SHARE = { AC: 0.6, nonAC: 0.3 } as const; // share of class capacity
export const WL_CANNOT_BOARD_RESERVED = true;
export const WL_PENALTY_PAISE = { SL: 25000, AC: 44000 } as const; // plus fare from boarding station
export const RAC_CAN_BOARD = true; // seat shared on a side-lower berth

/**
 * Waitlist clearance priority order at charting, best to worst.
 * TQWL does not get priority at charting — GNWL clears ahead of it.
 */
export const WAITLIST_PRIORITY_AT_CHARTING: WaitlistType[] = ['GNWL', 'RLWL', 'PQWL', 'RSWL', 'RQWL', 'TQWL'];

// ---------------------------------------------------------------------------
// §8.11 Concessions
// ---------------------------------------------------------------------------

/**
 * Senior-citizen FARE concession remains suspended since March 2020 —
 * never offer it. This is distinct from the senior-citizen LOWER-BERTH
 * QUOTA (§9.3, allocator.ts), which is separate and very much active.
 * Conflating the two is a common error in third-party clones — see
 * PLAN.md §8.11. Do not "fix" this by enabling SENIOR_CITIZEN_FARE_CONCESSION_ACTIVE.
 */
export const SENIOR_CITIZEN_FARE_CONCESSION_ACTIVE = false;
export const RETAINED_CONCESSIONS = ['student', 'divyangjan', 'patient'] as const;

// ---------------------------------------------------------------------------
// Reservation choice — S3 (§8, §9.5 step 4)
// ---------------------------------------------------------------------------

export const RESERVATION_CHOICE_OPTIONS: { value: ReservationChoice; label: string; consequence?: string }[] = [
  { value: 'book_even_if_waitlisted', label: 'Book even if waitlisted' },
  {
    value: 'confirmed_only',
    label: 'Book only if confirmed',
    consequence: 'If nothing is confirmed the booking is not made and you are not charged.',
  },
  { value: 'at_least_one_lower', label: 'Book only if at least one lower berth is allotted' },
  { value: 'two_lower', label: 'Book only if two lower berths are allotted' },
];
