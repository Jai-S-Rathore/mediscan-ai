import { useState, useEffect } from "react";
import axios from "axios";

// Google Fonts loaded via style injection
const fontStyle = document.createElement("style");
fontStyle.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    background: #f5f0e8;
    font-family: 'DM Sans', sans-serif;
    cursor: default;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    pointer-events: none;
    z-index: 0;
  }

  .card-hover {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 60px rgba(15,60,50,0.12);
  }

  .lang-btn-custom {
    transition: all 0.15s ease;
  }
  .lang-btn-custom:hover {
    background: #0f3c32 !important;
    color: #f5f0e8 !important;
  }

  .analyze-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .analyze-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .analyze-btn:hover::after { opacity: 1; }
  .analyze-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(15,60,50,0.35); }
  .analyze-btn:active { transform: translateY(0); }

  .grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 999;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  .fade-up { animation: fadeUp 0.6s ease forwards; }
  .fade-up-2 { animation: fadeUp 0.6s 0.15s ease both; }
  .fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }

  .step-line {
    height: 2px;
    background: repeating-linear-gradient(90deg, #0f3c32 0px, #0f3c32 6px, transparent 6px, transparent 12px);
    opacity: 0.2;
    flex: 1;
  }

  .upload-zone {
    transition: all 0.25s ease;
    border: 2px dashed #c5bba8;
    cursor: pointer;
  }
  .upload-zone:hover {
    border-color: #0f3c32;
    background: rgba(15,60,50,0.04) !important;
  }

  .result-section { animation: fadeUp 0.5s ease forwards; }

  audio::-webkit-media-controls-panel { background: #f5f0e8; }
`;
document.head.appendChild(fontStyle);

const LANGUAGES = [
  "English (US)", "English (UK)", "English (Australia)",
  "Hindi", "Tamil", "Telugu",
  "Spanish (Spain)", "Spanish (US)",
  "French (France)", "French (Canada)",
  "German", "Italian",
  "Portuguese (Brazil)", "Portuguese (EU)",
  "Japanese", "Korean", "Chinese (Mandarin)",
  "Arabic", "Dutch", "Russian", "Turkish",
  "Swedish", "Norwegian", "Danish", "Polish",
  "Romanian", "Welsh", "Icelandic", "Catalan", "Finnish",
];

const NO_POLLY = ["Tamil", "Telugu", "Chinese (Mandarin)", "Arabic", "Welsh", "Icelandic", "Catalan"];

const REGION_LANGUAGE_MAP = {
  "Tamil Nadu": "Tamil", "Andhra Pradesh": "Telugu", "Telangana": "Telugu",
  "Maharashtra": "Hindi", "Karnataka": "Hindi", "Kerala": "Hindi",
  "Gujarat": "Hindi", "Punjab": "Hindi", "West Bengal": "Hindi",
  "Rajasthan": "Hindi", "Uttar Pradesh": "Hindi", "Delhi": "Hindi",
  "France": "French (France)", "Germany": "German", "Spain": "Spanish (Spain)",
  "Italy": "Italian", "Japan": "Japanese", "South Korea": "Korean",
  "China": "Chinese (Mandarin)", "Russia": "Russian", "Turkey": "Turkish",
  "Netherlands": "Dutch", "Sweden": "Swedish", "Norway": "Norwegian",
  "Denmark": "Danish", "Poland": "Polish", "Brazil": "Portuguese (Brazil)",
  "Portugal": "Portuguese (EU)", "Saudi Arabia": "Arabic",
  "United Kingdom": "English (UK)", "Australia": "English (Australia)",
  "United States": "English (US)", "Canada": "English (US)", "India": "Hindi",
};

const UI_TEXT = {
  "English (US)": {
    upload_title: "Upload Medicine Image",
    upload_hint: "Photo of strip, bottle, or box",
    upload_tap: "Drop image here or click to browse",
    lang_title: "Select Language",
    lang_hint: "Results & voice in your chosen language",
    lang_search: "Search 30 languages...",
    analyze_btn: "Analyse Medicine",
    analyzing: "Analysing...",
    upload_first: "Upload an image to continue",
    result_title: "Analysis",
    voice_title: "Listen",
    voice_hint: "Voice explanation for accessibility",
    listen_btn: "Play Voice",
    generating: "Generating...",
    disclaimer: "For informational use only. Always consult a doctor.",
    detecting: "Locating you...",
    location_set: "Language set for",
  },
  "Tamil": {
    upload_title: "மருந்து படம்",
    upload_hint: "பட்டை அல்லது பாட்டில் படம்",
    upload_tap: "படத்தை இங்கே இழுக்கவும்",
    lang_title: "மொழி தேர்வு",
    lang_hint: "உங்கள் மொழியில் முடிவுகள்",
    lang_search: "மொழி தேடு...",
    analyze_btn: "பகுப்பாய்வு செய்",
    analyzing: "செயலாக்குகிறது...",
    upload_first: "படத்தை பதிவேற்றவும்",
    result_title: "பகுப்பாய்வு",
    voice_title: "கேளுங்கள்",
    voice_hint: "குரல் விளக்கம்",
    listen_btn: "குரல் கேளு",
    generating: "உருவாக்குகிறது...",
    disclaimer: "இது தகவல் நோக்கங்களுக்காக மட்டுமே. மருத்துவரை அணுகவும்.",
    detecting: "இருப்பிடம்...",
    location_set: "மொழி அமைக்கப்பட்டது",
  },
  "Hindi": {
    upload_title: "दवाई की तस्वीर",
    upload_hint: "पट्टी या बोतल की फोटो",
    upload_tap: "यहाँ छोड़ें या क्लिक करें",
    lang_title: "भाषा चुनें",
    lang_hint: "आपकी भाषा में परिणाम",
    lang_search: "भाषा खोजें...",
    analyze_btn: "विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    upload_first: "पहले तस्वीर अपलोड करें",
    result_title: "विश्लेषण",
    voice_title: "सुनें",
    voice_hint: "आवाज विवरण",
    listen_btn: "आवाज सुनें",
    generating: "बन रहा है...",
    disclaimer: "केवल जानकारी के लिए। डॉक्टर से परामर्श लें।",
    detecting: "स्थान खोज रहे हैं...",
    location_set: "भाषा सेट",
  },
  "Telugu": {
    upload_title: "మందుల చిత్రం",
    upload_hint: "స్ట్రిప్ లేదా బాటిల్ ఫోటో",
    upload_tap: "ఇక్కడ వదలండి లేదా క్లిక్ చేయండి",
    lang_title: "భాష ఎంచుకోండి",
    lang_hint: "మీ భాషలో ఫలితాలు",
    lang_search: "భాష వెతకండి...",
    analyze_btn: "విశ్లేషించండి",
    analyzing: "విశ్లేషిస్తోంది...",
    upload_first: "చిత్రం అప్‌లోడ్ చేయండి",
    result_title: "విశ్లేషణ",
    voice_title: "వినండి",
    voice_hint: "వాయిస్ వివరణ",
    listen_btn: "వాయిస్ వినండి",
    generating: "రూపొందిస్తోంది...",
    disclaimer: "సమాచార నోక్కు మాత్రమే. వైద్యుడిని సంప్రదించండి.",
    detecting: "స్థానం గుర్తిస్తోంది...",
    location_set: "భాష సెట్",
  },
};

const getUI = (lang) => UI_TEXT[lang] || UI_TEXT["English (US)"];

const BACKEND = "https://mediscan-ai-5ozx.onrender.com";

export default function App() {
  const [image, setImage]             = useState(null);
  const [preview, setPreview]         = useState(null);
  const [language, setLanguage]       = useState("English (US)");
  const [search, setSearch]           = useState("");
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [speaking, setSpeaking]       = useState(false);
  const [audioUrl, setAudioUrl]       = useState(null);
  const [error, setError]             = useState(null);
  const [locationMsg, setLocationMsg] = useState("");
  const [detecting, setDetecting]     = useState(true);
  const [activeStep, setActiveStep]   = useState(1);

  const ui = getUI(language);

  useEffect(() => { detectLocation(); }, []);

  const detectLocation = () => {
    setDetecting(true);
    if (!navigator.geolocation) { setDetecting(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const state   = data.address?.state   || "";
          const country = data.address?.country || "";
          const detected = REGION_LANGUAGE_MAP[state] || REGION_LANGUAGE_MAP[country] || "English (US)";
          if (LANGUAGES.includes(detected)) {
            setLanguage(detected);
            setLocationMsg(`${getUI(detected).location_set}: ${state || country}`);
          } else {
            setLocationMsg(state || country);
          }
        } catch {

        }
        setDetecting(false);
      },
      () => setDetecting(false)
    );
  };

  const filtered = LANGUAGES.filter(l => l.toLowerCase().includes(search.toLowerCase()));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file); setPreview(URL.createObjectURL(file));
    setResult(null); setError(null); setAudioUrl(null);
    setActiveStep(2);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setImage(file); setPreview(URL.createObjectURL(file));
    setResult(null); setError(null); setAudioUrl(null);
    setActiveStep(2);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true); setError(null); setResult(null); setAudioUrl(null);
    try {
      const fd = new FormData();
      fd.append("file", image);
      fd.append("language", language);
      const res = await axios.post(`${BACKEND}/analyze`, fd, { timeout: 120000 });
      setResult(res.data);
      setActiveStep(3);
    } catch {
      setError("Connection failed. Please try again in a moment.");
    }
    setLoading(false);
  };

  const handleSpeak = async () => {
    if (!result) return;
    setSpeaking(true); setError(null); setAudioUrl(null);
    try {
      const fd = new FormData();
      if (NO_POLLY.includes(language)) {
        fd.append("text", `Medicine: ${result.medicine_name}. Information displayed in ${language} on screen.`);
        fd.append("language", "English (US)");
      } else {
        fd.append("text", result.details);
        fd.append("language", language);
      }
      const res = await axios.post(`${BACKEND}/speak`, fd, { responseType: "blob", timeout: 60000 });
      setAudioUrl(URL.createObjectURL(new Blob([res.data], { type: "audio/mpeg" })));
    } catch {
      setError("Voice generation failed. Please try again.");
    }
    setSpeaking(false);
  };

  const formatDetails = (text) =>
    text.split("\n").map((line, i) => {
      if (!line.trim()) return null;
      if (line.startsWith("MEDICINE:"))
        return (
          <div key={i} style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 3, color: "#8a7a60", textTransform: "uppercase", marginBottom: 6 }}>Identified</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#0f3c32", fontWeight: 900, lineHeight: 1.1 }}>
              {line.replace("MEDICINE:", "").trim()}
            </h2>
          </div>
        );
      const sectionMap = { "USES:": ["Uses", "#c8401e"], "DOSAGE:": ["Dosage", "#0f3c32"], "SIDE EFFECTS:": ["Side Effects", "#8a4800"], "WARNINGS:": ["Warnings", "#8a0000"], "DISCLAIMER:": ["Note", "#8a7a60"] };
      for (const [key, [label, color]] of Object.entries(sectionMap)) {
        if (line.startsWith(key)) return (
          <div key={i} style={{ marginTop: 20, marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 3, height: 18, background: color, borderRadius: 2, flexShrink: 0 }} />
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 2, color, textTransform: "uppercase", fontWeight: 500 }}>{label}</p>
          </div>
        );
      }
      if (line.startsWith("-") || /^\d+\./.test(line))
        return <p key={i} style={{ color: "#3d3328", fontSize: 15, lineHeight: 1.75, paddingLeft: 14, borderLeft: "2px solid #e8e0d0", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{line.replace(/^-\s*/, "")}</p>;
      return <p key={i} style={{ color: "#5a4f42", fontSize: 15, lineHeight: 1.75, marginBottom: 4 }}>{line}</p>;
    });

  const steps = [
    { n: "01", label: ui.upload_title },
    { n: "02", label: ui.lang_title },
    { n: "03", label: ui.result_title },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", position: "relative", overflow: "hidden" }}>
      <div className="grain" />

      {/* Background blobs */}
      <div className="blob" style={{ width: 600, height: 600, background: "#0f3c32", top: -200, right: -100 }} />
      <div className="blob" style={{ width: 400, height: 400, background: "#c8401e", bottom: 100, left: -150 }} />
      <div className="blob" style={{ width: 300, height: 300, background: "#8a4800", top: "50%", left: "40%" }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── NAV ── */}
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(15,60,50,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "#0f3c32", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#f5f0e8", fontSize: 16 }}>⚕</span>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#0f3c32" }}>CheckMed</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a7a60", letterSpacing: 2, marginTop: 2 }}>AI</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["", "", ""].map(t => (
              <span key={t} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 1.5, color: "#8a7a60", padding: "3px 10px", border: "1px solid rgba(15,60,50,0.15)", borderRadius: 20, textTransform: "uppercase" }}>{t}</span>
            ))}
          </div>
        </nav>

        {/* ── HERO ── */}
        <div style={{ textAlign: "center", padding: "60px 20px 40px", maxWidth: 700, margin: "0 auto" }}>
          {detecting ? (
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 2, color: "#8a7a60", marginBottom: 20, textTransform: "uppercase" }}>📍 {ui.detecting}</p>
          ) : locationMsg ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, background: "rgba(15,60,50,0.06)", border: "1px solid rgba(15,60,50,0.12)", borderRadius: 30, padding: "5px 16px" }}>
              <span style={{ color: "#0f3c32", fontSize: 12 }}>📍</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1.5, color: "#0f3c32", textTransform: "uppercase" }}>{locationMsg}</span>
              <button onClick={detectLocation} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7a60", fontSize: 12 }}>↻</button>
            </div>
          ) : null}

          <h1 className="fade-up" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 900, color: "#0f3c32", lineHeight: 1.0, marginBottom: 20 }}>
            Medicine<br /><em style={{ color: "#c8401e" }}>Recognition</em>
          </h1>
          <p className="fade-up-2" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "#8a7a60", maxWidth: 440, margin: "0 auto 16px", lineHeight: 1.6, fontWeight: 300 }}>
            Upload a photo. Get instant safety information in your language. Hear it spoken aloud.
          </p>
        </div>

        {/* ── STEP PROGRESS ── */}
        <div style={{ display: "flex", alignItems: "center", maxWidth: 680, margin: "0 auto 40px", padding: "0 40px" }}>
          {steps.map((st, i) => (
            <div key={st.n} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? "1" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: activeStep > i ? "#0f3c32" : activeStep === i + 1 ? "#0f3c32" : "transparent",
                  border: `2px solid ${activeStep >= i + 1 ? "#0f3c32" : "rgba(15,60,50,0.2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s",
                }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: activeStep >= i + 1 ? "#f5f0e8" : "#8a7a60", fontWeight: 500 }}>{st.n}</span>
                </div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: activeStep >= i + 1 ? "#0f3c32" : "#8a7a60", fontWeight: 500, whiteSpace: "nowrap" }}>{st.label}</span>
              </div>
              {i < steps.length - 1 && <div className="step-line" style={{ margin: "0 16px" }} />}
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 80px" }}>

          {/* ── CARD 1: Upload ── */}
          <div className="card-hover fade-up" style={{ background: "#fff", borderRadius: 24, padding: 36, marginBottom: 16, boxShadow: "0 4px 24px rgba(15,60,50,0.06)", border: "1px solid rgba(15,60,50,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#8a7a60", textTransform: "uppercase", marginBottom: 6 }}>Step 01</p>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#0f3c32", fontWeight: 700 }}>{ui.upload_title}</h3>
                <p style={{ color: "#8a7a60", fontSize: 13, marginTop: 4, fontWeight: 300 }}>{ui.upload_hint}</p>
              </div>
              {image && <div style={{ width: 48, height: 48, background: "#0f3c32", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✓</div>}
            </div>

            <label
              className="upload-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, minHeight: 200, background: "#faf8f4", overflow: "hidden" }}
            >
              {preview ? (
                <div style={{ width: "100%", position: "relative" }}>
                  <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 280, objectFit: "contain", borderRadius: 14, display: "block" }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(15,60,50,0.85)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "4px 14px" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#f5f0e8", letterSpacing: 1 }}>{image?.name}</span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.5 }}>📷</div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#8a7a60", fontWeight: 400 }}>{ui.upload_tap}</p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#b8a898", letterSpacing: 2, marginTop: 8, textTransform: "uppercase" }}>JPG · PNG · WEBP</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
            </label>
          </div>

          {/* ── CARD 2: Language ── */}
          <div className="card-hover fade-up-2" style={{ background: "#fff", borderRadius: 24, padding: 36, marginBottom: 16, boxShadow: "0 4px 24px rgba(15,60,50,0.06)", border: "1px solid rgba(15,60,50,0.07)" }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#8a7a60", textTransform: "uppercase", marginBottom: 6 }}>Step 02</p>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#0f3c32", fontWeight: 700 }}>{ui.lang_title}</h3>
              <p style={{ color: "#8a7a60", fontSize: 13, marginTop: 4, fontWeight: 300 }}>{ui.lang_hint}</p>
            </div>

            <input
              type="text"
              placeholder={ui.lang_search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "12px 18px", background: "#faf8f4", border: "1px solid rgba(15,60,50,0.12)", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#0f3c32", outline: "none", marginBottom: 14, boxSizing: "border-box" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
              {filtered.map(l => (
                <button key={l} className="lang-btn-custom"
                  onClick={() => { setLanguage(l); setSearch(""); }}
                  style={{
                    padding: "10px 8px", borderRadius: 10, fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    cursor: "pointer", textAlign: "center", border: "1.5px solid",
                    background: language === l ? "#0f3c32" : "transparent",
                    borderColor: language === l ? "#0f3c32" : "rgba(15,60,50,0.15)",
                    color: language === l ? "#f5f0e8" : "#5a4f42",
                    transform: language === l ? "scale(1.03)" : "scale(1)",
                  }}>
                  {l}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: "10px 16px", background: "#faf8f4", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#8a7a60", textTransform: "uppercase", letterSpacing: 2 }}>Selected</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0f3c32", fontWeight: 700 }}>{language}</span>
              <span style={{ marginLeft: "auto", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 1.5, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase",
                background: NO_POLLY.includes(language) ? "rgba(138,72,0,0.08)" : "rgba(15,60,50,0.08)",
                color: NO_POLLY.includes(language) ? "#8a4800" : "#0f3c32",
                border: `1px solid ${NO_POLLY.includes(language) ? "rgba(138,72,0,0.2)" : "rgba(15,60,50,0.2)"}`,
              }}>
                {NO_POLLY.includes(language) ? "English Voice" : "Polly Voice"}
              </span>
            </div>
          </div>

          {/* ── ANALYZE BUTTON ── */}
          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={!image || loading}
            style={{
              width: "100%", padding: "20px 0", marginBottom: 16,
              background: !image || loading ? "rgba(15,60,50,0.3)" : "#0f3c32",
              border: "none", borderRadius: 16, cursor: !image || loading ? "not-allowed" : "pointer",
              fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700,
              color: "#f5f0e8", letterSpacing: 0.5,
            }}>
            {loading ? `⏳ ${ui.analyzing}` : `→ ${ui.analyze_btn}`}
          </button>

          {!image && <p style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8a7a60", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>↑ {ui.upload_first}</p>}

          {error && (
            <div style={{ background: "rgba(200,64,30,0.07)", border: "1px solid rgba(200,64,30,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
              <p style={{ color: "#c8401e", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>⚠ {error}</p>
            </div>
          )}

          {/* ── RESULTS ── */}
          {result && (
            <div className="result-section">

              {/* Result Card */}
              <div style={{ background: "#fff", borderRadius: 24, padding: 36, marginBottom: 16, boxShadow: "0 8px 40px rgba(15,60,50,0.10)", border: "1px solid rgba(15,60,50,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#8a7a60", textTransform: "uppercase", marginBottom: 6 }}>Step 03 — {ui.result_title}</p>
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#0f3c32", padding: "4px 12px", background: "rgba(15,60,50,0.07)", borderRadius: 20, letterSpacing: 1.5, textTransform: "uppercase" }}>
                    {result.language}
                  </span>
                </div>
                <div style={{ borderTop: "1px solid rgba(15,60,50,0.08)", paddingTop: 24 }}>
                  {formatDetails(result.details)}
                </div>
              </div>

              {/* Voice Card */}
              <div style={{ background: "#0f3c32", borderRadius: 24, padding: 36, boxShadow: "0 8px 40px rgba(15,60,50,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 3, color: "rgba(245,240,232,0.5)", textTransform: "uppercase", marginBottom: 6 }}>Accessibility</p>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#f5f0e8", fontWeight: 700 }}>{ui.voice_title}</h3>
                    <p style={{ color: "rgba(245,240,232,0.5)", fontSize: 13, marginTop: 4, fontWeight: 300 }}>{ui.voice_hint}</p>
                  </div>
                  <div style={{ fontSize: 28, opacity: 0.7 }}>🔊</div>
                </div>

                <div style={{ background: "rgba(245,240,232,0.07)", borderRadius: 10, padding: "8px 14px", marginBottom: 16, border: "1px solid rgba(245,240,232,0.1)" }}>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(245,240,232,0.5)", letterSpacing: 1.5, textTransform: "uppercase" }}>
                    {NO_POLLY.includes(language) ? `Voice: English (Amazon Polly) · Text: ${language}` : `Amazon Polly · ${language} native voice`}
                  </p>
                </div>

                <button
                  onClick={handleSpeak}
                  disabled={speaking}
                  style={{
                    width: "100%", padding: "16px 0",
                    background: speaking ? "rgba(245,240,232,0.1)" : "#f5f0e8",
                    border: "none", borderRadius: 12,
                    fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
                    color: speaking ? "rgba(245,240,232,0.5)" : "#0f3c32",
                    cursor: speaking ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}>
                  {speaking ? `⏳ ${ui.generating}` : `▶  ${ui.listen_btn} — ${language}`}
                </button>

                {audioUrl && (
                  <div style={{ marginTop: 16, background: "rgba(245,240,232,0.05)", borderRadius: 12, padding: 14, border: "1px solid rgba(245,240,232,0.1)" }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(245,240,232,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Audio ready</p>
                    <audio controls src={audioUrl} style={{ width: "100%", borderRadius: 8 }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(15,60,50,0.1)", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8a7a60", fontWeight: 300 }}>⚕ {ui.disclaimer}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#b8a898", letterSpacing: 2, textTransform: "uppercase" }}>Bedrock · Nova · Polly</span>
        </footer>
      </div>
    </div>
  );
}