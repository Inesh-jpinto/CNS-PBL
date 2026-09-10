"""
publisher/tamper_model.py

Creates a tampered copy of original_model.pth for demo purposes.

Strategy:
  - Load the original state_dict
  - Modify the SECOND layer's weights by adding a small random perturbation
  - Save as tampered_model.pth

This simulates an attacker who slightly modified model weights
(e.g., to inject a backdoor or change model behavior).

When uploaded to ModelGuard with the original manifest, the verification
will catch the exact tampered layer.

Usage:
    python publisher/tamper_model.py
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
PUBLISHER_DIR = BASE_DIR / "publisher"


def main():
    print("=" * 55)
    print("  ModelGuard — Tampered Model Generator")
    print("=" * 55)

    try:
        import torch
    except ImportError:
        print("ERROR: PyTorch not installed. Run: pip install torch")
        sys.exit(1)

    original_path = PUBLISHER_DIR / "original_model.pth"
    tampered_path = PUBLISHER_DIR / "tampered_model.pth"

    if not original_path.exists():
        print(f"ERROR: {original_path} not found. Run publish_model.py first.")
        sys.exit(1)

    # Load original state dict
    state_dict = torch.load(str(original_path), map_location="cpu", weights_only=True)

    # Sort keys to pick a specific layer
    keys = sorted(state_dict.keys())
    print(f"\nLayers: {keys}")

    # Tamper: pick the second layer weight tensor (index 1)
    target_key = keys[1] if len(keys) > 1 else keys[0]
    print(f"\n[Tamper] Modifying layer: '{target_key}'")

    original_tensor = state_dict[target_key].clone()
    print(f"[Tamper] Original shape: {original_tensor.shape}")
    print(f"[Tamper] Original values (first 5): {original_tensor.flatten()[:5].tolist()}")

    # Add a small perturbation — simulates a subtle backdoor injection
    perturbation = torch.randn_like(original_tensor) * 0.01
    state_dict[target_key] = original_tensor + perturbation

    print(f"[Tamper] Modified values (first 5): {state_dict[target_key].flatten()[:5].tolist()}")

    # Save tampered model
    torch.save(state_dict, str(tampered_path))

    print(f"\n[TAMPERED] Tampered model saved: {tampered_path}")
    print(f"   Modified layer: '{target_key}'")
    print(f"\nDemo: Upload tampered_model.pth with model_manifest.json")
    print(f"      -> ModelGuard should detect: REJECTED, Changed Layer: '{target_key}'")


if __name__ == "__main__":
    main()
