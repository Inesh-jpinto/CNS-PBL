import { useState } from "react";
import { User, Check, X, Shield } from "lucide-react";
import { useModel } from "../context/ModelContext";

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #00f2fe, #4facfe)",
  "linear-gradient(135deg, #a855f7, #ec4899)",
  "linear-gradient(135deg, #3b82f6, #10b981)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #6366f1, #8b5cf6)"
];

export default function ProfileModal() {
  const { userProfile, updateProfile, profileModalOpen, setProfileModalOpen } = useModel();

  const [name, setName] = useState(userProfile?.name || "Saria Alvarez");
  const [role, setRole] = useState(userProfile?.role || "Security Admin");
  const [email, setEmail] = useState(userProfile?.email || "saria.alvarez@modelguard.io");
  const [avatarColor, setAvatarColor] = useState(userProfile?.avatarColor || GRADIENT_PRESETS[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!profileModalOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    updateProfile({
      name: name.trim(),
      role: role.trim() || "Security Inspector",
      email: email.trim(),
      avatarColor
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setProfileModalOpen(false);
    }, 600);
  }

  const parts = name.trim().split(" ");
  const currentInitials = parts.length >= 2 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0] ? parts[0].substring(0, 2).toUpperCase() : "SA");

  return (
    <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <User size={20} style={{ color: "var(--cyan)" }} />
            <h3>Edit Security Profile</h3>
          </div>
          <button className="modal-close" onClick={() => setProfileModalOpen(false)}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 14 }}>
          {/* Avatar Preview */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: avatarColor,
              display: "grid", placeItems: "center",
              fontSize: 18, fontWeight: 700, color: "#0b0e14",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
            }}>
              {currentInitials}
            </div>
            <div>
              <strong style={{ fontSize: 15, display: "block", color: "var(--text-primary)" }}>{name || "Your Name"}</strong>
              <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Shield size={12} style={{ color: "var(--cyan)" }} /> {role || "Security Admin"}
              </span>
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <label className="field-label" style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Avatar Theme Color
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {GRADIENT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarColor(preset)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: preset,
                    border: avatarColor === preset ? "2px solid #fff" : "none",
                    cursor: "pointer", display: "grid", placeItems: "center"
                  }}
                >
                  {avatarColor === preset && <Check size={14} style={{ color: "#0b0e14" }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="field-label" style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
              Full Name
            </label>
            <input
              type="text"
              required
              className="text-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Saria Alvarez"
              style={{
                width: "100%", padding: "10px 12px", background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)"
              }}
            />
          </div>

          {/* Role Field */}
          <div>
            <label className="field-label" style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
              Role / Designation
            </label>
            <input
              type="text"
              className="text-input"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Security Admin"
              style={{
                width: "100%", padding: "10px 12px", background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)"
              }}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="field-label" style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
              Email Address
            </label>
            <input
              type="email"
              className="text-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. saria.alvarez@modelguard.io"
              style={{
                width: "100%", padding: "10px 12px", background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)"
              }}
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setProfileModalOpen(false)}
              style={{ padding: "8px 16px", borderRadius: 6 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              style={{ padding: "8px 20px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}
            >
              {savedSuccess ? <Check size={16} /> : null}
              {savedSuccess ? "Saved!" : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
