// The person's Profiles folder (folders/README.md, The Profiles folder), exactly as the reference app
// keeps it (services' mcp/test/app.ts): the empty label's folder, its profile entry holding only its
// hosts, a `label/<id>` entry for each profile and a `stamp/<id>` entry for each stamp, each at a
// random id and locked to the folder's own open key alone; and, as the standard's example keeps them,
// a `backup/<id>` entry for each backup passkey (flows/backups.ts); and the app's own `names` entry,
// the names the person gave others (flows/names.ts), and `email` entry, the morning email if it is
// on (flows/email.ts). Its balance at the host is the wallet, where
// the gift lands and which funds every new folder; its own writes are paid from it.
// Each time it is opened, and each label written, the device keeps the folder's address and the
// label entries read, so Profiles can tell, with nothing unlocked, one made on another device; and,
// each time it is opened, the names it holds and whether the morning email is on.

import { type Body, type View, entry, hex, liveContent } from '@foundationforest/folders'
import { isLocked, lock, openLocked } from '@foundationforest/folders/locked'
import { type MainKey, mainKey, openingHalf } from '@foundationforest/keys'

import { keepEmail, keepNames, readLabels } from '../device.ts'
import { NoCredits } from '../services/credits.ts'
import { NotWritten, readView, writeAll } from '../services/host.ts'
import { emailIn } from './email.ts'
import { namesIn } from './names.ts'

/** The Profiles folder as the host serves it, opened: its main key, its view, and the labels and stamps it lists. */
export type Opened = { key: MainKey; view: View; labels: string[]; stamps: string[] }

/** A random id, which names nothing: 16 random bytes, in lowercase hex. */
export const randomId = () => hex.encode(crypto.getRandomValues(new Uint8Array(16)))

/** The Profiles folder's main key, the empty label's: its address is the wallet's. */
export const walletKey = (seed: Uint8Array) => mainKey(seed, '')

/** Each locked entry under `kind/`, opened with `identity`: its path, and what it holds. One that does not open is not the person's, and counts for nothing. */
export async function opened(view: View, kind: string, identity: string): Promise<Array<{ path: string; body: Body }>> {
  const out: Array<{ path: string; body: Body }> = []
  for (const [path, { entry: e }] of liveContent(view)) {
    if (!path.startsWith(`${kind}/`) || !isLocked(e.body)) continue
    const body = await openLocked(e.body, identity).catch(() => null)
    if (body) out.push({ path, body })
  }
  return out
}

/** The paths of the label entries a view of the Profiles folder holds now, each locked: readable with nothing unlocked, never opened. */
export const labelPaths = (view: View): string[] => [...liveContent(view)].filter(([path, { entry: e }]) => path.startsWith('label/') && isLocked(e.body)).map(([path]) => path)

/** The random id of a label entry's path, `label/<id>`. */
export const labelId = (path: string) => path.slice('label/'.length)

/** The Profiles folder, read from the host and opened with the seed: the labels of the person's profiles, and their stamps. The device keeps which label entries it read, and the names it holds. */
export async function openProfiles(seed: Uint8Array, host: string): Promise<Opened> {
  const key = await walletKey(seed)
  const view = await readView(host, key.address)
  const { identity } = await openingHalf(key.secret)
  // Every label entry, read: one that does not open, or names no label, as the empty label, which is no profile's.
  const read: Record<string, string> = Object.fromEntries(labelPaths(view).map((path) => [labelId(path), '']))
  for (const o of await opened(view, 'label', identity)) if (typeof o.body.label === 'string') read[labelId(o.path)] = o.body.label
  const stamps = (await opened(view, 'stamp', identity)).map((o) => o.body.stamp).filter((s): s is string => typeof s === 'string')
  readLabels(key.address, read)
  keepNames(await namesIn(view, identity))
  keepEmail(await emailIn(view, identity))
  return { key, view, labels: [...new Set(Object.values(read).filter(Boolean))].sort(), stamps }
}

/** One entry more, at `<kind>/<id>`, locked to the folder's own open key alone; its profile entry first, when it has none. Paid from the wallet. A label written is one the device has read. Gives back the id. */
export async function addTo(folder: Pick<Opened, 'key' | 'view'>, host: string, kind: 'label' | 'stamp' | 'backup', body: Body): Promise<string> {
  const now = Date.now()
  const first = folder.view.current.has('profile') ? [] : [entry(folder.key, 'profile', { hosts: [host] }, now)]
  const locked = await lock(body, [(await openingHalf(folder.key.secret)).openKey])
  const id = randomId()
  await writeAll(host, [...first, entry(folder.key, `${kind}/${id}`, locked, now)]).catch((err: unknown) => {
    throw err instanceof NotWritten && err.code === 'refused' ? new NoCredits() : err
  })
  if (kind === 'label' && typeof body.label === 'string') readLabels(folder.key.address, { [id]: body.label })
  return id
}
