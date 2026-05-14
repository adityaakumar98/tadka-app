import { theme as T } from '../theme'
import { ReelTile, Icons } from '../components/UI'

export default function ReelExpand({ theme = T, recipe, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1100,
      background: '#000', animation: 'fade-in .2s ease-out',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '54px 16px 8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          width: 38, height: 38, borderRadius: 999, border: 'none',
          background: 'rgba(255,255,255,0.12)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icons.X size={18} />
        </button>
        <div style={{ color: '#fff', fontSize: 12, fontFamily: theme.font.mono, opacity: 0.6 }}>
          {recipe.reelHandle}
        </div>
        <div style={{ width: 38 }} />
      </div>
      <div style={{ flex: 1, padding: 22, display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', aspectRatio: '9/16', borderRadius: 18, overflow: 'hidden' }}>
          <ReelTile recipe={recipe} theme={theme} height="100%" rounded={18} />
        </div>
      </div>
    </div>
  )
}
