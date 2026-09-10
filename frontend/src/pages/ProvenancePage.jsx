import { useModel } from "../context/ModelContext";
import { provenanceChain } from "../utils/data";
import { GitBranch, ShieldCheck, Calendar, ArrowRight, User } from "lucide-react";

export default function ProvenancePage() {
  const { modelName, modelType, merkleRoot } = useModel();

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Provenance Lineage Tracking</h2>
          <p>Trace the immutable chain of custody, publishers, fine-tunes, and verifications from genesis training weights</p>
        </div>
      </div>

      {/* Model Overview Card */}
      <div className="panel" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="eyebrow" style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>LINAGE TARGET MODEL</span>
            <h3 style={{ margin: "2px 0" }}>{modelName}</h3>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{modelType}</span>
          </div>
          <div>
            <span className="eyebrow" style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>SECURE FINGERPRINT</span>
            <code className="mono" style={{ fontSize: 13, color: "var(--cyan)" }}>{merkleRoot}</code>
          </div>
        </div>
      </div>

      {/* Provenance timeline */}
      <div className="panel" style={{ padding: 24 }}>
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
