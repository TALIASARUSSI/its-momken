import { useState, useEffect, useRef } from "react";

// ============================================================
// DATA
// ============================================================

const vocabulary = [
  { id: 1,  persian: "سلام",     transliteration: "Salam",      hebrew: "שלום",                    category: "ברכות",    xp: 10 },
  { id: 2,  persian: "ممنون",    transliteration: "Mamnoon",     hebrew: "תודה",                    category: "ברכות",    xp: 10 },
  { id: 3,  persian: "خداحافظ", transliteration: "Khodahafez",  hebrew: "להתראות",                 category: "ברכות",    xp: 10 },
  { id: 4,  persian: "لطفاً",   transliteration: "Lotfan",      hebrew: "בבקשה",                   category: "ברכות",    xp: 10 },
  { id: 5,  persian: "بله",      transliteration: "Bale",        hebrew: "כן",                      category: "בסיסי",    xp: 5  },
  { id: 6,  persian: "نه",       transliteration: "Na",          hebrew: "לא",                      category: "בסיסי",    xp: 5  },
  { id: 7,  persian: "آب",       transliteration: "Ab",          hebrew: "מים",                     category: "אוכל",     xp: 8  },
  { id: 8,  persian: "نان",      transliteration: "Nan",         hebrew: "לחם",                     category: "אוכל",     xp: 8  },
  { id: 9,  persian: "چای",      transliteration: "Chai",        hebrew: "תה",                      category: "אוכל",     xp: 8  },
  { id: 10, persian: "بازار",    transliteration: "Bazaar",      hebrew: "שוק",                     category: "מקומות",   xp: 12 },
  { id: 11, persian: "خانه",     transliteration: "Khaneh",      hebrew: "בית",                     category: "מקומות",   xp: 8  },
  { id: 12, persian: "کتاب",     transliteration: "Ketab",       hebrew: "ספר",                     category: "חפצים",    xp: 8  },
  // Hebrew-Persian Cognates
  { id: 13, persian: "زمان",     transliteration: "Zaman",       hebrew: "זמן — אותו שורש!",        category: "קוגנאטים", xp: 15 },
  { id: 14, persian: "دنیا",     transliteration: "Donya",       hebrew: "דוניה — עולם/תבל",        category: "קוגנאטים", xp: 15 },
  { id: 15, persian: "امتحان",   transliteration: "Emtehan",     hebrew: "מבחן — בחינה",            category: "קוגנאטים", xp: 15 },
  { id: 16, persian: "قلم",      transliteration: "Ghalam",      hebrew: "קולמוס — עט",             category: "קוגנאטים", xp: 15 },
  { id: 17, persian: "مشکل",     transliteration: "Moshkel",     hebrew: "מוּשכָּל — בעיה",         category: "קוגנאטים", xp: 15 },
  { id: 18, persian: "صبر",      transliteration: "Sabr",        hebrew: "סבל — סבלנות",            category: "קוגנאטים", xp: 15 },
  { id: 19, persian: "اجازه",    transliteration: "Ejaze",       hebrew: "אישור — רשות",            category: "קוגנאטים", xp: 15 },
  { id: 20, persian: "حساب",     transliteration: "Hesab",       hebrew: "חשבון — חישוב",           category: "קוגנאטים", xp: 15 },
  { id: 21, persian: "دکتر",     transliteration: "Doktor",      hebrew: "דוקטור — רופא",           category: "קוגנאטים", xp: 15 },
  { id: 22, persian: "خبر",      transliteration: "Khabar",      hebrew: "חדשות — ידיעה",           category: "קוגנאטים", xp: 15 },
];

// Slang substitution map — formal → colloquial (Persian script + romanization)
const slangMap = {
  "می‌خواهید":       "می‌خواین",
  "می‌خواهم":        "می‌خوام",
  "می‌خواهد":        "می‌خواد",
  "می‌روم":          "می‌رم",
  "می‌رویم":         "می‌ریم",
  "می‌شود":          "می‌شه",
  "هستم":            "ام",
  "هستید":           "هستین",
  "است":             "ـه",
  "نان":             "نون",
  "چه":              "چی",
  "چه می‌خواهید":    "چی می‌خواین",
  "Mikhahid":        "Mikhain",
  "Mikhaham":        "Mikham",
  "Mikhahad":        "Mikhad",
  "Miravam":         "Miram",
  "Miravim":         "Mirim",
  "Mishavad":        "Mishe",
  "Hastam":          "Am",
  "Hastid":          "Hastin",
  "ast?":            "e?",
  "ast.":            "e.",
  "Nan":             "Noon",
  "Che ":            "Chi ",
  "Che mikhahid":    "Chi mikhain",
};

// Grammar tutor notes per scenario
const grammarNotes = {
  bazaar: {
    title: "💡 תחביר: סמיכות — אֶזאפֶה (اضافه)",
    body: `בפרסית, כאשר שם עצם מתואר על ידי שם תואר, מוסיפים '-e' בסוף המילה הראשונה.\nזה נקרא 'אזאפה'. דוגמה: bazaar-e bozorg = הבזאר הגדול.\nהתואר בא אחרי שם העצם — ההיפך מעברית!`,
  },
  friend: {
    title: "💡 תחביר: גוף שני וסיומות אישיות",
    body: `בפרסית מדוברת, 'شما' (shoma — רשמי) מוחלף ב-'تو' (to — יחיד בלתי-רשמי).\nהאות 'ت' בסוף 'حال' היא סיומת גוף שני, כמו 'שלומ-ך' בעברית.\nסיומת '-e' בסוף 'چطوره' מחליפה את הפועל 'است' בדיבור יומיומי.`,
  },
  food: {
    title: "💡 תחביר: יחיד מסוים ומספרים",
    body: `בפרסית אין מילה נפרדת לגוף הידיעה ('ה-' בעברית).\nה'כמות' עושה את העבודה: 'یک' (yek = אחד) לפני שם עצם = יחיד מסוים.\n'یک چلو کباب لطفاً' = צ'לו קבאב אחד, בבקשה.`,
  },
  directions: {
    title: "💡 תחביר: סדר מילים SOV — נושא-מושא-פועל",
    body: `פרסית היא שפת SOV: נושא → מושא → פועל.\nהפועל תמיד מגיע אחרון — כמו גרמנית ויפנית.\nדוגמה: 'مستقیم برو' — הפועל (برو = לך) בסוף הצירוף.`,
  },
};

