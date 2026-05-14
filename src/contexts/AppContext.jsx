import { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DATA } from '../data'

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

  const [showSwapFor, setShowSwapFor] = useState(null)
  const [showUnmatched, setShowUnmatched] = useState(false)
  const [showReelExpand, setShowReelExpand] = useState(false)

  const [savedIds, setSavedIds] = useState(new Set(DATA.savedRecipes))
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderId] = useState(() => 'TDK-' + Math.floor(100000 + Math.random() * 900000))

  const totalIngredients = DATA.pbmIngredients.length
  const [revealedCount, setRevealedCount] = useState(totalIngredients)
  const cartBuilding = revealedCount < totalIngredients

  const activeRecipe = DATA.recipes.find(r => r.id === activeRecipeId)
  const activeChef = DATA.chefs.find(c => c.id === activeRecipe.chef)
  const baseServes = activeRecipe.serves
  const pincode = address?.pin || '201009'

  const ingredients = useMemo(() => {
    return DATA.pbmIngredients.map(ing => {
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
  }, [ingState])

  const subtotal = useMemo(() => {
    const scale = servings / baseServes
    return ingredients.reduce((acc, ing) => {
      if (ing.unmatched) return acc
      return acc + Math.round(ing.price * Math.max(1, Math.ceil(scale)))
    }, 0)
  }, [ingredients, servings, baseServes])

  const delivery = 25
  const animatedTotal = useAnimatedNumber(subtotal + delivery, 500)

  const triggerCartBuild = () => {
    setRevealedCount(0)
    const matched = DATA.pbmIngredients.filter(i => !i.unmatched).length
    const total = DATA.pbmIngredients.length
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

  const goHome = () => navigate('/')

  const startRecipe = (recipeId) => {
    setActiveRecipeId(recipeId)
    setIngState({})
    setServings(DATA.recipes.find(r => r.id === recipeId).serves)
    setRevealedCount(0)
    if (!address) {
      setAddressSheet({
        context: 'first-run',
        nextOnSave: 'cart',
        nextOnSkip: 'cart',
      })
    } else {
      navigate('/cart')
      setTimeout(triggerCartBuild, 50)
    }
  }

  const handleAddressSave = (addr) => {
    setAddress(addr)
    const ctx = addressSheet
    setAddressSheet(null)
    if (ctx?.nextOnSave === 'cart') {
      navigate('/cart')
      setTimeout(triggerCartBuild, 50)
    } else if (ctx?.nextOnSave) {
      navigate('/' + ctx.nextOnSave)
    }
  }

  const handleAddressSkip = () => {
    const ctx = addressSheet
    setAddressSheet(null)
    if (ctx?.nextOnSkip === 'cart') {
      navigate('/cart')
      setTimeout(triggerCartBuild, 50)
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

  const placeOrder = () => {
    setPlacingOrder(true)
    setTimeout(() => {
      setPlacingOrder(false)
      navigate('/placed')
    }, 900)
  }

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
      placingOrder, placeOrder, orderId,
      startRecipe, onCheckout,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
