// Settings: how the person is verified, Face and ID each with a check, or the ID check's "+ $5" when
// they have only the face check; the appearance, the device's, light or dark; and Forget this
// device, in red.

import { type ReactNode, useState } from 'react'

import { type Check, type Theme, checks as heldChecks, forget, saveTheme, theme as savedTheme } from '../device.ts'
import { useCards, useProfiles } from '../hooks.ts'
import { letGo } from '../opened.ts'
import { letGoRated } from '../rated.ts'
import { applyTheme } from '../theme.ts'
import { CheckIcon, DarkIcon, DeviceIcon, LightIcon, type Place, Places, Top } from '../ui.tsx'

type Props = { go: (to: Place) => void; onForgot: () => void; onIdCheck: () => void }

const THEMES: Array<[Theme, string, () => ReactNode]> = [
  ['device', 'Device', DeviceIcon],
  ['light', 'Light', LightIcon],
  ['dark', 'Dark', DarkIcon],
]

export function Settings({ go, onForgot, onIdCheck }: Props) {
  const list = useProfiles()
  const cards = useCards(list)
  // How the person is verified: the stamps their Profiles folder holds, as this device last saw
  // them, and what their profiles' entries show. With neither yet, the face check, the way past
  // Start the earlier version knew.
  const shown = new Set<Check>([...heldChecks(), ...Object.values(cards).flatMap((c) => c.checks)])
  const has = (c: Check) => shown.has(c) || (c === 'face' && shown.size === 0)
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
        <div className="rows">
          <div className="row">
            <span>Face</span>
            {has('face') && <CheckIcon label="Done" />}
          </div>
          <div className="row">
            <span>ID</span>
            {has('id') ? (
              <CheckIcon label="Done" />
            ) : (
              <button className="small" onClick={onIdCheck}>
                + $5
              </button>
            )}
          </div>
        </div>
      </section>
      <section className="stack">
        <h2>Appearance</h2>
        <div className="choice" role="radiogroup" aria-label="Appearance">
          {THEMES.map(([t, words, ThemeIcon]) => (
            <button key={t} role="radio" aria-label={words} aria-checked={theme === t} className={theme === t ? 'here' : ''} onClick={() => pick(t)}>
              <ThemeIcon />
            </button>
          ))}
        </div>
      </section>
      <section className="stack">
        {forgetting && <p className="line">Your passkey stays in your password manager.</p>}
        <button
          className={forgetting ? 'danger solid' : 'danger'}
          onClick={() => {
            if (!forgetting) return setForgetting(true)
            forget()
            letGo()
            letGoRated()
            applyTheme('device')
            onForgot()
          }}
        >
          {forgetting ? 'Forget' : 'Forget this device'}
        </button>
      </section>
      <div className="fill" />
      <Places at="settings" go={go} />
    </main>
  )
}
