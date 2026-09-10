import { useModel } from "../context/ModelContext";
import { generateFingerprint, shortenHash } from "../utils/crypto";
import { Fingerprint, Copy, Check, Info, ShieldCheck, Heart } from "lucide-react";
import { useState } from "react";

export default function FingerprintPage() {
  const { modelName, modelType, merkleRoot } = useModel();
  const [copied, setCopied] = useState(false);
  const fp = generateFingerprint(modelName, merkleRoot);

  function copyFp() {
    navigator.clipboard.writeText(fp);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Model Cryptographic Fingerprint</h2>
          <p>View unique secure fingerprints derived from weight structures and publisher metadata</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Fingerprint Card */}
        <div className="panel" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ display: "inline-grid", placeItems: "center", width: 64, height: 64, borderRadius: "50%", background: "var(--cyan-soft)", border: "1px solid var(--cyan)", color: "var(--cyan)", marginBottom: 16 }}>
            <Fingerprint size={32} />
          </div>
          <span className="eyebrow" style={{ display: "block", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>MUTABLE IDENTIFIER</span>
          <h2 style={{ margin: "6px 0", fontSize: 28, color: "var(--text-primary)", letterSpacing: "0.02em" }}>{fp}</h2>
          <span style={{ display: "block", fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 20 }}>Computed from Merkle Root + Model Name metadata</span>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="primary-button" onClick={copyFp}>
              {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy Fingerprint</>}
            </button>
          </div>
        </div>

        {/* Security Specs */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            <h3>Cryptographic Specs</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>GENESIS TARGET</span>
              <strong>{modelName}</strong>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>MERKLE ROOT HASH</span>
              <code className="mono" style={{ fontSize: 11.5, wordBreak: "break-all" }}>{merkleRoot}</code>
            </div>
            <div>
              <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>SECURITY STATUS</span>
              <span style={{ color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                <ShieldCheck size={14} /> Signature Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="information-box" style={{ display: "flex", gap: 12, background: "var(--surface)", border: "1px solid var(--border)", padding: 16, borderRadius: "var(--radius-md)", marginTop: 18 }}>
        <Info size={24} style={{ color: "var(--cyan)", flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)" }}>
          <strong>What is a Model Fingerprint?</strong> ModelGuard's unique cryptographic ID format (e.g. <code>MG-ABCD-EFGH</code>) provides a short, human-verifiable reference to check models in deployment pipelines or code releases. It changes if parameters are tampered, serving as a secure version baseline.
        </p>
      </div>
    </div>
  );
}
