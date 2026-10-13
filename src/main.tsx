// Manrope (SIL Open Font License 1.1), carried in the app's own files: no font server sees who opens it.
import '@fontsource-variable/manrope'
import './theme.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App.tsx'
import { applyAppearance } from './appearance.ts'
import { appearance } from './local.ts'
import { reloadOnce } from './version.ts'

applyAppearance(appearance())
// A module this version loads when first needed could not be loaded: a new version took its place (version.ts).
addEventListener('vite:preloadError', () => void reloadOnce())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
