import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import FileUpload from '../components/FileUpload'
import LoadingSpinner from '../components/LoadingSpinner'
import { useModel } from '../context/ModelContext'

const API = 'http://localhost:8000'

const RECENT_MOCK = [
  { name: 'original_model.pth',      status: 'VERIFIED', time: 'Demo — run publish first', ok: true  },
  { name: 'tampered_model.pth',      status: 'TAMPERED',  time: 'Demo — after tamper step', ok: false },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const { handleFileUpload } = useModel()
  const [modelFile, setModelFile]       = useState(null)
  const [manifestFile, setManifestFile] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  const canVerify = modelFile && manifestFile && !loading

  function onSelectModelFile(file) {
    setModelFile(file);
    if (file) handleFileUpload(file);
  }

  const handleVerify = async () => {
    if (!canVerify) return
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('model', modelFile)
      form.append('manifest', manifestFile)

      const { data } = await axios.post(`${API}/api/verify`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })

      navigate('/result', { state: { result: data.result, modelName: modelFile.name } })
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Unknown error'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 780 }}>

        {/* Hero */}
        <div className="animate-fade-in-up" style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 12px var(--accent-cyan))' }}>⛨</span>
            <h1>Verify an AI Model</h1>
          </div>
          <p style={{ fontSize: '1.05rem', maxWidth: 560 }}>
            Upload a model file and its security manifest to confirm integrity and provenance
            before running it for inference.
          </p>
        </div>

        {/* Upload card */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s', marginBottom: '1.25rem' }}>
          {loading ? (
            <LoadingSpinner message="Verifying model integrity..." />
          ) : (
            <>
              <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                <FileUpload
                  label="AI Model File"
                  accept=".pt,.pth,.safetensors,.onnx"
                  hint=".pt  .pth  .safetensors  .onnx"
                  file={modelFile}
                  onFile={onSelectModelFile}
                />
                <FileUpload
                  label="Security Manifest"
                  accept=".json"
                  hint="model_manifest.json"
                  file={manifestFile}
                  onFile={setManifestFile}
                />
              </div>


              {/* Info row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 0.9rem',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.82rem', color: 'var(--text-secondary)'
              }}>
                <span>🔑</span>
                <span>
                  Publisher public key is loaded from the server's trust store — not from your upload.
                </span>
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
                className="btn btn-primary btn-lg"
                onClick={handleVerify}
                disabled={!canVerify}
                style={canVerify ? { animation: 'pulse-glow 2s ease-in-out infinite' } : {}}
              >
                ⛨ VERIFY MODEL
              </button>
            </>
          )}
        </div>

        {/* Recent verifications */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Demo Cases
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {RECENT_MOCK.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1rem' }}>{item.ok ? '🟢' : '🔴'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge ${item.ok ? 'badge-green' : 'badge-red'}`}>{item.status}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Run <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>python publisher/publish_model.py</code> to generate demo files.
          </div>
        </div>

      </div>
    </div>
  )
}
