# IRCTC Redesign — Consolidated Understanding

**Prepared:** 27 August 2026
**Phase:** Pre-build. Nothing is being implemented yet. This document exists so that when we do build, every decision traces to evidence.
**Sources consolidated:** `hackathon.md`, `IRCTC Public Issue & Enhancement Status Atlas.md` (v2), `IRCTC Train-Search Portal and Connected Services_ Feature Research.md`, `irctc_research_notes.md`, `important_things.md`, `ideas.md`, plus four fresh research passes captured in `research/prs-berth-allocation-research.md` and `research/competitive-benchmark-third-party-and-global-rail.md`.

---

## 0. Read this first — the schedule problem

The hackathon brief in `hackathon.md` puts the **Round 1 deadline at 28 August 2026, 8:00 PM IST**, with late submissions explicitly not accepted. Today is **27 August 2026**.

That leaves roughly **one working day**, and Round 1 requires four things that all take real time:

1. A **live public link** that opens in a browser
2. A **2-minute demo video** (minute one as a citizen, minute two on how and why it was built)
3. **Exactly 250 words** of written summary
4. A **partner email** cross-match, or blank if solo

**Confirmed 27 Aug: the deadline is firm.** Round 2 is 7 September, after a mentorship week for the top 250.

**Decision taken: we build the full surface in Phase 1, and use Phase 2 to deepen it** — not to add missing features. Reasoning: the brief judges a *live link*, and a link with dead ends reads as a prototype. Round 2 is a refinement round for the top 250, so arriving with a complete surface is a stronger position than arriving with a quarter of one and a roadmap.

**The constraint this creates, and how we handle it.** The limiting factor is not the app, it is the **2-minute video** — you physically cannot demo ten features in two minutes. So:

- **Breadth lives in the app.** Every route works, nothing is a dead end, judges can explore.
- **Depth lives in the video.** Minute one follows one citizen through one spine. Minute two is explicitly for "how you built it, why, and the decisions you made" — that is where the wider surface and the Phase 2 plan get named, in speech, not in screens.
- **The 250 words stay on the product**, not the roadmap. Every word spent on "we plan to" is a word not spent on "this is better because".

**Feasibility is real but only because the features collapse into few surfaces.** See Section 9 — ten features become **seven screens plus the agent**, because several items are cross-cutting layers rather than separate destinations. The build order there is arranged so that *any* point we stop at is still a coherent product.

---

## 1. What we are being asked to do

| Requirement from the brief | What it means for us |
|---|---|
| Rebuild a public service platform end-to-end as a **complete POC** | Mock data, mock backend, mock accounts are all fine. Production scale is explicitly not required. |
| **Must open in a web browser** | No mobile-app-only build. Judges will not download anything. Responsive web, hosted on Vercel or similar. |
| **Instant working test credentials** | A visible demo login on the landing screen. Pre-seeded accounts with booking history, saved passengers, a pending refund, a waitlisted PNR. This is a hard requirement, not a nicety. |
| **Only the consumer side is judged** | No admin panels. Assume the admin side is perfect. Every hour spent on it is wasted. |
| **Ideas over code** | Energy goes into interface, interaction and the *decisions*. Not backend plumbing. |
| **Bold, useful, unique features** | Maps, calculators, chatbot-driven flows are called out as good examples. Novelty must reduce time-to-task. |
| **Skip the bells and whistles** | Explicitly: no 3D, no Three.js showpieces. "Useful beats flashy." |
| **Built for busy, frustrated citizens** | The measure is "faster and significantly simpler than the site they use today." |

**The judging reality worth internalising:** IRCTC is one of the ten listed platforms, which means judges know it and will likely see many IRCTC entries. Most of those entries will be "the same site but clean." Our advantage has to be that we understand what actually broke and what IRCTC has *already fixed itself* — because building a fix for a problem that shipped in July 2026 makes us look uninformed.

---

## 2. What IRCTC actually is (and what it is not)

This distinction matters because it determines what we are allowed to redesign.

```
Indian Railways (Ministry of Railways)
│
├── CRIS — Centre for Railway Information Systems
│   ├── PRS  ······· the reservation engine. Design from 1986, current
│   │                deployment 2010 on Itanium/OpenVMS, network "CONCERT".
│   │                Owns inventory, quotas, waitlists, RAC, charts.
│   ├── NTES ······· live running status / "Spot Your Train"
│   ├── RailOne ···· super-app, launched 1 Jul 2025 (absorbed UTS 1 Mar 2026)
│   └── Rail Madad, CoachMitra, Rail Sugam
│
└── IRCTC (a listed company)
    ├── NGeT ·········· the e-ticketing front end. This is "the IRCTC website".
    │                   Production nget + the /eticket/ beta from 15 Jul 2026.
    ├── Rail Connect ·· IRCTC's own mobile app
    ├── iPAY ·········· IRCTC's payment gateway (AutoPay / one-time mandate)
    ├── eWallet ······· closed prepaid instrument, rail tickets only
    ├── AskDISHA 2.0 ·· AI assistant (with CoRover.AI), text + voice
    └── Commerce ······ eCatering, Air, Hotels, Bus, Tourism, Bharat Gaurav, loyalty
```

**Consequences for our build:**

- **We are redesigning NGeT, not PRS.** Inventory rules, quota mechanics, charting and allocation are PRS behaviour we must *model faithfully*, not redesign. Getting them right is what makes the POC credible to a judge who knows the domain.
- **The ecosystem is genuinely large** — flights, hotels, buses, tour packages, retiring rooms, food, loyalty cards, tourist trains. A big share of the "clutter" complaint is this ecosystem competing with the ticket. Our answer should be *hierarchy*, not deletion: rail booking and ticket management dominate; everything else is discoverable but subordinate and contextual (offer eCatering **after** a ticket exists, on the journey it applies to).
- **There are three official front doors** — IRCTC web, Rail Connect, RailOne — with no canonical channel and possibly different convenience fees. That is a real, current, citable defect and a legitimate thing for our POC to take a position on.

---

## 3. Ground truth: the rulebook as of 27 August 2026

This is the section that keeps us honest. A judge who books Tatkal will spot a wrong rule instantly. Every line here is sourced in the Atlas or the research files.

