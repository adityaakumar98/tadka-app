// The single choke point every route goes through to reach an MCP tool.
// Mock vs live is decided here so routes never branch on it.

import { config } from '../config.js'
import { callMockTool } from './mock.js'

/**
 * @param {string} name   MCP tool name, e.g. "search_products"
 * @param {object} args    tool arguments
 * @param {import('../store.js').Session} session
 * @returns {Promise<{success:boolean, data?:any, error?:{message:string}, message?:string}>}
 */
export async function callTool(name, args = {}, session) {
  if (config.mcp.enabled && session?.tokens?.accessToken) {
    const { callLiveTool } = await import('./client.js')
    return callLiveTool(name, args, session)
  }
  if (config.mcp.enabled && !session?.tokens?.accessToken) {
    return {
      success: false,
      error: { message: 'Swiggy account not linked. Complete /auth/swiggy/start first.' },
    }
  }
  return callMockTool(name, args, session)
}

/** Throw a route-friendly error if a tool call failed. */
export function unwrap(res) {
  if (!res || res.success === false) {
    const msg = res?.error?.message || res?.message || 'MCP tool call failed'
    const err = new Error(msg)
    err.status = 502
    throw err
  }
  return res.data
}
