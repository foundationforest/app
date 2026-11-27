// A profile made from a link (links.ts, `#/<market>/<role>`), which the person's AI handed them:
// made as New profile makes one (profile.ts), then, under the same seed, so in the same unlock,
// given to every AI app the person has connected to this app's connector, as Your AI's Save gives
// one (connections.ts, `actFor`): their AI can use it at once. The AI apps are found from the seed
// first, as Start finds them, so one connected from another browser counts too.

import type { Connection } from '../device.ts'
import { type Where, actFor, findConnections } from './connections.ts'
import { type Prove, makeProfile } from './profile.ts'
import type { Services } from '../config.ts'

/** `label` made, and given to each AI app; gives back the AI apps, which now act for it. */
export async function makeForAi(s: Services & Where, seed: Uint8Array, label: string, prove: Prove): Promise<Connection[]> {
  await makeProfile(s, seed, label, prove)
  const apps = await findConnections(s, seed)
  for (const c of apps) if (!c.labels.includes(label)) await actFor(s, seed, c.address, [label], [])
  return apps
}