### Booking windows

| Rule | Current value | Since |
|---|---|---|
| Advance Reservation Period | **60 days**, excluding date of journey. Opens **08:00**. | 1 Nov 2024 (was 120 days) |
| Foreign Tourist quota ARP | 365 days | current |
| Tatkal opening | **10:00 AC** (2A/3A/CC/EC/3E), **11:00 non-AC** (SL/2S). One day before journey, excluding the journey date. | unchanged |
| Tatkal in 1A / Anubhuti | **Not available.** No concessions in Tatkal. Max **4 passengers** per PNR. | current |
| Agent lockout | First **30 minutes** of each Tatkal window; first **10 minutes** of ARP opening. | 1 Jul 2025 |
| Aadhaar for Tatkal | **Mandatory.** OTP to the Aadhaar-linked mobile, all channels including counters and agents. | 1 Jul 2025 / OTP 15 Jul 2025 |
| Aadhaar-only window on ARP opening day | Started at first **15 minutes** (1 Oct 2025), widened to 08:00–10:00, then –12:00, then –16:00, then progressively toward 00:00. | 12 Jan 2026 |
| Monthly ticket limit | **12** without Aadhaar, **24** if the profile *and* at least one travelling passenger are Aadhaar-authenticated. | since 2022 |

### Charting and the endgame

| Event | Current timing |
|---|---|
| **First chart** | ≥ **10 hours** before departure for trains leaving 14:01–23:59 and 00:00–05:00. **By 20:00 the previous day** for trains leaving 05:01–14:00. (Railway Board circular, 12 Dec 2025. Changed three times in 18 months: 4h → 8h → this.) |
| **Remote-location chart** | Prepared separately, typically 2–3 hours before the train reaches that station. This is why RLWL status changes long after the origin chart. |
| **Second / final chart** | **T-30 minutes** |
| **Current booking** | Post-chart, on residual vacancies, until T-30 min. Confirmed tickets only. Vande Bharat extended to **T-15 min**. |
| **Boarding-station change** | Now allowed until the final chart, roughly **T-30 min** (was 24 hours). Not available on waitlisted tickets. |

### Waitlist, RAC and refunds

| Rule | Current value |
|---|---|
| Waitlist cap | **60% of capacity for AC classes, 30% for non-AC** (28 Jun 2025) |
| Waitlisted passengers boarding reserved coaches | **Barred since 1 May 2025.** Penalty ₹250 sleeper / ₹440 AC plus fare, offloaded at the next station. RAC holders *can* board and get a seat. |
| Auto-cancellation of fully waitlisted e-tickets | Automatic at charting, refunded to source, **minus clerkage of ₹60**; convenience fee **not** refunded. Confirmed in Lok Sabha, 25 Mar 2026. |
| Cancellation refund bands | **>72h**: flat charge only · **72–24h**: 25% deducted · **24–8h**: 50% deducted · **<8h**: **no refund**. (Tightened from 48/12/4, effective 1–15 Apr 2026.) |
| Confirmed Tatkal cancellation | No refund. |
| RAC e-ticket | No refund unless cancelled or TDR filed online up to **30 minutes** before departure. |
| **TDR filing** | **Abolished — refund is now automatic.** (Mar 2026 "Reform Express") |
| Vande Bharat Sleeper | **Confirmed tickets only** — no RAC, no waitlist. Minimum chargeable distance 400 km. |
| Convenience fee | ₹15 + GST non-AC, ₹30 + GST AC; ₹10 / ₹20 for UPI. *Best-supported figures; not re-confirmed officially for 2026. Actual realisation ~₹19/ticket in Q1 FY27.* |

### Waitlist codes, and why they differ

| Code | Pool it draws on | Practical odds |
|---|---|---|
| **GNWL** | General quota, journey from or near the originating station. Largest pool. | Best |
| **RLGN** | An RLWL redefined against general quota from the remote location onward | Middling |
| **PQWL** | One pooled quota shared across many small stations for the whole run | Poor |
| **RLWL** | Cancellations to that *specific* destination only; charted separately by the remote location | Poor |
| **RSWL** | Origin to a roadside station only | Poor |
| **RQWL** | Between two intermediate stations covered by no quota | Poor |
| **TQWL** | Tatkal waitlist. **Does not get priority at charting** — GNWL clears ahead of it. | Worst |

**RAC is officially not a quota.** CRIS's own definition: "a special provision to 'split' a berth into two or more seats… this is really speaking not a quota." Two RAC passengers share one side-lower berth.

**Quota code trap to avoid in our data model:** `PH` = **Parliament House**. `HP` = **Physically Handicapped / Divyangjan**. Third-party PNR parsers get this backwards routinely.

### Scale, for framing the problem honestly

- **65.08 crore** reserved tickets Jun 2025 – Jun 2026; **57.90 crore (89%) online**
- **~20.5 lakh** passengers/day through PRS; **~14 lakh** book online daily
- **~4 lakh users log in between 10:00 and 11:00** for Tatkal
- Throughput **32,000/min** (NDTV, ET) or **~37,000/min** (IRCTC). Target **">1 lakh"** (IRCTC) or **"1.5 lakh"** (PIB). *Cite the range, attribute it.*
- **3.39 crore passengers could not travel in FY 2025-26** on unconfirmed waitlists — ~92,877/day, rising every year for five years
- **58%** of booking requests were bots in the six months to July 2026; **70.7%** at the October 2025 peak
- Claimed website uptime **99.98%** (Apr–Oct 2025, Lok Sabha)

---

## 4. What IRCTC has already fixed — do not build these

This is the most commercially important section in the document. Building a solution to a solved problem is the fastest way to look uninformed.

**Shipped 15 July 2026 — the redesigned IRCTC beta at `irctc.co.in/eticket/`.** Four officially confirmed changes:

1. No unnecessary CAPTCHAs, pop-ups or flashing graphics — and IRCTC states no advertisements
2. **Seat availability across all classes on one screen**
3. Fewer steps to complete a booking
4. Saved passenger details for repeat bookings

Origin story worth knowing, because it will come up: a student at MNIT Jaipur asked the Railway Minister to fix the CAPTCHA; the video went viral; he ordered a new site in 30 days. The redesign was triggered by a viral question, not by internal telemetry.

