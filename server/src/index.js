import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { config, modeSummary } from './config.js'
import { sessionMiddleware } from './session.js'
import { sessionCount } from './store.js'

import { auth } from './routes/auth.js'
import { addresses } from './routes/addresses.js'
import { recipes } from './routes/recipes.js'
import { cart } from './routes/cart.js'
import { payments } from './routes/payments.js'
import { checkout } from './routes/checkout.js'
import { orders } from './routes/orders.js'
import { support } from './routes/support.js'

const app = express()

app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    exposedHeaders: ['X-Tadka-Session'],
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ ok: true, ...modeSummary(), sessions: sessionCount() })
})

app.use(sessionMiddleware)

app.use('/auth', auth)
app.use('/addresses', addresses)
app.use('/recipes', recipes)
app.use('/cart', cart)
app.use('/payments', payments)
app.use('/checkout', checkout)
app.use('/orders', orders)
app.use('/support', support)

app.use((err, _req, res, _next) => {
  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: err.message || 'Internal error' })
})

app.listen(config.port, () => {
  const m = modeSummary()
  console.log(`tadka-server on :${config.port}  ·  mcp=${m.mcp}  llm=${m.llm}  video=${m.video}`)
  if (m.mcp === 'mock') console.log('  MCP mock mode — set SWIGGY_MCP_ENABLED=true + link an account for live data.')
})
