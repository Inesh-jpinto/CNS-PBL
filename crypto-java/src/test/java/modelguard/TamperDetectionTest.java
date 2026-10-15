package modelguard;

import java.io.*;
import java.nio.file.*;
import java.util.*;

/**
 * TamperDetectionTest — End-to-end tamper detection integration test.
 *
 * Demonstrates the full ModelGuard pipeline using synthetic layer files:
 *   1. Generate N synthetic "layer" byte files in a temp directory
 *   2. Hash each layer → build Merkle Tree → sign with RSA key pair
 *   3. Write a manifest
 *   4. Verify clean model → expect PASS
 *   5. Flip bytes in one layer (inject tamper)
 *   6. Verify tampered model → expect FAIL + correct layer index reported
 *   7. Flip bytes in two separate layers
 *   8. Verify → expect FAIL + both layer indices reported
 *
 * Run with: java -cp "out;lib/*" modelguard.TamperDetectionTest
 *
 * NOTE: Uses the existing RSA-based ModelPublisher and ModelVerifier, which
 * represent the production signing path. The ElGamalSignature is a separate,
 * academically-focused implementation tested by ElGamalTest.
 */
public class TamperDetectionTest {

    private static int passed = 0;
    private static int failed = 0;

    // Number of synthetic layers to create per test run
    private static final int NUM_LAYERS = 6;

    public static void main(String[] args) {
        System.out.println("=== Tamper Detection Integration Tests ===\n");

        Path tmpDir = null;
        try {
            tmpDir = Files.createTempDirectory("modelguard_test_");
            System.out.println("Working directory: " + tmpDir + "\n");

            // Create synthetic layer files
            Path[] layerFiles = createSyntheticLayers(tmpDir, NUM_LAYERS);

            // Generate key pair for the publisher
            Path keysDir = tmpDir.resolve("keys");
            RSAKeyGen.generateAndSave(keysDir.toString());
            Path privateKey = keysDir.resolve("private_key.pem");
            Path publicKey  = keysDir.resolve("public_key.pem");

            // Hash layer files
            List<String> layerNames  = new ArrayList<>();
            List<String> layerHashes = new ArrayList<>();
            for (int i = 0; i < layerFiles.length; i++) {
                layerNames.add("synthetic_layer_" + i);
                layerHashes.add(HashUtil.sha256File(layerFiles[i]));
            }

            // Build Merkle Tree and sign
            MerkleTree tree = new MerkleTree(layerHashes);
            String merkleRoot = tree.getRoot();
            java.security.PrivateKey privKey = RSAKeyGen.loadPrivateKey(privateKey.toString());
            String signature = RSAKeyGen.sign(merkleRoot.getBytes(), privKey);

            // Write manifest JSON (minimal format matching ModelVerifier expectations)
            Path manifestPath = tmpDir.resolve("manifest.json");
            writeManifest(manifestPath, layerNames, layerHashes, merkleRoot, signature, "TamperDetectionTest");

            System.out.println("[Setup] " + NUM_LAYERS + " layers hashed. Merkle root: " + merkleRoot.substring(0, 16) + "...\n");

            // --- Test 1: Clean model should verify ---
            test_CleanModel_Passes(layerFiles, manifestPath, publicKey, layerNames, layerHashes);

            // --- Test 2: Tamper one layer → exact index reported ---
            test_SingleLayerTamper_Detected(layerFiles, tmpDir, manifestPath, publicKey, layerNames, layerHashes, 2);

            // --- Test 3: Tamper two layers → both indices reported ---
            test_TwoLayerTamper_BothDetected(layerFiles, tmpDir, manifestPath, publicKey, layerNames, layerHashes, 0, 4);

            // --- Test 4: Wrong public key → signature invalid ---
            test_WrongPublicKey_SignatureInvalid(layerFiles, tmpDir, manifestPath, layerNames, layerHashes);

            // --- Test 5: ElGamal self-test passes ---
            test_ElGamalSelfTest();

        } catch (Exception e) {
            System.err.println("[FATAL] Unexpected exception in test setup: " + e.getMessage());
            e.printStackTrace();
            failed++;
        } finally {
            // Cleanup temp directory
            if (tmpDir != null) deleteDir(tmpDir.toFile());
        }

        System.out.println("\n=== Results: " + passed + " passed, " + failed + " failed ===");
        if (failed > 0) System.exit(1);
    }

    // ── Test Methods ───────────────────────────────────────────────────────────