**Also already shipped:** automatic TDR (no filing), boarding-station change until the final chart, earlier charting, higher waitlist caps, RailOne consolidating UTS/NTES/IRCTC/Rail Madad under single sign-on, and an officially-claimed jump in waitlist prediction accuracy from **53% to 94%**.

**Also table stakes now, per reporting:** a fare calendar and multi-language support. *Caveat: both are reported by outlets but absent from the Ministry's own four-point list, so treat as phased.*

### So these are dead as differentiators

| Do not pitch as our innovation | Why |
|---|---|
| "We removed the CAPTCHA" | IRCTC did, in July 2026 |
| "All classes on one screen" | Same |
| "Saved passengers / faster checkout" | Same |
| "A fare calendar" | Reported as shipped |
| "A cleaner, modern UI" | Every other entry will claim this |
| "One-tap Tatkal" | **Legally impossible.** Aadhaar OTP is compulsory. |
| "AI waitlist prediction" | RailOne already ships it and claims 94% |
| "Their chatbot can't book tickets" | **False.** AskDISHA 2.0 books, cancels, checks refunds, changes boarding station — by text *and* voice, in four languages. See Section 9.5 for the claim that *is* defensible. |

### And this is the surprise: seat selection has *not* shipped

`important_things.md` in this workspace expected airline-style seat selection "by end of 2025." Here is where it actually stands:

- PIB (29 Jun 2025) says users "will be able to **submit their choice of seat**" — that is a **preference payload, not a seat map**. The airline analogy is press framing.
- The December 2025 target slipped.
- Seat selection is **absent from the Ministry's four-point beta feature list** and **absent from the PIB August 2026 next-gen PRS feature list**, though several outlets reported it as a beta feature.

**Verdict: announced, officially acknowledged, not shipped.** This is genuinely open ground — provided we approach it correctly (Section 6).

---

## 5. The three problems still wide open

Everything in the Atlas collapses to three spaces where an ambitious POC can be both novel and credible.

### 5.1 Transactional legibility — "where is my money, my ticket, my refund"

The most persistent complaint across every source and the only P0 that needs **no policy change whatsoever**.

Money leaves the account. No ticket exists. The status reads "initiated" or "not received." The user is handed between portal, gateway and bank with **no shared state**, and IRCTC's own rules note that bank transaction charges "are likely to be forfeited." Verified in the April 2026 Tatkal incident and independently by the South Western Railway Passengers Committee, who reported RailOne failing with "payment failed/processing" or debiting without confirmation, "especially during Tatkal booking."

The competitive research is blunt about why third-party apps feel more reliable: there is **no audited evidence** they settle better. What they own is the *narrative* — one order ID, one status timeline, one support thread. That is a design problem, not an infrastructure problem.

**IRCTC already has the mechanism.** iPAY AutoPay places a lien and captures only on successful booking, releasing the hold on failure. It exists as one option among many. Making hold-then-capture the default, and making the state machine visible, removes most of this failure class.

### 5.2 Decision support under scarcity — "this train is full, now what"

**3.39 crore passengers a year** do not travel because their waitlist never cleared. For most users in a peak window, the honest answer is that they will not get a confirmed berth on their first-choice train. The current system lets them queue and lose.

Third parties built the answer and it is purely a search layer over IRCTC's own inventory. ConfirmTkt's "Alternate Options" (internally "Train Jugaad") enumerates four combinations:

1. Board at an **earlier station** on the same train where inventory remains
2. Ticket to a **later station** than needed
3. **Both** changed
4. **Multi-leg on the same physical train** — no seat A→C, but A→B and B→C both available

The mechanism is unused per-segment quota on the same train from other originating stations.

**Read ConfirmTkt's own internal support runbook before copying this** — it is candid about the failure modes: users complain the app "booked the wrong stations"; users complain of overcharging because fare is charged origin→destination rather than boarding→destination; agents are instructed not to use the internal term with customers. The feature is valuable and its failure mode is **user surprise about what was purchased**.

**IRCTC's own VIKALP solves the same problem passively and far too late** — only fully-waitlisted-after-charting passengers qualify, allocation is not guaranteed, stations can shift to cluster stations, and the user must re-check the PNR after the alternate train's chart. Nothing surfaces alternatives *at search time*, when the passenger still has agency.

**One fairness caveat we should state openly rather than hide:** systematically routing users into longer origin→destination tickets raises their fare and consumes inventory other travellers wanted. At IRCTC's scale that is a resource-allocation policy, not a convenience feature. Our POC should present it with explicit, itinerary-level disclosure and acknowledge it needs a fairness review — that honesty is itself a differentiator.

### 5.3 Verification that does not consume the booking window

Aadhaar OTP is mandatory and it fires *inside* the race. The documented cost: OTP slow by SMS then also by email, app glitching mid-flow, **15–20 minutes lost**. Add RailOne's password-expiry-with-no-warning combined with daily mPIN login, so nobody remembers the password and reset depends on the same slow OTP chain.

The rules have only expanded — Tatkal (Jul 2025) → all channels (Jul 2025) → first 15 minutes of general booking (Oct 2025) → a **16-hour** Aadhaar-only window on ARP opening day (Jan 2026). The Kerala High Court upheld the regime on 23 July 2026 while suggesting PAN as an alternative.

**We cannot remove the OTP. We can move it out of the race.** Pre-window session establishment, live OTP delivery state, bounded retry that preserves form state, a visible "verified and ready" badge before 10:00. This is the one thing in the entire competitive landscape that **no third party can do better than IRCTC**, because only the first party can pre-establish a verified session.

---

## 6. Berth allocation — what we can faithfully model

`important_things.md` asked for the seat distribution algorithm. Here is the honest answer, because it changes what we should build.

### 6.1 There is no published algorithm, and the popular story is folklore

The widely repeated claim — middle coach of the rake filled first, berths roughly 30–40 filled first, lower berths first to keep the centre of gravity low, all to balance the train — has **no** Railway Board circular, PIB release, RTI reply, CRIS document or Parliament answer behind it. Every instance traces to a handful of Quora answers copy-pasted since around 2016, and **they disagree with each other on the numbers** (30–40 vs 30–70 vs "36"), which is the signature of folklore.

