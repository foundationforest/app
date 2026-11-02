// Settings: how the person is verified, with the ID check when they have only the face check; the
// appearance; Forget this device; and About.

import { useState } from 'react'

import { type Check, type Theme, checks as heldChecks, forget, saveTheme, theme as savedTheme } from '../device.ts'
import { CHECK_WORDS, useChecks, useProfiles } from '../hooks.ts'
import { letGo } from '../opened.ts'
import { applyTheme } from '../theme.ts'
import { type Place, Places, Top } from '../ui.tsx'

type Props = { go: (to: Place) => void; onForgot: () => void; onIdCheck: () => void }

const THEMES: Array<[Theme, string]> = [
  ['device', 'Device'],
  ['light', 'Light'],
  ['dark', 'Dark'],
]

export function Settings({ go, onForgot, onIdCheck }: Props) {
  const list = useProfiles()
  const byProfile = useChecks(list)
  // How the person is verified: the stamps their Profiles folder holds, as this device last saw
  // them, and what their profiles' entries show. With neither yet, the face check, the way past
  // Start the earlier version knew.
  const shown = new Set<Check>([...heldChecks(), ...Object.values(byProfile).flat()])
  const checks: Check[] = shown.size ? (['face', 'id'] as const).filter((c) => shown.has(c)) : ['face']
  const [theme, setTheme] = useState(savedTheme)
  const [forgetting, setForgetting] = useState(false)
  const pick = (t: Theme) => {
    saveTheme(t)
    applyTheme(t)
    setTheme(t)
  }
  return (
    <main>
      <Top>
        <h1>Settings</h1>
      </Top>
      <section className="stack">
        <h2>Verified</h2>
        <p>{checks.map((c) => CHECK_WORDS[c]).join(', ')}</p>
        {!checks.includes('id') && <button onClick={onIdCheck}>Get the ID check</button>}
      </section>
      <section className="stack">
        <h2>Appearance</h2>
        <div className="choice" role="radiogroup" aria-label="Appearance">
          {THEMES.map(([t, words]) => (
            <button key={t} role="radio" aria-checked={theme === t} className={theme === t ? 'here' : ''} onClick={() => pick(t)}>
              {words}
            </button>
          ))}
        </div>
      </section>
      <section className="stack">
        {forgetting && <p className="line">Your passkey stays in your password manager.</p>}
        <button
          className={forgetting ? 'danger' : ''}
          onClick={() => {
            if (!forgetting) return setForgetting(true)
            forget()
            letGo()
            applyTheme('device')
            onForgot()
          }}
        >
          {forgetting ? 'Forget' : 'Forget this device'}
        </button>
      </section>
      <section className="stack">
        <h2>About</h2>
        <p>Version {__COMMIT__}</p>
        <p>
          <a href="https://github.com/foundationforest/app" target="_blank" rel="noreferrer">
            Source
          </a>
        </p>
      </section>
      <div className="fill" />
      <Places at="settings" go={go} />
    </main>
  )
}
