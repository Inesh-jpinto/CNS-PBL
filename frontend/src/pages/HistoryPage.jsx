import { useState } from "react";
import { useModel } from "../context/ModelContext";
import { History, Search, Calendar, FileText, CheckCircle2, AlertTriangle, Eye } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { useNavigate } from "react-router-dom";

export default function HistoryPage() {
  const { history } = useModel();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");
  const [filterResult, setFilterResult] = useState("All");

  const filtered = history.filter(h => {
    const matchesSearch = h.model.toLowerCase().includes(searchVal.toLowerCase()) ||
      h.version.toLowerCase().includes(searchVal.toLowerCase());
    const matchesFilter = filterResult === "All" || h.result === filterResult.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Verification History</h2>
          <p>Chronological records of previous cryptographic verification scans and publisher audits</p>
        </div>
      </div>

      <div className="panel" style={{ padding: 14, marginBottom: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by model name or version..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
        </div>
        <div className="chip-group">
          {["All", "Passed", "Failed"].map(res => (
            <button key={res} className={`chip${filterResult === res ? " on" : ""}`} onClick={() => setFilterResult(res)}>
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* History Timeline Panel */}
      <div className="panel">
        <div className="history-panel">
          {filtered.map(item => (
            <div key={item.id} className="history-item" style={{
              display: "flex", alignItems: "center", justifyItems: "space-between", padding: 16,
              borderBottom: "1px solid var(--border)", gap: 14
            }}>
              <div className={`history-icon ${item.result === "PASSED" ? "safe" : "danger"}`} style={{
                width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center",
                background: item.result === "PASSED" ? "var(--green-soft)" : "var(--red-soft)",
                color: item.result === "PASSED" ? "var(--green)" : "var(--red)"
              }}>
                {item.result === "PASSED" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              </div>

              <div className="history-model" style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: 14 }}>{item.model}</strong>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.version} • Publisher: {item.publisher || "Unknown"}</span>
              </div>

              <div className="history-time" style={{ color: "var(--text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={14} /> {item.time}
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <StatusBadge status={item.result === "PASSED" ? "Passed" : "Failed"} />
                <button className="action-btn" onClick={() => navigate("/records/reports")}>
                  <Eye size={12} /> View Report
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
              No verification history records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
