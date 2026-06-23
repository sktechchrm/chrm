import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./assets/fonts/bengaliFont.css"; 
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
