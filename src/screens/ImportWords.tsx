// I have 24 words, from Start: one box for the words, and Create a passkey. The words are checked
// before any passkey is made (flows/imported.ts), so one that can't be used says why in one line:
// quiet while some are missing, red when one is wrong, when they aren't verified, or when they open
// a different Forest from the one this device lists. Never two seeds on one device: then Forget this
// device takes the place of Create a passkey, and once it has forgotten, Create a passkey is back.
// Then a new passkey is added to the seed the words spell as Settings adds one (flows/backups.ts),
// the seed held for it as after any unlock, and the person is in, as from Start. Unlike Settings', it
// excludes none of the passkeys this device knows: after Forget they may be another seed's, and a
// manager keeping one would refuse this one. The words live in this screen's state alone and are never kept; it has no
// path of its own, so a reload lands on Start and they never reach the page's history. Back goes to
// Start.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { addBackup } from '../flows/backups.ts'
import { DifferentForest, seedOfWords } from '../flows/imported.ts'
import { type Entered, enter } from '../flows/start.ts'
import { forgetDevice } from '../forget.ts'
import { drop as dropHeld, hold } from '../held.ts'
import { NoAnswer, drop, make, withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'
import type { How } from './Start.tsx'

type Props = { onEntered: (entered: Entered, passkey: string, how: How) => void; onBack: () => void }

export function ImportWords({ onEntered, onBack }: Props) {
  const [text, setText] = useState('')
  const [different, setDifferent] = useState(false)
  useEffect(dropHeld, [])

  const create = useAction(async () => {
    const seed = await seedOfWords(config.host, text).catch((err: unknown) => {
      if (err instanceof DifferentForest) setDifferent(true)
      throw err
    })
    let made
    try {
      made = await make()
    } catch (err) {
      seed.fill(0)
      if (err instanceof NoAnswer) return
      throw err
    }
    try {
      await addBackup(config, seed, made)
    } catch (err) {
      seed.fill(0)
      await drop(made.id)
      throw err
    }
    hold(made.id, seed)
    const id = made.id
    const to = await withSeed(id, (s) => enter(config, { id, seed: s }, proveInWorker))
    setText('')
    onEntered(to, id, {})
  })

  const forgetFirst = () => {
    forgetDevice()
    setDifferent(false)
    create.setNote(null)
  }

  return (
    <main>
      <Top onBack={onBack}>
        <h1>Your 24 words</h1>
      </Top>
      <textarea
        aria-label="Your 24 words"
        rows={5}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          if (different) setDifferent(false)
          if (create.note) create.setNote(null)
        }}
      />
      <div className="fill" />
      <Line note={create.note} />
      {different ? (
        <button className="danger" onClick={forgetFirst}>
          Forget this device
        </button>
      ) : (
        <button className="primary" disabled={create.busy} onClick={() => create.run()}>
          {create.busy ? <Spinner /> : <><UnlockIcon always /> Create a passkey</>}
        </button>
      )}
    </main>
  )
}
