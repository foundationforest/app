import '@fontsource-variable/manrope'
import './theme.css'

import { createRoot } from 'react-dom/client'

import { App } from './App.tsx'
import { cleanOld, cleanOldCaches, theme } from './device.ts'
import { applyTheme } from './theme.ts'

cleanOld()
applyTheme(theme())
void cleanOldCaches()

// No StrictMode: it runs each effect twice in development, and the verification's screen lets its
// seed go when it leaves.
createRoot(document.getElementById('root')!).render(<App />)
