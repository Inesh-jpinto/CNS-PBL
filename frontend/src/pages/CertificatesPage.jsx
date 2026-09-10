import { useModel } from "../context/ModelContext";
import { Award, CheckCircle2, ShieldCheck, Download, Calendar, ArrowRight } from "lucide-react";
import { generateFingerprint } from "../utils/crypto";

export default function CertificatesPage() {
  const { modelName, modelType, merkleRoot, verificationStatus } = useModel();
  const fp = generateFingerprint(modelName, merkleRoot);

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Digital Verification Certificates</h2>
          <p>Download signed verification certificates for successfully passed model checks</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
        {/* Certificate Display */}
        <div className="panel" style={{
          width: "100%", maxWidth: 640, padding: 36, position: "relative",
          background: "linear-gradient(135deg, rgba(8,11,18,0.95), rgba(17,24,39,0.95))",
          border: "2px solid var(--cyan)", borderRadius: "var(--radius-lg)", boxShadow: "0 24px 48px rgba(0,0,0,0.5)"
        }}>
          {/* Decorative Corner borders */}
          <div style={{ position: "absolute", top: 12, left: 12, width: 24, height: 24, borderTop: "2px solid var(--cyan)", borderLeft: "2px solid var(--cyan)" }} />
          <div style={{ position: "absolute", top: 12, right: 12, width: 24, height: 24, borderTop: "2px solid var(--cyan)", borderRight: "2px solid var(--cyan)" }} />
          <div style={{ position: "absolute", bottom: 12, left: 12, width: 24, height: 24, borderBottom: "2px solid var(--cyan)", borderLeft: "2px solid var(--cyan)" }} />
          <div style={{ position: "absolute", bottom: 12, right: 12, width: 24, height: 24, borderBottom: "2px solid var(--cyan)", borderRight: "2px solid var(--cyan)" }} />

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "inline-grid", placeItems: "center", width: 54, height: 54, borderRadius: "50%", background: "var(--cyan-soft)", color: "var(--cyan)", marginBottom: 12 }}>
              <Award size={28} />
            </div>
            <h3 style={{ margin: 0, fontSize: 20, letterSpacing: "0.05em", color: "var(--text-primary)" }}>CERTIFICATE OF INTEGRITY</h3>
            <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.15em" }}>ISSUED BY MODELGUARD AUTHENTICATOR</span>
          </div>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 auto 8px auto", maxWidth: 440 }}>
              This certifies that the weights parameters and architecture configuration of target model
            </p>
            <h2 style={{ color: "var(--cyan)", fontSize: 22, margin: "6px 0" }}>{modelName}</h2>
            <span className="mono" style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{modelType}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "16px 0", marginBottom: 24 }}>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>SECURITY STATUS</span>
              <span style={{ color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, fontSize: 12.5 }}>
                <CheckCircle2 size={14} /> Integrity Verified
              </span>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>FINGERPRINT CODE</span>
              <code className="mono" style={{ fontSize: 11.5 }}>{fp}</code>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>DATE SECURED</span>
              <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={13} /> {new Date().toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>MERKLE ROOT HASH</span>
              <code className="mono" style={{ fontSize: 10 }}>{merkleRoot.slice(0, 16)}...</code>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Mock validation QR code */}
              <div style={{
                width: 50, height: 50, background: "var(--text-primary)", padding: 4, borderRadius: 4,
                display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2
              }}>
                {Array.from({ length: 25 }).map((_, idx) => (
                  <div key={idx} style={{ background: (idx % 2 === 0 || idx % 3 === 0) ? "#000" : "transparent" }} />
                ))}
              </div>
              <div>
                <span className="eyebrow" style={{ display: "block", fontSize: 8, color: "var(--text-muted)" }}>SCAN TO VERIFY</span>
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>Secure Validation URL</span>
              </div>
            </div>

            <button className="primary-button" onClick={() => window.print()}>
              <Download size={14} /> Download PDF Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
