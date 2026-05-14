import { theme as T } from '../theme'
import { DATA } from '../data'
import { ChefImage, ReelTile, Icons } from '../components/UI'

export default function ChefScreen({ theme = T, chef, onBack, onOpenRecipe }) {
  const chefRecipes = DATA.recipes.filter(r => r.chef === chef.id)
  const recipes = chefRecipes.length > 0 ? chefRecipes : [DATA.recipes[0]]

  return (
    <div style={{ paddingBottom: 30 }}>
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '5/4',
        background: `linear-gradient(170deg, ${chef.heroTint} 0%, #0a0807 100%)`,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 60% 30%, ${chef.avatar}66 0%, transparent 60%)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 10px)',
        }} />
        <div style={{ position: 'absolute', top: 14, left: 14 }}>
          <button onClick={onBack} aria-label="Back" style={{
            width: 38, height: 38, borderRadius: 999,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
            border: 'none', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icons.ArrowLeft size={18} />
          </button>
        </div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0 22px 24px', color: '#fff',
        }}>
          <ChefImage chef={chef} size={88} slotKey="hero" theme={theme} ring />
          <h1 style={{
            margin: '14px 0 0',
            fontFamily: theme.font.display,
            fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.05,
          }}>{chef.name}</h1>
          <div style={{
            marginTop: 4, fontSize: 13, fontFamily: theme.font.mono,
            color: theme.marigold, letterSpacing: '0.04em',
          }}>{chef.handle}</div>
        </div>
      </div>

      <div style={{ padding: '22px 22px 6px' }}>
        <p style={{
          margin: 0, color: theme.ink2, fontSize: 14, lineHeight: 1.5,
          letterSpacing: '-0.01em',
        }}>{chef.bio}</p>
      </div>

      <div style={{ padding: '20px 22px 0' }}>
        <div style={{
          fontSize: 11, color: theme.ink3, fontFamily: theme.font.mono,
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
        }}>Brands {chef.name.split(' ')[0]} trusts</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {chef.brands.map(b => (
            <span key={b} style={{
              padding: '7px 12px', borderRadius: 999,
              background: `${theme.marigold}1a`,
              border: `1px solid ${theme.marigold}33`,
              color: theme.marigold,
              fontSize: 12, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              letterSpacing: '0.01em',
            }}>
              <Icons.Sparkle size={11} /> {b}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 10, color: theme.ink3, fontSize: 11.5, fontStyle: 'italic' }}>
          All carts built from {chef.name.split(' ')[0]}'s recipes default to these.
        </div>
      </div>

      <div style={{ padding: '24px 22px 0' }}>
        <h2 style={{
          margin: '0 0 14px', fontFamily: theme.font.display,
          fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em',
        }}>
          Curated recipes <span style={{ color: theme.ink3, fontWeight: 400 }}>· {recipes.length}</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {recipes.map(r => (
            <button key={r.id} onClick={() => onOpenRecipe(r.id)} style={{
              width: '100%', padding: 0, border: 'none', background: 'transparent',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <div style={{ width: 84, height: 112, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                <ReelTile recipe={r} theme={theme} height={112} rounded={12} showOverlay={false} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: theme.font.display, fontSize: 17, fontWeight: 500,
                  letterSpacing: '-0.01em', color: theme.ink, lineHeight: 1.2,
                }}>{r.title}</div>
                <div style={{ color: theme.ink3, fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Icons.Clock size={11} /> {r.time}
                  </span>
                  <span>·</span>
                  <span>serves {r.serves}</span>
                  {r.heat >= 2 && (
                    <>
                      <span>·</span>
                      <span style={{ color: theme.accent, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                        {Array.from({ length: r.heat }).map((_, i) => <Icons.Flame key={i} size={11} />)}
                      </span>
                    </>
                  )}
                </div>
                <div style={{
                  marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                  color: theme.accent, fontSize: 12, fontWeight: 600,
                }}>
                  Build cart <Icons.ArrowRight size={12} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
