// A passkey more, from + Add a passkey in You, or Save a passkey on
// this device: one unlock (or the seed held), then a new passkey, named Forest, the passkeys this
// device knows excluded, so the same manager doesn't keep a second one; then it is added to the
// person's seed (flows/backups.ts). One made that couldn't be added is one its manager is asked to
// drop. Saved on this device (`here`), it is the passkey in use here from then, holding the same
// seed, so the next unlocks ask it rather than the phone that answered at Start.

import { config } from './config.ts'
import { passkey, passkeys, usePasskey } from './device.ts'
import { addBackup } from './flows/backups.ts'
import { moveTo } from './held.ts'
import { backupsChanged } from './hooks.ts'
import { drop, make, withSeed } from './passkey.ts'

export async function addPasskey({ here = false }: { here?: boolean } = {}): Promise<void> {
  await withSeed(passkey()!, async (seed) => {
    const made = await make({ exclude: passkeys() })
    try {
      await addBackup(config, seed, made)
    } catch (err) {
      await drop(made.id)
      throw err
    }
    if (here) {
      usePasskey(made.id)
      moveTo(made.id)
    }
  })
  backupsChanged()
}
