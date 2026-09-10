import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";

export default function StatusBadge({ status }) {
  const v = status?.toLowerCase() || "";
  if (["verified", "trusted", "passed", "valid", "online", "active"].includes(v)) {
    return <span className="status-badge success"><CheckCircle2 size={13} />{status}</span>;
  }
  if (["tampered", "failed", "invalid", "offline", "danger"].includes(v)) {
    return <span className="status-badge danger"><XCircle size={13} />{status}</span>;
  }
  if (["scanning", "analyzing", "verifying", "checking", "pending"].includes(v)) {
    return <span className="status-badge scanning"><Clock size={13} />{status}</span>;
  }
  return <span className="status-badge warning"><AlertTriangle size={13} />{status}</span>;
}
