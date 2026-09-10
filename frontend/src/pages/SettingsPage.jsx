import { useState } from "react";
import { Settings, ShieldCheck, Lock, User, Bell, Edit3 } from "lucide-react";
import { useModel } from "../context/ModelContext";
import StatusBadge from "../components/StatusBadge";

export default function SettingsPage() {
  const { userProfile, setProfileModalOpen } = useModel();
  const [activeTab, setActiveTab] = useState("general");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [tamperAlarms, setTamperAlarms] = useState(true);

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Platform Settings</h2>
          <p>Configure ModelGuard validator options, authentication profiles, and alert preferences</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: 18, alignItems: "start" }}>
        {/* Navigation Tabs */}
        <div className="panel" style={{ padding: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { id: "general", label: "General Settings", icon: <Settings size={16} /> },
              { id: "profile", label: "Authority Profiles", icon: <User size={16} /> },
              { id: "notifications", label: "Alert Configuration", icon: <Bell size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                style={{
                  textAlign: "left", width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
                  background: activeTab === tab.id ? "var(--cyan-soft)" : "transparent",
                  color: activeTab === tab.id ? "var(--cyan)" : "var(--text-secondary)",
                  border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer"
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Panel */}
        <div className="panel" style={{ padding: 20 }}>
          {activeTab === "general" && (
            <div>
              <h3>General Configuration</h3>
              <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16 }}>
                <label className="field-label">Active Cryptographic Hash Engine</label>
                <select className="select-input" style={{
                  width: "100%", padding: 8, background: "var(--surface)", border: "1px solid var(--border)",
                  color: "var(--text-primary)", borderRadius: 6
                }}>
                  <option>SHA-256 (Default Secure)</option>
                  <option>SHA-512 (Extended payload)</option>
                  <option>BLAKE3 (High-performance verification)</option>
                </select>
              </div>
              <div>
                <label className="field-label">Merkle Tree Leaf Node Aggregation Size</label>
                <input className="text-input" type="number" defaultValue={4096} placeholder="Block byte size..." />
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                  Larger sizes accelerate tree building but reduce precision for pinpointing weight tampered regions.
                </span>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3>Publisher Authority Profile</h3>
                <button
                  className="primary-button"
                  onClick={() => setProfileModalOpen(true)}
                  style={{ padding: "6px 14px", fontSize: 12.5, borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
              </div>

              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16, padding: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: userProfile?.avatarColor || "linear-gradient(135deg, #00f2fe, #4facfe)",
                  display: "grid", placeItems: "center",
                  fontSize: 16, fontWeight: 700, color: "#0b0e14"
                }}>
                  {userProfile?.initials || "SA"}
                </div>
                <div>
                  <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>{userProfile?.name || "Saria Alvarez"}</strong>
                  <span style={{ display: "block", fontSize: 12, color: "var(--cyan)" }}>{userProfile?.role || "Security Admin"}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>{userProfile?.email || "saria.alvarez@modelguard.io"}</span>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="field-label">Verification Public Key Profile</label>
                <code className="mono" style={{ display: "block", padding: 8, background: "rgba(0,0,0,0.2)", borderRadius: 4, fontSize: 11.5 }}>
                  ED25519:7c9a632db821f00d28fa8e31c842d75e
                </code>
              </div>
            </div>
          )}


          {activeTab === "notifications" && (
            <div>
              <h3>Alert Configuration</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <strong>Email alerts on failed scans</strong>
                  <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Notify authority security profiles</span>
                </div>
                <button
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`toggle ${emailAlerts ? "enabled" : ""}`}
                  style={{
                    width: 36, height: 20, borderRadius: 10, background: emailAlerts ? "var(--cyan)" : "var(--border)",
                    border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s"
                  }}
                >
                  <span style={{
                    position: "absolute", top: 2, left: emailAlerts ? 18 : 2, width: 16, height: 16,
                    borderRadius: "50%", background: "#fff", transition: "left 0.3s"
                  }} />
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                <div>
                  <strong>Real-time tampering alarm trigger</strong>
                  <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Push notifications center alert</span>
                </div>
                <button
                  onClick={() => setTamperAlarms(!tamperAlarms)}
                  className={`toggle ${tamperAlarms ? "enabled" : ""}`}
                  style={{
                    width: 36, height: 20, borderRadius: 10, background: tamperAlarms ? "var(--cyan)" : "var(--border)",
                    border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s"
                  }}
                >
                  <span style={{
                    position: "absolute", top: 2, left: tamperAlarms ? 18 : 2, width: 16, height: 16,
                    borderRadius: "50%", background: "#fff", transition: "left 0.3s"
                  }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
