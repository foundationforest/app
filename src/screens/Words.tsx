// Your 24 words, from Passkeys, a page of its own: its red warning square, the warning, and Show
// words, which always asks the passkey, even with the seed held, so a device someone else picks up
// while it is held never shows them. A passkey prompt must come from a tap, so it is asked on that
// button. Then, on the same page, the seed as 24 words, numbered, in a grid of three columns of small
// cards (keys/README.md, The seed: `exportWords`); one line under them on where never to type them;
// and Done. The words live in this page's memory alone, never its history, and show only while it
// is open: back or Done, and they are gone; a reload opens the warning again.

import { useState } from 'react'

import { exportWords } from '@foundationforest/keys'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { seedFor } from '../flows/seed.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { ask } from '../passkey.ts'
import { Line, Top, UnlockIcon, useAction } from '../ui.tsx'

/** The warning before the words. */
export const WARNING = 'Anyone who sees them can act as you. Write them on paper and keep it somewhere safe.'

/** The line under the words. */
export const NEVER = "Never type them into a site or app you don't trust."

export function Words({ onDone }: { onDone: () => void }) {
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
      <Top onBack={onDone} clear>
        <h1>Your 24 words</h1>
      </Top>
      {words ? (
        <>
          <ol className="words" aria-label="Your 24 words">
            {words.map((w, i) => (
              <li key={i}>
                <span className="xs">{i + 1}</span>
                {w}
              </li>
            ))}
          </ol>
          <p className="s">{NEVER}</p>
          <div className="foot">
            <button className="primary" onClick={onDone}>
              Done
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="sq red">
            <Icon name="warning" fill />
          </span>
          <p className="lead">{WARNING}</p>
          <div className="fill" />
          <div className="foot">
            <Line note={show.note} />
            <button className="primary" disabled={show.busy} onClick={() => show.run()}>
              {show.busy ? <Loader /> : <><UnlockIcon always /> Show words</>}
            </button>
          </div>
        </>
      )}
    </main>
  )
}
