import { useState } from "react";
import { Key, ShieldCheck, AlertTriangle, Play, Info, RefreshCw, Copy, Check, Cpu, BookOpen } from "lucide-react";
import axios from "axios";

const API = "http://localhost:8000";

// ─── Math helpers (pure JS, no library) ───────────────────────────────────────

function modExp(base, exp, mod) {
  // BigInt modular exponentiation
  base = BigInt(base); exp = BigInt(exp); mod = BigInt(mod);
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

function gcd(a, b) {
  a = BigInt(a); b = BigInt(b);
  while (b > 0n) { [a, b] = [b, a % b]; }
  return a;
}

function modInverse(a, m) {
  // Extended Euclidean Algorithm
  a = BigInt(a); m = BigInt(m);
  let [g, x] = extGcd(a, m);
  if (g !== 1n) throw new Error("No modular inverse");
  return ((x % m) + m) % m;
}

function extGcd(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  let [g, x1, y1] = extGcd(b, a % b);
  return [g, y1, x1 - (a / b) * y1];
}

// Small primes for demo (NOT cryptographically secure — only for visualisation)
const DEMO_PRIMES = [
  { p: 23n, label: "p = 23 (tiny demo)" },
  { p: 47n, label: "p = 47 (small demo)" },
  { p: 89n, label: "p = 89 (small demo)" },
  { p: 127n, label: "p = 127 (medium demo)" },
  { p: 251n, label: "p = 251 (medium demo)" },
];

function hashToBigInt(str, mod) {
  // Simple polynomial hash → reduced mod (p-1)
  let h = 0n;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31n + BigInt(str.charCodeAt(i))) % mod;
  }
  return h === 0n ? 1n : h;
}

