export function SizzleMark({ size = 24, style = 'seeds', primary = '#5B2A4E', accent = '#E8A330', animated = false }) {
  const cx = 12, cy = 12

  if (style === 'seeds') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: 'visible', flexShrink: 0 }}>
        {animated && (
          <style>{`
            @keyframes tdk-pop2 { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }
            .sd { transform-origin: 12px 12px; animation: tdk-pop2 2.4s ease-in-out infinite; }
            .sd2{animation-delay:.18s} .sd3{animation-delay:.34s} .sd4{animation-delay:.5s}
            .sd5{animation-delay:.66s} .sd6{animation-delay:.82s}
          `}</style>
        )}
        <circle cx={cx} cy={cy} r="1.6" fill={primary} className={animated ? 'sd' : ''} />
        <circle cx={cx} cy={cy - 8} r="1.3" fill={accent} className={animated ? 'sd sd2' : ''} />
        <circle cx={cx + 7} cy={cy - 4} r="1.3" fill={accent} className={animated ? 'sd sd3' : ''} />
        <circle cx={cx + 7} cy={cy + 4} r="1.3" fill={accent} className={animated ? 'sd sd4' : ''} />
        <circle cx={cx - 7} cy={cy - 3} r="1.3" fill={accent} className={animated ? 'sd sd5' : ''} />
        <circle cx={cx - 7} cy={cy + 4} r="1.3" fill={accent} className={animated ? 'sd sd6' : ''} />
        <circle cx={cx} cy={cy + 8} r="1.3" fill={accent} className={animated ? 'sd sd2' : ''} />
      </svg>
    )
  }

  if (style === 'burst') {
    const strokes = [
      { a: -95, l: 8 }, { a: -65, l: 6 }, { a: -40, l: 7.5 },
      { a: -10, l: 6 }, { a: 35, l: 5.5 }, { a: -130, l: 6.5 }, { a: -160, l: 5 },
    ]
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: 'visible', flexShrink: 0 }}>
        <g style={animated ? { transformOrigin: '12px 12px', animation: 'tdk-burst 1.8s ease-in-out infinite' } : {}}>
          {strokes.map((s, i) => {
            const rad = (s.a * Math.PI) / 180
            const x1 = cx + Math.cos(rad) * 3, y1 = cy + Math.sin(rad) * 3
            const x2 = cx + Math.cos(rad) * (3 + s.l), y2 = cy + Math.sin(rad) * (3 + s.l)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="2" strokeLinecap="round" />
          })}
          <circle cx={cx} cy={cy} r="2.2" fill={primary} />
        </g>
      </svg>
    )
  }

  // sparks
  const strokes = [-90, -36, 18, 90, 162]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: 'visible', flexShrink: 0 }}>
      {strokes.map((a, i) => {
        const rad = (a * Math.PI) / 180
        const x1 = cx + Math.cos(rad) * 4, y1 = cy + Math.sin(rad) * 4
        const x2 = cx + Math.cos(rad) * 10.5, y2 = cy + Math.sin(rad) * 10.5
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={accent} strokeWidth="2.4" strokeLinecap="round"
            style={animated ? { animation: `tdk-sparks 1.6s ease-in-out ${i * 0.12}s infinite` } : {}}
          />
        )
      })}
      <circle cx={cx} cy={cy} r="2.4" fill={primary}
        style={animated ? { transformOrigin: '12px 12px', animation: 'tdk-sparks-center 1.6s ease-in-out infinite' } : {}}
      />
    </svg>
  )
}

export function TadkaLogo({ size = 26, theme, animated = false, wordmarkColor }) {
  const wm = wordmarkColor || theme.accent
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.28 }}>
      <SizzleMark size={size * 1.15} style={theme.logoStyle} primary={theme.accent} accent={theme.marigold} animated={animated} />
      <span style={{
        fontFamily: theme.font.display,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.02em',
        color: wm,
        lineHeight: 1,
      }}>tadka</span>
    </div>
  )
}
