// Start. On a device that knows a Forest passkey (any id it keeps), one button, Start, which asks for
// those alone, and never Create a passkey: so nobody makes a second one by mistake. On a device that
// knows none, two buttons at once, no sheet first: Create a passkey, or I already have one, the
// sheet, which finds a passkey synced from another device, or, through its QR code, one on a device
// that doesn't sync with this one. A browser can't tell a closed sheet from no passkey, so a closed
// sheet says neither: "No passkey chosen.", and the same ask again. Reached from a connect page, I
// already have one comes first, the primary, and Create a passkey under it: an AI app's login often
// opens in a browser that has never seen this app (a fresh tab, the AI app's sign-in sheet), where
// the person almost always has a passkey already, and a second would be a second Forest.

import { config } from '../config.ts'
import { passkeys } from '../device.ts'
import { type Entered, enter } from '../flows/start.ts'
import { Mark } from '../mark.tsx'
import { NoAnswer, type Passkey, ask, make } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Spinner, UnlockIcon, useAction } from '../ui.tsx'

type Props = { onEntered: (entered: Entered, passkey: Passkey) => void; connecting?: boolean }

export function Start({ onEntered, connecting = false }: Props) {
  // Read at each draw: a passkey made here is known from the moment it answers (flows/start.ts).
  const known = passkeys()

  /** A passkey answered: where the person stands. The seed goes on with them only to the verification. */
  const entered = async (passkey: Passkey) => {
    try {
      const to = await enter(config, passkey, proveInWorker)
      if (to.to !== 'verify') passkey.seed.fill(0)
      onEntered(to, passkey)
    } catch (err) {
      passkey.seed.fill(0)
      throw err
    }
  }

  const start = useAction(async () => entered(await ask(known.length ? { allow: known } : {})))

  const makeOne = useAction(async () => {
    try {
      await entered(await make())
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
          {start.busy ? <Spinner /> : <><UnlockIcon /> {start.note ? 'Try again' : 'Start'}</>}
        </button>
      ) : connecting ? (
        <>
          <button className="primary" disabled={busy} onClick={() => start.run()}>
            {start.busy ? <Spinner /> : <><UnlockIcon /> I already have one</>}
          </button>
          <button className="quiet" disabled={busy} onClick={() => makeOne.run()}>
            {makeOne.busy ? <Spinner /> : 'Create a passkey'}
          </button>
        </>
      ) : (
        <>
          <button className="primary" disabled={busy} onClick={() => makeOne.run()}>
            {makeOne.busy ? <Spinner /> : <><UnlockIcon /> Create a passkey</>}
          </button>
          <button className="quiet" disabled={busy} onClick={() => start.run()}>
            {start.busy ? <Spinner /> : 'I already have one'}
          </button>
        </>
      )}
    </main>
  )
}
