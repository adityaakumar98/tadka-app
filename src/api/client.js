// Thin fetch wrapper around the Tadka backend (server/).
// Only used when USE_BACKEND is true.

import { API_BASE } from './flags'

const SESSION_KEY = 'tadka-session'

const getSession = () => {
  try {
    return localStorage.getItem(SESSION_KEY) || ''
  } catch {
    return ''
  }
}
const setSession = (id) => {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id)
  } catch {
    /* ignore */
  }
}

async function req(path, { method = 'GET', body } = {}) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(getSession() ? { 'x-tadka-session': getSession() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const sid = res.headers.get('x-tadka-session')
  if (sid) setSession(sid)

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(data?.error || `${res.status} ${res.statusText}`)
  }
  return data
}

export const api = {
  // Discovery
  getAddresses: () => req('/addresses'),
  createAddress: (addr) => req('/addresses', { method: 'POST', body: addr }),
  selectAddress: (addressId) => req('/addresses/select', { method: 'POST', body: { addressId } }),

  // Reel -> cart
  parseReel: (url) => req('/recipes/parse', { method: 'POST', body: { url } }),
  buildCart: ({ addressId, ingredients }) =>
    req('/cart/build', { method: 'POST', body: { addressId, ingredients } }),
  getCart: () => req('/cart'),
  updateCart: (items, addressId) => req('/cart/update', { method: 'POST', body: { items, addressId } }),
  listCoupons: () => req('/cart/coupons'),
  applyCoupon: (couponCode) => req('/cart/coupon', { method: 'POST', body: { couponCode } }),

  // Checkout / payment
  getPaymentOptions: () => req('/payments/options'),
  checkout: (opts) => req('/checkout', { method: 'POST', body: opts }),
  pollPayment: (paasId) => req(`/payments/status?paasId=${encodeURIComponent(paasId)}`),
  confirmOrder: (orderId) => req('/orders/confirm', { method: 'POST', body: { orderId } }),

  // Tracking
  getOrders: () => req('/orders'),
  trackOrder: (id) => req(`/orders/${encodeURIComponent(id)}/track`),
}

// Open an external URL (UPI intent, OAuth). Uses the Capacitor Browser plugin on
// device so the WebView isn't navigated away from; falls back to window.location on web.
export async function openExternal(url) {
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor?.isNativePlatform?.()) {
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({ url })
      return
    }
  } catch {
    /* capacitor not installed / not native — fall through */
  }
  window.location.href = url
}
