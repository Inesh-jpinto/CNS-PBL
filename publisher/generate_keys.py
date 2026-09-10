"""
publisher/generate_keys.py

Generates an RSA-2048 key pair using the Java crypto service.
Keys are saved to publisher/keys/private_key.pem and public_key.pem.

Run this ONCE before publishing any models.
The public key is stored server-side and used for all verifications.
The private key is kept SECRET — only the publisher uses it to sign manifests.

Usage:
    python publisher/generate_keys.py
"""

import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
JAVA_OUT = BASE_DIR / "crypto-java" / "out"
JAVA_LIB = BASE_DIR / "crypto-java" / "lib"
KEYS_DIR = BASE_DIR / "publisher" / "keys"
JAVA_CP = f"{JAVA_OUT};{JAVA_LIB}\\*"


def main():
    print("=" * 50)
    print("  ModelGuard — RSA Key Generation")
    print("=" * 50)

    KEYS_DIR.mkdir(parents=True, exist_ok=True)

    cmd = ["java", "-cp", JAVA_CP, "modelguard.Main", "keygen", str(KEYS_DIR)]
    print(f"Running: {' '.join(cmd)}\n")

    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print("ERROR:", result.stderr)
        sys.exit(1)

    print("\n[OK] Keys generated successfully!")
    print(f"   Private key: {KEYS_DIR / 'private_key.pem'}")
    print(f"   Public key:  {KEYS_DIR / 'public_key.pem'}")
    print("\n[WARNING] KEEP private_key.pem SECRET. Never share or upload it.")


if __name__ == "__main__":
    main()
