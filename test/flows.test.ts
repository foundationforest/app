// The flows, against services' own verifier and host on loopback (world.ts), with the device's
// storage in memory: a verification, from its gift to its stamp kept; Start picking one up
// wherever it stopped; a face seen before; a stamp from a key the verifier no longer signs with,
// which counts for nothing; back to the two checks, losing nothing; a new profile, its folder
// funded and topped up; a profile made on another device, told with nothing unlocked and listed in
// one unlock; and the same seed read the same way by the app and by the reference app (services'
// mcp/test/app.ts).

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { type Body, entry, nextTime, proofsOf, readFolder, verificationCheck } from '@foundationforest/folders'
import { lock } from '@foundationforest/folders/locked'
import { mainKey, newAccessKey, newSeed, payAddresses } from '@foundationforest/keys'
import { checkVerification, signStamp, stampFromJson, stampToJson } from '@foundationforest/proofs'

import { App } from '../services/mcp/test/app.ts'
import * as device from '../src/device.ts'
import { readCard } from '../src/flows/cards.ts'
import { anyNew, labelIds, takeElsewhere } from '../src/flows/elsewhere.ts'
import { makeProfile } from '../src/flows/profile.ts'
import { addTo, openProfiles, walletKey } from '../src/flows/profiles.ts'
import { showStamps } from '../src/flows/stamps.ts'
import { enter } from '../src/flows/start.ts'
import { NotPassed, ask, choose, collect, finish, open, resume, stampNumberAt, stepOf } from '../src/flows/verify.ts'
import { NoCredits } from '../src/services/credits.ts'
import { writeAll } from '../src/services/host.ts'
import { about, stampsBack } from '../src/services/verifier.ts'
import { OFFERS, OTHER_OFFERS, OTHER_REQUESTS, REQUESTS, split } from './labels.ts'
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
  await finish(w, p.id, p.seed, step.stamp, proveHere)
  return { ...p, stamp: step.stamp }
}

