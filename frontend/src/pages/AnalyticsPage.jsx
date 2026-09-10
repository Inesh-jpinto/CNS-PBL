import { BarChart3, TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import StatCard from "../components/StatCard";
import { useNavigate } from "react-router-dom";

const weeklyData = [
  { day: "Mon", verified: 42, tampered: 1, warning: 3 },
  { day: "Tue", verified: 58, tampered: 0, warning: 2 },
  { day: "Wed", verified: 61, tampered: 2, warning: 4 },
  { day: "Thu", verified: 47, tampered: 1, warning: 1 },
  { day: "Fri", verified: 73, tampered: 3, warning: 5 },
  { day: "Sat", verified: 29, tampered: 0, warning: 0 },
  { day: "Sun", verified: 18, tampered: 0, warning: 1 },
];

const publisherStats = [
  { name: "Hugging Face Verified", models: 148, pct: 45 },
  { name: "Microsoft AI Research", models: 57, pct: 17 },
  { name: "Meta FAIR", models: 31, pct: 9 },
  { name: "Google DeepMind Labs", models: 39, pct: 12 },
  { name: "OpenAI Research", models: 24, pct: 7 },
  { name: "Anthropic Safety", models: 12, pct: 4 },
  { name: "Unknown / Unverified", models: 16, pct: 6 },
];

const riskDist = [
  { label: "Critical (80-100)", count: 3, color: "var(--red)" },
  { label: "High (60-79)", count: 7, color: "var(--amber)" },
  { label: "Medium (40-59)", count: 14, color: "var(--yellow)" },
  { label: "Low (20-39)", count: 28, color: "var(--cyan)" },
  { label: "Minimal (0-19)", count: 195, color: "var(--green)" },
];

const maxBar = Math.max(...weeklyData.map(d => d.verified + d.tampered + d.warning));

export default function AnalyticsPage() {
  const navigate = useNavigate();
  return (
    <div className="page-section">
      <div className="section-heading">
        <div><h2>Security Analytics</h2><p>Verification trends, tampering statistics, and publisher insights</p></div>
      </div>

      <section className="stats-grid">
        <StatCard icon={<CheckCircle2 />} title="Total Verifications" value="1,247" description="All time" valueClass="success-text" onClick={() => navigate("/records/history")} />
        <StatCard icon={<AlertTriangle />} title="Tampered Detected" value="18" description="All time" valueClass="danger-text" onClick={() => navigate("/security/risk")} />
        <StatCard icon={<Shield />} title="Integrity Rate" value="98.6%" description="Pass rate" valueClass="success-text" />
        <StatCard icon={<TrendingUp />} title="Scans This Week" value="328" description="+14% vs last week" valueClass="success-text" />
      </section>

      {/* Weekly Trend Bar Chart */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <div><h3>Weekly Verification Trend</h3><p className="sub">Verifications by day</p></div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div className="bar-chart">
            {weeklyData.map(d => {
              const total = d.verified + d.tampered + d.warning;
              const pct = (total / maxBar) * 100;
              return (
                <div key={d.day} className="bar-col">
                  <div className="bar-wrap">
                    <div className="bar-stack" style={{ height: `${pct}%` }}>
                      <div style={{ height: `${(d.tampered / total) * 100}%`, background: "var(--red)" }} />
                      <div style={{ height: `${(d.warning / total) * 100}%`, background: "var(--yellow)" }} />
                      <div style={{ height: `${(d.verified / total) * 100}%`, background: "var(--cyan)" }} />
                    </div>
                  </div>
                  <span className="bar-label">{d.day}</span>
                  <span className="bar-val">{total}</span>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <span><span className="legend-dot" style={{ background: "var(--cyan)" }} />Verified</span>
            <span><span className="legend-dot" style={{ background: "var(--yellow)" }} />Warning</span>
            <span><span className="legend-dot" style={{ background: "var(--red)" }} />Tampered</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Risk Distribution */}
        <div className="panel">
          <div className="card-head"><h3>Risk Distribution</h3></div>
          <div style={{ padding: "16px 18px" }}>
            {riskDist.map(r => (
              <div key={r.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
                  <strong style={{ color: r.color }}>{r.count}</strong>
                </div>
                <div className="risk-track">
                  <div className="risk-fill" style={{ width: `${(r.count / 247) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publisher Stats */}
        <div className="panel">
          <div className="card-head"><h3>Publisher Distribution</h3></div>
          <div style={{ padding: "8px 0" }}>
            {publisherStats.map(p => (
              <div key={p.name} className="pub-stat-row">
                <span>{p.name}</span>
                <div className="pub-bar-wrap">
                  <div className="pub-bar-fill" style={{ width: `${p.pct}%` }} />
                </div>
                <strong>{p.models}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tampering Trend */}
      <div className="panel">
        <div className="card-head"><h3>Tampering Incidents</h3><p className="sub">Last 7 days</p></div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
            {weeklyData.map(d => (
              <div key={d.day} style={{ textAlign: "center" }}>
                <div style={{
                  height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center",
                }}>
                  <div style={{
                    width: 24, background: d.tampered > 0 ? "var(--red)" : "var(--green-soft)",
                    height: `${Math.max((d.tampered / 3) * 80, d.tampered > 0 ? 24 : 8)}px`,
                    borderRadius: 4, transition: "height .4s",
                  }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.day}</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: d.tampered > 0 ? "var(--red)" : "var(--green)" }}>
                  {d.tampered}
                </div>
              </div>
            ))}
          </div>
          <div className="panel-footer" style={{ paddingTop: 12 }}>
            <button className="link-btn" onClick={() => navigate("/security/risk")}>View Risk Assessment →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
