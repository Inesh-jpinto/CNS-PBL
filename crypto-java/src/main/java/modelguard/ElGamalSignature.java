package modelguard;

import java.math.BigInteger;
import java.security.SecureRandom;

/**
 * ElGamalSignature — textbook ElGamal digital signature scheme.
 *
 * This implements the standard ElGamal signature over a cyclic group Z_p*:
 *
 *   Key Generation:
 *     1. Choose a large prime p and a generator g of Z_p*
 *     2. Choose random private key x in [1, p-2]
 *     3. Compute public key y = g^x mod p
 *
 *   Signing (message hash m):
 *     1. Choose random k in [1, p-2] with gcd(k, p-1) = 1
 *     2. r = g^k mod p
 *     3. s = (m - x*r) * k^{-1} mod (p-1)
 *
 *   Verification (check: g^m ≡ y^r * r^s mod p):
 *     1. Check 0 < r < p
 *     2. Compute left  = g^m mod p
 *     3. Compute right = (y^r * r^s) mod p
 *     4. Valid if left == right
 *
 * NOTE: Used here to demonstrate the ElGamal scheme for academic purposes.
 * For production deployments, ModelGuard's primary signing layer uses RSA-2048
 * via the Java standard library (see RSAKeyGen.java).
 *
 * Bit length guidance:
 *   - 512 bits  → fast, demo-only (not cryptographically secure)
 *   - 1024 bits → minimum for any real use
 *   - 2048 bits → recommended for production
 */
public class ElGamalSignature {

    // ─── Data Classes ─────────────────────────────────────────────────────────

    public static class KeyPair {
        /** Large prime modulus. */
        public final BigInteger p;
        /** Generator of Z_p*. */
        public final BigInteger g;
        /** Private key: random x in [1, p-2]. */
        public final BigInteger x;
        /** Public key: y = g^x mod p. */
        public final BigInteger y;

        public KeyPair(BigInteger p, BigInteger g, BigInteger x, BigInteger y) {
            this.p = p; this.g = g; this.x = x; this.y = y;
        }

        @Override
        public String toString() {
            return "KeyPair{p.bitLength=" + p.bitLength()
                    + ", g=" + g + ", y=" + y.toString(16).substring(0, Math.min(16, y.toString(16).length())) + "...}";
        }
    }

    public static class Signature {
        /** r = g^k mod p */
        public final BigInteger r;
        /** s = (m - x*r) * k^{-1} mod (p-1) */
        public final BigInteger s;

        public Signature(BigInteger r, BigInteger s) {
            this.r = r;
            this.s = s;
        }

        @Override
        public String toString() {
            return "Signature{r=" + r.toString(16).substring(0, Math.min(8, r.toString(16).length()))
                    + "..., s=" + s.toString(16).substring(0, Math.min(8, s.toString(16).length())) + "...}";
        }
    }

    // ─── Internals ─────────────────────────────────────────────────────────────

    private static final SecureRandom RANDOM = new SecureRandom();

    // ─── Public API ────────────────────────────────────────────────────────────

    /**
     * Generate an ElGamal key pair.
     *
     * @param bitLength prime size in bits (512 for demos, 1024+ for real use)
     * @return KeyPair containing (p, g, x=private, y=public)
     */
    public static KeyPair generateKeys(int bitLength) {
        // Choose a probable prime p
        BigInteger p = BigInteger.probablePrime(bitLength, RANDOM);

        // Use g = 2 as a fixed generator (adequate for demo; real use needs DL-safe group)
        BigInteger g = BigInteger.valueOf(2);

        // Private key x in [1, p-2]
        BigInteger pMinus1 = p.subtract(BigInteger.ONE);
        BigInteger x;
        do {
            x = new BigInteger(pMinus1.bitLength(), RANDOM);
        } while (x.compareTo(BigInteger.ONE) <= 0 || x.compareTo(pMinus1) >= 0);

        // Public key y = g^x mod p
        BigInteger y = g.modPow(x, p);

        return new KeyPair(p, g, x, y);
    }

