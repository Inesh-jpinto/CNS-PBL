import { useState } from "react";
import { useModel } from "../context/ModelContext";
import { Building2, Key, Award, UserCheck, ShieldAlert, Plus, X } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

export default function PublishersPage() {
  const { publishers, selectPublisher, selectedPublisher } = useModel();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [localPublishers, setLocalPublishers] = useState(publishers);

  function handleAddPublisher(e) {
    e.preventDefault();
    if (!newName || !newKey) return;

    const newPub = {
      id: Date.now(),
      name: newName,
      key: newKey,
      models: 0,
      status: "Trusted",
      email: newEmail || "contact@publisher.org",
      country: "Global",
      since: new Date().toISOString().split("T")[0]
    };

    setLocalPublishers(prev => [...prev, newPub]);
    setNewName("");
    setNewKey("");
    setNewEmail("");
    setShowAddForm(false);
  }

  function handleRevoke(id) {
    setLocalPublishers(prev => prev.map(p =>
      p.id === id ? { ...p, status: "Revoked" } : p
    ));
  }

  return (
    <div className="page-section">
      <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Trusted Publisher Registry</h2>
          <p>Manage cryptographically signed identity authorities and their trusted validation public keys</p>
        </div>
        <button className="primary-button" onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> Register Publisher
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>Register Trusted Authority</h3>
              <button className="modal-close" onClick={() => setShowAddForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddPublisher} style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">Organization Name</label>
                <input required className="text-input" type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Stanford AI Group" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">Verification Public Key (ED25519/RSA)</label>
                <input required className="text-input mono" type="text" value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="PEM, ED25519, or RSA public key..." />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">Security Email</label>
                <input className="text-input" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="security@organization.org" />
              </div>
              <button className="primary-button" type="submit" style={{ width: "100%", marginTop: 8 }}>
                Approve and Register Authority
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Publishers */}
      <div className="publisher-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {localPublishers.map(pub => {
          const isSelected = selectedPublisher === pub.name;
          return (
            <div key={pub.id} className={`publisher-card ${pub.status.toLowerCase()}${isSelected ? " selected" : ""}`} style={{
              background: "var(--surface-solid)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderColor: isSelected ? "var(--cyan)" : "var(--border)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--surface)", display: "grid", placeItems: "center" }}>
                  <Building2 size={20} style={{ color: pub.status === "Revoked" ? "var(--red)" : "var(--cyan)" }} />
                </div>
                <StatusBadge status={pub.status} />
              </div>

              <div>
                <h3 style={{ margin: "4px 0" }}>{pub.name}</h3>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Registered: {pub.since} • {pub.country}</span>
              </div>

              <div style={{ background: "rgba(0,0,0,0.15)", padding: 8, borderRadius: 6 }}>
                <span className="eyebrow" style={{ display: "block", fontSize: 9, color: "var(--text-muted)", marginBottom: 2 }}>PUBLIC KEY CRYPTO IDENTITY</span>
                <code className="mono" style={{ fontSize: 10.5, wordBreak: "break-all" }}>{pub.key}</code>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
                <span>Verified Models: <strong>{pub.models}</strong></span>
                <span>Contact: <strong>{pub.email}</strong></span>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {pub.status !== "Revoked" ? (
                  <>
                    <button className="secondary-button" style={{ flex: 1 }} onClick={() => selectPublisher(pub)} disabled={isSelected}>
                      {isSelected ? "Active Signer" : "Verify Authority"}
                    </button>
                    <button className="danger-button" onClick={() => handleRevoke(pub.id)} title="Revoke Trust">
                      Revoke
                    </button>
                  </>
                ) : (
                  <span style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldAlert size={14} /> Authority revoked due to certificate leakage risk.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
