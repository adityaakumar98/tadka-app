import { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DATA } from '../data'
import { USE_BACKEND } from '../api/flags'
import { api, openExternal } from '../api/client'

const SWATCHES = [
  'oklch(0.92 0.02 80)', 'oklch(0.55 0.20 25)', 'oklch(0.95 0.04 90)', 'oklch(0.93 0.02 85)',
  'oklch(0.82 0.06 85)', 'oklch(0.78 0.06 70)', 'oklch(0.90 0.03 95)', 'oklch(0.50 0.18 30)',
  'oklch(0.40 0.10 50)', 'oklch(0.55 0.10 130)', 'oklch(0.96 0.01 90)', 'oklch(0.85 0.04 130)',
]

// server /cart/build item[] -> the ingredient shape the screens expect (see DATA.pbmIngredients)
function adaptServerItems(items) {
  return items.map((it, idx) => {
    const swatch = SWATCHES[idx % SWATCHES.length]
    if (!it.matched) {
      return {
        id: `srv-${idx}`, name: it.query, qty: it.qtyText || '', size: '—',
        brand: '', chefPick: false, price: 0, unmatched: true, swatch,
      }
    }
    const p = it.product
    return {
      id: p.spinId || `srv-${idx}`, name: it.query, qty: it.qtyText || '',
      size: p.pack || '', brand: p.brand || '', chefPick: !!p.chefPick,
      price: p.price || 0, unmatched: false, swatch,
      image: p.imageUrl || null,
      alternatives: it.alternatives || [],
    }
  })
}

export const PREFILLED_ADDRESS = {
  flat: 'A-1402',
  building: 'ATS Pristine',
  area: 'Siddharth Vihar, near Hindon Park',
  city: 'Ghaziabad',
  pin: '201009',
  label: 'Home',
  phone: '9876543210',
}

