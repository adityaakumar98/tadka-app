import { useEffect, useState } from 'react'

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 600)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 600px)')
    const handler = (e) => setDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return desktop
}

export default function WebFrame({ children }) {
  const isDesktop = useIsDesktop()

  if (!isDesktop) return children

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Label above */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSize: 12, color: 'rgba(26,23,20,0.45)',
        letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600,
      }}>
        <span style={{ width: 24, height: 1, background: 'currentColor', opacity: 0.5 }} />
        Web preview · tadka v1
        <span style={{ width: 24, height: 1, background: 'currentColor', opacity: 0.5 }} />
      </div>

      {/* Phone shell */}
      <div style={{
        position: 'relative',
        width: 393,
        height: 852,
        borderRadius: 52,
        background: '#1A1714',
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.08),
          0 0 0 9px #1A1714,
          0 0 0 10px rgba(255,255,255,0.06),
          0 40px 80px rgba(0,0,0,0.35),
          0 12px 24px rgba(0,0,0,0.2)
        `,
        flexShrink: 0,
      }}>
        {/* Side buttons — volume */}
        <div style={{ position: 'absolute', left: -3, top: 140, width: 3, height: 32, borderRadius: '2px 0 0 2px', background: '#2a2724' }} />
        <div style={{ position: 'absolute', left: -3, top: 188, width: 3, height: 62, borderRadius: '2px 0 0 2px', background: '#2a2724' }} />
        <div style={{ position: 'absolute', left: -3, top: 264, width: 3, height: 62, borderRadius: '2px 0 0 2px', background: '#2a2724' }} />
        {/* Side button — power */}
        <div style={{ position: 'absolute', right: -3, top: 188, width: 3, height: 88, borderRadius: '0 2px 2px 0', background: '#2a2724' }} />

        {/* Screen bezel */}
        <div style={{
          position: 'absolute', inset: 8,
          borderRadius: 46,
          background: '#FAF6F0',
          overflow: 'hidden',
        }}>
          {/* Dynamic island */}
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            width: 120, height: 34, borderRadius: 20,
            background: '#1A1714',
            zIndex: 100,
          }} />

          {/* Status bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 54,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            padding: '0 28px 8px',
            zIndex: 99,
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: '"Inter", system-ui', color: '#1A1714', letterSpacing: '-0.01em' }}>
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {/* Signal */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                {[2, 4, 6, 8].map((h, i) => (
                  <rect key={i} x={i * 4} y={12 - h} width="3" height={h} rx="1" fill={i < 3 ? '#1A1714' : '#1A171440'} />
                ))}
              </svg>
              {/* WiFi */}
              <svg width="15" height="12" viewBox="0 0 15 12" fill="#1A1714">
                <path d="M7.5 10.5a1 1 0 110-2 1 1 0 010 2z"/>
                <path d="M4.5 7.5a4.5 4.5 0 016 0" stroke="#1A1714" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                <path d="M2 5a8 8 0 0111 0" stroke="#1A1714" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
              </svg>
              {/* Battery */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <div style={{ width: 22, height: 11, borderRadius: 3, border: '1px solid #1A1714', padding: '1.5px', display: 'flex', alignItems: 'stretch' }}>
                  <div style={{ flex: '0 0 78%', background: '#1A1714', borderRadius: 1.5 }} />
                </div>
                <div style={{ width: 2, height: 5, background: '#1A1714', borderRadius: '0 1px 1px 0' }} />
              </div>
            </div>
          </div>

          {/* App content — pushed down by status bar */}
          <div style={{
            position: 'absolute', inset: 0,
            paddingTop: 54,
            paddingBottom: 34,
            overflow: 'hidden',
          }}>
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
              {children}
            </div>
          </div>

          {/* Home indicator */}
          <div style={{
            position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
            width: 134, height: 5, borderRadius: 3,
            background: 'rgba(26,23,20,0.25)',
            zIndex: 99,
          }} />
        </div>
      </div>

      {/* Caption below */}
      <div style={{
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSize: 11, color: 'rgba(26,23,20,0.38)',
        letterSpacing: '0.04em',
      }}>
        393 × 852 · iPhone 15 Pro
      </div>
    </div>
  )
}
