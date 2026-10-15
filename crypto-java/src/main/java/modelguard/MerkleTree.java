package modelguard;

import java.util.*;

/**
 * MerkleTree — builds a binary Merkle Tree from a list of leaf hashes.
 *
 * Construction:
 *   1. Each layer hash becomes a leaf node.
 *   2. Pairs of nodes are combined via SHA-256(left || right).
 *   3. If the number of nodes is odd, the last node is duplicated.
 *   4. This continues until a single root remains.
 *
 * The Merkle Root uniquely represents the full ordered set of layer hashes.
 * Changing even one byte in one layer changes the root completely (avalanche).
 */
public class MerkleTree {

    private final List<String> leaves;
    private final List<List<String>> levels; // levels[0] = leaves, levels[last] = [root]
    private String root;

    public MerkleTree(List<String> leafHashes) {
        if (leafHashes == null || leafHashes.isEmpty()) {
            throw new IllegalArgumentException("Cannot build Merkle Tree from empty list");
        }
        this.leaves = new ArrayList<>(leafHashes);
        this.levels = new ArrayList<>();
        buildTree();
    }

    private void buildTree() {
        List<String> current = new ArrayList<>(leaves);
        levels.add(new ArrayList<>(current));

        while (current.size() > 1) {
            List<String> next = new ArrayList<>();
            for (int i = 0; i < current.size(); i += 2) {
                String left = current.get(i);
                // If odd number of nodes, duplicate the last one
                String right = (i + 1 < current.size()) ? current.get(i + 1) : left;
                next.add(HashUtil.combineHashes(left, right));
            }
            levels.add(new ArrayList<>(next));
            current = next;
        }

        this.root = current.get(0);
    }

    /** Returns the Merkle Root hash (hex string). */
    public String getRoot() {
        return root;
    }

    /** Returns all tree levels for debugging / proof generation. */
    public List<List<String>> getLevels() {
        return Collections.unmodifiableList(levels);
    }

    /** Returns the leaf hashes (level 0). */
    public List<String> getLeaves() {
        return Collections.unmodifiableList(leaves);
    }

    /**
     * Verify that a given leaf hash is consistent with the stored root.
     * Recomputes the root from the leaf and its sibling path.
     * Returns true if the recomputed root matches the stored root.
     */
    public boolean verifyLeaf(int leafIndex, String leafHash) {
        if (leafIndex < 0 || leafIndex >= leaves.size()) return false;
        String current = leafHash;
        int idx = leafIndex;

        for (int level = 0; level < levels.size() - 1; level++) {
            List<String> levelNodes = levels.get(level);
            int siblingIdx = (idx % 2 == 0) ? idx + 1 : idx - 1;
            String sibling = (siblingIdx < levelNodes.size()) ? levelNodes.get(siblingIdx) : levelNodes.get(idx);

            if (idx % 2 == 0) {
                current = HashUtil.combineHashes(current, sibling);
            } else {
                current = HashUtil.combineHashes(sibling, current);
            }
            idx = idx / 2;
        }
        return current.equals(root);
    }

    /**
     * Compare two lists of leaf hashes and return the indices where they differ.
     * Used by the verifier to localize exactly which layers were tampered.
     */
    public static List<Integer> findMismatchedLeaves(List<String> original, List<String> recomputed) {
        List<Integer> mismatched = new ArrayList<>();
        int n = Math.min(original.size(), recomputed.size());
        for (int i = 0; i < n; i++) {
            if (!original.get(i).equals(recomputed.get(i))) {
                mismatched.add(i);
            }
        }
        // Extra leaves in recomputed (not in original) are also mismatches
        for (int i = n; i < recomputed.size(); i++) {
            mismatched.add(i);
        }
        return mismatched;
    }

    /** Print tree structure for debugging. */
    public void printTree() {
        System.out.println("=== Merkle Tree ===");
        for (int i = levels.size() - 1; i >= 0; i--) {
            System.out.println("Level " + i + ": " + levels.get(i));
        }
        System.out.println("Root: " + root);
    }
}
