"""
extractors/onnx_extractor.py

Extracts layer-level SHA-256 hashes from an ONNX model file (.onnx).

Strategy:
  - Load the ONNX model using onnx library
  - Extract initializers (the trained weight tensors embedded in the graph)
  - Sort by name for deterministic order
  - Convert each initializer to numpy via onnx.numpy_helper.to_array()
  - SHA-256 raw bytes
"""

import hashlib
from pathlib import Path
from typing import List, Tuple


def extract(model_path: str) -> Tuple[List[str], List[str], str]:
    """
    Extract layer names and SHA-256 hashes from an ONNX model.

    Returns:
        (layer_names, layer_hashes, model_format)
    """
    try:
        import onnx
        from onnx import numpy_helper
    except ImportError:
        raise RuntimeError("onnx is not installed. Run: pip install onnx")

    path = Path(model_path)
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    model = onnx.load(str(path))

    # Initializers are the weight tensors stored in the ONNX graph
    initializers = sorted(model.graph.initializer, key=lambda t: t.name)

    if not initializers:
        raise ValueError("No initializers (weight tensors) found in ONNX model")

    layer_names: List[str] = []
    layer_hashes: List[str] = []

    for init in initializers:
        arr = numpy_helper.to_array(init)
        raw_bytes = arr.tobytes()
        sha = hashlib.sha256(raw_bytes).hexdigest()
        layer_names.append(init.name)
        layer_hashes.append(sha)

    return layer_names, layer_hashes, "onnx"
