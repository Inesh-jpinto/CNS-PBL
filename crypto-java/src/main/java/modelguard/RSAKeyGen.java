package modelguard;

import java.io.*;
import java.nio.file.*;
import java.security.*;
import java.security.spec.*;
import java.util.Base64;

/**
 * RSAKeyGen — generates an RSA-2048 key pair and saves as PEM files.
 *
 * Output files:
 *   private_key.pem  — PKCS#8 private key (keep secret, publisher only)
 *   public_key.pem   — X.509 SubjectPublicKeyInfo public key (shared/trusted)
 */
public class RSAKeyGen {

    public static void generateAndSave(String outputDir) throws Exception {
        // Generate RSA-2048 key pair
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048, new SecureRandom());
        KeyPair keyPair = kpg.generateKeyPair();

        // Encode private key as PKCS#8 PEM
        byte[] privateEncoded = keyPair.getPrivate().getEncoded(); // PKCS#8
        String privatePem = toPem("PRIVATE KEY", privateEncoded);

        // Encode public key as X.509 PEM
        byte[] publicEncoded = keyPair.getPublic().getEncoded(); // X.509
        String publicPem = toPem("PUBLIC KEY", publicEncoded);

        // Write to files
        Path dir = Paths.get(outputDir);
        Files.createDirectories(dir);
        Files.writeString(dir.resolve("private_key.pem"), privatePem);
        Files.writeString(dir.resolve("public_key.pem"), publicPem);

        System.out.println("[RSAKeyGen] Keys written to: " + dir.toAbsolutePath());
        System.out.println("[RSAKeyGen] Private key: private_key.pem");
        System.out.println("[RSAKeyGen] Public key:  public_key.pem");
    }

    /** Load RSA private key from PEM file (PKCS#8 format). */
    public static PrivateKey loadPrivateKey(String pemPath) throws Exception {
        String pem = Files.readString(Paths.get(pemPath));
        byte[] decoded = decodePem(pem);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
        return KeyFactory.getInstance("RSA").generatePrivate(spec);
    }

    /** Load RSA public key from PEM file (X.509 format). */
    public static PublicKey loadPublicKey(String pemPath) throws Exception {
        String pem = Files.readString(Paths.get(pemPath));
        byte[] decoded = decodePem(pem);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }

    /** Sign data with RSA private key using SHA256withRSA. Returns Base64 signature. */
    public static String sign(byte[] data, PrivateKey privateKey) throws Exception {
        Signature sig = Signature.getInstance("SHA256withRSA");
        sig.initSign(privateKey);
        sig.update(data);
        return Base64.getEncoder().encodeToString(sig.sign());
    }

    /**
     * Verify an RSA signature.
     * @param data      original data that was signed
     * @param signatureB64  Base64-encoded signature
     * @param publicKey public key of the expected signer
     * @return true if the signature is valid
     */
    public static boolean verify(byte[] data, String signatureB64, PublicKey publicKey) throws Exception {
        Signature sig = Signature.getInstance("SHA256withRSA");
        sig.initVerify(publicKey);
        sig.update(data);
        byte[] sigBytes = Base64.getDecoder().decode(signatureB64);
        return sig.verify(sigBytes);
    }

    // ─── PEM helpers ──────────────────────────────────────────────────────────

    private static String toPem(String type, byte[] encoded) {
        String b64 = Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(encoded);
        return "-----BEGIN " + type + "-----\n" + b64 + "\n-----END " + type + "-----\n";
    }

    private static byte[] decodePem(String pem) {
        String stripped = pem
            .replaceAll("-----BEGIN [^-]+-----", "")
            .replaceAll("-----END [^-]+-----", "")
            .replaceAll("\\s+", "");
        return Base64.getDecoder().decode(stripped);
    }
}
