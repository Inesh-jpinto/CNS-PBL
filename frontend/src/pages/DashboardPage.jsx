import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, Upload, ScanSearch, Layers, Fingerprint,
  FileKey, BarChart3, AlertTriangle, CheckCircle2,
  Cpu, Eye, Search, Zap
} from "lucide-react";
import { useModel } from "../context/ModelContext";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { registeredModels } from "../utils/data";
import { useState } from "react";

export default function DashboardPage() {
  const {
    verifiedLayers, tamperedLayers, securityScore, merkleRoot,
    signatureStatus, modelName, modelType, verificationStatus,
    layers, openFileSelector, verifyModel, setReportModalOpen,
  } = useModel();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const filteredModels = registeredModels.filter(m => {
    if (filter === "All") return true;
    return m.status === filter.toLowerCase();
  });

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-shield"><ShieldCheck size={32} /></div>
          <h2>Secure Every Layer of Your AI Model</h2>
          <p>ModelGuard provides cryptographic verification, layer-wise hashing, Merkle tree protection, digital signature validation, and exact tampering detection before your AI model is deployed.</p>
          <div className="hero-buttons">
            <button className="primary-button" onClick={() => navigate("/models/upload")}>
              <Upload size={17} /> Verify New Model
            </button>
            <button className="secondary-button" onClick={() => setReportModalOpen(true)}>
              <BarChart3 size={17} /> Export Report
            </button>
          </div>
        </div>
        <div className="hero-graphic">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-core"><ShieldCheck size={64} /></div>
        </div>
      </section>

      {/* Stats — all clickable */}
      <section className="stats-grid">
        <StatCard
          icon={<Layers />}
          title="Models Verified"
          value="1,247"
          description="Total verifications"
          valueClass="success-text"
          onClick={() => navigate("/records/history")}
        />
        <StatCard
          icon={<BarChart3 />}
          title="Integrity Rate"
          value="98.6%"
          description="Overall score"
          valueClass="success-text"
          onClick={() => navigate("/analytics")}
        />
        <StatCard
          icon={<AlertTriangle />}
          title="Tampered Detected"
          value="3"
          description="Models flagged today"
          valueClass="danger-text"
          onClick={() => navigate("/security/risk")}
        />
        <StatCard
          icon={<ScanSearch />}
          title="Active Scans"
          value="12"
          description="Currently scanning"
          onClick={() => navigate("/models/upload")}
        />
      </section>

      {/* Current model + tamper detection */}
      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Current Model</h3>
              <p>Cryptographic security profile</p>
            </div>
            <StatusBadge status={verificationStatus === "VERIFIED" ? "Verified" : verificationStatus} />
          </div>
          <div className="model-profile">
            <div className="model-icon"><Cpu size={34} /></div>
            <div>
              <h3>{modelName}</h3>
              <p>{modelType}</p>
              <div className="tags">
                <span>SHA-256</span><span>Merkle Tree</span>
                <span>Digital Signature</span><span>Metadata Protected</span>
              </div>
            </div>
          </div>
          <div className="security-progress">
            <div className="progress-label">
              <span>Integrity Confidence</span>
              <strong>{securityScore}%</strong>
            </div>
            <div className="progress-bar">
              <div className="progress-value" style={{ width: `${securityScore}%` }} />
            </div>
          </div>
          <div className="panel-actions">
            <button className="secondary-button" onClick={openFileSelector}><Upload size={15} /> Upload Model</button>
            <button className="primary-button" onClick={verifyModel}><ScanSearch size={15} /> Verify Now</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div><h3>Tamper Detection</h3><p>Exact layer integrity comparison</p></div>
            {tamperedLayers.length === 0
              ? <CheckCircle2 className="success-icon" />
              : <AlertTriangle className="danger-icon" />}
          </div>
          {tamperedLayers.length === 0 ? (
            <div className="safe-state">
              <ShieldCheck size={40} />
              <h3>No Tampering Detected</h3>
              <p>Every model layer matches the trusted SHA-256 baseline.</p>
              <button className="secondary-button" onClick={() => navigate("/verification/layers")}>
                <Layers size={14} /> View Layers
              </button>
            </div>
          ) : (
            <div className="tampered-list">
              {tamperedLayers.map(layer => (
                <div key={layer.id} className="tampered-item">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>{layer.name}</strong>
                    <span>Layer {layer.id} hash mismatch detected</span>
                  </div>
                  <button className="link-btn" onClick={() => navigate("/security/attack-simulator")}>Investigate</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Verifications Table */}
      <section className="panel layers-panel">
        <div className="panel-header">
          <div><h3>Recent Verifications</h3><p>Latest model security checks</p></div>
          <div className="chip-group">
            {["All","verified","scanning","tampered","warning"].map(f => (
              <button key={f} className={`chip${filter === f ? " on" : ""}`} onClick={() => setFilter(f === "All" ? "All" : f)}>
                {f === "All" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Model</th><th>Framework</th><th>Publisher</th>
                <th>Status</th><th>Last Verified</th><th>Risk</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="model-cell">
                      <span className="model-cell-name">{m.name}</span>
                      <span className="model-cell-ver">{m.version}</span>
                    </div>
                  </td>
                  <td>{m.framework}</td>
                  <td>{m.publisher}</td>
                  <td><StatusBadge status={m.status} /></td>
                  <td>{m.lastVerified}</td>
                  <td>
                    <span className={`risk-badge ${m.riskScore > 70 ? "risk-high" : m.riskScore > 30 ? "risk-med" : "risk-low"}`}>
                      {m.riskScore}%
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      {m.status === "tampered" ? (
                        <button className="action-btn danger" onClick={() => navigate(`/security/attack-simulator?model=${m.id}`)}>
                          <Zap size={13} /> Investigate
                        </button>
                      ) : m.status === "scanning" ? (
                        <button className="action-btn" onClick={() => navigate("/models/upload")}>
                          <ScanSearch size={13} /> Scan
                        </button>
                      ) : m.status === "warning" ? (
                        <button className="action-btn warning" onClick={() => navigate(`/models/${m.id}`)}>
                          <Eye size={13} /> Review
                        </button>
                      ) : (
                        <button className="action-btn success" onClick={() => navigate(`/models/${m.id}`)}>
                          <Eye size={13} /> View
                        </button>
                      )}
                      <button className="action-btn" onClick={() => navigate(`/models/${m.id}`)}>
                        <Search size={13} /> Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-footer">
          <button className="link-btn" onClick={() => navigate("/models")}>View all models →</button>
        </div>
      </section>

      {/* Quick Access */}
      <section className="quick-access">
        <h3>Quick Access</h3>
        <div className="quick-grid">
          {[
            { label: "Hash Verification", icon: <Fingerprint size={20} />, to: "/verification/hash" },
            { label: "Merkle Tree", icon: <BarChart3 size={20} />, to: "/verification/merkle" },
            { label: "Attack Simulator", icon: <Zap size={20} />, to: "/security/attack-simulator" },
            { label: "Publishers", icon: <ShieldCheck size={20} />, to: "/registry/publishers" },
            { label: "History", icon: <FileKey size={20} />, to: "/records/history" },
            { label: "System Health", icon: <ScanSearch size={20} />, to: "/system/health" },
          ].map(q => (
            <button key={q.to} className="quick-card" onClick={() => navigate(q.to)}>
              {q.icon}
              <span>{q.label}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
