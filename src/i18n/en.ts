/**
 * English copy deck — PLAN.md §13.
 * This is the canonical source for every user-facing string. Component
 * code must never hardcode a string a user will read; it calls t('key').
 *
 * Structure mirrors §13's sections so this file stays auditable against
 * the plan: nav, status vocabulary (§13.2), berth reasons (§13.3),
 * money copy (§13.4), agent copy (§13.5), plus the screen-level strings
 * introduced as each screen is built.
 */

export const en = {
  common: {
    back: 'Back',
    continue: 'Continue',
    cancel: 'Cancel',
    close: 'Close',
    edit: 'Edit',
    remove: 'Remove',
    apply: 'Apply',
    reset: 'Reset',
    loading: 'Loading…',
    retry: 'Retry',
    save: 'Save',
    change: 'Change',
    optional: 'Optional',
  },

  nav: {
    productName: 'RailIndia',
    book: 'Book',
    myBookings: 'My bookings',
    pnrStatus: 'PNR status',
    charts: 'Charts',
    textSizeDecrease: 'Decrease text size',
    textSizeReset: 'Reset text size',
    textSizeIncrease: 'Increase text size',
    language: 'भाषा / Language',
    notifications: 'Notifications',
    account: 'Account',
  },

  // §13.2 — status vocabulary, verbatim
  status: {
    CNF: { label: 'Confirmed', consequence: 'Your berth is reserved. Coach and berth are shown on your ticket.' },
    CNF_1A: {
      label: 'Confirmed',
      consequence: 'Your coach and berth are assigned when the chart is prepared, so families stay together.',
    },
    CNF_NO_BERTH: { label: 'Confirmed', consequence: 'Your berth number is assigned when the chart is prepared.' },
    RAC: {
      label: 'RAC — seat, not a berth',
      consequence:
        'You can board and you get a seat, shared on a side-lower berth. You may get a full berth at charting or from the conductor.',
    },
    GNWL: {
      label: 'Waitlist — general',
      consequence: 'The largest pool, so this clears most often. If it does not clear you cannot board a reserved coach.',
    },
    RLWL: {
      label: 'Waitlist — remote location',
      consequence:
        'This clears only if someone travelling to your destination cancels, and it is charted separately about 2–3 hours before the train reaches your station.',
    },
    PQWL: {
      label: 'Waitlist — pooled',
      consequence: 'One small pool is shared across many stations on this route, so this clears less often.',
    },
    RSWL: {
      label: 'Waitlist — roadside',
      consequence: 'Held for a short journey to a roadside station. It clears rarely.',
    },
    RQWL: {
      label: 'Waitlist — request',
      consequence: 'For journeys between two intermediate stations with no dedicated pool. It clears rarely.',
    },
    TQWL: {
      label: 'Waitlist — Tatkal',
      consequence: 'Tatkal waitlists do not get priority at charting. General waitlists clear ahead of this one.',
    },
    REGRET: { label: 'No more bookings', consequence: 'This class is closed for booking on this date.' },
    NOT_AVAILABLE: { label: 'Not offered', consequence: 'This train does not run this class on this date.' },
    waitlistWarning:
      'A fully waitlisted ticket does not let you board a reserved coach. If it does not clear, it is cancelled automatically and refunded, minus ₹60 clerkage. The convenience fee is not refunded.',
  },

  // Confirmation guidance bands — §7.5. Never a percentage.
  confirmation: {
    usually_clears: 'Usually clears',
    often_clears: 'Often clears',
    rarely_clears: 'Rarely clears',
    unlikely_to_clear: 'Unlikely to clear',
    evidenceHeading: 'In the last 10 departures of this train in {class}, the waitlist cleared to:',
    yourPosition: 'You are at {status} {number}.',
    methodNote: 'Based on the last 10 departures of this train in this class. Past outcomes do not guarantee this journey.',
  },

  // §13.3 — berth allocation reason codes, verbatim
  berthReason: {
    PREF_HONOURED: 'You asked for {pref} and that is what you have.',
    PREF_EXHAUSTED: 'You asked for {pref}. All {pref} berths in this coach were already taken.',
    QUOTA_HELD: '{n} lower berths in this coach are held for senior citizens, women over 45 and pregnant passengers.',
    AUTO_LB_APPLIED: 'A lower berth was requested automatically because of the passenger\u2019s age.',
    AUTO_LB_LOST: 'A lower berth was requested automatically, but the last one went to an earlier booking.',
    COMPACTED: 'Your group was kept together in one bay, which took priority over berth type.',
    COMPACTED_COACH: 'Your group was kept in one coach. A single bay was not available.',
    FCFS_LATE: 'Berths are allotted first come, first served. The berths you wanted were booked earlier today.',
    DEFERRED_1A: 'First AC berths are assigned when the chart is prepared.',
    DEFERRED_CHART: 'Your berth number is assigned when the chart is prepared, so groups can be seated together.',
  },

  // §13.4 — money copy, verbatim
  money: {
    holdExplainer:
      'We place a hold on your money. It is captured only when your ticket is issued. If issuance fails, the hold is released.',
    issuanceFailed:
      'Ticket not issued. Your money was held, not taken. The hold on {amount} is being released to your bank and will disappear from your statement by {date}. Bank reference {utr}. You do not need to do anything, and do not retry this booking yet — retrying now may place a second hold.',
    refundInProgress: '{amount} is on its way back to {instrument}. Expected by {date}. Bank reference {utr}.',
    autoCancelledWaitlist:
      'Your waitlisted ticket did not clear, so it was cancelled automatically at charting. {refund} has been returned. {clerkage} clerkage was deducted and the {fee} convenience fee is not refunded.',
    lowestTotal: 'Lowest total',
    ticketFare: 'Ticket fare',
    convenienceFee: 'Convenience fee',
    gst: 'GST',
    total: 'Total fare',
    gatewayCharge: 'Gateway charge',
  },

  // §13.5 — agent copy, verbatim
  agent: {
    name: 'Sarathi',
    intro: 'I can search, compare and prepare a booking. I cannot pay — you confirm that yourself.',
    proposesNeverPays: 'Proposes · never pays',
    ambiguousStation: 'Two stations match "{query}" — {optionA} and {optionB}. Which one?',
    nothingConfirmed:
      "Nothing is confirmed on {train} in any class. If you board at {station} instead, I can get you {status} in {class} — that is {delta} more, and you board {time}. Want that?",
    handoff: "I've prepared this booking. Check the fare and confirm on the next screen — I can't pay for you.",
    ruleRefusal: 'Concessions are not allowed in the Tatkal quota, so I have not applied the senior-citizen concession. The fare shown is the full fare.',
    unknown: 'I can search trains, prepare a booking, check where your money is, look up a PNR, or explain a rule. Which of those is closest?',
    whatICanDo: 'View what Sarathi can do',
    canDo: 'Can: search, compare, check rules, prepare a booking, arm a draft, read your orders.',
    cannotDo: 'Cannot: pay, cancel without your confirmation, change your Aadhaar details, contact anyone on your behalf.',
    composerPlaceholder: 'Ask Sarathi — try "book Kollam to Chennai on 12 September"',
    suggestions: {
      book: 'Book a ticket',
      refund: 'Where is my refund',
      pnr: 'Check PNR',
      waitlist: 'Explain waitlist',
    },
  },

  a11y: {
    stationSelected: '{station} selected as {field} station.',
    conformanceNote: 'Built to WCAG 2.1 AA and GIGW 3.0 intent. Full conformance needs assistive-technology testing and expert audit.',
  },

  footer: {
    disclaimer:
      'This is an independent hackathon prototype. All data, accounts and transactions are mock. It is not affiliated with, endorsed by, or connected to IRCTC or Indian Railways.',
  },
} as const;

export type Dictionary = typeof en;
