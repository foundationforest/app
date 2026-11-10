// Add a passkey: one line on where to keep it, and Create a passkey: one unlock (or the seed held),
// then a new passkey, which a manager keeping one of the passkeys this device knows refuses, so it
// goes to another manager, a second phone or a security key (adding.ts).

import { addPasskey } from '../adding.ts'
import { Loader } from '../mark.tsx'
import { Line, Top, UnlockIcon, useAction } from '../ui.tsx'

export function AddPasskey({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const add = useAction(async () => {
    await addPasskey()
    onDone()
  })
  return (
    <main>
      <Top onBack={onBack} />
      <h1>Add a passkey</h1>
      <p>Save it in another password manager, on a second phone, or on a security key.</p>
      <div className="fill" />
      <Line note={add.note} />
      <button className="primary" disabled={add.busy} onClick={() => add.run()}>
        {add.busy ? <Loader /> : <><UnlockIcon always /> Create a passkey</>}
      </button>
    </main>
  )
}
