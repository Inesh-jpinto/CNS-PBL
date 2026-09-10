import { useState, useCallback } from 'react'

export default function FileUpload({ label, accept, hint, onFile, file }) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFile(dropped)
  }, [onFile])

  const handleChange = (e) => {
    if (e.target.files[0]) onFile(e.target.files[0])
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {label && (
        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </label>
      )}
      <label
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input type="file" accept={accept} style={{ display: 'none' }} onChange={handleChange} />

        {file ? (
          <>
            <span className="upload-icon">✅</span>
            <div style={{ fontWeight: 600, color: 'var(--accent-green)', marginBottom: '0.25rem' }}>
              {file.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {formatSize(file.size)} · Click to change
            </div>
          </>
        ) : (
          <>
            <span className="upload-icon">⬆️</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Drop file here or click to browse
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{hint}</div>
          </>
        )}
      </label>
    </div>
  )
}
