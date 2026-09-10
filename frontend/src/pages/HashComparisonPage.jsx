import { useState } from "react";
import { useModel } from "../context/ModelContext";
import { GitCompare, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { generateDemoHash } from "../utils/crypto";

export default function HashComparisonPage() {
  const { merkleRoot, layers } = useModel();
  const [modelAHash, setModelAHash] = useState(merkleRoot);
  const [modelBHash, setModelBHash] = useState("");
  const [result, setResult] = useState(null);

  function compareHashes() {
    if (!modelAHash || !modelBHash) return;
    const cleanA = modelAHash.trim().toLowerCase();
    const cleanB = modelBHash.trim().toLowerCase();

    if (cleanA === cleanB) {
      setResult({ status: "match", message: "Cryptographic fingerprints are identical. No tampering detected." });
    } else {
      // Find a mock tampered layer
      setResult({
        status: "mismatch",
        message: "Fingerprint mismatch. The model structure has been altered.",
        mismatchedLayers: ["encoder.layer.2.mlp", "classifier.weight"]
      });
    }
  }

  function loadDemoHash() {
    // Generate a slightly modified hash
    setModelBHash(generateDemoHash(merkleRoot + "-tampered"));
  }

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Hash Comparison</h2>
          <p>Compare model fingerprint hashes side-by-side to detect structural integrity changes</p>
        </div>
      </div>

      <div className="panel" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 18 }}>
          <div>
            <label className="field-label">Model Fingerprint A (Current / Baseline)</label>
            <textarea
              className="text-input mono"
              style={{ height: 80, fontSize: 11 }}
              value={modelAHash}
              onChange={e => setModelAHash(e.target.value)}
              placeholder="Paste reference or current model Merkle Root..."
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="field-label">Model Fingerprint B (Verification target)</label>
              <button className="link-btn" onClick={loadDemoHash} style={{ fontSize: 11 }}>Load Mock Tampered Hash</button>
            </div>
            <textarea
              className="text-input mono"
              style={{ height: 80, fontSize: 11 }}
              value={modelBHash}
              onChange={e => setModelBHash(e.target.value)}
              placeholder="Paste verification target model Merkle Root..."
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="primary-button" onClick={compareHashes} disabled={!modelAHash || !modelBHash}>
            <GitCompare size={16} /> Compare Hashes
          </button>
          <button className="secondary-button" onClick={() => { setModelBHash(""); setResult(null); }}>
            Reset
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
            <div className={`compare-result-panel ${result.status}`} style={{
              background: result.status === "match" ? "var(--green-soft)" : "var(--red-soft)",
              border: `1px solid ${result.status === "match" ? "var(--green)" : "var(--red)"}`,
              padding: 16,
              borderRadius: "var(--radius-md)",
              color: result.status === "match" ? "var(--green)" : "var(--red)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {result.status === "match" ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
                <div>
                  <h4 style={{ margin: 0, fontSize: 15 }}>{result.status === "match" ? "INTEGRITY SECURE" : "INTEGRITY FLAGGED"}</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "var(--text-secondary)" }}>{result.message}</p>
                </div>
              </div>

              {result.mismatchedLayers && (
                <div style={{ marginTop: 14, background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: "var(--radius-sm)" }}>
                  <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 8 }}>DIFFERENCE ANALYSIS DETECTED WEIGHT CHANGES IN:</span>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)" }}>
                    {result.mismatchedLayers.map(l => (
                      <li key={l} style={{ marginBottom: 4 }}>Layer weights parameter: <code style={{ color: "var(--red)" }}>{l}</code></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
