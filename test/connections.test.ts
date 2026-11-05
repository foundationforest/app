// The person's AI apps, against services' own host and a stand-in connector on loopback (world.ts),
// with the device's storage in memory:
//
// - the connect page's work, written exactly as the reference app writes it (services'
//   mcp/test/app.ts), the keys listed last, and read as services' own mcp reads it
//   (mcp/src/connection.ts): the pointer, the connection, its access entries, each key and its note;
//   the folder's first write paid from the wallet; the device keeping the AI app, never a key;
// - the same seed, the same connections, in the app and in the reference app, each finding and
//   changing what the other made;
// - a profile taken away and given back, an access entry a failed write left behind replaced, and a
//   connection ended: it stops at once, and what its keys wrote stays;
// - Start on a new device listing the AI apps; a key made elsewhere, which Find AI apps finds;
// - the login request, as services' mcp signs it, read: its name, its host, when it runs out.

import { createHash, randomBytes } from 'node:crypto'

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { CAN, type Body, b64u, entry, liveContent, readFolder, write } from '@foundationforest/folders'
import { lockCount, openLocked } from '@foundationforest/folders/locked'
import { accessKey, mainKey, newAccessKey, newSeed, openingHalf } from '@foundationforest/keys'

import { type Pointer, openPointer, readConnection } from '../services/mcp/src/connection.ts'
import { Login } from '../services/mcp/src/login.ts'
import { App } from '../services/mcp/test/app.ts'
import * as device from '../src/device.ts'
import { readCard } from '../src/flows/cards.ts'
import { connect, ranOut, readRequest } from '../src/flows/connect.ts'
import { accessEntry, addTo, end, findConnections, removeFrom } from '../src/flows/connections.ts'
import { walletKey } from '../src/flows/profiles.ts'
import { enter } from '../src/flows/start.ts'
import { type World, freshDevice, proveHere, verifiedWith, world } from './world.ts'

let w: World
let login: Login
beforeAll(async () => {
  w = await world()
  login = new Login(randomBytes(32), await openingHalf((await mainKey(newSeed(), '')).secret), { origin: w.connector, clientFetch: fetch })
})
afterAll(() => w?.close())
beforeEach(() => freshDevice())

const TUTOR = 'tutoring/tutor'
const STUDENT = 'tutoring/student'
const SELLER = 'clothing/seller'

/** A login request, as services' mcp signs one at /authorize for an AI app named `name`. */
const request = (name = 'An AI app', more: { redirect?: string; exp?: number } = {}) =>
  login.sign('request', { client: 'a-client', name, redirect: more.redirect ?? 'https://ai-app.example/callback', challenge: 'c'.repeat(43), resource: w.connector, exp: more.exp ?? Date.now() + 600_000 })

/** The connect page's work for `labels`: where the browser goes, and the pointer it carries, opened as the connector opens it. */
async function connected(seed: Uint8Array, labels: string[], name = 'An AI app') {
  const r = request(name)
  const to = new URL(await connect(w, seed, r, labels))
  return { r, to, pointer: await openPointer(to.searchParams.get('pointer'), w.connectorIdentity) }
}

/** The connection a pointer names, as services' mcp reads it at each call. */
const asTheConnectorReads = (pointer: Pointer) => readConnection(pointer, w.connectorIdentity, {})

/** The keys a profile entry lists now. */
const keysOf = async (address: string) => (await readFolder([w.host], address, Date.now())).keys

/** The reference app, with the person's seed, its connection folders funded from the wallet as services' end-to-end test funds its own. */
const reference = (seed: Uint8Array) => {
  const app: App = new App({ seed, hosts: [w.host], pay: (folder) => app.fund(folder, 1) })
  return app
}

