"""
backend/app.py — ModelGuard FastAPI Backend

Endpoints:
  POST /api/verify   — upload model + manifest → run Java verifier → return result JSON
  POST /api/publish  — upload model → run Java publisher → return manifest JSON
  GET  /api/public-key — return trusted public key (base64 PEM)
  GET  /api/health   — health check

The Java crypto service is invoked via subprocess for each operation.
Temp files are cleaned up after each request.
"""

import json
import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from extractors import get_extractor

# ─── Configuration ─────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent.parent          # d:\CNS_PBL\
JAVA_OUT = BASE_DIR / "crypto-java" / "out"
JAVA_LIB = BASE_DIR / "crypto-java" / "lib"
KEYS_DIR = BASE_DIR / "publisher" / "keys"
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

JAVA_CP = f"{JAVA_OUT};{JAVA_LIB}\\*"           # Windows classpath separator
PUBLISHER_NAME = "ModelGuard Team"

# ─── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="ModelGuard API",
    description="AI Model Integrity & Provenance Verification",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Helpers ───────────────────────────────────────────────────────────────────

def run_java(args: list[str], timeout: int = 120) -> tuple[str, str, int]:
    """Run Java crypto service and return (stdout, stderr, returncode)."""
    cmd = ["java", "-cp", JAVA_CP, "modelguard.Main"] + args
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    return result.stdout, result.stderr, result.returncode


def save_upload(upload: UploadFile, dest_dir: Path, suffix: str = "") -> Path:
    """Save an uploaded file to dest_dir and return its path."""
    ext = Path(upload.filename).suffix if upload.filename else suffix
    dest = dest_dir / f"{uuid.uuid4().hex}{ext}"
    with open(dest, "wb") as f:
        shutil.copyfileobj(upload.file, f)
    return dest


def extract_to_json(model_path: Path, tmp_dir: Path) -> Path:
    """Run the appropriate extractor and write layer hashes JSON. Return its path."""
    extractor = get_extractor(model_path.name)
    layer_names, layer_hashes, model_format = extractor(str(model_path))

    hashes_data = {
        "model_format": model_format,
        "layer_names": layer_names,
        "layer_hashes": layer_hashes,
    }
    hashes_path = tmp_dir / "layer_hashes.json"
    hashes_path.write_text(json.dumps(hashes_data, indent=2))
    return hashes_path


# ─── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ModelGuard API"}


@app.post("/api/keygen")
def generate_keys():
    """
    Generate a fresh RSA-2048 key pair and persist it to publisher/keys/.
    Returns the public key content (never returns the private key over the API).
    """
    try:
        KEYS_DIR.mkdir(parents=True, exist_ok=True)
        stdout, stderr, rc = run_java(["keygen", str(KEYS_DIR)])
        if rc != 0:
            raise HTTPException(status_code=500, detail=f"Key generation failed: {stderr}")

        pub_key_path = KEYS_DIR / "public_key.pem"
        if not pub_key_path.exists():
            raise HTTPException(status_code=500, detail="Key generation succeeded but public_key.pem not found.")

        return {
            "success": True,
            "message": "RSA-2048 key pair generated and stored on server.",
            "public_key_pem": pub_key_path.read_text(),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/elgamal-selftest")
def elgamal_selftest(bit_length: int = 512):
    """
    Run the ElGamal signature self-test via the Java crypto service.
    Returns pass/fail and raw stdout from the Java process.

    Query params:
      bit_length: prime size in bits (default 512; use 1024 for stronger test)
    """
    if bit_length not in (256, 512, 1024, 2048):
        raise HTTPException(status_code=400, detail="bit_length must be one of: 256, 512, 1024, 2048")

    stdout, stderr, rc = run_java(["elgamal-selftest", str(bit_length)], timeout=60)
    return {
        "success": rc == 0,
        "bit_length": bit_length,
        "result": "PASSED" if rc == 0 else "FAILED",
        "output": stdout.strip(),
        "error": stderr.strip() if rc != 0 else "",
    }


@app.post("/api/run-tests")
def run_tests(suite: str = "all"):
    """
    Run the Java unit test suites (merkle / elgamal / tamper / all).
    Returns the combined stdout output.
    """
    allowed = {"merkle", "elgamal", "tamper", "all"}
    if suite not in allowed:
        raise HTTPException(status_code=400, detail=f"suite must be one of: {allowed}")

    mode = f"test-{suite}"
    stdout, stderr, rc = run_java([mode], timeout=180)
    return {
        "success": rc == 0,
        "suite": suite,
        "output": stdout.strip(),
        "error": stderr.strip() if rc != 0 else "",
    }


@app.get("/api/public-key")
def get_public_key():
    """Return the trusted publisher public key as base64-encoded PEM."""
    pub_key_path = KEYS_DIR / "public_key.pem"
    if not pub_key_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Public key not found. Run publisher/generate_keys.py first.",
        )
    pem_content = pub_key_path.read_text()
    return {"public_key_pem": pem_content}


