import { useState } from 'react'
import { theme as T } from '../theme'
import { DATA } from '../data'
import { TadkaLogo } from '../components/Logo'
import { Button, Chip, ChefAvatar, ChefImage, ReelTile, Icons } from '../components/UI'
import HowItWorks from '../components/HowItWorks'

function RecipeFeatureCard({ theme, recipe, onClick }) {
  const chef = DATA.chefs.find(c => c.id === recipe.chef)
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: 0, border: 'none', background: 'transparent',
      cursor: 'pointer', textAlign: 'left',
    }}>
      <ReelTile recipe={recipe} theme={theme} height={220} rounded={20} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <ChefAvatar chef={chef} size={28} theme={theme} />
        <div style={{ flex: 1 }}>
          <div style={{ color: theme.ink, fontSize: 13, fontWeight: 500 }}>{chef.name}</div>
          <div style={{ color: theme.ink3, fontSize: 11 }}>{recipe.time} · serves {recipe.serves}</div>
        </div>
        <div style={{
          padding: '6px 10px', borderRadius: 999,
          background: theme.accent, color: '#fff', fontSize: 12, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          Build cart <Icons.ArrowRight size={13} />
        </div>
      </div>
    </button>
  )
}

function RecipeMiniCard({ theme, recipe, onClick }) {
  const chef = DATA.chefs.find(c => c.id === recipe.chef)
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: 0, border: 'none', background: 'transparent',
      cursor: 'pointer', textAlign: 'left',
    }}>
      <ReelTile recipe={recipe} theme={theme} height={170} rounded={16} showOverlay={false} />
      <div style={{ marginTop: 8 }}>
        <div style={{
          color: theme.ink, fontSize: 13, fontWeight: 500, fontFamily: theme.font.display,
          letterSpacing: '-0.01em', lineHeight: 1.2,
        }}>{recipe.title}</div>
        <div style={{ color: theme.ink3, fontSize: 11, marginTop: 2 }}>
          {chef.name.split(' ')[0]} · {recipe.time}
        </div>
      </div>
    </button>
  )
}

