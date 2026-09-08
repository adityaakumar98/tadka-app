import { useState } from 'react'
import { theme as T } from '../theme'

export function Button({ children, onClick, variant = 'primary', size = 'lg', theme = T, disabled, loading, fullWidth, style: extra }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: theme.font.body, fontWeight: 600, letterSpacing: '-0.01em',
    transition: 'transform .12s, opacity .12s', whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : undefined, opacity: disabled ? 0.5 : 1,
  }
  const sizes = {
    sm: { height: 36, padding: '0 14px', fontSize: 13, borderRadius: 999 },
    md: { height: 44, padding: '0 18px', fontSize: 14, borderRadius: 999 },
    lg: { height: 52, padding: '0 22px', fontSize: 16, borderRadius: 999 },
  }
  const variants = {
    primary:   { background: theme.accent, color: '#fff', boxShadow: `0 6px 14px ${theme.accent}33` },
    secondary: { background: 'transparent', color: theme.ink, border: `1px solid ${theme.borderStrong}` },
    ghost:     { background: 'transparent', color: theme.ink2 },
    surface:   { background: theme.surface, color: theme.ink },
    danger:    { background: 'transparent', color: theme.danger, border: `1px solid ${theme.danger}44` },
  }
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extra }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)' }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      onTouchStart={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)' }}
      onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {loading ? <Spinner color={variant === 'primary' ? '#fff' : theme.ink} /> : children}
    </button>
  )
}

export function Spinner({ size = 16, color = '#fff' }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      border: `2px solid ${color}33`, borderTopColor: color,
      animation: 'spin .8s linear infinite',
    }} />
  )
}

export function Chip({ children, onClick, theme = T, active }) {
  return (
    <button onClick={onClick} style={{
      height: 34, padding: '0 14px', borderRadius: 999,
      border: `1px solid ${active ? theme.accent : theme.border}`,
      background: active ? `${theme.accent}1a` : 'transparent',
      color: active ? theme.accent : theme.ink2,
      fontFamily: theme.font.body, fontSize: 13, fontWeight: 500,
      cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.01em',
    }}>{children}</button>
  )
}

export function BrandBadge({ brand, chefPick, theme = T, small = false }) {
  const color = chefPick ? theme.marigold : theme.ink3
  const label = chefPick ? "Chef's pick" : 'Best match'

  if (theme.badgeStyle === 'underline') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, fontFamily: theme.font.body, fontSize: small ? 11 : 12, color: theme.ink, fontWeight: 500 }}>
        <span style={{ borderBottom: `2px solid ${color}`, paddingBottom: 1 }}>{brand}</span>
        <span style={{ color, fontSize: small ? 10 : 11, fontWeight: 500, letterSpacing: '0.02em' }}>{chefPick && '★ '}{label}</span>
      </span>
    )
  }

  if (theme.badgeStyle === 'ribbon') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 0, fontSize: small ? 11 : 12, fontFamily: theme.font.body }}>
        <span style={{
          padding: '2px 14px 2px 8px',
          background: chefPick ? color : theme.surface, color: chefPick ? '#1A1714' : theme.ink2,
          fontWeight: 600, letterSpacing: '0.02em',
          clipPath: 'polygon(0 0, 100% 0, calc(100% - 6px) 50%, 100% 100%, 0 100%)',
        }}>{brand}</span>
        {chefPick && <span style={{ color, fontSize: small ? 10 : 11, fontWeight: 600, marginLeft: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>★ Chef</span>}
      </span>
    )
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: theme.font.body, fontSize: small ? 11 : 12 }}>
      <span style={{ color: theme.ink, fontWeight: 500 }}>{brand}</span>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 999,
        background: chefPick ? `${theme.marigold}22` : 'transparent', color,
        border: chefPick ? 'none' : `1px solid ${theme.border}`,
        fontSize: small ? 10 : 11, fontWeight: 600, letterSpacing: '0.02em',
      }}>
        {chefPick && <span style={{ fontSize: 9 }}>★</span>}{label}
      </span>
    </span>
  )
}

