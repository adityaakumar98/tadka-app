import { Router } from 'express'
import { callTool, unwrap } from '../mcp/index.js'

export const support = Router()

// POST /support/report — file an incident. Body: { context, message }
support.post('/report', async (req, res, next) => {
  try {
    res.json(unwrap(await callTool('report_error', req.body || {}, req.session)))
  } catch (e) {
    next(e)
  }
})
