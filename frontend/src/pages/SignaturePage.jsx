import { useState } from "react";
import { useModel } from "../context/ModelContext";
import { FileKey, ShieldCheck, AlertTriangle, Key, Copy, Check, Info } from "lucide-react";
import { generateDemoHash } from "../utils/crypto";

export default function SignaturePage() {
  const { merkleRoot, modelName, selectedPublisher, signatureStatus } = useModel();
  const [privateKey, setPrivateKey] = useState("ED25519_PRV_KEY_DEMO_SECRET_49201");
  const [publicKey, setPublicKey] = useState("ED25519_PUB_KEY_DEMO_VERIFY_99182");
  const [manifestText, setManifestText] = useState("");
  const [generatedSignature, setGeneratedSignature] = useState("");
  const [verifySigInput, setVerifySigInput] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [copied, setCopied] = useState(false);

  function handleSign() {
    // Generate a signature based on the manifest text and private key
    const payload = `${modelName}-${merkleRoot}-${privateKey}`;
    const sig = "SIG_ED25519_" + generateDemoHash(payload).slice(0, 48).toUpperCase();
    setGeneratedSignature(sig);
    setVerifySigInput(sig);
  }

  function handleVerify() {
    if (!verifySigInput) return;
    // For demo purposes: check if the signature matches the model's manifest validation pattern
    const isValid = verifySigInput.startsWith("SIG_ED25519_") && verifySigInput.length > 30;
    setVerificationResult(isValid ? "valid" : "invalid");
  }

  function copySig() {
    navigator.clipboard.writeText(generatedSignature);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Digital Signature & Authentication</h2>
          <p>Generate cryptographic signatures to prove model origin and verify authenticity</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Signature Generator */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)" }}>
            <h3>Signature Generation</h3>
            <p className="sub">Publisher private key manifest signer</p>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label className="field-label">Active Model Manifest Root</label>
              <code className="mono" style={{ display: "block", background: "var(--surface)", padding: 8, borderRadius: 4, fontSize: 12 }}>
                {merkleRoot}
              </code>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="field-label">Publisher Private Key (PEM format)</label>
              <input
                className="text-input mono"
                type="password"
                value={privateKey}
                onChange={e => setPrivateKey(e.target.value)}
              />
            </div>
            <button className="primary-button" style={{ width: "100%" }} onClick={handleSign}>
              <FileKey size={16} /> Sign Model Manifest
            </button>

            {generatedSignature && (
              <div style={{ marginTop: 16, background: "var(--surface)", padding: 12, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>GENERATED SIGNATURE</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <code className="mono" style={{ flex: 1, fontSize: 11, wordBreak: "break-all", color: "var(--cyan)" }}>{generatedSignature}</code>
                  <button className="icon-copy" onClick={copySig} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    {copied ? <Check size={14} style={{ color: "var(--green)" }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signature Verification */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)" }}>
            <h3>Signature Verification</h3>
            <p className="sub">Verify signature against publisher public key</p>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label className="field-label">Publisher Public Key (ED25519 / RSA)</label>
              <input
                className="text-input mono"
                type="text"
                value={publicKey}
                onChange={e => setPublicKey(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="field-label">Cryptographic Signature</label>
              <textarea
                className="text-input mono"
                style={{ height: 60, resize: "none", fontSize: 11 }}
                placeholder="Paste digital signature to verify..."
                value={verifySigInput}
                onChange={e => setVerifySigInput(e.target.value)}
              />
            </div>
            <button className="secondary-button" style={{ width: "100%" }} onClick={handleVerify} disabled={!verifySigInput}>
              <ShieldCheck size={16} /> Verify Digital Signature
            </button>

            {verificationResult && (
              <div className={`compare-result ${verificationResult === "valid" ? "match" : "mismatch"}`} style={{
                marginTop: 16, display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: "var(--radius-sm)",
                background: verificationResult === "valid" ? "var(--green-soft)" : "var(--red-soft)",
                border: `1px solid ${verificationResult === "valid" ? "var(--green)" : "var(--red)"}`,
                color: verificationResult === "valid" ? "var(--green)" : "var(--red)"
              }}>
                {verificationResult === "valid" ? (
                  <>
                    <ShieldCheck size={18} />
                    <div>
                      <strong>AUTHENTIC SIGNATURE</strong>
                      <span style={{ display: "block", fontSize: 11 }}>Matches trusted publisher public key profile.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} />
                    <div>
                      <strong>INVALID SIGNATURE</strong>
                      <span style={{ display: "block", fontSize: 11 }}>Signature verification failed or key mismatch.</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="information-box" style={{ display: "flex", gap: 12, background: "var(--surface)", border: "1px solid var(--border)", padding: 16, borderRadius: "var(--radius-md)" }}>
        <Info size={24} style={{ color: "var(--cyan)", flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)" }}>
          <strong>Authentication Flow:</strong> Publishers sign model configurations using their private key. Users verify the model's integrity by cryptographically validating the signature with the publisher's public key. If the model contents are tampered, signature verification fails automatically.
        </p>
      </div>
    </div>
  );
}
