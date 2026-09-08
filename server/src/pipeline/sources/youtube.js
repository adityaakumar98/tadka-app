import { config } from '../../config.js'
import { ytdlpInfo, ytdlpTranscript } from './ytdlp.js'

const HOSTS = new Set([
  'youtube.com', 'www.youtube.com', 'm.youtube.com',
  'youtu.be', 'www.youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com',
])

export function isYouTubeUrl(url) {
  try {
    const u = new URL(url)
    return (u.protocol === 'https:' || u.protocol === 'http:') && HOSTS.has(u.hostname)
  } catch {
    return false
  }
}

export function youTubeVideoId(url) {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be' || u.hostname === 'www.youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null
    }
    if (u.pathname.startsWith('/watch')) return u.searchParams.get('v')
    const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/)
    return m ? m[1] : null
  } catch {
    return null
  }
}

export async function resolveYouTube(url) {
  const videoId = youTubeVideoId(url)
  if (!videoId) {
    const err = new Error('Could not find a video id in that YouTube URL')
    err.status = 400
    throw err
  }

  const info = await ytdlpInfo(url)
  const transcript = await ytdlpTranscript(info)
  const host = config.youtube.noCookie ? 'www.youtube-nocookie.com' : 'www.youtube.com'

  return {
    platform: 'youtube',
    url,
    videoId,
    embedUrl: `https://${host}/embed/${videoId}?playsinline=1&rel=0&modestbranding=1`,
    title: info.title || 'Recipe',
    author: info.uploader || info.channel || '',
    description: info.description || '',
    transcript,
    thumbnailUrl: info.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    durationSeconds: info.duration || null,
  }
}
