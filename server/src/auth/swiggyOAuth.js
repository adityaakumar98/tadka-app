// OAuth 2.1 + PKCE helpers for linking a user's Swiggy account.
// The authorize-URL builder is real; token exchange is stubbed until we have
// Builders credentials (SWIGGY_OAUTH_* in .env).

import { createHash, randomBytes } from 'node:crypto'
import { config } from '../config.js'

const base64url = (buf) =>
  buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export function createPkcePair() {
  const verifier = base64url(randomBytes(32))
  const challenge = base64url(createHash('sha256').update(verifier).digest())
  return { verifier, challenge, method: 'S256' }
}

export function buildAuthorizeUrl({ challenge, state, scope = 'instamart.read instamart.write' }) {
  if (!config.oauth.authorizeUrl || !config.oauth.clientId) {
    const err = new Error('Swiggy OAuth is not configured (set SWIGGY_OAUTH_* in .env)')
    err.status = 501
    throw err
  }
  const u = new URL(config.oauth.authorizeUrl)
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('client_id', config.oauth.clientId)
  u.searchParams.set('redirect_uri', config.oauth.redirectUri)
  u.searchParams.set('code_challenge', challenge)
  u.searchParams.set('code_challenge_method', 'S256')
  u.searchParams.set('state', state)
  u.searchParams.set('scope', scope)
  return u.toString()
}

/**
 * Exchange an authorization code for tokens.
 * TODO: implement against SWIGGY_OAUTH_TOKEN_URL once credentials are issued.
 */
export async function exchangeCodeForTokens({ code, verifier }) {
  if (!config.oauth.tokenUrl || !config.oauth.clientId) {
    const err = new Error('Swiggy OAuth token exchange is not configured (set SWIGGY_OAUTH_* in .env)')
    err.status = 501
    throw err
  }
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.oauth.redirectUri,
    client_id: config.oauth.clientId,
    code_verifier: verifier,
  })
  const res = await fetch(config.oauth.tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`)
  const json = await res.json()
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: json.expires_in ? Date.now() + json.expires_in * 1000 : undefined,
  }
}
