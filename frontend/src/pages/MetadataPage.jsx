import { useModel } from "../context/ModelContext";
import { Lock, ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function MetadataPage() {
  const { metadataProtected, setMetadataProtected, modelName, modelType } = useModel();
  const [params, setParams] = useState({
    modelName: true,
    framework: true,
    licenseType: true,
    parameterCount: false,
    publisherSignature: true
  });

  function toggleParam(key) {
    setParams(p => ({ ...p, [key]: !p[key] }));
  }

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Metadata Protection Configuration</h2>
          <p>Protect key model metadata parameters inside the cryptographic verification baseline manifest payload</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Protection switches */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3>Metadata Manifest Fields</h3>
              <p className="sub">Toggle parameters validation inclusion</p>
            </div>
            <button
              className={`toggle ${metadataProtected ? "enabled" : ""}`}
              onClick={() => setMetadataProtected(!metadataProtected)}
              style={{
                width: 44, height: 24, borderRadius: 12, background: metadataProtected ? "var(--cyan)" : "var(--border)",
                border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s"
              }}
            >
              <span style={{
                position: "absolute", top: 3, left: metadataProtected ? 22 : 3, width: 18, height: 18,
                borderRadius: "50%", background: "#fff", transition: "left 0.3s"
              }} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {[
              { key: "modelName", label: "Model Architecture Reference Name", value: modelName },
              { key: "framework", label: "Framework Platform Type", value: modelType },
              { key: "licenseType", label: "Software License Authority", value: "Apache-2.0" },
              { key: "parameterCount", label: "Weights Tensors Parameters Count", value: "70 Billion parameters" },
              { key: "publisherSignature", label: "Authority Signature Key Profile", value: "ED25519:7c9a...4f21" }
            ].map(item => (
              <div key={item.key} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: 12, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)",
                opacity: metadataProtected ? 1 : 0.5
              }}>
                <div>
                  <strong style={{ display: "block", fontSize: 13.5 }}>{item.label}</strong>
                  <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Value: {item.value}</span>
                </div>
                <button
                  disabled={!metadataProtected}
                  onClick={() => toggleParam(item.key)}
                  className={`toggle ${params[item.key] && metadataProtected ? "enabled" : ""}`}
                  style={{
                    width: 36, height: 20, borderRadius: 10, background: params[item.key] && metadataProtected ? "var(--cyan)" : "var(--border)",
                    border: "none", cursor: metadataProtected ? "pointer" : "not-allowed", position: "relative", transition: "background 0.3s"
                  }}
                >
                  <span style={{
                    position: "absolute", top: 2, left: params[item.key] && metadataProtected ? 18 : 2, width: 16, height: 16,
                    borderRadius: "50%", background: "#fff", transition: "left 0.3s"
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Protection diagnostics info */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            <h3>Metadata Protection Shield</h3>
          </div>
          {metadataProtected ? (
            <div style={{ textAlign: "center", color: "var(--green)", padding: 18 }}>
              <ShieldCheck size={42} style={{ marginBottom: 12 }} />
              <strong style={{ display: "block", fontSize: 14 }}>METADATA PROTECTION ENABLED</strong>
              <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Metadata parameters are added to the Merkle tree leaf hashes list, ensuring any alterations to release license files or frameworks triggers validation mismatches.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "var(--yellow)", padding: 18 }}>
              <ShieldAlert size={42} style={{ marginBottom: 12 }} />
              <strong style={{ display: "block", fontSize: 14 }}>PROTECTION DISABLED</strong>
              <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Only tensor weight parameters hashes will be verified. License structure metadata alterations will go undetected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
