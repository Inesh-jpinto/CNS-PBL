import { useState } from "react";
import { useModel } from "../context/ModelContext";
import { FileText, Download, ShieldCheck, AlertTriangle, CheckCircle2, Layers, Cpu } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

export default function ReportsPage() {
  const {
    modelName, modelType, modelFile, verificationStatus, securityScore,
    signatureStatus, selectedPublisher, layers, tamperedLayers,
    merkleRoot, downloadReport, history
  } = useModel();

  const [selectedHistoryId, setSelectedHistoryId] = useState("current");

  // Determine target report model details
  const selectedHistoryItem = history.find(h => String(h.id) === String(selectedHistoryId));

  const activeTargetName = selectedHistoryId === "current" ? modelName : (selectedHistoryItem?.model || modelName);
  const activeStatus = selectedHistoryId === "current" ? verificationStatus : (selectedHistoryItem?.result === "PASSED" ? "VERIFIED" : "FAILED");
  const activeScore = selectedHistoryId === "current" ? securityScore : (selectedHistoryItem?.score || 100);
  const activePublisher = selectedHistoryId === "current" ? (selectedPublisher || "Google DeepMind Labs (Verified)") : (selectedHistoryItem?.publisher || "Trusted Authority");

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Security Report Generator</h2>
          <p>Export model integrity reports containing comprehensive cryptographic validation details and corruption summaries</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Live Preview Panel */}
        <div className="report-panel panel" style={{ padding: 24 }}>
          <div className="report-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--cyan-soft)", border: "1px solid var(--cyan)", display: "grid", placeItems: "center", color: "var(--cyan)" }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>ModelGuard Verification Report</h3>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Generated: {new Date().toLocaleString()}</span>
              </div>
            </div>
            <StatusBadge status={activeStatus} />
          </div>

          {/* Recently Uploaded Model Selector */}
          <div style={{ marginBottom: 18, padding: 12, background: "rgba(0,0,0,0.15)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <label className="field-label" style={{ fontSize: 11, color: "var(--cyan)", display: "block", marginBottom: 6, fontWeight: 600 }}>
              SELECT RECENTLY UPLOADED MODEL REPORT
            </label>
            <select
              value={selectedHistoryId}
              onChange={e => setSelectedHistoryId(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-primary)", fontSize: 13
              }}
            >
              <option value="current">Current Active Upload: {modelName} ({verificationStatus})</option>
              {history.map(item => (
                <option key={item.id} value={item.id}>
                  {item.model} — {item.version} ({item.result}) • {item.time}
                </option>
              ))}
            </select>
          </div>

          {/* Model Metrics Grid */}
          <div className="report-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>MODEL TARGET</span>
              <strong style={{ fontSize: 14, color: "var(--cyan)" }}>{activeTargetName}</strong>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>FRAMEWORK / TYPE</span>
              <strong>{modelType}</strong>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>INTEGRITY SCORE</span>
              <strong style={{ color: activeScore > 50 ? "var(--green)" : "var(--red)", fontSize: 15 }}>{activeScore}%</strong>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>SIGNATURE STATUS</span>
              <strong>{signatureStatus}</strong>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>PUBLISHER IDENTITY</span>
              <strong>{activePublisher}</strong>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>TOTAL LAYERS SCAN</span>
              <strong>{layers.length} layers analyzed</strong>
            </div>
          </div>

          {/* Immutable Merkle Root */}
          <div style={{ background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 6, marginBottom: 20, border: "1px solid var(--border)" }}>
            <span className="eyebrow" style={{ display: "block", fontSize: 9, color: "var(--text-muted)", marginBottom: 4 }}>IMMUTABLE MERKLE ROOT HASH</span>
            <code className="mono" style={{ fontSize: 12, wordBreak: "break-all", color: "var(--cyan)" }}>{merkleRoot}</code>
          </div>

          {/* Export Action Buttons */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10 }}>
            <button className="primary-button" style={{ background: "linear-gradient(135deg, var(--cyan), #00b4d8)", color: "#0b0e14", fontWeight: 700 }} onClick={() => downloadReport("pdf")}>
              <Download size={16} /> Download PDF Report
            </button>
            <button className="secondary-button" onClick={() => downloadReport("json")}>
              <FileText size={15} /> Download JSON
            </button>
            <button className="secondary-button" onClick={() => downloadReport("txt")}>
              <FileText size={15} /> Export TXT Summary
            </button>
          </div>
        </div>

        {/* Corruption & Integrity Summary Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="panel" style={{ padding: 18, borderLeft: tamperedLayers.length > 0 ? "4px solid var(--red)" : "4px solid var(--green)" }}>
            <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              {tamperedLayers.length > 0 ? <AlertTriangle size={18} style={{ color: "var(--red)" }} /> : <CheckCircle2 size={18} style={{ color: "var(--green)" }} />}
              <h3 style={{ fontSize: 14 }}>Corruption & Layer Audit Summary</h3>
            </div>

            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>TARGET MODEL</span>
                <strong style={{ color: "var(--text-primary)" }}>{activeTargetName}</strong>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>CORRUPTED LAYERS COUNT</span>
                <strong style={{ color: tamperedLayers.length > 0 ? "var(--red)" : "var(--green)", fontSize: 14 }}>
                  {tamperedLayers.length} Layer(s) Corrupted
                </strong>
              </div>

              {tamperedLayers.length > 0 ? (
                <div style={{ background: "rgba(239, 68, 68, 0.08)", padding: 10, borderRadius: 6, border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", display: "block", marginBottom: 4 }}>
                    FLAGGED LAYER CORRUPTIONS:
                  </span>
                  <ul style={{ paddingLeft: 16, margin: 0, fontSize: 11.5, color: "#fca5a5" }}>
                    {layers.filter(l => l.status === "tampered").map(t => (
                      <li key={t.id}>Layer #{t.id}: {t.name} ({t.type})</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: 10, borderRadius: 6, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <span style={{ fontSize: 11.5, color: "#6ee7b7", fontWeight: 600 }}>
                    ✓ 0 Corrupted Layers Detected. All model layer weight hashes match their cryptographic baseline.
                  </span>
                </div>
              )}

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>RECOMMENDED ACTION</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: tamperedLayers.length > 0 ? "var(--red)" : "var(--green)" }}>
                  {tamperedLayers.length > 0 ? "REJECT DEPLOYMENT (Weight Tampering Flagged)" : "APPROVED FOR INFERENCE DEPLOYMENT"}
                </span>
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: 18 }}>
            <div className="card-head" style={{ padding: "0 0 10px 0", borderBottom: "1px solid var(--border)", marginBottom: 10 }}>
              <h3 style={{ fontSize: 13 }}>Audit Verification Info</h3>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
              Exported PDF reports contain full SHA-256 weight hash baselines, digital signatures, and Merkle leaf proofs. Use the PDF download button for formal audit sign-offs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
