import { useState, useEffect, useMemo } from 'react'
import { theme as T } from '../theme'

const RECIPE_CAPTIONS = {
  pbm:     ['"…heat ghee, add cumin…"', '"…fresh tomato puree blends in…"', '"…cashew cream is the secret…"', '"…finish with kasuri methi."'],
  dosa:    ['"…ferment overnight…"', '"…cast iron, medium-hot…"', '"…thin, crisp, golden…"'],
  biryani: ['"…layer rice and meat…"', '"…dum on low flame…"', '"…seal with atta dough…"'],
  pao:     ['"…butter the pav, both sides…"', '"…mash bhaji till smooth…"'],
  aloo:    ['"…stuff generously…"', '"…ghee on the tawa…"'],
}

function fmtVidTime(seconds) {
  const s = Math.floor(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function EmbedPanel({ recipe, fullscreen, height, onExpand, onCollapse }) {
  return (
    <div style={{
      position: 'relative', width: '100%', flexShrink: 0, background: '#000',
      height: fullscreen ? '100%' : height,
    }}>
      <iframe
        src={recipe.embedUrl + (fullscreen ? '&autoplay=1' : '')}
        title={recipe.title || 'Recipe video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
      {fullscreen && onCollapse && (
        <button onClick={onCollapse} aria-label="Close" style={{
          position: 'absolute', top: 12, right: 12, zIndex: 5,
          width: 36, height: 36, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
      {!fullscreen && (
        <button onClick={onExpand} aria-label="Full view" style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          padding: '5px 12px 6px', border: 'none', cursor: 'pointer',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
          borderRadius: '12px 12px 0 0',
          color: '#fff', fontSize: 9.5, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="6" viewBox="0 0 14 6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"><path d="M1 1l6 4 6-4" /></svg>
          Tap for full view
        </button>
      )}
    </div>
  )
}

export default function VideoPanel({ theme = T, recipe, mode = 'compact', onExpand, onCollapse, height = '40%' }) {
  const fullscreen = mode === 'fullscreen'
  const captions = RECIPE_CAPTIONS[recipe.id] || RECIPE_CAPTIONS.pbm

  const [muted, setMuted] = useState(true)
  const [scrub, setScrub] = useState(0)
  const [capIdx, setCapIdx] = useState(0)

  useEffect(() => {
    let raf
    const start = performance.now()
    const dur = (() => {
      const [m, s] = (recipe.reelDuration || '1:00').split(':').map(Number)
      return (m || 0) * 60 + (s || 0) || 60
    })()
    const tick = (now) => {
      const elapsed = (now - start) / 1000
      setScrub((elapsed % dur) / dur)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [recipe.id])

  useEffect(() => {
    const t = setInterval(() => setCapIdx(i => (i + 1) % captions.length), 1800)
    return () => clearInterval(t)
  }, [captions.length])

  const steamParticles = useMemo(() => Array.from({ length: 7 }).map(() => ({
    left: 12 + Math.random() * 76,
    size: 12 + Math.random() * 20,
    delay: -Math.random() * 6,
    duration: 4 + Math.random() * 3,
    sx: (Math.random() * 30 - 15) + 'px',
    opacity: 0.35 + Math.random() * 0.3,
  })), [recipe.id])

  const [g1, g2] = recipe.gradient || ['oklch(0.55 0.18 35)', 'oklch(0.35 0.14 25)']

  // Real embedded player (YouTube) — replaces the synthetic panel entirely.
  if (recipe.embedUrl) {
    return (
      <EmbedPanel
        recipe={recipe} fullscreen={fullscreen}
        height={height} onExpand={onExpand} onCollapse={onCollapse}
      />
    )
  }

  const bgThumb = recipe.thumbnailUrl

  return (
    <div
      onClick={fullscreen ? undefined : onExpand}
      style={{
        position: 'relative',
        height: fullscreen ? '100%' : height,
        width: '100%',
        background: `linear-gradient(155deg, ${g1} 0%, ${g2} 100%)`,
        overflow: 'hidden',
        cursor: fullscreen ? 'default' : 'pointer',
        flexShrink: 0,
      }}
    >
      {bgThumb ? (
        /* Real video thumbnail behind the scrim/steam overlay */
        <img src={bgThumb} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        /* Kenburns gradient layer */
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(120% 80% at 30% 20%, ${g1}cc 0%, transparent 60%),
                       radial-gradient(80% 60% at 80% 80%, ${g2}99 0%, transparent 70%),
                       repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 8px)`,
          animation: 'kenburns 9s ease-in-out infinite',
        }} />
      )}

      {/* Steam particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {steamParticles.map((p, i) => (
          <span key={i} style={{
            position: 'absolute',
            bottom: -20, left: `${p.left}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)',
            opacity: p.opacity,
            filter: 'blur(2px)',
            '--sx': p.sx,
            animation: `steam-rise ${p.duration}s ease-in ${p.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* Top scrim */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0,
        padding: '12px 14px 30px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, zIndex: 20,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 10px 5px 8px', borderRadius: 999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          color: '#fff', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600,
          pointerEvents: 'auto',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: '#ff3b30',
            boxShadow: '0 0 8px #ff3b30', animation: 'pulse-dot 1.4s ease-in-out infinite',
          }} />
          Playing
        </span>

        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMuted(m => !m) }}
            aria-label={muted ? 'Unmute' : 'Mute'}
            style={{
              border: 'none', cursor: 'pointer',
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
              color: '#fff', fontSize: 10.5, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {muted ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <path d="M23 9l-6 6M17 9l6 6"/>
                </svg>
                Unmute
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
                Sound on
              </>
            )}
          </button>
          {fullscreen && (
            <button
              onClick={(e) => { e.stopPropagation(); onCollapse && onCollapse() }}
              aria-label="Close"
              style={{
                border: 'none', cursor: 'pointer',
                width: 36, height: 36, borderRadius: 999,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Bottom scrim */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: fullscreen ? '60px 22px 24px' : '40px 18px 18px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.85) 100%)',
        color: '#fff',
        pointerEvents: 'none',
      }}>
        {!bgThumb && (
          <div key={capIdx} style={{
            minHeight: 24,
            fontFamily: theme.font.display,
            fontSize: fullscreen ? 21 : 15.5, fontStyle: 'italic',
            lineHeight: 1.25, letterSpacing: '-0.01em',
            color: '#fff', opacity: 0.95,
            textShadow: '0 2px 14px rgba(0,0,0,0.6)',
            animation: 'fade-in .35s ease-out',
          }}>{captions[capIdx]}</div>
        )}

        <div style={{
          marginTop: bgThumb ? 0 : 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          fontFamily: theme.font.mono, fontSize: 10.5, letterSpacing: '0.04em',
          opacity: 0.9,
        }}>
          <span>{recipe.reelHandle || recipe.chefName || ''}</span>
          {!bgThumb && (
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtVidTime(scrub * 60)} / {recipe.reelDuration}
            </span>
          )}
        </div>

        {!bgThumb && (
          <div style={{
            marginTop: 6, height: 2, background: 'rgba(255,255,255,0.25)', borderRadius: 999, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${scrub * 100}%`,
              background: '#fff', transition: 'width 60ms linear', position: 'relative',
            }}>
              <span style={{
                position: 'absolute', right: -4, top: -3, width: 8, height: 8, borderRadius: '50%',
                background: '#fff', boxShadow: '0 0 8px rgba(255,255,255,0.6)',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Pull-down affordance (compact only) */}
      {!fullscreen && (
        <div style={{
          position: 'absolute', bottom: -1, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', pointerEvents: 'none',
          zIndex: 25,
        }}>
          <div style={{
            padding: '5px 12px 6px',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
            borderRadius: '12px 12px 0 0',
            color: '#fff', fontSize: 9.5, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="6" viewBox="0 0 14 6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
              <path d="M1 1l6 4 6-4" />
            </svg>
            Pull or tap for full view
          </div>
        </div>
      )}
    </div>
  )
}
