// Back from the 24 words: the vault read from the host, the board rebuilt from it, then the seed
// locked on this device. With no vault for these words, setup had stopped before its face check
// ended: the seed is locked with setup marked under way, and the person goes on to the check.

import { useRef, useState } from 'react'

import type { Nav } from '../App.tsx'
import { sendPulls, signPulls } from '../inbox.ts'
import { type LocalProfile, saveProfiles } from '../local.ts'
import { lockSeed } from '../seed/locked.ts'
import { seedFromWords } from '../seed/seed.ts'
import { settings } from '../settings.ts'
import { BackIcon, Spinner, useAction } from '../ui.tsx'
import { Username, WordsField } from './Setup.tsx'

function readWords(typed: string): Uint8Array {
  const count = typed.trim().split(/\s+/).filter(Boolean).length
  if (count !== 24) throw new Error(`That is ${count} words, not 24.`)
  try {
    return seedFromWords(typed)
  } catch {
    throw new Error('A word is wrong, or in the wrong place.')
  }
}

export function Restore({ nav, onLocked, onNoVault }: { nav: Nav; onLocked: () => void; onNoVault: (seed: Uint8Array, words: string) => void }) {
  const [typed, setTyped] = useState('')
  // Kept between taps when only the lock is left: a browser may ask for a fresh tap to make a passkey.
  const read = useRef<{ seed: Uint8Array; profiles: LocalProfile[] } | null>(null)

  const go = useAction(async () => {
    if (!read.current) {
      const seed = readWords(typed)
      const { restore } = await import('../flows/restore.ts')
      const profiles = await restore(seed, settings())
      if (!profiles) {
        await lockSeed(seed, { setup: true })
        return onNoVault(seed, typed.trim().toLowerCase().split(/\s+/).join(' '))
      }
      saveProfiles(profiles)
      read.current = { seed, profiles }
    }
    const { seed, profiles } = read.current
    const pulls = await signPulls(seed, profiles)
    await lockSeed(seed)
    seed.fill(0)
    read.current = null
    void sendPulls(pulls)
    onLocked()
  })

  return (
    <main>
      <div className="bar">
        <div>
          <button className="icon" aria-label="Back" onClick={nav.back}>
            <BackIcon />
          </button>
        </div>
      </div>
      <h1>Your 24 words</h1>
      <form
        className="grow"
        onSubmit={(e) => {
          e.preventDefault()
          void go.run()
        }}
      >
        <Username />
        <WordsField value={typed} onChange={setTyped} />
        <div className="fill" />
        {go.error && <p className="error">{go.error}</p>}
        <button className="primary" disabled={go.busy || !typed.trim()}>
          {go.busy ? <Spinner /> : 'Restore'}
        </button>
      </form>
    </main>
  )
}
