// Connect your AI: its sparkle on a neutral square, what an AI app then does for the person, three
// choices, Claude, ChatGPT and Other, the one picked on the soft green, Claude when the screen
// opens, and one card with three steps for it:
// - an AI app whose plugin directory lists Forest (config.ts, `listedIn`): open Plugins in it (in
//   Claude, under it, Customize, then Plugins: Claude's own path, so no other app's step says it),
//   search Forest and add it, connect it and accept in Forest; under the card, "Forest not there?
//   Add it by its address", which picks Other;
// - any other, Other too: copy Forest's address (this app's connector, in full, as an AI app's
//   connector field takes it), add it in that app, or in your AI, and the same accept step; at the
//   foot, Copy address, strong green, which copies it and says so a moment, the steps staying in view
//   while the person does them.
// Accepting is the connect page (Connect.tsx): Forest opens there, the person unlocks and picks the
// profiles it can use. No links to other sites. A back at the top, always: from Your AI, back to it;
// right after the first profile (or its Later), on to Home, since a profile made can't be undone.

import { type ReactNode, useState } from 'react'

import { AI_APPS, type AiApp, config } from '../config.ts'
import { Icon } from '../icons.tsx'
import { Line, Top, useAction } from '../ui.tsx'

type Choice = AiApp | 'Other'

const CHOICES: Choice[] = [...AI_APPS, 'Other']

type Props = { onBack: () => void }

/** One step of the card: its number, its words, and a small line or more under them. */
function Step({ n, words, small, children }: { n: number; words: string; small?: string; children?: ReactNode }) {
  return (
    <li>
      <span className="bul" aria-hidden>
        {n}
      </span>
      <div className="grow">
        <span className="t">{words}</span>
        {small && <span className="s">{small}</span>}
        {children}
      </div>
    </li>
  )
}

const ACCEPT = { words: 'Connect it, then accept in Forest', small: 'Forest opens here: unlock, and pick the profiles it can use.' }

export function ConnectAi({ onBack }: Props) {
  const [app, setApp] = useState<Choice>('Claude')
  const [flash, setFlash] = useState(false)
  const copy = useAction(async () => {
    await navigator.clipboard.writeText(config.connector)
    setFlash(true)
    setTimeout(() => setFlash(false), 2000)
  })
  const listed = app !== 'Other' && config.listedIn.includes(app)
  return (
    <main className="connect-ai">
      <Top onBack={onBack} />
      <span className="ai-mark">
        <Icon name="sparkle" fill />
      </span>
      <div className="stack">
        <h1>Connect your AI</h1>
        <p className="lead">Claude or ChatGPT can then search, post and reply for you.</p>
      </div>
      <div className="choice" role="group" aria-label="AI app">
        {CHOICES.map((a) => (
          <button key={a} className={a === app ? 'here' : undefined} aria-pressed={a === app} onClick={() => setApp(a)}>
            {a}
          </button>
        ))}
      </div>
      {listed ? (
        <>
          <ol className="step-card">
            <Step n={1} words={`In ${app}, open Plugins`} {...(app === 'Claude' && { small: 'Customize, then Plugins.' })} />
            <Step n={2} words="Search Forest, and add it" />
            <Step n={3} {...ACCEPT} />
          </ol>
          <button className="text-link" onClick={() => setApp('Other')}>
            Forest not there? Add it by its address
          </button>
        </>
      ) : (
        <ol className="step-card">
          <Step n={1} words="Copy Forest's address">
            <div className="copy-field">
              <span className="address">{config.connector}</span>
              <button className="round clear" aria-label={flash ? 'Copied' : 'Copy'} onClick={() => copy.run()}>
                <Icon name={flash ? 'check' : 'copy'} />
              </button>
            </div>
          </Step>
          <Step n={2} words={`Add it in ${app === 'Other' ? 'your AI' : app}`} small="Where it adds connectors or plugins. Some call them MCP servers." />
          <Step n={3} {...ACCEPT} />
        </ol>
      )}
      <div className="fill" />
      {!listed && (
        <>
          <Line note={copy.note} />
          <div className="foot">
            <button className="primary" onClick={() => copy.run()}>
              <Icon name={flash ? 'check' : 'copy'} bold /> {flash ? 'Copied' : 'Copy address'}
            </button>
          </div>
        </>
      )}
    </main>
  )
}
