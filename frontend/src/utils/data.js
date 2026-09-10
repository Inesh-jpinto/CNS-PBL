/* ============================================================
   MODELGUARD — SHARED DEMO DATA
   ============================================================ */

export const initialLayers = [
  { id: 1, name: "embedding.weight", type: "Embedding", size: "24.4 MB", hash: "9f8a7c3e1b52d4a6f829ab31c842d75e8b6c40d28e4f19c2a76b53d901ef4521", status: "verified" },
  { id: 2, name: "encoder.layer.0.attention", type: "Attention", size: "18.2 MB", hash: "2ac8d61f9b34e7c2d18a95f63b0c7e14a28f9d51e3c47b62d91af05e8324cb76", status: "verified" },
  { id: 3, name: "encoder.layer.1.attention", type: "Attention", size: "18.2 MB", hash: "7be1c492ad8f30e6b1c2947f8d5e2a9b40c6d1e85f7a2b39c4d8e61f03a7b52d", status: "verified" },
  { id: 4, name: "encoder.layer.2.mlp", type: "MLP", size: "32.8 MB", hash: "4df3e9a8b21c76f5a9d3b72e8c1f40d5e9a6b3c7f1d82e49a7c5b01e8d3f6294", status: "verified" },
  { id: 5, name: "encoder.layer.3.attention", type: "Attention", size: "18.2 MB", hash: "e6b81f23a9cd4570b2f5e18a7c94d30f6a1b8e53c7d20f49a2e61c9b85d37f04", status: "verified" },
  { id: 6, name: "encoder.layer.4.mlp", type: "MLP", size: "32.8 MB", hash: "c13d8e7a4f09b562e8c1a7d3f94b20e5c61d8a2b7e40f93c5d1e86a29b74f30c", status: "verified" },
  { id: 7, name: "classifier.weight", type: "Linear", size: "8.4 MB", hash: "a4e5f9c78d20b631f9a2c4e71d85b30c6f1e8a29d4b70c53e6f2a9b81d34c75e", status: "verified" },
  { id: 8, name: "classifier.bias", type: "Bias", size: "0.02 MB", hash: "81f0d4b29ce763a5f2e8c1d97b40a6e3c5d19f72a8b64e30f1c9d5a27e83b64f", status: "verified" },
];

export const publishers = [
  { id: 1, name: "OpenAI Research", key: "ED25519:7c9a...4f21", models: 24, status: "Trusted", email: "security@openai.com", country: "USA", since: "2021-03-12" },
  { id: 2, name: "Hugging Face Verified", key: "RSA:2bd7...91aa", models: 148, status: "Trusted", email: "trust@huggingface.co", country: "USA", since: "2020-07-08" },
  { id: 3, name: "Google DeepMind Labs", key: "ED25519:8ef2...0c74", models: 39, status: "Trusted", email: "ai-safety@deepmind.com", country: "UK", since: "2022-01-20" },
  { id: 4, name: "Microsoft AI Research", key: "RSA:9e41...d2c8", models: 57, status: "Trusted", email: "msai@microsoft.com", country: "USA", since: "2021-09-05" },
  { id: 5, name: "Meta FAIR", key: "ED25519:1ab3...7de9", models: 31, status: "Trusted", email: "fair@meta.com", country: "USA", since: "2022-06-14" },
  { id: 6, name: "Anthropic Safety", key: "RSA:4bc8...2ef0", models: 12, status: "Trusted", email: "safety@anthropic.com", country: "USA", since: "2023-02-01" },
  { id: 7, name: "Unknown Lab X", key: "RSA:0000...dead", models: 3, status: "Unverified", email: "unknown@labx.io", country: "Unknown", since: "2024-11-01" },
];

