import { useState, useEffect, useRef } from 'react'

export function scaledQty(qty, scale) {
  const m = qty.match(/^([\d.½⅓¼¾⅔⅛]+)\s*(.*)$/)
  if (!m) return qty
  const numRaw = m[1]
    .replace('½', '.5').replace('⅓', '.33').replace('¼', '.25')
    .replace('¾', '.75').replace('⅔', '.67').replace('⅛', '.125')
  const num = parseFloat(numRaw)
  if (Number.isNaN(num)) return qty
  const scaled = num * scale
  const display = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10
  return `${display} ${m[2]}`.trim()
}

export function fmtTime(seconds) {
  const s = Math.floor(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function useAnimatedNumber(target, duration = 600) {
  const [val, setVal] = useState(target)
  const startRef = useRef({ from: target, to: target, t0: 0 })
  useEffect(() => {
    if (target === val) return
    startRef.current = { from: val, to: target, t0: performance.now() }
    let raf
    const tick = (now) => {
      const { from, to, t0 } = startRef.current
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + (to - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return val
}
