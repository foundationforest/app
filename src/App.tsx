// The screens, and the way between them. Start, until a person is verified here; then Profiles and
// Settings, and from Profiles a new profile or a card. Each screen the person can come back to has
// its own path, so a reload opens on it and the phone's back goes back; a card's address is kept in
// the page's history, never in its path, which a host's logs would keep.

import { useEffect, useState } from 'react'

import { passkey as inUse } from './device.ts'
import type { Entered } from './flows/start.ts'
import type { Step } from './flows/verify.ts'
import type { Passkey } from './passkey.ts'
import { Back } from './screens/Back.tsx'
import { Card } from './screens/Card.tsx'
import { NewProfile } from './screens/NewProfile.tsx'
import { Profiles } from './screens/Profiles.tsx'
import { Settings } from './screens/Settings.tsx'
import { Start } from './screens/Start.tsx'
import { Verify } from './screens/Verify.tsx'
import type { Place } from './ui.tsx'

type Screen =
  | { at: 'start' }
  | { at: 'verify'; passkey: Passkey | null; id: string; step: Step }
  | { at: 'profiles' }
  | { at: 'new' }
  | { at: 'card'; address: string }
  | { at: 'settings' }
  | { at: 'back' }

/** The screen the page's path and history name; Start until someone is verified here. */
function here(): Screen {
  const path = location.pathname
  if (path === '/back') return { at: 'back' }
  if (!inUse()) return { at: 'start' }
  if (path === '/new') return { at: 'new' }
  if (path === '/settings') return { at: 'settings' }
  const address = (history.state as { address?: unknown } | null)?.address
  if (path === '/profile' && typeof address === 'string') return { at: 'card', address }
  return { at: 'profiles' }
}

const PATHS: Partial<Record<Screen['at'], string>> = { new: '/new', card: '/profile', settings: '/settings' }

export function App() {
  const [screen, setScreen] = useState<Screen>(here)
  useEffect(() => {
    const popped = () => setScreen(here())
    addEventListener('popstate', popped)
    return () => removeEventListener('popstate', popped)
  }, [])
  // A path this screen does not have (Start's, or one from before Forget) is put right.
  useEffect(() => {
    const path = PATHS[screen.at] ?? (screen.at === 'back' ? '/back' : '/')
    if (location.pathname !== path) history.replaceState(null, '', path)
  }, [screen.at])

  /** To `to`, its path pushed so back comes back here, or put in place of this one's, which back then leaves as it would have. */
  const go = (to: Screen, push = false) => {
    const path = PATHS[to.at] ?? '/'
    const pushed = push || (history.state as { pushed?: boolean } | null)?.pushed === true
    const state = to.at === 'card' ? { address: to.address, pushed } : { pushed }
    if (push) history.pushState(state, '', path)
    else history.replaceState(state, '', path)
    setScreen(to)
  }
  const back = () => ((history.state as { pushed?: boolean } | null)?.pushed ? history.back() : go({ at: 'profiles' }))
  const place = (to: Place) => go({ at: to })

  switch (screen.at) {
    case 'back':
      return <Back />
    case 'start':
      return <Start onEntered={(e: Entered, p: Passkey) => go(e.to === 'verify' ? { at: 'verify', passkey: p, id: p.id, step: e.step } : { at: 'profiles' })} />
    case 'verify':
      return <Verify passkey={screen.passkey} id={screen.id} step={screen.step} onVerified={() => go({ at: 'profiles' })} />
    case 'profiles':
      return <Profiles onOpen={(address) => go({ at: 'card', address }, true)} onNew={() => go({ at: 'new' }, true)} go={place} />
    case 'new':
      return <NewProfile onMade={(address) => go({ at: 'card', address })} onBack={back} />
    case 'card':
      return <Card address={screen.address} onBack={back} />
    case 'settings':
      return <Settings go={place} onForgot={() => go({ at: 'start' })} />
  }
}
