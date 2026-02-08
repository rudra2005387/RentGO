import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/consistency.css' // UI/UX Consistency Layer
import './styles/airbnb-design-system.css' // Airbnb Design System tokens and components
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './utils/webVitals' // Initialize Web Vitals monitoring

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>
)
