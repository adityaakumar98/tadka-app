import { useState } from 'react'
import { theme as T } from '../theme'
import { DATA } from '../data'
import { ReelTile, Icons } from '../components/UI'

function TopBar({ theme, title, onBack }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      background: theme.bg, backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${theme.border}`,
    }}>
      <button onClick={onBack} aria-label="Back" style={{
        width: 38, height: 38, borderRadius: 999,
        background: theme.surface, border: 'none', color: theme.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <Icons.ArrowLeft size={18} />
      </button>
      {title && (
        <div style={{ fontFamily: theme.font.display, fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>
          {title}
        </div>
      )}
      <div style={{ minWidth: 38 }} />
    </div>
  )
}

export default function RecipesScreen({ theme = T, saved, onBack, onOpen }) {
  const [tab, setTab] = useState('saved')
  const ids = tab === 'saved' ? Array.from(saved) : (DATA.cookedRecipes || [])
  const list = ids.map(id => DATA.recipes.find(r => r.id === id)).filter(Boolean)

  return (
    <div style={{ paddingBottom: 28 }}>
      <TopBar theme={theme} onBack={onBack} title="My recipes" />
      <div style={{ padding: '4px 18px 0', display: 'flex', gap: 8 }}>
        {['saved', 'cooked'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px',
            background: tab === t ? theme.surface : 'transparent',
            border: 'none', borderRadius: 999,
            color: tab === t ? theme.ink : theme.ink3,
            fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '-0.01em',
          }}>
            {t[0].toUpperCase() + t.slice(1)}{' '}
            <span style={{ color: theme.ink3, marginLeft: 4 }}>
              {t === 'saved' ? saved.size : (DATA.cookedRecipes || []).length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, margin: '0 auto', borderRadius: 24,
            background: theme.surface,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.ink3,
          }}>
            <Icons.Bookmark size={32} />
          </div>
          <div style={{ marginTop: 16, fontFamily: theme.font.display, fontSize: 18, color: theme.ink }}>
            Nothing saved yet
          </div>
          <div style={{ marginTop: 6, color: theme.ink3, fontSize: 13 }}>
            Find your first recipe →
          </div>
        </div>
      ) : (
        <div style={{ padding: '18px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {list.map(r => {
            const chef = DATA.chefs.find(c => c.id === r.chef)
            return (
              <button key={r.id} onClick={() => onOpen(r.id)} style={{
                padding: 0, border: 'none', background: 'transparent',
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ position: 'relative' }}>
                  <ReelTile recipe={r} theme={theme} height={210} rounded={16} showOverlay={false} />
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 28, height: 28, borderRadius: 999,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    <Icons.Bookmark size={13} filled />
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{
                    color: theme.ink, fontSize: 13.5, fontWeight: 500,
                    fontFamily: theme.font.display, letterSpacing: '-0.01em', lineHeight: 1.2,
                  }}>{r.title}</div>
                  <div style={{ color: theme.ink3, fontSize: 11, marginTop: 3 }}>
                    {chef.name.split(' ')[0]} · {r.time}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
