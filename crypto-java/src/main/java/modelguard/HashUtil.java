package modelguard;

import java.io.*;
import java.nio.file.*;
import java.security.*;

/**
 * HashUtil — SHA-256 hashing utilities.
 * Supports both in-memory byte arrays and streaming large files.
 */
public class HashUtil {

    private static final int BUFFER_SIZE = 64 * 1024; // 64 KB chunks

    /**
     * Compute SHA-256 of a byte array, return lowercase hex string.
     */
    public static String sha256(byte[] data) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(data);
            return bytesToHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    /**
     * Compute SHA-256 of a file using streaming (suitable for large models).
     * Reads the file in 64 KB chunks to avoid OOM on gigabyte-scale files.
     */
    public static String sha256File(Path filePath) throws IOException {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[BUFFER_SIZE];
            try (InputStream is = Files.newInputStream(filePath)) {
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    md.update(buffer, 0, bytesRead);
                }
            }
            return bytesToHex(md.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    /**
     * Combine two hex-encoded hashes into a single SHA-256 hash.
     * Used for Merkle Tree node construction.
     */
    public static String combineHashes(String left, String right) {
        return sha256((left + right).getBytes());
    }

    /**
     * Convert raw bytes to lowercase hex string.
     */
    public static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
