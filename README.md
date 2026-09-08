# Tadka — Watch. Tap. Cook.

Paste a cooking Reel → Tadka builds your Swiggy Instamart cart → you cook.

Three pieces:

| Piece | Path | What it is |
|---|---|---|
| Web app / PWA | `/` (`src/`) | React 19 + Vite. Runs standalone on mock data, or against the backend. |
| Backend | `server/` | Node + Express. Owns the Swiggy Instamart **MCP** connection and the Reel→cart pipeline. Mock mode by default. |
| Android app | `android/` | Capacitor wrapper of the web app. Adds the Instagram **share sheet** ("Share → Tadka"), UPI intents, notifications. |

## Web app

```bash
npm install
npm run dev            # http://localhost:3001  (mock data)
npm run build
npm run lint
```

To run against the backend, copy `.env.example` → `.env` and set `VITE_USE_BACKEND=true`.
With the flag off (the default) the app is entirely self-contained — no backend needed.

## Backend (`server/`)

```bash
cd server
cp .env.example .env
npm install
npm run dev            # http://localhost:8787
curl localhost:8787/health   # {"ok":true,"mcp":"mock","llm":"mock"}
```

Flags (all default off — the app runs on fixtures):

- **`SWIGGY_MCP_ENABLED`** — real Instamart tool calls (needs Swiggy Builders OAuth creds).
  Off → `server/src/mcp/mock.js`, shaped like the [documented MCP responses](https://mcp.swiggy.com/builders/docs/reference/instamart).
  Real product **photos** only appear when this is on.
- **`VIDEO_RESOLVE_ENABLED`** — pull the real title / thumbnail / **embed player** /
  transcript for a pasted URL. YouTube needs the `yt-dlp` binary on PATH
  (`brew install yt-dlp` or `pipx install yt-dlp`); other URLs are fetched directly.
- **`LLM_ENABLED`** — run Claude (`server/src/pipeline/extract.js`) to extract the ingredient
  list from the resolved text. Needs `ANTHROPIC_API_KEY`.
  - `VIDEO_RESOLVE_ENABLED` + `LLM_ENABLED` off → real player, **fixture** ingredient list.
  - both on → the real thing.

Sources handled: YouTube (Shorts + videos, via yt-dlp) and any recipe URL (og: tags +
JSON-LD `Recipe`). Instagram / TikTok are not wired yet.

Routes: `/recipes/parse`, `/cart/build`, `/cart`, `/cart/coupon`, `/payments/options`,
`/payments/status`, `/checkout`, `/orders/:id/track`, `/addresses`, `/auth/swiggy/*`.

## Android (Capacitor)

Requires Node ≥ 22, Android Studio + SDK.

```bash
npm run build
npx cap sync android
npx cap open android          # or: npm run android
```

- The share-sheet handler and deep links live in `src/hooks/useSharedIntent.js`
  (no-op on web). Shared URLs route to `/?shared=<url>`, which `HomeScreen` runs.
- Dev live-reload on a device: set `server.url` in `capacitor.config.json` to your
  machine's LAN IP (e.g. `http://192.168.1.5:3001`), then `npx cap sync android`.
- `WebFrame.jsx` (desktop phone-shell preview) and `InstallPrompt` are inert inside
  the native WebView.

## Not done yet

Real Swiggy OAuth + MCP (no credentials), Instagram / TikTok source resolvers,
audio-only transcription for caption-less videos, coupon UI, `your_go_to_items` screen,
multi-store checkout, UPI app picker, manual ingredient entry, iOS, Play Store signing,
FCM push backend. Session/token store is in-memory. See the PR description for the full
follow-up list.
