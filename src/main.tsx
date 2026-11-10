import '@fontsource-variable/figtree'
// Bricolage with its optical-size axis, so a title is drawn with the cut made for its size.
import '@fontsource-variable/bricolage-grotesque/opsz.css'
import './theme.css'

import { createRoot } from 'react-dom/client'

import { App } from './App.tsx'
import { cleanOld, theme } from './device.ts'
import { applyTheme } from './theme.ts'

cleanOld()
applyTheme(theme())

// No StrictMode: it runs each effect twice in development, and the verification's screen lets its
// seed go when it leaves.
createRoot(document.getElementById('root')!).render(<App />)
