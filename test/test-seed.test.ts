// A test seed, against services' own verifier and host (world.ts): a seed the config lists by its
// Profiles folder's address (test-seed.ts). Its 24 words open it with no stamp and no passkey; it
// is in with no verification, by an id of its own; its seed is kept in the tab and held there; it
// gets credits from a checked person's Give credits (flows/give.ts) and makes profiles with no
// check, which then post and message like anyone's. Nobody else's seed changes.

import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'

import { readFolder } from '@foundationforest/folders'
import { exportWords, newSeed } from '@foundationforest/keys'

import * as device from '../src/device.ts'
import { GIVE, ONLY_CHECKED, giveCredits } from '../src/flows/give.ts'
import { WordsNotVerified, seedOfWords } from '../src/flows/imported.ts'
import { send } from '../src/flows/inbox.ts'
import { makeProfile } from '../src/flows/profile.ts'
import { walletKey } from '../src/flows/profiles.ts'
import { enterTest } from '../src/flows/start.ts'
import { drop } from '../src/held.ts'
import { TYPE_AGAIN, withSeed } from '../src/passkey.ts'
import { isTestSeed, isTestId, testIdOf } from '../src/test-seed.ts'
import { CHECK_FIRST, Said } from '../src/words.ts'
import { OFFERS, REQUESTS } from './labels.ts'
import { type World, freshDevice, proveHere, verifiedWith, world } from './world.ts'

let w: World
// A face check's gift big enough to give from, as an ID check's is.
beforeAll(async () => void (w = await world({ faceCredits: 100 })))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  drop()
})

/** A test seed: its seed, its Profiles folder's address, and the services listing it. */
async function aTestSeed() {
  const seed = newSeed()
  const address = (await walletKey(seed)).address
  return { seed, address, id: testIdOf(address), s: { ...w, testSeeds: [address] } }
}

test('its words open it with no stamp, only while the config lists it; any other seed with none still is refused', async () => {
  const t = await aTestSeed()
  const words = exportWords(t.seed)
  expect(await seedOfWords(w.host, words, [t.address])).toEqual(t.seed)
  await expect(seedOfWords(w.host, words), 'not listed: words like anyone else').rejects.toBeInstanceOf(WordsNotVerified)
  await expect(seedOfWords(w.host, exportWords(newSeed()), [t.address]), 'another seed').rejects.toBeInstanceOf(WordsNotVerified)
  expect(isTestId(t.id)).toBe(true)
  expect(isTestId('a-passkey-id-base64url'), "a passkey's id never reads as one").toBe(false)
  expect(isTestSeed(t.s, t.address)).toBe(true)
  expect(isTestSeed(w, t.address), 'none listed').toBe(false)
})

test('credits from a checked person, twenty into its wallet; then a profile with no check, which posts and messages like anyone', async () => {
  const t = await aTestSeed()
  await expect(makeProfile(t.s, t.seed, OFFERS, proveHere), 'no credits yet: its wallet pays for the folder').rejects.toThrow(Said)

  const giver = await verifiedWith(w)
  const before = await w.balance((await walletKey(giver.seed)).address)
  await giveCredits(w, giver.seed, t.address)
  expect(await w.balance(t.address)).toBe(GIVE)
  expect(await w.balance((await walletKey(giver.seed)).address), "from the giver's wallet").toBeLessThan(before)

  const made = await makeProfile(t.s, t.seed, OFFERS, proveHere)
  const body = (await readFolder([w.host], made.address, Date.now())).current.get('profile')!.entry.body!
  expect(body.proofs, 'no verification').toEqual([])
  expect([body.market, body.role]).toEqual(OFFERS.split('/'))

  const student = await verifiedWith(w, REQUESTS)
  expect(await send(t.s, t.seed, made.label, student.profiles[0]!.address, 'Hello')).toMatchObject({ text: 'Hello', mine: true })

  await expect(makeProfile(w, t.seed, REQUESTS, proveHere), 'the same seed, not listed: Get verified first').rejects.toThrow(CHECK_FIRST)
  await expect(giveCredits(t.s, t.seed, (await walletKey(giver.seed)).address), 'a test seed gives nothing').rejects.toThrow(ONLY_CHECKED)
})

test('in with no verification: its profiles listed, in use by its own id; the seed kept in the tab, and gone with Forget', async () => {
  const t = await aTestSeed()
  const giver = await verifiedWith(w)
  await giveCredits(w, giver.seed, t.address)
  await makeProfile(t.s, t.seed, OFFERS, proveHere)

  freshDevice()
  expect(await enterTest(t.s, t.id, t.seed)).toEqual({ to: 'profiles' })
  expect(device.passkey()).toBe(t.id)
  expect(device.passkeys(), 'no passkey known, so Start asks for none').toEqual([])
  expect(device.profiles().map((p) => p.label)).toEqual([OFFERS])

  device.keepTestSeed(t.id, t.seed)
  expect(await withSeed(t.id, async (seed) => seed.slice()), 'held from the tab, with no passkey').toEqual(t.seed)
  drop()
  expect(await withSeed(t.id, async (seed) => seed.slice()), 'after the page let it go, the tab still has it').toEqual(t.seed)
  drop()
  device.forget()
  expect(device.testSeed(t.id)).toBeNull()
  await expect(withSeed(t.id, async () => undefined)).rejects.toThrow(TYPE_AGAIN)
})