It is also dubious on the engineering: 72 passengers at ~70 kg is roughly 10% of a loaded sleeper coach's gross weight, spread over two bogies. Passenger distribution within a rake is not a stability constraint any railway manages through ticket allocation.

**Do not build it.** If we want it as an easter egg, gate it behind a flag labelled folklore.

### 6.2 What *is* official

**Lok Sabha USQ 4554 (29 Mar 2017)** — a question asking precisely why seats cannot be pre-selected. It establishes:

1. First-come-first-served
2. "Berths/seats of choice are allotted **subject to availability** at the time of booking"
3. Coach and berth are assigned until confirmed accommodation is exhausted
4. RAC/WL that clears *before* charting gets **no berth number** until the first chart — "with a view to ensuring **compaction of the party**"
5. **1A is never assigned a berth at booking.** Charted, to handle High Official Requisition holders, avoid placing a lone female in a coupé with a male, keep families together, and give seniors lower berths

**Compaction and age/gender-sensitive placement are the only optimisation objectives Indian Railways has ever named.** Both are applied at charting.

**The only allocator CRIS has actually published** is the TTE hand-held terminal manual (23 Dec 2022): turned-up RAC → Part-WL → Full-WL/standing; strictly by **lowest RAC/WL number within the selected coach, not berth sequence**; "nearest vacant berth in that coach or any other nearest Coach"; leftovers released back to PRS. It states explicitly that RAC number → chart berth number is **not monotonic** ("RAC 3 may be allotted to berth 23, and RAC 5 to berth 15").

### 6.3 Why solo travellers get middle and upper berths

Not a penalty. Four documented mechanisms compounding:

1. **Structural scarcity** — only 18 of 72 sleeper berths are lower, 9 are side-lower. Middle + upper is 36 of 72.
2. **Quota lock** — 6–7 lower berths per sleeper coach, 4–5 per 3A, 3–4 per 2A are reserved for the combined senior-citizen / women-45+ / pregnant-women quota before general booking opens.
3. **Automatic lower-berth allotment** diverts remaining lowers to men 60+ and women 45+ **even when no preference is stated**.
4. **Compaction favours groups.** A bay of 8 absorbs a family cleanly; a stream of singletons fragments it. Side and middle berths are the residue.

**This is fully explainable and has never been explained to the user.** That is a free win: the same allocation, made legible, stops feeling arbitrary.

### 6.4 Berth layout reference for the mock engine

| Class | Capacity | Berth-type cycle | Confidence |
|---|---|---|---|
| **SL / 3A** | 72 (LHB), 64 (older ICF 3A) | mod 8: `LB, MB, UB, LB, MB, UB, SL, SU` | **Cross-confirmed** |
| **2A** | 46–54 | mod 6: `LB, UB, LB, UB, SL, SU`, then 43–46 as a final 4-berth compartment with no side section | Third-party decoder |
| **3E** | 81–83 | mod 9: adds a **side middle**; 82/83 as a 2-berth tail | **Least certain — make configurable** |
| **CC** | 73–78 (3+2) | mod 5: `WS, M, A, A, WS`. Row orientation flips mid-coach on some rakes | Third-party decoder |
| **EC** | 46–56 (2+2) | mod 4: `WS, A, A, WS` | Third-party decoder |
| **2S** | ~108 (3+3) | mod 6: `WS, M, A, A, M, WS` | Third-party decoder |
| **1A** | 18–26, varies more than any class | **Do not model berth numbers at all.** No berth at booking; chart shows cabin/coupé. | Official |

Only `WS` (window side) is printed on a ticket for seating classes; middle and aisle are not.

**Quotas to carve out before general booking opens:**

| Quota | Allocation |
|---|---|
| Combined lower-berth (senior citizens, women 45+, pregnant) | **6–7 per sleeper coach, 4–5 per 3A, 3–4 per 2A**, varying with how many coaches of that class the train has |
| Ladies | **6 berths per train** in sleeper (+6 in 3A on Garib Rath / Rajdhani / Duronto / fully-AC). *Per train, not per coach — commonly got wrong.* |
| Divyangjan | 4 berths (**2 lower + 2 middle**) in sleeper; 4 in 3A **or** 3E; 4 seats in 2S/CC. Vande Bharat: **seat 40 in C1 and C7** (8-car) or **C1 and C14** (16-car), plus one adjacent escort seat each |
| Tatkal / Premium Tatkal | ~20% of daily berths overall. The only officially published *size* anywhere is EC at "10% of accommodation i.e. 5 seats per coach" |
| Also | Pooled, Roadside/remote-location, Defence, Duty Pass, Railway Employee, Foreign Tourist, Yuva, Cancer Patient, Parliament House, HOR/Emergency |

**Per-coach RAC counts are community-only** (commonly 7 side-lowers in SL, 4 in 3A, 3 in 2A, each split into 2 seats). No official figure exists. Make it a config value.

**Auto-upgradation ladders** (Railway Board circular, 13 May 2025): sleeping `2S → 3E → 3A → 2A → 1A` with only a 2A holder eligible for 1A; sitting `2S → VS → CC → EC → EV → EA` with only a CC holder eligible for EC/EV/EA. Maximum two levels, no crossover between sitting and sleeping, full-fare passengers only, and lower-berth passengers are warned that a lower berth is not assured after upgrade.

### 6.5 The allocator we should implement

Faithful to everything documented, inventing nothing:

**At booking**
1. Strict FCFS on transaction timestamp
2. Resolve quota → pool; if empty, fall through to RAC, then the correct waitlist type for that origin-destination pair (GNWL / PQWL / RLWL / TQWL / RSWL / RQWL)
3. Within the pool, apply in order: **(a)** age/gender auto-lower-berth for men 60+, women 45+, pregnant — even with no stated preference; **(b)** party compaction, preferring one bay then one coach; **(c)** stated berth preference; **(d)** deterministic fallback
4. Enforce hard reservation choices by rolling back the whole transaction — "book only if confirmed", "book only if at least one lower berth", "book only if 2 lower berths"
5. **1A: assign no berth.** Status `CNF` only
6. **RAC/WL that clears before charting: assign no coach or berth.** Defer to charting