export default function ElGamalDemoPage() {
  const [prime, setPrime] = useState(DEMO_PRIMES[2]);
  const [g, setG] = useState("2");
  const [privateX, setPrivateX] = useState("");
  const [publicY, setPublicY] = useState("");
  const [message, setMessage] = useState("ModelGuard-Merkle-Root");
  const [sigR, setSigR] = useState("");
  const [sigS, setSigS] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [step, setStep] = useState(0); // 0=keygen, 1=sign, 2=verify
  const [copiedField, setCopiedField] = useState("");
  const [apiResult, setApiResult] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  const p = prime.p;
  const pMinus1 = p - 1n;

  // ── Key Generation ──────────────────────────────────────────────────────────
  function generateKeys() {
    const gVal = BigInt(g || "2");
    // Pick random x in [2, p-2]
    let x;
    do {
      x = BigInt(Math.floor(Math.random() * Number(pMinus1 - 2n)) + 2);
    } while (gcd(x, pMinus1) !== 1n);

    const y = modExp(gVal, x, p);
    setPrivateX(x.toString());
    setPublicY(y.toString());
    setSigR(""); setSigS(""); setVerifyResult(null);
    setStep(1);
  }

  // ── Sign ────────────────────────────────────────────────────────────────────
  function signMessage() {
    if (!privateX || !publicY) return;
    const gVal = BigInt(g || "2");
    const x = BigInt(privateX);
    const m = hashToBigInt(message, pMinus1);

    // Choose k coprime to p-1
    let k;
    let attempts = 0;
    do {
      k = BigInt(Math.floor(Math.random() * Number(pMinus1 - 2n)) + 2);
      if (++attempts > 200) break;
    } while (gcd(k, pMinus1) !== 1n);

    const r = modExp(gVal, k, p);
    const kInv = modInverse(k, pMinus1);
    // s = (m - x*r) * k^{-1} mod (p-1)
    let s = ((m - x * r % pMinus1) * kInv) % pMinus1;
    if (s < 0n) s += pMinus1;

    setSigR(r.toString());
    setSigS(s.toString());
    setVerifyResult(null);
    setStep(2);
  }

  // ── Verify ──────────────────────────────────────────────────────────────────
  function verifySignature() {
    if (!publicY || !sigR || !sigS) return;
    const gVal = BigInt(g || "2");
    const y = BigInt(publicY);
    const r = BigInt(sigR);
    const s = BigInt(sigS);
    const m = hashToBigInt(message, pMinus1);

    if (r <= 0n || r >= p) { setVerifyResult("invalid"); return; }
    if (s <= 0n || s >= pMinus1) { setVerifyResult("invalid"); return; }

    // g^m mod p
    const left = modExp(gVal, m, p);
    // y^r * r^s mod p
    const yr = modExp(y, r, p);
    const rs = modExp(r, s, p);
    const right = (yr * rs) % p;

    setVerifyResult(left === right ? "valid" : "invalid");
  }

  function tamperMessage() {
    setMessage(m => m + "_TAMPERED");
    setVerifyResult(null);
  }

  function copy(val, field) {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1500);
  }

  async function runServerSelfTest() {
    setApiLoading(true);
    setApiResult(null);
    try {
      const { data } = await axios.get(`${API}/api/elgamal-selftest?bit_length=512`, { timeout: 60000 });
      setApiResult(data);
    } catch (e) {
      setApiResult({ success: false, result: "ERROR", output: e.response?.data?.detail || e.message });
    } finally {
      setApiLoading(false);
    }
  }

  const stepDone = (s) => step > s;
  const stepActive = (s) => step === s;

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <h2>ElGamal Signature — Interactive Demo</h2>
          <p>Visualise textbook ElGamal key generation, signing, and verification step-by-step</p>
        </div>
        <button className="secondary-button" onClick={runServerSelfTest} disabled={apiLoading} id="elgamal-server-test-btn">
          {apiLoading ? <RefreshCw size={15} className="spin" /> : <Play size={15} />}
          {apiLoading ? "Running…" : "Server Self-Test (Java)"}
        </button>
      </div>

      {/* Server self-test result */}
      {apiResult && (
        <div style={{
          padding: "14px 18px", borderRadius: "var(--radius-md)", marginBottom: 18,
          background: apiResult.success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${apiResult.success ? "var(--green)" : "var(--red)"}`,
          display: "flex", gap: 12, alignItems: "flex-start"
        }}>
          {apiResult.success ? <ShieldCheck size={20} style={{ color: "var(--green)", flexShrink: 0 }} />
            : <AlertTriangle size={20} style={{ color: "var(--red)", flexShrink: 0 }} />}
          <div>
            <strong style={{ color: apiResult.success ? "var(--green)" : "var(--red)" }}>
              Java ElGamal Self-Test: {apiResult.result}
            </strong>
            {apiResult.output && (
              <pre style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                {apiResult.output}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Theory note */}
      <div style={{
        display: "flex", gap: 12, background: "var(--surface)", border: "1px solid var(--border)",
        padding: 14, borderRadius: "var(--radius-md)", marginBottom: 18
      }}>
        <BookOpen size={20} style={{ color: "var(--cyan)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>ElGamal Signature Scheme (Textbook)</strong><br />
          <strong>Key Gen:</strong> Pick prime <em>p</em>, generator <em>g</em>, private key <em>x</em>; compute public key <em>y = g<sup>x</sup> mod p</em>.<br />
          <strong>Sign:</strong> Pick random <em>k</em> coprime to <em>p−1</em>; compute <em>r = g<sup>k</sup> mod p</em> and <em>s = (m − xr)k<sup>−1</sup> mod (p−1)</em>.<br />
          <strong>Verify:</strong> Check that <em>g<sup>m</sup> ≡ y<sup>r</sup>·r<sup>s</sup> (mod p)</em>.<br />
          <em style={{ color: "var(--text-muted)" }}>⚠ Small primes are used here only for visualisation. ModelGuard's production layer uses RSA-2048 (see the Signature page).</em>
        </div>
      </div>

      {/* Step pipeline */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "center" }}>
        {["1. Key Gen", "2. Sign", "3. Verify"].map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: stepDone(i) ? "rgba(34,197,94,0.15)" : stepActive(i) ? "rgba(34,211,238,0.15)" : "var(--surface)",
              border: `1px solid ${stepDone(i) ? "var(--green)" : stepActive(i) ? "var(--cyan)" : "var(--border)"}`,
              color: stepDone(i) ? "var(--green)" : stepActive(i) ? "var(--cyan)" : "var(--text-muted)"
            }}>{label}</span>
            {i < 2 && <span style={{ color: "var(--text-muted)", fontSize: 18 }}>→</span>}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>

        {/* Key Generation */}
        <div className="panel" style={{ padding: 18 }}>
          <h3 style={{ marginBottom: 4 }}>① Key Generation</h3>
          <p className="sub" style={{ marginBottom: 14 }}>Choose prime p and generator g</p>

          <label className="field-label">Prime p</label>
          <select
            className="text-input"
            style={{ marginBottom: 10 }}
            value={prime.label}
            onChange={e => { setPrime(DEMO_PRIMES.find(d => d.label === e.target.value)); setStep(0); setSigR(""); setSigS(""); setVerifyResult(null); setPrivateX(""); setPublicY(""); }}
          >
            {DEMO_PRIMES.map(d => <option key={d.label}>{d.label}</option>)}
          </select>

          <label className="field-label">Generator g</label>
          <input className="text-input" style={{ marginBottom: 14 }} value={g}
            onChange={e => { setG(e.target.value); setStep(0); }} placeholder="2" />

          <div style={{ background: "rgba(34,211,238,0.05)", borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "var(--text-muted)" }}>Private key x</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <code style={{ color: "var(--purple)" }}>{privateX || "—"}</code>
                {privateX && <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }} onClick={() => copy(privateX, "x")}>{copiedField === "x" ? <Check size={12} style={{ color: "var(--green)" }} /> : <Copy size={12} />}</button>}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Public key y = g^x mod p</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <code style={{ color: "var(--cyan)" }}>{publicY || "—"}</code>
                {publicY && <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }} onClick={() => copy(publicY, "y")}>{copiedField === "y" ? <Check size={12} style={{ color: "var(--green)" }} /> : <Copy size={12} />}</button>}
              </div>
            </div>
          </div>

          <button id="elgamal-keygen-btn" className="primary-button" style={{ width: "100%" }} onClick={generateKeys}>
            <Key size={15} /> Generate Key Pair
          </button>
        </div>

        {/* Sign */}
        <div className="panel" style={{ padding: 18, opacity: step < 1 ? 0.5 : 1 }}>
          <h3 style={{ marginBottom: 4 }}>② Sign</h3>
          <p className="sub" style={{ marginBottom: 14 }}>Sign Merkle root with private key</p>

          <label className="field-label">Message / Merkle Root</label>
          <input className="text-input" style={{ marginBottom: 10 }} value={message}
            onChange={e => { setMessage(e.target.value); setVerifyResult(null); }} />

          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
            m = hash(msg) mod (p−1) = <code style={{ color: "var(--orange)" }}>
              {step >= 1 ? hashToBigInt(message, pMinus1).toString() : "—"}
            </code>
          </div>

          <div style={{ background: "rgba(139,92,246,0.06)", borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "var(--text-muted)" }}>r = g^k mod p</span>
              <code style={{ color: "var(--purple)" }}>{sigR || "—"}</code>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>s = (m−xr)k⁻¹ mod (p−1)</span>
              <code style={{ color: "var(--purple)" }}>{sigS || "—"}</code>
            </div>
          </div>

          <button id="elgamal-sign-btn" className="primary-button" style={{ width: "100%", background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
            onClick={signMessage} disabled={step < 1}>
            <Cpu size={15} /> Sign Message
          </button>
        </div>

        {/* Verify */}
        <div className="panel" style={{ padding: 18, opacity: step < 2 ? 0.5 : 1 }}>
          <h3 style={{ marginBottom: 4 }}>③ Verify</h3>
          <p className="sub" style={{ marginBottom: 14 }}>Check g^m ≡ y^r · r^s (mod p)</p>

          <div style={{ fontSize: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-muted)" }}>left = g^m mod p</span>
              <code style={{ color: "var(--cyan)" }}>
                {step >= 2 ? modExp(BigInt(g || "2"), hashToBigInt(message, pMinus1), p).toString() : "—"}
              </code>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ color: "var(--text-muted)" }}>right = y^r·r^s mod p</span>
              <code style={{ color: "var(--cyan)" }}>
                {step >= 2 && sigR && sigS && publicY
                  ? ((modExp(BigInt(publicY), BigInt(sigR), p) * modExp(BigInt(sigR), BigInt(sigS), p)) % p).toString()
                  : "—"}
              </code>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button id="elgamal-verify-btn" className="secondary-button" style={{ flex: 1 }}
              onClick={verifySignature} disabled={step < 2}>
              <ShieldCheck size={14} /> Verify
            </button>
            <button className="secondary-button" style={{ flex: 1 }}
              onClick={tamperMessage} disabled={step < 2}>
              <AlertTriangle size={14} /> Tamper Msg
            </button>
          </div>

          {verifyResult && (
            <div style={{
              padding: "10px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
              background: verifyResult === "valid" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${verifyResult === "valid" ? "var(--green)" : "var(--red)"}`,
              color: verifyResult === "valid" ? "var(--green)" : "var(--red)"
            }}>
              {verifyResult === "valid"
                ? <><ShieldCheck size={18} /> SIGNATURE VALID — Authentic Origin</>
                : <><AlertTriangle size={18} /> SIGNATURE INVALID — Tampered / Wrong Key</>}
            </div>
          )}
        </div>
      </div>

      {/* Comparison table */}
      <div className="panel" style={{ padding: 18 }}>
        <h3 style={{ marginBottom: 12 }}>ElGamal vs RSA vs Plain Hash — Comparison</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Plain SHA-256</th>
                <th>RSA-2048 (ModelGuard Production)</th>
                <th>ElGamal (Academic Demo)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Detects tampering?", "✅ Yes", "✅ Yes", "✅ Yes"],
                ["Proves origin?", "❌ No", "✅ Yes", "✅ Yes"],
                ["Layer-level localisation?", "❌ No", "✅ Yes (via Merkle)", "✅ Yes (via Merkle)"],
                ["Randomised signature?", "—", "❌ Deterministic", "✅ Yes (k is random)"],
                ["Key size for 128-bit security", "—", "3072 bits", "~3072 bits (DL hard)"],
                ["JDK built-in?", "✅ Yes", "✅ Yes", "Partially (BigInteger only)"],
                ["Signature size", "—", "Fixed (key size)", "2× element (r, s)"],
              ].map(([prop, ...vals]) => (
                <tr key={prop}>
                  <td style={{ fontWeight: 500 }}>{prop}</td>
                  {vals.map((v, i) => (
                    <td key={i} style={{ color: v.startsWith("✅") ? "var(--green)" : v.startsWith("❌") ? "var(--red)" : "var(--text-secondary)" }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
