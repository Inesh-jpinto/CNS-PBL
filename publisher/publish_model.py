"""
publisher/publish_model.py

Creates a small demo PyTorch model and publishes it:
  1. Creates a 3-layer MLP (tiny — fast to hash)
  2. Saves it as original_model.pth
  3. Extracts layer hashes via the PyTorch extractor
  4. Calls Java publisher to build Merkle Tree + RSA sign
  5. Saves model_manifest.json

This is the "Case 1 — Clean Model" demo artifact.

Usage:
    python publisher/publish_model.py
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
JAVA_OUT = BASE_DIR / "crypto-java" / "out"
JAVA_LIB = BASE_DIR / "crypto-java" / "lib"
KEYS_DIR = BASE_DIR / "publisher" / "keys"
PUBLISHER_DIR = BASE_DIR / "publisher"
JAVA_CP = f"{JAVA_OUT};{JAVA_LIB}\\*"

# Add backend to path so we can use extractors
sys.path.insert(0, str(BASE_DIR / "backend"))
from extractors.pytorch_extractor import extract


def create_demo_model(output_path: Path):
    """Create a tiny 3-layer MLP and save it."""
    try:
        import torch
        import torch.nn as nn
    except ImportError:
        print("ERROR: PyTorch not installed. Run: pip install torch")
        sys.exit(1)

    class TinyMLP(nn.Module):
        def __init__(self):
            super().__init__()
            self.fc1 = nn.Linear(64, 128)
            self.fc2 = nn.Linear(128, 64)
            self.fc3 = nn.Linear(64, 10)

        def forward(self, x):
            import torch.nn.functional as F
            x = F.relu(self.fc1(x))
            x = F.relu(self.fc2(x))
            return self.fc3(x)

    model = TinyMLP()
    torch.save(model.state_dict(), output_path)
    print(f"[Demo] Model saved: {output_path}")
    return model


def main():
    print("=" * 55)
    print("  ModelGuard — Demo Model Publisher")
    print("=" * 55)

    # Check keys exist
    private_key = KEYS_DIR / "private_key.pem"
    if not private_key.exists():
        print("ERROR: No private key found. Run publisher/generate_keys.py first.")
        sys.exit(1)

    # 1. Create demo model
    model_path = PUBLISHER_DIR / "original_model.pth"
    create_demo_model(model_path)

    # 2. Extract layer hashes
    print("\n[Extractor] Computing SHA-256 for each layer...")
    layer_names, layer_hashes, model_format = extract(str(model_path))
    print(f"[Extractor] {len(layer_names)} layers found")
    for i, (name, h) in enumerate(zip(layer_names, layer_hashes)):
        print(f"  Layer {i+1}: {name} -> {h[:16]}...")


    hashes_data = {
        "model_format": model_format,
        "layer_names": layer_names,
        "layer_hashes": layer_hashes,
    }

    # Write hashes to temp file for Java
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(hashes_data, f)
        hashes_tmp = f.name

    manifest_path = PUBLISHER_DIR / "model_manifest.json"

    # 3. Call Java publisher
    print("\n[Java] Building Merkle Tree & signing...")
    cmd = [
        "java", "-cp", JAVA_CP, "modelguard.Main",
        "publish",
        hashes_tmp,
        str(private_key),
        "ModelGuard Team",
        str(manifest_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    os.unlink(hashes_tmp)

    if result.returncode != 0:
        print("ERROR:", result.stderr)
        sys.exit(1)

    print(result.stdout)

    # 4. Show manifest summary
    manifest = json.loads(manifest_path.read_text())
    print("\n[OK] Model published successfully!")
    print(f"   Model:        {model_path}")
    print(f"   Manifest:     {manifest_path}")
    print(f"   Merkle Root:  {manifest['merkle_root'][:32]}...")
    print(f"   Signature:    {manifest['signature'][:32]}...")
    print(f"   Layers:       {manifest['layer_count']}")
    print(f"   Publisher:    {manifest['publisher']}")


if __name__ == "__main__":
    main()
