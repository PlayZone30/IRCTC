# IRCTC Public Issue & Enhancement Status Atlas

**Version:** 2.0 — full rebuild on dated, primary-where-possible evidence
**Research window:** Publicly available material through **27 August 2026**
**Scope:** IRCTC e-ticketing website (production `nget` + the July 2026 `/eticket/` beta), IRCTC Rail Connect, the RailOne super-app, PRS itself, payments/refunds, onboarding, support, and AskDISHA.

---

## Executive summary

Between mid-2025 and today, Indian Railways ran the largest reform push on passenger ticketing in two decades. Aadhaar and OTP authentication became compulsory for Tatkal, agents were locked out of the opening minutes, waitlist caps were raised, charts moved hours earlier, TDR filing was abolished in favour of automatic refunds, boarding-station change was extended to the final chart, a redesigned e-ticketing website shipped in beta, and phased migration to a next-generation PRS began.

And the Tatkal window still visibly failed in **October 2025**, **December 2025**, **April 2026** and **June 2026**.

That contradiction is the centre of this document. The Railway Minister told the Lok Sabha on 3 December 2025 that the IRCTC website ran at **99.98% uptime**; nineteen days later users were publicly disputing it during a Tatkal error wave. Both statements can be true, because 99.98% still permits roughly an hour and a half of monthly downtime, and if it lands inside the 10:00 or 11:00 windows it hits nearly everyone who cares.

The deeper finding is that **authentication was never the binding constraint — supply is**. In FY 2025-26, **3.39 crore passengers could not travel** because their waitlisted tickets never confirmed and were auto-cancelled: about **92,877 people every day**. That figure has risen every year for five years. No amount of bot-blocking changes it. Meanwhile **58% of booking requests in the six months to July 2026 were automated**, peaking at **70.7% non-human traffic in October 2025** — so the fairness fight is real, it is just not the same fight as the capacity fight.

**What genuinely improved:** the July 2026 beta website, automatic TDR, boarding-point flexibility, earlier charting, higher waitlist caps, RailOne's consolidation of UTS/NTES/IRCTC functions, and an officially-claimed jump in waitlist prediction accuracy from 53% to 94%.

**What regressed or newly appeared:** cancellation refund windows tightened from 48/12/4 hours to **72/24/8 hours** with **zero refund inside 8 hours**; clerkage is still deducted when Railways itself auto-cancels an unconfirmed waitlisted ticket; three official front doors (IRCTC web, Rail Connect, RailOne) now compete with no canonical channel; RailOne broke VoiceOver for at least one blind user; and an August 2026 consumer survey found **70% of IRCTC users reporting "forced action" dark patterns**.

> **Bottom line for a redesign:** the interface problems are being fixed by IRCTC itself and are no longer a differentiator. The problems still wide open are **transactional legibility** (where is my money, where is my ticket, where is my refund), **decision support under scarcity** (what are my real options when this train is full), and **verification that does not consume the booking window**. Those are the three places to build.

---

## Method and status language

Reviews, forum posts and social media record **user-reported experience**. They are not treated as proof of a systemic incident on their own. A theme is upgraded in confidence when it appears across independent sources, is corroborated by dated journalism, or is confirmed in Parliament, a court record, an RTI reply or an official circular. Where only one source exists, it is marked.

Priority is given to primary records — Lok Sabha and Rajya Sabha replies, Railway Board circulars, PIB releases, CRIS documentation, IRCTC's own policy PDFs — over reporting about them.

| Status | Meaning |
|---|---|
| **Observed unresolved** | A materially similar complaint appears in 2026 evidence and no official change demonstrably fixes the user outcome. |
| **Partially addressed** | A relevant feature, rule change or support path now exists, but evidence does not show the user outcome is reliably solved. |
| **Addressed on a surface** | An official screen or an explicit release change directly targets the concern, but the end-to-end task was not transaction-tested. |
| **Officially resolved** | A dated official change removes the mechanism that caused the complaint. |
| **Newly created / regressed** | The problem did not exist, or was smaller, before a 2025–26 change. |
| **Inconclusive** | Evidence too sparse, device-specific, conflicting or non-transactional to call. |

**Audit boundary, stated plainly:** this document is built from the public record. No booking was made, no payment was sent, no ticket was cancelled, no Aadhaar OTP was requested and no support ticket was filed in the course of compiling it. Nothing below should be read as a load test or an end-to-end verification.

---

## Dated timeline of public signals

