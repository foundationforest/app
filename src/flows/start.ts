// Start, once a passkey has answered: the device knows it from now, and the person's Profiles folder
// says where they stand. Verified: it is the passkey in use here, the device keeps their profiles'
// labels and addresses and their AI apps, found from the seed as the reference app finds them (so a
// new device lists them), and the Profiles screen opens. Not yet: the verification takes up where it
// stopped, and the passkey is in use once it ends.

import { mainKey } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { knowPasskey, saveProfiles, usePasskey } from '../device.ts'
import type { Passkey } from '../passkey.ts'
import { type Where, findConnections } from './connections.ts'
import type { Prove } from './profile.ts'
import { type Step, resume } from './verify.ts'

export type Entered = { to: 'profiles' } | { to: 'verify'; step: Step }

/** Where the person goes after Start. The seed is the caller's, which zeroes it once the person is past the verification. */
export async function enter(s: Services & Where, passkey: Passkey, prove: Prove): Promise<Entered> {
  knowPasskey(passkey.id)
  const r = await resume(s, passkey.id, passkey.seed, prove)
  if (!r.verified) return { to: 'verify', step: r.step }
  const profiles = await Promise.all(r.labels.map(async (label) => ({ label, address: (await mainKey(passkey.seed, label)).address })))
  await findConnections(s, passkey.seed, r.labels)
  usePasskey(passkey.id)
  saveProfiles(profiles)
  return { to: 'profiles' }
}
