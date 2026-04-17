import { useState, useEffect, useCallback } from "react";
import {
  fetchPlants, upsertPlant, deletePlant,
  loadGreenhouseLocal, saveGreenhouseLocal, uploadPlantImage,
  fetchGreenhouse, addToGreenhouse, removeFromGreenhouse,
  getSession, onAuthStateChange, fetchProfile, signOut
} from "./supabase.js";
import AuthModal from "./components/AuthModal.jsx";
import { HeroRotator, InlinePhoto, PhotoManager } from "./components/PhotoGallery.jsx";
import CollapsibleSection from "./components/CollapsibleSection.jsx";
import ProfilePage, { Avatar } from "./components/ProfilePage.jsx";
import { useTheme, ThemeSelector } from "./components/DarkMode.jsx";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
);

// ─── Global Styles (light + dark) ────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    :root, [data-theme="light"] {
      --cream: #f5f0e6;
      --parchment: #ece5d3;
      --bark: #2b1b11;
      --moss: #4a6741;
      --moss-light: #6a8f5f;
      --stone: #7a6e5e;
      --tan: #c8bea8;
      --warm-white: #faf8f2;
      --header-bg: #2b1b11;
      --nav-bg: #1e1209;
      --card-bg: #faf8f2;
      --page-bg: #f5f0e6;
      --input-bg: #faf8f2;
      --border: #c8bea8;
      --text-primary: #2b1b11;
      --text-secondary: #7a6e5e;
    }
    /* ── Field Guide: bold, informative, high-contrast sans-serif ── */
    [data-theme="field-guide"] {
      --cream: #f4f7fb;
      --parchment: #e8eff8;
      --bark: #1c2b3a;
      --moss: #1e6b44;
      --moss-light: #28955e;
      --stone: #4a6b8a;
      --tan: #a8c0d6;
      --warm-white: #ffffff;
      --header-bg: #1c2b3a;
      --nav-bg: #142030;
      --card-bg: #ffffff;
      --page-bg: #f0f4f8;
      --input-bg: #ffffff;
      --border: #c5d5e8;
      --text-primary: #1c2b3a;
      --text-secondary: #4a6b8a;
    }
    [data-theme="field-guide"] * {
      font-family: 'Inter', system-ui, sans-serif !important;
      letter-spacing: 0.01em !important;
    }
    [data-theme="field-guide"] h1,
    [data-theme="field-guide"] h2,
    [data-theme="field-guide"] h3 {
      font-weight: 800 !important;
      letter-spacing: -0.02em !important;
    }
    [data-theme="field-guide"] .tag {
      border-radius: 4px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      letter-spacing: 0.04em !important;
      padding: 3px 9px !important;
    }
    [data-theme="field-guide"] .btn {
      border-radius: 5px !important;
      font-weight: 700 !important;
      letter-spacing: 0.04em !important;
    }
    [data-theme="field-guide"] .accent-tips li::before {
      width: 10px !important; height: 3px !important;
      border-radius: 1px !important; margin-top: 11px !important;
    }
    [data-theme="field-guide"] .accent-tips-label {
      font-size: 11px !important; letter-spacing: 0.06em !important;
    }

    /* ── Garden Party: colorful cottage garden, one cursive, rounded sans ── */
    [data-theme="garden-party"] {
      --cream: #fdf0fa;
      --parchment: #f8e4f5;
      --bark: #2d1a2e;
      --moss: #6a994e;
      --moss-light: #88c14d;
      --stone: #7c5a8e;
      --tan: #e8c8e0;
      --warm-white: #fffcfe;
      --header-bg: #4a1540;
      --nav-bg: #3a1033;
      --card-bg: #fffcfe;
      --page-bg: #fdf0f8;
      --input-bg: #fffcfe;
      --border: #f0cce8;
      --text-primary: #2d1a2e;
      --text-secondary: #7c5a8e;
    }
    [data-theme="garden-party"] * {
      font-family: 'Nunito', 'Trebuchet MS', sans-serif !important;
      letter-spacing: 0.01em !important;
    }
    [data-theme="garden-party"] h1 {
      font-family: 'Dancing Script', cursive !important;
      font-weight: 700 !important;
      letter-spacing: 0.01em !important;
    }
    [data-theme="garden-party"] .tag {
      border-radius: 20px !important;
      text-transform: none !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      padding: 3px 10px !important;
      background: rgba(106,153,78,0.18) !important;
      border-color: rgba(106,153,78,0.4) !important;
    }
    [data-theme="garden-party"] .btn {
      border-radius: 20px !important;
      font-weight: 800 !important;
      letter-spacing: 0.04em !important;
    }
    [data-theme="garden-party"] .accent-tips li::before {
      width: 8px !important; height: 8px !important;
      background: #c0478a !important;
      border-radius: 50% !important;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--page-bg); transition: background 0.25s ease; }
    ::selection { background: var(--moss); color: var(--cream); }
    textarea, input, select { font-family: inherit; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    .card-enter { animation: fadeIn 0.35s ease forwards; }
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--tan);
      border-top-color: var(--moss);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    .tag {
      display: inline-block;
      background: rgba(74,103,65,0.12); color: var(--moss);
      border: 1px solid rgba(74,103,65,0.28); border-radius: 2px;
      padding: 2px 8px; font-size: 10px;
      font-family: 'Courier Prime', monospace;
      letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700;
    }
    .btn {
      border: none; cursor: pointer;
      font-family: 'Courier Prime', monospace;
      font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
      transition: all 0.18s ease; padding: 9px 20px;
    }
    .btn-primary { background: var(--moss); color: #f5f0e6; }
    .btn-primary:hover { background: var(--moss-light); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-outline { background: transparent; color: var(--bark); border: 1px solid var(--bark); }
    .btn-outline:hover { background: var(--bark); color: var(--cream); }
    .btn-ghost { background: transparent; color: var(--stone); border: 1px solid var(--border); }
    .btn-ghost:hover { border-color: var(--stone); color: var(--bark); }
    .btn-danger { background: transparent; color: #b04040; border: 1px solid #b04040; }
    .btn-danger:hover { background: #b04040; color: white; }

    input[type="text"], input[type="number"], textarea, select {
      background: var(--input-bg); border: 1px solid var(--border);
      padding: 8px 12px; font-size: 15px; color: var(--bark);
      width: 100%; outline: none; transition: border-color 0.15s; border-radius: 2px;
    }
    input[type="text"]:focus, textarea:focus, select:focus { border-color: var(--moss); }
    textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
    label {
      font-family: 'Courier Prime', monospace; font-size: 10px;
      letter-spacing: 0.15em; text-transform: uppercase;
      color: var(--moss); font-weight: 700; display: block; margin-bottom: 5px;
    }
    .form-field { margin-bottom: 16px; }
    .field-hint { font-family: 'Courier Prime', monospace; font-size: 10px; color: var(--stone); margin-top: 4px; }

    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(3px);
      z-index: 100; display: flex; align-items: flex-start; justify-content: center;
      overflow-y: auto; padding: 24px 16px;
    }
    .modal {
      background: var(--cream); border: 1px solid var(--border);
      width: 100%; max-width: 780px; border-radius: 4px;
      animation: fadeIn 0.25s ease; margin: auto;
    }

    .tips-list { display: flex; flex-direction: column; gap: 6px; }
    .tip-row { display: flex; gap: 8px; align-items: flex-start; }
    .tip-row input { flex: 1; }
    .tip-remove { background: transparent; border: none; cursor: pointer; color: var(--stone); font-size: 16px; padding: 6px 4px; line-height: 1; transition: color 0.15s; }
    .tip-remove:hover { color: #b04040; }
    .add-tip-btn { background: transparent; border: 1px dashed var(--border); color: var(--stone); cursor: pointer; padding: 6px 12px; font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.15s; margin-top: 4px; border-radius: 2px; }
    .add-tip-btn:hover { border-color: var(--moss); color: var(--moss); }

    .accent-tips { list-style: none; padding: 0; margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
    .accent-tips li { display: flex; align-items: flex-start; gap: 10px; font-family: 'EB Garamond', Georgia, serif; font-size: 15px; line-height: 1.65; color: var(--bark); }
    .accent-tips li::before { content: ''; display: block; flex-shrink: 0; width: 6px; height: 6px; border-radius: 50%; background: var(--moss); margin-top: 8px; }
    .accent-tips-label { font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--moss); font-weight: 700; margin-bottom: 4px; margin-top: 12px; display: flex; align-items: center; gap: 6px; }
    .accent-tips-label::after { content: ''; flex: 1; height: 1px; background: rgba(74,103,65,0.25); }

    .toast { position: fixed; bottom: 24px; right: 24px; background: var(--bark); color: var(--cream); padding: 12px 20px; border-radius: 3px; font-family: 'Courier Prime', monospace; font-size: 12px; letter-spacing: 0.05em; animation: fadeIn 0.2s ease; z-index: 200; max-width: 320px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
    .toast.success { border-left: 3px solid var(--moss); }
    .toast.error   { border-left: 3px solid #b04040; }

    .image-dropzone { border: 2px dashed var(--border); border-radius: 3px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--input-bg); }
    .image-dropzone:hover, .image-dropzone.drag-over { border-color: var(--moss); background: rgba(74,103,65,0.04); }
    .image-dropzone input { display: none; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--parchment); }
    ::-webkit-scrollbar-thumb { background: var(--tan); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--stone); }
  `}</style>
);

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  water:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z"/></svg>,
  sun:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>,
  pot:         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l-2 10H7L5 8z"/><path d="M3 8h18"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/></svg>,
  scissors:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  warning:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  thermometer: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>,
  seedling:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M12 12C12 8 9 5 5 5s-3 5 1 8 6-1 6-1z"/><path d="M12 12c0-4 3-7 7-7s3 5-1 8-6-1-6-1z"/></svg>,
  leaf:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13C4 6 11 2 19 4c0 8-4 14-8 16z"/><path d="M11 20c0-5.5 3-10 8-12"/></svg>,
  sun2:        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  house:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  upload:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  user:        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const blankPlant = () => ({
  id: "", scientific_name: "", common_names: [""],
  etymology: "", history: "", description: "", tags: [], image: "", photos: [],
  care:        { description: "", tips: [""], commonIssues: "", detail: "" },
  watering:    { frequency: "", blurb: "", detail: "", tips: [""] },
  light:       { idealHours: "", blurb: "", detail: "", tips: [""] },
  medium:      { blurb: "", detail: "", tips: [""] },
  propagation: { blurb: "", detail: "", tips: [""] },
  gardening:   { description: "", tips: [""], startIndoors: "", startOutdoors: "", plantingSeason: "" },
  toxicity:    { blurb: "", description: "" },
  temperature: { idealRange: "", blurb: "", description: "" },
});

function dbToApp(row) {
  return { ...row, scientificName: row.scientific_name, commonNames: row.common_names };
}
function appToDb(plant) {
  const { scientificName, commonNames, ...rest } = plant;
  return {
    ...rest,
    scientific_name: scientificName ?? plant.scientific_name ?? "",
    common_names:    commonNames    ?? plant.common_names    ?? [],
    photos:          plant.photos   ?? [],
  };
}

// ─── AI Auto-fill ─────────────────────────────────────────────────────────────
async function fetchPlantDataFromAI(plantName) {
  const prompt = `You are a botanical expert. Generate comprehensive, accurate data for the plant: "${plantName}".
Return ONLY a valid JSON object — no markdown, no explanation.
{
  "id": "kebab-case-scientific-name",
  "scientific_name": "Full Latin binomial",
  "common_names": ["Primary common name", "Other names"],
  "etymology": "Detailed etymology",
  "history": "Rich historical background",
  "description": "Engaging 1-2 sentence summary",
  "tags": ["tag1","tag2","tag3"],
  "image": "",
  "care": { "description":"","tips":["",""],"commonIssues":"","detail":"" },
  "watering": { "frequency":"","blurb":"One short sentence summarising watering needs","detail":"","tips":[""] },
  "light": { "idealHours":"","blurb":"One short sentence summarising light needs","detail":"","tips":[""] },
  "medium": { "blurb":"One short sentence summarising ideal growing medium","detail":"","tips":[""] },
  "propagation": { "blurb":"One short sentence summarising propagation method","detail":"","tips":[""] },
  "gardening": { "description":"","tips":[],"startIndoors":"","startOutdoors":"","plantingSeason":"" },
  "toxicity": { "blurb":"One short sentence on toxicity status","description":"" },
  "temperature": { "idealRange":"","blurb":"One short sentence on temperature tolerance","description":"" }
}`;

  const res = await fetch("/api/anthropic/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `API error ${res.status}`); }
  const data = await res.json();
  const text = data.content.map(c => c.text || "").join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type}`}>{message}</div>;
}

function TipsList({ tips, onChange }) {
  const update = (i, v) => { const n = [...tips]; n[i] = v; onChange(n); };
  const remove = (i) => onChange(tips.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="tips-list">
        {tips.map((tip, i) => (
          <div key={i} className="tip-row">
            <input value={tip} onChange={e => update(i, e.target.value)} placeholder={`Tip ${i + 1}`} />
            {tips.length > 1 && <button className="tip-remove" onClick={() => remove(i)}>×</button>}
          </div>
        ))}
      </div>
      <button className="add-tip-btn" onClick={() => onChange([...tips, ""])}>+ Add tip</button>
    </div>
  );
}

const AccentTipList = ({ tips, label = "Tips" }) => {
  const f = tips?.filter(t => t?.trim());
  if (!f?.length) return null;
  return (
    <>
      <div className="accent-tips-label">{label}</div>
      <ul className="accent-tips">{f.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </>
  );
};

const InfoBlock = ({ icon, label, children }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
      <span style={{ color: "var(--bark)", display: "flex", alignItems: "center", opacity: 0.85 }}>{icon}</span>
      <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, color: "var(--moss)" }}>{label}</span>
    </div>
    <div style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 16, lineHeight: 1.8, color: "var(--bark)" }}>{children}</div>
  </div>
);

