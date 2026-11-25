// The checks as the box runs them, against services' own verifier and host in this process, with the
// verifier's own stand-ins for Didit and for Stripe (world.ts): each check's consent screen as the
// verifier serves it; the ID check paid on the verifier's payment page (its client secret, which the
// box frames), the payment kept on the device from the moment it is made; the check in its session,
// each one of the payment's three tries; its stamps (the ID's, and the face stamp from the same
// selfie) and its gift; then every profile showing them. And every way it stops, as the verifier
// codes it and the box answers it (answers.ts): not paid, an ID it couldn't accept with a session
// left and on the last one, a person seen before, too young, cancelled with Skip, the free face check
// used, a face seen before, a page closed after the stamp was kept, stamps signed and never kept.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { proofsOf, readFolder, verificationCheck } from '@foundationforest/folders'
import { newSeed } from '@foundationforest/keys'
import { checkVerification, factListOf, stampFromJson } from '@foundationforest/proofs'

import { App } from '../services/mcp/test/app.ts'
import { AGREE, CANCEL_RIGHT, CONSENT, FACE_CONSENT } from '../services/verifier/src/service.ts'
import { ID_WORKFLOW, doc, passed, passedId, refusedWith } from '../services/verifier/test/fakes.ts'
import { FACE_TOO_YOUNG, FACE_TRIES, ID_RETRY, ID_TOO_YOUNG, ID_TRIES, KNOWN_FACE, KNOWN_PERSON, WENT_WRONG, answerOf } from '../src/answers.ts'
import * as device from '../src/device.ts'
import { readCard, strongest } from '../src/flows/cards.ts'
import { whoIs } from '../src/flows/inbox.ts'
import { makeProfile } from '../src/flows/profile.ts'
import { openProfiles, walletKey } from '../src/flows/profiles.ts'
import { NotPassed, TRIES, Unpaid, advance, ask, cancel, consentOf, creditLines, creditsOf, faceTryLeft, finish, idCheckOf, open, pay, priceText, resume, stampNumberAt, stepOf } from '../src/flows/verify.ts'
import { about } from '../src/services/verifier.ts'
import { Said } from '../src/words.ts'
import { OFFERS, OTHER_OFFERS, OTHER_REQUESTS } from './labels.ts'
import { ID_CREDITS, type World, checkHere, freshDevice, proveHere, world } from './world.ts'

/** What a step threw: it must refuse. */
async function thrown(p: Promise<unknown>): Promise<NotPassed> {
  try {
    await p
  } catch (err) {
    return err as NotPassed
  }
  throw new Error('it did not refuse')
}

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(freshDevice)

/** A person, by name (the stand-in embedder knows faces by name): a seed, and the id of the passkey that gave it. */
const person = (name: string) => ({ name, seed: newSeed(), id: `passkey-${crypto.randomUUID()}` })
type Person = ReturnType<typeof person>

/** The session the device keeps for the check under way. */
const session = () => device.under()!.session!

/** An ID check Didit declined, for the risks its warnings name, with a document Didit read. */
const idRefused = (risks: string[], document = doc('anyone')) => refusedWith(risks, { workflowId: ID_WORKFLOW, document })

/** The face check, as the box does it, Didit approving it. */
async function faceChecked(p: Person) {
  await open(w, p.id, () => stampNumberAt(w, p.seed))
  w.faceCheck.set(session(), passed(p.name))
  const step = await ask(w, p.id, await stampNumberAt(w, p.seed))
  if (step.at !== 'signed') throw new Error(`not signed: ${step.at}`)
  await finish(w, p.id, p.seed, step.stamps, proveHere)
}

/** The ID check's payment page: the payment made and kept, and its client secret, for the frame. */
async function sold(p: Person) {
  const got = await pay(w, p.id, await stampNumberAt(w, p.seed))
  if (!('clientSecret' in got)) throw new Error('stamps already, nothing sold')
  return got.clientSecret
}

/** Paid on the payment page, as the person does: the payment held at Stripe. */
async function paid(p: Person) {
  await sold(p)
  const payment = device.under()!.payment!
  w.payments!.pay(payment)
  return payment
}

/** The ID check's session opened, and what Didit came to for it. */
async function checked(p: Person, decision = passedId(p.name, doc(p.name))) {
  await open(w, p.id, () => stampNumberAt(w, p.seed))
  w.idCheck.set(session(), decision)
}

/** What asking for the stamp now throws. */
const refusal = (p: Person) => thrown(advance(w, p.id, p.seed, proveHere))

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

const box = { setup: true, idForSale: true, holdsStamp: false }

