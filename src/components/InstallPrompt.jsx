import { useState, useEffect } from 'react'
import { theme } from '../theme'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('tadka-install-dismissed') === '1'
  )

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      if (!dismissed) setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
  }

  const dismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('tadka-install-dismissed', '1')
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 2000,
      padding: '0 16px 24px',
      animation: 'sheet-up .35s cubic-bezier(.32,.72,0,1)',
    }}>
      <div style={{
        background: theme.bgRaised,
        borderRadius: 20,
        padding: '16px 18px',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: theme.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="2.4" fill="#FAF6F0"/>
            <circle cx="12" cy="4"  r="1.9" fill="#E8A330"/>
            <circle cx="19" cy="8"  r="1.9" fill="#E8A330"/>
            <circle cx="19" cy="16" r="1.9" fill="#E8A330"/>
            <circle cx="5"  cy="8"  r="1.9" fill="#E8A330"/>
            <circle cx="5"  cy="16" r="1.9" fill="#E8A330"/>
            <circle cx="12" cy="20" r="1.9" fill="#E8A330"/>
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink, letterSpacing: '-0.01em' }}>
            Add Tadka to home screen
          </div>
          <div style={{ fontSize: 12, color: theme.ink3, marginTop: 2, fontFamily: theme.font.mono }}>
            Instant access · works offline
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={dismiss} style={{
            padding: '8px 12px', borderRadius: 10,
            background: theme.surface, border: 'none', cursor: 'pointer',
            color: theme.ink2, fontSize: 13, fontWeight: 500,
          }}>Later</button>
          <button onClick={install} style={{
            padding: '8px 14px', borderRadius: 10,
            background: theme.accent, border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: 13, fontWeight: 600,
          }}>Install</button>
        </div>
      </div>
    </div>
  )
}
