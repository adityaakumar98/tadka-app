import { theme as T } from '../theme'

export default function Sheet({ theme = T, children, onClose, height = '78%', title, subtitle }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1000,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'fade-in .2s ease-out',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', padding: 0,
      }} />
      <div style={{
        position: 'relative', background: theme.bgRaised,
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.35)',
        maxHeight: height, display: 'flex', flexDirection: 'column',
        animation: 'sheet-up .35s cubic-bezier(.32,.72,0,1)',
        paddingBottom: `calc(24px + var(--safe-area-bottom, 0px))`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: theme.borderStrong }} />
        </div>
        {title && (
          <div style={{ padding: '6px 22px 14px' }}>
            <h2 style={{ margin: 0, fontFamily: theme.font.display, fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: theme.ink }}>{title}</h2>
            {subtitle && <div style={{ color: theme.ink3, fontSize: 12.5, marginTop: 4 }}>{subtitle}</div>}
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
