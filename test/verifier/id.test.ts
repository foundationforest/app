// The ID check, against services' own verifier and host in this process, with the verifier's own
// stand-ins for Didit and for Stripe (services.ts): paid on Stripe's page, the payment's id
// kept on the device from the moment it is made; the check in its session, each one of the
// payment's three tries; its stamp and its gift; then every profile showing it, in one unlock. And
// every way it stops: not paid, declined, expired, its tries used up, not for sale, an ID already
// used, a page closed after the stamp was kept.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { proofsOf, readFolder, verificationCheck } from '@foundationforest/folders'
import { newSeed } from '@foundationforest/keys'
import { checkVerification, stampFromJson } from '@foundationforest/proofs'

import { App } from '../../services/mcp/test/app.ts'
import { doc, passed, passedId } from '../../services/verifier/test/fakes.ts'
import * as device from '../../src/device.ts'
import { readCard } from '../../src/flows/cards.ts'
import { makeProfile } from '../../src/flows/profile.ts'
import { walletKey } from '../../src/flows/profiles.ts'
import { NotPassed, advance, ask, finish, open, pay, resume, stampNumberAt, stepOf } from '../../src/flows/verify.ts'
import { Refused } from '../../src/services/http.ts'
import { Said } from '../../src/words.ts'
import { freshDevice, proveHere } from '../world.ts'
import { ID_CREDITS, type ServicesWorld, services } from './services.ts'

let w: ServicesWorld
beforeAll(async () => void (w = await services()))
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

/** Paid: the payment made, its id kept, and paid on Stripe's page. */
async function paid(p: Person) {
  const { test } = await pay(w, p.id, RETURN)
  expect(test, 'a test-mode payment').toBe(true)
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
  test('paid, checked, its stamp and its gift; then, in one unlock, every profile shows both checks', async () => {
    const p = person('ada')
    await faceChecked(p)
    const tutor = await makeProfile(w, p.seed, 'tutoring/tutor', proveHere)
    const seller = await makeProfile(w, p.seed, 'clothing/seller', proveHere)
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

  test('back from Stripe without paying: one quiet line, and Pay again', async () => {
    const p = person('alan')
    await faceChecked(p)
    await pay(w, p.id, RETURN)
    const err = await open(w, p.id).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(Refused)
    expect([(err as Said).message, (err as Said).red]).toEqual(['Not paid.', false])
    expect(stepOf(p.id)).toEqual({ at: 'consent' })
  })

  test('declined, or expired: the session ends, in one line, and a new one opens on the same payment', async () => {
    const p = person('emmy')
    await faceChecked(p)
    const payment = await paid(p)
    for (const [status, line, red] of [
      ['Declined', "The check didn't pass. Start again.", true],
      ['Expired', 'The check ran out of time. Start again.', false],
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

  test("a payment's three tries used: Pay again", async () => {
    const p = person('hedy')
    await faceChecked(p)
    await paid(p)
    for (let i = 0; i < 3; i++) {
      await checked(p, passedId(p.name, doc(p.name), { status: 'Declined' }))
      await expect(advance(w, p.id, p.seed, proveHere)).rejects.toBeInstanceOf(NotPassed)
    }
    const err = await open(w, p.id).catch((e: unknown) => e)
    expect((err as Said).message).toBe('This payment is used up. Pay again.')
    expect(stepOf(p.id)).toEqual({ at: 'consent' })
  })

  test('an ID already used by someone else: one red line', async () => {
    const p = person('rosalind')
    await faceChecked(p)
    await paid(p)
    await checked(p)
    expect(await advance(w, p.id, p.seed, proveHere)).toBeNull()
    freshDevice()
    const q = person('impostor')
    await faceChecked(q)
    await paid(q)
    await checked(q, passedId(q.name, doc('rosalind')))
    const err = await advance(w, q.id, q.seed, proveHere).catch((e: unknown) => e)
    expect([(err as Said).message, (err as Said).red]).toEqual(['This ID was already used to verify someone else.', true])
  })

  test('the page closed after the stamp was kept, before every profile showed it: Start finishes it', async () => {
    const p = person('barbara')
    await faceChecked(p)
    const made = await makeProfile(w, p.seed, 'home-repair/repairer', proveHere)
    await paid(p)
    await checked(p)
    const closed = async () => {
      throw new Error('the page closed')
    }
    await expect(advance(w, p.id, p.seed, closed)).rejects.toThrow('the page closed')
    expect(stepOf(p.id)).toEqual({ at: 'kept' })
    expect(await shown(made.address)).toEqual([w.keys.face])
    expect(await resume(w, p.id, p.seed, proveHere)).toEqual({ verified: true, labels: ['home-repair/repairer'] })
    expect(await shown(made.address)).toEqual([w.keys.face, w.keys.id].sort())
    expect(device.under()).toBeNull()
  })

  test('the face check declined at services\' own verifier: one red line, and Start again', async () => {
    const p = person('katherine')
    await open(w, p.id)
    w.faceCheck.set(session(), passed(p.name, { status: 'Declined' }))
    const err = await ask(w, p.id, await stampNumberAt(w, p.seed)).catch((e: unknown) => e)
    expect([(err as Said).message, (err as Said).red]).toEqual(["The check didn't pass. Start again.", true])
    expect(stepOf(p.id)).toEqual({ at: 'start' })
  })
})

test('a verifier with no Stripe: the ID check is not for sale, in one quiet line', async () => {
  const off = await services({ forSale: false })
  try {
    const err = await pay(off, 'passkey-x', RETURN).catch((e: unknown) => e)
    expect([(err as Said).message, (err as Said).red]).toEqual(["The ID check isn't available yet.", false])
  } finally {
    await off.close()
  }
})

