// The person's AI apps: each one's connection (services' mcp/README.md, The connection), found,
// added to, taken from and ended exactly as the reference app does (services' mcp/test/app.ts,
// `connections`, `addToConnection`, `endKey`, `endConnection`), with one change of order: a key is
// listed in its profile entry, and given its note, only once its access entry is written, so a write
// that fails leaves no key listed that nothing holds. What is written is the same.
//
// - A connection is found from the seed alone: each profile the Profiles folder lists, its notes
//   (key/<id>) opened with its main key, and each connection folder they name, opened with the
//   folder's own key, which the note holds. One whose `connection` entry is gone has ended.
// - A profile counts in a connection while its access entry's key is listed, unended, in its
//   profile entry: an access entry a write that failed left behind counts for nothing, and is
//   deleted when the profile is ticked again, so the connector never takes it for the profile.
// - Every write to a note or to a connection folder is paid from that folder's balance, topped up
//   from the wallet when the host refuses it for its price (paid.ts).
//
// The device keeps each connection to this app's connector, never a key, and the addresses of the
// access keys it knows of.

import { CAN, type Body, type SignedEntry, type View, b64u, entry, nextTime } from '@foundationforest/folders'
import { isLocked, lock, openLocked } from '@foundationforest/folders/locked'
import { type AccessKey, type MainKey, accessKey, mainKey, newAccessKey, openingHalf } from '@foundationforest/keys'

import type { Config } from '../config.ts'
import { type Connection, connections, dropConnection, keepConnection, knowKeys, saveConnections, saveKnownKeys } from '../device.ts'
import { openKeyOf } from '../services/connector.ts'
import { readView, writeAll } from '../services/host.ts'
import { paid } from './paid.ts'
import { openProfiles, opened, randomId, walletKey } from './profiles.ts'

/** Where a connection lives and which connector it is for: the host, and this app's connector. */
export type Where = Pick<Config, 'host' | 'connector'>

/** A connection's folder key, the connector it is for, and the AI app's name, as its notes and access entries need them. */
export type Conn = { key: AccessKey; connector: string; name: string }

/** A connection found from the seed: its folder's address and key, its connector, the AI app's name, when it connected, its folder, and its access entries, opened. */
export type Found = Conn & { address: string; time: number; view: View; access: Array<{ path: string; body: Body }> }

/** The access key an access entry holds. */
const keyOf = (a: { body: Body }) => accessKey(b64u.decode(a.body.key as string))

/** The keys a profile entry lists now, unended, by address. */
const live = (view: View) => new Set(view.keys.filter((k) => k.until === undefined).map((k) => k.key))

/**
 * An access entry for `label`'s new access key, for the connection folder: its label, address,
 * hosts and key, locked to the folder's own open key and the connector's.
 */
export async function accessEntry(conn: Conn, label: string, main: MainKey, hosts: string[], key: AccessKey, openKey: string): Promise<SignedEntry> {
  return entry(conn.key, `access/${randomId()}`, await lock({ label, address: main.address, hosts, key: b64u.encode(key.secret) }, [conn.key.openKey, openKey]), Date.now())
}

/** `main`'s profile entry, changed by `change`, given the new one's time, and written by its main key at it. */
async function changeProfile(host: string, main: MainKey, wallet: MainKey, change: (body: Body, time: number) => Body): Promise<void> {
  const view = await readView(host, main.address)
  const body = view.current.get('profile')?.entry.body
  if (!body) throw new Error('no profile entry')
  const time = nextTime(Date.now(), view, 'profile')
  const changed = entry(main, 'profile', change(body, time), time)
  await paid(host, main.address, wallet, () => writeAll(host, [changed]))
}

/**
 * `key` listed in `main`'s profile entry with every switch, and its open key, since it may read;
 * then its note at `key/<id>`, a random id, locked to the main key alone: the key, the AI app's
 * name, the connector, the time, and the connection folder's key.
 */
