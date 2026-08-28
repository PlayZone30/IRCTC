# PLAN.md — RailIndia POC · Master Build Specification

**Project:** A rebuilt IRCTC passenger e-ticketing web application for the "Build What Moves India" hackathon.
**Round 1 deadline:** 28 August 2026, 8:00 PM IST. Firm.
**Status:** Specification complete. Build not started.
**Companion documents:** `CONSOLIDATED_UNDERSTANDING.md` (why), `IRCTC Public Issue & Enhancement Status Atlas.md` (evidence), `research/prs-berth-allocation-research.md` (allocation rules), `research/competitive-benchmark-third-party-and-global-rail.md` (patterns).

---

## 0. How to use this document

This is the single source of truth for the build. If an instruction here conflicts with anything else, **this document wins**.

Read in this order before writing code: §1 guardrails → §2 what we are building → §3 design system → §4 route map → then only the screen spec in §5 that you are assigned.

**Rules for anyone working on this:**

1. **Do not invent domain rules.** Every fare, quota, timing and refund rule is specified in §8. If a rule is not in §8, do not make one up — leave a `TODO(rule)` comment and move on.
2. **Do not invent statistics.** Numbers permitted in UI copy are listed in §14.4. Nothing else.
3. **Do not add features.** The scope in §6 is complete and closed. No dark mode, no 3D, no parallax, no confetti, no AI avatars.
4. **Never leave a dead end.** Every route renders something honest. A stub with real copy beats a blank screen or a crash.
5. **Mock everything, fake nothing visible.** Data is mock. Behaviour must be real: state transitions, validation, allocation, timers all genuinely execute.
6. **Build mobile-first at 360px, verify at 768px and 1440px.** Web only. No native app.

---

## 1. Guardrails — things that will sink the submission

| Guardrail | Why |
|---|---|
| **Never claim IRCTC's chatbot cannot book tickets.** AskDISHA 2.0 books, cancels, checks refunds and changes boarding station, by text and voice, in four languages. | A judge who knows the platform catches it instantly and discounts everything else. Our defensible claim is in §7.11. |
| **Never claim we removed the CAPTCHA as an innovation.** IRCTC's own July 2026 beta did that. | Same reason. Ours is a *consequence* of the design, never the headline. |
| **Never show a confirmation probability percentage.** | A percentage from a government platform reads as a promise. We show historical evidence instead. See §7.5. |
| **Never let the agent spend money.** It proposes; a human confirms on a real screen. | Directly answers the two documented AskDISHA complaints, and it is the correct pattern for an agent transacting for a citizen. |
| **Never present berth choice as free airline-style seat selection.** | Allocation exists to serve party compaction and quota equity. Ours is review-and-override on top of allocation. See §9. |
| **No mobile app, no app-store anything.** | The brief states judges will not download apps; anything that does not open in a browser is not reviewed. |
| **Demo credentials must be visible on the landing page.** | Hard requirement of the brief. One click to enter, no typing. |

---

## 2. What we are building

### 2.1 One-sentence definition

A complete, mock-backed rebuild of IRCTC's passenger booking journey — landing → search → passengers → review → payment → ticket → refund — with an **agent that actually completes the booking**, a **visible money-and-ticket state machine**, and **real options when the train is full**.

### 2.2 Product name

**RailIndia** for the product. **Sarathi** for the agent.

Reasoning: "Sarathi" (सारथी, charioteer/guide) is the right register for a government service — a guide who drives, not a mascot. `AskDISHA` is taken.

### 2.3 The thesis, which every screen must serve

> IRCTC has fixed how the page *looks*. It has not fixed what the citizen cannot *see* — where their money is, what their real options are when a train is full, and whether they are ready to book before the clock starts.

### 2.4 What we keep from IRCTC, deliberately

We are rebuilding a government service, not replacing it with a startup. Familiarity is a feature. The following are preserved because citizens already know them:

- The **same journey**: landing with a booking widget → results list → 3-step booking wizard → payment → ticket
- The **same 3-step wizard labels**: Passenger Details · Review Journey · Payment
- The **same vocabulary**: PNR, Quota, Class, Boarding Point, ERS, TDR, CNF/RAC/WL, Charts/Vacancy
- The **same field set** on every form — nothing a user relies on is removed
- **PNR Status** and **Charts / Vacancy** as first-class utilities on the landing page
- The **full class list and quota list** exactly as IRCTC offers them (§8.2, §8.3)

### 2.5 What we fix, and the evidence for each

| IRCTC behaviour observed in the reference screenshots | Our fix |
|---|---|
| Availability requires clicking **"Refresh"** on every class of every train, one at a time | All classes load with the results, in one view, no click |
| Class availability sits behind **horizontally scrolling tabs** that overflow | All classes visible simultaneously as a comparison row |
| Journey Class filter checkboxes **overlap each other** and are unreadable | Single-column filter list, adequate hit targets |
| Station names **truncated mid-word** in inputs (`HYDERABAD DECAN - HYB (S`) | Two-line station display: name on line one, code and city on line two |
| **Promo strip with NEW badge** and dismiss × above the fold | No promotional interruption anywhere in the booking path |
| **Co-branded card upsell** injected into the passenger form as a pre-selected radio group | Removed from the booking path entirely |
| **Convenience fee appears only at step 2**, after passenger details are entered | Total including convenience fee and GST shown from the first results screen |
| Payment gateway charges shown as one dense unreadable string | A table: instrument, charge, and the resulting total |
| **Date-mismatch warning delivered as a blocking modal** ("You searched for 27 Aug but booking for 28 Aug") | Inline, non-blocking notice at the point of the mismatch |
| The berth-allocation rule buried in **fine print at the page bottom** ("Booking shall be done in PRS in the coach given by the user if seats are available, otherwise the passenger is allotted in any other coach") | Surfaced as a plain-language explanation attached to the allotted berth |
| "Any confirmed status shown above may decline into RAC/Waiting List status, while your payment being processed" — in a footnote | Stated at the point of payment, in the payment state machine |
| **CNF Probability** hidden behind a button, output unexplained | Replaced with inline historical evidence (§7.5) |
| Validation copy defects (`between 3and16 characters`), empty numbered notes (`2.`) | Copy deck in §13, reviewed |
| Three official front doors with no canonical channel | One web application, one account, one order history |

---

## 3. Design system

The look comes from `inspiration/image.png` and `inspiration/image1.png` — the "easyticket" rail booking concept. Adopt it faithfully. Ignore `index.css` and `atlas-enhancements.css`; those are the Signal Archive research-microsite theme and are **not** used for this product.

### 3.1 Colour tokens

```css
:root {
  /* Core, taken directly from the inspiration palette */
  --ink:            #181D2A;   /* primary text, dark surfaces, primary buttons */
  --primary:        #748EFE;   /* accent: prices, active chips, selected states, links */
  --surface-sunken: #E8EBED;   /* app background behind cards */
  --surface:        #FFFFFF;   /* cards, inputs, sheets */

  /* Derived neutrals */
  --ink-2:          #4A5364;   /* secondary text */
  --ink-3:          #7C8698;   /* tertiary text, placeholders */
  --hairline:       #E2E6EA;   /* 1px borders */
  --surface-2:      #F4F6F7;   /* nested panel, transfer chips */
  --primary-weak:   #EEF1FF;   /* tinted background for primary states */
  --primary-press:  #5B76F0;   /* hover/active on primary */
  --ink-press:      #232B3D;   /* hover on dark buttons */

  /* Accents */
  --accent:         #E8552F;   /* the orange "Cheapest" chip; use sparingly */
  --accent-weak:    #FDEDE8;

  /* Availability semantics — never colour alone, always with text */
  --cnf:            #12805A;   --cnf-weak:     #E6F5EF;
  --rac:            #A9600C;   --rac-weak:     #FDF1E3;
  --wl:             #C0392B;   --wl-weak:      #FCEBE9;
  --regret:         #7C8698;   --regret-weak:  #F1F3F5;

  /* Radii */
  --r-card: 20px;  --r-field: 12px;  --r-chip: 999px;  --r-btn: 12px;  --r-sheet: 24px;

  /* Elevation — soft and low, never dramatic */
  --shadow-1: 0 1px 2px rgba(24,29,42,.04);
  --shadow-2: 0 1px 2px rgba(24,29,42,.04), 0 8px 24px rgba(24,29,42,.06);
  --shadow-3: 0 12px 40px rgba(24,29,42,.12);

  /* Focus — must be visible on every interactive element */
  --focus: 0 0 0 3px rgba(116,142,254,.45);
}
```

**Contrast rules.** Body text uses `--ink` or `--ink-2` on `--surface` or `--surface-sunken`. `--primary` is used for **large text (18px+ semibold), icons and fills — never for body copy on white**. Status colours are used at 14px+ semibold and always accompanied by a text label.

### 3.2 Typography

The inspiration specifies **Google Sans**, which is not licensed for open web use. Use **DM Sans** — the closest freely available geometric humanist sans — with a system fallback.