    /**
     * Sign a message hash using the ElGamal scheme.
     *
     * @param messageHash raw bytes of the message hash (e.g. SHA-256 output)
     * @param keys        key pair containing private key x
     * @return Signature (r, s)
     */
    public static Signature sign(byte[] messageHash, KeyPair keys) {
        BigInteger p       = keys.p;
        BigInteger g       = keys.g;
        BigInteger x       = keys.x;
        BigInteger pMinus1 = p.subtract(BigInteger.ONE);

        // Reduce message hash to an integer mod (p-1)
        BigInteger m = new BigInteger(1, messageHash).mod(pMinus1);
        if (m.signum() == 0) m = BigInteger.ONE; // avoid degenerate case

        BigInteger k, r, s, kInv;
        int attempts = 0;
        while (true) {
            if (++attempts > 1000) throw new IllegalStateException("ElGamal signing failed to find valid k after 1000 attempts");

            // Choose k in [2, p-2] with gcd(k, p-1) = 1
            k = new BigInteger(pMinus1.bitLength(), RANDOM).mod(pMinus1);
            if (k.compareTo(BigInteger.TWO) < 0) continue;
            if (!k.gcd(pMinus1).equals(BigInteger.ONE)) continue;

            // r = g^k mod p
            r = g.modPow(k, p);
            if (r.signum() == 0) continue;

            // kInv = k^{-1} mod (p-1)
            kInv = k.modInverse(pMinus1);

            // s = (m - x*r) * kInv mod (p-1)
            s = m.subtract(x.multiply(r)).multiply(kInv).mod(pMinus1);

            // Skip degenerate signatures
            if (s.signum() == 0) continue;

            break;
        }

        return new Signature(r, s);
    }

    /**
     * Verify an ElGamal signature.
     *
     * Checks: g^m ≡ y^r * r^s (mod p)
     *
     * @param messageHash      the original message hash bytes
     * @param sig              the (r, s) signature to verify
     * @param p                prime modulus from the key pair
     * @param g                generator from the key pair
     * @param publisherPublicKey y = g^x mod p (the signer's public key)
     * @return true if the signature is valid
     */
    public static boolean verify(byte[] messageHash, Signature sig, BigInteger p, BigInteger g, BigInteger publisherPublicKey) {
        // Sanity: 0 < r < p
        if (sig.r.compareTo(BigInteger.ZERO) <= 0 || sig.r.compareTo(p) >= 0) return false;
        // Sanity: 0 < s < p-1
        BigInteger pMinus1 = p.subtract(BigInteger.ONE);
        if (sig.s.compareTo(BigInteger.ZERO) <= 0 || sig.s.compareTo(pMinus1) >= 0) return false;

        // Reduce message hash mod (p-1)
        BigInteger m = new BigInteger(1, messageHash).mod(pMinus1);
        if (m.signum() == 0) m = BigInteger.ONE;

        // left  = g^m mod p
        BigInteger left = g.modPow(m, p);

        // right = (y^r * r^s) mod p
        BigInteger yr    = publisherPublicKey.modPow(sig.r, p);
        BigInteger rs    = sig.r.modPow(sig.s, p);
        BigInteger right = yr.multiply(rs).mod(p);

        return left.equals(right);
    }

    // ─── Convenience serialisation helpers ────────────────────────────────────

    /**
     * Encode a Signature to a compact string: "{r_hex}:{s_hex}".
     */
    public static String encodeSignature(Signature sig) {
        return sig.r.toString(16) + ":" + sig.s.toString(16);
    }

    /**
     * Decode a signature previously encoded by {@link #encodeSignature}.
     */
    public static Signature decodeSignature(String encoded) {
        String[] parts = encoded.split(":", 2);
        if (parts.length != 2) throw new IllegalArgumentException("Invalid encoded signature");
        return new Signature(new BigInteger(parts[0], 16), new BigInteger(parts[1], 16));
    }

    /**
     * Quick self-test: generate keys, sign a dummy hash, verify — returns true on success.
     * Use this from Main or unit tests for a quick sanity check.
     */
    public static boolean selfTest(int bitLength) {
        KeyPair kp = generateKeys(bitLength);
        // HashUtil.sha256(byte[]) returns hex String; .getBytes() converts to byte[] for signing
        byte[] hash = HashUtil.sha256("ModelGuard-ElGamal-SelfTest".getBytes()).getBytes();
        Signature sig = sign(hash, kp);
        boolean ok = verify(hash, sig, kp.p, kp.g, kp.y);

        // Also verify that a wrong hash fails
        byte[] wrongHash = HashUtil.sha256("TAMPERED".getBytes()).getBytes();
        boolean shouldFail = verify(wrongHash, sig, kp.p, kp.g, kp.y);

        return ok && !shouldFail;
    }
}
