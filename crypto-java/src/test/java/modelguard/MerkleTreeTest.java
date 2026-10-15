package modelguard;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * MerkleTreeTest — Unit tests for the MerkleTree implementation.
 *
 * Run with: java -cp "out;lib/*" modelguard.MerkleTreeTest
 *
 * Test cases:
 *   1. Deterministic root — same inputs → same root every run
 *   2. Single leaf tree
 *   3. Even number of leaves
 *   4. Odd number of leaves (last node duplication)
 *   5. Changing one leaf changes the root (avalanche)
 *   6. findMismatchedLeaves — correct layer indices reported
 *   7. verifyLeaf — individual Merkle proof
 *   8. Empty leaf list throws exception
 */
public class MerkleTreeTest {

    private static int passed = 0;
    private static int failed = 0;

    public static void main(String[] args) {
        System.out.println("=== Merkle Tree Tests ===\n");

        test_DeterministicRoot();
        test_SingleLeaf();
        test_EvenLeaves();
        test_OddLeaves_LastDuplicated();
        test_TamperedLeaf_ChangesRoot();
        test_FindMismatchedLeaves_Correct();
        test_FindMismatchedLeaves_MultipleCorrupt();
        test_VerifyLeaf_ValidIndex();
        test_VerifyLeaf_TamperedLeaf();
        test_EmptyList_Throws();

        System.out.println("\n=== Results: " + passed + " passed, " + failed + " failed ===");
        if (failed > 0) System.exit(1);
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    static List<String> makeHashes(String... labels) {
        List<String> hashes = new ArrayList<>();
        for (String label : labels) hashes.add(HashUtil.sha256(label.getBytes()));
        return hashes;
    }

    // ── Tests ──────────────────────────────────────────────────────────────────

    static void test_DeterministicRoot() {
        List<String> leaves = makeHashes("layer_0", "layer_1", "layer_2", "layer_3");
        String root1 = new MerkleTree(leaves).getRoot();
        String root2 = new MerkleTree(leaves).getRoot();
        assertEquals("Same input → same root (run 1 vs run 2)", root1, root2);

        // A third run to be sure
        String root3 = new MerkleTree(new ArrayList<>(leaves)).getRoot();
        assertEquals("Same input → same root (run 3)", root1, root3);
        pass("test_DeterministicRoot");
    }

    static void test_SingleLeaf() {
        List<String> leaves = makeHashes("only-layer");
        MerkleTree tree = new MerkleTree(leaves);
        assertEquals("Root equals single leaf hash", leaves.get(0), tree.getRoot());
        pass("test_SingleLeaf");
    }

    static void test_EvenLeaves() {
        List<String> leaves = makeHashes("layer_0", "layer_1", "layer_2", "layer_3");
        MerkleTree tree = new MerkleTree(leaves);
        // Root should exist and not be empty
        assertTrue("Root is non-empty string", !tree.getRoot().isEmpty());
        assertTrue("Root is 64 hex chars (SHA-256)", tree.getRoot().length() == 64);
        pass("test_EvenLeaves");
    }

    static void test_OddLeaves_LastDuplicated() {
        // 3 leaves: last leaf is duplicated when building level 1
        List<String> three = makeHashes("layer_0", "layer_1", "layer_2");
        MerkleTree tree3 = new MerkleTree(three);

        // 4 leaves where leaf_3 == leaf_2 (manually duplicated)
        List<String> four = new ArrayList<>(three);
        four.add(three.get(2)); // duplicate last
        MerkleTree tree4 = new MerkleTree(four);

        assertEquals("Odd 3-leaf root == equivalent 4-leaf root with duplication",
                tree3.getRoot(), tree4.getRoot());
        pass("test_OddLeaves_LastDuplicated");
    }

    static void test_TamperedLeaf_ChangesRoot() {
        List<String> clean   = makeHashes("layer_0", "layer_1", "layer_2", "layer_3");
        List<String> tampered = new ArrayList<>(clean);
        // Replace layer_2 with a tampered hash
        tampered.set(2, HashUtil.sha256("TAMPERED_LAYER_2".getBytes()));

        String cleanRoot   = new MerkleTree(clean).getRoot();
        String tamperedRoot = new MerkleTree(tampered).getRoot();

        assertTrue("Tampered leaf changes the root", !cleanRoot.equals(tamperedRoot));
        pass("test_TamperedLeaf_ChangesRoot");
    }

    static void test_FindMismatchedLeaves_Correct() {
        List<String> original   = makeHashes("layer_0", "layer_1", "layer_2");
        List<String> recomputed = new ArrayList<>(original);
        // Tamper layer at index 1
        recomputed.set(1, HashUtil.sha256("TAMPERED".getBytes()));

        List<Integer> mismatched = MerkleTree.findMismatchedLeaves(original, recomputed);
        assertEquals("Exactly one mismatch", 1, mismatched.size());
        assertEquals("Mismatch at index 1", 1, (int) mismatched.get(0));
        pass("test_FindMismatchedLeaves_Correct");
    }

    static void test_FindMismatchedLeaves_MultipleCorrupt() {
        List<String> original   = makeHashes("a", "b", "c", "d", "e");
        List<String> recomputed = new ArrayList<>(original);
        recomputed.set(0, HashUtil.sha256("BAD_0".getBytes()));
        recomputed.set(3, HashUtil.sha256("BAD_3".getBytes()));

        List<Integer> mismatched = MerkleTree.findMismatchedLeaves(original, recomputed);
        assertEquals("Two mismatches found", 2, mismatched.size());
        assertTrue("Index 0 reported", mismatched.contains(0));
        assertTrue("Index 3 reported", mismatched.contains(3));
        pass("test_FindMismatchedLeaves_MultipleCorrupt");
    }

    static void test_VerifyLeaf_ValidIndex() {
        List<String> leaves = makeHashes("conv1.weight", "conv1.bias", "fc1.weight", "fc1.bias");
        MerkleTree tree = new MerkleTree(leaves);
        for (int i = 0; i < leaves.size(); i++) {
            assertTrue("verifyLeaf passes for leaf " + i, tree.verifyLeaf(i, leaves.get(i)));
        }
        pass("test_VerifyLeaf_ValidIndex");
    }

    static void test_VerifyLeaf_TamperedLeaf() {
        List<String> leaves = makeHashes("conv1.weight", "conv1.bias", "fc1.weight");
        MerkleTree tree = new MerkleTree(leaves);

        String tamperedHash = HashUtil.sha256("TAMPERED_DATA".getBytes());
        boolean result = tree.verifyLeaf(1, tamperedHash);
        assertTrue("verifyLeaf fails for tampered hash", !result);
        pass("test_VerifyLeaf_TamperedLeaf");
    }

    static void test_EmptyList_Throws() {
        try {
            new MerkleTree(new ArrayList<>());
            fail("test_EmptyList_Throws", new Exception("Expected exception was not thrown"));
        } catch (IllegalArgumentException e) {
            pass("test_EmptyList_Throws");
        }
    }

    // ── Assertions ─────────────────────────────────────────────────────────────

    static void assertEquals(String desc, Object expected, Object actual) {
        if (!expected.equals(actual)) {
            throw new AssertionError(desc + " → expected [" + expected + "] but got [" + actual + "]");
        }
    }

    static void assertTrue(String desc, boolean condition) {
        if (!condition) throw new AssertionError("Assertion failed: " + desc);
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
