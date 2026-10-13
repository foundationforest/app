// The app's screens and the way between them, in the browser's history so its back button works. A
// device that holds a locked seed opens on the board. A seed not yet locked (setup, or a restore
// that still needs its face check) is the draft: kept here while its screens are open, zeroed once
// they are left.

import { useEffect, useRef, useState } from 'react'

import { Back } from './screens/Back.tsx'
import { Board } from './screens/Board.tsx'
import { CardPage } from './screens/CardPage.tsx'
import { NewProfile } from './screens/NewProfile.tsx'
import { Restore } from './screens/Restore.tsx'
import { Setup } from './screens/Setup.tsx'
import { Start } from './screens/Start.tsx'
import { hasSeed } from './seed/locked.ts'
import { makeSeed } from './seed/seed.ts'

export type Screen =
  | { name: 'start' }
  | { name: 'setup'; step: 1 | 2 | 3 }
  | { name: 'restore' }
  | { name: 'board' }
  | { name: 'new' }
  | { name: 'card'; address: string }

export type Nav = { go: (to: Screen) => void; back: () => void; reset: (to: Screen) => void }

export type Draft = { seed: Uint8Array; words: string }

export function App() {
  // Where Didit sends the person back after the face check, in a tab of its own.
  return location.pathname === '/back' ? <Back /> : <Screens />
}

function Screens() {
  const [screen, setScreen] = useState<Screen | null>(null)
  const seeded = useRef(false)
  const draft = useRef<Draft | null>(null)

  /** What the history asks for, unless it is no longer there to show. */
  const show = (to: Screen) => {
    const unlocked = to.name === 'setup' || to.name === 'restore'
    if (!unlocked && draft.current) {
      draft.current.seed.fill(0)
      draft.current = null
    }
    if (seeded.current && (unlocked || to.name === 'start')) return reset({ name: 'board' })
    if (!seeded.current && (to.name === 'board' || to.name === 'new' || to.name === 'card')) return reset({ name: 'start' })
    if (to.name === 'setup' && !draft.current) return reset({ name: 'start' })
    setScreen(to)
  }
  const reset = (to: Screen) => {
    history.replaceState(to, '')
    show(to)
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
    hasSeed().then(
      (has) => {
        seeded.current = has
        reset(has ? { name: 'board' } : { name: 'start' })
      },
      () => reset({ name: 'start' }),
    )
    return () => removeEventListener('popstate', pop)
  }, [])

  const locked = () => {
    seeded.current = true
    reset({ name: 'board' })
  }
  const forgotten = () => {
    seeded.current = false
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
      return <Setup step={screen.step} draft={draft.current!} nav={nav} onLocked={locked} />
    case 'restore':
      return (
        <Restore
          nav={nav}
          onLocked={locked}
          onNoVault={(seed, words) => {
            draft.current = { seed, words }
            nav.go({ name: 'setup', step: 3 })
          }}
        />
      )
    case 'board':
      return <Board nav={nav} onForget={forgotten} />
    case 'new':
      return <NewProfile nav={nav} />
    case 'card':
      return <CardPage address={screen.address} nav={nav} />
  }
}
