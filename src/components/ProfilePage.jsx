import { useState } from "react";
import { supabase } from "../supabase.js";

// ─── Preset Avatar Images ─────────────────────────────────────────────────────
// Add your own image URLs here to expand the preset library.
// Use square images for best results (they'll be cropped to circle).
export const PRESET_AVATARS = [
  { id: "leaf-1",    url: "https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=200&q=80&fit=crop&crop=center", label: "Monstera leaf" },
  { id: "fern-1",    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80&fit=crop&crop=center", label: "Fern" },
  { id: "succulent", url: "https://images.unsplash.com/photo-1567225557594-88d73398b2b2?w=200&q=80&fit=crop&crop=center", label: "Succulent" },
  { id: "flower-1",  url: "https://images.unsplash.com/photo-1490750967868-88df5691cc3e?w=200&q=80&fit=crop&crop=center", label: "Bloom" },
  { id: "moss-1",    url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=80&fit=crop&crop=center", label: "Garden" },
  { id: "herb-1",    url: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=200&q=80&fit=crop&crop=center", label: "Herbs" },
];

// ─── Preset Frames ────────────────────────────────────────────────────────────
// Each frame is a CSS border/box-shadow/outline combination applied to the
// circular avatar. Add more objects here to expand the frame library.
export const PRESET_FRAMES = [
  {
    id: "none",
    label: "None",
    style: { border: "3px solid transparent" },
  },
  {
    id: "moss",
    label: "Moss",
    style: { border: "3px solid #4a6741", boxShadow: "0 0 0 2px #2b1b11" },
  },
  {
    id: "leafy",
    label: "Leafy",
    style: { border: "3px solid #84b475", boxShadow: "0 0 0 2px #193111" },
  },
  {
    id: "bark",
    label: "Bark",
    style: { border: "4px solid #2b1b11" },
  },
  {
    id: "tan",
    label: "Parchment",
    style: { border: "3px solid #c8bea8", boxShadow: "0 0 0 2px #4a6741" },
  },
  {
    id: "double",
    label: "Double",
    style: { border: "2px solid #4a6741", outline: "3px solid #c8bea8", outlineOffset: "3px" },
  },
  {
    id: "gold",
    label: "Gilded",
    style: { border: "3px solid #b8973a", boxShadow: "0 0 0 1px #2b1b11, 0 0 12px rgba(184,151,58,0.3)" },
  },
];

// ─── Avatar Display ───────────────────────────────────────────────────────────
export function Avatar({ avatarUrl, frameId, size = 96, fallbackName = "" }) {
  const frame = PRESET_FRAMES.find(f => f.id === frameId) ?? PRESET_FRAMES[0];
  const initials = fallbackName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      overflow: "hidden", flexShrink: 0,
      background: "var(--parchment)",
      display: "flex", alignItems: "center", justifyContent: "center",
      ...frame.style,
      position: "relative",
    }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fallbackName || "Avatar"}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.style.display = "none"; }}
        />
      ) : (
        <span style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: size * 0.35, color: "var(--stone)", fontWeight: 700, userSelect: "none"
        }}>{initials || "?"}</span>
      )}
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export default function ProfilePage({ user, profile, onProfileUpdate }) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [frameId, setFrameId] = useState(profile?.frame_id || "none");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("avatar"); // avatar | frame

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: displayName, bio, avatar_url: avatarUrl, frame_id: frameId })
        .eq("id", user.id);
      if (error) throw error;
      onProfileUpdate({ ...profile, full_name: displayName, bio, avatar_url: avatarUrl, frame_id: frameId });
      setEditing(false);
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, color: "var(--bark)" }}>Sign in to view your profile</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>

      {/* Profile card */}
      <div style={{ background: "var(--warm-white)", border: "1px solid var(--tan)", borderRadius: 4, overflow: "hidden", marginBottom: 28 }}>
        {/* Banner */}
        <div style={{ height: 80, background: "linear-gradient(135deg, #2b1b11 0%, #4a6741 100%)" }} />

        {/* Avatar + name row */}
        <div style={{ padding: "0 28px 24px", position: "relative" }}>
          <div style={{ position: "absolute", top: -48, left: 28 }}>
            <Avatar
              avatarUrl={editing ? avatarUrl : profile?.avatar_url}
              frameId={editing ? frameId : profile?.frame_id}
              size={96}
              fallbackName={profile?.full_name || user.email}
            />
          </div>
          <div style={{ paddingTop: 56, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 26, color: "var(--bark)", marginBottom: 2 }}>
                {profile?.full_name || user.email.split("@")[0]}
              </h2>
              <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 11, color: "var(--stone)", letterSpacing: "0.08em" }}>
                {user.email}
                {profile?.role === "admin" && (
                  <span style={{ marginLeft: 8, background: "var(--moss)", color: "var(--cream)", padding: "1px 7px", borderRadius: 2, fontSize: 10 }}>Admin</span>
                )}
              </div>
              {profile?.bio && !editing && (
                <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 16, color: "var(--stone)", marginTop: 10, lineHeight: 1.7, maxWidth: 480 }}>
                  {profile.bio}
                </p>
              )}
            </div>
            <button
              onClick={() => setEditing(e => !e)}
              className="btn btn-ghost"
              style={{ flexShrink: 0, marginTop: 4 }}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ background: "var(--warm-white)", border: "1px solid var(--tan)", borderRadius: 4, padding: 28, marginBottom: 28 }}>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, color: "var(--bark)", marginBottom: 20, borderBottom: "1px solid var(--tan)", paddingBottom: 12 }}>
            Edit Profile
          </div>

          {/* Display name + bio */}
          <div className="form-field">
            <label>Display Name</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="form-field">
            <label>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about your garden…" style={{ minHeight: 80 }} />
          </div>

          {/* Avatar / Frame tabs */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--tan)", marginBottom: 20 }}>
              {["avatar", "frame"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid var(--moss)" : "2px solid transparent",
                  padding: "8px 20px", cursor: "pointer",
                  fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.15em",
                  textTransform: "uppercase", color: activeTab === tab ? "var(--moss)" : "var(--stone)",
                  fontWeight: activeTab === tab ? 700 : 400
                }}>{tab === "avatar" ? "Choose Avatar" : "Choose Frame"}</button>
              ))}
            </div>

            {/* Live preview */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <Avatar avatarUrl={avatarUrl} frameId={frameId} size={96} fallbackName={displayName} />
            </div>

            {/* Avatar presets */}
            {activeTab === "avatar" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {/* No avatar option */}
                <button
                  onClick={() => setAvatarUrl("")}
                  style={{
                    padding: 8, background: !avatarUrl ? "rgba(74,103,65,0.1)" : "transparent",
                    border: !avatarUrl ? "2px solid var(--moss)" : "2px solid var(--tan)",
                    borderRadius: 3, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6
                  }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--parchment)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontSize: 20, color: "var(--stone)" }}>
                    {displayName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--stone)" }}>Initials</span>
                </button>
                {PRESET_AVATARS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setAvatarUrl(preset.url)}
                    style={{
                      padding: 8, background: avatarUrl === preset.url ? "rgba(74,103,65,0.1)" : "transparent",
                      border: avatarUrl === preset.url ? "2px solid var(--moss)" : "2px solid var(--tan)",
                      borderRadius: 3, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6
                    }}
                  >
                    <img src={preset.url} alt={preset.label} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
                    <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--stone)" }}>{preset.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Frame presets */}
            {activeTab === "frame" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {PRESET_FRAMES.map(frame => (
                  <button
                    key={frame.id}
                    onClick={() => setFrameId(frame.id)}
                    style={{
                      padding: "12px 8px", background: frameId === frame.id ? "rgba(74,103,65,0.1)" : "transparent",
                      border: frameId === frame.id ? "2px solid var(--moss)" : "2px solid var(--tan)",
                      borderRadius: 3, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--parchment)", overflow: "hidden", ...frame.style }}>
                      {avatarUrl && <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--stone)" }}>{frame.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {saving ? <><span className="spinner" style={{ width: 13, height: 13 }} />Saving…</> : "Save Profile"}
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Member since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—" },
          { label: "Role", value: profile?.role === "admin" ? "Administrator" : "Member" },
          { label: "Email", value: user.email },
        ].map(stat => (
          <div key={stat.label} style={{ background: "var(--warm-white)", border: "1px solid var(--tan)", padding: "16px 20px", borderRadius: 3 }}>
            <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--moss)", marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 15, color: "var(--bark)", wordBreak: "break-all" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Instructions for adding more presets */}
      {profile?.role === "admin" && (
        <div style={{ marginTop: 28, padding: "16px 20px", background: "rgba(74,103,65,0.06)", border: "1px solid rgba(74,103,65,0.2)", borderRadius: 3 }}>
          <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--moss)", marginBottom: 6 }}>Admin — Adding Presets</div>
          <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 14, color: "var(--stone)", lineHeight: 1.7 }}>
            To add avatar images or frames, edit <code>src/components/ProfilePage.jsx</code> and add entries to the <code>PRESET_AVATARS</code> or <code>PRESET_FRAMES</code> arrays at the top of the file.
          </p>
        </div>
      )}
    </div>
  );
}
