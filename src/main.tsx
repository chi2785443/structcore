import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Resolve theme BEFORE React renders (prevents flash).
// Default is light; only go dark if the user explicitly saved "dark".
(function applyTheme() {
  try {
    const raw = localStorage.getItem("structcore-v2");
    const isDark = raw ? JSON.parse(raw)?.state?.theme === "dark" : false;
    document.documentElement.classList.toggle("dark", isDark);
  } catch {
    document.documentElement.classList.remove("dark");
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
