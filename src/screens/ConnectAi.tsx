// Connect an AI: three steps, and no links to other sites. The address is this app's connector, in
// full, as an AI app's connector field takes it, with Copy. Sign in now, since an AI app that never
// signs in (Claude's No sign-in, which it offers first) can read but never act.

import { useState } from 'react'

import { config } from '../config.ts'
import { Top } from '../ui.tsx'

export function ConnectAi({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(config.connector)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <main>
      <Top onBack={onBack} />
      <h1>Connect an AI</h1>
      <ol className="steps">
        <li>In your AI app, add a connector. If it asks how to sign in, pick Sign in now.</li>
        <li>
          Paste this address:
          <div className="stack">
            <span className="address">{config.connector}</span>
            <button onClick={() => void copy()}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
        </li>
        <li>It brings you back here to pick its profiles.</li>
      </ol>
    </main>
  )
}
