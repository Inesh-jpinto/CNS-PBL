import { useState } from "react";
import { useModel } from "../context/ModelContext";
import { registeredModels } from "../utils/data";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Eye, Filter, ArrowUpDown } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

export default function ModelRegistryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = registeredModels.filter(m => {
    const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.publisher.toLowerCase().includes(query.toLowerCase()) ||
      m.fingerprint.toLowerCase().includes(query.toLowerCase());

    const matchesFramework = frameworkFilter === "All" || m.framework === frameworkFilter;
    const matchesStatus = statusFilter === "All" || m.status === statusFilter.toLowerCase();

    return matchesQuery && matchesFramework && matchesStatus;
  });

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Model Registry</h2>
          <p>Search, inspect, and manage verified machine learning model configurations</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="panel" style={{ padding: 14, marginBottom: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-box" style={{ flex: 1, minWidth: 260 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search models, fingerprints, publishers..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div>
            <select className="select-input" value={frameworkFilter} onChange={e => setFrameworkFilter(e.target.value)} style={{ padding: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}>
              <option value="All">All Frameworks</option>
              <option value="PyTorch">PyTorch</option>
              <option value="SafeTensors">SafeTensors</option>
              <option value="ONNX">ONNX</option>
              <option value="TensorFlow">TensorFlow</option>
            </select>
          </div>

          <div>
            <select className="select-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 6 }}>
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Warning">Warning</option>
              <option value="Tampered">Tampered</option>
              <option value="Scanning">Scanning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Model Details</th>
                <th>Version</th>
                <th>Publisher</th>
                <th>Framework</th>
                <th>Size</th>
                <th>Fingerprint</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ fontSize: 13.5, color: "var(--text-primary)" }}>{m.name}</strong>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Last verified: {m.lastVerified}</span>
                    </div>
                  </td>
                  <td><span className="mono" style={{ fontSize: 12 }}>{m.version}</span></td>
                  <td>{m.publisher}</td>
                  <td><span className="chip">{m.framework}</span></td>
                  <td>{m.size}</td>
                  <td><code className="mono">{m.fingerprint}</code></td>
                  <td><StatusBadge status={m.status} /></td>
                  <td>
                    <button className="action-btn" onClick={() => navigate(`/models/${m.id}`)}>
                      <Eye size={12} /> View Profile
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                    No registered models match the current filter selection.
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
