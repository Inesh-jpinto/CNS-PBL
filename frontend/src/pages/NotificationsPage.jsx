import { useNavigate } from "react-router-dom";
import { useModel } from "../context/ModelContext";
import { Bell, CheckCircle2, AlertTriangle, Clock, Key, Award, FileText, X } from "lucide-react";

const iconMap = {
  tamper: <AlertTriangle size={18} className="danger-icon" />,
  warning: <AlertTriangle size={18} className="warning-icon" />,
  scan: <Clock size={18} className="scanning-icon" />,
  publisher: <Key size={18} className="success-icon" />,
  verified: <CheckCircle2 size={18} className="success-icon" />,
  certificate: <Award size={18} className="success-icon" />,
  report: <FileText size={18} />,
};

export default function NotificationsPage() {
  const { notifications, markAllRead, markRead } = useModel();
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Notifications Center</h2>
          <p>Security alerts, tamper warnings, and system events</p>
        </div>
        <button className="secondary-button" onClick={markAllRead}>
          <CheckCircle2 size={15} /> Mark all read
        </button>
      </div>

      {unread.length > 0 && (
        <>
          <h4 className="notif-group-label">Unread ({unread.length})</h4>
          <div className="notif-list">
            {unread.map(n => (
              <div key={n.id} className={`notif-item unread notif-${n.type}`}>
                <div className="notif-icon">{iconMap[n.type] || <Bell size={18} />}</div>
                <div className="notif-body">
                  <strong>{n.title}</strong>
                  <span>{n.detail}</span>
                  <small>{n.time}</small>
                </div>
                <div className="notif-actions">
                  {n.type === "tamper" && (
                    <button className="action-btn danger" onClick={() => navigate("/security/attack-simulator")}>Investigate</button>
                  )}
                  <button className="action-btn" onClick={() => markRead(n.id)}><X size={13} /> Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h4 className="notif-group-label">Earlier</h4>
      <div className="notif-list">
        {read.map(n => (
          <div key={n.id} className={`notif-item notif-${n.type}`}>
            <div className="notif-icon muted">{iconMap[n.type] || <Bell size={18} />}</div>
            <div className="notif-body">
              <strong>{n.title}</strong>
              <span>{n.detail}</span>
              <small>{n.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
