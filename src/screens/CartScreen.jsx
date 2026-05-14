import { useState } from 'react'
import { theme as T } from '../theme'
import { Button, BrandBadge, ProductSwatch, Icons, Stepper, RowKV } from '../components/UI'
import VideoPanel from '../components/VideoPanel'
import { scaledQty } from '../utils'

function IngredientRow({ theme, ing, scale, compact, divider, onSwap, onRemove }) {
  const padding = compact ? '10px 14px' : '12px 14px'
  const swatchSize = compact ? 42 : 50
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding,
      borderBottom: divider ? `1px solid ${theme.border}` : 'none',
      position: 'relative',
      animation: 'row-arrive .42s cubic-bezier(.32,.72,0,1), row-tint 1.2s ease-out',
      '--arrive-tint': `${theme.accent}1a`,
    }}>
      <ProductSwatch color={ing.swatch} size={swatchSize} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? 13.5 : 14.5, fontWeight: 500, color: theme.ink,
          letterSpacing: '-0.01em', lineHeight: 1.2,
        }}>{ing.name}</div>
        <div style={{ marginTop: 3 }}>
          <BrandBadge brand={ing.brand} chefPick={ing.chefPick} theme={theme} small={compact} />
        </div>
        <div style={{ color: theme.ink3, fontSize: 10.5, marginTop: compact ? 2 : 3, fontFamily: theme.font.mono }}>
          {scaledQty(ing.qty, scale)} · {ing.size}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{
          fontFamily: theme.font.display, fontSize: compact ? 13.5 : 14.5, fontWeight: 600, color: theme.ink,
          fontVariantNumeric: 'tabular-nums',
        }}>
          ₹{Math.round(ing.price * Math.max(1, Math.ceil(scale)))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onSwap} aria-label="Swap" style={iconBtnStyle(theme)}>
            <Icons.Swap size={12} />
          </button>
          <button onClick={onRemove} aria-label="Remove" style={iconBtnStyle(theme)}>
            <Icons.X size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

function UnavailableRow({ theme, ing, scale, compact, divider, topDivider }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: compact ? '10px 14px' : '12px 14px',
      borderBottom: divider ? `1px solid ${theme.border}` : 'none',
      borderTop: topDivider ? `1px solid ${theme.border}` : 'none',
      background: `${theme.warn}0a`,
      animation: 'row-arrive .5s cubic-bezier(.32,.72,0,1)',
    }}>
      <div style={{
        width: compact ? 42 : 50, height: compact ? 42 : 50, borderRadius: 12,
        background: theme.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, opacity: 0.75, flexShrink: 0,
      }}>😔</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? 13.5 : 14.5, fontWeight: 500,
          color: theme.ink2, letterSpacing: '-0.01em', lineHeight: 1.2,
          textDecoration: 'line-through', textDecorationColor: `${theme.ink3}88`,
        }}>{ing.name}</div>
        <div style={{ marginTop: 3, fontSize: 11, fontWeight: 600, color: theme.warn, letterSpacing: '0.02em' }}>
          Not available
        </div>
        <div style={{ color: theme.ink3, fontSize: 10.5, marginTop: 2, fontFamily: theme.font.mono }}>
          Won't be part of this order · need {scaledQty(ing.qty, scale)}
        </div>
      </div>
      <div style={{ fontFamily: theme.font.mono, fontSize: 11, color: theme.ink3, letterSpacing: '0.04em', fontWeight: 500 }}>—</div>
    </div>
  )
}

function SkeletonRow({ theme, divider, compact }) {
  const size = compact ? 42 : 50
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: compact ? '10px 14px' : '12px 14px',
      borderBottom: divider ? `1px solid ${theme.border}` : 'none',
    }}>
      <div style={{ width: size, height: size, borderRadius: 12, background: theme.surface, position: 'relative', overflow: 'hidden' }}>
        <span style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(90deg, transparent, ${theme.borderStrong}, transparent)`,
          animation: 'shimmer 1.4s ease-in-out infinite',
        }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 11, width: '60%', borderRadius: 4, background: theme.surface, position: 'relative', overflow: 'hidden' }}>
          <span style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, transparent, ${theme.borderStrong}, transparent)`,
            animation: 'shimmer 1.4s ease-in-out infinite',
          }} />
        </div>
        <div style={{ height: 9, width: '40%', borderRadius: 4, background: theme.surface, opacity: 0.7 }} />
      </div>
      <div style={{ height: 11, width: 36, borderRadius: 4, background: theme.surface }} />
    </div>
  )
}

