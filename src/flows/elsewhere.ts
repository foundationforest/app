// Profiles made on another device with the same seed. The device keeps the Profiles folder's address
// and the label entries it has read there, each with its label (device.ts). Anyone lists a folder's
// entries, so with nothing unlocked the app tells a new one: a label entry this device never read,
// or one whose label it doesn't list. One unlock reads them, as Start does: the Profiles folder
// opened, each label's main key mixed for its address, and the profiles kept beside those listed.
// Each is new to this device, so marked at what it holds when first read, as on a new device. A label
// in a market the directory no longer lists is never new: the device forgets those (markets.ts).

import { mainKey } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { type Folder, type Profile, profiles, saveProfiles } from '../device.ts'
import { listed } from '../markets.ts'
import { readView } from '../services/host.ts'
import { labelId, labelPaths, openProfiles } from './profiles.ts'

/** The ids of the label entries the Profiles folder at `address` holds now, as the host lists them: nothing unlocked. */
export async function labelIds(host: string, address: string): Promise<string[]> {
  return labelPaths(await readView(host, address)).map(labelId)
}

/** Whether one of `ids` is a profile made elsewhere: a label entry never read here, or read with a label `held` lacks, in a market the directory lists. */
export function anyNew(ids: string[], kept: Folder, held: Set<string>): boolean {
  return ids.some((id) => !(id in kept.labels) || (kept.labels[id] !== '' && !held.has(kept.labels[id]!) && listed(kept.labels[id]!)))
}

/** The profiles made elsewhere, read with the seed and kept on the device beside those it lists. Gives back those it did not list. */
export async function takeElsewhere(s: Services, seed: Uint8Array): Promise<Profile[]> {
  const { labels } = await openProfiles(seed, s.host)
  const held = new Set(profiles().map((p) => p.label))
  const found = await Promise.all(labels.filter((label) => !held.has(label) && listed(label)).map(async (label) => ({ label, address: (await mainKey(seed, label)).address })))
  saveProfiles([...profiles(), ...found])
  return found
}