describe('a verification', () => {
  test('the gift in the wallet, the stamp kept in the Profiles folder, nothing of it left on the device', async () => {
    const p = person()
    const url = await open(w, p.id, 'https://app.example/back')
    expect(url).toMatch(/^https:\/\/verify\.example\/session\//)
    const [session, back] = [...w.faceCheck.callbacks].at(-1)!
    expect(back, 'where Didit sends the person after').toBe('https://app.example/back')
    const kept = device.under()!
    expect(kept.passkey).toBe(p.id)
    expect(kept.session).toBe(session)
    expect(kept.gift?.pending.blinds.length, 'one buy, of exactly the gift').toBe(FACE_CREDITS)

    const step = await ask(w, p.id, await stampNumberAt(w, p.seed))
    expect(step.at).toBe('signed')
    expect(device.under()!.gift!.ticket, 'the ticket kept as soon as it comes').toMatch(/\./)

    const wallet = (await walletKey(p.seed)).address
    expect(await collect(w, p.id, wallet)).toBe(FACE_CREDITS)
    expect(await w.balance(wallet)).toBe(FACE_CREDITS)
    await finish(w, p.id, p.seed, (step as { stamp: string }).stamp, proveHere)
    const left = await w.balance(wallet)
    expect(left, "the Profiles folder's first write, paid from the wallet").toBeLessThan(FACE_CREDITS)
    expect(left).toBeGreaterThan(FACE_CREDITS - 0.1)

    expect(device.under(), 'nothing of the verification left').toBeNull()
    expect(device.passkey(), 'the passkey in use from now').toBe(p.id)
    const found = await App.find(p.seed, [w.host])
    expect(found.labels).toEqual([])
    expect(found.stamps.map((s) => stampFromJson(JSON.parse(s)).verifier), "the reference app finds the stamp in the Profiles folder").toEqual([w.keys.face])
    const folder = await readFolder([w.host], wallet, Date.now())
    expect(folder.current.get('profile')?.entry.body, 'its profile entry holds only its hosts').toEqual({ hosts: [w.host] })
  })

  // services' next verifier answers face_seen where it held a face for review; the one at SERVICES
  // can't yet, so here its answer stands in front of it, for that one route.
  test("a face seen before (face_seen): its session ends, and the line points to the ID", async () => {
    const p = person()
    await open(w, p.id)
    const real = globalThis.fetch
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) =>
      String(input) === `${w.verifier}/face/stamp` ? new Response(JSON.stringify({ error: 'face_seen' }), { status: 403 }) : real(input, init)) as typeof fetch
    try {
      const err = await ask(w, p.id, await stampNumberAt(w, p.seed)).catch((e: unknown) => e)
      expect(err).toBeInstanceOf(NotPassed)
      expect([(err as NotPassed).code, (err as NotPassed).message, (err as NotPassed).red]).toEqual(['face_seen', 'A similar face is already verified. Verify with your ID instead.', false])
    } finally {
      globalThis.fetch = real
    }
    expect(stepOf(p.id), 'the session done: the next open is a new one').toEqual({ at: 'start' })
  })

  test("a stamp from a key the verifier no longer signs with (the ID key before services#123): how the person is verified drops it, and no profile shows a verification of it", async () => {
    const p = await verified()
    const n = await stampNumberAt(w, p.seed)
    const old = signStamp(crypto.getRandomValues(new Uint8Array(32)), { stampNumber: n, facts: 1n, verifierName: (await about(w.verifier)).name })
    await addTo(await openProfiles(p.seed, w.host), w.host, 'stamp', { stamp: JSON.stringify(stampToJson(old)) })
    expect((await openProfiles(p.seed, w.host)).stamps, 'the folder holds both').toHaveLength(2)

    // As a device kept it before: every stamp the folder held, the old key's among them.
    device.saveChecks(['face', 'id'])
    expect(await resume(w, p.id, again(p).seed, proveHere)).toEqual({ verified: true, labels: [] })
    expect(device.checks(), "worked out fresh, against the verifier's current keys").toEqual(['face'])

    const made = await makeProfile(w, p.seed, OFFERS, proveHere)
    const body = (await readFolder([w.host], made.address, Date.now())).current.get('profile')!.entry.body!
    expect(proofsOf(body).map((x) => x.verifier), 'a verification of the face stamp alone').toEqual([w.keys.face])
    expect(await showStamps(w, p.seed, await openProfiles(p.seed, w.host), proveHere), 'nothing more to show').toBe(0)
    expect(await stampsBack(w.verifier, n), 'the verifier hands back only its own').toEqual({ face: expect.any(String), id: null })
  })

  test('not finished: still away; declined, expired or not passed: its session ends, in the one line for a check that didn\'t pass, and the next open is a new check', async () => {
    const p = person()
    w.decideAll('unfinished')
    const first = await open(w, p.id)
    const n = await stampNumberAt(w, p.seed)
    expect((await ask(w, p.id, n)).at).toBe('away')
    expect(await open(w, p.id), 'a tab closed midway opens the same check again').toBe(first)
    for (const [decision, line, red] of [
      ['declined', "That selfie didn't pass. Try again, or use your ID.", false],
      ['expired', "That selfie didn't pass. Try again, or use your ID.", false],
      ['not_passed', "That selfie didn't pass. Try again, or use your ID.", false],
    ] as const) {
      w.decideAll(decision)
      const err = await ask(w, p.id, n).catch((e: unknown) => e)
      expect(err, decision).toBeInstanceOf(NotPassed)
      expect([(err as NotPassed).message, (err as NotPassed).red]).toEqual([line, red])
      expect(device.under()?.session, 'Start opens a new check').toBeUndefined()
      expect(device.under()?.gift, 'with the same gift buy').toBeDefined()
      expect(await open(w, p.id), 'a new one').not.toBe(first)
    }
    w.decideAll('approved')
    expect((await ask(w, p.id, n)).at).toBe('signed')
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
    expect(await enter(w, again(p), proveHere)).toEqual({ to: 'verify', step: { at: 'away' } })
    w.decideAll('approved')
    expect(await enter(w, again(p), proveHere)).toEqual({ to: 'profiles' })
    const got = await after(p)
    expect(got.stamps).toBe(1)
    expect(got.wallet).toBeGreaterThan(FACE_CREDITS - 0.1)
    expect(w.faceCheck.created).toBeGreaterThan(0)
  })

  test('the stamp and its ticket kept, then the page closed before the gift was collected', async () => {
    const p = person()
    await open(w, p.id)
    await ask(w, p.id, await stampNumberAt(w, p.seed))
    expect(await enter(w, again(p), proveHere)).toEqual({ to: 'profiles' })
    expect((await after(p)).wallet).toBeGreaterThan(FACE_CREDITS - 0.1)
  })

  test('the gift collected, then the page closed before the stamp was kept: asked again, the same stamp, no second gift', async () => {
    const p = person()
    await open(w, p.id)
    await ask(w, p.id, await stampNumberAt(w, p.seed))
    await collect(w, p.id, (await walletKey(p.seed)).address)
    expect(await enter(w, again(p), proveHere)).toEqual({ to: 'profiles' })
    const got = await after(p)
    expect(got).toEqual({ wallet: got.wallet, stamps: 1 })
    expect(got.wallet, 'the gift once, less the Profiles folder\'s first write').toBeGreaterThan(FACE_CREDITS - 0.1)
    expect(got.wallet).toBeLessThan(FACE_CREDITS)
  })

  test("the check's hour over before the app asked again: the stamp handed back by its stamp number, the gift collected with its kept ticket", async () => {
    const p = person()
    await open(w, p.id)
    await ask(w, p.id, await stampNumberAt(w, p.seed))
    w.decide(device.under()!.session!, 'past_its_hour')
    expect(await enter(w, again(p), proveHere)).toEqual({ to: 'profiles' })
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
    await expect(enter(w, again(p), proveHere)).rejects.toBeInstanceOf(NoCredits)
  })
})

