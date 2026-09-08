import { useState } from 'react'
import { theme as T } from '../theme'
import { Button, ProductImage, ReelTile, Icons } from '../components/UI'
import { useAnimatedNumber } from '../contexts/AppContext'

function SectionLabel({ theme, children }) {
  return (
    <div style={{
      fontSize: 11, color: theme.ink3,
      fontFamily: theme.font.mono, letterSpacing: '0.08em', textTransform: 'uppercase',
      margin: '18px 2px 8px',
    }}>{children}</div>
  )
}

function BillRow({ theme, k, v, info, strikeFrom, valueColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 0' }}>
      <div style={{ color: theme.ink2, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {k}
        {info && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 13, height: 13, borderRadius: '50%',
            border: `1px solid ${theme.ink3}`,
            color: theme.ink3, fontSize: 9, fontWeight: 700, marginLeft: 2,
          }}>i</span>
        )}
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
        {strikeFrom !== undefined && (
          <span style={{ color: theme.ink3, fontSize: 12, textDecoration: 'line-through' }}>₹{strikeFrom}</span>
        )}
        <span style={{
          color: valueColor || theme.ink, fontSize: 13, fontWeight: 500,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
        }}>{v}</span>
      </div>
    </div>
  )
}

export default function CheckoutScreen({
  theme = T, recipe, chef, ingredients, servings, baseServes,
  subtotal, pincode, address, onChangePincode,
  onBack, onPlaceOrder, placing,
}) {
  const itemTotal = subtotal
  const packaging = 8
  const handling = 6
  const gst = Math.round(itemTotal * 0.05)
  const delivery = itemTotal >= 1000 ? 0 : 25
  const total = itemTotal + packaging + handling + gst + delivery
  const matchedCount = ingredients.filter(i => !i.unmatched).length

  const animatedTotal = useAnimatedNumber(total, 400)
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ paddingBottom: 120 }}>
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
        <div style={{ fontFamily: theme.font.display, fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>
          Review & place order
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div style={{ padding: '14px 18px 0' }}>
        {/* Recipe sliver */}
        <div style={{
          background: theme.bgRaised, borderRadius: 14,
          border: `1px solid ${theme.border}`,
          padding: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 56, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
            <ReelTile recipe={recipe} theme={theme} height={72} rounded={10} showOverlay={false} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: theme.font.display, fontSize: 16, fontWeight: 500,
              color: theme.ink, letterSpacing: '-0.01em', lineHeight: 1.15,
            }}>{recipe.title}</div>
            <div style={{ color: theme.ink3, fontSize: 11.5, marginTop: 4 }}>
              Chef {chef.name} · serves {servings}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: theme.ink3, fontFamily: theme.font.mono, letterSpacing: '0.04em' }}>ITEMS</div>
            <div style={{ fontFamily: theme.font.display, fontSize: 18, fontWeight: 600, color: theme.ink }}>{matchedCount}</div>
          </div>
        </div>

        <SectionLabel theme={theme}>Deliver to</SectionLabel>
        <button onClick={onChangePincode} style={{
          width: '100%', textAlign: 'left', cursor: 'pointer',
          background: theme.bgRaised, border: `1px solid ${theme.border}`,
          borderRadius: 14, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: theme.surface,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent,
          }}><Icons.MapPin size={18} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>
              {address?.label || 'Home'} · {address?.city || 'Ghaziabad'}
            </div>
            <div style={{ color: theme.ink3, fontSize: 11.5, marginTop: 2, fontFamily: theme.font.mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {address?.flat ? `${address.flat}, ${address.building}, ${address.area}` : 'Siddharth Vihar'} · {pincode} · ETA 12–14 min
            </div>
          </div>
          <span style={{
            fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: '0.02em',
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>Change</span>
        </button>

        <SectionLabel theme={theme}>Order summary</SectionLabel>
        <div style={{
          background: theme.bgRaised, border: `1px solid ${theme.border}`,
          borderRadius: 14, overflow: 'hidden',
        }}>
          {(expanded ? ingredients : ingredients.slice(0, 3)).map((ing, idx, arr) => (
            <div key={ing.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              borderBottom: idx < arr.length - 1 ? `1px solid ${theme.border}` : 'none',
              opacity: ing.unmatched ? 0.55 : 1,
            }}>
              <ProductImage image={ing.image} color={ing.swatch} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: theme.ink, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  {ing.name}
                </div>
                <div style={{ color: theme.ink3, fontSize: 11, fontFamily: theme.font.mono, marginTop: 2 }}>
                  {ing.brand} · {ing.size}
                </div>
              </div>
              <div style={{ fontFamily: theme.font.display, fontSize: 13, fontWeight: 600, color: theme.ink, fontVariantNumeric: 'tabular-nums' }}>
                {ing.unmatched ? '—' : `₹${ing.price}`}
              </div>
            </div>
          ))}
          {ingredients.length > 3 && (
            <button onClick={() => setExpanded(!expanded)} style={{
              width: '100%', padding: '10px 12px',
              background: 'transparent', border: 'none', borderTop: `1px solid ${theme.border}`,
              cursor: 'pointer', color: theme.accent, fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
            }}>
              {expanded ? 'Show fewer' : `+ ${ingredients.length - 3} more items`}
            </button>
          )}
        </div>

        <SectionLabel theme={theme}>Bill details</SectionLabel>
        <div style={{ background: theme.bgRaised, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 14 }}>
          <BillRow theme={theme} k="Item total" v={`₹${itemTotal}`} />
          <BillRow theme={theme} k="Packaging" v={`₹${packaging}`} />
          <BillRow theme={theme} k="Handling fee" v={`₹${handling}`} />
          <BillRow theme={theme} k="GST & charges" v={`₹${gst}`} info />
          <BillRow theme={theme} k="Delivery"
            v={delivery === 0 ? 'FREE' : `₹${delivery}`}
            strikeFrom={delivery === 0 ? 25 : undefined}
            valueColor={delivery === 0 ? theme.success : undefined}
          />
          <div style={{ height: 1, background: theme.border, margin: '10px 0' }} />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: theme.font.display, fontSize: 17, fontWeight: 500, color: theme.ink }}>Total payable</div>
            <div style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 600, color: theme.ink, fontVariantNumeric: 'tabular-nums' }}>
              ₹{animatedTotal}
            </div>
          </div>
        </div>

        <SectionLabel theme={theme}>Payment</SectionLabel>
        <div style={{
          background: theme.bgRaised, border: `1.5px solid ${theme.accent}`,
          borderRadius: 14, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${theme.accent}1a`, color: theme.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700,
          }}>₹</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink }}>Cash on Delivery</div>
            <div style={{ color: theme.ink3, fontSize: 11.5, marginTop: 2 }}>
              Pay the runner when your groceries arrive
            </div>
          </div>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: theme.accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icons.Check size={13} color="#fff" />
          </div>
        </div>
        <div style={{ marginTop: 8, color: theme.ink3, fontSize: 11, fontFamily: theme.font.mono, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>UPI & cards coming in V2</span>
        </div>
      </div>

      <div style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        padding: '14px 18px 24px',
        background: `linear-gradient(180deg, transparent 0%, ${theme.bg} 30%)`,
        marginTop: 24,
      }}>
        <Button theme={theme} fullWidth onClick={onPlaceOrder} loading={placing} disabled={placing}>
          {placing ? null : <>Place order · ₹{total} <Icons.ArrowRight size={18} /></>}
        </Button>
        <div style={{ textAlign: 'center', color: theme.ink3, fontSize: 11, marginTop: 8, fontFamily: theme.font.mono, letterSpacing: '0.04em' }}>
          Powered by Swiggy Instamart · COD only in V1
        </div>
      </div>
    </div>
  )
}