**At charting** — fire at the class-appropriate offset, then in this order: RAC→CNF and WL→CNF/RAC · assign coach and berth to all deferred-confirmed tickets **with compaction as the objective** · assign 1A cabins/coupés with the gender and family rules · run auto-upgradation and cascade the vacated berths · release unutilised Tatkal multi-leg portions to general RAC/WL · run VIKALP allotment · open current booking · second chart at T-30 min

**Onboard** — implement the HHT semantics faithfully, since it is the only published allocator: attendance gates allocation; priority strictly by lowest RAC/WL number within the coach; nearest vacant berth in that or the nearest coach; vacant lower berths go on priority to senior citizens, persons with disabilities and pregnant women holding middle or upper berths; leftovers released back to inventory.

**The correct pattern for our "seat selection" feature is Amtrak's, not an airline's:** the algorithm assigns, the traveller reviews an **annotated** coach map, and may change within permitted bounds, **free**, before or after booking. That preserves compaction and quota equity while giving agency. Annotate *why* a berth is good or bad — side-lower, near toilet, near door, no window — which is the layer even ixigo's seat map does not provide.

---

## 7. Competitive landscape — the framing that changes everything

**Third-party apps do not compete with IRCTC on inventory.** ixigo, ConfirmTkt, RailYatri, Trainman and Paytm are all IRCTC-authorised partners, booking the **same PRS inventory at the same government fare**, several using the user's own IRCTC credentials. They compete purely on **decision support, journey construction and post-booking care**.

So almost every feature they have is **already legally and technically available to IRCTC**, which has strictly better data access. The gap is product, not permission.

### What to borrow, and from where

| Pattern | Source | Why it transfers |
|---|---|---|
| **Algorithm assigns, user may override free** | Amtrak (Mar 2025) | The compliant path to seat selection. Preserves the load-distribution and equity logic that allotment exists to serve. |
| **Demand / crowding indicator** | DB Navigator | Qualitatively different from a seat count. Sets journey expectations, not just transaction expectations. |
| **Self-check-in on board** | DB Komfort Check-in | Maps onto TTE verification, reduces onboard friction, and would give Railways a **live occupancy signal** that improves no-show and RAC-clearing models. Genuinely novel for Indian rail. |
| **Honest framing of split tickets** | Trainline SplitSave ("stay on the train, just switch tickets") | The reason UK users don't feel tricked. Our Jugaad-equivalent needs one equally short honest line. |
| **Station readback region for screen readers** | SNCF Connect | Targeted fix for IRCTC's documented station-autocomplete failures. SNCF also *publishes measured* conformance (84.42% global / 96% average vs RGAA) — publishing a number is itself the pattern. |
| **Transfer-first itinerary search** | Japan (Norikae Annai / ekitan) | Search returns an *itinerary*, and the system decides whether the answer is one train, two trains, or a train plus a bus. Same primitive that makes Alternates work — just as the default. |
| **Offline-first journey mode** | Where is my Train (cell-tower positioning, no internet, no GPS) | **78% of India's internet users are mobile-exclusive.** Connectivity exists when booking and often not when travelling — backwards from how most apps are built. |
| **Flexibility as a fare attribute** | IndiGo Flexi / IndiGo Lite | The legitimate first-party version of what ixigo sells as "Assured Flex". |

### What to treat as marketing, not fact

- **Every prediction-accuracy percentage.** ConfirmTkt's 75%/78% and Trainman's ">90%" are all company-supplied with no methodology, no calibration curve and no definition of "correct." Since most waitlisted tickets do confirm, a naive always-confirm baseline already scores high.
- **The "3X refund" headline** = 1X cash + **2X restricted store credit**, payable only if fully waitlisted at charting, void on RAC or partial confirmation or user cancellation, coupon capped ₹6,000 with 7-day validity, max 3 bookings/month.
- **"Free cancellation"** excludes the service charge, the IRCTC convenience fee, payment-gateway charges and the flex fee itself.
- **Payment reliability.** No audited comparative success-rate data exists in either direction.

### The single most telling piece of evidence

There is an active grey market of **Chrome extensions and open-source Cypress scripts** automating IRCTC login, passenger entry, CAPTCHA retry and even UPI payment for Tatkal. Users are writing browser automation to survive the official booking form. That is not a user problem. That is a spec.

---

## 8. Design direction

`ideas.md` already settled this, and it holds up: **Signal Archive** — Swiss information design read through Indian railway wayfinding.

- **Signature colour:** Atlas Cobalt `#0B4E9A`. Railway saffron `#E97A23` for action and discovery. Deep ink `#17202B`. Warm paper field `#F4F0E7`. Muted green `#2B6B59` for verified supporting services.
- **Type:** `DM Serif Display` for titles, `IBM Plex Sans` for body, controls, tables and data. Letter-spaced Plex Sans medium for eyebrow labels. Explicitly **not** generic Inter.
- **Layout:** asymmetrical station board. Narrow vertical service spine at desktop widths, content unfolding in staggered bands. No centred SaaS hero.
- **Motion:** 160–240ms opacity and transform only. Reduced-motion respected. This aligns exactly with the brief's "skip the bells and whistles."
- **Voice:** compact and declarative. "Every service, shown in context." Microcopy distinguishes what was observed from what was inferred. No "Welcome to our website."

**Existing assets:** `index.css` and `atlas-enhancements.css` are a working Tailwind v4 implementation of this system — tokens, the route spine, station-board motifs, stamped timetable annotations. Built for the research microsite, not the product, but the **tokens and motifs carry over directly**. We should not restyle from scratch.

**One adaptation needed.** Signal Archive was designed for a *research atlas* — an editorial artefact. The product is a **transactional tool used under time pressure**. The archival character has to yield to speed on the critical path: the search-to-payment flow needs large tap targets, tabular numerals, ruthless hierarchy and zero decoration. Keep the archival voice for the explanatory layers — the berth explanation, the waitlist evidence, the refund timeline — where it genuinely helps a citizen feel informed rather than managed.

---

## 9. Our differentiation thesis, and what to build

**The thesis in one sentence:**