describe('back to Get verified, a check picked again loses nothing', () => {
  test('the same check: the check under way stays as it was, so the same page opens again', async () => {
    const p = person()
    w.decideAll('unfinished')
    const url = await open(w, p.id)
    const kept = device.under()
    choose(p.id, 'face')
    expect(device.under()).toEqual(kept)
    expect(await open(w, p.id)).toBe(url)
  })

  test("the other check: its open check dropped, the gift's buy and the ID check's payment kept; a payment no stamp used outlives the face check, so the ID check opens paid", async () => {
    const p = person()
    // Paid for the ID check (its payment's id, as the device keeps it before Stripe's page), then back, and the face check.
    device.keepUnder({ passkey: p.id, check: 'id', payment: 'cs_test_paid' })
    choose(p.id, 'face')
    expect(device.under()).toEqual({ passkey: p.id, check: 'face', payment: 'cs_test_paid' })
    await open(w, p.id)
    const { gift } = device.under()!
    choose(p.id, 'id')
    expect(device.under(), 'the face check dropped').toEqual({ passkey: p.id, check: 'id', payment: 'cs_test_paid', gift })
    choose(p.id, 'face')
    await verified(p)
    expect(device.under(), 'only the payment left').toEqual({ passkey: p.id, check: 'id', payment: 'cs_test_paid' })
    expect(stepOf(p.id), 'the ID check, paid: Start').toEqual({ at: 'start' })
    expect(await enter(w, again(p), proveHere), 'and Start on another visit lets it be').toEqual({ to: 'profiles' })
    expect(device.under()?.payment).toBe('cs_test_paid')
  })
})