function HeroReels({ theme, onOpen }) {
  const tiles = DATA.recipes.slice(0, 4).map((r, i) => {
    const chef = DATA.chefs.find(c => c.id === r.chef)
    return { recipe: r, chef, rotation: i % 2 === 0 ? -2.5 : 2 }
  })

  return (
    <div>
      <div style={{
        padding: '0 22px',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div>
          <div style={{
            fontFamily: theme.font.display, fontSize: 16, fontWeight: 500,
            letterSpacing: '-0.01em', color: theme.ink,
          }}>Trending tonight</div>
          <div style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.font.mono, letterSpacing: '0.04em', marginTop: 1 }}>
            Or paste any URL above — these work too
          </div>
        </div>
        <span style={{
          padding: '3px 8px', borderRadius: 999,
          background: `${theme.success}22`, color: theme.success,
          fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>● LIVE</span>
      </div>

      <div style={{
        display: 'flex', gap: 14, overflowX: 'auto',
        padding: '6px 22px 22px',
        scrollSnapType: 'x mandatory',
      }}>
        {tiles.map(({ recipe, chef, rotation }) => (
          <button key={recipe.id} onClick={() => onOpen(recipe.id)} style={{
            flexShrink: 0, padding: 0, border: 'none', background: 'transparent',
            cursor: 'pointer', textAlign: 'left',
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center',
            transition: 'transform .2s cubic-bezier(.32,.72,0,1)',
            scrollSnapAlign: 'start',
          }}>
            <div style={{
              position: 'relative',
              width: 122, height: 168,
              background: theme.bgRaised,
              borderRadius: 12,
              padding: 6, paddingBottom: 8,
              border: `1px solid ${theme.border}`,
              boxShadow: '0 6px 22px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.4) inset',
            }}>
              <div style={{
                position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%) rotate(-2deg)',
                width: 44, height: 12, borderRadius: 2,
                background: `${theme.marigold}66`,
                border: `1px solid ${theme.marigold}88`,
                opacity: 0.85,
              }} />
              <div style={{
                width: '100%', height: 110, borderRadius: 8, overflow: 'hidden',
                position: 'relative',
                background: `linear-gradient(135deg, ${recipe.gradient[0]} 0%, ${recipe.gradient[1]} 100%)`,
              }}>
                <div style={{
                  position: 'absolute', right: 6, top: 6,
                  width: 22, height: 22, borderRadius: 999,
                  background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="8" height="9" viewBox="0 0 10 11" fill="#fff"><path d="M0 0v11l10-5.5L0 0z"/></svg>
                </div>
                <div style={{
                  position: 'absolute', left: 6, bottom: 6,
                  padding: '1.5px 5px', borderRadius: 4,
                  background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                  color: '#fff', fontSize: 8.5, fontFamily: theme.font.mono, letterSpacing: '0.04em',
                }}>{recipe.reelDuration}</div>
              </div>
              <div style={{ padding: '6px 2px 0' }}>
                <div style={{
                  fontFamily: theme.font.display, fontSize: 11.5, fontWeight: 500,
                  letterSpacing: '-0.01em', color: theme.ink, lineHeight: 1.15,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{recipe.title}</div>
                <div style={{
                  color: theme.ink3, fontSize: 9.5, marginTop: 1,
                  fontFamily: theme.font.mono, letterSpacing: '0.02em',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {chef.name.split(' ')[0]} · {recipe.reelHandle}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function HomeScreen({ theme = T, onPaste, onOpenChef, onOpenRecipes }) {
  const [url, setUrl] = useState('')

  const handlePasteClick = async () => {
    setUrl('https://www.instagram.com/reel/C-yourfoodlab-paneer-butter-masala/')
  }

  const buildCart = () => {
    if (!url) return
    onPaste('pbm')
  }

  const heroLines = theme.hero.lines

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px 6px',
      }}>
        <TadkaLogo theme={theme} size={22} animated />
        <button onClick={onOpenRecipes} aria-label="My recipes" style={{
          width: 38, height: 38, borderRadius: 999,
          background: theme.surface,
          border: 'none', color: theme.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icons.Bookmark size={17} />
        </button>
      </div>

      <div style={{ padding: '60px 22px 24px' }}>
        <h1 style={{
          margin: 0,
          fontFamily: theme.font.display,
          fontSize: 56, lineHeight: '1.02',
          fontWeight: 500, letterSpacing: '-0.035em',
        }}>
          <div style={{ color: theme.ink }}>{heroLines[0]}</div>
          <div style={{ color: theme.ink }}>{heroLines[1]}</div>
          <div style={{ color: theme.accent, fontStyle: 'italic' }}>{heroLines[2]}</div>
        </h1>
        <p style={{
          marginTop: 22, marginBottom: 0,
          color: theme.ink2, fontSize: 16, lineHeight: 1.4,
          maxWidth: 320, letterSpacing: '-0.01em',
        }}>{theme.hero.sub}</p>
      </div>

      <div style={{ padding: '12px 18px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: theme.surface,
          borderRadius: 14,
          padding: '4px 6px 4px 16px',
          border: `1px solid ${url ? theme.accent + '55' : theme.border}`,
          transition: 'border-color .2s',
        }}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Reel or Short URL"
            style={{
              flex: 1, background: 'transparent',
              border: 'none', outline: 'none',
              fontFamily: theme.font.body, fontSize: 14, color: theme.ink,
              padding: '14px 0', minWidth: 0, textOverflow: 'ellipsis',
            }}
          />
          {url ? (
            <button onClick={() => setUrl('')} aria-label="Clear" style={{
              width: 32, height: 32, borderRadius: 999,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: theme.ink3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icons.X size={14} />
            </button>
          ) : (
            <button onClick={handlePasteClick} aria-label="Paste from clipboard" style={{
              width: 32, height: 32, borderRadius: 999,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: theme.ink2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icons.Clipboard size={15} />
            </button>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <Button theme={theme} fullWidth onClick={buildCart} disabled={!url}>
            {theme.cta.primary}
            <Icons.ArrowRight size={18} />
          </Button>
          <div style={{ textAlign: 'center', color: theme.ink3, fontSize: 11, marginTop: 8, fontFamily: theme.font.mono, letterSpacing: '0.04em' }}>
            {theme.cta.sub}
          </div>
        </div>

        <div style={{
          marginTop: 18, display: 'flex', alignItems: 'center', gap: 8,
          overflowX: 'auto', paddingBottom: 4,
        }}>
          <span style={{ fontFamily: theme.font.mono, fontSize: 11, color: theme.ink3, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
            Try a sample
          </span>
          <Chip theme={theme} onClick={() => onPaste('pbm')}>Paneer Butter Masala</Chip>
          <Chip theme={theme} onClick={() => onPaste('dosa')}>Masala Dosa</Chip>
          <Chip theme={theme} onClick={() => onPaste('biryani')}>Biryani</Chip>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <HeroReels theme={theme} onOpen={(id) => onPaste(id)} />
      </div>

      <div style={{ marginTop: 28 }}>
        <HowItWorks theme={theme} />
      </div>

      <div style={{ height: 1, background: theme.border, margin: '28px 22px 22px' }} />

      <div style={{ padding: '0 0 0 22px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          paddingRight: 22, marginBottom: 14,
        }}>
          <h2 style={{
            margin: 0, fontFamily: theme.font.display,
            fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: theme.ink,
          }}>Recipes by chefs you love</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingRight: 22, paddingBottom: 8 }}>
          {DATA.chefs.map(c => (
            <button key={c.id} onClick={() => onOpenChef(c.id)} style={{
              border: 'none', background: 'transparent', padding: 0,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 8, minWidth: 76, flexShrink: 0,
            }}>
              <ChefImage chef={c} size={64} slotKey="row" theme={theme} ring />
              <div style={{ textAlign: 'center', lineHeight: 1.15 }}>
                <div style={{ color: theme.ink, fontSize: 12, fontWeight: 500 }}>{c.name.split(' ')[0]}</div>
                <div style={{ color: theme.ink3, fontSize: 10.5, fontFamily: theme.font.mono, marginTop: 2 }}>@{c.id}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 22px 0' }}>
        <h2 style={{
          margin: '0 0 12px', fontFamily: theme.font.display,
          fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em',
        }}>This week's tadka</h2>
        <RecipeFeatureCard theme={theme} recipe={DATA.recipes[0]} onClick={() => onPaste('pbm')} />
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {DATA.recipes.slice(1, 5).map(r => (
            <RecipeMiniCard key={r.id} theme={theme} recipe={r} onClick={() => onPaste(r.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
