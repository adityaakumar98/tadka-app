import { useState, useEffect } from 'react'
import { theme as T } from '../theme'
import { Button, ReelTile, Icons } from '../components/UI'
import VideoPanel from '../components/VideoPanel'

function SectionLabel({ theme, children }) {
  return (
    <div style={{
      fontSize: 11, color: theme.ink3,
      fontFamily: theme.font.mono, letterSpacing: '0.08em', textTransform: 'uppercase',
      margin: '18px 2px 8px',
    }}>{children}</div>
  )
}

export default function OrderPlacedScreen({ theme = T, recipe, chef, total, orderId, pincode, onBack, onMyRecipes }) {
  const [stage, setStage] = useState(0)
  const [recipeExpanded, setRecipeExpanded] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 2200)
    return () => clearTimeout(t1)
  }, [])

  const stages = [
    { k: 'placed',  label: 'Order placed',      t: 'Just now' },
    { k: 'packing', label: 'Picking & packing', t: 'In 1 min' },
    { k: 'out',     label: 'Out for delivery',  t: '~5 min' },
    { k: 'arrived', label: 'Arriving',          t: '12–14 min' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ padding: '14px 18px 0', display: 'flex' }}>
        <button onClick={onBack} aria-label="Close" style={{
          width: 38, height: 38, borderRadius: 999,
          background: theme.surface, border: 'none', color: theme.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icons.X size={18} />
        </button>
      </div>

      <div style={{ padding: '14px 24px 28px', textAlign: 'center' }}>
        <div style={{
          position: 'relative', width: 120, height: 120, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.accent}33 0%, transparent 65%)`,
            animation: 'pulse-dot 2.5s ease-in-out infinite',
          }} />
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: theme.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 12px 30px ${theme.accent}55`,
          }}>
            <Icons.Check size={42} color="#fff" />
          </div>
        </div>

        <h1 style={{
          margin: '18px 0 0',
          fontFamily: theme.font.display,
          fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em',
          color: theme.ink, lineHeight: 1.1,
        }}>Order placed, chef.</h1>
        <div style={{ marginTop: 8, fontSize: 14, color: theme.ink2, lineHeight: 1.4 }}>
          Your tadka starts in <strong style={{ color: theme.ink }}>12–14 minutes</strong>
        </div>

        <div style={{
          marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 999,
          background: theme.surface,
          color: theme.ink2, fontFamily: theme.font.mono, fontSize: 11, letterSpacing: '0.08em',
        }}>ORDER #{orderId}</div>
      </div>

      <div style={{ padding: '0 18px' }}>
        <div style={{
          background: theme.bgRaised, borderRadius: 16,
          border: `1px solid ${theme.border}`, padding: '18px 16px',
        }}>
          {stages.map((s, i) => {
            const done = i < stage
            const active = i === stage
            const pending = i > stage
            return (
              <div key={s.k} style={{ display: 'flex', gap: 12, paddingBottom: i < stages.length - 1 ? 12 : 0, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: done ? theme.accent : 'transparent',
                    border: done ? 'none' : `1.5px solid ${active ? theme.accent : theme.ink3}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done && <Icons.Check size={11} color="#fff" />}
                    {active && (
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', background: theme.accent,
                        animation: 'pulse-dot 1.2s ease-in-out infinite',
                      }} />
                    )}
                  </div>
                  {i < stages.length - 1 && (
                    <div style={{
                      width: 2, flex: 1, marginTop: 2, minHeight: 18,
                      background: done ? theme.accent : theme.border,
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: 2 }}>
                  <div style={{
                    fontSize: 14, fontWeight: active ? 600 : 500,
                    color: pending ? theme.ink3 : theme.ink, letterSpacing: '-0.01em',
                  }}>{s.label}</div>
                  <div style={{
                    fontSize: 11.5, color: pending ? theme.ink3 : theme.ink2,
                    fontFamily: theme.font.mono, marginTop: 2,
                  }}>{s.t}</div>
                </div>
              </div>
            )
          })}
        </div>

        <SectionLabel theme={theme}>While you wait — keep watching the recipe</SectionLabel>
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${theme.border}`, background: theme.bgRaised,
        }}>
          <div style={{ height: 220, position: 'relative' }}>
            <VideoPanel theme={theme} recipe={recipe} mode="compact" height="100%" onExpand={() => setRecipeExpanded(true)} />
          </div>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: theme.font.display, fontSize: 15, fontWeight: 500,
                letterSpacing: '-0.01em', color: theme.ink, lineHeight: 1.15,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{recipe.title}</div>
              <div style={{ color: theme.ink3, fontSize: 11, marginTop: 2, fontFamily: theme.font.mono }}>
                Chef {chef.name} · {recipe.reelDuration} · {recipe.time} cook time
              </div>
            </div>
            <button onClick={() => setRecipeExpanded(true)} style={{
              padding: '7px 12px', borderRadius: 999,
              background: theme.surface, color: theme.ink, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontFamily: theme.font.body, flexShrink: 0,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
              Watch in full
            </button>
          </div>
        </div>

        <div style={{
          marginTop: 14, padding: 14,
          background: theme.bgRaised, borderRadius: 14,
          border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 44, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
            <ReelTile recipe={recipe} theme={theme} height={56} rounded={8} showOverlay={false} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: theme.ink, letterSpacing: '-0.01em' }}>{recipe.title}</div>
            <div style={{ color: theme.ink3, fontSize: 11, marginTop: 2, fontFamily: theme.font.mono, letterSpacing: '0.02em' }}>
              ₹{total} · COD · to {pincode}
            </div>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: `${theme.success}22`, color: theme.success,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>COD</span>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 24 }}>
          <Button theme={theme} fullWidth variant="surface" onClick={onMyRecipes}>
            <Icons.Bookmark size={14} /> Save recipe & cook later
          </Button>
          <div style={{
            textAlign: 'center', color: theme.ink3, fontSize: 11,
            fontFamily: theme.font.mono, letterSpacing: '0.04em', marginTop: 4,
          }}>
            We'll text updates to your number · order fulfilled by Swiggy Instamart
          </div>
        </div>
      </div>

      {recipeExpanded && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1300,
          background: '#000', animation: 'fade-in .25s ease-out',
        }}>
          <VideoPanel theme={theme} recipe={recipe} mode="fullscreen" onCollapse={() => setRecipeExpanded(false)} />
        </div>
      )}
    </div>
  )
}
