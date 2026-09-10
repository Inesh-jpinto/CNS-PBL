export default function LoadingSpinner({ message = 'Verifying model...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '4rem 2rem', gap: '1.5rem'
    }}>
      {/* Animated shield */}
      <div style={{
        fontSize: '4rem', lineHeight: 1,
        animation: 'shield-pulse 1.5s ease-in-out infinite',
        filter: 'drop-shadow(0 0 16px var(--accent-cyan))'
      }}>
        ⛨
      </div>

      {/* Scan bar */}
      <div className="scan-container" style={{
        width: '280px', height: '4px',
        background: 'var(--bg-surface-2)',
        borderRadius: '2px', overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
          animation: 'scan-line 1.4s linear infinite',
          position: 'relative'
        }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {message}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Hashing layers · Building Merkle Tree · Verifying signature
        </div>
      </div>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: 'var(--accent-cyan)',
            animation: `pulse-glow 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
            opacity: 0.7
          }} />
        ))}
      </div>
    </div>
  )
}
