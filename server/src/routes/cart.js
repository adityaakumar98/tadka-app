import { Router } from 'express'
import { z } from 'zod'
import { callTool, unwrap } from '../mcp/index.js'

export const cart = Router()

const BuildBody = z.object({
  addressId: z.string().min(1),
  ingredients: z
    .array(z.object({ name: z.string().min(1), qty: z.string().optional(), unit: z.string().optional() }))
    .min(1),
})

// Pick the best variation for an ingredient: prefer chef-pick + in-stock, then in-stock, then first.
function pickVariation(product) {
  const vs = product.variations || []
  return vs.find((v) => v.isInStockAndAvailable) || vs[0] || null
}

function shapeProduct(product, variation) {
  return {
    name: product.displayName,
    brand: product.brand,
    productId: product.productId,
    parentProductId: product.parentProductId,
    spinId: variation?.spinId,
    skuId: variation?.skuId,
    pack: variation?.quantityDescription,
    price: variation?.price?.offerPrice ?? null,
    mrp: variation?.price?.mrp ?? null,
    inStock: !!variation?.isInStockAndAvailable,
    imageUrl: variation?.imageUrl,
    rating: variation?.rating || null,
    vegClassifier: variation?.vegClassifier,
    chefPick: (product.badges || []).some((b) => /chef/i.test(b.text || '')),
  }
}

// POST /cart/build — search every ingredient, build the cart, return match report + cart.
cart.post('/build', async (req, res, next) => {
  try {
    const { addressId, ingredients } = BuildBody.parse(req.body || {})
    req.session.selectedAddressId = addressId

    const items = []
    const cartItems = []

    for (const ing of ingredients) {
      const data = unwrap(await callTool('search_products', { addressId, query: ing.name }, req.session))
      const products = data.products || []
      if (!products.length) {
        items.push({ query: ing.name, qtyText: ing.qty || '', matched: false, reason: 'NOT_STOCKED' })
        continue
      }
      const [primary, ...rest] = products
      const variation = pickVariation(primary)
      const product = shapeProduct(primary, variation)
      const alternatives = rest.map((p) => shapeProduct(p, pickVariation(p)))

      items.push({ query: ing.name, qtyText: ing.qty || '', matched: true, product, alternatives })
      if (product.spinId) {
        cartItems.push({ spinId: product.spinId, skuId: product.skuId, name: ing.name, quantity: 1 })
      }
    }

    const cartData = unwrap(
      await callTool('update_cart', { selectedAddressId: addressId, items: cartItems }, req.session),
    )

    res.json({ addressId, items, cart: cartData })
  } catch (e) {
    if (e?.issues) e.status = 400
    next(e)
  }
})

cart.get('/', async (req, res, next) => {
  try {
    res.json(unwrap(await callTool('get_cart', {}, req.session)))
  } catch (e) {
    next(e)
  }
})

// POST /cart/update — { items: [{ spinId, skuId, name?, quantity }] } (replaces the whole cart)
cart.post('/update', async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : []
    const addressId = req.body?.addressId || req.session.selectedAddressId
    res.json(unwrap(await callTool('update_cart', { selectedAddressId: addressId, items }, req.session)))
  } catch (e) {
    next(e)
  }
})

cart.post('/clear', async (req, res, next) => {
  try {
    res.json(unwrap(await callTool('clear_cart', {}, req.session)))
  } catch (e) {
    next(e)
  }
})

cart.get('/coupons', async (req, res, next) => {
  try {
    res.json(unwrap(await callTool('list_coupons', {}, req.session)))
  } catch (e) {
    next(e)
  }
})

cart.post('/coupon', async (req, res, next) => {
  try {
    res.json(unwrap(await callTool('apply_coupon', { couponCode: req.body?.couponCode }, req.session)))
  } catch (e) {
    next(e)
  }
})