export function ReelTile({ recipe, theme = T, height = 180, rounded = 16, showOverlay = true, style }) {
  const [g1, g2] = recipe.gradient || ['oklch(0.55 0.18 35)', 'oklch(0.35 0.14 25)']
  return (
    <div style={{
      position: 'relative', width: '100%', height, borderRadius: rounded, overflow: 'hidden',
      background: `linear-gradient(135deg, ${g1} 0%, ${g2} 100%)`, ...style,
    }}>
      {recipe.thumbnailUrl ? (
        <img
          src={recipe.thumbnailUrl} alt="" loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(120% 80% at 30% 20%, ${g1}cc 0%, transparent 60%),
                       radial-gradient(80% 60% at 80% 80%, ${g2}88 0%, transparent 70%),
                       repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 8px)`,
          animation: 'kenburns 14s ease-in-out infinite',
        }} />
      )}
      {showOverlay && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
          <div style={{ position: 'absolute', left: 14, bottom: 12, color: '#fff' }}>
            <div style={{ fontFamily: theme.font.display, fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>{recipe.title}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{recipe.reelHandle} · {recipe.reelDuration}</div>
          </div>
          <div style={{ position: 'absolute', right: 12, top: 12, width: 28, height: 28, borderRadius: 999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="11" viewBox="0 0 10 11" fill="#fff"><path d="M0 0v11l10-5.5L0 0z"/></svg>
          </div>
        </>
      )}
    </div>
  )
}

export function ProductSwatch({ color, size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: `radial-gradient(60% 60% at 35% 30%, ${color} 0%, ${color}cc 70%, ${color}99 100%)`,
      border: '1px solid rgba(0,0,0,0.06)',
    }} />
  )
}

// Real product photo with the colour swatch as the background/fallback. When `image`
// is falsy (mock mode) or the URL fails to load, this is just a ProductSwatch.
export function ProductImage({ image, color, size = 56 }) {
  const [failed, setFailed] = useState(false)
  return (
    <div style={{
      position: 'relative', width: size, height: size, borderRadius: 12, flexShrink: 0,
      overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)',
      background: `radial-gradient(60% 60% at 35% 30%, ${color} 0%, ${color}cc 70%, ${color}99 100%)`,
    }}>
      {image && !failed && (
        <img
          src={image} alt="" loading="lazy" onError={() => setFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  )
}

export function ChefAvatar({ chef, size = 48, theme = T, ring }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: chef.avatar,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: theme.font.display, fontWeight: 600, fontSize: size * 0.42,
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 2px ${theme.bg}, 0 0 0 4px ${theme.marigold}` : undefined,
    }}>{chef.name[0]}</div>
  )
}

export function ChefImage({ chef, size = 64, theme = T, ring }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: chef.avatar,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: theme.font.display, fontWeight: 600, fontSize: size * 0.42,
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 2px ${theme.bg}, 0 0 0 4px ${theme.marigold}` : undefined,
    }}>{chef.name[0]}</div>
  )
}

export const Icons = {
  ArrowRight: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
  ),
  ArrowLeft: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 19l-7-7 7-7"/></svg>
  ),
  Clipboard: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
  ),
  X: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
  ),
  Heart: ({ size = 18, color = 'currentColor', filled }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.75" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  ),
  Plus: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
  ),
  Minus: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14"/></svg>
  ),
  Swap: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4"/></svg>
  ),
  AlertTriangle: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m10.29 3.86-8.18 14a2 2 0 0 0 1.71 3h16.36a2 2 0 0 0 1.71-3l-8.18-14a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  Check: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  ),
  Share: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
  ),
  Bookmark: ({ size = 18, color = 'currentColor', filled }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.75" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
  ),
  MapPin: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  Search: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Clock: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
  ),
  Flame: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M12 2s4 4 4 8c0 1.5-.5 3-2 3.5 0 0 1.5-3-2-5-1 3-4 4-4 7a4 4 0 0 0 8 0c0-5-4-13.5-4-13.5z"/></svg>
  ),
  Sparkle: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round"><path d="M12 3l1.6 6L20 12l-6.4 1.6L12 21l-1.6-6L4 12l6.4-1.6z"/></svg>
  ),
}

export function Stepper({ theme = T, label, value, onChange, min, max }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '5px 5px 5px 12px', background: theme.surface, borderRadius: 999 }}>
      <span style={{ color: theme.ink2, fontSize: 11, fontFamily: theme.font.mono, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} style={{ width: 26, height: 26, borderRadius: 999, background: theme.bgRaised, border: 'none', cursor: value <= min ? 'default' : 'pointer', color: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: value <= min ? 0.4 : 1 }}>
        <Icons.Minus size={12} />
      </button>
      <div style={{ fontFamily: theme.font.display, fontSize: 15, fontWeight: 600, color: theme.ink, minWidth: 16, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} style={{ width: 26, height: 26, borderRadius: 999, background: theme.bgRaised, border: 'none', cursor: value >= max ? 'default' : 'pointer', color: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: value >= max ? 0.4 : 1 }}>
        <Icons.Plus size={12} />
      </button>
    </div>
  )
}

export function RowKV({ theme = T, k, v, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '3px 0' }}>
      <div style={{ color: theme.ink2, fontSize: 13 }}>
        {k}{sub && <span style={{ color: theme.ink3, fontSize: 10.5, marginLeft: 6 }}>{sub}</span>}
      </div>
      <div style={{ color: theme.ink, fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
    </div>
  )
}