// OSINT-style realistic news items
const mockNews = [
  {
    id: 1,
    title: "ایران دور جدید غنی‌سازی اورانیوم را آغاز کرد",
    titleHebrew: "איראן מתחילה סבב חדש של העשרת אורניום",
    persian: "آژانس بین‌المللی انرژی اتمی اعلام کرد که ایران غنی‌سازی اورانیوم تا سطح ۶۰ درصد را در تأسیسات نطنز گسترش داده است.",
    transliteration: "Azhans-e beinalmellali-ye enerji-ye atomi e'lam kard ke Iran ghanisazi-ye oraniom ta sath-e shast darsad ra dar tasisat-e Natanz gostaresh dade ast.",
    hebrew: "הסוכנות הבינלאומית לאנרגיה אטומית הודיעה כי איראן הרחיבה את העשרת האורניום לרמת 60% במתקן נתנז.",
    quiz: [{ q: "לאיזה אחוז העשירה איראן אורניום?", options: ["20%", "45%", "60%", "90%"], answer: 2 }],
  },
  {
    id: 2,
    title: "اعتراضات گسترده در تهران پس از افزایش قیمت‌ها",
    titleHebrew: "מחאות נרחבות בטהרן בעקבות עליית מחירים",
    persian: "هزاران نفر در خیابان‌های تهران در اعتراض به گرانی مواد غذایی و بیکاری تجمع کردند. نیروهای امنیتی با گاز اشک‌آور پاسخ دادند.",
    transliteration: "Hezaran nafar dar khiyaban-haye Tehran dar e'teras be gerani-ye mavad-e ghazayi va bikari tajamo' kardand. Niruhaye amniyati ba gaz-e ashkavar pasokh dadand.",
    hebrew: "אלפי אנשים התאספו ברחובות טהרן במחאה על יוקר המחיה ואבטלה. כוחות הביטחון הגיבו עם גז מדמיע.",
    quiz: [{ q: "מה גרם למחאות?", options: ["בחירות", "גרעין", "יוקר המחיה", "מזג אוויר"], answer: 2 }],
  },
  {
    id: 3,
    title: "سپاه پاسداران رزمایش موشکی در خلیج فارس انجام داد",
    titleHebrew: "משמרות המהפכה ביצעו תרגיל טילים במפרץ הפרסי",
    persian: "سپاه پاسداران انقلاب اسلامی رزمایش موشکی گسترده‌ای در آب‌های خلیج فارس برگزار کرد و از پرتاب موفق ده‌ها موشک بالستیک خبر داد.",
    transliteration: "Sepah-e Pasdaran-e Enqelab-e Eslami razmayesh-e mushaki-ye gostardeh-ei dar ab-haye Khalij-e Fars bargozar kard va az partab-e movafagh-e dah-ha mushak-e balistik khabar dad.",
    hebrew: "משמרות המהפכה האסלאמית ערכו תרגיל טילים נרחב במימי המפרץ הפרסי והודיעו על שיגור מוצלח של עשרות טילים בליסטיים.",
    quiz: [{ q: "איפה התרגיל התקיים?", options: ["ים כספי", "מפרץ פרסי", "הים האדום", "ים ערב"], answer: 1 }],
  },
  {
    id: 4,
    title: "ایران و روسیه توافقنامه همکاری نظامی امضا کردند",
    titleHebrew: "איראן ורוסיה חתמו על הסכם שיתוף פעולה צבאי",
    persian: "وزرای دفاع ایران و روسیه در مسکو توافقنامه‌ای برای گسترش همکاری‌های نظامی و انتقال فناوری دفاعی امضا کردند.",
    transliteration: "Vozaray-e defa-e Iran va Rusiye dar Moskou tofaqnameh-ei baraye gostaresh-e hamkari-haye nezami va entegal-e fanavariy-e defaei emza kardand.",
    hebrew: "שרי ההגנה של איראן ורוסיה חתמו במוסקבה על הסכם להרחבת שיתוף הפעולה הצבאי והעברת טכנולוגיה ביטחונית.",
    quiz: [{ q: "איפה נחתם ההסכם?", options: ["טהרן", "בייג'ינג", "מוסקבה", "דמשק"], answer: 2 }],
  },
  {
    id: 5,
    title: "نرخ تورم ایران به ۴۵ درصد رسید",
    titleHebrew: "שיעור האינפלציה באיראן הגיע ל-45 אחוז",
    persian: "بانک مرکزی ایران اعلام کرد که نرخ تورم سالانه به ۴۵ درصد رسیده است. ارزش ریال در برابر دلار به پایین‌ترین سطح تاریخی خود رسید.",
    transliteration: "Bank-e markazi-ye Iran e'lam kard ke narkh-e tavarom-e salane be 45 darsad resideh ast. Arzesh-e rial dar barabar-e dollar be payin-tarin sath-e tarikhi-ye khod resid.",
    hebrew: "הבנק המרכזי של איראן הודיע שיעור האינפלציה השנתי הגיע ל-45%. ערך הריאל מול הדולר ירד לשפל היסטורי.",
    quiz: [{ q: "מה שיעור האינפלציה?", options: ["15%", "25%", "45%", "70%"], answer: 2 }],
  },
];

const cultureCards = [
  {
    id: 1, emoji: "🍵",
    title: "תרבות התה הפרסי", titlePersian: "فرهنگ چای ایرانی",
    persian: "در ایران، چای سمبل مهمان‌نوازی است. هر مهمانی با یک استکان چای شروع می‌شود.",
    transliteration: "Dar Iran, chai sambol-e mehmananvazi ast. Har mehmani ba yek estekan-e chai shoroo mishavad.",
    hebrew: "באיראן, תה הוא סמל האירוח. כל ביקור מתחיל בכוס תה.",
  },
  {
    id: 2, emoji: "🎊",
    title: "נוורוז - ראש השנה הפרסי", titlePersian: "نوروز - سال نو ایرانی",
    persian: "نوروز اول فروردین است و بزرگترین جشن ایرانی است. خانواده‌ها دور هم جمع می‌شوند.",
    transliteration: "Nowruz aval-e Farvardin ast va bozorgtarin jashn-e Irani ast. Khanevadeh-ha doore ham jam mishavand.",
    hebrew: "נוורוז הוא ה-1 בפרוורדין וחג הפרסי הגדול ביותר. משפחות מתאספות יחד.",
  },
  {
    id: 3, emoji: "🏛️",
    title: "נימוסים פרסיים", titlePersian: "ادب و نزاکت ایرانی",
    persian: "در ایران رسم تعارف خیلی مهم است. مردم معمولاً چند بار چیزی را رد می‌کنند قبل از قبول کردن.",
    transliteration: "Dar Iran rasm-e ta'arof khyli mohem ast. Mardom ma'mulan chand bar chizi ra rad mikonand ghabl az ghabol kardan.",
    hebrew: "באיראן מסורת הנימוס (תעארוף) חשובה מאוד. אנשים בדרך כלל מסרבים כמה פעמים לפני שמקבלים.",
  },
  {
    id: 4, emoji: "🕌",
    title: "אמנות ואדריכלות", titlePersian: "هنر و معماری ایرانی",
    persian: "معماری ایرانی با کاشی‌های آبی و فیروزه‌ای مشهور است. مسجد امام اصفهان یکی از زیباترین‌هاست.",
    transliteration: "Me'mari-ye Irani ba kashi-haye abi va firuzeh-ei mashhur ast. Masjed-e Imam-e Isfahan yeki az zibatarinha-st.",
    hebrew: "האדריכלות האיראנית מפורסמת בהוראות הכחולות והטורקיז. מסגד האימאם באספהאן הוא אחד היפים.",
  },
];

const scenarios = [
  { id: "bazaar",     label: "🛍️ בזאר",           labelPersian: "بازار"    },
  { id: "friend",     label: "👋 פגישה עם חבר",    labelPersian: "دوست"     },
  { id: "food",       label: "🍽️ הזמנת אוכל",     labelPersian: "غذا"      },
  { id: "directions", label: "🗺️ הוראות דרך",     labelPersian: "راهنمایی" },
];

const dialogues = {
  bazaar: [
    { role: "ai",          persian: "سلام! خوش آمدید به بازار. چه می‌خواهید؟", transliteration: "Salam! Khosh amadid be bazaar. Che mikhahid?",    hebrew: "שלום! ברוכים הבאים לבזאר. מה אתם רוצים?" },
    { role: "user_prompt", persian: "قیمت این چقدر است؟",                       transliteration: "Gheymat-e in cheghadar ast?",                   hebrew: "כמה עולה זה?" },
    { role: "ai",          persian: "این ده هزار تومان است. ارزان است!",         transliteration: "In dah hezar toman ast. Arzan ast!",             hebrew: "זה עשרת אלפים תומן. זה זול!" },
  ],
  friend: [
    { role: "ai",          persian: "سلام رفیق! حالت چطوره؟",                   transliteration: "Salam rafigh! Halat chetore?",                   hebrew: "היי חבר! מה שלומך?" },
    { role: "user_prompt", persian: "خوبم، ممنون. تو چی؟",                      transliteration: "Khubam, mamnoon. To chi?",                       hebrew: "בסדר, תודה. ואתה?" },
    { role: "ai",          persian: "منم خوبم. بریم قهوه بخوریم؟",              transliteration: "Manam khubam. Berim ghahve bokhorim?",           hebrew: "גם אני בסדר. נלך לשתות קפה?" },
  ],
  food: [
    { role: "ai",          persian: "بفرمایید! چه میل دارید؟",                  transliteration: "Befarmayid! Che meyl darid?",                    hebrew: "בבקשה! מה תרצו?" },
    { role: "user_prompt", persian: "یک چلو کباب لطفاً",                        transliteration: "Yek chelow kabab lotfan",                        hebrew: "צ'לו קבאב אחד בבקשה" },
    { role: "ai",          persian: "البته! نوشیدنی چی می‌خواید؟",              transliteration: "Albate! Nushidani chi mikhahid?",                hebrew: "כמובן! מה תרצו לשתות?" },
  ],
  directions: [
    { role: "ai",          persian: "ببخشید، می‌تونم کمک کنم؟",                 transliteration: "Bebakhshid, mitoonam komak konam?",              hebrew: "סליחה, אפשר לעזור?" },
    { role: "user_prompt", persian: "بله، کجا بازار است؟",                      transliteration: "Bale, koja bazaar ast?",                         hebrew: "כן, איפה הבזאר?" },
    { role: "ai",          persian: "مستقیم برو، سپس چپ بپیچ.",                 transliteration: "Mostaqim bero, seps chap bepeech.",              hebrew: "לך ישר, אחר כך פנה שמאלה." },
  ],
};

