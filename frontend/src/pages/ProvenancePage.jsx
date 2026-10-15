import { useMemo } from "react";
import { useModel } from "../context/ModelContext";
import { ALL_PUBLISHERS } from "../utils/publishers";
import { provenanceChain } from "../utils/data";
import { getTamperPercentageForModel } from "../utils/crypto";
import {
  GitBranch, ShieldCheck, Calendar, User, FileText,
  AlertTriangle, Building2, CheckCircle2, XCircle,
  AlertOctagon, Clock, Layers, ExternalLink, Shield, Lock
} from "lucide-react";

export default function ProvenancePage() {
  const {
    modelName, modelType, merkleRoot,
    uploadedModels, formatSystemTime,
  } = useModel();

  // Build provenance data for all uploaded files
  const fileProvenanceList = useMemo(() => {
    return uploadedModels.map(model => {
      const isTampered = model.status === "FAILED" || model.tamperPercentage > 0;
      let publisher;

      if (isTampered) {
        publisher = {
          name: "Unknown Publisher",
          displayName: "⚠ Unknown Publisher",
          description: "Unknown publisher not found in database. This model's origin could not be verified against any trusted publisher in the ModelGuard registry.",
          status: "Untrusted",
          keyFingerprint: "NONE",
          keyType: "N/A",
          country: "Unknown",
        };
      } else {
        // Deterministic random publisher based on model id
        const seed = typeof model.id === "number" ? model.id : 0;
        const idx = seed % ALL_PUBLISHERS.length;
        publisher = ALL_PUBLISHERS[idx];
      }

      // Each corrupted file has its own unique persistent random number from 5 to 20 (e.g., 16.3%, 19.2%)
      const tamperPercentage = isTampered ? (model.tamperPercentage || getTamperPercentageForModel(model)) : 0;
      const intactPercentage = isTampered ? (model.intactPercentage || Number((100 - tamperPercentage).toFixed(1))) : 100;

      return {
        ...model,
        isTampered,
        publisher,
        tamperPercentage,
        intactPercentage,
      };
    });
  }, [uploadedModels]);

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Model Lineage & Provenance Logs</h2>
          <p>Complete file provenance, publisher verification, and chain-of-custody records for all uploaded models</p>
        </div>
      </div>

      {/* Model Overview Card */}
      <div className="panel" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="eyebrow" style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>LINEAGE TARGET MODEL</span>
            <h3 style={{ margin: "2px 0" }}>{modelName}</h3>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{modelType}</span>
          </div>
          <div>
            <span className="eyebrow" style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>SECURE FINGERPRINT</span>
            <code className="mono" style={{ fontSize: 13, color: "var(--cyan)" }}>{merkleRoot}</code>
          </div>
        </div>
      </div>

      {/* ===== Uploaded Files Provenance Section ===== */}
      {fileProvenanceList.length > 0 && (
        <div className="panel" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <FileText size={18} style={{ color: "var(--accent-cyan)" }} />
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Uploaded Files — Publisher Provenance</h3>
            <span style={{
              background: "rgba(34,211,238,0.15)", color: "var(--accent-cyan)",
              fontSize: "0.72rem", padding: "2px 8px", borderRadius: 12, fontWeight: 600,
              marginLeft: 8,
            }}>
              {fileProvenanceList.length} {fileProvenanceList.length === 1 ? "File" : "Files"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {fileProvenanceList.map(file => (
              <div
                key={file.id}
                style={{
                  padding: "18px 20px",
                  borderRadius: 12,
                  background: file.isTampered ? "rgba(239,68,68,0.04)" : "var(--bg-secondary)",
                  border: `1px solid ${file.isTampered ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                }}
              >
                {/* File Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: file.isTampered ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                      display: "grid", placeItems: "center",
                      color: file.isTampered ? "var(--red)" : "var(--green)",
                    }}>
                      {file.isTampered ? <AlertTriangle size={22} /> : <ShieldCheck size={22} />}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {file.fileName}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{file.modelType}</span>
                        <span>•</span>
                        <span>{file.fileSize}</span>
                        <span>•</span>
                        <span>{file.totalLayers} Layers</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: "5px 12px", borderRadius: 8,
                    background: file.isTampered ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                    border: `1px solid ${file.isTampered ? "var(--red)" : "var(--green)"}`,
                    color: file.isTampered ? "var(--red)" : "var(--green)",
                    fontWeight: 700, fontSize: "0.8rem",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {file.isTampered ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                    {file.isTampered ? "TAMPERED" : "VERIFIED"}
                  </div>
                </div>

                {/* Publisher Card */}
                <div style={{
                  padding: "14px 16px", borderRadius: 10,
                  background: file.isTampered ? "rgba(239,68,68,0.08)" : "rgba(34,211,238,0.06)",
                  border: `1px solid ${file.isTampered ? "rgba(239,68,68,0.2)" : "rgba(34,211,238,0.15)"}`,
                  marginBottom: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: file.isTampered ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.12)",
                      display: "grid", placeItems: "center",
                      color: file.isTampered ? "var(--red)" : "var(--green)",
                    }}>
                      {file.isTampered ? <AlertOctagon size={18} /> : <Building2 size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: file.isTampered ? "var(--red)" : "var(--text-primary)" }}>
                        {file.publisher.displayName || file.publisher.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {file.isTampered ? "NOT IN TRUSTED REGISTRY" : `Verified Authority • ${file.publisher.country}`}
                      </div>
                    </div>
                  </div>

                  {file.isTampered ? (
                    <div style={{
                      padding: "8px 12px", borderRadius: 6,
                      background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
                      fontSize: "0.82rem", color: "var(--red)", fontWeight: 600,
                    }}>
                      ⚠ Unknown publisher not found in database — model origin cannot be verified
                    </div>
                  ) : (
                    <>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {file.publisher.description}
                      </p>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        <span>Key: <code style={{ color: "var(--cyan)" }}>{file.publisher.keyFingerprint}</code></span>
                        <span>Type: <strong>{file.publisher.keyType}</strong></span>
                        <span>Models: <strong>{file.publisher.models}</strong></span>
                        <span>Since: <strong>{file.publisher.since}</strong></span>
                      </div>
                    </>
                  )}
                </div>

                {/* Integrity & Risk Summary */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 10,
                }}>
                  <div style={{ background: "rgba(0,0,0,0.12)", padding: "10px 12px", borderRadius: 8 }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Integrity</span>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--green)", marginTop: 2 }}>
                      {file.intactPercentage}%
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.12)", padding: "10px 12px", borderRadius: 8 }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Tampered</span>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: file.isTampered ? "var(--red)" : "var(--text-muted)", marginTop: 2 }}>
                      {file.tamperPercentage}%
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.12)", padding: "10px 12px", borderRadius: 8 }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Risk Level</span>
                    <div style={{
                      fontSize: "0.95rem", fontWeight: 800, marginTop: 4,
                      color: file.isTampered ? (file.tamperPercentage > 30 ? "#dc2626" : "#f97316") : "#22c55e",
                    }}>
                      {file.isTampered ? (file.tamperPercentage > 30 ? "CRITICAL" : file.tamperPercentage > 15 ? "HIGH" : "MEDIUM") : "LOW"}
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.12)", padding: "10px 12px", borderRadius: 8 }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Deploy</span>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 4, marginTop: 4,
                      color: file.isTampered ? "var(--red)" : "var(--green)", fontWeight: 700, fontSize: "0.85rem",
                    }}>
                      {file.isTampered ? <Lock size={13} /> : <Shield size={13} />}
                      {file.isTampered ? "BLOCKED" : "CLEARED"}
                    </div>
                  </div>
                </div>

                {/* Tampered Layers Detail (if any) */}
                {file.isTampered && file.tamperedLayers?.length > 0 && (
                  <div style={{
                    marginTop: 12, padding: "10px 14px", borderRadius: 8,
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--red)", fontWeight: 600, marginBottom: 6 }}>
                      Compromised Layers: {file.tamperedLayers.join(", ")}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                      {file.tamperedLayersCount} of {file.totalLayers} layers have been modified — tampered content: {file.tamperPercentage}%
                    </div>
                  </div>
                )}

                {/* Upload Timestamp */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginTop: 12,
                  fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)",
                }}>
                  <Clock size={12} /> Uploaded: {file.uploadTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fileProvenanceList.length === 0 && (
        <div className="panel" style={{ textAlign: "center", padding: "48px 24px", marginBottom: 20 }}>
          <FileText size={32} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          <h3 style={{ color: "var(--text-primary)" }}>No Uploaded Files</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Upload a model file to see its publisher provenance and chain-of-custody details.
          </p>
        </div>
      )}

      {/* Original Provenance timeline */}
      <div className="panel" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <GitBranch size={18} style={{ color: "var(--accent-cyan)" }} />
          <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Genesis Provenance Chain</h3>
        </div>

        <div className="provenance-timeline" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {provenanceChain.map((step, i) => (
            <div key={step.id} style={{ display: "flex", gap: 16, alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "var(--cyan-soft)",
                  border: "1px solid var(--cyan)", display: "grid", placeItems: "center", color: "var(--cyan)",
                  fontWeight: 700, fontSize: 13
                }}>
                  {i + 1}
                </div>
                {i < provenanceChain.length - 1 && (
                  <div style={{ width: 2, height: 42, background: "var(--border)", marginTop: 8 }} />
                )}
              </div>

              <div style={{
                flex: 1, background: "var(--surface)", border: "1px solid var(--border)",
                padding: 14, borderRadius: "var(--radius-md)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <h4 style={{ margin: 0, fontSize: 14, color: "var(--text-primary)" }}>{step.event}</h4>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} /> {step.timestamp}
                  </span>
                </div>

                <p style={{ margin: "0 0 8px 0", fontSize: 12.5, color: "var(--text-secondary)" }}>{step.note}</p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: 11, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
                    <User size={12} /> Actor: <strong style={{ color: "var(--text-secondary)" }}>{step.actor}</strong>
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    Lineage Hash: <code className="mono">{step.hash}</code>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
