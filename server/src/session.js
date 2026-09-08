// Issues/loads a session per request. Skeleton: in-memory (see ./store.js).

import { ensureSession } from './store.js'

export const SESSION_HEADER = 'x-tadka-session'

export function sessionMiddleware(req, res, next) {
  const incoming = req.get(SESSION_HEADER) || req.cookies?.tadka_session || null
  const session = ensureSession(incoming)
  req.session = session
  res.set('X-Tadka-Session', session.id)
  res.cookie?.('tadka_session', session.id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  })
  next()
}