// ─── Plant Form Modal ─────────────────────────────────────────────────────────
function PlantFormModal({ initial, onSave, onDelete, onClose, isAdmin = false }) {
  const [step, setStep] = useState(initial ? "form" : "search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [plant, setPlant] = useState(initial || blankPlant());
  const [activeSection, setActiveSection] = useState("basics");
  const [saving, setSaving] = useState(false);

  const set = (path, val) => {
    setPlant(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true); setSearchError("");
    try {
      const data = await fetchPlantDataFromAI(searchQuery);
      setPlant({ ...blankPlant(), ...data });
      setStep("form");
    } catch (e) {
      console.error("SEARCH ERROR:", e);
      setSearchError("Couldn't fetch plant data — check your API key or fill in manually.");
    } finally { setSearching(false); }
  };

  const handleSave = async () => {
    if (!plant.scientific_name?.trim() && !plant.scientificName?.trim()) return;
    setSaving(true);
    const photos = plant.photos ?? [];
    const cleanTags = typeof plant.tags === "string"
      ? plant.tags.split(",").map(t => t.trim()).filter(Boolean)
      : plant.tags.filter(t => t?.trim());
    const cleanNames = (plant.common_names ?? plant.commonNames ?? [""]).filter(n => n.trim());
    const id = plant.id || (plant.scientific_name || plant.scientificName || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await onSave({ ...plant, id, tags: cleanTags, common_names: cleanNames, commonNames: cleanNames, photos });
    setSaving(false);
  };

  const sections = ["basics", "photos", "care", "watering", "light", "medium", "propagation", "gardening", "other"];
  const name = (plant.common_names ?? plant.commonNames ?? [""])[0] || plant.scientific_name || plant.scientificName || "New Plant";

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ background: "var(--header-bg)", color: "var(--cream)", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, marginBottom: 2 }}>{initial ? "Edit Plant" : "Add to Collection"}</div>
            <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 700 }}>{step === "search" ? "Search for a Plant" : name}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {initial && onDelete && <button className="btn btn-danger" onClick={() => onDelete(plant.id)} style={{ fontSize: 10 }}>Delete</button>}
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#f5f0e6", fontSize: 24, cursor: "pointer", opacity: 0.7 }}>×</button>
          </div>
        </div>

        {step === "search" && (
          <div style={{ padding: "32px 28px" }}>
            <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 17, lineHeight: 1.7, color: "var(--stone)", marginBottom: 20 }}>Enter a plant name and Claude will auto-fill the complete profile.</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input type="text" placeholder="e.g. Fiddle Leaf Fig, Ficus lyrata…" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={handleSearch} disabled={searching} style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}>
                {searching ? <><span className="spinner" style={{ width: 14, height: 14 }} />Searching…</> : "Search"}
              </button>
            </div>
            {searchError && <p style={{ color: "#b04040", fontFamily: "'Courier Prime',monospace", fontSize: 11, marginBottom: 10 }}>{searchError}</p>}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setStep("form")}>Skip — fill in manually →</button>
            </div>
          </div>
        )}

        {step === "form" && (
          <>
            <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid var(--border)", background: "var(--parchment)" }}>
              {sections.map(s => (
                <button key={s} onClick={() => setActiveSection(s)} style={{
                  background: activeSection === s ? "var(--cream)" : "transparent",
                  border: "none", borderBottom: activeSection === s ? "2px solid var(--moss)" : "2px solid transparent",
                  padding: "10px 14px", cursor: "pointer",
                  fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: activeSection === s ? "var(--moss)" : "var(--stone)",
                  whiteSpace: "nowrap", fontWeight: activeSection === s ? 700 : 400, transition: "all 0.15s"
                }}>{s}</button>
              ))}
            </div>

            <div style={{ padding: "24px 28px", maxHeight: "60vh", overflowY: "auto" }}>
              {activeSection === "basics" && (<>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-field"><label>Scientific Name *</label><input value={plant.scientific_name ?? plant.scientificName ?? ""} onChange={e => { set("scientific_name", e.target.value); set("scientificName", e.target.value); }} placeholder="Ficus lyrata" /></div>
                  <div className="form-field"><label>ID (auto-generated)</label><input value={plant.id} onChange={e => set("id", e.target.value)} placeholder="ficus-lyrata" /><div className="field-hint">Leave blank to auto-generate</div></div>
                </div>
                <div className="form-field"><label>Common Names</label><TipsList tips={(plant.common_names ?? plant.commonNames ?? [""]).length ? (plant.common_names ?? plant.commonNames) : [""]} onChange={v => { set("common_names", v); set("commonNames", v); }} /></div>
                <div className="form-field"><label>Description</label><textarea value={plant.description} onChange={e => set("description", e.target.value)} style={{ minHeight: 60 }} /></div>
                <div className="form-field"><label>Tags (comma-separated)</label><input value={Array.isArray(plant.tags) ? plant.tags.join(", ") : plant.tags} onChange={e => set("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} placeholder="tropical, beginner, edible" /></div>
                <div className="form-field"><label>Primary Image URL</label><input value={plant.image} onChange={e => set("image", e.target.value)} placeholder="https://…" /><div className="field-hint">Used as fallback if no gallery photos. Paste an Unsplash URL.</div></div>
                <div className="form-field"><label>Etymology</label><textarea value={plant.etymology} onChange={e => set("etymology", e.target.value)} /></div>
                <div className="form-field"><label>History</label><textarea value={plant.history} onChange={e => set("history", e.target.value)} rows={5} /></div>
              </>)}
              {activeSection === "photos" && (
                <div className="form-field">
                  <PhotoManager photos={plant.photos ?? []} plantId={plant.id || plant.scientific_name?.toLowerCase().replace(/\s+/g, "-")} onUpdate={photos => set("photos", photos)} isAdmin={isAdmin} />
                </div>
              )}
              {activeSection === "care" && (<>
                <div className="form-field"><label>Care Overview</label><textarea value={plant.care.description} onChange={e => set("care.description", e.target.value)} /></div>
                <div className="form-field"><label>Care Detail</label><textarea value={plant.care.detail} onChange={e => set("care.detail", e.target.value)} /></div>
                <div className="form-field"><label>Common Issues</label><textarea value={plant.care.commonIssues} onChange={e => set("care.commonIssues", e.target.value)} /></div>
                <div className="form-field"><label>Care Tips</label><TipsList tips={plant.care.tips.length ? plant.care.tips : [""]} onChange={v => set("care.tips", v)} /></div>
              </>)}
              {activeSection === "watering" && (<>
                <div className="form-field"><label>At-a-Glance Blurb</label><input value={plant.watering.blurb ?? ""} onChange={e => set("watering.blurb", e.target.value)} placeholder="e.g. Water when top inch of soil is dry" /><div className="field-hint">One sentence shown on the Care at a Glance card.</div></div>
                <div className="form-field"><label>Frequency</label><input value={plant.watering.frequency} onChange={e => set("watering.frequency", e.target.value)} placeholder="Every 1–2 weeks" /></div>
                <div className="form-field"><label>Detail</label><textarea value={plant.watering.detail} onChange={e => set("watering.detail", e.target.value)} /></div>
                <div className="form-field"><label>Tips</label><TipsList tips={plant.watering.tips.length ? plant.watering.tips : [""]} onChange={v => set("watering.tips", v)} /></div>
              </>)}
              {activeSection === "light" && (<>
                <div className="form-field"><label>At-a-Glance Blurb</label><input value={plant.light.blurb ?? ""} onChange={e => set("light.blurb", e.target.value)} placeholder="e.g. Bright indirect light, 6–8 hrs" /><div className="field-hint">One sentence shown on the Care at a Glance card.</div></div>
                <div className="form-field"><label>Ideal Hours</label><input value={plant.light.idealHours} onChange={e => set("light.idealHours", e.target.value)} placeholder="6–8 hours indirect" /></div>
                <div className="form-field"><label>Detail</label><textarea value={plant.light.detail} onChange={e => set("light.detail", e.target.value)} /></div>
                <div className="form-field"><label>Tips</label><TipsList tips={plant.light.tips.length ? plant.light.tips : [""]} onChange={v => set("light.tips", v)} /></div>
              </>)}
              {activeSection === "medium" && (<>
                <div className="form-field"><label>At-a-Glance Blurb</label><input value={plant.medium.blurb ?? ""} onChange={e => set("medium.blurb", e.target.value)} placeholder="e.g. Well-draining chunky mix with perlite" /><div className="field-hint">One sentence shown on the Care at a Glance card.</div></div>
                <div className="form-field"><label>Detail</label><textarea value={plant.medium.detail} onChange={e => set("medium.detail", e.target.value)} /></div>
                <div className="form-field"><label>Tips</label><TipsList tips={plant.medium.tips.length ? plant.medium.tips : [""]} onChange={v => set("medium.tips", v)} /></div>
              </>)}
              {activeSection === "propagation" && (<>
                <div className="form-field"><label>At-a-Glance Blurb</label><input value={plant.propagation.blurb ?? ""} onChange={e => set("propagation.blurb", e.target.value)} placeholder="e.g. Stem cuttings in water or moist soil" /><div className="field-hint">One sentence shown on the Care at a Glance card.</div></div>
                <div className="form-field"><label>Detail</label><textarea value={plant.propagation.detail} onChange={e => set("propagation.detail", e.target.value)} /></div>
                <div className="form-field"><label>Tips</label><TipsList tips={plant.propagation.tips.length ? plant.propagation.tips : [""]} onChange={v => set("propagation.tips", v)} /></div>
              </>)}
              {activeSection === "gardening" && (<>
                <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 15, color: "var(--stone)", marginBottom: 16, fontStyle: "italic" }}>Complete for vegetables, herbs, and garden plants.</p>
                <div className="form-field"><label>Overview</label><textarea value={plant.gardening.description} onChange={e => set("gardening.description", e.target.value)} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div className="form-field"><label>Start Indoors</label><input value={plant.gardening.startIndoors} onChange={e => set("gardening.startIndoors", e.target.value)} placeholder="8 weeks before last frost" /></div>
                  <div className="form-field"><label>Start Outdoors</label><input value={plant.gardening.startOutdoors} onChange={e => set("gardening.startOutdoors", e.target.value)} placeholder="After last frost" /></div>
                  <div className="form-field"><label>Planting Season</label><input value={plant.gardening.plantingSeason} onChange={e => set("gardening.plantingSeason", e.target.value)} placeholder="Spring through summer" /></div>
                </div>
                <div className="form-field"><label>Tips</label><TipsList tips={plant.gardening.tips.length ? plant.gardening.tips : [""]} onChange={v => set("gardening.tips", v)} /></div>
              </>)}
              {activeSection === "other" && (<>
                <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, color: "var(--bark)", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>Toxicity</div>
                <div className="form-field"><label>At-a-Glance Blurb</label><input value={plant.toxicity.blurb ?? ""} onChange={e => set("toxicity.blurb", e.target.value)} placeholder="e.g. Toxic to cats and dogs" /><div className="field-hint">One sentence shown on the Care at a Glance card.</div></div>
                <div className="form-field"><label>Description</label><textarea value={plant.toxicity.description} onChange={e => set("toxicity.description", e.target.value)} placeholder="Toxic/non-toxic to cats, dogs, humans…" /></div>
                <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, color: "var(--bark)", margin: "20px 0 12px", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>Temperature</div>
                <div className="form-field"><label>At-a-Glance Blurb</label><input value={plant.temperature.blurb ?? ""} onChange={e => set("temperature.blurb", e.target.value)} placeholder="e.g. Prefers 65–80°F, avoid cold drafts" /><div className="field-hint">One sentence shown on the Care at a Glance card.</div></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-field"><label>Ideal Range</label><input value={plant.temperature.idealRange} onChange={e => set("temperature.idealRange", e.target.value)} placeholder="65–80°F (18–27°C)" /></div>
                  <div className="form-field"><label>Notes</label><input value={plant.temperature.description} onChange={e => set("temperature.description", e.target.value)} /></div>
                </div>
              </>)}
            </div>

            <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--parchment)" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {!initial && <button className="btn btn-ghost" onClick={() => setStep("search")}>← Re-search</button>}
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              </div>
              <button className="btn btn-primary" onClick={handleSave}
                disabled={saving || (!plant.scientific_name?.trim() && !plant.scientificName?.trim())}
                style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {saving ? <><span className="spinner" style={{ width: 13, height: 13 }} />Saving…</> : (initial ? "Save Changes" : "Add to Collection")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Plant Card ───────────────────────────────────────────────────────────────
function PlantCard({ plant, inGreenhouse, onToggleGreenhouse, onClick, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const names = plant.common_names ?? plant.commonNames ?? [];
  const placeholder = `https://placehold.co/600x400/c8bea8/2b1b11?text=${encodeURIComponent(names[0] || "Plant")}`;
  const heroPhoto = (plant.photos ?? []).find(p => p.position === "hero" || !p.position);
  const displayImage = heroPhoto?.url || plant.image || placeholder;

  return (
    <div className="card-enter"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden", position: "relative",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        transform: hovered ? "translateY(-5px)" : "none",
        boxShadow: hovered ? "0 14px 36px rgba(0,0,0,0.13)" : "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ position: "relative", height: 200, overflow: "hidden", cursor: "pointer" }} onClick={onClick}>
        <img src={displayImage} alt={names[0]} onError={e => { e.target.src = placeholder; }}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease", transform: hovered ? "scale(1.06)" : "scale(1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.2) 100%)" }} />
        <button onClick={e => { e.stopPropagation(); onToggleGreenhouse(plant.id); }}
          style={{ position: "absolute", top: 10, right: 10, background: inGreenhouse ? "var(--moss)" : "rgba(245,240,230,0.9)",
            border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transition: "all 0.2s",
            color: inGreenhouse ? "#f5f0e6" : "var(--bark)", fontSize: 16 }}>
          {inGreenhouse ? Icons.house : "+"}
        </button>
      </div>
      <div style={{ padding: "14px 16px 16px", cursor: "pointer" }} onClick={onClick}>
        <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, color: "var(--stone)", letterSpacing: "0.05em", marginBottom: 3, textTransform: "uppercase" }}>
          {plant.scientific_name ?? plant.scientificName}
        </div>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, color: "var(--bark)", lineHeight: 1.2, marginBottom: 5 }}>{names[0]}</h3>
        {names.length > 1 && <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 11, color: "var(--stone)", marginBottom: 9 }}>{names.slice(1).join(" · ")}</div>}
        {plant.description && <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 14, color: "var(--stone)", lineHeight: 1.55, marginBottom: 10 }}>
          {plant.description.length > 90 ? plant.description.slice(0, 90) + "…" : plant.description}
        </p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {(plant.tags ?? []).slice(0, 4).map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>
      {hovered && (
        <button onClick={e => { e.stopPropagation(); onEdit(); }}
          style={{ position: "absolute", bottom: 12, right: 12, background: "var(--parchment)", border: "1px solid var(--border)",
            color: "var(--stone)", cursor: "pointer", padding: "4px 10px",
            fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 2 }}>
          Edit
        </button>
      )}
    </div>
  );
}