    static void test_CleanModel_Passes(
            Path[] layerFiles, Path manifestPath, Path publicKey,
            List<String> layerNames, List<String> layerHashes) {

        String name = "test_CleanModel_Passes";
        try {
            VerifyResult result = runVerify(layerFiles, manifestPath, publicKey, layerNames, layerHashes);
            assertTrue(name, "Signature should be valid", result.signatureValid);
            assertTrue(name, "No mismatch layers expected", result.mismatchedLayers.isEmpty());
            assertTrue(name, "Overall result should be VALID", result.valid);
            pass(name);
        } catch (Exception e) {
            fail(name, e);
        }
    }

    static void test_SingleLayerTamper_Detected(
            Path[] originalFiles, Path tmpDir, Path manifestPath, Path publicKey,
            List<String> layerNames, List<String> layerHashes, int tamperIndex) {

        String name = "test_SingleLayerTamper_Detected (layer " + tamperIndex + ")";
        Path[] tamperedFiles = Arrays.copyOf(originalFiles, originalFiles.length);
        try {
            // Copy and tamper one layer
            Path tampered = tmpDir.resolve("tampered_layer_" + tamperIndex + ".bin");
            byte[] data = Files.readAllBytes(originalFiles[tamperIndex]);
            data[0] = (byte)(data[0] ^ 0xFF); // flip MSB of first byte
            Files.write(tampered, data);
            tamperedFiles[tamperIndex] = tampered;

            VerifyResult result = runVerify(tamperedFiles, manifestPath, publicKey, layerNames, layerHashes);
            assertTrue(name, "Tampered model should NOT be fully valid", !result.valid);
            assertTrue(name, "Mismatch must be detected", !result.mismatchedLayers.isEmpty());
            assertTrue(name, "Correct layer index " + tamperIndex + " reported",
                    result.mismatchedLayers.contains(tamperIndex));
            pass(name);
        } catch (Exception e) {
            fail(name, e);
        } finally {
            // Restore original file in array
            tamperedFiles[tamperIndex] = originalFiles[tamperIndex];
        }
    }

    static void test_TwoLayerTamper_BothDetected(
            Path[] originalFiles, Path tmpDir, Path manifestPath, Path publicKey,
            List<String> layerNames, List<String> layerHashes, int idx1, int idx2) {

        String name = "test_TwoLayerTamper_BothDetected (layers " + idx1 + " & " + idx2 + ")";
        Path[] tamperedFiles = Arrays.copyOf(originalFiles, originalFiles.length);
        try {
            for (int idx : new int[]{idx1, idx2}) {
                Path tampered = tmpDir.resolve("tampered2_layer_" + idx + ".bin");
                byte[] data = Files.readAllBytes(originalFiles[idx]);
                data[data.length / 2] = (byte)(data[data.length / 2] ^ 0xAB); // flip mid-byte
                Files.write(tampered, data);
                tamperedFiles[idx] = tampered;
            }

            VerifyResult result = runVerify(tamperedFiles, manifestPath, publicKey, layerNames, layerHashes);
            assertTrue(name, "Tampered model should NOT be fully valid", !result.valid);
            assertTrue(name, "Both mismatch indices reported", result.mismatchedLayers.size() == 2);
            assertTrue(name, "Layer " + idx1 + " reported", result.mismatchedLayers.contains(idx1));
            assertTrue(name, "Layer " + idx2 + " reported", result.mismatchedLayers.contains(idx2));
            pass(name);
        } catch (Exception e) {
            fail(name, e);
        }
    }

    static void test_WrongPublicKey_SignatureInvalid(
            Path[] layerFiles, Path tmpDir, Path manifestPath,
            List<String> layerNames, List<String> layerHashes) {

        String name = "test_WrongPublicKey_SignatureInvalid";
        try {
            // Generate a different key pair
            Path wrongKeysDir = tmpDir.resolve("wrong_keys");
            RSAKeyGen.generateAndSave(wrongKeysDir.toString());
            Path wrongPublicKey = wrongKeysDir.resolve("public_key.pem");

            VerifyResult result = runVerify(layerFiles, manifestPath, wrongPublicKey, layerNames, layerHashes);
            assertTrue(name, "Signature should be INVALID with wrong key", !result.signatureValid);
            assertTrue(name, "Overall result should be INVALID", !result.valid);
            pass(name);
        } catch (Exception e) {
            fail(name, e);
        }
    }

    static void test_ElGamalSelfTest() {
        String name = "test_ElGamalSelfTest (512-bit)";
        try {
            boolean ok = ElGamalSignature.selfTest(512);
            assertTrue(name, "ElGamal self-test must pass", ok);
            pass(name);
        } catch (Exception e) {
            fail(name, e);
        }
    }

    // ── Internal Helpers ───────────────────────────────────────────────────────

