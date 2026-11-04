// Save a passkey on this device?, once, right after Start let the person in with a passkey that
// answered from another device (a phone through the sheet's QR code), so each unlock here would ask
// that phone again. Save makes one here and adds it, the one in use here from then (adding.ts); Not
// now goes on. Either way, where Start was taking the person. It has no path of its own, so a reload
// lands on Profiles.

import { addPasskey } from '../adding.ts'
import { Line, Spinner, UnlockIcon, useAction } from '../ui.tsx'

export function SavePasskey({ onDone }: { onDone: () => void }) {
  const save = useAction(async () => {
    await addPasskey({ here: true })
    onDone()
  })
  return (
    <main className="start">
      <div className="fill" />
      <div className="brand">
        <h1>Save a passkey on this device?</h1>
      </div>
      <div className="fill" />
      <Line note={save.note} />
      <button className="primary" disabled={save.busy} onClick={() => save.run()}>
        {save.busy ? <Spinner /> : <><UnlockIcon always /> Save</>}
      </button>
      <button className="quiet" disabled={save.busy} onClick={onDone}>
        Not now
      </button>
    </main>
  )
}
