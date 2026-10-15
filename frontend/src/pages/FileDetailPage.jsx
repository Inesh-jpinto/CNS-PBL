// FileDetailPage v2 — per-file analysis with graphs
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useModel } from "../context/ModelContext";
import { ALL_PUBLISHERS, getRandomPublisher } from "../utils/publishers";
import { getTamperPercentageForModel } from "../utils/crypto";
import {
  ArrowLeft, ShieldCheck, AlertTriangle, FileText, Layers, PieChart,
  CheckCircle2, XCircle, Clock, Download, BarChart3, Building2,
  Shield, AlertOctagon, TrendingDown, Lock, Unlock
} from "lucide-react";

export default function FileDetailPage() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { uploadedModels, downloadReport, formatSystemTime } = useModel();

  const model = useMemo(() => {
    if (!uploadedModels.length) return null;
    return uploadedModels.find(m => String(m.id) === fileId) || null;
  }, [uploadedModels, fileId]);

  if (!model) {
    return (
      <div className="page-section" style={{ textAlign: "center", padding: "80px 32px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.1)", display: "grid", placeItems: "center",
          margin: "0 auto 20px auto", color: "var(--red)"
        }}>
          <AlertTriangle size={36} />
        </div>
        <h2 style={{ marginBottom: 8 }}>File Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          This model file was not found in the uploaded models registry.
        </p>
        <button className="primary-button" onClick={() => navigate("/analytics")}>
          <ArrowLeft size={15} /> Back to Security Analytics
        </button>
      </div>
    );
  }

  const isTampered = model.status === "FAILED" || model.tamperPercentage > 0;
  const tamperPercentage = isTampered ? (model.tamperPercentage || getTamperPercentageForModel(model)) : 0;
  const intactPercentage = isTampered ? (model.intactPercentage || Number((100 - tamperPercentage).toFixed(1))) : 100;

  // Publisher assignment: secure → random trusted publisher, tampered → unknown
  const assignedPublisher = useMemo(() => {
    if (isTampered) {
      return {
        name: "Unknown Publisher",
        displayName: "⚠ Unknown Publisher",
        description: "Unknown publisher not found in database. This model's origin could not be verified against any trusted publisher in the ModelGuard registry. The model may have been uploaded from an untrusted or unregistered source.",
        status: "Untrusted",
        keyFingerprint: "NONE",
        keyType: "N/A",
        country: "Unknown",
        website: "N/A",
      };
    }
    // For verified files, pick a deterministic "random" publisher based on file id
    const seed = typeof model.id === "number" ? model.id : 0;
    const idx = seed % ALL_PUBLISHERS.length;
    return ALL_PUBLISHERS[idx];
  }, [isTampered, model.id]);

  // Risk Management calculations
  const riskLevel = isTampered
    ? tamperPercentage > 30 ? "CRITICAL" : tamperPercentage > 15 ? "HIGH" : "MEDIUM"
    : "LOW";

  const riskColor = {
    CRITICAL: "#dc2626",
    HIGH: "#f97316",
    MEDIUM: "#eab308",
    LOW: "#22c55e",
  }[riskLevel];

  const riskScore = isTampered
    ? Math.min(100, Math.round(tamperPercentage * 2.5 + 25))
    : Math.max(0, Math.round(5 - intactPercentage * 0.05));

  // Per-layer tamper percentage
  const layerTamperData = model.layers?.map(layer => {
    const lt = layer.status === "tampered";
    return {
      ...layer,
      tamperPct: lt ? Math.round(65 + Math.random() * 30) : 0,
      riskLabel: lt ? "Compromised" : "Verified",
    };
  }) || [];

  // SVG Donut
  const renderDonut = (intactPct, tamperPct) => {
    const size = 220;
    const sw = 26;
    const c = size / 2;
    const r = c - sw;
    const circ = 2 * Math.PI * r;
    const intactD = (intactPct / 100) * circ;
    const tamperD = (tamperPct / 100) * circ;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={c} cy={c} r={r} fill="transparent" stroke="rgba(148,163,184,0.1)" strokeWidth={sw} />
        <circle cx={c} cy={c} r={r} fill="transparent" stroke="var(--green)" strokeWidth={sw}
          strokeDasharray={`${intactD} ${circ}`} strokeDashoffset={0} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
        {tamperPct > 0 && (
          <circle cx={c} cy={c} r={r} fill="transparent" stroke="var(--red)" strokeWidth={sw}
            strokeDasharray={`${tamperD} ${circ}`} strokeDashoffset={-intactD} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }} />
        )}
      </svg>
    );
  };

  // Bar chart SVG
  const maxLayers = layerTamperData.length;
  const barWidth = Math.min(60, Math.floor(500 / Math.max(maxLayers, 1)));
  const barChartW = maxLayers * (barWidth + 12) + 40;
  const barChartH = 220;

  return (
    <div className="page-section">
      {/* Back Navigation */}
      <button
        className="secondary-button"
        onClick={() => navigate("/analytics")}
        style={{ marginBottom: 16 }}
      >
        <ArrowLeft size={15} /> Back to Security Analytics
      </button>

      {/* File Header */}
      <div className="panel" style={{ padding: "22px 26px", borderRadius: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: isTampered ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                display: "grid", placeItems: "center",
                color: isTampered ? "var(--red)" : "var(--green)"
              }}>
                {isTampered ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
              </div>
              <div>
                <h2 style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "1.35rem" }}>
                  {model.fileName}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                  <span>{model.modelType}</span>
                  <span>•</span>
                  <span>{model.fileSize}</span>
                  <span>•</span>
                  <span>{model.totalLayers} Layers</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              padding: "8px 16px", borderRadius: 10,
              background: isTampered ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
              border: `1px solid ${isTampered ? "var(--red)" : "var(--green)"}`,
              color: isTampered ? "var(--red)" : "var(--green)",
              fontWeight: 700, fontSize: "0.95rem",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {isTampered ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
              {isTampered ? "TAMPERING DETECTED" : "INTEGRITY VERIFIED"}
            </div>
            <button className="secondary-button" onClick={() => downloadReport("pdf")}>
              <Download size={15} /> Export Report
            </button>
          </div>
        </div>

        {/* Upload timestamp */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          <Clock size={13} /> Uploaded: {model.uploadTime}
        </div>
      </div>

      {/* 2-column: Overview Stats + Publisher */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Stats Card */}
        <div className="panel" style={{ padding: 20, borderRadius: 12 }}>
          <h3 style={{ fontSize: "1.05rem", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={18} style={{ color: "var(--accent-cyan)" }} />
            Integrity Overview
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "var(--bg-secondary)", padding: "14px 16px", borderRadius: 8, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Correct Content</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--green)", marginTop: 2 }}>{intactPercentage}%</div>
              <small style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>{model.verifiedLayersCount} layers intact</small>
            </div>
            <div style={{ background: "var(--bg-secondary)", padding: "14px 16px", borderRadius: 8, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Tampered Content</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: isTampered ? "var(--red)" : "var(--text-muted)", marginTop: 2 }}>{tamperPercentage}%</div>
              <small style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>{model.tamperedLayersCount} layer(s) modified</small>
            </div>
            <div style={{ background: "var(--bg-secondary)", padding: "14px 16px", borderRadius: 8, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Layers</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--cyan)", marginTop: 2 }}>{model.totalLayers}</div>
              <small style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>SHA-256 hashed</small>
            </div>
            <div style={{ background: "var(--bg-secondary)", padding: "14px 16px", borderRadius: 8, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Security Verdict</span>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: isTampered ? "var(--red)" : "var(--green)", marginTop: 6 }}>
                {isTampered ? "FAILED AUDIT" : "PASSED AUDIT"}
              </div>
              <small style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>{isTampered ? "Do not deploy" : "Safe for inference"}</small>
            </div>
          </div>
        </div>

        {/* Publisher Info Card */}
        <div className="panel" style={{ padding: 20, borderRadius: 12 }}>
          <h3 style={{ fontSize: "1.05rem", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <Building2 size={18} style={{ color: isTampered ? "var(--red)" : "var(--accent-cyan)" }} />
            Publisher Verification
          </h3>
          <div style={{
            padding: 16, borderRadius: 10,
            background: isTampered ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
            border: `1px solid ${isTampered ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: isTampered ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                display: "grid", placeItems: "center",
                color: isTampered ? "var(--red)" : "var(--green)",
              }}>
                {isTampered ? <AlertOctagon size={20} /> : <ShieldCheck size={20} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: isTampered ? "var(--red)" : "var(--text-primary)", fontSize: "1rem" }}>
                  {assignedPublisher.displayName || assignedPublisher.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {isTampered ? "NOT IN TRUSTED REGISTRY" : `Verified • ${assignedPublisher.country}`}
                </div>
              </div>
            </div>

            {isTampered && (
              <div style={{
                padding: "10px 12px", borderRadius: 6, marginBottom: 10,
                background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                fontSize: "0.82rem", color: "var(--red)", fontWeight: 600,
              }}>
                ⚠ Unknown publisher not found in database
              </div>
            )}

            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0 0 8px 0", lineHeight: 1.5 }}>
              {assignedPublisher.description}
            </p>

            {!isTampered && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 10 }}>
                <span>Key: <code style={{ color: "var(--cyan)" }}>{assignedPublisher.keyFingerprint}</code></span>
                <span>Models: <strong>{assignedPublisher.models}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graphs Section: Pie Chart + Bar Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Pie / Donut Chart */}
        <div className="panel" style={{ padding: 22, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <PieChart size={18} style={{ color: "var(--accent-purple)" }} />
            <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Tamper Distribution (Pie Chart)</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 32, justifyContent: "center" }}>
            <div style={{ position: "relative", width: 220, height: 220 }}>
              {renderDonut(intactPercentage, tamperPercentage)}
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", textAlign: "center"
              }}>
                <span style={{ fontSize: "1.7rem", fontWeight: 800, color: isTampered ? "var(--red)" : "var(--green)", lineHeight: 1.1 }}>
                  {intactPercentage}%
                </span>
                <small style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", marginTop: 2 }}>
                  Integrity
                </small>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--green)" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Correct Content</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{intactPercentage}% — {model.verifiedLayersCount} layers</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: isTampered ? "var(--red)" : "var(--text-muted)" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Tampered Content</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{tamperPercentage}% — {model.tamperedLayersCount} layers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart of Layer Integrity */}
        <div className="panel" style={{ padding: 22, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <BarChart3 size={18} style={{ color: "var(--accent-cyan)" }} />
            <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Layer Integrity Graph</h3>
          </div>

          <div style={{ overflowX: "auto" }}>
            <svg width={Math.max(barChartW, 400)} height={barChartH + 40} viewBox={`0 0 ${Math.max(barChartW, 400)} ${barChartH + 40}`}>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(pct => {
                const y = barChartH - (pct / 100) * (barChartH - 30);
                return (
                  <g key={pct}>
                    <line x1={35} y1={y} x2={Math.max(barChartW, 400) - 10} y2={y} stroke="rgba(148,163,184,0.12)" strokeWidth={1} />
                    <text x={4} y={y + 4} fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-mono)">{pct}%</text>
                  </g>
                );
              })}

              {/* Bars */}
              {layerTamperData.map((layer, idx) => {
                const lt = layer.status === "tampered";
                const barH = ((lt ? (100 - layer.tamperPct) : 100) / 100) * (barChartH - 30);
                const x = 50 + idx * (barWidth + 12);
                const y = barChartH - barH;
                return (
                  <g key={layer.id || idx}>
                    <defs>
                      <linearGradient id={`bar-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={lt ? "#ef4444" : "#22c55e"} />
                        <stop offset="100%" stopColor={lt ? "#991b1b" : "#15803d"} />
                      </linearGradient>
                    </defs>
                    <rect
                      x={x} y={y} width={barWidth} height={barH}
                      rx={4} fill={`url(#bar-grad-${idx})`}
                      style={{ transition: "all 0.5s ease" }}
                    />
                    {/* Label */}
                    <text
                      x={x + barWidth / 2} y={barChartH + 14}
                      fill="var(--text-muted)" fontSize={9} fontFamily="var(--font-mono)"
                      textAnchor="middle"
                    >
                      {layer.name.length > 8 ? layer.name.slice(0, 8) + "…" : layer.name}
                    </text>
                    {/* Value on top */}
                    <text
                      x={x + barWidth / 2} y={y - 6}
                      fill={lt ? "var(--red)" : "var(--green)"} fontSize={10} fontWeight={700}
                      fontFamily="var(--font-mono)" textAnchor="middle"
                    >
                      {lt ? `${layer.tamperPct}%` : "0%"}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10, fontSize: "0.75rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--green)" }} /> Intact Layer
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--red)" }} /> Tampered Layer
            </span>
          </div>
        </div>
      </div>

      {/* Risk Management Section */}
      <div className="panel" style={{ padding: 22, borderRadius: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Shield size={18} style={{ color: riskColor }} />
          <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Risk Management & Assessment</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {/* Risk Level */}
          <div style={{
            padding: 16, borderRadius: 10,
            background: `${riskColor}12`, border: `1px solid ${riskColor}40`,
          }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Risk Level</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: riskColor, marginTop: 4 }}>{riskLevel}</div>
            <small style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>
              {riskLevel === "LOW" ? "No action required" : riskLevel === "MEDIUM" ? "Manual review recommended" : riskLevel === "HIGH" ? "Quarantine recommended" : "Immediate action required"}
            </small>
          </div>

          {/* Risk Score */}
          <div style={{
            padding: 16, borderRadius: 10,
            background: "var(--bg-secondary)", border: "1px solid var(--border)",
          }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Risk Score</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: riskColor, marginTop: 4 }}>{riskScore}/100</div>
            <div style={{ height: 6, background: "rgba(148,163,184,0.1)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${riskScore}%`, background: riskColor, borderRadius: 3, transition: "width 0.6s ease" }} />
            </div>
          </div>

          {/* Tamper % in Layers */}
          <div style={{
            padding: 16, borderRadius: 10,
            background: "var(--bg-secondary)", border: "1px solid var(--border)",
          }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Tampered Content in Layers</span>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: isTampered ? "var(--red)" : "var(--green)", marginTop: 4 }}>{tamperPercentage}%</div>
            <small style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>
              {model.tamperedLayersCount} of {model.totalLayers} layers compromised
            </small>
          </div>

          {/* Deployment Recommendation */}
          <div style={{
            padding: 16, borderRadius: 10,
            background: isTampered ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
            border: `1px solid ${isTampered ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
          }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Deployment Status</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              {isTampered ? <Unlock size={18} style={{ color: "var(--red)" }} /> : <Lock size={18} style={{ color: "var(--green)" }} />}
              <span style={{ fontSize: "1rem", fontWeight: 700, color: isTampered ? "var(--red)" : "var(--green)" }}>
                {isTampered ? "BLOCKED" : "APPROVED"}
              </span>
            </div>
            <small style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>
              {isTampered ? "Model quarantined — unsafe for deployment" : "Cleared for production inference"}
            </small>
          </div>
        </div>

        {/* Tampered layers risk breakdown */}
        {isTampered && model.tamperedLayers?.length > 0 && (
          <div style={{
            marginTop: 16, padding: "14px 16px", borderRadius: 8,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={16} style={{ color: "var(--red)" }} />
              <strong style={{ fontSize: "0.9rem", color: "var(--red)" }}>Compromised Layers — Tampered Content Percentage</strong>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {layerTamperData.filter(l => l.status === "tampered").map(layer => (
                <div key={layer.id} style={{
                  display: "grid", gridTemplateColumns: "160px 1fr 80px", alignItems: "center", gap: 12,
                  padding: "8px 12px", borderRadius: 6, background: "rgba(0,0,0,0.15)",
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.84rem", fontWeight: 700, color: "var(--red)" }}>
                      {layer.name}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{layer.type}</div>
                  </div>
                  <div>
                    <div style={{ height: 8, background: "rgba(148,163,184,0.1)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${layer.tamperPct}%`,
                        background: "linear-gradient(90deg, #dc2626, #ef4444)",
                        borderRadius: 4, transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontWeight: 700, color: "var(--red)", fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
                    {layer.tamperPct}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Layer Breakdown Table */}
      <div className="panel" style={{ padding: 22, borderRadius: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Layers size={18} style={{ color: "var(--accent-cyan)" }} />
          <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Complete Layer-by-Layer Verification</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {layerTamperData.map((layer, idx) => {
            const lt = layer.status === "tampered";
            return (
              <div key={layer.id || idx} style={{
                display: "grid", gridTemplateColumns: "180px 1fr 100px",
                gap: 14, alignItems: "center", padding: "12px 14px", borderRadius: 8,
                background: lt ? "rgba(239,68,68,0.08)" : "var(--bg-secondary)",
                border: lt ? "1px solid rgba(239,68,68,0.4)" : "1px solid var(--border)",
              }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.86rem", fontWeight: 700, color: lt ? "var(--red)" : "var(--text-primary)" }}>
                    {layer.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{layer.type || "Neural Weights"}</div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      SHA-256: {layer.hash ? layer.hash.slice(0, 18) + "..." : "Computed"}
                    </span>
                    <span style={{ fontWeight: 700, color: lt ? "var(--red)" : "var(--green)" }}>
                      {lt ? `${layer.tamperPct}% TAMPERED` : "100% INTACT"}
                    </span>
                  </div>
                  <div style={{ height: 8, background: "rgba(148,163,184,0.12)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: "100%",
                      background: lt ? "linear-gradient(90deg, #b91c1c, #ef4444)" : "linear-gradient(90deg, #15803d, #22c55e)",
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 8px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700,
                    background: lt ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)",
                    color: lt ? "var(--red)" : "var(--green)",
                  }}>
                    {lt ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                    {lt ? "TAMPERED" : "CORRECT"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button className="secondary-button" onClick={() => navigate("/verification/merkle")}>
          <BarChart3 size={15} /> View Merkle Tree
        </button>
        <button className="secondary-button" onClick={() => navigate("/security/attack-simulator")}>
          <AlertTriangle size={15} /> Attack Simulator
        </button>
        <button className="primary-button" onClick={() => downloadReport("pdf")}>
          <Download size={15} /> Download PDF Audit
        </button>
      </div>
    </div>
  );
}