export async function listKey(host: string, main: MainKey, wallet: MainKey, conn: Conn, key: AccessKey): Promise<void> {
  const can = [...CAN]
  await changeProfile(host, main, wallet, (body) => ({ ...body, keys: [...((body.keys as Body[] | undefined) ?? []), { key: key.address, open: key.openKey, can }] }))
  const mine = (await openingHalf(main.secret)).openKey
  const note = entry(main, `key/${randomId()}`, await lock({ key: key.address, name: conn.name, connector: conn.connector, time: Date.now(), connection: b64u.encode(conn.key.secret) }, [mine]), Date.now())
  await paid(host, main.address, wallet, () => writeAll(host, [note]))
}

/**
 * The access key at `address` ended in `label`'s profile entry: listed with `until`, the time of
 * the profile entry that ends it, and without its open key (one ended already keeps its own); then
 * its entry in the connection its note names, and its note, deleted. What it wrote by then still
 * counts; a host takes nothing more it signs.
 */
async function endKey(host: string, seed: Uint8Array, wallet: MainKey, label: string, address: string): Promise<void> {
  const main = await mainKey(seed, label)
  if (live(await readView(host, main.address)).has(address)) {
    await changeProfile(host, main, wallet, (body, time) => ({
      ...body,
      keys: ((body.keys as Body[] | undefined) ?? []).map((k) => {
        if (k.key !== address || k.until !== undefined) return k
        const { open: _, ...kept } = k
        return { ...kept, until: time }
      }),
    }))
  }
  const view = await readView(host, main.address)
  const note = (await opened(view, 'key', (await openingHalf(main.secret)).identity)).find((n) => n.body.key === address)
  if (!note) return
  if (typeof note.body.connection === 'string') {
    const key = await accessKey(b64u.decode(note.body.connection))
    const folder = await readView(host, key.address)
    for (const a of await opened(folder, 'access', key.identity)) {
      if ((await keyOf(a)).address !== address) continue
      const gone = entry(key, a.path, null, nextTime(Date.now(), folder, a.path))
      await paid(host, key.address, wallet, () => writeAll(host, [gone]))
    }
  }
  const gone = entry(main, note.path, null, nextTime(Date.now(), view, note.path))
  await paid(host, main.address, wallet, () => writeAll(host, [gone]))
}

/**
 * Every connection the person's notes name, found from the seed, each profile in `labels` read for
 * them; and, by label, the keys each profile entry lists now, unended.
 */
async function scan(host: string, seed: Uint8Array, labels: string[]): Promise<{ found: Found[]; listed: Map<string, Set<string>> }> {
  const named = new Map<string, { key: AccessKey; connector: string }>()
  const listed = new Map<string, Set<string>>()
  for (const label of labels) {
    const main = await mainKey(seed, label)
    const view = await readView(host, main.address)
    listed.set(label, live(view))
    for (const n of await opened(view, 'key', (await openingHalf(main.secret)).identity)) {
      if (typeof n.body.connection !== 'string' || typeof n.body.connector !== 'string') continue
      const key = await accessKey(b64u.decode(n.body.connection)).catch(() => null)
      if (key) named.set(key.address, { key, connector: n.body.connector })
    }
  }
  const found: Found[] = []
  for (const [address, { key, connector }] of named) {
    const view = await readView(host, address)
    const head = view.current.get('connection')?.entry
    if (!head || !isLocked(head.body)) continue
    const opens = await openLocked(head.body, key.identity).catch(() => null)
    if (typeof opens?.name !== 'string') continue
    found.push({ address, key, connector, name: opens.name, time: head.time, view, access: await opened(view, 'access', key.identity) })
  }
  return { found, listed }
}

