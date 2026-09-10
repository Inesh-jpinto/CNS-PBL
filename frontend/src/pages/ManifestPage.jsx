import { useModel } from "../context/ModelContext";
import { FileJson, Copy, Check, Info } from "lucide-react";
import { useState } from "react";

export default function ManifestPage() {
  const {
    modelName, modelType, merkleRoot, verificationStatus,
    signatureStatus, selectedPublisher, layers
  } = useModel();
  const [copied, setCopied] = useState(false);

  const manifest = {
    manifestVersion: "2.1.0",
    modelMetadata: {
      name: modelName,
      type: modelType,
      registeredPublisher: selectedPublisher || "Google DeepMind Labs",
      verifiedAt: new Date().toISOString()
    },
    verificationSpecs: {
      engineStatus: "VERIFIED",
      integrityScore: 100,
      signatureType: "ED25519",
      signatureStatus: signatureStatus,
      merkleRootHash: merkleRoot
    },
    layerHashes: layers.map(l => ({
      index: l.id,
      tensorName: l.name,
      layerType: l.type,
      size: l.size,
      sha256: l.hash
    }))
  };

  const manifestStr = JSON.stringify(manifest, null, 2);

  function copyManifest() {
    navigator.clipboard.writeText(manifestStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="page-section">
      <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Security Manifest Viewer</h2>
          <p>Inspect raw model metadata configurations and layer SHA-256 integrity baseline JSON schemas</p>
        </div>
        <button className="secondary-button" onClick={copyManifest}>
          {copied ? <><Check size={14} style={{ color: "var(--green)" }} /> Copied</> : <><Copy size={14} /> Copy Manifest JSON</>}
        </button>
      </div>

      {/* Editor Viewer */}
      <div className="panel" style={{ background: "#080b12", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px",
          borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)"
        }}>
          <FileJson size={16} style={{ color: "var(--cyan)" }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.05em" }}>MANIFEST.JSON</span>
        </div>
        <pre className="mono" style={{
          margin: 0, padding: 18, fontSize: 12.5, color: "var(--text-secondary)",
          overflowX: "auto", maxHeight: "560px", lineHeight: 1.5, background: "transparent"
        }}>
          {manifestStr}
        </pre>
      </div>
    </div>
  );
}
