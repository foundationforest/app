// Start, once a passkey has answered: the device knows it from now, and the person's Profiles folder
// says where they stand. Verified: it is the passkey in use here, the device keeps their profiles'
// labels and addresses (those in a market the directory lists) and their AI apps, found from the
// seed as the reference app finds them (so a new device lists them), and the person is in. Not yet:
// the verification takes up where it stopped, and the passkey is in use once it ends; a seed whose
// Profiles folder holds no stamp and no profile at all is `never`, so Start can ask about a passkey
// met there that was never verified. Someone whose stamps all come from keys the verifier no longer
// signs with has their profiles and AI apps listed as if verified, then goes to Get verified, which
// says their earlier check no longer counts; once they check again, Continue takes them to Home.
// A test account, from its words, is in at once, with no verification (`enterTest`).

import { mainKey } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { knowPasskey, saveProfiles, usePasskey, useTestAccount } from '../device.ts'
import { listed } from '../markets.ts'
import type { Passkey } from '../passkey.ts'
import { type Where, findConnections } from './connections.ts'
import type { Prove } from './profile.ts'
import { openProfiles } from './profiles.ts'
import { type Step, resume } from './verify.ts'

export type Entered = { to: 'profiles' } | { to: 'verify'; step: Step; again?: true; never?: true }

/** Where the person goes after Start. The seed is the caller's, held in the page as after any unlock (held.ts). */
export async function enter(s: Services & Where, passkey: Passkey, prove: Prove): Promise<Entered> {
  knowPasskey(passkey.id)
  const r = await resume(s, passkey.id, passkey.seed, prove)
  if (!r.verified && !r.again) return { to: 'verify', step: r.step, ...(r.never && { never: true }) }
  const labels = (r.verified ? r.labels : r.again!.labels).filter(listed)
  const profiles = await Promise.all(labels.map(async (label) => ({ label, address: (await mainKey(passkey.seed, label)).address })))
  await findConnections(s, passkey.seed, labels)
  saveProfiles(profiles)
  if (!r.verified) return { to: 'verify', step: r.step, again: true }
  usePasskey(passkey.id)
  return { to: 'profiles' }
}

/** A test account in, from its words: its profiles and AI apps listed, as Start lists them, and in use here by its id (test-account.ts). The seed is the caller's, held. */
export async function enterTest(s: Services & Where, id: string, seed: Uint8Array): Promise<Entered> {
  const labels = (await openProfiles(seed, s.host)).labels.filter(listed)
  const profiles = await Promise.all(labels.map(async (label) => ({ label, address: (await mainKey(seed, label)).address })))
  await findConnections(s, seed, labels)
  saveProfiles(profiles)
  useTestAccount(id)
  return { to: 'profiles' }
}
