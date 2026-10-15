import { NavLink } from "react-router-dom";
import {
  ShieldCheck, LayoutDashboard, BarChart3, Activity, Bell,
  Upload, Hash, Layers, Network, FileKey, GitCompare,
  Box, Building2, GitBranch, Fingerprint, Clock,
  FileText, Download, Award, FileJson,
  Zap, AlertTriangle, Lock, Server, Settings, X
} from "lucide-react";
import { useModel } from "../context/ModelContext";

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} />, tag: "DB" },
      { to: "/analytics", label: "Security Analytics", icon: <BarChart3 size={16} />, tag: "AN" },
      { to: "/activity", label: "Activity Timeline", icon: <Activity size={16} />, tag: "AT" },
      { to: "/notifications", label: "Notifications", icon: <Bell size={16} />, tag: "NT", badge: true },
    ],
  },
  {
    label: "VERIFICATION",
    items: [
      { to: "/models/upload", label: "Model Upload", icon: <Upload size={16} />, tag: "UP" },
      { to: "/models/publish", label: "Publish Model", icon: <FileKey size={16} />, tag: "PB" },
      { to: "/verification/hash", label: "Hash Verification", icon: <Hash size={16} />, tag: "H#" },
      { to: "/verification/layers", label: "Layer Hashing", icon: <Layers size={16} />, tag: "LH" },
      { to: "/verification/merkle", label: "Merkle Tree", icon: <Network size={16} />, tag: "MT" },
      { to: "/verification/signature", label: "Digital Signature", icon: <FileKey size={16} />, tag: "DS" },
      { to: "/verification/elgamal", label: "ElGamal Demo", icon: <GitCompare size={16} />, tag: "EG" },
      { to: "/verification/comparison", label: "Hash Comparison", icon: <GitCompare size={16} />, tag: "HC" },
    ],
  },
  {
    label: "MODEL REGISTRY",
    items: [
      { to: "/models", label: "Model Registry", icon: <Box size={16} />, tag: "MR" },
      { to: "/registry/publishers", label: "Trusted Publishers", icon: <Building2 size={16} />, tag: "TP" },
      { to: "/registry/provenance", label: "Provenance", icon: <GitBranch size={16} />, tag: "PR" },
      { to: "/registry/versions", label: "Version Control", icon: <Clock size={16} />, tag: "VC" },
      { to: "/registry/fingerprint", label: "Model Fingerprint", icon: <Fingerprint size={16} />, tag: "FP" },
    ],
  },
  {
    label: "RECORDS",
    items: [
      { to: "/records/history", label: "Verification History", icon: <Clock size={16} />, tag: "VH" },
      { to: "/records/logs", label: "Verification Logs", icon: <FileText size={16} />, tag: "VL" },
      { to: "/records/reports", label: "Security Reports", icon: <Download size={16} />, tag: "SR" },
      { to: "/records/certificates", label: "Certificates", icon: <Award size={16} />, tag: "CT" },
      { to: "/records/manifest", label: "Manifest Viewer", icon: <FileJson size={16} />, tag: "MV" },
    ],
  },
  {
    label: "SECURITY",
    items: [
      { to: "/security/attack-simulator", label: "Attack Simulator", icon: <Zap size={16} />, tag: "AS" },
      { to: "/security/risk", label: "Risk Assessment", icon: <AlertTriangle size={16} />, tag: "RA" },
      { to: "/security/metadata", label: "Metadata Protection", icon: <Lock size={16} />, tag: "MP" },
      { to: "/security/keys", label: "Key Management", icon: <Settings size={16} />, tag: "KM" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { to: "/system/health", label: "System Health", icon: <Server size={16} />, tag: "SH" },
      { to: "/settings", label: "Settings", icon: <Settings size={16} />, tag: "ST" },
    ],
  },
];


export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, unreadCount } = useModel();

  return (
    <>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="brand">
          <div className="brand-logo"><ShieldCheck size={22} /></div>
          <div className="brand-text">
            <span className="brand-name">Model<span>Guard</span></span>
            <span className="brand-sub">AI Security Platform</span>
          </div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav className="navigation">
          {navGroups.map(group => (
            <div key={group.label} className="nav-group">
              <p className="nav-group-label">{group.label}</p>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-tag">{item.tag}</span>
                  {item.icon}
                  <span className="nav-label">{item.label}</span>
                  {item.badge && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="engine-status">
          <div className="engine-dot" />
          <div>
            <strong>Security Engine Online</strong>
            <span>SHA-256 • Merkle • Signature</span>
          </div>
        </div>
      </aside>
    </>
  );
}
