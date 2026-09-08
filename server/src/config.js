// Reads process.env (populated by `node --env-file=.env`) into a typed-ish config object.

const bool = (v, dflt = false) =>
  v == null ? dflt : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase())

export const config = {
  port: Number(process.env.PORT) || 8787,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3001')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  mcp: {
    enabled: bool(process.env.SWIGGY_MCP_ENABLED),
    url: process.env.SWIGGY_MCP_URL || 'https://mcp.swiggy.com/im',
  },

  oauth: {
    clientId: process.env.SWIGGY_OAUTH_CLIENT_ID || '',
    authorizeUrl: process.env.SWIGGY_OAUTH_AUTHORIZE_URL || '',
    tokenUrl: process.env.SWIGGY_OAUTH_TOKEN_URL || '',
    redirectUri:
      process.env.SWIGGY_OAUTH_REDIRECT_URI ||
      'http://localhost:8787/auth/swiggy/callback',
  },

  llm: {
    enabled: bool(process.env.LLM_ENABLED),
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-opus-5',
  },

  // Resolve real video metadata (title, thumbnail, embed, transcript) via yt-dlp / fetch.
  // Independent of the LLM step so a real player can be shown without an Anthropic key.
  videoResolve: {
    enabled: bool(process.env.VIDEO_RESOLVE_ENABLED),
  },
  ytdlp: {
    path: process.env.YTDLP_PATH || 'yt-dlp',
  },
  youtube: {
    noCookie: bool(process.env.YOUTUBE_NOCOOKIE, true),
  },
}

// A one-line summary for /health and boot logs.
export const modeSummary = () => ({
  mcp: config.mcp.enabled ? 'live' : 'mock',
  llm: config.llm.enabled ? 'live' : 'mock',
  video: config.videoResolve.enabled ? 'resolve' : 'off',
})
