import { useState } from "react";
import { useModel } from "../context/ModelContext";
import { Layers, ShieldCheck, AlertTriangle, Search, Copy, Check } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { shortenHash } from "../utils/crypto";

export default function LayerVerificationPage() {
  const { layers, tamperedLayers, copyHash, copiedHash, verificationStatus } = useModel();
  const [searchVal, setSearchVal] = useState("");

  const filtered = layers.filter(l =>
    l.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    l.type.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Layer Hashing & Verification</h2>
          <p>Detailed verification status and SHA-256 integrity baseline of every model layer</p>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <h3>Integrity Heatmap</h3>
          <p className="sub">Visual map of verified vs. tampered layers</p>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div className="heatmap-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
            {layers.map(l => (
              <div
                key={l.id}
                className={`heatmap-cell ${l.status}`}
                style={{
                  padding: 12,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                  background: l.status === "tampered" ? "var(--red-soft)" : "var(--green-soft)",
                  borderColor: l.status === "tampered" ? "var(--red)" : "var(--green)",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Layer {l.id}</div>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={l.name}>
                  {l.name.split(".").pop()}
                </div>
                <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
                  <StatusBadge status={l.status === "tampered" ? "Tampered" : "Verified"} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--green)" }} />Verified ({layers.length - tamperedLayers.length})</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--red)" }} />Tampered ({tamperedLayers.length})</span>
          </div>
        </div>
      </div>

      {/* Main Layers Table */}
      <div className="panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3>All Model Layers ({layers.length})</h3>
            <p>Verification engine status logs per tensor weights</p>
          </div>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Filter by name or type..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Layer Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Cryptographic Hash (SHA-256)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td><span className="mono">{l.id}</span></td>
                  <td><strong>{l.name}</strong></td>
                  <td><span className="chip">{l.type}</span></td>
                  <td>{l.size}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code className="mono">{shortenHash(l.hash, 16)}</code>
                      <button className="icon-copy" onClick={() => copyHash(l.hash)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                        {copiedHash === l.hash ? <Check size={14} style={{ color: "var(--green)" }} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td><StatusBadge status={l.status === "tampered" ? "Tampered" : "Verified"} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
                    No layers match your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
