package modelguard;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import java.io.*;
import java.nio.file.*;
import java.security.PublicKey;
import java.util.*;

/**
 * ModelVerifier — verifies an uploaded AI model against its Security Manifest.
 *
 * Steps:
 *   1. Load the manifest (layer hashes, Merkle Root, RSA signature)
 *   2. Load re-computed layer hashes from the uploaded model (Python extractor output)
 *   3. Rebuild Merkle Root from re-computed hashes
 *   4. Verify RSA signature on the manifest's Merkle Root using the trusted public key
 *   5. Compare each layer hash individually — report any mismatches
 *
 * Output JSON written to outputResultPath:
 * {
 *   "valid": true/false,
 *   "signature_valid": true/false,
 *   "merkle_match": true/false,
 *   "layer_count_manifest": 5,
 *   "layer_count_uploaded": 5,
 *   "tampered_layers": [],
 *   "tampered_layer_details": [
 *     { "name": "layer5.weight", "expected": "abc...", "actual": "xyz..." }
 *   ],
 *   "publisher": "...",
 *   "merkle_root_manifest": "...",
 *   "merkle_root_computed": "...",
 *   "message": "..."
 * }
 */
@SuppressWarnings("unchecked")
public class ModelVerifier {

    public static void verify(
            String manifestPath,
            String recomputedHashesJsonPath,
            String publicKeyPath,
            String outputResultPath
    ) throws Exception {

        JSONParser parser = new JSONParser();

        // 1. Load manifest
        String manifestContent = Files.readString(Paths.get(manifestPath));
        JSONObject manifest = (JSONObject) parser.parse(manifestContent);

        String publisher = (String) manifest.get("publisher");
        String merkleRootManifest = (String) manifest.get("merkle_root");
        String signatureB64 = (String) manifest.get("signature");

        JSONArray manifestNamesArr = (JSONArray) manifest.get("layer_names");
        JSONArray manifestHashesArr = (JSONArray) manifest.get("layer_hashes");

        List<String> manifestNames = new ArrayList<>();
        List<String> manifestHashes = new ArrayList<>();
        for (Object o : manifestNamesArr) manifestNames.add(o.toString());
        for (Object o : manifestHashesArr) manifestHashes.add(o.toString());

        // 2. Load re-computed hashes from uploaded model
        String recomputedContent = Files.readString(Paths.get(recomputedHashesJsonPath));
        JSONObject recomputed = (JSONObject) parser.parse(recomputedContent);

        JSONArray uploadedNamesArr = (JSONArray) recomputed.get("layer_names");
        JSONArray uploadedHashesArr = (JSONArray) recomputed.get("layer_hashes");

        List<String> uploadedNames = new ArrayList<>();
        List<String> uploadedHashes = new ArrayList<>();
        for (Object o : uploadedNamesArr) uploadedNames.add(o.toString());
        for (Object o : uploadedHashesArr) uploadedHashes.add(o.toString());

        System.out.println("[Verifier] Manifest layers: " + manifestHashes.size());
        System.out.println("[Verifier] Uploaded layers: " + uploadedHashes.size());

        // 3. Rebuild Merkle Root from uploaded model hashes
        MerkleTree uploadedTree = new MerkleTree(uploadedHashes);
        String merkleRootComputed = uploadedTree.getRoot();

        // 4. Verify RSA signature on the MANIFEST's Merkle Root
        PublicKey publicKey = RSAKeyGen.loadPublicKey(publicKeyPath);
        boolean signatureValid = false;
        try {
            signatureValid = RSAKeyGen.verify(merkleRootManifest.getBytes(), signatureB64, publicKey);
        } catch (Exception e) {
            System.err.println("[Verifier] Signature verification error: " + e.getMessage());
        }

        // 5. Compare Merkle Roots
        boolean merkleMatch = merkleRootManifest.equals(merkleRootComputed);

        // 6. Per-layer comparison
        JSONArray tamperedLayers = new JSONArray();
        JSONArray tamperedDetails = new JSONArray();

        int minLen = Math.min(manifestHashes.size(), uploadedHashes.size());
        for (int i = 0; i < minLen; i++) {
            String expected = manifestHashes.get(i);
            String actual = uploadedHashes.get(i);
            if (!expected.equals(actual)) {
                String layerName = (i < manifestNames.size()) ? manifestNames.get(i) : "layer_" + i;
                tamperedLayers.add(layerName);

                JSONObject detail = new JSONObject();
                detail.put("index", (long) i);
                detail.put("name", layerName);
                detail.put("expected", expected);
                detail.put("actual", actual);
                tamperedDetails.add(detail);
            }
        }

        // Extra layers in uploaded model not in manifest
        for (int i = minLen; i < uploadedHashes.size(); i++) {
            String layerName = (i < uploadedNames.size()) ? uploadedNames.get(i) : "layer_" + i;
            tamperedLayers.add(layerName + " [EXTRA]");
        }

        boolean valid = signatureValid && merkleMatch && tamperedLayers.isEmpty();

        // 7. Build result JSON
        JSONObject result = new JSONObject();
        result.put("valid", valid);
        result.put("signature_valid", signatureValid);
        result.put("merkle_match", merkleMatch);
        result.put("layer_count_manifest", (long) manifestHashes.size());
        result.put("layer_count_uploaded", (long) uploadedHashes.size());
        result.put("tampered_layers", tamperedLayers);
        result.put("tampered_layer_details", tamperedDetails);
        result.put("publisher", publisher);
        result.put("merkle_root_manifest", merkleRootManifest);
        result.put("merkle_root_computed", merkleRootComputed);
        result.put("message", valid
            ? "Model verified successfully. Safe to run."
            : "Verification FAILED. Model may have been tampered with.");

        Files.writeString(Paths.get(outputResultPath), result.toJSONString());
        System.out.println("[Verifier] Result: " + (valid ? "VERIFIED ✅" : "REJECTED ❌"));
        System.out.println("[Verifier] Written to: " + outputResultPath);
    }
}
