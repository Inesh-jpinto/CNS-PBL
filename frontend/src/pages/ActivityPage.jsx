import { activityFeed } from "../utils/data";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Clock, Key, Award, FileText, ScanSearch, Zap } from "lucide-react";

const iconMap = {
  check: <CheckCircle2 size={18} />,
  scan: <ScanSearch size={18} />,
  alert: <AlertTriangle size={18} />,
  key: <Key size={18} />,
  certificate: <Award size={18} />,
  warning: <AlertTriangle size={18} />,
  report: <FileText size={18} />,
};

const typeColor = {
  verified: "var(--green)",
  scan: "var(--purple)",
  tamper: "var(--red)",
  publisher: "var(--cyan)",
  warning: "var(--yellow)",
  report: "var(--text-secondary)",
};

export default function ActivityPage() {
  const navigate = useNavigate();

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Activity Timeline</h2>
          <p>Real-time chronological security events and system actions</p>
        </div>
        <button className="primary-button" onClick={() => navigate("/models/upload")}>
          <Zap size={15} /> Run New Verification
        </button>
      </div>

      <div className="timeline">
        {activityFeed.map((event, i) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-line" style={{ background: i < activityFeed.length - 1 ? "var(--border)" : "transparent" }} />
            <div className="timeline-dot" style={{ background: typeColor[event.type] || "var(--text-muted)" }}>
              <span style={{ color: typeColor[event.type] }}>{iconMap[event.icon]}</span>
            </div>
            <div className="timeline-body panel">
              <div className="timeline-top">
                <strong>{event.title}</strong>
                <span className="timeline-time"><Clock size={13} /> {event.time}</span>
              </div>
              <p>{event.detail}</p>
              {event.type === "tamper" && (
                <button className="action-btn danger" style={{ marginTop: 8 }} onClick={() => navigate("/security/attack-simulator")}>
                  <AlertTriangle size={13} /> Investigate
                </button>
              )}
              {event.type === "verified" && (
                <button className="action-btn success" style={{ marginTop: 8 }} onClick={() => navigate("/records/history")}>
                  <CheckCircle2 size={13} /> View Record
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
