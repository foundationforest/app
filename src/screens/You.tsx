// You, one column on a phone and a laptop alike. At the top, You, with the person's badges beside
// it: a check done its badge, the black square, a tap saying its words; one not done its badge's
// outline, dashed, which opens Get verified (the ID's only where the verifier sells it, GET /,
// `forSale`, or once it is done). Then one card of settings rows, each its icon, its name, its detail
// under it and a caret, opening a page of its own: Your checks, with what the person holds (Face,
// INE), or Not yet (YourChecks.tsx); Your AI, with the apps' names (AiApps.tsx); Passkeys, with
// their names, the main one first (Passkeys.tsx); Email, Every morning or Off (Email.tsx); and About
// Forest (About.tsx); last, Appearance, with three icon buttons at its right, Auto, Light and Dark,
// each named for screen readers, a tap applying it at once. At the foot, Forget this device, red
// text, asking again in its own place, Forget this device?, with Cancel and Forget (forget.ts).
// Nothing here asks the passkey.

import { useState } from 'react'

import { type Check, FIRST, type Theme, madeHere, saveTheme, theme as savedTheme } from '../device.ts'
import { idName } from '../documents.ts'
import { forgetDevice } from '../forget.ts'
import { useBackups, useChecks, useConnections, useEmail, useIdCheck, useIds } from '../hooks.ts'
import { type IconName, Icon } from '../icons.tsx'
import { nameOf, numbered } from '../managers.ts'
import { applyTheme } from '../theme.ts'
import { FORGET_LINE } from '../forget.ts'
import { AskAgain, Opens, Seg, Top, Unverified, Verified } from '../ui.tsx'

type Props = { onForgot: () => void; onCheck: (check: Check) => void; onChecks: () => void; onPasskeys: () => void; onAiApps: () => void; onEmail: () => void; onAbout: () => void }

/** The looks, each by its words and icon: the device's own is Auto. */
export const THEMES: Array<[Theme, string, IconName]> = [
  ['device', 'Auto', 'circle-half'],
  ['light', 'Light', 'sun'],
  ['dark', 'Dark', 'moon'],
]

/** What Your checks' row says the person holds: Face, then each ID stamp by its own name (INE), or Not yet. */
export function checksLine(has: Set<Check>, ids: ReturnType<typeof useIds>): string {
  const held = [...(has.has('face') ? ['Face'] : []), ...(has.has('id') ? (ids.length ? ids.map(idName) : ['ID']) : [])]
  return held.length ? held.join(', ') : 'Not yet'
}

export function You({ onForgot, onCheck, onChecks, onPasskeys, onAiApps, onEmail, onAbout }: Props) {
  const has = useChecks()
  const ids = useIds()
  const { forSale } = useIdCheck()
  const backups = useBackups()
  const aiApps = useConnections()
  const emailOn = useEmail() !== null
  const made = madeHere()
  const passkeys = backups ? numbered([FIRST, ...backups.map((b) => b.id)].map((id) => nameOf(made[id]))).join(', ') : ''
  const [theme, setTheme] = useState(savedTheme)
  const pick = (t: Theme) => {
    saveTheme(t)
    applyTheme(t)
    setTheme(t)
  }
  return (
    <main>
      <Top>
        <div className="titled">
          <h1>You</h1>
          <span className="badges" role="group" aria-label="How you're verified">
            {(['face', 'id'] as const)
              .filter((c) => c === 'face' || forSale || has.has(c))
              .map((c) => (has.has(c) ? <Verified key={c} check={c} big alone /> : <Unverified key={c} check={c} onClick={() => onCheck(c)} />))}
          </span>
        </div>
      </Top>
      <div className="rows">
        <Opens icon="seal-check" words="Your checks" line={checksLine(has, ids)} onClick={onChecks} />
        <Opens icon="sparkle" words="Your AI" line={aiApps.length ? aiApps.map((c) => c.name).join(', ') : 'Not yet'} onClick={onAiApps} />
        <Opens icon="key" words="Passkeys" line={passkeys} onClick={onPasskeys} />
        <Opens icon="envelope-simple" words="Email" line={emailOn ? 'Every morning' : 'Off'} onClick={onEmail} />
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