const wordOfDay = {
  persian: "دلتنگی",
  transliteration: "Deltangi",
  hebrew: "געגועים / כאב לב",
  example: "من دلتنگ ایران هستم",
  exampleHe: "אני מתגעגע לאיראן",
};

// ============================================================
// HELPERS
// ============================================================

function applySlang(text, mode) {
  if (mode !== "slang" || !text) return text;
  let result = text;
  Object.entries(slangMap).forEach(([formal, slang]) => {
    result = result.replaceAll(formal, slang);
  });
  return result;
}

function generateWhatsAppLink(newsTitle, newsTitleHe) {
  const message = encodeURIComponent(
    `🗞️ *ITS MOMKEN – שיתוף חדשות OSINT*\n\n` +
    `קראתי את הכתבה הפרסית:\n"${newsTitle}"\n(${newsTitleHe})\n\n` +
    `תרגמתי את זה ב-ITS MOMKEN — מה דעתך? 💬\nلطفاً نظر خود را بنویسید 🇮🇷`
  );
  return `https://wa.me/?text=${message}`;
}

// Levels definition
const LEVELS = [
  { label: "מתחיל",  emoji: "🌱", minXP: 0   },
  { label: "לומד",   emoji: "📚", minXP: 100 },
  { label: "שוטף",   emoji: "💬", minXP: 300 },
  { label: "מומחה",  emoji: "🏆", minXP: 600 },
];

function getLevel(xp) {
  return [...LEVELS].reverse().find(l => xp >= l.minXP) || LEVELS[0];
}

// ============================================================
// STYLES
// ============================================================

