import { useModel } from "../context/ModelContext";
import { AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2, Info } from "lucide-react";
import { calcRiskScore } from "../utils/crypto";

export default function RiskAssessmentPage() {
  const { tamperedLayers, layers, signatureStatus } = useModel();

  const isSigValid = signatureStatus === "Valid";
  const score = calcRiskScore(tamperedLayers.length, layers.length, isSigValid);
  const confidence = 100 - score;

  const recommendations = [];
  if (tamperedLayers.length > 0) {
    recommendations.push({
      title: "Prune or Re-download modified layers",
      desc: `We detected parameters alteration in ${tamperedLayers.length} model layers. Re-acquire weights from trusted repository baseline.`
    });
  }
  if (!isSigValid) {
    recommendations.push({
      title: "Validate Signer credentials",
      desc: "Digital signature verification failed. Ensure you are using the correct publisher public key ED25519 configurations."
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Periodic security manifests sweeps",
      desc: "Model parameters match validation registries. Re-run scans if pipeline layers are re-saved."
    });
  }

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Risk Assessment & Auditing</h2>
          <p>Verify parameters integrity risk factors and get smart security recommendations</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 18, alignItems: "start" }}>
        {/* Risk Score Gauge */}
        <div className="panel" style={{ padding: 24, textAlign: "center" }}>
          <h3>Risk Factor Score</h3>
          <div style={{ position: "relative", width: 140, height: 140, margin: "20px auto" }}>
            {/* Simple circular visualization using CSS */}
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: `conic-gradient(${score > 50 ? "var(--red)" : "var(--green)"} ${score * 3.6}deg, var(--surface) 0deg)`,
              display: "grid", placeItems: "center"
            }}>
              <div style={{
                width: 110, height: 110, borderRadius: "50%", background: "var(--bg-secondary)",
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
              }}>
                <strong style={{ fontSize: 26, color: score > 50 ? "var(--red)" : "var(--green)" }}>{score}%</strong>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>RISK SCORE</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
            Confidence Index: <strong style={{ color: "var(--cyan)" }}>{confidence}% Secure</strong>
          </p>
        </div>

        {/* Security Recommendations */}
        <div className="panel" style={{ padding: 18 }}>
          <div className="card-head" style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            <h3>Threat Mitigation Recommendations</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recommendations.map((rec, idx) => (
              <div key={idx} style={{
                display: "flex", gap: 12, background: "var(--surface)", border: "1px solid var(--border)",
                padding: 14, borderRadius: "var(--radius-sm)"
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center",
                  background: score > 50 ? "var(--red-soft)" : "var(--green-soft)",
                  color: score > 50 ? "var(--red)" : "var(--green)", flexShrink: 0
                }}>
                  {score > 50 ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 13.5 }}>{rec.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