```css
--font: "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

Load weights 400, 500, 700 only. Enable tabular figures globally on numeric content:

```css
.tnum, time, .fare, .pnr, .berth { font-variant-numeric: tabular-nums; }
```

| Role | Size / line-height | Weight | Notes |
|---|---|---|---|
| Display time (`06:00`) | 32 / 36 | 700 | tabular, `-0.02em` |
| Page title | 28 / 34 | 700 | |
| Section title | 20 / 26 | 700 | |
| Card title (train name) | 17 / 24 | 700 | |
| Body | 15 / 22 | 400 | |
| Body strong | 15 / 22 | 500 | |
| Label / field label | 13 / 18 | 500 | `--ink-2` |
| Caption / meta | 12 / 16 | 400 | `--ink-3` |
| Chip / badge | 12 / 16 | 700 | `0.01em` |
| Fare display | 24 / 28 | 700 | `--primary`, tabular |

No serif anywhere. No letter-spaced all-caps eyebrows (that was the Signal Archive theme).

### 3.3 Layout

- **App background** `--surface-sunken`. Content sits on white cards with `--r-card` and `--shadow-2`.
- **Max content width** 1200px, centred, 24px gutters desktop / 16px mobile.
- **Grid** on results: 300px filter rail + fluid results column, 20px gap. Rail collapses to a bottom sheet under 900px.
- **Spacing scale** 4 8 12 16 20 24 32 40 56 72.
- **Sticky elements:** top nav (64px) and, on results, the search summary bar directly beneath it.

### 3.4 Components — the exact set to build

Build these once in `src/components/ui/` and reuse. No ad-hoc styling in screens.

| Component | Spec |
|---|---|
| `AppShell` | Sticky white top nav on `--surface-sunken`. Left: squircle logo mark (36px, `--primary` fill, white glyph) + wordmark `RailIndia` 17/700. Centre: nav links `Book` · `My bookings` · `PNR status` · `Charts`, active link with a 2px `--ink` underline offset 6px. Right: text-size control (A− A A+), language toggle (EN / हिं), notification bell with dot, avatar. Mobile: logo + hamburger + avatar; nav in a sheet. |
| `SearchBar` | One white card, `--r-card`, `--shadow-2`, internal fields divided by 1px `--hairline` verticals. Fields: From, swap button, To, Date, Class, Quota. Swap is a 40px circular `--ink` button with white ⇄ glyph, centred on the divider. Trailing 56px `--ink` rounded-square search button with a white magnifier. Stacks vertically on mobile with the search button full-width. |
| `StationField` | Two-line display — line 1 station name 15/500, line 2 `CODE · City` 12/400 `--ink-3`. Never truncate mid-word; use ellipsis on line 1 only. Typeahead panel: recent searches first, then matches with the query substring in `--primary` 700. **A live region announces the selected station** after choice. |
| `Chip` | Pill, `--r-chip`, 12/700, 6px 12px padding. Variants: `solid-accent` (Cheapest), `solid-primary` (Recommended), `weak-primary` (Popular), `outline` (neutral metadata), plus `cnf` `rac` `wl` `regret` using the status token pairs. |
| `Button` | `--r-btn`, min-height 44px, 15/700. `primary` = `--ink` bg / white text. `accent` = `--primary` bg / white text. `ghost` = transparent, `--hairline` border, `--ink` text. `quiet` = text only, `--primary`. Disabled = `--surface-2` bg, `--ink-3` text, `not-allowed`. Loading = inline spinner, label retained, width locked. |
| `IconButton` | 36px circle, `--surface-2` bg, `--ink` glyph. Used for bookmark, share, collapse. |
| `Card` | White, `--r-card`, `--shadow-2`, 20px padding. `CardHeader` sits on `--surface-2` with a bottom hairline when a card needs a titled band. |
| `JourneyTimeline` | Horizontal rail. Departure and arrival endpoint dots 10px `--primary`; intermediate stops 6px `--ink`; 1px `--hairline` connector. Times above the rail 13/500; station chips below on `--surface-2` with `--r-field`. Leg chips carry train number + class + a clock glyph + duration in `--primary`. Under 720px it rotates to a vertical rail. |
| `AvailabilityCell` | The core comparison unit. Class code + full name, status chip, fare, and a one-line consequence. Selected state: `--primary-weak` fill + 2px `--primary` border. |
| `DateStrip` | Horizontally scrollable seven-day availability row (IRCTC parity), each cell showing weekday, date, status chip. Selected cell gets `--primary-weak` + 2px `--primary` border. Keyboard: arrow keys move, Enter selects. |
| `FareTable` | Line items with tabular right-aligned figures; a `--surface-2` total row with `--r-field`. Every charge always visible, never revealed late. |
| `StatusExplainer` | Inline expandable. Trigger is the status code as a chip with a small info glyph; content is the plain-language consequence from §13.2. Never a tooltip only — must work on touch and keyboard. |
| `Stepper` | Three numbered nodes: `1 Passenger Details` · `2 Review Journey` · `3 Payment`. Complete = `--ink` filled with a check; current = `--primary` filled; upcoming = `--surface-2` with `--ink-3`. Connector 1px `--hairline`, filled `--ink` when passed. |
| `TimelineVertical` | The money/ticket state machine. Each step: dot, label, timestamp, detail line, optional reference code. Dot states — done `--cnf`, active `--primary` with a soft pulse, pending `--hairline` hollow, failed `--wl`. |
| `Sheet` | Bottom sheet on mobile, right drawer ≥900px. `--r-sheet` top corners, `--shadow-3`, scrim `rgba(24,29,42,.4)`. Focus trapped, Escape closes, focus returns to trigger. |
| `Banner` | Inline notice, `--r-field`, 12px 16px, left 3px accent stripe. Variants info / warn / danger / success. **Never used as a blocking modal.** |
| `Toast` | Bottom-centre, auto-dismiss 5s, `aria-live="polite"`, max two stacked. |
| `EmptyState` | Glyph, one-line title, one-line explanation, one action. Used wherever data is absent — no blank regions anywhere. |
| `Skeleton` | `--surface-2` blocks, 1.4s shimmer. Availability cells skeleton-load rather than requiring a Refresh click. |

### 3.5 Motion

150–220ms, `cubic-bezier(.2,.8,.2,1)`. Permitted: opacity, transform, height on disclosure. Press feedback `scale(.98)`. The agent's step trace may stagger children by 40ms. Everything wrapped in `@media (prefers-reduced-motion: reduce)` which disables transforms and shortens durations to 0.01ms. No scroll-linked animation, no 3D, no parallax.

### 3.6 Accessibility floor — non-negotiable

- Keyboard-completable booking from landing to payment with no pointer.
- Visible focus ring `--focus` on every interactive element. Never `outline: none` without a replacement.
- Status is text + colour, never colour alone.
- Station typeahead announces the resolved selection via `aria-live="polite"` (the SNCF Connect pattern).
- Text-size control (A− A A+) scales a root `--font-scale` from 0.875 to 1.25 and persists.
- Sheets and menus trap focus, close on Escape, restore focus.
- All icon-only controls carry `aria-label`.
- Target size ≥44×44px.
- One `<h1>` per route; headings in order.
- Honest claim only: "built to WCAG 2.1 AA and GIGW 3.0 intent; full conformance needs assistive-technology testing and expert audit."

---

## 4. Route map

Mirrors IRCTC's own structure so a citizen is never lost.

| Route | Screen | IRCTC equivalent |
|---|---|---|
| `/` | Landing — booking widget, PNR/Charts tabs, services | `irctc.co.in` home |
| `/search` | Results — trains, all-class availability, alternates | `/nget/train-search` → train list |
| `/book/passengers` | Step 1 — passengers, contact, preferences | Passenger Details |
| `/book/review` | Step 2 — review, berth allotment, fare | Review Journey |
| `/book/payment` | Step 3 — payment method, authorise | Payment |
| `/orders` | All bookings and their money state | Booking History |
| `/orders/:orderId` | **Order timeline** — payment/ticket/refund state machine | *(no equivalent — our addition)* |
| `/ticket/:pnr` | ERS / e-ticket, offline-capable | Electronic Reservation Slip |
| `/journey/:pnr` | Journey day — coach position, platform, occupancy, check-in | *(partly NTES / RailOne)* |
| `/ready` | **Ready-to-book console** for Tatkal / ARP windows | *(no equivalent — our addition)* |
| `/pnr` | PNR status lookup | PNR Status |
| `/charts` | Charts / Vacancy | Charts / Vacancy |
| `/help/:topic` | Rule explainers (refund, waitlist, quota, berth) | scattered PDFs |
| `/login` | Demo account chooser | Login |

The agent **Sarathi** is a global drawer available on every route, not a route of its own. `?agent=open` opens it for deep links and for the demo recording.

---

## 5. Screen specifications

### S1 · Landing — `/`

**Purpose.** Get a citizen into a search in under five seconds, and let a judge log in in one click.

**Layout, top to bottom.**

1. `AppShell`.
2. **Demo access bar.** Full-width `--primary-weak` band, `--r-card`, directly under the nav. Text: "Demo build — pick an account to explore." Three `Button ghost` chips: **Priya (Aadhaar verified)** · **Ramesh (senior citizen)** · **Guest (not verified)**. One click signs in and returns to `/`. This satisfies the brief's instant-login requirement and must never be hidden behind a link.
3. **Hero + booking card.** Two columns ≥1024px: left the booking card, right a calm rail photograph with `--r-card` and a subtle `--ink` gradient scrim at 10%. No headline text over the image beyond a small `Chip outline` reading "Indian Railways". Single column on mobile, card first, image suppressed under 640px.
4. **Booking card** — white, `--r-card`, `--shadow-2`, 24px padding.
   - Segmented control at the top: **Book ticket** | **PNR status** | **Charts / vacancy** (IRCTC parity, but a proper segmented control rather than two detached tabs).
   - Book ticket panel:
     - `StationField` From + swap + `StationField` To
     - Date field with a calendar popover; quick chips **Today · Tomorrow · Day after**
     - `Class` select — full list from §8.2, default **All Classes**
     - `Quota` select — full list from §8.3, default **General**
     - Checkbox row: `Flexible with date` · `Person with disability concession` · `Railway pass concession` (IRCTC parity)
     - `Button accent` full width: **Search trains**
     - Under the button, a single quiet line: "Or ask Sarathi — *book Kollam to Chennai on 12 September*" where the italic phrase is a `Button quiet` that opens the agent pre-filled.
   - Inline validation only. Never a modal. Never a CAPTCHA.
5. **Ready-to-book strip.** Shown only when the signed-in account has an armed draft or a booking window opens within 24 hours. One line: "Tatkal for 12624 opens tomorrow 11:00 — you are verified and ready." with a `Button ghost` → `/ready`.
6. **Services row.** Single horizontal scroller of 10 `Chip outline` items with small glyphs: Flights · Hotels · Buses · E-catering · Tour packages · Tourist trains · Hill railways · Charter · Rail Drishti · Gallery. Deliberately understated and **below** the booking task — this is the fix for feature sprawl. Each opens a `Sheet` saying the service is out of scope for this POC and linking to the official service. Honest, and no dead ends.
7. **Footer.** Four columns, `--ink` background: Book & manage · Rules & refunds · Help · About this build. The last column states plainly that this is an independent hackathon prototype with mock data, not affiliated with IRCTC or Indian Railways. **This disclaimer is required.**

**Explicitly absent:** promo strip, NEW badge, cashback button, co-branded card upsell, social media wall, payment-network logo strip, "Designed and Hosted by" line.

---

### S2 · Results — `/search`

The most important screen in the build. Everything the citizen needs to decide, on one surface, with no per-class Refresh click.

**A. Sticky search summary.** White bar under the nav, `--shadow-1`. Compact: `HYB → NDLS · Thu 27 Aug · All classes · General`, with `Button ghost` **Modify**. Expanding reveals the full `SearchBar` inline. Below it a `Chip outline` row for the three concession toggles when active.

**B. Date context row.** `Previous day` ← → `Next day` and a seven-day `DateStrip` showing the **best status available on each date across all classes**. This is IRCTC's multi-date strip, promoted from inside a train card to the top of the page where it belongs.

**C. Result header.** `5 trains · Hyderabad Decan → New Delhi · Thu, 27 Aug 2026 · General quota`. Sort control: **Departure · Duration · Fare · Best chance of confirmation**. Default **Departure** (IRCTC parity).

**D. Filter rail** (300px, sticky, own scroll; bottom `Sheet` under 900px).
Sections, each collapsible, each **single column** — this is the direct fix for IRCTC's overlapping checkboxes:
- Journey class — checkbox per class with the code as a trailing `Chip outline`
- Train type — Rajdhani, Shatabdi, Duronto, Vande Bharat, SF Express, Express, Other
- Departure window — four tiles: Early morning 00–06 · Morning 06–12 · Mid day 12–18 · Night 18–24
- Arrival window — same four tiles
- From station / To station — checkbox lists
- Availability — Confirmed only · Include RAC · Include waitlist
- Footer: `Button quiet` **Reset** and `Button primary` **Apply** (mobile only; desktop applies live)

**E. Train card.** One `Card` per train.

- **Header band** (`--surface-2`): train name + number 17/700; `Chip outline` per running day with non-running days at 40% opacity; `Button quiet` **Schedule** opening a `Sheet` with the full halt list.
- **Journey row:** `32/700` departure time + station + date on the left, `JourneyTimeline` centre with total duration above it, arrival right-aligned. Day-change is stated as text (`+1 day`), never implied by colour.
- **Availability comparison row — the centrepiece.** A horizontal set of `AvailabilityCell`s, **one per class that this train runs, all loaded at once**, each showing:
  - class code and full name (`3A · AC 3 Tier`)
  - status `Chip` — `CNF 12` / `RAC 8` / `GNWL 34` / `TQWL 12` / `REGRET` / `Not available`
  - fare, all-inclusive, with a caption `incl. ₹23.60 fee` (see §8.6)
  - a one-line consequence from §13.2, e.g. under a waitlist chip: "If this doesn't clear you cannot board a reserved coach."
  - Clicking selects the cell (`--primary-weak` + 2px `--primary` border) and reveals **E.1** beneath.
  On mobile the row becomes a 2-up grid, no horizontal scroll.
- **E.1 Expanded panel for the selected class** — three stacked blocks:
  1. **Confirmation evidence** (§7.5) — never a percentage.
  2. **Seven-day strip** for that class (IRCTC parity, now inside the selected class only).
  3. **Book row** — total fare, `Button accent` **Book**, `Button quiet` **Add to Ready** (arms it for a future window).
- **Footer meta:** `Updated 42s ago` with a refresh `IconButton`, and the honest NTES note: "Actual running time may differ. Check live status before you leave."
- **Alternates affordance.** When no class on this train is confirmed, the card grows a `--primary-weak` strip: "No confirmed berth on this train. **3 confirmed alternatives** →" which expands **F** in place.

**F. Alternates panel** (§7.4). Renders inside the train card that triggered it so the connection is obvious. Never a separate page.

**G. Empty and degraded states.** Zero results → `EmptyState` offering nearby stations and adjacent dates. All waitlisted → a `Banner warn` at the top of the list: "Nothing is confirmed on this route today. Here is what does work." followed by alternates ranked first.

---

### S3 · Passenger details — `/book/passengers`

Step 1. Field parity with IRCTC, with the upsells removed and the rules surfaced.

1. `Stepper` at 1.
2. **Journey summary card** — train, times, stations, `Chip` for `AC 3 Tier (3A) · General`, and the live status. `Button quiet` **Change** returns to `/search` with state intact.
3. **Boarding point.** A proper select listing every halt with `Station · arrives HH:MM · departs HH:MM · Day N · Boarding date`, exactly the data IRCTC exposes. Default is the searched origin. Changing it shows a `Banner warn`: "You give up the right to board at Hyderabad Decan." (§8.7)
4. **Eligibility notice**, only when it applies, as a `Banner warn` — for example "Senior citizen concession is not available in this quota." Stated once, at the top, with the reason. Never a yellow strip pinned above the whole page.
5. **Passengers.** Repeatable rows, up to the quota's limit (§8.4). Per row: Name · Age · Gender · Country · Berth preference · Meal (only when the train serves it) · optional concession + ID.
   - Saved passengers appear first as selectable `Chip`s — one tap fills a row.
   - **Automatic lower-berth notice** fires live: when age ≥60 male or ≥45 female is entered, an inline `Banner info` reads "Lower berth will be requested automatically for this passenger, subject to availability." (§9.3)
   - `Button quiet` **Add passenger** and **Add infant without berth**, with the under-5 rule stated.
   - Row remove is an `IconButton` with an `aria-label`, never a bare ×.
6. **Reservation choice.** A radio group, promoted from IRCTC's buried dropdown because it is the one control that converts a preference into a guarantee:
   - Book even if waitlisted *(default)*
   - **Book only if confirmed** — with the consequence: "If nothing is confirmed the booking is not made and you are not charged."
   - Book only if at least one lower berth is allotted
   - Book only if two lower berths are allotted
7. **Other preferences.** `Consider for auto-upgradation` checkbox with a one-line explanation of the ladder and the caveat that a lower berth is not assured after an upgrade (§8.8).
8. **Contact.** Mobile and email, masked for the demo account, editable.
9. **Fare panel** (sticky right ≥1024px, sticky bottom bar on mobile). `FareTable`: base fare per passenger, quota charge if any, convenience fee, GST, **total**. Complete from this screen onward — no late reveals.
10. `Button ghost` **Back** · `Button accent` **Continue**.

---

### S4 · Review journey — `/book/review`

Step 2. This is where we do the thing IRCTC does not: **explain the allotment before payment**.

1. `Stepper` at 2.
2. **Journey card** with the definitive status chip.
3. **Berth allotment block** (§7.6, §9) — the differentiator on this screen.
   - For each passenger: coach, berth number, berth type, e.g. `S5 · 47 · Side upper`.
   - A `StatusExplainer` per passenger giving the *reason*, drawn from the allocator's decision trace: "You asked for lower. Six lower berths in this coach are held for the senior-citizen quota and the remaining lowers were taken earlier today."
   - `Button ghost` **View coach map** → `Sheet` with the annotated coach map (§7.6). Changing a berth here is free and re-renders the block.
   - When the class is **1A**: no berth is shown. Instead: "First AC berths are assigned when the chart is prepared, so families stay together and coupés are allocated appropriately." (§9.2)
   - When the booking is **RAC or waitlisted**: no berth is shown. Instead the plain consequence and the chart time.
4. **Passenger summary** — name, age, gender, berth, concession applied.
5. **What happens next** — a compact `TimelineVertical` preview: payment held → ticket issued → chart prepared at *(computed time from §8.5)* → refund window closes at *(computed)*. This is the honest version of IRCTC's footnote about status declining into RAC while payment processes.
6. **Cancellation terms**, inline, not behind a link: the four bands with the actual rupee outcomes for this fare (§8.9).
7. `FareTable` unchanged from S3.
8. `Button ghost` **Back** · `Button accent` **Continue to payment**.

---

### S5 · Payment — `/book/payment`

Step 3. The fix for the single most persistent complaint in the evidence.

1. `Stepper` at 3.
2. **Hold-then-capture explainer** — a `Banner info` at the top, and the default behaviour: "We place a hold on your money. It is captured only when your ticket is issued. If issuance fails the hold is released." This is iPAY AutoPay semantics made the default rather than an option.
3. **Method list.** Left rail of categories, right panel of detail (IRCTC parity), but with a readable `FareTable` per instrument instead of one dense string:

   | Instrument | Gateway charge | Convenience fee | Total |
   |---|---|---|---|
   | UPI / AutoPay | Nil | ₹20 + GST | computed |
   | RuPay debit | Nil | ₹30 + GST | computed |
   | Other debit ≤₹2000 | 0.4% + GST | ₹30 + GST | computed |
   | Other debit >₹2000 | 0.9% + GST | ₹30 + GST | computed |
   | Credit card | 1.8% + GST | ₹30 + GST | computed |
   | Net banking | ₹10 + GST | ₹30 + GST | computed |

   Selecting an instrument updates the total instantly. The cheapest option is flagged with a `Chip solid-accent` reading **Lowest total**.
4. **Authorise.** `Button accent` **Authorise ₹4,598.60 hold**. Label states the amount and that it is a hold.
5. **Execution.** Route to `/orders/:orderId` immediately and let the state machine run there. Never a full-page spinner. Never a dead wait.

---

### S6 · Order timeline — `/orders/:orderId`

Our headline addition. One order, one truth, no handoff between portal, gateway and bank.

**Header.** Order ID, created timestamp, a single prominent `Chip` for the overall state, total, and — once issued — the PNR.

**`TimelineVertical`.** Each step carries a label, timestamp, detail, and a copyable reference:

1. Order created — `RI-2609-004421`
2. Payment authorised — hold placed, `AUTH 8846201`
3. Bank reference received — `UTR 526239104882`
4. Seat allocation requested — PRS
5. **Ticket issued** — `PNR 4728166390` · or **Issuance failed**
6. Payment captured — or **Hold released**
7. Chart prepared — scheduled with the computed time until it happens
8. Refund initiated / Refund credited — with expected date

**Failure branch, which is the whole point.** When issuance fails the timeline shows it plainly and states the money position without ambiguity:

> **Ticket not issued.** Your money was held, not taken. The hold on ₹4,598.60 is being released to your bank and will disappear from your statement by **29 Aug**. Bank reference `UTR 526239104882`. You do not need to do anything, and **do not retry this booking yet** — retrying now may place a second hold.

With: `Button accent` **Try booking again** (enabled only once the release is confirmed) and `Button ghost` **Raise a query** → pre-filled grievance (§7.9).

**Actions**, contextual: Cancel booking (with the exact refund arithmetic under the current band), Change boarding point, Download ERS, View ticket, Raise a query.

**Refund view.** When cancelled, the timeline continues into refund stages with the amount breakdown — fare, deductions with the rule that caused each, clerkage where applicable, and the amount actually returning. When a waitlisted ticket is auto-cancelled at charting, the ₹60 clerkage and the non-refunded convenience fee are shown as named lines, not silently subtracted (§8.9).

---

### S7 · Ticket — `/ticket/:pnr`

The ERS, offline-first.

- Print-and-screenshot friendly: PNR, train, class, quota, boarding point, boarding date-time, passengers with coach and berth, fare, and a QR placeholder.
- Status band at the top with the current status and, for RAC/WL, the consequence and chart time.
- **Offline.** Cached by the service worker on first view. A persistent `Chip outline` states data age: "Saved for offline · updated 12 min ago". If viewed offline, a `Banner info` says so and names what may be stale.
- `Button ghost` actions: Add to calendar · Share · Print · Open journey view.

---

### S8 · Journey — `/journey/:pnr`

Journey-day surface, honest about certainty.

- **Boarding card** — station, platform, boarding time, coach, berth. Platform carries a provenance label: **Confirmed** (from the chart) or **Expected** (estimate) with the data age. This is the direct answer to RailOne's wrong-platform problem: not better data, honest data.
- **Coach position** — a horizontal rake diagram with the user's coach highlighted and the position stated relative to the engine.
- **Occupancy forecast** — a five-level indicator for the user's class with a caption naming it as a forecast from historical booking patterns for this train.
- **Self check-in** — available from two hours before departure. On check-in the state is recorded and shown as "Checked in · seat 47 confirmed to the crew". Explained as reducing onboard checking and improving vacancy release.
- **Live position** — station list with the last recorded departure marked **Confirmed** and downstream arrivals marked **Estimated**. The distinction is always visible.
- **Destination alarm** — a toggle, working while the tab is open, honestly labelled as such.

---

### S9 · Ready-to-book console — `/ready`

Verification and preparation moved out of the booking race.

- **Verification card.** Aadhaar authentication state with a large unambiguous badge: **Verified · ready to book** or **Not verified**. When unverified, run the OTP flow *now* with live delivery state — Requested → Sent to •••••94 → Delivered → Verified — and a bounded retry that preserves everything. States the rule: Aadhaar OTP is required for Tatkal and for the opening window of ARP-day booking, and cannot be skipped.
- **Armed drafts.** Each draft shows train, class, quota, passengers, boarding point, reservation choice, payment instrument, and the exact window it targets with a countdown. `Button ghost` **Edit** · `Button quiet` **Remove**.
- **Window opens.** At T-0 the primary action becomes `Button accent` **Book now — one step**, which goes straight to `/book/review` with everything pre-filled. The OTP has already happened. The form is already valid.
- **Pre-flight checklist**, each item green or actionable: verified · passengers complete · under the quota's passenger cap · payment instrument on file · monthly ticket limit not exhausted · concessions valid for this quota.
- Copy must never promise a berth. It promises **readiness**, which is the honest and still-substantial claim.

---

### S10 · Bookings, PNR status, Charts — `/orders`, `/pnr`, `/charts`

- `/orders` — list of `Card`s grouped Upcoming / Awaiting chart / Past / Cancelled. Each shows train, date, status, money state, and an action. Money state is always visible in the list, never only inside the detail.
- `/pnr` — PNR input → status card with passenger-wise status, current position in the waitlist where applicable, chart time, and the consequence. Accepts the seeded demo PNRs.
- `/charts` — train number + date + boarding station → coach-wise vacancy after charting, matching IRCTC's Charts/Vacancy utility, with a `Chip` stating whether the first or second chart is reflected.

---

### S11 · Sarathi agent drawer — global

Right drawer ≥900px (420px wide), full-height bottom sheet on mobile. Full specification in §7.11.

Structure: header with name, a `Chip outline` reading **Proposes · never pays**, and a `View what Sarathi can do` link to its permission list. Body is the message list. Composer at the bottom with suggested-prompt chips on first open. A collapsible **step trace** panel shows each tool call and its result.

The rule that defines the whole component: **as the agent works, the main application behind the drawer updates.** The agent drives the real UI. It does not narrate a parallel reality.

---

## 6. Feature register

Ten features plus the agent. Closed scope. Each maps to evidence in the Atlas and has acceptance criteria in §7.

| # | Feature | Lives in | Priority |
|---|---|---|---|
| 1 | Itinerary-first search with all-class availability in one view | S2 | P0 |
| 2 | Visible payment / ticket / refund state machine, hold-then-capture default | S5, S6 | P0 |
| 3 | Ready-to-book console — verification out of the race | S9 | P0 |
| 4 | Plain-language status vocabulary with consequences | everywhere | P0 |
| 5 | Evidence-based confirmation guidance (no percentages) | S2 | P1 |
| 6 | Berth allotment explained + free review-and-override | S4 | P1 |
| 7 | Alternate itineraries — segment, multi-leg, nearby station, VIKALP-style | S2 | P1 |
| 8 | Offline ticket + honest journey-day data provenance | S7, S8 | P1 |
| 9 | Occupancy forecast + self check-in | S8 | P2 |
| 10 | Hindi + English complete, including errors and refund copy | everywhere | P2 |
| — | **Sarathi**, the agent that completes bookings | global | **P0** |

---

## 7. Feature specifications

### 7.1 All-class availability in one view

**Problem.** IRCTC requires a per-class **Refresh** click on every train, and hides classes behind overflowing tabs.

**Behaviour.** Search returns every class each train runs, with status and all-inclusive fare, rendered simultaneously. Cells skeleton-load for 400–900ms (staggered, per train) then resolve. No user action required to see availability. A manual refresh exists as an `IconButton` with data age, but it is never the only path.

**Done when:** a first-time user sees status and price for every class of every result without clicking anything, and the data-age indicator is visible on each card.

### 7.2 Itinerary-first ranking

Results are itineraries, not just trains. Four kinds coexist in one ranked list, each with a `Chip` naming its kind: **Direct** · **Board earlier** · **Travel further** · **Two legs**. Sorting applies across all kinds. Non-direct kinds are always accompanied by disclosure (§7.4).

### 7.3 Sort: best chance of confirmation

A sort mode ranking by our confirmation-likelihood band (§7.5), not by a number. Band order: Confirmed → Usually clears → Often clears → Rarely clears → Regret. Ties broken by departure time.

### 7.4 Alternate itineraries

The highest-value differentiator. Four generators over the same mock inventory:

| Kind | Rule |
|---|---|
| **Board earlier** | Same train, ticket from an upstream station where segment inventory remains. User boards at their own station. |
| **Travel further** | Same train, ticket to a downstream station beyond the user's destination. |
| **Both** | Both ends shifted. |
| **Two legs** | Same physical train, two tickets A→B and B→C when A→C has no inventory. |
| **Nearby station** | A different origin or destination station within the same city cluster. |
| **Alternate train** | A different train departing within 12 hours, presented as the VIKALP-equivalent but offered *at search time* rather than after charting. |

**Mandatory disclosure — the failure mode is user surprise, so this is not optional.** Every alternate renders a disclosure block before it can be selected:

> **What you are buying:** a ticket from **Kollam Jn** to **Chennai Central**.
> **Where you board:** Kayankulam, 06:42.
> **What you pay:** ₹1,340 — that is **₹85 more** than a direct Kayankulam→Chennai ticket would cost, because the fare is charged for the full ticketed distance.
> **Note:** you cannot board before Kollam Jn on this ticket.

For **Two legs**, additionally: "These are **two separate PNRs**. Cancelling one does not cancel the other, and each is subject to its own refund rules."

A `Banner info` at the bottom of the alternates panel states the fairness position honestly: "Booking a longer ticket to secure a berth uses inventory other travellers may need. We show these options because they work today, not because they are ideal." Judges reward this; hiding it is the cheap move.

**Done when:** selecting an alternate requires passing the disclosure block, and the fare delta versus a direct ticket is always shown as a signed number.

### 7.5 Confirmation guidance without percentages

**Never a percentage.** For any RAC or waitlisted cell, show:

1. A **band** as a `Chip`: `Usually clears` · `Often clears` · `Rarely clears` · `Unlikely to clear`.
2. The **evidence**, as fact: "In the last 10 departures of this train in 3A, the waitlist cleared to **34, 31, 40, 28, 36, 22, 44, 30, 39, 26**. You are at **WL 22**."
3. A one-line **method note**: "Based on the last 10 departures of this train in this class. Past outcomes do not guarantee this journey."
4. A **berth-position sparkline** — a tiny bar row of those ten values with the user's position drawn as a horizontal line, so the comparison is instant.

Bands are computed deterministically in `src/domain/confirmation.ts` from the seeded history — the user's WL number versus the distribution of historical clearance points. The mapping is in code and documented in a comment. No model, no randomness.

**Done when:** no percentage appears anywhere in the product, and every band is accompanied by the ten historical values it came from.

### 7.6 Berth allotment explained, with free override

**Explain.** Every allotted berth carries a reason derived from the allocator's decision trace (§9.5). Reason codes and their copy are in §13.3.

**Override.** `Sheet` containing the annotated coach map:
- Bays rendered to the real geometry for the class (§9.4).
- Each berth labelled with its number and type; occupied berths are visibly unavailable.
- **Annotations** — the layer nobody else provides: `Near toilet` · `Near door` · `Side berth — shorter` · `No window` · `Quota-held — senior citizen` · `RAC — shared`.
- Selecting a free berth reassigns it immediately, free of charge, and updates S4.
- Quota-held berths are shown but not selectable, with the reason on focus.
- Keyboard navigable as a grid with `aria-label` per berth stating number, type and availability.
- For 1A the map is replaced by the charting explanation. There is no berth to choose.

**Done when:** a user can change a berth in under three interactions, the map explains at least three annotations, and no charge is ever implied.

### 7.7 Hold-then-capture

Default and prominent. The order timeline (§S6) must be able to render all four outcomes from seeded data: **held → issued → captured**, **held → issuance failed → released**, **held → partially confirmed → captured**, **captured → cancelled → refund initiated → refund credited**. The failure copy in §S6 is mandatory and must include "do not retry yet".

### 7.8 Chart simulation

A single `setInterval` clock in `src/domain/clock.ts` drives a compressed demo timeline so charting can be *observed* rather than described. One demo second = one real hour, toggleable. At charting the app runs the §9.5 chart job: RAC→CNF, WL→RAC/CNF, deferred berth assignment with compaction, auto-upgradation, then emits the chart. Affected orders update their timelines and the affected PNR status changes live.

**Done when:** a waitlisted seeded PNR can be watched clearing to confirmed, with a berth number appearing where there was none, and the order timeline gaining a "Chart prepared" step.

### 7.9 Transaction-aware grievance

From any failed or disputed order, **Raise a query** opens a form already carrying order ID, PNR, transaction reference, UTR, instrument, amount, failure stage and timestamps. The user writes only what they want to say. On submit: a reference number, a named owner role, a next action, and a deadline. Then it appears in `/orders/:orderId` as a tracked item on the same timeline.

### 7.10 Localisation

`en` and `hi`, complete for: navigation, all form labels and validation, all status codes and their consequence copy, all payment and refund copy, all agent system replies, all empty and error states. Implementation is a flat key map in `src/i18n/{en,hi}.ts` with a `t()` helper. Language toggle in the nav, persisted. **A partially translated payment-failure message is worse than English** — if a string cannot be translated well, leave the key in English and log it, do not machine-translate money copy.

### 7.11 Sarathi — the agent

**Positioning.** Not "a chatbot that can book" — that exists. Sarathi is an agent that **shows its work, reasons about scarcity, and hands the decision back before money moves.**

**No LLM. No API calls. No network.** Sarathi is a **fully simulated agent** — a deterministic natural-language layer over the same mock data and domain functions the UI uses. To the user it behaves like a real agent. To us it is testable, instant, free, and impossible to rate-limit during judging.

This is not a compromise, and we present it as a deliberate decision. The brief explicitly permits a mock backend, and a deterministic agent is the *correct* engineering choice for a POC where every judge must get an identical, working experience. It also means the agent physically cannot hallucinate a fare, a berth or a rule.

**Architecture.**

```
User utterance
   → normalise            lowercase, strip punctuation, expand contractions
   → extract entities     stations, dates, classes, quotas, counts, PNRs
   → score intents        weighted keyword + pattern matching, ranked
   → resolve slots        merge with conversation state; find what's missing
   → decide next action   ask for a missing slot | clarify | run the plan
   → execute plan         ordered calls to pure domain functions
   → drive the app        navigate / populate the real UI behind the drawer
   → compose reply        template selected by seeded rotation + real values
   → simulate delivery    typing indicator, delay proportional to length
