import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { config } from '../config.js'
import { createPkcePair, buildAuthorizeUrl, exchangeCodeForTokens } from '../auth/swiggyOAuth.js'

export const auth = Router()

// POST /auth/swiggy/start — begin linking the user's Swiggy account.
// Returns { authorizeUrl } for the app to open. Stubbed until SWIGGY_OAUTH_* is set.
auth.post('/swiggy/start', (req, res, next) => {
  try {
    const { verifier, challenge } = createPkcePair()
    const state = randomUUID()
    req.session.oauthFlow = { verifier, state, startedAt: Date.now() }
    const authorizeUrl = buildAuthorizeUrl({ challenge, state })
    res.json({ authorizeUrl, state })
  } catch (e) {
    next(e)
  }
})

// GET /auth/swiggy/callback?code=&state= — OAuth redirect target.
auth.get('/swiggy/callback', async (req, res, next) => {
  try {
    const flow = req.session.oauthFlow
    if (!flow || flow.state !== req.query.state) {
      return res.status(400).send('Invalid or expired OAuth state')
    }
    const tokens = await exchangeCodeForTokens({ code: req.query.code, verifier: flow.verifier })
    req.session.tokens = tokens
    req.session.oauthFlow = null
    res.send('Swiggy account linked. You can close this window.')
  } catch (e) {
    next(e)
  }
})

// GET /auth/swiggy/status — is this session linked?
auth.get('/swiggy/status', (req, res) => {
  res.json({
    configured: !!(config.oauth.clientId && config.oauth.authorizeUrl),
    linked: !!req.session.tokens?.accessToken,
  })
})
