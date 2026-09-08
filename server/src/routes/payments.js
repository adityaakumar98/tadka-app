import { Router } from 'express'
import { callTool, unwrap } from '../mcp/index.js'

export const payments = Router()

// GET /payments/options — live payment methods + which checkout tool to call next.
payments.get('/options', async (req, res, next) => {
  try {
    res.json(unwrap(await callTool('get_payment_options', {}, req.session)))
  } catch (e) {
    next(e)
  }
})

// GET /payments/status?paasId=... — poll a UPI payment. Client uses the interval
// returned by /checkout; do not tight-loop.
payments.get('/status', async (req, res, next) => {
  try {
    const paasId = req.query.paasId
    if (!paasId) return res.status(400).json({ error: 'paasId is required' })
    res.json(unwrap(await callTool('check_payment_status', { paasId }, req.session)))
  } catch (e) {
    next(e)
  }
})
