// What every unlock does by itself, once the seed is held, in the background, asking nothing and
// restarting none of its 15 minutes: it reads the Profiles folder, free at the host, as Start does
// (flows/profiles.ts), so the device keeps when each profile was made, the names the person gave
// and the morning email; how they are verified, with each ID stamp's kind, country and end
// (flows/verify.ts, `noteChecks`), so Your checks shows them with nothing unlocked; and the profiles
// made on another device (flows/elsewhere.ts), which then show on Home with no Sync profiles. Home's
// Sync profiles, the person's own tap, does the same, the one read shared when both run at once. A
// read that failed is tried again at the next unlock.

import { config } from './config.ts'
import { passkey } from './device.ts'
import { keepElsewhere } from './flows/elsewhere.ts'
import { openProfiles } from './flows/profiles.ts'
import { noteChecks } from './flows/verify.ts'
import { ifHeld, isHeldFor, onHeld } from './held.ts'

/** The read under way, shared by the unlock's own and Sync profiles. */
let reading: Promise<void> | null = null

/** The Profiles folder read with `seed`, and what it holds kept on the device. */
export function sync(seed: Uint8Array): Promise<void> {
  reading ??= (async () => {
    const folder = await openProfiles(seed, config.host)
    await keepElsewhere(seed, folder.labels)
    await noteChecks(config, folder.held)
  })().finally(() => (reading = null))
  return reading
}

/** Whether a seed was held when last told: an unlock is a seed held after none. */
let was = false

onHeld(() => {
  const id = passkey()
  const now = !!id && isHeldFor(id)
  const unlocked = now && !was
  was = now
  if (unlocked) void ifHeld(id!, sync).catch(() => undefined)
})
