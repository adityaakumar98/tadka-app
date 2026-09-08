// Thin wrapper around the `yt-dlp` binary: metadata JSON + a plaintext transcript.
// No shell (execFile), no ffmpeg (we fetch caption tracks directly and parse them).

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { config } from '../../config.js'

const run = promisify(execFile)

let _available = null
export async function ytdlpAvailable() {
  if (_available !== null) return _available
  try {
    await run(config.ytdlp.path, ['--version'], { timeout: 8000 })
    _available = true
  } catch {
    _available = false
  }
  return _available
}

/** `yt-dlp -J <url>` -> parsed info JSON. Throws with an install hint if the binary is missing. */
export async function ytdlpInfo(url) {
  if (!(await ytdlpAvailable())) {
    const err = new Error(
      `yt-dlp is not installed (looked for "${config.ytdlp.path}"). Install it: "brew install yt-dlp" or "pipx install yt-dlp".`,
    )
    err.status = 501
    throw err
  }
  let stdout
  try {
    ;({ stdout } = await run(
      config.ytdlp.path,
      ['-J', '--no-warnings', '--no-playlist', '--socket-timeout', '15', url],
      { timeout: 45_000, maxBuffer: 20 * 1024 * 1024 },
    ))
  } catch (e) {
    const err = new Error(`yt-dlp could not read that video: ${String(e.stderr || e.message).slice(0, 300)}`)
    err.status = 502
    throw err
  }
  return JSON.parse(stdout)
}

// Pick the best English caption track from an info JSON.
function pickCaptionTrack(info) {
  const pools = [info.subtitles, info.automatic_captions].filter(Boolean)
  for (const pool of pools) {
    const langKey =
      Object.keys(pool).find((k) => k === 'en') ||
      Object.keys(pool).find((k) => k.startsWith('en-') || k.startsWith('en_')) ||
      Object.keys(pool).find((k) => k.toLowerCase().startsWith('en'))
    if (!langKey) continue
    const tracks = pool[langKey] || []
    const byFmt = (f) => tracks.find((t) => t.ext === f)
    const track = byFmt('json3') || byFmt('srv3') || byFmt('vtt') || tracks[0]
    if (track?.url) return { url: track.url, ext: track.ext }
  }
  return null
}

function parseJson3(text) {
  const data = JSON.parse(text)
  return (data.events || [])
    .flatMap((ev) => (ev.segs || []).map((s) => s.utf8))
    .join('')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseVtt(text) {
  return text
    .split('\n')
    .filter((l) => l && !l.startsWith('WEBVTT') && !/^\d+$/.test(l) && !l.includes('-->') && !l.startsWith('NOTE'))
    .join(' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Fetch + flatten the caption track referenced by an info JSON. Returns '' if none. */
export async function ytdlpTranscript(info) {
  const track = pickCaptionTrack(info)
  if (!track) return ''
  try {
    const res = await fetch(track.url, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) return ''
    const text = await res.text()
    if (track.ext === 'json3' || track.ext === 'srv3' || text.trimStart().startsWith('{')) {
      return parseJson3(text)
    }
    return parseVtt(text)
  } catch {
    return ''
  }
}
