// Generic URL resolver: fetch the page and pull recipe signal from it.
// Priority: JSON-LD Recipe > OpenGraph tags > readable text.

import { isIP } from 'node:net'

// Basic SSRF guard. NOT exhaustive — DNS-rebind and IPv6-mapped ranges are not covered.
// Full hardening (resolve + re-check on every redirect) is a follow-up.
function assertSafeUrl(raw) {
  let u
  try {
    u = new URL(raw)
  } catch {
    throw badRequest('That is not a valid URL')
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') throw badRequest('URL must be http(s)')
  const host = u.hostname
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    throw badRequest('Refusing to fetch a local address')
  }
  if (isIP(host)) {
    const priv =
      /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) || /^::1$/.test(host) || /^fe80:/i.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    if (priv) throw badRequest('Refusing to fetch a private address')
  }
  return u
}

function badRequest(msg) {
  const e = new Error(msg)
  e.status = 400
  return e
}

function metaTag(html, prop) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`,
    'i',
  )
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
    'i',
  )
  return (html.match(re) || html.match(alt) || [])[1] || ''
}

function extractRecipeJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const [, raw] of blocks) {
    let json
    try {
      json = JSON.parse(raw.trim())
    } catch {
      continue
    }
    const nodes = Array.isArray(json) ? json : json['@graph'] ? json['@graph'] : [json]
    for (const node of nodes) {
      const types = [].concat(node['@type'] || [])
      if (types.some((t) => String(t).toLowerCase() === 'recipe')) {
        return {
          name: node.name || '',
          recipeIngredient: [].concat(node.recipeIngredient || node.ingredients || []),
          recipeYield: Array.isArray(node.recipeYield) ? node.recipeYield[0] : node.recipeYield || '',
          description: node.description || '',
        }
      }
    }
  }
  return null
}

function readableText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000)
}

export async function resolveWeb(url) {
  const u = assertSafeUrl(url)

  let res
  try {
    res = await fetch(u, {
      redirect: 'follow',
      headers: { 'user-agent': 'TadkaBot/0.1 (+https://tadka.app)' },
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    const e = new Error('Could not fetch that page')
    e.status = 502
    throw e
  }
  if (!res.ok) {
    const e = new Error(`That page returned ${res.status}`)
    e.status = 502
    throw e
  }

  const buf = await res.arrayBuffer()
  const html = Buffer.from(buf.slice(0, 2 * 1024 * 1024)).toString('utf8')

  const ld = extractRecipeJsonLd(html)
  const ogTitle = metaTag(html, 'og:title')
  const ogDesc = metaTag(html, 'og:description')
  const ogImage = metaTag(html, 'og:image')
  const titleTag = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || ''

  return {
    platform: 'web',
    url,
    videoId: null,
    embedUrl: null,
    title: ld?.name || ogTitle || titleTag || 'Recipe',
    author: metaTag(html, 'author') || '',
    description: [ld?.description, ogDesc].filter(Boolean).join('\n') || readableText(html),
    transcript: '',
    recipeIngredient: ld?.recipeIngredient || [],
    recipeYield: ld?.recipeYield || '',
    thumbnailUrl: ogImage || null,
    durationSeconds: null,
  }
}
