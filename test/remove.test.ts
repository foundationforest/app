// Delete profile (flows/remove.ts), against services' own host and verifier in this process
// (world.ts): every live entry in its folder deleted at the host, its profile entry last; an AI app
// that acted for it alone disconnected, one that acts for others too no longer acting for it; the
// morning email counting the rest; its label out of the Profiles folder; the device listing it no
// more; and made again, the same profile at the same address, its folder working as before.

import { randomBytes } from 'node:crypto'

import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'

import { liveContent, readFolder } from '@foundationforest/folders'
import { mainKey, newSeed, openingHalf } from '@foundationforest/keys'

import { Login } from '../services/mcp/src/login.ts'
import * as device from '../src/device.ts'
import { connect } from '../src/flows/connect.ts'
import { askCode, turnOn } from '../src/flows/email.ts'
import { post } from '../src/flows/entries.ts'
import { makeProfile } from '../src/flows/profile.ts'
import { openProfiles } from '../src/flows/profiles.ts'
import { removeProfile } from '../src/flows/remove.ts'
import { OFFERS, OTHER_OFFERS, REQUESTS } from './labels.ts'
import { codeSentTo } from './resend.ts'
import { type World, freshDevice, proveHere, verifiedWith, world } from './world.ts'

let w: World
let login: Login
beforeAll(async () => {
  w = await world()
  login = new Login(randomBytes(32), await openingHalf((await mainKey(newSeed(), '')).secret), { origin: w.connector, clientFetch: fetch })
})
afterAll(() => w?.close())
beforeEach(freshDevice)

/** An AI app connected for `labels`, as the connect page connects one. */
async function connected(seed: Uint8Array, labels: string[], name: string) {
  const r = login.sign('request', { client: 'a-client', name, redirect: 'https://ai-app.example/callback', challenge: 'c'.repeat(43), resource: w.connector, exp: Date.now() + 600_000 })
  await connect(w, seed, r, labels)
}

/** The paths of a folder's live entries at the host. */
const livePaths = async (address: string) => [...liveContent(await readFolder([w.host], address, Date.now()))].map(([path]) => path).sort()

test('deleted: every entry in its folder gone at the host, its AI apps and email let go of it, its label out of the Profiles folder, the device listing it no more; made again, the same profile', async () => {
  const p = await verifiedWith(w, OFFERS, OTHER_OFFERS, REQUESTS)
  const [tutor, seller] = p.profiles
  await post(w, p.seed, tutor!, 'listing', { description: 'Maths, every level.' })
  await post(w, p.seed, tutor!, 'listing', { description: 'Physics, for exams.' })
  await connected(p.seed, [OFFERS], 'Alone')
  await connected(p.seed, [OFFERS, OTHER_OFFERS], 'Both')
  const email = `ada-${crypto.randomUUID()}@example.com`
  const pending = await askCode(w, p.seed, email, [OFFERS, OTHER_OFFERS])
  await turnOn(w, p.seed, pending, codeSentTo(w.sent, email), null)
  expect((await livePaths(tutor!.address)).filter((x) => x.startsWith('listing/')), 'its two listings').toHaveLength(2)
  expect(device.connections().map((c) => c.name).sort()).toEqual(['Alone', 'Both'])

  await removeProfile(w, p.seed, tutor!)

  expect(await livePaths(tutor!.address), 'nothing live in its folder, its profile entry neither').toEqual([])
  expect(device.profiles().map((x) => x.label), 'the device lists it no more').toEqual([OTHER_OFFERS, REQUESTS].sort())
  expect((await openProfiles(p.seed, w.host)).labels, 'its label out of the Profiles folder').toEqual([OTHER_OFFERS, REQUESTS].sort())
  expect(device.connections().map((c) => [c.name, c.labels]), 'the app that acted for it alone, disconnected; the other, for the rest').toEqual([['Both', [OTHER_OFFERS]]])
  expect(device.email()?.profiles, 'the morning email counts the rest').toEqual([seller!.address])
  expect(await livePaths(seller!.address), 'the other profiles as they were').toContain('profile')

  const again = await makeProfile(w, p.seed, OFFERS, proveHere)
  expect(again.address, 'the same seed, the same address').toBe(tutor!.address)
  expect(await livePaths(tutor!.address)).toEqual(['profile'])
  await post(w, p.seed, again, 'listing', { description: 'Back again.' })
  expect((await livePaths(tutor!.address)).filter((x) => x.startsWith('listing/'))).toHaveLength(1)
})

test('the last profile the morning email counted: the email turned off', async () => {
  const p = await verifiedWith(w, OFFERS)
  const email = `ada-${crypto.randomUUID()}@example.com`
  const pending = await askCode(w, p.seed, email, [OFFERS])
  await turnOn(w, p.seed, pending, codeSentTo(w.sent, email), null)
  await removeProfile(w, p.seed, p.profiles[0]!)
  expect(device.email()).toBeNull()
  expect(device.profiles()).toEqual([])
})
