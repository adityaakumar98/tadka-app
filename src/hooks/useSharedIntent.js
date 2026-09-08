import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Receives URLs shared into Tadka on Android:
//  - the system share sheet (ACTION_SEND text/plain) via capacitor-plugin-send-intent
//  - deep links (App.appUrlOpen)
// Routes them to "/?shared=<url>", which HomeScreen picks up and runs the cart flow.
// No-op on web (and if the Capacitor plugins aren't present).

const URL_RE = /(https?:\/\/[^\s]+)/i

export function useSharedIntent() {
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    const cleanups = []

    async function init() {
      let Capacitor
      try {
        ;({ Capacitor } = await import('@capacitor/core'))
      } catch {
        return
      }
      if (!Capacitor?.isNativePlatform?.()) return

      const route = (raw) => {
        const match = URL_RE.exec(raw || '')
        if (match && !cancelled) navigate('/?shared=' + encodeURIComponent(match[1]))
      }

      // 1. Shared text (share sheet)
      try {
        const { SendIntent } = await import('send-intent')
        const check = async () => {
          try {
            const res = await SendIntent.checkSendIntentReceived()
            if (res?.url) route(decodeURIComponent(res.url))
            else if (res?.text) route(res.text)
          } catch {
            /* nothing pending */
          }
        }
        await check()
        const { App } = await import('@capacitor/app')
        const sub = await App.addListener('resume', check)
        cleanups.push(() => sub.remove())
      } catch {
        /* send-intent not installed */
      }

      // 2. Deep links
      try {
        const { App } = await import('@capacitor/app')
        const sub = await App.addListener('appUrlOpen', ({ url }) => {
          try {
            const u = new URL(url)
            const shared = u.searchParams.get('shared') || u.searchParams.get('url')
            if (shared) route(shared)
          } catch {
            route(url)
          }
        })
        cleanups.push(() => sub.remove())
      } catch {
        /* @capacitor/app not installed */
      }
    }

    init()
    return () => {
      cancelled = true
      cleanups.forEach((fn) => fn())
    }
  }, [navigate])
}
