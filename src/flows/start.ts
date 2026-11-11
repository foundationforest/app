// Start, once a passkey has answered: the device knows it from now, and the person's Profiles folder
// says where they stand. Verified: it is the passkey in use here, the device keeps their profiles'
// labels and addresses (those in a market the directory lists) and their AI apps, found from the seed as the reference app finds them (so a
// new device lists them), and the person is in. Not yet: the verification takes up where it
// stopped, and the passkey is in use once it ends; a check that will never pass, found as it is
// taken up, goes with them to Get verified, which says so.

import { mainKey } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { knowPasskey, saveProfiles, usePasskey } from '../device.ts'
import { listed } from '../markets.ts'
import type { Passkey } from '../passkey.ts'
import { type Where, findConnections } from './connections.ts'
import type { Prove } from './profile.ts'
import { NotPassed, type Step, resume, stepOf } from './verify.ts'

export type Entered = { to: 'profiles' } | { to: 'verify'; step: Step; failed?: NotPassed }

/** Where the person goes after Start. The seed is the caller's, held in the page as after any unlock (held.ts). */
export async function enter(s: Services & Where, passkey: Passkey, prove: Prove): Promise<Entered> {
  knowPasskey(passkey.id)
  let r
  try {
    r = await resume(s, passkey.id, passkey.seed, prove)
  } catch (err) {
    if (err instanceof NotPassed) return { to: 'verify', step: stepOf(passkey.id), failed: err }
    throw err
  }
  if (!r.verified) return { to: 'verify', step: r.step }
  const labels = r.labels.filter(listed)
  const profiles = await Promise.all(labels.map(async (label) => ({ label, address: (await mainKey(passkey.seed, label)).address })))
  await findConnections(s, passkey.seed, labels)
  usePasskey(passkey.id)
  saveProfiles(profiles)
  return { to: 'profiles' }
}
