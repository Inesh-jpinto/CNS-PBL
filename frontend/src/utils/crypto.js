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

/**
 * Generate a unique, persistent random tamper percentage strictly between 5.0% and 20.0%
 * with decimal (e.g. 16.3%, 19.2%, 8.1%) for any corrupted file.
 * Deterministic based on model name/id so each corrupted file gets its own unique number
 * and follows it everywhere across the project.
 */
export function getTamperPercentageForModel(modelOrName) {
  if (!modelOrName) return 16.3;
  const str = typeof modelOrName === "string"
    ? modelOrName
    : (modelOrName.fileName || modelOrName.name || (modelOrName.id ? `id_${modelOrName.id}` : "corrupted_file"));
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xFFFFFFFF;
  }
  const pseudo = Math.abs((Math.sin(hash * 99991 + 12345) * 43758.5453123) % 1);
  let val = Number((5.2 + pseudo * 14.4).toFixed(1));
  if (val <= 5.0) val = 5.3;
  if (val >= 20.0) val = 19.7;
  return val;
}

