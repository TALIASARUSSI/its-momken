import { useState, useEffect, useRef } from "react";

// ============================================================
// DATA
// ============================================================

const vocabulary = [
  { id: 1, persian: "سلام", transliteration: "Salam", hebrew: "שלום", category: "ברכות", xp: 10 },
  { id: 2, persian: "ممنون", transliteration: "Mamnoon", hebrew: "תודה", category: "ברכות", xp: 10 },
  { id: 3, persian: "خداحافظ", transliteration: "Khodahafez", hebrew: "להתראות", category: "ברכות", xp: 10 },
  { id: 4, persian: "لطفاً", transliteration: "Lotfan", hebrew: "בבקשה", category: "ברכות", xp: 10 },
  { id: 5, persian: "بله", transliteration: "Bale", hebrew: "כן", category: "בסיסי", xp: 5 },
  { id: 6, persian: "نه", transliteration: "Na", hebrew: "לא", category: "בסיסי", xp: 5 },
  { id: 7, persian: "آب", transliteration: "Ab", hebrew: "מים", category: "אוכל", xp: 8 },
  { id: 8, persian: "نان", transliteration: "Nan", hebrew: "לחם", category: "אוכל", xp: 8 },
  { id: 9, persian: "چای", transliteration: "Chai", hebrew: "תה", category: "אוכל", xp: 8 },
  { id: 10, persian: "بازار", transliteration: "Bazaar", hebrew: "שוק", category: "מקומות", xp: 12 },
  { id: 11, persian: "خانه", transliteration: "Khaneh", hebrew: "בית", category: "מקומות", xp: 8 },
  { id: 12, persian: "کتاب", transliteration: "Ketab", hebrew: "ספר", category: "חפצים", xp: 8 },
];

const mockNews = [
  {
    id: 1,
    title: "ایران و مذاکرات هسته‌ای",
    titleHebrew: "איראן ומשא ומתן גרעיני",
    persian: "مذاکرات هسته‌ای ایران با قدرت‌های جهانی در وین ادامه دارد.",
    transliteration: "Mozakerat-e hasteh-ei Iran ba ghodrat-haye jahani dar Vin edameh darad.",
    hebrew: "שיחות הגרעין של איראן עם המעצמות העולמיות בווינה נמשכות.",
    quiz: [
      { q: "על מה המשא ומתן?", options: ["גרעין", "נפט", "ספורט", "תרבות"], answer: 0 },
    ],
  },
  {
    id: 2,
    title: "اقتصاد ایران در سال جدید",
    titleHebrew: "כלכלת איראן בשנה החדשה",
    persian: "دولت ایران برنامه‌های جدیدی برای بهبود اقتصاد کشور اعلام کرد.",
    transliteration: "Dolat-e Iran barname-haye jadidi baraye behbood-e eqtesad-e keshvar e'lam kard.",
    hebrew: "ממשלת איראן הכריזה על תוכניות חדשות לשיפור כלכלת המדינה.",
    quiz: [
      { q: "מה הממשלה הכריזה?", options: ["מלחמה", "תוכניות כלכליות", "בחירות", "חגים"], answer: 1 },
    ],
  },
  {
    id: 3,
    title: "جشن نوروز در ایران",
    titleHebrew: "חגיגות נוורוז באיראן",
    persian: "مردم ایران با شادی و سور نوروز را جشن گرفتند.",
    transliteration: "Mardom-e Iran ba shadi va sor Nowruz ra jash gereftand.",
    hebrew: "אנשי איראן חגגו את נוורוז בשמחה ובציונים.",
    quiz: [
      { q: "מה נחגג?", options: ["עצמאות", "נוורוז", "חתונה", "ניצחון"], answer: 1 },
    ],
  },
];

const cultureCards = [
  {
    id: 1,
    emoji: "🍵",
    title: "תרבות התה הפרסי",
    titlePersian: "فرهنگ چای ایرانی",
    persian: "در ایران، چای سمبل مهمان‌نوازی است. هر مهمانی با یک استکان چای شروع می‌شود.",
    transliteration: "Dar Iran, chai sambol-e mehmananvazi ast. Har mehmani ba yek estekan-e chai shoroo mishavad.",
    hebrew: "באיראן, תה הוא סמל האירוח. כל ביקור מתחיל בכוס תה.",
  },
  {
    id: 2,
    emoji: "🎊",
    title: "נוורוז - ראש השנה הפרסי",
    titlePersian: "نوروز - سال نو ایرانی",
    persian: "نوروز اول فروردین است و بزرگترین جشن ایرانی است. خانواده‌ها دور هم جمع می‌شوند.",
    transliteration: "Nowruz aval-e Farvardin ast va bozorgтарын jashn-e Irani ast. Khanevadeh-ha doore ham jam mishavand.",
    hebrew: "נוורוז הוא ה-1 בפרוורדין וחג הפרסי הגדול ביותר. משפחות מתאספות יחד.",
  },
  {
    id: 3,
    emoji: "🏛️",
    title: "נימוסים פרסיים",
    titlePersian: "ادب و نزاکت ایرانی",
    persian: "در ایران رسم تعارف خیلی مهم است. مردم معمولاً چند بار چیزی را رد می‌کنند قبل از قبول کردن.",
    transliteration: "Dar Iran rasm-e ta'arof khyli mohem ast. Mardom ma'mulan chand bar chizi ra rad mikonand ghabl az ghabol kardan.",
    hebrew: "באיראן מסורת הנימוס (תעארוף) חשובה מאוד. אנשים בדרך כלל מסרבים כמה פעמים לפני שמקבלים.",
  },
  {
    id: 4,
    emoji: "🕌",
    title: "אמנות ואדריכלות",
    titlePersian: "هنر و معماری ایرانی",
    persian: "معماری ایرانی با کاشی‌های آبی و فیروزه‌ای مشهور است. مسجد امام اصفهان یکی از زیباترین‌هاست.",
    transliteration: "Me'mari-ye Irani ba kashi-haye abi va firuzeh-ei mashhur ast. Masjed-e Imam-e Isfahan yeki az zibatarinha-st.",
    hebrew: "האדריכלות האיראנית מפורסמת בהוראות הכחולות והטורקיז. מסגד האימאם באספהאן הוא אחד היפים.",
  },
];

