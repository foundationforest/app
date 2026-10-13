// The app's screens and the way between them, in the browser's history so its back button works. A
// device set up (it keeps the seed's fingerprint) opens on the board; one whose setup stopped before
// its vault was written opens on setup's face check, which takes it up again. The passkey that gave
// the seed, at setup's first step or at a sign in that found no vault, is the draft: kept here for
// the face check while setup's screens are open, its seed zeroed once they are left. The message door, /message?to=<address>, the link an index gives
// for a profile, opens a new message to it; a person not set up yet, or with no profile yet, goes
// through setup or a new profile first, and comes back to it.

import { useEffect, useRef, useState } from 'react'

import { fingerprint, forgetFingerprint, localProfiles } from './local.ts'
import { Back } from './screens/Back.tsx'
import { Board } from './screens/Board.tsx'
import { CardPage } from './screens/CardPage.tsx'
import { InboxPage } from './screens/Inbox.tsx'
import { NewProfile } from './screens/NewProfile.tsx'
import { Setup } from './screens/Setup.tsx'
import { Start } from './screens/Start.tsx'
import type { Passkey } from './seed/passkey.ts'
import { endSetup, hasSetup } from './seed/seed.ts'

export type Screen =
  | { name: 'start' }
  | { name: 'setup'; step: 1 | 2 }
  | { name: 'board' }
  | { name: 'new' }
  | { name: 'card'; address: string }
  | { name: 'inbox'; address: string; with?: string }
  | { name: 'message'; to: string }

export type Nav = { go: (to: Screen) => void; back: () => void; reset: (to: Screen) => void }

/** Where this device stands: not set up, setup under way (the passkey made, no vault yet), or set up. */
type Stage = 'none' | 'setup' | 'in'

/** The address the message door was opened for, kept for this tab until a message to it can be written. */
const DOOR = 'forest.door'
const door = {
  get: () => sessionStorage.getItem(DOOR),
  set: (to: string) => sessionStorage.setItem(DOOR, to),
  clear: () => sessionStorage.removeItem(DOOR),
}

export function App() {
  // Where Didit sends the person back after the face check, in a tab of its own.
  return location.pathname === '/back' ? <Back /> : <Screens />
}

function Screens() {
  const [screen, setScreen] = useState<Screen | null>(null)
  const stage = useRef<Stage>('none')
  const draft = useRef<Passkey | null>(null)
  /** What Start says when a step sent the person back to it. */
  const [said, setSaid] = useState<string>()

  /** What the history asks for, unless it is no longer there to show. */
  const show = (to: Screen) => {
    if (to.name !== 'setup' && draft.current) {
      draft.current.seed.fill(0)
      draft.current = null
    }
    if (stage.current === 'setup' && !(to.name === 'setup' && to.step === 2)) return reset({ name: 'setup', step: 2 })
    if (stage.current === 'in' && (to.name === 'setup' || to.name === 'start')) return home()
    if (stage.current === 'none' && to.name !== 'start' && !(to.name === 'setup' && to.step === 1)) return reset({ name: 'start' })
    setScreen(to)
  }
  const reset = (to: Screen) => {
    history.replaceState(to, '')
    show(to)
  }
  /** The board; or, when the door was opened, a new profile if there is none, then the message. */
  const home = () => {
    const to = door.get()
    if (!to) return reset({ name: 'board' })
    if (!localProfiles().length) return reset({ name: 'new' })
    door.clear()
    reset({ name: 'message', to })
  }
  const nav: Nav = {
    go: (to) => {
      history.pushState(to, '')
      show(to)
    },
    back: () => history.back(),
    reset,
  }

  useEffect(() => {
    const pop = (e: PopStateEvent) => show((e.state as Screen | null) ?? { name: 'start' })
    addEventListener('popstate', pop)
    const to = location.pathname === '/message' ? new URLSearchParams(location.search).get('to') : null
    if (to) door.set(to)
    if (location.pathname !== '/') history.replaceState(null, '', '/')
    stage.current = !fingerprint() ? 'none' : hasSetup() ? 'setup' : 'in'
    if (stage.current === 'in') home()
    else reset(stage.current === 'setup' ? { name: 'setup', step: 2 } : { name: 'start' })
    return () => removeEventListener('popstate', pop)
  }, [])

  /** Setup is under way with this passkey: only its face check is left, with the seed it gave. */
  const opened = (passkey: Passkey) => {
    stage.current = 'setup'
    draft.current = passkey
    reset({ name: 'setup', step: 2 })
  }
  /** Setup given up (or never begun): back to Start, which says why. */
  const stopped = (why: string) => {
    if (stage.current === 'setup') {
      endSetup()
      forgetFingerprint()
    }
    stage.current = 'none'
    setSaid(why)
    reset({ name: 'start' })
  }
  const signedIn = () => {
    stage.current = 'in'
    setSaid(undefined)
    home()
  }
  const forgotten = () => {
    stage.current = 'none'
    door.clear()
    reset({ name: 'start' })
  }

  switch (screen?.name) {
    case undefined:
      return null
    case 'start':
      return <Start key={said} said={said} onStart={() => nav.go({ name: 'setup', step: 1 })} onSignedIn={signedIn} onNoSetup={opened} />
    case 'setup':
      return <Setup step={screen.step} draft={draft.current} onOpened={opened} onStopped={stopped} onDone={signedIn} />
    case 'board':
    case 'message':
      return <Board nav={nav} onForget={forgotten} compose={screen.name === 'message' ? screen.to : undefined} />
    case 'new':
      return <NewProfile nav={nav} onMade={() => (door.get() ? home() : nav.back())} />
    case 'card':
      return <CardPage address={screen.address} nav={nav} />
    case 'inbox':
      return <InboxPage address={screen.address} thread={screen.with} nav={nav} />
  }
}
