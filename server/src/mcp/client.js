// Real Swiggy Instamart MCP client (streamable HTTP).
// Only used when SWIGGY_MCP_ENABLED=true AND the session has an OAuth access token.
// Until Builders credentials exist this path is never taken (see ./index.js).

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { config } from '../config.js'

/** @type {Map<string, Client>} one connected client per session access token */
const clients = new Map()

async function getClient(accessToken) {
  if (!accessToken) throw new Error('Swiggy MCP requires a linked account (missing access token)')
  const existing = clients.get(accessToken)
  if (existing) return existing

  const transport = new StreamableHTTPClientTransport(new URL(config.mcp.url), {
    requestInit: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const client = new Client({ name: 'tadka-backend', version: '0.0.0' }, { capabilities: {} })
  await client.connect(transport)
  clients.set(accessToken, client)
  return client
}

/**
 * Invoke a tool on the live MCP server. Returns the parsed JSON payload the
 * tool produced (the routes expect the documented `{ success, data, message }`
 * envelope).
 */
export async function callLiveTool(name, args, session) {
  const client = await getClient(session?.tokens?.accessToken)
  const result = await client.callTool({ name, arguments: args })

  // MCP tool results arrive as content blocks; Swiggy returns a single JSON text block.
  const text = (result.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('')
  try {
    return JSON.parse(text)
  } catch {
    return { success: !result.isError, data: text, message: result.isError ? 'tool error' : undefined }
  }
}

export async function closeAll() {
  for (const c of clients.values()) {
    try {
      await c.close()
    } catch {
      /* ignore */
    }
  }
  clients.clear()
}
