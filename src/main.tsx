import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply persisted theme before first render to avoid flash
try {
  const stored = localStorage.getItem("structcore-app");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed?.state?.theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }
} catch { /* ignore parse errors */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
