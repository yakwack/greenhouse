import { useState } from "react";
import { signInWithGoogle, signInWithMagicLink } from "../supabase.js";

export default function AuthModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setLoading(true); setError("");
    try {
      await signInWithMagicLink(email.trim());
      setSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true); setError("");
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        {/* Header */}
        <div style={{
          background: "#2b1b11", color: "var(--cream)",
          padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, marginBottom: 2 }}>
              The Glasshouse
            </div>
            <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 700 }}>
              Sign In
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--cream)", fontSize: 24, cursor: "pointer", opacity: 0.7 }}>×</button>
        </div>

        <div style={{ padding: "28px" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>✉️</div>
              <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, marginBottom: 10, color: "var(--bark)" }}>
                Check your email
              </h3>
              <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 16, lineHeight: 1.7, color: "var(--stone)" }}>
                We sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in — no password needed.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                style={{ marginTop: 20, fontFamily: "'Courier Prime',monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "none", color: "var(--moss)", cursor: "pointer", textDecoration: "underline" }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 16, lineHeight: 1.7, color: "var(--stone)", marginBottom: 24 }}>
                Sign in to save your greenhouse across devices and access member features.
              </p>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                style={{
                  width: "100%", padding: "11px 16px", marginBottom: 14,
                  background: "var(--warm-white)", border: "1px solid var(--tan)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  fontFamily: "'Courier Prime',monospace", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--bark)", transition: "border-color 0.15s", borderRadius: 2
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
                <div style={{ flex: 1, height: 1, background: "var(--tan)" }} />
                <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, letterSpacing: "0.1em", color: "var(--stone)", textTransform: "uppercase" }}>or</span>
                <div style={{ flex: 1, height: 1, background: "var(--tan)" }} />
              </div>

              {/* Magic link */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ marginBottom: 6 }}>Email address</label>
                <input
                  type="text"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleMagicLink()}
                  style={{ fontSize: 15 }}
                />
              </div>

              {error && (
                <p style={{ color: "#b04040", fontFamily: "'Courier Prime',monospace", fontSize: 11, marginBottom: 10 }}>{error}</p>
              )}

              <button
                onClick={handleMagicLink}
                disabled={loading || !email.trim()}
                className="btn btn-primary"
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {loading
                  ? <><span className="spinner" style={{ width: 13, height: 13 }} />Sending…</>
                  : "Send Magic Link"
                }
              </button>

              <p style={{ fontFamily: "'Courier Prime',monospace", fontSize: 10, color: "var(--stone)", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
                New users are automatically registered. No password required.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