/** The labels a connection acts for: each access entry whose key its profile entry lists now, unended. */
async function labelsOf(c: Found, listed: Map<string, Set<string>>): Promise<string[]> {
  const labels: string[] = []
  for (const a of c.access) {
    const label = a.body.label
    if (typeof label === 'string' && listed.get(label)?.has((await keyOf(a)).address)) labels.push(label)
  }
  return labels
}

/**
 * The person's connections to this app's connector, found from the seed, kept on the device in
 * place of what it kept; and every key their profile entries list now, which it knows of from
 * now. `labels` are the Profiles folder's, read here when not given.
 */
export async function findConnections(s: Where, seed: Uint8Array, labels?: string[]): Promise<Connection[]> {
  const { found, listed } = await scan(s.host, seed, labels ?? (await openProfiles(seed, s.host)).labels)
  const ours: Connection[] = []
  for (const c of found) if (c.connector === s.connector) ours.push({ address: c.address, name: c.name, time: c.time, labels: await labelsOf(c, listed) })
  saveConnections(ours)
  saveKnownKeys([...listed.values()].flatMap((keys) => [...keys]))
  return connections()
}

/** The connection at `address`, found from the seed, with the keys each profile lists now. */
async function connectionAt(s: Where, seed: Uint8Array, address: string) {
  const { found, listed } = await scan(s.host, seed, (await openProfiles(seed, s.host)).labels)
  const c = found.find((x) => x.address === address)
  if (!c) throw new Error('no such connection')
  return { c, listed }
}

/** The device's connection at `address`, changed to act for `labels`. */
function keep(c: Found, labels: string[]): void {
  const was = connections().find((d) => d.address === c.address)
  keepConnection({ address: c.address, name: was?.name ?? c.name, time: was?.time ?? c.time, labels })
}

/**
 * `label` added to the connection at `address`, with no new login: a new access key, its access
 * entry written first (in place of any for the profile whose key is not listed), then the key
 * listed with every switch and its note.
 */
export async function addTo(s: Where, seed: Uint8Array, address: string, label: string): Promise<void> {
  const { c, listed } = await connectionAt(s, seed, address)
  const [openKey, wallet, main, key] = await Promise.all([openKeyOf(c.connector), walletKey(seed), mainKey(seed, label), newAccessKey()])
  const view = await readView(s.host, main.address)
  const left: SignedEntry[] = []
  for (const a of c.access) if (a.body.label === label && !live(view).has((await keyOf(a)).address)) left.push(entry(c.key, a.path, null, nextTime(Date.now(), c.view, a.path)))
  const batch = [...left, await accessEntry(c, label, main, view.hosts, key, openKey)]
  await paid(s.host, c.address, wallet, () => writeAll(s.host, batch))
  await listKey(s.host, main, wallet, c, key)
  knowKeys([key.address])
  keep(c, [...(await labelsOf(c, listed)), label])
}

/** `label` taken from the connection at `address`: each of its keys there ended (endKey), with no new login. */
export async function removeFrom(s: Where, seed: Uint8Array, address: string, label: string): Promise<void> {
  const { c, listed } = await connectionAt(s, seed, address)
  const wallet = await walletKey(seed)
  for (const a of c.access) if (a.body.label === label) await endKey(s.host, seed, wallet, label, (await keyOf(a)).address)
  keep(c, (await labelsOf(c, listed)).filter((l) => l !== label))
}

/** The connection at `address` ended: its connection entry deleted first, so it stops at once, then each access key it holds ended. */
export async function end(s: Where, seed: Uint8Array, address: string): Promise<void> {
  const { c } = await connectionAt(s, seed, address)
  const wallet = await walletKey(seed)
  const gone = entry(c.key, 'connection', null, nextTime(Date.now(), c.view, 'connection'))
  await paid(s.host, c.address, wallet, () => writeAll(s.host, [gone]))
  dropConnection(address)
  for (const a of c.access) if (typeof a.body.label === 'string') await endKey(s.host, seed, wallet, a.body.label, (await keyOf(a)).address)
}
