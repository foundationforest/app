// A profile's posts, of every kind the markets define (the markets manual): a post at post/<id>, a
// review at review/<id>, a vouch at vouch/<id> and a report at report/<id>, each at a random id.
// Reading them needs nothing unlocked: a folder is public. Before the unlock, the app checks what is
// to be written: its required fields given; the body against its market (checkEntry, the markets'
// one checker); and for a review, a vouch or a report, its subject, read from the host: a profile's
// address, none of the person's own, in the same market, on the other side (the same role where the
// market has one). Then the main key signs it, at a new random id, or for an edit at its own path
// after what is there (nextTime); a delete is a null body there, free at the host. Each write is
// paid from the profile's folder, topped up from the wallet when the host refuses for price; then
// any new photo it names goes to the host, paid the same way (photos.ts).

import { type Body, type View, entry, liveContent, nextTime, publicKeyFromAddress } from '@foundationforest/folders'
import { mainKey } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import type { Profile } from '../device.ts'
import { KINDS, type Kind, fieldsOf, markets, otherSide, pairOf } from '../markets.ts'
import { readView, writeAll } from '../services/host.ts'
import { Said, entrySays, fieldWords } from '../words.ts'
import { paid } from './paid.ts'
import { sendPhotos } from './photos.ts'
import { randomId, walletKey } from './profiles.ts'

/** One entry a profile posted: its path, its kind, its body and time, and the access key that signed it, when one did. */
export type Posted = { path: string; kind: Kind; body: Body; time: number; key?: string }

/** The posts a folder holds now, of every kind, newest first. */
export function postsOf(view: View): Posted[] {
  const out: Posted[] = []
  for (const [path, { entry: e }] of liveContent(view)) {
    const [kind, id, ...rest] = path.split('/')
    if (!id || rest.length || !(KINDS as string[]).includes(kind!) || !e.body) continue
    out.push({ path, kind: kind as Kind, body: e.body, time: e.time, ...(e.key && { key: e.key }) })
  }
  return out.sort((a, b) => b.time - a.time)
}

/** A profile's posts, as the host serves its folder. */
export async function readPosts(s: Services, address: string): Promise<Posted[]> {
  return postsOf(await readView(s.host, address))
}

/**
 * The address a person gives for a subject: an address as it is, or the one a link names: a
 * profile's page on an index, as Share hands it out (`<index>/profiles/<address>`, or its JSON twin),
 * or an older Share link to this app's New message (`/message?to=<address>`).
 */
export function addressIn(given: string): string {
  const text = given.trim()
  try {
    const url = new URL(text)
    return url.searchParams.get('to') ?? /^\/profiles\/([^/]+?)(?:\.json)?$/.exec(url.pathname)?.[1] ?? text
  } catch {
    return text
  }
}

/** The profile a review, vouch or report is about, checked: its address, its role, and its posts. */
export type Subject = { address: string; role: string; posts: Posted[] }

/** The subject at `address` for an entry by `me`, read from the host and checked; else why not, in a red line. */
export async function subjectOf(s: Services, me: Profile, address: string, mine: Profile[]): Promise<Subject> {
  if (!publicKeyFromAddress(address)) throw new Said("That isn't a profile's address.", true)
  if (mine.some((p) => p.address === address)) throw new Said("That's one of your own profiles.", true)
  const view = await readView(s.host, address)
  const body = view.current.get('profile')?.entry.body
  if (!body) throw new Said('No profile is at this address.', true)
  const { market, role } = pairOf(me.label)
  if (body.market !== market) throw new Said("This profile isn't in this market.", true)
  if (typeof body.role !== 'string' || !otherSide(market, role).includes(body.role)) throw new Said("This profile isn't on the other side of this market.", true)
  return { address, role: body.role, posts: postsOf(view).filter((p) => p.kind === 'post') }
}

/**
 * Whether `body` can be posted as a `kind` entry by `me`: its required fields given, its subject
 * checked, and the body fitting its market. Gives back nothing when it can; else throws why, in one
 * line (quiet for a field still empty, red for one that does not fit).
 */
export async function check(s: Services, me: Profile, kind: Kind, body: Body, mine: Profile[]): Promise<void> {
  const { market: name, role } = pairOf(me.label)
  const market = markets.market(name)
  if (!market) throw new Said("This profile's market isn't in the directory.", true)
  if (kind !== 'post' && typeof body.subject !== 'string') throw new Said('Add their address.')
  const subject = kind === 'post' ? undefined : await subjectOf(s, me, body.subject as string, mine)
  for (const [field, f] of Object.entries(fieldsOf(market, kind, role, subject?.role))) {
    if (f.required && field !== 'subject' && body[field] === undefined) throw new Said(`${fieldWords(field)} is empty.`)
  }
  const why = markets.checkEntry(name, role, kind, body, subject?.role)
  if (why) throw entrySays(why, Object.keys(body))
}

/** A path for a new `kind` entry: a random id, which names nothing. */
export const newPath = (kind: Kind) => `${kind}/${randomId()}`

/**
 * `body` posted by `me` as a `kind` entry at `path` (an edit's own, or newPath's), then the bytes of
 * each new photo it names. Posted again at the same path after its photos failed, it writes nothing
 * new beside it.
 */
export async function post(s: Services, seed: Uint8Array, me: Profile, kind: Kind, body: Body, path: string = newPath(kind), photos: Uint8Array[] = []): Promise<string> {
  const [main, wallet] = await Promise.all([mainKey(seed, me.label), walletKey(seed)])
  const view = await readView(s.host, main.address)
  await paid(s.host, main.address, wallet, () => writeAll(s.host, [entry(main, path, body, nextTime(Date.now(), view, path))]))
  await sendPhotos(s.host, main.address, wallet, photos)
  return path
}

/** The entry at `path` in `me`'s folder deleted: a null body there. */
export async function unpost(s: Services, seed: Uint8Array, me: Profile, path: string): Promise<void> {
  const [main, wallet] = await Promise.all([mainKey(seed, me.label), walletKey(seed)])
  const view = await readView(s.host, main.address)
  await paid(s.host, main.address, wallet, () => writeAll(s.host, [entry(main, path, null, nextTime(Date.now(), view, path))]))
}
