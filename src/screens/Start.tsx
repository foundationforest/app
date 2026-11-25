// Start: on the strong green (the soft green in the dark look), the mark, the name Forest
// (wordmark.tsx), and one white button, Start, on a phone and a laptop alike. Start asks for a
// passkey: the ones this device has used, else any Forest passkey. The browser's own window offers
// its other ways (a phone's QR code among them); the app never redraws them.
//
// What Start says next takes its button's place, under the mark, never floating:
// - Start found nothing (no passkey, or the window closed, which a browser can't tell apart), with a
//   back arrow, top left: I'm new, white, makes a passkey (this device's known ones excluded, so a
//   manager that still keeps one says so), then Get verified; I already use Forest, outlined, asks
//   any Forest passkey again;
// - No passkey found, after I already use Forest found nothing: Try again, or Type my 24 words
//   (ImportWords.tsx), the one door to the words, which open a Forest that is there already, never a
//   second one; and, quietly under them, Back, to Start's button;
// - This passkey has never been verified, for a passkey met here (not one made in this visit) whose
//   seed holds no stamp and no profile: Continue to verification, white, or Delete passkey, red,
//   which tells the browser it's gone (signalUnknownCredential), forgets this device, and goes back
//   to Start's button;
// - Save a passkey on this device?, once, after a passkey on another device (a phone through the QR
//   code) let a verified person in, so each unlock here doesn't ask that phone again: Save makes one
//   here and adds it (adding.ts); Not now goes on. Not while an AI app's login waits.
// - Passkeys don't work here, in place of all of it, in a browser where they can't (no WebAuthn, no
//   PRF, or an app's own browser: passkey.ts, `passkeysWork`): Open Forest in a different browser,
//   and Copy link, which copies this page's address and says Copied a moment.
//
// Every button on Start asks the passkey, so none shows the unlock icon; Save does, its one button
// that asks where the one beside it doesn't. Nobody is in yet, so Start drops any seed still held
// (held.ts) as it opens. The seed a passkey gives is held from then, so the verification and the first
// profiles ask again only once 15 minutes went by with nothing done. A passkey that answers is
// followed first: one added to a first names the person's seed in its seed entry, and that one is held
// (flows/seed.ts). A passkey just made names none: it is a first passkey, made for this device, which
// the device notes with its manager's name, for Passkeys (device.ts).

import { type ReactNode, useEffect, useState } from 'react'

import { addPasskey } from '../adding.ts'
import { config } from '../config.ts'
import { FIRST, noteMade, passkeys, unknowPasskey } from '../device.ts'
import { follow } from '../flows/seed.ts'
import { type Entered, enter } from '../flows/start.ts'
import { forgetDevice } from '../forget.ts'
import { drop as dropSeed, hold } from '../held.ts'
import { Icon } from '../icons.tsx'
import { makerOf } from '../managers.ts'
import { Loader, Mark } from '../mark.tsx'
import { NoAnswer, type Passkey, SameManager, ask, drop, make, passkeysWork, withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, UnlockIcon, useAction } from '../ui.tsx'
import { Said } from '../words.ts'
import { Wordmark } from '../wordmark.tsx'

type Props = {
  onEntered: (entered: Entered, passkey: string) => void
  onWords: () => void
  /** An AI app's login waits: no Save a passkey on this device?. */
  connecting?: boolean
  /** Back from Your 24 words: No passkey found, open. */
  noPasskey?: boolean
}

type Open = 'nothing' | 'none' | 'never' | 'save'

/** The passkeys made in this visit, in the page's memory: never asked about as never verified, however often Start is opened again. */
const madeThisVisit = new Set<string>()

/** I'm new on a manager that still keeps this device's Forest passkey: the way in is that one. */
const KEPT_ALREADY = 'This password manager already has your Forest passkey. Tap I already use Forest.'

