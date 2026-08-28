# IRCTC research notes — source capture

## Scope and access note
- User-provided page: https://www.irctc.co.in/nget/train-search
- The train-search route rendered a JavaScript shell in the sandbox and did not expose controls in the initial snapshot.
- The official home page was accessible through extracted page content but browser rendering was blocked by a captcha. Therefore, items below are documented as official page labels/content, not as claims that every control was interactively verified in-session.

## Official home-page service labels and content captured
Source: https://www.irctc.co.in/
- Core train booking/search flow: From, To, journey date, all classes, General, Person With Disability Concession, Flexible With Date, Railway Pass Concession, Search Trains.
- PNR STATUS links to Indian Railways enquiry.
- CHARTS / VACANCY links to IRCTC online charts.
- Service discovery links: Flights, Hotels, Rail Drishti, E-Catering, Bus.
- Holiday/travel links: Holiday Packages, Tourist Train, Hill Railways, Charter Train, Gallery.
- Holiday content sections: Maharajas' Express, International Packages, Domestic Air Packages, Bharat Gaurav Tourist Train, Rail Tour Packages.
- Footer/service utilities: IRCTC Trains, General Information, Important Information, Agents, Enquiries, How To, IRCTC Official App, Advertise with us, Refund Rules, Person With Disability Facilities, E-Wallet, IRCTC Co-branded Card Benefits, IRCTC-iPAY Payment Gateway, IRCTC Zone, DMRC Ticket Booking at IRCTC, For Newly Migrated Agents, Mobile Zone, Policies, Ask Disha ChatBot, About us, Help & Support, E-Pantry.
- Social channels listed: Facebook, WhatsApp, YouTube, Instagram, LinkedIn, Telegram, Pinterest, Tumblr, Koo, Twitter.
- Host attribution: Designed and Hosted by CRIS.

## Follow-up sources to verify
- https://askdisha.irctc.co.in/
- https://www.ecatering.irctc.co.in/
- https://www.irctctourism.com/
- https://www.air.irctc.co.in/
- https://www.hotels.irctc.co.in/
- https://www.bus.irctc.co.in/home
- https://raildrishti.indianrailways.gov.in/
- https://www.ftr.irctc.co.in/ftr/
- https://www.irctc.co.in/online-charts/
- https://www.irctc.co.in/nget/train-search

## AskDISHA evidence
Source: https://askdisha.irctc.co.in/
- Branding: AskDisha 2.0, “NextGen AI Ticketing.”
- Described as “Digital Interaction To Seek Help Anytime.”
- Technology description: Artificial Intelligence, machine learning, and NLP-based virtual assistant; explicitly includes ChatBot and VoiceBot.
- Visible task shortcuts: Search Trains, PNR Status, Booking History, My Passengers, Refund Status, and Helpline.
- Search form supports From, To, journey date, Tomorrow, Day After, All Classes, General (GN), and Search Trains.
- Includes a query box labelled “Type or Ask Disha...” and a microphone control, indicating text and voice interaction entry points.
- Identifies itself as an IRCTC Authorized Partner.
- Terms of Use and Privacy Policy links are present.

## Additional official-search findings
Search results from official IRCTC/contents domains surfaced these sources for verification:
- About IRCTC eWallet: https://contents.irctc.co.in/en/AboutEwallet.html
- eWallet User Guide: https://contents.irctc.co.in/en/EwalletUserGuide.html
- Cancellation and Refund Rules: https://contents.irctc.co.in/en/CancellationRulesforIRCTCTrain.pdf
- Contact Us: https://contents.irctc.co.in/en/ContactUsEn.html
- IRCTC Android app page: https://contents.irctc.co.in/en/IRCTC_andriod_App.html
- Pass booking salient features: https://contents.irctc.co.in/en/Salient_Features_PASSBooking.pdf
- Co-brand credit cards / loyalty: https://contents.irctc.co.in/en/AboutLoyalty.html
- eCatering: https://www.ecatering.irctc.co.in/
- Tourism: https://www.irctctourism.com/

## Official eCatering findings
Source: https://www.ecatering.irctc.co.in/
IRCTC eCatering provides food delivery for train journeys. The workflow is: enter a PNR, explore restaurants/outlets available for the journey, choose food, schedule delivery, pay online or by cash on delivery, and receive the meal at the selected station/seat. The service advertises authorised partners, group orders for 15 or more travelers, assisted ordering, and custom prices for bulk quantities. The Food on Track app adds order-status updates, one-tap calling, PNR auto-pasting, lower data usage, faster loading, and fluid/smooth transitions. The page states availability at 300+ stations, broad cuisine and dietary options, auto-cancellation when the PNR is cancelled, ordering through the website/app/phone 1323, and WhatsApp ordering through +91-8750001323. It also lists complaint handling through the website/app/1323, multiple payment methods including UPI, wallets, debit/credit cards, net banking and pay-on-delivery, pre-ordering with a valid PNR, and vendor registration.

