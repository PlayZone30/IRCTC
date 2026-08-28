# How Indian Railways / CRIS PRS Allocates Berths — Research Report

Compiled 26 August 2026. Every claim is tagged:

- **[OFFICIAL]** — Ministry of Railways / Railway Board / CRIS / PIB / Parliament answer / IRCTC's own documents
- **[PRESS]** — mainstream journalism reporting on an official circular or announcement
- **[COMMUNITY]** — blogs, Quora, forums, third-party tools. Treat as reverse-engineered folklore, not spec.
- **[UNVERIFIED]** — I could not find any source, official or otherwise, that substantiates it.

A note up front, because it matters for the build: **Indian Railways has never published the berth-allocation algorithm.** The most detailed official statement that exists is a 2017 Lok Sabha answer, and it describes the *policy* (first come first served, preferences subject to availability) rather than the *ordering*. Everything you have read about "middle coaches first" and "seats 30–40 first" traces back to a small number of Quora answers that have been copy-pasted for a decade. I flag this clearly in Section 1.

---

## 1. The allocation logic

### 1.1 What is officially documented

The single most useful official source is [Lok Sabha Unstarred Question No. 4554, answered 29 March 2017](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals) — a question that asked exactly why passengers cannot see their seat before paying. The reply (Minister of State Shri Rajen Gohain) establishes: **[OFFICIAL]**

1. Reserved tickets are issued through PRS / internet **on a first-come-first-served basis**.
2. **Berths/seats of choice are allotted subject to availability at the time of booking.**
3. **Coach number and berth/seat number are allotted until confirmed accommodation is exhausted.** Once confirmed accommodation is gone, RAC and waitlist tickets are issued.
4. If an RAC/WL ticket later becomes confirmed because someone cancelled, **no coach/berth number is shown** — it is allotted at **first chart preparation**, and the stated reason is *"with a view to ensuring compaction of the party."*
5. **1A is the sole exception**: even when confirmed accommodation is available, status shows only "Confirmed", and coach + cabin/coupe are allotted at first chart preparation. The stated reasons are (a) accommodating High Official Requisition (HOR) holders and dignitaries per entitlement, (b) **not allotting a single lady passenger a coupe alongside a male passenger**, (c) compact accommodation for families, (d) lower berth to senior citizens as far as feasible.

Point 4 and 5 are the closest thing to a documented optimisation objective in the whole corpus: **party compaction** and **gender/age-sensitive placement**. Both are applied at charting, not at booking.

The [PIB backgrounder "From Queues to Clicks", 6 August 2026](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/aug/doc202686945401.pdf) confirms the system boundary: PRS "manages seat allocation, waitlists, Reservation Against Cancellation (RAC), reservation charts and passenger enquiries", is built and maintained by **CRIS**, and the currently-running generation was **deployed in 2010 on Itanium servers and the OpenVMS platform**. Network name is **CONCERT** (Country-wide Network for Computerised Enhanced Reservation and Ticketing). **[OFFICIAL]**

That OpenVMS/Itanium detail is worth internalising: the live allocator is 2010-era code descended from a 1986 design, which is a good prior for "the rules are simple, deterministic and full of special cases" rather than "there is a solver optimising anything."

### 1.2 Coach filling order and load distribution — the folklore

The widely circulated claim is: the system fills the **middle coach of the rake first** (e.g. S5 of S1–S10), and within a coach fills **berths in the middle of the coach (roughly 30–40) first**, working outward toward the doors (1–3 and 70–72), and fills **lower berths before upper berths to keep the centre of gravity low** — all "to distribute load equally across coaches and keep the train balanced."