describe('the connect page', () => {
  test("what it writes is the reference app's format, read as services' mcp reads it; the first write paid from the wallet; the device keeps the AI app, never a key", async () => {
    const p = await verifiedWith(w, TUTOR, STUDENT, SELLER)
    const own = Object.fromEntries(p.profiles.map((x) => [x.label, x.address]))
    const wallet = (await walletKey(p.seed)).address
    const before = await w.balance(wallet)
    const { r, to, pointer } = await connected(p.seed, [STUDENT, TUTOR])

    // Back to the connector, with the request and the pointer, and nothing else.
    expect(to.origin + to.pathname).toBe(`${w.connector}/connected`)
    expect([...to.searchParams.keys()]).toEqual(['request', 'pointer'])
    expect(to.searchParams.get('request')).toBe(r)
    expect(Object.keys(pointer).sort()).toEqual(['folder', 'hosts', 'request', 'secret'])
    expect(pointer.request).toBe(createHash('sha256').update(r, 'utf8').digest('hex'))
    expect(pointer.hosts).toEqual([w.host])

    // The connection, as services' mcp reads it at each call.
    const read = await asTheConnectorReads(pointer)
    if (typeof read === 'string' || 'unreached' in read) throw new Error(`the connector reads ${JSON.stringify(read)}`)
    expect(read.name).toBe('An AI app')
    expect(read.profiles.map((x) => [x.label, x.address, x.hosts])).toEqual([
      [STUDENT, own[STUDENT], [w.host]],
      [TUTOR, own[TUTOR], [w.host]],
    ])

    // The folder: its profile entry only its hosts; `connection` and each `access/<id>`, at a random
    // id, locked to two keys, the folder's own and the connector's.
    const folder = await readFolder([w.host], pointer.folder, Date.now())
    expect(folder.current.get('profile')?.entry.body).toEqual({ hosts: [w.host] })
    const locked = [...liveContent(folder)].filter(([path]) => path !== 'profile')
    expect(locked.map(([path]) => path.replace(/[0-9a-f]{32}$/, '<id>')).sort()).toEqual(['access/<id>', 'access/<id>', 'connection'])
    for (const [, { entry: e }] of locked) expect(lockCount(e.body as { private: string })).toBe(2)
    const head = await openLocked(folder.current.get('connection')!.entry.body!, w.connectorIdentity)
    expect(Object.keys(head).sort()).toEqual(['name', 'secret'])
    expect(head.secret).toBe(pointer.secret)

    // Each profile ticked: one key, with every switch and its open key; its note, locked to the main
    // key alone, naming the key, the AI app, the connector, the time, and the folder's key.
    const app = reference(p.seed)
    for (const label of [STUDENT, TUTOR]) {
      const keys = await keysOf(own[label]!)
      expect(keys).toHaveLength(1)
      expect(keys[0]!.can).toEqual([...CAN])
      expect(keys[0]!.open).toMatch(/^age1pq1/)
      const held = read.profiles.find((x) => x.label === label)!
      expect((await accessKey(b64u.decode(held.key))).address, 'the key its profile entry lists').toBe(keys[0]!.key)
      const note = (await app.note(label, keys[0]!.key))!
      expect(note.path).toMatch(/^key\/[0-9a-f]{32}$/)
      expect(lockCount(note.locked)).toBe(1)
      expect(Object.keys(note.body).sort()).toEqual(['connection', 'connector', 'key', 'name', 'time'])
      expect([note.body.name, note.body.connector]).toEqual(['An AI app', w.connector])
      expect((await accessKey(b64u.decode(note.body.connection as string))).address).toBe(pointer.folder)
    }
    expect(await keysOf(own[SELLER]!), 'none in the profile not ticked').toEqual([])

    // Paid from the wallet: the folder funded with one credit.
    expect(await w.balance(wallet)).toBeLessThan(before - 0.99)
    expect(await w.balance(pointer.folder)).toBeGreaterThan(0.9)

    // The device: the AI app's name, when it connected, its folder's address and its profiles; the
    // keys' addresses it knows of; never a key.
    expect(device.connections()).toEqual([{ address: pointer.folder, name: 'An AI app', time: folder.current.get('connection')!.entry.time, labels: [STUDENT, TUTOR] }])
    expect(device.knownKeys()).toEqual([...(await keysOf(own[STUDENT]!)), ...(await keysOf(own[TUTOR]!))].map((k) => k.key).sort())
    const kept = JSON.stringify({ ...localStorage })
    for (const x of read.profiles) expect(kept.includes(x.key)).toBe(false)
    expect(kept.includes(pointer.secret)).toBe(false)
    expect(kept.includes(b64u.encode((await accessKey(b64u.decode((await app.note(TUTOR, (await keysOf(own[TUTOR]!))[0]!.key))!.body.connection as string))).secret))).toBe(false)
  })
})