// ─── Plant Detail ─────────────────────────────────────────────────────────────
function PlantDetail({ plant, inGreenhouse, onToggleGreenhouse, onBack, onEdit }) {
  const names = plant.common_names ?? plant.commonNames ?? [];
  const sciName = plant.scientific_name ?? plant.scientificName ?? "";

  const TipList = ({ tips }) => {
    const f = tips?.filter(t => t?.trim());
    if (!f?.length) return null;
    return <ul style={{ paddingLeft: 20, marginTop: 8 }}>{f.map((t, i) => <li key={i} style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 15, lineHeight: 1.7, color: "var(--bark)", marginBottom: 3 }}>{t}</li>)}</ul>;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      {/* Masthead */}
      <div style={{ background: "var(--header-bg)", color: "#f5f0e6", padding: "22px 32px 18px", textAlign: "center", borderBottom: "4px double rgba(245,240,230,0.3)", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "1px solid rgba(245,240,230,0.4)", color: "#f5f0e6", padding: "7px 16px", cursor: "pointer", fontFamily: "'Courier Prime',monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>← Back</button>
        <button onClick={onEdit} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "1px solid rgba(245,240,230,0.4)", color: "#f5f0e6", padding: "7px 16px", cursor: "pointer", fontFamily: "'Courier Prime',monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Edit Plant</button>
        <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.5, marginBottom: 6 }}>The Glasshouse Gazette · Botanical Record</div>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(30px,6vw,58px)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6 }}>{names[0]}</h1>
        <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 13, fontStyle: "italic", opacity: 0.65, marginBottom: 12 }}>{sciName}</div>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {(plant.tags ?? []).map(t => <span key={t} style={{ background: "rgba(245,240,230,0.12)", border: "1px solid rgba(245,240,230,0.25)", padding: "2px 8px", fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t}</span>)}
        </div>
        <button onClick={() => onToggleGreenhouse(plant.id)} style={{ background: inGreenhouse ? "var(--moss)" : "transparent", border: "1px solid", borderColor: inGreenhouse ? "var(--moss)" : "rgba(245,240,230,0.5)", color: "#f5f0e6", padding: "8px 22px", cursor: "pointer", fontFamily: "'Courier Prime',monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 6 }}>
          {inGreenhouse ? <>{Icons.house} In Your Greenhouse</> : "+ Add to Greenhouse"}
        </button>
      </div>

      {/* 1:1 Square Hero Rotator */}
      <HeroRotator photos={plant.photos ?? []} fallbackImage={plant.image} plantName={names[0]} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 72px" }}>
        {names.length > 1 && (
          <div style={{ textAlign: "center", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 11, letterSpacing: "0.1em", color: "var(--stone)", textTransform: "uppercase" }}>Also known as: {names.slice(1).join(", ")}</span>
          </div>
        )}
        {plant.description && (
          <p style={{ textAlign: "center", fontFamily: "'EB Garamond',Georgia,serif", fontSize: 19, fontStyle: "italic", color: "var(--stone)", lineHeight: 1.7, padding: "20px 0 0", maxWidth: 600, margin: "0 auto" }}>{plant.description}</p>
        )}

        {/* Care at a Glance */}
        {(() => {
          const glanceCards = [
            { key: "watering",    icon: Icons.water,       label: "Watering",       blurb: plant.watering?.blurb,    anchor: "#section-water-light-medium" },
            { key: "light",       icon: Icons.sun,         label: "Light",          blurb: plant.light?.blurb,       anchor: "#section-water-light-medium" },
            { key: "medium",      icon: Icons.pot,         label: "Growing Medium", blurb: plant.medium?.blurb,      anchor: "#section-water-light-medium" },
            { key: "propagation", icon: Icons.scissors,    label: "Propagation",    blurb: plant.propagation?.blurb, anchor: "#section-propagation" },
            { key: "toxicity",    icon: Icons.warning,     label: "Toxicity",       blurb: plant.toxicity?.blurb,    anchor: "#section-quick-reference" },
            { key: "temperature", icon: Icons.thermometer, label: "Temperature",    blurb: plant.temperature?.blurb, anchor: "#section-quick-reference" },
          ];
          const hasAny = glanceCards.some(c => c.blurb?.trim());
          if (!hasAny) return null;
          return (
            <div style={{ margin: "32px 0 8px" }}>
              <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--moss)", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <span>Care at a Glance</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {glanceCards.map(card => (
                  <a key={card.key} href={card.anchor}
                    style={{ display: "block", textDecoration: "none", background: "var(--parchment)", border: "1px solid var(--border)", padding: "16px 18px", transition: "border-color 0.18s, box-shadow 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--moss)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ color: "var(--moss)", display: "flex", alignItems: "center" }}>{card.icon}</span>
                      <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, color: "var(--moss)" }}>{card.label}</span>
                    </div>
                    <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 15, lineHeight: 1.65, color: "var(--bark)", margin: 0, fontStyle: card.blurb ? "normal" : "italic", opacity: card.blurb ? 1 : 0.5 }}>
                      {card.blurb || "—"}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Origins & History */}
        {(plant.photos ?? []).find(p => p.position === "inline-origins") && (
          <InlinePhoto photo={(plant.photos ?? []).find(p => p.position === "inline-origins")} />
        )}
        <CollapsibleSection label="Origins & History">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, borderBottom: "2px solid var(--bark)", paddingBottom: 6, marginBottom: 12, color: "var(--bark)" }}>Etymology</h2>
              <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 16, lineHeight: 1.85, color: "var(--bark)" }}>{plant.etymology || "—"}</p>
            </div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, borderBottom: "2px solid var(--bark)", paddingBottom: 6, marginBottom: 12, color: "var(--bark)" }}>History</h2>
              <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 16, lineHeight: 1.85, color: "var(--bark)" }}>{plant.history || "—"}</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Care Guide */}
        {(plant.photos ?? []).find(p => p.position === "inline-care") && (
          <InlinePhoto photo={(plant.photos ?? []).find(p => p.position === "inline-care")} />
        )}
        <div id="section-care" style={{ scrollMarginTop: 16 }} /><CollapsibleSection label="Care Guide">
          <div style={{ background: "var(--parchment)", border: "1px solid var(--border)", padding: 26, marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 24, marginBottom: 12, color: "var(--bark)" }}>Care Overview</h2>
            {plant.care?.description && <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 17, lineHeight: 1.85, marginBottom: 12, color: "var(--bark)" }}>{plant.care.description}</p>}
            {plant.care?.detail && <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 16, lineHeight: 1.8, marginBottom: 12, color: "var(--stone)" }}>{plant.care.detail}</p>}
            {plant.care?.tips?.filter(t => t.trim()).length > 0 && (
              <><div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--moss)", marginBottom: 6 }}>Grower's Tips</div><TipList tips={plant.care.tips} /></>
            )}
            {plant.care?.commonIssues && (
              <div style={{ marginTop: 18, padding: "14px 18px", background: "rgba(176,64,64,0.06)", borderLeft: "3px solid #b04040" }}>
                <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#b04040", marginBottom: 5 }}>Common Issues</div>
                <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 15, lineHeight: 1.7, color: "var(--bark)" }}>{plant.care.commonIssues}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Watering / Light / Medium */}
        <div id="section-water-light-medium" style={{ scrollMarginTop: 16 }} /><CollapsibleSection label="Water · Light · Medium">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            <InfoBlock icon={Icons.water} label="Watering">
              {plant.watering?.frequency && <strong style={{ display: "block", marginBottom: 4 }}>{plant.watering.frequency}</strong>}
              {plant.watering?.detail}
              <AccentTipList tips={plant.watering?.tips} label="Watering Tips" />
            </InfoBlock>
            <InfoBlock icon={Icons.sun} label="Light">
              {plant.light?.idealHours && <strong style={{ display: "block", marginBottom: 4 }}>{plant.light.idealHours}</strong>}
              {plant.light?.detail}
              <AccentTipList tips={plant.light?.tips} label="Light Tips" />
            </InfoBlock>
            <InfoBlock icon={Icons.pot} label="Growing Medium">
              {plant.medium?.detail}
              <AccentTipList tips={plant.medium?.tips} label="Medium Tips" />
            </InfoBlock>
          </div>
        </CollapsibleSection>

        {/* Propagation */}
        <div id="section-propagation" style={{ scrollMarginTop: 16 }} /><CollapsibleSection label="Propagation">
          <InfoBlock icon={Icons.scissors} label="How to Propagate">
            {plant.propagation?.detail}
            <AccentTipList tips={plant.propagation?.tips} label="Propagation Tips" />
          </InfoBlock>
        </CollapsibleSection>

        {/* Garden Calendar — only if populated */}
        {plant.gardening?.description && (
          <CollapsibleSection label="Garden Calendar">
            <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 17, lineHeight: 1.8, marginBottom: 20, color: "var(--bark)" }}>{plant.gardening.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 }}>
              {[
                { icon: Icons.seedling, label: "Start Indoors",   val: plant.gardening.startIndoors },
                { icon: Icons.leaf,     label: "Start Outdoors",  val: plant.gardening.startOutdoors },
                { icon: Icons.sun2,     label: "Planting Season", val: plant.gardening.plantingSeason },
              ].filter(x => x.val).map(x => (
                <div key={x.label} style={{ textAlign: "center", background: "var(--parchment)", padding: 20, border: "1px solid var(--border)" }}>
                  <div style={{ marginBottom: 4, display: "flex", justifyContent: "center", color: "var(--bark)" }}>{x.icon}</div>
                  <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--moss)", marginBottom: 6 }}>{x.label}</div>
                  <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 700, color: "var(--bark)" }}>{x.val}</div>
                </div>
              ))}
            </div>
            <TipList tips={plant.gardening.tips} />
          </CollapsibleSection>
        )}

        {/* Quick Reference */}
        {(plant.photos ?? []).find(p => p.position === "inline-ref") && (
          <InlinePhoto photo={(plant.photos ?? []).find(p => p.position === "inline-ref")} />
        )}
        <div id="section-quick-reference" style={{ scrollMarginTop: 16 }} /><CollapsibleSection label="Quick Reference">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <InfoBlock icon={Icons.warning} label="Toxicity">{plant.toxicity?.description || "—"}</InfoBlock>
            <InfoBlock icon={Icons.thermometer} label="Temperature">
              {plant.temperature?.idealRange && <strong style={{ display: "block", marginBottom: 4 }}>{plant.temperature.idealRange}</strong>}
              {plant.temperature?.description}
            </InfoBlock>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [plants, setPlants]               = useState([]);
  const [greenhouse, setGreenhouse]       = useState(new Set());
  const [view, setView]                   = useState("all"); // all | greenhouse | profile | detail
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showForm, setShowForm]           = useState(false);
  const [editingPlant, setEditingPlant]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState("");
  const [filterTag, setFilterTag]         = useState("");
  const [toast, setToast]                 = useState(null);
  const [user, setUser]                   = useState(null);
  const [profile, setProfile]             = useState(null);
  const [showAuth, setShowAuth]           = useState(false);
  const [theme, setTheme]                 = useTheme();

  const isAdmin = profile?.role === "admin";
  const showToast = (message, type = "success") => setToast({ message, type });

  // Load plants
  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchPlants();
        setPlants(rows.map(dbToApp));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  // Auth listener
  useEffect(() => {
    getSession().then(u => { if (u) loadUserData(u); else setGreenhouse(loadGreenhouseLocal()); });
    const { data: { subscription } } = onAuthStateChange(u => {
      setUser(u);
      if (u) loadUserData(u);
      else { setProfile(null); setGreenhouse(loadGreenhouseLocal()); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (u) => {
    try {
      const [prof, gh] = await Promise.all([fetchProfile(u.id), fetchGreenhouse(u.id)]);
      setUser(u);
      setProfile(prof);
      setGreenhouse(gh);
    } catch (e) {
      console.warn("Could not load user data:", e.message);
      setGreenhouse(loadGreenhouseLocal());
    }
  };

  const handleToggleGreenhouse = useCallback(async (id) => {
    if (user) {
      setGreenhouse(prev => {
        const next = new Set(prev);
        if (next.has(id)) { next.delete(id); removeFromGreenhouse(user.id, id).catch(console.warn); }
        else { next.add(id); addToGreenhouse(user.id, id).catch(console.warn); }
        return next;
      });
    } else {
      setGreenhouse(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        saveGreenhouseLocal(next);
        return next;
      });
    }
  }, [user]);

  const handleSavePlant = async (plant) => {
    try {
      const saved = await upsertPlant(appToDb(plant));
      const appPlant = dbToApp(saved);
      setPlants(prev => {
        const exists = prev.find(p => p.id === appPlant.id);
        return exists ? prev.map(p => p.id === appPlant.id ? appPlant : p) : [...prev, appPlant];
      });
      if (selectedPlant?.id === appPlant.id) setSelectedPlant(appPlant);
      setShowForm(false); setEditingPlant(null);
      showToast(`${(appPlant.common_names ?? [])[0] || appPlant.scientific_name} saved!`);
    } catch (e) { showToast("Save failed: " + e.message, "error"); }
  };

  const handleDeletePlant = async (id) => {
    if (!window.confirm("Remove this plant from your collection?")) return;
    try {
      await deletePlant(id);
      setPlants(prev => prev.filter(p => p.id !== id));
      setGreenhouse(prev => { const n = new Set(prev); n.delete(id); if (!user) saveGreenhouseLocal(n); return n; });
      setShowForm(false); setEditingPlant(null); setView("all");
      showToast("Plant removed.", "error");
    } catch (e) { showToast("Delete failed: " + e.message, "error"); }
  };

  const allTags = [...new Set(plants.flatMap(p => p.tags ?? []))].sort();
  const displayedPlants = plants
    .filter(p => view !== "greenhouse" || greenhouse.has(p.id))
    .filter(p => !filterTag || (p.tags ?? []).includes(filterTag))
    .filter(p => !search.trim() || [
      ...(p.common_names ?? p.commonNames ?? []),
      p.scientific_name ?? p.scientificName ?? "",
      p.description ?? "",
      ...(p.tags ?? [])
    ].join(" ").toLowerCase().includes(search.toLowerCase()));

  // ── Loading / Error screens ──────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <FontLink /><GlobalStyle />
      <div className="spinner" style={{ width: 36, height: 36 }} />
      <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--stone)" }}>Loading collection…</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
      <FontLink /><GlobalStyle />
      <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, color: "#b04040" }}>Connection Error</div>
      <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 17, color: "var(--stone)", maxWidth: 480, textAlign: "center", lineHeight: 1.7 }}>Could not connect to Supabase. Check your <code>.env.local</code> file.</p>
      <code style={{ background: "var(--parchment)", padding: "8px 16px", fontFamily: "'Courier Prime',monospace", fontSize: 13, color: "var(--bark)", borderRadius: 3 }}>{error}</code>
    </div>
  );

  // ── Detail view ──────────────────────────────────────────────────────────
  if (view === "detail" && selectedPlant) {
    const live = plants.find(p => p.id === selectedPlant.id) || selectedPlant;
    return (
      <><FontLink /><GlobalStyle />
        <PlantDetail plant={live} inGreenhouse={greenhouse.has(live.id)} onToggleGreenhouse={handleToggleGreenhouse}
          onBack={() => setView("all")} onEdit={() => { setEditingPlant(live); setShowForm(true); }} />
        {showForm && editingPlant && isAdmin && (
          <PlantFormModal initial={editingPlant} onSave={handleSavePlant} onDelete={handleDeletePlant}
            onClose={() => { setShowForm(false); setEditingPlant(null); }} isAdmin={isAdmin} />
        )}
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        {toast && <Toast key={Date.now()} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      </>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────────────
  return (
    <><FontLink /><GlobalStyle />

      {/* Header */}
      <header style={{ background: "var(--header-bg)", color: "#f5f0e6", padding: "32px 24px 22px", textAlign: "center", borderBottom: "5px double rgba(74,103,65,0.5)" }}>
        <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.5, marginBottom: 8 }}>Est. 2024 · Botanical Reference</div>
        <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(36px,8vw,70px)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6, cursor: "pointer" }} onClick={() => setView("all")}>The Glasshouse</h1>
        <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 17, fontStyle: "italic", opacity: 0.65 }}>A comprehensive guide to indoor plants & the kitchen garden</p>
      </header>

      {/* Nav */}
      <nav style={{ background: "var(--nav-bg)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", borderBottom: "3px solid var(--moss)", flexWrap: "wrap", gap: 4 }}>
        {/* Left tabs */}
        <div style={{ display: "flex" }}>
          {[
            { key: "all",        label: `All Plants (${plants.length})` },
            { key: "greenhouse", label: `My Greenhouse (${greenhouse.size})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setView(tab.key)} style={{ background: view === tab.key ? "var(--moss)" : "transparent", color: "#f5f0e6", border: "none", padding: "12px 18px", cursor: "pointer", fontFamily: "'Courier Prime',monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", transition: "background 0.2s" }}>{tab.label}</button>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
          <ThemeSelector theme={theme} setTheme={setTheme} />

          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setEditingPlant(null); setShowForm(true); }}>+ Add Plant</button>
          )}

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Avatar — clickable to profile */}
              <button onClick={() => setView("profile")} title="View Profile"
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar avatarUrl={profile?.avatar_url} frameId={profile?.frame_id} size={32} fallbackName={profile?.full_name || user.email} />
                <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.1em", color: "rgba(245,240,230,0.7)", textTransform: "uppercase" }}>
                  {profile?.full_name?.split(" ")[0] || "Profile"}
                  {isAdmin && <span style={{ color: "var(--moss-light)", marginLeft: 4 }}>· Admin</span>}
                </span>
              </button>
              <button onClick={() => signOut()} className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 10, color: "rgba(245,240,230,0.6)", borderColor: "rgba(245,240,230,0.2)" }}>Sign out</button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} className="btn btn-ghost" style={{ color: "#f5f0e6", borderColor: "rgba(245,240,230,0.3)", padding: "7px 16px" }}>Sign in</button>
          )}
        </div>
      </nav>

      {/* Profile page */}
      {view === "profile" && (
        <>
          <div style={{ background: "var(--header-bg)", color: "#f5f0e6", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(245,240,230,0.1)" }}>
            <button onClick={() => setView("all")} style={{ background: "transparent", border: "1px solid rgba(245,240,230,0.3)", color: "#f5f0e6", padding: "5px 14px", cursor: "pointer", fontFamily: "'Courier Prime',monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>← Back</button>
            <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>Your Profile</span>
          </div>
          <ProfilePage user={user} profile={profile} onProfileUpdate={p => setProfile(p)} />
        </>
      )}

      {/* Main collection / greenhouse views */}
      {view !== "profile" && (
        <>
          {/* Search & filter bar */}
          <div style={{ background: "var(--parchment)", borderBottom: "1px solid var(--border)", padding: "12px 20px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input type="text" placeholder="Search plants…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280, fontSize: 14, padding: "7px 12px" }} />
            <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={{ maxWidth: 200, fontSize: 13, padding: "7px 12px" }}>
              <option value="">All tags</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {(search || filterTag) && <button className="btn btn-ghost" onClick={() => { setSearch(""); setFilterTag(""); }} style={{ padding: "7px 14px" }}>Clear ×</button>}
            <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, color: "var(--stone)", letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: "auto" }}>{displayedPlants.length} plant{displayedPlants.length !== 1 ? "s" : ""}</div>
          </div>

          <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 20px 60px" }}>
            {view === "greenhouse" && greenhouse.size === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", color: "var(--bark)", opacity: 0.3 }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, color: "var(--bark)", marginBottom: 10 }}>Your greenhouse is empty</h2>
                <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 18, color: "var(--stone)", marginBottom: 20 }}>Browse the collection and click + to add plants here.</p>
                <button className="btn btn-primary" onClick={() => setView("all")}>Browse Collection →</button>
              </div>
            ) : displayedPlants.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--stone)", fontFamily: "'EB Garamond',Georgia,serif", fontSize: 18 }}>
                No plants match your search. <button onClick={() => { setSearch(""); setFilterTag(""); }} style={{ background: "none", border: "none", color: "var(--moss)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", textDecoration: "underline" }}>Clear filters</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 24 }}>
                {displayedPlants.map(plant => (
                  <PlantCard key={plant.id} plant={plant}
                    inGreenhouse={greenhouse.has(plant.id)}
                    onToggleGreenhouse={handleToggleGreenhouse}
                    onClick={() => { setSelectedPlant(plant); setView("detail"); }}
                    onEdit={() => { setEditingPlant(plant); setShowForm(true); }} />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {showForm && isAdmin && (
        <PlantFormModal initial={editingPlant || null} onSave={handleSavePlant}
          onDelete={editingPlant ? handleDeletePlant : null}
          onClose={() => { setShowForm(false); setEditingPlant(null); }}
          isAdmin={isAdmin} />
      )}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {toast && <Toast key={Date.now()} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}
