import { useState } from "react";
import { Hash, Copy, Check, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { generateDemoHash, shortenHash } from "../utils/crypto";
import { useModel } from "../context/ModelContext";

export default function HashVerificationPage() {
  const { copyHash, copiedHash, layers } = useModel();
  const [input, setInput] = useState("");
  const [refHash, setRefHash] = useState("");
  const [generated, setGenerated] = useState("");
  const [compareResult, setCompareResult] = useState(null);

  function generateHash() {
    const h = generateDemoHash(input || "modelguard-demo");
    setGenerated(h);
    setCompareResult(null);
  }

  function compareHashes() {
    if (!generated || !refHash) return;
    setCompareResult(generated === refHash ? "match" : "mismatch");
  }

  return (
    <div className="page-section">
      <div className="section-heading">
        <div><h2>Hash Verification</h2><p>Generate and compare SHA-256 cryptographic hashes</p></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Generator */}
        <div className="panel">
          <div className="card-head"><h3>SHA-256 Generator</h3></div>
          <div style={{ padding: 18 }}>
            <label className="field-label">Input / Model Name</label>
            <input
              className="text-input"
              placeholder="Enter model name or identifier..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button className="primary-button" style={{ marginTop: 12, width: "100%" }} onClick={generateHash}>
              <Hash size={16} /> Generate SHA-256 Hash
            </button>
            {generated && (
              <div className="hash-result-box">
                <label className="field-label">Generated Hash</label>
                <div className="hash-display">
                  <code>{generated}</code>
                  <button className="icon-copy" onClick={() => copyHash(generated)}>
                    {copiedHash === generated ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison */}
        <div className="panel">
          <div className="card-head"><h3>Hash Comparison</h3></div>
          <div style={{ padding: 18 }}>
            <label className="field-label">Reference Hash (from manifest)</label>
            <input
              className="text-input mono"
              placeholder="Paste reference SHA-256 hash..."
              value={refHash}
              onChange={e => setRefHash(e.target.value)}
            />
            <label className="field-label" style={{ marginTop: 12 }}>Computed Hash</label>
            <div className="hash-display" style={{ marginBottom: 12 }}>
              <code style={{ color: "var(--text-muted)" }}>{generated || "Run generator first..."}</code>
            </div>
            <button className="secondary-button" style={{ width: "100%" }} onClick={compareHashes} disabled={!generated || !refHash}>
              <Search size={16} /> Compare Hashes
            </button>
            {compareResult && (
              <div className={`compare-result ${compareResult}`}>
                {compareResult === "match"
                  ? <><CheckCircle2 size={18} className="success-icon" /> <strong>HASHES MATCH</strong> — Model integrity confirmed</>
                  : <><AlertTriangle size={18} className="danger-icon" /> <strong>HASH MISMATCH</strong> — Possible tampering detected</>
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layer Hash Reference */}
      <div className="panel">
        <div className="card-head"><h3>Layer Hash Reference</h3><p className="sub">Current model layers</p></div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Layer</th><th>Type</th><th>SHA-256</th><th>Status</th><th>Copy</th></tr>
            </thead>
            <tbody>
              {layers.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.name}</strong></td>
                  <td>{l.type}</td>
                  <td><code className="hash-code">{shortenHash(l.hash)}</code></td>
                  <td>
                    <span className={`status-badge ${l.status === "tampered" ? "danger" : "success"}`}>
                      {l.status === "tampered" ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                      {l.status}
                    </span>
                  </td>
                  <td>
                    <button className="icon-copy" onClick={() => copyHash(l.hash)}>
                      {copiedHash === l.hash ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