const scenarios = [
  { id: "bazaar", label: "🛍️ בזאר", labelPersian: "بازار" },
  { id: "friend", label: "👋 פגישה עם חבר", labelPersian: "دوست" },
  { id: "food", label: "🍽️ הזמנת אוכל", labelPersian: "غذا" },
  { id: "directions", label: "🗺️ הוראות דרך", labelPersian: "راهنمایی" },
];

const dialogues = {
  bazaar: [
    { role: "ai", persian: "سلام! خوش آمدید به بازار. چه می‌خواهید؟", transliteration: "Salam! Khosh amadid be bazaar. Che mikhahid?", hebrew: "שלום! ברוכים הבאים לבזאר. מה אתם רוצים?" },
    { role: "user_prompt", persian: "قیمت این چقدر است؟", transliteration: "Gheymat-e in cheghadar ast?", hebrew: "כמה עולה זה?" },
    { role: "ai", persian: "این ده هزار تومان است. ارزان است!", transliteration: "In dah hezar toman ast. Arzan ast!", hebrew: "זה עשרת אלפים תומן. זה זול!" },
  ],
  friend: [
    { role: "ai", persian: "سلام رفیق! حالت چطوره؟", transliteration: "Salam rafigh! Halat chetore?", hebrew: "היי חבר! מה שלומך?" },
    { role: "user_prompt", persian: "خوبم، ممنون. تو چی؟", transliteration: "Khubam, mamnoon. To chi?", hebrew: "בסדר, תודה. ואתה?" },
    { role: "ai", persian: "منم خوبم. بریم قهوه بخوریم؟", transliteration: "Manam khubam. Berim ghahve bokhorim?", hebrew: "גם אני בסדר. נלך לשתות קפה?" },
  ],
  food: [
    { role: "ai", persian: "بفرمایید! چه میل دارید؟", transliteration: "Befarmayid! Che meyl darid?", hebrew: "בבקשה! מה תרצו?" },
    { role: "user_prompt", persian: "یک چلو کباب لطفاً", transliteration: "Yek chelow kabab lotfan", hebrew: "צ'לו קבאב אחד בבקשה" },
    { role: "ai", persian: "البته! نوشیدنی چی می‌خواید؟", transliteration: "Albate! Nushidani chi mikhahid?", hebrew: "כמובן! מה תרצו לשתות?" },
  ],
  directions: [
    { role: "ai", persian: "ببخشید، می‌تونم کمک کنم؟", transliteration: "Bebakhshid, mitoonam komak konam?", hebrew: "סליחה, אפשר לעזור?" },
    { role: "user_prompt", persian: "بله، کجا بازار است؟", transliteration: "Bale, koja bazaar ast?", hebrew: "כן, איפה הבזאר?" },
    { role: "ai", persian: "مستقیم برو، سپس چپ بپیچ.", transliteration: "Mostaqim bero, seps chap bepeech.", hebrew: "לך ישר, אחר כך פנה שמאלה." },
  ],
};

const wordOfDay = { persian: "دلتنگی", transliteration: "Deltangi", hebrew: "געגועים / כאב לב", example: "من دلتنگ ایران هستم", exampleHe: "אני מתגעגע לאיראן" };

// ============================================================
// STYLES (injected)
// ============================================================

