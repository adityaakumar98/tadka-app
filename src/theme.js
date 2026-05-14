export function resolveTheme(t) {
  const dark = !!t.dark

  const accents = {
    terracotta: { primary: '#C8492A', hover: '#A93C20', soft: 'oklch(0.55 0.16 35)' },
    aubergine:  { primary: '#5B2A4E', hover: '#421E3A', soft: 'oklch(0.40 0.12 340)' },
    marigold:   { primary: '#D6921F', hover: '#B47812', soft: 'oklch(0.70 0.16 75)' },
  }
  const accent = accents[t.accent] || accents.terracotta

  const fonts = {
    'fraunces-geist': {
      display: '"Fraunces", "Times New Roman", serif',
      body: '"Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
    'playfair-inter': {
      display: '"Playfair Display", serif',
      body: '"Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
    'dmserif-grotesk': {
      display: '"DM Serif Display", serif',
      body: '"Space Grotesk", system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    },
  }
  const font = fonts[t.typePairing] || fonts['fraunces-geist']

  const heroCopies = {
    canonical: { lines: ['Watch.', 'Tap.', 'Tadka.'], sub: 'Paste a Reel. We do the shopping. You do the tadka.' },
    verb:      { lines: ['Watch.', 'Tadka.', 'Cook.'], sub: 'The final flourish on every recipe.' },
    reel:      { lines: ['Reel.', 'Cart.', 'Cook.'],   sub: 'From Instagram to Instamart in 60 seconds.' },
  }
  const hero = heroCopies[t.heroCopy] || heroCopies.canonical

  const ctaCopies = {
    'watch-cook':  { primary: 'Watch & cook',      sub: 'Paste any cooking Reel or Short' },
    'watch-build': { primary: 'Watch the recipe',  sub: "We'll build the cart while you watch" },
    'cook-this':   { primary: 'Cook this tonight', sub: 'Reel → cart → cook in under an hour' },
    'build-cart':  { primary: 'Build my cart',     sub: 'Paste any cooking Reel or Short' },
  }
  const cta = ctaCopies[t.ctaCopy] || ctaCopies['watch-cook']

  return {
    dark,
    accent: accent.primary,
    accentHover: accent.hover,
    accentSoft: accent.soft,
    marigold: '#E8A330',
    aubergine: '#5B2A4E',

    bg:         dark ? '#161311' : '#FAF6F0',
    bgRaised:   dark ? '#1F1B18' : '#FFFFFF',
    surface:    dark ? '#262220' : '#F2EBE0',
    surfaceAlt: dark ? '#2D2825' : '#EDE4D4',
    border:     dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,23,20,0.08)',
    borderStrong: dark ? 'rgba(255,255,255,0.14)' : 'rgba(26,23,20,0.14)',
    ink:    dark ? '#FAF6F0' : '#1A1714',
    ink2:   dark ? '#B0A89E' : '#5C5650',
    ink3:   dark ? '#807A72' : '#8A847C',
    success: dark ? '#5AA56A' : '#2D7A3E',
    warn: '#D4881A',
    danger: dark ? '#E25A47' : '#A82E1F',

    badgeStyle: t.badgeStyle || 'pill',
    density: t.density || 'comfy',
    logoStyle: t.logoStyle || 'sparks',
    typePairing: t.typePairing || 'fraunces-geist',

    font,
    hero,
    cta,
  }
}

export const theme = resolveTheme({
  dark: false,
  accent: 'aubergine',
  density: 'compact',
  badgeStyle: 'ribbon',
  typePairing: 'playfair-inter',
  heroCopy: 'canonical',
  ctaCopy: 'watch-cook',
  logoStyle: 'seeds',
})
