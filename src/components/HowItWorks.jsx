import { useState, useEffect } from 'react'
import { theme as T } from '../theme'

export default function HowItWorks({ theme = T }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPct(p => (p + 6) % 110), 180)
    return () => clearInterval(t)
  }, [])

  const steps = [
    {
      n: '01', label: 'Paste a Reel',
      sub: 'Instagram, YouTube Shorts, or anything saved. One URL, no signup.',
      meta: 'YOU',
      visual: (
        <div style={{
          width: 84, height: 64, borderRadius: 10,
          background: `linear-gradient(135deg, ${theme.accent}22 0%, ${theme.marigold}22 100%)`,
          border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: theme.font.mono, fontSize: 9.5,
          color: theme.ink2, letterSpacing: '0.02em',
          padding: '0 8px', textAlign: 'center', lineHeight: 1.3,
          overflow: 'hidden',
        }}>
          instagram.com<br/>/reels/…<span style={{ color: theme.accent }}>▍</span>
        </div>
      ),
    },
    {
      n: '02', label: 'We build the cart',
      sub: "Sanjyot's Tata Sampann, Ranveer's MDH, Mother Dairy paneer — chef-aligned ingredients sourced from Instamart, brand by brand.",
      meta: 'TADKA',
      featured: true,
      visual: (
        <div style={{
          width: 84, height: 64, borderRadius: 10,
          background: theme.bgRaised,
          border: `1.5px solid ${theme.accent}55`,
          padding: 8, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: theme.accent,
              animation: 'pulse-dot 1.2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: theme.font.mono, fontSize: 8.5,
              color: theme.ink2, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>building</span>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 3, background: theme.surface, borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${Math.min(100, pct * (0.6 + i * 0.15))}%`,
                background: i === 1 ? theme.accent : (i === 2 ? theme.marigold : theme.success),
                transition: 'width .2s linear',
              }} />
            </div>
          ))}
        </div>
      ),
    },
    {
      n: '03', label: 'Cook in 30 min',
      sub: 'Ingredients arrive in 10. Watch the chef while you wait. Pan-to-plate in 30.',
      meta: 'YOU AGAIN',
      visual: (
        <div style={{
          width: 84, height: 64, borderRadius: 10,
          background: `linear-gradient(135deg, ${theme.accent}11 0%, ${theme.marigold}11 100%)`,
          border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <span style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            width: 18, height: 18, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,0,0,0.08) 0%, transparent 70%)',
            animation: 'steam-rise 3s ease-in infinite',
          }} />
          <span style={{ fontSize: 30 }}>🍳</span>
        </div>
      ),
    },
  ]

  return (
    <div style={{ padding: '0 18px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{
          fontSize: 11, color: theme.ink3, fontFamily: theme.font.mono,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>How tadka works</div>
        <div style={{
          fontSize: 11, color: theme.ink3, fontFamily: theme.font.mono,
          letterSpacing: '0.04em',
        }}>≈ 30 min, start to plate</div>
      </div>

      <div style={{
        background: theme.bgRaised,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: '6px 0',
        overflow: 'hidden',
      }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{
            display: 'flex', gap: 14,
            padding: '14px 16px',
            position: 'relative',
            background: s.featured ? `linear-gradient(90deg, ${theme.accent}08 0%, transparent 100%)` : 'transparent',
            borderTop: i > 0 ? `1px solid ${theme.border}` : 'none',
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              flexShrink: 0, paddingTop: 2,
            }}>
              <div style={{
                fontFamily: theme.font.display,
                fontSize: 22, fontWeight: 500, fontStyle: 'italic',
                color: s.featured ? theme.accent : theme.ink3,
                letterSpacing: '-0.02em', lineHeight: 1,
              }}>{s.n}</div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 1.5, flex: 1, marginTop: 6,
                  background: `linear-gradient(180deg, ${theme.border} 0%, transparent 100%)`,
                }} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <h3 style={{
                  margin: 0,
                  fontFamily: theme.font.display, fontSize: 16, fontWeight: 600,
                  letterSpacing: '-0.01em', color: theme.ink, lineHeight: 1.15,
                }}>{s.label}</h3>
                <span style={{
                  padding: '1px 6px', borderRadius: 999,
                  background: s.featured ? `${theme.accent}1a` : 'transparent',
                  color: s.featured ? theme.accent : theme.ink3,
                  border: s.featured ? 'none' : `1px solid ${theme.border}`,
                  fontFamily: theme.font.mono, fontSize: 8.5,
                  letterSpacing: '0.08em', fontWeight: 600,
                }}>{s.meta}</span>
              </div>
              <p style={{
                margin: 0, fontSize: 12.5, lineHeight: 1.45,
                color: theme.ink2, letterSpacing: '-0.005em',
                paddingRight: 4,
              }}>{s.sub}</p>
            </div>

            <div style={{ flexShrink: 0, alignSelf: 'center' }}>
              {s.visual}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 10, padding: '0 4px',
        fontSize: 10.5, color: theme.ink3, fontFamily: theme.font.mono,
        letterSpacing: '0.04em', textAlign: 'center',
      }}>
        Tadka talks to Swiggy Instamart MCP · COD checkout · serves your pincode
      </div>
    </div>
  )
}
