// Connect your AI: its mint square, what an AI app then does for the person, a switch between
// Claude and ChatGPT, and one card with three steps in that app's name: copy the address (this
// app's connector, in full, as an AI app's connector field takes it), add it there as a connector,
// sign in when it asks (an AI app that never signs in, Claude's No sign-in, can read but never act).
// No links to other sites. Copy address copies it and says so a moment, staying, so steps 2 and 3
// stay in view while the person does them. Right after the first profile (or its Later) it is a
// setup step, with Skip, which reads Done once the address is copied, on to Home; from You, a back.

import { useState } from 'react'

import { config } from '../config.ts'
import { Icon } from '../icons.tsx'
import { Line, Top, useAction } from '../ui.tsx'

const APPS = ['Claude', 'ChatGPT'] as const

type Props = { setup: boolean; onBack: () => void; onDone: () => void }

export function ConnectAi({ setup, onBack, onDone }: Props) {
  const [app, setApp] = useState<(typeof APPS)[number]>('Claude')
  const [copied, setCopied] = useState(false)
  const [flash, setFlash] = useState(false)
  const copy = useAction(async () => {
    await navigator.clipboard.writeText(config.connector)
    setCopied(true)
    setFlash(true)
    setTimeout(() => setFlash(false), 2000)
  })
  return (
    <main>
      {!setup && <Top onBack={onBack} />}
      <span className="ai-mark">
        <Icon name="sparkle" fill />
      </span>
      <div className="stack">
        <h1>Connect your AI</h1>
        <p className="lead">Claude or ChatGPT can then search, post and reply for you.</p>
      </div>
      <div className="choice" role="group" aria-label="AI app">
        {APPS.map((a) => (
          <button key={a} className={a === app ? 'here' : undefined} aria-pressed={a === app} onClick={() => setApp(a)}>
            {a}
          </button>
        ))}
      </div>
      <ol className="step-card">
        <li>
          <span className="bul" aria-hidden>
            1
          </span>
          <div className="grow">
            <span className="t">Copy this address</span>
            <div className="copy-field">
              <span className="address">{config.connector}</span>
              <button className="round clear" aria-label={flash ? 'Copied' : 'Copy'} onClick={() => copy.run()}>
                <Icon name={flash ? 'check' : 'copy'} />
              </button>
            </div>
          </div>
        </li>
        <li>
          <span className="bul" aria-hidden>
            2
          </span>
          <span className="t">Add it in {app} as a connector</span>
        </li>
        <li>
          <span className="bul" aria-hidden>
            3
          </span>
          <span className="t">Sign in when {app} asks</span>
        </li>
      </ol>
      <div className="fill" />
      <Line note={copy.note} />
      <div className="foot">
        <button className="primary" onClick={() => copy.run()}>
          <Icon name={flash ? 'check' : 'copy'} bold /> {flash ? 'Copied' : 'Copy address'}
        </button>
        {setup && (
          <button className="quiet" onClick={onDone}>
            {copied ? 'Done' : 'Skip'}
          </button>
        )}
      </div>
    </main>
  )
}
