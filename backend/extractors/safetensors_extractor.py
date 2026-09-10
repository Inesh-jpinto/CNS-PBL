"""
extractors/safetensors_extractor.py

Extracts layer-level SHA-256 hashes from a Safetensors model file (.safetensors).

Safetensors is a safer alternative to PyTorch pickle format — it uses a simple
header + raw tensor bytes layout, making it easy and fast to read.

Strategy:
  - Use the safetensors library to load tensors
  - Iterate in deterministic sorted key order
  - SHA-256 raw tensor bytes (already raw in safetensors format)
"""

import hashlib
from pathlib import Path
from typing import List, Tuple


def extract(model_path: str) -> Tuple[List[str], List[str], str]:
    """
    Extract layer names and SHA-256 hashes from a Safetensors model.

    Returns:
        (layer_names, layer_hashes, model_format)
    """
    try:
        from safetensors import safe_open
    except ImportError:
        raise RuntimeError("safetensors is not installed. Run: pip install safetensors")

    path = Path(model_path)
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    layer_names: List[str] = []
    layer_hashes: List[str] = []

    # Open with framework="pt" for PyTorch tensors, or "numpy" for raw arrays
    with safe_open(str(path), framework="numpy") as f:
        keys = sorted(f.keys())  # deterministic order
        for key in keys:
            tensor = f.get_tensor(key)
            raw_bytes = tensor.tobytes()
            sha = hashlib.sha256(raw_bytes).hexdigest()
            layer_names.append(key)
            layer_hashes.append(sha)

    return layer_names, layer_hashes, "safetensors"
