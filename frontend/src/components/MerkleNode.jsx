import { useState } from "react";
import { shortenHash } from "../utils/crypto";

export default function MerkleNode({ label, hash, status, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`merkle-node ${status === "tampered" ? "tampered" : "verified"}${onClick ? " clickable" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={onClick ? { cursor: "pointer" } : {}}
    >
      <strong>{label}</strong>
      <code>{hovered && hash ? hash : shortenHash(hash, 8)}</code>
    </div>
  );
}
