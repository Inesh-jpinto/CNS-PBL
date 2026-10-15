import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Activity, ChevronRight, User, Download } from "lucide-react";
import { useModel } from "../context/ModelContext";

const breadcrumbMap = {
  "/": ["Overview", "Dashboard"],
  "/analytics": ["Overview", "Security Analytics"],
  "/activity": ["Overview", "Activity Timeline"],
  "/notifications": ["Overview", "Notifications"],
  "/models/upload": ["Verification", "Model Upload"],
  "/verification/hash": ["Verification", "Hash Verification"],
  "/verification/layers": ["Verification", "Layer Hashing"],
  "/verification/merkle": ["Verification", "Merkle Tree"],
  "/verification/signature": ["Verification", "Digital Signature"],
  "/verification/comparison": ["Verification", "Hash Comparison"],
  "/models": ["Registry", "Model Registry"],
  "/registry/publishers": ["Registry", "Trusted Publishers"],
  "/registry/provenance": ["Registry", "Provenance"],
  "/registry/versions": ["Registry", "Version Control"],
  "/registry/fingerprint": ["Registry", "Fingerprint"],
  "/records/history": ["Records", "Verification History"],
  "/records/logs": ["Records", "Verification Logs"],
  "/records/reports": ["Records", "Security Reports"],
  "/records/certificates": ["Records", "Certificates"],
  "/records/manifest": ["Records", "Manifest Viewer"],
  "/security/attack-simulator": ["Security", "Attack Simulator"],
  "/security/risk": ["Security", "Risk Assessment"],
  "/security/metadata": ["Security", "Metadata Protection"],
  "/system/health": ["System", "System Health"],
  "/settings": ["System", "Settings"],
};

export default function Topbar() {
  const { setSidebarOpen, unreadCount, setReportModalOpen, userProfile, setProfileModalOpen } = useModel();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const crumbs = breadcrumbMap[location.pathname] || ["ModelGuard", "Page"];

  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(s => !s);
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchVal.trim()) return;
    // Navigate to registry with search
    navigate(`/models?q=${encodeURIComponent(searchVal)}`);
    setSearchOpen(false);
    setSearchVal("");
  }

  return (
    <>
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit}>
              <Search size={18} />
              <input
                autoFocus
                placeholder="Search models, hashes, publishers..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
              />
              <kbd>ESC</kbd>
            </form>
            <div className="search-suggestions">
              {["llama-3-70b-instruct", "bert-base-uncased", "whisper-large-v3"].map(s => (
                <button key={s} className="search-suggestion" onClick={() => { navigate(`/models?q=${s}`); setSearchOpen(false); }}>
                  <Search size={14} /> {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="topbar">
        <div className="topbar-left">
          <button className="menu-button" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb">
            <span>{crumbs[0]}</span>
            <ChevronRight size={14} />
            <strong>{crumbs[1]}</strong>
          </div>
        </div>

        <button className="search-trigger" onClick={() => setSearchOpen(true)}>
          <Search size={15} />
          <span>Search models, hashes, publishers...</span>
          <kbd>⌘K</kbd>
        </button>

        <div className="topbar-right">
          <button className="topbar-action" onClick={() => setReportModalOpen(true)} title="Export Report">
            <Download size={16} />
          </button>

          <div className="engine-online">
            <Activity size={14} />
            <span>Engine Active</span>
          </div>

          <button
            className="topbar-action notif"
            onClick={() => navigate("/notifications")}
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
          </button>

          <button
            className="profile-button"
            onClick={() => setProfileModalOpen(true)}
            title="Edit Security Profile"
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              className="profile-avatar"
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: userProfile?.avatarColor || "linear-gradient(135deg, #00f2fe, #4facfe)",
                display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700, color: "#0b0e14",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
              }}
            >
              {userProfile?.initials || "IP"}
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div className="profile-name" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>
                {userProfile?.name || "Inesh Jeethan Pinto"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {userProfile?.role || "Security Admin"}
              </div>
            </div>
          </button>
        </div>
      </header>
    </>
  );
}

