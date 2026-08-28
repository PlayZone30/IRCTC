# IRCTC Train-Search Portal and Connected Services: Feature Research

**Author:** Manus AI  
**Research date:** 25 August 2026  
**Primary route reviewed:** [IRCTC train search](https://www.irctc.co.in/nget/train-search)

## Executive summary

IRCTC is more than a train-search form. The official portal functions as a connected travel-services ecosystem: it supports rail-ticket discovery and booking, PNR and reservation-chart utilities, passenger and booking management, refunds and TDR-related support, multiple payment instruments, an official mobile app, AI-assisted interaction through AskDISHA, onboard food ordering, flights, hotels, buses, tourism packages, retiring rooms, tourist trains, loyalty products, and customer support. This report separates **core train-search capabilities**, **connected IRCTC services**, and **linked partner or informational destinations** so that the inventory does not imply that every service is implemented inside the exact `/nget/train-search` route.

The supplied train-search URL is a JavaScript application. In the research environment it displayed a loading shell without accessible controls, while the official home page exposed the portal’s service taxonomy through extracted content. The most detailed feature evidence therefore comes from official IRCTC help pages, service subdomains, the official IRCTC Tourism site, and the official IRCTC Rail Connect app listing. Where a page could not be fully rendered or extracted, the report marks the result as a boundary rather than inventing a capability.

## What the train-search experience is designed to do

The core journey is a search-to-book workflow. A traveler supplies origin, destination, journey date, class and quota, then inspects a train list, route and timings, class-level availability and fare, selects “Book Now,” enters passenger details and berth preferences, pays, and receives a confirmation plus an Electronic Reservation Slip. The official guide also documents booked-ticket history, printing the ERS again, full cancellation, and partial cancellation with a fresh ERS for the passengers who continue the journey [1].

The official home page exposes the main search controls as **From**, **To**, journey date, **All Classes**, **General**, concession options, and **Search Trains**. It separately exposes **PNR Status** and **Charts / Vacancy**, making the portal useful both before booking and after a ticket has been issued [2].

| Core feature | What the traveler can do | Evidence and scope |
|---|---|---|
| Train search | Search between stations for a selected date, class and quota. | Core portal controls and official e-ticket guide [1] [2]. |
| Train discovery | Inspect the train list, route, timings, class availability and fare. | Official e-ticket guide [1]. |
| Booking | Select a class, open the reservation form, enter passenger details and pay online. | Official e-ticket guide [1]. |
| Electronic Reservation Slip | View, print and later reprint the ERS. | Official e-ticket guide [1]. |
| PNR status | Check the status of an issued booking through the linked Indian Railways enquiry service. | Official home page [2]; Rail Connect app [3]. |
| Reservation charts / vacancy | Query a train name or number, journey date and boarding station to get a train chart. | Official reservation-chart page [4]. |
| Cancellation | Cancel all or selected passengers from Booked Ticket History; partial cancellation produces a new ERS for the continuing passengers. | Official e-ticket guide [1]. |
| TDR and ticket support | Use support channels for cancellation problems or TDR filing; the app listing also advertises TDR filing. | Official contact page [5]; Rail Connect app [3]. |
| Boarding-point change | Change the boarding station once, online, before the stated 24-hour cutoff, subject to exclusions. | Official policy page [6]. |
| Passenger profiles | Maintain a Master Passenger List with passenger identity, berth preference, catering option, concession and ID details. | Aadhaar user guide [7]; Rail Connect app [3]. |

## Quotas, concessions and booking modes

IRCTC’s documented booking modes include ordinary e-ticket booking, Tatkal, Premium Tatkal, Ladies, Divyangjan and Senior Citizen quotas, and current booking against vacant accommodation after charting. The official Rail Connect listing says the mobile app supports these quota categories and allows seat availability to be checked without login [3]. The Tatkal guide describes quota selection, class-specific opening times, passenger data, berth preference, auto-upgradation consideration, passenger-mobile-number capture, payment, confirmation and ERS printing. It also states a maximum of four passengers per Tatkal e-ticket and that the senior-citizen concession is not available in Tatkal quota [8].

Current booking is a distinct post-charting mode. The official guide describes it as booking against vacant accommodation, with only confirmed e-tickets, senior-citizen and disabled concessions, and no boarding-point or passenger identity changes on a current-booking PNR [9]. Aadhaar authentication can enable Tatkal and Premium Tatkal booking, eWallet registration, and up to 24 tickets per month when the user profile and at least one traveler are Aadhaar-authenticated [7]. Because quotas and limits are policy-sensitive, travelers should confirm the current rule at the time of booking.

## AI, chatbot and voice capabilities

### AskDISHA 2.0

**AskDISHA 2.0** is the clearest AI feature in the IRCTC ecosystem. Its name expands to “Digital Interaction To Seek Help Anytime,” and the official AskDISHA page describes it as an Artificial Intelligence, machine-learning and NLP-based virtual assistant that includes both a **ChatBot** and **VoiceBot** [10]. The page presents it as “NextGen AI Ticketing” and includes a text field labelled **“Type or Ask Disha…”** plus a microphone control, indicating text and voice entry points.

AskDISHA’s visible task shortcuts are **Search Trains**, **PNR Status**, **Booking History**, **My Passengers**, **Refund Status** and **Helpline**. It also exposes a From/To/date/class/quota search form, a sign-in path, and terms and privacy links [10]. The practical interpretation is that AskDISHA is intended to reduce navigation friction around common railway actions: finding a train, retrieving booking or PNR information, checking refunds, accessing saved passengers and reaching support. The page does not provide a complete public intent catalogue in the extracted text, so this report does not claim that it can autonomously complete every possible booking or after-sales request.

| AI / conversational capability | What it appears designed to do | Evidence status |
|---|---|---|
| Text chatbot | Accept natural-language railway queries through “Type or Ask Disha…”. | Explicitly visible on official AskDISHA page [10]. |
| VoiceBot | Accept voice input through a microphone control. | Explicitly described as ChatBot and VoiceBot [10]. |
| AI / ML / NLP assistance | Interpret passenger questions and guide ticketing or support interactions. | Official About Us description [10]. |
| Train search | Provide a conversational or shortcut-based entry to From/To/date/class/quota search. | Visible shortcut and form [10]. |
| PNR status | Help passengers access PNR information. | Visible shortcut [10]. |
| Booking history | Help passengers retrieve previous booking information. | Visible shortcut [10]. |
| My Passengers | Help users access saved passenger records. | Visible shortcut [10]. |
| Refund status | Help users check refund information. | Visible shortcut [10]. |
| Helpline access | Route passengers to assistance. | Visible shortcut [10]. |

## Payments, wallet and account infrastructure

IRCTC iPAY is the portal’s passenger-facing payment gateway initiative. Its official documentation lists AutoPay/AutoDebit through debit cards, credit cards and UPI, alongside card, UPI and net-banking options. AutoPay places a hold on the payment instrument and releases it if the booking fails; the amount is debited only after a successful booking. iPAY also documents **Resume / Retry Booking**, which can reuse a previous deducted amount for a consecutive same-day booking when the new transaction amount is equal and the bank’s success response did not reach IRCTC [11].

IRCTC eWallet is a prepaid railway-ticket wallet. The official page documents PAN or Aadhaar verification, a transaction password or PIN for every wallet booking, separate transaction and payment histories, password-change access, and next-day credit of an eligible cancellation refund into the wallet. The page also states that the balance is for railway-ticket booking and is subject to eligibility, deposit, balance, registration-fee and transaction-charge rules [12].

| Payment / account feature | User value |
|---|---|
| iPAY cards, UPI and net banking | Multiple ways to pay for rail and related IRCTC transactions [11]. |
| iPAY AutoPay / AutoDebit | Reduces failed-booking friction by holding funds until booking success [11]. |
| iPAY Resume / Retry | Reuses an earlier deducted amount in a narrowly defined same-day retry scenario [11]. |
| IRCTC eWallet | Pre-fund the account for faster railway-ticket payments [12]. |
| PAN / Aadhaar wallet verification | Provides an online authentication step for eWallet access [12]. |
| Transaction PIN and history | Adds a per-booking control and searchable wallet records [12]. |
| Free account registration | Individual registration uses a valid mobile number and email with OTP verification [13]. |
| Aadhaar profile authentication | Extends eligibility for Tatkal/Premium Tatkal and higher monthly booking limits, subject to passenger authentication [7]. |

## Official mobile app

IRCTC Rail Connect is the official mobile app by Indian Railway Catering and Tourism Corporation Limited. Its current listing advertises PIN and biometric login, train and route search, seat availability without login, PNR enquiry, multiple quotas, current reservation, Master Passenger List management, integrated eWallet, payment by UPI, net banking, cards, EMI, BNPL and wallets, boarding-point change, booking/viewing/cancellation/TDR, Aadhaar linking, reservation charts, Google TalkBack support and OTP-based booking for visually impaired users [3]. The listing also mentions a single-view display of all-class availability, unified payment options, improved alerts and loyalty-card experience. App-specific claims are intentionally labelled as app features rather than desktop-route features.

## Food and onboard services

IRCTC eCatering provides a separate food-ordering service for train journeys. A passenger enters a PNR, explores outlets available along the journey, chooses food, schedules the order, pays online or by cash on delivery, and receives the meal at a selected station or onboard delivery point. The official site advertises more than 300 stations, authorised restaurant and aggregator partners, dietary options including Jain, vegetarian and Sattvic meals, phone ordering through **1323**, and automatic order cancellation when the PNR is cancelled [14].

The Food on Track mobile app adds order-status updates, one-tap calling, PNR auto-pasting, reduced data consumption, quicker loading and smooth transitions. eCatering also supports group orders for parties of 15 or more, assisted ordering and custom pricing. The official page lists UPI, wallets, debit and credit cards, net banking and pay-on-delivery, plus complaint submission through the site, app or 1323 [14].

## Connected travel services

The IRCTC home page links travelers to a broader set of services. These include **IRCTC Air**, **IRCTC Hotels**, **IRCTC Bus**, **Rail Drishti**, **Holiday Packages**, **Tourist Train**, **Hill Railways**, **Charter Train**, **Gallery**, **E-Catering** and **E-Pantry** [2]. They are best understood as an ecosystem: some are separate IRCTC subdomains, some are tourism products, and some are informational or discovery destinations.

| Connected service | Main capabilities documented by the official service |
|---|---|
| IRCTC Air | One-way and round-trip flight search, domestic and international comparison, passenger-count fields, Economy/Business/Premium Economy, seat maps, price filtering, Defence Fare, Government Employee/LTC and other special flows, plus IRCTC and guest login [15]. |
| IRCTC Hotels | Hotel search by location, check-in/check-out, rooms and guests, price-per-night filter, city discovery, property listings, booking actions, IRCTC login and guest login [16]. |
| IRCTC Bus | Bus search by origin, destination and departure date; seat selection; bus-type, pickup/drop-off and timing choices; amenities, reviews, ratings and images; IRCTC or guest booking; online cancellation; multiple payment options; partial cancellation [17]. |
| IRCTC Tourism | Domestic and international air, land and rail packages; hotels; retiring rooms; religious tours; mobile app; IRCTC-user and guest-user journeys; customization such as guides and road transfers [18]. |
| Bharat Gaurav Tourist Trains | Theme-based rail circuits packaged with bus excursions, hotel stays, guides, meals, insurance and onboard services; some variants include pantry cars, CCTV, infotainment and enhanced accommodation [19]. |
| Luxury and heritage trains | Maharajas’ Express, Golden Chariot and Buddhist Circuit journeys with curated itineraries, accommodation, dining and cultural immersion [20]. |
| Rail Drishti | Linked by the official IRCTC home page as an Indian Railways information service. The public page did not return extractable text during this review, so detailed functions are not asserted here [2]. |
| Charter Train / Hill Railways / Gallery / E-Pantry | Listed as official discovery or service entry points on the home page; individual capabilities require opening the corresponding destination and may change over time [2]. |

## Customer support, accessibility and trust features

IRCTC’s official support page directs passengers to the enhanced eQuery interface for submitting and tracking queries. It supplies an email route for e-ticket cancellation or TDR problems, the 14646 helpline within India, international phone numbers, and support in Hindi, English, Punjabi, Bengali, Assamese, Odia, Marathi, Gujarati, Tamil, Telugu, Kannada and Malayalam [5]. The Rail Connect listing adds Google TalkBack support and an OTP booking flow for visually impaired users [3].

The ecosystem also includes trust and account controls: IRCTC branding and authorized-partner labels, email and mobile OTP verification, Terms of Use and Privacy Policy links on AskDISHA, PAN/Aadhaar verification for eWallet, and Aadhaar-linked passenger records. These should be treated as account, security and accessibility features rather than “AI” capabilities.

## Loyalty and co-branded cards

IRCTC presents co-branded cards with SBI Cards, Bank of Baroda, HDFC and RBL Bank. The loyalty model allows members to earn travel points on IRCTC rail-ticket bookings, earn partner points on other purchases and redeem points toward IRCTC train-ticket bookings. The official page also exposes card comparison and profile-linking tools, with individual product benefits such as transaction-charge waivers, reward points, railway-lounge access and, for selected cards, cancellation protection [21]. Card fees and benefits are product-specific and may change; the report therefore describes the program rather than recommending a card.

## Important boundaries and change-sensitive items

The portal’s service inventory is broad, but the exact controls visible on the train-search route depend on JavaScript, login state, captcha, maintenance, user eligibility and policy timing. The home page’s service labels are strong evidence that the destinations are part of the IRCTC ecosystem, but they do not prove that each linked product is embedded in the train-search page. Similarly, app listings and policy guides can contain features or limits that differ from the desktop experience or change after publication.

The following items are especially change-sensitive: Tatkal opening times and passenger limits; monthly reservation limits; Aadhaar-linked booking thresholds; eWallet fees and limits; payment charges; refund rules; app-store features; tourism package availability; and service availability at specific stations. Users should confirm the live policy and availability immediately before acting.

> **Research interpretation:** The safest summary is that IRCTC combines a core railway reservation system with a growing travel-commerce and passenger-support ecosystem. AskDISHA is the explicit AI layer; iPAY and eWallet are payment infrastructure; Rail Connect is the mobile execution layer; eCatering, Air, Hotels, Bus and Tourism extend the journey beyond the ticket.

## References

[1]: https://contents.irctc.co.in/en/bookEticket.html "IRCTC E-Ticket guide"
[2]: https://www.irctc.co.in/ "IRCTC official home page"
[3]: https://contents.irctc.co.in/en/IRCTC_andriod_App.html "IRCTC Rail Connect official app listing"
[4]: https://www.irctc.co.in/online-charts/ "IRCTC Reservation Chart"
[5]: https://contents.irctc.co.in/en/ContactUsEn.html "IRCTC Contact Us and support"
[6]: https://contents.irctc.co.in/en/boardingPointChange.html "IRCTC online change of boarding point"
[7]: https://contents.irctc.co.in/en/AadhaarLinking.pdf "IRCTC user guide: authenticate profile with Aadhaar"
[8]: https://contents.irctc.co.in/en/TatkalBooking.html "IRCTC Tatkal ticket booking guide"
[9]: https://contents.irctc.co.in/en/currentBooking.html "IRCTC current booking guide"
[10]: https://askdisha.irctc.co.in/ "AskDISHA 2.0 official AI ticketing page"
[11]: https://contents.irctc.co.in/en/irctc_ipay_english.pdf "IRCTC iPAY payment gateway overview"
[12]: https://contents.irctc.co.in/en/AboutEwallet.html "About IRCTC eWallet"
[13]: https://contents.irctc.co.in/en/userregistration.html "IRCTC user registration"
[14]: https://www.ecatering.irctc.co.in/ "IRCTC eCatering / Food on Track"
[15]: https://www.air.irctc.co.in/ "IRCTC Air"
[16]: https://www.hotels.irctc.co.in/ "IRCTC Hotels"
[17]: https://www.bus.irctc.co.in/home "IRCTC Bus"
[18]: https://www.irctctourism.com/ "IRCTC Tourism"
[19]: https://www.irctctourism.com/bharatgaurav "Bharat Gaurav Tourist Trains"
[20]: https://www.irctctourism.com/luxury-train-journeys "IRCTC luxury train journeys"
[21]: https://contents.irctc.co.in/en/AboutLoyalty.html "IRCTC co-brand cards and loyalty"
