// Start: one button. It asks for a Forest passkey first, any the person's managers hold, synced from
// another device or answered by a phone through the sheet's QR code; where the browser can ask
// without the sheet (immediate mediation), a device with none goes straight on. Only when none
// answers does the screen offer Make one, which never makes a passkey where the manager holds one
// this device knows. After an ask without the sheet, Use another device asks again with it.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkeys } from '../device.ts'
import { type Entered, enter } from '../flows/start.ts'
import { Mark } from '../mark.tsx'
import { HasPasskey, NoAnswer, type Passkey, ask, asksQuietly, make } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Spinner, UnlockIcon, useAction } from '../ui.tsx'

type Props = { onEntered: (entered: Entered, passkey: Passkey) => void }

export function Start({ onEntered }: Props) {
  // No passkey answered: whether the ask was without the sheet, so the QR code is still to offer.
  const [none, setNone] = useState<{ quietly: boolean } | null>(null)

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

  const start = useAction(async (sheet: boolean) => {
    const known = passkeys()
    const quietly = !sheet && (await asksQuietly())
    try {
      await entered(await ask(quietly ? { quietly } : { allow: known }))
    } catch (err) {
      if (!(err instanceof NoAnswer)) throw err
      setNone({ quietly })
    }
  })

  const makeOne = useAction(async () => {
    try {
      await entered(await make(passkeys()))
    } catch (err) {
      if (err instanceof NoAnswer) return
      if (err instanceof HasPasskey) setNone(null)
      throw err
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
      {none ? (
        <>
          <p className="line">No Forest passkey here.</p>
          <button className="primary" disabled={busy} onClick={() => makeOne.run()}>
            {makeOne.busy ? <Spinner /> : <><UnlockIcon /> Make one</>}
          </button>
          {none.quietly && (
            <button className="quiet" disabled={busy} onClick={() => start.run(true)}>
              Use another device
            </button>
          )}
        </>
      ) : (
        <button className="primary" disabled={busy} onClick={() => start.run(false)}>
          {start.busy ? <Spinner /> : <><UnlockIcon /> Start</>}
        </button>
      )}
    </main>
  )
}