const injectStyles = () => {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

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
      font-family: 'DM Sans', sans-serif;
      background: var(--sand);
      color: var(--charcoal);
      overscroll-behavior: none;
    }

    .persian { font-family: 'Vazirmatn', sans-serif; direction: rtl; }

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

    /* Persian tile pattern background overlay */
    .app-shell::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 20%, rgba(0,165,145,0.04) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(244,196,48,0.04) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    .header {
      background: var(--indigo);
      padding: 16px 20px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 20px rgba(31,42,68,0.3);
    }

    .header-logo {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--saffron);
      letter-spacing: -0.5px;
    }

    .header-logo span { color: var(--turquoise); }

    .header-streak {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(244,196,48,0.15);
      border: 1px solid rgba(244,196,48,0.3);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      color: var(--saffron);
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px 90px;
      position: relative;
      z-index: 1;
    }

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
      padding: 10px 0 16px;
      z-index: 100;
      box-shadow: 0 -2px 20px rgba(31,42,68,0.3);
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 12px;
      transition: all 0.2s;
      color: rgba(255,255,255,0.4);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.2px;
      border: none;
      background: none;
    }

    .nav-item.active { color: var(--turquoise); }
    .nav-item:hover { color: rgba(255,255,255,0.7); }

    .nav-icon { font-size: 20px; }

    /* Cards */
    .card {
      background: white;
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 12px rgba(31,42,68,0.08);
      border: 1px solid rgba(31,42,68,0.06);
    }

    .card-turquoise {
      background: linear-gradient(135deg, var(--turquoise), #007d6e);
      color: white;
    }

    .card-indigo {
      background: linear-gradient(135deg, var(--indigo), #2a3a5c);
      color: white;
    }

    .card-saffron {
      background: linear-gradient(135deg, var(--saffron), #e8b020);
      color: var(--charcoal);
    }

    /* Sentence display */
    .sentence-persian {
      font-family: 'Vazirmatn', sans-serif;
      font-size: 22px;
      font-weight: 600;
      direction: rtl;
      text-align: right;
      line-height: 1.6;
      margin-bottom: 8px;
    }

    .sentence-translit {
      font-size: 14px;
      font-style: italic;
      color: rgba(0,0,0,0.5);
      margin-bottom: 6px;
    }

    .sentence-hebrew {
      font-family: 'Vazirmatn', sans-serif;
      font-size: 15px;
      direction: rtl;
      text-align: right;
      color: var(--indigo);
      font-weight: 500;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-turquoise { background: rgba(0,165,145,0.12); color: var(--turquoise); }
    .badge-saffron { background: rgba(244,196,48,0.2); color: #b88e10; }
    .badge-indigo { background: rgba(31,42,68,0.1); color: var(--indigo); }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      width: 100%;
    }

    .btn-primary {
      background: var(--turquoise);
      color: white;
    }

    .btn-primary:hover { background: #008a78; transform: translateY(-1px); }

    .btn-secondary {
      background: var(--indigo);
      color: white;
    }

    .btn-outline {
      background: transparent;
      border: 2px solid var(--turquoise);
      color: var(--turquoise);
    }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--indigo);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .motiv-text {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 13px;
      color: var(--turquoise);
      font-weight: 400;
    }

    /* Stats grid */
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 14px 10px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(31,42,68,0.08);
    }

    .stat-val {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: var(--indigo);
      line-height: 1;
    }

    .stat-label { font-size: 10px; color: rgba(0,0,0,0.4); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Flashcard */
    .flashcard-wrapper {
      perspective: 1000px;
      height: 220px;
      cursor: pointer;
      margin-bottom: 16px;
    }

    .flashcard-inner {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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

    .flashcard-front {
      background: linear-gradient(135deg, var(--indigo), #2a3a5c);
      color: white;
    }

    .flashcard-back {
      background: linear-gradient(135deg, var(--turquoise), #007d6e);
      color: white;
      transform: rotateY(180deg);
    }

    /* Chat */
    .chat-container { display: flex; flex-direction: column; gap: 12px; }

    .chat-bubble {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
    }

    .chat-ai {
      background: white;
      border: 1px solid rgba(31,42,68,0.1);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .chat-user {
      background: var(--turquoise);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .chat-input-area {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .chat-input {
      flex: 1;
      padding: 12px 16px;
      border-radius: 14px;
      border: 2px solid rgba(0,165,145,0.2);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      outline: none;
      background: white;
      transition: border-color 0.2s;
    }

    .chat-input:focus { border-color: var(--turquoise); }

    .chat-send {
      background: var(--turquoise);
      border: none;
      border-radius: 14px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      font-size: 18px;
      transition: all 0.2s;
    }

    .chat-send:hover { background: #008a78; }

    /* Toggle */
    .toggle-container {
      display: flex;
      background: rgba(31,42,68,0.06);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 16px;
    }

    .toggle-option {
      flex: 1;
      padding: 8px;
      border-radius: 9px;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      background: none;
      color: rgba(0,0,0,0.4);
    }

    .toggle-option.active {
      background: var(--indigo);
      color: white;
      box-shadow: 0 2px 8px rgba(31,42,68,0.2);
    }

    /* Progress bar */
    .progress-bar-wrap {
      background: rgba(0,165,145,0.1);
      border-radius: 10px;
      height: 8px;
      overflow: hidden;
      margin-top: 6px;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--turquoise), var(--saffron));
      border-radius: 10px;
      transition: width 0.6s ease;
    }

    /* Keyboard */
    .keyboard-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 6px;
      margin-top: 12px;
    }

    .key-btn {
      background: white;
      border: 1px solid rgba(31,42,68,0.12);
      border-radius: 8px;
      padding: 10px 4px;
      font-family: 'Vazirmatn', sans-serif;
      font-size: 16px;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
      color: var(--charcoal);
    }

    .key-btn:hover { background: var(--turquoise); color: white; }
    .key-btn:active { transform: scale(0.9); }

    /* Scenario chips */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 20px;
      border: 2px solid rgba(0,165,145,0.2);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
      color: var(--charcoal);
      white-space: nowrap;
    }

    .chip.active, .chip:hover {
      background: var(--turquoise);
      color: white;
      border-color: var(--turquoise);
    }

    .chips-wrap { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }

    /* News */
    .news-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 16px;
      box-shadow: 0 2px 12px rgba(31,42,68,0.08);
    }

    .news-header {
      background: linear-gradient(135deg, var(--indigo), #2a3a5c);
      padding: 14px 16px;
    }

    .news-body { padding: 16px; }

    .quiz-opt {
      padding: 12px 16px;
      border-radius: 12px;
      border: 2px solid rgba(31,42,68,0.12);
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 8px;
      transition: all 0.2s;
      background: white;
      width: 100%;
      text-align: right;
      font-family: 'Vazirmatn', sans-serif;
    }

    .quiz-opt:hover { border-color: var(--turquoise); color: var(--turquoise); }
    .quiz-opt.correct { background: rgba(0,165,145,0.1); border-color: var(--turquoise); color: var(--turquoise); }
    .quiz-opt.wrong { background: rgba(220,50,50,0.1); border-color: #dc3232; color: #dc3232; }

    /* Ornamental divider */
    .ornament {
      text-align: center;
      color: rgba(0,165,145,0.3);
      font-size: 18px;
      letter-spacing: 8px;
      margin: 8px 0;
    }

    /* Persian tile border accent */
    .tile-accent {
      height: 3px;
      background: repeating-linear-gradient(90deg, var(--turquoise) 0px, var(--turquoise) 8px, var(--saffron) 8px, var(--saffron) 16px, var(--indigo) 16px, var(--indigo) 24px);
      border-radius: 2px;
      margin-bottom: 20px;
    }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0,165,145,0.3); }
      50% { box-shadow: 0 0 0 10px rgba(0,165,145,0); }
    }

    .fade-up { animation: fadeUp 0.4s ease forwards; }
    .fade-up-1 { animation: fadeUp 0.4s 0.05s ease both; }
    .fade-up-2 { animation: fadeUp 0.4s 0.1s ease both; }
    .fade-up-3 { animation: fadeUp 0.4s 0.15s ease both; }
    .fade-up-4 { animation: fadeUp 0.4s 0.2s ease both; }

    .pulse-glow { animation: pulse-glow 2s infinite; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0,165,145,0.3); border-radius: 4px; }

    /* Vocab grid */
    .vocab-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    .vocab-card {
      background: white;
      border-radius: 16px;
      padding: 16px 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(31,42,68,0.06);
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .vocab-card:hover { border-color: var(--turquoise); transform: translateY(-2px); }
    .vocab-card.learned { border-color: rgba(0,165,145,0.3); background: rgba(0,165,145,0.04); }

    /* XP bar */
    .xp-bar { margin-top: 8px; }
    .xp-label { display: flex; justify-content: space-between; font-size: 11px; color: rgba(0,0,0,0.4); margin-bottom: 4px; }

    /* WA button */
    .wa-btn {
      background: #25D366;
      color: white;
      border: none;
      border-radius: 14px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: all 0.2s;
    }

    .wa-btn:hover { background: #1da851; transform: translateY(-1px); }

    /* Achievement */
    .achievement {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 10px;
      box-shadow: 0 2px 8px rgba(31,42,68,0.06);
    }

    .achievement-icon {
      width: 44px; height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
};

// ============================================================
// COMPONENTS
// ============================================================

function SentenceCard({ persian, transliteration, hebrew, className = "" }) {
  return (
    <div className={`card ${className}`}>
      <p className="sentence-persian">{persian}</p>
      <p className="sentence-translit">{transliteration}</p>
      <div className="ornament">✦ ✦ ✦</div>
      <p className="sentence-hebrew">{hebrew}</p>
    </div>
  );
}

function Flashcard({ word, onKnown, onReview }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div>
      <div className="flashcard-wrapper" onClick={() => setFlipped(f => !f)}>
        <div className={`flashcard-inner ${flipped ? "flipped" : ""}`}>
          <div className="flashcard-face flashcard-front">
            <span className="badge badge-saffron" style={{marginBottom: 16}}>לחץ לגלות</span>
            <div className="persian" style={{fontSize: 36, fontWeight: 700, color: "white", textAlign: "center"}}>{word.persian}</div>
            <div style={{fontSize: 13, opacity: 0.6, marginTop: 8, color: "white", fontStyle: "italic"}}>{word.transliteration}</div>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="badge" style={{background: "rgba(255,255,255,0.2)", color: "white", marginBottom: 16}}>תרגום</span>
            <div className="persian" style={{fontSize: 28, fontWeight: 600, color: "white", textAlign: "center"}}>{word.hebrew}</div>
            <div style={{fontSize: 12, opacity: 0.7, marginTop: 8, color: "white"}}>{word.category}</div>
          </div>
        </div>
      </div>
      {flipped && (
        <div style={{display: "flex", gap: 10}}>
          <button className="btn" style={{background: "rgba(220,50,50,0.1)", color: "#dc3232", border: "2px solid #dc3232"}} onClick={() => { setFlipped(false); onReview(); }}>
            😅 עוד פעם
          </button>
          <button className="btn btn-primary" onClick={() => { setFlipped(false); onKnown(); }}>
            ✓ ידעתי!
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGES
// ============================================================

function Dashboard({ stats, setStats }) {
  const percent = Math.min(100, (stats.words / 50) * 100);
  return (
    <div>
      {/* Hero */}
      <div className="card card-indigo fade-up" style={{marginBottom: 16, textAlign: "center", padding: "28px 20px"}}>
        <div style={{fontSize: 11, letterSpacing: 2, textTransform: "uppercase", opacity: 0.5, marginBottom: 8}}>ברוך הבא ל</div>
        <div style={{fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#F4C430", marginBottom: 4}}>
          ITS <span style={{color: "#00A591"}}>MOMKEN</span>
        </div>
        <div style={{fontSize: 13, opacity: 0.6, fontStyle: "italic"}}>ללמוד פרסית? ITS MOMKEN.</div>
      </div>

      <div className="tile-accent"></div>

      {/* Stats */}
      <div className="stats-grid fade-up-1">
        <div className="stat-card pulse-glow">
          <div className="stat-val">🔥{stats.streak}</div>
          <div className="stat-label">ימי רצף</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{color: "var(--turquoise)"}}>{stats.words}</div>
          <div className="stat-label">מילים</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{color: "#F4C430)"}}>{stats.xp}</div>
          <div className="stat-label">נקודות XP</div>
        </div>
      </div>

      {/* Progress */}
      <div className="card fade-up-2">
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8}}>
          <span style={{fontSize: 13, fontWeight: 600}}>התקדמות היומית</span>
          <span className="badge badge-turquoise">{Math.round(percent)}%</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{width: `${percent}%`}}></div>
        </div>
        <div className="xp-label" style={{marginTop: 6}}>
          <span>{stats.words} מילים שנלמדו</span>
          <span>יעד: 50 מילים</span>
        </div>
      </div>

      {/* Word of Day */}
      <div className="section-title fade-up-3">✨ מילה היום</div>
      <div className="card card-turquoise fade-up-3">
        <div style={{fontSize: 11, letterSpacing: 2, textTransform: "uppercase", opacity: 0.6, marginBottom: 10}}>WORD OF THE DAY</div>
        <div className="persian" style={{fontSize: 36, fontWeight: 700, color: "white", textAlign: "right", marginBottom: 6}}>{wordOfDay.persian}</div>
        <div style={{fontSize: 14, fontStyle: "italic", opacity: 0.8, color: "white", marginBottom: 10}}>{wordOfDay.transliteration}</div>
        <div className="persian" style={{fontSize: 18, fontWeight: 600, color: "white", textAlign: "right", marginBottom: 12}}>{wordOfDay.hebrew}</div>
        <div style={{background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px"}}>
          <div className="persian" style={{fontSize: 13, color: "white", textAlign: "right", opacity: 0.9}}>{wordOfDay.example}</div>
          <div className="persian" style={{fontSize: 12, color: "white", textAlign: "right", opacity: 0.7, marginTop: 4}}>{wordOfDay.exampleHe}</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="section-title fade-up-4">🏆 הישגים</div>
      {[
        {icon: "🔥", color: "rgba(244,100,48,0.1)", label: "3 ימי רצף", sublabel: "Consistency? ITS MOMKEN.", unlocked: true},
        {icon: "📚", color: "rgba(0,165,145,0.1)", label: "12 מילים ראשונות", sublabel: "Vocabulary? ITS MOMKEN.", unlocked: true},
        {icon: "💬", color: "rgba(31,42,68,0.08)", label: "שיחה ראשונה", sublabel: "Conversation? ITS MOMKEN.", unlocked: false},
      ].map((a, i) => (
        <div className="achievement" key={i} style={{opacity: a.unlocked ? 1 : 0.4}}>
          <div className="achievement-icon" style={{background: a.color}}>{a.icon}</div>
          <div>
            <div style={{fontWeight: 600, fontSize: 14}}>{a.label}</div>
            <div className="motiv-text">{a.sublabel}</div>
          </div>
          {a.unlocked && <div style={{marginLeft: "auto", color: "#F4C430", fontSize: 18}}>★</div>}
        </div>
      ))}

      {/* WhatsApp */}
      <div style={{marginTop: 8}}>
        <button className="wa-btn" onClick={() => window.open("https://wa.me/", "_blank")}>
          <span style={{fontSize: 20}}>💬</span>
          הצטרף לקהילת ITS MOMKEN בוואטסאפ
        </button>
      </div>
    </div>
  );
}

function Chat({ stats, setStats }) {
  const [scenario, setScenario] = useState("bazaar");
  const [mode, setMode] = useState("formal");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [dialogIdx, setDialogIdx] = useState(0);
  const bottomRef = useRef();

  useEffect(() => {
    const d = dialogues[scenario];
    if (d && d[0] && d[0].role === "ai") {
      setMessages([{ ...d[0], id: Date.now() }]);
      setDialogIdx(1);
    }
  }, [scenario]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", persian: input, transliteration: "", hebrew: input, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // AI response
    setTimeout(() => {
      const d = dialogues[scenario];
      const next = d[dialogIdx];
      if (next) {
        setMessages(prev => [...prev, { ...next, id: Date.now() + 1 }]);
        setDialogIdx(i => i + 1);
        setStats(s => ({ ...s, xp: s.xp + 5 }));
      } else {
        setMessages(prev => [...prev, {
          role: "ai", id: Date.now() + 1,
          persian: "عالی! خیلی خوب صحبت کردید!",
          transliteration: "Ali! Khyli khob sohbat kardid!",
          hebrew: "מצוין! דיברת נהדר!",
        }]);
      }
    }, 700);
  };

  const persianKeys = ["ا", "ب", "پ", "ت", "ث", "ج", "چ", "ح", "خ", "د", "ذ", "ر", "ز", "ژ", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک", "گ", "ل", "م", "ن", "و", "ه", "ی"];

  return (
    <div>
      <div className="section-title">💬 מדריך שיחה</div>

      <div className="toggle-container">
        <button className={`toggle-option ${mode === "formal" ? "active" : ""}`} onClick={() => setMode("formal")}>🎩 רשמי</button>
        <button className={`toggle-option ${mode === "slang" ? "active" : ""}`} onClick={() => setMode("slang")}>😎 סלנג</button>
      </div>

      <div className="chips-wrap">
        {scenarios.map(s => (
          <button key={s.id} className={`chip ${scenario === s.id ? "active" : ""}`} onClick={() => setScenario(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="card" style={{minHeight: 280}}>
        <div className="chat-container">
          {messages.map(m => (
            <div key={m.id} className={`chat-bubble ${m.role === "ai" ? "chat-ai" : "chat-user"}`}>
              {m.role === "ai" && (
                <>
                  <div className="persian" style={{fontSize: 16, fontWeight: 600, marginBottom: 4, textAlign: "right"}}>{m.persian}</div>
                  <div style={{fontSize: 12, fontStyle: "italic", color: "rgba(0,0,0,0.4)", marginBottom: 4}}>{m.transliteration}</div>
                  <div className="persian" style={{fontSize: 13, color: "var(--indigo)", textAlign: "right"}}>{m.hebrew}</div>
                </>
              )}
              {m.role === "user" && <div style={{fontWeight: 500}}>{m.persian}</div>}
            </div>
          ))}
        </div>
        <div ref={bottomRef}></div>
      </div>

      {/* Suggested phrase */}
      {dialogues[scenario][dialogIdx]?.role === "user_prompt" && (
        <div className="card" style={{background: "rgba(0,165,145,0.06)", border: "1px dashed rgba(0,165,145,0.3)"}}>
          <div style={{fontSize: 11, color: "var(--turquoise)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1}}>💡 הצעה</div>
          <div className="persian" style={{textAlign: "right", fontSize: 15, fontWeight: 600}}>{dialogues[scenario][dialogIdx].persian}</div>
          <div style={{fontSize: 12, fontStyle: "italic", color: "rgba(0,0,0,0.4)", marginTop: 4}}>{dialogues[scenario][dialogIdx].transliteration}</div>
          <button className="btn btn-outline" style={{marginTop: 10}} onClick={() => setInput(dialogues[scenario][dialogIdx].persian)}>השתמש בביטוי זה</button>
        </div>
      )}

      <div className="chat-input-area">
        <input
          className="chat-input persian"
          style={{direction: "rtl", textAlign: "right"}}
          placeholder="כתוב פרסית..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button className="chat-send" onClick={sendMessage}>➤</button>
      </div>

      {/* Mini keyboard */}
      <div className="card" style={{marginTop: 12}}>
        <div style={{fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8}}>⌨️ לוח מקשים פרסי</div>
        <div className="keyboard-grid">
          {persianKeys.slice(0, 16).map(k => (
            <button key={k} className="key-btn" onClick={() => setInput(i => i + k)}>{k}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Vocabulary({ stats, setStats }) {
  const [view, setView] = useState("grid");
  const [flashIdx, setFlashIdx] = useState(0);
  const [learned, setLearned] = useState(new Set());
  const [filter, setFilter] = useState("all");

  const categories = ["all", ...new Set(vocabulary.map(v => v.category))];
  const filtered = filter === "all" ? vocabulary : vocabulary.filter(v => v.category === filter);

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
        <button className={`toggle-option ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>🔲 גריד</button>
        <button className={`toggle-option ${view === "flash" ? "active" : ""}`} onClick={() => setView("flash")}>🃏 פלאשכרטות</button>
      </div>

      {view === "flash" && (
        <>
          <div className="card" style={{background: "rgba(0,165,145,0.06)", textAlign: "center", marginBottom: 12}}>
            <span className="badge badge-turquoise">{flashIdx + 1} / {vocabulary.length}</span>
            <span style={{fontSize: 13, color: "rgba(0,0,0,0.4)", marginRight: 10}}>לחץ על הכרטיס לתרגום</span>
          </div>
          <Flashcard word={vocabulary[flashIdx]} onKnown={handleKnown} onReview={() => setFlashIdx(i => (i + 1) % vocabulary.length)} />
        </>
      )}

      {view === "grid" && (
        <>
          <div style={{display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4}} className="scrollbar-hide">
            {categories.map(c => (
              <button key={c} className={`chip ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c === "all" ? "🌟 הכל" : c}</button>
            ))}
          </div>
          <div className="vocab-grid">
            {filtered.map(w => (
              <div key={w.id} className={`vocab-card ${learned.has(w.id) ? "learned" : ""}`}>
                {learned.has(w.id) && <span style={{fontSize: 10, color: "var(--turquoise)", fontWeight: 700}}>✓ למדת</span>}
                <div className="persian" style={{fontSize: 24, fontWeight: 700, color: "var(--indigo)", marginBottom: 4, textAlign: "center"}}>{w.persian}</div>
                <div style={{fontSize: 11, fontStyle: "italic", color: "rgba(0,0,0,0.4)", marginBottom: 4}}>{w.transliteration}</div>
                <div className="persian" style={{fontSize: 14, fontWeight: 600, color: "var(--turquoise)", textAlign: "center"}}>{w.hebrew}</div>
                <div style={{marginTop: 8}} className="badge badge-indigo">{w.category}</div>
              </div>
            ))}
          </div>

          <div className="card card-saffron" style={{marginTop: 16, textAlign: "center"}}>
            <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>קוגנאטים: מילים משותפות</div>
            <div style={{fontSize: 11, opacity: 0.7}}>עברית, ערבית ופרסית חולקות שורשים משותפים!</div>
            <div style={{marginTop: 10, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap"}}>
              {[["שלום", "سلام", "Salam"], ["ספר", "کتاب", "Ketab"], ["מים", "آب", "Ab"]].map(([he, fa, tr]) => (
                <div key={he} style={{background: "rgba(255,255,255,0.6)", borderRadius: 10, padding: "6px 10px", fontSize: 12}}>
                  <span style={{fontFamily: "Vazirmatn"}}>{he}</span> ↔ <span style={{fontFamily: "Vazirmatn", direction: "rtl"}}>{fa}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Culture() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div className="section-title">🕌 מרכז תרבות</div>
      <div className="card" style={{background: "linear-gradient(135deg, var(--saffron), #e8b020)", marginBottom: 16, textAlign: "center"}}>
        <div style={{fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(0,0,0,0.5)", marginBottom: 6}}>CULTURE HUB</div>
        <div style={{fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 700, color: "var(--indigo)"}}>הבן את ישראל מהצד השני</div>
        <div style={{fontSize: 13, color: "rgba(0,0,0,0.5)", marginTop: 4, fontStyle: "italic"}}>Cultural literacy? ITS MOMKEN.</div>
      </div>

      {cultureCards.map((card, i) => (
        <div key={card.id} className="card fade-up" style={{animationDelay: `${i * 0.05}s`}}>
          <div style={{display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer"}} onClick={() => setExpanded(expanded === card.id ? null : card.id)}>
            <div style={{width: 50, height: 50, borderRadius: 16, background: "rgba(0,165,145,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0}}>
              {card.emoji}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 700, fontSize: 15, marginBottom: 2}}>{card.title}</div>
              <div className="persian" style={{fontSize: 13, color: "var(--turquoise)", textAlign: "right", direction: "rtl"}}>{card.titlePersian}</div>
            </div>
            <div style={{color: "rgba(0,0,0,0.3)", fontSize: 18, flexShrink: 0}}>{expanded === card.id ? "▲" : "▼"}</div>
          </div>

          {expanded === card.id && (
            <div style={{marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.06)"}}>
              <div className="persian" style={{fontSize: 16, fontWeight: 500, direction: "rtl", textAlign: "right", lineHeight: 1.8, marginBottom: 10, color: "var(--charcoal)"}}>
                {card.persian}
              </div>
              <div style={{fontSize: 13, fontStyle: "italic", color: "rgba(0,0,0,0.4)", marginBottom: 8}}>{card.transliteration}</div>
              <div style={{height: 1, background: "rgba(0,165,145,0.15)", margin: "10px 0"}}></div>
              <div className="persian" style={{fontSize: 14, direction: "rtl", textAlign: "right", color: "var(--indigo)", fontWeight: 500, lineHeight: 1.7}}>
                {card.hebrew}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function News({ stats, setStats }) {
  const [quizState, setQuizState] = useState({});

  const handleAnswer = (newsId, optIdx, correctIdx) => {
    if (quizState[newsId]) return;
    const correct = optIdx === correctIdx;
    setQuizState(s => ({ ...s, [newsId]: { selected: optIdx, correct } }));
    if (correct) setStats(s => ({ ...s, xp: s.xp + 15 }));
  };

  return (
    <div>
      <div className="section-title">📰 חדשות & OSINT</div>
      <div className="card" style={{background: "linear-gradient(135deg, #1F2A44, #2a3a5c)", marginBottom: 16, textAlign: "center"}}>
        <div style={{fontSize: 11, letterSpacing: 2, textTransform: "uppercase", opacity: 0.4, color: "white", marginBottom: 6}}>OSINT MODE</div>
        <div style={{fontFamily: "Playfair Display, serif", fontSize: 17, color: "white", fontWeight: 700}}>קרא חדשות פרסיות אמיתיות</div>
        <div style={{fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, fontStyle: "italic"}}>Reading Iranian news? ITS MOMKEN.</div>
      </div>

      {mockNews.map((n, i) => (
        <div className="news-card fade-up" key={n.id} style={{animationDelay: `${i * 0.07}s`}}>
          <div className="news-header">
            <span className="badge" style={{background: "rgba(244,196,48,0.2)", color: "#F4C430", marginBottom: 8, display: "inline-flex"}}>🗞️ חדשות</span>
            <div className="persian" style={{fontSize: 16, fontWeight: 700, color: "white", textAlign: "right", direction: "rtl", lineHeight: 1.5}}>{n.title}</div>
            <div style={{fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4}}>{n.titleHebrew}</div>
          </div>
          <div className="news-body">
            <div className="persian" style={{fontSize: 15, fontWeight: 500, direction: "rtl", textAlign: "right", lineHeight: 1.8, marginBottom: 8}}>{n.persian}</div>
            <div style={{fontSize: 12, fontStyle: "italic", color: "rgba(0,0,0,0.4)", marginBottom: 8}}>{n.transliteration}</div>
            <div style={{height: 1, background: "rgba(0,0,0,0.06)", margin: "10px 0"}}></div>
            <div className="persian" style={{fontSize: 14, direction: "rtl", textAlign: "right", color: "var(--indigo)", fontWeight: 500, lineHeight: 1.7, marginBottom: 16}}>{n.hebrew}</div>

            {/* Quiz */}
            {!quizState[n.id] ? (
              <div>
                <div style={{fontSize: 13, fontWeight: 700, marginBottom: 10, color: "var(--indigo)"}}>🧠 בחן את הבנתך</div>
                <div style={{fontFamily: "Vazirmatn, sans-serif", fontSize: 14, direction: "rtl", textAlign: "right", marginBottom: 10, fontWeight: 600}}>
                  {n.quiz[0].q}
                </div>
                {n.quiz[0].options.map((opt, j) => (
                  <button key={j} className="quiz-opt" onClick={() => handleAnswer(n.id, j, n.quiz[0].answer)}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{textAlign: "center", padding: "12px", background: quizState[n.id].correct ? "rgba(0,165,145,0.08)" : "rgba(220,50,50,0.08)", borderRadius: 12}}>
                <div style={{fontSize: 24, marginBottom: 6}}>{quizState[n.id].correct ? "🎉" : "😅"}</div>
                <div style={{fontWeight: 700, color: quizState[n.id].correct ? "var(--turquoise)" : "#dc3232", fontSize: 14}}>
                  {quizState[n.id].correct ? "נכון! +15 XP" : "לא נכון. נסה שוב!"}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Progress({ stats }) {
  const milestones = [
    { label: "מתחיל", min: 0, emoji: "🌱" },
    { label: "לומד", min: 20, emoji: "📚" },
    { label: "שוטף", min: 60, emoji: "💬" },
    { label: "מומחה", min: 100, emoji: "🏆" },
  ];
  const current = milestones.filter(m => stats.words >= m.min).pop();

  return (
    <div>
      <div className="section-title">📊 ההתקדמות שלי</div>

      <div className="card card-turquoise" style={{textAlign: "center"}}>
        <div style={{fontSize: 48}}>{current.emoji}</div>
        <div style={{fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, color: "white", marginTop: 8}}>{current.label}</div>
        <div style={{fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4}}>Fluency? ITS MOMKEN.</div>
      </div>

      <div className="stats-grid" style={{marginTop: 16}}>
        {[
          {icon: "🔥", val: stats.streak, label: "ימי רצף"},
          {icon: "📖", val: stats.words, label: "מילים שנלמדו"},
          {icon: "⭐", val: stats.xp, label: "נקודות XP"},
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{fontSize: 20}}>{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="section-title" style={{marginTop: 8}}>🗺️ מפת דרכים</div>
      {milestones.map((m, i) => {
        const unlocked = stats.words >= m.min;
        return (
          <div className="achievement" key={i} style={{opacity: unlocked ? 1 : 0.4}}>
            <div className="achievement-icon" style={{background: unlocked ? "rgba(0,165,145,0.12)" : "rgba(0,0,0,0.06)", fontSize: 24}}>
              {m.emoji}
            </div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 700}}>{m.label}</div>
              <div style={{fontSize: 12, color: "rgba(0,0,0,0.4)"}}>נדרש: {m.min}+ מילים</div>
              <div className="progress-bar-wrap" style={{marginTop: 6}}>
                <div className="progress-bar-fill" style={{width: `${Math.min(100, (stats.words / Math.max(m.min, 1)) * 100)}%`}}></div>
              </div>
            </div>
            {unlocked && <div style={{color: "#F4C430", fontSize: 20, marginLeft: 8}}>★</div>}
          </div>
        );
      })}

      {/* Reset */}
      <div className="card" style={{textAlign: "center", marginTop: 8, background: "rgba(220,50,50,0.04)", border: "1px dashed rgba(220,50,50,0.2)"}}>
        <div style={{fontSize: 12, color: "rgba(0,0,0,0.4)", marginBottom: 8}}>לאפס את ההתקדמות</div>
        <button className="btn" style={{background: "rgba(220,50,50,0.08)", color: "#dc3232", border: "1px solid rgba(220,50,50,0.2)"}}>
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
  { id: "dashboard", label: "בית", icon: "🏠" },
  { id: "chat", label: "שיחה", icon: "💬" },
  { id: "vocab", label: "מילים", icon: "📖" },
  { id: "culture", label: "תרבות", icon: "🕌" },
  { id: "news", label: "חדשות", icon: "📰" },
];

// ============================================================
// APP
// ============================================================

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [stats, setStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("momken_stats")) || { streak: 3, words: 12, xp: 75 };
    } catch { return { streak: 3, words: 12, xp: 75 }; }
  });

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    try { localStorage.setItem("momken_stats", JSON.stringify(stats)); } catch {}
  }, [stats]);

  const pages = { dashboard: Dashboard, chat: Chat, vocab: Vocabulary, culture: Culture, news: News, progress: Progress };
  const PageComp = pages[page] || Dashboard;

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="header">
        <div className="header-logo">ITS <span>MOMKEN</span></div>
        <div style={{display: "flex", gap: 8}}>
          <button className="header-streak">🔥 {stats.streak}</button>
          <button className="header-streak" style={{background: "rgba(0,165,145,0.15)", borderColor: "rgba(0,165,145,0.3)", color: "#00A591"}} onClick={() => setPage("progress")}>
            ⭐ {stats.xp}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <PageComp stats={stats} setStats={setStats} />
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {navItems.map(n => (
          <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
