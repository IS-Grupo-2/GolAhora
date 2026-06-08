import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { patchLucideForReact } from './utils/lucideReactSafe'
import './styles/base/global.css'

patchLucideForReact()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
