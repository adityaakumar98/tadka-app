import { Router } from 'express'
import { callTool, unwrap } from '../mcp/index.js'

export const orders = Router()

// POST /orders/confirm — finalize after a successful UPI payment.
orders.post('/confirm', async (req, res, next) => {
  try {
    res.json(unwrap(await callTool('confirm_order', { orderId: req.body?.orderId }, req.session)))
  } catch (e) {
    next(e)
  }
})

orders.get('/', async (req, res, next) => {
  try {
    res.json(unwrap(await callTool('get_orders', {}, req.session)))
  } catch (e) {
    next(e)
  }
})

orders.get('/:id', async (req, res, next) => {
  try {
    res.json(unwrap(await callTool('get_order_details', { orderId: req.params.id }, req.session)))
  } catch (e) {
    next(e)
  }
})

// GET /orders/:id/track — live status + rider/map. Poll on the returned
// pollingIntervalSeconds.
orders.get('/:id/track', async (req, res, next) => {
  try {
    const coords = req.session.addressCoords?.[req.session.selectedAddressId] || {}
    const args = { orderId: req.params.id, lat: coords.lat, lng: coords.lng }
    res.json(unwrap(await callTool('track_order', args, req.session)))
  } catch (e) {
    next(e)
  }
})