## Official IRCTC Tourism findings
Source: https://www.irctctourism.com/
IRCTC Tourism offers domestic and international tour packages, transport/accommodation/meals as package components, optional customization such as tour guides and road transfers, hotel booking, retiring-room booking, religious/pilgrimage packages, air/land/rail packages, a mobile app, and guest-user as well as IRCTC-login flows. The site also documents part payment for eligible package bookings above ₹50,000, subject to advance-reservation and installment rules.

## Official eWallet findings
Source: https://contents.irctc.co.in/en/AboutEwallet.html
IRCTC eWallet uses PAN or Aadhaar online verification, a transaction password/PIN for each booking, transaction and payment history, change-transaction-password access, and next-day credit of eligible cancellation refunds into the eWallet. The balance is intended for railway-ticket booking; the page also states Indian-nationality and Indian-mobile-number eligibility, a registration fee, per-transaction charge, minimum deposit, and a maximum permitted balance.

## Official support findings
Source: https://contents.irctc.co.in/en/ContactUsEn.html
IRCTC directs passengers to the eQuery interface for submitting and tracking queries. For e-ticket cancellation/TDR problems it provides etickets@irctc.co.in from the registered email ID, helpline 14646 within India, and international numbers +91-8044647999 / +91-8035734999. The page lists support languages including Hindi, English, Punjabi, Bengali, Assamese, Odia, Marathi, Gujarati, Tamil, Telugu, Kannada and Malayalam. It also provides channels for IRCTC loyalty co-branded card complaints and loyalty-program queries.

## Official IRCTC Air findings
Source: https://www.air.irctc.co.in/
IRCTC Air supports one-way and round-trip flight searches, domestic/international airline comparison, passenger counts by adult/child/infant, Economy/Business/Premium Economy, and special flows for Defence Fare, Government Employee/LTC, senior citizens, and students. The site states that it compiles fares from multiple airlines, exposes seat maps for seat selection, permits price filtering, and provides IRCTC, guest, and Government/LTC login modes. It also links to after-booking assistance and feedback capture.

## Official IRCTC Hotels findings
Source: https://www.hotels.irctc.co.in/
IRCTC Hotels provides hotel search by location, check-in/check-out, rooms and guests, and price per night. It exposes domestic-city discovery pages and hotel listings with property type and booking actions, supports IRCTC login and guest login, and provides contact channels. The broader tourism site links this hotel service with flights and travel packages.

## Official IRCTC Bus findings
Source: https://www.bus.irctc.co.in/home
IRCTC Bus supports departure/arrival/date search, seat selection, bus-type selection such as Volvo, AC and non-AC, pickup/drop-off point and timing choices, and comparison using amenities, reviews, ratings and bus images. The page says state road transport fleets such as UPSRTC, APSRTC, GSRTC, OSRTC and Kerala RTC are enabled or being enabled. Booking can use IRCTC credentials or guest email/mobile, with online cancellation, debit/credit card, net banking, wallets and UPI, up to six passengers per transaction, and partial cancellation.

## Research boundary note
Rail Drishti was linked by the IRCTC home page as a railway information service, but the public page did not return extractable text in this session. It is included as a linked service with an evidence note rather than an expanded feature claim.

## Official account and reservation features
Source: https://contents.irctc.co.in/en/userregistration.html
Individual registration is free and requires a valid mobile number and email. Verification uses email and mobile OTPs. The page describes password recovery, a user ID for transactions, and the then-stated reservation allowance of up to six rail reservations and up to six passengers per ticket in one calendar month; limits should be treated as policy details that may change.

Source: https://www.irctc.co.in/online-charts/
The official Reservation Chart tool accepts Train Name/Number, Journey Date, and Boarding Station, then provides “Get Train Chart.”

## Official IRCTC iPAY findings
Source: https://contents.irctc.co.in/en/irctc_ipay_english.pdf
IRCTC iPAY is the portal's payment gateway initiative. It supports AutoPay/AutoDebit via debit card, credit card and UPI, along with credit/debit card, UPI and net-banking options. AutoPay places a lien/hold and releases it if the booking fails; it debits only on a successful booking, reducing payment-failure and refund friction. The gateway also offers Resume/Retry Booking, allowing a same-day consecutive booking to use a previous deducted amount when the new transaction amount is equal and the bank's success response was not received by IRCTC.