const injectStyles = () => {
  if (document.getElementById("momken-styles")) return;
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&family=Heebo:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,500&display=swap');

    :root {
      --turquoise: #00A591;
      --saffron: #F4C430;
      --indigo: #1F2A44;
      --charcoal: #2E2E2E;
      --sand: #F6F1E9;
      --sand-dark: #EDE5D8;
      --white: #FFFFFF;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Heebo', sans-serif;
      background: var(--sand);
      color: var(--charcoal);
      overscroll-behavior: none;
      -webkit-font-smoothing: antialiased;
    }

    .persian {
      font-family: 'Vazirmatn', sans-serif;
      direction: rtl;
    }

    .hebrew {
      font-family: 'Heebo', sans-serif;
      direction: rtl;
    }

    .app-shell {
      max-width: 430px;
      margin: 0 auto;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      background: var(--sand);
    }

    .app-shell::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image:
        radial-gradient(circle at 20% 20%, rgba(0,165,145,0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(244,196,48,0.05) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* ── Header ── */
    .header {
      background: var(--indigo);
      padding: 14px 18px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 20px rgba(31,42,68,0.35);
    }

    .header-logo {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--saffron);
      letter-spacing: -0.5px;
      line-height: 1;
    }

    .header-logo span { color: var(--turquoise); }

    .header-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 11px;
      border-radius: 20px;
      font-family: 'Heebo', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .header-badge-fire {
      background: rgba(244,196,48,0.15);
      border: 1px solid rgba(244,196,48,0.3);
      color: var(--saffron);
    }

    .header-badge-xp {
      background: rgba(0,165,145,0.15);
      border: 1px solid rgba(0,165,145,0.3);
      color: var(--turquoise);
    }

    /* ── Content ── */
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 18px 15px 88px;
      position: relative;
      z-index: 1;
    }

    /* ── Bottom Nav ── */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 430px;
      background: var(--indigo);
      display: flex;
      justify-content: space-around;
      padding: 9px 0 15px;
      z-index: 100;
      box-shadow: 0 -2px 20px rgba(31,42,68,0.3);
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 12px;
      transition: all 0.2s;
      color: rgba(255,255,255,0.35);
      font-family: 'Heebo', sans-serif;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.2px;
      border: none;
      background: none;
    }

    .nav-item.active { color: var(--turquoise); }
    .nav-item:hover:not(.active) { color: rgba(255,255,255,0.65); }
    .nav-icon { font-size: 19px; }

    /* ── Cards ── */
    .card {
      background: white;
      border-radius: 20px;
      padding: 18px;
      margin-bottom: 14px;
      box-shadow: 0 2px 14px rgba(31,42,68,0.07);
      border: 1px solid rgba(31,42,68,0.06);
    }

    .card-turquoise { background: linear-gradient(135deg, var(--turquoise), #007d6e); color: white; }
    .card-indigo    { background: linear-gradient(135deg, var(--indigo), #2a3a5c);    color: white; }
    .card-saffron   { background: linear-gradient(135deg, var(--saffron), #e8b020);   color: var(--charcoal); }

    /* ── Sentence Display ── */
    .sentence-persian {
      font-family: 'Vazirmatn', sans-serif;
      font-size: 21px;
      font-weight: 600;
      direction: rtl;
      text-align: right;
      line-height: 1.7;
      margin-bottom: 6px;
    }

    .sentence-translit {
      font-size: 13px;
      font-style: italic;
      color: rgba(0,0,0,0.45);
      margin-bottom: 5px;
    }

    .sentence-hebrew {
      font-family: 'Heebo', sans-serif;
      font-size: 15px;
      direction: rtl;
      text-align: right;
      color: var(--indigo);
      font-weight: 500;
    }

    /* ── Badges ── */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px;
      border-radius: 20px;
      font-family: 'Heebo', sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-turquoise { background: rgba(0,165,145,0.12); color: var(--turquoise); }
    .badge-saffron   { background: rgba(244,196,48,0.2);  color: #b88e10; }
    .badge-indigo    { background: rgba(31,42,68,0.1);    color: var(--indigo); }
    .badge-red       { background: rgba(220,50,50,0.1);   color: #dc3232; }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 11px 18px;
      border-radius: 13px;
      font-family: 'Heebo', sans-serif;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      width: 100%;
      letter-spacing: 0.2px;
    }

    .btn-primary { background: var(--turquoise); color: white; }
    .btn-primary:hover { background: #008a78; transform: translateY(-1px); }
    .btn-secondary { background: var(--indigo); color: white; }
    .btn-outline { background: transparent; border: 2px solid var(--turquoise); color: var(--turquoise); }
    .btn-show { background: rgba(31,42,68,0.06); color: var(--indigo); border: 1.5px dashed rgba(31,42,68,0.2); }
    .btn-show:hover { background: rgba(31,42,68,0.1); }

    /* ── Section Title ── */
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 19px;
      font-weight: 700;
      color: var(--indigo);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .motiv-text {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 12px;
      color: var(--turquoise);
    }

    /* ── Stats ── */
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 9px; margin-bottom: 14px; }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 13px 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(31,42,68,0.07);
    }

    .stat-val {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 700;
      color: var(--indigo);
      line-height: 1;
    }

    .stat-label {
      font-family: 'Heebo', sans-serif;
      font-size: 9px;
      color: rgba(0,0,0,0.38);
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    /* ── Flashcard ── */
    .flashcard-wrapper {
      perspective: 1000px;
      height: 210px;
      cursor: pointer;
      margin-bottom: 14px;
    }

    .flashcard-inner {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .flashcard-inner.flipped { transform: rotateY(180deg); }

    .flashcard-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .flashcard-front { background: linear-gradient(135deg, var(--indigo), #2a3a5c); }
    .flashcard-back  { background: linear-gradient(135deg, var(--turquoise), #007d6e); transform: rotateY(180deg); }

    /* ── Chat ── */
    .chat-container { display: flex; flex-direction: column; gap: 10px; }

    .chat-bubble {
      max-width: 86%;
      padding: 11px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
    }

    .chat-ai {
      background: white;
      border: 1px solid rgba(31,42,68,0.09);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .chat-user {
      background: var(--turquoise);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .chat-input-area { display: flex; gap: 8px; margin-top: 14px; }

    .chat-input {
      flex: 1;
      padding: 12px 14px;
      border-radius: 13px;
      border: 2px solid rgba(0,165,145,0.2);
      font-family: 'Vazirmatn', sans-serif;
      font-size: 14px;
      outline: none;
      background: white;
      transition: border-color 0.2s;
    }

    .chat-input:focus { border-color: var(--turquoise); }

    .chat-send {
      background: var(--turquoise);
      border: none;
      border-radius: 13px;
      width: 46px;
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      font-size: 17px;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .chat-send:hover { background: #008a78; }

    /* ── Toggle ── */
    .toggle-container {
      display: flex;
      background: rgba(31,42,68,0.06);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 14px;
    }

    .toggle-option {
      flex: 1;
      padding: 8px;
      border-radius: 9px;
      text-align: center;
      font-family: 'Heebo', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      background: none;
      color: rgba(0,0,0,0.38);
    }

    .toggle-option.active {
      background: var(--indigo);
      color: white;
      box-shadow: 0 2px 8px rgba(31,42,68,0.2);
    }

    /* ── Progress ── */
    .progress-bar-wrap {
      background: rgba(0,165,145,0.1);
      border-radius: 10px;
      height: 7px;
      overflow: hidden;
      margin-top: 5px;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--turquoise), var(--saffron));
      border-radius: 10px;
      transition: width 0.7s ease;
    }

    /* ── Keyboard ── */
    .keyboard-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 5px;
      margin-top: 10px;
    }

    .key-btn {
      background: white;
      border: 1px solid rgba(31,42,68,0.12);
      border-radius: 8px;
      padding: 9px 3px;
      font-family: 'Vazirmatn', sans-serif;
      font-size: 15px;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
      color: var(--charcoal);
    }

    .key-btn:hover  { background: var(--turquoise); color: white; border-color: var(--turquoise); }
    .key-btn:active { transform: scale(0.88); }

    .key-btn-unique {
      background: rgba(244,196,48,0.14);
      border-color: rgba(244,196,48,0.5);
      color: #9a7208;
      font-weight: 700;
    }

    .key-btn-unique:hover { background: var(--saffron); color: white; border-color: var(--saffron); }

    /* ── Chips ── */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 13px;
      border-radius: 20px;
      border: 2px solid rgba(0,165,145,0.2);
      font-family: 'Heebo', sans-serif;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
      color: var(--charcoal);
      white-space: nowrap;
    }

    .chip.active, .chip:hover { background: var(--turquoise); color: white; border-color: var(--turquoise); }
    .chips-wrap { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 14px; }

    /* ── News ── */
    .news-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 14px;
      box-shadow: 0 2px 14px rgba(31,42,68,0.07);
    }

    .news-header { background: linear-gradient(135deg, var(--indigo), #2a3a5c); padding: 13px 15px; }
    .news-body   { padding: 15px; }

    .quiz-opt {
      padding: 11px 15px;
      border-radius: 11px;
      border: 2px solid rgba(31,42,68,0.1);
      cursor: pointer;
      font-family: 'Heebo', sans-serif;
      font-size: 14px;
      margin-bottom: 7px;
      transition: all 0.2s;
      background: white;
      width: 100%;
      text-align: right;
    }

    .quiz-opt:hover  { border-color: var(--turquoise); color: var(--turquoise); }
    .quiz-opt.correct { background: rgba(0,165,145,0.08); border-color: var(--turquoise); color: var(--turquoise); }
    .quiz-opt.wrong   { background: rgba(220,50,50,0.08); border-color: #dc3232; color: #dc3232; }

    /* ── Misc ── */
    .ornament { text-align: center; color: rgba(0,165,145,0.28); font-size: 16px; letter-spacing: 8px; margin: 7px 0; }

    .tile-accent {
      height: 3px;
      background: repeating-linear-gradient(90deg,
        var(--turquoise) 0px, var(--turquoise) 8px,
        var(--saffron)   8px, var(--saffron)   16px,
        var(--indigo)    16px, var(--indigo)   24px);
      border-radius: 2px;
      margin-bottom: 18px;
    }

    .vocab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }

    .vocab-card {
      background: white;
      border-radius: 15px;
      padding: 14px 11px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(31,42,68,0.06);
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .vocab-card:hover  { border-color: var(--turquoise); transform: translateY(-2px); }
    .vocab-card.learned { border-color: rgba(0,165,145,0.3); background: rgba(0,165,145,0.04); }

    .xp-label { display: flex; justify-content: space-between; font-family: 'Heebo', sans-serif; font-size: 10px; color: rgba(0,0,0,0.38); margin-bottom: 3px; }

    .wa-btn {
      background: #25D366;
      color: white;
      border: none;
      border-radius: 13px;
      padding: 13px 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      font-family: 'Heebo', sans-serif;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      transition: all 0.2s;
    }

    .wa-btn:hover { background: #1da851; transform: translateY(-1px); }

    .achievement {
      display: flex;
      align-items: center;
      gap: 11px;
      background: white;
      border-radius: 15px;
      padding: 13px 15px;
      margin-bottom: 9px;
      box-shadow: 0 2px 8px rgba(31,42,68,0.06);
    }

    .achievement-icon {
      width: 42px; height: 42px;
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 21px;
      flex-shrink: 0;
    }

    /* ── Audio button ── */
    .audio-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 8px;
      font-family: 'Heebo', sans-serif;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
      border: 1.5px solid rgba(0,0,0,0.1);
      background: rgba(0,0,0,0.03);
      color: rgba(0,0,0,0.3);
      transition: all 0.2s;
      flex-shrink: 0;
      user-select: none;
      letter-spacing: 0.2px;
    }

    .audio-btn:hover   { border-color: var(--turquoise); color: var(--turquoise); background: rgba(0,165,145,0.06); }
    .audio-btn.playing { border-color: var(--turquoise); color: var(--turquoise); background: rgba(0,165,145,0.1); cursor: default; }

    /* ── Grammar callout ── */
    .grammar-callout {
      background: linear-gradient(135deg, rgba(31,42,68,0.03), rgba(0,165,145,0.05));
      border: 1px solid rgba(0,165,145,0.22);
      border-right: 4px solid var(--turquoise);
      border-radius: 16px;
      padding: 15px;
      margin-top: 8px;
      margin-bottom: 8px;
    }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0,165,145,0.3); }
      50%       { box-shadow: 0 0 0 8px rgba(0,165,145,0); }
    }

    @keyframes audioWave {
      0%, 100% { transform: scaleY(1);   opacity: 0.9; }
      50%       { transform: scaleY(1.5); opacity: 0.6; }
    }

    .fade-up   { animation: fadeUp 0.38s ease forwards; }
    .fade-up-1 { animation: fadeUp 0.38s 0.05s ease both; }
    .fade-up-2 { animation: fadeUp 0.38s 0.10s ease both; }
    .fade-up-3 { animation: fadeUp 0.38s 0.15s ease both; }
    .fade-up-4 { animation: fadeUp 0.38s 0.20s ease both; }
    .pulse-glow { animation: pulse-glow 2s infinite; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0,165,145,0.25); border-radius: 4px; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `;
  const style = document.createElement("style");
  style.id = "momken-styles";
  style.textContent = css;
  document.head.appendChild(style);
};

// ============================================================
// COMPONENTS
// ============================================================

// ── AudioButton ──────────────────────────────────────────────
function AudioButton({ text }) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (playing) return;
    setPlaying(true);

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "fa-IR";
      utt.rate = 0.88;
      utt.pitch = 1;
      utt.onend   = () => setPlaying(false);
      utt.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utt);
    } else {
      // Graceful fallback — visual feedback only
      setTimeout(() => setPlaying(false), 1600);
    }
  };

  return (
    <button
      className={`audio-btn ${playing ? "playing" : ""}`}
      onClick={handlePlay}
      title={playing ? "מנגן..." : "האזן לביטוי"}
    >
      {/* Inline Volume2 SVG */}
      <svg
        width="11" height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: playing ? "audioWave 0.7s ease-in-out infinite alternate" : "none" }}
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path
          d="M19.07 4.93a10 10 0 0 1 0 14.14"
          strokeOpacity={playing ? 0.55 : 0}
          style={{ transition: "stroke-opacity 0.3s" }}
        />
      </svg>
      {playing ? "מנגן..." : "האזן"}
    </button>
  );
}

// ── SentenceCard ─────────────────────────────────────────────
function SentenceCard({ persian, transliteration, hebrew, className = "" }) {
  return (
    <div className={`card ${className}`}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <p className="sentence-persian" style={{ flex: 1 }}>{persian}</p>
        <AudioButton text={persian} />
      </div>
      <p className="sentence-translit">{transliteration}</p>
      <div className="ornament">✦ ✦ ✦</div>
      <p className="sentence-hebrew">{hebrew}</p>
    </div>
  );
}

// ── Flashcard ─────────────────────────────────────────────────
function Flashcard({ word, onKnown, onReview }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div>
      <div className="flashcard-wrapper" onClick={() => setFlipped(f => !f)}>
        <div className={`flashcard-inner ${flipped ? "flipped" : ""}`}>
          <div className="flashcard-face flashcard-front">
            <span className="badge badge-saffron" style={{ marginBottom: 14 }}>לחץ לגלות</span>
            <div className="persian" style={{ fontSize: 34, fontWeight: 700, color: "white", textAlign: "center" }}>{word.persian}</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 7, color: "white", fontStyle: "italic" }}>{word.transliteration}</div>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "white", marginBottom: 14 }}>תרגום</span>
            <div className="hebrew" style={{ fontSize: 26, fontWeight: 700, color: "white", textAlign: "center" }}>{word.hebrew}</div>
            <div style={{ fontSize: 11, opacity: 0.65, marginTop: 7, color: "white" }}>{word.category}</div>
          </div>
        </div>
      </div>
      {flipped && (
        <div style={{ display: "flex", gap: 9 }}>
          <button
            className="btn"
            style={{ background: "rgba(220,50,50,0.09)", color: "#dc3232", border: "2px solid #dc3232" }}
            onClick={() => { setFlipped(false); onReview(); }}
          >😅 עוד פעם</button>
          <button className="btn btn-primary" onClick={() => { setFlipped(false); onKnown(); }}>✓ ידעתי!</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGES
// ============================================================

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard({ stats, setStats }) {
  const percent = Math.min(100, (stats.words / 50) * 100);
  const level = getLevel(stats.xp);

  return (
    <div>
      {/* Hero */}
      <div className="card card-indigo fade-up" style={{ textAlign: "center", padding: "26px 18px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.45, marginBottom: 7, fontFamily: "Heebo, sans-serif" }}>ברוך הבא ל</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#F4C430", marginBottom: 4 }}>
          ITS <span style={{ color: "#00A591" }}>MOMKEN</span>
        </div>
        <div style={{ fontSize: 12, opacity: 0.55, fontStyle: "italic", fontFamily: "Heebo, sans-serif" }}>ללמוד פרסית? ITS MOMKEN.</div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{level.emoji}</span>
          <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>רמה: {level.label}</span>
        </div>
      </div>

      <div className="tile-accent" />

      {/* Stats */}
      <div className="stats-grid fade-up-1">
        <div className="stat-card pulse-glow">
          <div className="stat-val">🔥{stats.streak}</div>
          <div className="stat-label">ימי רצף</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: "var(--turquoise)" }}>{stats.words}</div>
          <div className="stat-label">מילים</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: "#b88e10" }}>{stats.xp}</div>
          <div className="stat-label">נק׳ XP</div>
        </div>
      </div>

      {/* Progress */}
      <div className="card fade-up-2">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "Heebo, sans-serif" }}>התקדמות היומית</span>
          <span className="badge badge-turquoise">{Math.round(percent)}%</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="xp-label" style={{ marginTop: 5 }}>
          <span>{stats.words} מילים שנלמדו</span>
          <span>יעד: 50 מילים</span>
        </div>
      </div>

      {/* Word of Day */}
      <div className="section-title fade-up-3">✨ מילה היום</div>
      <div className="card card-turquoise fade-up-3">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.55, fontFamily: "Heebo, sans-serif" }}>WORD OF THE DAY</div>
          <AudioButton text={wordOfDay.persian} />
        </div>
        <div className="persian" style={{ fontSize: 34, fontWeight: 700, color: "white", textAlign: "right", marginBottom: 5 }}>{wordOfDay.persian}</div>
        <div style={{ fontSize: 13, fontStyle: "italic", opacity: 0.75, color: "white", marginBottom: 8 }}>{wordOfDay.transliteration}</div>
        <div className="hebrew" style={{ fontSize: 17, fontWeight: 700, color: "white", textAlign: "right", marginBottom: 11 }}>{wordOfDay.hebrew}</div>
        <div style={{ background: "rgba(255,255,255,0.13)", borderRadius: 11, padding: "9px 13px" }}>
          <div className="persian" style={{ fontSize: 13, color: "white", textAlign: "right", opacity: 0.9 }}>{wordOfDay.example}</div>
          <div className="hebrew" style={{ fontSize: 12, color: "white", textAlign: "right", opacity: 0.65, marginTop: 3 }}>{wordOfDay.exampleHe}</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="section-title fade-up-4">🏆 הישגים</div>
      {[
        { icon: "🔥", color: "rgba(244,100,48,0.1)",  label: "3 ימי רצף",       sublabel: "Consistency? ITS MOMKEN.",  unlocked: true  },
        { icon: "📚", color: "rgba(0,165,145,0.1)",   label: "12 מילים ראשונות", sublabel: "Vocabulary? ITS MOMKEN.",   unlocked: true  },
        { icon: "💬", color: "rgba(31,42,68,0.07)",   label: "שיחה ראשונה",      sublabel: "Conversation? ITS MOMKEN.", unlocked: false },
      ].map((a, i) => (
        <div className="achievement" key={i} style={{ opacity: a.unlocked ? 1 : 0.38 }}>
          <div className="achievement-icon" style={{ background: a.color }}>{a.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "Heebo, sans-serif" }}>{a.label}</div>
            <div className="motiv-text">{a.sublabel}</div>
          </div>
          {a.unlocked && <div style={{ marginLeft: "auto", color: "#F4C430", fontSize: 17 }}>★</div>}
        </div>
      ))}

      {/* WhatsApp */}
      <div style={{ marginTop: 6 }}>
        <button className="wa-btn" onClick={() => window.open("https://wa.me/", "_blank")}>
          <span style={{ fontSize: 19 }}>💬</span>
          הצטרף לקהילת ITS MOMKEN בוואטסאפ
        </button>
      </div>
    </div>
  );
}

// ── Chat ──────────────────────────────────────────────────────
function Chat({ stats, setStats }) {
  const [scenario, setScenario]       = useState("bazaar");
  const [mode, setMode]               = useState("formal");
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [dialogIdx, setDialogIdx]     = useState(0);
  const [grammarNote, setGrammarNote] = useState(null);
  const bottomRef = useRef();

  const persianKeys = [
    { char: "ا" }, { char: "ب" }, { char: "پ", unique: true }, { char: "ت" },
    { char: "ث" }, { char: "ج" }, { char: "چ", unique: true }, { char: "ح" },
    { char: "خ" }, { char: "د" }, { char: "ذ" }, { char: "ر" },
    { char: "ز" }, { char: "ژ", unique: true }, { char: "س" }, { char: "ش" },
    { char: "ص" }, { char: "ض" }, { char: "ط" }, { char: "ظ" },
    { char: "ع" }, { char: "غ" }, { char: "ف" }, { char: "ق" },
    { char: "ک" }, { char: "گ", unique: true }, { char: "ل" }, { char: "م" },
    { char: "ن" }, { char: "و" }, { char: "ه" }, { char: "ی" },
  ];

  useEffect(() => {
    const d = dialogues[scenario];
    if (d?.[0]?.role === "ai") {
      setMessages([{ ...d[0], id: Date.now() }]);
      setDialogIdx(1);
    }
    setGrammarNote(null);
  }, [scenario]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", persian: input, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const d = dialogues[scenario];
      const next = d[dialogIdx];
      if (!next) {
        setMessages(prev => [...prev, {
          role: "ai", id: Date.now() + 1,
          persian: "عالی! خیلی خوب صحبت کردید!",
          transliteration: "Ali! Khyli khob sohbat kardid!",
          hebrew: "מצוין! דיברת נהדר! 🎉",
        }]);
        setStats(s => ({ ...s, xp: s.xp + 10 }));
      } else if (next.role === "user_prompt") {
        const afterPrompt = d[dialogIdx + 1];
        if (afterPrompt) {
          setMessages(prev => [...prev, { ...afterPrompt, id: Date.now() + 1 }]);
          setDialogIdx(i => i + 2);
          setStats(s => ({ ...s, xp: s.xp + 5 }));
        }
      } else {
        setMessages(prev => [...prev, { ...next, id: Date.now() + 1 }]);
        setDialogIdx(i => i + 1);
        setStats(s => ({ ...s, xp: s.xp + 5 }));
      }
    }, 680);
  };

  const currentSuggestion = dialogues[scenario][dialogIdx]?.role === "user_prompt"
    ? dialogues[scenario][dialogIdx]
    : null;

  return (
    <div>
      <div className="section-title">💬 מדריך שיחה</div>

      {/* Formal / Slang toggle */}
      <div className="toggle-container">
        <button className={`toggle-option ${mode === "formal" ? "active" : ""}`} onClick={() => { setMode("formal"); setGrammarNote(null); }}>🎩 רשמי</button>
        <button className={`toggle-option ${mode === "slang"  ? "active" : ""}`} onClick={() => { setMode("slang");  setGrammarNote(null); }}>😎 סלנג</button>
      </div>

      {mode === "slang" && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(244,196,48,0.1)", border: "1px solid rgba(244,196,48,0.28)", borderRadius: 10, padding: "7px 11px", marginBottom: 12, fontSize: 12, color: "#9a7208", fontWeight: 700, fontFamily: "Heebo, sans-serif" }}>
          <span>😎</span> מצב סלנג פעיל — גרסה מדוברת
        </div>
      )}

      {/* Scenario chips */}
      <div className="chips-wrap">
        {scenarios.map(s => (
          <button key={s.id} className={`chip ${scenario === s.id ? "active" : ""}`} onClick={() => setScenario(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="card" style={{ minHeight: 260 }}>
        <div className="chat-container">
          {messages.map(m => (
            <div key={m.id} className={`chat-bubble ${m.role === "ai" ? "chat-ai" : "chat-user"}`}>
              {m.role === "ai" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 7, marginBottom: 4 }}>
                    <AudioButton text={applySlang(m.persian, mode)} />
                    <div className="persian" style={{ fontSize: 15, fontWeight: 600, textAlign: "right", flex: 1 }}>
                      {applySlang(m.persian, mode)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontStyle: "italic", color: "rgba(0,0,0,0.38)", marginBottom: 3 }}>
                    {applySlang(m.transliteration, mode)}
                  </div>
                  <div className="hebrew" style={{ fontSize: 13, color: "var(--indigo)", textAlign: "right" }}>
                    {m.hebrew}
                  </div>
                  {mode === "slang" && (
                    <div style={{ marginTop: 5, fontSize: 9, color: "#9a7208", background: "rgba(244,196,48,0.1)", borderRadius: 5, padding: "2px 6px", display: "inline-block", fontWeight: 700 }}>
                      😎 סלנג
                    </div>
                  )}
                </>
              )}
              {m.role === "user" && <div style={{ fontWeight: 600, fontFamily: "Vazirmatn, sans-serif" }}>{m.persian}</div>}
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Suggested phrase */}
      {currentSuggestion && (
        <div className="card" style={{ background: "rgba(0,165,145,0.05)", border: "1px dashed rgba(0,165,145,0.28)", marginTop: 4 }}>
          <div style={{ fontSize: 10, color: "var(--turquoise)", fontWeight: 700, marginBottom: 7, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Heebo, sans-serif" }}>
            💡 ביטוי מוצע
          </div>
          <div className="persian" style={{ textAlign: "right", fontSize: 15, fontWeight: 600, marginBottom: 3 }}>
            {applySlang(currentSuggestion.persian, mode)}
          </div>
          <div style={{ fontSize: 11, fontStyle: "italic", color: "rgba(0,0,0,0.38)" }}>
            {applySlang(currentSuggestion.transliteration, mode)}
          </div>
          <div className="hebrew" style={{ fontSize: 13, color: "var(--indigo)", textAlign: "right", marginTop: 3 }}>
            {currentSuggestion.hebrew}
          </div>
          <button
            className="btn btn-outline"
            style={{ marginTop: 11 }}
            onClick={() => {
              setInput(applySlang(currentSuggestion.persian, mode));
              setGrammarNote(grammarNotes[scenario] || null);
            }}
          >
            השתמש בביטוי זה
          </button>
        </div>
      )}

      {/* Grammar tutor callout */}
      {grammarNote && (
        <div className="grammar-callout fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--indigo)", flex: 1, lineHeight: 1.4, fontFamily: "Heebo, sans-serif" }}>
              {grammarNote.title}
            </div>
            <button
              onClick={() => setGrammarNote(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.22)", fontSize: 15, lineHeight: 1, padding: "0 0 0 7px", flexShrink: 0 }}
            >✕</button>
          </div>
          <div className="hebrew" style={{ fontSize: 13, direction: "rtl", textAlign: "right", lineHeight: 1.85, color: "var(--charcoal)", whiteSpace: "pre-line" }}>
            {grammarNote.body}
          </div>
          <div style={{ marginTop: 9, display: "flex", justifyContent: "flex-end" }}>
            <span className="badge badge-turquoise">📚 הערת מורה</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area" style={{ marginTop: 11 }}>
        <input
          className="chat-input persian"
          style={{ direction: "rtl", textAlign: "right" }}
          placeholder="כתוב פרסית..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button className="chat-send" onClick={sendMessage}>➤</button>
      </div>

      {/* Virtual keyboard */}
      <div className="card" style={{ marginTop: 11 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontFamily: "Heebo, sans-serif" }}>
          ⌨️ לוח מקשים פרסי
        </div>
        <div style={{ fontSize: 9, marginBottom: 9 }}>
          <span style={{ background: "rgba(244,196,48,0.16)", color: "#9a7208", borderRadius: 4, padding: "2px 6px", fontWeight: 700, border: "1px solid rgba(244,196,48,0.38)", fontFamily: "Heebo, sans-serif" }}>
            ★ צהוב = ייחודי לפרסית, לא קיים בערבית
          </span>
        </div>
        <div className="keyboard-grid">
          {persianKeys.slice(0, 16).map(k => (
            <button
              key={k.char}
              className={`key-btn ${k.unique ? "key-btn-unique" : ""}`}
              onClick={() => setInput(i => i + k.char)}
              title={k.unique ? "אות ייחודית לפרסית" : k.char}
            >
              {k.char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Vocabulary ────────────────────────────────────────────────
function Vocabulary({ stats, setStats }) {
  const [view, setView]       = useState("grid");
  const [flashIdx, setFlashIdx] = useState(0);
  const [learned, setLearned] = useState(new Set());
  const [filter, setFilter]   = useState("all");

  const categories = ["all", ...new Set(vocabulary.map(v => v.category))];
  const filtered   = filter === "all" ? vocabulary : vocabulary.filter(v => v.category === filter);

  const handleKnown = () => {
    const word = vocabulary[flashIdx];
    if (!learned.has(word.id)) {
      setLearned(s => new Set([...s, word.id]));
      setStats(s => ({ ...s, words: s.words + 1, xp: s.xp + word.xp }));
    }
    setFlashIdx(i => (i + 1) % vocabulary.length);
  };

  return (
    <div>
      <div className="section-title">📖 מעבדת מילים</div>

      <div className="toggle-container">
        <button className={`toggle-option ${view === "grid"  ? "active" : ""}`} onClick={() => setView("grid")}>🔲 גריד</button>
        <button className={`toggle-option ${view === "flash" ? "active" : ""}`} onClick={() => setView("flash")}>🃏 פלאשכרטות</button>
      </div>

      {view === "flash" && (
        <>
          <div className="card" style={{ background: "rgba(0,165,145,0.06)", textAlign: "center", marginBottom: 11, padding: "11px 14px" }}>
            <span className="badge badge-turquoise">{flashIdx + 1} / {vocabulary.length}</span>
            <span style={{ fontSize: 12, color: "rgba(0,0,0,0.38)", marginRight: 9, fontFamily: "Heebo, sans-serif" }}>לחץ על הכרטיס לתרגום</span>
          </div>
          <Flashcard
            word={vocabulary[flashIdx]}
            onKnown={handleKnown}
            onReview={() => setFlashIdx(i => (i + 1) % vocabulary.length)}
          />
        </>
      )}

      {view === "grid" && (
        <>
          <div style={{ display: "flex", gap: 7, overflowX: "auto", marginBottom: 14, paddingBottom: 3 }} className="scrollbar-hide">
            {categories.map(c => (
              <button key={c} className={`chip ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>
                {c === "all" ? "🌟 הכל" : c}
              </button>
            ))}
          </div>
          <div className="vocab-grid">
            {filtered.map(w => (
              <div key={w.id} className={`vocab-card ${learned.has(w.id) ? "learned" : ""}`}>
                {learned.has(w.id) && (
                  <span style={{ fontSize: 9, color: "var(--turquoise)", fontWeight: 700, fontFamily: "Heebo, sans-serif" }}>✓ למדת</span>
                )}
                <div className="persian" style={{ fontSize: 22, fontWeight: 700, color: "var(--indigo)", marginBottom: 3, textAlign: "center" }}>{w.persian}</div>
                <div style={{ fontSize: 10, fontStyle: "italic", color: "rgba(0,0,0,0.38)", marginBottom: 3 }}>{w.transliteration}</div>
                <div className="hebrew" style={{ fontSize: 12, fontWeight: 700, color: "var(--turquoise)", textAlign: "center" }}>{w.hebrew}</div>
                <div style={{ marginTop: 7 }} className="badge badge-indigo">{w.category}</div>
              </div>
            ))}
          </div>

          {/* Cognates panel */}
          <div className="card card-saffron" style={{ marginTop: 14, textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, fontFamily: "Heebo, sans-serif" }}>קוגנאטים: מילים משותפות</div>
            <div style={{ fontSize: 11, opacity: 0.65, fontFamily: "Heebo, sans-serif" }}>עברית, ערבית ופרסית חולקות שורשים משותפים!</div>
            <div style={{ marginTop: 9, display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap" }}>
              {[["שלום","سلام"],["ספר","کتاب"],["מים","آب"],["זמן","زمان"]].map(([he, fa]) => (
                <div key={he} style={{ background: "rgba(255,255,255,0.55)", borderRadius: 9, padding: "5px 9px", fontSize: 11, fontWeight: 600 }}>
                  <span style={{ fontFamily: "Heebo, sans-serif" }}>{he}</span>
                  {" ↔ "}
                  <span style={{ fontFamily: "Vazirmatn, sans-serif", direction: "rtl" }}>{fa}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Culture ───────────────────────────────────────────────────
function Culture() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div className="section-title">🕌 מרכז תרבות</div>
      <div className="card" style={{ background: "linear-gradient(135deg, var(--saffron), #e8b020)", marginBottom: 14, textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(0,0,0,0.45)", marginBottom: 5, fontFamily: "Heebo, sans-serif" }}>CULTURE HUB</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "var(--indigo)" }}>הבן את איראן מהצד השני</div>
        <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", marginTop: 3, fontStyle: "italic", fontFamily: "Heebo, sans-serif" }}>Cultural literacy? ITS MOMKEN.</div>
      </div>

      {cultureCards.map((card, i) => (
        <div key={card.id} className="card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }} onClick={() => setExpanded(expanded === card.id ? null : card.id)}>
            <div style={{ width: 48, height: 48, borderRadius: 15, background: "rgba(0,165,145,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
              {card.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, fontFamily: "Heebo, sans-serif" }}>{card.title}</div>
              <div className="persian" style={{ fontSize: 12, color: "var(--turquoise)", textAlign: "right" }}>{card.titlePersian}</div>
            </div>
            <div style={{ color: "rgba(0,0,0,0.25)", fontSize: 16, flexShrink: 0 }}>{expanded === card.id ? "▲" : "▼"}</div>
          </div>

          {expanded === card.id && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 7 }}>
                <AudioButton text={card.persian} />
              </div>
              <div className="persian" style={{ fontSize: 15, fontWeight: 500, direction: "rtl", textAlign: "right", lineHeight: 1.8, marginBottom: 9, color: "var(--charcoal)" }}>
                {card.persian}
              </div>
              <div style={{ fontSize: 12, fontStyle: "italic", color: "rgba(0,0,0,0.38)", marginBottom: 7 }}>{card.transliteration}</div>
              <div style={{ height: 1, background: "rgba(0,165,145,0.13)", margin: "9px 0" }} />
              <div className="hebrew" style={{ fontSize: 13, direction: "rtl", textAlign: "right", color: "var(--indigo)", fontWeight: 500, lineHeight: 1.7 }}>
                {card.hebrew}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── News ──────────────────────────────────────────────────────
function News({ stats, setStats }) {
  const [quizState, setQuizState]   = useState({});
  const [sharedIds, setSharedIds]   = useState(new Set());
  const [revealed, setRevealed]     = useState(new Set());   // tracks which cards have shown translation

  const toggleReveal = (id) => setRevealed(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleAnswer = (newsId, optIdx, correctIdx) => {
    if (quizState[newsId]) return;
    const correct = optIdx === correctIdx;
    setQuizState(s => ({ ...s, [newsId]: { selected: optIdx, correct } }));
    if (correct) setStats(s => ({ ...s, xp: s.xp + 15 }));
  };

  return (
    <div>
      <div className="section-title">📰 חדשות & OSINT</div>

      {/* Hero banner */}
      <div className="card" style={{ background: "linear-gradient(135deg, #1F2A44, #2a3a5c)", marginBottom: 14, textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.38, color: "white", marginBottom: 5, fontFamily: "Heebo, sans-serif" }}>OSINT MODE</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "white", fontWeight: 700 }}>קרא חדשות פרסיות אמיתיות</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 3, fontStyle: "italic", fontFamily: "Heebo, sans-serif" }}>
          Reading Iranian news? ITS MOMKEN.
        </div>
        <div style={{ marginTop: 10, background: "rgba(244,196,48,0.12)", border: "1px solid rgba(244,196,48,0.25)", borderRadius: 9, padding: "7px 11px", fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: "Heebo, sans-serif" }}>
          📖 קרא את הפרסית קודם — לחץ "הצג תרגום" כשאתה מוכן
        </div>
      </div>

      {mockNews.map((n, i) => {
        const isRevealed = revealed.has(n.id);
        return (
          <div className="news-card fade-up" key={n.id} style={{ animationDelay: `${i * 0.07}s` }}>
            {/* Card header */}
            <div className="news-header">
              <span className="badge" style={{ background: "rgba(244,196,48,0.2)", color: "#F4C430", marginBottom: 7, display: "inline-flex" }}>
                🗞️ חדשות OSINT
              </span>

              {/* Persian headline + audio */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 7 }}>
                <AudioButton text={n.title} />
                <div className="persian" style={{ fontSize: 15, fontWeight: 700, color: "white", textAlign: "right", direction: "rtl", lineHeight: 1.5, flex: 1 }}>
                  {n.title}
                </div>
              </div>

              {/* Hebrew headline — always visible for orientation */}
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4, fontFamily: "Heebo, sans-serif" }}>
                {n.titleHebrew}
              </div>
            </div>

            {/* Card body */}
            <div className="news-body">
              {/* Persian body text + audio — always visible */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 7, marginBottom: 7 }}>
                <AudioButton text={n.persian} />
                <div className="persian" style={{ fontSize: 14, fontWeight: 500, direction: "rtl", textAlign: "right", lineHeight: 1.85, flex: 1 }}>
                  {n.persian}
                </div>
              </div>

              {/* Hidden translation — revealed on demand */}
              {!isRevealed ? (
                <button
                  className="btn btn-show"
                  style={{ marginBottom: 14 }}
                  onClick={() => toggleReveal(n.id)}
                >
                  👁️ הצג תרגום — مشاهده ترجمه
                </button>
              ) : (
                <div className="fade-up" style={{ marginBottom: 14 }}>
                  <div style={{ height: 1, background: "rgba(0,0,0,0.06)", marginBottom: 9 }} />
                  <div style={{ fontSize: 11, fontStyle: "italic", color: "rgba(0,0,0,0.35)", marginBottom: 7 }}>
                    {n.transliteration}
                  </div>
                  <div className="hebrew" style={{ fontSize: 13, direction: "rtl", textAlign: "right", color: "var(--indigo)", fontWeight: 600, lineHeight: 1.75 }}>
                    {n.hebrew}
                  </div>
                  <button
                    style={{ background: "none", border: "none", fontSize: 10, color: "rgba(0,0,0,0.25)", cursor: "pointer", marginTop: 5, fontFamily: "Heebo, sans-serif" }}
                    onClick={() => toggleReveal(n.id)}
                  >
                    הסתר תרגום ↑
                  </button>
                </div>
              )}

              {/* Quiz */}
              {!quizState[n.id] ? (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 9, color: "var(--indigo)", fontFamily: "Heebo, sans-serif" }}>🧠 בחן את הבנתך</div>
                  <div className="hebrew" style={{ fontSize: 13, direction: "rtl", textAlign: "right", marginBottom: 9, fontWeight: 700 }}>
                    {n.quiz[0].q}
                  </div>
                  {n.quiz[0].options.map((opt, j) => (
                    <button key={j} className="quiz-opt" onClick={() => handleAnswer(n.id, j, n.quiz[0].answer)}>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "11px", background: quizState[n.id].correct ? "rgba(0,165,145,0.08)" : "rgba(220,50,50,0.08)", borderRadius: 11 }}>
                  <div style={{ fontSize: 22, marginBottom: 5 }}>{quizState[n.id].correct ? "🎉" : "😅"}</div>
                  <div style={{ fontWeight: 700, color: quizState[n.id].correct ? "var(--turquoise)" : "#dc3232", fontSize: 13, fontFamily: "Heebo, sans-serif" }}>
                    {quizState[n.id].correct ? "נכון! +15 XP — Reading Persian? ITS MOMKEN." : "לא נכון. קרא שוב ונסה!"}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "13px 0 11px" }} />

              {/* WhatsApp share */}
              <a
                href={generateWhatsAppLink(n.title, n.titleHebrew)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSharedIds(prev => new Set([...prev, n.id]))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  background: sharedIds.has(n.id) ? "rgba(37,211,102,0.16)" : "rgba(37,211,102,0.07)",
                  border: `1.5px solid ${sharedIds.has(n.id) ? "rgba(37,211,102,0.45)" : "rgba(37,211,102,0.22)"}`,
                  borderRadius: 11,
                  padding: "10px 14px",
                  color: "#128C7E",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s",
                  fontFamily: "Heebo, sans-serif",
                }}
              >
                <span style={{ fontSize: 15 }}>💬</span>
                {sharedIds.has(n.id) ? "✓ שותף לקהילת ITS MOMKEN" : "שתף עם בוט הקהילה — ITS MOMKEN"}
              </a>

              {sharedIds.has(n.id) && (
                <div style={{ marginTop: 6, fontSize: 10, color: "rgba(0,0,0,0.3)", textAlign: "center", fontStyle: "italic", fontFamily: "Heebo, sans-serif" }}>
                  הקישור נפתח בוואטסאפ עם הכתבה מוכנה לשיתוף 🇮🇷
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Progress ──────────────────────────────────────────────────
function Progress({ stats, setStats }) {
  const level   = getLevel(stats.xp);
  const nextLev = LEVELS[LEVELS.indexOf(level) + 1];
  const xpToNext = nextLev ? nextLev.minXP - stats.xp : 0;
  const xpPct    = nextLev
    ? Math.round(((stats.xp - level.minXP) / (nextLev.minXP - level.minXP)) * 100)
    : 100;

  const handleReset = () => {
    const fresh = { streak: 0, words: 0, xp: 0 };
    setStats(fresh);
    try { localStorage.setItem("momken_stats", JSON.stringify(fresh)); } catch {}
  };

  return (
    <div>
      <div className="section-title">📊 ההתקדמות שלי</div>

      {/* Level card */}
      <div className="card card-turquoise" style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 44 }}>{level.emoji}</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "white", marginTop: 7 }}>{level.label}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 3, fontFamily: "Heebo, sans-serif" }}>Fluency? ITS MOMKEN.</div>
        {nextLev && (
          <div style={{ marginTop: 13 }}>
            <div className="xp-label" style={{ color: "rgba(255,255,255,0.55)" }}>
              <span>רמה נוכחית: {level.label}</span>
              <span>{xpToNext} XP לרמה הבאה: {nextLev.label}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, height: 7, overflow: "hidden", marginTop: 4 }}>
              <div style={{ height: "100%", background: "white", borderRadius: 10, width: `${xpPct}%`, transition: "width 0.7s ease" }} />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon: "🔥", val: stats.streak, label: "ימי רצף"    },
          { icon: "📖", val: stats.words,  label: "מילים שנלמדו" },
          { icon: "⭐", val: stats.xp,     label: "נקודות XP"  },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ fontSize: 19 }}>{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="section-title" style={{ marginTop: 6 }}>🗺️ מפת דרכים</div>
      {LEVELS.map((m, i) => {
        const unlocked = stats.words >= m.minXP / 5; // rough word-based unlock
        return (
          <div className="achievement" key={i} style={{ opacity: unlocked ? 1 : 0.35 }}>
            <div className="achievement-icon" style={{ background: unlocked ? "rgba(0,165,145,0.11)" : "rgba(0,0,0,0.05)", fontSize: 22 }}>
              {m.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontFamily: "Heebo, sans-serif", fontSize: 13 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", fontFamily: "Heebo, sans-serif" }}>
                נדרש: {m.minXP} XP
              </div>
              <div className="progress-bar-wrap" style={{ marginTop: 5 }}>
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, (stats.xp / Math.max(m.minXP, 1)) * 100)}%` }} />
              </div>
            </div>
            {unlocked && <div style={{ color: "#F4C430", fontSize: 18, marginLeft: 7 }}>★</div>}
          </div>
        );
      })}

      {/* Reset */}
      <div className="card" style={{ textAlign: "center", marginTop: 7, background: "rgba(220,50,50,0.03)", border: "1px dashed rgba(220,50,50,0.18)" }}>
        <div style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", marginBottom: 7, fontFamily: "Heebo, sans-serif" }}>לאפס את ההתקדמות</div>
        <button
          className="btn"
          style={{ background: "rgba(220,50,50,0.07)", color: "#dc3232", border: "1px solid rgba(220,50,50,0.18)" }}
          onClick={handleReset}
        >
          🔄 התחל מחדש
        </button>
      </div>
    </div>
  );
}

// ============================================================
// NAV
// ============================================================

const navItems = [
  { id: "dashboard", label: "בית",    icon: "🏠" },
  { id: "chat",      label: "שיחה",   icon: "💬" },
  { id: "vocab",     label: "מילים",  icon: "📖" },
  { id: "culture",   label: "תרבות",  icon: "🕌" },
  { id: "news",      label: "חדשות",  icon: "📰" },
];

// ============================================================
// APP ROOT
// ============================================================

export default function App() {
  const [page, setPage] = useState("dashboard");

  // Persistent stats — XP, Streak, Words, Level all survive refresh
  const [stats, setStats] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("momken_stats"));
      return saved && typeof saved.xp === "number"
        ? saved
        : { streak: 3, words: 12, xp: 75 };
    } catch {
      return { streak: 3, words: 12, xp: 75 };
    }
  });

  useEffect(() => { injectStyles(); }, []);

  // Persist every stats change
  useEffect(() => {
    try { localStorage.setItem("momken_stats", JSON.stringify(stats)); } catch {}
  }, [stats]);

  const pages = {
    dashboard: Dashboard,
    chat:      Chat,
    vocab:     Vocabulary,
    culture:   Culture,
    news:      News,
    progress:  Progress,
  };
  const PageComp = pages[page] || Dashboard;

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="header">
        <div className="header-logo">ITS <span>MOMKEN</span></div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="header-badge header-badge-fire">
            🔥 {stats.streak}
          </button>
          <button
            className="header-badge header-badge-xp"
            onClick={() => setPage("progress")}
          >
            ⭐ {stats.xp} XP
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="content">
        <PageComp stats={stats} setStats={setStats} />
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map(n => (
          <button
            key={n.id}
            className={`nav-item ${page === n.id ? "active" : ""}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