export const initialHistory = [
  { id: 1, model: "bert-base-uncased", version: "v2.1.0", result: "PASSED", time: "Today, 10:42 AM", publisher: "Hugging Face Verified", score: 100 },
  { id: 2, model: "resnet50-production", version: "v1.4.2", result: "FAILED", time: "Today, 9:16 AM", publisher: "Unknown", score: 45 },
  { id: 3, model: "fraud-detector-v7", version: "v7.0.3", result: "PASSED", time: "Yesterday, 6:20 PM", publisher: "Microsoft AI Research", score: 98 },
  { id: 4, model: "llama-3-70b-instruct", version: "v3.1.0", result: "PASSED", time: "Yesterday, 2:05 PM", publisher: "Meta FAIR", score: 100 },
  { id: 5, model: "whisper-large-v3", version: "v3.0.0", result: "PASSED", time: "2 days ago", publisher: "OpenAI Research", score: 100 },
  { id: 6, model: "stable-diffusion-xl", version: "v1.0.0", result: "WARNING", time: "2 days ago", publisher: "Hugging Face Verified", score: 72 },
];

export const registeredModels = [
  { id: "llama-3-70b", name: "llama-3-70b-instruct", version: "v3.1.0", publisher: "Meta FAIR", framework: "PyTorch", size: "140 GB", status: "verified", fingerprint: "MG-7F2A-4BC9", lastVerified: "2 min ago", riskScore: 2 },
  { id: "stable-diffusion-xl", name: "stable-diffusion-xl", version: "v1.0.0", publisher: "Hugging Face Verified", framework: "SafeTensors", size: "7.5 GB", status: "scanning", fingerprint: "MG-2D8E-91FA", lastVerified: "Just now", riskScore: 15 },
  { id: "custom-fraud-detector", name: "custom-fraud-detector", version: "v7.0.3", publisher: "Unknown", framework: "ONNX", size: "320 MB", status: "tampered", fingerprint: "MG-C34B-06DE", lastVerified: "14 min ago", riskScore: 87 },
  { id: "whisper-large-v3", name: "whisper-large-v3", version: "v3.0.0", publisher: "OpenAI Research", framework: "PyTorch", size: "3.1 GB", status: "verified", fingerprint: "MG-A91C-5F02", lastVerified: "41 min ago", riskScore: 0 },
  { id: "bert-base-uncased", name: "bert-base-uncased", version: "v2.1.0", publisher: "Hugging Face Verified", framework: "PyTorch", size: "440 MB", status: "warning", fingerprint: "MG-E72D-3B88", lastVerified: "1 hr ago", riskScore: 28 },
  { id: "gpt-neo-2.7b", name: "gpt-neo-2.7b", version: "v1.0.0", publisher: "Hugging Face Verified", framework: "PyTorch", size: "10.7 GB", status: "verified", fingerprint: "MG-8BC1-F4E7", lastVerified: "3 hr ago", riskScore: 0 },
  { id: "resnet50-prod", name: "resnet50-production", version: "v1.4.2", publisher: "Unknown", framework: "TensorFlow", size: "102 MB", status: "tampered", fingerprint: "MG-D0A5-22C9", lastVerified: "5 hr ago", riskScore: 92 },
  { id: "codellama-34b", name: "codellama-34b-instruct", version: "v2.0.0", publisher: "Meta FAIR", framework: "PyTorch", size: "68.1 GB", status: "verified", fingerprint: "MG-3F94-8A1B", lastVerified: "1 day ago", riskScore: 0 },
];

export const activityFeed = [
  { id: 1, type: "verified", title: "Model Verified", detail: "llama-3-70b-instruct passed full verification", time: "2 min ago", icon: "check" },
  { id: 2, type: "scan", title: "Scan Started", detail: "stable-diffusion-xl queued for layer hashing", time: "5 min ago", icon: "scan" },
  { id: 3, type: "tamper", title: "Tampering Detected", detail: "custom-fraud-detector — layer 4 hash mismatch", time: "14 min ago", icon: "alert" },
  { id: 4, type: "publisher", title: "Publisher Trusted", detail: "Google DeepMind Labs key verified", time: "30 min ago", icon: "key" },
  { id: 5, type: "verified", title: "Certificate Issued", detail: "whisper-large-v3 certificate #MG-9821", time: "41 min ago", icon: "certificate" },
  { id: 6, type: "warning", title: "Signature Warning", detail: "bert-base-uncased — signature expiring in 7 days", time: "1 hr ago", icon: "warning" },
  { id: 7, type: "report", title: "Report Generated", detail: "Security report for batch-2 models downloaded", time: "2 hr ago", icon: "report" },
  { id: 8, type: "verified", title: "Registry Updated", detail: "codellama-34b-instruct registered in model registry", time: "1 day ago", icon: "check" },
];

