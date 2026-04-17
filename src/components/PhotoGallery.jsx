import { useState, useEffect, useRef } from "react";

// ─── Hero Rotator ─────────────────────────────────────────────────────────────
export function HeroRotator({ photos, fallbackImage, plantName }) {
  const [current, setCurrent] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);
  const placeholder = `https://placehold.co/800x500/c8bea8/2b1b11?text=${encodeURIComponent(plantName || "Plant")}`;

  const heroPhotos = (photos ?? []).filter(p => p.position === "hero");
  const displayPhotos = heroPhotos.length > 0
    ? heroPhotos
    : [{ url: fallbackImage || placeholder, caption: "" }];

  useEffect(() => { setCurrent(0); }, [displayPhotos.length]);

  const goTo = (idx, dir = 1) => {
    if (sliding || idx === current) return;
    setDirection(dir);
    setSliding(true);
    setTimeout(() => { setCurrent(idx); setSliding(false); }, 220);
  };

  const prev = () => goTo((current - 1 + displayPhotos.length) % displayPhotos.length, -1);
  const next = () => goTo((current + 1) % displayPhotos.length, 1);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (displayPhotos.length <= 1) return;
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % displayPhotos.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [displayPhotos.length]);

  const photo = displayPhotos[Math.min(current, displayPhotos.length - 1)];

  return (
    <div style={{
      position: "relative", margin: "0 auto 32px",
      width: "500px", maxWidth: "100%",
      height: "500px",
      maxHeight: "80vh",
      overflow: "hidden",
      background: "var(--bark)",
    }}>
      <img
        key={current}
        src={photo.url || placeholder}
        alt={photo.caption || plantName}
        onError={e => { e.target.src = placeholder; }}
        style={{
          width: "100%", height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: sliding ? 0 : 1,
          transform: sliding ? `translateX(${direction * 16}px)` : "translateX(0)",
          transition: sliding ? "none" : "opacity 0.22s ease, transform 0.22s ease",
        }}
      />

      {photo.caption && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(to top, rgba(43,27,17,0.85) 0%, transparent 100%)",
          padding: "48px 24px 18px",
          fontFamily: "'EB Garamond',Georgia,serif",
          fontSize: 15, fontStyle: "italic",
          color: "rgba(26, 19, 5, 0.92)",
        }}>
          {photo.caption}
        </div>
      )}

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
        background: "linear-gradient(to bottom, transparent, var(--page-bg, #f5f0e6))",
        pointerEvents: "none",
      }} />

      {displayPhotos.length > 1 && (
        <>
          <button onClick={prev} style={arrowBtn("left")}>&#8249;</button>
          <button onClick={next} style={arrowBtn("right")}>&#8250;</button>
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 2 }}>
            {displayPhotos.map((_, i) => (
              <button key={i} onClick={() => goTo(i, i > current ? 1 : -1)} style={{
                width: i === current ? 22 : 6, height: 6, borderRadius: 3,
                border: "none", cursor: "pointer", padding: 0,
                background: i === current ? "var(--cream, #f5f0e6)" : "rgba(245,240,230,0.4)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(43,27,17,0.6)", backdropFilter: "blur(4px)",
            color: "var(--cream, #f5f0e6)", padding: "3px 10px",
            fontFamily: "'Courier Prime',monospace", fontSize: 11,
            letterSpacing: "0.08em", borderRadius: 2,
          }}>
            {current + 1} / {displayPhotos.length}
          </div>
        </>
      )}
    </div>
  );
}

const arrowBtn = (side) => ({
  position: "absolute", [side]: 14, top: "50%", transform: "translateY(-50%)",
  background: "rgba(43,27,17,0.55)", border: "1px solid rgba(245,240,230,0.25)",
  color: "var(--cream, #f5f0e6)", width: 40, height: 40, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  borderRadius: "50%", backdropFilter: "blur(4px)", fontSize: 22,
  transition: "background 0.15s", zIndex: 2,
});

