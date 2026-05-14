import { theme as T } from '../theme'
import Sheet from '../components/Sheet'
import { Button } from '../components/UI'

export default function UnmatchedSheet({ theme = T, items, onClose }) {
  return (
    <Sheet theme={theme} onClose={onClose}
      title="Not on Instamart right now"
      subtitle={items.length === 1
        ? "One ingredient we couldn't source. It won't be part of this order."
        : `${items.length} ingredients we couldn't source. They won't be part of this order.`}
    >
      {items.length === 0 ? (
        <div style={{ padding: 22, textAlign: 'center' }}>
          <div style={{ color: theme.ink2, fontSize: 14 }}>All handled. Nice.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: `${theme.warn}0e`, border: `1px solid ${theme.warn}33`,
              borderRadius: 14, padding: 14,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: theme.surface,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0, opacity: 0.85,
              }}>😔</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink, letterSpacing: '-0.01em' }}>
                  {item.name}
                </div>
                <div style={{ marginTop: 3, color: theme.warn, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.02em' }}>
                  Not available
                </div>
                <div style={{ color: theme.ink3, fontSize: 11, marginTop: 2, fontFamily: theme.font.mono }}>
                  Need {item.qty} · pick this up at any kirana
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: 14, padding: 12,
        background: theme.surface, borderRadius: 12,
        color: theme.ink2, fontSize: 12, lineHeight: 1.45,
      }}>
        Tadka only orders what Instamart stocks at <strong style={{ color: theme.ink }}>your pincode</strong>. Anything missing here, grab from your local store — we'll get the rest to you in 10 minutes.
      </div>

      <div style={{ marginTop: 14, padding: '0 4px' }}>
        <Button theme={theme} fullWidth onClick={onClose}>Got it</Button>
      </div>
    </Sheet>
  )
}
