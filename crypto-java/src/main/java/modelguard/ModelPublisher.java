package modelguard;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import java.io.*;
import java.nio.file.*;
import java.security.PrivateKey;
import java.time.Instant;
import java.util.*;

/**
 * ModelPublisher — seals an AI model by:
 *   1. Reading layer hashes from a JSON file (produced by Python extractor)
 *   2. Building a Merkle Tree over those hashes
 *   3. Signing the Merkle Root with the publisher's RSA private key
 *   4. Writing a Security Manifest JSON file
 *
 * Input JSON format (from Python extractor):
 * {
 *   "model_format": "pytorch",
 *   "layer_names": ["conv1.weight", "conv1.bias", ...],
 *   "layer_hashes": ["abc123...", "def456...", ...]
 * }
 *
 * Output manifest format:
 * {
 *   "publisher": "...",
 *   "model_format": "pytorch",
 *   "layer_count": 5,
 *   "layer_names": [...],
 *   "layer_hashes": [...],
 *   "merkle_root": "...",
 *   "signature": "...(Base64)...",
 *   "timestamp": "2026-08-21T14:00:00Z"
 * }
 */
@SuppressWarnings("unchecked")
public class ModelPublisher {

    /**
     * Publish a model: read layer hashes JSON, build tree, sign, write manifest.
     *
     * @param layerHashesJsonPath  path to layer hashes JSON from Python
     * @param privateKeyPath       path to publisher's private_key.pem
     * @param publisherName        publisher display name
     * @param outputManifestPath   where to write the manifest JSON
     */
    public static void publish(
            String layerHashesJsonPath,
            String privateKeyPath,
            String publisherName,
            String outputManifestPath
    ) throws Exception {

        // 1. Read layer hashes JSON produced by Python extractor
        String jsonContent = Files.readString(Paths.get(layerHashesJsonPath));
        JSONObject input = (JSONObject) new org.json.simple.parser.JSONParser().parse(jsonContent);

        String modelFormat = (String) input.get("model_format");
        JSONArray layerNamesArr = (JSONArray) input.get("layer_names");
        JSONArray layerHashesArr = (JSONArray) input.get("layer_hashes");

        List<String> layerNames = new ArrayList<>();
        List<String> layerHashes = new ArrayList<>();
        for (Object o : layerNamesArr) layerNames.add(o.toString());
        for (Object o : layerHashesArr) layerHashes.add(o.toString());

        System.out.println("[Publisher] Layers found: " + layerHashes.size());

        // 2. Build Merkle Tree
        MerkleTree tree = new MerkleTree(layerHashes);
        String merkleRoot = tree.getRoot();
        System.out.println("[Publisher] Merkle Root: " + merkleRoot);

        // 3. Sign the Merkle Root
        PrivateKey privateKey = RSAKeyGen.loadPrivateKey(privateKeyPath);
        String signature = RSAKeyGen.sign(merkleRoot.getBytes(), privateKey);
        System.out.println("[Publisher] Signature created (RSA-SHA256)");

        // 4. Build manifest JSON
        JSONObject manifest = new JSONObject();
        manifest.put("publisher", publisherName);
        manifest.put("model_format", modelFormat);
        manifest.put("layer_count", (long) layerHashes.size());
        manifest.put("layer_names", layerNamesArr);
        manifest.put("layer_hashes", layerHashesArr);
        manifest.put("merkle_root", merkleRoot);
        manifest.put("signature", signature);
        manifest.put("timestamp", Instant.now().toString());

        // 5. Write manifest
        Files.writeString(Paths.get(outputManifestPath), manifest.toJSONString());
        System.out.println("[Publisher] Manifest written to: " + outputManifestPath);
    }
}