> IRCTC has fixed how the page *looks*. It has not fixed what the citizen cannot *see* — where their money is, what their real options are when a train is full, and whether they are ready to book before the clock starts.

Everything we build ladders to that, and the **agent is the delivery vehicle** — the fastest way to show a citizen that all three gaps closed at once. Full scope ships in Phase 1; Phase 2 deepens it.

### 9.1 Scope: platform decision

**Web application only.** No mobile app, no native build. This aligns with the brief, which states plainly that judges will not download mobile apps and anything that does not open in a browser will not be reviewed.

Where "mobile" still matters: the app must be **excellent on a phone browser**, because 78% of India's internet users are mobile-exclusive. And the offline journey ticket is delivered as an **installable PWA with a service worker** — still a browser artefact, still opens at a URL, no app store. That keeps the offline promise honest without breaking the platform rule.

### 9.2 Ten features, seven surfaces

The features are not ten independent destinations. Several are cross-cutting layers. Collapsing them is what makes full scope feasible.

| Surface | What lives here | Features folded in |
|---|---|---|
| **1. Search** | Station autocomplete with screen-reader readback, date, class, quota. Visible demo login. Persistent agent entry point. | — |
| **2. Results — itinerary-first** | Direct trains, same-train segment alternates, multi-leg combinations, nearby-station options, all in one ranked list. All-class availability inline. Confirmation *evidence* per option. Fare delta versus direct. Best-chance-of-confirmation strip across nearby dates. | 1, 5 |
| **3. Review & berth** | Passengers from the saved list, berth preference, reservation choice (confirm-only / lower berth). Explained allocation plus annotated coach map with free override. | 6 |
| **4. Payment** | Hold-then-capture (iPAY AutoPay semantics) as the default, not an option. | 2 |
| **5. Order & PNR timeline** | The visible state machine: gateway state → bank reference/UTR → issuance outcome → expected refund date → exception reason → escalation owner, with the grievance pre-filled from the failed transaction. Automatic-TDR status. | 2 |
| **6. Journey** | The ticket itself, offline-capable. Coach position, platform, boarding point, crowding forecast, self-check-in, destination alarm. Visible data age on anything estimated. | 7, 8 |
| **7. Ready-to-book console** | Pre-window verification: verified badge, live OTP delivery state, bounded retry preserving form state, a pre-filled draft armed before the Tatkal window opens. | 3 |
| **Agent** | Persistent. Drives surfaces 1–6 rather than replacing them. | See 9.4 |

**Cross-cutting layers, not screens** — these are build discipline and get applied everywhere:

- **Plain-language status** (feature 4) is a reusable component: WL / RAC / PQWL / TQWL / CNF with consequences stated, including that a fully waitlisted passenger **may not board** a reserved coach and faces a ₹250/₹440 penalty. Never colour-only.
- **Hindi + English complete** (feature 9) is an i18n layer covering error messages, refund copy and the status explanations — the places partial localisation usually breaks.
- **Accessibility** (feature 10) is how we build, not a page: keyboard-completable booking, text-size controls, station readback, Divyangjan assistance inside the flow, no timed CAPTCHA in the critical path.

### 9.3 Build order — arranged so any stopping point is still coherent

1. **Shell, tokens, mock data, demo login.** Signal Archive tokens already exist in `index.css`.
2. **Search → Results (itinerary-first).** The core differentiator. If only this works, we still have a submission.
3. **Agent driving search → results.** The demo's centre of gravity.
4. **Minimal Review → Payment → Order timeline.** Closes the loop end-to-end; the P0 in the evidence.
5. **Enrich Review** with the explained allocation and annotated coach map.
6. **Ready-to-book console.**
7. **Journey surface + PWA offline ticket.**
8. **i18n and accessibility pass.**

Rule for the day: **never leave the app in a state where a route dead-ends.** A stubbed screen with honest copy beats a broken one.

### 9.4 The agent — our lead differentiator

This is the strongest idea on the table and it deserves its own section. See **Section 9.5** for the specification, including one factual correction that matters before we record the video.

### Hard constraints to respect, and to state openly in the submission

| Constraint | What it means |
|---|---|
| **Aadhaar OTP cannot be removed** | Reposition it, never claim to eliminate it |
| **A prediction % from IRCTC becomes a quasi-official forecast** | Show historical evidence, not a verdict. "WL cleared to 34, 31, 40" is a defensible statement of fact; "72% chance" invites grievance escalation |
| **IRCTC cannot insure against its own refund policy** | More flexibility needs a *fare-rule* change (a flexible fare), which is a Railway Board matter, not a product decision |
| **Seat selection must be override-on-allocation** | Never a blank seat map. Charging for berth choice on a subsidised public service is a policy question with equity implications, not a UX decision |
| **Segment-quota routing has fairness implications** | It raises the user's fare and consumes others' inventory. Disclose at itinerary level and acknowledge it needs review |
| **Live position must distinguish confirmed from estimated** | An official figure is treated as authoritative and used to decide whether to leave for the station |
| **New user-facing charges** | Present as options requiring policy approval, not shipped decisions. The convenience fee is under parliamentary scrutiny |

---

## 9.5 The booking agent — specification

### The correction to make before we record anything

The intuition is right, but one framing of it is factually unsafe: **AskDISHA 2.0 already books tickets.** It is not a purely informational bot. Per IRCTC's own material and dated reporting, AskDISHA 2.0 — built with CoRover.AI — supports conversational **booking**, cancellation, PNR status, refund status, boarding-station change and booking history, by **text or voice**, in English, Hindi, Hinglish and Gujarati, with voice-command payment added in early 2025.

So if the video says *"IRCTC has a chatbot but it can't book tickets,"* a judge who knows the platform will catch it, and that single sentence would undermine everything else we claim. Do not say it.

**The defensible claim is sharper anyway.** AskDISHA is a **chat widget bolted beside the site** that runs a scripted slot-filling flow and hands the user a result. What is missing — and what the public record shows going wrong — is *agency with accountability*:

- A user alleged the bot **did not honour a Tatkal confirmation-only preference**.
- A user alleged it **promoted a quick Tatkal route carrying an extra ₹11 charge**, then used regular booking instead.

