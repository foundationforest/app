// The seed a passkey stands for (folders/README.md, The seed entry). A backup passkey's own seed has
// a Profiles folder whose seed entry, at `seed`, holds the seed it is a backup of: the app uses that
// one instead, and finds its profiles as usual. One step only: the seed it holds is never followed
// again, so none loops. Every unlock follows it (passkey.ts), not only Start, since a backup can be
// linked or removed from another device at any time. A passkey that opens a seed other than the one
// this device's Profiles folder belongs to (a backup removed since) goes no further, in one line.

import { SEED_PATH, seedOf } from '@foundationforest/folders/locked'
import { openingHalf } from '@foundationforest/keys'

import { folder } from '../device.ts'
import { readView } from '../services/host.ts'
import { Said } from '../words.ts'
import { walletKey } from './profiles.ts'

/** The passkey opened a seed other than the one whose profiles this device lists. */
export class NotYours extends Said {
  constructor() {
    super('This passkey no longer opens your profiles.', true)
    this.name = 'NotYours'
  }
}

/** The seed `seed`'s Profiles folder's seed entry holds, if it holds one that checks (`seedOf`); else `seed` itself. A seed followed is zeroed. */
export async function follow(host: string, seed: Uint8Array): Promise<Uint8Array> {
  const key = await walletKey(seed)
  const view = await readView(host, key.address)
  const held = await seedOf(view.current.get(SEED_PATH)?.entry.body, (await openingHalf(key.secret)).identity)
  if (!held) return seed
  seed.fill(0)
  return held
}

/** The seed for an action, from the secret a passkey just gave: followed, and checked to be the one whose profiles this device lists, when it lists any. */
export async function seedFor(host: string, secret: Uint8Array): Promise<Uint8Array> {
  const seed = await follow(host, secret)
  const kept = folder()
  if (kept && kept.address !== (await walletKey(seed)).address) {
    seed.fill(0)
    throw new NotYours()
  }
  return seed
}
