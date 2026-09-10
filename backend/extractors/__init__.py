"""
extractors/__init__.py
Dispatches to the correct model extractor based on file extension.
"""

import os
from pathlib import Path


def get_extractor(filename: str):
    """Return the appropriate extractor module for the given filename."""
    ext = Path(filename).suffix.lower()
    if ext in (".pt", ".pth"):
        from extractors.pytorch_extractor import extract
        return extract
    elif ext == ".safetensors":
        from extractors.safetensors_extractor import extract
        return extract
    elif ext == ".onnx":
        from extractors.onnx_extractor import extract
        return extract
    else:
        raise ValueError(
            f"Unsupported model format: '{ext}'. "
            f"Supported: .pt, .pth, .safetensors, .onnx"
        )
