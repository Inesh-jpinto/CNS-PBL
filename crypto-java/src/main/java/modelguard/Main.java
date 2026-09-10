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
        System.out.println("  keygen  <outputDir>");
        System.out.println("  publish <layerHashesJson> <privateKey.pem> <publisher> <outputManifest>");
        System.out.println("  verify  <manifest> <recomputedHashesJson> <publicKey.pem> <outputResult>");
    }
}
