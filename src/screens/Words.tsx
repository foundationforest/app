// Your 24 recovery words, a page of its own, from Passkeys and from Add a backup: its title, one line,
// "Write them on paper, in order. Anyone with them can open your Forest.", then the words. They show
// after a fresh unlock, even with the seed held, so a device someone else picks up while it is held
// never shows them: Show my words asks the passkey, on this page from Passkeys, or on Add a backup's
// own button, which hands the words here (`giveWords`). A passkey prompt must come from a tap, so it
// is asked on a button. The seed as 24 words (keys/README.md, The seed: `exportWords`), in three
// numbered columns; at the foot, I wrote them down, strong green, which goes on in setup and back from
// Passkeys. The words live in this page's memory alone, never its history, and show only while it is
// open: back, and they are gone; a reload asks again.

import { useState } from 'react'

import { exportWords } from '@foundationforest/keys'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { seedFor } from '../flows/seed.ts'
import { Loader } from '../mark.tsx'
import { ask, withSeed } from '../passkey.ts'
import { isTestId } from '../test-account.ts'
import { Line, Top, UnlockIcon, useAction } from '../ui.tsx'

/** The one line on the page. */
export const WRITE_THEM = 'Write them on paper, in order. Anyone with them can open your Forest.'

/** The words handed from Add a backup to this page, in the page's memory alone, taken once. */
let handed: string[] | null = null
export const giveWords = (words: string[]) => void (handed = words)
const takeWords = () => {
  const words = handed
  handed = null
  return words
}

/** The seed's 24 words, after a fresh unlock of the passkey in use, the seed dropped at once; a test account's, which has no passkey, from the seed held. */
export async function askWords(): Promise<string[]> {
  const id = passkey()!
  if (isTestId(id)) return withSeed(id, async (held) => exportWords(held).split(' '))
  const seed = await seedFor(config.host, (await ask({ allow: [id] })).seed)
  try {
    return exportWords(seed).split(' ')
  } finally {
    seed.fill(0)
  }
}

type Props = { setup?: boolean; onDone: () => void; onBack: () => void }

export function Words({ onDone, onBack }: Props) {
  const [words, setWords] = useState<string[] | null>(takeWords)
  const show = useAction(async () => setWords(await askWords()))
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Your 24 recovery words</h1>
      </Top>
      <p className="lead">{WRITE_THEM}</p>
      {words && (
        <ol className="words" aria-label="Your 24 recovery words">
          {words.map((w, i) => (
            <li key={i}>
              <span className="xs">{i + 1}</span>
              {w}
            </li>
          ))}
        </ol>
      )}
      <div className="fill" />
      <div className="foot">
        <Line note={show.note} />
        {words ? (
          <button className="primary" onClick={onDone}>
            I wrote them down
          </button>
        ) : (
          <button className="primary" disabled={show.busy} onClick={() => show.run()}>
            {show.busy ? <Loader /> : <><UnlockIcon always /> Show my words</>}
          </button>
        )}
      </div>
    </main>
  )
}