describe('same seed, same connections', () => {
  test('the reference app finds what the app made, the app finds what the reference app made, and each adds to the other', async () => {
    const p = await verifiedWith(w, TUTOR, SELLER)
    const app = reference(p.seed)
    await connected(p.seed, [TUTOR], 'Made here')
    await app.connect(w.connector, request('Made there'), { profiles: [SELLER] })
    const labelsOf = (found: Awaited<ReturnType<App['connections']>>) => found.map((c) => [c.name, c.connector, c.access.map((a) => a.body.label).sort()]).sort()
    expect(labelsOf(await app.connections())).toEqual([
      ['Made here', w.connector, [TUTOR]],
      ['Made there', w.connector, [SELLER]],
    ])

    freshDevice()
    const mine = await findConnections(w, p.seed)
    expect(mine.map((c) => [c.name, c.labels])).toEqual([
      ['Made here', [TUTOR]],
      ['Made there', [SELLER]],
    ])
    const [here, there] = mine.map((c) => c.address) as [string, string]
    await app.addToConnection(here, SELLER)
    await addTo(w, p.seed, there, TUTOR)
    expect((await findConnections(w, p.seed)).map((c) => c.labels)).toEqual([
      [SELLER, TUTOR],
      [SELLER, TUTOR],
    ])
    expect(labelsOf(await app.connections()).map((c) => c[2])).toEqual([
      [SELLER, TUTOR],
      [SELLER, TUTOR],
    ])
  })
})

describe('a connection changed', () => {
  test('a profile taken away: its key ended, its access entry and note gone, what it wrote still counting; given back with no new login; then the connection ended', async () => {
    const p = await verifiedWith(w, TUTOR, STUDENT)
    const own = Object.fromEntries(p.profiles.map((x) => [x.label, x.address]))
    const { pointer } = await connected(p.seed, [TUTOR, STUDENT])
    const labels = async () => {
      const read = await asTheConnectorReads(pointer)
      return typeof read === 'string' || 'unreached' in read ? read : read.profiles.map((x) => x.label)
    }

    // The student's key writes a listing, as the AI would; then the student is taken away.
    const read = await asTheConnectorReads(pointer)
    if (typeof read === 'string' || 'unreached' in read) throw new Error('no connection')
    const studentKey = await accessKey(b64u.decode(read.profiles.find((x) => x.label === STUDENT)!.key))
    const [wrote] = await write([w.host], [entry({ profile: own[STUDENT]!, key: studentKey }, 'listing/by-the-ai', { description: 'Maths, from the AI.' }, Date.now())])
    expect(wrote?.results.every((x) => x.ok)).toBe(true)
    await removeFrom(w, p.seed, pointer.folder, STUDENT)
    const ended = await keysOf(own[STUDENT]!)
    expect(ended).toHaveLength(1)
    expect(ended[0]!.until).toBeTypeOf('number')
    expect(ended[0]!.open, 'nothing new locked to it').toBeUndefined()
    expect(await reference(p.seed).note(STUDENT, ended[0]!.key), 'its note gone').toBeUndefined()
    expect(await labels()).toEqual([TUTOR])
    expect(device.connections()[0]!.labels).toEqual([TUTOR])
    const view = await readFolder([w.host], own[STUDENT]!, Date.now())
    expect(view.current.get('listing/by-the-ai')?.entry.body, 'what it wrote stays').toEqual({ description: 'Maths, from the AI.' })
    const [refused] = await write([w.host], [entry({ profile: own[STUDENT]!, key: studentKey }, 'listing/again', { description: 'Again.' }, Date.now())])
    expect(refused?.results.some((x) => x.ok), 'and it writes nothing more').toBe(false)

    // Given back: a new key, with no new login.
    await addTo(w, p.seed, pointer.folder, STUDENT)
    expect(await labels()).toEqual([STUDENT, TUTOR])
    const keys = await keysOf(own[STUDENT]!)
    expect(keys.map((k) => k.until === undefined)).toEqual([false, true])
    expect(device.connections()[0]!.labels).toEqual([STUDENT, TUTOR])
    expect(device.knownKeys()).toContain(keys[1]!.key)

    // Ended: it stops at once, every key ended, no access entry left, nothing for the reference app to find.
    await end(w, p.seed, pointer.folder)
    expect(await asTheConnectorReads(pointer)).toBe('gone')
    for (const label of [TUTOR, STUDENT]) expect((await keysOf(own[label]!)).every((k) => k.until !== undefined)).toBe(true)
    const folder = await readFolder([w.host], pointer.folder, Date.now())
    expect([...liveContent(folder)].map(([path]) => path)).toEqual(['profile'])
    expect(await reference(p.seed).connections()).toEqual([])
    expect(device.connections()).toEqual([])
    expect((await readFolder([w.host], own[STUDENT]!, Date.now())).current.get('listing/by-the-ai')?.entry.body, 'what the AI wrote stays').toEqual({ description: 'Maths, from the AI.' })
  })

  test("its last profile taken away, no note names the connection: nothing finds it from the seed again, which is why an AI app keeps one ticked", async () => {
    const p = await verifiedWith(w, TUTOR)
    const { pointer } = await connected(p.seed, [TUTOR])
    await removeFrom(w, p.seed, pointer.folder, TUTOR)
    expect(await findConnections(w, p.seed)).toEqual([])
    expect(await reference(p.seed).connections()).toEqual([])
    await expect(addTo(w, p.seed, pointer.folder, TUTOR)).rejects.toThrow()
  })

  test('an access entry a failed write left behind, its key never listed, counts for nothing, and ticking the profile replaces it', async () => {
    const p = await verifiedWith(w, TUTOR, STUDENT)
    const own = Object.fromEntries(p.profiles.map((x) => [x.label, x.address]))
    const { pointer } = await connected(p.seed, [TUTOR])
    const note = (await reference(p.seed).note(TUTOR, (await keysOf(own[TUTOR]!))[0]!.key))!
    const conn = { key: await accessKey(b64u.decode(note.body.connection as string)), connector: w.connector, name: 'An AI app' }
    const left = await accessEntry(conn, STUDENT, await mainKey(p.seed, STUDENT), [w.host], await newAccessKey(), ((await (await fetch(`${w.connector}/open-key`)).json()) as { openKey: string }).openKey)
    await write([w.host], [left])
    expect((await findConnections(w, p.seed))[0]!.labels).toEqual([TUTOR])
    await addTo(w, p.seed, pointer.folder, STUDENT)
    const folder = await readFolder([w.host], pointer.folder, Date.now())
    expect(folder.current.get(left.path)?.entry.body ?? null, 'the one left behind, deleted').toBeNull()
    const read = await asTheConnectorReads(pointer)
    if (typeof read === 'string' || 'unreached' in read) throw new Error('no connection')
    const student = read.profiles.find((x) => x.label === STUDENT)!
    expect((await accessKey(b64u.decode(student.key))).address, 'the connector acts with the key the profile entry lists').toBe((await keysOf(own[STUDENT]!))[0]!.key)
  })
})

