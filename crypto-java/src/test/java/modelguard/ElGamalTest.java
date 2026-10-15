package modelguard;

/**
 * ElGamalTest — Unit tests for the ElGamal signature scheme.
 *
 * Runs without any test framework dependency.
 * Execute with: java -cp "out;lib/*" modelguard.ElGamalTest
 *
 * Test cases:
 *   1. Key generation produces valid structure
 *   2. Sign → Verify round-trip passes
 *   3. Tampered message fails verification
 *   4. Wrong public key fails verification
 *   5. Deterministic self-test (selfTest method)
 */
public class ElGamalTest {

    private static int passed = 0;
    private static int failed = 0;

    public static void main(String[] args) {
        System.out.println("=== ElGamal Signature Tests ===\n");

        test_KeyGenerationStructure();
        test_SignVerify_RoundTrip();
        test_TamperedMessage_Fails();
        test_WrongPublicKey_Fails();
        test_SelfTest_512bit();
        test_SelfTest_1024bit();
        test_SignatureEncoding();

        System.out.println("\n=== Results: " + passed + " passed, " + failed + " failed ===");
        if (failed > 0) System.exit(1);
    }

    // ── Tests ──────────────────────────────────────────────────────────────────

    static void test_KeyGenerationStructure() {
        ElGamalSignature.KeyPair kp = ElGamalSignature.generateKeys(512);
        // p must be prime and positive
        assertTrue("p is positive", kp.p.signum() > 0);
        assertTrue("g is 2", kp.g.intValueExact() == 2);
        // x must be in (0, p-1)
        assertTrue("x > 0", kp.x.signum() > 0);
        assertTrue("x < p-1", kp.x.compareTo(kp.p.subtract(java.math.BigInteger.ONE)) < 0);
        // y = g^x mod p
        java.math.BigInteger expectedY = kp.g.modPow(kp.x, kp.p);
        assertTrue("y = g^x mod p", kp.y.equals(expectedY));
        pass("test_KeyGenerationStructure");
    }

    static void test_SignVerify_RoundTrip() {
        ElGamalSignature.KeyPair kp = ElGamalSignature.generateKeys(512);
        byte[] hash = HashUtil.sha256("merkle-root-hash-for-test-model".getBytes()).getBytes();
        ElGamalSignature.Signature sig = ElGamalSignature.sign(hash, kp);
        boolean valid = ElGamalSignature.verify(hash, sig, kp.p, kp.g, kp.y);
        assertTrue("Verification passes for authentic signature", valid);
        pass("test_SignVerify_RoundTrip");
    }

    static void test_TamperedMessage_Fails() {
        ElGamalSignature.KeyPair kp = ElGamalSignature.generateKeys(512);
        byte[] original = HashUtil.sha256("original-merkle-root".getBytes()).getBytes();
        byte[] tampered = HashUtil.sha256("TAMPERED-merkle-root".getBytes()).getBytes();

        ElGamalSignature.Signature sig = ElGamalSignature.sign(original, kp);
        boolean valid = ElGamalSignature.verify(tampered, sig, kp.p, kp.g, kp.y);
        assertTrue("Tampered message fails verification", !valid);
        pass("test_TamperedMessage_Fails");
    }

    static void test_WrongPublicKey_Fails() {
        ElGamalSignature.KeyPair kp1 = ElGamalSignature.generateKeys(512);
        ElGamalSignature.KeyPair kp2 = ElGamalSignature.generateKeys(512);
        byte[] hash = HashUtil.sha256("model-root".getBytes()).getBytes();

        ElGamalSignature.Signature sig = ElGamalSignature.sign(hash, kp1);
        // Verify with kp2's public key — should fail unless parameters happen to match (astronomically unlikely)
        boolean valid = ElGamalSignature.verify(hash, sig, kp1.p, kp1.g, kp2.y);
        assertTrue("Wrong public key fails verification", !valid);
        pass("test_WrongPublicKey_Fails");
    }

    static void test_SelfTest_512bit() {
        boolean ok = ElGamalSignature.selfTest(512);
        assertTrue("ElGamal self-test passes at 512 bits", ok);
        pass("test_SelfTest_512bit");
    }

    static void test_SelfTest_1024bit() {
        boolean ok = ElGamalSignature.selfTest(1024);
        assertTrue("ElGamal self-test passes at 1024 bits", ok);
        pass("test_SelfTest_1024bit");
    }

    static void test_SignatureEncoding() {
        ElGamalSignature.KeyPair kp = ElGamalSignature.generateKeys(512);
        byte[] hash = HashUtil.sha256("encoding-test".getBytes()).getBytes();
        ElGamalSignature.Signature original = ElGamalSignature.sign(hash, kp);

        String encoded = ElGamalSignature.encodeSignature(original);
        ElGamalSignature.Signature decoded = ElGamalSignature.decodeSignature(encoded);

        assertTrue("r round-trips through encoding", original.r.equals(decoded.r));
        assertTrue("s round-trips through encoding", original.s.equals(decoded.s));

        // Verify decoded signature still passes
        boolean valid = ElGamalSignature.verify(hash, decoded, kp.p, kp.g, kp.y);
        assertTrue("Decoded signature verifies", valid);
        pass("test_SignatureEncoding");
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    static void assertTrue(String description, boolean condition) {
        if (!condition) {
            System.err.println("  ASSERTION FAILED: " + description);
            throw new AssertionError(description);
        }
    }

    static void pass(String name) {
        passed++;
        System.out.println("  [PASS] " + name);
    }

    static void fail(String name, Throwable e) {
        failed++;
        System.out.println("  [FAIL] " + name + " — " + e.getMessage());
    }
}