```

Every stage is pure and synchronous except the deliberate delay. All of it lives in `src/agent/`.

**7.11.1 Entity extraction — `src/agent/extract.ts`**

Must handle the ways a real person types, not one canonical phrasing.

| Entity | Must recognise |
|---|---|
| **Station** | Full name, code, city, and common shortenings — `kollam`, `QLN`, `kollam jn`, `chennai`, `MAS`, `madras`, `secunderabad`, `sec`, `hyd`, `delhi`, `ndls`, `nizamuddin`. Fuzzy match on Levenshtein ≤2 so `chenai` and `hydrabad` resolve. Every station in §10.1 carries an `aliases: string[]`. |
| **Direction** | `from X to Y`, `X to Y`, `X → Y`, `going to Y from X`, `Y from X`. |
| **Date** | `12 september`, `sept 12`, `12/09`, `12-09-2026`, `today`, `tomorrow`, `day after`, `next saturday`, `this friday`, `next week`, `28th`. Resolve relative dates against the demo clock. Reject dates beyond the 60-day ARP with the rule stated. |
| **Class** | Code (`3a`, `sl`, `2s`), full name (`ac 3 tier`, `sleeper`, `second sitting`), and colloquial (`third ac`, `3rd ac`, `ac chair`, `first class`). |
| **Quota** | `tatkal`, `premium tatkal`, `ladies`, `senior citizen`, `lower berth`, `divyangjan`, `disability`. |
| **Passengers** | `2 adults`, `for 3`, `me and my wife` → 2, `my family of four` → 4. |
| **Berth preference** | `lower`, `lower berth`, `upper`, `side lower`, `window`. |
| **PNR** | Any 10-digit run. |
| **Amount / order ref** | `RI-xxxx-xxxxxx`, `₹4598`, `4598.60`. |

Extraction returns partial results happily. Missing entities become slots to ask for.

**7.11.2 Intent scoring — `src/agent/intents.ts`**

Each intent declares weighted signals. Score = sum of matched weights, normalised. Highest score wins if it clears a floor of `0.35`; otherwise fall through to the help response. Two intents within `0.1` of each other trigger a clarifying question rather than a guess.

```ts
{
  id: "book_journey",
  strong: [/\bbook\b/, /\bticket\b/, /\breserve\b/, /\bneed to (get|go|travel)\b/],
  weak:   [/\btrain\b/, /\bto\b/, /\bseat\b/, /\bberth\b/],
  entityBoost: ["station:2", "date:1"],   // having 2 stations is a strong signal
}
```

Intents to implement: `book_journey` · `check_money` · `check_pnr` · `cancel_booking` · `explain_rule` · `arm_tatkal` · `find_alternates` · `change_boarding` · `greeting` · `help` · `unknown`.

**7.11.3 Slot filling — `src/agent/session.ts`**

A conversation-scoped store holding the partially built draft. Rules:

- Ask for **one** missing slot at a time, in a fixed priority: origin → destination → date → class → passengers.
- Never re-ask for something already known.
- Accept a bare answer in context — after "Which class?", the input `3a` fills the class slot without needing a full sentence.
- Accept corrections mid-flow: `no, make it 2a`, `change the date to 14th`, `actually from secunderabad` all patch the draft and re-run the affected steps.
- `start over` / `cancel` clears the session.
- **Ambiguity is asked, never guessed.** Seeded case: `kollam` matches Kollam Jn (QLN) and Kollam Town (QLM), so the agent asks. This single interaction does more for credibility than anything else in the drawer, so it must be in the demo.

**7.11.4 Response composition — `src/agent/compose.ts`**

Templates, not canned strings. Each response node holds 2–3 phrasings selected by a **seeded rotation** keyed on turn index, so a judge running the flow twice does not see identical wording. Every value interpolated into a template comes from a domain function — never from the template itself.

```ts
nothingConfirmed: [
  "Nothing is confirmed on {train} in any class. If you board at {station} instead, I can get you {status} in {class} — that's {delta} more, and you board {time}. Want that?",
  "{train} has no confirmed berth in any class today. There is one way through: ticket from {station} and board at {origin}. {status} in {class}, {delta} more. Shall I set that up?",
]
```

**7.11.5 Making it feel real — `src/agent/deliver.ts`**

This is the difference between a convincing agent and an obvious script. All of it is presentation, none of it is deception.

- **Typing indicator** — three-dot pulse in a bubble, shown for `380ms + 14ms × characters`, clamped to 700–1900ms. Long answers take visibly longer, as they would.
- **Progressive work.** When a turn runs tools, stream the step trace *as it happens* with 120–260ms between steps, and let the main UI update in lockstep — results populating, the page navigating. The user sees work, not a wait.
- **Sequenced turns.** A complex answer arrives as two or three bubbles rather than one wall of text: the finding, then the recommendation, then the question.
- **Interruptible.** A new message while the agent is "typing" cancels the pending turn and handles the new input.
- **Suggestion chips** above the composer, contextual to the current state — on open: `Book a ticket` · `Where is my refund` · `Check PNR` · `Explain waitlist`; mid-booking: the actual class options. These carry most of the interaction and sharply reduce the chance of an unrecognised input.
- **Never say "I don't understand."** The `unknown` intent replies with what it *can* do and offers chips: "I can search trains, prepare a booking, check where your money is, look up a PNR, or explain a rule. Which of those is closest?"
- **Never a spinner without a statement.** Every wait carries a label: "Checking all classes on 12624…"

**7.11.6 What the agent must never do**

- No `payForBooking` tool exists. Not disabled — **absent from the tool registry**. Payment is unreachable from the agent by construction.
- No cancellation without the user confirming on the real cancel screen.
- No invented availability, fare, berth, rule or statistic. Every number in every reply traces to a domain function.
- No claim of being an AI model, and no claim of being a human. It introduces itself as "IRCTC's booking assistant".

**Tool surface** — implement exactly these in `src/agent/tools.ts`, each a pure function with a typed signature:

| Tool | Purpose |
|---|---|
| `resolveStation(q)` | Disambiguate a station name; returns candidates when ambiguous |
| `searchTrains(args)` | Same function the results page uses |
| `getAvailability(trainId, date)` | All classes |
| `findAlternates(args)` | §7.4 generators |
| `getConfirmationEvidence(trainId, class, wl)` | §7.5 |
| `listSavedPassengers()` | From the account |
| `checkEligibility(quota, passengers)` | Returns rule violations with reasons |
| `priceBooking(draft)` | Full fare breakdown |
| `allocateBerths(draft)` | §9 allocator, returns berths + decision trace |
| `prepareDraft(draft)` | Stages the booking and **navigates the app to `/book/review`** |
| `getOrderState(orderId)` | For refund and status questions |
| `armForWindow(draft, window)` | Adds to `/ready` |

**Explicitly no `payForBooking` tool.** The agent cannot pay. This is an architectural guarantee, not a policy.

**Conversation flow — implement these six intents:**

1. **Book a journey.** `book Kollam to Chennai on 12 September`
   - Extract origin, destination, date. If a station is ambiguous, **ask once** — never guess. Seeded ambiguity: "Kollam" matches Kollam Jn and Kollam Town.
   - Run the search. **The results page behind the drawer populates.**
   - Present all classes compactly with status and fare, then ask which.
   - **If nothing is confirmed, do not stop.** Run `findAlternates` and propose the best with its fare delta and boarding change, in one sentence, as a question.
   - On choice: fill passengers from saved, apply berth preference, run `checkEligibility` and state any rule that binds.
   - Run `allocateBerths` and **explain the allotment in one sentence**.
   - Then: "I've prepared this. Review the fare and confirm on the next screen — I can't pay for you." and navigate to `/book/review`.
2. **Where is my money / refund.** Reads the order state, states the stage, the reference, the expected date, and whether the user must act.
3. **PNR status.** Status, position, chart time, consequence.
4. **Cancel.** States the exact refund under the current band, then hands off to the real cancel confirmation. Does not cancel autonomously.
5. **Explain a rule.** Waitlist codes, refund bands, quota rules, berth allocation — answered from §8 and §13, never improvised.
6. **Arm for Tatkal.** Builds a draft and adds it to `/ready`, stating that Aadhaar OTP is required and already done, or must be done now.

**Step trace.** A collapsible panel under each agent turn listing each tool called and a one-line result, e.g. `searchTrains → 5 trains` · `findAlternates → 3 options` · `allocateBerths → S5/47 side upper`. This is the credibility artefact.

**Permission card.** `View what Sarathi can do` opens a `Sheet` listing: can search, compare, check rules, prepare a booking, arm a draft, read your orders. Cannot: pay, cancel without confirmation, change your Aadhaar details, contact anyone on your behalf.

**Robustness.** Because there is no network dependency, the agent cannot fail for external reasons. The only real risk is an **unrecognised phrasing**, so mitigate it three ways: broad alias and pattern coverage (§7.11.1), suggestion chips carrying most interaction (§7.11.5), and a genuinely useful `unknown` response that re-offers the capabilities.

**Test corpus — write these as unit tests.** At least 40 utterances across the intents, including these exact ones:

```
book kollam to chennai on 12 september
i need to get to chennai next saturday
2 tickets hyderabad to delhi tomorrow 3a
book me a tatkal for 12624
where is my refund
money was deducted but no ticket
pnr 4728166390
what does tqwl mean
can i board with a waitlisted ticket
cancel my delhi booking
change my boarding point to secunderabad
show me something confirmed
3a
no make it 2a
actually from secunderabad
```

**Done when:** typing `book Kollam to Chennai on 12 September` causes the agent to ask which Kollam, then populate the results page behind the drawer, offer an all-class summary, propose an alternate because nothing is confirmed, allocate and explain a berth, and land on `/book/review` with a valid draft — **with the machine in airplane mode**, and with every one of the 40 test utterances producing a sensible turn.

---

## 8. The rulebook — implement exactly this

All of it lives in `src/domain/rules.ts` as typed constants and pure functions. **No rule may be hardcoded in a component.** Sources are in `CONSOLIDATED_UNDERSTANDING.md` §3 and the Atlas.

### 8.1 Booking windows

```ts
ARP_DAYS = 60                    // excludes journey date; opens 08:00
ARP_OPEN_TIME = "08:00"
TATKAL_OPEN = { AC: "10:00", NON_AC: "11:00" }   // one day before, excl. journey date
TATKAL_AC_CLASSES = ["2A","3A","3E","CC","EC"]
TATKAL_NON_AC_CLASSES = ["SL","2S","FC"]
AGENT_LOCKOUT_MIN = { tatkal: 30, arp: 10 }
AADHAAR_REQUIRED_FOR = ["TQ","PT"]               // and the ARP-opening window
MONTHLY_LIMIT = { withAadhaar: 24, withoutAadhaar: 12 }
```

### 8.2 Classes — the complete list, exactly as IRCTC offers it

`All Classes` · `Anubhuti Class (EA)` · `AC First Class (1A)` · `Vistadome AC (EV)` · `Exec. Chair Car (EC)` · `AC 2 Tier (2A)` · `First Class (FC)` · `AC 3 Tier (3A)` · `AC 3 Economy (3E)` · `Vistadome Chair Car (VC)` · `AC Chair car (CC)` · `Sleeper (SL)` · `Vistadome Non AC (VS)` · `Second Sitting (2S)`

### 8.3 Quotas — the complete online list

`GENERAL` · `LADIES` · `LOWER BERTH/SR.CITIZEN` · `PERSON WITH DISABILITY` · `DUTY PASS` · `TATKAL` · `PREMIUM TATKAL`

Internal codes: `GN` `LD` `SS` `HP` `DP` `TQ` `PT`. **`HP` is Physically Handicapped; `PH` is Parliament House.** Do not swap these.

### 8.4 Quota constraints

```ts
MAX_PASSENGERS = { TQ: 4, PT: 4, default: 6 }
NO_CONCESSION_IN = ["TQ","PT"]
TATKAL_EXCLUDED_CLASSES = ["1A","EA"]
LADIES_QUOTA = { requiresAllFemale: true, cannotCombineWith: ["TQ","PT"] }
```

Tatkal charges — 10% of base fare for 2S, 30% for all other classes, clamped:

| Class | Min | Max |
|---|---|---|
| 2S | ₹10 | ₹15 |
| SL | ₹100 | ₹200 |
| CC | ₹125 | ₹225 |
| 3A | ₹300 | ₹400 |
| 2A | ₹400 | ₹500 |
| EC | ₹400 | ₹500 |

### 8.5 Charting

```ts
// first chart, from Railway Board circular 12 Dec 2025
depart 14:01–23:59  → at least 10 h before departure
depart 00:00–05:00  → at least 10 h before departure
depart 05:01–14:00  → by 20:00 the previous day
SECOND_CHART_MIN_BEFORE = 30      // minutes
CURRENT_BOOKING_CLOSES_MIN = 30   // 15 for Vande Bharat
```

`firstChartTime(departureDateTime)` is a pure function and is the only place this logic exists.

### 8.6 Fees

```ts
CONVENIENCE_FEE = { nonAC: 15, AC: 30, upiNonAC: 10, upiAC: 20 }  // + 18% GST
GST_RATE = 0.18
PG_CHARGES = {
  upi: 0, rupayDebit: 0,
  debitUpto2000: 0.004, debitAbove2000: 0.009,
  creditCard: 0.018, netBanking: 10 /* flat ₹ */, autopay: 0.018,
}
```

Reference figure to validate against: ₹4,575.00 fare + ₹23.60 convenience fee (₹20 + 18% GST) = **₹4,598.60**. Our arithmetic must reproduce this exactly.

### 8.7 Boarding point

Changeable up to the second chart (~T-30 min). Not available on waitlisted tickets. Changing forfeits the right to board at the original station — must be stated. Not permitted on current-booking PNRs.

### 8.8 Auto-upgradation

```ts
SLEEPING_LADDER = ["2S","3E","3A","2A","1A"]   // only 2A is eligible for 1A
SITTING_LADDER  = ["2S","VS","CC","EC","EV","EA"] // only CC is eligible for EC/EV/EA
MAX_LEVELS = 2
FULL_FARE_ONLY = true
// no crossover between sitting and sleeping; lower berth not assured after upgrade
```

### 8.9 Cancellation and refunds

```ts
// bands effective 1–15 Apr 2026
> 72 h            → flat cancellation charge only
72 h – 24 h       → 25% of fare deducted
24 h – 8 h        → 50% of fare deducted
< 8 h             → no refund
FLAT_CHARGE = { "1A": 240, EC: 240, "2A": 200, FC: 200, "3A": 180, CC: 180, "3E": 180, SL: 120, "2S": 60 }
CONFIRMED_TATKAL_REFUND = 0
RAC_TDR_CUTOFF_MIN = 30
WL_AUTOCANCEL = { automatic: true, clerkage: 60, convenienceFeeRefunded: false }
TDR_FILING_REQUIRED = false     // abolished Mar 2026, refund is automatic
```

### 8.10 Waitlist and RAC

```ts
WL_CAP = { AC: 0.60, nonAC: 0.30 }   // share of capacity
WL_CANNOT_BOARD_RESERVED = true
WL_PENALTY = { SL: 250, AC: 440 }    // plus fare from boarding station
RAC_CAN_BOARD = true                 // seat shared on a side-lower berth
```

Waitlist type is derived from the origin/destination relationship to the train's route, never assigned arbitrarily: `GNWL` (origin or near-origin) · `RLWL` (remote location, charted separately 2–3 h before the train reaches it) · `PQWL` (pooled across small stations) · `RSWL` (to a roadside station) · `RQWL` (intermediate to intermediate) · `TQWL` (Tatkal; **does not get priority at charting**).

### 8.11 Concessions

Senior-citizen **fare** concession remains suspended since March 2020 — do not offer it. Retained: students, four Divyangjan categories, eleven patient categories. The senior-citizen **lower-berth quota** is separate and very much active (§9.3) — do not conflate the two. This distinction must be correct because it is a common error in third-party clones.

---

## 9. Berth allocator

Lives in `src/domain/allocator.ts`. Pure, deterministic, seeded. It returns berths **and a decision trace** — the trace is what powers §7.6.

### 9.1 Forbidden

Do **not** implement "middle coach first", "berths 30–40 first", "lower berths first for centre of gravity", or any load-balancing across coaches. It is folklore with no official source, and the sources that repeat it contradict each other. If someone asks for it, point them at `research/prs-berth-allocation-research.md` §1.2.

### 9.2 The two real objectives

From Lok Sabha USQ 4554 (29 Mar 2017), the only official statement that exists:

1. **First come, first served.** Preferences are honoured "subject to availability".
2. **Party compaction** — keep a booking together, preferring one bay, then one coach.
3. Berths are assigned until confirmed accommodation is exhausted; after that, RAC then waitlist.
4. **RAC/WL that clears before charting gets no berth number until the first chart** — explicitly for compaction.
5. **1A is never assigned a berth at booking.** Charted, to handle official requisition, avoid placing a lone female passenger in a coupé with a male, keep families together, and give seniors lower berths.

### 9.3 Quotas carved out before general booking

```ts
LOWER_BERTH_QUOTA_PER_COACH = { SL: [6,7], "3A": [4,5], "2A": [3,4] }
// combined: senior citizens, women 45+, pregnant women
AUTO_LOWER_BERTH = { male: 60, female: 45 }   // applied even with no stated preference
LADIES_QUOTA = { SL: 6, "3A": 6 }             // PER TRAIN, not per coach
DIVYANGJAN_QUOTA = {
  SL:   { berths: 4, split: "2 lower + 2 middle" },
  "3A": { berths: 4, split: "2 lower + 2 middle" },  // or 3E, zonal choice
  "2S": { seats: 4 }, CC: { seats: 4 },
}
```

### 9.4 Berth geometry

| Class | Capacity | Cycle | Confidence |
|---|---|---|---|
| SL, 3A | 72 (64 on older ICF 3A) | mod 8 → `LB MB UB LB MB UB SL SU` | cross-confirmed |
| 2A | 46 | mod 6 → `LB UB LB UB SL SU`, then 43–46 as a final four-berth bay with no side section | third-party |
| 3E | 81–83 | mod 9, adds a **side middle**; 82/83 a two-berth tail | least certain — config flag |
| CC | 78 (3+2) | mod 5 → `WS M A A WS` | third-party |
| EC | 52 (2+2) | mod 4 → `WS A A WS` | third-party |
| 2S | 108 (3+3) | mod 6 → `WS M A A M WS` | third-party |
| 1A | 18–26 | **do not model berth numbers** | official |

All capacities and cycles are config, not constants. RAC counts are config too — commonly 7 side-lowers in SL, 4 in 3A, 3 in 2A, each split into two seats — because **no official figure exists**.

### 9.5 Algorithm

**At booking**
1. Sort by transaction timestamp. Strict FCFS.
2. Resolve quota → pool. If the pool is empty, fall through to RAC, then the correct waitlist type (§8.10).
3. Within the pool, apply in this order:
   a. **Automatic lower berth** for male 60+, female 45+, pregnant — even with no stated preference.
   b. **Party compaction** — one bay if possible, else one coach.
   c. **Stated berth preference.**
   d. Deterministic fallback by berth index.
4. Enforce reservation choice as a hard constraint. On failure, **roll back the entire transaction** and charge nothing.
5. **1A:** status `CNF`, no berth.
6. **RAC/WL:** status only, no coach, no berth.
7. Emit a `DecisionTrace` — an ordered list of reason codes with parameters (§13.3).

**At charting** (`chartJob`, fired by §7.8)
1. RAC → CNF and WL → CNF/RAC against freed inventory.
2. Assign coach and berth to every deferred-confirmed ticket, **compaction as the objective**.
3. Assign 1A cabins/coupés with the gender and family rules.
4. Run auto-upgradation (§8.8); cascade vacated berths to RAC/WL of that class, then to confirmed passengers of the next lower class.
5. Release unutilised Tatkal multi-leg portions to general RAC/WL.
6. Run the VIKALP-equivalent allotment.
7. Open current booking. Second chart at T-30 min.

**Onboard** (only if time allows — it is a nice-to-have for the journey screen)
Follow the published CRIS TTE handheld semantics: turned-up RAC → part-waitlist → full-waitlist, strictly by **lowest RAC/WL number within the coach**, nearest vacant berth in that or the nearest coach, leftovers released. Note that RAC number → berth number is **not** monotonic.

---

## 10. Mock data

Lives in `src/data/`. Hand-authored, deterministic, seeded. It must be plausible to someone who knows Indian Railways — this is cheap rigour and it reads as competence.

### 10.1 Stations

~40 stations with code, name, city, state, and a `cluster` field for nearby-station logic. Must include:
`HYB Hyderabad Decan` · `SC Secunderabad Jn` · `KCG Kacheguda` (one Hyderabad cluster) · `NDLS New Delhi` · `NZM Hazrat Nizamuddin` · `DLI Old Delhi` (one Delhi cluster) · `MAS Chennai Central` · `MS Chennai Egmore` · `QLN Kollam Jn` · `QLM Kollam Town` *(seeded ambiguity for the agent)* · `KYJ Kayankulam` · `TVC Trivandrum Central` · `PNBE Patna Jn` · `BCT Mumbai Central` · `ADI Ahmedabad Jn` · `SBC KSR Bengaluru` · `UBL Hubballi Jn` · `GDG Gadag Jn` · `BPL Bhopal` · `KZJ Kazipet Jn` · `RDM Ramagundam` · `MCI Manchiryal` · `BPA Bellampalli`.

### 10.2 Trains

Eight trains, using real numbers and names for recognition, on genuinely congested corridors:

| Number | Name | Route | Purpose in the demo |
|---|---|---|---|
| 12723 | Telangana SF Express | HYB → NDLS | The reference case from the screenshots |
| 22691 | Rajdhani Express | SC → NZM | Premium, AC only, mostly waitlisted |
| 12649 | Sampark Kranti | KCG → NZM | Different origin in the same cluster — nearby-station alternate |
| 12285 | Nizamuddin Duronto | SC → NZM | Full range of classes |
| 12721 | Dakshin SF Express | HYB → NZM | Late-night departure — exercises the charting bands |
| 12624 | Chennai Mail | TVC → MAS | **The hero case.** Sold out from KYJ, confirmed from QLN. |
| 20635 | Vande Bharat Express | SBC → UBL | Chair car, confirmed-only, T-15 current booking |
| 12951 | Mumbai Rajdhani | BCT → NDLS | Second premium option |

Each train carries: number, name, days of operation, a halt list with arrival/departure/day/distance, a rake composition, and per-class inventory.

**Rake template** (realistic, from the first Amrit Bharat 3.0 rake): 22 coaches — 6 × 3A, 2 × 2A, 1 × 1A, 6 × SL, 4 general, pantry, power car, Divyangjan-cum-guard brake van. Coach labels follow convention: `A1..A2` (2A), `B1..B6` (3A), `S1..S6` (SL), `H1` (1A), `C1..` (CC), `D1..` (2S).

### 10.3 Deliberately seeded inventory states

Every one of these must exist so no demo path is empty:

| State | Where |
|---|---|
| `CNF` with few berths left | 12723 · 2A |
| `RAC` | 12285 · SL |
| `GNWL` mid-range | 12723 · SL (WL 34) |
| `TQWL` | 12649 · 3A |
| `REGRET` | 22691 · 1A |
| `Not available` on the searched date, available on the next | 12723 · SL on 27 Aug |
| **Sold out direct, confirmed via an alternate** | **12624 · KYJ→MAS regret, QLN→MAS confirmed** |
| Two-leg only path | 12951 · BCT→NDLS via BPL |
| Confirmed-only train | 20635 |
| Waitlisted PNR two hours from charting | seeded order, for §7.8 |

### 10.4 Accounts

| Account | Properties |
|---|---|
| **Priya Menon** | Aadhaar verified. 3 saved passengers incl. a 67-year-old and a Divyangjan passenger. Orders: one issued, one **debit-without-ticket awaiting release**, one cancelled with a refund in progress, one waitlisted near charting. One armed Tatkal draft. |
| **Ramesh Iyer** | Aadhaar verified, 63 years old. Demonstrates automatic lower-berth allotment and the concession-not-available notice. One past journey. |
| **Guest** | Not verified. Demonstrates the Tatkal block and the `/ready` verification flow from zero. |

### 10.5 Confirmation history

For each train × class, ten historical waitlist clearance values. Hand-authored to be internally consistent — a train that is usually confirmed should not have wild values. These drive §7.5 and must never be randomised at runtime.

---

## 11. Technical architecture

### 11.1 Stack

React 18 + TypeScript + Vite · Tailwind CSS v4 (tokens from §3.1 as CSS variables, exposed via `@theme`) · React Router · Zustand for app state · `localStorage` persistence · service worker via `vite-plugin-pwa` for the offline ticket · deployed to Vercel.

No component library. No animation library. No charting library — the sparkline is 20 lines of SVG. Icons: `lucide-react`.

### 11.2 File structure

```
src/
  main.tsx  App.tsx  routes.tsx
  styles/tokens.css  styles/base.css
  components/ui/        # §3.4, one file per component
  components/booking/   # SearchBar TrainCard AvailabilityCell AlternatesPanel
                        # BerthMap FareTable Stepper OrderTimeline
  components/agent/     # AgentDrawer MessageList Composer StepTrace PermissionCard
  screens/              # Landing Results Passengers Review Payment Orders
                        # OrderDetail Ticket Journey Ready PnrStatus Charts Help
  domain/
    rules.ts            # §8 — every constant and rule function
    allocator.ts        # §9
    availability.ts     # inventory queries
    alternates.ts       # §7.4 generators
    confirmation.ts     # §7.5 bands + evidence
    pricing.ts          # §8.6 fares, fees, GST
    refunds.ts          # §8.9
    charting.ts         # §8.5 + the chart job
    clock.ts            # §7.8 demo clock
    payment.ts          # hold → capture → release state machine
  agent/                # fully simulated — no LLM, no network
    extract.ts          # §7.11.1 entity extraction
    intents.ts          # §7.11.2 weighted intent scoring
    session.ts          # §7.11.3 slot filling + corrections
    planner.ts          # intent → ordered tool plan
    tools.ts            # §7.11 tool registry — no payment tool exists
    compose.ts          # §7.11.4 response templates + seeded rotation
    deliver.ts          # §7.11.5 typing simulation, step streaming
    __tests__/corpus.test.ts   # the 40-utterance corpus
  data/                 # stations trains inventory accounts orders history
  store/                # session booking orders ui
  i18n/                 # en.ts hi.ts index.ts
  lib/                  # date fmt a11y helpers
