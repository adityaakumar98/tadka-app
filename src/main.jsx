import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import WebFrame from './WebFrame.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WebFrame>
      <App />
    </WebFrame>
    <InstallPrompt />
  </StrictMode>,
)
