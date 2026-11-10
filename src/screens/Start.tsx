// Start. On a device that knows a Forest passkey (any id it keeps), one button, Start, which asks for
// those alone, and never Create a passkey: so nobody makes a second one by mistake. On a device that
// knows none, two buttons at once, no sheet first: Create a passkey, or I already have one, the
// sheet, which finds a passkey synced from another device, or, through its QR code, one on a device
// that doesn't sync with this one. A browser can't tell a closed sheet from no passkey, so a closed
// sheet says neither: "No passkey chosen.", and the same ask again. Reached from a connect page, I
// already have one comes first, the primary, and Create a passkey under it: an AI app's login often
// opens in a browser that has never seen this app (a fresh tab, the AI app's sign-in sheet), where
// the person almost always has a passkey already, and a second would be a second Forest. Last, on
// every Start, a quiet I have 24 words, which opens a seed from its words (ImportWords.tsx): it opens
// a Forest that is there already, never a second one, so it shows where Create a passkey doesn't.
//
// Every button here asks: nobody is in yet, so Start drops any seed still held (held.ts) as it opens.
// The seed a passkey gives is held from then, as after any unlock, so New to Forest?, the
// verification and the first profile ask again only once 5 minutes went by with nothing done. A
// passkey that answers is followed first: one added to a first names the person's seed in its seed
// entry, and that one is held (flows/seed.ts). A passkey just made names none. What Start tells the
// app besides where the person stands: whether the passkey was just made, with its manager's
// AAGUID, and whether it answered from another device (passkey.ts).

import { useEffect } from 'react'

import { config } from '../config.ts'
import { passkeys } from '../device.ts'
import { follow } from '../flows/seed.ts'
import { type Entered, enter } from '../flows/start.ts'
import { drop, hold } from '../held.ts'
import { Loader, Mark } from '../mark.tsx'
import { NoAnswer, type Passkey, ask, make, withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, UnlockIcon, useAction } from '../ui.tsx'

/** How the passkey that let the person in came: just made here (with its manager's AAGUID when it sent one), or from another device. */
export type How = { made?: { aaguid?: string }; elsewhere?: boolean }

type Props = { onEntered: (entered: Entered, passkey: string, how: How) => void; onWords: () => void; connecting?: boolean }

export function Start({ onEntered, onWords, connecting = false }: Props) {
  // Read at each draw: a passkey made here is known from the moment it answers (flows/start.ts).
  const known = passkeys()
  useEffect(drop, [])

  /** A passkey answered: the seed it stands for held, and where the person stands. */
  const entered = async (passkey: Passkey, how: How) => {
    hold(passkey.id, passkey.seed)
    const to = await withSeed(passkey.id, (seed) => enter(config, { id: passkey.id, seed }, proveInWorker))
    onEntered(to, passkey.id, how)
  }

  const start = useAction(async () => {
    const answered = await ask(known.length ? { allow: known } : {})
    await entered({ id: answered.id, seed: await follow(config.host, answered.seed) }, answered.elsewhere ? { elsewhere: true } : {})
  })

  const makeOne = useAction(async () => {
    try {
      const made = await make()
      await entered(made, { made: made.aaguid ? { aaguid: made.aaguid } : {} })
    } catch (err) {
      if (!(err instanceof NoAnswer)) throw err
    }
  })

  const busy = start.busy || makeOne.busy
  return (
    <main className="start">
      <div className="fill" />
      <div className="brand">
        <Mark size={72} />
        <h1>Forest</h1>
      </div>
      <div className="fill" />
      <Line note={start.note ?? makeOne.note} />
      {known.length ? (
        <button className="primary" disabled={busy} onClick={() => start.run()}>
          {start.busy ? <Loader /> : <><UnlockIcon /> {start.note ? 'Try again' : 'Start'}</>}
        </button>
      ) : connecting ? (
        <>
          <button className="primary" disabled={busy} onClick={() => start.run()}>
            {start.busy ? <Loader /> : <><UnlockIcon /> I already have one</>}
          </button>
          <button className="quiet" disabled={busy} onClick={() => makeOne.run()}>
            {makeOne.busy ? <Loader /> : 'Create a passkey'}
          </button>
        </>
      ) : (
        <>
          <button className="primary" disabled={busy} onClick={() => makeOne.run()}>
            {makeOne.busy ? <Loader /> : <><UnlockIcon /> Create a passkey</>}
          </button>
          <button className="quiet" disabled={busy} onClick={() => start.run()}>
            {start.busy ? <Loader /> : 'I already have one'}
          </button>
        </>
      )}
      <button className="quiet" disabled={busy} onClick={onWords}>
        I have 24 words
      </button>
    </main>
  )
}