```

### 11.3 Core types

```ts
type ClassCode = "1A"|"2A"|"3A"|"3E"|"SL"|"2S"|"CC"|"EC"|"EA"|"EV"|"VC"|"VS"|"FC";
type QuotaCode = "GN"|"LD"|"SS"|"HP"|"DP"|"TQ"|"PT";
type BerthType = "LB"|"MB"|"UB"|"SL"|"SM"|"SU"|"WS"|"M"|"A";
type BookingStatus =
  | { kind:"CNF"; coach:string; berth:number; berthType:BerthType }
  | { kind:"CNF_NO_BERTH" }                       // 1A, or cleared pre-chart
  | { kind:"RAC"; number:number }
  | { kind:"WL"; type:"GNWL"|"RLWL"|"PQWL"|"RSWL"|"RQWL"|"TQWL"; number:number }
  | { kind:"REGRET" } | { kind:"NOT_AVAILABLE" };

type PaymentState =
  | "created" | "authorised" | "held" | "captured"
  | "release_pending" | "released"
  | "refund_initiated" | "refund_credited" | "failed";

type DecisionTrace = { code:ReasonCode; params:Record<string,string|number> }[];
type Itinerary = {
  kind:"direct"|"board_earlier"|"travel_further"|"both"|"two_leg"|"nearby"|"alt_train";
  legs:Leg[]; ticketedFrom:string; ticketedTo:string; boardAt:string;
  fare:number; fareDeltaVsDirect:number; disclosure:string[];
};
```

### 11.4 Rules

- All money in **paise as integers**. Format only at render. Never float arithmetic on currency.
- All rule logic in `src/domain/`. A component that computes a fare or a refund is a bug.
- All copy through `t()`. No hardcoded user-facing strings in components.
- No `Math.random()` in render or in domain logic. Seeded where variation is needed.
- Every async operation has a loading, empty, and error state before it is considered done.

---

## 12. Build order

Sequenced so **any** stopping point is a coherent, demonstrable product.

| # | Task | Output |
|---|---|---|
| 0 | Scaffold: Vite, TS, Tailwind v4, tokens, router, Zustand, deploy a hello-world to Vercel | A live URL exists from hour one |
| 1 | `components/ui/` — every component in §3.4 against static props | Design system done, visually reviewable |
| 2 | `data/` + `domain/rules.ts` + `pricing.ts` | Rulebook executable; ₹4,598.60 reproduces |
| 3 | S1 Landing incl. demo login | Brief's hard requirement satisfied |
| 4 | `availability.ts` + S2 Results with all-class cells | **The core differentiator is live** |
| 5 | `confirmation.ts` + evidence block | §7.5 |
| 6 | `alternates.ts` + alternates panel with disclosure | §7.4 — the hero moment |
| 7 | `allocator.ts` + S3 Passengers + S4 Review with explanation | Booking path end-to-end |
| 8 | `payment.ts` + S5 Payment + S6 Order timeline, all four outcomes | **The P0 in the evidence** |
| 9 | Agent, in this order: `extract` → `intents` → `session` → `planner` → `tools` → `compose` → `deliver` → drawer + step trace. Write the corpus test alongside `intents`. | **Lead differentiator, demo-ready, zero network** |
| 10 | S9 Ready-to-book console with live OTP states | §7.3 |
| 11 | `charting.ts` + demo clock + live chart transition | §7.8 |
| 12 | S7 Ticket + PWA offline + S8 Journey | §7.8, §7.9 |
| 13 | S10 Orders / PNR / Charts + grievance | Parity + §7.9 |
| 14 | Widen the agent's alias and pattern coverage; grow the corpus test past 40 utterances | Agent survives unexpected phrasing |
| 15 | i18n `hi` pass, including Hindi intent aliases for the common verbs | §7.10 |
| 16 | Accessibility pass against §3.6, then §15 QA sweep | Ship |

**Checkpoint discipline.** After tasks 4, 8 and 9, deploy and click through the whole app. If anything dead-ends, fix it before moving on.

---

## 13. Copy deck

Single source for user-facing strings. Keys go in `src/i18n/en.ts`.

### 13.1 Voice

Plain, calm, specific. Second person. State the fact, then the consequence, then the action. Never apologise for the system; never blame the user. Numbers always concrete. No exclamation marks. No "Oops". No "Please note that". No em-dash-heavy constructions.

### 13.2 Status vocabulary — the exact strings

| Code | Label | Consequence line |
|---|---|---|
| `CNF` | Confirmed | Your berth is reserved. Coach and berth are shown on your ticket. |
| `CNF` (1A) | Confirmed | Your coach and berth are assigned when the chart is prepared, so families stay together. |
| `CNF_NO_BERTH` | Confirmed | Your berth number is assigned when the chart is prepared. |
| `RAC` | RAC — seat, not a berth | You can board and you get a seat, shared on a side-lower berth. You may get a full berth at charting or from the conductor. |
| `GNWL` | Waitlist — general | The largest pool, so this clears most often. **If it does not clear you cannot board a reserved coach.** |
| `RLWL` | Waitlist — remote location | This clears only if someone travelling to your destination cancels, and it is charted separately about 2–3 hours before the train reaches your station. |
| `PQWL` | Waitlist — pooled | One small pool is shared across many stations on this route, so this clears less often. |
| `RSWL` | Waitlist — roadside | Held for a short journey to a roadside station. It clears rarely. |
| `RQWL` | Waitlist — request | For journeys between two intermediate stations with no dedicated pool. It clears rarely. |
| `TQWL` | Waitlist — Tatkal | Tatkal waitlists do not get priority at charting. General waitlists clear ahead of this one. |
| `REGRET` | No more bookings | This class is closed for booking on this date. |
| `NOT_AVAILABLE` | Not offered | This train does not run this class on this date. |

**The waitlist warning, used verbatim wherever a WL booking can be made:**
> A fully waitlisted ticket does not let you board a reserved coach. If it does not clear, it is cancelled automatically and refunded, minus ₹60 clerkage. The convenience fee is not refunded.

### 13.3 Berth reason codes

| Code | Copy |
|---|---|
| `PREF_HONOURED` | You asked for {pref} and that is what you have. |
| `PREF_EXHAUSTED` | You asked for {pref}. All {pref} berths in this coach were already taken. |
| `QUOTA_HELD` | {n} lower berths in this coach are held for senior citizens, women over 45 and pregnant passengers. |
| `AUTO_LB_APPLIED` | A lower berth was requested automatically because of the passenger's age. |
| `AUTO_LB_LOST` | A lower berth was requested automatically, but the last one went to an earlier booking. |
| `COMPACTED` | Your group was kept together in one bay, which took priority over berth type. |
| `COMPACTED_COACH` | Your group was kept in one coach. A single bay was not available. |
| `FCFS_LATE` | Berths are allotted first come, first served. The berths you wanted were booked earlier today. |
| `DEFERRED_1A` | First AC berths are assigned when the chart is prepared. |
| `DEFERRED_CHART` | Your berth number is assigned when the chart is prepared, so groups can be seated together. |

### 13.4 Money copy

**Hold explainer:** We place a hold on your money. It is captured only when your ticket is issued. If issuance fails, the hold is released.

**Issuance failed:** Ticket not issued. Your money was held, not taken. The hold on {amount} is being released to your bank and will disappear from your statement by {date}. Bank reference {utr}. You do not need to do anything, and do not retry this booking yet — retrying now may place a second hold.

**Refund in progress:** {amount} is on its way back to {instrument}. Expected by {date}. Bank reference {utr}.

**Auto-cancelled waitlist:** Your waitlisted ticket did not clear, so it was cancelled automatically at charting. {refund} has been returned. {clerkage} clerkage was deducted and the {fee} convenience fee is not refunded.

### 13.5 Agent copy

**Opening:** I can search, compare and prepare a booking. I cannot pay — you confirm that yourself.

**Ambiguous station:** Two stations match "Kollam" — Kollam Jn (QLN) and Kollam Town (QLM). Which one?

**Nothing confirmed:** Nothing is confirmed on {train} in any class. If you board at {station} instead, I can get you {status} in {class} — that is {delta} more, and you board {time}. Want that?

**Handoff:** I've prepared this booking. Check the fare and confirm on the next screen — I can't pay for you.

**Rule refusal:** Concessions are not allowed in the Tatkal quota, so I have not applied the senior-citizen concession. The fare shown is the full fare.

---

## 14. Submission assets

### 14.1 The four deliverables

1. Live Vercel URL, opens in a browser, demo login visible on the landing page.
2. Two-minute video.
3. Exactly 250 words.
4. Partner email cross-match, or blank if solo. **Still undecided — resolve today.**

### 14.2 Video script — 120 seconds

**Minute one, as a citizen. One continuous run, no cuts between features.**

| Time | Beat |
|---|---|
| 0:00–0:08 | Landing. One click on the **Priya** demo chip. State: "This is IRCTC's journey, rebuilt." |
| 0:08–0:20 | Open Sarathi. Type `book Kollam to Chennai on 12 September`. It asks which Kollam. Answer. **The results page fills in behind the drawer.** |
| 0:20–0:32 | All classes at once, no Refresh clicks. Sarathi says nothing is confirmed and proposes boarding at Kollam Jn instead — showing the fare delta and the disclosure. Accept. |
| 0:32–0:44 | Review. The berth explanation: why side-upper and not lower. Open the coach map, change the berth, free. |
| 0:44–0:56 | Payment. Hold-then-capture. Instrument table, lowest total flagged. Authorise. |
| 0:56–1:10 | Order timeline. Show the *other* seeded order where the debit failed: money held not taken, UTR, release date, "do not retry yet". |
| 1:10–1:20 | `/ready`: verified before the Tatkal window, draft armed. "The OTP already happened. The race starts with us ready." |

**Minute two, decisions.**

| Time | Beat |
|---|---|
| 1:20–1:35 | What IRCTC already fixed in July 2026 — and what it did not. Name the three open problems. |
| 1:35–1:50 | **Say it plainly: Sarathi is a deterministic simulation, not a language model.** Intent scoring and entity extraction are rule-based; search, pricing, allocation and rules are pure functions. That is a choice — it cannot hallucinate a fare, it cannot be rate-limited while you are judging it, and it has no tool that can pay. |
| 1:50–2:00 | The allocator follows the only two objectives Indian Railways has ever published — first come first served and party compaction — and we explain the outcome instead of hiding it in a footnote. Then: what Phase 2 deepens. |

### 14.3 The 250 words

Draft after the build, from what actually works. Structure: what it is (2 sentences) → the three problems with one number each → the agent → the honest constraint we respected → what a citizen gets. **Count the words. Exactly 250.**

### 14.4 Numbers permitted in UI copy and the video

Only these. Anything else is out.

- 89% of reserved tickets are booked online (65.08 crore total, 57.90 crore online, Jun 2025 – Jun 2026)
- 3.39 crore passengers could not travel in FY 2025-26 on unconfirmed waitlists — about 92,877 a day
- 58% of booking requests in the six months to July 2026 were automated
- About 4 lakh users log in between 10:00 and 11:00 for Tatkal
- The redesigned IRCTC beta launched 15 July 2026 with four stated changes
- TDR filing was abolished in March 2026; refunds are automatic
- Cancelling inside 8 hours has returned nothing since April 2026
- Waitlisted passengers have not been allowed in reserved coaches since May 2025
- PRS throughput: state as a range and attribute — 32,000 to about 37,000 bookings per minute today, targeted at over 1 lakh

**Forbidden:** any confirmation percentage · any abandonment rate · any payment success-rate comparison · any claim that AskDISHA cannot book · any claim the beta ships seat selection · any invented outage.

---

## 15. Definition of done

Do not call the build finished until every line passes.

**Functional**
- [ ] Landing → search → passengers → review → payment → order → ticket completes with keyboard only
- [ ] Availability for every class of every train appears without any click
- [ ] `12624` KYJ→MAS shows regret and offers the QLN confirmed alternate with disclosure and a signed fare delta
- [ ] Order timeline renders all four payment outcomes from seeded data
- [ ] Failure copy includes the UTR, the release date and "do not retry yet"
- [ ] Berth explanation appears for every confirmed passenger; coach map allows a free change
- [ ] 1A shows no berth and explains why
- [ ] A waitlisted PNR can be watched clearing at charting, with a berth appearing
- [ ] `/ready` runs the OTP flow with visible delivery states and a bounded retry that preserves state
- [ ] Agent completes the full booking flow **in airplane mode**
- [ ] Zero outbound network requests from the agent — verified in the Network tab
- [ ] Agent has no tool capable of payment; `payForBooking` does not exist in the registry
- [ ] All 40 corpus utterances produce a sensible turn; none hits `unknown`
- [ ] `kollam` triggers the ambiguity question rather than a guess
- [ ] Mid-flow corrections work: `no make it 2a`, `actually from secunderabad`, `change the date to 14th`
- [ ] Typing indicator duration scales with reply length; step trace streams in lockstep with the UI updating
- [ ] Unrecognised input never returns "I don't understand" — it re-offers capabilities with chips
- [ ] Ticket loads offline after one online view, with data age shown
- [ ] Every route in §4 renders; no dead ends; no console errors

**Correctness**
- [ ] ₹4,575.00 + ₹23.60 = ₹4,598.60 reproduces exactly
- [ ] Tatkal blocks 1A, blocks concessions, caps at 4 passengers
- [ ] Refund arithmetic matches the 72/24/8 bands for each class flat charge
- [ ] Auto-lower-berth fires for male 60+ and female 45+ with no stated preference
- [ ] Ladies quota is 6 per train, not per coach
- [ ] `HP` is Divyangjan; `PH` is not used
- [ ] Senior-citizen fare concession is never offered; the lower-berth quota is
- [ ] `firstChartTime()` returns the right band for a 06:00, a 15:00 and a 02:00 departure
- [ ] No `Math.random()` in domain code

**Design**
- [ ] Only the §3.1 tokens; no stray hex values
- [ ] DM Sans loaded at 400/500/700 only; tabular figures on all numerics
- [ ] Usable at 360px with no horizontal scroll
- [ ] Reduced-motion honoured
- [ ] No promo banner, no upsell, no social wall, no CAPTCHA anywhere

**Accessibility**
- [ ] Visible focus on every interactive element
- [ ] Station selection announced via a live region
- [ ] No status conveyed by colour alone
- [ ] Text-size control scales and persists
- [ ] Sheets trap focus, close on Escape, restore focus
- [ ] All icon-only buttons labelled

**Submission**
- [ ] Live URL loads in under 3s on a cold visit
- [ ] Demo login visible without scrolling
- [ ] Footer disclaims affiliation with IRCTC and Indian Railways and states that data is mock
- [ ] Video is ≤2:00
- [ ] Summary is exactly 250 words
- [ ] No forbidden number appears anywhere

---

## 16. Anti-goals

Do not build, do not suggest, do not sneak in: **an LLM API call of any kind** · an API key in the codebase · any outbound network request beyond loading the app itself · a mobile app · dark mode · 3D or Three.js · parallax or scroll-jacking · confetti · an animated mascot · voice input · a seat map with per-seat pricing · a confirmation percentage · a refund or confirmation guarantee product · admin screens · real payment integration · real Aadhaar integration · scraping any live IRCTC endpoint · an agent that can pay · flights, hotels, buses or tour packages beyond the honest out-of-scope sheet · social media integration · a chatbot avatar · gamification of any kind.

**On honesty about the simulation.** The whole app is a simulation — that is what a POC is, and the brief asks for exactly this. Two rules keep it clean: the footer states that data is mock and the build is an unaffiliated prototype, and **Sarathi never claims to be an AI model**. Within those bounds, making the experience feel real is the job, not a deception.
