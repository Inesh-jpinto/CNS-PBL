// SecurityAnalyticsPage v3 — uploaded files + graphs
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useModel } from "../context/ModelContext";
import {
  ShieldCheck, AlertTriangle, FileText, Upload, Clock,
  CheckCircle2, XCircle, BarChart3, PieChart as PieIcon,
  ExternalLink, RotateCcw, TrendingUp, TrendingDown, Shield
} from "lucide-react";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const {
    uploadedModels, setUploadedModels,
    modelFile, modelName, layers, tamperedLayers, verifiedLayers,
    verificationStatus, downloadReport, formatSystemTime,
  } = useModel();

  // Merge active model with saved uploaded models
  const allModels = useMemo(() => {
    let list = [...uploadedModels];
    if (modelFile && modelName && modelName !== "No Model Uploaded") {
      const exists = list.some(m => m.fileName === modelFile.name);
      if (!exists) {
        const total = layers.length;
        const vc = verifiedLayers.length;
        const tc = tamperedLayers.length;
        const isTamperedActive = verificationStatus === "FAILED" || tc > 0;
        const activeTamperPct = isTamperedActive ? getTamperPercentageForModel(modelFile.name) : 0;
        const activeIntactPct = isTamperedActive ? Number((100 - activeTamperPct).toFixed(1)) : 100;
        list.unshift({
          id: "active-model",
          fileName: modelFile.name,
          fileSize: `${(modelFile.size / 1024 / 1024).toFixed(2)} MB`,
          modelType: "PyTorch Model (.pth)",
          uploadTime: formatSystemTime(new Date()),
          status: isTamperedActive ? "FAILED" : "VERIFIED",
          totalLayers: total,
          verifiedLayersCount: vc,
          tamperedLayersCount: tc,
          intactPercentage: activeIntactPct,
          tamperPercentage: activeTamperPct,
          tamperedLayers: tamperedLayers.map(l => l.name),
          layers: layers.map(l => ({ id: l.id, name: l.name, type: l.type, status: l.status, hash: l.hash })),
        });
      }
    }
    return list;
  }, [uploadedModels, modelFile, modelName, layers, tamperedLayers, verifiedLayers, verificationStatus]);

  const [selectedId, setSelectedId] = useState(() => allModels[0]?.id || null);
  const selectedModel = useMemo(
    () => allModels.find(m => m.id === selectedId) || allModels[0] || null,
    [allModels, selectedId]
  );

  // Load demo models for testing
  const loadDemo = () => {
    const now = new Date();
    const demoTamperPct = getTamperPercentageForModel("tampered_model.pth");
    const demoIntactPct = Number((100 - demoTamperPct).toFixed(1));
    setUploadedModels([
      {
        id: Date.now(), fileName: "original_model.pth", fileSize: "71.91 KB",
        modelType: "PyTorch Model (.pth)", uploadTime: formatSystemTime(now),
        status: "VERIFIED", totalLayers: 6, verifiedLayersCount: 6, tamperedLayersCount: 0,
        intactPercentage: 100, tamperPercentage: 0, tamperedLayers: [],
        layers: [
          { id: 1, name: "fc1.bias", type: "Linear Layer", status: "verified", hash: "5799933b..." },
          { id: 2, name: "fc1.weight", type: "Linear Weights", status: "verified", hash: "aeeb6c0f..." },
          { id: 3, name: "fc2.bias", type: "Linear Layer", status: "verified", hash: "70e0695c..." },
          { id: 4, name: "fc2.weight", type: "Linear Weights", status: "verified", hash: "b8c20c94..." },
          { id: 5, name: "fc3.bias", type: "Linear Layer", status: "verified", hash: "d0049b1e..." },
          { id: 6, name: "fc3.weight", type: "Output Layer", status: "verified", hash: "d6f97944..." },
        ],
      },
      {
        id: Date.now() + 1, fileName: "tampered_model.pth", fileSize: "71.91 KB",
        modelType: "PyTorch Model (.pth)", uploadTime: formatSystemTime(new Date(now - 60000)),
        status: "FAILED", totalLayers: 6, verifiedLayersCount: 5, tamperedLayersCount: 1,
        intactPercentage: demoIntactPct, tamperPercentage: demoTamperPct, tamperedLayers: ["fc1.weight"],
        layers: [
          { id: 1, name: "fc1.bias", type: "Linear Layer", status: "verified", hash: "5799933b..." },
          { id: 2, name: "fc1.weight", type: "Linear Weights", status: "tampered", hash: "5485c323..." },
          { id: 3, name: "fc2.bias", type: "Linear Layer", status: "verified", hash: "70e0695c..." },
          { id: 4, name: "fc2.weight", type: "Linear Weights", status: "verified", hash: "b8c20c94..." },
          { id: 5, name: "fc3.bias", type: "Linear Layer", status: "verified", hash: "d0049b1e..." },
          { id: 6, name: "fc3.weight", type: "Output Layer", status: "verified", hash: "d6f97944..." },
        ],
      },
    ]);
  };

  // ── SVG Donut ──────────────────────────────────────────────────────────────
  const DonutChart = ({ intact, tamper, size = 160 }) => {
    const sw = 20, c = size / 2, r = c - sw;
    const circ = 2 * Math.PI * r;
    const intactD = (intact / 100) * circ;
    const tamperD = (tamper / 100) * circ;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth={sw} />
        <circle cx={c} cy={c} r={r} fill="none" stroke="#22c55e" strokeWidth={sw}
          strokeDasharray={`${intactD} ${circ}`} strokeLinecap="round" />
        {tamper > 0 && (
          <circle cx={c} cy={c} r={r} fill="none" stroke="#ef4444" strokeWidth={sw}
            strokeDasharray={`${tamperD} ${circ}`} strokeDashoffset={-intactD} strokeLinecap="round" />
        )}
      </svg>
    );
  };

  // ── Bar chart for all models ────────────────────────────────────────────────
  const maxBar = 200;
  const chartH = 160;

  // Summary stats
  const totalFiles = allModels.length;
  const tamperedCount = allModels.filter(m => m.tamperPercentage > 0).length;
  const verifiedCount = allModels.filter(m => m.tamperPercentage === 0).length;
  const avgIntegrity = totalFiles
    ? Math.round(allModels.reduce((s, m) => s + m.intactPercentage, 0) / totalFiles)
    : 0;

  return (
    <div className="page-section">
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Security Analytics</h2>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            All uploaded models — tamper analysis, integrity graphs, and detailed reports
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {allModels.length === 0 && (
            <button
              onClick={loadDemo}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer",
                background: "var(--bg-secondary)", color: "var(--text-secondary)", fontSize: "0.85rem",
              }}
            >
              <RotateCcw size={14} /> Load Demo Models
            </button>
          )}
          <button
            onClick={() => navigate("/models/upload")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              borderRadius: 8, border: "none", cursor: "pointer",
              background: "var(--accent-cyan)", color: "#0f172a", fontWeight: 700, fontSize: "0.85rem",
            }}
          >
            <Upload size={14} /> Upload New Model
          </button>
        </div>
      </div>

      {/* ── 4 Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Files Scanned", value: totalFiles, icon: <FileText size={18} />, color: "var(--accent-cyan)" },
          { label: "Verified Secure", value: verifiedCount, icon: <ShieldCheck size={18} />, color: "#22c55e" },
          { label: "Tampered / Failed", value: tamperedCount, icon: <AlertTriangle size={18} />, color: "#ef4444" },
          { label: "Avg Integrity", value: `${avgIntegrity}%`, icon: <Shield size={18} />, color: avgIntegrity >= 80 ? "#22c55e" : "#f97316" },
        ].map((c, i) => (
          <div key={i} style={{
            padding: "18px 20px", borderRadius: 12, background: "var(--surface-solid)",
            border: "1px solid var(--border)",
          }}>
            <div style={{ color: c.color, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</div>
          </div>
        ))}
      </div>

      {allModels.length === 0 ? (
        /* ── Empty State ── */
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(34,211,238,0.08)", display: "grid", placeItems: "center",
            margin: "0 auto 16px auto", color: "var(--accent-cyan)",
          }}>
            <BarChart3 size={36} />
          </div>
          <h3 style={{ color: "var(--text-primary)", margin: "0 0 8px 0" }}>No models uploaded yet</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 20px 0" }}>
            Upload a model to see its security analysis with tamper detection graphs.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={loadDemo} style={{
              padding: "8px 18px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--bg-secondary)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem",
            }}>
              Load Demo Models
            </button>
            <button onClick={() => navigate("/models/upload")} style={{
              padding: "8px 18px", borderRadius: 8, border: "none",
              background: "var(--accent-cyan)", color: "#0f172a", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
            }}>
              <Upload size={13} style={{ marginRight: 5 }} /> Upload Model
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>

          {/* ── LEFT: File List ── */}
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
              {totalFiles} Uploaded File{totalFiles !== 1 ? "s" : ""}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {allModels.map(m => {
                const isTampered = m.tamperPercentage > 0;
                const isSelected = m.id === selectedModel?.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    style={{
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                      background: isSelected ? "rgba(34,211,238,0.07)" : "var(--surface-solid)",
                      border: `1px solid ${isSelected ? "var(--accent-cyan)" : "var(--border)"}`,
                      transition: "all 0.18s ease",
                      boxShadow: isSelected ? "0 0 14px rgba(34,211,238,0.1)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* File name — clickable to detail page */}
                        <div
                          style={{
                            fontFamily: "var(--font-mono)", fontSize: "0.88rem", fontWeight: 700,
                            color: isSelected ? "var(--accent-cyan)" : "var(--text-primary)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}
                        >
                          {m.fileName}
                        </div>

                        {/* "View detailed report" link */}
                        <div
                          onClick={e => { e.stopPropagation(); navigate(`/analytics/file/${m.id}`); }}
                          style={{
                            fontSize: "0.69rem", color: "var(--accent-cyan)", cursor: "pointer",
                            display: "inline-flex", alignItems: "center", gap: 3, marginTop: 2, opacity: 0.75,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
                          onMouseLeave={e => (e.currentTarget.style.opacity = 0.75)}
                        >
                          <ExternalLink size={10} /> View detailed report →
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: "0.73rem", color: "var(--text-muted)" }}>
                          <span>{m.fileSize}</span><span>•</span><span>{m.totalLayers} layers</span>
                        </div>
                      </div>

                      {/* Tamper badge */}
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        padding: "2px 8px", borderRadius: 6, fontSize: "0.68rem", fontWeight: 700,
                        background: isTampered ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                        color: isTampered ? "#ef4444" : "#22c55e", whiteSpace: "nowrap",
                      }}>
                        {isTampered ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
                        {isTampered ? `${m.tamperPercentage}% tampered` : "Clean"}
                      </div>
                    </div>

                    {/* Integrity progress bar */}
                    <div style={{ marginTop: 10, height: 5, background: "rgba(148,163,184,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${m.intactPercentage}%`, background: isTampered ? "#ef4444" : "#22c55e", borderRadius: 3 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 3 }}>
                      <span>{m.intactPercentage}% intact</span>
                      <Clock size={10} style={{ marginRight: 2, verticalAlign: "middle" }} />
                      <span style={{ fontFamily: "var(--font-mono)" }}>{m.uploadTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Charts Panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Overview chart: Tamper % Bar for ALL files */}
            <div style={{ padding: "20px 22px", borderRadius: 12, background: "var(--surface-solid)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <BarChart3 size={16} style={{ color: "var(--accent-cyan)" }} />
                <h3 style={{ margin: 0, fontSize: "1rem" }}>All Files — Tampered Content (%)</h3>
              </div>

              <div style={{ overflowX: "auto" }}>
                <svg
                  width={Math.max(allModels.length * 80 + 60, 380)}
                  height={chartH + 50}
                  viewBox={`0 0 ${Math.max(allModels.length * 80 + 60, 380)} ${chartH + 50}`}
                >
                  {/* Grid */}
                  {[0, 25, 50, 75, 100].map(pct => {
                    const y = chartH - (pct / 100) * chartH + 10;
                    return (
                      <g key={pct}>
                        <line x1={40} y1={y} x2={Math.max(allModels.length * 80 + 60, 380) - 10} y2={y}
                          stroke="rgba(148,163,184,0.1)" strokeWidth={1} />
                        <text x={2} y={y + 4} fill="#64748b" fontSize={9} fontFamily="monospace">{pct}%</text>
                      </g>
                    );
                  })}

                  {/* Bars */}
                  {allModels.map((m, i) => {
                    const isTampered = m.tamperPercentage > 0;
                    const barH = (m.tamperPercentage / 100) * chartH;
                    const intactH = chartH - barH;
                    const x = 50 + i * 80;
                    const bw = 46;
                    return (
                      <g key={m.id} onClick={() => navigate(`/analytics/file/${m.id}`)} style={{ cursor: "pointer" }}>
                        <defs>
                          <linearGradient id={`bg-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#15803d" />
                          </linearGradient>
                          {isTampered && (
                            <linearGradient id={`br-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" />
                              <stop offset="100%" stopColor="#b91c1c" />
                            </linearGradient>
                          )}
                        </defs>
                        {/* Intact part */}
                        <rect x={x} y={10 + barH} width={bw} height={intactH} rx={4} fill={`url(#bg-${i})`} />
                        {/* Tamper part on top */}
                        {isTampered && (
                          <rect x={x} y={10} width={bw} height={barH} rx={4} fill={`url(#br-${i})`} />
                        )}
                        {/* Tamper % label */}
                        {isTampered && (
                          <text x={x + bw / 2} y={8} fill="#ef4444" fontSize={10} fontWeight={700} fontFamily="monospace" textAnchor="middle">
                            {m.tamperPercentage}%
                          </text>
                        )}
                        {/* File name label */}
                        <text x={x + bw / 2} y={chartH + 26} fill="#64748b" fontSize={9} fontFamily="monospace" textAnchor="middle">
                          {m.fileName.length > 12 ? m.fileName.slice(0, 11) + "…" : m.fileName}
                        </text>
                        <text x={x + bw / 2} y={chartH + 38} fill={isTampered ? "#ef4444" : "#22c55e"} fontSize={9} fontWeight={700} fontFamily="monospace" textAnchor="middle">
                          {isTampered ? "TAMPERED" : "CLEAN"}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: "0.72rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#22c55e", display: "inline-block" }} /> Intact content
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: "#ef4444", display: "inline-block" }} /> Tampered content
                </span>
                <span style={{ color: "var(--text-muted)" }}>Click a bar to view file detail</span>
              </div>
            </div>

            {/* Pie chart panel for ALL files */}
            <div style={{ padding: "20px 22px", borderRadius: 12, background: "var(--surface-solid)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <PieIcon size={16} style={{ color: "var(--accent-purple)" }} />
                <h3 style={{ margin: 0, fontSize: "1rem" }}>Individual File Integrity — Pie Charts</h3>
              </div>

              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {allModels.map(m => {
                  const isTampered = m.tamperPercentage > 0;
                  return (
                    <div
                      key={m.id}
                      onClick={() => navigate(`/analytics/file/${m.id}`)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                        cursor: "pointer", padding: "12px 16px", borderRadius: 10,
                        border: `1px solid ${m.id === selectedModel?.id ? "var(--accent-cyan)" : "var(--border)"}`,
                        background: m.id === selectedModel?.id ? "rgba(34,211,238,0.05)" : "transparent",
                        transition: "all 0.2s",
                        minWidth: 130,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-cyan)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = m.id === selectedModel?.id ? "var(--accent-cyan)" : "var(--border)"; }}
                    >
                      <div style={{ position: "relative", width: 100, height: 100 }}>
                        <DonutChart intact={m.intactPercentage} tamper={m.tamperPercentage} size={100} />
                        <div style={{
                          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: isTampered ? "#ef4444" : "#22c55e", lineHeight: 1 }}>
                            {m.intactPercentage}%
                          </span>
                          <small style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>intact</small>
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{
                          fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700,
                          color: "var(--text-primary)", maxWidth: 120, overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {m.fileName}
                        </div>
                        <div style={{ fontSize: "0.65rem", color: isTampered ? "#ef4444" : "#22c55e", fontWeight: 700 }}>
                          {isTampered ? `${m.tamperPercentage}% tampered` : "100% clean"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected model detail panel */}
            {selectedModel && (
              <div style={{ padding: "20px 22px", borderRadius: 12, background: "var(--surface-solid)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {selectedModel.tamperPercentage > 0
                      ? <AlertTriangle size={16} style={{ color: "#ef4444" }} />
                      : <ShieldCheck size={16} style={{ color: "#22c55e" }} />}
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>
                      Selected: <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>{selectedModel.fileName}</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => navigate(`/analytics/file/${selectedModel.id}`)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px",
                      borderRadius: 7, border: "1px solid var(--accent-cyan)", background: "rgba(34,211,238,0.1)",
                      color: "var(--accent-cyan)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                    }}
                  >
                    <ExternalLink size={13} /> Full Detailed Analysis
                  </button>
                </div>

                {/* Layer table */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selectedModel.layers?.slice(0, 8).map((layer, idx) => {
                    const lt = layer.status === "tampered";
                    return (
                      <div key={layer.id || idx} style={{
                        display: "grid", gridTemplateColumns: "140px 1fr 90px", gap: 10, alignItems: "center",
                        padding: "9px 12px", borderRadius: 7,
                        background: lt ? "rgba(239,68,68,0.07)" : "rgba(0,0,0,0.12)",
                        border: lt ? "1px solid rgba(239,68,68,0.25)" : "1px solid transparent",
                      }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 700, color: lt ? "#ef4444" : "var(--text-primary)" }}>
                          {layer.name}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {layer.hash}
                        </span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "flex-end",
                          fontSize: "0.7rem", fontWeight: 700,
                          color: lt ? "#ef4444" : "#22c55e",
                        }}>
                          {lt ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                          {lt ? "TAMPERED" : "OK"}
                        </span>
                      </div>
                    );
                  })}
                  {selectedModel.layers?.length > 8 && (
                    <div style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)", padding: "6px 0" }}>
                      + {selectedModel.layers.length - 8} more layers — <span
                        style={{ color: "var(--accent-cyan)", cursor: "pointer" }}
                        onClick={() => navigate(`/analytics/file/${selectedModel.id}`)}
                      >view all</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
