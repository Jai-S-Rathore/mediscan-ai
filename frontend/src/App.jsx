import { useState, useEffect } from "react";
import axios from "axios";

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

const NO_POLLY = [
  "Tamil", "Telugu", "Chinese (Mandarin)",
  "Arabic", "Welsh", "Icelandic", "Catalan"
];

const REGION_LANGUAGE_MAP = {
  "Tamil Nadu": "Tamil", "Andhra Pradesh": "Telugu",
  "Telangana": "Telugu", "Maharashtra": "Marathi",
  "Karnataka": "Kannada", "Kerala": "Malayalam",
  "Gujarat": "Gujarati", "Punjab": "Punjabi",
  "West Bengal": "Bengali", "Rajasthan": "Hindi",
  "Uttar Pradesh": "Hindi", "Madhya Pradesh": "Hindi",
  "Bihar": "Hindi", "Delhi": "Hindi", "Haryana": "Hindi",
  "France": "French (France)", "Germany": "German",
  "Spain": "Spanish (Spain)", "Italy": "Italian",
  "Japan": "Japanese", "South Korea": "Korean",
  "China": "Chinese (Mandarin)", "Russia": "Russian",
  "Turkey": "Turkish", "Netherlands": "Dutch",
  "Sweden": "Swedish", "Norway": "Norwegian",
  "Denmark": "Danish", "Poland": "Polish",
  "Brazil": "Portuguese (Brazil)", "Portugal": "Portuguese (EU)",
  "Saudi Arabia": "Arabic", "United Arab Emirates": "Arabic",
  "United Kingdom": "English (UK)", "Australia": "English (Australia)",
  "United States": "English (US)", "Canada": "English (US)",
  "India": "Hindi",
};