## Official loyalty findings
Source: https://contents.irctc.co.in/en/AboutLoyalty.html
IRCTC co-branded cards are presented with SBI Cards, Bank of Baroda, HDFC and RBL Bank. The loyalty scheme lets users earn travel points on IRCTC rail-ticket bookings, partner points on other purchases, and redeem points for IRCTC train-ticket booking. The page also exposes a card-comparison link and a link to connect a card to an IRCTC user profile; individual card benefits include transaction-charge waivers, reward points, railway-lounge access and, for some products, cancellation protection.

## Official Rail Connect app findings
Source: https://contents.irctc.co.in/en/IRCTC_andriod_App.html
The official IRCTC Rail Connect app advertises train search, route details, seat availability without login, PNR enquiry, General/Tatkal/Premium Tatkal/Ladies/Divyangjan/Senior Citizen quotas, current reservation, Master Passenger List management, eWallet, UPI/net banking/cards/EMI/BNPL/wallet payments, boarding-point change, booking/viewing/cancellation/TDR filing, Aadhaar linking, reservation charts, accessibility via Google TalkBack, OTP-based booking flow for visually impaired users, loyalty rewards, PIN/biometric login, all-class availability in a single view, unified payment options, and improved alerts. The page also links to eCatering and other official IRCTC apps. Because this source is a Google Play listing surfaced from the official IRCTC contents domain, it is an app-level source rather than proof that every feature appears on the desktop train-search route.

## Official booking-policy findings
Source: https://contents.irctc.co.in/en/TatkalBooking.html
The Tatkal guide documents Tatkal quota selection, AC/non-AC opening times, availability display, Book Now, passenger details, berth preference, auto-upgradation consideration, passenger mobile number, payment, confirmation and printable Electronic Reservation Slip. It states a maximum of four passengers per Tatkal e-ticket and notes that senior-citizen concession is not allowed in Tatkal quota.

Source: https://contents.irctc.co.in/en/boardingPointChange.html
Eligible e-ticket passengers can change the boarding station online before 24 hours of scheduled departure, once, subject to exclusions such as seized tickets, VIKALP PNRs, I-Tickets and current-booking tickets. Changing the boarding point removes the right to board from the original station.

Source: https://contents.irctc.co.in/en/AadhaarLinking.pdf
Aadhaar authentication enables Tatkal and Premium Tatkal booking, eWallet registration, and up to 24 tickets per month when the user profile and at least one traveling passenger are Aadhaar-authenticated. It also documents authentication of passengers in the Master List and profile-data update rules.

## Official tourist-train findings
Sources: https://www.irctctourism.com/bharatgaurav/ ; https://www.irctctourism.com/luxury-train-journeys ; https://www.irctctourism.com/tourist-train-rides
IRCTC Tourism's Bharat Gaurav pages describe theme-based circuits packaged with train travel, bus excursions, hotel stays, tour guides, meals, travel insurance, and allied onboard services. The trains may include sleeper, AC III-tier and AC II-tier coaches, pantry cars, infotainment and CCTV; deluxe variants may add dedicated kitchen cars, rail restaurants, shower cubicles, electronic safes and foot massagers. The luxury-train pages describe Maharajas' Express, Golden Chariot, Buddhist Circuit Tourist Train and Bharat Gaurav as curated cultural/heritage journeys with accommodation, dining, lounges and modern amenities. These are tourism products rather than general train-search controls, so the final report distinguishes them from core rail booking features.

## Official core e-ticket workflow
Source: https://contents.irctc.co.in/en/bookEticket.html
The documented flow is free individual registration, login, Plan My Travel, station and e-ticket selection, train-list submission, route/timing inspection, class-level fare and availability inspection, Book Now, passenger details and berth preference, payment-bank selection, confirmation, and Electronic Reservation Slip printing. The guide also documents Booked Ticket History, full or partial e-ticket cancellation, and reprinting the ERS for remaining passengers after partial cancellation. The page mentions senior-citizen concessions and the related age-proof requirement.

## Official current-booking workflow
Source: https://contents.irctc.co.in/en/currentBooking.html
Current booking is booking against vacant accommodation after charting. The guide states that it is available to normal and agent users, is e-ticket only, books only confirmed tickets, allows senior-citizen and disabled concessions, follows the railway booking-time window, and excludes boarding-point/name/age/gender changes for current-booking PNRs.
