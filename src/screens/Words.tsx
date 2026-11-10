// Your 24 words, from Passkeys' sheet once the passkey gave them: the seed as 24 words, numbered,
// in a grid of three columns of small cards (keys/README.md, The seed: `exportWords`); one line
// under them on where never to type them; and Done. They come in the page's memory, never its
// history, and show only while this screen is open: back or Done, and they are gone (App.tsx).

import { Top } from '../ui.tsx'

/** The line under the words. */
export const NEVER = "Never type them into a site or app you don't trust."

export function Words({ words, onDone }: { words: string[]; onDone: () => void }) {
  return (
    <main>
      <Top onBack={onDone} clear>
        <h1>Your 24 words</h1>
      </Top>
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
    </main>
  )
}
