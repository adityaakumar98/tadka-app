import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'
import { useSharedIntent } from './hooks/useSharedIntent'
import { DATA } from './data'

import HomeScreen from './screens/HomeScreen'
import CartScreen from './screens/CartScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import OrderPlacedScreen from './screens/OrderPlacedScreen'
import RecipesScreen from './screens/RecipesScreen'
import ChefScreen from './screens/ChefScreen'

import AddressSheet from './sheets/AddressSheet'
import SwapSheet from './sheets/SwapSheet'
import UnmatchedSheet from './sheets/UnmatchedSheet'
import ReelExpand from './sheets/ReelExpand'

import { theme } from './theme'

function Overlays() {
  const {
    activeRecipe, ingState, setIngState, ingredients,
    showSwapFor, setShowSwapFor,
    showUnmatched, setShowUnmatched,
    showReelExpand, setShowReelExpand,
    addressSheet, setAddressSheet,
    address, handleAddressSave, handleAddressSkip,
  } = useApp()

  return (
    <>
      {showSwapFor && (
        <SwapSheet
          theme={theme}
          ingredient={DATA.pbmIngredients.find(i => i.id === showSwapFor)}
          alternatives={DATA.paneerAlternatives}
          currentSwap={ingState[showSwapFor]?.swappedTo}
          onChoose={(altId) => {
            setIngState(p => ({ ...p, [showSwapFor]: { ...p[showSwapFor], swappedTo: altId } }))
            setShowSwapFor(null)
          }}
          onClose={() => setShowSwapFor(null)}
        />
      )}
      {showUnmatched && (
        <UnmatchedSheet
          theme={theme}
          items={ingredients.filter(i => i.unmatched)}
          onClose={() => setShowUnmatched(false)}
        />
      )}
      {addressSheet && (
        <AddressSheet
          theme={theme}
          recipe={activeRecipe}
          initial={address || {}}
          onSave={handleAddressSave}
          onSkip={addressSheet.context === 'first-run' && addressSheet.nextOnSkip ? handleAddressSkip : null}
          onClose={() => setAddressSheet(null)}
        />
      )}
      {showReelExpand && (
        <ReelExpand
          theme={theme}
          recipe={activeRecipe}
          onClose={() => setShowReelExpand(false)}
        />
      )}
    </>
  )
}

function ChefRoute({ startRecipe, goHome }) {
  const { chefId } = useParams()
  const chef = DATA.chefs.find(c => c.id === chefId)
  if (!chef) return <Navigate to="/" replace />
  return <ChefScreen theme={theme} chef={chef} onBack={goHome} onOpenRecipe={startRecipe} />
}

function AppRoutes() {
  useSharedIntent()
  const {
    activeRecipe, activeChef,
    servings, setServings, baseServes,
    ingState, setIngState,
    ingredients, subtotal, delivery, animatedTotal,
    revealedCount, cartBuilding,
    onCheckout, navigate, goHome,
    savedIds, toggleSaved,
    pincode, address, setAddressSheet,
    placingOrder, placeOrder, orderId,
    startRecipe,
    setShowSwapFor, setShowUnmatched, setShowReelExpand,
    trackingInfo,
  } = useApp()

  const itemTotal = subtotal
  const gst = Math.round(itemTotal * 0.05)
  const del = itemTotal >= 1000 ? 0 : 25
  const totalForOrder = itemTotal + 8 + 6 + gst + del

  return (
    <div style={{
      width: '100%', height: '100%',
      background: theme.bg, color: theme.ink,
      fontFamily: theme.font.body,
      position: 'relative',
    }}>
      <Routes>
        <Route path="/" element={
          <HomeScreen
            theme={theme}
            onPaste={startRecipe}
            onOpenChef={(id) => navigate(`/chef/${id}`)}
            onOpenRecipes={() => navigate('/recipes')}
          />
        } />

        <Route path="/cart" element={
          <CartScreen
            theme={theme}
            recipe={activeRecipe}
            chef={activeChef}
            ingredients={ingredients}
            servings={servings}
            setServings={setServings}
            baseServes={baseServes}
            subtotal={subtotal}
            delivery={delivery}
            animatedTotal={animatedTotal}
            onBack={goHome}
            saved={savedIds.has(activeRecipe.id)}
            onToggleSave={() => toggleSaved(activeRecipe.id)}
            onSwap={setShowSwapFor}
            onRemove={(id) => setIngState(p => ({ ...p, [id]: { ...p[id], removed: true } }))}
            onUnmatched={() => setShowUnmatched(true)}
            onExpandReel={() => setShowReelExpand(true)}
            onCheckout={onCheckout}
            pincode={pincode}
            address={address}
            onChangeAddress={() => setAddressSheet({ context: address ? 'edit' : 'first-run', nextOnSave: 'cart' })}
            building={cartBuilding}
            revealedCount={revealedCount}
          />
        } />

        <Route path="/checkout" element={
          <CheckoutScreen
            theme={theme}
            recipe={activeRecipe}
            chef={activeChef}
            ingredients={ingredients}
            servings={servings}
            baseServes={baseServes}
            subtotal={subtotal}
            pincode={pincode}
            address={address}
            onChangePincode={() => setAddressSheet({ context: address ? 'edit' : 'first-run', nextOnSave: 'checkout' })}
            onBack={() => navigate('/cart')}
            placing={placingOrder}
            onPlaceOrder={placeOrder}
          />
        } />

        <Route path="/placed" element={
          <OrderPlacedScreen
            theme={theme}
            recipe={activeRecipe}
            chef={activeChef}
            total={totalForOrder}
            orderId={orderId}
            pincode={pincode}
            tracking={trackingInfo}
            onBack={goHome}
            onMyRecipes={() => { toggleSaved(activeRecipe.id); navigate('/recipes') }}
          />
        } />

        <Route path="/recipes" element={
          <RecipesScreen
            theme={theme}
            saved={savedIds}
            onBack={goHome}
            onOpen={startRecipe}
          />
        } />

        <Route path="/chef/:chefId" element={
          <ChefRoute startRecipe={startRecipe} goHome={goHome} />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Overlays />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
