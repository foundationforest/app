// Add a backup: one line on where to keep it, and Create a passkey: one unlock (or the seed held),
// then a new passkey, named Forest, which a manager keeping one of the passkeys this device knows
// refuses, so it goes to another manager, a second phone or a security key. The app then writes it in
// as a backup (flows/backups.ts). A passkey made that couldn't be added is one the manager is asked
// to drop.

import { config } from '../config.ts'
import { passkey, passkeys } from '../device.ts'
import { addBackup } from '../flows/backups.ts'
import { backupsChanged } from '../hooks.ts'
import { drop, make, withSeed } from '../passkey.ts'
import { Line, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'

export function Backup({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const add = useAction(async () => {
    await withSeed(passkey()!, async (seed) => {
      const made = await make({ exclude: passkeys() })
      try {
        await addBackup(config, seed, made)
      } catch (err) {
        await drop(made.id)
        throw err
      }
    })
    backupsChanged()
    onDone()
  })
  return (
    <main>
      <Top onBack={onBack} />
      <h1>Add a backup</h1>
      <p>Save it in another password manager, on a second phone, or on a security key.</p>
      <div className="fill" />
      <Line note={add.note} />
      <button className="primary" disabled={add.busy} onClick={() => add.run()}>
        {add.busy ? <Spinner /> : <><UnlockIcon always /> Create a passkey</>}
      </button>
    </main>
  )
}