describe('a new profile', () => {
  test('its folder funded with one credit, its profile entry as the reference app writes it, its verification checking, its label listed', async () => {
    const p = await verified()
    const wallet = (await walletKey(p.seed)).address
    const before = await w.balance(wallet)
    const made = await makeProfile(w, p.seed, OFFERS, proveHere)
    const main = await mainKey(p.seed, OFFERS)
    expect(made).toEqual({ label: OFFERS, address: main.address })
    expect(device.profiles(), 'the device keeps its label and address').toEqual([made])

    const body = (await readFolder([w.host], main.address, Date.now())).current.get('profile')!.entry.body!
    expect(body.market).toBe(split(OFFERS).market)
    expect(body.role).toBe(split(OFFERS).role)
    expect(body.hosts).toEqual([w.host])
    expect(typeof body.openKey).toBe('string')
    expect(body.pay).toEqual({ ...(await payAddresses(p.seed, OFFERS)) })
    const proof = proofsOf(body).find((x) => x.circuit === 'verification')
    const check = verificationCheck(proof, main.address)
    expect(check && (await checkVerification(check)), 'its verification checks, as any reader checks it').toBe(true)
    expect(proof!.verifier).toBe(w.keys.face)
    expect(await readCard(w, main.address)).toEqual({ checks: ['face'], listings: 0, keys: [] })

    const spent = before - (await w.balance(wallet))
    expect(spent, 'one credit to the new folder, and the label entry').toBeGreaterThan(1)
    expect(spent).toBeLessThan(1.1)
    expect(await w.balance(main.address), 'the profile entry paid from it').toBeLessThan(1)
    expect((await App.find(p.seed, [w.host])).labels, 'the reference app finds it').toEqual([OFFERS])

    // The reference app, from another seed with a stamp from the same verifier, writes the same shape.
    const q = await verified()
    const ref = new App({ seed: q.seed, hosts: [w.host] })
    await ref.keep(stampFromJson(JSON.parse(q.stamp)))
    const theirs = (await mainKey(q.seed, OFFERS)).address
    await ref.fund(theirs, 1)
    await ref.addProfile(OFFERS)
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
      await finish(pricey, p.id, p.seed, (step as { stamp: string }).stamp, proveHere)
      const wallet = (await walletKey(p.seed)).address
      const before = await pricey.balance(wallet)
      const made = await makeProfile(pricey, p.seed, OTHER_REQUESTS, proveHere)
      expect((await readFolder([pricey.host], made.address, Date.now())).current.has('profile')).toBe(true)
      expect(before - (await pricey.balance(wallet)), 'two credits went in: the first did not cover the profile entry').toBeGreaterThan(2)
    } finally {
      await pricey.close()
    }
  })
})

describe('a profile made on another device', () => {
  test('the first device tells it with nothing unlocked, even after opening the folder for something else; one unlock lists it; one that never opens is told once', async () => {
    const p = await verified()
    const tutor = await makeProfile(w, p.seed, OFFERS, proveHere)
    const first = globalThis.localStorage
    const wallet = (await walletKey(p.seed)).address
    const held = () => new Set(device.profiles().map((x) => x.label))
    const told = async () => anyNew(await labelIds(w.host, wallet), device.folder()!, held())
    expect(device.folder()?.address, "the Profiles folder's address, kept as the profile was made").toBe(wallet)
    expect(await told(), 'what this device made').toBe(false)

    // The second device: Start, then a profile of its own.
    freshDevice()
    expect(await enter(w, again(p), proveHere)).toEqual({ to: 'profiles' })
    expect(await told(), 'what Start read').toBe(false)
    const student = await makeProfile(w, p.seed, REQUESTS, proveHere)
    expect(await told()).toBe(false)

    // Back on the first.
    globalThis.localStorage = first
    expect(await labelIds(w.host, wallet)).toHaveLength(2)
    expect(await told(), 'a label entry it never read').toBe(true)
    await openProfiles(p.seed, w.host)
    expect(Object.values(device.folder()!.labels).sort(), 'the folder opened for something else: both read').toEqual([REQUESTS, OFFERS])
    expect(await told(), 'but one not listed here, so still told').toBe(true)
    expect(await takeElsewhere(w, again(p).seed)).toEqual([student])
    expect(device.profiles(), 'kept beside the one listed').toEqual([student, tutor])
    expect(await told()).toBe(false)
    expect(student.address in device.cursors(), 'marked as on a new device, by what it holds when first read').toBe(false)

    // A label entry the person's seed cannot open: told until one unlock reads it, then never again.
    const key = await walletKey(p.seed)
    const view = await readFolder([w.host], wallet, Date.now())
    const stranger = await newAccessKey()
    await writeAll(w.host, [entry(key, 'label/00000000000000000000000000000000', await lock({ label: OTHER_OFFERS }, [stranger.openKey]), nextTime(Date.now(), view, 'label/00000000000000000000000000000000'))])
    expect(await told()).toBe(true)
    expect(await takeElsewhere(w, again(p).seed)).toEqual([])
    expect(await told(), 'read once, nothing to show').toBe(false)
  })

  test("a profile in a market the directory no longer lists: never told as new, never listed, here or at Start on a new device", async () => {
    const p = await verified()
    const tutor = await makeProfile(w, p.seed, OFFERS, proveHere)
    // A test profile from the old markets: its label in the Profiles folder, as a profile's is.
    await addTo(await openProfiles(p.seed, w.host), w.host, 'label', { label: 'pottery/potter' })
    const wallet = (await walletKey(p.seed)).address
    const told = async () => anyNew(await labelIds(w.host, wallet), device.folder()!, new Set(device.profiles().map((x) => x.label)))
    expect(await told(), 'read as the folder was opened, and not listed: never told').toBe(false)
    expect(await takeElsewhere(w, again(p).seed), 'nothing taken').toEqual([])
    expect(device.profiles()).toEqual([tutor])
    freshDevice()
    expect(await enter(w, again(p), proveHere)).toEqual({ to: 'profiles' })
    expect(device.profiles(), 'Start lists only the profile in a listed market').toEqual([tutor])
    expect(await told()).toBe(false)
  })
})

