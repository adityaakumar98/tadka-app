import { isYouTubeUrl, resolveYouTube } from './youtube.js'
import { resolveWeb } from './web.js'

export function detectPlatform(url) {
  return isYouTubeUrl(url) ? 'youtube' : 'web'
}

/**
 * url -> VideoContext:
 * { platform, url, videoId, embedUrl, title, author, description, transcript,
 *   thumbnailUrl, durationSeconds, recipeIngredient?, recipeYield? }
 */
export async function resolveSource(url) {
  return detectPlatform(url) === 'youtube' ? resolveYouTube(url) : resolveWeb(url)
}