Both are old and single-source, so we cite them as the *design problem*, not as proven misconduct. But they name the exact failure mode: **a bot that acts on your behalf without showing its work or letting you approve the commitment.**

So our positioning:

> IRCTC's assistant can complete a booking. It cannot show you *why* it chose what it chose, it cannot reason about your options when the train is full, and it commits inside a chat window. Ours proposes, explains, and hands the decision back to you.

That is honest, it is verifiable, and it is a much better story than "theirs doesn't work."

### The flow, with the gaps filled in

The flow described is right for the first two beats and stops short of the moment that actually matters. Full sequence:

| Beat | Agent behaviour |
|---|---|
| 1. **Intent** | *"Book Kollam to Chennai on 12 September."* Extract origin, destination, date. Ambiguity resolved by asking once, not by guessing — station name collisions are a documented IRCTC failure point. |
| 2. **Search, with the work visible** | The agent runs the real search and **the results panel populates as it goes**. Not a text transcript — a synchronised canvas. |
| 3. **Present all classes** | Every class with live availability and status: SL WL 34, 3A RAC 12, 2A CNF 4 left, CC REGRET. Each with its plain-language consequence attached. |
| 4. **Reason about scarcity — the beat nothing else does** | If nothing is confirmed, the agent does not stop at "sorry". It proposes: *"Nothing confirmed on 12624. If you board at Kollam instead of Kayankulam I can get you CNF in 3A — that's ₹85 more and you board 40 minutes earlier. Want that?"* This is where the agent becomes the delivery vehicle for Section 5.2. |
| 5. **Choice** | User picks a class or an alternate itinerary. |
| 6. **Passengers & preferences** | Pull from the saved list. Apply berth preference and reservation choice. Surface the rules that bind: no concessions in Tatkal, max 4 passengers on a Tatkal PNR, auto-lower-berth eligibility. |
| 7. **Explain the allotment** | *"You asked for lower. You're getting side-upper 47 — the 6 lower berths in this coach are held for the senior-citizen quota and the rest went earlier today. Here's the coach map if you want to change it."* |
| 8. **Hand back control before money moves** | The agent **never commits payment in the chat.** It assembles a proposal and drops the user onto the real review screen with a full fare breakdown — base, Tatkal charge, convenience fee, GST — and an explicit confirm action. |
| 9. **Authorise** | Hold-then-capture. The agent explains what a hold means and that money is captured only on successful issuance. |
| 10. **State the outcome plainly** | Including the uncomfortable case: *"This is WL 34. You may not board a reserved coach on a waitlisted ticket. If it doesn't clear it will be auto-cancelled and refunded minus ₹60 clerkage."* |

### Non-negotiable design rules

**Show the work.** Chat plus a synchronised canvas, never a text-only transcript. This is the single largest quality differentiator and it films beautifully in a 2-minute video.

**Never commit money in conversation.** The agent proposes; a human confirms on a real screen. This directly answers both documented AskDISHA complaints and it is the right pattern for any agent transacting on a citizen's behalf.

**The agent must know the rulebook and refuse correctly.** An agent that says *"I can't apply a senior-citizen concession to a Tatkal ticket, concessions aren't allowed in that quota"* is far more convincing than one that silently fills a form. Section 3 is the agent's rule source. Rules it must enforce: Tatkal windows and the 4-passenger cap, no concessions in Tatkal, Aadhaar OTP requirement, waitlisted passengers cannot board reserved coaches, the 72/24/8-hour refund bands, monthly ticket limits.

**Fully deterministic — no model at all.** *Decided 27 Aug:* the agent is a **simulation**, not a language model. Rule-based entity extraction and weighted intent scoring drive ordered calls to the same pure domain functions the UI uses. It cannot hallucinate a fare, a berth or a rule, it cannot be rate-limited while a judge is using it, and it needs no key and no network. See `PLAN.md` §7.11 for the full specification. This is the honest answer for minute two of the video, and it is a stronger engineering story than an API call.

**Bounded authority, visible and audited.** Show what the agent is permitted to do. Keep a step trace the user can open. An agent spending money on a citizen's behalf in a government context needs an audit trail, and showing one is a credibility signal.

**Always an escape hatch.** Any point, drop into the normal UI with state preserved. Chat-only is a trust and accessibility risk — and note the brief's own framing that useful beats flashy. The agent is the fast path, not the only path.

**Text-first for the POC.** Voice is tempting and AskDISHA already has it; it adds recording risk and demo fragility for little marginal credit. Skip it in Phase 1, note it for Phase 2.

### Naming

