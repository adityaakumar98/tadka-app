import { theme as T } from '../theme'
import Sheet from '../components/Sheet'
import { ProductSwatch, Icons } from '../components/UI'

export default function SwapSheet({ theme = T, ingredient, alternatives, currentSwap, onChoose, onClose }) {
  return (
    <Sheet theme={theme} onClose={onClose}
      title={`Swap ${ingredient.name.toLowerCase()}`}
      subtitle={`${alternatives.length} alternatives on Instamart`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alternatives.map(alt => {
          const isCurrent = (currentSwap || ingredient.brand) === alt.brand || alt.id === currentSwap
          return (
            <button key={alt.id} onClick={() => onChoose(alt.id)} style={{
              width: '100%', textAlign: 'left', cursor: 'pointer',
              background: theme.surface,
              border: `1.5px solid ${isCurrent ? theme.accent : 'transparent'}`,
              borderRadius: 14, padding: 12,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <ProductSwatch color={alt.swatch} size={52} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink }}>{alt.brand}</div>
                  {alt.chefPick && (
                    <span style={{
                      padding: '1px 6px', borderRadius: 999,
                      background: `${theme.marigold}22`, color: theme.marigold,
                      fontSize: 9.5, fontWeight: 600, letterSpacing: '0.04em',
                    }}>★ CHEF'S PICK</span>
                  )}
                </div>
                <div style={{ color: theme.ink2, fontSize: 12, marginTop: 4 }}>
                  {alt.size} · ★ {alt.rating}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: theme.font.display, fontSize: 15, fontWeight: 600, color: theme.ink }}>₹{alt.price}</div>
                <div style={{
                  marginTop: 6, padding: '4px 10px', borderRadius: 999,
                  background: isCurrent ? theme.accent : 'transparent',
                  color: isCurrent ? '#fff' : theme.accent,
                  border: isCurrent ? 'none' : `1px solid ${theme.accent}55`,
                  fontSize: 11, fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                }}>
                  {isCurrent && <Icons.Check size={11} />} {isCurrent ? 'Picked' : 'Choose'}
                </div>
              </div>
            </button>
          )
        })}

        <button style={{
          marginTop: 6, padding: 14,
          background: 'transparent', border: `1px dashed ${theme.border}`,
          borderRadius: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: theme.ink2, fontSize: 13,
        }}>
          <Icons.Search size={14} /> Search Instamart manually
        </button>
      </div>
    </Sheet>
  )
}
