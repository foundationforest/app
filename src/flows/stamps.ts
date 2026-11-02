// Every profile shows every stamp. When the person's Profiles folder holds a stamp a profile entry
// does not show yet (the ID check's, after the face check's), a verification of it is made on the
// device for that profile and added beside the ones the entry has; then the entry is written again,
// as the reference app writes one (its other fields as they were), free at the host, which never
// refuses a later profile entry but for its size.

import { type Body, entry, nextTime, proofsOf } from '@foundationforest/folders'
import { mainKey } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { readView, writeAll } from '../services/host.ts'
import { stamps as standard } from '../services/verifier.ts'
import type { Prove } from './profile.ts'
import type { Opened } from './profiles.ts'

/** The verifier keys a profile entry's verifications are from. */
const shownBy = (body: Body) => new Set(proofsOf(body).filter((p) => p.circuit === 'verification').map((p) => p.verifier))

/** Each profile `folder` lists, made to show each stamp it holds. Gives back how many profile entries were written again. */
export async function showStamps(s: Services, seed: Uint8Array, folder: Pick<Opened, 'labels' | 'stamps'>, prove: Prove): Promise<number> {
  const { stampFromJson } = await standard()
  const held = folder.stamps.map((text) => ({ text, key: stampFromJson(JSON.parse(text)).verifier }))
  let written = 0
  for (const label of folder.labels) {
    const main = await mainKey(seed, label)
    const view = await readView(s.host, main.address)
    const body = view.current.get('profile')?.entry.body
    if (!body) continue
    const shown = shownBy(body)
    const added: Body[] = []
    for (const stamp of held) {
      if (shown.has(stamp.key)) continue
      added.push({ circuit: 'verification', ...(await prove(seed, stamp.text, label)) })
      shown.add(stamp.key)
    }
    if (!added.length) continue
    const proofs = [...((body.proofs as Body[] | undefined) ?? []), ...added]
    await writeAll(s.host, [entry(main, 'profile', { ...body, proofs }, nextTime(Date.now(), view, 'profile'))])
    written++
  }
  return written
}
