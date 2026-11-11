// Start: the deep green, the mark, Forest, and one cream button, Start. On a device that knows a
// Forest passkey (any id it keeps), Start asks for those alone, so nobody makes a second one by
// mistake. On a device that knows none, Start opens a sheet, First time here?: Yes, I'm new makes
// the passkey (then Get verified); I use Forest on another device asks for any Forest passkey, one
// synced here or, through the QR code the browser's own sheet shows, one on a device that doesn't
// sync with this one. Reached from a connect page, the second comes first, the primary: an AI app's
// login often opens in a browser that has never seen this app, where the person almost always has a
// passkey already, and a second would be a second Forest.
//
// A browser can't tell a closed passkey sheet from no passkey, so either way the sheet becomes No
// passkey found, with Try again, which asks the same again, and Type my 24 words (ImportWords.tsx),
// the one door to the words: it opens a Forest that is there already, never a second one. A
// passkey that answered from another device (a phone through the QR code), letting a verified
// person in, brings one more sheet, once: Save a passkey on this device?, so each unlock here
// doesn't ask that phone again; Save makes one here and adds it, the one in use here from then
// (adding.ts); Not now goes on. Not while an AI app's login waits: the person goes straight back to
// it.
//
// Every button on Start and its sheets asks the passkey, so none shows the unlock icon; Save does,
// its one button that asks where the one beside it doesn't. Nobody is in yet, so Start drops any
// seed still held (held.ts) as it opens. The seed a passkey gives is held from then, as after any
// unlock, so the verification and the first profile ask again only once 5 minutes went by with
// nothing done. A passkey that answers is followed first: one added to a first names the person's
// seed in its seed entry, and that one is held (flows/seed.ts). A passkey just made names none: it
// is a first passkey, made for this device, which the device notes with its manager's name, for
// Passkeys (device.ts).

import { useEffect, useState } from 'react'

import { addPasskey } from '../adding.ts'
import { config } from '../config.ts'
import { FIRST, noteMade, passkeys } from '../device.ts'
import { follow } from '../flows/seed.ts'
import { type Entered, enter } from '../flows/start.ts'
import { drop, hold } from '../held.ts'
import { Icon } from '../icons.tsx'
import { makerOf } from '../managers.ts'
import { Loader, Mark } from '../mark.tsx'
import { NoAnswer, type Passkey, ask, make, withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Sheet, UnlockIcon, useAction } from '../ui.tsx'

type Props = {
  onEntered: (entered: Entered, passkey: string) => void
  onWords: () => void
  /** An AI app's login waits: I use Forest on another device first, and no Save a passkey on this device?. */
  connecting?: boolean
  /** Back from Your 24 words: No passkey found, open. */
  noPasskey?: boolean
}

type Open = 'first' | 'none' | 'save'

export function Start({ onEntered, onWords, connecting = false, noPasskey = false }: Props) {
  // Read at each draw: a passkey made here is known from the moment it answers (flows/start.ts).
  const known = passkeys()
  const [sheet, setSheet] = useState<Open | null>(noPasskey ? 'none' : null)
  // The passkey that let the person in, while Save a passkey on this device? waits.
  const [saving, setSaving] = useState<string | null>(null)
  useEffect(drop, [])

  /** A passkey answered: the seed it stands for held, and where the person stands; from another device, Save a passkey on this device? first. */
  const entered = async (passkey: Passkey, elsewhere: boolean) => {
    hold(passkey.id, passkey.seed)
    const to = await withSeed(passkey.id, (seed) => enter(config, { id: passkey.id, seed }, proveInWorker))
    if (to.to === 'profiles' && elsewhere && !connecting) {
      setSaving(passkey.id)
      return setSheet('save')
    }
    onEntered(to, passkey.id)
  }

  /** The passkeys this device knows asked for, else any Forest passkey; none, or the sheet closed: No passkey found. */
  const asking = useAction(async () => {
    let answered
    try {
      answered = await ask(known.length ? { allow: known } : {})
    } catch (err) {
      if (err instanceof NoAnswer) return setSheet('none')
      throw err
    }
    await entered({ id: answered.id, seed: await follow(config.host, answered.seed) }, answered.elsewhere === true)
  })

  const making = useAction(async () => {
    try {
      const made = await make()
      const maker = makerOf(made.aaguid)
      noteMade(FIRST, { ...(maker && { maker }) })
      await entered(made, false)
    } catch (err) {
      if (!(err instanceof NoAnswer)) throw err
    }
  })

  const save = useAction(async () => {
    await addPasskey({ here: true })
    onEntered({ to: 'profiles' }, saving!)
  })
  const notNow = () => onEntered({ to: 'profiles' }, saving!)

  const busy = asking.busy || making.busy || save.busy
  const note = asking.note ?? making.note ?? save.note
  const close = () => {
    if (busy) return
    if (sheet === 'save') return notNow()
    asking.setNote(null)
    making.setNote(null)
    setSheet(null)
  }

  const imNew = (
    <button key="new" className={connecting ? undefined : 'primary'} disabled={busy} onClick={() => making.run()}>
      {making.busy ? <Loader /> : "Yes, I'm new"}
    </button>
  )
  const elsewhere = (
    <button key="elsewhere" className={connecting ? 'primary' : undefined} disabled={busy} onClick={() => asking.run()}>
      {asking.busy ? <Loader /> : <><Icon name="qr-code" /> I use Forest on another device</>}
    </button>
  )

  return (
    <main className="start">
      <div className="fill" />
      <div className="brand">
        <Mark size={120} />
        <h1>Forest</h1>
      </div>
      <div className="fill" />
      {!sheet && <Line note={note} />}
      <button className="cream" disabled={busy} onClick={() => (known.length ? asking.run() : setSheet('first'))}>
        {asking.busy && !sheet ? <Loader /> : 'Start'}
      </button>
      {sheet === 'first' && (
        <Sheet label="First time here?" onClose={close}>
          <h2>First time here?</h2>
          <Line note={note} />
          <div className="stack">{connecting ? [elsewhere, imNew] : [imNew, elsewhere]}</div>
        </Sheet>
      )}
      {sheet === 'none' && (
        <Sheet label="No passkey found" onClose={close}>
          <h2>No passkey found</h2>
          <p>Try again with the device that has it, or type your 24 words.</p>
          <Line note={note} />
          <div className="stack">
            <button className="primary" disabled={busy} onClick={() => asking.run()}>
              {asking.busy ? <Loader /> : <><Icon name="qr-code" bold /> Try again</>}
            </button>
            <button className="quiet" disabled={busy} onClick={onWords}>
              Type my 24 words
            </button>
          </div>
        </Sheet>
      )}
      {sheet === 'save' && (
        <Sheet label="Save a passkey on this device?" onClose={close}>
          <h2>Save a passkey on this device?</h2>
          <Line note={note} />
          <div className="stack">
            <button className="primary" disabled={busy} onClick={() => save.run()}>
              {save.busy ? <Loader /> : <><UnlockIcon always /> Save</>}
            </button>
            <button className="quiet" disabled={busy} onClick={notNow}>
              Not now
            </button>
          </div>
        </Sheet>
      )}
    </main>
  )
}
