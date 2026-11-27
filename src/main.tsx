import '@fontsource-variable/figtree'
import './theme.css'

import { createRoot } from 'react-dom/client'

import './unlocked.ts'

import { App } from './App.tsx'
import { cleanOld, passkey, profiles, saveProfiles, testSeed, theme } from './device.ts'
import { forgetDevice } from './forget.ts'
import { hold } from './held.ts'
import { listed } from './markets.ts'
import { isTestId } from './test-seed.ts'
import { applyTheme } from './theme.ts'

cleanOld()
// A test seed in use: held again in the tab that kept its seed; in any other, it isn't in here.
const id = passkey()
if (id && isTestId(id)) {
  const seed = testSeed(id)
  if (seed) hold(id, seed)
  else forgetDevice()
}
// A profile in a market the directory no longer lists is forgotten here, and shown nowhere.
if (!profiles().every((p) => listed(p.label))) saveProfiles(profiles().filter((p) => listed(p.label)))
applyTheme(theme())

// No StrictMode: it runs each effect twice in development, and the verification's screen lets its
// seed go when it leaves.
createRoot(document.getElementById('root')!).render(<App />)
