import { useLocation, useNavigate } from 'react-router-dom'
import VerificationResult from '../components/VerificationResult'

export default function ResultPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()

  if (!state?.result) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 780, textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛨</div>
          <h2 style={{ marginBottom: '0.5rem' }}>No result to display</h2>
          <p style={{ marginBottom: '1.5rem' }}>Please upload a model and manifest first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            ← Go to Verify
          </button>
        </div>
      </div>
    )
  }

  const { result, modelName } = state

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 780 }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.35rem 0.8rem' }}
            onClick={() => navigate('/')}
          >
            ← Back
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Verification result for
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
            {modelName}
          </span>
        </div>

        <VerificationResult result={result} />

        {/* Action buttons */}
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Verify Another Model
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `verification_result_${Date.now()}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            ⬇ Download Result JSON
          </button>
        </div>

      </div>
    </div>
  )
}
