// In-memory session store. SKELETON ONLY — replace with Redis/DB before production:
// everything here is lost on restart and not shared across instances.

import { randomUUID } from 'node:crypto'

/** @type {Map<string, Session>} */
const sessions = new Map()

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {number} createdAt
 * @property {{accessToken?: string, refreshToken?: string, expiresAt?: number}} tokens
 * @property {Object|null} oauthFlow   transient PKCE state during an auth round-trip
 * @property {string|null} selectedAddressId
 * @property {Array<{spinId:string, skuId:string, name:string, brand:string, quantity:number, price:number, mrp:number, inStock:boolean}>} cartItems
 * @property {string|null} appliedCoupon
 * @property {Object|null} lastOrder
 * @property {Object|null} lastPayment
 */

export function getSession(id) {
  return id ? sessions.get(id) || null : null
}

export function ensureSession(id) {
  let s = getSession(id)
  if (s) return s
  const newId = id || randomUUID()
  s = {
    id: newId,
    createdAt: Date.now(),
    tokens: {},
    oauthFlow: null,
    selectedAddressId: null,
    cartItems: [],
    appliedCoupon: null,
    lastOrder: null,
    lastPayment: null,
  }
  sessions.set(newId, s)
  return s
}

export function sessionCount() {
  return sessions.size
}
