// The flows, against services' own host and a stand-in verifier on loopback (world.ts), with the
// device's storage in memory: a verification, from its gift to its stamp kept; Start picking one up
// wherever it stopped; review; a new profile, its folder funded and topped up; and the same seed
// read the same way by the app and by the reference app (services' mcp/test/app.ts).

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { type Body, proofsOf, readFolder, verificationCheck } from '@foundationforest/folders'
import { mainKey, newSeed, payAddresses } from '@foundationforest/keys'
import { checkVerification, stampFromJson } from '@foundationforest/proofs'

import { App } from '../services/mcp/test/app.ts'
import * as device from '../src/device.ts'
import { readCard } from '../src/flows/cards.ts'
import { makeProfile } from '../src/flows/profile.ts'
import { walletKey } from '../src/flows/profiles.ts'
import { enter } from '../src/flows/start.ts'
import { NotPassed, ask, collect, finish, open, resume, stampNumberAt } from '../src/flows/verify.ts'
import { NoCredits } from '../src/services/credits.ts'
import { FACE_CREDITS, type World, freshDevice, proveHere, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

/** A person: a seed, and the id of the passkey that gave it. */
const person = () => ({ seed: newSeed(), id: `passkey-${crypto.randomUUID()}` })
/** The seed as a passkey gives it again: a copy, since the flows zero nothing but what they are handed for good. */
const again = (p: ReturnType<typeof person>) => ({ seed: new Uint8Array(p.seed), id: p.id })

/** A person verified as the app verifies them: the check opened, the stamp asked for, collected and kept. */
async function verified(p = person()) {
  await open(w, p.id)
  const step = await ask(w, p.id, await stampNumberAt(w, p.seed))
  if (step.at !== 'signed') throw new Error(`not signed: ${step.at}`)
  await finish(w, p.id, p.seed, step.stamp)
  return { ...p, stamp: step.stamp }
}

describe('a verification', () => {
  test('the gift in the wallet, the stamp kept in the Profiles folder, nothing of it left on the device', async () => {
    const p = person()
    const url = await open(w, p.id, 'https://app.example/back')
    expect(url).toMatch(/^https:\/\/didit\.invalid\/session\//)
    expect(w.sessions.at(-1)?.returnUrl).toBe('https://app.example/back')
    const kept = device.under()!
    expect(kept.passkey).toBe(p.id)
    expect(kept.session).toBe(w.sessions.at(-1)!.id)
    expect(kept.gift?.pending.blinds.length, 'one buy, of exactly the gift').toBe(FACE_CREDITS)

    const step = await ask(w, p.id, await stampNumberAt(w, p.seed))
    expect(step.at).toBe('signed')
    expect(device.under()!.gift!.ticket, 'the ticket kept as soon as it comes').toMatch(/\./)

    const wallet = (await walletKey(p.seed)).address
    expect(await collect(w, p.id, wallet)).toBe(FACE_CREDITS)
    expect(await w.balance(wallet)).toBe(FACE_CREDITS)
    await finish(w, p.id, p.seed, (step as { stamp: string }).stamp)
    const left = await w.balance(wallet)
    expect(left, "the Profiles folder's first write, paid from the wallet").toBeLessThan(FACE_CREDITS)
    expect(left).toBeGreaterThan(FACE_CREDITS - 0.1)

    expect(device.under(), 'nothing of the verification left').toBeNull()
    expect(device.passkey(), 'the passkey in use from now').toBe(p.id)
    const found = await App.find(p.seed, [w.host])
    expect(found.labels).toEqual([])
    expect(found.stamps.map((s) => stampFromJson(JSON.parse(s)).verifier), "the reference app finds the stamp in the Profiles folder").toEqual([w.faceKey])
    const folder = await readFolder([w.host], wallet, Date.now())
    expect(folder.current.get('profile')?.entry.body, 'its profile entry holds only its hosts').toEqual({ hosts: [w.host] })
  })

  test('held for review: the app keeps asking, and the same session gives the stamp once approved', async () => {
    const p = person()
    w.decideAll('review')
    await open(w, p.id)
    const n = await stampNumberAt(w, p.seed)
    expect((await ask(w, p.id, n)).at).toBe('review')
    expect((await resume(w, p.id, p.seed)).verified, 'Start, meanwhile, takes it up held for review').toBe(false)
    w.decideAll('approved')
    expect((await ask(w, p.id, n)).at).toBe('signed')
    expect(w.sessions.filter((s) => device.under()?.session === s.id)).toHaveLength(1)
  })

  test('not finished, or declined, reads the same: still away; a check that did not pass ends its session', async () => {
    const p = person()
    w.decideAll('unfinished')
    await open(w, p.id)
    const n = await stampNumberAt(w, p.seed)
    expect((await ask(w, p.id, n)).at).toBe('away')
    w.decideAll('not_passed')
    await expect(ask(w, p.id, n)).rejects.toBeInstanceOf(NotPassed)
    expect(device.under()?.session, 'Start opens a new check').toBeUndefined()
    expect(device.under()?.gift, 'with the same gift buy').toBeDefined()
  })
})

describe('Start picks up a verification stopped anywhere, and loses nothing', () => {
  /** Where the stamp number's credits went, and the stamps kept: what a stopped setup must not double or lose. */
  const after = async (p: ReturnType<typeof person>) => ({
    wallet: await w.balance((await walletKey(p.seed)).address),
    stamps: (await App.find(p.seed, [w.host])).stamps.length,
  })

  test('the check opened, then the page closed before it was finished', async () => {
    const p = person()
    w.decideAll('unfinished')
    await open(w, p.id)
    expect(await enter(w, again(p))).toEqual({ to: 'verify', step: { at: 'away' } })
    w.decideAll('approved')
    expect(await enter(w, again(p))).toEqual({ to: 'profiles' })
    const got = await after(p)
    expect(got.stamps).toBe(1)
    expect(got.wallet).toBeGreaterThan(FACE_CREDITS - 0.1)
    expect(w.sessions.length).toBeGreaterThan(0)
  })

  test('the stamp and its ticket kept, then the page closed before the gift was collected', async () => {
    const p = person()
    await open(w, p.id)
    await ask(w, p.id, await stampNumberAt(w, p.seed))
    expect(await enter(w, again(p))).toEqual({ to: 'profiles' })
    expect((await after(p)).wallet).toBeGreaterThan(FACE_CREDITS - 0.1)
  })

  test('the gift collected, then the page closed before the stamp was kept: asked again, the same stamp, no second gift', async () => {
    const p = person()
    await open(w, p.id)
    await ask(w, p.id, await stampNumberAt(w, p.seed))
    await collect(w, p.id, (await walletKey(p.seed)).address)
    const tickets = w.asked.tickets
    expect(await enter(w, again(p))).toEqual({ to: 'profiles' })
    expect(w.asked.tickets).toBe(tickets)
    const got = await after(p)
    expect(got).toEqual({ wallet: got.wallet, stamps: 1 })
    expect(got.wallet).toBeGreaterThan(FACE_CREDITS - 0.1)
    expect(got.wallet).toBeLessThan(FACE_CREDITS)
  })

  test("the check's hour over before the app asked again: the stamp handed back by its stamp number, the gift collected with its kept ticket", async () => {
    const p = person()
    await open(w, p.id)
    await ask(w, p.id, await stampNumberAt(w, p.seed))
    w.decide(device.under()!.session!, 'expired')
    expect(await enter(w, again(p))).toEqual({ to: 'profiles' })
    expect((await after(p)).wallet).toBeGreaterThan(FACE_CREDITS - 0.1)
  })

  test('the gift collected twice by a setup taken up again is spent once', async () => {
    const p = person()
    await open(w, p.id)
    await ask(w, p.id, await stampNumberAt(w, p.seed))
    const kept = device.under()!
    const wallet = (await walletKey(p.seed)).address
    await collect(w, p.id, wallet)
    device.keepUnder(kept)
    expect(await collect(w, p.id, wallet), 'collected again, the same credits, already in').toBe(FACE_CREDITS)
    expect(await w.balance(wallet)).toBe(FACE_CREDITS)
  })

  test('a device lost after the stamp was signed: a new one gets the stamp back, but a lost gift is lost', async () => {
    const p = person()
    await open(w, p.id)
    await ask(w, p.id, await stampNumberAt(w, p.seed))
    freshDevice()
    await expect(enter(w, again(p))).rejects.toBeInstanceOf(NoCredits)
  })
})

describe('a new profile', () => {
  test('its folder funded with one credit, its profile entry as the reference app writes it, its verification checking, its label listed', async () => {
    const p = await verified()
    const wallet = (await walletKey(p.seed)).address
    const before = await w.balance(wallet)
    const made = await makeProfile(w, p.seed, 'tutoring/tutor', proveHere)
    const main = await mainKey(p.seed, 'tutoring/tutor')
    expect(made).toEqual({ label: 'tutoring/tutor', address: main.address })
    expect(device.profiles(), 'the device keeps its label and address').toEqual([made])

    const body = (await readFolder([w.host], main.address, Date.now())).current.get('profile')!.entry.body!
    expect(body.market).toBe('tutoring')
    expect(body.role).toBe('tutor')
    expect(body.hosts).toEqual([w.host])
    expect(typeof body.openKey).toBe('string')
    expect(body.pay).toEqual({ ...(await payAddresses(p.seed, 'tutoring/tutor')) })
    const proof = proofsOf(body).find((x) => x.circuit === 'verification')
    const check = verificationCheck(proof, main.address)
    expect(check && (await checkVerification(check)), 'its verification checks, as any reader checks it').toBe(true)
    expect(proof!.verifier).toBe(w.faceKey)
    expect(await readCard(w, main.address)).toEqual({ checks: ['face'] })

    const spent = before - (await w.balance(wallet))
    expect(spent, 'one credit to the new folder, and the label entry').toBeGreaterThan(1)
    expect(spent).toBeLessThan(1.1)
    expect(await w.balance(main.address), 'the profile entry paid from it').toBeLessThan(1)
    expect((await App.find(p.seed, [w.host])).labels, 'the reference app finds it').toEqual(['tutoring/tutor'])

    // The reference app, from another seed with a stamp from the same verifier, writes the same shape.
    const q = await verified()
    const ref = new App({ seed: q.seed, hosts: [w.host] })
    await ref.keep(stampFromJson(JSON.parse(q.stamp)))
    const theirs = (await mainKey(q.seed, 'tutoring/tutor')).address
    await ref.fund(theirs, 1)
    await ref.addProfile('tutoring/tutor')
    const refBody = (await readFolder([w.host], theirs, Date.now())).current.get('profile')!.entry.body!
    const shape = (b: Body) => ({ keys: Object.keys(b).sort(), pay: Object.keys(b.pay as Body).sort(), proof: Object.keys(proofsOf(b)[0]!).sort(), hosts: b.hosts, market: b.market, role: b.role })
    expect(shape(body)).toEqual(shape(refBody))
  })

  test('a write refused for its price: one more credit from the wallet, and written again', async () => {
    const pricey = await world({ entryPerKb: '0.5' })
    try {
      const p = person()
      await open(pricey, p.id)
      const step = await ask(pricey, p.id, await stampNumberAt(pricey, p.seed))
      await finish(pricey, p.id, p.seed, (step as { stamp: string }).stamp)
      const wallet = (await walletKey(p.seed)).address
      const before = await pricey.balance(wallet)
      const made = await makeProfile(pricey, p.seed, 'home-cleaning/cleaner', proveHere)
      expect((await readFolder([pricey.host], made.address, Date.now())).current.has('profile')).toBe(true)
      expect(before - (await pricey.balance(wallet)), 'two credits went in: the first did not cover the profile entry').toBeGreaterThan(2)
    } finally {
      await pricey.close()
    }
  })
})

describe('Start, on a device that knows nothing', () => {
  test("finds what the person made elsewhere: their profiles' labels and addresses", async () => {
    const p = await verified()
    const made = await makeProfile(w, p.seed, 'tutoring/student', proveHere)
    freshDevice()
    expect(await enter(w, again(p))).toEqual({ to: 'profiles' })
    expect(device.profiles()).toEqual([made])
    expect(device.passkey()).toBe(p.id)
    expect(device.passkeys()).toEqual([p.id])
  })

  test('same seed, same Forest: what the reference app made, the app finds, with its verification', async () => {
    // The stamp and its gift as the app gets them; then everything else by the reference app.
    const p = person()
    await open(w, p.id)
    const step = await ask(w, p.id, await stampNumberAt(w, p.seed))
    await collect(w, p.id, (await walletKey(p.seed)).address)
    const ref = new App({ seed: p.seed, hosts: [w.host] })
    await ref.keep(stampFromJson(JSON.parse((step as { stamp: string }).stamp)))
    const address = (await mainKey(p.seed, 'home-repair/repairer')).address
    await ref.fund(address, 1)
    await ref.addProfile('home-repair/repairer')
    freshDevice()
    expect(await enter(w, again(p))).toEqual({ to: 'profiles' })
    expect(device.profiles()).toEqual([{ label: 'home-repair/repairer', address }])
    expect(await readCard(w, address)).toEqual({ checks: ['face'] })
  })
})

test('what the device keeps, through all of it: its own keys, and nothing of the seed, a key or a stamp', async () => {
  const p = person()
  await open(w, p.id)
  const step = await ask(w, p.id, await stampNumberAt(w, p.seed))
  const during = JSON.stringify({ ...localStorage })
  await finish(w, p.id, p.seed, (step as { stamp: string }).stamp)
  await makeProfile(w, p.seed, 'clothing/seller', proveHere)
  const after = JSON.stringify({ ...localStorage })
  expect(Object.keys(localStorage).sort()).toEqual(['forest.passkey', 'forest.passkeys', 'forest.profiles'])
  const hex = (b: Uint8Array) => Buffer.from(b).toString('hex')
  const secrets = [hex(p.seed), Buffer.from(p.seed).toString('base64url'), hex((await walletKey(p.seed)).secret), hex((await mainKey(p.seed, 'clothing/seller')).secret), String(stampFromJson(JSON.parse((step as { stamp: string }).stamp)).signature.S)]
  for (const kept of [during, after]) for (const s of secrets) expect(kept.includes(s)).toBe(false)
})
