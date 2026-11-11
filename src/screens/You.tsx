// You, one column on a phone and a laptop alike. At the top, one card: how the person is verified,
// Selfie and ID, each with its badge's square: a check done its badge, the mint square, and
// Verified on a mint chip; one not done its badge's outline, dashed, which starts it, one line on
// what it gives, from the verifier's gifts as Get verified says it, and a plain Add, which opens Get
// verified too. The ID shows only where the verifier sells it (GET /, `forSale`), or once it is done.
// Then one card of rows: Your AI, with the apps' names (AiApps.tsx), and Passkeys, with how many
// (Passkeys.tsx), and About Forest (About.tsx), each opening its own screen; last, Appearance, with
// three icon buttons at its right, Auto, Light and Dark, each named for screen readers, a tap
// applying it at once. At the foot, Forget this device, red text, asking again in its own place, Forget
// this device?, with Cancel and Forget (forget.ts). Nothing here asks the passkey.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { type Check, type Theme, saveTheme, theme as savedTheme } from '../device.ts'
import { type CreditLines, creditsOf } from '../flows/verify.ts'
import { forgetDevice } from '../forget.ts'
import { useBackups, useChecks, useConnections, useIdCheck } from '../hooks.ts'
import { type IconName, Icon } from '../icons.tsx'
import { applyTheme } from '../theme.ts'
import { FORGET_LINE } from '../forget.ts'
import { AskAgain, CHECK_ICON, Opens, Seg, Top } from '../ui.tsx'

type Props = { onForgot: () => void; onCheck: (check: Check) => void; onPasskeys: () => void; onAiApps: () => void; onAbout: () => void }

/** The looks, each by its words and icon: the device's own is Auto. */
export const THEMES: Array<[Theme, string, IconName]> = [
  ['device', 'Auto', 'circle-half'],
  ['light', 'Light', 'sun'],
  ['dark', 'Dark', 'moon'],
]

const CHECKS: Array<{ check: Check; name: string; add: string }> = [
  { check: 'face', name: 'Selfie', add: 'Add, free' },
  { check: 'id', name: 'ID', add: 'Add, $5' },
]

/** What a check not done gives, in one line: the selfie its credits, the ID stronger trust and its credits. */
const givesOf = (check: Check, credits: CreditLines) => (check === 'id' ? ['Stronger trust', credits.id] : [credits.face]).filter(Boolean).join(', ')

/** How many passkeys: 1 passkey, 2 passkeys. */
const passkeyCount = (n: number) => `${n} passkey${n === 1 ? '' : 's'}`

export function You({ onForgot, onCheck, onPasskeys, onAiApps, onAbout }: Props) {
  const has = useChecks()
  const { forSale } = useIdCheck()
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
  const pick = (t: Theme) => {
    saveTheme(t)
    applyTheme(t)
    setTheme(t)
  }
  return (
    <main>
      <Top>
        <h1>You</h1>
      </Top>
      <div className="rows" role="group" aria-label="Verified">
        {CHECKS.filter(({ check }) => check === 'face' || forSale || has.has(check)).map(({ check, name, add }) => (
          <div key={check} className="row">
            {has.has(check) ? (
              <span className="sq sm mint">
                <Icon name={CHECK_ICON[check]} fill />
              </span>
            ) : (
              <button type="button" className="sq sm outline" aria-label={`Verify with ${check === 'id' ? 'ID' : 'a selfie'}`} onClick={() => onCheck(check)}>
                <Icon name={CHECK_ICON[check]} />
              </button>
            )}
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
              <button className="soft small" onClick={() => onCheck(check)}>
                {add}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="rows">
        <Opens icon="sparkle" words="Your AI" line={aiApps.map((c) => c.name).join(', ')} onClick={onAiApps} />
        <Opens icon="key" words="Passkeys" line={backups ? passkeyCount(backups.length + 1) : ''} onClick={onPasskeys} />
        <Opens icon="info" words="About Forest" onClick={onAbout} />
        <div className="row looks">
          <span className="sq sm plain">
            <Icon name="paint-brush" />
          </span>
          <strong className="grow">Appearance</strong>
          <Seg label="Appearance" icons options={THEMES.map(([value, words, icon]) => ({ value, words, icon }))} value={theme} onPick={(t) => t && pick(t)} />
        </div>
      </div>
      <div className="lone">
        <AskAgain
          words="Forget this device"
          yes="Forget"
          ask="Forget this device?"
          line={FORGET_LINE}
          icon="sign-out"
          onYes={() => {
            forgetDevice()
            onForgot()
          }}
        />
      </div>
    </main>
  )
}
