// New to Forest?, between Start and Get verified, for a passkey that opens a seed with no stamp and
// nothing under way: one just made with Create a passkey, or one made earlier and left so. Yes, I'm
// new goes on to Get verified. I already use Forest is for a passkey made by mistake: the passkey the
// person uses asked for on the sheet (any of theirs, on this device or, through its QR code, on
// another), followed if it is itself a passkey added to a first (flows/seed.ts), and this one added
// to it (flows/backups.ts, `linkTo`), keeping its manager's name when it sent one; then the seed it
// opens is held for this one, which stays the one in use here, and the person is straight in, as
// from Start. Back goes to Start. It has no path of its own: a reload lands on Start, which comes
// back here.

import { config } from '../config.ts'
import { knowPasskey } from '../device.ts'
import { linkTo } from '../flows/backups.ts'
import { follow } from '../flows/seed.ts'
import { type Entered, enter } from '../flows/start.ts'
import { hold } from '../held.ts'
import { ask, withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'

type Props = {
  /** The passkey that opened a seed with no stamp. */
  id: string
  /** Its manager's AAGUID, when it was just made and sent one. */
  aaguid?: string
  onNew: () => void
  onIn: (entered: Entered) => void
  onBack: () => void
}

export function NewHere({ id, aaguid, onNew, onIn, onBack }: Props) {
  const using = useAction(async () => {
    const seed = await withSeed(id, async (own) => {
      const answered = await ask()
      const main = await follow(config.host, answered.seed)
      try {
        await linkTo(config, own, main, aaguid)
      } catch (err) {
        main.fill(0)
        throw err
      }
      knowPasskey(answered.id)
      return main
    })
    hold(id, seed)
    onIn(await withSeed(id, (s) => enter(config, { id, seed: s }, proveInWorker)))
  })
  return (
    <main className="start">
      <Top onBack={onBack} />
      <div className="fill" />
      <div className="brand">
        <h1>New to Forest?</h1>
      </div>
      <div className="fill" />
      <Line note={using.note} />
      <button className="primary" disabled={using.busy} onClick={onNew}>
        Yes, I'm new
      </button>
      <button className="quiet" disabled={using.busy} onClick={() => using.run()}>
        {using.busy ? <Spinner /> : <><UnlockIcon always /> I already use Forest</>}
      </button>
    </main>
  )
}
