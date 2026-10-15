import { useState, useMemo } from "react";
import { useModel } from "../context/ModelContext";
import { PUBLISHER_CATEGORIES, ALL_PUBLISHERS } from "../utils/publishers";
import {
  Building2, ShieldCheck, Globe, Key, Award, Search,
  X, ExternalLink, ChevronRight, Users, MapPin, Calendar,
  ArrowLeft, Layers, Hash
} from "lucide-react";

export default function PublishersPage() {
  const { selectPublisher, selectedPublisher } = useModel();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPub, setSelectedPub] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPublishers = useMemo(() => {
    let pubs = activeCategory === "all"
      ? ALL_PUBLISHERS
      : PUBLISHER_CATEGORIES.find((_, i) => String(i) === activeCategory)?.publishers || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pubs = pubs.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
      );
    }
    return pubs;
  }, [activeCategory, searchQuery]);

  // Detail modal
  if (selectedPub) {
    return (
      <div className="page-section">
        <button className="secondary-button" onClick={() => setSelectedPub(null)} style={{ marginBottom: 16 }}>
          <ArrowLeft size={15} /> Back to Publisher Registry
        </button>

        <div className="panel" style={{ padding: 28, borderRadius: 14 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(139,92,246,0.15))",
              border: "2px solid var(--accent-cyan)",
              display: "grid", placeItems: "center",
              fontSize: "1.5rem", fontWeight: 800,
              color: "var(--accent-cyan)",
              fontFamily: "var(--font-mono)",
            }}>
              {selectedPub.name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem" }}>{selectedPub.displayName}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Hash size={13} /> {selectedPub.name}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={13} /> {selectedPub.country}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={13} /> Since {selectedPub.since}
                </span>
              </div>
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: 8,
              background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
              color: "var(--green)", fontWeight: 700, fontSize: "0.8rem",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <ShieldCheck size={14} /> TRUSTED
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: "1.05rem", margin: "0 0 10px 0", color: "var(--text-primary)" }}>About {selectedPub.displayName}</h3>
            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
              {selectedPub.description}
            </p>
          </div>

          {/* Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
            <div style={{
              padding: 16, borderRadius: 10,
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Cryptographic Key</span>
              <div style={{ marginTop: 6 }}>
                <code style={{
                  fontSize: "0.88rem", fontFamily: "var(--font-mono)",
                  color: "var(--accent-cyan)", background: "rgba(0,0,0,0.2)",
                  padding: "4px 8px", borderRadius: 4, display: "inline-block",
                }}>
                  {selectedPub.keyFingerprint}
                </code>
              </div>
              <small style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: 4, display: "block" }}>
                Algorithm: {selectedPub.keyType}
              </small>
            </div>

            <div style={{
              padding: 16, borderRadius: 10,
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Verified Models</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent-cyan)", marginTop: 4 }}>
                {selectedPub.models}
              </div>
              <small style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>
                Models published & signed
              </small>
            </div>

            <div style={{
              padding: 16, borderRadius: 10,
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Website</span>
              <div style={{ marginTop: 6 }}>
                <a
                  href={selectedPub.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "var(--accent-cyan)", fontSize: "0.88rem",
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <Globe size={14} /> {selectedPub.website.replace("https://", "")}
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div style={{
              padding: 16, borderRadius: 10,
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Origin</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <MapPin size={16} style={{ color: "var(--accent-purple)" }} />
                <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{selectedPub.country}</span>
              </div>
            </div>
          </div>

          {/* Trust Certificate */}
          <div style={{
            padding: 18, borderRadius: 10,
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Award size={18} style={{ color: "var(--green)" }} />
              <strong style={{ color: "var(--green)", fontSize: "0.95rem" }}>ModelGuard Trust Certificate</strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <strong>{selectedPub.displayName}</strong> has been cryptographically verified and approved as a trusted publisher in the ModelGuard AI Security Platform.
              All models published under the identity key <code style={{ color: "var(--accent-cyan)" }}>{selectedPub.keyFingerprint}</code> ({selectedPub.keyType}) are covered under this trust certification.
              Registered since <strong>{selectedPub.since}</strong> with <strong>{selectedPub.models}</strong> verified model(s) on record.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
            <button
              className="secondary-button"
              onClick={() => {
                selectPublisher({ name: selectedPub.name });
              }}
              disabled={selectedPublisher === selectedPub.name}
            >
              {selectedPublisher === selectedPub.name ? "✓ Active Signer" : "Set as Active Signer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2>Trusted Publisher Registry</h2>
          <p>40 verified cryptographic publisher identities across 4 categories — click any publisher for detailed information</p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--bg-secondary)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "6px 12px", minWidth: 260,
        }}>
          <Search size={15} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search publishers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              background: "transparent", border: "none", outline: "none",
              color: "var(--text-primary)", fontSize: "0.88rem", width: "100%",
              fontFamily: "inherit",
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap",
        padding: "4px 0", borderBottom: "1px solid var(--border)", paddingBottom: 14,
      }}>
        <button
          onClick={() => setActiveCategory("all")}
          style={{
            padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600,
            background: activeCategory === "all" ? "var(--accent-cyan)" : "var(--bg-secondary)",
            color: activeCategory === "all" ? "#0f172a" : "var(--text-secondary)",
            border: activeCategory === "all" ? "none" : "1px solid var(--border)",
            cursor: "pointer", transition: "all 0.2s ease",
          }}
        >
          All Publishers ({ALL_PUBLISHERS.length})
        </button>
        {PUBLISHER_CATEGORIES.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(String(idx))}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600,
              background: activeCategory === String(idx) ? "var(--accent-cyan)" : "var(--bg-secondary)",
              color: activeCategory === String(idx) ? "#0f172a" : "var(--text-secondary)",
              border: activeCategory === String(idx) ? "none" : "1px solid var(--border)",
              cursor: "pointer", transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {cat.title.split("&")[0].trim()} ({cat.publishers.length})
          </button>
        ))}
      </div>

      {/* Category Description */}
      {activeCategory !== "all" && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 16,
          background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.15)",
          fontSize: "0.84rem", color: "var(--text-secondary)",
        }}>
          <strong style={{ color: "var(--accent-cyan)" }}>
            {PUBLISHER_CATEGORIES[Number(activeCategory)]?.title}
          </strong>
          <span> — {PUBLISHER_CATEGORIES[Number(activeCategory)]?.description}</span>
        </div>
      )}

      {/* Publisher Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 14,
      }}>
        {filteredPublishers.map(pub => {
          const isActive = selectedPublisher === pub.name;
          return (
            <div
              key={pub.id}
              onClick={() => setSelectedPub(pub)}
              style={{
                background: "var(--surface-solid)",
                border: isActive ? "2px solid var(--accent-cyan)" : "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px 18px",
                cursor: "pointer",
                transition: "all 0.25s ease",
                position: "relative",
                boxShadow: isActive ? "0 0 20px rgba(34,211,238,0.12)" : "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--accent-cyan)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Top Row: Icon + Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(34,211,238,0.1), rgba(139,92,246,0.1))",
                  border: "1px solid var(--border)",
                  display: "grid", placeItems: "center",
                  color: "var(--accent-cyan)",
                  fontWeight: 800, fontSize: "0.8rem",
                  fontFamily: "var(--font-mono)",
                }}>
                  {pub.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "2px 8px", borderRadius: 6,
                  background: "rgba(34,197,94,0.12)", color: "var(--green)",
                  fontSize: "0.68rem", fontWeight: 700,
                }}>
                  <ShieldCheck size={11} /> Trusted
                </div>
              </div>

              {/* Name */}
              <h4 style={{ margin: "0 0 2px 0", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                {pub.displayName}
              </h4>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
                @{pub.name}
              </div>

              {/* Description Preview */}
              <p style={{
                margin: "0 0 10px 0", fontSize: "0.78rem", color: "var(--text-secondary)",
                lineHeight: 1.45,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {pub.description}
              </p>

              {/* Footer Stats */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                paddingTop: 8, borderTop: "1px solid var(--border)",
                fontSize: "0.72rem", color: "var(--text-muted)",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Layers size={11} /> {pub.models} models
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <MapPin size={11} /> {pub.country}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--accent-cyan)" }}>
                  Details <ChevronRight size={11} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPublishers.length === 0 && (
        <div className="panel" style={{ textAlign: "center", padding: "48px 24px", marginTop: 16 }}>
          <Search size={32} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          <h3 style={{ color: "var(--text-primary)" }}>No Publishers Found</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            No publishers match "<strong>{searchQuery}</strong>". Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
