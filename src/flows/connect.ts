// The connect page's work (services' mcp/README.md, The login and The connection), as the reference
// app does it (services' mcp/test/app.ts, `connect`), the keys listed last (connections.ts):
//
// 1. the connection folder, named by a key made at random (keys/'s newAccessKey), listed nowhere;
//    for each profile ticked, an access key made the same way and its access entry; the folder
//    funded from the wallet with one credit, as the loop's app pays (its `pay`), then written: its
//    profile entry, which holds only its hosts, its `connection` entry, the AI app's name and a
//    random secret, and the access entries, each locked to the folder's own open key and the
//    connector's, which it reads at the connector's /open-key;
// 2. then each key listed in its profile entry with every switch, and its note;
// 3. the pointer to the folder, locked to the connector's open key alone, naming the request, and
//    where the browser goes: the connector's /connected, with the request and the pointer.
//
// The request is the connector's own text, base64url of JSON holding the AI app's name and where it
// sends the person back, a dot, then the connector's MAC: the page shows the name and the host of
// that address, and checks the request has not run out. The connector checks the rest.

import { b64u, entry, hex } from '@foundationforest/folders'
import { lock } from '@foundationforest/folders/locked'
import { mainKey, newAccessKey } from '@foundationforest/keys'

import { keepConnection, knowKeys } from '../device.ts'
import { backTo, openKeyOf } from '../services/connector.ts'
import { readView, writeAll } from '../services/host.ts'
import { fund } from '../services/credits.ts'
import { type Where, accessEntry, listKey } from './connections.ts'
import { paid } from './paid.ts'
import { walletKey } from './profiles.ts'

/** What a login request says: the AI app's name, the host it sends the person back to, and when the request runs out. */
export type Asked = { name: string; from: string; exp: number }

/** The login request in `text`, or null when it is none. */
export function readRequest(text: string): Asked | null {
  const [body, mac, ...rest] = text.split('.')
  if (!body || !mac || rest.length) return null
  try {
    const r = JSON.parse(new TextDecoder().decode(b64u.decode(body))) as { name?: unknown; redirect?: unknown; exp?: unknown }
    if (typeof r.name !== 'string' || !r.name.trim() || typeof r.redirect !== 'string' || !URL.canParse(r.redirect) || !Number.isSafeInteger(r.exp)) return null
    return { name: r.name, from: new URL(r.redirect).host, exp: r.exp as number }
  } catch {
    return null
  }
}

/** Whether a login request has run out. */
export const ranOut = (asked: Asked, now = Date.now()) => now > asked.exp

/** What the pointer names a login request by: SHA-256 of its text, in lowercase hex. */
async function requestHash(request: string): Promise<string> {
  return hex.encode(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(request))))
}

/** The person's yes, for `labels`: the connection made, kept on the device, and where the browser goes. */
export async function connect(s: Where, seed: Uint8Array, request: string, labels: string[]): Promise<string> {
  const asked = readRequest(request)
  if (!asked) throw new Error('not a login request')
  const [openKey, wallet, folder] = await Promise.all([openKeyOf(s.connector), walletKey(seed), newAccessKey()])
  const conn = { key: folder, connector: s.connector, name: asked.name }
  const secret = b64u.encode(crypto.getRandomValues(new Uint8Array(32)))
  const now = Date.now()
  const ticked = []
  for (const label of labels) {
    const main = await mainKey(seed, label)
    const key = await newAccessKey()
    ticked.push({ main, key, access: await accessEntry(conn, label, main, (await readView(s.host, main.address)).hosts, key, openKey) })
  }
  const entries = [entry(folder, 'profile', { hosts: [s.host] }, now), entry(folder, 'connection', await lock({ name: asked.name, secret }, [folder.openKey, openKey]), now), ...ticked.map((t) => t.access)]
  await fund(s.host, folder.address, 1, wallet)
  await paid(s.host, folder.address, wallet, () => writeAll(s.host, entries))
  for (const t of ticked) await listKey(s.host, t.main, wallet, conn, t.key)
  knowKeys(ticked.map((t) => t.key.address))
  keepConnection({ address: folder.address, name: asked.name, time: now, labels })
  const pointer = (await lock({ request: await requestHash(request), folder: folder.address, hosts: [s.host], secret }, [openKey])).private
  return backTo(s.connector, request, { pointer })
}
