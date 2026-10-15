import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useModel } from "../context/ModelContext";
import {
  Bell, CheckCircle2, AlertTriangle, Clock, Key, Award,
  FileText, Upload, Trash2, X, ArrowRight, ShieldCheck,
  Search, ShieldAlert, Sparkles, Filter, Check, Eye
} from "lucide-react";

export default function NotificationsPage() {
  const {
    notifications,
    markAllRead,
    markRead,
    deleteNotification,
    clearAllNotifications,
  } = useModel();
  const navigate = useNavigate();

  // Active filter & search query
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Live system clock
  const [currentSystemTime, setCurrentSystemTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSystemTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stats calculation
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;
  const tamperCount = notifications.filter(n => n.type === "tamper" || n.type === "danger").length;
  const verifiedCount = notifications.filter(n => n.type === "verified" || n.type === "publisher" || n.type === "scan").length;
  const uploadCount = notifications.filter(n => n.type === "upload").length;

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Tab filter
      if (activeTab === "unread" && n.read) return false;
      if (activeTab === "tamper" && n.type !== "tamper" && n.type !== "danger") return false;
      if (activeTab === "upload" && n.type !== "upload") return false;
      if (activeTab === "verified" && n.type !== "verified" && n.type !== "publisher" && n.type !== "scan") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = n.title?.toLowerCase().includes(q);
        const detailMatch = n.detail?.toLowerCase().includes(q);
        const timeMatch = n.time?.toLowerCase().includes(q);
        if (!titleMatch && !detailMatch && !timeMatch) return false;
      }
      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  // Color & badge helpers
  function getSeverityConfig(type) {
    switch (type) {
      case "tamper":
      case "danger":
        return {
          color: "#ef4444",
          bgColor: "rgba(239, 68, 68, 0.12)",
          borderColor: "rgba(239, 68, 68, 0.35)",
          glowColor: "rgba(239, 68, 68, 0.2)",
          badgeText: "CRITICAL THREAT",
          badgeBg: "rgba(239, 68, 68, 0.18)",
          icon: <ShieldAlert size={20} color="#ef4444" />,
          actionLabel: "Investigate Threat",
          actionRoute: "/security/attack-simulator",
          actionColor: "linear-gradient(135deg, #ef4444, #dc2626)",
        };
      case "verified":
      case "publisher":
        return {
          color: "#22c55e",
          bgColor: "rgba(34, 197, 94, 0.12)",
          borderColor: "rgba(34, 197, 94, 0.35)",
          glowColor: "rgba(34, 197, 94, 0.2)",
          badgeText: "INTEGRITY PASSED",
          badgeBg: "rgba(34, 197, 94, 0.18)",
          icon: <CheckCircle2 size={20} color="#22c55e" />,
          actionLabel: "Merkle Proof",
          actionRoute: "/verification/merkle",
          actionColor: "linear-gradient(135deg, #22c55e, #16a34a)",
        };
      case "upload":
        return {
          color: "#22d3ee",
          bgColor: "rgba(34, 211, 238, 0.12)",
          borderColor: "rgba(34, 211, 238, 0.35)",
          glowColor: "rgba(34, 211, 238, 0.2)",
          badgeText: "PIPELINE ACTIVE",
          badgeBg: "rgba(34, 211, 238, 0.18)",
          icon: <Upload size={20} color="#22d3ee" />,
          actionLabel: "View Layers",
          actionRoute: "/verification/layers",
          actionColor: "linear-gradient(135deg, #22d3ee, #0284c7)",
        };
      case "warning":
        return {
          color: "#f59e0b",
          bgColor: "rgba(245, 158, 11, 0.12)",
          borderColor: "rgba(245, 158, 11, 0.35)",
          glowColor: "rgba(245, 158, 11, 0.2)",
          badgeText: "EXPIRY WARNING",
          badgeBg: "rgba(245, 158, 11, 0.18)",
          icon: <AlertTriangle size={20} color="#f59e0b" />,
          actionLabel: "Inspect Certificate",
          actionRoute: "/records/certificates",
          actionColor: "linear-gradient(135deg, #f59e0b, #d97706)",
        };
      default:
        return {
          color: "#8b5cf6",
          bgColor: "rgba(139, 92, 246, 0.12)",
          borderColor: "rgba(139, 92, 246, 0.35)",
          glowColor: "rgba(139, 92, 246, 0.2)",
          badgeText: "SYSTEM AUDIT",
          badgeBg: "rgba(139, 92, 246, 0.18)",
          icon: <FileText size={20} color="#8b5cf6" />,
          actionLabel: "View Logs",
          actionRoute: "/records/logs",
          actionColor: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        };
    }
  }

  return (
    <div className="page-section" style={{ maxWidth: 1300, margin: "0 auto" }}>
      {/* ── Page Header ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 24,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(139, 92, 246, 0.2))",
              border: "1px solid rgba(34, 211, 238, 0.3)",
              display: "grid",
              placeItems: "center",
              color: "var(--cyan)",
              boxShadow: "0 0 16px rgba(34, 211, 238, 0.15)",
            }}>
              <Bell size={20} />
            </div>
            <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>
              Notifications & Security Logs
            </h2>
          </div>
          <p style={{ margin: "6px 0 0 0", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Real-time security alerts, cryptographic model verification logs, and threat audits
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.8rem",
              color: "var(--cyan)",
              background: "rgba(34, 211, 238, 0.08)",
              border: "1px solid rgba(34, 211, 238, 0.2)",
              padding: "4px 10px",
              borderRadius: "6px",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
            }}>
              <Clock size={13} /> Local Device Clock: {currentSystemTime}
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              • All events cryptographic-stamped to local machine time
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 16px",
                borderRadius: 9,
                border: "1px solid rgba(34, 211, 238, 0.3)",
                background: "rgba(34, 211, 238, 0.08)",
                color: "var(--cyan)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(34, 211, 238, 0.16)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(34, 211, 238, 0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Check size={15} /> Mark All Read ({unreadCount})
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all notifications?")) {
                  clearAllNotifications?.();
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 16px",
                borderRadius: 9,
                border: "1px solid rgba(239, 68, 68, 0.25)",
                background: "rgba(239, 68, 68, 0.06)",
                color: "#ef4444",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.14)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Trash2 size={14} /> Clear All Logs
            </button>
          )}
        </div>
      </div>

      {/* ── 4 Quick Stats Counters ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
        marginBottom: 24,
      }}>
        {[
          { label: "Total Notifications", value: totalCount, icon: <Bell size={18} />, color: "var(--cyan)", tab: "all" },
          { label: "Critical Tamper Alerts", value: tamperCount, icon: <ShieldAlert size={18} />, color: "#ef4444", tab: "tamper" },
          { label: "Integrity Verified", value: verifiedCount, icon: <ShieldCheck size={18} />, color: "#22c55e", tab: "verified" },
          { label: "Unread Messages", value: unreadCount, icon: <Sparkles size={18} />, color: "#f59e0b", tab: "unread" },
        ].map((s, idx) => (
          <div
            key={idx}
            onClick={() => setActiveTab(s.tab)}
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              background: activeTab === s.tab ? "rgba(34, 211, 238, 0.08)" : "linear-gradient(145deg, #101824, #0b111a)",
              border: `1px solid ${activeTab === s.tab ? s.color : "var(--border)"}`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: activeTab === s.tab ? `0 0 16px ${s.color}22` : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                {s.label}
              </span>
              <div style={{ color: s.color }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar & Search ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 12,
        background: "rgba(16, 24, 36, 0.7)",
        border: "1px solid var(--border)",
        marginBottom: 20,
      }}>
        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All (${totalCount})` },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "tamper", label: `🚨 Threats (${tamperCount})` },
            { id: "upload", label: `📤 Uploads (${uploadCount})` },
            { id: "verified", label: `✅ Verified (${verifiedCount})` },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: `1px solid ${isActive ? "var(--cyan)" : "transparent"}`,
                  background: isActive ? "rgba(34, 211, 238, 0.14)" : "rgba(255, 255, 255, 0.03)",
                  color: isActive ? "var(--cyan)" : "var(--text-secondary)",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(9, 14, 22, 0.8)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "6px 12px",
          minWidth: 260,
        }}>
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search alerts or model files..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "0.82rem",
              width: "100%",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Notification Feed ── */}
      {filteredNotifications.length === 0 ? (
        /* Empty State */
        <div style={{
          textAlign: "center",
          padding: "64px 24px",
          background: "linear-gradient(145deg, #101824, #0b111a)",
          borderRadius: 16,
          border: "1px solid var(--border)",
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(34, 211, 238, 0.1)",
            border: "1px solid rgba(34, 211, 238, 0.2)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px auto",
            color: "var(--cyan)",
            boxShadow: "0 0 24px var(--cyan-glow)",
          }}>
            <ShieldCheck size={32} />
          </div>
          <h3 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontSize: "1.2rem" }}>
            No Notifications Found
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: 460, margin: "0 auto 20px auto", lineHeight: 1.6 }}>
            {searchQuery
              ? `No alerts matched your search query "${searchQuery}".`
              : activeTab !== "all"
              ? `There are currently no notifications under the "${activeTab}" category.`
              : "All systems are running securely. New cryptographic verifications will appear here automatically."}
          </p>
          <button
            className="primary-button"
            onClick={() => navigate("/models/upload")}
            style={{ margin: "0 auto" }}
          >
            <Upload size={16} /> Verify New Model
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredNotifications.map(n => {
            const config = getSeverityConfig(n.type);
            const isUnread = !n.read;

            return (
              <div
                key={n.id}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: 14,
                  background: isUnread
                    ? "linear-gradient(145deg, #131f30, #0d1522)"
                    : "linear-gradient(145deg, #0e1622, #0a1019)",
                  border: `1px solid ${isUnread ? config.borderColor : "var(--border)"}`,
                  borderLeft: `5px solid ${config.color}`,
                  boxShadow: isUnread ? `0 4px 20px ${config.glowColor}` : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Left Content */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                  {/* Icon Squirle */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: config.bgColor,
                    border: `1px solid ${config.borderColor}`,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    boxShadow: `0 0 12px ${config.glowColor}`,
                  }}>
                    {config.icon}
                  </div>

                  {/* Body Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      {/* Title */}
                      <span style={{
                        fontSize: "0.95rem",
                        fontWeight: 750,
                        color: isUnread ? "var(--text-primary)" : "rgba(248, 250, 252, 0.85)",
                        fontFamily: "Inter, sans-serif",
                      }}>
                        {n.title}
                      </span>

                      {/* Severity Chip */}
                      <span style={{
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        padding: "2px 7px",
                        borderRadius: 4,
                        background: config.badgeBg,
                        color: config.color,
                        border: `1px solid ${config.borderColor}`,
                      }}>
                        {config.badgeText}
                      </span>

                      {/* Unread Pill */}
                      {isUnread && (
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: config.color,
                          boxShadow: `0 0 8px ${config.color}`,
                          display: "inline-block",
                        }} />
                      )}
                    </div>

                    {/* Detail snippet */}
                    <div style={{
                      fontSize: "0.84rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.4,
                      wordBreak: "break-word",
                    }}>
                      {n.detail}
                    </div>

                    {/* Timestamp with Clock Icon */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 6,
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}>
                      <Clock size={11} />
                      <span>{n.time}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {/* Primary Context Action */}
                  <button
                    onClick={() => {
                      if (isUnread) markRead(n.id);
                      navigate(config.actionRoute);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: config.actionColor,
                      color: config.color === "#ef4444" || config.color === "#22d3ee" ? "#071018" : "#ffffff",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: `0 2px 10px ${config.glowColor}`,
                      transition: "all 0.18s ease",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 4px 16px ${config.glowColor}`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = `0 2px 10px ${config.glowColor}`;
                    }}
                  >
                    <span>{config.actionLabel}</span>
                    <ArrowRight size={13} />
                  </button>

                  {/* Mark as read checkmark (if unread) */}
                  {isUnread && (
                    <button
                      onClick={() => markRead(n.id)}
                      title="Mark as read"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "var(--green)";
                        e.currentTarget.style.color = "var(--green)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      <Check size={14} />
                    </button>
                  )}

                  {/* Dismiss / Delete button */}
                  <button
                    onClick={() => (deleteNotification ? deleteNotification(n.id) : markRead(n.id))}
                    title="Dismiss notification"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "var(--red)";
                      e.currentTarget.style.color = "var(--red)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
