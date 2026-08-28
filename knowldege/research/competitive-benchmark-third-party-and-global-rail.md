# Competitive Benchmark: Third-Party Indian Rail Apps & Global Rail/Airline Booking

**Research date:** 27 August 2026
**Purpose:** Feature design input for a redesigned IRCTC proof of concept.
**Evidence discipline:** Each claim is tagged **[Verified]** (official docs, regulator/government statements, company filings, or reputable dated press), **[Vendor claim]** (marketing/product copy or company statement, unaudited), or **[Weak]** (single secondary source, portfolio piece, or forum). Content from sources was paraphrased for compliance with licensing restrictions.

---

## 0. The single most important framing fact

Third-party apps are **not** competing with IRCTC on inventory. Every one of them books through IRCTC's own e-ticketing stack as an authorised partner, on the same PRS inventory, at the same government fare. They compete purely on **decision support, journey construction, and post-booking care** — the layers IRCTC historically left empty.

- ixigo describes itself as an IRCTC-authorised platform and books using the user's own IRCTC credentials. **[Verified — vendor's own product page, corroborated by IRCTC's partner policy]** ([ixigo trains](https://www.ixigo.com/trains))
- RailYatri and Paytm carry the same "IRCTC Authorised Partner" designation. **[Verified]** ([RailYatri App Store](https://apps.apple.com/qa/app/train-ticket-app-railyatri/id1052177547), [ETTravelWorld on Paytm](http://travel.economictimes.indiatimes.com/news/railways/irctc-becomes-the-authorised-partner-of-paytm-to-simplify-train-travel/96969003))
- ConfirmTkt lets users book with existing IRCTC login credentials or create a new IRCTC ID inside the app. **[Verified]** ([ConfirmTkt](https://www.confirmtkt.com/))

**Design implication:** almost every feature below is *legally and technically available to IRCTC itself*, and IRCTC has strictly better data access than the partners do. The gap is product, not permission. The important exceptions are flagged in §4.

---

# A. Indian third-party rail apps

## A1. Market position (what the redesign is up against)

| Fact | Value | Confidence |
|---|---|---|
| Share of reserved tickets booked online (Jun 2025–Jun 2026) | 89% online, 11% counter; 65.08 crore reserved tickets total, 57.90 crore online | **[Verified]** ([Indian Express](https://indianexpress.com/article/india/indian-railways-89-percent-train-tickets-booked-online-counter-sales-drop-11-percent-10798199/), [Indian Express / PRS](https://indianexpress.com/article/india/irctc-upgrade-nget-ticket-booking-system-reduce-website-disruptions-peak-hours-tatkal-timings-10846197/)) |
| ixigo share of India's online train ticketing | ~60% (estimated) | **[Weak–Verified]** — an analyst/press estimate repeated in two outlets, not an audited figure ([Business Today](https://www.businesstoday.in/latest/corporate/story/cleartrip-to-challenge-ixigo-makemytrip-to-foray-into-train-bookings-527551-2026-04-27), [Economic Times](https://economictimes.indiatimes.com/wealth/invest/these-3-indian-travel-stocks-just-got-a-buy-call-heres-why-analysts-are-betting-big/slideshow/133452164.cms)) |
| ixigo monthly active users | ~85 million, skewed to smaller towns | **[Weak]** — analyst note, not a filing ([Economic Times](https://economictimes.indiatimes.com/wealth/invest/these-3-indian-travel-stocks-just-got-a-buy-call-heres-why-analysts-are-betting-big/slideshow/133452164.cms)) |
| ixigo user base from tier-II cities and beyond | 94% | **[Vendor claim]** reported in press ([Indian Express](https://indianexpress.com/article/smart-stocks/ixigo-india-overlooked-travel-giant-9965684/)) |
| ixigo FY26 revenue / GTV | ₹1,228 cr revenue (+34% YoY); GTV ₹18,692.7 cr (+25%) | **[Verified — company results]** ([ETTravelWorld](https://travel.economictimes.indiatimes.com/news/research-and-statistics/ixigo-reports-record-q4-fy26-pat-at-inr-321-crore-surges-91-year-on-year/131262309), [Quartr summary](https://quartr.com/events/le-travenues-technology-limited-ixigo-q4-25-26_FPBrYAPo)) |
| ixigo trains segment, Q1 FY27 | ₹141.04 cr revenue, +9% YoY — the slowest of its segments | **[Verified — earnings call]** ([Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/le-travenues-technology-ltd-nse-030534628.html)) |
| Reason for trains slowdown | Company attributes FY26 trains softness to "regulatory headwinds" (Aadhaar authentication rules — see §4) | **[Verified — earnings commentary]** ([StockAnalysis transcript summary](https://stockanalysis.com/quote/nse/IXIGO/transcripts/)) |

Notably, distribution is now spreading beyond dedicated travel apps: Uber has begun distributing train tickets through ixigo, and ixigo surfaces IRCTC-curated tour packages in-app. **[Verified]** ([Skift](https://skift.com/2026/08/25/ixigo-tests-packaged-tours-for-trains-uber-becomes-a-new-distribution-engine/))

## A2. Waitlist confirmation prediction — how it actually works

**The mechanism (as publicly described):**

The models are historical-trend classifiers over per-train, per-class, per-date booking and cancellation curves. Publicly described inputs include historical booking patterns for the specific train/route/class, cancellation behaviour, quota type, day-of-week, and seasonality. **[Vendor claim, consistently described across sources]** ([TheTraveler](https://www.thetraveler.org/how-confirmtkt-uses-ai-to-tackle-train-seat-scarcity/), [ConfirmTkt trends explainer](https://tossthecoin.tcl.com/blog/confirmtkt-trends-why-predictions-arent))

ConfirmTkt's earliest public description was a per-train "confirmation threshold" model that self-corrects as outcomes arrive — i.e. an online-learning loop, not a static table. **[Verified — contemporaneous 2014 reporting]** ([Inc42](https://inc42.com/startups/confirmtkt-analyzes-past-ticketing-trends-predicts-ones-ticket-confirmation-chances/))

**Accuracy claims, chronologically:**

| Claim | Source & date | Confidence |
|---|---|---|
| Tested on ~2 lakh tickets with a 75% success rate pre-launch | [Times of India, 2015](https://timesofindia.indiatimes.com/city/goa/An-app-to-tell-your-train-ticket-status/articleshow/49200275.cms) | **[Verified as a reported claim]** — company-supplied number |
| Launch accuracy 78%, then ML added so wrong predictions feed back into the model | [NDTV Gadgets, 2015](https://gadgets.ndtv.com/apps/features/need-a-confirmed-train-ticket-this-startups-nifty-hack-can-help-741504) | **[Vendor claim]** |
| Trainman: "more than 90% of predictions are correct" | [BW Disrupt](https://www.bwdisrupt.com/article/trainman-an-online-platform-making-indian-railways-services-easier-and-disruptive-103992) | **[Vendor claim]** — no methodology, no definition of "correct" |

**Critical gap:** no vendor publishes a methodology, a calibration curve, or an independently audited accuracy figure. "90% accurate" is meaningless without stating whether it means *calibration* (of tickets shown 60%, ~60% confirmed) or *classification* (correctly predicted confirm/not-confirm), and over what base rate. Since most WL tickets on most trains do confirm, a naive "always predict confirm" baseline already scores high. **Treat all accuracy percentages as marketing.**

Prediction has also become the entry point for the founding story of the category: ConfirmTkt began in 2012 when two IBM colleagues could not get confirmed weekend tickets between Bangalore and Hyderabad, and found that manually tracking booking trends predicted confirmations well. **[Vendor account]** ([founder retrospective](https://medium.com/@dineshkumarkotha/12-years-of-confirmtkt-the-11pm-launch-that-changed-my-life-566f13789a39))

**Prediction is also now conversational.** ConfirmTkt's AI Seat Finder is an in-app conversational agent (powered by ixigo's TARA) that runs during search, reads real-time availability, and proposes trains with confirmed seats plus alternate routes, boarding points and departure times. It ships in Hindi and English. **[Verified — dated trade press with named CEO quote]** ([ETTravelWorld](https://travel.economictimes.indiatimes.com/news/technology/confirmtkt-unveils-ai-seat-finder-with-rcb-stars-to-revolutionize-train-ticket-booking/130973085))

### What IRCTC could do better than any of them
IRCTC/CRIS holds the actual booking and cancellation ledger, quota release logic, and chart-preparation outcomes. It could produce a **calibrated, auditable** probability with published back-testing — and, uniquely, it could show *why* (e.g. "this train releases 40 RAC berths at remote-location chart, historically clearing WL up to 22"). Explanation is the differentiator, not the number.

## A3. Alternate route construction ("broken journey" booking)

This is the highest-value feature third parties have and IRCTC does not, and it is purely a search/optimisation layer over existing IRCTC inventory.

**ConfirmTkt "Alternate Options" (internally "Train Jugaad")** enumerates four combination types, per its own support SOP **[Verified — vendor operational documentation]** ([ConfirmTkt SOP](https://confirmtkthelp.freshdesk.com/support/solutions/articles/44002559209-train-jugaad)):

1. **Source change** — book from an earlier station on the same train where inventory remains.
2. **Destination change** — extend to a later station where inventory remains.
3. **Both source and destination changed.**
4. **Multiple journeys on the same train** — e.g. no seat Amritsar→Patna, but Amritsar→Delhi and Delhi→Patna are both available on that same train; the app proposes booking both legs.

The mechanism is exploiting **unused per-segment quota on the same physical train from other originating stations**. **[Verified — dated reporting]** ([The Hindu](https://www.thehindu.com/news/cities/bangalore/Can%E2%80%99t-get-a-direct-train-ticket-This-app-will-help-you-discover-alternative-options/article14390041.ece))

Alternates also combine **train+train and bus+train** into a single suggested itinerary. **[Vendor claim — store listing]** ([Play Store](https://play.google.com/store/apps/details/ConfirmTkt_Train_Booking?hl=en_ZA&id=com.confirmtkt.lite))

**The honest cost of this feature, from the vendor's own support runbook** — worth reading closely, because it is the design warning:
- Users get confused and complain the app "booked the wrong stations" — the SOP has a dedicated script for this. **[Verified]**
- Users complain of overcharging, because fare is charged **origin→destination of the ticket**, not boarding→destination. A Guwahati→Patna traveller booked as A→C with boarding at B pays the A→C fare. **[Verified]**
- The SOP explicitly instructs agents **not to use the internal term** with customers and to say "Confirmed ticket" or "Alternate Options" instead. **[Verified]**
- Boarding station can be changed once after PNR generation regardless of how the ticket was booked. **[Verified]**

**Design lesson for IRCTC:** the feature is valuable but its failure mode is *user surprise about what was purchased*. IRCTC must render the outcome explicitly — "You will hold a ticket from A to C. You board at B. You are paying the A→C fare of ₹X, which is ₹Y more than a direct B→C fare would have been." Consent must be at the itinerary level, not a checkbox.

**Nearby-station and alternate-route suggestions** are also standard on Paytm, including nearby station search and per-train delay history. **[Vendor claim via trade press]** ([BW Marketing World](https://www.bwmarketingworld.com/article/irctc-partners-with-paytm-to-ease-train-travel-461796))

**RailYatri** frames its version as smart alternate train suggestions, explicit quota logic, and last-minute seat scans. **[Vendor claim — store listing]** ([Play Store](https://play.google.com/store/apps/details?amp&id=com.railyatri.in.mobile))

### What IRCTC already has, and why it is not the same thing
**VIKALP (Alternate Train Accommodation Scheme)** is free, opt-in, and covers up to 7 alternate trains — but it is *post-hoc and passive*, and its constraints matter **[Verified — IRCTC's own T&C]** ([IRCTC VIKALP terms](http://contents.irctc.co.in/en/vikalpTerms.html)):
- Only passengers who remain **fully waitlisted after charting** are considered.
- Reallocation is not guaranteed; it is subject to availability.
- Alternate train must depart between 30 minutes and 12 hours of the original.
- Boarding and terminating stations may shift to nearby cluster stations.
- The user must re-check PNR status after charting to find out what happened.

So VIKALP solves the *outcome* late and opaquely. Third-party alternates solve it *at search time*, when the user still has agency. **A redesigned IRCTC should present VIKALP-equivalent and Jugaad-equivalent options in the same search result set, before payment.**

## A4. Availability and fare calendars

- ixigo exposes seat availability across dates and trains as a first-class browse surface, not a per-query lookup. **[Verified — live product pages]** ([seat availability](https://www.ixigo.com/trains/train-seat-availability), per-train pages such as [12304](https://www.ixigo.com/trains/12304/seat-availability))
- Tatkal-quota availability plus a confirmation-probability figure are shown together on the Tatkal surface. **[Vendor claim]** ([ixigo Tatkal](https://www.ixigo.com/trains/tatkal-railway-reservation))
- **IRCTC has now shipped this.** The July 2026 upgrade added a **fare calendar** for comparing fares across dates, **unified all-class availability** in one view (instead of checking SL / 3A / 2A separately), preferred berth selection, and multi-language support. **[Verified — dated reporting of an official launch]** ([Sunday Guardian](https://sundayguardianlive.com/india/irctc-website-goes-live-with-major-upgrade-on-july-15-faster-tatkal-booking-fewer-captchas-fare-calendar-everything-you-need-you-know-237081/))

**Implication for the POC:** a fare/availability calendar is no longer a differentiator — it is table stakes. Differentiate on the *decision*, i.e. combining fare, availability, confirmation probability, and journey duration in one comparable grid.

## A5. Journey-day utilities: coach position, platform, live status, notifications

ixigo's own feature enumeration covers: Tatkal booking, PNR prediction, live train status, NTES enquiry, platform locator, in-train food ordering, **coach position**, **seat maps**, IRCTC password recovery / new IRCTC user registration, station alarms and reminders. **[Vendor claim — store listing, but these are directly observable in-product]** ([Play Store](https://play.google.com/store/apps/details?hl=en&id=com.ixigo.train.ixitrain), [App Store](https://apps.apple.com/in/app/ixigo-trains-ticket-booking/id1148984317))

Two of these deserve specific attention:

**Offline live tracking.** ixigo tracks train location without an internet connection. **[Vendor claim]** ([ixigo running status](https://www.ixigo.com/trains/train-running-status))

**Where is my Train** is the reference implementation and the strongest UX lesson in this entire report. It estimates train position from **cell tower information**, with no internet and no GPS required while onboard, using cached data; it ships destination alarms, a speedometer, location sharing, and multi-language support (8 languages at the time of Google's acquisition in 2018). **[Verified — Wikipedia, Google's own support docs, and TechCrunch acquisition coverage]** ([Wikipedia](https://en.wikipedia.org/wiki/Where_Is_My_Train), [Google Play](https://play.google.com/store/apps/details?hl=en-US&id=com.whereismytrain.android), [Google support](https://support.google.com/whereismytrain/answer/16330184?hl=en), [TechCrunch](https://techcrunch.com/2018/12/10/where-is-my-train-its-with-google-now/))

The insight: it inverted the connectivity assumption. Internet is needed *before* you board, not during the journey — which is exactly backwards from how most booking apps are built.

**Seat map / berth position.** ixigo renders a seat map and coach layout on the PNR surface so the traveller can see where their allotted berth physically is. **[Vendor claim — product page]** ([ixigo PNR status](https://www.ixigo.com/trains/pnr-status)). This is *post-allotment visualisation*, not airline-style pre-selection — an important distinction (see §4).

RailYatri similarly bundles platform number, coach position, and in-app GPS ETA for upcoming stations. **[Vendor claim]** ([store listing mirror](https://railyatri.en.aptoide.com/))

**IRCTC's RailOne** already consolidates much of this — reserved/unreserved/platform tickets, PNR and live status, coach position, Rail Madad grievances, e-catering, porter and last-mile taxi, with single sign-on, plus a 3% discount on unreserved and platform tickets. Launched 1 July 2025. **[Verified — mainstream dated coverage of an official launch]** ([The Hindu](https://www.thehindu.com/news/national/railone-app-launched-indian-railways-features-pnr-tatkal-booking-tickets/article69759415.ece), [Times of India](https://timesofindia.indiatimes.com/technology/tech-news/indian-railways-launches-railone-app-for-passengers-know-how-to-download-features-usage-and-other-details/articleshow/122205652.cms), [Financial Express](https://www.financialexpress.com/life/technology-what-is-railone-app-features-benefits-and-how-it-helps-indian-railways-passengers-in-2026-4142916/))

So the *feature list* is largely matched. The remaining gap is **integration quality and proactivity** — third parties push status changes to you; the official stack still largely expects you to go look.

## A6. Free cancellation and refund-guarantee products

This is the most commercially interesting and the most legally constrained category. Two distinct products, frequently confused:

### (i) Free cancellation / flexibility — "ixigo Assured Flex"
Paid opt-in add-on. Per the vendor's own policy page **[Verified — vendor T&C]** ([ixigo Assured Flex](https://www.ixigo.com/assured-flex-trains)):
- 100% instant refund of the **train fare** on cancellation.
- One free modification per traveller: travel date, train, class, quota, traveller, or station. A new trip is created.
- Cancel at least **8 hours** before departure or before chart preparation, whichever is earlier.
- Modify at least **12 hours** before departure or before charting, whichever is earlier.
- Current-availability bookings must be cancelled at least 30 minutes before departure.
- **What is not refunded:** ixigo service charge, IRCTC convenience fee, payment-gateway charges, and the Assured Flex fee itself.
- If Indian Railways cancels the train, only the fare is refunded — the Flex fee is not.
- New travellers cannot be added during modification.

RailYatri and ConfirmTkt market equivalent free-cancellation offerings. **[Vendor claim]** ([ConfirmTkt](https://www.confirmtkt.com/), [RailYatri store listing](https://railyatri.en.aptoide.com/))

**Mechanically, this is not a railway refund.** The operator's cancellation charges still apply upstream (RAC/WL cancellation attracts a clerkage charge of ₹60 per passenger plus GST up to 30 minutes before departure, per IRCTC rules as restated by ConfirmTkt's own help centre **[Verified]** ([ConfirmTkt cancellation rules](https://confirmtkthelp.freshdesk.com/support/solutions/articles/44002326188-cancellation-charges-rules))). The platform absorbs the delta and prices the risk as a fee. It is an **insurance product in a UX wrapper**.

### (ii) Confirmation guarantee — "Travel Guarantee" / "Alternate Travel Plan"
Also paid opt-in. Per ConfirmTkt's internal SOP and ixigo's public page **[Verified — vendor operational documentation + public T&C]** ([ConfirmTkt SOP](https://confirmtkthelp.freshdesk.com/support/solutions/articles/44002617339-travel-guarantee-updated), [ixigo Alternate Travel](https://www.ixigo.com/trains/alternate-travel), [coupon claim article](https://confirmtkthelp.freshdesk.com/support/solutions/articles/44002632483-claiming-a-travel-guarantee-tg-coupon)):

| Selected fallback mode | To original payment method | As platform coupon | Total |
|---|---|---|---|
| Flight | 1X | 2X | **3X** |
| Bus | 1X | 2X | **3X** |
| Train | 1X | 1X | **2X** |

The headline "3X refund" is therefore **1X cash plus 2X restricted store credit** — and the exclusions are extensive:
- Payable only if the ticket is **fully waitlisted at chart preparation**.
- **Not** payable if the ticket is RAC or partially confirmed, or if IRCTC confirms even one passenger in a multi-passenger booking.
- **Not** payable if the user cancels, before or after charting.
- Coupon capped at ₹6,000, single use, valid 7 days from charting, and the *new travel* must also fall within 7 days.
- Same account only; maximum 3 such bookings per month.
- Cannot be combined with Assured or Assured Flex.
- If Railways cancels the train, fare and the guarantee fee are both refunded.

Similar products are offered by redBus and MakeMyTrip. **[Verified — dated reporting]** ([Economic Times](https://m.economictimes.com/wealth/save/waiting-list-train-ticket-get-ticket-confirmation-assurance-with-up-to-3x-money-back-guarantee-from-ixigo-redbus-and-makemytrip/articleshow/121639049.cms))

**Verdict:** the *headline* is marketing; the *underlying insight is real and worth borrowing* — travellers will pay for certainty about a waitlisted ticket, and the anxiety window is from booking to chart preparation. See §4 for why IRCTC cannot copy the mechanism as-is.

## A7. Tatkal speed: autofill, quick-book, saved passengers

- ixigo publishes an **IRCTC Tatkal autofill** flow: pre-fill the form before the 10:00/11:00 opening via a Chrome extension. **[Verified — vendor product page]** ([ixigo Tatkal autofill](https://www.ixigo.com/trains/irctc-tatkal-autofill))
- A parallel grey market exists: third-party autofill extensions and open-source Cypress scripts that automate login, passenger details, CAPTCHA retry, and even UPI payment. **[Verified that these exist]** ([Chrome Web Store extension](https://chromewebstore.google.com/detail/quick-book-autofill/knndcegmilobcbdhgibafbnlaolgekhn?hl=es), [GitHub project](https://github.com/shivamguys/irctc-cypress-automation), [Navbharat Times coverage](https://navbharattimes.indiatimes.com/tech/tips-tricks/irctc-tatkal-train-ticket-confirm-booking-trick-use-irctc-tatkal-automation-tool-to-save-details-automatic/articleshow/122020903.cms))

The existence of this ecosystem is itself the strongest evidence of a product failure: **users are writing browser automation to survive the official booking form.** Any redesign should read that as a spec.

**IRCTC's counter-moves are already in flight:** the July 2026 site reduces unnecessary CAPTCHA, removes pop-ups and flashing graphics, cuts checkout steps, and retains saved passengers. **[Verified]** ([Sunday Guardian](https://sundayguardianlive.com/india/irctc-website-goes-live-with-major-upgrade-on-july-15-faster-tatkal-booking-fewer-captchas-fare-calendar-everything-you-need-you-know-237081/))

**Capacity, which is the real Tatkal constraint:**
- Old PRS: ~32,000 bookings/minute and ~4 lakh enquiries/minute.
- Upgraded PRS target: **1.5 lakh bookings/minute** and **40 lakh enquiries/minute** — roughly a 5x booking uplift, rolling out in phases, replacing 2010-era technology. **[Verified — multiple dated outlets on official announcements]** ([Financial Express](https://www.financialexpress.com/business/railways-how-is-indian-railways-upgrading-the-passenger-reservation-system-all-changes-in-train-ticket-booking-explainednbsp-4314401/), [ET Infra](https://infra.economictimes.indiatimes.com/news/railways/indian-railways-to-boost-ticket-booking-capacity-nearly-5-fold-with-new-prs-upgrade/131718366), [NDTV](https://www.ndtv.com/travel/indian-railways-is-upgrading-its-reservation-system-to-handle-1-5-lakh-bookings-a-minute-11893054))
- Note a **discrepancy worth not papering over**: IRCTC has separately been quoted saying the current system already reaches ~37,000/minute and the upgrade could take it to "more than 1 lakh"/minute — a materially different figure from 1.5 lakh. **[Verified that both figures were published]** ([Economic Times](https://m.economictimes.com/industry/transportation/railways/railway-passengers-smoother-ticket-booking-is-coming-irctc-to-boost-capacity-from-37000-to-over-1-lakh-per-minute/amp_articleshow/133531367.cms), [Trak.in](https://trak.in/stories/irctc-to-upgrade-ticket-booking-system-promises-faster-tatkal-bookings-and-fewer-website-disruptions/)). Do not cite a single hard number as settled fact in the POC.

## A8. Payments — why users believe third parties are more reliable

**What is verifiable:**
- ixigo advertises **₹0 payment-gateway fee on UPI**, plus card offers. **[Verified — vendor pricing page]** ([ixigo trains](https://www.ixigo.com/trains))
- Paytm offers Paytm UPI, wallet, netbanking, cards, **no fee on UPI**, and **Paytm Postpaid** (pay later). **[Vendor claim via trade press]** ([BW Marketing World](https://www.bwmarketingworld.com/article/irctc-partners-with-paytm-to-ease-train-travel-461796))
- IRCTC's own convenience fee is ₹10 + GST per ticket for non-AC and ₹20 + GST for AC, and UPI itself carries no transaction fee. **[Verified — restated from IRCTC schedule]** ([Bajaj Finserv summary](https://www.bajajfinserv.in/irctc-upi-charges); IRCTC's own PDF cites ₹15+GST for SL/2S in a pass-booking context, so the exact figure is class- and channel-dependent — [IRCTC](https://contents.irctc.co.in/en/Salient_Features_PASSBooking.pdf))

**What is not verifiable:** the widely-held user belief that third-party payment rails "just work" better. I found **no** audited comparative success-rate data. What I found instead:
- Wallet/prepaid instruments and platform-side retry reduce *perceived* failure by removing a bank redirect hop — plausible, but unquantified.
- Third parties are not immune: a Trainman post-mortem case study reports frequent payment failures and incomplete transactions as a core problem, alongside a 14% drop in bookings in early 2023 and 80% uninstall rates. **[Weak — vendor-agency case study, self-interested]** ([Propel case study](https://www.trypropel.ai/case-studies/trainman))
- Community accounts note third-party availability displays can lag because of API latency, and that some quotas/schemes surface on IRCTC first or only. **[Weak — forum]** ([Quora](https://www.quora.com/Which-is-better-IRCTC-ixigo-or-Paytm-travel))

**Honest conclusion:** the reliability advantage is substantially a **UX and status-communication advantage**, not a proven settlement advantage. Third parties own the end-to-end narrative — one order ID, one status timeline, one support thread — while IRCTC historically hands users off between portal, gateway, and bank with no shared state. That is a design problem IRCTC can fix outright, and it is probably the single highest-leverage item in the whole report.

## A9. Business model

| Layer | Mechanism | Confidence |
|---|---|---|
| IRCTC → partner | Partners are onboarded as **Principal Service Providers (PSPs)** / Retail Service Providers under formal IRCTC policy, paying **integration charges**, **annual maintenance charges**, and passing payment-gateway charges to the customer | **[Verified — IRCTC policy documents]** ([B2C policy](https://contents.irctc.co.in/en/New_B2C_Policy.pdf), [B2B & Internet Café PSP policy, Edition 2025 effective 20-09-2025](https://contents.irctc.co.in/en/B2B_ICS_Policy_Internet_Cafe_Scheme.pdf), [agent policy](https://contents.irctc.co.in/en/Agent_Policy.pdf)) |
| Partner → user, core | Service/convenience fee per ticket, on top of IRCTC's own convenience fee | **[Verified — disclosed in ixigo's own non-refundable-charges list]** ([Assured Flex T&C](https://www.ixigo.com/assured-flex-trains)) |
| Partner → user, ancillary | This is where the margin is: Assured Flex (free cancellation), Travel Guarantee (confirmation guarantee), in-train food, bus/flight cross-sell, packaged tours | **[Verified]** (sources above; [Bharat Darshan packages](https://travel.economictimes.indiatimes.com/news/railways/ixigo-trains-launches-bharat-darshan-packages-for-spiritual-family-travel/133534049)) |
| Payments | UPI fee waivers used as an acquisition lever, funded by ancillary margin | **[Verified as a stated offer]** |

The strategic read: **train ticketing is a low-margin traffic engine**; the business is the attach rate on flexibility products and cross-modal cross-sell. ixigo's trains segment growing at 9% while total revenue grows 34% is consistent with that.

---

# B. Patterns worth borrowing from airlines and global rail

## B1. Split ticketing — Trainline SplitSave
The closest international analogue to ConfirmTkt's Jugaad, and a proof that mainstream users accept "multiple tickets, one journey" when framed correctly.

- Buy several tickets covering segments of one journey instead of one end-to-end ticket, **without changing trains**. **[Verified — vendor explainer]** ([Trainline](https://www.thetrainline.com/trains/great-britain/split-tickets), [help centre](https://help.thetrainline.com/hc/en-gb/articles/5124974226591-SplitSave))
- Trainline states SplitSave finds savings on **64% of routes nationwide**. **[Vendor claim]** ([Trainline Group](https://trainlinegroup.com/media/news/trainline-launches-splitsave))
- Claimed average saving £13 per trip (leisure) and £26 per business trip. **[Vendor claim]** ([priorities page](https://www.thetrainline.com/information/priorities), [business](https://www.business.thetrainline.com/farefinder/Default.aspx))
- Independent coverage describes the mechanic as searching for the cheapest working combination of Advance / Off-peak / Anytime fares, with the framing "stay on the train, just switch tickets". **[Verified — independent press]** ([The Independent](https://www.independent.co.uk/travel/news-and-advice/split-ticketing-rail-travel-fares-discount-privatisation-a8982646.html), [BBC](https://www.bbc.com/news/uk-51077807))

**Borrowable pattern:** the *framing sentence*. "Stay on the train, just switch tickets" is why UK users don't feel tricked. IRCTC's Jugaad-equivalent needs an equally short, honest one-liner — something like "One train. Two tickets. Same seat the whole way."

## B2. Price prediction and best-fare calendars
- **Trainline Price Prediction** forecasts when Advance fares will rise, presented as an at-a-glance view of saving opportunities across the months and days before travel, built from large-scale historical sold-ticket pricing. **[Verified — vendor launch release]** ([Trainline Group](https://trainlinegroup.com/media/news/trainline-launches-first-ever-train-ticket-price-prediction-tool), [product page](https://www.thetrainline.com/price-prediction)). Trainline's own claim of £1m+ average monthly customer savings is **[Vendor claim]** ([release](https://www.trainlinegroup.com/media/news/uk-rail-travellers-are-embracing-artificial-intelligence-saving-over-1-million-a-month-on-average)).
- **Deutsche Bahn best-price search** highlights the cheapest fare of the whole day in green with a currency marker — a tiny, extremely legible affordance. **[Verified — official DB page]** ([DB](https://int.bahn.de/en/booking-information/best-price-search))

**Applicability caveat:** Indian reserved rail fares are largely regulated and not dynamically yield-managed the way UK Advance fares are (dynamic pricing applies only to specific trains/classes). So *price* prediction has limited headroom. The transferable idea is to predict the variable that *does* move in India: **availability and confirmation probability across dates**. A "best chance of confirmation" calendar is the Indian analogue of a best-fare calendar.

## B3. Deutsche Bahn / DB Navigator — the strongest single feature set
Per DB's own product page **[Verified]** ([DB Navigator](https://int.bahn.de/en/booking-information/db-navigator)):
- **Seat reservation** at booking or added later.
- **Best price search.**
- **Demand indicator** — shows how full your train is expected to be.
- **Coach sequence** for your specific train, shown alongside journey info.
- **Komfort Check-in** — self-check-in on board via the app; validate your own ticket and tell the crew where you're sitting, after which your ticket generally isn't inspected. Works with or without a seat reservation, on ICE and selected IC trains, for digital tickets on flexible/saver fares. The app can prompt you to check in shortly before departure. **[Verified]** ([Komfort Check-in](https://int.bahn.de/en/booking-information/komfortcheckin), [FAQ](https://int.bahn.de/en/faq/pk/service/on-the-train/komfort-checkin), [DB corporate](https://www.deutschebahn.com/en/checkin-6934994))

**Two ideas worth stealing for the POC:**
1. **Demand indicator** — a crowding forecast is qualitatively different from a seat count and is directly analogous to Indian coach occupancy. It sets expectations about the *journey*, not just the transaction.
2. **Self-check-in** — maps neatly onto TTE verification. A passenger who self-checks-in in-app could reduce onboard checking friction, and would give Railways a live occupancy signal that improves the no-show/RAC-clearing model. This is a genuinely novel POC idea with a real-world rationale.

## B4. SNCF Connect — accessibility done as a published commitment
- SNCF Connect publishes a formal accessibility declaration with measured conformance against France's **RGAA** standard: **84.42% global / 96.00% average** conformance. **[Verified — official published declaration]** ([SNCF Connect accessibilité](https://www.sncf-connect.com/accessibilite))
- Concrete pattern worth copying directly: after each station field, a **dedicated region restates the selected station**, so screen-reader users get explicit confirmation of what an autocomplete just did. **[Verified — official accessibility FAQ]** ([SNCF Connect](https://www.sncf-connect.com/aide/accessibilite-sur-sncf-connect)). Station autocomplete is exactly where IRCTC has documented failures, so this is a targeted fix.
- Accessibility/PMR services are integrated into trip preparation, including fare entitlements for wheelchair users and companions. **[Verified]** ([SNCF Connect](https://www.sncf-connect.com/en-en/accessibility/preparation-trip-services))

## B5. Amtrak — seat selection retrofitted onto legacy rail
- Amtrak added **upfront seat selection during booking** on trains with assigned seating (all Acela, plus Business Class on several named services). **[Verified — official press release, March 2025]** ([Amtrak media](https://media.amtrak.com/2025/03/amtrak-enhances-mobile-app-to-improve-the-travel-experience/), corroborated by [Trains.com](https://stage.trains.com/pro/passenger/intercity/amtrak-mobile-app-now-allows-seat-selection/))
- The interaction pattern is the important part: the system **pre-selects a seat**, the traveller can review and change it before completing the booking, and can change it again any time afterwards **at no fee**. **[Verified]** ([Amtrak reserved seating](https://www.amtrak.com/reserved-seating), [seating accommodations](https://www.amtrak.com/onboard/onboard-accommodations-for-all-your-needs/seating-accommodations))
- Accessible seating is provided on all trains for customers with mobility disabilities. **[Verified]** ([Amtrak](https://www.amtrak.com/accessible-travel-services))
- **BidUp** lets customers bid to upgrade into premium classes via auction. **[Verified]** ([Amtrak](https://www.amtrak.com/service-enhancements-highlights))

**This is the exact pattern IRCTC should adopt** (see §4): *algorithmic allotment first, optional override second*. It preserves the load-distribution logic that IRCTC's berth allocation algorithm exists to serve, while giving the traveller agency. It also avoids the trap of a blank seat map that users must fill.

One further data point, from a designer's portfolio write-up of Amtrak app work: after making the app feel airline-like, usability testers expected to be *finished* after ~8 screens, and the team compressed a 22-screen flow to 8 or fewer using dropdowns and accordions. **[Weak — unverified personal portfolio]** ([case study](https://cylinder-bat-cgak.squarespace.com/uxdesign/amtrak)). Treat as a hypothesis, not evidence — but "8 screens is the patience budget" is a useful design constraint to test.

## B6. Japan — ticketless as the default, transfer-first as the mental model
- **smartEX** provides online reservation and **ticketless boarding** for Tokaido/Sanyo/Kyushu Shinkansen; membership registration is required before booking. **[Verified — official JR service site]** ([smartEX](https://smart-ex.jp/en/index.php), [JR Central](https://jr-central.co.jp/ex/smart/))
- The reservation flow is a compact single form: date, train type, train number, departure/arrival stations, optional transit station, number of passengers. **[Verified]** ([smartEX reservation](https://smart-ex.jp/en/reservation/reserve_smart/sp/))
- **Norikae Annai / ekitan** define the dominant Japanese consumer paradigm: the primary object is a **transfer itinerary** (route, fare, total duration, connection points) rather than a train. Free for daily-use transfer search, timetables, and service status; multilingual. **[Verified — store listings]** ([Jorudan](https://play.google.com/store/apps/details?hl=en_IN&id=jp.co.jorudan.nrkj), [ekitan](https://play.google.com/store/apps/details?id=com.ekitan.android))

**Borrowable:** search on **origin→destination→time**, and let the system decide whether the answer is one train, two trains, or a train plus a bus. That is the same primitive that makes ConfirmTkt Alternates work — Japan just made it the default rather than a fallback.

## B7. Airline patterns — fare families and seat maps
- **Fare families** as a purchase-decision structure: IndiGo restructured into a five-fare lineup (Saver, Flexi, UpFront in economy; Stretch, Stretch+ in business) under "6E Ways to Fly" from 29 January 2026. **[Weak — third-party aviation blog, not an IndiGo release]** ([HappyFares](https://happyfares.in/blog/indigo-fare-types-explained-2026/))
- **IndiGo Lite** is the cleaner verified example of the pattern: a lower entry fare with **auto-assigned seat** and 7 kg cabin baggage, where checked baggage, **seat selection**, and meals are optional paid add-ons; direct channels only. **[Verified — dated trade press]** ([ETTravelWorld](http://travel.economictimes.indiatimes.com/news/aviation/domestic/indigo-introduces-lite-fare-option-for-cabin-baggage-only-travellers/132108629))
- **Flexi fares** sell changeability as a product: unlimited date/flight changes without a change fee. **[Verified — airline's own page]** ([IndiGo Flexi](https://www.goindigo.in/add-on-services/flexi-fares.html))
- **Seat map legibility:** IndiGo's public seat information calls out specific rows as extra-legroom and identifies emergency exit rows, and offers window/aisle/extra-legroom advance selection. **[Verified]** ([IndiGo](https://www.goindigo.in/aircraft-and-fleet.html))

**Two transferable ideas, one trap:**
- *Transferable:* the **flexibility-as-a-fare-attribute** pattern. Note that "Flexi fare" is the legitimate, first-party version of what ixigo sells as Assured Flex. Railways controls the cancellation rules, so it could offer a flexible fare directly rather than leaving that margin to intermediaries.
- *Transferable:* seat-map annotation — label *why* a berth is desirable or not (near toilet, near door, side-lower, no window) rather than just showing occupancy. This is the layer even ixigo's seat map doesn't really provide.
- *Trap:* do not import airline **paid** seat selection into a public-service rail context without care. Charging for berth choice on a subsidised public service is a policy decision with equity implications, not a UX decision.

## B8. Accessibility — the compliance floor for a real IRCTC build
- **GIGW 3.0** is mandatory for Indian government websites and apps, with **88 mandatory checkpoints** spanning accessibility, quality, cybersecurity and lifecycle management, certified by **STQC** under MeitY. **[Verified as to mandate and certifier; the "88 checkpoints" count comes from a secondary compliance vendor]** ([GIGW official](https://guidelines.india.gov.in/new-features-of-gigw-3-0/), [STQC transition plan](https://stqc.gov.in/sites/default/files/tenders/Transition%20Plan.pdf), [HalfAccessible](https://halfaccessible.com/india-digital-accessibility-compliance/))
- GIGW 3.0 is described as **WCAG 2.1 AA-aligned**, and **IS 17802** (BIS, harmonised with EN 301 549) is the reference standard for ICT products and services generally; the **RPwD Act 2016** is the statutory backdrop. **[Weak–Verified — accurate but sourced to a compliance vendor summary; verify against the BIS/GIGW primary texts before making claims in a submission]** ([EqualWeb](https://www.equalweb.com/platform/standards/india.html))
- GIGW 3.0 also pushes API-level integration with DigiLocker, Aadhaar identity, single sign-on, and **language translation tooling**. **[Verified — official GIGW page]** ([GIGW](https://guidelines.india.gov.in/new-features-of-gigw-3-0/))

**Concrete accessibility patterns to implement in the POC:**
1. Station autocomplete with an explicit selected-station readback region (SNCF pattern).
2. Text-size controls surfaced in the UI — IRCTC's beta already exposes these; keep them.
3. Never encode availability status in colour alone. WL / RAC / CNF / PQWL / TQWL must carry text and plain-language explanation. This doubles as the comprehension fix for first-time users.
4. Keyboard-completable booking with no timed CAPTCHA in the critical path.
5. Integrate Divyangjan concession and assistance requests into the booking flow rather than a separate portal — IRCTC's July 2026 upgrade already claims to unify Divyangjan, student and patient facilities, so build on that. ([Sunday Guardian](https://sundayguardianlive.com/india/irctc-website-goes-live-with-major-upgrade-on-july-15-faster-tatkal-booking-fewer-captchas-fare-calendar-everything-you-need-you-know-237081/))

---

# C. Statistics and user behaviour

## C1. Channel and market share
| Metric | Value | Confidence |
|---|---|---|
| Reserved tickets booked online (Jun 2025–Jun 2026) | **89%** online / 11% counter; 65.08 crore total, 57.90 crore online | **[Verified]** ([Indian Express](https://indianexpress.com/article/india/indian-railways-89-percent-train-tickets-booked-online-counter-sales-drop-11-percent-10798199/)) |
| Digital platforms' share of reserved tickets, FY 2024–25 | 86.38% | **[Verified as published]** — appears on an IRCTC-affiliated site; verify against a Ministry release before quoting ([irctc.com](https://www.irctc.com/internet-ticketing.php)) |
| Online share of IRCTC bookings, FY23 → FY26 projection | 82% (₹393bn) in FY23, projected 87% (₹597bn) by FY26 | **[Weak — 2023 industry analysis, now partly superseded]** ([WebInTravel](https://www.webintravel.com/indias-ground-transportation-analyzing-market-dynamics-of-rail-and-intercity-bus-travel/)) |
| ixigo share of online train ticketing | ~60% | **[Weak]** (see §A1) |

**Read this carefully:** the ~60% figure is share of *third-party/OTA online train ticketing*, not share of all IRCTC bookings. The two figures are often conflated. Do not claim "third parties handle 60% of Indian rail bookings" — that is not supported by anything I found.

## C2. Why users abandon IRCTC bookings
I found **no** published, quantified abandonment funnel for IRCTC. Anyone claiming a specific abandonment percentage is inventing it. What *is* supported:

- **Peak-window capacity was a hard technical ceiling.** The pre-upgrade PRS handled ~32,000 bookings/minute against Tatkal demand; the upgrade explicitly exists to reduce peak-hour disruption and server failures. **[Verified]** ([ET Infra](https://infra.economictimes.indiatimes.com/news/railways/indian-railways-to-boost-ticket-booking-capacity-nearly-5-fold-with-new-prs-upgrade/131718366), [Indian Express](https://indianexpress.com/article/india/irctc-upgrade-nget-ticket-booking-system-reduce-website-disruptions-peak-hours-tatkal-timings-10846197/))
- **CAPTCHA friction was escalated politically, not just on forums.** The redesign was announced by the Railway Minister after students raised concerns at MNIT Jaipur, with repeated CAPTCHA verification during Tatkal named as a key issue. **[Verified — dated reporting]** ([Sunday Guardian](https://sundayguardianlive.com/india/irctc-website-goes-live-with-major-upgrade-on-july-15-faster-tatkal-booking-fewer-captchas-fare-calendar-everything-you-need-you-know-237081/))
- **Waitlist uncertainty is a documented drop-off driver.** ConfirmTkt's AI Seat Finder launch coverage names waitlists and fragmented search as causing booking uncertainty and **user drop-offs**. **[Vendor framing, but it is the vendor's own diagnosis of the market]** ([ETTravelWorld](https://travel.economictimes.indiatimes.com/news/technology/confirmtkt-unveils-ai-seat-finder-with-rcb-stars-to-revolutionize-train-ticket-booking/130973085))
- **Payment drop-off is an industry-wide problem, not IRCTC-specific.** Trainman's own reported problems included frequent payment failures and incomplete transactions. **[Weak — agency case study]** ([Propel](https://www.trypropel.ai/case-studies/trainman))
- **The internal Issue Atlas** (`IRCTC Public Issue & Enhancement Status Atlas.md`, in this workspace) documents the abandonment themes from user-reported evidence: payment debited without ticket issued, refund status opacity, OTP/Aadhaar timing failures during Tatkal, and interface clutter. That document already grades each by evidence strength — use its status labels rather than re-asserting them here.

## C3. Mobile, device, and bandwidth
| Metric | Value | Confidence |
|---|---|---|
| Share of India's 500M+ unique internet users who access the web **exclusively** via mobile | **78%** | **[Verified as reported from an industry report]** ([BW Marketing World](https://www.bwmarketingworld.com/article/indias-social-media-hours-down-10-while-internet-usage-rises-535055)) |
| Mobile share of total web traffic, Asia | 69.4% (2024) | **[Verified]** ([Statista](https://www.statista.com/markets/424/topic/538/mobile-internet-apps/)) |
| India internet penetration | ~68.5% | **[Weak — aggregator site]** ([GrabOn](https://www.grabon.in/indulge/tech/internet-users-statistics/)) |
| For many Indians, the smartphone is the **only** internet access point | Qualitative | **[Verified]** ([Statista](https://www.statista.com/topics/4600/smartphone-market-in-india/)) |

**The design consequence is the Where is my Train lesson, restated:** assume the connection is present when booking and absent when travelling. Concretely, for the POC — server-render the critical path, keep the booking bundle small, make the ticket and journey view fully available offline, avoid blocking on non-essential network calls, and never let a spinner sit between the user and a confirmed PNR.

## C4. Language and localisation
| Metric | Value | Confidence |
|---|---|---|
| Indian internet users who prefer content in their native language | **68%** (IAMAI/Nielsen 2024, via secondary citation) | **[Weak — secondary citation of a primary study I could not retrieve]** ([Journalism University](https://journalism.university/social-media-and-society/how-language-diversity-influences-social-media-india/)) |
| Hindi vs English internet user growth, 2020–2025 | Hindi +47%, English +3%; Tamil content consumption +62%, Telugu +55% | **[Weak — content-marketing blog, unsourced]** ([BuddyX](https://buddyxtheme.com/online-community-regional-language-audience/)) — directionally consistent with the older KPMG-Google findings ([Quartz](https://qz.com/india/972844/indias-internet-users-have-more-faith-in-content-thats-not-in-english-study-says/)) but **do not cite these specific numbers in a submission** |
| Urban India language split | Statista reports a split between English-preferring and Indian-language-preferring users with Hindi leading the latter; **exact figures paywalled** | **[Unverified — figures not accessible]** ([Statista](https://www.statista.com/statistics/1459294/india-internet-access-by-language/)) |

**What is solidly verifiable is what competitors actually shipped:**
- Where is my Train supported **8 languages** at acquisition. **[Verified]** ([TechCrunch](https://techcrunch.com/2018/12/10/where-is-my-train-its-with-google-now/))
- ConfirmTkt's AI Seat Finder launched in **Hindi and English**, explicitly targeting non-metro travellers. **[Verified]** ([ETTravelWorld](https://travel.economictimes.indiatimes.com/news/technology/confirmtkt-unveils-ai-seat-finder-with-rcb-stars-to-revolutionize-train-ticket-booking/130973085))
- RailYatri serves full Hindi surfaces. **[Verified — live page]** ([RailYatri Hindi](https://www.railyatri.in/m/train-ticket/hi))
- IRCTC's upgraded portal added multi-language support. **[Verified]** ([Sunday Guardian](https://sundayguardianlive.com/india/irctc-website-goes-live-with-major-upgrade-on-july-15-faster-tatkal-booking-fewer-captchas-fare-calendar-everything-you-need-you-know-237081/))
- GIGW 3.0 pushes government platforms toward integrated translation tooling. **[Verified]** ([GIGW](https://guidelines.india.gov.in/new-features-of-gigw-3-0/))

**POC recommendation:** rather than 12 half-translated languages, do **Hindi + English complete**, including error messages, refund status text, and the WL/RAC/PQWL explanations — the places machine translation and partial localisation usually break. Demonstrate the *architecture* for more languages. Partial localisation of a payment-failure message is worse than English.

---

# D. Constraints — what a real IRCTC implementation cannot simply copy

This section matters more than the feature list. Several of the most attractive third-party features are attractive *precisely because* a private intermediary can do things a public operator cannot.

### D1. Confirmation prediction percentages
A private app showing "72% chance" carries commercial reputational risk only. **IRCTC showing a number makes it a quasi-official forecast** — it will be read as a commitment, will be screenshotted in complaints, and will invite grievance escalation when wrong. Mitigations:
- Show a **band**, not a point estimate ("usually confirms" / "often confirms" / "rarely confirms" from this waitlist position on this train).
- Show the **evidence** rather than the verdict: "In the last 10 departures, WL up to 34 confirmed in this class." That is a *statement of historical fact*, which IRCTC can stand behind, rather than a prediction it can be held to.
- Publish the method and back-testing. Being the only calibrated, auditable predictor in the market is a stronger position than being the boldest one.

### D2. Refund and confirmation guarantees
Assured Flex and Travel Guarantee are **insurance products priced against IRCTC's own cancellation rules**, with the platform absorbing the delta. IRCTC cannot sell insurance against its own refund policy — if it can afford to refund more, the correct instrument is to **change the fare rules** (an airline-style flexible fare, per §B7), which is a Railway Board policy matter, not a product decision. Additionally:
- The 2X/3X coupon structure works because the platform can pay in **restricted store credit redeemable across its own bus/flight inventory**. IRCTC has no comparable multimodal redemption surface, and issuing 2X credit against public funds is a non-starter.
- A POC can legitimately demo the *transparency* half of this: a clear pre-purchase statement of exactly what is refundable, when, and how much, with a live refund timeline showing the bank-rail stage. That addresses the same anxiety without inventing a financial product.

### D3. Alternate-route / broken-journey booking
Technically clean — it uses existing inventory and existing rules, and boarding-station change is already permitted. The constraints are **fairness and disclosure**:
- Systematically routing users into longer origin→destination tickets to capture segment quota **increases their fare and consumes inventory other travellers wanted**. At IRCTC's scale, an algorithm doing this by default is a resource-allocation policy, not a convenience feature. It needs an explicit fairness review.
- Disclosure must be at itinerary level, per the failure modes in ConfirmTkt's own SOP (§A3): stations booked, station boarded, fare basis, and the delta versus a direct ticket.
- Multi-leg same-train suggestions must state plainly that these are **separate PNRs** with separate cancellation consequences.

### D4. Seat/berth selection
IRCTC's algorithmic berth allotment exists to distribute load across coaches for stability and safety, and to allocate equitably — per this workspace's `important_things.md`. A free-for-all seat map would undermine both. The **Amtrak pattern (§B5) is the compliant path**: algorithm assigns, user may review and override within permitted bounds, no fee. IRCTC's upgraded portal already added *preferred seat* input, so the POC should build the override UI on top of the preference model rather than replacing allocation.

### D5. Tatkal autofill and one-tap booking
Aadhaar authentication now sits directly in this path, and it is a legal control, not a UX obstacle:
- **Aadhaar-based OTP authentication is compulsory for online Tatkal bookings** (from mid-July 2025). **[Verified]** ([ixigo Tatkal rules](https://www.ixigo.com/trains/tatkal-railway-reservation), [AngelOne](https://www.angelone.in/news/personal-finance/irctc-aadhaar-priority-booking-vs-tatkal-rules-what-s-different))
- **From 12 January 2026, only Aadhaar-authenticated users can book general reserved tickets on the ARP opening day**, expanding the booking window for verified users — explicitly aimed at curbing misuse and automated bookings. **[Verified]** ([NDTV](https://www.ndtv.com/travel/train-ticket-booking-rules-changed-from-january-12-what-aadhaar-verified-travellers-should-know-10740033), [Indian Express](https://indianexpress.com/article/india/irctc-tightens-rules-aadhaar-verification-must-for-advance-and-tatkal-bookings-10540786/), [Economic Times](https://economictimes.indiatimes.com/topic/irctc-tatkal-rules))

So "one-tap Tatkal" is **not implementable as literal one-tap** — an OTP round trip is mandatory. The correct design response, and it is a good one, is to **move verification out of the race**: pre-authenticate before the window opens, hold a verified session, show live OTP delivery state, and provide bounded retry that preserves the user's form state. That directly addresses the OTP-timing failures catalogued in the workspace Issue Atlas, and it is the thing no third party can do better than IRCTC.

### D6. Live tracking accuracy
Cell-tower-based tracking is a **crowd-sourced estimate**, and Where is my Train can present it as such. An official IRCTC figure will be treated as authoritative and used to decide whether to leave for the station. If the POC shows a live position, it must distinguish **confirmed** (last recorded station departure) from **estimated** (interpolated), and label the estimate's basis.

### D7. Business-model asymmetry
Third parties monetise convenience fees, flexibility products and cross-sell. IRCTC's convenience fee is a **regulated, parliamentary-scrutinised charge** (it has been the subject of Lok Sabha questions — [Lok Sabha Q&A on IRCTC convenience fees](https://sansad.in/getFile/loksabhaquestions/annex/187/AU5460_3sYubT.pdf?source=pqals)). Any POC feature implying a new user-facing charge should be presented as an option requiring policy approval, not a shipped decision.

---

# E. Prioritised feature recommendations for the POC

Ordered by (user pain × demo impact) ÷ implementation risk. Items 1–4 are the ones that would make a redesign feel categorically different rather than merely cleaner.

**1. Unified journey search that returns itineraries, not trains.** One origin→destination→date query returns direct trains, same-train segment alternates, multi-leg combinations, and nearby-station options in one ranked list — each annotated with confirmation likelihood, fare delta versus direct, and total duration. This is ConfirmTkt Alternates + Japanese transfer-first search + VIKALP, unified. Highest single differentiator. *(Constraint: §D3 disclosure.)*

**2. A payment and refund state machine the user can actually see.** One order, one status timeline: gateway state, bank reference/UTR, ticket issuance outcome, expected refund date, exception reason, and a transaction-aware escalation path that pre-fills the grievance. This is the P0 in the workspace Issue Atlas, it is the real reason users trust third parties, and it needs no policy change. *(No constraint — pure product.)*

**3. Verification moved out of the booking race.** Pre-window Aadhaar/OTP session establishment, live OTP delivery status, bounded retry preserving form state, and a visible "you are verified and ready" state before Tatkal opens. Directly targets the documented OTP/logout failures and works *with* the January 2026 rules rather than against them. *(Constraint: §D5 — cannot eliminate the OTP, only reposition it.)*

**4. Evidence-based confirmation guidance instead of a prediction percentage.** "WL 22 in 3A on this train: in the last 10 departures, waitlist cleared to 34, 31, 40, 28…" plus a plain-language band. Honest, auditable, and more useful than a number. Pair with a **best-chance-of-confirmation calendar** across nearby dates — the Indian analogue of a best-fare calendar. *(Constraint: §D1.)*

**5. Plain-language status vocabulary everywhere.** WL / RAC / PQWL / TQWL / CNF explained inline at the point of decision, with the consequences of each spelled out before payment. Doubles as an accessibility win (never colour-only) and addresses a documented comprehension failure.

**6. Offline-first journey mode.** Ticket, coach position, platform, boarding point and destination alarm all available with no connectivity. The Where is my Train inversion. Cheap to build, immediately legible in a demo, and directly relevant to the 78%-mobile-only user base.

**7. Berth review-and-override.** Algorithm assigns; user sees an annotated coach map (side-lower, near-toilet, near-door, window) and may change within permitted bounds, free, before or after booking. Amtrak's pattern, layered on IRCTC's existing preferred-seat input. *(Constraint: §D4 — do not present as free seat selection.)*

**8. Crowding / occupancy forecast per train.** DB's demand indicator, adapted. Sets journey expectations and, if paired with self-check-in, generates a live occupancy signal that improves waitlist clearing models. Novel for Indian rail. *(Constraint: §D6 — label estimates as estimates.)*

**9. Hindi + English complete, including failure states.** Not twelve partial languages. Demonstrate the localisation architecture; complete two locales end-to-end including refund and error copy.

**10. Accessibility as a visible, measured commitment.** Implement the SNCF station-readback pattern, expose text-size controls, keyboard-complete the booking path, integrate Divyangjan assistance into the flow, and state GIGW 3.0 / WCAG 2.1 AA as the target with an honest note that full conformance requires assistive-technology testing and expert audit beyond a POC.

---

## Source-reliability notes
- **Strongest evidence:** IRCTC/Ministry policy documents and terms, DB/SNCF/Amtrak/Trainline official pages, dated mainstream press on official announcements, and company financial results.
- **Vendor operational documentation** (ConfirmTkt's Freshdesk SOPs, ixigo's T&C pages) is unusually reliable for feature mechanics and exclusions — it is written for internal agents and is candid about failure modes in a way marketing copy is not. It remains self-interested about benefits.
- **Treat as marketing:** every prediction-accuracy percentage, every "3X refund" headline, every average-saving figure, and all app-store feature superlatives.
- **Do not cite in a submission without re-verification:** the language-growth percentages in §C4, the "88 checkpoints" count in §B8, the IndiGo fare-family restructure in §B7, the Amtrak screen-count case study in §B5, and any specific figure attributed to Quora or a content-marketing blog.
- **Known unresolved conflict:** PRS post-upgrade capacity is published as both ">1 lakh" and "1.5 lakh" bookings/minute, with the pre-upgrade baseline given as both 32,000 and ~37,000. Present as a range.
- **Genuine gap in the public record:** no quantified IRCTC booking-abandonment funnel and no audited payment success-rate comparison between IRCTC and third-party channels exist publicly. Do not assert numbers for either.
