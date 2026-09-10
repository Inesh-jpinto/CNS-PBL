import { useState } from 'react'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button className="copy-btn" onClick={copy} title="Copy to clipboard">
      {copied ? '✓' : '⧉'}
    </button>
  )
}

function HashBox({ value }) {
  if (!value) return null
  return (
    <div className="hash-box">
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
      <CopyBtn text={value} />
    </div>
  )
}

function InfoRow({ label, children, mono }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem',
      padding: '0.7rem 0', borderBottom: '1px solid var(--border)'
    }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, paddingTop: '0.1rem' }}>
        {label}
      </span>
      <span style={{ fontFamily: mono ? 'var(--font-mono)' : undefined, fontSize: mono ? '0.82rem' : '0.9rem' }}>
        {children}
      </span>
    </div>
  )
}

export default function VerificationResult({ result }) {
  const [showLayers, setShowLayers] = useState(false)

  if (!result) return null

  const verified = result.valid
  const accentColor = verified ? 'var(--accent-green)' : 'var(--accent-red)'
  const glowVar = verified ? 'var(--glow-green)' : 'var(--glow-red)'

  return (
    <div className="card animate-fade-in-up" style={{
      borderColor: accentColor,
      boxShadow: glowVar,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div className={`result-header ${verified ? 'result-header-verified' : 'result-header-rejected'}`}>
        <span className="result-icon" style={{ color: accentColor }}>
          {verified ? '✅' : '❌'}
        </span>
        <div>
          <h2 style={{ color: accentColor, marginBottom: '0.25rem' }}>
            {verified ? 'MODEL VERIFIED' : 'MODEL REJECTED'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {result.message}
          </p>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '1.5rem' }}>
        <InfoRow label="Publisher">
          <span style={{ fontWeight: 600 }}>{result.publisher || '—'}</span>
        </InfoRow>

        <InfoRow label="Signature">
          <span className={`badge ${result.signature_valid ? 'badge-green' : 'badge-red'}`}>
            {result.signature_valid ? '✓ VALID (RSA-SHA256)' : '✗ INVALID'}
          </span>
        </InfoRow>

        <InfoRow label="Merkle Root Match">
          <span className={`badge ${result.merkle_match ? 'badge-green' : 'badge-red'}`}>
            {result.merkle_match ? '✓ MATCH' : '✗ MISMATCH'}
          </span>
        </InfoRow>

        <InfoRow label="Layers Checked">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
            {result.layer_count_uploaded} / {result.layer_count_manifest}
            {result.layer_count_manifest === result.layer_count_uploaded
              ? ' ✓' : ' ⚠ count mismatch'}
          </span>
        </InfoRow>

        <InfoRow label="Tampered Layers">
          {result.tampered_layers?.length > 0 ? (
            <span className="badge badge-red">
              ⚠ {result.tampered_layers.length} layer{result.tampered_layers.length > 1 ? 's' : ''} changed
            </span>
          ) : (
            <span className="badge badge-green">NONE</span>
          )}
        </InfoRow>

        <InfoRow label="Merkle Root (Manifest)" mono>
          <HashBox value={result.merkle_root_manifest} />
        </InfoRow>

        {!result.merkle_match && (
          <InfoRow label="Merkle Root (Computed)" mono>
            <HashBox value={result.merkle_root_computed} />
          </InfoRow>
        )}

        {/* Tampered layer details */}
        {result.tampered_layer_details?.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{
              background: 'rgba(248,113,113,0.06)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}>
              <h4 style={{ color: 'var(--accent-red)', marginBottom: '0.75rem' }}>
                ⚠ Tampered Layer Details
              </h4>
              {result.tampered_layer_details.map((d, i) => (
                <div key={i} style={{
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  border: '1px solid rgba(248,113,113,0.15)'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--accent-red)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    Layer {d.index}: {d.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Expected:</div>
                  <HashBox value={d.expected} />
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem', marginTop: '0.4rem' }}>Actual:</div>
                  <HashBox value={d.actual} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status banner */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: verified
            ? 'rgba(52,211,153,0.08)'
            : 'rgba(248,113,113,0.08)',
          border: `1px solid ${verified ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>{verified ? '🟢' : '🔴'}</span>
          <div>
            <div style={{ fontWeight: 700, color: accentColor, fontSize: '0.95rem' }}>
              {verified ? 'SAFE TO RUN' : 'EXECUTION BLOCKED'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {verified
                ? 'This model matches its signed manifest. Integrity confirmed.'
                : 'Do not use this model for inference. It may have been tampered with.'}
            </div>
          </div>
        </div>

        {/* Layer table toggle */}
        {result.layer_count_manifest > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}
              onClick={() => setShowLayers(v => !v)}
            >
              {showLayers ? '▲ Hide' : '▼ Show'} all {result.layer_count_manifest} layers
            </button>

            {showLayers && result.tampered_layer_details !== undefined && (
              <div style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
                <table className="layer-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Layer Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: result.layer_count_manifest }, (_, i) => {
                      const tampered = result.tampered_layer_details?.find(d => d.index === i)
                      return (
                        <tr key={i} className={tampered ? 'tampered' : 'ok'}>
                          <td>{i}</td>
                          <td>{tampered ? tampered.name : `layer_${i}`}</td>
                          <td>{tampered ? '❌ TAMPERED' : '✅ OK'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