export function Start({ onEntered, onWords, connecting = false, noPasskey = false }: Props) {
  // Read at each draw: a passkey made here is known from the moment it answers (flows/start.ts).
  const known = passkeys()
  // What Start's place says, in place of its button.
  const [asked, setAsked] = useState<Open | null>(noPasskey ? 'none' : null)
  // The passkey that let the person in, while Save a passkey on this device? or This passkey has never been verified waits, and where it stands.
  const [met, setMet] = useState<{ id: string; entered: Entered } | null>(null)
  // Whether passkeys can work in this browser: unknown until it says.
  const [works, setWorks] = useState<boolean | null>(null)
  useEffect(() => {
    dropSeed()
    let live = true
    void passkeysWork().then((w) => live && setWorks(w))
    return () => void (live = false)
  }, [])

  /** A passkey answered: the seed it stands for held, and where the person stands. From another device, Save a passkey on this device? first; one met here whose seed was never verified, its question. */
  const entered = async (passkey: Passkey, from: { elsewhere?: boolean; made?: boolean }) => {
    if (from.made) madeThisVisit.add(passkey.id)
    hold(passkey.id, passkey.seed)
    const to = await withSeed(passkey.id, (seed) => enter(config, { id: passkey.id, seed }, proveInWorker))
    if (to.to === 'profiles' && from.elsewhere && !connecting) {
      setMet({ id: passkey.id, entered: to })
      return setAsked('save')
    }
    if (to.to === 'verify' && to.never && !madeThisVisit.has(passkey.id)) {
      setMet({ id: passkey.id, entered: to })
      return setAsked('never')
    }
    onEntered(to, passkey.id)
  }

  /** `allow`, the passkeys asked for, else any Forest passkey; none, or its window closed: `nothing` says so. */
  const asker = (nothing: Open, any: boolean) =>
    useAction(async () => {
      let answered
      try {
        answered = await ask(!any && known.length ? { allow: known } : {})
      } catch (err) {
        if (err instanceof NoAnswer) return setAsked(nothing)
        throw err
      }
      await entered({ id: answered.id, seed: await follow(config.host, answered.seed) }, { elsewhere: answered.elsewhere === true })
    })
  const starting = asker('nothing', false)
  const already = asker('none', true)

  const making = useAction(async () => {
    try {
      const made = await make({ exclude: known })
      const maker = makerOf(made.aaguid)
      noteMade(FIRST, { ...(maker && { maker }) })
      await entered(made, { made: true })
    } catch (err) {
      if (err instanceof SameManager) throw new Said(KEPT_ALREADY, true)
      if (!(err instanceof NoAnswer)) throw err
    }
  })

  const save = useAction(async () => {
    await addPasskey({ here: true })
    onEntered(met!.entered, met!.id)
  })
  const notNow = () => onEntered(met!.entered, met!.id)

  /** Delete passkey: the browser told it's gone, this device's Forest forgotten, and this passkey with it, so Start never asks for it again. */
  const remove = useAction(async () => {
    const id = met!.id
    await drop(id)
    forgetDevice()
    unknowPasskey(id)
    setMet(null)
    setAsked(null)
  })

  const actions = [starting, already, making, save, remove]
  const busy = actions.some((a) => a.busy)
  const note = actions.map((a) => a.note).find((n) => n) ?? null
  /** Back to Start's button, what was said gone with it. */
  const back = () => {
    for (const a of actions) a.setNote(null)
    setAsked(null)
  }

  return (
    <main className="start">
      {asked === 'nothing' && (
        <div className="top">
          <button type="button" className="round on-start" aria-label="Back" disabled={busy} onClick={back}>
            <Icon name="arrow-left" />
          </button>
        </div>
      )}
      <div className="fill" />
      <div className="brand">
        <Mark size={120} />
        <h1>
          <Wordmark />
        </h1>
      </div>
      <div className="fill" />
      {works === false ? (
        <NoPasskeys />
      ) : (
        <>
          {!asked && (
            <div className="stack">
              <Line note={note} />
              <button className="cream" disabled={busy || works === null} onClick={() => starting.run()}>
                {starting.busy ? <Loader /> : 'Start'}
              </button>
            </div>
          )}
          {asked === 'nothing' && (
            <Asked title="Start found nothing">
              <Line note={note} />
              <div className="stack">
                <button className="cream" disabled={busy} onClick={() => making.run()}>
                  {making.busy ? <Loader /> : "I'm new"}
                </button>
                <button className="ghost" disabled={busy} onClick={() => already.run()}>
                  {already.busy ? <Loader /> : 'I already use Forest'}
                </button>
              </div>
            </Asked>
          )}
          {asked === 'none' && (
            <Asked title="No passkey found">
              <p>Try again with the device that has it, or type your 24 words.</p>
              <Line note={note} />
              <div className="stack">
                <button className="cream" disabled={busy} onClick={() => already.run()}>
                  {already.busy ? <Loader /> : <><Icon name="qr-code" bold /> Try again</>}
                </button>
                <button className="ghost" disabled={busy} onClick={onWords}>
                  Type my 24 words
                </button>
                <button className="quiet" disabled={busy} onClick={back}>
                  Back
                </button>
              </div>
            </Asked>
          )}
          {asked === 'never' && (
            <Asked title="This passkey has never been verified">
              <p>Verified with another passkey? Delete this one.</p>
              <Line note={note} />
              <div className="stack">
                <button className="cream" disabled={busy} onClick={() => onEntered(met!.entered, met!.id)}>
                  Continue to verification
                </button>
                <button className="danger solid" disabled={busy} onClick={() => remove.run()}>
                  {remove.busy ? <Loader /> : 'Delete passkey'}
                </button>
              </div>
            </Asked>
          )}
          {asked === 'save' && (
            <Asked title="Save a passkey on this device?">
              <Line note={note} />
              <div className="stack">
                <button className="cream" disabled={busy} onClick={() => save.run()}>
                  {save.busy ? <Loader /> : <><UnlockIcon always /> Save</>}
                </button>
                <button className="ghost" disabled={busy} onClick={notNow}>
                  Not now
                </button>
              </div>
            </Asked>
          )}
        </>
      )}
    </main>
  )
}

/** What Start says, in its own place, where its button was: a title, then its ways on. */
export function Asked({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="asked" aria-label={title}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

/** Passkeys don't work here: open Forest in another browser, its address one tap away. */
export function NoPasskeys() {
  const [copied, setCopied] = useState(false)
  const copy = useAction(async () => {
    await navigator.clipboard.writeText(location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  })
  return (
    <Asked title="Passkeys don't work here">
      <p>Open Forest in a different browser.</p>
      <Line note={copy.note} />
      <div className="stack">
        <button className="cream" onClick={() => copy.run()}>
          <Icon name={copied ? 'check' : 'copy'} bold /> {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </Asked>
  )
}

/** Start's ground, with the mark and Forest, around what a screen of Start's says: Passkeys don't work here, where a page that would ask a passkey opens in a browser that can't. */
export function OnStart({ children }: { children: ReactNode }) {
  return (
    <main className="start">
      <div className="fill" />
      <div className="brand">
        <Mark size={120} />
        <h1>
          <Wordmark />
        </h1>
      </div>
      <div className="fill" />
      {children}
    </main>
  )
}
