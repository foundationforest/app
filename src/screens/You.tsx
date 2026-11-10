// You, one column on a phone and a laptop alike. At the top, one card: how the person is verified,
// Selfie and ID, each with its badge's icon square (the selfie's mint, the ID's forest green); a
// check done says Verified on a mint chip, one not done one line on what it gives, from the
// verifier's gifts as Get verified says it, and a plain Add, which opens Get verified (the ID's sheet
// up, for the ID). Then one card of rows, each opening its own screen: Passkeys, with how many
// (Passkeys.tsx); Your AI, with the apps' names (AiApps.tsx); Appearance, Auto, Light or Dark, on a
// sheet whose one choice is a list of rows, a tap picking it and closing the sheet; and About Forest
// (About.tsx). At the foot, Forget this device, red text, tapped twice (forget.ts). Nothing here
// asks the passkey.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { type Check, type Theme, saveTheme, theme as savedTheme } from '../device.ts'
import { type CreditLines, creditsOf } from '../flows/verify.ts'
import { forgetDevice } from '../forget.ts'
import { useBackups, useChecks, useConnections } from '../hooks.ts'
import { type IconName, Icon } from '../icons.tsx'
import { applyTheme } from '../theme.ts'
import { Opens, RadioMark, Sheet, Top } from '../ui.tsx'

type Props = { onForgot: () => void; onCheck: (check: Check) => void; onPasskeys: () => void; onAiApps: () => void; onAbout: () => void }

/** The looks, each by its words and icon: the device's own is Auto. */
export const THEMES: Array<[Theme, string, IconName]> = [
  ['device', 'Auto', 'circle-half'],
  ['light', 'Light', 'sun'],
  ['dark', 'Dark', 'moon'],
]

const CHECKS: Array<{ check: Check; name: string; icon: IconName; add: string }> = [
  { check: 'face', name: 'Selfie', icon: 'smiley', add: 'Add, free' },
  { check: 'id', name: 'ID', icon: 'identification-card', add: 'Add, $5' },
]

/** What a check not done gives, in one line: the selfie its credits, the ID stronger trust and its credits. */
const givesOf = (check: Check, credits: CreditLines) => (check === 'id' ? ['Stronger trust', credits.id] : [credits.face]).filter(Boolean).join(', ')

/** How many passkeys: 1 passkey, 2 passkeys. */
const passkeyCount = (n: number) => `${n} passkey${n === 1 ? '' : 's'}`

export function You({ onForgot, onCheck, onPasskeys, onAiApps, onAbout }: Props) {
  const has = useChecks()
  const backups = useBackups()
  const aiApps = useConnections()
  const [credits, setCredits] = useState<CreditLines>({})
  useEffect(() => {
    let live = true
    creditsOf(config).then(
      (lines) => live && setCredits(lines),
      () => undefined,
    )
    return () => void (live = false)
  }, [])
  const [theme, setTheme] = useState(savedTheme)
  const [looks, setLooks] = useState(false)
  const [forgetting, setForgetting] = useState(false)
  const pick = (t: Theme) => {
    saveTheme(t)
    applyTheme(t)
    setTheme(t)
    setLooks(false)
  }
  const look = THEMES.find(([t]) => t === theme)!
  return (
    <main>
      <Top>
        <h1>You</h1>
      </Top>
      <div className="rows" role="group" aria-label="Verified">
        {CHECKS.map(({ check, name, icon, add }) => (
          <div key={check} className="row">
            <span className={check === 'id' ? 'sq sm forest' : 'sq sm mint'}>
              <Icon name={icon} fill />
            </span>
            <span className="two">
              <strong>{name}</strong>
              {!has.has(check) && givesOf(check, credits) && <span className="wraps">{givesOf(check, credits)}</span>}
            </span>
            {has.has(check) ? (
              <span className="chip new">
                <Icon name="check" bold />
                Verified
              </span>
            ) : (
              <button className="small" onClick={() => onCheck(check)}>
                {add}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="rows">
        <Opens icon="key" words="Passkeys" line={backups ? passkeyCount(backups.length + 1) : ''} onClick={onPasskeys} />
        <Opens icon="sparkle" words="Your AI" line={aiApps.map((c) => c.name).join(', ')} onClick={onAiApps} />
        <Opens icon="circle-half" words="Appearance" line={look[1]} onClick={() => setLooks(true)} />
        <Opens icon="info" words="About Forest" onClick={onAbout} />
      </div>
      <div className="lone">
        {forgetting && <p className="line">Your passkey stays in your password manager.</p>}
        <button
          className={forgetting ? 'danger solid small' : 'danger text'}
          onClick={() => {
            if (!forgetting) return setForgetting(true)
            forgetDevice()
            onForgot()
          }}
        >
          <Icon name="sign-out" bold />
          {forgetting ? 'Forget' : 'Forget this device'}
        </button>
      </div>
      {looks && (
        <Sheet label="Appearance" onClose={() => setLooks(false)}>
          <h2>Appearance</h2>
          <div className="rows pick-list" role="radiogroup" aria-label="Appearance">
            {THEMES.map(([t, words, icon]) => (
              <button key={t} type="button" role="radio" aria-checked={theme === t} className="row pick" onClick={() => pick(t)}>
                <Icon name={icon} />
                <span className="grow">{words}</span>
                <RadioMark on={theme === t} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </main>
  )
}
