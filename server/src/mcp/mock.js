// Fixture implementations of all 19 Swiggy Instamart MCP tools.
// Responses mirror the shapes documented at
// https://mcp.swiggy.com/builders/docs/reference/instamart so the real client can
// be swapped in (see ./index.js) without touching the routes.

import { PBM_INGREDIENTS, PANEER_ALTERNATIVES, ADDRESSES } from '../fixtures/data.js'

const ok = (data, message) => ({ success: true, data, message })
const fail = (message) => ({ success: false, error: { message } })

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const rupee = (n) => Math.round(n)

// ---- product shaping -------------------------------------------------------

function variation(ing, idx = 0) {
  return {
    spinId: `spin_${slug(ing.brand)}_${slug(ing.name)}`,
    skuId: `sku_${slug(ing.brand)}_${slug(ing.name)}_${idx}`,
    displayName: `${ing.brand} ${ing.name}`,
    quantityDescription: ing.pack,
    price: {
      mrp: ing.mrp || ing.price,
      offerPrice: ing.price,
      unitLevelPrice: ing.pack,
    },
    isInStockAndAvailable: !ing.outOfStock,
    // Real product photos come from live Swiggy (SWIGGY_MCP_ENABLED=true); the mock
    // has none, so the app falls back to the colour swatch.
    imageUrl: null,
    rating: { value: 4.3, count: 128 },
    vegClassifier: 'VEG',
    maxQuantity: 12,
  }
}

function searchProduct(ing) {
  return {
    displayName: ing.name,
    brand: ing.brand,
    productId: `prod_${slug(ing.brand)}_${slug(ing.name)}`,
    parentProductId: `parent_${slug(ing.name)}`,
    inStock: !ing.outOfStock,
    isAvail: !ing.outOfStock,
    variations: [variation(ing)],
    isPromoted: !!ing.chefPick,
    badges: ing.chefPick ? [{ text: 'Chef pick', type: 'PROMO' }] : [],
  }
}

function findIngredient(query) {
  const q = query.toLowerCase().trim()
  return (
    PBM_INGREDIENTS.find((i) => i.name.toLowerCase() === q) ||
    PBM_INGREDIENTS.find((i) => i.name.toLowerCase().includes(q) || q.includes(i.name.toLowerCase())) ||
    PBM_INGREDIENTS.find((i) => q.split(/\s+/).some((w) => w.length > 2 && i.name.toLowerCase().includes(w)))
  )
}

// ---- cart / bill ----------------------------------------------------------

function billBreakdown(items, coupon) {
  const itemTotal = items.reduce((a, it) => a + it.price * it.quantity, 0)
  const packaging = items.length ? 8 : 0
  const handling = items.length ? 6 : 0
  const gst = rupee(itemTotal * 0.05)
  const delivery = itemTotal >= 1000 || itemTotal === 0 ? 0 : 25
  const discount = coupon ? Math.min(100, rupee(itemTotal * 0.1)) : 0
  const toPay = itemTotal + packaging + handling + gst + delivery - discount

  const lineItems = [
    { label: 'Item total', value: `₹${itemTotal}` },
    { label: 'Packaging charge', value: `₹${packaging}` },
    { label: 'Handling fee', value: `₹${handling}` },
    { label: 'GST & charges', value: `₹${gst}` },
    { label: 'Delivery fee', value: delivery === 0 ? 'FREE' : `₹${delivery}` },
  ]
  if (discount) lineItems.push({ label: `Coupon (${coupon})`, value: `-₹${discount}` })

  return {
    lineItems,
    toPay: { label: 'To pay', value: `₹${toPay}` },
    _numeric: { itemTotal, packaging, handling, gst, delivery, discount, toPay },
  }
}

