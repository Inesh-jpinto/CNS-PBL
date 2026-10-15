import { useState } from "react";
import { Key, ShieldCheck, AlertTriangle, Copy, Check, RefreshCw, Download, Server, Lock, Unlock } from "lucide-react";
import axios from "axios";

const API = "http://localhost:8000";

export default function KeyManagementPage() {
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [publicKey, setPublicKey]   = useState(null);
  const [pubKeyFetched, setPubKeyFetched] = useState(null);
  const [copiedField, setCopiedField] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  async function handleGenerateKeys() {
    setLoading(true); setError(null); setPublicKey(null);
    try {
      const { data } = await axios.post(`${API}/api/keygen`, {}, { timeout: 30000 });
      setPublicKey(data.public_key_pem);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchPublicKey() {
    setLoading(true); setError(null);
    try {
      const { data } = await axios.get(`${API}/api/public-key`, { timeout: 10000 });
      setPubKeyFetched(data.public_key_pem);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Public key not found. Generate keys first.");
    } finally {
      setLoading(false);
    }
  }

  async function handleElGamalTest() {
    setTestLoading(true); setTestResult(null);
    try {
      const { data } = await axios.get(`${API}/api/elgamal-selftest?bit_length=512`, { timeout: 60000 });
      setTestResult(data);
    } catch (e) {
      setTestResult({ success: false, result: "ERROR", output: e.response?.data?.detail || e.message });
    } finally {
      setTestLoading(false);
    }
  }

  function copy(val, field) {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1500);
  }

  function downloadPem(content, filename) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  const displayedKey = publicKey || pubKeyFetched;

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>Key Management</h2>
          <p>Generate RSA-2048 publisher keys and inspect the trusted public key</p>
        </div>
      </div>

      {/* Architecture explanation */}
      <div style={{
        display: "flex", gap: 12, background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.2)",
        padding: 14, borderRadius: "var(--radius-md)", marginBottom: 18, fontSize: 13
      }}>
        <Key size={20} style={{ color: "var(--cyan)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <strong style={{ color: "var(--text-primary)" }}>How key provisioning works in ModelGuard:</strong><br />
          The <em>private key</em> is generated and stored <em>server-side only</em> — it is never transmitted over the API.
          The <em>public key</em> is shared out-of-band (e.g. embedded at device setup time), mirroring how browsers
          ship with pre-installed root certificates. If both the model and key arrived over the same untrusted channel,
          an attacker could substitute both together and bypass all checks.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Generate keys */}
        <div className="panel" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Lock size={18} style={{ color: "var(--purple)" }} />
            <h3 style={{ margin: 0 }}>Generate Key Pair</h3>
          </div>
          <p className="sub" style={{ marginBottom: 16 }}>Creates a fresh RSA-2048 key pair on the server</p>

          <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 12, color: "var(--orange)" }}>
            ⚠ Generating new keys will replace existing keys. Any previously published manifests will no longer verify.
          </div>

          <button id="keymgmt-generate-btn" className="primary-button" style={{ width: "100%", background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
            onClick={handleGenerateKeys} disabled={loading}>
            {loading ? <RefreshCw size={15} className="spin" /> : <Key size={15} />}
            {loading ? "Generating…" : "Generate RSA-2048 Keys"}
          </button>

          {publicKey && (
            <div style={{ marginTop: 12, padding: 10, background: "rgba(34,197,94,0.07)", border: "1px solid var(--green)", borderRadius: 6, fontSize: 12, color: "var(--green)" }}>
              <ShieldCheck size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Key pair generated. Private key stored server-side only. Public key shown below.
            </div>
          )}
        </div>

        {/* Fetch public key */}
        <div className="panel" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Unlock size={18} style={{ color: "var(--cyan)" }} />
            <h3 style={{ margin: 0 }}>Inspect Public Key</h3>
          </div>
          <p className="sub" style={{ marginBottom: 16 }}>Retrieve the current trusted publisher public key</p>

          <button id="keymgmt-fetch-btn" className="secondary-button" style={{ width: "100%", marginBottom: 10 }}
            onClick={handleFetchPublicKey} disabled={loading}>
            {loading ? <RefreshCw size={15} className="spin" /> : <Server size={15} />}
            {loading ? "Fetching…" : "Fetch Public Key from Server"}
          </button>

          <button id="keymgmt-elgamal-btn" className="secondary-button" style={{ width: "100%" }}
            onClick={handleElGamalTest} disabled={testLoading}>
            {testLoading ? <RefreshCw size={15} className="spin" /> : <ShieldCheck size={15} />}
            {testLoading ? "Testing…" : "Run ElGamal Self-Test"}
          </button>

          {testResult && (
            <div style={{
              marginTop: 12, padding: 10, borderRadius: 6, fontSize: 12,
              background: testResult.success ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
              border: `1px solid ${testResult.success ? "var(--green)" : "var(--red)"}`,
              color: testResult.success ? "var(--green)" : "var(--red)"
            }}>
              <strong>ElGamal {testResult.result}</strong>
              {testResult.output && <pre style={{ margin: "6px 0 0", fontSize: 11, whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>{testResult.output}</pre>}
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6, color: "var(--red)", fontSize: 13, marginBottom: 16 }}>
          <AlertTriangle size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> {error}
        </div>
      )}

      {/* Public key display */}
      {displayedKey && (
        <div className="panel" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0 }}>RSA-2048 Public Key (X.509 PEM)</h3>
              <p className="sub" style={{ margin: "2px 0 0" }}>This is the only key that should be distributed to verifying devices</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="secondary-button" style={{ fontSize: 12, padding: "5px 12px" }}
                onClick={() => copy(displayedKey, "pem")}>
                {copiedField === "pem" ? <Check size={13} style={{ color: "var(--green)" }} /> : <Copy size={13} />}
                {copiedField === "pem" ? "Copied!" : "Copy"}
              </button>
              <button className="secondary-button" style={{ fontSize: 12, padding: "5px 12px" }}
                onClick={() => downloadPem(displayedKey, "public_key.pem")}>
                <Download size={13} /> Download
              </button>
            </div>
          </div>
          <pre style={{
            fontFamily: "var(--font-mono, monospace)", fontSize: 11.5, lineHeight: 1.6,
            background: "var(--bg-input, #0a1019)", padding: 14, borderRadius: 6,
            border: "1px solid var(--border)", color: "var(--cyan)",
            overflowX: "auto", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all"
          }}>
            {displayedKey}
          </pre>
        </div>
      )}

      {/* Key provisioning notes */}
      <div className="panel" style={{ padding: 18 }}>
        <h3 style={{ marginBottom: 12 }}>Key Provisioning — What We Do & Don't Build</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Concern</th><th>ModelGuard Stance</th><th>Rationale</th></tr>
            </thead>
            <tbody>
              {[
                ["Private key storage", "Server-side only; never returned by API", "Private key leakage breaks all future verifications"],
                ["Public key distribution", "Out-of-band (manual / device provisioning)", "If public key came with model over same channel, attacker can replace both"],
                ["Multiple publishers", "Single key in base build; registry is future work", "Extension is straightforward — add publisher_id → public_key lookup"],
                ["Key rotation", "Not automated in v1.0", "Rotation requires re-signing all models; manageable future extension"],
                ["HSM / hardware key", "Not implemented", "Production recommendation — private key in HSM prevents exfiltration"],
              ].map(([concern, stance, rationale]) => (
                <tr key={concern}>
                  <td style={{ fontWeight: 500 }}>{concern}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{stance}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
