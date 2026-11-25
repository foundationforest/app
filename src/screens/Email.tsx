// Email, from You: one email each morning when something's new, never what it says (the host sends
// it, services' host/README.md, Email). One page, each step in its own place:
//
// 1. Off: "One email each morning when something's new."; Your email; Turn on, strong green, which
//    opens a sheet, Which profiles?: each profile a row, its avatar, "Market · role" and a round
//    tick, all on; "Forest's host will know these share your email."; Continue, which asks the
//    passkey (each ticked profile signs) and has the host email a code.
// 2. Code sent: the email address shown with Change, which goes back to 1; the 6-digit code; Turn on.
// 3. On: the email on a white row with its mail icon and a pencil; Profiles, each a row with its
//    round tick, a tap saving at once (an unlock unless the seed is held), at least one staying
//    ticked. The pencil opens the row in place: the email in a field, Delete email, red, at the left,
//    asking again in its own place, then deleting it all at the host; and Save, strong green, at the
//    right, which with a new address sends a new code (the old one goes once the new one is on).
//
// Where it stands is the Profiles folder's, shown from the device's copy (flows/email.ts); turned off
// elsewhere, it shows as Off with no error the next time a tick finds out. The host's refusals are
// said in words.ts's words.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { type Pending, askCode, emailFrom, saveProfiles, turnOff, turnOn } from '../flows/email.ts'
import { useEmail, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { withSeed } from '../passkey.ts'
import { Sheet } from '../sheet.tsx'
import { AskAgain, Line, Quiet, Top, UnlockIcon, useAction } from '../ui.tsx'
import { Ticks } from './Ticks.tsx'

export const WHAT = "One email each morning when something's new."
export const KNOWS = "Forest's host will know these share your email."
const NONE = 'Tick at least one profile.'
const NOT_AN_EMAIL = "That doesn't look like an email address."

export function Email({ onBack }: { onBack: () => void }) {
  const on = useEmail()
  const mine = useProfiles()
  const [typed, setTyped] = useState('')
  const [code, setCode] = useState('')
  // The code on its way, held in this page alone until it is typed.
  const [pending, setPending] = useState<Pending | null>(null)
  // Which profiles?, open over the page.
  const [which, setWhich] = useState(false)
  // Off, the ticks in Which profiles?: all, until the person changes them.
  const [picked, setPicked] = useState<Set<string> | null>(null)
  // On, its row opened by the pencil.
  const [editing, setEditing] = useState(false)
  // On, the tick being saved.
  const [saving, setSaving] = useState<string | null>(null)

  const all = mine.map((p) => p.label)
  const ticked = picked ?? new Set(all)
  const saved = new Set(mine.filter((p) => on?.profiles.includes(p.address)).map((p) => p.label))

  /** The email typed, if it is one the host takes. */
  const typedEmail = (): string => {
    const email = emailFrom(typed)
    if (!email) throw new Quiet(NOT_AN_EMAIL)
    return email
  }

  /** Turn on: the email checked, then Which profiles?. */
  const turnOnTapped = useAction(async () => {
    typedEmail()
    setWhich(true)
  })
  /** Which profiles?'s Continue: the ticked profiles sign, and the host emails a code. */
  const send = useAction(async () => {
    const labels = all.filter((l) => ticked.has(l))
    if (labels.length === 0) throw new Quiet(NONE)
    setPending(await withSeed(passkey()!, (seed) => askCode(config, seed, typedEmail(), labels)))
    setWhich(false)
    setCode('')
  })
  const turnedOn = useAction(async () => {
    await withSeed(passkey()!, (seed) => turnOn(config, seed, pending!, code, on))
    setPending(null)
    setEditing(false)
    setPicked(null)
    setCode('')
  })
  /** A tick tapped while it is on: saved at once, at least one staying ticked. */
  const tick = useAction(async (label: string) => {
    const now = new Set(saved)
    if (!now.delete(label)) now.add(label)
    if (now.size === 0) throw new Quiet(NONE)
    setSaving(label)
    try {
      await withSeed(passkey()!, (seed) => saveProfiles(config, seed, on!, all.filter((l) => now.has(l))))
    } finally {
      setSaving(null)
    }
  })
  /** The pencil's Save: the same address closes the row; a new one has a code sent to it, for the profiles it counts now. */
  const save = useAction(async () => {
    const email = typedEmail()
    if (email === on!.email) return setEditing(false)
    const labels = all.filter((l) => saved.has(l))
    setPending(await withSeed(passkey()!, (seed) => askCode(config, seed, email, labels.length ? labels : all)))
    setCode('')
  })
  const off = useAction(async () => {
    await withSeed(passkey()!, (seed) => turnOff(config, seed, on!))
    setEditing(false)
    setTyped('')
  })
  const busy = send.busy || turnedOn.busy || tick.busy || save.busy || off.busy

  /** Back to the first step with the email address as it was, to send a code to another. */
  const change = (email: string) => {
    send.setNote(null)
    turnedOn.setNote(null)
    setTyped(email)
    setPending(null)
  }

  const step = pending ? 'code' : on ? 'on' : 'off'
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Email</h1>
      </Top>
      {step === 'off' && (
        <>
          <p className="lead">{WHAT}</p>
          <label className="field">
            <span className="label">Your email</span>
            <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={typed} maxLength={254} onChange={(e) => setTyped(e.target.value)} />
          </label>
          <Line note={turnOnTapped.note} />
          <div className="fill" />
          <div className="foot">
            <button type="button" className="primary" disabled={busy} onClick={() => turnOnTapped.run()}>
              Turn on
            </button>
          </div>
          {which && (
            <Sheet label="Which profiles?" onClose={() => setWhich(false)}>
              <h2>Which profiles?</h2>
              <Ticks round labels={all} ticked={ticked} disabled={send.busy} onTick={(l) => setPicked((was) => {
                const now = new Set(was ?? all)
                if (!now.delete(l)) now.add(l)
                return now
              })} />
              <p className="line">{KNOWS}</p>
              <Line note={send.note} />
              <button type="button" className="primary" disabled={send.busy} onClick={() => send.run()}>
                {send.busy ? <Loader /> : <><UnlockIcon /> Continue</>}
              </button>
            </Sheet>
          )}
        </>
      )}
      {step === 'code' && (
        <>
          <div className="rows">
            <div className="row">
              <span className="two">
                <strong>{pending!.email}</strong>
              </span>
              <button type="button" className="small" disabled={busy} onClick={() => change(pending!.email)}>
                Change
              </button>
            </div>
          </div>
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
          {editing ? (
            <div className="exp email-edit" role="group" aria-label="Your email">
              <label className="field">
                <span className="label">Your email</span>
                <input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={typed} maxLength={254} onChange={(e) => setTyped(e.target.value)} />
              </label>
              <Line note={save.note} />
              <div className="exp-buttons">
                <AskAgain words="Delete email" yes="Delete" ask="Delete your email?" icon="trash" unlock busy={off.busy} disabled={save.busy} note={off.note} onYes={() => off.run()} />
                <span className="grow" />
                <button type="button" className="primary small" disabled={busy} onClick={() => save.run()}>
                  {save.busy ? <Loader /> : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="rows">
              <div className="row">
                <span className="sq sm plain">
                  <Icon name="envelope-simple" />
                </span>
                <strong className="grow">{on!.email}</strong>
                <button
                  type="button"
                  className="round clear"
                  aria-label="Edit email"
                  disabled={busy}
                  onClick={() => {
                    setTyped(on!.email)
                    setEditing(true)
                  }}
                >
                  <Icon name="pencil-simple" />
                </button>
              </div>
            </div>
          )}
          <div className="stack">
            <h2>Profiles</h2>
            <Ticks round labels={all} ticked={saved} onTick={(l) => void tick.run(l)} disabled={busy} busy={saving} />
          </div>
          <Line note={tick.note} />
        </>
      )}
    </main>
  )
}
