import { Router } from 'express'
import { callTool, unwrap } from '../mcp/index.js'

export const checkout = Router()

// POST /checkout — place the order.
// Body: { addressId?, paymentMethod?: "COD"|"UPI"|"SwiggyPay", intentApp?, generateUPIQR? }
// COD -> returns { orderId, status:"PLACED", ... }
// UPI -> returns { orderId, paasId, upiIntentUrl, pollingIntervalInMs, ... } — open the
//        intent URL, then poll /payments/status, then POST /orders/confirm.
checkout.post('/', async (req, res, next) => {
  try {
    const addressId = req.body?.addressId || req.session.selectedAddressId
    const args = {
      addressId,
      paymentMethod: req.body?.paymentMethod || 'COD',
      intentApp: req.body?.intentApp,
      generateUPIQR: req.body?.generateUPIQR,
    }
    res.json(unwrap(await callTool('checkout', args, req.session)))
  } catch (e) {
    next(e)
  }
})
