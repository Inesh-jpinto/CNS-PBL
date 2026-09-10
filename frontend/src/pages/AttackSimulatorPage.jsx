import { useState } from "react";
import { useModel } from "../context/ModelContext";
import { Zap, AlertTriangle, ShieldCheck, Play, RotateCcw, Cpu, Lock } from "lucide-react";
import StatCard from "../components/StatCard";

const scenarios = [
  { id: "weight", label: "Tensor Weights Modification", desc: "Inject subtle noise or changes in model parameters to bypass verification checks." },
  { id: "metadata", label: "Metadata Spoofing", desc: "Alter publisher registry fields or framework versions in model configurations." },
  { id: "manifest", label: "Security Manifest Alteration", desc: "Tamper with baseline hashes inside public signature manifests to match modified tensors." }
];

export default function AttackSimulatorPage() {
  const {
    modelFile, modelName, layers, attackLayer, setAttackLayer,
    simulateTampering, resetAttack, attackActive, verifiedLayers,
    tamperedLayers, verificationStatus
  } = useModel();

  const [activeScenario, setActiveScenario] = useState("weight");

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Tamper Attack Simulator</h2>
          <p>Simulate security threats, parameters modification, and verify ModelGuard detection accuracy</p>
        </div>
      </div>

      <div className="attack-warning" style={{
        display: "flex", gap: 12, background: "var(--red-soft)", border: "1px solid var(--red)",
        padding: 16, borderRadius: "var(--radius-md)", color: "var(--red)", marginBottom: 18
      }}>
        <AlertTriangle size={24} style={{ flexShrink: 0 }} />
        <div>
          <strong>Safe Demonstration Sandbox</strong>
          <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "var(--text-secondary)" }}>
            This simulator only affects demo logs and verification runs. Your source files are never modified or compromised.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Simulator controls */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            <h3>Threat Injection Controls</h3>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Threat Scenario</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scenarios.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenario(sc.id)}
                  style={{
                    textAlign: "left", padding: 12, borderRadius: 8, border: "1px solid var(--border)",
                    background: activeScenario === sc.id ? "var(--surface-hover)" : "transparent",
                    color: activeScenario === sc.id ? "var(--cyan)" : "var(--text-secondary)",
                    cursor: "pointer"
                  }}
                >
                  <strong style={{ display: "block", fontSize: 13.5 }}>{sc.label}</strong>
                  <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sc.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {activeScenario === "weight" && (
            <div style={{ marginBottom: 16 }}>
              <label className="field-label">Target Layer Weights</label>
              <select
                className="select-input"
                value={attackLayer}
                onChange={e => setAttackLayer(e.target.value)}
                style={{
                  width: "100%", padding: 8, background: "var(--surface)", border: "1px solid var(--border)",
                  color: "var(--text-primary)", borderRadius: 6
                }}
              >
                {layers.map(l => (
                  <option key={l.id} value={l.id}>Layer {l.id}: {l.name} ({l.size})</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="danger-button" style={{ flex: 1 }} onClick={simulateTampering}>
              <Play size={16} /> Inject Attack Simulation
            </button>
            <button className="secondary-button" onClick={resetAttack}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        {/* Live Attack Diagnostics */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            <h3>Threat Analysis Diagnostics</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <StatCard icon={<ShieldCheck style={{ color: "var(--green)" }} />} title="Safe Layers" value={verifiedLayers.length} description="No modifications" />
            <StatCard icon={<AlertTriangle style={{ color: "var(--red)" }} />} title="Tampered Layers" value={tamperedLayers.length} description="Hash mismatches" />
          </div>

          {attackActive && tamperedLayers.length > 0 ? (
            <div style={{ padding: 12, borderRadius: 8, background: "var(--red-soft)", border: "1px solid var(--red)" }}>
              <span className="eyebrow" style={{ display: "block", fontSize: 9, color: "var(--red)", marginBottom: 6 }}>ALARM FLAGGED DETAILED REPORT</span>
              {tamperedLayers.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 6 }}>
                  <strong>{l.name}</strong>
                  <code style={{ color: "var(--red)" }}>Hash Changed</code>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 24 }}>
              <ShieldCheck size={36} style={{ color: "var(--green)", marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 13 }}>No threats active. Model integrity is clean.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