function cartPayload(session) {
  const items = session.cartItems
  return {
    items: items.map((it) => ({
      spinId: it.spinId,
      skuId: it.skuId,
      displayName: it.name,
      brand: it.brand,
      quantity: it.quantity,
      price: { mrp: it.mrp, offerPrice: it.price },
      inStock: it.inStock,
    })),
    itemCount: items.reduce((a, it) => a + it.quantity, 0),
    billBreakdown: billBreakdown(items, session.appliedCoupon),
    address: session.selectedAddressId
      ? ADDRESSES.find((a) => a.id === session.selectedAddressId) || { id: session.selectedAddressId }
      : null,
    appliedCoupon: session.appliedCoupon,
    unserviceableItems: [],
    warnings: [],
    paymentMethods: ['UPI', 'COD', 'SwiggyPay'],
  }
}

// ---- tool dispatch ------------------------------------------------------------

const tools = {
  // ---------- Discover ----------
  get_addresses: (_args, _s) =>
    ok({
      addresses: ADDRESSES,
      page: 1,
      pageSize: 10,
      total: ADDRESSES.length,
    }),

  create_address: (args) => {
    const id = `addr_${slug(args.label || 'other')}_${Date.now().toString(36)}`
    const created = {
      id,
      addressLine: args.addressLine || [args.flat, args.building, args.area, args.city, args.pin]
        .filter(Boolean)
        .join(', '),
      phoneNumber: args.phoneNumber || args.phone || '',
      addressCategory: args.label || 'Other',
      addressTag: args.label || 'Other',
    }
    ADDRESSES.push(created)
    return ok({ address: created })
  },

  delete_address: (args) => {
    const i = ADDRESSES.findIndex((a) => a.id === args.addressId)
    if (i === -1) return fail(`Unknown addressId ${args.addressId}`)
    ADDRESSES.splice(i, 1)
    return ok({ deleted: args.addressId })
  },

  search_products: (args) => {
    if (!args.query || !args.query.trim()) return fail('query cannot be empty')
    const ing = findIngredient(args.query)
    if (!ing || ing.outOfStock) {
      return ok({ nextOffset: '', products: [], similarProducts: [] })
    }
    const products = [searchProduct(ing)]
    // Paneer gets its alternatives inline so the swap sheet has real data.
    if (/paneer/i.test(ing.name)) {
      for (const alt of PANEER_ALTERNATIVES) {
        if (alt.brand === ing.brand) continue
        products.push(searchProduct({ ...ing, brand: alt.brand, price: alt.price, mrp: alt.mrp, chefPick: alt.chefPick }))
      }
    }
    return ok({ nextOffset: '', products, similarProducts: [] })
  },

  your_go_to_items: () => {
    const staples = PBM_INGREDIENTS.filter((i) => ['Sugar', 'Garlic', 'Ginger', 'White Butter'].includes(i.name))
    return ok({ nextOffset: '', products: staples.map(searchProduct), similarProducts: [] })
  },

  // ---------- Cart ----------
  get_cart: (_args, s) => ok(cartPayload(s)),

  update_cart: (args, s) => {
    const items = Array.isArray(args.items) ? args.items : []
    // update_cart REPLACES the whole cart (per docs).
    const resolved = []
    const reducedQuantityItems = []
    for (const raw of items) {
      const ing =
        findIngredient(raw.name || raw.displayName || '') ||
        PBM_INGREDIENTS.find((i) => `spin_${slug(i.brand)}_${slug(i.name)}` === raw.spinId)
      if (!ing || ing.outOfStock) continue
      let quantity = Math.max(1, Number(raw.quantity) || 1)
      if (quantity > 12) {
        reducedQuantityItems.push({ name: ing.name, requested: quantity, allowed: 12, reason: 'MAX_QUANTITY' })
        quantity = 12
      }
      resolved.push({
        spinId: `spin_${slug(ing.brand)}_${slug(ing.name)}`,
        skuId: `sku_${slug(ing.brand)}_${slug(ing.name)}_0`,
        name: ing.name,
        brand: ing.brand,
        quantity,
        price: ing.price,
        mrp: ing.mrp || ing.price,
        inStock: true,
      })
    }
    s.cartItems = resolved
    const removedOutOfStockItems = items
      .filter((raw) => {
        const ing = findIngredient(raw.name || raw.displayName || '')
        return ing && ing.outOfStock
      })
      .map((raw) => ({ name: raw.name || raw.displayName }))
    return ok({ ...cartPayload(s), removedOutOfStockItems, reducedQuantityItems })
  },

  clear_cart: (_args, s) => {
    s.cartItems = []
    s.appliedCoupon = null
    return ok(cartPayload(s))
  },

  list_coupons: (_args, s) =>
    ok({
      coupons: [
        { code: 'SAVE100', title: '₹100 off over ₹599', minOrder: 599 },
        { code: 'FREEDEL', title: 'Free delivery', minOrder: 0 },
        { code: 'TADKA10', title: '10% off, up to ₹100', minOrder: 299 },
      ],
      appliedCoupon: s.appliedCoupon,
    }),

  apply_coupon: (args, s) => {
    const code = String(args.couponCode || '').toUpperCase()
    const known = ['SAVE100', 'FREEDEL', 'TADKA10']
    if (!known.includes(code)) return fail(`Coupon ${code} is not valid for this cart`)
    s.appliedCoupon = code
    return ok(cartPayload(s), `Coupon ${code} applied`)
  },

  // ---------- Payment ----------
  get_payment_options: () =>
    ok({
      platforms: {
        mobile: [
          { id: 'gpay', name: 'Google Pay', intentApp: 'gpay://upi/' },
          { id: 'phonepe', name: 'PhonePe', intentApp: 'phonepe://upi/' },
          { id: 'paytm', name: 'Paytm', intentApp: 'paytmmp://upi/' },
        ],
        desktop: [{ id: 'upi-qr', name: 'Scan QR to pay' }],
      },
      cod: { available: true, id: 'COD' },
      allMethods: ['UPI', 'COD', 'SwiggyPay'],
      placeOrderToolName: 'checkout',
    }),

  check_payment_status: (args, s) => {
    const p = s.lastPayment
    if (!p || p.paasId !== args.paasId) {
      return ok({ terminal: false, isTerminalSuccess: false, isTerminalFailure: false, paasId: args.paasId, status: 'PENDING' })
    }
    // Simulate: succeeds ~4s after checkout.
    const elapsed = Date.now() - p.startedAt
    if (elapsed < 4000) {
      return ok({ terminal: false, isTerminalSuccess: false, isTerminalFailure: false, paasId: p.paasId, orderId: p.orderId, status: 'PENDING' })
    }
    p.terminal = true
    return ok({
      terminal: true,
      isTerminalSuccess: true,
      isTerminalFailure: false,
      confirmed: !!p.confirmed,
      paasId: p.paasId,
      orderId: p.orderId,
      status: 'SUCCESS',
    })
  },

  confirm_order: (args, s) => {
    const p = s.lastPayment
    if (p) p.confirmed = true
    const order = s.lastOrder
    if (order) order.status = 'CONFIRMED'
    return ok({ orderId: args.orderId || order?.orderId, status: 'CONFIRMED', confirmed: true })
  },

  // ---------- Order ----------
  checkout: (args, s) => {
    if (!s.cartItems.length) return fail('Cart is empty')
    const bill = billBreakdown(s.cartItems, s.appliedCoupon)
    const orderId = `SW${Date.now().toString().slice(-9)}`
    const address = ADDRESSES.find((a) => a.id === (args.addressId || s.selectedAddressId))
    const method = (args.paymentMethod || 'COD').toUpperCase()

    s.lastOrder = {
      orderId,
      status: method === 'UPI' ? 'PAYMENT_PENDING' : 'PLACED',
      paymentMethod: method,
      cartTotal: bill.toPay.value,
      cartTotalNumeric: bill._numeric.toPay,
      addressId: address?.id,
      deliveryAddress: address?.addressLine,
      deliveryLabel: address?.addressTag,
      items: s.cartItems.map((it) => ({ name: it.name, quantity: it.quantity, price: `₹${it.price * it.quantity}` })),
      placedAt: new Date().toISOString(),
    }

    if (method === 'UPI') {
      const paasId = `paas_${Date.now().toString(36)}`
      s.lastPayment = { paasId, orderId, startedAt: Date.now(), terminal: false, confirmed: false }
      return ok({
        orderId,
        transactionId: `txn_${Date.now().toString(36)}`,
        paasId,
        upiIntentUrl: `${args.intentApp || 'upi://pay'}?pa=swiggy@icici&pn=Swiggy&am=${bill._numeric.toPay}&tr=${orderId}&cu=INR`,
        bridgeUrl: `https://mcp.swiggy.com/im/upi/bridge/${paasId}`,
        isQrFlow: !!args.generateUPIQR,
        pollingIntervalInMs: 2000,
        maxTimeToPollForInMs: 120000,
        paymentMethod: 'UPI',
        status: 'PAYMENT_PENDING',
        addressId: address?.id,
        cartTotal: bill.toPay.value,
        deliveryAddress: address?.addressLine,
      })
    }

    return ok({
      orderId,
      status: 'PLACED',
      paymentMethod: method,
      cartTotal: bill.toPay.value,
      addressId: address?.id,
      deliveryAddress: address?.addressLine,
      deliveryLabel: address?.addressTag,
    })
  },

  // ---------- Track ----------
  get_orders: (_args, s) => {
    const orders = s.lastOrder ? [s.lastOrder] : []
    return ok({ orders, count: orders.length })
  },

  get_order_details: (args, s) => {
    const o = s.lastOrder
    if (!o || (args.orderId && o.orderId !== args.orderId)) return fail(`Unknown orderId ${args.orderId}`)
    return ok(o)
  },

  get_delivery_status: (args, s) => {
    const o = s.lastOrder
    if (!o) return fail('No active order')
    return ok({ orderId: o.orderId, status: 'OUT_FOR_DELIVERY', etaMinutes: 12, substatus: 'Runner picked up your order' })
  },

  track_order: (args, s) => {
    const o = s.lastOrder
    if (!o || (args.orderId && o.orderId !== args.orderId)) return fail(`Unknown orderId ${args.orderId}`)
    const ageMin = (Date.now() - new Date(o.placedAt).getTime()) / 60000
    const stage =
      ageMin < 1 ? { message: 'Order placed', substatus: 'Store is accepting your order', eta: 13 } :
      ageMin < 3 ? { message: 'Picking & packing', substatus: 'Your items are being packed', eta: 11 } :
      ageMin < 6 ? { message: 'Out for delivery', substatus: 'Runner is on the way', eta: 6 } :
                   { message: 'Arriving', substatus: 'Runner is near your location', eta: 2 }
    return ok({
      orderId: o.orderId,
      orderTitle: 'Your Instamart order',
      orderSubtitle: `${o.items.length} items`,
      status: { message: stage.message, substatus: stage.substatus, etaMinutes: stage.eta, etaText: `${stage.eta} min` },
      storeInfo: { name: 'Instamart — Siddharth Vihar', address: 'Hindon Park, Ghaziabad' },
      deliveryInfo: { label: o.deliveryLabel, fullAddress: o.deliveryAddress },
      items: o.items,
      itemCount: o.items.length,
      placedAt: o.placedAt,
      paymentInfo: { method: o.paymentMethod, total: o.cartTotal },
      mapInfo: {
        store: { lat: 28.6612, lng: 77.4192 },
        delivery: { lat: 28.6725, lng: 77.4361 },
        rider: { lat: 28.667 + Math.min(ageMin, 6) * 0.001, lng: 77.428 + Math.min(ageMin, 6) * 0.002 },
      },
      pollingIntervalSeconds: 15,
    })
  },

  // ---------- Support ----------
  report_error: (args) =>
    ok({ incidentId: `INC-${Date.now().toString(36).toUpperCase()}`, received: true, context: args?.context || null }),
}

export function callMockTool(name, args = {}, session) {
  const fn = tools[name]
  if (!fn) return fail(`Unknown MCP tool: ${name}`)
  try {
    return fn(args, session)
  } catch (err) {
    return fail(err?.message || 'mock tool error')
  }
}

export const MOCK_TOOL_NAMES = Object.keys(tools)
