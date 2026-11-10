// Your 24 words, from Show my 24 words in You: one plain warning, and Show, which always asks the
// passkey, even with the seed held, so a device someone else picks up while it is held never shows
// them. Then the seed as 24 words, numbered (keys/README.md, The seed: `exportWords`), shown only
// while this screen is open: they live in its state alone, nothing stores them, and the seed they
// came from is zeroed at once and never held.

import { useState } from 'react'

import { exportWords } from '@foundationforest/keys'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { seedFor } from '../flows/seed.ts'
import { Loader } from '../mark.tsx'
import { ask } from '../passkey.ts'
import { Line, Top, UnlockIcon, useAction } from '../ui.tsx'

/** What Your 24 words warns, before and while they show. */
export const WARNING = 'Anyone with these words can act as you. Never type them anywhere but an app you trust.'

export function Words({ onBack }: { onBack: () => void }) {
  const [words, setWords] = useState<string[] | null>(null)
  const show = useAction(async () => {
    const seed = await seedFor(config.host, (await ask({ allow: [passkey()!] })).seed)
    try {
      setWords(exportWords(seed).split(' '))
    } finally {
      seed.fill(0)
    }
  })
  return (
    <main>
      <Top onBack={onBack}>
        <h1>Your 24 words</h1>
      </Top>
      <p>{WARNING}</p>
      {words ? (
        <ol className="words" aria-label="Your 24 words">
          {words.map((w, i) => (
            <li key={i}>
              <span className="quiet-text">{i + 1}</span> {w}
            </li>
          ))}
        </ol>
      ) : (
        <>
          <div className="fill" />
          <Line note={show.note} />
          <button className="primary" disabled={show.busy} onClick={() => show.run()}>
            {show.busy ? <Loader /> : <><UnlockIcon always /> Show</>}
          </button>
        </>
      )}
    </main>
  )
}