export const verificationLogs = [
  { id: 1, ts: "2026-08-31 10:42:03", op: "SHA256", model: "bert-base-uncased", layer: "All layers", result: "PASS", hash: "9f8a7c3e...", note: "All 8 layer hashes verified" },
  { id: 2, ts: "2026-08-31 10:42:04", op: "MERKLE", model: "bert-base-uncased", layer: "Root", result: "PASS", hash: "a3f9c1b2...", note: "Merkle root matches manifest" },
  { id: 3, ts: "2026-08-31 10:42:05", op: "SIGNATURE", model: "bert-base-uncased", layer: "Manifest", result: "PASS", hash: "ED25519:ok", note: "Publisher signature valid" },
  { id: 4, ts: "2026-08-31 09:16:11", op: "SHA256", model: "resnet50-production", layer: "layer.3.conv", result: "FAIL", hash: "d4e1c7a2...", note: "Hash mismatch vs manifest" },
  { id: 5, ts: "2026-08-31 09:16:12", op: "MERKLE", model: "resnet50-production", layer: "Root", result: "FAIL", hash: "b7f3a921...", note: "Root changed — tampering confirmed" },
  { id: 6, ts: "2026-08-30 18:20:30", op: "SHA256", model: "fraud-detector-v7", layer: "All layers", result: "PASS", hash: "7cd3f2a1...", note: "All 12 layers verified" },
  { id: 7, ts: "2026-08-30 18:20:31", op: "SIGNATURE", model: "fraud-detector-v7", layer: "Manifest", result: "PASS", hash: "RSA:ok", note: "Microsoft key verified" },
];

export const provenanceChain = [
  { id: 1, event: "Model Created", actor: "Meta FAIR", timestamp: "2024-04-15 09:00 UTC", hash: "genesis:4a2b...", note: "Initial model weights trained" },
  { id: 2, event: "Fine-tuned", actor: "Hugging Face Verified", timestamp: "2024-06-01 14:22 UTC", hash: "ft:8c1d...", note: "RLHF fine-tuning applied" },
  { id: 3, event: "Manifest Signed", actor: "Meta FAIR", timestamp: "2024-06-10 11:05 UTC", hash: "sig:ED25519:7a3f...", note: "Publisher signature attached" },
  { id: 4, event: "Published to Registry", actor: "ModelGuard Registry", timestamp: "2024-06-11 08:00 UTC", hash: "reg:2bc9...", note: "Model hash registered on-chain" },
  { id: 5, event: "Verified by ModelGuard", actor: "ModelGuard Engine", timestamp: "2026-08-31 10:42 UTC", hash: "verify:9f8a...", note: "Full verification passed" },
];

export const modelVersions = [
  { version: "v3.1.0", date: "2026-08-15", status: "verified", changes: "RLHF alignment update, 2 attention layers modified", hash: "a3f9c1b2...", size: "140 GB" },
  { version: "v3.0.0", date: "2026-06-01", status: "verified", changes: "Initial LLaMA-3 release", hash: "8d2e7f4a...", size: "140 GB" },
  { version: "v2.5.0", date: "2025-12-10", status: "warning", changes: "Experimental safety patch (unverified publisher)", hash: "3bc9d0a1...", size: "140 GB" },
  { version: "v2.0.0", date: "2025-06-30", status: "verified", changes: "Base model weights update", hash: "f7a4c3e2...", size: "135 GB" },
];
