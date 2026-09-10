import { Server, Activity, Cpu, Database, Cpu as EngineIcon, Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import StatusBadge from "../components/StatusBadge";

export default function SystemHealthPage() {
  const [refreshing, setRefreshing] = useState(false);

  const [engines, setEngines] = useState([
    { id: 1, name: "SHA-256 Hashing Engine", status: "Online", latency: "12ms", load: "14%", uptime: "99.98%" },
    { id: 2, name: "Merkle Tree Builder", status: "Online", latency: "24ms", load: "8%", uptime: "99.99%" },
    { id: 3, name: "ED25519 Signature Verifier", status: "Online", latency: "8ms", load: "4%", uptime: "100.00%" },
    { id: 4, name: "Publisher Credentials API", status: "Online", latency: "115ms", load: "34%", uptime: "99.95%" },
    { id: 5, name: "Verification Registry Database", status: "Online", latency: "42ms", load: "22%", uptime: "99.97%" }
  ]);

  function triggerRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      // Simulate random fluctuations
      setEngines(prev => prev.map(e => ({
        ...e,
        latency: `${Math.floor(Math.random() * 50) + 5}ms`,
        load: `${Math.floor(Math.random() * 30) + 2}%`
      })));
      setRefreshing(false);
    }, 1200);
  }

  return (
    <div className="page-section">
      <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>System Health Monitor</h2>
          <p>Real-time operating statuses and workloads of ModelGuard verification services</p>
        </div>
        <button className="secondary-button" onClick={triggerRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? "spin-animation" : ""} /> {refreshing ? "Refreshing..." : "Refresh Engine Status"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, alignItems: "start" }}>
        {/* Service statuses */}
        <div className="panel">
          <div className="card-head" style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
            <h3>Active System Services</h3>
          </div>
          <div style={{ padding: "8px 0" }}>
            {engines.map(eng => (
              <div key={eng.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 18px", borderBottom: "1px solid var(--border)", fontSize: 13
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: "var(--surface)", display: "grid", placeItems: "center" }}>
                    {eng.id === 5 ? <Database size={16} style={{ color: "var(--cyan)" }} /> : <Server size={16} style={{ color: "var(--cyan)" }} />}
                  </div>
                  <div>
                    <strong style={{ display: "block" }}>{eng.name}</strong>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Latency: {eng.latency} · Load: {eng.load}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Uptime: <strong>{eng.uptime}</strong></span>
                  <StatusBadge status={eng.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System metrics */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            <h3>Hardware Resources Load</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--text-secondary)" }}>Verification Server CPU load</span>
                <strong>42%</strong>
              </div>
              <div className="risk-track">
                <div className="risk-fill" style={{ width: "42%", background: "var(--cyan)" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--text-secondary)" }}>Cryptographic RAM usage</span>
                <strong>68%</strong>
              </div>
              <div className="risk-track">
                <div className="risk-fill" style={{ width: "68%", background: "var(--purple)" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--text-secondary)" }}>API Gateway Network Traffic</span>
                <strong>14%</strong>
              </div>
              <div className="risk-track">
                <div className="risk-fill" style={{ width: "14%", background: "var(--green)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