describe('Start, and keys made elsewhere', () => {
  test('a new device lists the AI apps from the seed, and knows every key listed', async () => {
    const p = await verifiedWith(w, TUTOR)
    const { pointer } = await connected(p.seed, [TUTOR])
    const before = device.connections()
    freshDevice()
    expect(await enter(w, { seed: new Uint8Array(p.seed), id: p.id }, proveHere)).toEqual({ to: 'profiles' })
    expect(device.connections()).toEqual(before)
    expect(device.connections()[0]!.address).toBe(pointer.folder)
    expect(device.knownKeys()).toEqual((await keysOf(p.profiles[0]!.address)).map((k) => k.key))
  })

  test('a key made in another browser is one the device does not know, until it finds the AI apps', async () => {
    const p = await verifiedWith(w, TUTOR)
    await enter(w, { seed: new Uint8Array(p.seed), id: p.id }, proveHere)
    expect(device.connections()).toEqual([])
    await reference(p.seed).connect(w.connector, request('Elsewhere'), { profiles: [TUTOR] })
    const card = (await readCard(w, p.profiles[0]!.address))!
    expect(card.keys).toHaveLength(1)
    expect(card.keys.filter((k) => !device.knownKeys().includes(k)), 'one it does not know').toEqual(card.keys)
    await findConnections(w, p.seed)
    expect(device.knownKeys()).toEqual(card.keys)
    expect(device.connections().map((c) => [c.name, c.labels])).toEqual([['Elsewhere', [TUTOR]]])
  })
})

describe('the login request', () => {
  test("as services' mcp signs it: the AI app's name, the host it sends the person back to, and when it runs out", () => {
    const exp = Date.now() + 600_000
    const asked = readRequest(request('Claude', { redirect: 'https://claude.ai/api/mcp/auth_callback', exp }))
    expect(asked).toEqual({ name: 'Claude', from: 'claude.ai', exp })
    expect(ranOut(asked!, exp)).toBe(false)
    expect(ranOut(asked!, exp + 1)).toBe(true)
  })

  test('one that is none: no dot, no JSON, no name, no redirect, no time', () => {
    const signed = (body: Body) => login.sign('request', body)
    for (const text of ['', 'nope', 'a.b.c', `${b64u.encode(new TextEncoder().encode('{'))}.mac`, signed({ redirect: 'https://x.example/', exp: 1 }), signed({ name: ' ', redirect: 'https://x.example/', exp: 1 }), signed({ name: 'A', redirect: 'not a url', exp: 1 }), signed({ name: 'A', redirect: 'https://x.example/' })]) {
      expect(readRequest(text), text).toBeNull()
    }
  })
})
