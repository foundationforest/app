// The person's Profiles folder (folders/README.md, The Profiles folder), exactly as the reference app
// keeps it (services' mcp/test/app.ts): the empty label's folder, its profile entry holding only its
// hosts, a `label/<id>` entry for each profile and a `stamp/<id>` entry for each stamp, each at a
// random id and locked to the folder's own open key alone. Its balance at the host is the wallet,
// where the gift lands and which funds every new folder; its own writes are paid from it.

import { type Body, type View, entry, hex, liveContent } from '@foundationforest/folders'
import { isLocked, lock, openLocked } from '@foundationforest/folders/locked'
import { type MainKey, mainKey, openingHalf } from '@foundationforest/keys'

import { NoCredits } from '../services/credits.ts'
import { NotWritten, readView, writeAll } from '../services/host.ts'

/** The Profiles folder as the host serves it, opened: its main key, its view, and the labels and stamps it lists. */
export type Opened = { key: MainKey; view: View; labels: string[]; stamps: string[] }

/** A random id, which names nothing: 16 random bytes, in lowercase hex. */
export const randomId = () => hex.encode(crypto.getRandomValues(new Uint8Array(16)))

/** The Profiles folder's main key, the empty label's: its address is the wallet's. */
export const walletKey = (seed: Uint8Array) => mainKey(seed, '')

/** Each locked entry under `kind/`, opened with `identity`: what it holds. One that does not open is not the person's, and counts for nothing. */
async function opened(view: View, kind: string, identity: string): Promise<Body[]> {
  const out: Body[] = []
  for (const [path, { entry: e }] of liveContent(view)) {
    if (!path.startsWith(`${kind}/`) || !isLocked(e.body)) continue
    const body = await openLocked(e.body, identity).catch(() => null)
    if (body) out.push(body)
  }
  return out
}

/** The Profiles folder, read from the host and opened with the seed: the labels of the person's profiles, and their stamps. */
export async function openProfiles(seed: Uint8Array, host: string): Promise<Opened> {
  const key = await walletKey(seed)
  const view = await readView(host, key.address)
  const { identity } = await openingHalf(key.secret)
  const labels = (await opened(view, 'label', identity)).map((b) => b.label).filter((l): l is string => typeof l === 'string')
  const stamps = (await opened(view, 'stamp', identity)).map((b) => b.stamp).filter((s): s is string => typeof s === 'string')
  return { key, view, labels: [...new Set(labels)].sort(), stamps }
}

/** One entry more, at `<kind>/<id>`, locked to the folder's own open key alone; its profile entry first, when it has none. Paid from the wallet. */
export async function addTo(folder: Opened, host: string, kind: 'label' | 'stamp', body: Body): Promise<void> {
  const now = Date.now()
  const first = folder.view.current.has('profile') ? [] : [entry(folder.key, 'profile', { hosts: [host] }, now)]
  const locked = await lock(body, [(await openingHalf(folder.key.secret)).openKey])
  await writeAll(host, [...first, entry(folder.key, `${kind}/${randomId()}`, locked, now)]).catch((err: unknown) => {
    throw err instanceof NotWritten && err.code === 'refused' ? new NoCredits() : err
  })
}
