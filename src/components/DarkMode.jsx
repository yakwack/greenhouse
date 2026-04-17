import { useState, useEffect, useRef } from "react";

const THEME_KEY = "glasshouse-theme";

export const THEMES = [
  { id: "botanical",    label: "Botanical",    swatches: ["#2b1b11", "#4a6741", "#f5f0e6"] },
  { id: "field-guide",  label: "Field Guide",  swatches: ["#1c2b3a", "#1e6b44", "#f0f4f8"] },
  { id: "garden-party", label: "Garden Party", swatches: ["#4a1540", "#6a994e", "#fdf0f8"] },
];

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (THEMES.find(t => t.id === saved)) return saved;
      return "botanical";
    } catch { return "botanical"; }
  });

  const setTheme = (t) => setThemeState(t);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return [theme, setTheme];
}

export function useDarkMode() {
  const [theme, setTheme] = useTheme();
  return [theme !== "botanical", (v) => setTheme(v ? "field-guide" : "botanical")];
}

export function ThemeSelector({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = THEMES.find(t => t.id === theme) || THEMES[0];

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Change theme"
        style={{
          background: "transparent",
          border: "1px solid rgba(245,240,230,0.25)",
          color: "rgba(245,240,230,0.85)",
          padding: "0 11px",
          height: 34,
          borderRadius: 3,
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 7,
          transition: "border-color 0.15s",
          fontFamily: "'Courier Prime', monospace",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ display: "flex", gap: 3 }}>
          {current.swatches.map((c, i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,0.2)" }} />
          ))}
        </div>
        <span>{current.label}</span>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polyline points="2,3.5 5,6.5 8,3.5" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#1a130a",
          border: "1px solid rgba(245,240,230,0.15)",
          borderRadius: 3, padding: 5, zIndex: 500, minWidth: 168,
          boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
        }}>
          {THEMES.map(t => (
            <button key={t.id} onClick={() => { setTheme(t.id); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                background: t.id === theme ? "rgba(245,240,230,0.1)" : "transparent",
                border: "none", padding: "9px 10px", cursor: "pointer",
                borderRadius: 2, textAlign: "left",
                color: t.id === theme ? "rgba(245,240,230,1)" : "rgba(245,240,230,0.7)",
                fontFamily: "'Courier Prime', monospace",
                fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => { if (t.id !== theme) e.currentTarget.style.background = "rgba(245,240,230,0.07)"; }}
              onMouseLeave={e => { if (t.id !== theme) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                {t.swatches.map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <span style={{ flex: 1 }}>{t.label}</span>
              {t.id === theme && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="rgba(245,240,230,0.8)" strokeWidth="2">
                  <polyline points="2,6 5,9 10,3" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DarkModeToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{ background: "transparent", border: "1px solid rgba(245,240,230,0.25)", color: "var(--cream)", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.15s", flexShrink: 0 }}>
      {dark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