describe('the checks, as the box runs them', () => {
  test("each check's consent screen and the line to tick, word for word as the verifier serves them in GET /", async () => {
    expect(await consentOf(w, 'face')).toEqual({ consent: FACE_CONSENT, agree: AGREE })
    expect(await consentOf(w, 'id')).toEqual({ consent: CONSENT, agree: AGREE, cancelRight: CANCEL_RIGHT })
  })

  test("Get verified's credit lines, from the verifier's own gifts: the ID's as so many times the face's; none where no credits come", async () => {
    expect(await creditsOf(w), 'its gifts here, 10 and 100').toEqual({ face: 'Free credits', id: '10× the credits' })
    const at = (face: number, id: number, host = w.host) => creditLines({ gift: { face, id, host, sponsor: '' } }, w.host)
    expect(at(10, 25).id).toBe('2.5× the credits')
    expect(at(0, 100), 'no face gift: no line for it').toEqual({ id: 'More credits' })
    expect(at(10, 100, 'https://another.host'), 'a gift at another host comes to nothing here').toEqual({})
    expect(creditLines({}, w.host), 'no gift').toEqual({})
  })

  test('the price as GET / says it, in words: $5, and cents only where it has them', async () => {
    expect(await idCheckOf(w)).toEqual({ forSale: true, testPayments: true, price: '$5' })
    expect([priceText({ amount: 250, currency: 'usd' }), priceText({ amount: 500, currency: 'eur' }), priceText(null)]).toEqual(['$2.50', '€5', undefined])
  })

  test('paid on the payment page, checked: its ID stamp and its gift; then every profile shows both checks', async () => {
    const p = person('ada')
    await faceChecked(p)
    const tutor = await makeProfile(w, p.seed, OFFERS, proveHere)
    const seller = await makeProfile(w, p.seed, OTHER_OFFERS, proveHere)
    expect(await shown(tutor.address)).toEqual([w.keys.face])
    expect(device.checks()).toEqual(['face'])

    const wallet = (await walletKey(p.seed)).address
    const before = await w.balance(wallet)
    const secret = await sold(p)
    const unpaidOne = device.under()!.payment!
    expect(unpaidOne).toMatch(/^cs_test_/)
    expect(w.payments!.returnUrls.get(unpaidOne.split('.')[0]!), 'embedded: Stripe sends the person nowhere').toBeUndefined()
    expect(secret, "the payment page's client secret, for the box's frame").toBe(w.payments!.clientSecrets.get(unpaidOne.split('.')[0]!))
    expect(device.under()!.gift!.pending.blinds.length, "the gift's buy, of exactly the ID check's credits").toBe(ID_CREDITS)
    const unpaid = await open(w, p.id, () => stampNumberAt(w, p.seed)).catch((e: unknown) => e)
    expect(unpaid, 'not paid: the box shows the payment page again, for a new payment').toBeInstanceOf(Unpaid)
    expect(device.under()!.payment, 'the one never paid, dropped').toBeUndefined()

    // The payment page's message: paid. The box opens the session with the payment alone.
    const payment = await paid(p)
    await checked(p)
    expect(stepOf(p.id)).toEqual({ at: 'away' })
    expect(await advance(w, p.id, p.seed, proveHere), 'the stamp kept, every profile showing it').toBeNull()

    const gained = (await w.balance(wallet)) - before
    expect(gained, "the ID check's gift in the wallet, less the stamp's write").toBeGreaterThan(ID_CREDITS - 0.1)
    expect(gained).toBeLessThan(ID_CREDITS)
    expect(w.payments!.state(payment), 'its price taken').toBe('taken')
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

    // The ID stamp, kept with its list: its facts by the names GET / gives the ID key, the face's first.
    const folder = await openProfiles(p.seed, w.host)
    const idStamp = folder.stamps.find((text) => stampFromJson(JSON.parse(text)).verifier === w.keys.id)!
    const names = factListOf(stampFromJson(JSON.parse(idStamp))).map((fact) => fact.name)
    const listed = (await about(w.verifier)).id.facts!
    expect(names.slice(0, 2)).toEqual(['model', 'embedding'])
    expect(names.filter((name) => !listed.includes(name) && !name.startsWith('extra_fields.')), 'every fact a name GET / gives').toEqual([])
    // The device keeps three facts of it, and its entry's path, for Your checks: never the name, birth date or number.
    const path = folder.held.find((h) => h.stamp === idStamp)!.path
    expect(device.ids()).toEqual([{ kind: 'Passport', country: 'GBR', path }])
    expect(JSON.stringify({ ...localStorage })).not.toMatch(/Ada ada|1990-04-01|AB1234567/)
  })

  test('a new person can take the ID check first: it gives a face stamp too, from the same selfie', async () => {
    const p = person('grace')
    await paid(p)
    await checked(p)
    expect(await resume(w, p.id, p.seed, proveHere)).toEqual({ verified: true, labels: [] })
    expect(device.checks(), 'both, from one check').toEqual(['face', 'id'])
    expect(device.passkey()).toBe(p.id)
    expect((await openProfiles(p.seed, w.host)).stamps.length).toBe(2)
  })

  test("an ID it couldn't accept: Keep trying while the payment has a session left; on its last, Too many failed tries, nothing charged, the payment dropped", async () => {
    const p = person('hedy')
    await faceChecked(p)
    const payment = await paid(p)
    for (let i = 1; i <= TRIES; i++) {
      await checked(p, idRefused(['IMAGE_TOO_BLURRY']))
      expect(device.under()!.tries, 'each session opened, counted').toBe(i)
      const err = await refusal(p)
      expect([err.code, err.last]).toEqual(['id_unclear', i === TRIES])
      expect(answerOf(err, 'id', box)).toMatchObject(i < TRIES ? { ...ID_RETRY, buttons: [{ act: 'keep-trying' }], link: { act: 'skip' } } : { ...ID_TRIES, buttons: [{ act: 'close' }] })
      if (i < TRIES) expect(device.under()!.payment, 'Keep trying: the same payment').toBe(payment)
    }
    expect(stepOf(p.id)).toEqual({ at: 'start' })
    expect(device.under()!.payment, 'the payment dropped').toBeUndefined()
    expect(w.payments!.state(payment), 'its hold cancelled at the verifier').toBe('cancelled')
  })

  test('Skip, you won\'t be charged: the payment cancelled at the verifier, and dropped here', async () => {
    const p = person('emmy')
    await faceChecked(p)
    const payment = await paid(p)
    await checked(p, idRefused(['LOW_FACE_MATCH_SIMILARITY']))
    expect((await refusal(p)).code).toBe('face_mismatch')
    await cancel(w, p.id)
    expect(w.payments!.state(payment)).toBe('cancelled')
    expect(device.under()?.payment).toBeUndefined()
    await cancel(w, p.id)
  })

  test('a person seen before, under another passkey: You\'re already verified with another passkey, nothing charged; Delete this passkey only while it holds no stamp', async () => {
    const p = person('rosalind')
    const payment = await paid(p)
    await checked(p, idRefused(['POSSIBLE_DUPLICATED_USER']))
    const err = await refusal(p)
    expect([err.code, err.last]).toEqual(['known_person', true])
    expect(w.payments!.state(payment), 'the hold cancelled at once').toBe('cancelled')
    expect(device.under()?.payment).toBeUndefined()
    expect(answerOf(err, 'id', box)).toMatchObject({ ...KNOWN_PERSON, buttons: [{ act: 'delete-passkey', look: 'danger' }], link: { act: 'contact' } })
    expect(answerOf(err, 'id', { ...box, holdsStamp: true }).valueOf()).toMatchObject({ buttons: [{ act: 'close' }] })
  })

  test('a birth date under 18 on the ID: Forest is for people 18 and older, nothing charged; one it could not read, an ID it couldn\'t accept', async () => {
    const p = person('young')
    await paid(p)
    await checked(p, idRefused(['MINIMUM_AGE_NOT_MET'], doc('young', { date_of_birth: `${new Date().getUTCFullYear() - 15}-01-01` })))
    const err = await refusal(p)
    expect([err.code, err.last]).toEqual(['too_young', true])
    expect(answerOf(err, 'id', box)).toMatchObject({ ...ID_TOO_YOUNG, buttons: [{ act: 'close' }] })
    freshDevice()
    const q = person('unread')
    await paid(q)
    await checked(q, idRefused(['MINIMUM_AGE_NOT_MET'], doc('unread', { date_of_birth: 'smudged' })))
    expect((await refusal(q)).code).toBe('id_unclear')
  })

  test('the face check: a face seen before, under 21, or any other refusal, each in its answer; its one free try then used, and the next open says so', async () => {
    const cases = [
      [['DUPLICATED_FACE'], 'known_face', KNOWN_FACE],
      [['AGE_BELOW_MINIMUM'], 'too_young', FACE_TOO_YOUNG],
      [['LOW_LIVENESS_SCORE'], 'face_unclear', FACE_TRIES],
      [[], 'other', FACE_TRIES],
    ] as const
    for (const [risks, code, said] of cases) {
      freshDevice()
      const p = person(`face-${code}`)
      const n = await stampNumberAt(w, p.seed)
      expect(await faceTryLeft(w, n)).toBe(true)
      await open(w, p.id, () => stampNumberAt(w, p.seed))
      w.faceCheck.set(session(), refusedWith([...risks]))
      const err = await thrown(ask(w, p.id, n))
      expect(err.code, code).toBe(code)
      expect(answerOf(err, 'face', box), code).toMatchObject(said)
      expect(await faceTryLeft(w, n), 'its try used').toBe(false)
      const again = await thrown(open(w, p.id, () => stampNumberAt(w, p.seed)))
      expect(again.code).toBe('face_tries_used')
      expect(answerOf(again, 'face', box)).toMatchObject({ ...FACE_TRIES, buttons: [{ act: 'verify-id', look: 'primary' }] })
    }
  })

  test('a face seen before, from setup: Use my other passkey first, then Verify with your ID; from You, Verify with your ID alone; with no ID for sale, Close', () => {
    const err = new NotPassed('known_face', 'face')
    expect(answerOf(err, 'face', box)).toMatchObject({ buttons: [{ act: 'other-passkey', look: 'primary' }, { act: 'verify-id', look: 'outline' }] })
    expect(answerOf(err, 'face', { ...box, setup: false })).toMatchObject({ buttons: [{ act: 'verify-id', look: 'primary' }] })
    expect(answerOf(err, 'face', { ...box, setup: false, idForSale: false })).toMatchObject({ buttons: [{ act: 'close' }] })
  })

  test("the app's or a service's error, or a session the verifier lost: Something went wrong, Try again; expired, or a payment gone: back to Get verified", () => {
    for (const err of [new Error('network'), new NotPassed('wrong_workflow', 'face'), new NotPassed('session_used', 'id'), new NotPassed('unknown_session', 'face')]) expect(answerOf(err, 'face', box)).toMatchObject({ ...WENT_WRONG, buttons: [{ act: 'try-again' }] })
    for (const code of ['expired', 'not_paid', 'payment_used']) expect(answerOf(new NotPassed(code, 'id', true), 'id', box)).toBe('back')
  })

  test('a hold over before its session opened: back to Get verified, the payment dropped, the ID ready to pay', async () => {
    const p = person('alan')
    await faceChecked(p)
    const payment = await paid(p)
    await checked(p, idRefused(['IMAGE_TOO_DARK']))
    await refusal(p)
    await w.payments!.cancel(payment)
    const err = await thrown(open(w, p.id, () => stampNumberAt(w, p.seed)))
    expect([err.code, answerOf(err, 'id', box)]).toEqual(['not_paid', 'back'])
    expect(device.under()!.payment).toBeUndefined()
  })

  test('stamps signed and never kept (the answer lost after the signing): the ID check asks them back first, keeps them, and sells nothing', async () => {
    const p = person('chien-shiung')
    await faceChecked(p)
    await paid(p)
    await checked(p)
    const n = await stampNumberAt(w, p.seed)
    expect((await ask(w, p.id, n)).at, 'signed, then its answer lost before it was kept').toBe('signed')
    device.endUnder()
    expect(device.checks()).toEqual(['face'])
    const got = await pay(w, p.id, n)
    expect(got, 'its stamps handed back, and no payment page').toEqual({ stamps: [expect.any(String), expect.any(String)] })
    expect(device.under()?.payment, 'no payment made').toBeUndefined()
    await finish(w, p.id, p.seed, (got as { stamps: string[] }).stamps, proveHere)
    expect(device.checks()).toEqual(['face', 'id'])
    expect((await openProfiles(p.seed, w.host)).stamps, 'the face stamp kept once').toHaveLength(2)
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

  test("a seed with no stamp and no profile: Start's standing says never, so a passkey met there can be deleted", async () => {
    const p = person('nobody')
    expect(await resume(w, p.id, p.seed, proveHere)).toEqual({ verified: false, step: { at: 'choose' }, never: true })
  })
})

test('a verifier with no Stripe: GET / says the ID check is not for sale, and no test payments; a tap that comes anyway, one quiet line', async () => {
  const off = await world({ forSale: false })
  try {
    expect(await idCheckOf(off)).toEqual({ forSale: false, testPayments: false })
    const err = await pay(off, 'passkey-x', 1n).catch((e: unknown) => e)
    expect([(err as Said).message, (err as Said).red]).toEqual(["The ID check isn't available yet.", false])
  } finally {
    await off.close()
  }
})
