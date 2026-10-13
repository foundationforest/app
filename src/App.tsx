// The app's screens and the way between them, in the browser's history so its back button works. A
// device that holds a locked seed opens on the board; one whose setup stopped before its vault was
// written opens on setup's face check, which takes it up again. A seed not yet locked (setup's
// first two steps, or a restore that still needs its face check) is the draft: kept here while its
// screens are open, zeroed once they are left. The message door, /message?to=<address>, the link
// an index gives for a profile, opens a new message to it; a person with no seed or no profile yet
// goes through setup or a new profile first, and comes back to it.

import { useEffect, useRef, useState } from 'react'

import { localProfiles } from './local.ts'
import { Back } from './screens/Back.tsx'
import { Board } from './screens/Board.tsx'
import { CardPage } from './screens/CardPage.tsx'
import { InboxPage } from './screens/Inbox.tsx'
import { NewProfile } from './screens/NewProfile.tsx'
import { Restore } from './screens/Restore.tsx'
import { Setup } from './screens/Setup.tsx'
import { Start } from './screens/Start.tsx'
import { hasSeed, hasSetup } from './seed/locked.ts'
import { makeSeed } from './seed/seed.ts'

export type Screen =
  | { name: 'start' }
  | { name: 'setup'; step: 1 | 2 | 3 }
  | { name: 'restore' }
  | { name: 'board' }
  | { name: 'new' }
  | { name: 'card'; address: string }
  | { name: 'inbox'; address: string; with?: string }
  | { name: 'message'; to: string }

export type Nav = { go: (to: Screen) => void; back: () => void; reset: (to: Screen) => void }

export type Draft = { seed: Uint8Array; words: string }

/** Where the seed stands on this device: none, locked with setup still under way, or locked. */
type Lock = 'none' | 'setup' | 'locked'

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
  const lock = useRef<Lock>('none')
  const draft = useRef<Draft | null>(null)

  /** What the history asks for, unless it is no longer there to show. */
  const show = (to: Screen) => {
    const unlocked = to.name === 'setup' || to.name === 'restore'
    if (!unlocked && draft.current) {
      draft.current.seed.fill(0)
      draft.current = null
    }
    if (lock.current === 'setup' && !(to.name === 'setup' && to.step === 3)) return reset({ name: 'setup', step: 3 })
    if (lock.current === 'locked' && (unlocked || to.name === 'start')) return home()
    if (lock.current === 'none' && !unlocked && to.name !== 'start') return reset({ name: 'start' })
    if (lock.current === 'none' && to.name === 'setup' && !draft.current) return reset({ name: 'start' })
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
    Promise.all([hasSeed(), hasSetup()]).then(
      ([seeded, setup]) => {
        lock.current = !seeded ? 'none' : setup ? 'setup' : 'locked'
        if (lock.current === 'locked') home()
        else reset(lock.current === 'setup' ? { name: 'setup', step: 3 } : { name: 'start' })
      },
      () => reset({ name: 'start' }),
    )
    return () => removeEventListener('popstate', pop)
  }, [])

  /** The seed is locked and setup is under way: only its face check is left. */
  const setupLocked = () => {
    lock.current = 'setup'
    reset({ name: 'setup', step: 3 })
  }
  const locked = () => {
    lock.current = 'locked'
    home()
  }
  const forgotten = () => {
    lock.current = 'none'
    door.clear()
    reset({ name: 'start' })
  }

  switch (screen?.name) {
    case undefined:
      return null
    case 'start':
      return (
        <Start
          onStart={() => {
            draft.current = makeSeed()
            nav.go({ name: 'setup', step: 1 })
          }}
          onRestore={() => nav.go({ name: 'restore' })}
        />
      )
    case 'setup':
      return <Setup step={screen.step} draft={draft.current} nav={nav} onSetupLocked={setupLocked} onLocked={locked} />
    case 'restore':
      return (
        <Restore
          nav={nav}
          onLocked={locked}
          onNoVault={(seed, words) => {
            draft.current = { seed, words }
            setupLocked()
          }}
        />
      )
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
