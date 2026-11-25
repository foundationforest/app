// Connect your AI: a back arrow (in setup it goes on to Home: a profile made can't be undone; from
// Your AI, back to it), and its title. In the middle, "Ask your AI to", small and grey, and under it
// one green line at a time, big and bold, rolling up every couple of seconds through what an AI can
// then do, each line fully in view; with reduced motion, the first alone. At the foot: Add to ChatGPT
// and Add to Claude, side by side, both strong green, each opening that app's own page for adding
// Forest (config.ts, `addPages`), in a new tab, or, while config names none for it, Add manually;
// Add manually under them, outlined, the whole width; then, small and grey, "Forest can't see your
// chats or memory."
//
// Add manually is a sheet, "Add Forest to any AI", four numbered steps, the connector's address in a
// grey pill with a round copy button, which says Copied a moment. Accepting is the connect page
// (Connect.tsx): Forest opens there, the person unlocks and picks the profiles it can use.

import { useEffect, useState } from 'react'

import { AI_APPS, type AiApp, config } from '../config.ts'
import { Icon } from '../icons.tsx'
import { Sheet } from '../sheet.tsx'
import { Line, Top, useAction } from '../ui.tsx'

/** What the middle rolls through, one at a time. */
export const ASKS = ['find a tennis coach', 'sell my old bike', 'post me as a math tutor', 'find a plumber', 'find a city tour', 'hire a web developer']

/** How long each line stays. */
const ROLL_MS = 2200

type Props = { onBack: () => void }

/** The lines, one at a time, rolling up; with reduced motion, the first alone. */
function Asks() {
  const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [at, setAt] = useState(0)
  useEffect(() => {
    if (still) return
    const t = setInterval(() => setAt((n) => (n + 1) % ASKS.length), ROLL_MS)
    return () => clearInterval(t)
  }, [still])
  return (
    <div className="asks">
      <p className="xs">Ask your AI to</p>
      <p className="ask-line" aria-live="off">
        <span key={at} className={still ? undefined : 'rolled'}>
          {ASKS[at]}
        </span>
      </p>
    </div>
  )
}

export function ConnectAi({ onBack }: Props) {
  const [manual, setManual] = useState(false)
  const add = (app: AiApp) => {
    const page = config.addPages[app]
    if (page) open(page, '_blank', 'noopener,noreferrer')
    else setManual(true)
  }
  return (
    <main className="connect-ai">
      <Top onBack={onBack} />
      <h1>Connect your AI</h1>
      <div className="fill" />
      <Asks />
      <div className="fill" />
      <div className="foot">
        <div className="pair">
          {AI_APPS.map((app) => (
            <button key={app} className="primary" onClick={() => add(app)}>
              Add to {app}
            </button>
          ))}
        </div>
        <button onClick={() => setManual(true)}>Add manually</button>
        <p className="xs center">Forest can't see your chats or memory.</p>
      </div>
      {manual && <AddManually onClose={() => setManual(false)} />}
    </main>
  )
}

/** Add manually: the four steps, and the connector's address to copy. */
export function AddManually({ onClose }: { onClose: () => void }) {
  const [flash, setFlash] = useState(false)
  const copy = useAction(async () => {
    await navigator.clipboard.writeText(config.connector)
    setFlash(true)
    setTimeout(() => setFlash(false), 2000)
  })
  return (
    <Sheet label="Add Forest to any AI" onClose={onClose}>
      <h2>Add Forest to any AI</h2>
      <ol className="steps">
        <li>
          <span className="bul" aria-hidden>
            1
          </span>
          <span className="grow">
            In your AI's settings, open <strong>Connectors</strong> or <strong>Plugins</strong> and add a custom one.
          </span>
        </li>
        <li>
          <span className="bul" aria-hidden>
            2
          </span>
          <span className="grow">
            Name it <strong>Forest</strong>. As its server URL, paste:
            <span className="copy-field">
              <span className="address">{config.connector}</span>
              <button type="button" className="round clear" aria-label={flash ? 'Copied' : 'Copy'} onClick={() => copy.run()}>
                <Icon name={flash ? 'check' : 'copy'} />
              </button>
            </span>
          </span>
        </li>
        <li>
          <span className="bul" aria-hidden>
            3
          </span>
          <span className="grow">If it asks how to sign in, choose to sign in.</span>
        </li>
        <li>
          <span className="bul" aria-hidden>
            4
          </span>
          <span className="grow">When Forest opens, pick your profiles and accept.</span>
        </li>
      </ol>
      <Line note={copy.note} />
    </Sheet>
  )
}