const UI_TEXT = {
  "English (US)": {
    upload_title: "Upload Medicine Image",
    upload_hint: "Photo of medicine strip, bottle or box",
    upload_tap: "Click or tap to upload",
    upload_format: "JPG, PNG supported",
    lang_title: "Select Language",
    lang_hint: "Auto-detected from your location",
    lang_search: "Search language...",
    analyze_btn: "Analyze Medicine",
    analyzing: "Analyzing...",
    upload_first: "Please upload a medicine image first",
    result_title: "Analysis Result",
    voice_title: "Voice Accessibility",
    voice_hint: "Listen to medicine info in your language",
    listen_btn: "Listen",
    generating: "Generating...",
    audio_ready: "Audio ready",
    disclaimer: "For informational purposes only. Always consult a doctor.",
    detecting: "Detecting location...",
    location_set: "Language auto-set for",
  },
  "Tamil": {
    upload_title: "மருந்து படம் பதிவேற்றவும்",
    upload_hint: "மருந்து பட்டை அல்லது பாட்டிலின் படம்",
    upload_tap: "பதிவேற்ற தட்டவும்",
    upload_format: "JPG, PNG ஆதரிக்கப்படுகிறது",
    lang_title: "மொழி தேர்ந்தெடுக்கவும்",
    lang_hint: "உங்கள் இருப்பிடத்திலிருந்து தானாக கண்டறியப்பட்டது",
    lang_search: "மொழி தேடுங்கள்...",
    analyze_btn: "மருந்தை பகுப்பாய்வு செய்",
    analyzing: "பகுப்பாய்வு செய்கிறது...",
    upload_first: "முதலில் படத்தை பதிவேற்றவும்",
    result_title: "பகுப்பாய்வு முடிவு",
    voice_title: "குரல் அணுகல்",
    voice_hint: "மருந்து தகவலை உங்கள் மொழியில் கேளுங்கள்",
    listen_btn: "கேளுங்கள்",
    generating: "உருவாக்குகிறது...",
    audio_ready: "ஆடியோ தயார்",
    disclaimer: "இது தகவல் நோக்கங்களுக்காக மட்டுமே. மருத்துவரை அணுகவும்.",
    detecting: "இருப்பிடம் கண்டறிகிறது...",
    location_set: "மொழி அமைக்கப்பட்டது",
  },
  "Telugu": {
    upload_title: "మందుల చిత్రం అప్‌లోడ్ చేయండి",
    upload_hint: "మందుల స్ట్రిప్ లేదా బాటిల్ ఫోటో",
    upload_tap: "అప్‌లోడ్ చేయడానికి నొక్కండి",
    upload_format: "JPG, PNG మద్దతు",
    lang_title: "భాష ఎంచుకోండి",
    lang_hint: "మీ స్థానం ఆధారంగా స్వయంచాలకంగా గుర్తించబడింది",
    lang_search: "భాష వెతకండి...",
    analyze_btn: "మందును విశ్లేషించండి",
    analyzing: "విశ్లేషిస్తోంది...",
    upload_first: "దయచేసి ముందు చిత్రం అప్‌లోడ్ చేయండి",
    result_title: "విశ్లేషణ ఫలితం",
    voice_title: "వాయిస్ యాక్సెసిబిలిటీ",
    voice_hint: "మీ భాషలో మందుల సమాచారం వినండి",
    listen_btn: "వినండి",
    generating: "రూపొందిస్తోంది...",
    audio_ready: "ఆడియో సిద్ధంగా ఉంది",
    disclaimer: "ఇది సమాచార ప్రయోజనాల కోసం మాత్రమే. వైద్యుడిని సంప్రదించండి.",
    detecting: "స్థానాన్ని గుర్తిస్తోంది...",
    location_set: "భాష సెట్ చేయబడింది",
  },
  "Hindi": {
    upload_title: "दवाई की तस्वीर अपलोड करें",
    upload_hint: "दवाई की पट्टी या बोतल की फोटो",
    upload_tap: "अपलोड करने के लिए टैप करें",
    upload_format: "JPG, PNG समर्थित",
    lang_title: "भाषा चुनें",
    lang_hint: "आपके स्थान से स्वचालित रूप से पहचाना गया",
    lang_search: "भाषा खोजें...",
    analyze_btn: "दवाई का विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    upload_first: "पहले तस्वीर अपलोड करें",
    result_title: "विश्लेषण परिणाम",
    voice_title: "आवाज सुलभता",
    voice_hint: "अपनी भाषा में दवाई की जानकारी सुनें",
    listen_btn: "सुनें",
    generating: "बन रहा है...",
    audio_ready: "ऑडियो तैयार है",
    disclaimer: "यह केवल जानकारी के लिए है। डॉक्टर से परामर्श लें।",
    detecting: "स्थान पता लगाया जा रहा है...",
    location_set: "भाषा सेट की गई",
  },
  "German": {
    upload_title: "Medikamentenbild hochladen",
    upload_hint: "Foto von Medikamentenstreifen oder Flasche",
    upload_tap: "Zum Hochladen tippen",
    upload_format: "JPG, PNG unterstützt",
    lang_title: "Sprache auswählen",
    lang_hint: "Automatisch anhand Ihres Standorts erkannt",
    lang_search: "Sprache suchen...",
    analyze_btn: "Medikament analysieren",
    analyzing: "Analysiere...",
    upload_first: "Bitte zuerst ein Bild hochladen",
    result_title: "Analyseergebnis",
    voice_title: "Sprachzugang",
    voice_hint: "Hören Sie Medikamenteninformationen",
    listen_btn: "Anhören",
    generating: "Wird erstellt...",
    audio_ready: "Audio bereit",
    disclaimer: "Nur zu Informationszwecken. Arzt konsultieren.",
    detecting: "Standort wird erkannt...",
    location_set: "Sprache gesetzt für",
  },
  "French (France)": {
    upload_title: "Télécharger l'image",
    upload_hint: "Photo de la plaquette ou bouteille",
    upload_tap: "Appuyez pour télécharger",
    upload_format: "JPG, PNG pris en charge",
    lang_title: "Sélectionner la langue",
    lang_hint: "Détecté automatiquement",
    lang_search: "Rechercher...",
    analyze_btn: "Analyser le médicament",
    analyzing: "Analyse...",
    upload_first: "Veuillez d'abord télécharger une image",
    result_title: "Résultat",
    voice_title: "Accessibilité vocale",
    voice_hint: "Écoutez les informations sur le médicament",
    listen_btn: "Écouter",
    generating: "Génération...",
    audio_ready: "Audio prêt",
    disclaimer: "À titre informatif uniquement. Consultez un médecin.",
    detecting: "Détection...",
    location_set: "Langue définie pour",
  },
  "Spanish (Spain)": {
    upload_title: "Subir imagen del medicamento",
    upload_hint: "Foto de la tira o botella",
    upload_tap: "Toca para subir",
    upload_format: "JPG, PNG compatible",
    lang_title: "Seleccionar idioma",
    lang_hint: "Detectado automáticamente",
    lang_search: "Buscar idioma...",
    analyze_btn: "Analizar medicamento",
    analyzing: "Analizando...",
    upload_first: "Por favor sube una imagen primero",
    result_title: "Resultado",
    voice_title: "Accesibilidad de voz",
    voice_hint: "Escucha información del medicamento",
    listen_btn: "Escuchar",
    generating: "Generando...",
    audio_ready: "Audio listo",
    disclaimer: "Solo informativo. Consulte a un médico.",
    detecting: "Detectando...",
    location_set: "Idioma configurado para",
  },
};

