// AI apps connected in another browser with the same seed, found here by themselves, as names given
// elsewhere are: a profile entry this page has read (Home reads every one, for the badges) that
// lists an access key this device doesn't know means one was made there. Then the next unlock reads
// them (flows/connections.ts, `findConnections`) in the background, with the seed it holds, asking
// nothing and restarting none of its 5 minutes. What that reads: each profile's folder, one after
// another, and each connection folder their notes name; reads are free at the host, and nothing is
// written. Every key listed is known from then, so it runs once; a read that failed runs at the
// next unlock again.

import { config } from './config.ts'
import { knownKeys, passkey, profiles } from './device.ts'
import { findConnections } from './flows/connections.ts'
import { ifHeld, isHeldFor, onHeld } from './held.ts'

/** Whether a profile entry read in this page listed a key this device doesn't know. */
let unknown = false

/** The access keys a profile entry lists now, as read: one this device doesn't know marks AI apps to find at the next unlock. */
export function sawKeys(keys: string[]): void {
  const known = new Set(knownKeys())
  if (keys.some((k) => !known.has(k))) unknown = true
}

/** Whether AI apps wait to be found at the next unlock. */
export const toFind = (): boolean => unknown

onHeld(() => {
  const id = passkey()
  if (!unknown || !id || !isHeldFor(id)) return
  unknown = false
  void ifHeld(id, (seed) => findConnections(config, seed, profiles().map((p) => p.label))).catch(() => {
    unknown = true
  })
})
