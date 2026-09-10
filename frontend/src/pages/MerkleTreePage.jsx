import { useState } from "react";
import { useModel } from "../context/ModelContext";
import { Network, ShieldCheck, AlertTriangle, Info, ArrowDown, HelpCircle } from "lucide-react";
import MerkleNode from "../components/MerkleNode";
import { generateDemoHash } from "../utils/crypto";

export default function MerkleTreePage() {
  const { merkleRoot, layers, tamperedLayers } = useModel();
  const [selectedNode, setSelectedNode] = useState(null);

  const hashA = generateDemoHash(merkleRoot.slice(0, 32));
  const hashB = generateDemoHash(merkleRoot.slice(32));

  function handleNodeClick(label, hash, status, relation) {
    setSelectedNode({ label, hash, status, relation });
  }

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Visual Merkle Tree</h2>
          <p>Interactive verification tree combining layer-wise hashes into a single root fingerprint</p>
        </div>
      </div>

      {/* Root Summary Panel */}
      <div className="merkle-root panel" style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px" }}>
        <div>
          <p className="eyebrow" style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.1em", fontWeight: 700 }}>MODEL FINGERPRINT</p>
          <h3 style={{ margin: "4px 0" }}>Merkle Root Hash</h3>
          <code className="mono" style={{ color: "var(--cyan)", fontSize: 14 }}>{merkleRoot}</code>
        </div>
        <div className={`root-shield ${tamperedLayers.length > 0 ? "danger" : "safe"}`} style={{
          width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center",
          background: tamperedLayers.length > 0 ? "var(--red-soft)" : "var(--green-soft)",
          border: `1px solid ${tamperedLayers.length > 0 ? "var(--red)" : "var(--green)"}`,
          color: tamperedLayers.length > 0 ? "var(--red)" : "var(--green)"
        }}>
          {tamperedLayers.length > 0 ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: 18, alignItems: "start", marginBottom: 18 }}>
        {/* Interactive Tree Map */}
        <div className="panel" style={{ padding: 24, textAlign: "center" }}>
          <div className="merkle-tree">
            {/* Level 0: Root */}
            <div className="tree-level root-level">
              <MerkleNode
                label="Merkle Root"
                hash={merkleRoot}
                status={tamperedLayers.length > 0 ? "tampered" : "verified"}
                onClick={() => handleNodeClick("Merkle Root", merkleRoot, tamperedLayers.length > 0 ? "Tampered" : "Verified", "Combines Hash A and Hash B. If either branch changes, this root hash changes.")}
              />
            </div>

            <div className="tree-connector" style={{ height: 24, width: 2, background: "var(--border)", margin: "8px auto" }} />

            {/* Level 1: Branches */}
            <div className="tree-level branch-level" style={{ display: "flex", justifyContent: "space-around", gap: 24 }}>
              <MerkleNode
                label="Branch A (Left)"
                hash={hashA}
                status="verified"
                onClick={() => handleNodeClick("Branch A (Left)", hashA, "Verified", "Left tree node. Aggregates hashes from Layers 1-4.")}
              />
              <MerkleNode
                label="Branch B (Right)"
                hash={hashB}
                status={tamperedLayers.length > 0 ? "tampered" : "verified"}
                onClick={() => handleNodeClick("Branch B (Right)", hashB, tamperedLayers.length > 0 ? "Tampered" : "Verified", "Right tree node. Aggregates hashes from Layers 5-8. Currently contains tampered layer weights.")}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 10%" }}>
              <div className="tree-connector-angle" style={{ height: 24, width: "40%", borderLeft: "2px solid var(--border)", borderTop: "2px solid var(--border)" }} />
              <div className="tree-connector-angle" style={{ height: 24, width: "40%", borderRight: "2px solid var(--border)", borderTop: "2px solid var(--border)" }} />
            </div>

            {/* Level 2: Leaves */}
            <div className="tree-level leaf-level" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 12 }}>
              {layers.map(l => (
                <MerkleNode
                  key={l.id}
                  label={`Layer ${l.id}`}
                  hash={l.hash}
                  status={l.status}
                  onClick={() => handleNodeClick(`Layer ${l.id}: ${l.name}`, l.hash, l.status === "tampered" ? "Tampered" : "Verified", `Leaf node weights size: ${l.size}. Tensor type: ${l.type}.`)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Node Inspection Panel */}
        <div className="panel" style={{ height: "100%", minHeight: 340, padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)" }}>
            <h3>Node Inspector</h3>
            <p className="sub">Click any tree node to inspect</p>
          </div>
          {selectedNode ? (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ color: "var(--cyan)", margin: "0 0 8px 0" }}>{selectedNode.label}</h4>
              <div style={{ marginBottom: 12 }}>
                <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)" }}>STATUS</span>
                <span style={{
                  color: selectedNode.status === "Tampered" ? "var(--red)" : "var(--green)",
                  fontWeight: 600, fontSize: 13
                }}>{selectedNode.status}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)" }}>FULL SHA-256 HASH</span>
                <code className="mono" style={{ display: "block", background: "var(--surface)", padding: 8, borderRadius: 4, fontSize: 11, wordBreak: "break-all" }}>
                  {selectedNode.hash}
                </code>
              </div>
              <div>
                <span className="eyebrow" style={{ display: "block", fontSize: 10, color: "var(--text-muted)" }}>RELATIONSHIP & ROLE</span>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, margin: "4px 0 0 0" }}>
                  {selectedNode.relation}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "220px", color: "var(--text-muted)", textAlign: "center" }}>
              <HelpCircle size={32} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 13 }}>Click a node in the tree diagram to view details.</p>
            </div>
          )}
        </div>
      </div>

      <div className="information-box" style={{ display: "flex", gap: 12, background: "var(--surface)", border: "1px solid var(--border)", padding: 16, borderRadius: "var(--radius-md)" }}>
        <Info size={24} style={{ color: "var(--cyan)", flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)" }}>
          <strong>Merkle Tree Principle:</strong> In ModelGuard, weights of each tensor layers are leaf nodes. If even one byte of weights in any layer is altered, its leaf hash changes. This triggers a cascading update up to parent branches and changes the root Merkle hash. This allows verified fast identification of exact modifications without sharing raw parameters.
        </p>
      </div>
    </div>
  );
}