Verbatim examples of the claim: [Quora, "How do I get the berth in the middle of the coach…" (Aug 2020)](https://www.quora.com/How-do-I-get-the-berth-in-the-middle-of-the-coach-away-from-toilets-in-IRCTC), [Quora, "Why is there no seat selection in Indian Railways…" (Jul 2019)](https://www.quora.com/Why-is-there-no-seat-selection-in-Indian-Railways-while-booking-Did-you-struggle-with-seat-adjustment-while-travelling-with-family-Why-can-t-IRCTC-allow-seat-selection), [Quora, "How is CRIS software designed to book tickets for IRCTC?" (2016)](https://www.quora.com/How-is-CRIS-software-designed-to-book-tickets-for-IRCTC-What-is-the-algorithm-used-in-it), [Quora, "How are the berths booked in Railways…"](https://www.quora.com/How-are-the-berths-booked-in-Railways-and-why-does-IRCTC-not-allow-you-to-choose-seats).

Assessment: **[COMMUNITY]**, and specifically **[UNVERIFIED]** as to the physics rationale.

- I found **no** Railway Board circular, PIB release, RTI reply, CRIS document or Parliament answer that mentions coach fill order, berth fill order, load distribution or centre of gravity in the context of reservation. The 2017 Lok Sabha answer, which was *directly* asked why seats can't be pre-selected, says only "first come first served, subject to availability."
- The engineering rationale is dubious on its face. A loaded SL coach weighs ~47 t empty; 72 passengers at 70 kg is ~5 t, i.e. roughly 10% of gross weight, distributed over two bogies. Passenger distribution within a rake is not a stability constraint that any railway manages through ticket allocation. Coach *sequence* in the rake is fixed by rake composition (brake vans, power cars, pantry position), not by booking.
- The "seats 30–40 first" numbers are internally inconsistent across the sources (some say 30–40, some 30–70, some "36"), which is the signature of folklore rather than documentation.

**Recommendation for the mock engine:** if you want to *mimic observed behaviour*, the safe, defensible model is "berths are handed out in a deterministic order that is stable per train+class+date, and lower berths drain first because of the quota and auto-allotment rules in Section 3." Do not build a physics story into it, and do not present berth-number ranges as documented.

### 1.3 What *is* documented about ordering: the onboard allocator

There is one place where CRIS has published an actual allocation procedure — the TTE hand-held terminal. [CRIS, *User Manual: HHT Auto Berth Allotment & Release*, v2.7.2-v-9, last updated 23 December 2022](https://www.hht.indianrail.gov.in/docs/user_manual_2_7_2-berth-allot-v9.pdf) **[OFFICIAL]**:

- The TTE marks attendance (Turn Up / Not Turn Up) for a coach and boarding point, saves, then presses **Allot Berth & Release**.
- Vacant berths are assigned in this priority order: **(i) turned-up RAC passengers, (ii) Part-WL passengers**, then, once all RAC and Part-WL in the assigned coaches are confirmed, **(iii) Full-WL and other standing passengers with valid travel authority** (EFT / pass holders).
- **"HHT auto allocation will give priority to the lowest RAC/waiting list number only (not berth number sequence)."**
- Priority is maintained **within the selected coach only** — "so lowest RAC no in that Coach will get first priority."
- Allocation finds the **"nearest vacant berth in that coach or any other nearest Coach."**
- Auto-allocation is blocked if any RAC or Part-WL passenger in the selected coach/boarding point is unchecked, "to restrict priority breach."
- Remaining vacant berths are **released back to PRS** and synchronised automatically.
- Critically for your data model: **"RAC passenger's initial berth numbers in PRS chart may not be according to the RAC waiting list number always. For example, RAC 3 may be allotted to berth no 23, and RAC 5 to berth 15 in PRS Chart."**

That last point is direct official evidence that RAC-number → berth-number mapping in the chart is *not* monotonic. Whatever the allocator does, it is not a simple ascending scan.

### 1.4 Why solo travellers so often get middle / upper berths

There is no "penalise solo travellers" rule. The observed effect is fully explained by documented mechanisms compounding:

1. **Lower berths are structurally scarce.** In a 72-berth SL coach only 18 of 72 berths are lower and 9 are side-lower (25% / 12.5%). Middle+upper is 36 of 72.
2. **A large slice of the lower berths is quota-locked** before general booking even starts — 6–7 LB per SL coach, 4–5 per 3A, 3–4 per 2A for the senior-citizen/45+-women/pregnant-women combined quota (Section 3.1). Those are unavailable to a general-quota solo traveller regardless of how early they book.
3. **Automatic lower-berth allotment** diverts remaining lowers to male 60+ / female 45+ passengers *even when they express no preference* — [Lok Sabha USQ 3765, 18 December 2024](https://sansad.in/getFile/loksabhaquestions/annex/183/AU3765_as3PMc.pdf?source=pqals) and [USQ 4554, 2017](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals): "Allotment of lower berths to Senior Citizens, Female passengers of 45 years and above automatically, even if no choice is given, subject to availability." IRCTC repeated this verbatim in a public reply in February 2026 ([NDTV, Feb 2026](https://www.ndtv.com/travel/man-complains-82-year-old-woman-allotted-upper-berth-despite-other-seats-available-indian-railways-reacts-11153104)). **[OFFICIAL]**
4. **Compaction favours groups, and side berths are the leftovers.** The 2017 answer names compaction as an objective. A bay of 8 (6 main + 2 side) can absorb a family of 4–6 cleanly; a stream of singletons fragments it. Side-upper/side-lower and the odd middle are what remain after bays are packed.
5. **FCFS depletion.** Lowers are the most-requested berth type, so they go first in wall-clock order. A solo traveller booking late is competing for whatever type is left, which is statistically middle/upper.

A commonly cited but **[COMMUNITY]** elaboration, from a [Quora answer by someone claiming to have worked on the reservation software](https://www.quora.com/What-technology-does-Indian-Railways-use-for-Reservations-I-hardly-see-any-conflicts) (Feb 2017), is that allocation "tries to allocate all passengers in a single reservation form first in the same bay, if not then in the same coach", and that even before the senior-citizen quota existed the software "determined the age of the passenger and avoided allocating upper or middle berths to such passengers." This is consistent with the official compaction and auto-LB statements, but the *bay-then-coach* granularity is not officially confirmed.

Also **[COMMUNITY]**, repeated widely and worth treating with suspicion: claims that PRS never seats a lone female passenger in an otherwise all-male bay in open classes. The official statement of that rule ([USQ 4554](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals)) is scoped **only to 1A coupes**, which is precisely why 1A is charted rather than allotted at booking. There is no official source extending it to SL/3A/2A.

---

## 2. Berth numbering and layout by class

### 2.1 Officially documented berth/seat type codes

From [Wikipedia: Indian Railways coaching stock](https://en.wikipedia.org/wiki/Indian_Railways_coaching_stock) (citing IR sources) — the codes PRS prints: **LB** lower, **MB** middle, **UB** upper, **SL** side lower, **SM** side middle, **SU** side upper; for seating classes **WS** window side, **M** middle, **A** aisle, with the note that **only WS is printed on the ticket** (M and A are not). **[PRESS/reference-grade]**

### 2.2 Capacities — officially/reference documented

Per [Wikipedia: Indian Railways coaching stock](https://en.wikipedia.org/wiki/Indian_Railways_coaching_stock), which cites IR/RDSO material:

| Class | Berths/seats per coach | Structure |
|---|---|---|
| 1A | 26 (5 cabins of 4 + 3 coupes of 2) | lockable compartments, corridor one side |
| HA (1A cum 2A) | 10 × 1A (2 cabins of 4 + 1 coupe of 2) + 20 × 2A | hybrid coach |
| 2A | **46 to 54** | bays of 4 transverse (2 LB, 2 UB) + 2 longitudinal side berths |
| 3A | **64 to 72** | bays of 6 transverse (LB/MB/UB × 2) + 2 side berths |
| 3E | **81** per Wikipedia; **83** widely cited elsewhere | as 3A plus a **side middle** berth |
| SL | **72 to 81** | same geometry as 3A, no AC |
| CC | **73 to 78** (78 in Vande Bharat) | 3+2 across |
| EC | **46**; **52** in Vande Bharat | 2+2 across |
| EA (Executive Anubhuti) | 56 | 2+2, premium |
| 2S | **108**; 103 in Jan Shatabdi | 3+3 |
| Double-decker | up to 120 | two levels |

### 2.3 Berth-number → berth-type patterns

The SL / 3A mod-8 pattern is the only one I can point to in a technical write-up: [GeeksforGeeks, "Program to print the berth of given railway seat number", last updated 13 March 2023](https://www.geeksforgeeks.org/dsa/program-to-print-the-berth-of-given-railway-seat-number/) states, for valid seat numbers 1–72: **[COMMUNITY, but well-established]**

```
n % 8 == 1 or 4  -> Lower berth
n % 8 == 2 or 5  -> Middle berth
n % 8 == 3 or 6  -> Upper berth
n % 8 == 7       -> Side Lower
n % 8 == 0       -> Side Upper
```

So a bay of 8 is `[LB, MB, UB, LB, MB, UB, SL, SU]`, repeating: berths 1–8, 9–16, … 65–72. Nine bays per 72-berth coach; nine side-lower berths (7, 15, 23, 31, 39, 47, 55, 63, 71) and nine side-upper (8, 16, …, 72).

The remaining patterns come from [TrainBerth](https://trainberth.in/), a third-party seat-decoder tool whose per-class diagrams I extracted. **[COMMUNITY]** — internally consistent and matching the physical layouts described by [seat61's India guide](https://www.seat61.com/India.htm) and Wikipedia, but not an official source. Verify against real PNRs before shipping.

**SL and 3A (72-berth LHB)** — cycle of 8, as above. TrainBerth notes older **ICF 3A coaches have 64 berths (8 bays)** with an identical pattern, just a shorter coach.

**3E (83 berths)** — cycle of **9**: `[LB, MB, UB, LB, MB, UB, SL, SM, SU]`, i.e. berths 1–9, 10–18, … 73–81 (nine bays), and then **berths 82 and 83 as a two-berth side section (SL, SU) at the coach end, not a tenth bay**. TrainBerth explicitly flags that "some 3E rakes omit the side middle berth entirely." The 82/83 tail is the least certain claim in this whole section — treat as **[UNVERIFIED]** and make it configurable.

**2A (46 berths)** — cycle of **6**: `[LB, UB, LB, UB, SL, SU]`, i.e. 1–6, 7–12, … 37–42 (seven bays), then **berths 43–46 as a final compartment of four main berths with no side section**. So SL = 5, 11, 17, 23, 29, 35, 41 (seven side-lower); SU = 6, 12, …, 42. TrainBerth notes some LHB 2A rakes carry 48–54 berths.

**1A** — TrainBerth models 24 berths as alternating LB/UB (1 LB, 2 UB, 3 LB, 4 UB …) and explicitly warns "1A layouts vary more than any other class — coaches run anywhere from 18 to 24 berths, and the mix of four-berth cabins to two-berth coupes differs by rake." **This is the class where you should not model berth numbers at all at booking time**, because officially 1A gets no berth number until charting ([USQ 4554](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals)), and the chart shows a **cabin/coupe** designation. [seat61](https://www.seat61.com/India.htm) confirms: "in AC1 you aren't assigned berth numbers at all when you book… Berths are only allocated a few hours before departure when the train is 'charted'," and "normally, couples are given preference for the 2-berth coupés, families and passengers travelling alone are allocated berths in one of the 4-berth compartments, but nothing is guaranteed."

**CC (3+2, 78 seats)** — cycle of **5** along the coach: `1 = WS, 2 = M, 3 = A, 4 = A, 5 = WS`, then 6 = WS, 7 = M, 8 = A, 9 = A, 10 = WS, and so on. Equivalently `n % 5 ∈ {1, 0} -> window`, `2 -> middle`, `{3, 4} -> aisle`. TrainBerth cautions that capacity varies (73 / 75 / 78) and that **row orientation flips at the middle of some coaches**, so a window seat may face backwards.

**EC (2+2, 56 seats)** — cycle of **4**: `1 = WS, 2 = A, 3 = A, 4 = WS`. Vande Bharat / Shatabdi EC commonly 52–56.

**2S (3+3, 108 seats)** — cycle of **6**: `1 = WS, 2 = M, 3 = A, 4 = A, 5 = M, 6 = WS`. Capacity varies roughly 90–108 and some coaches are 3+2.

### 2.4 Coach counts per train (LHB vs ICF)

**[COMMUNITY]** for the limits: LHB rakes are generally capped at **22–24 coaches** and ICF at **24–25**, the constraint being platform and loop length (22 LHB coaches ≈ 528 m vs 24 ICF ≈ 512 m) — see [Quora discussion](https://www.quora.com/Why-do-LHB-trains-in-India-have-a-coach-limit-of-22-instead-of-24-like-ICF-trains). I could not find a Railway Board circular stating the cap.

A recent, concretely-sourced composition you can use as a realistic template — the first **Amrit Bharat 3.0** rake, **22 coaches**: 6 × 3A, 2 × 2A, 1 × 1A, 6 × SL, 4 × General, 1 pantry, 1 power car, 1 Divyangjan-cum-guard brake van ([Financial Express, Aug 2026](https://www.financialexpress.com/business/railways-amrit-bharat-3-0-rolls-out-with-ac-non-ac-coaches-first-trainset-ready-for-service-4325645/); [Swarajya, Aug 2026](https://swarajyamag.com/news-brief/first-amrit-bharat-30-trainset-leaves-chennais-icf-with-22-coaches)). **[PRESS]**

For scale context on the class mix across the network: non-AC is about **70% of coaches and 78% of seats**; AC is about **22% of seats** ([Rajya Sabha USQ 752, answered 24 July 2026](https://sansad.in/getFile/annex/271/AU752_JGxrS0.pdf?source=pqars)). **[OFFICIAL]**

Coach labelling convention (last digits of the coach serial number encode class, pre-2018 scheme) and the letter codes — **A** = 2A, **B** = 3A, **H/HA** = 1A cum 2A, **S** = SL, **D** = 2S, **C** = CC, **E** = EC, **G** = 3E Garib Rath, **M** = 3E, **F** = 1A — are tabulated in [Wikipedia: Indian Railways coaching stock](https://en.wikipedia.org/wiki/Indian_Railways_coaching_stock).

---

## 3. Special allocation rules

### 3.1 Combined lower-berth quota (senior citizens / women 45+ / pregnant women)

This is one quota, not three. Its size has moved over time, and the *current* official phrasing makes it a range that depends on how many coaches of that class the train has.

| Date | Sleeper | 3AC | 2AC | Source |
|---|---|---|---|---|
| pre-2016 | 2 LB/coach | — | — | [ET, citing Railways statement](https://m.economictimes.com/industry/transportation/railways/railways-extends-quota-for-senior-citizens-females-pregnant-women/articleshow/49262178.cms) **[PRESS]** |
| 2015-ish | 4 LB/coach | 2 LB/coach | 2 LB/coach | [LS USQ 1596, 27 Dec 2017](https://sansad.in/getFile/loksabhaquestions/annex/13/AU1596.pdf?source=pqals) **[OFFICIAL]** |
| Rail Budget 2016-17 (+50%) | **6 LB/coach** | **3 LB/coach** (4 in Rajdhani/Duronto/fully-AC) | **3 LB/coach** | [LS USQ 511, 20 Jul 2016](https://sansad.in/getFile/loksabhaquestions/annex/9/AU511.pdf?source=pqals); [LS USQ 1736, 27 Jul 2016](https://sansad.in/getFile/loksabhaquestions/annex/9/AU1736.pdf?source=pqals); [LS USQ 4554, 29 Mar 2017](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals) **[OFFICIAL]** |
| current (2024 → 2026) | **6–7 LB/coach** | **4–5 LB/coach** | **3–4 LB/coach** | [LS USQ 3765, 18 Dec 2024](https://sansad.in/getFile/loksabhaquestions/annex/183/AU3765_as3PMc.pdf?source=pqals); [LS USQ 2182, 12 Mar 2025](https://sansad.in/getFile/loksabhaquestions/annex/184/AU2182_qbV6BA.pdf?source=pqals); [Rajya Sabha reply, 5 Dec 2025](https://infra.economictimes.indiatimes.com/news/railways/automatic-allotment-of-lower-berths-to-senior-citizens-45-plus-women-if-available-vaishnaw/125798874) **[OFFICIAL]** |

The current official wording is: "a combined reservation quota of six to seven lower berths per coach in Sleeper class, four to five lower berths per coach each in Air Conditioned 3 tier (3AC) and three to four lower berths per coach in Air Conditioned 2 tier (2AC) classes **(depending on the number of coaches of that class in the train)**" ([USQ 2182](https://sansad.in/getFile/loksabhaquestions/annex/184/AU2182_qbV6BA.pdf?source=pqals)). **[OFFICIAL]**

The eligibility thresholds and the fact that it is applied **without the passenger asking**: **[OFFICIAL]**

- Male 60+ and female 45+ get lower berths **automatically, even if no choice is given, subject to availability** ([USQ 4554, 2017](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals); [USQ 3765, 2024](https://sansad.in/getFile/loksabhaquestions/annex/183/AU3765_as3PMc.pdf?source=pqals)).
- The quota itself covers **senior citizens, female passengers 45 years and above, and pregnant women**. The senior-citizen definition used in the concession/quota context is male 60+ / female 58+ ([Times of India, Mar 2025](https://timesofindia.indiatimes.com/life-style/travel/news/indian-railways-big-update-lower-berths-to-be-reserved-for-women-senior-citizens-more-details/articleshow/119247850.cms) **[PRESS]** — the "58" figure is press-reported, not in the Parliament replies I read, so flag it).
- **In-train reallocation:** vacant lower berths falling free are allotted **on priority** by the TTE to senior citizens, Persons with Disabilities and pregnant women who were given middle/upper berths ([USQ 3765, 2024](https://sansad.in/getFile/loksabhaquestions/annex/183/AU3765_as3PMc.pdf?source=pqals); [USQ 4554, 2017](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals), which frames it as first-come-first-served among those who approach the conductor).

Utilisation data point, useful for calibrating a simulator: in FY 2015-16 Indian Railways earmarked **28 lakh berths under Ladies quota (85% utilised)** and **1.42 crore berths under Senior Citizen quota (86% utilised)** ([LS USQ 1736, 2016](https://sansad.in/getFile/loksabhaquestions/annex/9/AU1736.pdf?source=pqals)). **[OFFICIAL]**

### 3.2 Ladies quota

**[OFFICIAL]**, from [LS USQ 2182, 12 March 2025](https://sansad.in/getFile/loksabhaquestions/annex/184/AU2182_qbV6BA.pdf?source=pqals), grounded in **Section 58 of the Railways Act, 1989**:

- **6 berths in Sleeper class** in long-distance Mail/Express trains.
- **6 berths in 3AC** of Garib Rath / Rajdhani / Duronto / fully air-conditioned Express trains.
- For **female passengers irrespective of age, travelling alone or in a group of female passengers.**
- Plus Second-class accommodation for women in the SLR (guard/luggage) coach in most long-distance trains, exclusive unreserved coaches in EMU/DMU/MMTS, and ladies-special suburban services.

The 3AC ladies quota was added by a Railway Board circular in **December 2018** ([NDTV, 4 Dec 2018](https://www.ndtv.com/india-news/6-more-reserved-berths-for-women-in-air-conditioned-train-compartments-1957824); [Livemint](https://www.livemint.com/Companies/KHyrmrb3WMKOG6p9iNySRK/train-reservation-rules-indian-railways-seat-women-reserved.html)) **[PRESS]**.

Modelling note: **these 6 berths are per train, not per coach** — a point that trips up a lot of write-ups. The 2015/2017/2025 answers all phrase it as "a reservation quota of six berths in sleeper class", parallel to the per-coach phrasing used for the lower-berth quota in the very next clause. A [Quora answer](https://www.quora.com/What-is-meant-by-Ladies-Quota-on-IRCTC-how-does-it-work) states it as six berths "in the ENTIRE train"; **[COMMUNITY]** but consistent with the official phrasing.

### 3.3 Divyangjan (Persons with Disabilities) quota

Most precise official statement is [South Western Railway Press Release No. 530, 13 March 2024](https://www.nabkerala.org/wp-content/uploads/2026/02/NEW-RAILWAY-PASS-INSTRUCTION.pdf), reproducing a Railway Board decision. It applies to **all reserved Mail/Express trains including Rajdhani/Shatabdi/Duronto/Vande Bharat/Humsafar/Gatimaan and special-fare specials, whether or not concessional fare is available on that train.** **[OFFICIAL]**

| Class | Quota |
|---|---|
| Sleeper | **4 berths (2 lower + 2 middle)** |
| 3E **or** 3A | **4 berths (2 lower + 2 middle)** — zonal railway picks which of the two classes, based on how many coaches of that class the train has |
| Garib Rath SLRD coach | **4 berths** |
| Reserved 2S / CC | **4 seats**, in trains with more than two coaches of those classes (except Vande Bharat) |
| Vande Bharat | **4 seats** — specifically **seat 40 in coaches C1 and C7** (8-car) or **seat 40 in C1 and C14** (16-car), which are specially designed, **plus one adjacent seat each for escorts** |

Two implementation details worth copying: **[OFFICIAL]**
- Online booking under this quota requires a **unique ID card issued by the Railways**; at the counter, the unique ID or a concession certificate in the prescribed proforma.
- If both specially-designed Vande Bharat seats are taken by Divyangjan but an escort seat is vacant, **the vacant escort seat is allotted to a Divyangjan.**
- Where a Divyangjan books on a train with no concession, a **pop-up warns** that concessional fare is not available.

Earlier baseline for comparison: **4 berths in Sleeper and 2 berths in 3AC** in long-distance Mail/Express other than Rajdhani/Duronto types, per [Railway Board Commercial Circular 19 of 2022](https://staffnews.in/wp-content/uploads/2022/10/CC-19-2022.pdf) **[OFFICIAL, cited via search index — I could not download the PDF directly, the host blocked me]**. The December 2025 Rajya Sabha reply restates the current position as "four berths each in sleeper and 3AC/3E class (including two lower and two middle berths) and four seats in reserved second sitting (2S)/air conditioned chair car (CC)" ([reported by PTI, 6 Dec 2025](https://infra.economictimes.indiatimes.com/news/railways/automatic-allotment-of-lower-berths-to-senior-citizens-45-plus-women-if-available-vaishnaw/125798874)) **[OFFICIAL, press-relayed]**.

### 3.4 Auto-upgradation

Scheme introduced **26 January 2006** on two trains (Mumbai Central–New Delhi Rajdhani, Mumbai Central–H. Nizamuddin August Kranti), extended **6 February 2006** to all Rajdhanis plus 30 other trains, then network-wide ([Indian Express, 10 May 2026](https://indianexpress.com/article/india/waiting-list-to-higher-class-how-indian-railways-ticket-upgradation-system-works-10681111/)) **[PRESS]**.

**Railway Board circular dated 13 May 2025** restructured it ([Economic Times, 16 May 2025](https://economictimes.indiatimes.com/industry/transportation/railways/will-your-waitlisted-ticket-get-an-automatic-upgrade-on-indian-railways/articleshow/121208730.cms); [Times of India, 16 May 2025](https://timesofindia.indiatimes.com/city/chennai/now-your-waitlist-ticket-may-land-you-in-a-better-seat/articleshow/121195960.cms); circular reproduced as [Railway Board Commercial Circular 07 of 2025](https://staffnews.in/wp-content/uploads/2025/07/Railway-Board-Commercial-Circular-07-2025.pdf), which I could not download) **[PRESS reporting an OFFICIAL circular]**:

- Explicit **class hierarchy**, upgrade capped at **two levels**.
- **Sleeping** ladder: `2S → 3E → 3A → 2A → 1A`, with the exception that **only a 2A ticket holder is eligible for 1A**.
- **Sitting** ladder: `2S → VS → CC → EC → EV → EA`, with the exception that **only a CC ticket holder is eligible for EC / EV / EA**.
- **Upgradation happens separately within sitting and within sleeping** — no crossover.
- **Only full-fare passengers are eligible.**
- Lower-berth and senior-citizen passengers *are* eligible, but a **warning is shown that a lower berth is not assured after upgradation.**
- CRIS was directed to update the software.

Mechanics of what happens to the vacated berths ([IRCTC, via NDTV](https://www.ndtv.com/business/irctc-indian-railways-auto-upgradation-scheme-for-online-tickets-how-it-works-rules-conditions-2015253/)) **[OFFICIAL, IRCTC-sourced via press]**: berths of confirmed passengers who were upgraded go to **RAC/WL passengers of that class**; if berths are still vacant, they go to **confirmed passengers of the next lower class**. Passengers pay nothing extra.

Interaction with VIKALP: a passenger given alternate accommodation "will be treated as normal passengers in alternate train and will be eligible for up gradation" ([IRCTC VIKALP terms](https://contents.irctc.co.in/en/vikalpTerms.html)) **[OFFICIAL]**.

A zonal example of aggressive use, for realism: Bhopal division extended free SL→2AC upgrades across ~300 trains, ~7,000 tickets/day ([News18, May 2025](https://www.news18.com/auto/irctc-pnr-status-free-upgrade-from-sleeper-class-to-2ac-new-indian-railways-scheme-ws-dkl-9344774.html)) **[PRESS]**.

### 3.5 RAC — Reservation Against Cancellation

**Official definition of the mechanism** — from CRIS's own quota-code page, [indianrail.gov.in/quota_Code.html](http://www.indianrail.gov.in/quota_Code.html): **[OFFICIAL]**

> "RAC is a special provision to 'split' a berth into two or more seats. This is really speaking not a quota but it is a predefined allocation to take care of the above mentioned special provision."

So RAC is not a waitlist and not really a quota — it is an inventory transformation applied to specific berths, and it appears in the quota code table as **RC (RAC)**.

Official facts:
- RAC holders may travel in reserved coaches; fully-waitlisted passengers may not (Section 3.7). **[OFFICIAL/PRESS]**
- RAC → confirmed happens at charting, or in-train via the TTE using HHT auto-allotment with **priority by lowest RAC number within the coach** ([CRIS HHT manual](https://www.hht.indianrail.gov.in/docs/user_manual_2_7_2-berth-allot-v9.pdf)). **[OFFICIAL]**
- RAC berth numbers in the PRS chart are **not** ordered by RAC number ([same manual](https://www.hht.indianrail.gov.in/docs/user_manual_2_7_2-berth-allot-v9.pdf)). **[OFFICIAL]**
- If a PNR is partly confirmed after charting, the unconfirmed passengers may **share the berths of the confirmed passengers on the same PNR** ([ET, May 2025](https://economictimes.indiatimes.com/industry/transportation/railways/will-your-waitlisted-ticket-get-an-automatic-upgrade-on-indian-railways/articleshow/121208730.cms)). **[PRESS]**

**How many RAC per coach — this is where official sourcing runs out.** The figures you will see everywhere are:

| Class | Side-lower berths put under RAC | RAC seats (× 2) |
|---|---|---|
| SL | 7 | 14 |
| 3A | 4 | 8 (3 in Garib Rath) |
| 2A | 3 | 6 |

Source: [Quora, "What is RAC in IRCTC?"](https://www.quora.com/What-is-RAC-in-IRCTC) and [Quora, "What is train rac?"](https://www.quora.com/What-is-train-rac), which also assert the counts are the same for ICF and LHB coaches. **[COMMUNITY]**. Competing community figures exist (one [Quora answer](https://www.quora.com/How-does-RAC-algorithm-of-indian-railways-work) claims 9 side-lowers in SL with one going to railway staff/police, giving 8 × 2 = 16). **Do not treat any of these as documented.** Make the per-coach RAC count a config value.

Sharing convention, **[COMMUNITY / reference-grade]** per [Wikipedia: Reservation against Cancellation](https://en.wikipedia.org/wiki/Reservation_against_Cancellation): two RAC passengers share one side-lower berth; both seated by day; at night the berth is shared until one is upgraded to a full berth. Berth allocation is "managed dynamically… the exact seating arrangement may vary depending on coach configuration, class, and availability."

Status display convention, **[COMMUNITY]** but universally observed: `RAC8/RAC2` = booked at RAC 8, currently RAC 2; the first number is status at booking, the second is current status.

### 3.6 Waitlist types

I could not find a single official Ministry/CRIS page defining the WL suffixes. The quota codes they derive from *are* official ([indianrail.gov.in/quota_Code.html](http://www.indianrail.gov.in/quota_Code.html)) — so the mapping below is official at the quota layer and **[COMMUNITY]/[PRESS]** at the "what it means for your chances" layer.

| Code | Expansion | Underlying quota | Mechanics | Confirmation prospects |
|---|---|---|---|---|
| **GNWL** | General Waiting List | **GN** | Issued when the journey starts at the train's originating station or a station close to it. Largest berth pool in the train. | Best. Clears against cancellations anywhere in the general pool. |
| **RLWL** | Remote Location Waiting List | **RS / roadside + remote location** | For intermediate stations that are important towns on the route. **The remote location prepares its own chart, typically 2–3 hours before the train's actual departure from that point.** Confirmation depends on cancellations of tickets to that destination specifically. | Poor. ([Financial Express, 12 Apr 2019](https://www.financialexpress.com/business/railways-what-is-rlwl-pqwl-know-about-remote-location-waiting-list-and-pooled-quota-waiting-list-of-indian-railways-1546014/)) |
| **PQWL** | Pooled Quota Waiting List | **PQ** | One pooled quota for the whole run, operated from the originating station, **shared across several small stations**. Used for originating→intermediate, intermediate→terminating, or intermediate→intermediate journeys. | Poor — a small pool shared widely. ([Financial Express, same](https://www.financialexpress.com/business/railways-what-is-rlwl-pqwl-know-about-remote-location-waiting-list-and-pooled-quota-waiting-list-of-indian-railways-1546014/)) |
| **TQWL** (formerly CKWL) | Tatkal Quota Waiting List | **TQ** | Tatkal waitlist. **Does not get priority at charting — GNWL clears ahead of it.** | Worst of the common types. **[COMMUNITY]**, e.g. [this compiled FAQ](https://www.scribd.com/document/352515632/Railway-FAQ). |
| **RSWL** | Roadside Station Waiting List | **RS / GNRS** | Berths booked from the originating station to a roadside station only. | Poor. |
| **RLGN** | Remote Location General Waiting List | **RS→GN redefinition** | An RLWL that has been redefined against the general quota from the remote location onward. | Between RLWL and GNWL. |
| **RQWL** | Request Waiting List | — | Journey between two intermediate stations not covered by GN/PQ/RS quotas. | Poor. |

The official quota-code page also explains the **roadside-quota redefinition rule**, which is the actual mechanism behind RLWL/RLGN and is worth modelling: **[OFFICIAL]**

> "In case of each road-side station quota, berths/seats are booked by the originating station for journeys up-to the road-side station only up-to the extent of accommodation earmarked for that Road-Side quota. In such cases, distance restriction does not apply. If that berth/seat is redefined from a remote location, then booking can also be done beyond the road side station, within the limits defined for the remote location quota. **In no case can a through passenger be given accommodation in the RS berth and the redefined portion.**" — with the worked example that an NDLS→MAS passenger cannot be given a berth defined as GNRS up to BPL and then redefined as GN from BPL to MAS.

Practical corollary for a simulator, **[COMMUNITY]** but structurally sound: a class/train/OD pair cannot simultaneously show a waitlist and vacant berths — WL and vacancy are mutually exclusive for the same OD pair, though vacancy can coexist with WL on a *different* OD pair because of quota segmentation.

### 3.7 VIKALP (Alternate Train Accommodation Scheme)

Complete official rule set from [IRCTC VIKALP Terms and Conditions](https://contents.irctc.co.in/en/vikalpTerms.html). **[OFFICIAL]** This page is the authoritative spec; the rules, condensed:

- Applies to **all train types and classes** and **all waitlisted passengers irrespective of booking quota and concession**.
- Passenger opts for a maximum of **7 alternate trains**.
- **Only passengers who remain fully waitlisted after charting** are considered for allotment in an alternate train.
- **No extra charge; no refund of fare difference** (including Tatkal charges).
- **All-or-none per PNR** — either all passengers of a PNR are transferred to the alternate train in the **same class**, or none.
- Transfer can be to a train leaving from **any station in a cluster of stations defined by Railways**, to a station serving the destination on the same analogy.
- Transferred passengers **do not appear in the waitlisted charts of the original train**; a separate list of transferred passengers is pasted alongside the CONFIRMED and WAITLIST charts.
- The **original ERS/SMS is the travel authority** on the alternate train.
- Waitlisted passengers **may not board the original train** if given alternate accommodation.
- Once transferred, they are **treated as normal passengers in the alternate train and are eligible for upgradation**.
- **They can be dropped or re-allotted** in the alternate train "due to last minute change in composition of the alternate train at the time of chart preparation" — so passengers must re-check PNR **after the alternate train's chart** is prepared.
- On cancellation after allotment, the passenger is **treated as CONFIRMED** and confirmed-ticket cancellation rules apply.
- **Journey modification is not permitted** after alternate allotment — cancel and rebook.
- If the journey is not performed on the alternate train, refund is via **TDR**.
- The **train list can be updated only once**; opting into VIKALP **cannot be reversed**.
- Status is available via 139, PRS enquiry counters, POET terminals and [indianrail.gov.in](https://www.indianrail.gov.in/).

Press framing of the practical window (alternate trains departing within a window on the same route) — e.g. [Times of India, Oct 2025](https://timesofindia.indiatimes.com/hack-of-the-day-how-to-turn-your-waitlisted-ticket-into-a-confirmed-one-with-irctc-vikalp-feature/articleshow/124598806.cms) says "departing within 12 hours on the same route" — is **[PRESS]** and not stated on the IRCTC terms page. Don't hard-code 12 hours as if it were official.

### 3.8 Quota split

Full official list of reservation quotas on Indian Railways, from [PIB, "Categories of Reservation Quotas in Indian Railways"](https://www.pib.gov.in/newsite/PrintRelease.aspx?relid=187186) (Rajya Sabha written reply, MoS Railways Shri Rajen Gohain): **[OFFICIAL]**

General, Tatkal, Premium Tatkal, **Parliament House** (sitting and former MPs), Ladies, Senior Citizen, Foreign Tourist, **Defence**, **Roadside**, **Pooled**, **Cancer Patient**, RAC, **Physically Handicapped (Divyangjan)**, **Duty Pass** (serving/retired railway employees on duty/privilege/post-retirement complimentary passes, in specified trains), **Railway Employees** (designated staff on duty), **Yuva** (unemployed persons aged 15–45), and **Emergency** (HOR holders, MPs, and general public with urgent travel need).

Bookable on IRCTC's website: **General, Ladies, Foreign Tourist, Premium Tatkal, Tatkal, Senior Citizen, Physically Handicapped**, plus allotment under **RAC and Pooled Quota**. Together, these quotas are **approximately 94% of total reserved accommodation**. The online facility is generally withheld from quotas requiring prior physical document verification, though it has been extended to persons with disability, press correspondents and defence personnel. **[OFFICIAL]**

The PRS quota **codes** you will see in PNR strings, from [indianrail.gov.in/quota_Code.html](http://www.indianrail.gov.in/quota_Code.html) (CRIS): **[OFFICIAL]**

`GN` General · `LD` Ladies · `HO` Headquarters/High Official · `DF` Defence · `PH` Parliament House · `FT` Foreign Tourist · `DP` Duty Pass · `TQ` Tatkal · `PT` Premium Tatkal · `SS` Female (above 45)/Senior Citizen/Travelling alone · `HP` Physically Handicapped · `RE` Railway Employee staff on duty for the train · `GNRS` General Quota Road Side · `OS` Out Station · `PQ` Pooled Quota · `RC (RAC)` Reservation Against Cancellation · `RS` Road Side · `YU` Yuva · `LB` Lower Berth

Note the code trap: **`PH` is Parliament House, not Physically Handicapped** — that's `HP`. Getting these backwards is a common bug in third-party PNR parsers.

**Tatkal specifics** — [IRCTC Tatkal FAQ](https://contents.irctc.co.in/en/tatkal_faq.pdf) and [indianrail.gov.in Tatkal Scheme](http://www.indianrail.gov.in/tatkal_Scheme.html): **[OFFICIAL]**

- Opens **one day in advance excluding the date of journey**, from the train's originating station: **10:00 hrs for AC classes (2A/3A/CC/EC/3E)** and **11:00 hrs for non-AC (SL/FC/2S)**, effective 15 June 2015 per Commercial Circular 34 of 2015.
- Charges: **10% of basic fare for second class, 30% of basic fare for all other classes**, with floors/ceilings — 2S ₹10/₹15 (min 100 km), SL ₹100/₹200 (500 km), CC ₹125/₹225 (250 km), 3A ₹300/₹400 (500 km), 2A ₹400/₹500 (500 km), EC ₹400/₹500 (250 km). Applied uniformly in peak and non-peak.
- **No concessions** in Tatkal. **Maximum 4 passengers per PNR.** No change of name. No refund on confirmed Tatkal cancellation (except the listed exceptions: >3 hr delay at journey origin, diverted route, non-attachment of the coach, accommodation in a lower class).
- **Tatkal tickets are issued for actual distance of travel rather than end-to-end**, and **"the same Tatkal berth/seat may be booked in multiple legs till preparation of charts. At the time of preparation of charts, unutilized portion may be released to the General RAC/Waiting list passengers."** This is a real, documented inventory behaviour worth implementing.
- **Contradiction to be aware of:** the IRCTC FAQ says "Tatkal bookings are allowed in all classes except First AC and Executive class", while the indianrail.gov.in Tatkal Scheme page says Tatkal *is* available in Executive Class of Shatabdi trains "by earmarking 10% of the accommodation available i.e. 5 seats per coach." The indianrail page is the older of the two. **The 10% / 5-seats-per-coach figure is the only officially published Tatkal quota *size* I found.**
- Agent booking blackouts: ARP 08:00–08:10, AC Tatkal 10:00–10:10, non-AC Tatkal 11:00–11:10.
- **Aadhaar-authenticated Tatkal** from 1 July 2025, **OTP-based authentication** from end-July 2025 ([PIB, 29 Jun 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2140614)).

Scale, **[PRESS]**: of ~15.14 lakh berths/seats per day, about **3.05 lakh (≈20.16%)** are available under Tatkal or Premium Tatkal ([Livemint, Oct 2022](https://www.livemint.com/news/india/tatkal-train-ticket-reservation-how-many-seats-are-available-when-bookings-open-11664859254097.html)).

**Premium Tatkal** uses **dynamic pricing** — the fare rises with each successive booking — and opens in the same windows as Tatkal ([NDTV](https://www.ndtv.com/business/irctc-indian-railways-online-reservation-tatkal-vs-premium-tatkal-ticket-booking-ticket-prices-1940068)). **[PRESS]**

**Foreign Tourist quota** — [IRCTC Foreign Tourist Quota Booking guide](http://contents.irctc.co.in/en/ForeignTouristQuotaBooking.pdf): **[OFFICIAL]** bookable **up to 365 days in advance**; classes **EC, 1A, 2A, 3A, CC, SL, 2S**. Critically for allocation modelling: **"For bookings done within current Advance Reservation Period (ARP), berths will be allocated at the time of booking. While for bookings done beyond current ARP period, berths will be provided at the later stage when allotted by Railways PRS system at the time of opening the ARP."** Requires a verified international mobile number. Current ARP is 60 days.

**ARP** was reduced from **120 days to 60 days** ([PIB, Aug 2026](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/aug/doc202686945401.pdf)). **[OFFICIAL]**

---

## 4. Berth preference honouring, and why preferences aren't guarantees

### 4.1 The official position

[Lok Sabha USQ 4554, 2017](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals) is unambiguous: **"Berths/seats of choice are allotted subject to availability at the time of booking."** And on why women and senior citizens still end up on upper berths: **"Since reserved accommodation is booked on first come first served basis, it [is] possible that if a female passenger/senior citizen approaches for booking late, they may or may not get the berth of their choice."** **[OFFICIAL]**

IRCTC's own user guide says the same in a single parenthetical when describing the passenger-details form: after entering "names of the Passengers, age, sex and berth preference for each Passenger", it notes **"(The allotment of your required berth depends on the availability)"** — [IRCTC NGeT Journey Planning User Guide](https://contents.irctc.co.in/en/NGET_JP_Userguide.pdf). **[OFFICIAL]**

So: **berth preference is a soft hint applied at allocation time, evaluated against remaining inventory, and never a constraint.** There is exactly one way to turn it into a constraint, which is the reservation-choice mechanism below.

### 4.2 Reservation choice / "book only if" options

IRCTC's booking form carries a **Reservation Choice** control that converts preferences into a hard pass/fail on the booking transaction. The options I can source:

- **"Book only if confirmed berths are allotted"** — the booking fails (and is not made) unless confirmed accommodation is available; you don't end up with RAC/WL. **[COMMUNITY]** as to exact wording, e.g. [Quora](https://www.quora.com/How-does-the-Book-only-if-confirmed-berths-allotted-option-works-in-IRCTC-Would-money-be-debited-if-not-confirm-Full-refund-or-Rs-60-deducted).
- **"Book only if at least one lower berth is allotted"** — IRCTC itself has publicly recommended this route for senior citizens booking in the general quota: "In general quota, you can give preference for lower berths but allotment of berths is subject to availability. After that you have to select the reservation choice 'Book only if the lower berth is allotted'" ([Livemint, Sep 2022, quoting IRCTC](https://www.livemint.com/news/india/how-to-book-confirmed-lower-berth-for-senior-citizens-in-indian-railways-irctc-explains-11663917206125.html)). **[OFFICIAL, press-relayed]**
- **"Book only if 2 lower berths are allotted"** — the two-lower variant, for a couple ([Quora](https://www.quora.com/How-do-you-select-the-lower-berth-quota-in-IRCTC/answer/Ankit-Barnawal-1)). **[COMMUNITY]**
- **Preferential / preferred Coach ID** — a free-text coach identifier (e.g. `S5`, `B3`) that the system *attempts* to honour. Its documented real use case is splitting a party across two bookings: IRCTC caps a PNR at 6 passengers, so you book the first 6, read the allotted coach, then enter that coach ID for the second batch ([Quora](https://www.quora.com/What-does-the-preferential-coach-ID-in-the-IRCTC-e-ticket-booking-checkout-mean)). **[COMMUNITY]** — it is a request, not a guarantee.

**On "book only if confirmed berths allotted in same coach" specifically:** I looked for this and could not find an official IRCTC option with that wording. What exists is (a) the confirmed-only choice, (b) the lower-berth choices, and (c) the preferred-coach-ID field. Same-coach placement for a single PNR is instead handled implicitly by the **compaction** objective the Ministry describes ([USQ 4554](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals)) — the allocator tries to keep a party together, and where it cannot at booking time it re-attempts at first charting. If you've seen that exact checkbox string in the UI, treat my not finding it as a sourcing gap rather than evidence it doesn't exist. **[UNVERIFIED]**

Also note there is **no** "book only if my preferred berth type is allotted" for middle/upper/side variants, and **no** post-booking berth change: [Quora](https://www.quora.com/I-preferred-lower-berth-while-booking-train-through-IRCTC-but-I-got-side-upper-Why-Is-there-any-process-to-change-it) — "What you are looking for is something like 'Book only if preferred seat is allotted' and unfortunately, there's no provision for that." **[COMMUNITY]** The only remedy in-journey is asking the TTE, subject to vacancy and to the priority rules in §3.1.

### 4.3 Why preferences fail — the ranked causes, for your engine

1. Requested berth type already exhausted (FCFS).
2. Requested lower berths are locked in the senior-citizen/ladies/Divyangjan quotas the passenger isn't eligible for.
3. Passenger is eligible for auto-LB but a *more* eligible passenger already took the last one.
4. Party compaction outranks individual berth type — the allocator will put you in the bay with your family rather than in a distant lower berth.
5. Booking is RAC/WL, so no coach/berth is assigned at all until charting, at which point compaction is re-run and preference is not re-evaluated ([USQ 4554](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals)).
6. Class is 1A — berth is *never* assigned at booking (§2.3).

---

## 5. "Airline-style seat selection" — status as of August 2026

**Short answer: announced, officially confirmed as a next-gen PRS feature, and not shipped as of 26 August 2026. What shipped in July 2026 is better *availability display*, not seat selection.**

### 5.1 What was announced, officially

[PIB press release 2140614, 29 June 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2140614) — Ministry of Railways, following a review by Minister Ashwini Vaishnaw — is the primary official source. It states: **[OFFICIAL]**

> "In the new PRS, users will be able to submit their choice of seat and see the fare calendar. It also has integrated facilities for Divyangjan, students, patients, etc."

Same release: new PRS to allow **over 1.5 lakh bookings/minute** (vs 32,000), **over 40 lakh enquiries/minute** (vs 4 lakh), multilingual UI, **"Modern Passenger Reservation System (PRS) by December 2025."**

Read that wording carefully: **"submit their choice of seat"** is not the same as an airline seat map with click-to-pick. No official document describes a graphical seat map, a per-seat price, or a guarantee. The airline analogy is press framing.

### 5.2 Timeline of announcements vs. delivery

| Date | Event | Source |
|---|---|---|
| Jun 2025 | Railway Board / Minister announce next-gen PRS with **"choice of seat"** + fare calendar; target **December 2025** | [PIB 2140614](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2140614) **[OFFICIAL]** |
| Jul 2025 | RailOne app launched; Aadhaar-authenticated Tatkal | [PIB Aug 2026 backgrounder](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/aug/doc202686945401.pdf) **[OFFICIAL]** |
| Apr 2026 | Vaishnaw announces new IRCTC website by **15 July 2026**, media report "seat choice" among features | [Times Now, 14 Jul 2026](https://www.timesnownews.com/business-economy/personal-finance/irctcs-new-website-goes-live-on-july-15-faster-tatkal-booking-seat-choice-fare-calendar-and-more-article-155095471), [Economic Times](https://economictimes.indiatimes.com/news/new-updates/irctc-new-website-launch-date-announced-by-ashwini-vaishnaw-faster-ticket-booking-tatkal-booking-status-seat-choice-feature-and-more/articleshow/131673073.cms) **[PRESS]** |
| **15 Jul 2026** | **IRCTC beta website goes live** at `irctc.co.in/eticket/`. Ministry lists exactly **four** improvements: no unnecessary captchas/pop-ups/flashing graphics; **seat availability across all classes**; faster checkout with fewer steps; saved passenger details. **Seat selection is not among them.** | [NewsOnAir (Prasar Bharati), 16 Jul 2026](https://newsonair.gov.in/new-irctc-beta-website-launched-for-easier-ticket-booking/) **[OFFICIAL]** |
| **Aug 2026** | **Phased migration of trains to the upgraded PRS begins.** PIB's official feature list for the new PRS: 1.5 lakh bookings/min, 40 lakh enquiries/min, multilingual UI, cloud-enabled scalability. **Seat selection is absent from this list.** | [PIB backgrounder, 6 Aug 2026](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/aug/doc202686945401.pdf) **[OFFICIAL]** |
| 9 Aug 2026 | Railway Board ADG (PR) Dharmendra Tewari: migration is gradual — *"Layer by layer matching of the new user friendly look & feel will involve a slow and steady load based testing as we migrate from the old to the new PRS."* The beta site is part of that transition. | [Indian Express, 9 Aug 2026](https://indianexpress.com/article/india/indian-railways-new-passenger-reservation-system-train-ticket-booking-10824829/) **[OFFICIAL, quoted]** |
| Aug 2026 | IRCTC states current throughput ~**37,000 bookings/min**, targeting **1 lakh+**; ~₹150 crore invested in PRS infrastructure modernisation | [Economic Times, Aug 2026](https://economictimes.indiatimes.com/industry/transportation/railways/railway-passengers-smoother-ticket-booking-is-coming-irctc-to-boost-capacity-from-37000-to-over-1-lakh-per-minute/articleshow/133531367.cms), [Indian Express, Aug 2026](https://indianexpress.com/article/india/irctc-upgrade-nget-ticket-booking-system-reduce-website-disruptions-peak-hours-tatkal-timings-10846197/) **[PRESS]** |

Measured effect of the beta so far, per IRCTC: Tatkal bookings completed within 3 minutes up **>5%**, within 5 minutes up **3%**, within 30 minutes up **>2%** (first vs second fortnight); online share **89.84%** as of July 2026 ([Indian Express, 9 Aug 2026](https://indianexpress.com/article/india/indian-railways-new-passenger-reservation-system-train-ticket-booking-10824829/)). **[OFFICIAL, IRCTC data]**

### 5.3 What this means for the mock engine

Build **preference-based allocation**, not seat picking. If you want a forward-looking mode, the most defensible interpretation of "submit their choice of seat" is an enriched preference payload — berth type, deck/bay position, coach — evaluated by the same server-side allocator, with the same "subject to availability" semantics. There is no official basis for modelling a hold-a-specific-seat flow, and there is a strong structural reason it won't arrive naively: quota segmentation, RAC berth splitting, compaction and auto-LB all mean the inventory a passenger sees is not a flat seat map.

One genuinely shipped adjacent feature worth noting: **AI-based waitlist confirmation prediction** in RailOne, with prediction accuracy improved **from 53% to 94%**, shown at booking time ([PIB, 6 Aug 2026](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/aug/doc202686945401.pdf)). **[OFFICIAL]** RailOne had 4.55 crore downloads and ~9.65 lakh bookings/day as of 22 July 2026.

---

## 6. Chart preparation

### 6.1 Timeline of the rules (this has changed three times in 18 months — pin your assumptions to a date)

| Effective | First chart | Source |
|---|---|---|
| Until mid-2025 | **4 hours** before scheduled departure from the originating station | [PIB 2140614, 29 Jun 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2140614): *"Currently, the reservation chart is prepared four hours before the departure of the train."* **[OFFICIAL]** |
| Jun–Jul 2025 (phased) | **8 hours** before departure; for trains departing **before 1400 hrs**, chart prepared **the previous day at 2100 hrs** | [PIB 2140614](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2140614); [The Hindu, 30 Jun 2025](https://www.thehindu.com/news/national/reservation-chart-set-to-be-prepared-eight-hours-prior-to-departure-of-train/article69752125.ece); [Indian Express, 2 Jul 2025](https://indianexpress.com/article/cities/delhi/indian-railways-new-charting-system-implemented-week-10102295/) — the latter reports the practical band as **minimum 8 and maximum 17 hours** before departure **[OFFICIAL + PRESS]** |
| **Railway Board circular, 12 December 2025** | **At least 10 hours** before departure for trains departing **14:01–23:59** and **00:00–05:00**. For trains departing **05:01–14:00**, first chart **preferably by 20:00 the previous day**. | [Times of India, 18 Dec 2025](https://timesofindia.indiatimes.com/life-style/travel/news/indian-railways-updates-reservation-chart-timings-what-it-means-for-travellers/articleshow/126063346.cms); [Economic Times, 18 Dec 2025](https://economictimes.indiatimes.com/industry/transportation/railways/indian-railways-revises-reservation-chart-timing-again-here-is-what-passengers-need-to-know/articleshow/126050715.cms); [Indian Express, 18 Dec 2025](https://indianexpress.com/article/india/indian-railways-new-chart-timing-updates-waiting-list-rac-passengers-10426734/) **[PRESS reporting an OFFICIAL circular to all PCCMs]** |

Railway Board's stated rationale, quoted in the circular: *"With a view to inform passengers well in time about the reservation status so as to remove the anxiety of passengers coming from the remote locations to get the long-distance trains, it has been decided to prepare the first reservation charts."* A second stated benefit is that it **allows timely transfer of vacant berths to subsequent stations via PRS** ([TOI, Dec 2025](https://timesofindia.indiatimes.com/life-style/travel/news/indian-railways-updates-reservation-chart-timings-what-it-means-for-travellers/articleshow/126063346.cms)). That second point is an allocation behaviour: earlier charting means vacancies get redistributed to downstream/remote-location quotas sooner.

**Second (final) chart: at least 30 minutes before scheduled or rescheduled departure.** This reverted to 30 minutes in October 2020 after a Covid-era change, at the request of zonal railways ([ET Travel World, Oct 2020](https://travel.economictimes.indiatimes.com/news/railways/indian-railways-reverts-to-30-minute-timeline-for-second-reservation-charts/78527269)). Its purpose is to absorb current reservations and cancellations made after the first chart ([ET, Feb 2019](https://economictimes.indiatimes.com/industry/transportation/railways/railways-starts-displaying-reservation-charts-vacant-seats-online/printarticle/68185065.cms)). **[PRESS]**

**Remote-location charts** are prepared separately by the remote location, typically **2–3 hours before the train's actual departure from that point**, and carry the remote-location quota berths ([Financial Express](https://www.financialexpress.com/business/railways-what-is-rlwl-pqwl-know-about-remote-location-waiting-list-and-pooled-quota-waiting-list-of-indian-railways-1546014/)). **[PRESS]** This is why RLWL status can change long after the originating station's chart is out.

### 6.2 What actually happens at charting

Sequence, assembled from official sources:

1. **RAC → Confirmed, and WL → Confirmed/RAC**, against berths freed by cancellations up to that moment.
2. **Coach and berth numbers are assigned** to every ticket that was confirmed-without-berth (i.e. RAC/WL that cleared before charting), **"with a view to ensuring compaction of the party"** ([USQ 4554](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals)). **[OFFICIAL]**
3. **1A coach + cabin/coupe assigned for the first time**, with HOR/dignitary entitlement, single-female-not-in-a-coupe-with-a-male, family compaction and senior-citizen lower berths applied ([USQ 4554](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals)). **[OFFICIAL]**
4. **Auto-upgradation runs**: eligible full-fare passengers move up the class ladder (max 2 levels); their vacated berths cascade to RAC/WL of that class, then to confirmed passengers of the next lower class ([Commercial Circular 13 May 2025, as reported](https://economictimes.indiatimes.com/industry/transportation/railways/will-your-waitlisted-ticket-get-an-automatic-upgrade-on-indian-railways/articleshow/121208730.cms); [IRCTC via NDTV](https://www.ndtv.com/business/irctc-indian-railways-auto-upgradation-scheme-for-online-tickets-how-it-works-rules-conditions-2015253/)). **[PRESS/OFFICIAL]**
5. **Unutilised Tatkal multi-leg portions are released to General RAC/WL** ([indianrail.gov.in Tatkal Scheme](http://www.indianrail.gov.in/tatkal_Scheme.html)). **[OFFICIAL]**
6. **VIKALP allotment** for passengers still fully waitlisted; they drop off the original train's WL chart and appear on a separate transferred-passengers list ([IRCTC VIKALP terms](https://contents.irctc.co.in/en/vikalpTerms.html)). **[OFFICIAL]**
7. **Current booking opens** on the residual vacant berths, through IRCTC, Rail Connect and PRS counters, until 30 minutes before departure. **[PRESS/COMMUNITY]** — the 30-minute close is consistently reported; see [ET Travel World](https://travel.economictimes.indiatimes.com/news/railways/indian-railways-reverts-to-30-minute-timeline-for-second-reservation-charts/78527269).
8. **Second chart** at T-30 min, folding in current bookings and post-first-chart cancellations. **[PRESS]**
9. **Onboard, post-departure**: the TTE runs HHT auto-allotment per §1.3 — turned-up RAC first, then Part-WL, then Full-WL/standing with valid authority, strictly by lowest RAC/WL number within the coach, nearest vacant berth in that or the nearest coach; leftovers **released back to PRS** ([CRIS HHT manual](https://www.hht.indianrail.gov.in/docs/user_manual_2_7_2-berth-allot-v9.pdf)). **[OFFICIAL]**

Two 2026 changes to note:

- **Vande Bharat vacant seats are bookable up to 15 minutes before departure** (as opposed to the usual 30-minute close), via IRCTC website, Rail Connect or PRS counters, where seats are genuinely vacant post-chart ([Business Today, 1 Jul 2026](https://www.businesstoday.in/india/story/indian-railways-lets-you-book-vande-bharat-seats-up-to-15-minutes-before-departure-now-heres-how-to-do-it-540209-2026-07-01)). **[PRESS]**
- **A 30-minute window to change boarding station** was introduced ([NDTV, 2026](https://www.ndtv.com/travel/indian-railways-introduces-30-minute-window-to-change-boarding-station-11313395)). **[PRESS]** Boarding-point change was previously permitted only until chart preparation.

Also relevant to occupancy modelling: since **May 2025, waitlisted passengers are barred from reserved coaches**, penalty **₹250 (non-AC) / ₹440 (AC)** plus fare from boarding station to the de-boarding station; they may travel in General coaches ([ET, May 2025](https://economictimes.indiatimes.com/industry/transportation/railways/will-your-waitlisted-ticket-get-an-automatic-upgrade-on-indian-railways/articleshow/121208730.cms)). **[PRESS]**

---

## 7. Suggested model for a mock allocator

A defensible design that matches everything documented, with nothing invented:

**Inventory setup, per train + class + date**
1. Build coaches from a configurable layout table (class → berth count, bay cycle, berth-type map from §2.3). Make berth counts and RAC counts config, not constants.
2. Carve out quota pools **before** general booking opens: senior-citizen combined LB quota (6–7 SL / 4–5 3A / 3–4 2A per coach), Ladies (6 per train in SL; 6 per train in 3A on fully-AC/Rajdhani/Duronto/Garib Rath), Divyangjan (4 berths SL as 2 LB + 2 MB; 4 in 3A/3E likewise; 4 seats in 2S/CC), Tatkal, Premium Tatkal, Pooled, Roadside/remote-location, Defence, Duty Pass, HOR/Emergency.
3. Designate the configured side-lower berths as RAC-splittable (2 seats each).

**Booking-time allocation**
4. Strict FCFS on transaction timestamp.
5. Resolve quota → pool. If pool is empty, fall through to RAC, then WL of the appropriate type (GNWL / PQWL / RLWL / TQWL / RSWL / RQWL) based on the OD pair's relationship to the train's origin and to the roadside/remote-location definitions.
6. Within the pool, apply in this order: (a) **age/gender auto-lower-berth** for male 60+, female 45+, pregnant — even with no stated preference; (b) **party compaction** — prefer a single bay, else a single coach; (c) **stated berth preference**; (d) deterministic fallback order.
7. Enforce reservation-choice hard constraints (confirmed-only, ≥1 lower, ≥2 lower) by rolling back the whole transaction on failure.
8. **1A: assign no berth number.** Status `CNF` only. Defer to charting; then assign by cabin/coupe with the coupe/gender and compaction rules.
9. **RAC and WL that clear before charting: assign no coach/berth.** Status only. Defer to charting.

**Charting job**
10. Fire at the class-appropriate offset (model the current rule: ≥10 h, or ≤20:00 previous day for 05:01–14:00 departures; keep 4 h and 8 h as selectable legacy modes).
11. Run the sequence in §6.2 steps 1–6 in that order.
12. Assign coach/berth to all deferred-confirmed tickets **with compaction as the objective** — this is the one optimisation the Ministry actually names.
13. Emit chart; open current booking; run second chart at T-30 min.

**Onboard job**
14. Implement HHT semantics faithfully — it's the only published allocator: attendance marking gates allocation; priority strictly by **lowest RAC/WL number within the coach**, not berth order; nearest vacant berth in that coach or nearest coach; release leftovers back to inventory.
15. Vacant lower berths go on priority to senior citizens / PwD / pregnant women holding middle or upper berths.

**Do not implement, or implement behind a flag labelled "folklore":** middle-coach-first, berths-30-to-40-first, lower-berths-first-for-centre-of-gravity, and cross-coach load balancing. No official source supports any of it.

---

## 8. Source inventory

**Official — Ministry of Railways / Railway Board / CRIS / PIB / Parliament / IRCTC**

| Source | Date | What it establishes |
|---|---|---|
| [LS Unstarred Q. 4554](https://sansad.in/getFile/loksabhaquestions/annex/11/AU4554.pdf?source=pqals) | 29 Mar 2017 | FCFS; preferences subject to availability; berth assigned till confirmed exhausted; RAC/WL cleared → berth at charting for **compaction**; 1A charted, coupe/gender/family/senior rules; auto-LB for M60+/F45+; LB quota 6/3/3 (4 in 3A on Rajdhani/Duronto/fully-AC) |
| [LS Unstarred Q. 3765](https://sansad.in/getFile/loksabhaquestions/annex/183/AU3765_as3PMc.pdf?source=pqals) | 18 Dec 2024 | LB quota 6–7 / 4–5 / 3–4 per coach; auto-LB even with no choice; vacant LBs to seniors/PwD/pregnant on priority |
| [LS Unstarred Q. 2182](https://sansad.in/getFile/loksabhaquestions/annex/184/AU2182_qbV6BA.pdf?source=pqals) | 12 Mar 2025 | Ladies quota 6 berths SL + 6 berths 3AC (Garib Rath/Rajdhani/Duronto/fully-AC); Section 58 Railways Act 1989; current LB quota ranges |
| [LS Unstarred Q. 1596](https://sansad.in/getFile/loksabhaquestions/annex/13/AU1596.pdf?source=pqals) | 27 Dec 2017 | Earlier quota levels (4 SL / 2 3A / 2 2A); ladies 6 berths SL |
| [LS Unstarred Q. 511](https://sansad.in/getFile/loksabhaquestions/annex/9/AU511.pdf?source=pqals) | 20 Jul 2016 | +50% enhancement to 6/3/3 |
| [LS Unstarred Q. 1736](https://sansad.in/getFile/loksabhaquestions/annex/9/AU1736.pdf?source=pqals) | 27 Jul 2016 | Ladies quota; quota utilisation stats (28 lakh ladies berths @85%, 1.42 cr senior @86%) |
| [RS Unstarred Q. 752](https://sansad.in/getFile/annex/271/AU752_JGxrS0.pdf?source=pqars) | 24 Jul 2026 | Non-AC ≈70% of coaches / 78% of seats; AC ≈22% of seats |
| [PIB, "From Queues to Clicks"](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/aug/doc202686945401.pdf) | 6 Aug 2026 | PRS history, CONCERT, 2010 Itanium/OpenVMS, capacity figures, ARP 120→60, Aug 2026 phased migration, RailOne AI WL prediction 53%→94%, official next-gen feature list |
| [PIB 2140614](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2140614) | 29 Jun 2025 | Charting 4h → 8h (+2100 previous day for pre-1400 departures); **"users will be able to submit their choice of seat"**; Aadhaar/OTP Tatkal; PRS target Dec 2025 |
| [PIB, "Categories of Reservation Quotas"](https://www.pib.gov.in/newsite/PrintRelease.aspx?relid=187186) | — (RS reply) | Full 17-quota list; which 7 are bookable online; ≈94% of reserved accommodation |
| [indianrail.gov.in quota codes](http://www.indianrail.gov.in/quota_Code.html) | CRIS, current | 19 PRS quota codes; **official RAC definition as berth-splitting**; roadside-quota redefinition rule with worked example |
| [indianrail.gov.in Tatkal Scheme](http://www.indianrail.gov.in/tatkal_Scheme.html) | CRIS, current | Tatkal windows, charges, ID rules, multi-leg release at charting, **EC Tatkal = 10% ≈ 5 seats/coach**, agent blackout windows |
| [IRCTC Tatkal FAQ](https://contents.irctc.co.in/en/tatkal_faq.pdf) | current | Classes, charges table, 10:00/11:00 windows, no concession, refund rules |
| [IRCTC VIKALP Terms](https://contents.irctc.co.in/en/vikalpTerms.html) | current | Complete VIKALP rule set |
| [IRCTC Foreign Tourist Quota guide](http://contents.irctc.co.in/en/ForeignTouristQuotaBooking.pdf) | current | 365-day FT ARP; classes; **berth allotted at booking within ARP, deferred to ARP opening beyond it** |
| [IRCTC NGeT Journey Planning user guide](https://contents.irctc.co.in/en/NGET_JP_Userguide.pdf) | current | Berth preference per passenger; "allotment of your required berth depends on the availability" |
| [CRIS, HHT Auto Berth Allotment & Release manual v2.7.2-v-9](https://www.hht.indianrail.gov.in/docs/user_manual_2_7_2-berth-allot-v9.pdf) | 23 Dec 2022 | **The only published allocator**: RAC → Part-WL → Full-WL/standing; lowest RAC/WL number within coach; nearest vacant berth; RAC number ≠ berth order; release to PRS |
| [South Western Railway Press Release 530](https://www.nabkerala.org/wp-content/uploads/2026/02/NEW-RAILWAY-PASS-INSTRUCTION.pdf) | 13 Mar 2024 | Divyangjan quota exact numbers incl. Vande Bharat seat 40 in C1/C7/C14 + escort seats; unique-ID requirement |
| [NewsOnAir (Prasar Bharati)](https://newsonair.gov.in/new-irctc-beta-website-launched-for-easier-ticket-booking/) | 16 Jul 2026 | The four features of the IRCTC beta — **seat selection not among them** |
| [Railway Board Commercial Circular 19/2022](https://staffnews.in/wp-content/uploads/2022/10/CC-19-2022.pdf) | Oct 2022 | Earlier Divyangjan quota (4 SL, 2 3AC) — *cited via search index; host blocked direct download* |
| [Railway Board Commercial Circular 07/2025](https://staffnews.in/wp-content/uploads/2025/07/Railway-Board-Commercial-Circular-07-2025.pdf) | Jul 2025 | Auto-upgradation: "All passengers who have booked tickets on full fare shall be eligible" — *cited via search index; host blocked direct download* |

**Press reporting official circulars**

- [Indian Express, 18 Dec 2025](https://indianexpress.com/article/india/indian-railways-new-chart-timing-updates-waiting-list-rac-passengers-10426734/) · [Times of India, 18 Dec 2025](https://timesofindia.indiatimes.com/life-style/travel/news/indian-railways-updates-reservation-chart-timings-what-it-means-for-travellers/articleshow/126063346.cms) · [Economic Times, 18 Dec 2025](https://economictimes.indiatimes.com/industry/transportation/railways/indian-railways-revises-reservation-chart-timing-again-here-is-what-passengers-need-to-know/articleshow/126050715.cms) — 12 Dec 2025 charting circular
- [Economic Times, 16 May 2025](https://economictimes.indiatimes.com/industry/transportation/railways/will-your-waitlisted-ticket-get-an-automatic-upgrade-on-indian-railways/articleshow/121208730.cms) · [Times of India, 16 May 2025](https://timesofindia.indiatimes.com/city/chennai/now-your-waitlist-ticket-may-land-you-in-a-better-seat/articleshow/121195960.cms) — 13 May 2025 auto-upgradation circular
- [Indian Express, 10 May 2026](https://indianexpress.com/article/india/waiting-list-to-higher-class-how-indian-railways-ticket-upgradation-system-works-10681111/) — upgradation history
- [PTI via ETInfra, 6 Dec 2025](https://infra.economictimes.indiatimes.com/news/railways/automatic-allotment-of-lower-berths-to-senior-citizens-45-plus-women-if-available-vaishnaw/125798874) — RS reply on LB and Divyangjan quotas
- [NDTV, 4 Dec 2018](https://www.ndtv.com/india-news/6-more-reserved-berths-for-women-in-air-conditioned-train-compartments-1957824) — 3AC ladies quota circular
- [The Hindu, 30 Jun 2025](https://www.thehindu.com/news/national/reservation-chart-set-to-be-prepared-eight-hours-prior-to-departure-of-train/article69752125.ece) · [Indian Express, 2 Jul 2025](https://indianexpress.com/article/cities/delhi/indian-railways-new-charting-system-implemented-week-10102295/) — 8-hour charting
- [ET Travel World, Oct 2020](https://travel.economictimes.indiatimes.com/news/railways/indian-railways-reverts-to-30-minute-timeline-for-second-reservation-charts/78527269) — second chart at T-30 min
- [Business Today, 1 Jul 2026](https://www.businesstoday.in/india/story/indian-railways-lets-you-book-vande-bharat-seats-up-to-15-minutes-before-departure-now-heres-how-to-do-it-540209-2026-07-01) — Vande Bharat T-15 min booking
- [Financial Express, 12 Apr 2019](https://www.financialexpress.com/business/railways-what-is-rlwl-pqwl-know-about-remote-location-waiting-list-and-pooled-quota-waiting-list-of-indian-railways-1546014/) — RLWL / PQWL mechanics
- [NDTV, Feb 2026](https://www.ndtv.com/travel/man-complains-82-year-old-woman-allotted-upper-berth-despite-other-seats-available-indian-railways-reacts-11153104) — IRCTC restating the auto-LB rule in public
- [Livemint, Sep 2022](https://www.livemint.com/news/india/how-to-book-confirmed-lower-berth-for-senior-citizens-in-indian-railways-irctc-explains-11663917206125.html) — IRCTC advising the "book only if lower berth is allotted" choice

**Reference / community — treat as indicative**

- [Wikipedia: Indian Railways coaching stock](https://en.wikipedia.org/wiki/Indian_Railways_coaching_stock) — capacities, berth/seat type codes, coach letter codes
- [Wikipedia: Reservation against Cancellation](https://en.wikipedia.org/wiki/Reservation_against_Cancellation) — RAC sharing convention, status-string convention
- [seat61.com India guide](https://www.seat61.com/India.htm) — physical layouts per class; 1A berths only at charting; couples→coupé preference
- [GeeksforGeeks berth-from-seat-number](https://www.geeksforgeeks.org/dsa/program-to-print-the-berth-of-given-railway-seat-number/) — SL/3A mod-8 rule
- [TrainBerth](https://trainberth.in/) and its [guide](https://trainberth.in/guide) — per-class berth-number maps for SL, 3A, 3E, 2A, 1A, CC, EC, 2S
- Quora threads cited inline in §1.2, §1.4, §3.5, §4.2 — the origin of the middle-coach/load-distribution folklore and of the per-coach RAC counts

---

## 9. Open gaps

Things I could not source, which you should treat as unknown rather than guess:

1. **Any official statement of berth fill order** within a coach, or coach fill order within a rake.
2. **Official per-coach RAC counts.** The 7/4/3 figures are community-only.
3. **Whether the single-female-in-a-bay rule extends beyond 1A coupes.** Official text scopes it to 1A only.
4. **The exact 3E tail layout** (berths 82–83) and whether the side-middle exists on all 3E rakes.
5. **The exact IRCTC reservation-choice option strings**, including whether a same-coach-confirmed option exists.
6. **Railway Board Commercial Circulars 19/2022 and 07/2025 in full text** — both are indexed but the mirror host blocked direct download. Worth retrieving from `indianrailways.gov.in/railwayboard` if you need the exact clauses.
7. **Ladies quota per-train vs per-coach** — the official phrasing strongly implies per-train, but I found no source that says so in those words.
8. **Whether the Dec 2025 10-hour charting rule is fully rolled out** across all trains as of Aug 2026, or still phased.
