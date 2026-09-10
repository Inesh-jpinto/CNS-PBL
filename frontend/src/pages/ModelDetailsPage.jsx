import { useParams, useNavigate } from "react-router-dom";
import { registeredModels, modelVersions } from "../utils/data";
import { ShieldCheck, Cpu, ArrowLeft, Download, FileJson, Clock, History, AlertTriangle } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

export default function ModelDetailsPage() {
  const { modelId } = useParams();
  const navigate = useNavigate();

  // Find model or use default
  const model = registeredModels.find(m => m.id === modelId) || registeredModels[0];

  return (
    <div className="page-section">
      <div style={{ marginBottom: 16 }}>
        <button className="secondary-button" onClick={() => navigate("/models")}>
          <ArrowLeft size={14} /> Back to Registry
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Main Details */}
        <div className="panel" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "grid", placeItems: "center" }}>
                <Cpu size={24} style={{ color: "var(--cyan)" }} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>{model.name}</h2>
                <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>{model.version} • {model.framework}</span>
              </div>
            </div>
            <StatusBadge status={model.status} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "16px 0", marginBottom: 18 }}>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>PUBLISHER</span>
              <strong>{model.publisher}</strong>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>CRYPTO FINGERPRINT</span>
              <code className="mono" style={{ color: "var(--cyan)" }}>{model.fingerprint}</code>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>MODEL FILE SIZE</span>
              <strong>{model.size}</strong>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>INTEGRITY RISK LEVEL</span>
              <span style={{ color: model.riskScore > 50 ? "var(--red)" : "var(--green)", fontWeight: 600 }}>
                {model.riskScore > 50 ? "High Risk" : "Secure"} ({model.riskScore}%)
              </span>
            </div>
          </div>

          <h3>Model Versions</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Release Date</th>
                  <th>Hash</th>
                  <th>Key Changes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {modelVersions.map(v => (
                  <tr key={v.version}>
                    <td><strong className="mono">{v.version}</strong></td>
                    <td>{v.date}</td>
                    <td><code className="mono" style={{ fontSize: 11 }}>{v.hash}</code></td>
                    <td>{v.changes}</td>
                    <td><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            <h3>Verification Actions</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="primary-button" onClick={() => navigate("/models/upload")} style={{ width: "100%" }}>
              <ShieldCheck size={16} /> Run Health Check
            </button>
            <button className="secondary-button" onClick={() => navigate("/records/manifest")} style={{ width: "100%" }}>
              <FileJson size={16} /> View JSON Manifest
            </button>
            <button className="secondary-button" onClick={() => navigate("/registry/provenance")} style={{ width: "100%" }}>
              <History size={16} /> Trace Provenance
            </button>
            {model.status === "tampered" && (
              <div style={{ marginTop: 12, padding: 12, borderRadius: "var(--radius-sm)", background: "var(--red-soft)", border: "1px solid var(--red)", display: "flex", gap: 8, color: "var(--red)", fontSize: 12 }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Model Tampered</strong>
                  <span style={{ display: "block", marginTop: 2, color: "var(--text-secondary)" }}>This model is flagged. Avoid deployment.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
