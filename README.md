# ModelGuard — AI Model Integrity & Provenance Verification

**ModelGuard** is a cryptographic chain-of-custody system for AI models.
A publisher seals a model with SHA-256 layer hashes → Merkle Tree → RSA signature.
Anyone can verify the model before inference to confirm it is authentic and unmodified.

---

## Quick Start (All 3 servers in 3 terminals)

### Terminal 1 — Backend (Python FastAPI)
```powershell
cd d:\CNS_PBL\backend
python -m uvicorn app:app --reload --port 8000
```
API available at: http://localhost:8000  
API docs at:      http://localhost:8000/docs

---

### Terminal 2 — Frontend (React + Vite)
```powershell
cd d:\CNS_PBL\frontend
npm run dev
```
Website at: http://localhost:5173

---

### Terminal 3 — Demo Setup (run once)

**Step 1: Generate RSA key pair**
```powershell
cd d:\CNS_PBL
python publisher/generate_keys.py
```

**Step 2: Create & publish demo model**
```powershell
python publisher/publish_model.py
```
Creates: `publisher/original_model.pth` + `publisher/model_manifest.json`

**Step 3: Create tampered model**
```powershell
python publisher/tamper_model.py
```
Creates: `publisher/tampered_model.pth`

---

## Java Crypto Service (run from crypto-java/)

The Java service is called automatically by the Python backend via subprocess.
You can also run it directly:

**Compile:**
```powershell
cd d:\CNS_PBL\crypto-java
javac -cp "lib\json-simple-1.1.1.jar" -d out src\main\java\modelguard\*.java
```

**Generate keys:**
```powershell
java -cp "out;lib\json-simple-1.1.1.jar" modelguard.Main keygen d:\CNS_PBL\publisher\keys
```

**Publish:**
```powershell
java -cp "out;lib\json-simple-1.1.1.jar" modelguard.Main publish ^
  path\to\layer_hashes.json ^
  d:\CNS_PBL\publisher\keys\private_key.pem ^
  "ModelGuard Team" ^
  path\to\manifest.json
```

**Verify:**
```powershell
java -cp "out;lib\json-simple-1.1.1.jar" modelguard.Main verify ^
  path\to\manifest.json ^
  path\to\recomputed_hashes.json ^
  d:\CNS_PBL\publisher\keys\public_key.pem ^
  path\to\result.json
```

---

## Demo Cases (for presentation)

| Case | Model | Manifest | Expected Result |
|------|-------|----------|-----------------|
| 1 — Clean | `original_model.pth` | `model_manifest.json` | ✅ VERIFIED |
| 2 — Tampered | `tampered_model.pth` | `model_manifest.json` | ❌ REJECTED — Layer: `fc1.weight` |
| 3 — Wrong key | `original_model.pth` | manifest signed w/ different key | ❌ Signature Invalid |

---

## Architecture

```
Publisher → SHA-256 each layer → Merkle Tree → RSA sign root → Manifest JSON
                                                                       ↓
User uploads model + manifest → Recompute hashes → Verify signature → VERIFIED / REJECTED
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | Vanilla CSS (dark theme) |
| Backend | Python FastAPI |
| Crypto | Java (SHA-256, Merkle Tree, RSA-2048) |
| Extractors | PyTorch, Safetensors, ONNX |

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer and npm
- Java JDK 11 or newer (`java` and `javac` on `PATH`)

Install the backend dependencies from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
```

Install the frontend dependencies:

```powershell
cd frontend
npm install
cd ..
```

The Java dependency `crypto-java/lib/json-simple-1.1.1.jar` is included in the repository. Compile the Java classes before starting the backend:

```powershell
cd crypto-java
New-Item -ItemType Directory -Force out
javac -cp "lib\json-simple-1.1.1.jar" -d out src\main\java\modelguard\*.java
cd ..
```

## Important Security Notes

- Never commit `publisher/keys/private_key.pem`. It is ignored by the repository and must be generated locally.
- Model weights, uploads, manifests, Java build output, and local environments are generated artifacts and are ignored by default.
- After cloning, generate a new key pair and run the demo publishing steps to create a local manifest.
- Do not use the demo RSA key for production or share it between collaborators.

## GitHub Collaboration

### Create the repository

1. On GitHub, choose **New repository**. Create it empty: do not add a README, `.gitignore`, or license because this project already has them.
2. From this project folder, run:

```powershell
git init
git add .
git status
git commit -m "Initial project setup"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with the repository URL from GitHub. Before committing, confirm that `git status` does not list private keys, model files, `.venv`, or `node_modules`.

### Add a collaborator

1. Open the GitHub repository and go to **Settings -> Collaborators -> Add people**.
2. Enter the collaborator's GitHub username or email and choose the appropriate permission level.
3. The collaborator accepts the invitation, then clones the repository:

```powershell
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
```

Each collaborator should create their own virtual environment, install dependencies, compile Java, generate local keys, and use a separate feature branch:

```powershell
git switch -c feature/short-description
# make and test changes
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

Then open a pull request on GitHub for review before merging into `main`.
