// Your 24 words, from No passkey found on Start: one box for the words, how to type them and how many
// there are ("19 of 24"), and Continue, off until all 24 are there. The words are checked before any
// passkey is made (flows/imported.ts), so words that can't be used say why in one line, red: a word
// wrong, words that aren't verified, or words that open a different Forest from the one this device
// lists. Never two seeds on one device: then Forget this device takes the place of Continue, and
// once it has forgotten, Continue is back. Then a new passkey is added to the seed the words spell
// as You adds one (flows/backups.ts), the seed held for it as after any unlock, and the person is
// in, as from Start. Unlike Passkeys', it excludes none of the passkeys this device knows: after Forget
// they may be another seed's, and a manager keeping one would refuse this one. The words live in
// this screen's state alone and are never kept; it has no path of its own, so a reload lands on
// Start and they never reach the page's history. Back goes to No passkey found.

import { WORD_COUNT } from '@foundationforest/keys'
import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { addBackup } from '../flows/backups.ts'
import { DifferentForest, seedOfWords, wordCount } from '../flows/imported.ts'
import { type Entered, enter } from '../flows/start.ts'
import { forgetDevice } from '../forget.ts'
import { drop as dropHeld, hold } from '../held.ts'
import { Loader } from '../mark.tsx'
import { NoAnswer, drop, make, withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Top, UnlockIcon, useAction } from '../ui.tsx'

type Props = { onEntered: (entered: Entered, passkey: string) => void; onBack: () => void }

export function ImportWords({ onEntered, onBack }: Props) {
  const [text, setText] = useState('')
  const [different, setDifferent] = useState(false)
  useEffect(dropHeld, [])
  const count = wordCount(text)

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
      await addBackup(config, seed, made, { here: true })
    } catch (err) {
      seed.fill(0)
      await drop(made.id)
      throw err
    }
    hold(made.id, seed)
    const id = made.id
    const to = await withSeed(id, (s) => enter(config, { id, seed: s }, proveInWorker))
    setText('')
    onEntered(to, id)
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
        rows={7}
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
      <p className="words-count">
        <span className="grow">In order, with spaces between them</span>
        <span>
          <b>{count}</b> of {WORD_COUNT}
        </span>
      </p>
      <div className="fill" />
      <Line note={create.note} />
      {different ? (
        <button className="danger" onClick={forgetFirst}>
          Forget this device
        </button>
      ) : (
        <button className="primary" disabled={create.busy || count !== WORD_COUNT} onClick={() => create.run()}>
          {create.busy ? <Loader /> : <><UnlockIcon always /> Continue</>}
        </button>
      )}
    </main>
  )
}
