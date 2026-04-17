import { useState, useRef, useEffect } from "react";

/**
 * CollapsibleSection — replaces SectionDiv throughout the plant detail page.
 * Starts expanded. Click header to toggle. Smooth CSS height animation.
 */
export default function CollapsibleSection({ label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const [height, setHeight] = useState(defaultOpen ? "auto" : "0px");
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      // Measure content height then animate to it
      const h = contentRef.current.scrollHeight;
      setHeight(`${h}px`);
      // After animation, set to auto so it reflows on resize
      const timer = setTimeout(() => setHeight("auto"), 320);
      return () => clearTimeout(timer);
    } else {
      // Snap from auto to measured px so transition works
      const h = contentRef.current.scrollHeight;
      setHeight(`${h}px`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight("0px"));
      });
    }
  }, [open]);

  return (
    <div style={{ margin: "28px 0 0" }}>
      {/* Header — clickable divider */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 12, padding: "0 0 18px",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "var(--bark)" }} />
        <span style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: 10, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "var(--bark)",
          whiteSpace: "nowrap", userSelect: "none"
        }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "var(--bark)" }} />
        {/* Chevron */}
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          stroke="var(--bark)" strokeWidth="1.8" strokeLinecap="round"
          style={{
            flexShrink: 0,
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.25s ease"
          }}
        >
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </button>

      {/* Animated content wrapper */}
      <div
        style={{
          height,
          overflow: "hidden",
          transition: "height 0.3s ease",
        }}
      >
        <div ref={contentRef} style={{ paddingBottom: 8 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
