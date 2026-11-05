// What a market outgrew: each entry one of the person's profiles posted that its market's file no
// longer takes as it is (markets' checkEntry, as the index checks one before it lists it), read
// from the profile's folder with nothing unlocked. A listing is checked against its role; a review,
// a vouch or a report against the role of the profile it is about too, read from that profile's
// entry at the host, since a review's fields can be for some roles only. Notifications lists each
// with its Update, whose edit opens with what still fits (form.ts). Read as the places open, and held
// in this page's memory meanwhile, as what the index says is (rated.ts); never stored.

import type { Services } from '../config.ts'
import type { Profile } from '../device.ts'
import { markets, pairOf } from '../markets.ts'
import { readView } from '../services/host.ts'
import { type Posted, entriesOf } from './entries.ts'

/** The role of the profile at `address` in `market`, as its profile entry at the host says; undefined when it has none there. */
async function roleAt(host: string, address: string, market: string): Promise<string | undefined> {
  const body = (await readView(host, address).catch(() => null))?.current.get('profile')?.entry.body
  const roles = markets.market(market)?.roles.map((r) => r.role) ?? []
  return body?.market === market && typeof body.role === 'string' && roles.includes(body.role) ? body.role : undefined
}

/** The entries `p` posted that its market no longer takes as they are, newest first. A profile whose market left the directory has none: there is nothing to update them to. */
export async function outgrownOf(s: Services, p: Profile): Promise<Posted[]> {
  const { market, role } = pairOf(p.label)
  if (!markets.market(market)) return []
  const entries = entriesOf(await readView(s.host, p.address))
  const subjects = [...new Set(entries.flatMap((e) => (e.kind !== 'listing' && typeof e.body.subject === 'string' ? [e.body.subject] : [])))]
  const roles = new Map(await Promise.all(subjects.map(async (a) => [a, await roleAt(s.host, a, market)] as const)))
  const about = (e: Posted) => (e.kind === 'listing' || typeof e.body.subject !== 'string' ? undefined : roles.get(e.body.subject))
  return entries.filter((e) => markets.checkEntry(market, role, e.kind, e.body, about(e)) !== null)
}

const held = new Map<string, Posted[]>()
const listeners = new Set<() => void>()
const told = () => {
  for (const l of listeners) l()
}

/** What a market outgrew of the profile at `address`, when last read in this page. */
export const outgrownHeld = (address: string): Posted[] | undefined => held.get(address)

/** What a market outgrew of each profile in `list`, read now and held in the page; a profile that can't be read keeps what was held. */
export async function readOutgrown(s: Services, list: Profile[]): Promise<void> {
  await Promise.all(
    list.map(async (p) => {
      const found = await outgrownOf(s, p).catch(() => null)
      if (!found) return
      held.set(p.address, found)
      told()
    }),
  )
}

/** Nothing held: after Forget. */
export function letGoOutgrown(): void {
  held.clear()
  told()
}

export function onOutgrown(listener: () => void): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}