// ─── Inline Full-width Photo ──────────────────────────────────────────────────
export function InlinePhoto({ photo }) {
  if (!photo?.url) return null;
  return (
    <figure style={{
      margin: "24px 0",
      borderTop: "1px solid var(--tan, #c8bea8)",
      borderBottom: "1px solid var(--tan, #c8bea8)",
      padding: "10px 0 0",
    }}>
      <img
        src={photo.url}
        alt={photo.caption || ""}
        onError={e => { e.target.style.display = "none"; }}
        style={{
          width: "100%",
          height: "400px",
          objectFit: "cover",
          display: "block",
        }}
      />
      {photo.caption && (
        <figcaption style={{
          fontFamily: "'Courier Prime',monospace",
          fontSize: 11, color: "var(--stone, #7a6e5e)",
          padding: "8px 4px 10px",
          lineHeight: 1.55, letterSpacing: "0.04em", fontStyle: "italic",
        }}>
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── Photo Manager ────────────────────────────────────────────────────────────
const INLINE_SLOTS = [
  { key: "inline-origins", label: "Before Origins & History" },
  { key: "inline-care",    label: "Before Care Guide" },
  { key: "inline-ref",     label: "Before Quick Reference" },
];

export function PhotoManager({ photos = [], plantId, onUpdate, isAdmin }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);

  if (!isAdmin) return null;

  const heroPhotos = photos.filter(p => p.position === "hero");

  const getSlotPhoto = (key) => photos.find(p => p.position === key) ?? null;

  const handleFile = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const { uploadPlantImage } = await import("../supabase.js");
      const url = await uploadPlantImage(file, plantId || "unsaved");
      onUpdate([...photos, { url, caption: "", position: "hero" }]);
    } catch (e) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const updateHeroCaption = (url, caption) => {
    onUpdate(photos.map(p => p.url === url && p.position === "hero" ? { ...p, caption } : p));
  };

  const removePhoto = async (url) => {
    if (url.includes("supabase")) {
      try {
        const { deletePlantImage } = await import("../supabase.js");
        await deletePlantImage(url);
      } catch (e) { console.warn("Storage delete failed:", e.message); }
    }
    onUpdate(photos.filter(p => p.url !== url));
  };

  const assignSlot = (slotKey, url) => {
    // Remove any existing photo in this slot (move back to hero)
    let next = photos.map(p => p.position === slotKey ? { ...p, position: "hero" } : p);
    // Assign selected photo to this slot
    if (url) {
      // If already in another slot, move it; if in hero, promote it
      next = next.map(p => p.url === url ? { ...p, position: slotKey } : p);
    }
    onUpdate(next);
  };

  const updateSlotCaption = (slotKey, caption) => {
    onUpdate(photos.map(p => p.position === slotKey ? { ...p, caption } : p));
  };

  return (
    <div>

      {/* Hero Gallery */}
      <div style={{ marginBottom: 28 }}>
        <div style={sectionLabel}>Hero Rotator Gallery</div>
        <p style={helpText}>Photos here cycle in the rotator at the top of the page. Add as many as you like.</p>

        {heroPhotos.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {heroPhotos.map((photo, i) => (
              <div key={photo.url} style={photoRow}>
                <img src={photo.url} alt="" style={thumbStyle} onError={e => { e.target.style.opacity = 0.3; }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <input
                    value={photo.caption || ""}
                    onChange={e => updateHeroCaption(photo.url, e.target.value)}
                    placeholder="Caption (optional)"
                    style={{ fontSize: 13 }}
                  />
                  <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, color: "var(--stone)", letterSpacing: "0.08em" }}>
                    Slide {i + 1} of {heroPhotos.length}
                  </div>
                </div>
                <button onClick={() => removePhoto(photo.url)} style={removeBtn} title="Remove">×</button>
              </div>
            ))}
          </div>
        )}

        <div
          className={`image-dropzone ${dragOver ? "drag-over" : ""}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById("hero-upload").click()}
        >
          <input id="hero-upload" type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])} />
          <div style={{ color: "var(--bark)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            {uploading
              ? <><span className="spinner" style={{ width: 18, height: 18 }} /><span style={uploadLabel}>Uploading…</span></>
              : <>
                  <span style={{ opacity: 0.4, fontSize: 26 }}>+</span>
                  <span style={uploadLabel}>Add hero photo ({heroPhotos.length} uploaded)</span>
                  <span style={{ ...uploadLabel, opacity: 0.6, fontSize: 10 }}>Auto-resized to max 1200px / 400KB</span>
                </>
            }
          </div>
        </div>
      </div>

      {/* Inline Placements */}
      <div>
        <div style={sectionLabel}>Inline Article Photos</div>
        <p style={helpText}>
          Pick one of your uploaded photos for each of the 3 article positions.
          Upload photos to the hero gallery above first.
        </p>

        {photos.length === 0 && (
          <p style={{ ...helpText, fontStyle: "italic" }}>No photos uploaded yet. Add some to the hero gallery above.</p>
        )}

        {INLINE_SLOTS.map(slot => {
          const assigned = getSlotPhoto(slot.key);
          return (
            <div key={slot.key} style={{ marginBottom: 16, background: "var(--parchment)", border: "1px solid var(--border, #c8bea8)", padding: 14, borderRadius: 2 }}>
              <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--moss)", marginBottom: 8, fontWeight: 700 }}>
                {slot.label}
              </div>
              <select
                value={assigned?.url || ""}
                onChange={e => assignSlot(slot.key, e.target.value || null)}
                style={{ fontSize: 13, marginBottom: assigned ? 8 : 0 }}
              >
                <option value="">— No photo —</option>
                {photos.map(p => (
                  <option key={p.url} value={p.url}>
                    {p.caption || p.url.split("/").pop().slice(0, 50)}
                  </option>
                ))}
              </select>
              {assigned && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 8 }}>
                  <img src={assigned.url} alt="" style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} onError={e => { e.target.style.opacity = 0.3; }} />
                  <input
                    value={assigned.caption || ""}
                    onChange={e => updateSlotCaption(slot.key, e.target.value)}
                    placeholder="Caption for this placement (optional)"
                    style={{ flex: 1, fontSize: 13 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ─── Shared micro-styles ──────────────────────────────────────────────────────
const sectionLabel = { fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--moss)", fontWeight: 700, marginBottom: 6 };
const helpText     = { fontFamily: "'EB Garamond',Georgia,serif", fontSize: 14, color: "var(--stone)", lineHeight: 1.6, marginBottom: 12 };
const photoRow     = { display: "flex", gap: 12, alignItems: "flex-start", background: "var(--parchment)", padding: 10, border: "1px solid var(--border, #c8bea8)", borderRadius: 2 };
const thumbStyle   = { width: 80, height: 60, objectFit: "cover", flexShrink: 0, borderRadius: 2 };
const removeBtn    = { background: "transparent", border: "none", color: "var(--stone)", cursor: "pointer", fontSize: 20, padding: "0 4px", lineHeight: 1, flexShrink: 0 };
const uploadLabel  = { fontFamily: "'Courier Prime',monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--stone)" };
