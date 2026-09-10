import { useState } from "react";
import { modelVersions } from "../utils/data";
import { GitBranch, RefreshCw, GitCommit, ShieldCheck, AlertTriangle } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

export default function VersionControlPage() {
  const [verA, setVerA] = useState("v3.0.0");
  const [verB, setVerB] = useState("v3.1.0");
  const [diffResult, setDiffResult] = useState(null);

  function compareVersions() {
    if (verA === verB) {
      setDiffResult({ status: "identical", message: "No parameter changes between selected configurations." });
      return;
    }

    setDiffResult({
      status: "modified",
      changes: [
        { layer: "encoder.layer.0.attention", type: "Modified parameters", oldHash: "2ac8d61f...", newHash: "7be1c492..." },
        { layer: "encoder.layer.2.mlp", type: "Pruned nodes", oldHash: "4df3e9a8...", newHash: "e6b81f23..." },
        { layer: "classifier.weight", type: "Retrained parameters", oldHash: "a4e5f9c7...", newHash: "81f0d4b2..." }
      ]
    });
  }

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Model Version Control & Audit</h2>
          <p>Audit and compare different release versions of model parameters side-by-side</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18, alignItems: "start" }}>
        {/* Version List */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 14 }}>
            <h3>Available Release Branches</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {modelVersions.map(v => (
              <div key={v.version} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                padding: 12, borderRadius: "var(--radius-sm)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <strong className="mono" style={{ fontSize: 13.5 }}>{v.version}</strong>
                  <StatusBadge status={v.status} />
                </div>
                <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>Published: {v.date}</span>
                <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "var(--text-secondary)" }}>{v.changes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Diff Tool */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 14 }}>
            <h3>Compare Model Releases</h3>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Baseline Version</label>
              <select className="select-input" value={verA} onChange={e => setVerA(e.target.value)} style={{
                width: "100%", padding: 8, background: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--text-primary)", borderRadius: 6
              }}>
                {modelVersions.map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Target Version</label>
              <select className="select-input" value={verB} onChange={e => setVerB(e.target.value)} style={{
                width: "100%", padding: 8, background: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--text-primary)", borderRadius: 6
              }}>
                {modelVersions.map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
              </select>
            </div>
          </div>

          <button className="primary-button" style={{ width: "100%" }} onClick={compareVersions}>
            <RefreshCw size={14} /> Audit Structural Diff
          </button>

          {diffResult && (
            <div style={{ marginTop: 20 }}>
              {diffResult.status === "identical" ? (
                <div style={{ background: "var(--green-soft)", border: "1px solid var(--green)", padding: 14, borderRadius: 6, color: "var(--green)", fontSize: 13 }}>
                  <ShieldCheck size={16} style={{ marginRight: 6 }} /> {diffResult.message}
                </div>
              ) : (
                <div>
                  <h4 style={{ margin: "0 0 10px 0" }}>Structural Parameters Diff ({diffResult.changes.length} layers changed)</h4>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Layer Name</th>
                          <th>Change Type</th>
                          <th>Hash {verA}</th>
                          <th>Hash {verB}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diffResult.changes.map(c => (
                          <tr key={c.layer}>
                            <td><strong>{c.layer}</strong></td>
                            <td><span className="chip" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>{c.type}</span></td>
                            <td><code className="mono">{c.oldHash}</code></td>
                            <td><code className="mono" style={{ color: "var(--cyan)" }}>{c.newHash}</code></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
