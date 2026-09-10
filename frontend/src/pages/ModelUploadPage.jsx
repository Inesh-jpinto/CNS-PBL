import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, ShieldCheck, Fingerprint, Network, KeyRound, ScanSearch,
  CheckCircle2, AlertTriangle, FileText, X
} from "lucide-react";
import { useModel } from "../context/ModelContext";
import StatusBadge from "../components/StatusBadge";

const STEPS = [
  { label: "SHA-256 Hashing", icon: <Fingerprint size={20} />, desc: "Generate a fingerprint for every layer" },
  { label: "Layer Extraction", icon: <ScanSearch size={20} />, desc: "Extract and enumerate all model layers" },
  { label: "Layer Hashing", icon: <CheckCircle2 size={20} />, desc: "Hash each layer independently" },
  { label: "Merkle Tree", icon: <Network size={20} />, desc: "Build tamper-evident hash tree" },
  { label: "Signature Verify", icon: <KeyRound size={20} />, desc: "Verify publisher digital signature" },
  { label: "Manifest Compare", icon: <ShieldCheck size={20} />, desc: "Compare against trusted manifest" },
];

export default function ModelUploadPage() {
  const {
    modelFile, modelName, modelType, isVerifying, verificationProgress,
    verificationStatus, signatureStatus, verifiedLayers, tamperedLayers,
    merkleRoot, layers, handleFileUpload, handleDrop, verifyModel, openFileSelector,
  } = useModel();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [resultShown, setResultShown] = useState(false);

  const currentStep = Math.floor((verificationProgress / 100) * STEPS.length);

  function handleVerify() {
    setResultShown(false);
    verifyModel();
    setTimeout(() => setResultShown(true), 2500);
  }

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Model Upload & Verification</h2>
          <p>Upload your AI model and run full cryptographic verification in one click</p>
        </div>
      </div>

      {/* Drop Zone */}
      {!modelFile && (
        <div
          className={`upload-zone${dragOver ? " drag-active" : ""}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { setDragOver(false); handleDrop(e); }}
        >
          <div className="upload-circle"><Upload size={34} /></div>
          <h3>Upload Your AI Model</h3>
          <p>Supports .pt · .pth · .onnx · .safetensors · .h5 · .keras · .bin · .pkl</p>
          <button className="primary-button" onClick={openFileSelector}>
            <Upload size={17} /> Select Model File
          </button>
          <span className="upload-hint">or drag and drop here</span>
        </div>
      )}

      {/* File loaded */}
      {modelFile && (
        <div className="upload-result panel">
          <div className="upload-result-top">
            <div className="file-information">
              <FileText size={24} />
              <div>
                <strong>{modelName}</strong>
                <span>{modelType} • {(modelFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <StatusBadge status={isVerifying ? "Analyzing" : verificationStatus} />
              <button className="icon-close" onClick={openFileSelector}><X size={16} /></button>
            </div>
          </div>
          {(isVerifying || verificationProgress > 0) && (
            <div className="upload-progress">
              <div className="progress-label">
                <span>{isVerifying ? "Running cryptographic pipeline..." : "Analysis complete"}</span>
                <strong>{verificationProgress}%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-value" style={{ width: `${verificationProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pipeline Steps */}
      <div className="verification-flow">
        {STEPS.map((step, i) => {
          const done = verificationProgress > 0 && i < currentStep;
          const active = isVerifying && i === currentStep;
          return (
            <div key={step.label} className={`flow-card${done ? " done" : active ? " active" : ""}`}>
              <span className={`flow-num${done ? " done" : ""}`}>{done ? <CheckCircle2 size={14} /> : `0${i + 1}`}</span>
              {step.icon}
              <h3>{step.label}</h3>
              <p>{step.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="center-action">
        <button
          className="primary-button large"
          onClick={handleVerify}
          disabled={!modelFile || isVerifying}
        >
          <ShieldCheck size={20} /> Run Full Verification
        </button>
        {!modelFile && (
          <button className="secondary-button" onClick={openFileSelector} style={{ marginLeft: 12 }}>
            <Upload size={17} /> Upload First
          </button>
        )}
      </div>

      {/* Result Card */}
      {resultShown && verificationStatus === "VERIFIED" && (
        <div className="verification-result-card panel">
          <div className="result-header success">
            <ShieldCheck size={28} />
            <h3>MODEL VERIFICATION RESULT</h3>
          </div>
          <div className="result-rows">
            <div className="result-row"><CheckCircle2 size={16} className="success-icon" /><span>SHA-256</span><strong className="success-text">VERIFIED</strong></div>
            <div className="result-row"><CheckCircle2 size={16} className="success-icon" /><span>Layer Hashes ({layers.length} layers)</span><strong className="success-text">VERIFIED</strong></div>
            <div className="result-row"><CheckCircle2 size={16} className="success-icon" /><span>Merkle Root</span><strong className="success-text">VERIFIED</strong></div>
            <div className="result-row"><CheckCircle2 size={16} className="success-icon" /><span>Digital Signature</span><strong className="success-text">{signatureStatus === "Valid" ? "VERIFIED" : signatureStatus}</strong></div>
            <div className="result-row"><CheckCircle2 size={16} className="success-icon" /><span>Publisher</span><strong className="success-text">TRUSTED</strong></div>
          </div>
          <div className="result-footer success">
            <ShieldCheck size={20} /> MODEL INTEGRITY VERIFIED
          </div>
          <div className="result-meta">
            <span>Merkle Root: <code>{merkleRoot.slice(0, 12)}...{merkleRoot.slice(-8)}</code></span>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
            <button className="secondary-button" onClick={() => navigate("/records/reports")}>Download Report</button>
            <button className="secondary-button" onClick={() => navigate("/records/certificates")}>Get Certificate</button>
          </div>
        </div>
      )}

      {resultShown && verificationStatus === "TAMPERED" && (
        <div className="verification-result-card panel">
          <div className="result-header danger">
            <AlertTriangle size={28} />
            <h3>TAMPERING DETECTED</h3>
          </div>
          <div className="result-rows">
            {tamperedLayers.map(l => (
              <div key={l.id} className="result-row">
                <AlertTriangle size={16} className="danger-icon" />
                <span>{l.name}</span>
                <strong className="danger-text">TAMPERED</strong>
              </div>
            ))}
          </div>
          <div className="result-footer danger">
            <AlertTriangle size={20} /> MODEL INTEGRITY COMPROMISED
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
            <button className="danger-button" onClick={() => navigate("/security/attack-simulator")}>Investigate</button>
            <button className="secondary-button" onClick={() => navigate("/security/risk")}>Risk Assessment</button>
          </div>
        </div>
      )}
    </div>
  );
}
