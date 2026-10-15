import { useState } from 'react'
import axios from 'axios'
import FileUpload from '../components/FileUpload'
import LoadingSpinner from '../components/LoadingSpinner'
import { useModel } from '../context/ModelContext'

const API = 'http://localhost:8000'

export default function PublishPage() {
  const { addNotification, formatSystemTime } = useModel()
  const [modelFile, setModelFile]     = useState(null)
  const [publisher, setPublisher]     = useState('ModelGuard Team')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [manifest, setManifest]       = useState(null)

  const handleModelSelect = (file) => {
    setModelFile(file)
    if (file && addNotification) {
      addNotification({
        type: "upload",
        title: "Model File Uploaded (Publish)",
        detail: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) — ready for Merkle publishing & signature`,
        time: formatSystemTime(new Date()),
      })
    }
  }

  const handlePublish = async () => {
    if (!modelFile || loading) return
    setLoading(true)
    setError(null)
    setManifest(null)

    try {
      const form = new FormData()
      form.append('model', modelFile)
      form.append('publisher_name', publisher)

      const { data } = await axios.post(`${API}/api/publish`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })
      setManifest(data.manifest)

      if (addNotification) {
        addNotification({
          type: "publisher",
          title: "Model Manifest Published",
          detail: `${modelFile.name} signed & manifest generated for ${publisher}`,
          time: formatSystemTime(new Date()),
        })
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const downloadManifest = () => {
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'model_manifest.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 780 }}>

        {/* Hero */}
        <div className="animate-fade-in-up" style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 12px var(--accent-purple))' }}>🔏</span>
            <h1 style={{ background: 'linear-gradient(135deg, var(--text-primary), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Publish a Model
            </h1>
          </div>
          <p style={{ fontSize: '1.05rem', maxWidth: 560 }}>
            Seal your trained model with a cryptographic manifest. Hashes every layer,
            builds a Merkle Tree, and signs the root with your RSA private key.
          </p>
        </div>

        {/* Publish card */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s', marginBottom: '1.25rem', borderColor: 'var(--border-bright)' }}>
          {loading ? (
            <LoadingSpinner message="Publishing model..." />
          ) : (
            <>
              <div style={{ marginBottom: '1.25rem' }}>
                <FileUpload
                  label="AI Model File"
                  accept=".pt,.pth,.safetensors,.onnx"
                  hint=".pt  .pth  .safetensors  .onnx"
                  file={modelFile}
                  onFile={handleModelSelect}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                  Publisher Name
                </label>
                <input
                  className="input"
                  value={publisher}
                  onChange={e => setPublisher(e.target.value)}
                  placeholder="e.g. ModelGuard Team"
                />
              </div>

              {/* Warning */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                padding: '0.65rem 0.9rem',
                background: 'rgba(251,191,36,0.07)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.82rem', color: 'var(--accent-amber)'
              }}>
                <span>⚠</span>
                <span>The private key must be generated first via <code style={{ fontFamily: 'var(--font-mono)' }}>python publisher/generate_keys.py</code> and stored on the server.</span>
              </div>

              {error && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.25)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent-red)',
                  fontSize: '0.88rem',
                  marginBottom: '1rem'
                }}>
                  ⚠ {error}
                </div>
              )}

              <button
                className="btn btn-lg"
                onClick={handlePublish}
                disabled={!modelFile || loading}
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                  color: 'white',
                  boxShadow: '0 0 20px rgba(167,139,250,0.3)'
                }}
              >
                🔏 PUBLISH MODEL
              </button>
            </>
          )}
        </div>

        {/* Manifest result */}
        {manifest && (
          <div className="card animate-fade-in-up" style={{
            borderColor: 'var(--accent-green)',
            boxShadow: 'var(--glow-green)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--accent-green)' }}>✅ Manifest Generated</h3>
              <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.35rem 0.8rem' }} onClick={downloadManifest}>
                ⬇ Download manifest.json
              </button>
            </div>

            {[
              ['Publisher', manifest.publisher],
              ['Format', manifest.model_format],
              ['Layers', manifest.layer_count],
              ['Merkle Root', manifest.merkle_root],
              ['Timestamp', manifest.timestamp],
            ].map(([label, val]) => (
              <div key={label} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem',
                padding: '0.6rem 0', borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontFamily: label === 'Merkle Root' ? 'var(--font-mono)' : undefined, fontSize: label === 'Merkle Root' ? '0.78rem' : '0.88rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {val?.toString()}
                </span>
              </div>
            ))}

            <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Share <strong style={{ color: 'var(--text-secondary)' }}>model_manifest.json</strong> alongside your model file.
              Users will upload both to ModelGuard Verify to confirm authenticity.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
