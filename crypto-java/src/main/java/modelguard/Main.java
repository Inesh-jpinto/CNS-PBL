package modelguard;

/**
 * Main — CLI entry point for ModelGuard Java crypto service.
 *
 * Usage:
 * java -cp "out;lib/*" modelguard.Main keygen <outputDir>
 * java -cp "out;lib/*" modelguard.Main publish <layerHashesJson>
 * <privateKey.pem> <publisher> <outputManifest>
 * java -cp "out;lib/*" modelguard.Main verify <manifest> <recomputedHashesJson>
 * <publicKey.pem> <outputResult>
 *
 * Called by the Python FastAPI backend via subprocess.
 */
public class Main {

    public static void main(String[] args) {
        if (args.length < 1) {
            printUsage();
            System.exit(1);
        }

        String mode = args[0].toLowerCase();

        try {
            switch (mode) {
                case "keygen":
                    if (args.length < 2) {
                        printUsage();
                        System.exit(1);
                    }
                    RSAKeyGen.generateAndSave(args[1]);
                    break;

                case "publish":
                    if (args.length < 5) {
                        printUsage();
                        System.exit(1);
                    }
                    // args: publish <layerHashesJson> <privateKey> <publisher> <outputManifest>
                    ModelPublisher.publish(args[1], args[2], args[3], args[4]);
                    break;

                case "verify":
                    if (args.length < 5) {
                        printUsage();
                        System.exit(1);
                    }
                    // args: verify <manifest> <recomputedHashesJson> <publicKey> <outputResult>
                    ModelVerifier.verify(args[1], args[2], args[3], args[4]);
                    break;

                case "elgamal-selftest": {
                    // args: elgamal-selftest [bitLength]  (default 512)
                    int bits = (args.length >= 2) ? Integer.parseInt(args[1]) : 512;
                    System.out.println("[ElGamal] Running self-test at " + bits + " bits...");
                    boolean ok = ElGamalSignature.selfTest(bits);
                    System.out.println("[ElGamal] Self-test: " + (ok ? "PASSED ✅" : "FAILED ❌"));
                    if (!ok) System.exit(3);
                    break;
                }

                case "test-merkle":
                    MerkleTreeTest.main(new String[0]);
                    break;

                case "test-elgamal":
                    ElGamalTest.main(new String[0]);
                    break;

                case "test-tamper":
                    TamperDetectionTest.main(new String[0]);
                    break;

                case "test-all":
                    System.out.println("=== Running All ModelGuard Tests ===\n");
                    MerkleTreeTest.main(new String[0]);
                    ElGamalTest.main(new String[0]);
                    TamperDetectionTest.main(new String[0]);
                    System.out.println("\n=== All test suites complete ===");
                    break;

                default:
                    System.err.println("[Main] Unknown mode: " + mode);
                    printUsage();
                    System.exit(1);
            }
        } catch (Exception e) {
            System.err.println("[Main] ERROR: " + e.getMessage());
            e.printStackTrace();
            System.exit(2);
        }
    }

    private static void printUsage() {
        System.out.println("ModelGuard Crypto Service");
        System.out.println("Usage:");
        System.out.println("  keygen           <outputDir>");
        System.out.println("  publish          <layerHashesJson> <privateKey.pem> <publisher> <outputManifest>");
        System.out.println("  verify           <manifest> <recomputedHashesJson> <publicKey.pem> <outputResult>");
        System.out.println("  elgamal-selftest [bitLength]   — run ElGamal sign/verify self-test");
        System.out.println("  test-merkle                    — run MerkleTree unit tests");
        System.out.println("  test-elgamal                   — run ElGamal unit tests");
        System.out.println("  test-tamper                    — run tamper detection integration tests");
        System.out.println("  test-all                       — run all test suites");
    }
}
