// Email, from You: one short email in the morning when something's new, never what it says (the
// host sends it, services' host/README.md, Email). One page, each step appearing in turn in its own
// place; nothing floats.
//
// 1. Off: one line on what it is; Your email; Count these profiles, every profile with a tick, all
//    ticked to start; one quiet line on what the host will know; Send a code, which asks the passkey
//    (each ticked profile signs).
// 2. Code sent: the email address shown with Change, which goes back to 1; the 6-digit code; Turn on.
// 3. On: the email address with Change (a new address is turning it on again, with a new code; the
//    old one goes once the new one is on); the ticks, where a change shows Save, which asks the
//    passkey; Turn off at the foot, asking again in its own place, Turn off the morning email?, with
//    Cancel and Turn off. Turning off deletes it all at the host.
//
// Where it stands is the Profiles folder's, shown from the device's copy (flows/email.ts); turned off
// elsewhere, it shows as Off with no error the next time a Save finds out. The host's refusals are
// said in words.ts's words.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { type Pending, askCode, emailFrom, saveProfiles, turnOff, turnOn } from '../flows/email.ts'
import { useEmail, useProfiles } from '../hooks.ts'
import { Loader } from '../mark.tsx'
import { withSeed } from '../passkey.ts'
import { AskAgain, Line, Quiet, Top, UnlockIcon, useAction } from '../ui.tsx'
import { Ticks } from './Ticks.tsx'

export const WHAT = "One short email in the morning when something's new. Never what it says."
export const KNOWS = "The host will know the profiles you tick are one person's, and your email."
const NONE = 'Tick at least one profile.'
const NOT_AN_EMAIL = "That doesn't look like an email address."

export function Email({ onBack }: { onBack: () => void }) {
  const on = useEmail()
  const mine = useProfiles()
  const [typed, setTyped] = useState('')
  const [code, setCode] = useState('')
  // The code on its way, held in this page alone until it is typed.
  const [pending, setPending] = useState<Pending | null>(null)
  // On, and changing the email address: step 1 again, for a new code.
  const [changing, setChanging] = useState(false)
  // The ticks as the person has set them; none until they do: the saved ones while it is on, else all.
  const [picked, setPicked] = useState<Set<string> | null>(null)

  const saved = new Set(mine.filter((p) => on?.profiles.includes(p.address)).map((p) => p.label))
  const ticked = picked ?? (on ? saved : new Set(mine.map((p) => p.label)))
  const changed = ticked.size !== saved.size || [...ticked].some((l) => !saved.has(l))
  const tick = (label: string) => {
    const now = new Set(ticked)
    if (!now.delete(label)) now.add(label)
    setPicked(now)
  }
  /** The ticked profiles' labels, at least one. */
  const chosen = (): string[] => {
    const labels = mine.filter((p) => ticked.has(p.label)).map((p) => p.label)
    if (labels.length === 0) throw new Quiet(NONE)
    return labels
  }

  const send = useAction(async () => {
    const email = emailFrom(typed)
    if (!email) throw new Quiet(NOT_AN_EMAIL)
    const labels = chosen()
    setPending(await withSeed(passkey()!, (seed) => askCode(config, seed, email, labels)))
    setCode('')
  })
  const turnedOn = useAction(async () => {
    await withSeed(passkey()!, (seed) => turnOn(config, seed, pending!, code, on))
    setPending(null)
    setChanging(false)
    setPicked(null)
    setCode('')
  })
  const save = useAction(async () => {
    const labels = chosen()
    await withSeed(passkey()!, (seed) => saveProfiles(config, seed, on!, labels))
    setPicked(null)
  })
  const off = useAction(async () => {
    await withSeed(passkey()!, (seed) => turnOff(config, seed, on!))
    setPicked(null)
    setChanging(false)
  })
  const busy = send.busy || turnedOn.busy || save.busy || off.busy

  /** Back to the first step with the email address as it was, to send a code to another. */
  const change = (email: string) => {
    send.setNote(null)
    turnedOn.setNote(null)
    setTyped(email)
    setPending(null)
    setChanging(true)
  }

  const step = pending ? 'code' : on && !changing ? 'on' : 'off'
  const email = (shown: string) => (
    <div className="rows">
      <div className="row">
        <span className="two">
          <strong>{shown}</strong>
        </span>
        <button type="button" className="soft small" disabled={busy} onClick={() => change(shown)}>
          Change
        </button>
      </div>
    </div>
  )
  const ticks = (
    <div className="stack">
      <h2>Count these profiles</h2>
      <Ticks labels={mine.map((p) => p.label)} ticked={ticked} onTick={tick} disabled={busy} />
    </div>
  )

  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Email</h1>
      </Top>
      {step === 'off' && (
        <>
          {!on && <p className="lead">{WHAT}</p>}
          <label className="field">
            <span className="label">Your email</span>
            <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={typed} maxLength={254} onChange={(e) => setTyped(e.target.value)} />
          </label>
          {ticks}
          <p className="line">{KNOWS}</p>
          <Line note={send.note} />
          <div className="foot">
            <button type="button" className="primary" disabled={busy} onClick={() => send.run()}>
              {send.busy ? <Loader /> : <><UnlockIcon /> Send a code</>}
            </button>
            {on && (
              <button type="button" className="quiet" disabled={busy} onClick={() => setChanging(false)}>
                Cancel
              </button>
            )}
          </div>
        </>
      )}
      {step === 'code' && (
        <>
          {email(pending!.email)}
          <label className="field">
            <span className="label">6-digit code</span>
            <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
          </label>
          <Line note={turnedOn.note} />
          <div className="foot">
            <button type="button" className="primary" disabled={busy || code.length !== 6} onClick={() => turnedOn.run()}>
              {turnedOn.busy ? <Loader /> : <><UnlockIcon /> Turn on</>}
            </button>
          </div>
        </>
      )}
      {step === 'on' && (
        <>
          {email(on!.email)}
          {ticks}
          <Line note={save.note} />
          {changed && (
            <div className="exp-buttons">
              <span className="grow" />
              <button type="button" className="primary small" disabled={busy} onClick={() => save.run()}>
                {save.busy ? <Loader /> : <><UnlockIcon /> Save</>}
              </button>
            </div>
          )}
          <div className="fill" />
          <div className="foot">
            <AskAgain words="Turn off" ask="Turn off the morning email?" look="danger" unlock busy={off.busy} disabled={save.busy} note={off.note} onYes={() => off.run()} />
          </div>
        </>
      )}
    </main>
  )
}
