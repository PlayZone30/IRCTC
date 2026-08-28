/**
 * Hindi copy deck — PLAN.md §7.10, §13, Task 15.
 *
 * Per §7.10: money copy (hold/issuance-failed/refund-in-progress) that
 * reads ambiguously in Hindi is LEFT IN ENGLISH — a partially translated
 * payment-failure message is worse than English. All other user-facing
 * strings are translated.
 *
 * UTF-8 Devanagari only — no machine translation of money copy.
 */
import { en, type Dictionary } from './en';

const hi: Dictionary = {
  ...en, // fallback for any keys not yet translated

  common: {
    back: 'वापस',
    continue: 'आगे बढ़ें',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    edit: 'संपादित करें',
    remove: 'हटाएं',
    apply: 'लागू करें',
    reset: 'रीसेट करें',
    loading: 'लोड हो रहा है…',
    retry: 'पुनः प्रयास करें',
    save: 'सहेजें',
    change: 'बदलें',
    optional: 'वैकल्पिक',
  },

  nav: {
    productName: 'RailIndia',
    book: 'बुक करें',
    myBookings: 'मेरी बुकिंग',
    pnrStatus: 'PNR स्थिति',
    charts: 'चार्ट',
    textSizeDecrease: 'अक्षर छोटे करें',
    textSizeReset: 'अक्षर सामान्य करें',
    textSizeIncrease: 'अक्षर बड़े करें',
    language: 'भाषा / Language',
    notifications: 'सूचनाएं',
    account: 'खाता',
  },

  // §13.2 — status vocabulary
  status: {
    CNF: { label: 'पुष्टि — बर्थ आरक्षित', consequence: 'आपकी बर्थ आरक्षित है। कोच और बर्थ नंबर टिकट पर दिखेगा।' },
    CNF_1A: {
      label: 'पुष्टि',
      consequence: 'चार्ट बनने पर कोच और बर्थ आवंटित होगी, जिससे परिवार एक साथ रहे।',
    },
    CNF_NO_BERTH: { label: 'पुष्टि', consequence: 'चार्ट बनने पर आपकी बर्थ नंबर आवंटित होगी।' },
    RAC: {
      label: 'RAC — सीट, पूरी बर्थ नहीं',
      consequence:
        'आप बोर्ड कर सकते हैं और साइड-लोअर बर्थ पर सीट मिलेगी। चार्टिंग या TTE से पूरी बर्थ मिल सकती है।',
    },
    GNWL: {
      label: 'प्रतीक्षासूची — सामान्य (GNWL)',
      consequence: 'सबसे बड़ा कोटा, इसलिए सबसे ज़्यादा क्लियर होता है। यदि क्लियर नहीं हुआ तो आरक्षित कोच में नहीं चढ़ सकते।',
    },
    RLWL: {
      label: 'प्रतीक्षासूची — दूरस्थ (RLWL)',
      consequence:
        'तभी क्लियर होगा जब आपके गंतव्य तक जाने वाला यात्री रद्द करे। ट्रेन के आपके स्टेशन पर पहुंचने से 2-3 घंटे पहले चार्ट बनता है।',
    },
    PQWL: {
      label: 'प्रतीक्षासूची — पूल्ड (PQWL)',
      consequence: 'इस रूट पर कई स्टेशनों के बीच एक छोटा पूल साझा होता है, इसलिए कम क्लियर होता है।',
    },
    RSWL: {
      label: 'प्रतीक्षासूची — रोडसाइड (RSWL)',
      consequence: 'छोटे स्टेशन की छोटी यात्रा के लिए। बहुत कम क्लियर होता है।',
    },
    RQWL: {
      label: 'प्रतीक्षासूची — अनुरोध (RQWL)',
      consequence: 'दो मध्यवर्ती स्टेशनों के बीच यात्रा के लिए, कोई समर्पित कोटा नहीं। बहुत कम क्लियर होता है।',
    },
    TQWL: {
      label: 'प्रतीक्षासूची — तत्काल (TQWL)',
      consequence: 'तत्काल प्रतीक्षासूची को चार्टिंग पर प्राथमिकता नहीं मिलती। सामान्य प्रतीक्षासूची पहले क्लियर होती है।',
    },
    REGRET: { label: 'बुकिंग बंद', consequence: 'इस तिथि पर इस श्रेणी में बुकिंग बंद है।' },
    NOT_AVAILABLE: { label: 'उपलब्ध नहीं', consequence: 'इस तिथि पर यह ट्रेन इस श्रेणी में नहीं चलती।' },
    waitlistWarning:
      'पूरी तरह प्रतीक्षासूची वाला टिकट आरक्षित कोच में चढ़ने की अनुमति नहीं देता। यदि क्लियर नहीं हुआ तो चार्टिंग पर स्वतः रद्द और वापस होगा — ₹60 लिपिकीय शुल्क काटकर। सुविधा शुल्क वापस नहीं होता।',
  },

  // §7.5 — confirmation guidance bands
  confirmation: {
    usually_clears: 'आमतौर पर क्लियर होता है',
    often_clears: 'अक्सर क्लियर होता है',
    rarely_clears: 'कभी-कभी क्लियर होता है',
    unlikely_to_clear: 'क्लियर होने की संभावना कम है',
    evidenceHeading: 'इस ट्रेन के {class} में पिछले 10 प्रस्थानों में प्रतीक्षासूची इतनी दूर तक क्लियर हुई:',
    yourPosition: 'आपकी स्थिति: {status} {number}।',
    methodNote: 'इस ट्रेन और श्रेणी के पिछले 10 प्रस्थानों के आधार पर। पिछले परिणाम भविष्य की गारंटी नहीं।',
  },

  // §13.3 — berth allocation reasons
  berthReason: {
    PREF_HONOURED: 'आपने {pref} मांगी थी और वही मिली है।',
    PREF_EXHAUSTED: 'आपने {pref} मांगी थी। इस कोच में सभी {pref} बर्थ पहले ही बुक हो चुकी थीं।',
    QUOTA_HELD: 'इस कोच में {n} लोअर बर्थ वरिष्ठ नागरिकों, 45+ महिलाओं और गर्भवती यात्रियों के लिए आरक्षित हैं।',
    AUTO_LB_APPLIED: 'यात्री की आयु के कारण लोअर बर्थ स्वतः अनुरोध किया गया।',
    AUTO_LB_LOST: 'लोअर बर्थ स्वतः अनुरोध हुआ था, पर अंतिम लोअर बर्थ पहले बुक हो गई।',
    COMPACTED: 'आपके समूह को एक ही बे में रखा गया, जिसे बर्थ प्रकार से अधिक प्राथमिकता दी गई।',
    COMPACTED_COACH: 'आपके समूह को एक ही कोच में रखा गया। एक बे में जगह नहीं थी।',
    FCFS_LATE: 'बर्थ पहले-आए-पहले-पाए के आधार पर मिलती है। आपकी पसंदीदा बर्थ आज पहले बुक हो गई।',
    DEFERRED_1A: 'प्रथम AC बर्थ चार्ट बनने पर आवंटित होगी।',
    DEFERRED_CHART: 'चार्ट बनने पर बर्थ नंबर आवंटित होगी, जिससे समूह एक साथ बैठ सके।',
  },

  // §13.4 — money copy (LEAVE CRITICAL PAYMENT STRINGS IN ENGLISH per §7.10)
  money: {
    holdExplainer:
      'We place a hold on your money. It is captured only when your ticket is issued. If issuance fails, the hold is released.',
    issuanceFailed:
      'Ticket not issued. Your money was held, not taken. The hold on {amount} is being released to your bank and will disappear from your statement by {date}. Bank reference {utr}. You do not need to do anything, and do not retry this booking yet — retrying now may place a second hold.',
    refundInProgress: '{amount} is on its way back to {instrument}. Expected by {date}. Bank reference {utr}.',
    autoCancelledWaitlist:
      'Your waitlisted ticket did not clear, so it was cancelled automatically at charting. {refund} has been returned. {clerkage} clerkage was deducted and the {fee} convenience fee is not refunded.',
    lowestTotal: 'सबसे कम कुल',
    ticketFare: 'टिकट किराया',
    convenienceFee: 'सुविधा शुल्क',
    gst: 'GST',
    total: 'कुल किराया',
    gatewayCharge: 'गेटवे शुल्क',
  },

  // §13.5 — agent copy
  agent: {
    name: 'सारथी',
    intro: 'मैं खोज, तुलना और बुकिंग तैयार कर सकता हूं। भुगतान आप स्वयं करते हैं।',
    proposesNeverPays: 'प्रस्तावित करता है · भुगतान नहीं करता',
    ambiguousStation: '"{query}" से दो स्टेशन मिलते हैं — {optionA} और {optionB}। कौन सा?',
    nothingConfirmed:
      '{train} में किसी भी श्रेणी में कुछ पुष्टि नहीं है। अगर आप {station} से बोर्ड करें तो {class} में {status} मिलेगा — ₹{delta} अधिक, और {time} बजे बोर्डिंग। चाहिए?',
    handoff: 'मैंने यह बुकिंग तैयार की है। किराया देखें और अगली स्क्रीन पर पुष्टि करें — मैं भुगतान नहीं कर सकता।',
    ruleRefusal:
      'तत्काल कोटा में छूट की अनुमति नहीं, इसलिए वरिष्ठ नागरिक छूट लागू नहीं की। दिखाया गया किराया पूर्ण किराया है।',
    unknown: 'मैं ट्रेन खोज सकता हूं, बुकिंग तैयार कर सकता हूं, पैसे की स्थिति बता सकता हूं, PNR देख सकता हूं, या नियम समझा सकता हूं। क्या चाहिए?',
    whatICanDo: 'सारथी क्या कर सकता है',
    canDo: 'कर सकता हूं: खोज, तुलना, नियम, बुकिंग तैयार करना, ड्राफ्ट बनाना, ऑर्डर पढ़ना।',
    cannotDo: 'नहीं कर सकता: भुगतान, आपकी पुष्टि के बिना रद्द, आधार विवरण बदलना, किसी से संपर्क करना।',
    composerPlaceholder: 'सारथी से पूछें — जैसे "कोल्लम से चेन्नई 12 सितंबर को बुक करें"',
    suggestions: {
      book: 'टिकट बुक करें',
      refund: 'मेरा रिफंड कहां है',
      pnr: 'PNR जांचें',
      waitlist: 'प्रतीक्षासूची समझाएं',
    },
  },

  a11y: {
    stationSelected: '{station} को {field} स्टेशन के रूप में चुना गया।',
    conformanceNote: 'WCAG 2.1 AA और GIGW 3.0 के अनुसार बनाया गया। पूर्ण अनुपालन के लिए सहायक-तकनीक परीक्षण आवश्यक है।',
  },

  // Orders list (S10a)
  orders: {
    heading: 'आपकी बुकिंग',
    empty: 'अभी कोई बुकिंग नहीं। ट्रेन खोजकर शुरू करें।',
    groupUpcoming: 'आगामी',
    groupAwaitingChart: 'चार्ट की प्रतीक्षा',
    groupPast: 'पिछली यात्राएं',
    groupCancelled: 'रद्द',
    viewDetails: 'विवरण देखें',
    viewTicket: 'टिकट देखें',
    raiseQuery: 'शिकायत दर्ज करें',
    passengers: '{n} यात्री',
    passengers_plural: '{n} यात्री',
  },

  // PNR status (S10b)
  pnr: {
    heading: 'PNR स्थिति',
    label: 'PNR नंबर दर्ज करें',
    placeholder: '10 अंकों का PNR',
    check: 'स्थिति जांचें',
    notFound: 'इस PNR पर कोई बुकिंग नहीं मिली। नंबर जांचें और पुनः प्रयास करें।',
    chartTime: 'चार्ट समय',
    chartPrepared: 'चार्ट तैयार',
    chartingIn: '{time} में चार्टिंग',
    yourPosition: 'आपकी स्थिति: {status} {number}',
    viewOrder: 'पूरा ऑर्डर देखें',
    demoHint: 'डेमो PNR आज़माएं: 4728166390 · 8890342156 · 2231905567',
  },

  // Charts / vacancy (S10c)
  charts: {
    heading: 'चार्ट / रिक्तता',
    trainLabel: 'ट्रेन नंबर',
    trainPlaceholder: 'जैसे 12723',
    dateLabel: 'यात्रा तिथि',
    stationLabel: 'बोर्डिंग स्टेशन',
    check: 'चार्ट देखें',
    firstChart: 'प्रथम चार्ट',
    secondChart: 'द्वितीय चार्ट',
    notCharted: 'इस ट्रेन का इस तिथि का चार्ट अभी तैयार नहीं हुआ।',
    coachVacancy: 'कोच रिक्तता',
    vacant: 'रिक्त',
    racBerths: 'RAC',
    noVacancy: 'कोई रिक्तता नहीं',
    demoHint: 'ट्रेन 12723 · तिथि 28 अगस्त · बोर्ड HYB आज़माएं',
  },

  // Grievance (§7.9)
  grievance: {
    heading: 'शिकायत दर्ज करें',
    intro:
      'यह शिकायत आपके लेनदेन विवरण से पहले से भरी है, ताकि सहायता केंद्र को दोबारा पूछना न पड़े।',
    userNoteLabel: 'आप क्या कहना चाहते हैं?',
    userNotePlaceholder: 'समस्या अपने शब्दों में बताएं।',
    submit: 'शिकायत भेजें',
    successTitle: 'शिकायत दर्ज हो गई',
    owner: 'जिम्मेदार: {role}',
    nextAction: 'अगला कदम: {action}',
    deadline: 'अपेक्षित जवाब: {date} तक',
    reference: 'संदर्भ: {ref}',
    timelineLabel: 'शिकायत दर्ज',
  },

  footer: {
    disclaimer:
      'यह एक स्वतंत्र हैकाथॉन प्रोटोटाइप है। सभी डेटा, खाते और लेनदेन नकली हैं। यह IRCTC या भारतीय रेल से संबद्ध, समर्थित या जुड़ा हुआ नहीं है।',
  },
};

export { hi };
