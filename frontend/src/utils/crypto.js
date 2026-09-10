/* ============================================================
   MODELGUARD — CRYPTO UTILITIES
   ============================================================ */

/**
 * Generate a demo SHA-256 style 64-character hex hash.
 * Deterministic based on seed string.
 */
export function generateDemoHash(seed) {
  const characters = "abcdef0123456789";
  let hash = "";
  for (let i = 0; i < 64; i++) {
    const charCode = seed.charCodeAt(i % seed.length);
    const position = (charCode * (i + 13) + i * 17) % characters.length;
    hash += characters[position];
  }
  return hash;
}

/**
 * Shorten a hash for display.
 */
export function shortenHash(hash, length = 12) {
  if (!hash) return "No hash";
  return `${hash.slice(0, length)}...${hash.slice(-8)}`;
}

/**
 * Detect AI model type from file extension.
 */
export function detectModelType(fileName) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const map = {
    pt: "PyTorch Model",
    pth: "PyTorch Checkpoint",
    h5: "TensorFlow H5",
    keras: "Keras Model",
    onnx: "ONNX Model",
    safetensors: "SafeTensors",
    bin: "Binary Model",
    pkl: "Pickle Model",
    pb: "TensorFlow SavedModel",
  };
  return map[ext] || "Unknown AI Model";
}

/**
 * Generate a unique model fingerprint string.
 */
export function generateFingerprint(modelName, merkleRoot) {
  const seed = `${modelName}-${merkleRoot}`;
  const raw = generateDemoHash(seed);
  return `MG-${raw.slice(0, 4).toUpperCase()}${raw.slice(4, 8).toUpperCase()}-${raw.slice(8, 12).toUpperCase()}`;
}

/**
 * Calculate a risk score (0-100) based on verification state.
 */
export function calcRiskScore(tamperedCount, totalLayers, signatureValid) {
  const layerScore = Math.round((tamperedCount / Math.max(totalLayers, 1)) * 60);
  const sigScore = signatureValid ? 0 : 30;
  return Math.min(layerScore + sigScore, 100);
}

/**
 * Calculate a confidence score (0-100) — inverse of risk.
 */
export function calcConfidenceScore(tamperedCount, totalLayers, signatureValid) {
  return 100 - calcRiskScore(tamperedCount, totalLayers, signatureValid);
}
