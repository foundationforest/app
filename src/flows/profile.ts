// A new profile, `<market>/<role>`, as the reference app makes it (services' mcp/test/app.ts,
// `addProfile`), its folder funded first (its `fund`): one credit from the wallet into the new
// folder, since a folder's first entry costs a write; the profile entry, with its market and role,
// its host, its main key's open key (so it takes messages), both pay addresses, and a verification
// for each stamp the Profiles folder holds, made on the device; then its label in the Profiles
// folder. When the host refuses a write for its price, one more credit goes in and it is written
// again. The device keeps its label and address.

import { type Body, entry, nextTime } from '@foundationforest/folders'
import { mainKey, openingHalf, payAddresses } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { type Profile, addProfile } from '../device.ts'
import { NoCredits, fund } from '../services/credits.ts'
import { NotWritten, readView, writeAll } from '../services/host.ts'
import { addTo, openProfiles } from './profiles.ts'

/** A verification of `stamp` (the Profiles folder's JSON text of it) for `label`, made from the seed: the fields the profile entry carries beside `circuit`. */
export type Prove = (seed: Uint8Array, stamp: string, label: string) => Promise<{ verifier: string; verifierName: string; label: string; proof: string }>

/** How many times a write refused for its price is funded with one more credit and sent again. */
const TOP_UPS = 3

export async function makeProfile(s: Services, seed: Uint8Array, label: string, prove: Prove): Promise<Profile> {
  const [market, role] = label.split('/') as [string, string]
  const folder = await openProfiles(seed, s.host)
  const main = await mainKey(seed, label)
  const proofs: Body[] = []
  for (const stamp of folder.stamps) proofs.push({ circuit: 'verification', ...(await prove(seed, stamp, label)) })
  const body: Body = {
    market,
    role,
    hosts: [s.host],
    openKey: (await openingHalf(main.secret)).openKey,
    pay: { ...(await payAddresses(seed, label)) },
    ...(proofs.length > 0 && { proofs }),
  }
  const view = await readView(s.host, main.address)
  if (view.current.size === 0) await fund(s.host, main.address, 1, folder.key)
  for (let tries = 0; ; tries++) {
    try {
      await writeAll(s.host, [entry(main, 'profile', body, nextTime(Date.now(), view, 'profile'))])
      break
    } catch (err) {
      if (!(err instanceof NotWritten && err.code === 'refused') || tries === TOP_UPS) throw err instanceof NotWritten && err.code === 'refused' ? new NoCredits() : err
      await fund(s.host, main.address, 1, folder.key)
    }
  }
  if (!folder.labels.includes(label)) await addTo(folder, s.host, 'label', { label, time: Date.now() })
  const made = { label, address: main.address }
  addProfile(made)
  return made
}