const getUI = (lang) => UI_TEXT[lang] || UI_TEXT["English (US)"];

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
          const state   = data.address?.state || "";
          const country = data.address?.country || "";
          const detected = REGION_LANGUAGE_MAP[state] || REGION_LANGUAGE_MAP[country] || "English (US)";
          if (LANGUAGES.includes(detected)) {
            setLanguage(detected);
            setLocationMsg(getUI(detected).location_set + " " + (state || country));
          } else {
            setLocationMsg("📍 " + (state || country));
          }
        } catch {
        setDetecting(false);}
      },
      () => setDetecting(false)
    );
  };

  const filtered = LANGUAGES.filter(l =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
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
      const res = await axios.post("https://mediscan-ai-production-e2f1.up.railway.app/analyze", fd);
      setResult(res.data);
      setActiveStep(3);
    } catch {
      setError("Analysis failed. Make sure backend is running.");
    }
    setLoading(false);
  };

  const handleSpeak = async () => {
    if (!result) return;
    setSpeaking(true); setError(null); setAudioUrl(null);
    try {
      const fd = new FormData();
      if (NO_POLLY.includes(language)) {
        fd.append("text", "Medicine: " + result.medicine_name + ". Info displayed in " + language + " on screen.");
        fd.append("language", "English (US)");
      } else {
        fd.append("text", result.details);
        fd.append("language", language);
      }
      const res = await axios.post("https://mediscan-ai-5ozx.onrender.com", fd, { responseType: "blob" });
      setAudioUrl(URL.createObjectURL(new Blob([res.data], { type: "audio/mpeg" })));
    } catch {
      setError("Audio generation failed.");
    }
    setSpeaking(false);
  };

  const formatDetails = (text) =>
    text.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      if (line.startsWith("MEDICINE:"))
        return (
          <div key={i} style={c.medNameWrap}>
            <span style={c.medIcon}>💊</span>
            <span style={c.medNameText}>{line.replace("MEDICINE:", "").trim()}</span>
          </div>
        );
      if (/^(USES|DOSAGE|SIDE EFFECTS|WARNINGS|DISCLAIMER):/.test(line)) {
        const icons = { USES:"🟢", DOSAGE:"💧", "SIDE EFFECTS":"⚠️", WARNINGS:"🔴", DISCLAIMER:"ℹ️" };
        const label = line.split(":")[0];
        return (
          <div key={i} style={c.sectionLabel}>
            <span>{icons[label] || "•"}</span>
            <span>{line}</span>
          </div>
        );
      }
      if (line.startsWith("-") || /^\d+\./.test(line))
        return <p key={i} style={c.bullet}>{line}</p>;
      return <p key={i} style={c.bodyText}>{line}</p>;
    });

  const steps = [
    { num: 1, label: ui.upload_title },
    { num: 2, label: ui.lang_title },
    { num: 3, label: ui.result_title },
  ];

  return (
    <div style={c.page}>

      {/* ── Top Bar ── */}
      <div style={c.topBar}>
        <div style={c.topBarLeft}>
          <span style={c.logo}>⚕</span>
          <span style={c.logoText}>MediScan <span style={c.logoGreen}>AI</span></span>
        </div>
        <div style={c.topBarRight}>
          {/* <span style={c.awsChip}>🟠 Bedrock</span>
          <span style={c.awsChip}>🔵 Nova</span>
          <span style={c.awsChip}>🟢 Polly</span> */}
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={c.hero}>
        {/* <div style={c.heroBadge}>Amazon Nova AI Hackathon</div> */}
        <h1 style={c.heroTitle}>Medicine Recognition</h1>
        <h2 style={c.heroSub}>& Safety Assistant</h2>
        <p style={c.heroDesc}>
          Upload a medicine image → Get instant AI-powered safety information In your language
        </p>

        {/* Location Bar */}
        <div style={c.locBar}>
          {detecting ? (
            <span style={c.locText}>📍 {ui.detecting}</span>
          ) : locationMsg ? (
            <>
              <span style={c.locTextGreen}>📍 {locationMsg}</span>
              <button onClick={detectLocation} style={c.redetectBtn}>↻ Re-detect</button>
            </>
          ) : null}
        </div>
      </div>

      {/* ── Step Progress ── */}
      <div style={c.stepRow}>
        {steps.map((st, i) => (
          <div key={st.num} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              ...c.stepItem,
              borderColor: activeStep >= st.num ? "#22c55e" : "#334155",
              background: activeStep >= st.num ? "#022c22" : "#0f172a",
            }}>
              <div style={{
                ...c.stepNum,
                background: activeStep >= st.num
                  ? "linear-gradient(135deg,#22c55e,#16a34a)"
                  : "#1e293b",
                color: activeStep >= st.num ? "#fff" : "#475569",
              }}>{st.num}</div>
              <span style={{
                fontSize: 12,
                color: activeStep >= st.num ? "#22c55e" : "#475569",
                fontWeight: activeStep >= st.num ? 600 : 400,
              }}>{st.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                ...c.stepLine,
                background: activeStep > st.num ? "#22c55e" : "#1e293b",
              }} />
            )}
          </div>
        ))}
      </div>

      <div style={c.body}>

        {/* ── Card 1: Upload ── */}
        <div style={c.card}>
          <div style={c.cardHeader}>
            <div style={c.cardNum}>1</div>
            <div>
              <h3 style={c.cardTitle}>{ui.upload_title}</h3>
              <p style={c.cardHint}>{ui.upload_hint}</p>
            </div>
          </div>

          <label style={{
            ...c.uploadZone,
            borderColor: preview ? "#22c55e" : "#334155",
            background: preview ? "#022c22" : "#0a0f1e",
          }}>
            {preview ? (
              <div style={{ position: "relative", width: "100%" }}>
                <img src={preview} alt="preview" style={c.previewImg} />
                <div style={c.previewOverlay}>✅ {image?.name}</div>
              </div>
            ) : (
              <div style={c.uploadInner}>
                <div style={c.uploadIcon}>📷</div>
                <p style={c.uploadTap}>{ui.upload_tap}</p>
                <p style={c.uploadFmt}>{ui.upload_format}</p>
              </div>
            )}
            <input type="file" accept="image/*"
              onChange={handleImage} style={{ display: "none" }} />
          </label>
        </div>

        {/* ── Card 2: Language ── */}
        <div style={c.card}>
          <div style={c.cardHeader}>
            <div style={c.cardNum}>2</div>
            <div>
              <h3 style={c.cardTitle}>{ui.lang_title}</h3>
              <p style={c.cardHint}>{ui.lang_hint}</p>
            </div>
          </div>

          <input
            type="text"
            placeholder={"🔍 " + ui.lang_search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={c.searchBox}
          />

          <div style={c.langGrid}>
            {filtered.map((l) => (
              <button key={l}
                onClick={() => { setLanguage(l); setSearch(""); }}
                style={{
                  ...c.langBtn,
                  background: language === l ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#0f172a",
                  border: language === l ? "1.5px solid #22c55e" : "1.5px solid #1e293b",
                  color: language === l ? "#fff" : "#94a3b8",
                  fontWeight: language === l ? 700 : 400,
                  transform: language === l ? "scale(1.04)" : "scale(1)",
                  boxShadow: language === l ? "0 2px 12px rgba(34,197,94,0.3)" : "none",
                }}>
                {l}
              </button>
            ))}
          </div>

          <div style={c.selectedPill}>
            <span style={{ color: "#64748b", fontSize: 13 }}>Selected:</span>
            <span style={c.selectedLang}>🌍 {language}</span>
            {NO_POLLY.includes(language)
              ? <span style={c.chipBlue}>English Voice</span>
              : <span style={c.chipGreen}>Amazon Polly</span>}
          </div>
        </div>

        {/* ── Analyze Button ── */}
        <button
          onClick={handleAnalyze}
          disabled={!image || loading}
          style={{
            ...c.analyzeBtn,
            opacity: !image || loading ? 0.5 : 1,
            cursor: !image || loading ? "not-allowed" : "pointer",
          }}>
          {loading
            ? <><span style={c.spinner}>⏳</span> {ui.analyzing}</>
            : <>🔬 {ui.analyze_btn}</>}
        </button>

        {!image && <p style={c.uploadFirst}>⬆ {ui.upload_first}</p>}
        {error && (
          <div style={c.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Card 3: Results ── */}
        {result && (
          <div style={{ ...c.card, borderColor: "#22c55e" }}>
            <div style={c.cardHeader}>
              <div style={{ ...c.cardNum, background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>3</div>
              <div>
                <h3 style={c.cardTitle}>{ui.result_title}</h3>
                <div style={c.resultMeta}>
                  <span style={c.metaChip}>💊 {result.medicine_name}</span>
                  <span style={c.metaChip}>🌍 {result.language}</span>
                </div>
              </div>
            </div>

            <div style={c.divider} />
            <div style={c.resultBody}>
              {formatDetails(result.details)}
            </div>

            {/* ── Voice Section ── */}
            <div style={c.voiceBox}>
              <div style={c.voiceHeader}>
                <span style={c.voiceIcon}>🔊</span>
                <div>
                  <p style={c.voiceTitle}>{ui.voice_title}</p>
                  <p style={c.voiceHint}>{ui.voice_hint}</p>
                </div>
              </div>

              <div style={c.voiceEngine}>
                {NO_POLLY.includes(language)
                  ? <span style={{ color: "#38bdf8", fontSize: 12 }}>🌐 Voice: English (Amazon Polly) · Text: {language}</span>
                  : <span style={{ color: "#22c55e", fontSize: 12 }}>🟢 Amazon Polly · Native {language} voice</span>}
              </div>

              <button
                onClick={handleSpeak}
                disabled={speaking}
                style={{
                  ...c.listenBtn,
                  opacity: speaking ? 0.6 : 1,
                  cursor: speaking ? "not-allowed" : "pointer",
                }}>
                {speaking ? "🔊 " + ui.generating : "🔊 " + ui.listen_btn + " — " + language}
              </button>

              {audioUrl && (
                <div style={c.audioBox}>
                  <p style={{ color: "#22c55e", fontSize: 13, marginBottom: 8 }}>
                    ✅ {ui.audio_ready}
                  </p>
                  <audio controls src={audioUrl} style={{ width: "100%", borderRadius: 8 }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={c.footer}>
        <div style={c.footerInner}>
          <span style={c.footerLogo}>⚕ MediScan AI</span>
          <span style={c.footerDivider}>|</span>
          <span style={{ color: "#475569", fontSize: 12 }}>⚕️ {ui.disclaimer}</span>
        </div>
        <p style={c.footerSub}>
          Amazon Bedrock · Nova Vision · Nova Text · Amazon Polly · OpenStreetMap
          <p>© 2026 MediScan AI Jai Singh Rathore. All Rights Reserved.</p>
        </p>
      </footer>
    </div>
  );
}

const GREEN  = "#22c55e";
const DGREEN = "#16a34a";
const BG     = "#030712";
const CARD   = "#0d1117";
const BORDER = "#1e293b";

const c = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: BG,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#f1f5f9",
    overflowX: "hidden",
  },

  // Top Bar
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 32px",
    borderBottom: "1px solid " + BORDER,
    background: "#030712",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  topBarLeft: { display: "flex", alignItems: "center", gap: 10 },
  logo: { fontSize: 22, color: GREEN },
  logoText: { fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: -0.5 },
  logoGreen: { color: GREEN },
  topBarRight: { display: "flex", gap: 8 },
  awsChip: {
    background: "#0d1117",
    border: "1px solid " + BORDER,
    color: "#94a3b8",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
  },

  // Hero
  hero: {
    textAlign: "center",
    padding: "60px 20px 40px",
    background: "radial-gradient(ellipse at top, #052e16 0%, #030712 60%)",
    borderBottom: "1px solid " + BORDER,
  },
  heroBadge: {
    display: "inline-block",
    background: "#052e16",
    border: "1px solid " + GREEN,
    color: GREEN,
    borderRadius: 20,
    padding: "4px 16px",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 800,
    margin: 0,
    background: "linear-gradient(135deg, #f1f5f9, " + GREEN + ")",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: 1.1,
  },
  heroSub: {
    fontSize: 32,
    fontWeight: 700,
    margin: "6px 0 16px",
    color: "#64748b",
  },
  heroDesc: {
    color: "#64748b",
    fontSize: 15,
    maxWidth: 480,
    margin: "0 auto 24px",
    lineHeight: 1.7,
  },
  locBar: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    background: "#0d1117",
    border: "1px solid " + BORDER,
    borderRadius: 20,
    padding: "6px 18px",
    fontSize: 13,
  },
  locText: { color: "#94a3b8" },
  locTextGreen: { color: GREEN },
  redetectBtn: {
    background: "transparent",
    border: "1px solid " + BORDER,
    color: "#64748b",
    padding: "2px 10px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 12,
  },

  // Steps
  stepRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px 20px",
    gap: 0,
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    borderRadius: 12,
    border: "1px solid",
    background: "#0f172a",
    minWidth: 110,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
  },
  stepLine: {
    width: 32,
    height: 2,
    borderRadius: 2,
  },

  // Body
  body: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "0 20px 60px",
  },

  // Cards
  card: {
    background: CARD,
    border: "1px solid " + BORDER,
    borderRadius: 16,
    padding: 28,
    marginBottom: 20,
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  },
  cardNum: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg," + GREEN + "," + DGREEN + ")",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 4px",
    color: "#f1f5f9",
  },
  cardHint: { fontSize: 13, color: "#64748b", margin: 0 },

  // Upload
  uploadZone: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed",
    borderRadius: 12,
    minHeight: 200,
    cursor: "pointer",
    overflow: "hidden",
    transition: "all 0.2s",
  },
  uploadInner: { textAlign: "center", padding: 28 },
  uploadIcon: { fontSize: 52, marginBottom: 12 },
  uploadTap: { fontSize: 17, fontWeight: 600, color: "#e2e8f0", margin: "0 0 6px" },
  uploadFmt: { fontSize: 13, color: "#475569", margin: 0 },
  previewImg: { width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 10 },
  previewOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    background: "rgba(0,0,0,0.7)",
    color: GREEN,
    fontSize: 12,
    padding: "3px 10px",
    borderRadius: 8,
  },

  // Language
  searchBox: {
    width: "100%",
    padding: "11px 16px",
    background: "#030712",
    border: "1px solid " + BORDER,
    borderRadius: 10,
    color: "#f1f5f9",
    fontSize: 14,
    marginBottom: 14,
    boxSizing: "border-box",
    outline: "none",
  },
  langGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 7,
    maxHeight: 240,
    overflowY: "auto",
  },
  langBtn: {
    padding: "9px 6px",
    borderRadius: 8,
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.12s",
    textAlign: "center",
  },
  selectedPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    padding: "9px 14px",
    background: "#030712",
    border: "1px solid " + BORDER,
    borderRadius: 10,
    flexWrap: "wrap",
  },
  selectedLang: { color: GREEN, fontWeight: 700, fontSize: 14 },
  chipGreen: {
    background: "#052e16",
    color: GREEN,
    border: "1px solid " + GREEN,
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 11,
    marginLeft: "auto",
  },
  chipBlue: {
    background: "#0c1a2e",
    color: "#38bdf8",
    border: "1px solid #38bdf8",
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 11,
    marginLeft: "auto",
  },

  // Analyze Button
  analyzeBtn: {
    width: "100%",
    padding: "17px 0",
    fontSize: 18,
    fontWeight: 700,
    background: "linear-gradient(135deg," + GREEN + "," + DGREEN + ")",
    border: "none",
    borderRadius: 12,
    color: "#fff",
    cursor: "pointer",
    marginBottom: 12,
    letterSpacing: 0.3,
    boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  spinner: { display: "inline-block" },
  uploadFirst: {
    textAlign: "center",
    color: "#475569",
    fontSize: 14,
    marginBottom: 20,
  },
  errorBox: {
    background: "#1a0505",
    border: "1px solid #7f1d1d",
    color: "#fca5a5",
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 16,
  },

  // Results
  divider: {
    height: 1,
    background: BORDER,
    margin: "16px 0",
  },
  resultMeta: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 },
  metaChip: {
    background: "#052e16",
    border: "1px solid " + GREEN,
    color: GREEN,
    padding: "3px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  resultBody: { lineHeight: 1.9, fontSize: 15 },
  medNameWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 0",
    borderBottom: "1px solid " + BORDER,
    marginBottom: 8,
  },
  medIcon: { fontSize: 24 },
  medNameText: { fontSize: 22, fontWeight: 800, color: "#f1f5f9" },
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    marginBottom: 4,
    fontSize: 15,
    fontWeight: 700,
    color: GREEN,
  },
  bullet: { color: "#94a3b8", margin: "4px 0 4px 24px", fontSize: 14, lineHeight: 1.7 },
  bodyText: { color: "#94a3b8", margin: "3px 0", fontSize: 14 },

  // Voice
  voiceBox: {
    marginTop: 24,
    padding: 20,
    background: "#030712",
    borderRadius: 12,
    border: "1px solid " + BORDER,
  },
  voiceHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  voiceIcon: { fontSize: 24 },
  voiceTitle: { margin: 0, fontWeight: 700, fontSize: 15, color: "#f1f5f9" },
  voiceHint: { margin: "2px 0 0", fontSize: 12, color: "#475569" },
  voiceEngine: {
    padding: "7px 12px",
    background: "#0d1117",
    borderRadius: 8,
    marginBottom: 12,
    border: "1px solid " + BORDER,
  },
  listenBtn: {
    width: "100%",
    padding: "14px 0",
    fontSize: 16,
    fontWeight: 700,
    background: "linear-gradient(135deg,#0284c7,#0369a1)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(2,132,199,0.3)",
  },
  audioBox: {
    marginTop: 14,
    padding: "12px 14px",
    background: "#0d1117",
    borderRadius: 10,
    border: "1px solid #134e4a",
  },

  // Footer
  footer: {
    borderTop: "1px solid " + BORDER,
    padding: "20px 32px",
    background: "#030712",
    textAlign: "center",
  },
  footerInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 6,
  },
  footerLogo: { color: GREEN, fontWeight: 700, fontSize: 14 },
  footerDivider: { color: BORDER },
  footerSub: { color: "#1e293b", fontSize: 11, margin: 0 },
};