// The names the person gives others, against services' own host on loopback (world.ts): one locked
// entry at `names` in their Profiles folder, which only their seed opens, never in a profile's
// folder; a new device gets them at its first unlock; a name saved where the device kept none keeps
// the others the folder holds; the last taken back deletes the entry; and the reference app, which
// knows no such entry, finds the person's profiles and stamps as before.

import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'

import { isLocked, lockCount, openLocked } from '@foundationforest/folders/locked'
import { openingHalf } from '@foundationforest/keys'

import { App } from '../services/mcp/test/app.ts'
import * as device from '../src/device.ts'
import { NAMES_PATH, NAME_MOST, saveName } from '../src/flows/names.ts'
import { openProfiles, walletKey } from '../src/flows/profiles.ts'
import { readView } from '../src/services/host.ts'
import { type World, freshDevice, verifiedWith, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

/** The `names` entry the person's Profiles folder holds now, and what it opens to with their seed. */
async function namesEntry(seed: Uint8Array) {
  const key = await walletKey(seed)
  const body = (await readView(w.host, key.address)).current.get(NAMES_PATH)?.entry.body ?? null
  const opened = body && isLocked(body) ? await openLocked(body, (await openingHalf(key.secret)).identity) : null
  return { body, opened }
}

test("a name saved: one locked entry in the Profiles folder, locked to it alone, naming no one in the clear, and in no profile's folder; the device keeps a copy", async () => {
  const p = await verifiedWith(w, 'tennis-matches/player')
  const rodrigo = (await verifiedWith(w, 'tennis-matches/player')).profiles[0]!
  await saveName(w, p.seed, rodrigo.address, '  Rodrigo  ')
  expect(device.names(), 'trimmed, and kept on the device').toEqual({ [rodrigo.address]: 'Rodrigo' })
  const { body, opened } = await namesEntry(p.seed)
  expect(isLocked(body), 'locked').toBe(true)
  expect(lockCount(body as { private: string }), 'to the folder alone').toBe(1)
  expect(JSON.stringify(body), 'nothing readable in it').not.toMatch(/Rodrigo|tennis/)
  expect(JSON.stringify(body)).not.toContain(rodrigo.address)
  expect(opened).toEqual({ names: [{ address: rodrigo.address, name: 'Rodrigo' }] })
  const theirs = await readView(w.host, p.profiles[0]!.address)
  expect([...theirs.current.keys()].filter((path) => path.startsWith(NAMES_PATH)), "nothing of it in the person's profile").toEqual([])

  const found = await App.find(p.seed, [w.host])
  expect(found.labels, 'the reference app finds the same profiles beside it').toEqual(['tennis-matches/player'])
  expect(found.stamps).toHaveLength(1)
})

test('a new device: no names before the unlock; the unlock that opens the Profiles folder brings them; one saved there keeps the rest; one too long is cut', async () => {
  const p = await verifiedWith(w, 'clothing/seller')
  const [ana, beto] = [(await verifiedWith(w, 'clothing/buyer')).profiles[0]!, (await verifiedWith(w, 'clothing/buyer')).profiles[0]!]
  await saveName(w, p.seed, ana.address, 'Ana')
  freshDevice()
  expect(device.names()).toEqual({})
  await openProfiles(p.seed, w.host)
  expect(device.names(), 'back after the unlock').toEqual({ [ana.address]: 'Ana' })

  freshDevice()
  await saveName(w, p.seed, beto.address, 'B'.repeat(NAME_MOST + 10))
  expect((await namesEntry(p.seed)).opened, 'Ana kept, though this device had no copy').toEqual({ names: [{ address: ana.address, name: 'Ana' }, { address: beto.address, name: 'B'.repeat(NAME_MOST) }] })
  expect(device.names()).toEqual({ [ana.address]: 'Ana', [beto.address]: 'B'.repeat(NAME_MOST) })
})

test('taken back: the key shows again; the last one deletes the entry, and a new device then has none', async () => {
  const p = await verifiedWith(w, 'clothing/seller')
  const [ana, beto] = [(await verifiedWith(w, 'clothing/buyer')).profiles[0]!, (await verifiedWith(w, 'clothing/buyer')).profiles[0]!]
  await saveName(w, p.seed, ana.address, 'Ana')
  await saveName(w, p.seed, beto.address, 'Beto')
  await saveName(w, p.seed, ana.address, '')
  expect((await namesEntry(p.seed)).opened).toEqual({ names: [{ address: beto.address, name: 'Beto' }] })
  expect(device.names()).toEqual({ [beto.address]: 'Beto' })
  await saveName(w, p.seed, beto.address, '   ')
  expect((await namesEntry(p.seed)).body, 'the entry deleted').toBeNull()
  expect(device.names()).toEqual({})
  freshDevice()
  device.keepNames({ [ana.address]: 'An old copy' })
  await openProfiles(p.seed, w.host)
  expect(device.names(), "the folder's word in place of the device's").toEqual({})
})
