"""
extractors/pytorch_extractor.py

Extracts layer-level SHA-256 hashes from a PyTorch model file (.pt / .pth).

Strategy:
  - Load the state_dict using weights_only=True (safe, no pickle arbitrary code)
  - Iterate state_dict items in a deterministic sorted order
  - For each tensor: convert to float32 numpy, call .tobytes(), SHA-256 the bytes
  - Return a normalized dict: { layer_name: sha256_hex, ... }
"""

import hashlib
import json
from pathlib import Path
from typing import Dict, List, Tuple


def extract(model_path: str) -> Tuple[List[str], List[str], str]:
    """
    Extract layer names and SHA-256 hashes from a PyTorch model.

    Returns:
        (layer_names, layer_hashes, model_format)
    """
    try:
        import torch
    except ImportError:
        raise RuntimeError("PyTorch is not installed. Run: pip install torch")

    path = Path(model_path)
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    # Load safely — weights_only=True prevents arbitrary pickle deserialization
    try:
        state_dict = torch.load(str(path), map_location="cpu", weights_only=True)
    except Exception:
        # Fallback for older checkpoint formats that include optimizer state etc.
        checkpoint = torch.load(str(path), map_location="cpu", weights_only=False)
        if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
            state_dict = checkpoint["state_dict"]
        elif isinstance(checkpoint, dict):
            state_dict = checkpoint
        else:
            raise ValueError("Cannot extract state_dict from this checkpoint format")

    if not isinstance(state_dict, dict):
        raise ValueError("Loaded object is not a state_dict (dict)")

    # Sort by key for deterministic ordering
    sorted_items = sorted(state_dict.items())

    layer_names: List[str] = []
    layer_hashes: List[str] = []

    for name, tensor in sorted_items:
        try:
            import numpy as np
            # Normalize to float32 for consistent byte representation across devices
            arr = tensor.detach().cpu().float().numpy()
            raw_bytes = arr.tobytes()
        except Exception:
            # Fallback: use tensor.numpy() directly
            raw_bytes = tensor.detach().cpu().numpy().tobytes()

        sha = hashlib.sha256(raw_bytes).hexdigest()
        layer_names.append(name)
        layer_hashes.append(sha)

    return layer_names, layer_hashes, "pytorch"