export function useAnimatedNumber(target, duration = 600) {
  const [val, setVal] = useState(target)
  const startRef = useRef({ from: target, to: target, t0: 0 })
  useEffect(() => {
    if (target === val) return
    startRef.current = { from: val, to: target, t0: performance.now() }
    let raf
    const tick = (now) => {
      const { from, to, t0 } = startRef.current
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + (to - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return val
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [address, setAddress] = useState(null)
  const [addressSheet, setAddressSheet] = useState(null)

  const [activeRecipeId, setActiveRecipeId] = useState('pbm')
  const [servings, setServings] = useState(4)
  const [ingState, setIngState] = useState({})

  // Backend mode: populated by startRecipe() from /recipes/parse + /cart/build.
  const [baseIngredients, setBaseIngredients] = useState(DATA.pbmIngredients)
  const [serverRecipe, setServerRecipe] = useState(null)
  const [serverCart, setServerCart] = useState(null)
  const [serverAddresses, setServerAddresses] = useState([])
  const [serverOrderId, setServerOrderId] = useState(null)
  const [trackingInfo, setTrackingInfo] = useState(null)
  const [buildError, setBuildError] = useState(null)

  const [showSwapFor, setShowSwapFor] = useState(null)
  const [showUnmatched, setShowUnmatched] = useState(false)
  const [showReelExpand, setShowReelExpand] = useState(false)

  const [savedIds, setSavedIds] = useState(new Set(DATA.savedRecipes))
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderId] = useState(() => 'TDK-' + Math.floor(100000 + Math.random() * 900000))

  const totalIngredients = baseIngredients.length
  const [revealedCount, setRevealedCount] = useState(totalIngredients)
  const cartBuilding = revealedCount < totalIngredients

  const activeRecipe = serverRecipe
    || DATA.recipes.find(r => r.id === activeRecipeId)
    || DATA.recipes[0]
  const activeChef = DATA.chefs.find(c => c.id === activeRecipe.chef)
    || { id: 'chef', name: activeRecipe.chefName || 'Reel', handle: activeRecipe.reelHandle || '' }
  const baseServes = activeRecipe.serves
  const pincode = address?.pin || '201009'

  const ingredients = useMemo(() => {
    return baseIngredients.map(ing => {
      const st = ingState[ing.id] || {}
      if (st.removed) return null
      const swappedAlt = st.swappedTo
        ? DATA.paneerAlternatives.find(a => a.id === st.swappedTo)
        : null
      return {
        ...ing,
        brand: swappedAlt ? swappedAlt.brand : ing.brand,
        price: swappedAlt ? swappedAlt.price : ing.price,
        chefPick: swappedAlt ? swappedAlt.chefPick : ing.chefPick,
        swatch: swappedAlt ? swappedAlt.swatch : ing.swatch,
      }
    }).filter(Boolean)
  }, [ingState, baseIngredients])

  const subtotal = useMemo(() => {
    // Backend mode: trust the server's bill (no client-side servings re-scale yet).
    if (serverCart?.billBreakdown?._numeric) {
      return serverCart.billBreakdown._numeric.itemTotal
    }
    const scale = servings / baseServes
    return ingredients.reduce((acc, ing) => {
      if (ing.unmatched) return acc
      return acc + Math.round(ing.price * Math.max(1, Math.ceil(scale)))
    }, 0)
  }, [ingredients, servings, baseServes, serverCart])

  const delivery = serverCart?.billBreakdown?._numeric?.delivery ?? 25
  const animatedTotal = useAnimatedNumber(subtotal + delivery, 500)

  // Staggered "sourcing…" reveal. Drives the skeleton rows on the cart screen —
  // in mock mode over a fixed list, in backend mode over the real match count.
  const triggerCartBuild = (list = baseIngredients) => {
    setRevealedCount(0)
    const matched = list.filter(i => !i.unmatched).length
    const total = list.length
    let n = 0
    const matchedTick = (i) => (i < 2 ? 480 : i < 6 ? 320 : 360) + Math.random() * 80
    const step = () => {
      n += 1
      setRevealedCount(n)
      if (n < matched) setTimeout(step, matchedTick(n))
      else if (n < total) setTimeout(step, 1100)
    }
    setTimeout(step, 450)
  }

  // Backend mode: Reel URL -> parsed recipe -> real Instamart cart.
  const runBackendBuild = async (url) => {
    setBuildError(null)
    setRevealedCount(0)
    try {
      const parsed = await api.parseReel(url)
      // Keep the fixture gradient only as a fallback when there's no real thumbnail/embed.
      setServerRecipe({
        ...parsed.recipe,
        gradient: parsed.recipe?.thumbnailUrl || parsed.recipe?.embedUrl ? undefined : DATA.recipes[0].gradient,
      })
      if (parsed.recipe?.serves) setServings(parsed.recipe.serves)

      const addressId = address?.id || serverAddresses[0]?.id
      const built = await api.buildCart({ addressId, ingredients: parsed.ingredients })
      const adapted = adaptServerItems(built.items)
      setBaseIngredients(adapted)
      setServerCart(built.cart)
      triggerCartBuild(adapted)
    } catch (e) {
      setBuildError(e.message || 'Could not build your cart')
      setBaseIngredients(DATA.pbmIngredients)
    }
  }

  const pendingBuildRef = useRef(null)

  const proceedToCart = (arg) => {
    navigate('/cart')
    if (USE_BACKEND) {
      const url = /^https?:\/\//i.test(arg || '') ? arg : `https://tadka.app/sample/${arg || 'pbm'}`
      runBackendBuild(url)
    } else {
      setTimeout(() => triggerCartBuild(DATA.pbmIngredients), 50)
    }
  }

  const goHome = () => navigate('/')

  const startRecipe = (arg) => {
    const isUrl = /^https?:\/\//i.test(arg || '')
    if (!isUrl && arg) setActiveRecipeId(arg)
    setIngState({})
    setServerCart(null)
    setServerRecipe(null)
    setBuildError(null)
    if (!isUrl && DATA.recipes.find(r => r.id === arg)) {
      setServings(DATA.recipes.find(r => r.id === arg).serves)
      setBaseIngredients(DATA.pbmIngredients)
    }
    setRevealedCount(0)
    pendingBuildRef.current = arg
    if (!address && !USE_BACKEND) {
      setAddressSheet({ context: 'first-run', nextOnSave: 'cart', nextOnSkip: 'cart' })
    } else {
      proceedToCart(arg)
    }
  }

  const handleAddressSave = (addr) => {
    setAddress(addr)
    const ctx = addressSheet
    setAddressSheet(null)
    if (USE_BACKEND) {
      api.createAddress(addr).then((r) => {
        if (r?.address) setAddress({ ...addr, id: r.address.id })
      }).catch(() => {})
    }
    if (ctx?.nextOnSave === 'cart') {
      proceedToCart(pendingBuildRef.current)
    } else if (ctx?.nextOnSave) {
      navigate('/' + ctx.nextOnSave)
    }
  }

  const handleAddressSkip = () => {
    const ctx = addressSheet
    setAddressSheet(null)
    if (ctx?.nextOnSkip === 'cart') {
      proceedToCart(pendingBuildRef.current)
    }
  }

  const onCheckout = () => {
    if (!address) {
      setAddressSheet({ context: 'first-run', nextOnSave: 'checkout' })
    } else {
      navigate('/checkout')
    }
  }

  const toggleSaved = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Load the user's saved Swiggy addresses once, in backend mode.
  useEffect(() => {
    if (!USE_BACKEND) return
    api.getAddresses()
      .then((d) => {
        const list = d?.addresses || []
        setServerAddresses(list)
        if (list[0] && !address) {
          setAddress({ id: list[0].id, label: list[0].addressTag, area: list[0].addressLine })
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll live tracking after an order is placed (backend mode).
  useEffect(() => {
    if (!USE_BACKEND || !serverOrderId) return
    let stop = false
    let timer
    const tick = async () => {
      try {
        const t = await api.trackOrder(serverOrderId)
        if (stop) return
        setTrackingInfo(t)
        timer = setTimeout(tick, (t.pollingIntervalSeconds || 15) * 1000)
      } catch {
        /* keep last known state */
      }
    }
    tick()
    return () => { stop = true; clearTimeout(timer) }
  }, [serverOrderId])

  const placeOrderMock = () => {
    setPlacingOrder(true)
    setTimeout(() => {
      setPlacingOrder(false)
      navigate('/placed')
    }, 900)
  }

  const placeOrderBackend = async () => {
    setPlacingOrder(true)
    try {
      const opts = await api.getPaymentOptions()
      const method = (opts.allMethods || []).includes('COD') ? 'COD' : 'UPI'
      const res = await api.checkout({ addressId: address?.id, paymentMethod: method })

      if (res.status === 'PAYMENT_PENDING' && res.upiIntentUrl) {
        await openExternal(res.upiIntentUrl)
        const deadline = Date.now() + (res.maxTimeToPollForInMs || 120000)
        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, res.pollingIntervalInMs || 2000))
          const s = await api.pollPayment(res.paasId)
          if (s.terminal) {
            if (s.isTerminalSuccess && !s.confirmed) await api.confirmOrder(res.orderId)
            if (s.isTerminalFailure) throw new Error('Payment failed')
            break
          }
        }
      }
      setServerOrderId(res.orderId)
      setPlacingOrder(false)
      navigate('/placed')
    } catch (e) {
      setPlacingOrder(false)
      setBuildError(e.message || 'Could not place your order')
    }
  }

  const placeOrder = USE_BACKEND ? placeOrderBackend : placeOrderMock

  return (
    <AppContext.Provider value={{
      location,
      navigate, goHome,
      address, setAddress, pincode,
      addressSheet, setAddressSheet,
      handleAddressSave, handleAddressSkip,
      activeRecipe, activeChef, activeRecipeId,
      servings, setServings, baseServes,
      ingState, setIngState,
      ingredients, subtotal, delivery, animatedTotal,
      revealedCount, cartBuilding, triggerCartBuild,
      showSwapFor, setShowSwapFor,
      showUnmatched, setShowUnmatched,
      showReelExpand, setShowReelExpand,
      savedIds, toggleSaved,
      placingOrder, placeOrder, orderId: serverOrderId || orderId,
      startRecipe, onCheckout,
      serverCart, serverAddresses, trackingInfo, buildError,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
