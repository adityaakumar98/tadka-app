import { useState } from 'react'
import { theme as T } from '../theme'
import Sheet from '../components/Sheet'
import { Button, Icons } from '../components/UI'

function AddressForm({ theme, initial = {}, onSave, primaryLabel = 'Save & continue' }) {
  const [flat, setFlat] = useState(initial.flat || '')
  const [building, setBuilding] = useState(initial.building || '')
  const [area, setArea] = useState(initial.area || '')
  const [city, setCity] = useState(initial.city || 'Ghaziabad')
  const [pin, setPin] = useState(initial.pin || '')
  const [label, setLabel] = useState(initial.label || 'Home')
  const [phone, setPhone] = useState(initial.phone || '')

  const isPinComplete = /^\d{6}$/.test(pin)
  const isPinServiceable = isPinComplete && pin.startsWith('201')
  const isFormComplete = flat.trim() && building.trim() && area.trim() && /^\d{10}$/.test(phone)
  const canSubmit = isFormComplete && isPinServiceable

  const inputStyle = {
    width: '100%', background: theme.bgRaised,
    border: `1px solid ${theme.border}`, borderRadius: 12,
    padding: '12px 14px',
    fontSize: 14, color: theme.ink, outline: 'none',
    boxSizing: 'border-box',
  }
  const labelStyle = {
    fontSize: 11, color: theme.ink3, fontFamily: theme.font.mono,
    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8 }}>
      <label style={{ display: 'block' }}>
        <div style={labelStyle}>Flat / House no.</div>
        <input value={flat} onChange={(e) => setFlat(e.target.value.slice(0, 20))} placeholder="A-1402"
          style={{ ...inputStyle, fontFamily: theme.font.body, letterSpacing: '-0.01em' }} />
      </label>
      <label style={{ display: 'block' }}>
        <div style={labelStyle}>Building / Society</div>
        <input value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="ATS Pristine"
          style={{ ...inputStyle, fontFamily: theme.font.body, letterSpacing: '-0.01em' }} />
      </label>
      <label style={{ display: 'block' }}>
        <div style={labelStyle}>Area / Landmark</div>
        <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Siddharth Vihar, near Hindon Park"
          style={{ ...inputStyle, fontFamily: theme.font.body, letterSpacing: '-0.01em' }} />
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
        <label style={{ display: 'block' }}>
          <div style={labelStyle}>City</div>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ghaziabad"
            style={{ ...inputStyle, fontFamily: theme.font.body, letterSpacing: '-0.01em' }} />
        </label>
        <label style={{ display: 'block' }}>
          <div style={labelStyle}>Pincode</div>
          <input value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="201009" inputMode="numeric"
            style={{ ...inputStyle, fontFamily: theme.font.mono, letterSpacing: '0.12em' }} />
        </label>
      </div>
      <label style={{ display: 'block' }}>
        <div style={labelStyle}>Phone (for delivery updates)</div>
        <input value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="98XXXXXXXX" inputMode="numeric"
          style={{ ...inputStyle, fontFamily: theme.font.mono, letterSpacing: '0.12em' }} />
      </label>

      <div>
        <div style={{ ...labelStyle, marginBottom: 8 }}>Save as</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Home', 'Office', 'Other'].map(l => (
            <button key={l} onClick={() => setLabel(l)} style={{
              padding: '8px 14px', borderRadius: 999,
              background: label === l ? `${theme.accent}1a` : 'transparent',
              border: `1px solid ${label === l ? theme.accent : theme.border}`,
              color: label === l ? theme.accent : theme.ink2,
              fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: theme.font.body,
            }}>{l}</button>
          ))}
        </div>
      </div>

      {isPinComplete && !isPinServiceable && (
        <div style={{
          background: `${theme.warn}11`, border: `1px solid ${theme.warn}55`,
          borderRadius: 12, padding: 12,
          display: 'flex', alignItems: 'center', gap: 8, color: theme.warn, fontSize: 12,
        }}>
          <Icons.AlertTriangle size={14} />
          <div>V1 only delivers to Ghaziabad (201***). Try 201009 (Siddharth Vihar).</div>
        </div>
      )}
      {isPinServiceable && (
        <div style={{
          background: `${theme.success}11`, border: `1px solid ${theme.success}33`,
          borderRadius: 12, padding: 10,
          display: 'flex', alignItems: 'center', gap: 8, color: theme.success, fontSize: 12,
        }}>
          <Icons.Check size={14} />
          <div>Instamart delivers here — ETA 12–14 min</div>
        </div>
      )}

      <div style={{ marginTop: 4 }}>
        <Button theme={theme} fullWidth disabled={!canSubmit}
          onClick={() => onSave({ flat, building, area, city, pin, label, phone })}>
          {primaryLabel} <Icons.ArrowRight size={18} />
        </Button>
      </div>
    </div>
  )
}

export default function AddressSheet({ theme = T, recipe, initial, onSave, onSkip, onClose }) {
  const isEdit = !!initial?.flat

  return (
    <Sheet
      theme={theme} onClose={onClose} height="92%"
      title={isEdit ? 'Edit delivery address' : 'Where should we deliver?'}
      subtitle={isEdit
        ? 'Update your address — Instamart inventory varies by pincode.'
        : (recipe
          ? `We'll order ${recipe.title} ingredients to this address — usually in 10 minutes.`
          : `We'll order Tadka recipe ingredients to this address — usually in 10 minutes.`)
      }
    >
      {!isEdit && onSkip && (
        <div style={{
          marginBottom: 14,
          background: `linear-gradient(135deg, ${theme.accent}11 0%, ${theme.marigold}11 100%)`,
          border: `1px solid ${theme.accent}33`,
          borderRadius: 14, padding: 12,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: theme.accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icons.MapPin size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.ink, letterSpacing: '-0.01em' }}>
              Add now to skip later
            </div>
            <div style={{ fontSize: 11, color: theme.ink2, marginTop: 2, lineHeight: 1.35 }}>
              We'll have your ingredients ready by the time you finish watching the Reel.
            </div>
          </div>
        </div>
      )}

      <AddressForm
        theme={theme} initial={initial}
        onSave={onSave}
        primaryLabel={isEdit ? 'Save changes' : 'Save & continue'}
      />

      {!isEdit && onSkip && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}` }}>
          <button onClick={onSkip} style={{
            width: '100%', cursor: 'pointer',
            background: 'transparent', border: 'none',
            padding: '12px 0',
            color: theme.ink2, fontSize: 14, fontWeight: 500,
            fontFamily: theme.font.body, letterSpacing: '-0.01em',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            Watch the video, build cart later <Icons.ArrowRight size={15} />
          </button>
          <div style={{
            textAlign: 'center', color: theme.ink3, fontSize: 10.5,
            fontFamily: theme.font.mono, letterSpacing: '0.04em',
            marginTop: -4, paddingBottom: 6,
          }}>
            We'll ask before checkout
          </div>
        </div>
      )}
    </Sheet>
  )
}
