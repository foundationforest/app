// The ID check, against services' own verifier and host in this process, with the verifier's own
// stand-ins for Didit and for Stripe (world.ts): its consent screen as the verifier serves it;
// paid on Stripe's page, the payment's id kept on the device from the moment it is made; the check
// in its session, each one of the payment's three tries; its stamp and its gift; then every profile showing it, in one unlock. And
// every way it stops: not paid, declined, expired, its tries used up, not for sale, an ID already
// used, a page closed after the stamp was kept. And before it is sold, an ID stamp the verifier signed
// this seed already, kept with nothing paid.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { proofsOf, readFolder, verificationCheck } from '@foundationforest/folders'
import { newSeed } from '@foundationforest/keys'
import { checkVerification, stampFromJson } from '@foundationforest/proofs'

import { App } from '../services/mcp/test/app.ts'
import { CONSENT } from '../services/verifier/src/service.ts'
import { doc, passed, passedId } from '../services/verifier/test/fakes.ts'
import * as device from '../src/device.ts'
import { readCard, strongest } from '../src/flows/cards.ts'
import { whoIs } from '../src/flows/inbox.ts'
import { makeProfile } from '../src/flows/profile.ts'
import { walletKey } from '../src/flows/profiles.ts'
import { NotPassed, TRIES, Unpaid, advance, ask, consentOf, creditLines, creditsOf, finish, open, pay, resume, stampNumberAt, stepOf } from '../src/flows/verify.ts'
import { Said } from '../src/words.ts'
import { OFFERS, OTHER_OFFERS, OTHER_REQUESTS } from './labels.ts'
import { ID_CREDITS, type World, checkHere, freshDevice, proveHere, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(freshDevice)

const RETURN = 'https://app.example/id'

/** A person, by name (the stand-in embedder knows faces by name): a seed, and the id of the passkey that gave it. */
const person = (name: string) => ({ name, seed: newSeed(), id: `passkey-${crypto.randomUUID()}` })
type Person = ReturnType<typeof person>

/** The session the device keeps for the check under way. */
const session = () => device.under()!.session!

/** The face check, as the app does it from Start, Didit approving it. */
async function faceChecked(p: Person) {
  await open(w, p.id)
  w.faceCheck.set(session(), passed(p.name))
  const step = await ask(w, p.id, await stampNumberAt(w, p.seed))
  if (step.at !== 'signed') throw new Error(`not signed: ${step.at}`)
  await finish(w, p.id, p.seed, step.stamp, proveHere)
}

/** The ID check sold: Stripe's page, since the verifier signed this seed no ID stamp yet. */
async function sold(p: Person) {
  const got = await pay(w, p.id, RETURN, await stampNumberAt(w, p.seed))
  if (!('url' in got)) throw new Error('an ID stamp already, nothing sold')
  return got
}

/** Paid: the payment made, its id kept, and paid on Stripe's page. */
async function paid(p: Person) {
  await sold(p)
  const payment = device.under()!.payment!
  w.payments!.pay(payment)
  return payment
}

/** The ID check opened, and what Didit came to for it. */
async function checked(p: Person, decision = passedId(p.name, doc(p.name))) {
  await open(w, p.id, 'https://app.example/back')
  w.idCheck.set(session(), decision)
}

/** The verification circuit's verifications in a profile entry, by the key each is from, each checked. */
async function shown(address: string): Promise<string[]> {
  const body = (await readFolder([w.host], address, Date.now())).current.get('profile')!.entry.body!
  const out: string[] = []
  for (const proof of proofsOf(body).filter((x) => x.circuit === 'verification')) {
    const check = verificationCheck(proof, address)
    expect(check && (await checkVerification(check)), 'each checks, as any reader checks it').toBe(true)
    out.push(proof.verifier as string)
  }
  return out.sort()
}

describe('the ID check', () => {
  test('its consent screen, word for word as the verifier serves it in GET /', async () => {
    expect(await consentOf(w)).toBe(CONSENT)
  })

  test("Get verified's credit lines, from the verifier's own gifts: the ID's as so many times the selfie's; none where no credits come", async () => {
    expect(await creditsOf(w), 'its gifts here, 10 and 100').toEqual({ face: 'Free credits for posts and messages', id: '10× the free credits' })
    const at = (face: number, id: number, host = w.host) => creditLines({ gift: { face, id, host, sponsor: '' } }, w.host)
    expect(at(10, 25).id).toBe('2.5× the free credits')
    expect(at(0, 100), 'no selfie gift: no line for it').toEqual({ id: 'More free credits' })
    expect(at(10, 100, 'https://another.host'), 'a gift at another host comes to nothing here').toEqual({})
    expect(creditLines({}, w.host), 'no gift').toEqual({})
  })

  test('paid, checked, its stamp and its gift; then, in one unlock, every profile shows both checks', async () => {
    const p = person('ada')
    await faceChecked(p)
    const tutor = await makeProfile(w, p.seed, OFFERS, proveHere)
    const seller = await makeProfile(w, p.seed, OTHER_OFFERS, proveHere)
    expect(await shown(tutor.address)).toEqual([w.keys.face])
    expect(device.checks()).toEqual(['face'])

    const wallet = (await walletKey(p.seed)).address
    const before = await w.balance(wallet)
    const payment = await paid(p)
    expect(payment).toMatch(/^cs_test_/)
    expect(w.payments!.returnUrls.get(payment), "Stripe sends the person back to the app's /id").toBe(RETURN)
    expect(stepOf(p.id), 'back from Stripe, the payment kept: the check is the next step').toEqual({ at: 'start' })
    expect(device.under()!.gift!.pending.blinds.length, "the gift's buy, of exactly the ID check's credits").toBe(ID_CREDITS)

    await checked(p)
    expect(stepOf(p.id)).toEqual({ at: 'away' })
    expect(await advance(w, p.id, p.seed, proveHere), 'the one unlock at Continue finishes it').toBeNull()

    const gained = (await w.balance(wallet)) - before
    expect(gained, "the ID check's gift in the wallet, less the stamp's write").toBeGreaterThan(ID_CREDITS - 0.1)
    expect(gained).toBeLessThan(ID_CREDITS)
    const keys = [w.keys.face, w.keys.id].sort()
    for (const address of [tutor.address, seller.address]) {
      expect(await shown(address), 'every profile shows both').toEqual(keys)
      expect((await readCard(w, address))?.checks).toEqual(['face', 'id'])
      expect(strongest((await readCard(w, address))!.checks), 'its strongest check, the ID').toBe('id')
      expect((await whoIs(w, address, checkHere)).who?.checks, 'and anyone who reads it sees both badges').toEqual(['face', 'id'])
    }
    const found = await App.find(p.seed, [w.host])
    expect(found.stamps.map((s) => stampFromJson(JSON.parse(s)).verifier).sort(), 'the reference app finds both stamps').toEqual(keys)
    expect(device.under(), 'nothing of the verification left').toBeNull()
    expect(device.checks()).toEqual(['face', 'id'])
    expect(JSON.stringify({ ...localStorage }).includes(payment), 'nor its payment').toBe(false)
  })

  test('a new person can take the ID check first: verified by it alone', async () => {
    const p = person('grace')
    await paid(p)
    await checked(p)
    expect(await resume(w, p.id, p.seed, proveHere)).toEqual({ verified: true, labels: [] })
    expect(device.checks()).toEqual(['id'])
    expect(device.passkey()).toBe(p.id)
  })

  test('back from Stripe without paying: the payment dropped, nothing said, and the next tap pays', async () => {
    const p = person('alan')
    await faceChecked(p)
    await sold(p)
    const err = await open(w, p.id).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(Unpaid)
    expect(stepOf(p.id)).toEqual({ at: 'consent' })
    expect(device.under()!.payment, 'the payment dropped').toBeUndefined()
  })

  test('a hold that ended after a try: its tries used up, nothing charged, in the notice, and the next tap pays', async () => {
    const p = person('alan-2')
    await faceChecked(p)
    const payment = await paid(p)
    await checked(p, passedId(p.name, doc(p.name), { status: 'Declined' }))
    await advance(w, p.id, p.seed, proveHere).catch(() => undefined)
    // Its hold cancelled at Stripe, as the verifier's sweep does a day on.
    await w.payments!.cancel(payment)
    const err = await open(w, p.id).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(NotPassed)
    expect([(err as NotPassed).code, (err as Said).message]).toEqual(['not_paid', 'Your tries are used up. Nothing was charged. Pay again to continue.'])
    expect(stepOf(p.id)).toEqual({ at: 'consent' })
  })

  test('declined, or expired: the session ends, in one line, and a new one opens on the same payment', async () => {
    const p = person('emmy')
    await faceChecked(p)
    const payment = await paid(p)
    for (const [status, line, red] of [
      ['Declined', "That ID check didn't pass. Try again.", false],
      ['Expired', "That ID check didn't pass. Try again.", false],
    ] as const) {
      await checked(p, passedId(p.name, doc(p.name), { status }))
      const was = session()
      const err = await advance(w, p.id, p.seed, proveHere).catch((e: unknown) => e)
      expect(err, status).toBeInstanceOf(NotPassed)
      expect([(err as Said).message, (err as Said).red]).toEqual([line, red])
      expect(stepOf(p.id), 'Start again').toEqual({ at: 'start' })
      expect(device.under()!.payment, 'on the same payment').toBe(payment)
      await open(w, p.id)
      expect(session()).not.toBe(was)
    }
    w.idCheck.set(session(), passedId(p.name, doc(p.name)))
    expect(await advance(w, p.id, p.seed, proveHere)).toBeNull()
    expect(device.checks()).toEqual(['face', 'id'])
  })

  test("a payment's three tries: the third that doesn't pass says they're used up and nothing was charged, then Pay again", async () => {
    const p = person('hedy')
    await faceChecked(p)
    await paid(p)
    for (let i = 1; i <= TRIES; i++) {
      await checked(p, passedId(p.name, doc(p.name), { status: 'Declined' }))
      expect(device.under()!.tries, 'each session opened, counted').toBe(i)
      const err = await advance(w, p.id, p.seed, proveHere).catch((e: unknown) => e)
      expect(err).toBeInstanceOf(NotPassed)
      expect((err as Said).message).toBe(i < TRIES ? "That ID check didn't pass. Try again." : 'Your tries are used up. Nothing was charged. Pay again to continue.')
    }
    expect(stepOf(p.id), 'Pay again').toEqual({ at: 'consent' })
    expect(device.under()!.payment, 'the payment dropped').toBeUndefined()
  })

  test("a payment the verifier says is used up, which may have given its stamp: no word of a charge", async () => {
    const p = person('lise')
    await faceChecked(p)
    const payment = await paid(p)
    for (let i = 0; i < TRIES; i++) {
      await checked(p, passedId(p.name, doc(p.name), { status: 'Declined' }))
      await advance(w, p.id, p.seed, proveHere).catch(() => undefined)
    }
    // Its tries counted as one fewer, so the device asks once more, and the verifier answers.
    const u = device.under()!
    device.keepUnder({ ...u, payment, tries: TRIES - 1 })
    const err = await open(w, p.id).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(NotPassed)
    expect([(err as NotPassed).code, (err as Said).message]).toEqual(['payment_used', 'Your tries are used up. Nothing was charged. Pay again to continue.'])
    expect(stepOf(p.id)).toEqual({ at: 'consent' })
  })

  test('before the ID check is sold: an ID stamp the verifier signed this seed already, from its current key, is kept, and nothing is paid', async () => {
    const p = person('chien-shiung')
    await faceChecked(p)
    await paid(p)
    await checked(p)
    const n = await stampNumberAt(w, p.seed)
    expect((await ask(w, p.id, n)).at, 'signed, then the device lost before it was kept').toBe('signed')
    freshDevice()
    expect(await resume(w, p.id, p.seed, proveHere)).toEqual({ verified: true, labels: [] })
    expect(device.checks()).toEqual(['face'])

    const got = await pay(w, p.id, RETURN, n)
    expect(got, 'its ID stamp, and no Stripe page').toEqual({ stamp: expect.any(String) })
    expect(device.under()?.payment, 'no payment made').toBeUndefined()
    await finish(w, p.id, p.seed, (got as { stamp: string }).stamp, proveHere)
    expect(device.checks()).toEqual(['face', 'id'])
    expect(device.under()).toBeNull()
  })

  test('an ID that verified another seed already: the notice says so, nothing charged', async () => {
    const p = person('rosalind')
    await faceChecked(p)
    await paid(p)
    await checked(p)
    expect(await advance(w, p.id, p.seed, proveHere)).toBeNull()
    // Didit keeps the person it checked, and finds their face again: the same name and birth date, so
    // the verifier refuses a second ID stamp (services' verifier, since services#127).
    const rosalind = doc('rosalind')
    w.idCheck.users.set('id-rosalind', { fullName: rosalind.full_name!, birth: rosalind.date_of_birth! })
    freshDevice()
    const q = person('impostor')
    await faceChecked(q)
    await paid(q)
    await checked(q, passedId(q.name, rosalind, { matches: [{ vendorData: 'id-rosalind', sessionId: null }] }))
    const err = await advance(w, q.id, q.seed, proveHere).catch((e: unknown) => e)
    expect([(err as NotPassed).code, (err as Said).message]).toEqual(['duplicate_document', 'This ID is already verified with another passkey. Nothing was charged.'])
  })

  test('the page closed after the stamp was kept, before every profile showed it: Start finishes it', async () => {
    const p = person('barbara')
    await faceChecked(p)
    const made = await makeProfile(w, p.seed, OTHER_REQUESTS, proveHere)
    await paid(p)
    await checked(p)
    const closed = async () => {
      throw new Error('the page closed')
    }
    await expect(advance(w, p.id, p.seed, closed)).rejects.toThrow('the page closed')
    expect(stepOf(p.id)).toEqual({ at: 'kept' })
    expect(await shown(made.address)).toEqual([w.keys.face])
    expect(await resume(w, p.id, p.seed, proveHere)).toEqual({ verified: true, labels: [OTHER_REQUESTS] })
    expect(await shown(made.address)).toEqual([w.keys.face, w.keys.id].sort())
    expect(device.under()).toBeNull()
  })

  test('the face check declined at services\' own verifier: the selfie\'s one line, the ID offered, and a new check next', async () => {
    const p = person('katherine')
    await open(w, p.id)
    w.faceCheck.set(session(), passed(p.name, { status: 'Declined' }))
    const err = await ask(w, p.id, await stampNumberAt(w, p.seed)).catch((e: unknown) => e)
    expect([(err as Said).message, (err as NotPassed).check]).toEqual(["That selfie didn't pass. Try again, or use your ID.", 'face'])
    expect(stepOf(p.id)).toEqual({ at: 'start' })
  })
})

test('a verifier with no Stripe: the ID check is not for sale, in one quiet line', async () => {
  const off = await world({ forSale: false })
  try {
    const err = await pay(off, 'passkey-x', RETURN, 1n).catch((e: unknown) => e)
    expect([(err as Said).message, (err as Said).red]).toEqual(["The ID check isn't available yet.", false])
  } finally {
    await off.close()
  }
})