`AskDISHA` is taken. Options that fit the Signal Archive voice: **Sarathi** (charioteer, guide — apt and Indian), **Signal**, or **Guard** (the railway role responsible for the train's safe passage). Recommendation: **Sarathi**. Decide before the video so the copy is consistent.

---

## 10. Mock data plan

The POC needs data that is *plausible to someone who knows Indian Railways*. Getting this right is cheap and disproportionately convincing.

- **Trains:** a small realistic set on genuinely congested corridors — Delhi–Patna, Mumbai–Ahmedabad, Bengaluru–Hubballi, Kollam–Chennai. Use real train numbers and names where they help recognition.
- **Rake composition:** model one realistic template. The first Amrit Bharat 3.0 rake is a good, dated reference — 22 coaches: 6 × 3A, 2 × 2A, 1 × 1A, 6 × SL, 4 general, pantry, power car, Divyangjan-cum-guard brake van.
- **Inventory states worth seeding deliberately:** one train CNF with few berths left, one at RAC, one at GNWL, one at TQWL, one REGRET, one where the **segment alternate is the only path to a confirmed berth** (the demo's hero moment), and one waitlisted PNR sitting hours before charting.
- **Payments:** seed a success, a pending reconciliation with a UTR, and a debit-without-ticket that resolves visibly on the timeline. This is the entire demo for surface 5.
- **Agent scripts:** seed two or three natural phrasings per intent so the demo is robust — *"book Kollam to Chennai on 12 September"*, *"I need to get to Chennai next Saturday"*, *"where is my refund"*. Include one deliberately ambiguous station name so the agent can be seen asking rather than guessing.
- **Accounts:** an Aadhaar-verified user with saved passengers including a senior citizen and a Divyangjan passenger, and a non-verified user, so the Aadhaar gating and auto-lower-berth rules are both demonstrable.
- **Fares:** derive from plausible per-km rates plus the real Tatkal charge table (2S ₹10–15, SL ₹100–200, CC ₹125–225, 3A ₹300–400, 2A ₹400–500, EC ₹400–500) and the real cancellation bands. Precision here costs nothing and reads as rigour.

---

## 11. Evidence hygiene for the submission

The 250-word summary and the video will make factual claims. These are the ones to be careful with.

**Safe to state:** 89% of reserved tickets are booked online · 3.39 crore passengers could not travel in FY 2025-26 on unconfirmed waitlists · 58% of booking requests in the six months to July 2026 were bots · ~4 lakh users log in between 10:00 and 11:00 for Tatkal · the beta shipped 15 July 2026 with four stated changes · TDR filing was abolished in March 2026 · cancellation inside 8 hours now gets no refund · waitlisted passengers may not board reserved coaches since May 2025.

**State as a range, with attribution:** PRS throughput (32,000 vs ~37,000 per minute) and the target (>1 lakh vs 1.5 lakh).

**Do not state as fact:** that **AskDISHA cannot book tickets** (it can — this is the single most likely own-goal in our pitch, see Section 9.5) · that the beta ships seat selection, a fare calendar or multilingual support (reported, but absent from the Ministry's own four-point list) · any IRCTC booking-abandonment percentage (**no published funnel exists**) · any payment success-rate comparison between IRCTC and third parties (**no audited data exists**) · the "middle coach first / centre of gravity" allocation story (**folklore**) · any specific berth fill order · per-coach RAC counts · that any 2026 IRCTC data breach or fake-app advisory occurred (**none found**).

**Say instead, on the agent:** IRCTC's assistant can complete a booking but cannot explain its choices, cannot reason about alternatives when a train is full, and commits inside a chat window. Two public complaints allege it ignored a confirmation-only preference and pushed a fee-bearing path — old and single-source, so cite them as the design problem, not as proven misconduct.

**Do not invent:** a July or August 2026 outage (none confirmed) · post-launch user reaction to the beta (**no coverage exists in any form**) · a formal accessibility audit (**none exists**).

**Framing that is both true and compelling:** an officially reported **99.98% uptime** coexisting with a Tatkal window that visibly failed in October 2025, December 2025, April 2026 and June 2026; a fairness regime — Aadhaar, OTP, agent lockouts, 58–70% of traffic blocked as bots — that has not closed the perception gap because **supply, not authentication, is the binding constraint**; and a redesign triggered not by internal telemetry but by a student asking the minister to fix the CAPTCHA.

---

## 12. Open decisions

### Settled on 27 August

| Decision | Call |
|---|---|
| Deadline | **28 August is firm.** No slack. |
| Scope | **Build the full surface in Phase 1.** Phase 2 deepens what exists rather than adding missing features. |
| Platform | **Web only.** No mobile app. Offline ticket via installable PWA. |
| Lead differentiator | **The booking agent**, positioned as the delivery vehicle for all three open problems. |
| Agent implementation | **Fully simulated, no LLM, no network.** Deterministic NLU over the mock domain. |
| How Phase 2 gets communicated | **Minute two of the video**, which the brief reserves for decisions and reasoning. Not in the 250 words, not in a roadmap page. |

### Still open

1. **Solo or two-person team?** The brief caps it at two, both must register with the same email used in both rounds, and the partner email cross-match is a submission field. Needs answering today.
2. **Agent name.** Recommendation **Sarathi**. Decide before recording so copy stays consistent.
3. **Which spine does minute one of the video follow?** Recommendation: the agent handling a sold-out train — ask, see all classes, get told nothing is confirmed, receive a segment-alternate that *is* confirmed, review the explained berth, pay under a hold, land on a visible order timeline. That single run touches five of the seven surfaces and all three problems.
4. **Do we take a public position on the three-front-doors problem,** or stay silent? Taking one is bolder and defensible; it also invites the question of what we would deprecate.
5. **Stack.** The existing CSS is Tailwind v4 with React-style class naming, so React + Vite + Tailwind on Vercel is the low-friction path. Mock backend as static JSON plus a thin API layer — enough to make the payment state machine animate through its states convincingly.
6. **How far to take the berth allocator?** A faithful implementation is a strong minute-two story but invisible unless we surface the *explanation*. Recommendation: implement enough to be honest, then spend the effort on legibility.
7. **Do we demo Tatkal explicitly?** It is the most emotionally resonant scenario and the hardest to fake convincingly. If we do, the ready-to-book pre-verified state is the payoff, not a fake countdown.

---

## 13. File index

| File | What it holds |
|---|---|
| **`PLAN.md`** | **The master build specification. Single source of truth for implementation — design tokens, route map, screen-by-screen specs, feature acceptance criteria, rulebook as code, allocator algorithm, mock data, build order, copy deck, QA checklist. If anything conflicts with it, PLAN.md wins.** |
| `hackathon.md` | The brief: rules, deliverables, timeline, prizes |
| `IRCTC Public Issue & Enhancement Status Atlas.md` | **v2.** 17 issue themes with dated evidence, status labels, timeline 2024–2026, prioritised backlog, stated limitations |
| `IRCTC Train-Search Portal and Connected Services_ Feature Research.md` | Official feature inventory across the IRCTC ecosystem, with source references |
| `irctc_research_notes.md` | Raw capture of official IRCTC page content and service labels |
| `important_things.md` | The original seat-selection question that prompted the allocation research |
| `ideas.md` | Visual direction: Signal Archive, chosen over Monsoon Terminal and Circuit Board |
| `research/prs-berth-allocation-research.md` | Berth allocation deep dive. Every claim tagged OFFICIAL / PRESS / COMMUNITY / UNVERIFIED, with 8 explicitly listed open gaps |
| `research/competitive-benchmark-third-party-and-global-rail.md` | Third-party Indian apps and global rail/airline patterns, with constraints on what IRCTC can legally copy |
| `index.css`, `atlas-enhancements.css` | Working Tailwind v4 implementation of Signal Archive |
| `CONSOLIDATED_UNDERSTANDING.md` | This document |
