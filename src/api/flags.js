// Backend integration is opt-in. With this off (the default) the app runs entirely
// on the mock data in src/data.js — exactly as it did before the backend existed.
export const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true'

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'
