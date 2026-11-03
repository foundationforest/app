// Settings: how the person is verified, Face and ID each with a check, or the ID check's "+ $5" when
// they have only the face check; their AI apps, each with the day it connected and how many profiles
// it acts for, and + Connect an AI; the appearance, the device's, light or dark; and Forget this
// device, in red. When a profile entry lists an access key this device doesn't know (made in
// another browser with the same seed), one row more, Find AI apps, finds them from the seed.

import { type ReactNode, useState } from 'react'

import { config } from '../config.ts'
import { type Check, type Theme, checks as heldChecks, forget, knownKeys, passkey, saveTheme, theme as savedTheme } from '../device.ts'
import { findConnections } from '../flows/connections.ts'
import { useCards, useConnections, useProfiles } from '../hooks.ts'
import { letGo } from '../opened.ts'
import { withSeed } from '../passkey.ts'
import { letGoRated } from '../rated.ts'
import { applyTheme } from '../theme.ts'
import { CheckIcon, DarkIcon, DeviceIcon, LightIcon, Line, type Place, Places, Spinner, Top, UnlockIcon, day, useAction } from '../ui.tsx'

type Props = { go: (to: Place) => void; onForgot: () => void; onIdCheck: () => void; onConnectAi: () => void; onAiApp: (address: string) => void }

const profileCount = (n: number) => `${n} profile${n === 1 ? '' : 's'}`

const THEMES: Array<[Theme, string, () => ReactNode]> = [
  ['device', 'Device', DeviceIcon],
  ['light', 'Light', LightIcon],
  ['dark', 'Dark', DarkIcon],
]

export function Settings({ go, onForgot, onIdCheck, onConnectAi, onAiApp }: Props) {
  const list = useProfiles()
  const [found, setFound] = useState(0)
  const cards = useCards(list, found)
  const aiApps = useConnections()
  const known = new Set(knownKeys())
  const unknown = Object.values(cards).some((c) => c.keys.some((k) => !known.has(k)))
  const find = useAction(async () => {
    await withSeed(passkey()!, (seed) => findConnections(config, seed))
    setFound((n) => n + 1)
  })
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
        <h2>AI apps</h2>
        {(aiApps.length > 0 || unknown) && (
          <div className="rows">
            {aiApps.map((c) => (
              <button key={c.address} className="row pick" onClick={() => onAiApp(c.address)}>
                <span className="two">
                  <strong>{c.name}</strong>
                  <span>{day(c.time)}</span>
                </span>
                <span className="aside">{profileCount(c.labels.length)}</span>
              </button>
            ))}
            {unknown && (
              <button className="row" disabled={find.busy} onClick={() => find.run()}>
                <span>Find AI apps</span>
                {find.busy ? <Spinner /> : <UnlockIcon />}
              </button>
            )}
          </div>
        )}
        <Line note={find.note} />
        <button onClick={onConnectAi}>+ Connect an AI</button>
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