| Date | Source type | What happened or was reported |
|---|---|---|
| **1 Nov 2024** | Railway Board circular (16 Oct 2024) | Advance Reservation Period cut **120 → 60 days**. ([The Hindu](https://www.thehindu.com/news/national/advance-reservation-period-for-railway-tickets-reduced-from-120-to-60-days/article68764108.ece)) |
| 9, 26, 31 Dec 2024 | News | Three separate website/app outages in one month, each attributed to maintenance; the 31 Dec incident hit before New Year. ([NDTV](https://www.ndtv.com/india-news/irctc-website-down-ahead-of-new-year-2025-third-outage-this-month-7368561)) |
| 12–13 Jan 2025 | News | Outage with Downdetector peaking around 2,500 reports, concentrated at 11:00. ([TOI](https://timesofindia.indiatimes.com/technology/tech-news/irctc-down-users-report-facing-issues-with-website-and-app/articleshow/117144803.cms), [ET](https://m.economictimes.indiatimes.com/industry/transportation/railways/irctc-reportedly-down-again-passengers-express-frustation/articleshow/117168454.cms)) |
| 31 Jan 2025 | Official | **SwaRail** super-app beta released by CRIS. ([ET](https://economictimes.indiatimes.com/magazines/panache/railway-travel-just-got-convenient-indian-railways-starts-beta-testing-swarail-app/articleshow/117884628.cms)) |
| **1 May 2025** | Rule change | **Waitlisted passengers barred from reserved coaches.** Penalty ₹250 sleeper / ₹440 AC plus fare. ([ET](https://m.economictimes.indiatimes.com/wealth/save/irctc-bans-waiting-list-passengers-from-sleeper-and-ac-travel-starting-may-1-2025/articleshow/120820413.cms)) |
| 13 May 2025 | Railway Board circular | Auto-upgradation restructured: explicit class ladders, max two levels, full-fare passengers only. ([ET](https://economictimes.indiatimes.com/industry/transportation/railways/will-your-waitlisted-ticket-get-an-automatic-upgrade-on-indian-railways/articleshow/121208730.cms)) |
| Jun 2025 → **28 Jun 2025** | Rule change | Waitlist cap set at 25% of capacity, then revised to **60% for AC / 30% for non-AC**. ([TOI](https://timesofindia.indiatimes.com/india/railways-caps-wait-list-tickets-at-25-of-trains-capacity/articleshow/121961262.cms), [The Hindu](https://www.thehindu.com/news/national/railway-ministry-enhances-passengers-waiting-list-cap-from-25-to-60-for-ac-classes/article69753884.ece)) |
| **29 Jun 2025** | PIB 2140614 | Next-gen PRS announced: **1.5 lakh bookings/min** (from 32,000), **40 lakh enquiries/min** (from 4 lakh), multilingual UI, and *"users will be able to submit their choice of seat"*. Target: **December 2025**. ([PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2140614)) |
| **1 Jul 2025** | Rule change | **Aadhaar authentication mandatory** for online Tatkal; agents barred from the first 30 minutes. ([Indian Express](https://indianexpress.com/article/india/from-july-no-tatkal-railway-ticket-booking-without-aadhaar-authentication-10060727/)) |
| **1 Jul 2025** | Official launch | **RailOne** launched by CRIS at its 40th Foundation Day — reserved + unreserved + platform ticketing, PNR, live status, Rail Madad, e-catering, single sign-on with Rail Connect/UTS credentials. ([The Hindu](https://www.thehindu.com/news/national/railone-app-launched-indian-railways-features-pnr-tatkal-booking-tickets/article69759415.ece)) |
| 2 Jul 2025 | News | RailOne launch friction: login failures, Android install-time "high risk" alerts, data-sharing warnings. ([Onmanorama](https://www.onmanorama.com/travel/travel-news/2025/07/02/railone-app-launched-railways-how-to-use.html)) |
| 10 Jul 2025 | Rule change | First reservation chart moved from ~4 hours to **at least 8 hours** before departure; 21:00 previous day for pre-14:00 departures. ([The Hindu](https://www.thehindu.com/news/national/reservation-chart-set-to-be-prepared-eight-hours-prior-to-departure-of-train/article69752125.ece)) |
| **15 Jul 2025** | Rule change | **Aadhaar OTP authentication compulsory** for Tatkal — website, app, PRS counters and agents. ([Financial Express](https://www.financialexpress.com/life/technology-aadhaar-verification-mandatory-on-irctc-for-tatkal-ticket-bookings-from-july-15-how-to-link-your-account-3914863/)) |
| **1 Oct 2025** | Rule change | Aadhaar authentication extended beyond Tatkal: required for the **first 15 minutes** of general reserved booking. ([Indian Express](https://indianexpress.com/article/india/irctc-aadhaar-mandatory-general-reserved-tickets-online-booking-october-1-10254423/)) |
| **17 Oct 2025** | News, multi-outlet | **Festive Tatkal collapse** (Dhanteras/Diwali/Chhath). Site and app failed as the window opened; server-capacity message shown. TOI later argued IRCTC was not "down" but overwhelmed. ([NDTV](https://www.ndtv.com/offbeat/irctc-website-down-amid-diwali-chhath-tatkal-rush-9471968), [CNBC-TV18](https://www.cnbctv18.com/travel/irctc-down-again-amidst-diwali-and-dhanteras-rush-19719451.htm), [TOI 19 Oct](https://timesofindia.indiatimes.com/technology/tech-news/irctc-not-down-this-is-why-thousands-of-users-were-not-able-to-book-tickets/articleshow/124621849.cms)) |
| Oct 2025 | Official, via news | **24.04 billion requests** hit the system that month; **17 billion identified as malicious bots and blocked — 70.7% non-human traffic**. ([Indian Express, 15 Feb 2026](https://indianexpress.com/article/cities/kolkata/war-for-your-tatkal-ticket-railways-blocks-17-billion-bot-attacks-10533450/)) |
| 28 Oct 2025 | Rule change | Aadhaar-only window on ARP opening day widened to **08:00–10:00**. ([Indian Express](https://indianexpress.com/article/india/indian-railways-new-booking-rules-irctc-aadhaar-mandatory-train-reservation-10351267/lite/)) |
| **1 Dec 2025** | Railway Board guidelines | Tatkal tickets issued only after validating a system-generated OTP, phased from train 12009/12010 network-wide. ([NDTV](https://www.ndtv.com/travel/indian-railways-introduces-otp-verification-for-tatkal-ticket-bookings-9729490)) |
| **3 Dec 2025** | Lok Sabha USQ 540 | Minister states IRCTC website uptime **99.98%** for Apr–Oct 2025, up from 99.86% in 2024-25; e-ticketing **>87%** of reserved tickets. ([sansad.in](https://sansad.in/getFile/loksabhaquestions/annex/186/AU540_ruNea3.pdf?source=pqals)) |
| 5 Dec 2025 | Rajya Sabha reply | Lower-berth quota restated: **6–7 per sleeper coach, 4–5 per 3AC, 3–4 per 2AC**, with automatic allotment to men 60+ and women 45+ even without a stated preference. ([PTI via ETInfra](https://infra.economictimes.indiatimes.com/news/railways/automatic-allotment-of-lower-berths-to-senior-citizens-45-plus-women-if-available-vaishnaw/125798874)) |
| **12 Dec 2025** | Railway Board circular | First chart advanced again: **≥10 hours** for departures 14:01–23:59 and 00:00–05:00; **by 20:00 the previous day** for 05:01–14:00. ([Indian Express](https://indianexpress.com/article/india/indian-railways-new-chart-timing-updates-waiting-list-rac-passengers-10426734/)) |
| **23 Dec 2025** | News, multi-outlet | Tatkal **error wave** with no official outage acknowledgement — degradation under load rather than a hard failure, three weeks after the 99.98% claim. ([Livemint](https://www.livemint.com/news/india/is-irctc-down-netizens-slam-railways-say-tatkal-booking-system-keeps-showing-error-message-11766467258586.html), [ET](https://m.economictimes.indiatimes.com/news/new-updates/irctc-down-tatkal-booking-users-complain-repeated-errors-and-login-issues-on-social-media/articleshow/126134642.cms)) |
| 29 Dec 2025 → **12 Jan 2026** | Rule change | Aadhaar-only ARP-opening-day window widened to 12:00, then 16:00, then progressively toward 00:00. ([ET](https://economictimes.com/wealth/save/irctc-train-tickets-aadhaar-authenticated-users-get-extended-booking-hours-for-general-reserved-tickets/articleshow/126226990.cms), [NDTV](https://www.ndtv.com/travel/train-ticket-booking-rules-changed-from-january-12-what-aadhaar-verified-travellers-should-know-10740033)) |
| 9 Jan 2026 | Railway Board circular | Vande Bharat Sleeper: **confirmed tickets only** — no RAC, no waitlist. ([Indian Express](https://indianexpress.com/article/business/no-rac-minimum-fare-equivalent-to-400-km-railway-board-notifies-the-fare-structure-of-vande-bharat-sleeper-trains-10467682/)) |
| **27 Jan 2026** | News, local, detailed | Seven months post-launch, **RailOne showing wrong platform numbers** at Bengaluru, Hubballi and Gadag — including platforms 4 and 5 at a 3-platform station. Updates lagging "at least 10 minutes". Passenger-committee reps say they rely on private apps. Also: payment failures and money debited without confirmation, "especially during Tatkal". ([TOI Hubballi](https://timesofindia.indiatimes.com/city/hubballi/railone-errors-derail-commuters-force-reliance-on-private-apps/articleshow/127642665.cms)) |
| Jul–Dec 2025 | Official, via news | More than **60 billion** suspicious bot requests blocked over six months. ([Indian Express](https://indianexpress.com/article/india/railways-cracks-down-on-fake-ids-3-crore-irctc-user-ids-deactivated-13k-suspicious-email-domains-blocked-10530417/)) |
| 13 Feb 2026 | Official, via news | **3.03 crore** suspicious user IDs deactivated, **6.05 crore** placed under revalidation, **13,343** fraudulent email domains blocked, 501 cybercrime complaints covering **4.18 lakh suspicious PNRs**. ([Indian Express](https://indianexpress.com/article/india/railways-cracks-down-on-fake-ids-3-crore-irctc-user-ids-deactivated-13k-suspicious-email-domains-blocked-10530417/), [TOI](https://timesofindia.indiatimes.com/india/irctc-flags-9-crore-user-accounts-expands-ai-monitoring-across-railway-kitchens/articleshow/131489338.cms)) |
| 22 Feb 2026 | First-person column | **RailOne password/mPIN lifecycle flaw**: password expiry with no advance warning; daily mPIN login means nobody remembers the password; reset depends on slow SMS-then-email OTP; 15–20 minutes lost. ([Navbharat Times](https://navbharattimes.indiatimes.com/tech/gadgets-news/railone-app-password-expire-password-reset-problems-train-ticket-booking-app-drawbacks/articleshow/128635167.cms)) |
| **1 Mar 2026** | Official | **UTS mobile app discontinued.** All services and R-Wallet balances migrated to RailOne. ([Indian Express](https://indianexpress.com/article/india/indian-railways-uts-app-to-discontinue-from-march-1-what-happens-to-your-r-wallet-balance-10556280/lite/)) |
| Mar–Apr 2026 | News, multi-outlet | **RailOne geo-fencing failure**: passengers buying unreserved tickets while already aboard moving trains. A Central Railway official: the geo-fencing "has failed entirely". Described as architectural, not a simple bug. ([NDTV](https://www.ndtv.com/travel/railone-glitch-sparks-chaos-regarding-ticketless-travel-and-mid-journey-booking-11342192), [Times Now](https://www.timesnownews.com/technology-science/railone-app-glitch-triggered-ticketless-travel-chaos-all-details-here-article-154065676)) |
| **24 Mar 2026** | Official announcement | **"Reform Express"**: cancellation refund bands moved from 48/12/4 hours to **72/24/8 hours** — zero refund inside 8 hours, 50% deduction in the 8–24 hour band. **TDR filing abolished; refund now automatic.** Counter tickets cancellable at any station. Boarding-station change extended to the final chart. Implemented in phases 1–15 April 2026. ([The Hindu](https://www.thehindu.com/news/national/no-refund-for-last-minute-ticket-cancellations-less-than-8-hours-railways-new-ticketing-reforms-for-passengers/article70783918.ece), [Indian Express](https://indianexpress.com/article/business/no-refund-for-ticket-cancellation-up-to-8-hrs-before-departure-railways-10599502/)) |
| **25 Mar 2026** | Lok Sabha USQ 5460 | Parliament asks why convenience, clerical and service charges are **levied and retained when a waitlisted ticket is auto-cancelled** by Railways. Reply: clerkage is levied on all waitlisted cancellations per the 2015 Rules; policy review is "continuous and ongoing". **No waiver.** ([sansad.in](https://sansad.in/getFile/loksabhaquestions/annex/187/AU5460_3sYubT.pdf?source=pqals)) |
| **15–17 Apr 2026** | News + official reply | **Tatkal crash with payment failures.** At the 11:00 non-AC window: continuous buffering, crashes, money debited without ticket issued, "Not Found" errors, inventory flipping to REGRET in 2–3 minutes. @IRCTCofficial replied on 17 Apr calling it a "temporary issue" and advising log-out / force-close / reinstall. ([NDTV](https://www.ndtv.com/travel/railways-tatkal-booking-crashes-users-report-failed-payments-11371724)) |
| **14 May 2026** | RTI data, via news | **3.39 crore passengers could not travel in FY 2025-26** on unconfirmed waitlists — ~92,877/day. Five-year trend: 1.65 cr (FY22) → 2.72 → 2.96 → 3.27 → **3.39 cr**. Sleeper worst affected, then 3AC. ([Business Today](https://www.businesstoday.in/india/story/tatkal-bots-overcrowding-why-crores-still-cant-get-confirmed-train-tickets-in-india-531475-2026-05-14)) |
| **4 Jun 2026** | Newspaper first-hand test | Reporter found Tatkal **non-functional on RailOne** at 11:00 for train 12624, while a private app showed TQWL 17 in 3AC at **11:03** — inside the 30-minute agent lockout. Rail enthusiast alleges normal Tatkal errors out while **Premium Tatkal** goes through cleanly. Railways figures quoted: ~14 lakh online bookings/day, **~4 lakh users logging in between 10:00 and 11:00**. ([New Indian Express](https://www.newindianexpress.com/india/2026/Jun/04/tatkal-booking-goes-haywire-despite-railways-app-reforms-5)) |
| **~11 Jun 2026** | Viral video + news | At MNIT Jaipur a student asks the Railway Minister to *"solve the problem of the IRCTC captcha."* Vaishnaw calls officials on the spot and orders a **new website within 30 days**. ([Indian Express](https://indianexpress.com/article/india/sir-please-fix-irctc-captcha-students-plea-prompts-ashwini-vaishnaw-to-promise-new-railway-ticketing-website-10735477/lite/), [Business Today](https://www.businesstoday.in/india/story/fed-up-with-captcha-ashwini-vaishnaw-announces-new-irctc-website-by-july-15-536395-2026-06-11)) |
| **15 Jul 2026** | Official launch | **Redesigned IRCTC e-ticketing website goes live in beta** at `irctc.co.in/eticket/`, from 21:00. First major redesign since 2002. Four official changes: no unnecessary CAPTCHAs/pop-ups/flashing graphics; **all-class availability on one screen**; fewer checkout steps; saved passenger details. ([Indian Express](https://indianexpress.com/article/india/irctc-new-website-beta-goes-live-today-how-to-access-indian-railways-train-ticket-booking-10788010/), [NewsOnAir](https://newsonair.gov.in/new-irctc-beta-website-launched-for-easier-ticket-booking/)) |
| **22 Jul 2026** | Lok Sabha | Six months to July 2026: average **15.38 billion requests, 8.88 billion of them bots — 58%**. ([TOI](https://timesofindia.indiatimes.com/india/58-of-irctc-booking-requests-were-automated-access-denied-railways/articleshow/132564519.cms)) |
| **23 Jul 2026** | Kerala High Court | Division Bench holds Aadhaar authentication for Tatkal **does not violate privacy**; dismisses the PIL, but suggests IRCTC consider **PAN as an alternative** and directs tighter verification. ([The Hindu](https://www.thehindu.com/news/national/kerala/aadhar-verification-for-tatkal-bookings-not-violative-of-privacy-rights-kerala-high-court/article71258558.ece)) |
| **1 Aug 2026** | Rule change, zonal | West Central Railway introduces a **numbered-token queue** for Tatkal at PRS counters (AC 08:30–09:00, non-AC 09:30–10:00). Online booking unchanged. ([Indian Express](https://indianexpress.com/article/india/west-central-railway-tatkal-ticket-booking-new-token-rules-august-1-10804267/)) |
| **6 Aug 2026** | PIB backgrounder | Official next-gen PRS feature list: 1.5 lakh bookings/min, 40 lakh enquiries/min, multilingual, cloud-enabled. **Seat selection is absent from this list.** Also: RailOne **AI waitlist-confirmation prediction improved from 53% to 94%**. ([PIB](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/aug/doc202686945401.pdf)) |
| **9 Aug 2026** | Official, quoted | **Phased train-by-train migration to next-gen PRS has begun.** Railway Board ADG(PR): *"Layer by layer matching of the new user friendly look & feel will involve a slow and steady load based testing as we migrate from the old to the new PRS."* Beta website confirmed as part of the transition. Measured beta effect: Tatkal bookings completed within 3 minutes up **>5%**; online share **89.84%**. ([NDTV](https://www.ndtv.com/travel/indian-railways-is-upgrading-its-reservation-system-to-handle-1-5-lakh-bookings-a-minute-11893054), [Indian Express](https://indianexpress.com/article/india/indian-railways-new-passenger-reservation-system-train-ticket-booking-10824829/)) |
| **13 Aug 2026** | Official, via news | RailOne: **4.76 crore downloads, ~10 lakh tickets/day.** Against ~14 lakh daily online reserved bookings, a major but not dominant channel. ([India TV](https://www.indiatv.in/tech/tech-news/irctc-new-railone-app-crossed-47-million-downloads-daily-10-lakh-ticket-booking-new-report-2026-08-13-1237053)) |
| **~14 Aug 2026** | Earnings disclosure | Q1 FY27 convenience fees **₹248 crore on 13.27 crore tickets ≈ ₹19/ticket**. UPI crossed half of bookings at **51.22%**. Internet ticketing revenue ₹361 crore; EBIT margin down to 80.33% from 84.12%. CMD: UPI "is digging into your profits." ([NDTV Profit](https://www.ndtvprofit.com/india/irctc-q1-numbers-breakdown-what-free-upi-actually-costs-11916191)) |
| **21–23 Aug 2026** | Official, quoted | **NGeT infrastructure refresh**: servers, storage, networking, software; ~**₹150 crore** via PRS modernisation; capacity from ~**37,000 tickets/min** toward "**more than 1 lakh**". **Active-active disaster recovery** planned, "most probably at Secunderabad" — *"1 minute or 2 minute… become the golden hour for us."* IRCTC discloses **Akamai** for bot mitigation; agent inactivity timeout raised 15 → 30 minutes. Full version of the redesigned site "very soon". ([Indian Express](https://indianexpress.com/article/india/irctc-upgrade-nget-ticket-booking-system-reduce-website-disruptions-peak-hours-tatkal-timings-10846197/), [ET](https://economictimes.indiatimes.com/industry/transportation/railways/railway-passengers-smoother-ticket-booking-is-coming-irctc-to-boost-capacity-from-37000-to-over-1-lakh-per-minute/articleshow/133531367.cms)) |
| **26 Aug 2026** | Consumer survey | 90,000+ responses across 324 districts: **70% of IRCTC users report "forced action", 46% nagging, 45% basket sneaking** — six dark patterns flagged. Directly relevant to the beta's claim of removing ads and pop-ups. ([Business Standard](https://www.business-standard.com/india-news/70-irctc-users-report-forced-action-survey-flags-six-dark-patterns-126082600563_1.html)) |

---

## Consolidated issue list and current status

### 1. Peak-window capacity ceiling — the Tatkal race is still lost by the system

**Impact.** At 10:00 and 11:00 the site or app becomes unusable, errors out, buffers, or returns REGRET within two to three minutes. Users describe the pattern as failing precisely in the opening minutes and recovering afterwards, when the inventory is gone.

**Evidence.** Verified failures on **17 Oct 2025**, **23 Dec 2025**, **15–17 Apr 2026** and **4 Jun 2026** (the last being a journalist's own first-hand test on RailOne). Background pattern of three December 2024 outages and a January 2025 outage. The structural number: **~4 lakh users log in between 10:00 and 11:00** against a system doing ~32,000–37,000 bookings per minute.

**Official response.** Real and substantial: ₹150 crore NGeT infra refresh, active-active DR at Secunderabad, Akamai bot mitigation, phased next-gen PRS migration from August 2026 targeting 1.5 lakh bookings/min. IRCTC also publishes a measured beta improvement — Tatkal completions within 3 minutes up over 5%.

**Note the disputed numbers.** Current throughput is published as both **32,000/min** (NDTV, ET) and **~37,000/min** (IRCTC); the target as both **">1 lakh"** (IRCTC) and **"1.5 lakh"** (PIB/NDTV). Cite the range, attribute it, do not silently pick one.

**Status: Observed unresolved, actively under repair.** The most recent failure in the public record is June 2026. No independent peak-window measurement of the beta or the new PRS exists.

---

### 2. CAPTCHA, pop-ups, ads and dark patterns

**Impact.** During Tatkal, users could not decode a hard CAPTCHA, or waited for one that never loaded, and by the time it resolved the inventory was gone. Ads and non-core promotions competed with the booking task.

**Evidence.** This is the one theme with a documented political origin: a student's question at MNIT Jaipur in June 2026 produced a ministerial 30-day order for a new website. The official launch framing is itself an admission — the fix is described as removing "unnecessary captchas, pop-ups, flashing graphics, or other distracting elements", and IRCTC's own words on the beta are that it "doesn't have any advertisements, no captcha, no pop-ups." That confirms the production site carried all three.

**Counter-evidence, dated after the beta.** The **26 August 2026** consumer survey of 90,000+ respondents found **70% reporting forced action, 46% nagging, 45% basket sneaking**. Dark patterns are a distinct problem from CAPTCHA and are not addressed by the four beta changes.

**Status: Addressed on the beta web surface; dark patterns newly documented and unresolved.** Mobile advertising and logged-in flows were not re-tested.

---

### 3. Payment debited, ticket not issued, status ambiguous

**Impact.** The single most persistent transactional failure. Money leaves the account, no ticket exists, and the status reads "initiated" or "not received" with no reconciliation path the user can follow.

**Evidence.** Explicit in the April 2026 Tatkal incident. Independently corroborated by the South Western Railway Passengers Committee general secretary, who told TOI that RailOne bookings fail with "payment failed/processing" or money is deducted without confirmation, **"especially during Tatkal booking"**, and that tickets sometimes book but show conflicting or delayed status. An agent in Malappuram reported RailOne loading for ~5 minutes after payment completes.

**Official position.** IRCTC's refund rules PDF states that where an amount is debited and no ticket is issued, IRCTC refunds the fare and its convenience fee electronically — but **bank and card transaction charges "are likely to be forfeited."** iPAY AutoPay is the genuine product answer: a lien or one-time mandate that is captured only on successful booking, releasing the hold on failure. It exists but is one payment option among many rather than the default experience.

**The gap is legibility, not policy.** There is no customer-facing state machine showing gateway state, bank reference/UTR, ticket outcome, expected release date, exception reason and escalation owner. Users are handed between portal, gateway and bank with no shared state.

**Status: Observed unresolved.** Similar reports appear in 2026 evidence. This is the highest-leverage fixable item in this document — it needs no policy change.

---

### 4. Refunds — automatic TDR is a genuine win, but the windows tightened and clerkage stayed

Three separate things happened here and they pull in opposite directions.

**Resolved.** Under Reform Express (24 Mar 2026), **the requirement to file a TDR was eliminated — TDR is now granted automatically**, and counter tickets became cancellable at any station. This removes a real, long-standing friction. **Status: Officially resolved.**

**Regressed.** The same package tightened cancellation bands from 48/12/4 hours to **72/24/8 hours**: zero refund if a confirmed ticket is cancelled inside 8 hours, 50% deducted in the 8–24 hour band. The stated rationale is alignment with earlier charting and curbing hoarding. Economic Times called it plainly a setback for passengers. **Status: Newly created.**

**Unresolved.** Clerkage of ₹60 is still deducted when **Railways itself auto-cancels** an unconfirmed waitlisted ticket, and the convenience fee is not refunded. Parliament asked about exactly this on 25 March 2026 — why charges are levied and retained when the passenger is not at fault and no service was rendered. The reply confirmed clerkage applies and that review is "continuous and ongoing". A waiver had been under consideration in July 2025 and has not arrived. **Status: Observed unresolved, confirmed in the legislative record.**

**Also unresolved: refund visibility.** Official guidance gives timelines (4–7 working days for automatic refunds on cancelled trains) but exposes no bank-confirmed tracker. An App Store review on the RailOne listing describes multiple unanswered refund emails, no response through in-app support and an unattended support line.

---

### 5. Aadhaar and OTP verification consuming the booking window

**Impact.** Verification is mandatory and it happens *inside* the race. Users report OTP delay, lockout, verification failure and logout at the moment inventory is disappearing.

**Evidence.** Concretely documented in the RailOne first-person account: OTP slow by SMS, then also by email, app glitching mid-flow, 15–20 minutes lost — time that is fatal in a Tatkal window. Pre-launch coverage of the July 2026 site listed delayed OTP delivery alongside crashes and CAPTCHA failure as the standing complaint set.

**The rules have expanded, not contracted.** Aadhaar for Tatkal (1 Jul 2025) → Aadhaar OTP across all channels (15 Jul 2025) → Aadhaar for the first 15 minutes of general booking (1 Oct 2025) → an Aadhaar-only window on ARP opening day widened progressively to **16 hours by 12 January 2026**. The Kerala High Court upheld the regime on 23 July 2026 while suggesting PAN as an alternative.

**Fairness questioned.** The June 2026 TNIE test found a private app holding TQWL inventory at 11:03, inside the 30-minute agent lockout. A rail enthusiast alleges normal Tatkal errors out while Premium Tatkal — at up to roughly triple the fare — goes through cleanly, raising a funnelling suspicion. *Single-source, and an allegation rather than a finding.*

**Status: Partially addressed and structurally unresolved.** Biometric/PIN login, Aadhaar linking and saved passengers reduce friction. None of it moves verification out of the critical window. This is the design problem no third party can solve better than IRCTC, because only IRCTC can pre-establish a verified session before the window opens.

---

### 6. Waitlist opacity and the scale of unmet demand

**Impact.** A passenger books, waits weeks, and is auto-cancelled hours before travel with a partial refund and no alternative.

**Evidence — the headline number of this entire document.** **3.39 crore passengers could not travel in FY 2025-26** on unconfirmed waitlists, ~92,877 per day. Rising every year for five years (1.65 cr in FY22). Sleeper worst affected, then 3AC. Same reporting documents that advance booking "now feels like Tatkal" and describes mixed-PNR loopholes letting multiple waitlisted passengers travel against one confirmed berth. *Sourced to RTI data as reported; the primary RTI response was not located, so the series should be attributed to the reporting.*

**What has been done.** Waitlist caps raised to 60% AC / 30% non-AC (June 2025). Charts moved earlier, twice, explicitly to remove uncertainty for passengers travelling from remote locations. RailOne now shows an AI confirmation prediction with officially-claimed accuracy up from 53% to 94%. Vande Bharat Sleeper issues confirmed tickets only.

**What has not.** Earlier certainty is not more capacity. VIKALP remains passive and late — only fully-waitlisted-after-charting passengers are considered, allocation is not guaranteed, stations may shift to cluster stations, and the user must re-check the PNR after the alternate train's chart. Nothing surfaces alternatives *at search time*, when the passenger still has agency.

**Status: Partially addressed; the underlying scarcity is unresolved and worsening.**

---

### 7. Terminology and consequence opacity — WL, RAC, PQWL, TQWL

**Impact.** First-time and infrequent travellers cannot tell what they are buying. The codes carry radically different confirmation odds and radically different consequences, and nothing at the point of decision explains them.

**Why it now matters more.** Since **1 May 2025**, a fully waitlisted passenger **may not board a reserved coach** — penalty ₹250 sleeper / ₹440 AC plus fare, and offloading at the next station. A code the user does not understand now determines whether they can legally travel. RAC holders can board and get a seat; WL holders cannot. That distinction has to be legible before payment, not after.

**Structural facts worth surfacing.** GNWL clears best; TQWL does not get priority at charting and clears worst; RLWL depends on cancellations to that specific destination and is charted separately by the remote location, typically 2–3 hours before the train reaches it; PQWL draws on one small pool shared across many small stations. RAC is officially not a quota at all but "a special provision to 'split' a berth into two or more seats."

**Status: Partially addressed.** All-class availability in one view is a good base. Contextual plain-language explanation of consequences remains absent.

---

### 8. No berth choice, and no explanation of the allocation

**Impact.** A solo traveller repeatedly gets middle or upper berths and reads it as arbitrary or punitive. A family gets split. An 82-year-old woman gets an upper berth while others appear vacant — a case IRCTC had to answer publicly in February 2026.

**What is actually true.** Allocation is first-come-first-served with preferences honoured only "subject to availability". The only optimisation objectives Railways has ever named are **party compaction** and **age/gender-sensitive placement**. Lower berths are structurally scarce — 18 of 72 berths in a sleeper coach, of which 6–7 are quota-locked — and automatic lower-berth allotment diverts remaining ones to men 60+ and women 45+ even when no preference is stated. So the observed outcome is fully explained by documented mechanisms. It has never been explained *to the user*.

**Seat selection status: announced, not shipped.** PIB (29 Jun 2025) says users "will be able to submit their choice of seat" — a preference payload, not an airline seat map; the airline framing is press interpretation. The original December 2025 target slipped. Seat selection is **absent from the Ministry's four-point beta feature list** and **absent from the PIB August 2026 next-gen PRS feature list**, though several outlets reported it as a beta feature. `important_things.md` in this workspace expected it by end-2025; it has not arrived.

**Status: Inconclusive on delivery; unresolved as a transparency problem.** Nothing prevents explaining the allocation today.

---

### 9. Three official front doors, no canonical channel

**Impact.** A citizen must choose between the IRCTC website, IRCTC Rail Connect and RailOne, with different fees, different reliability and overlapping functions. During the October 2025 outage, one outlet's advice was to use RailOne because IRCTC was down — three official channels to one backend.

**Evidence.** The genre is the evidence: through 2026, Indian outlets kept publishing "RailOne vs IRCTC — which should you use / should you delete IRCTC?" explainers, in Hindi and English, from February through August 2026. A deal forum claims RailOne's convenience fee is lower and UPI is free there. *Single-source, forum, unverified — but a fee differential between official channels for the same inventory would itself be a defect.*

**Status: Newly created (2025–26).** UTS retirement on 1 March 2026 consolidated one channel; the reserved-ticketing overlap remains.

---

### 10. RailOne data quality and the geo-fencing failure

**Impact.** Two distinct problems, both from the app now positioned as the primary channel.

**Stale and wrong journey data.** Seven months after launch, RailOne was showing wrong platform numbers at Bengaluru, Hubballi and Gadag — including platforms 4 and 5 at a station with three. One passenger ran ~1.5 km at Hubballi after trusting RailOne's platform 1 over a private app's platform 6. Updates lag "at least by 10 minutes". Passenger-committee representatives report relying on private apps for accuracy, and that RailOne slows badly when filing a Rail Madad grievance. *Single detailed local report with multiple named passenger-body sources — strong for its region, not nationally generalisable.*

**Geo-fencing collapse.** From March 2026, passengers could buy unreserved tickets while already aboard moving trains, defeating the control meant to confine purchase to station premises. Central Railway officials found mid-ride bookings during checks; one said it "reopens a loophole we had earlier attempted to plug." The stated cause is architectural — the signal ranges used cannot be confined to station premises.

**Status: Observed unresolved.** The same reporting also records real positives: consolidation of UTS/NTES/IRCTC functions and removal of the 5 km fencing and 20 km coverage limits.

---

### 11. Accessibility — under-documented, and at least one confirmed regression

**Impact.** A blind user on iPhone 17 reports that a RailOne update **broke VoiceOver**: waitlist, REGRET and availability states are not announced, ticket sharing is not announced, and the app crashes. The review explicitly states the app *was* accessible before the update.

**A second, distinct gap.** A passenger with a disability can apply their own concession but **cannot add family members to the same booking**, forcing separate bookings and either loss of concession or full-fare charges — described as a regression from earlier app versions.

**Context.** GIGW 3.0 is mandatory for Indian government digital services, WCAG 2.1 AA-aligned and STQC-certified under MeitY. Against that, **no formal 2025–26 accessibility audit, WCAG assessment or news investigation into IRCTC/RailOne accessibility was found.**

**Status: Regressed (app), and otherwise under-documented rather than fine.** Full validation would require manual testing with assistive technologies and expert accessibility review.

---

### 12. Login, session and credential-lifecycle instability

**Impact.** Random logout after entering passenger details; "Unable to process request" while 100+ seats show available; a Face ID loop where the launch location-permission prompt collides with the Face ID callback; password expiry with no advance warning combined with daily mPIN login, so the underlying password is forgotten and reset depends on slow OTP delivery.

**Evidence.** App Store reviews fetched 27 August 2026 on a listing showing 4.7/5 from 252k ratings, plus the February 2026 first-person column. Individually unverifiable; thematically consistent and mechanically specific enough to be credible as design defects.

**Side-effect of the fraud crackdown worth naming.** **6.05 crore user IDs placed under revalidation** is itself a friction event for legitimate users, and IRCTC's own stability narrative partly attributes uptime to deactivating suspicious IDs.

**Status: Observed unresolved.**

---

### 13. Support and escalation feel non-actionable

**Impact.** Users describe limited practical help for payment and refund problems specifically — the cases where the user cannot self-serve.

**Evidence.** Unanswered refund emails, no in-app support response, unattended support line (RailOne App Store review). Rail Madad complaint submission described as dysfunctional in-app with a restrictive character limit, and RailOne slowing badly during grievance filing (TOI Hubballi, Jan 2026).

**What exists.** eQuery with categories and status check, helpline 14646, international numbers, support in twelve languages, and Rail Madad integrated into RailOne. A Lok Sabha reply of 11 March 2026 puts complaints against tickets booked at **0.0009%** — a genuine counterpoint, though it measures registered complaints rather than failed attempts.

**The gap.** Support is not transaction-aware. A failed payment does not carry its own context into a grievance, and there is no visible resolution owner, next action or deadline.

**Status: Partially addressed.**

---

### 14. Mobile crash, slowness and station search

**Impact.** Crashes, slow loading, no station suggestions in From/To fields, peak-hour buffering.

**Evidence.** Older device-specific iOS reports (2024–25) plus the April 2026 buffering reports and the Face ID loop. Not cross-platform tested in this audit.

**Status: Inconclusive.** Device-specific, and the app has shipped multiple versions since.

---

### 15. Foreign and NRI onboarding

**Impact.** Uneven reported experience with registration, mobile verification, cards and quota access, though peers dispute that the path is universally blocked.

**What is official.** IRCTC terms expressly permit Foreign User registration and Foreign Tourist quota booking. The FT quota is bookable up to **365 days** ahead across EC, 1A, 2A, 3A, CC, SL and 2S, and requires a verified international mobile number. Berths are allotted at booking within the current ARP; beyond it, at ARP opening.

**Status: Partially addressed.** An official route exists and is documented. The country/card/OTP experience remains unverified and the forum evidence is mixed, which is itself a sign of preventable uncertainty.

---

### 16. AskDISHA transparency and confirmation-only behaviour

**Impact.** Two historical allegations: that the chatbot did not honour a Tatkal confirmation-only preference, and that it promoted a quick Tatkal route with an extra ₹11 charge and then used regular booking instead.

**Current state.** AskDISHA 2.0 (built with CoRover.AI) is an official assistant supporting conversational booking, cancellation, PNR status, refund status, boarding-station change and booking history, by text or voice, in English, Hindi, Hinglish and Gujarati, with voice-command payment added in early 2025. No official price or disclosure page was located for the cited bot flow, and no chatbot booking was executed in this audit.

**Status: Inconclusive.** Both reports are old and single-source. Both are cheap to mitigate with an explicit pre-commitment confirmation screen.

---

### 17. Fraud and bots — the arms race, and what it costs legitimate users

**Not a user complaint, but essential context.** Verified official figures: 24.04 billion requests in October 2025 with 17 billion blocked as malicious bots (**70.7% non-human**); more than 60 billion suspicious requests blocked July–December 2025; **58%** bot share in the six months to July 2026; 3.03 crore IDs deactivated; 6.05 crore under revalidation; 13,343 fraudulent email domains blocked; 501 cybercrime complaints covering 4.18 lakh suspicious PNRs. IRCTC uses Akamai for bot mitigation and CDN offload.

Separately, IRCTC acted against **14 unauthorised e-catering operators** misusing its brand (legal notice 18 Feb 2026; criminal complaints 16 Mar and 11 Apr 2026), citing FSSAI bypass and fraud risk.

**Two important negatives — do not assert these.** The fake `irctcconnect.apk` phishing advisories date to **2023**, not 2025–26; no fresh advisory was found. And **no IRCTC data breach or leak in 2025 or 2026 was found.** The only data-related concern is the July 2025 RailOne launch-day data-safety warning.

**Status: Actively managed, with a real user-side cost** in revalidation friction and false positives.

---

## What has most clearly improved

The July 2026 beta is not a visual refresh. Its four stated changes map one-to-one onto the longest-standing complaints: unnecessary CAPTCHA and pop-ups removed, all-class availability on one screen, fewer checkout steps, saved passengers. IRCTC has also published a measured effect — Tatkal completions within three minutes up over 5% comparing the two halves of July 2026 — which is more than most redesigns offer.

Reform Express delivered two unambiguous wins: **automatic TDR** and **boarding-station change until the final chart**. Earlier charting, twice advanced, genuinely reduces the window of waitlist anxiety. Waitlist caps at 60% AC / 30% non-AC replaced fixed caps set in 2013. RailOne consolidated UTS, NTES, IRCTC and Rail Madad functions behind single sign-on and retired the UTS app cleanly, migrating R-Wallet balances. Vande Bharat Sleeper issues confirmed tickets only, and Vande Bharat vacant seats are now bookable to fifteen minutes before departure.

On the engineering side, the commitments are specific rather than rhetorical: ₹150 crore into NGeT infrastructure, an active-active disaster recovery site, a named CDN and bot-mitigation vendor, and a phased train-by-train PRS migration with load-based testing instead of a big-bang cutover.

---

## What still needs verification or product work

**Transactional integrity remains the top risk.** Even where a bank or network dependency contributes, the customer experiences one journey: money left, the ticket is missing, the status is ambiguous. The remedy indicated by the evidence is an observable, bank-referenced reconciliation flow — not better explanations of why delays happen. iPAY AutoPay already holds funds and captures only on success; making that the default rather than an option would remove most of the failure class.

**The beta needs a defined Tatkal reliability test before anyone claims resolution.** Login, station suggestion, verification, quota selection, all-class view, payment handoff, issuance, cancellation and refund visibility — at peak time, across web and app. The public record has historical outages and April/June 2026 failures, and IRCTC's own 3-minute-completion metric, but no independent peak-window measurement. Notably, **no post-launch user-reaction coverage of the beta exists at all** — no bug reports, no complaint cycle, no review round-up. That is a gap in the record, not evidence of success.

**Security burden needs separating from user burden.** Aadhaar, OTP and anti-bot controls may be necessary; the reported pain is their timing, transparency and failure recovery. Pre-validation before the window, visible delivery status, bounded retry that preserves form state, and a safe fallback would stop valid users losing time-sensitive bookings to an unresolved verification state. The Kerala High Court's suggestion that PAN be considered as an alternative is an open policy thread.

**Scarcity needs a product answer, not just a faster queue.** With 3.39 crore passengers left behind in FY26 and the number rising, the honest framing is that most users in a peak window will not get a confirmed berth on their first-choice train. A system that tells them that early, and shows them what else genuinely works, serves them better than one that lets them queue and lose.

---

## Prioritised enhancement backlog

| Priority | Enhancement | Rationale in the evidence |
|---|---|---|
| **P0** | **Customer-facing payment and refund state machine.** One order, one timeline: gateway state, bank reference/UTR, issuance outcome, expected refund date, exception reason, escalation owner. Make iPAY AutoPay the default so funds are held, not debited, until issuance succeeds. | The most persistent 2026 complaint. Official guidance explains timing but exposes no end-to-end visibility. Needs no policy change. |
| **P0** | **Move verification out of the booking race.** Pre-window Aadhaar/OTP session establishment, live OTP delivery status, bounded retry preserving form state, a visible "verified and ready" state before 10:00/11:00. | OTP delay, logout and lockout are documented at exactly the moment inventory disappears. Works with the Jan 2026 rules rather than against them. Only IRCTC can do this. |
| **P0** | **Publish peak-window resilience metrics and add an honest queue state** that preserves user input rather than erroring out. | Four verified Tatkal failures across Oct 2025 – Jun 2026 against a claimed 99.98% uptime. The credibility gap is as damaging as the downtime. |
| **P1** | **Decision support under scarcity, surfaced at search time.** Alternate boarding/destination stations, same-train multi-leg segments, nearby stations and VIKALP-equivalent options in the same ranked result set — each with fare delta versus direct, and explicit disclosure of what is being purchased. | 3.39 crore passengers left behind annually. VIKALP solves this passively and too late. Third parties solve it at search time and win users for it. |
| **P1** | **Evidence-based confirmation guidance instead of a bare percentage.** "WL 22 in 3A: in the last 10 departures, waitlist cleared to 34, 31, 40, 28." Plus a best-chance-of-confirmation calendar across nearby dates. | A percentage from IRCTC becomes a quasi-official forecast subject to grievance escalation. Historical fact is defensible; a prediction is not. |
| **P1** | **Plain-language status vocabulary at the point of decision.** WL / RAC / PQWL / TQWL / CNF explained inline with consequences — including that a fully waitlisted passenger may not board a reserved coach and faces a ₹250/₹440 penalty. Never colour-only. | Documented comprehension failure, now with a legal and financial consequence attached since May 2025. Doubles as an accessibility fix. |
| **P1** | **Explain the berth allocation, and add review-and-override on top of it.** Show why a berth was assigned (quota, auto-lower-berth eligibility, party compaction), then let the traveller review an annotated coach map and change within permitted bounds, free. | Allocation is defensible but never explained. The Amtrak pattern — algorithm assigns, user may override at no fee — preserves compaction and equity while giving agency. Seat selection has been announced since June 2025 and has not shipped. |
| **P1** | **Transaction-aware support.** Pre-fill the grievance from the failed transaction; show owner, next action and deadline. | eQuery and Rail Madad exist; user feedback says support cannot act on payment and refund cases. |
| **P1** | **Fix the accessibility regression and close the concession gap.** Restore screen-reader announcement of WL/REGRET/availability states; allow a Divyangjan concession holder to include family on one booking. | A confirmed VoiceOver regression and a confirmed concession-booking defect, against a mandatory GIGW 3.0 obligation. |
| **P2** | **Remove dark patterns and state a single canonical channel.** Address forced action, nagging and basket sneaking; publish which front door is authoritative and equalise fees across official channels. | 70% forced-action reporting in an August 2026 survey; a year of "RailOne vs IRCTC" explainers is evidence of channel confusion. |
| **P2** | **Offline journey mode.** Ticket, coach position, platform, boarding point and destination alarm available with no connectivity. | 78% of India's internet users are mobile-exclusive; connectivity exists when booking and often not when travelling. Also mitigates RailOne's stale-platform-data problem by being honest about data age. |
| **P2** | **Dedicated foreign/NRI path** with card, mobile, quota, registration-fee and waitlist guidance in one place. | An official route exists; the mixed forum evidence indicates preventable uncertainty. |
| **P2** | **AskDISHA pre-commitment confirmation** stating any incremental charge, confirmation-only fallback, and the next step before charging. | Both chatbot concerns are old and single-source, but cheap to mitigate with auditable disclosure. |
| **Policy thread** | **Waive clerkage and convenience fee when Railways auto-cancels an unconfirmed waitlisted ticket.** | Raised in Lok Sabha on 25 March 2026 and declined. Not a product decision, but the fairness case is on the record. |

---

## Limitations

This report uses a **diverse, dated public-web sample**, weighted toward primary records. It does not claim to be exhaustive.

Platform reviews can be device-, bank-, network-, version- or account-specific. Local reporting is strong for its region and does not generalise nationally. News establishes that particular disruptions were reported; it does not substitute for IRCTC incident data. RTI figures reported second-hand are attributed to the reporting, not to a primary response this audit read.

Specific evidence gaps, stated so they are not filled by inference:

- **No confirmed outage event in July or August 2026** was found. Uptime trackers show normal operation; August coverage is forward-looking.
- **No post-launch user-reaction coverage of the July 2026 beta** was found in any form.
- **No formal accessibility audit** of IRCTC or RailOne exists in the public record for 2025–26.
- **No published booking-abandonment funnel** for IRCTC exists. Any specific abandonment percentage is invented.
- **No audited payment success-rate comparison** between IRCTC and third-party channels exists.
- **No IRCTC data breach in 2025–26** was found, and **no 2025–26 fake-app advisory** was found.
- Reddit and Quora were not usable as dated evidence here — Reddit did not surface reliably through the tooling used, and Quora timestamps are unreliable. User voice in this document comes from App Store reviews fetched 27 August 2026 and from social posts quoted and dated inside news articles.

Contested figures to attribute rather than assert: current PRS throughput (32,000 vs ~37,000 per minute); the target (>1 lakh vs 1.5 lakh per minute); whether the beta actually ships seat selection, a fare calendar and multilingual support, all of which are reported but absent from the Ministry's own four-point list; whether the December 2025 ten-hour charting rule applies uniformly or only to the specified departure bands; and the exact number of earmarked lower berths per coach, which varies by rake composition.

A stronger operational assessment would need what only IRCTC and CRIS hold: anonymised incident logs, payment failure and reconciliation data, status-page history, customer-care resolution SLAs, synthetic Tatkal monitoring, and usability studies across assistive technologies, low-end devices, international users and both mobile platforms.
