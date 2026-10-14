// The menu, a sheet from the bottom: the person's AI; their face check, after one face, as their
// vault keeps it, with its face numbers to copy for a test; the profiles hidden from the board (each
// shown again with a tap); the appearance; and forgetting this device: what it keeps is cleared, the
// fingerprint with it, and the passkey stays in the person's password manager. The face numbers
// live only while the menu is open.

import { Fragment, useState } from 'react'

import { applyAppearance } from '../appearance.ts'
import { withFace } from '../face.ts'
import { type Appearance, appearance, forgetLocal, hiddenProfiles, localProfiles, saveAppearance, showProfile } from '../local.ts'
import { settings } from '../settings.ts'
import { CheckIcon, CopyIcon, Line, Spinner, useAction, useCopy } from '../ui.tsx'
import { type FaceCheck, faceCheckOf } from '../vault.ts'
import { ProfileName } from './Compose.tsx'

const CHOICES: [Appearance, string][] = [
  ['device', 'Device'],
  ['light', 'Light'],
  ['dark', 'Dark'],
]

export function Menu({ onClose, onForget }: { onClose: () => void; onForget: () => void }) {
  const { mcp } = settings()
  const copy = useCopy()
  const [theme, setTheme] = useState(appearance)
  const [sure, setSure] = useState(false)
  const [hidden, setHidden] = useState(hiddenProfiles)
  const hiddenOnes = localProfiles().filter((p) => hidden.includes(p.address))

  const forget = () => {
    forgetLocal()
    applyAppearance('device')
    onForget()
  }
  const choose = (choice: Appearance) => {
    saveAppearance(choice)
    applyAppearance(choice)
    setTheme(choice)
  }

  return (
    <>
      <div className="sheet-back" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label="Menu">
        <div className="grip" />
        <div className="item">
          <h2>Your AI</h2>
          <div className="box">
            <span>{mcp}</span>
            <button className="icon" aria-label={copy.copied ? 'Copied' : 'Copy'} onClick={() => copy.copy(mcp)}>
              {copy.copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
          <p>Add it to your AI once, then give it an access key from any profile.</p>
          <Line error={copy.error} />
        </div>
        <FaceCheckItem />
        {hiddenOnes.length > 0 && (
          <div className="item">
            <h2>Hidden profiles</h2>
            <div className="rows">
              {hiddenOnes.map((p) => (
                <div className="row" key={p.address} style={{ alignItems: 'center' }}>
                  <span>
                    <ProfileName p={p} />
                  </span>
                  <button
                    className="remove"
                    onClick={() => {
                      showProfile(p.address)
                      setHidden(hiddenProfiles())
                    }}
                  >
                    Show
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="item">
          <h2>Appearance</h2>
          <div className="segmented" role="radiogroup" aria-label="Appearance">
            {CHOICES.map(([choice, label]) => (
              <button key={choice} role="radio" aria-checked={theme === choice} className={theme === choice ? 'on' : ''} onClick={() => choose(choice)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="item">
          {sure ? (
            <>
              <p>Your passkey stays in your password manager. Sign in with it to come back.</p>
              <button className="primary" onClick={forget}>
                Forget this device
              </button>
            </>
          ) : (
            <button className="line" onClick={() => setSure(true)}>
              Forget this device
            </button>
          )}
        </div>
      </div>
    </>
  )
}

/** The person's face check: one face, then the note's facts from the vault, and its face numbers to copy as JSON. */
function FaceCheckItem() {
  // Undefined until asked; null when the vault holds no note.
  const [facts, setFacts] = useState<FaceCheck | null>()
  const read = useAction(async () => setFacts(await withFace((seed) => faceCheckOf(seed, settings().host))))
  const copy = useCopy()
  if (!facts) {
    return (
      <div className="item">
        <button className="line" onClick={() => read.run()} disabled={read.busy}>
          {read.busy ? <Spinner /> : 'Your face check'}
        </button>
        <Line error={read.error} why={facts === null ? { text: 'Your vault holds no face check.' } : null} />
      </div>
    )
  }
  const shown: [string, string][] = [
    ['issuer', facts.issuer],
    ['date', facts.date === null ? 'not known' : new Date(facts.date).toLocaleDateString([], { dateStyle: 'medium' })],
    ['tier', facts.tier],
    ['model', facts.model],
    ['face numbers', String(facts.numbers.length)],
  ]
  return (
    <div className="item">
      <h2>Your face check</h2>
      <dl className="fields" aria-label="Your face check">
        {shown.map(([name, value]) => (
          <Fragment key={name}>
            <dt>{name}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>
      <p>These stay in your vault; copy them only to test.</p>
      <Line error={copy.error} />
      <button onClick={() => copy.copy(JSON.stringify(facts.numbers))}>{copy.copied ? 'Copied' : 'Copy'}</button>
    </div>
  )
}