@app.post("/api/publish")
async def publish_model(
    model: UploadFile = File(..., description="AI model file (.pt, .pth, .safetensors, .onnx)"),
    publisher_name: Optional[str] = Form(default=PUBLISHER_NAME),
):
    """
    Publish a model: extract layers → build Merkle Tree → RSA sign → return manifest.
    """
    tmp_dir = Path(tempfile.mkdtemp(dir=UPLOADS_DIR))
    try:
        # 1. Save uploaded model
        model_path = save_upload(model, tmp_dir)

        # 2. Extract layer hashes
        try:
            hashes_path = extract_to_json(model_path, tmp_dir)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Extraction error: {e}")

        # 3. Check private key exists
        private_key_path = KEYS_DIR / "private_key.pem"
        if not private_key_path.exists():
            raise HTTPException(
                status_code=500,
                detail="Private key not found. Run publisher/generate_keys.py first.",
            )

        # 4. Run Java publisher
        manifest_path = tmp_dir / "manifest.json"
        stdout, stderr, rc = run_java([
            "publish",
            str(hashes_path),
            str(private_key_path),
            publisher_name or PUBLISHER_NAME,
            str(manifest_path),
        ])

        if rc != 0:
            raise HTTPException(status_code=500, detail=f"Java publish failed: {stderr}")

        # 5. Return manifest
        manifest_data = json.loads(manifest_path.read_text())
        return JSONResponse(content={
            "success": True,
            "manifest": manifest_data,
            "manifest_json": manifest_path.read_text(),
        })

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.post("/api/verify")
async def verify_model(
    model: UploadFile = File(..., description="AI model file to verify"),
    manifest: UploadFile = File(..., description="Security manifest JSON"),
):
    """
    Verify a model against its manifest:
      1. Extract layer hashes from uploaded model
      2. Run Java verifier (Merkle + RSA signature check)
      3. Return detailed verification result
    """
    tmp_dir = Path(tempfile.mkdtemp(dir=UPLOADS_DIR))
    try:
        # 1. Save uploads
        model_path = save_upload(model, tmp_dir)
        manifest_path = save_upload(manifest, tmp_dir, suffix=".json")

        # 2. Extract layer hashes from uploaded model
        try:
            hashes_path = extract_to_json(model_path, tmp_dir)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Extraction error: {e}")

        # 3. Check public key exists
        public_key_path = KEYS_DIR / "public_key.pem"
        if not public_key_path.exists():
            raise HTTPException(
                status_code=500,
                detail="Public key not found. Run publisher/generate_keys.py first.",
            )

        # 4. Run Java verifier
        result_path = tmp_dir / "result.json"
        stdout, stderr, rc = run_java([
            "verify",
            str(manifest_path),
            str(hashes_path),
            str(public_key_path),
            str(result_path),
        ])

        if rc != 0:
            raise HTTPException(status_code=500, detail=f"Java verify failed: {stderr}")

        # 5. Return result
        result_data = json.loads(result_path.read_text())
        return JSONResponse(content={"success": True, "result": result_data})

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
