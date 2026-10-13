// The menu, a sheet from the bottom: the person's AI, the profiles hidden from the board (each
// shown again with a tap), the appearance, and forgetting this device: what it keeps is cleared,
// the fingerprint with it, and the passkey stays in the person's password manager.

import { useState } from 'react'

import { applyAppearance } from '../appearance.ts'
import { type Appearance, appearance, forgetLocal, hiddenProfiles, localProfiles, saveAppearance, showProfile } from '../local.ts'
import { settings } from '../settings.ts'
import { CheckIcon, CopyIcon } from '../ui.tsx'
import { ProfileName } from './Compose.tsx'

const CHOICES: [Appearance, string][] = [
  ['device', 'Device'],
  ['light', 'Light'],
  ['dark', 'Dark'],
]

export function Menu({ onClose, onForget }: { onClose: () => void; onForget: () => void }) {
  const { mcp } = settings()
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState(appearance)
  const [sure, setSure] = useState(false)
  const [hidden, setHidden] = useState(hiddenProfiles)
  const hiddenOnes = localProfiles().filter((p) => hidden.includes(p.address))

  const forget = () => {
    forgetLocal()
    applyAppearance('device')
    onForget()
  }
  const copy = async () => {
    await navigator.clipboard.writeText(mcp)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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
            <button className="icon" aria-label={copied ? 'Copied' : 'Copy'} onClick={copy}>
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
          <p>Add it to your AI once, then give it an access key from any profile.</p>
        </div>
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
