import { useState } from "react";
import { verificationLogs } from "../utils/data";
import { FileText, Search, Terminal, ArrowDown } from "lucide-react";

export default function LogsPage() {
  const [searchVal, setSearchVal] = useState("");
  const [opFilter, setOpFilter] = useState("All");

  const filtered = verificationLogs.filter(log => {
    const matchesSearch = log.model.toLowerCase().includes(searchVal.toLowerCase()) ||
      log.note.toLowerCase().includes(searchVal.toLowerCase()) ||
      log.hash.toLowerCase().includes(searchVal.toLowerCase());
    const matchesOp = opFilter === "All" || log.op === opFilter;
    return matchesSearch && matchesOp;
  });

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>System Verification Logs</h2>
          <p>Technical logs recorded during signature validation and Merkle tree building checks</p>
        </div>
      </div>

      <div className="panel" style={{ padding: 14, marginBottom: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search logs by model, note, or hash..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
        </div>
        <div>
          <select className="select-input" value={opFilter} onChange={e => setOpFilter(e.target.value)} style={{
            padding: 8, background: "var(--surface)", border: "1px solid var(--border)",
            color: "var(--text-primary)", borderRadius: 6
          }}>
            <option value="All">All Operations</option>
            <option value="SHA256">SHA256 Hashing</option>
            <option value="MERKLE">Merkle Builder</option>
            <option value="SIGNATURE">Signature Engine</option>
          </select>
        </div>
      </div>

      {/* Terminal logs panel */}
      <div className="panel" style={{ background: "#060910", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px",
          borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)"
        }}>
          <Terminal size={16} style={{ color: "var(--cyan)" }} />
          <span className="mono" style={{ fontSize: 11.5, color: "var(--text-muted)", letterSpacing: "0.05em" }}>SYSTEM LOGS OVERVIEW</span>
        </div>
        <div className="table-wrapper" style={{ margin: 0 }}>
          <table className="mono" style={{ fontSize: 12, borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.3)" }}>
                <th style={{ padding: "10px 16px", color: "var(--text-muted)" }}>Timestamp</th>
                <th style={{ padding: "10px 16px", color: "var(--text-muted)" }}>Operation</th>
                <th style={{ padding: "10px 16px", color: "var(--text-muted)" }}>Model Target</th>
                <th style={{ padding: "10px 16px", color: "var(--text-muted)" }}>Layer Scope</th>
                <th style={{ padding: "10px 16px", color: "var(--text-muted)" }}>Status</th>
                <th style={{ padding: "10px 16px", color: "var(--text-muted)" }}>Detail Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{log.ts}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className="chip" style={{
                      background: log.op === "SHA256" ? "var(--cyan-soft)" : log.op === "MERKLE" ? "var(--purple-soft)" : "var(--yellow-soft)",
                      color: log.op === "SHA256" ? "var(--cyan)" : log.op === "MERKLE" ? "var(--purple)" : "var(--yellow)"
                    }}>{log.op}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{log.model}</td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{log.layer}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      color: log.result === "PASS" ? "var(--green)" : "var(--red)",
                      fontWeight: 700
                    }}>{log.result}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                    {log.note} {log.hash && <code style={{ color: "var(--cyan)" }}>({log.hash})</code>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
                    No system logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
