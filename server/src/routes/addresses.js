import { Router } from 'express'
import { callTool, unwrap } from '../mcp/index.js'

export const addresses = Router()

// GET /addresses — list saved Swiggy addresses.
addresses.get('/', async (req, res, next) => {
  try {
    const data = unwrap(await callTool('get_addresses', { page: 1, pageSize: 10 }, req.session))
    res.json(data)
  } catch (e) {
    next(e)
  }
})

// POST /addresses — create one. Body: { flat, building, area, city, pin, label, phone, lat?, lng? }
addresses.post('/', async (req, res, next) => {
  try {
    const data = unwrap(await callTool('create_address', req.body || {}, req.session))
    // MCP addresses carry no coordinates; keep the client-supplied pair on our session
    // so track_order (which needs lat/lng) can use it later.
    if (req.body?.lat && req.body?.lng && data?.address?.id) {
      req.session.addressCoords ??= {}
      req.session.addressCoords[data.address.id] = { lat: Number(req.body.lat), lng: Number(req.body.lng) }
    }
    res.status(201).json(data)
  } catch (e) {
    next(e)
  }
})

// POST /addresses/select — remember which address the session is ordering to.
addresses.post('/select', (req, res) => {
  req.session.selectedAddressId = req.body?.addressId || null
  res.json({ selectedAddressId: req.session.selectedAddressId })
})

addresses.delete('/:id', async (req, res, next) => {
  try {
    const data = unwrap(await callTool('delete_address', { addressId: req.params.id }, req.session))
    res.json(data)
  } catch (e) {
    next(e)
  }
})
