import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import './index.css'


const root = document.getElementById('root')

// StrictMode helps surface potential React problems during development.
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)