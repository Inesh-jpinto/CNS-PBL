export default function StatCard({ icon, title, value, description, valueClass, onClick }) {
  return (
    <div className={`stat-card${onClick ? " clickable" : ""}`} onClick={onClick} style={onClick ? { cursor: "pointer" } : {}}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <span className="stat-title">{title}</span>
        <strong className={valueClass || ""}>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}
