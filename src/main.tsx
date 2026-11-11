import '@fontsource-variable/figtree'
import './theme.css'

import { createRoot } from 'react-dom/client'

import { App } from './App.tsx'
import { cleanOld, profiles, saveProfiles, theme } from './device.ts'
import { listed } from './markets.ts'
import { applyTheme } from './theme.ts'

cleanOld()
// A profile in a market the directory no longer lists is forgotten here, and shown nowhere.
if (!profiles().every((p) => listed(p.label))) saveProfiles(profiles().filter((p) => listed(p.label)))
applyTheme(theme())

// No StrictMode: it runs each effect twice in development, and the verification's screen lets its
// seed go when it leaves.
createRoot(document.getElementById('root')!).render(<App />)