function iconBtnStyle(theme) {
  return {
    width: 26, height: 26, borderRadius: 999,
    background: theme.surface,
    border: 'none', cursor: 'pointer', color: theme.ink2,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}

export default function CartScreen({
  theme = T, recipe, chef, ingredients, servings, setServings, baseServes,
  subtotal, delivery, animatedTotal,
  onBack, saved, onToggleSave, onSwap, onRemove, onUnmatched, onExpandReel,
  onCheckout, building, revealedCount,
}) {
  const scale = servings / baseServes
  const isDense = theme.density === 'compact'

  const matched = ingredients.filter(i => !i.unmatched)
  const unmatched = ingredients.filter(i => i.unmatched)

  const totalToReveal = matched.length + unmatched.length
  const matchedRevealed = Math.min(revealedCount, matched.length)
  const unmatchedRevealed = Math.max(0, revealedCount - matched.length)

  const [videoExpanded, setVideoExpanded] = useState(false)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', flexShrink: 0,
        background: theme.bg, borderBottom: `1px solid ${theme.border}`,
      }}>
        <button onClick={onBack} aria-label="Back" style={{
          width: 36, height: 36, borderRadius: 999,
          background: theme.surface, border: 'none', color: theme.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icons.ArrowLeft size={17} />
        </button>
        <div style={{
          color: theme.ink2, fontSize: 11.5, fontFamily: theme.font.mono,
          letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {building ? (
            <>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, animation: 'pulse-dot 1s ease-in-out infinite' }} />
              Building cart · {revealedCount}/{totalToReveal}
            </>
          ) : (
            <>Cart · {matchedRevealed} items</>
          )}
        </div>
        <button onClick={onToggleSave} aria-label="Save" style={{
          width: 36, height: 36, borderRadius: 999,
          background: theme.surface, border: 'none',
          color: saved ? theme.accent : theme.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icons.Bookmark size={16} filled={saved} />
        </button>
      </div>

      <VideoPanel theme={theme} recipe={recipe} mode="compact" height="38%" onExpand={() => setVideoExpanded(true)} />

      {building && (
        <div style={{
          padding: '10px 16px', background: theme.bgRaised,
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{ flex: 1, height: 4, background: theme.surface, borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0, width: `${(revealedCount / totalToReveal) * 100}%`,
              background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.marigold} 100%)`,
              borderRadius: 999, transition: 'width .3s ease-out',
            }} />
          </div>
          <span style={{
            fontFamily: theme.font.mono, fontSize: 10.5, color: theme.ink2,
            letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', flexShrink: 0,
          }}>
            {revealedCount}/{totalToReveal} sourced
          </span>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 24 }}>
        <div style={{ padding: '14px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: theme.marigold, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Chef {chef.name}
              </div>
              <div style={{
                fontFamily: theme.font.display, fontSize: 19, fontWeight: 500, letterSpacing: '-0.02em',
                color: theme.ink, lineHeight: 1.2, marginTop: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{recipe.title}</div>
            </div>
            {!building && (
              <span style={{
                padding: '4px 10px', borderRadius: 999, flexShrink: 0,
                background: `${theme.success}22`, color: theme.success,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                display: 'inline-flex', alignItems: 'center', gap: 4,
                animation: 'fade-in .3s ease-out',
              }}>
                <Icons.Check size={11} /> Cart ready
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '14px 18px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Stepper theme={theme} label="Serves" value={servings} onChange={setServings} min={1} max={12} />
          <div style={{ color: theme.ink3, fontSize: 11, fontFamily: theme.font.mono, letterSpacing: '0.04em' }}>
            Quantities auto-scale
          </div>
        </div>

        <div style={{ padding: '14px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, color: theme.ink3, fontFamily: theme.font.mono, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Ingredients · {matched.length}
            </div>
            {!building && unmatched.length > 0 && (
              <button onClick={onUnmatched} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: theme.ink3, fontSize: 11, fontFamily: theme.font.mono, letterSpacing: '0.04em',
                display: 'inline-flex', alignItems: 'center', gap: 3,
              }}>
                <Icons.AlertTriangle size={11} /> Why {unmatched.length} missing?
              </button>
            )}
          </div>

          <div style={{
            background: theme.bgRaised, borderRadius: 16,
            border: `1px solid ${theme.border}`, overflow: 'hidden',
          }}>
            {matched.map((ing, idx) => {
              const revealed = idx < matchedRevealed
              return revealed ? (
                <IngredientRow
                  key={ing.id}
                  theme={theme} ing={ing} scale={scale}
                  compact={isDense}
                  divider={idx < matched.length - 1}
                  onSwap={() => onSwap(ing.id)}
                  onRemove={() => onRemove(ing.id)}
                />
              ) : (
                <SkeletonRow key={ing.id} theme={theme} divider={idx < matched.length - 1} compact={isDense} />
              )
            })}

            {unmatched.map((ing, idx) => {
              const revealed = idx < unmatchedRevealed
              return revealed ? (
                <UnavailableRow
                  key={ing.id}
                  theme={theme} ing={ing} scale={scale} compact={isDense}
                  divider={false} topDivider
                />
              ) : null
            })}
          </div>
        </div>

        {!building && (
          <div style={{ padding: '18px 18px 0', animation: 'fade-in .3s ease-out' }}>
            <div style={{
              padding: 14, background: theme.bgRaised, borderRadius: 16,
              border: `1px solid ${theme.border}`,
            }}>
              <RowKV theme={theme} k="Subtotal" v={`₹${subtotal}`} />
              <RowKV theme={theme} k="Delivery" v={`₹${delivery}`} sub="Free over ₹1000" />
              <div style={{ height: 1, background: theme.border, margin: '8px 0' }} />
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: theme.font.display, fontSize: 17, fontWeight: 500, color: theme.ink }}>Total</div>
                <div style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 600, color: theme.ink, fontVariantNumeric: 'tabular-nums' }}>
                  ₹{animatedTotal}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 12 }} />
      </div>

      <div style={{
        padding: '12px 18px 20px', flexShrink: 0,
        background: theme.bg, borderTop: `1px solid ${theme.border}`,
      }}>
        <Button theme={theme} fullWidth onClick={onCheckout} disabled={building}>
          {building ? 'Building cart…' : <>Review & place order <Icons.ArrowRight size={18} /></>}
        </Button>
        <div style={{ textAlign: 'center', color: theme.ink3, fontSize: 10.5, marginTop: 6, fontFamily: theme.font.mono, letterSpacing: '0.04em' }}>
          Cash on delivery · powered by Swiggy Instamart
        </div>
      </div>

      {videoExpanded && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1200,
          background: '#000', animation: 'fade-in .25s ease-out',
        }}>
          <VideoPanel theme={theme} recipe={recipe} mode="fullscreen" onCollapse={() => setVideoExpanded(false)} />
        </div>
      )}
    </div>
  )
}
