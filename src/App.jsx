import { vocabulary } from './data/vocabulary';
import { newsData } from './data/news';
import { cultureData } from './data/culture';
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// GEMINI AI SERVICE
// ============================================================

async function callGemini(prompt, jsonMode = true) {
  // 1. הכתובת של ה-Worker שלך ב-Cloudflare
  const WORKER_URL = "https://orange-paper-8280gemini-proxy.ykhv-xruxh.workers.dev/";

  try {
    // 2. שליחת הבקשה ל-Worker
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.7, 
          maxOutputTokens: jsonMode ? 2048 : 1024 
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Worker error: ${res.status}`);
    }

const data = await res.json();
    console.log("Gemini Response:", data); // השורה הזו תדפיס לנו את התשובה ב-Console
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!jsonMode) return raw.trim();
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);


async function fetchAINews() {
  const prompt = `
You are an OSINT analyst and Persian language teacher creating educational content for Israeli Hebrew speakers learning Persian.
Generate exactly 5 recent, realistic OSINT-style news items about Iran or the Middle East.
Each item must have:
- A Persian headline (title) in Persian script
- A Hebrew headline (titleHebrew)
- A Persian body of 2-3 sentences (persian) in Persian script
- A romanized transliteration (transliteration)
- A Hebrew translation (hebrew)
- A quiz with one question (q), four options array, and correct answer index (0-3)
Return ONLY a valid JSON array, no markdown. Format:
[{"id":1,"title":"...","titleHebrew":"...","persian":"...","transliteration":"...","hebrew":"...","quiz":[{"q":"...","options":["...","...","...","..."],"answer":0}]}]
`;
  return callGemini(prompt, true);
}

async function fetchWordOfDay() {
  alert("הבקשה נשלחת לוורקר!"); // זה יופיע על המסך כשתלחצי
  const prompt = `
You are a Persian language teacher for Hebrew speakers.
Generate one interesting "Word of the Day" in Persian. Choose a culturally rich or emotionally expressive word.
Return ONLY valid JSON, no markdown:
{"persian":"...","transliteration":"...","hebrew":"...","example":"...","exampleHe":"...","grammarNote":"A short grammar or cultural note in Hebrew (1-2 sentences)"}
`;
  return callGemini(prompt, true);
}

async function fetchTutorReply(history, userMessage, mode) {
  const historyText = history
    .slice(-6)
    .map(m => `${m.role === "user" ? "Student" : "Tutor"}: ${m.persian}`)
    .join("\n");
  const prompt = `
You are a warm, encouraging Persian language tutor for Hebrew speakers. Your name is Dariush (داریوش).
Mode: ${mode === "slang" ? "Colloquial/spoken Persian" : "Formal literary Persian"}.
Rules:
1. Reply primarily in Persian script.
2. If the student made a grammar mistake, note it in Hebrew: [תיקון: ...]
3. Keep replies to 1-3 sentences.
4. Occasionally ask a follow-up question.
5. Always include a Hebrew translation prefixed "HE:" and transliteration prefixed "TR:".
6. If student struggles, say "ITS MOMKEN" encouragingly.
Conversation:
${historyText}
Student: ${userMessage}
Respond in this exact format only:
FA: [Persian reply]
TR: [transliteration]
HE: [Hebrew translation]
CORRECTION: [Hebrew grammar note or "none"]
`;
  const raw = await callGemini(prompt, false);
  if (!raw) return null;
  const get = (prefix) => {
    const m = raw.match(new RegExp(`${prefix}:\\s*(.+?)(?=\\n[A-Z]+:|$)`, "s"));
    return m ? m[1].trim() : "";
  };
  return {
    persian:         get("FA"),
    transliteration: get("TR"),
    hebrew:          get("HE"),
    correction:      get("CORRECTION").toLowerCase() === "none" ? null : get("CORRECTION"),
  };
}

// ============================================================
// STATIC DATA
// ============================================================



const slangMap = {
  "می‌خواهید": "می‌خواین", "می‌خواهم": "می‌خوام",
  "می‌خواهد":  "می‌خواد",  "می‌روم":   "می‌رم",
  "می‌شود":    "می‌شه",    "هستم":     "ام",
  "است":       "ـه",       "نان":      "نون", "چه": "چی",
  "Mikhahid":  "Mikhain",  "Mikhaham": "Mikham",
  "Miravam":   "Miram",    "Mishavad": "Mishe",
  "Hastam":    "Am",       "Nan":      "Noon",
  "ast?":      "e?",       "ast.":     "e.",
};

const grammarNotes = {
  bazaar:     { title: "💡 אֶזאפֶה (اضافه)", body: "בפרסית מוסיפים '-e' בין שם עצם לתואר.\nדוגמה: bazaar-e bozorg = הבזאר הגדול. התואר תמיד אחרי שם העצם!" },
  friend:     { title: "💡 גוף שני יחיד",    body: "בסלנג, 'شما' (רשמי) הופך ל-'تو'. הסיומת 'ت' = גוף שני יחיד, כמו 'ך' בעברית." },
  food:       { title: "💡 יחיד מסוים",      body: "'یک' (yek) לפני שם עצם יוצר יחיד מסוים. אין מילה נפרדת ל-'the' בפרסית." },
  directions: { title: "💡 סדר מילים SOV",   body: "פרסית: נושא → מושא → פועל. הפועל תמיד בסוף, כמו גרמנית ויפנית." },
};

const fallbackWordOfDay = {
  persian: "دلتنگی", transliteration: "Deltangi",
  hebrew: "געגועים / כאב לב",
  example: "من دلتنگ ایران هستم", exampleHe: "אני מתגעגע לאיראן",
  grammarNote: "المילה 'دلتنگی' מורכבת מ-دل (לב) ו-تنگی (צרות) — לב צר מגעגועים. ביטוי מטאפורי יפהפה.",
};

const cultureCards = cultureData;

const scenarios = [
  { id:"bazaar",     label:"🛍️ בזאר",        labelPersian:"بازار"    },
  { id:"friend",     label:"👋 פגישה עם חבר", labelPersian:"دوست"     },
  { id:"food",       label:"🍽️ הזמנת אוכל",  labelPersian:"غذا"      },
  { id:"directions", label:"🗺️ הוראות דרך",  labelPersian:"راهنمایی" },
];

const starterDialogues = {
  bazaar:     { persian:"سلام! خوش آمدید به بازار. چه می‌خواهید؟", transliteration:"Salam! Khosh amadid be bazaar. Che mikhahid?",    hebrew:"שלום! ברוכים הבאים לבזאר. מה אתם רוצים?" },
  friend:     { persian:"سلام رفیق! حالت چطوره؟",                   transliteration:"Salam rafigh! Halat chetore?",                   hebrew:"היי חבר! מה שלומך?" },
  food:       { persian:"بفرمایید! چه میل دارید؟",                  transliteration:"Befarmayid! Che meyl darid?",                    hebrew:"בבקשה! מה תרצו?" },
  directions: { persian:"ببخشید، می‌تونم کمک کنم؟",                 transliteration:"Bebakhshid, mitoonam komak konam?",              hebrew:"סליחה, אפשר לעזור?" },
};

const LEVELS = [
  { label:"מתחיל", emoji:"🌱", minXP:0   },
  { label:"לומד",  emoji:"📚", minXP:100 },
  { label:"שוטף",  emoji:"💬", minXP:300 },
  { label:"מומחה", emoji:"🏆", minXP:600 },
];

// ============================================================
// HELPERS
// ============================================================

function applySlang(text, mode) {
  if (mode !== "slang" || !text) return text;
  let r = text;
  Object.entries(slangMap).forEach(([f, s]) => { r = r.replaceAll(f, s); });
  return r;
}

function generateWhatsAppLink(title, titleHe) {
  const msg = encodeURIComponent(
    `🗞️ *ITS MOMKEN – שיתוף חדשות OSINT*\n\n"${title}"\n(${titleHe})\n\nתרגמתי ב-ITS MOMKEN — מה דעתך? 💬`
  );
  return `https://wa.me/?text=${msg}`;
}

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
    :root{--turquoise:#00A591;--saffron:#F4C430;--indigo:#1F2A44;--charcoal:#2E2E2E;--sand:#F6F1E9;}
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Heebo',sans-serif;background:var(--sand);color:var(--charcoal);overscroll-behavior:none;-webkit-font-smoothing:antialiased;}
    .persian{font-family:'Vazirmatn',sans-serif;direction:rtl;}
    .hebrew{font-family:'Heebo',sans-serif;direction:rtl;}
    .app-shell{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;background:var(--sand);}
    .app-shell::before{content:'';position:fixed;top:0;left:0;right:0;bottom:0;background-image:radial-gradient(circle at 20% 20%,rgba(0,165,145,.05) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(244,196,48,.05) 0%,transparent 50%);pointer-events:none;z-index:0;}
    .header{background:var(--indigo);padding:14px 18px 12px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 20px rgba(31,42,68,.35);}
    .header-logo{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--saffron);letter-spacing:-.5px;}
    .header-logo span{color:var(--turquoise);}
    .header-badge{display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;font-family:'Heebo',sans-serif;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s;}
    .hb-fire{background:rgba(244,196,48,.15);border:1px solid rgba(244,196,48,.3);color:var(--saffron);}
    .hb-xp{background:rgba(0,165,145,.15);border:1px solid rgba(0,165,145,.3);color:var(--turquoise);}
    .content{flex:1;overflow-y:auto;padding:18px 15px 88px;position:relative;z-index:1;}
    .bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--indigo);display:flex;justify-content:space-around;padding:9px 0 15px;z-index:100;box-shadow:0 -2px 20px rgba(31,42,68,.3);}
    .nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 10px;border-radius:12px;transition:all .2s;color:rgba(255,255,255,.35);font-family:'Heebo',sans-serif;font-size:10px;font-weight:500;border:none;background:none;}
    .nav-item.active{color:var(--turquoise);}
    .nav-item:hover:not(.active){color:rgba(255,255,255,.65);}
    .nav-icon{font-size:19px;}
    .card{background:white;border-radius:20px;padding:18px;margin-bottom:14px;box-shadow:0 2px 14px rgba(31,42,68,.07);border:1px solid rgba(31,42,68,.06);}
    .card-turquoise{background:linear-gradient(135deg,var(--turquoise),#007d6e);color:white;}
    .card-indigo{background:linear-gradient(135deg,var(--indigo),#2a3a5c);color:white;}
    .card-saffron{background:linear-gradient(135deg,var(--saffron),#e8b020);color:var(--charcoal);}
    .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-family:'Heebo',sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;}
    .badge-turquoise{background:rgba(0,165,145,.12);color:var(--turquoise);}
    .badge-saffron{background:rgba(244,196,48,.2);color:#b88e10;}
    .badge-indigo{background:rgba(31,42,68,.1);color:var(--indigo);}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:11px 18px;border-radius:13px;font-family:'Heebo',sans-serif;font-size:14px;font-weight:700;cursor:pointer;border:none;transition:all .2s;width:100%;}
    .btn-primary{background:var(--turquoise);color:white;}
    .btn-primary:hover{background:#008a78;transform:translateY(-1px);}
    .btn-outline{background:transparent;border:2px solid var(--turquoise);color:var(--turquoise);}
    .btn-show{background:rgba(31,42,68,.06);color:var(--indigo);border:1.5px dashed rgba(31,42,68,.2);}
    .section-title{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:var(--indigo);margin-bottom:14px;display:flex;align-items:center;gap:8px;}
    .motiv-text{font-family:'Playfair Display',serif;font-style:italic;font-size:12px;color:var(--turquoise);}
    .stats-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:14px;}
    .stat-card{background:white;border-radius:16px;padding:13px 8px;text-align:center;box-shadow:0 2px 8px rgba(31,42,68,.07);}
    .stat-val{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--indigo);line-height:1;}
    .stat-label{font-family:'Heebo',sans-serif;font-size:9px;color:rgba(0,0,0,.38);margin-top:4px;text-transform:uppercase;letter-spacing:.6px;}
    .flashcard-wrapper{perspective:1000px;height:210px;cursor:pointer;margin-bottom:14px;}
    .flashcard-inner{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform .55s cubic-bezier(.4,0,.2,1);}
    .flashcard-inner.flipped{transform:rotateY(180deg);}
    .flashcard-face{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;}
    .flashcard-front{background:linear-gradient(135deg,var(--indigo),#2a3a5c);}
    .flashcard-back{background:linear-gradient(135deg,var(--turquoise),#007d6e);transform:rotateY(180deg);}
    .chat-container{display:flex;flex-direction:column;gap:10px;}
    .chat-bubble{max-width:86%;padding:11px 14px;border-radius:18px;font-size:14px;line-height:1.5;}
    .chat-ai{background:white;border:1px solid rgba(31,42,68,.09);align-self:flex-start;border-bottom-left-radius:4px;}
    .chat-user{background:var(--turquoise);color:white;align-self:flex-end;border-bottom-right-radius:4px;}
    .chat-correction{background:rgba(244,196,48,.1);border:1px solid rgba(244,196,48,.3);border-radius:12px;padding:8px 12px;margin-top:6px;font-size:12px;color:#9a7208;font-family:'Heebo',sans-serif;direction:rtl;text-align:right;line-height:1.6;}
    .chat-input-area{display:flex;gap:8px;margin-top:14px;}
    .chat-input{flex:1;padding:12px 14px;border-radius:13px;border:2px solid rgba(0,165,145,.2);font-family:'Vazirmatn',sans-serif;font-size:14px;outline:none;background:white;transition:border-color .2s;}
    .chat-input:focus{border-color:var(--turquoise);}
    .chat-send{background:var(--turquoise);border:none;border-radius:13px;width:46px;height:46px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:white;font-size:17px;transition:all .2s;flex-shrink:0;}
    .chat-send:hover{background:#008a78;}
    .chat-send:disabled{background:rgba(0,165,145,.4);cursor:not-allowed;}
    .toggle-container{display:flex;background:rgba(31,42,68,.06);border-radius:12px;padding:4px;margin-bottom:14px;}
    .toggle-option{flex:1;padding:8px;border-radius:9px;text-align:center;font-family:'Heebo',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;border:none;background:none;color:rgba(0,0,0,.38);}
    .toggle-option.active{background:var(--indigo);color:white;box-shadow:0 2px 8px rgba(31,42,68,.2);}
    .progress-bar-wrap{background:rgba(0,165,145,.1);border-radius:10px;height:7px;overflow:hidden;margin-top:5px;}
    .progress-bar-fill{height:100%;background:linear-gradient(90deg,var(--turquoise),var(--saffron));border-radius:10px;transition:width .7s ease;}
    .keyboard-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:5px;margin-top:10px;}
    .key-btn{background:white;border:1px solid rgba(31,42,68,.12);border-radius:8px;padding:9px 3px;font-family:'Vazirmatn',sans-serif;font-size:15px;cursor:pointer;text-align:center;transition:all .15s;color:var(--charcoal);}
    .key-btn:hover{background:var(--turquoise);color:white;border-color:var(--turquoise);}
    .key-btn:active{transform:scale(.88);}
    .key-btn-unique{background:rgba(244,196,48,.14);border-color:rgba(244,196,48,.5);color:#9a7208;font-weight:700;}
    .key-btn-unique:hover{background:var(--saffron);color:white;border-color:var(--saffron);}
    .chip{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:20px;border:2px solid rgba(0,165,145,.2);font-family:'Heebo',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;background:white;color:var(--charcoal);white-space:nowrap;}
    .chip.active,.chip:hover{background:var(--turquoise);color:white;border-color:var(--turquoise);}
    .chips-wrap{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px;}
    .news-card{background:white;border-radius:20px;overflow:hidden;margin-bottom:14px;box-shadow:0 2px 14px rgba(31,42,68,.07);}
    .news-header{background:linear-gradient(135deg,var(--indigo),#2a3a5c);padding:13px 15px;}
    .news-body{padding:15px;}
    .quiz-opt{padding:11px 15px;border-radius:11px;border:2px solid rgba(31,42,68,.1);cursor:pointer;font-family:'Heebo',sans-serif;font-size:14px;margin-bottom:7px;transition:all .2s;background:white;width:100%;text-align:right;}
    .quiz-opt:hover{border-color:var(--turquoise);color:var(--turquoise);}
    .quiz-opt.correct{background:rgba(0,165,145,.08);border-color:var(--turquoise);color:var(--turquoise);}
    .quiz-opt.wrong{background:rgba(220,50,50,.08);border-color:#dc3232;color:#dc3232;}
    .ornament{text-align:center;color:rgba(0,165,145,.28);font-size:16px;letter-spacing:8px;margin:7px 0;}
    .tile-accent{height:3px;background:repeating-linear-gradient(90deg,var(--turquoise) 0,var(--turquoise) 8px,var(--saffron) 8px,var(--saffron) 16px,var(--indigo) 16px,var(--indigo) 24px);border-radius:2px;margin-bottom:18px;}
    .vocab-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
    .vocab-card{background:white;border-radius:15px;padding:14px 11px;text-align:center;box-shadow:0 2px 8px rgba(31,42,68,.06);cursor:pointer;transition:all .2s;border:2px solid transparent;}
    .vocab-card:hover{border-color:var(--turquoise);transform:translateY(-2px);}
    .vocab-card.learned{border-color:rgba(0,165,145,.3);background:rgba(0,165,145,.04);}
    .xp-label{display:flex;justify-content:space-between;font-family:'Heebo',sans-serif;font-size:10px;color:rgba(0,0,0,.38);margin-bottom:3px;}
    .wa-btn{background:#25D366;color:white;border:none;border-radius:13px;padding:13px 18px;display:flex;align-items:center;justify-content:center;gap:9px;font-family:'Heebo',sans-serif;font-size:14px;font-weight:700;cursor:pointer;width:100%;transition:all .2s;}
    .wa-btn:hover{background:#1da851;transform:translateY(-1px);}
    .achievement{display:flex;align-items:center;gap:11px;background:white;border-radius:15px;padding:13px 15px;margin-bottom:9px;box-shadow:0 2px 8px rgba(31,42,68,.06);}
    .achievement-icon{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:21px;flex-shrink:0;}
    .audio-btn{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:8px;font-family:'Heebo',sans-serif;font-size:10px;font-weight:700;cursor:pointer;border:1.5px solid rgba(0,0,0,.1);background:rgba(0,0,0,.03);color:rgba(0,0,0,.3);transition:all .2s;flex-shrink:0;user-select:none;}
    .audio-btn:hover{border-color:var(--turquoise);color:var(--turquoise);background:rgba(0,165,145,.06);}
    .audio-btn.playing{border-color:var(--turquoise);color:var(--turquoise);background:rgba(0,165,145,.1);cursor:default;}
    .grammar-callout{background:linear-gradient(135deg,rgba(31,42,68,.03),rgba(0,165,145,.05));border:1px solid rgba(0,165,145,.22);border-right:4px solid var(--turquoise);border-radius:16px;padding:15px;margin-top:8px;margin-bottom:8px;}
    .ai-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:700;background:linear-gradient(90deg,rgba(0,165,145,.12),rgba(244,196,48,.12));color:var(--indigo);border:1px solid rgba(0,165,145,.2);font-family:'Heebo',sans-serif;text-transform:uppercase;letter-spacing:.5px;}
    /* Loading */
    .skeleton{background:linear-gradient(90deg,#ede5d8 25%,#e0d8cd 50%,#ede5d8 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:10px;}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .spinner{width:20px;height:20px;border:3px solid rgba(0,165,145,.2);border-top-color:var(--turquoise);border-radius:50%;animation:spin .75s linear infinite;display:inline-block;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .typing-dots{display:inline-flex;gap:4px;align-items:center;padding:10px 14px;}
    .typing-dots span{width:7px;height:7px;border-radius:50%;background:var(--turquoise);animation:blink 1.2s infinite both;}
    .typing-dots span:nth-child(2){animation-delay:.2s;}
    .typing-dots span:nth-child(3){animation-delay:.4s;}
    @keyframes blink{0%,80%,100%{opacity:.2;transform:scale(.85)}40%{opacity:1;transform:scale(1)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse-glow{0%,100%{box-shadow:0 0 0 0 rgba(0,165,145,.3)}50%{box-shadow:0 0 0 8px rgba(0,165,145,0)}}
    @keyframes audioWave{0%,100%{transform:scaleY(1);opacity:.9}50%{transform:scaleY(1.5);opacity:.6}}
    .fade-up{animation:fadeUp .38s ease forwards;}
    .fade-up-1{animation:fadeUp .38s .05s ease both;}
    .fade-up-2{animation:fadeUp .38s .10s ease both;}
    .fade-up-3{animation:fadeUp .38s .15s ease both;}
    .fade-up-4{animation:fadeUp .38s .20s ease both;}
    .pulse-glow{animation:pulse-glow 2s infinite;}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:rgba(0,165,145,.25);border-radius:4px;}
    .scrollbar-hide::-webkit-scrollbar{display:none;}
  `;
  const s = document.createElement("style");
  s.id = "momken-styles";
  s.textContent = css;
  document.head.appendChild(s);
};

// ============================================================
// SHARED COMPONENTS
// ============================================================

function AudioButton({ text }) {
  const [playing, setPlaying] = useState(false);
  const handlePlay = () => {
    if (playing) return;
    setPlaying(true);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "fa-IR"; u.rate = 0.88;
      u.onend = () => setPlaying(false);
      u.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(u);
    } else {
      setTimeout(() => setPlaying(false), 1600);
    }
  };
  return (
    <button className={`audio-btn ${playing ? "playing" : ""}`} onClick={handlePlay} title="האזן">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: playing ? "audioWave .7s ease-in-out infinite alternate" : "none" }}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeOpacity={playing ? .55 : 0} style={{ transition:"stroke-opacity .3s" }}/>
      </svg>
      {playing ? "מנגן..." : "האזן"}
    </button>
  );
}

function LoadingCard({ lines = 3, label = "טוען תוכן AI..." }) {
  return (
    <div className="card" style={{ textAlign:"center" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:14 }}>
        <div className="spinner" />
        <span style={{ fontSize:13, color:"var(--turquoise)", fontWeight:700 }}>{label}</span>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height:13, marginBottom:9, width:`${75 + (i % 3) * 9}%`, margin:"0 auto 9px" }} />
      ))}
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="card" style={{ textAlign:"center", border:"1px solid rgba(220,50,50,.2)", background:"rgba(220,50,50,.03)" }}>
      <div style={{ fontSize:24, marginBottom:8 }}>⚠️</div>
      <div style={{ fontSize:13, color:"#dc3232", marginBottom:12 }}>{message}</div>
      {onRetry && (
        <button className="btn btn-outline" style={{ width:"auto", padding:"8px 20px" }} onClick={onRetry}>🔄 נסה שוב</button>
      )}
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
            <span className="badge badge-saffron" style={{ marginBottom:14 }}>לחץ לגלות</span>
            <div className="persian" style={{ fontSize:34, fontWeight:700, color:"white", textAlign:"center" }}>{word.persian}</div>
            <div style={{ fontSize:12, opacity:.6, marginTop:7, color:"white", fontStyle:"italic" }}>{word.transliteration}</div>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="badge" style={{ background:"rgba(255,255,255,.2)", color:"white", marginBottom:14 }}>תרגום</span>
            <div className="hebrew" style={{ fontSize:24, fontWeight:700, color:"white", textAlign:"center" }}>{word.hebrew}</div>
            <div style={{ fontSize:11, opacity:.65, marginTop:7, color:"white" }}>{word.category}</div>
          </div>
        </div>
      </div>
      {flipped && (
        <div style={{ display:"flex", gap:9 }}>
          <button className="btn" style={{ background:"rgba(220,50,50,.09)", color:"#dc3232", border:"2px solid #dc3232" }}
            onClick={() => { setFlipped(false); onReview(); }}>😅 עוד פעם</button>
          <button className="btn btn-primary" onClick={() => { setFlipped(false); onKnown(); }}>✓ ידעתי!</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGES
// ============================================================

function Dashboard({ stats, wordOfDay, wordLoading, wordError, refreshWord }) {
  const percent = Math.min(100, (stats.words / 50) * 100);
  const level   = getLevel(stats.xp);

  return (
    <div>
      <div className="card card-indigo fade-up" style={{ textAlign:"center", padding:"26px 18px", marginBottom:14 }}>
        <div style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", opacity:.45, marginBottom:7 }}>ברוך הבא ל</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:"#F4C430", marginBottom:4 }}>
          ITS <span style={{ color:"#00A591" }}>MOMKEN</span>
        </div>
        <div style={{ fontSize:12, opacity:.55, fontStyle:"italic" }}>ללמוד פרסית? ITS MOMKEN.</div>
        <div style={{ marginTop:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>{level.emoji}</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.65)", fontWeight:600 }}>רמה: {level.label}</span>
        </div>
      </div>
      <div className="tile-accent" />
      <div className="stats-grid fade-up-1">
        <div className="stat-card pulse-glow"><div className="stat-val">🔥{stats.streak}</div><div className="stat-label">ימי רצף</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color:"var(--turquoise)" }}>{stats.words}</div><div className="stat-label">מילים</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color:"#b88e10" }}>{stats.xp}</div><div className="stat-label">XP</div></div>
      </div>
      <div className="card fade-up-2">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
          <span style={{ fontSize:13, fontWeight:700 }}>התקדמות היומית</span>
          <span className="badge badge-turquoise">{Math.round(percent)}%</span>
        </div>
        <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width:`${percent}%` }} /></div>
        <div className="xp-label" style={{ marginTop:5 }}><span>{stats.words} מילים שנלמדו</span><span>יעד: 50</span></div>
      </div>

      {/* AI Word of the Day */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div className="section-title" style={{ marginBottom:0 }}>✨ מילה היום</div>
        <span className="ai-badge">✦ Gemini AI</span>
      </div>
      {wordLoading && <LoadingCard lines={3} label="Gemini מייצר מילת יום..." />}
      {wordError   && <ErrorCard message="לא הצלחנו לטעון את מילת היום" onRetry={refreshWord} />}
      {!wordLoading && !wordError && wordOfDay && (
        <div className="card card-turquoise fade-up-3">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span className="ai-badge" style={{ background:"rgba(255,255,255,.15)", color:"white", border:"1px solid rgba(255,255,255,.3)" }}>✦ AI Generated</span>
            <AudioButton text={wordOfDay.persian} />
          </div>
          <div className="persian" style={{ fontSize:34, fontWeight:700, color:"white", textAlign:"right", marginBottom:5 }}>{wordOfDay.persian}</div>
          <div style={{ fontSize:13, fontStyle:"italic", opacity:.75, color:"white", marginBottom:8 }}>{wordOfDay.transliteration}</div>
          <div className="hebrew" style={{ fontSize:17, fontWeight:700, color:"white", textAlign:"right", marginBottom:11 }}>{wordOfDay.hebrew}</div>
          <div style={{ background:"rgba(255,255,255,.13)", borderRadius:11, padding:"9px 13px", marginBottom: wordOfDay.grammarNote ? 9 : 0 }}>
            <div className="persian" style={{ fontSize:13, color:"white", textAlign:"right", opacity:.9 }}>{wordOfDay.example}</div>
            <div className="hebrew" style={{ fontSize:12, color:"white", textAlign:"right", opacity:.65, marginTop:3 }}>{wordOfDay.exampleHe}</div>
          </div>
          {wordOfDay.grammarNote && (
            <div style={{ background:"rgba(255,255,255,.1)", borderRadius:10, padding:"8px 12px", borderRight:"3px solid rgba(255,255,255,.4)" }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.6)", marginBottom:3, fontWeight:700, textTransform:"uppercase", letterSpacing:.5 }}>📚 הערת דקדוק</div>
              <div className="hebrew" style={{ fontSize:12, color:"white", direction:"rtl", textAlign:"right", lineHeight:1.6, opacity:.85 }}>{wordOfDay.grammarNote}</div>
            </div>
          )}
        </div>
      )}

      <div className="section-title fade-up-4">🏆 הישגים</div>
      {[
        { icon:"🔥", color:"rgba(244,100,48,.1)",  label:"3 ימי רצף",        sublabel:"Consistency? ITS MOMKEN.",  unlocked: stats.streak >= 3  },
        { icon:"📚", color:"rgba(0,165,145,.1)",   label:"12 מילים ראשונות", sublabel:"Vocabulary? ITS MOMKEN.",   unlocked: stats.words  >= 12 },
        { icon:"💬", color:"rgba(31,42,68,.07)",   label:"שיחה ראשונה",      sublabel:"Conversation? ITS MOMKEN.", unlocked: stats.xp     >= 20 },
      ].map((a, i) => (
        <div className="achievement" key={i} style={{ opacity: a.unlocked ? 1 : .35 }}>
          <div className="achievement-icon" style={{ background:a.color }}>{a.icon}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:13 }}>{a.label}</div>
            <div className="motiv-text">{a.sublabel}</div>
          </div>
          {a.unlocked && <div style={{ marginLeft:"auto", color:"#F4C430", fontSize:17 }}>★</div>}
        </div>
      ))}
      <button className="wa-btn" style={{ marginTop:6 }} onClick={() => window.open("https://wa.me/","_blank")}>
        <span style={{ fontSize:19 }}>💬</span> הצטרף לקהילת ITS MOMKEN בוואטסאפ
      </button>
    </div>
  );
}

// ── AI Chat Tutor ─────────────────────────────────────────────
function Chat({ stats, setStats }) {
  const [scenario,     setScenario]     = useState("bazaar");
  const [mode,         setMode]         = useState("formal");
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [isTyping,     setIsTyping]     = useState(false);
  const [grammarNote,  setGrammarNote]  = useState(null);
  const [apiError,     setApiError]     = useState(null);
  const bottomRef = useRef();

  const persianKeys = [
    {char:"ا"},{char:"ب"},{char:"پ",unique:true},{char:"ت"},
    {char:"ث"},{char:"ج"},{char:"چ",unique:true},{char:"ح"},
    {char:"خ"},{char:"د"},{char:"ذ"},{char:"ر"},
    {char:"ز"},{char:"ژ",unique:true},{char:"س"},{char:"ش"},
  ];

  // Load scenario opener
  useEffect(() => {
    const s = starterDialogues[scenario];
    setMessages([{ role:"ai", id:Date.now(), ...s }]);
    setGrammarNote(null);
    setApiError(null);
  }, [scenario]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    const userMsg = { role:"user", persian:text, id:Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setApiError(null);
    try {
      const history = messages.slice(-8);
      const reply   = await fetchTutorReply(history, text, mode);
      if (!reply?.persian) throw new Error("Empty reply");
      setMessages(prev => [...prev, {
        role:"ai", id:Date.now()+1,
        persian:         applySlang(reply.persian, mode),
        transliteration: applySlang(reply.transliteration, mode),
        hebrew:          reply.hebrew,
        correction:      reply.correction,
      }]);
      setStats(s => ({ ...s, xp: s.xp + 5 }));
      if (reply.correction) {
        setGrammarNote({ title:"✏️ תיקון — Dariush מסביר", body:reply.correction });
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        role:"ai", id:Date.now()+2,
        persian:"ببخشید، مشکلی پیش آمد. دوباره امتحان کنید.",
        transliteration:"Bebakhshid, moshkeli pish amad.",
        hebrew:"סליחה, הייתה שגיאה. נסה שוב.",
        correction:null,
      }]);
      setApiError("לא הצלחנו להתחבר ל-Gemini. בדוק את VITE_GEMINI_API_KEY ואת החיבור.");
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, mode, setStats]);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div className="section-title" style={{ marginBottom:0 }}>💬 מורה AI — داریوش</div>
        <span className="ai-badge">✦ Gemini</span>
      </div>

      <div className="toggle-container">
        <button className={`toggle-option ${mode==="formal"?"active":""}`} onClick={()=>{setMode("formal");setGrammarNote(null);}}>🎩 רשמי</button>
        <button className={`toggle-option ${mode==="slang"?"active":""}`}  onClick={()=>{setMode("slang"); setGrammarNote(null);}}>😎 סלנג</button>
      </div>
      {mode==="slang" && (
        <div style={{ display:"flex",alignItems:"center",gap:7,background:"rgba(244,196,48,.1)",border:"1px solid rgba(244,196,48,.28)",borderRadius:10,padding:"7px 11px",marginBottom:12,fontSize:12,color:"#9a7208",fontWeight:700 }}>
          😎 מצב סלנג פעיל
        </div>
      )}

      <div className="chips-wrap">
        {scenarios.map(s => (
          <button key={s.id} className={`chip ${scenario===s.id?"active":""}`} onClick={()=>setScenario(s.id)}>{s.label}</button>
        ))}
      </div>

      <div style={{ background:"rgba(0,165,145,.06)",border:"1px solid rgba(0,165,145,.15)",borderRadius:12,padding:"9px 13px",marginBottom:14,fontSize:12,color:"var(--turquoise)",fontWeight:600,direction:"rtl",textAlign:"right" }}>
        🎭 תרחיש: {scenarios.find(s=>s.id===scenario)?.label} — כתוב בפרסית ו-Dariush יתקן ויסביר
      </div>

      {/* Messages */}
      <div className="card" style={{ minHeight:260, maxHeight:400, overflowY:"auto" }}>
        <div className="chat-container">
          {messages.map(m => (
            <div key={m.id} className={`chat-bubble ${m.role==="ai"?"chat-ai":"chat-user"}`}>
              {m.role==="ai" && (
                <>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:7,marginBottom:4 }}>
                    <AudioButton text={m.persian} />
                    <div className="persian" style={{ fontSize:15,fontWeight:600,textAlign:"right",flex:1 }}>{m.persian}</div>
                  </div>
                  {m.transliteration && <div style={{ fontSize:11,fontStyle:"italic",color:"rgba(0,0,0,.38)",marginBottom:3 }}>{m.transliteration}</div>}
                  {m.hebrew && <div className="hebrew" style={{ fontSize:13,color:"var(--indigo)",textAlign:"right" }}>{m.hebrew}</div>}
                  {m.correction && <div className="chat-correction">✏️ {m.correction}</div>}
                  {mode==="slang" && <div style={{ marginTop:5,fontSize:9,color:"#9a7208",background:"rgba(244,196,48,.1)",borderRadius:5,padding:"2px 6px",display:"inline-block",fontWeight:700 }}>😎 סלנג</div>}
                </>
              )}
              {m.role==="user" && <div style={{ fontWeight:600,fontFamily:"Vazirmatn,sans-serif" }}>{m.persian}</div>}
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble chat-ai" style={{ maxWidth:80 }}>
              <div className="typing-dots"><span/><span/><span/></div>
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      {grammarNote && (
        <div className="grammar-callout fade-up">
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7 }}>
            <div style={{ fontSize:13,fontWeight:700,color:"var(--indigo)",flex:1,lineHeight:1.4 }}>{grammarNote.title}</div>
            <button onClick={()=>setGrammarNote(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(0,0,0,.22)",fontSize:15,padding:"0 0 0 7px" }}>✕</button>
          </div>
          <div className="hebrew" style={{ fontSize:13,direction:"rtl",textAlign:"right",lineHeight:1.85,color:"var(--charcoal)",whiteSpace:"pre-line" }}>{grammarNote.body}</div>
          <div style={{ marginTop:9,display:"flex",justifyContent:"flex-end" }}>
            <span className="badge badge-turquoise">📚 הערת מורה AI</span>
          </div>
        </div>
      )}

      {apiError && (
        <div style={{ background:"rgba(220,50,50,.06)",border:"1px solid rgba(220,50,50,.2)",borderRadius:12,padding:"9px 13px",marginBottom:10,fontSize:12,color:"#dc3232",direction:"rtl",textAlign:"right" }}>
          ⚠️ {apiError}
        </div>
      )}

      <div className="chat-input-area">
        <input className="chat-input persian" style={{ direction:"rtl",textAlign:"right" }}
          placeholder="כתוב פרסית לדריוש..."
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
          disabled={isTyping}
        />
        <button className="chat-send" onClick={sendMessage} disabled={isTyping}>
          {isTyping ? <div className="spinner" style={{ width:16,height:16,borderWidth:2 }}/> : "➤"}
        </button>
      </div>

      <div className="card" style={{ marginTop:11 }}>
        <div style={{ fontSize:10,fontWeight:700,color:"rgba(0,0,0,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>⌨️ לוח מקשים</div>
        <div style={{ fontSize:9,marginBottom:9 }}>
          <span style={{ background:"rgba(244,196,48,.16)",color:"#9a7208",borderRadius:4,padding:"2px 6px",fontWeight:700,border:"1px solid rgba(244,196,48,.38)" }}>★ צהוב = ייחודי לפרסית</span>
        </div>
        <div className="keyboard-grid">
          {persianKeys.map(k => (
            <button key={k.char} className={`key-btn ${k.unique?"key-btn-unique":""}`}
              onClick={()=>setInput(i=>i+k.char)} title={k.unique?"אות ייחודית לפרסית":k.char}>
              {k.char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Vocabulary ─────────────────────────────────────────────────
function Vocabulary({ stats, setStats }) {
  const [view,     setView]     = useState("grid");
  const [flashIdx, setFlashIdx] = useState(0);
  const [learned,  setLearned]  = useState(new Set());
  const [filter,   setFilter]   = useState("all");

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
        <button className={`toggle-option ${view==="grid" ?"active":""}`} onClick={()=>setView("grid")}>🔲 גריד</button>
        <button className={`toggle-option ${view==="flash"?"active":""}`} onClick={()=>setView("flash")}>🃏 פלאשכרטות</button>
      </div>
      {view==="flash" && (
        <>
          <div className="card" style={{ background:"rgba(0,165,145,.06)",textAlign:"center",marginBottom:11,padding:"11px 14px" }}>
            <span className="badge badge-turquoise">{flashIdx+1} / {vocabulary.length}</span>
            <span style={{ fontSize:12,color:"rgba(0,0,0,.38)",marginRight:9 }}>לחץ לתרגום</span>
          </div>
          <Flashcard word={vocabulary[flashIdx]} onKnown={handleKnown} onReview={()=>setFlashIdx(i=>(i+1)%vocabulary.length)} />
        </>
      )}
      {view==="grid" && (
        <>
          <div style={{ display:"flex",gap:7,overflowX:"auto",marginBottom:14,paddingBottom:3 }} className="scrollbar-hide">
            {categories.map(c => (
              <button key={c} className={`chip ${filter===c?"active":""}`} onClick={()=>setFilter(c)}>{c==="all"?"🌟 הכל":c}</button>
            ))}
          </div>
          <div className="vocab-grid">
            {filtered.map(w => (
              <div key={w.id} className={`vocab-card ${learned.has(w.id)?"learned":""}`}>
                {learned.has(w.id) && <span style={{ fontSize:9,color:"var(--turquoise)",fontWeight:700 }}>✓ למדת</span>}
                <div className="persian" style={{ fontSize:22,fontWeight:700,color:"var(--indigo)",marginBottom:3,textAlign:"center" }}>{w.persian}</div>
                <div style={{ fontSize:10,fontStyle:"italic",color:"rgba(0,0,0,.38)",marginBottom:3 }}>{w.transliteration}</div>
                <div className="hebrew" style={{ fontSize:12,fontWeight:700,color:"var(--turquoise)",textAlign:"center" }}>{w.hebrew}</div>
                <div style={{ marginTop:7 }} className="badge badge-indigo">{w.category}</div>
              </div>
            ))}
          </div>
          <div className="card card-saffron" style={{ marginTop:14,textAlign:"center" }}>
            <div style={{ fontSize:13,fontWeight:700,marginBottom:3 }}>קוגנאטים: מילים משותפות</div>
            <div style={{ fontSize:11,opacity:.65 }}>עברית, ערבית ופרסית חולקות שורשים!</div>
            <div style={{ marginTop:9,display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap" }}>
              {[["שלום","سلام"],["ספר","کتاب"],["זמן","زمان"],["חשבון","حساب"]].map(([he,fa])=>(
                <div key={he} style={{ background:"rgba(255,255,255,.55)",borderRadius:9,padding:"5px 9px",fontSize:11,fontWeight:600 }}>
                  <span style={{ fontFamily:"Heebo,sans-serif" }}>{he}</span>{" ↔ "}
                  <span style={{ fontFamily:"Vazirmatn,sans-serif" }}>{fa}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Culture ────────────────────────────────────────────────────
function Culture({ cultureCards }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <div className="section-title">🕌 מרכז תרבות</div>
      <div className="card" style={{ background:"linear-gradient(135deg,var(--saffron),#e8b020)",marginBottom:14,textAlign:"center" }}>
        <div style={{ fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"rgba(0,0,0,.45)",marginBottom:5 }}>CULTURE HUB</div>
        <div style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"var(--indigo)" }}>הבן את איראן מהצד השני</div>
        <div style={{ fontSize:12,color:"rgba(0,0,0,.45)",marginTop:3,fontStyle:"italic" }}>Cultural literacy? ITS MOMKEN.</div>
      </div>
      {cultureCards.map((card,i) => (
        <div key={card.id} className="card fade-up" style={{ animationDelay:`${i*.05}s` }}>
          <div style={{ display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer" }} onClick={()=>setExpanded(expanded===card.id?null:card.id)}>
            <div style={{ width:48,height:48,borderRadius:15,background:"rgba(0,165,145,.09)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>{card.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700,fontSize:14,marginBottom:2 }}>{card.title}</div>
              <div className="persian" style={{ fontSize:12,color:"var(--turquoise)" }}>{card.titlePersian}</div>
            </div>
            <div style={{ color:"rgba(0,0,0,.25)",fontSize:16,flexShrink:0 }}>{expanded===card.id?"▲":"▼"}</div>
          </div>
          {expanded===card.id && (
            <div style={{ marginTop:14,paddingTop:14,borderTop:"1px solid rgba(0,0,0,.06)" }}>
              <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:7 }}><AudioButton text={card.persian} /></div>
              <div className="persian" style={{ fontSize:15,fontWeight:500,direction:"rtl",textAlign:"right",lineHeight:1.8,marginBottom:9 }}>{card.persian}</div>
              <div style={{ fontSize:12,fontStyle:"italic",color:"rgba(0,0,0,.38)",marginBottom:7 }}>{card.transliteration}</div>
              <div style={{ height:1,background:"rgba(0,165,145,.13)",margin:"9px 0" }} />
              <div className="hebrew" style={{ fontSize:13,direction:"rtl",textAlign:"right",color:"var(--indigo)",fontWeight:500,lineHeight:1.7 }}>{card.hebrew}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── News (AI-powered) ──────────────────────────────────────────
function News({ stats, setStats, newsItems, newsLoading, newsError, refreshNews }) {
  const [quizState, setQuizState] = useState({});
  const [sharedIds, setSharedIds] = useState(new Set());
  const [revealed,  setRevealed]  = useState(new Set());

  const toggleReveal = id => setRevealed(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const handleAnswer = (nid, j, ans) => {
    if (quizState[nid]) return;
    const correct = j === ans;
    setQuizState(s => ({ ...s, [nid]:{ selected:j, correct } }));
   if (correct) setStats(s => ({ ...s, xp: s.xp + 15, words: s.words + 1 }));
  };
function News({ stats, setStats, newsItems, newsLoading, newsError, refreshNews }) {
  // תוודאי ששלוש השורות האלו נמצאות כאן:
  const [quizState, setQuizState] = useState({});
  const [sharedIds, setSharedIds] = useState(new Set());
  const [revealed, setRevealed] = useState(new Set());

  // וגם הפונקציות האלו שמופעלות בלחיצה על כפתורים:
  const toggleReveal = id => setRevealed(prev => {
    const n = new Set(prev); 
    n.has(id) ? n.delete(id) : n.add(id); 
    return n;
  });

  const handleAnswer = (id, idx, correct) => {
    if (quizState[id]) return;
    const isCorrect = idx === correct;
    setQuizState(prev => ({ ...prev, [id]: { correct: isCorrect } }));
    if (isCorrect) setStats(prev => ({ ...prev, xp: prev.xp + 15, words: prev.words + 1 }));
  };
}
  // כאן מתחיל ה-return שלך..
  
 return (
    <div className="fade-up">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div className="section-title" style={{ margin:0 }}>
          <span className="ai-badge">✨ Gemini AI</span> חדשות היום
        </div>
        <button onClick={refreshNews} className="audio-btn" style={{ marginLeft:"auto" }}>🔄 רענן</button>
      </div>

      {newsLoading ? (
        <div style={{ textAlign:"center", padding:40 }}><div className="spinner"></div></div>
      ) : newsError ? (
        <div className="card" style={{ color:"#dc3232", textAlign:"center" }}>{newsError}</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {newsItems.map((n) => (
            <div key={n.id} className="news-card fade-up">
              <div className="news-header">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div className="persian" style={{ color:"var(--saffron)", fontSize:16, fontWeight:600, lineHeight:1.4, textAlign:"right" }}>{n.title}</div>
                    <div className="hebrew" style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginTop:4, textAlign:"right" }}>{n.titleHebrew}</div>
                  </div>
                </div>
              </div>
              
              <div className="news-body">
                <button onClick={() => toggleReveal(n.id)} className="btn-show" style={{ width:"100%", padding:8, fontSize:12, marginBottom:12, borderRadius:8 }}>
                  {revealed.has(n.id) ? "🔼 הסתר תרגום" : "🔽 הצג תוכן ותרגום"}
                </button>

                {revealed.has(n.id) && (
                  <div className="fade-up" style={{ marginBottom:15 }}>
                    <div className="persian" style={{ fontSize:15, lineHeight:1.6, textAlign:"right", marginBottom:10, padding:10, borderRadius:8, background:"rgba(255,255,255,0.05)" }}>
                       {n.content || n.persian}
                    </div>
                    <div className="hebrew" style={{ fontSize:14, lineHeight:1.5, textAlign:"right", color:"rgba(255,255,255,0.8)", borderRight:"3px solid var(--turquoise)", paddingRight:10 }}>
                       {n.contentHebrew || n.hebrew}
                    </div>
                  </div>
                )}

                {/* חלק המבחן */}
                {n.quiz && n.quiz.length > 0 && (
                  <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.1)" }}>
                    {!quizState[n.id] ? (
                      <>
                        <div style={{ fontSize:12, fontWeight:700, marginBottom:8, color:"var(--turquoise)" }}>🧠 בחן את עצמך:</div>
                        <div className="hebrew" style={{ fontSize:13, textAlign:"right", marginBottom:8 }}>{n.quiz[0].q}</div>
                        {n.quiz[0].options.map((opt, j) => (
                          <button key={j} className="quiz-opt" onClick={() => handleAnswer(n.id, j, n.quiz[0].answer)} style={{ width:"100%", textAlign:"right", marginBottom:5 }}>
                            {opt}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div style={{ textAlign:"center", padding:10, background:quizState[n.id].correct ? "rgba(0,165,145,0.15)" : "rgba(220,50,50,0.15)", borderRadius:8 }}>
                        {quizState[n.id].correct ? "✅ מעולה! +15 XP" : "❌ לא נכון, נסה שוב!"}
                      </div>
                    )}
                  </div>
                )}

                {/* כפתור שיתוף */}
                <div style={{ marginTop:12, height:1, background:"rgba(255,255,255,0.1)" }} />
                <button className="btn-share" style={{ background:"none", border:"none", color:"#25D366", fontSize:12, marginTop:8, cursor:"pointer", width:"100%" }}>
                   💬 שתף בקהילה
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ── Progress ───────────────────────────────────────────────────
function Progress({ stats, setStats }) {
  const level   = getLevel(stats.xp);
  const nextLev = LEVELS[LEVELS.indexOf(level)+1];
  const xpPct   = nextLev ? Math.round(((stats.xp-level.minXP)/(nextLev.minXP-level.minXP))*100) : 100;
  const handleReset = () => {
    const f = { streak:0, words:0, xp:0 };
    setStats(f);
    try { localStorage.setItem("momken_stats", JSON.stringify(f)); } catch {}
  };
  return (
    <div>
      <div className="section-title">📊 ההתקדמות שלי</div>
      <div className="card card-turquoise" style={{ textAlign:"center",marginBottom:14 }}>
        <div style={{ fontSize:44 }}>{level.emoji}</div>
        <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"white",marginTop:7 }}>{level.label}</div>
        <div style={{ fontSize:11,color:"rgba(255,255,255,.6)",marginTop:3 }}>Fluency? ITS MOMKEN.</div>
        {nextLev && (
          <div style={{ marginTop:13 }}>
            <div className="xp-label" style={{ color:"rgba(255,255,255,.55)" }}>
              <span>רמה: {level.label}</span><span>{nextLev.minXP-stats.xp} XP → {nextLev.label}</span>
            </div>
            <div style={{ background:"rgba(255,255,255,.2)",borderRadius:10,height:7,overflow:"hidden",marginTop:4 }}>
              <div style={{ height:"100%",background:"white",borderRadius:10,width:`${xpPct}%`,transition:"width .7s ease" }} />
            </div>
          </div>
        )}
      </div>
      <div className="stats-grid">
        {[{icon:"🔥",val:stats.streak,label:"ימי רצף"},{icon:"📖",val:stats.words,label:"מילים"},{icon:"⭐",val:stats.xp,label:"XP"}].map(s=>(
          <div className="stat-card" key={s.label}><div style={{ fontSize:19 }}>{s.icon}</div><div className="stat-val">{s.val}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      <div className="section-title" style={{ marginTop:6 }}>🗺️ מפת דרכים</div>
      {LEVELS.map((m,i) => {
        const unlocked = stats.xp >= m.minXP;
        return (
          <div className="achievement" key={i} style={{ opacity:unlocked?1:.35 }}>
            <div className="achievement-icon" style={{ background:unlocked?"rgba(0,165,145,.11)":"rgba(0,0,0,.05)",fontSize:22 }}>{m.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700,fontSize:13 }}>{m.label}</div>
              <div style={{ fontSize:11,color:"rgba(0,0,0,.35)" }}>נדרש: {m.minXP} XP</div>
              <div className="progress-bar-wrap" style={{ marginTop:5 }}>
                <div className="progress-bar-fill" style={{ width:`${Math.min(100,(stats.xp/Math.max(m.minXP,1))*100)}%` }} />
              </div>
            </div>
            {unlocked && <div style={{ color:"#F4C430",fontSize:18,marginLeft:7 }}>★</div>}
          </div>
        );
      })}
      <div className="card" style={{ textAlign:"center",marginTop:7,background:"rgba(220,50,50,.03)",border:"1px dashed rgba(220,50,50,.18)" }}>
        <div style={{ fontSize:11,color:"rgba(0,0,0,.35)",marginBottom:7 }}>לאפס את ההתקדמות</div>
        <button className="btn" style={{ background:"rgba(220,50,50,.07)",color:"#dc3232",border:"1px solid rgba(220,50,50,.18)" }} onClick={handleReset}>🔄 התחל מחדש</button>
      </div>
    </div>
  );
}

// ============================================================
// NAV + APP ROOT
// ============================================================

const navItems = [
  { id:"dashboard", label:"בית",   icon:"🏠" },
  { id:"chat",      label:"שיחה",  icon:"💬" },
  { id:"vocab",     label:"מילים", icon:"📖" },
  { id:"culture",   label:"תרבות", icon:"🕌" },
  { id:"news",      label:"חדשות", icon:"📰" },
];

export default function App() {
// 1. ניהול העמודים
  const [page, setPage] = useState("dashboard");

  // 2. שמירה על הניקוד והרצף (Persistent stats)
  const [stats, setStats] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem("momken_stats"));
      return s && typeof s.xp === "number" ? s : { streak:3, words:12, xp:75 };
    } catch { return { streak:3, words:12, xp:75 }; }
  });

  // 3. הגדרת החדשות והתרבות
  const [newsItems, setNewsItems] = useState(newsData);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);
  const [cultureCardsState, setCultureCardsState] = useState(cultureData);

  // 4. מילת היום
  const [wordOfDay, setWordOfDay] = useState(null);
  const [wordLoading, setWordLoading] = useState(true);
  const [wordError, setWordError] = useState(false);
  // 5. אפקטים בסיסיים
  useEffect(() => { injectStyles(); }, []);
  useEffect(() => {
    try { localStorage.setItem("momken_stats", JSON.stringify(stats)); } catch {}
  }, [stats]);
  const loadWord = useCallback(async () => {
    console.log("loadWord trigger started..."); // בדיקה ב-Console
    setWordLoading(true); 
    setWordError(false);
    try {
      const w = await fetchWordOfDay();
      console.log("Word received in loadWord:", w); // בדיקה מה חזר
      if (w) {
        setWordOfDay(w);
      } else {
        throw new Error("No data returned");
      }
    } catch (err) { 
      console.error("LoadWord Error:", err);
      setWordOfDay(fallbackWordOfDay); 
      setWordError(true); 
    }
    finally { setWordLoading(false); }
  }, []);

  const loadNews = useCallback(async () => {
    setNewsLoading(true); setNewsError(false);
    try {
      const items = await fetchAINews();
      if (Array.isArray(items) && items.length > 0) setNewsItems(items);
      else throw new Error("empty");
    } catch { setNewsItems(newsData); setNewsError(true); }
    finally { setNewsLoading(false); }
  }, []);

  useEffect(() => { loadWord(); loadNews(); }, [loadWord, loadNews]);

  const pageProps = {
    dashboard: { stats, wordOfDay, wordLoading, wordError, refreshWord: loadWord },
    chat:      { stats, setStats },
    vocab:     { stats, setStats },
    // כאן היה הנתק - עכשיו חיברנו את המידע למסך
    culture:   { cultureCards: cultureCardsState }, 
    news:      { stats, setStats, newsItems, newsLoading, newsError, refreshNews: loadNews },
    progress:  { stats, setStats },
  };

  const pages = { dashboard:Dashboard, chat:Chat, vocab:Vocabulary, culture:Culture, news:News, progress:Progress };
  const PageComp = pages[page] || Dashboard;

  return (
    <div className="app-shell">
      <div className="header">
        <div className="header-logo">ITS <span>MOMKEN</span></div>
        <div style={{ display:"flex", gap:6 }}>
          <button className="header-badge hb-fire">🔥 {stats.streak}</button>
          <button className="header-badge hb-xp" onClick={()=>setPage("progress")}>⭐ {stats.xp} XP</button>
        </div>
      </div>
      <div className="content">
        <PageComp {...pageProps[page]} />
      </div>
      <nav className="bottom-nav">
        {navItems.map(n => (
          <button key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
            <span className="nav-icon">{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