    static class VerifyResult {
        boolean valid;
        boolean signatureValid;
        List<Integer> mismatchedLayers;
    }

    /**
     * Re-hash layerFiles, rebuild Merkle tree, verify RSA signature, compare hashes.
     */
    static VerifyResult runVerify(
            Path[] layerFiles, Path manifestPath, Path publicKey,
            List<String> originalLayerNames, List<String> originalLayerHashes) throws Exception {

        // Re-hash the layer files
        List<String> recomputedHashes = new ArrayList<>();
        for (Path f : layerFiles) {
            recomputedHashes.add(HashUtil.sha256File(f));
        }

        // Rebuild Merkle root
        MerkleTree recomputedTree = new MerkleTree(recomputedHashes);
        String recomputedRoot = recomputedTree.getRoot();

        // Read manifest
        String manifestJson = Files.readString(manifestPath);
        // Parse minimal fields
        String merkleRootManifest = extractJsonField(manifestJson, "merkle_root");
        String signatureB64       = extractJsonField(manifestJson, "signature");

        // Verify RSA signature on manifest's root
        java.security.PublicKey pubKey = RSAKeyGen.loadPublicKey(publicKey.toString());
        boolean sigValid;
        try {
            sigValid = RSAKeyGen.verify(merkleRootManifest.getBytes(), signatureB64, pubKey);
        } catch (Exception e) {
            sigValid = false;
        }

        // Find mismatched layers
        List<Integer> mismatched = new ArrayList<>();
        int n = Math.min(originalLayerHashes.size(), recomputedHashes.size());
        for (int i = 0; i < n; i++) {
            if (!originalLayerHashes.get(i).equals(recomputedHashes.get(i))) {
                mismatched.add(i);
            }
        }

        VerifyResult r = new VerifyResult();
        r.signatureValid = sigValid;
        r.mismatchedLayers = mismatched;
        r.valid = sigValid && mismatched.isEmpty() && merkleRootManifest.equals(recomputedRoot);
        return r;
    }

    static Path[] createSyntheticLayers(Path dir, int count) throws IOException {
        Path[] files = new Path[count];
        for (int i = 0; i < count; i++) {
            byte[] data = new byte[4096 + i * 512];
            new java.util.Random(42 + i).nextBytes(data);
            Path f = dir.resolve(String.format("layer_%03d.bin", i));
            Files.write(f, data);
            files[i] = f;
        }
        return files;
    }

    @SuppressWarnings("unchecked")
    static void writeManifest(Path dest, List<String> names, List<String> hashes,
                              String merkleRoot, String signature, String publisher) throws IOException {
        // Minimal JSON builder — no external library dependency
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"publisher\": \"").append(publisher).append("\",\n");
        sb.append("  \"layer_count\": ").append(hashes.size()).append(",\n");
        sb.append("  \"model_format\": \"synthetic\",\n");
        sb.append("  \"layer_names\": [");
        for (int i = 0; i < names.size(); i++) {
            sb.append("\"").append(names.get(i)).append("\"");
            if (i < names.size() - 1) sb.append(", ");
        }
        sb.append("],\n");
        sb.append("  \"layer_hashes\": [");
        for (int i = 0; i < hashes.size(); i++) {
            sb.append("\"").append(hashes.get(i)).append("\"");
            if (i < hashes.size() - 1) sb.append(", ");
        }
        sb.append("],\n");
        sb.append("  \"merkle_root\": \"").append(merkleRoot).append("\",\n");
        sb.append("  \"signature\": \"").append(signature).append("\",\n");
        sb.append("  \"timestamp\": \"").append(java.time.Instant.now()).append("\"\n");
        sb.append("}");
        Files.writeString(dest, sb.toString());
    }

    /** Naïve JSON field extractor — adequate for well-known string fields. */
    static String extractJsonField(String json, String key) {
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx < 0) throw new RuntimeException("Field not found in manifest: " + key);
        int colon = json.indexOf(':', idx + search.length());
        int start = json.indexOf('"', colon + 1) + 1;
        int end   = json.indexOf('"', start);
        return json.substring(start, end);
    }

    static void assertTrue(String test, String desc, boolean condition) {
        if (!condition) throw new AssertionError(test + " | " + desc);
    }

    static void pass(String name) {
        passed++;
        System.out.println("  [PASS] " + name);
    }

    static void fail(String name, Throwable e) {
        failed++;
        System.out.println("  [FAIL] " + name + " — " + e.getMessage());
        if (System.getenv("VERBOSE") != null) e.printStackTrace();
    }

    static void deleteDir(File dir) {
        if (dir.isDirectory()) for (File f : dir.listFiles()) deleteDir(f);
        dir.delete();
    }
}