describe('Start, on a device that knows nothing', () => {
  test("finds what the person made elsewhere: their profiles' labels and addresses", async () => {
    const p = await verified()
    const made = await makeProfile(w, p.seed, REQUESTS, proveHere)
    freshDevice()
    expect(await enter(w, again(p), proveHere)).toEqual({ to: 'profiles' })
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
    const address = (await mainKey(p.seed, OTHER_REQUESTS)).address
    await ref.fund(address, 1)
    await ref.addProfile(OTHER_REQUESTS)
    freshDevice()
    expect(await enter(w, again(p), proveHere)).toEqual({ to: 'profiles' })
    expect(device.profiles()).toEqual([{ label: OTHER_REQUESTS, address }])
    expect(await readCard(w, address)).toEqual({ checks: ['face'], listings: 0, keys: [] })
  })
})

test('what the device keeps, through all of it: its own keys, and nothing of the seed, a key or a stamp', async () => {
  const p = person()
  await open(w, p.id)
  const step = await ask(w, p.id, await stampNumberAt(w, p.seed))
  const during = JSON.stringify({ ...localStorage })
  await finish(w, p.id, p.seed, (step as { stamp: string }).stamp, proveHere)
  await makeProfile(w, p.seed, OTHER_OFFERS, proveHere)
  const after = JSON.stringify({ ...localStorage })
  expect(Object.keys(localStorage).sort()).toEqual(['forest.folder', 'forest.passkey', 'forest.passkeys', 'forest.profiles', 'forest.read', 'forest.seen', 'forest.verified'])
  expect([device.folder()?.address, Object.values(device.folder()?.labels ?? {})], "the Profiles folder's address, and its one label entry read here").toEqual([(await walletKey(p.seed)).address, [OTHER_OFFERS]])
  expect([device.cursors(), device.seen()], 'the profile made here, marked new from its start').toEqual([{ [(await mainKey(p.seed, OTHER_OFFERS)).address]: 0 }, { [(await mainKey(p.seed, OTHER_OFFERS)).address]: 0 }])
  const hex = (b: Uint8Array) => Buffer.from(b).toString('hex')
  const secrets = [hex(p.seed), Buffer.from(p.seed).toString('base64url'), hex((await walletKey(p.seed)).secret), hex((await mainKey(p.seed, OTHER_OFFERS)).secret), String(stampFromJson(JSON.parse((step as { stamp: string }).stamp)).signature.S)]
  for (const kept of [during, after]) for (const s of secrets) expect(kept.includes(s)).toBe(false)
})
