"""
backend/security/dna.py

Generates a deterministic visual Model DNA Fingerprint from a Merkle Root.

Outputs:
  - fingerprint_id: "MG-A8F2-91C7-44DE"
  - grid: 5x5 matrix of cell intensity levels (0=dark, 1=cyan, 2=green, 3=purple, 4=amber)
"""

import hashlib
from typing import Dict, Any, List


def generate_model_dna(merkle_root: str) -> Dict[str, Any]:
    """Generate Model DNA fingerprint string and 5x5 color block matrix."""
    if not merkle_root:
        merkle_root = "0000000000000000000000000000000000000000000000000000000000000000"

    # Compute a secondary sha256 to ensure byte coverage
    h = hashlib.sha256(merkle_root.encode('utf-8')).hexdigest().upper()

    # Formatted Fingerprint ID: MG-XXXX-XXXX-XXXX
    fingerprint_id = f"MG-{h[0:4]}-{h[4:8]}-{h[8:12]}-{h[12:16]}"

    # Generate 5x5 grid values (0 to 4) using character hex values
    grid: List[List[int]] = []
    idx = 0
    for r in range(5):
        row = []
        for c in range(5):
            val = int(h[idx % len(h)], 16) % 5
            row.append(val)
            idx += 1
        grid.append(row)

    return {
        "fingerprint_id": fingerprint_id,
        "grid": grid,
        "raw_hash": merkle_root,
    }
