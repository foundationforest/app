// Offers, reviews and the inbox against one of each stand-in (test/stand-ins.ts, `world`), on
// loopback, in Node, as the sheets and the inbox screen run them: an offer posted, changed and
// removed; a review the same; a thread between two people's profiles, there and back, each side's
// copy in its own inbox, and the count that leaves out a profile's own copies; and requests sent by
// an access key, approved and declined, and the bodies that are not requests.

import { readFile } from 'node:fs/promises'

import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { mainKey } from '../standard/keys/src/index.ts'
import { type Body, deliver, keyFromPrivate, permissionsRecord, readProfile } from '../standard/records/src/index.ts'
import { message } from '../standard/records/src/private.ts'
import { DOLLAR, ownRecords } from '../src/cards.ts'
import { type Opened, approve, knownHosts, openInbox, requestOf, send, threadsOf, withOf } from '../src/flows/messages.ts'
import { makeProfile } from '../src/flows/profile.ts'
import { freshId, offerBody, writeOffer, writeReview } from '../src/flows/records.ts'
import { faceCheck } from '../src/flows/setup.ts'
import { markRead, sendPulls, signPulls } from '../src/inbox.ts'
import type { LocalProfile } from '../src/local.ts'
import { inboxCounts } from '../src/local.ts'
import type { Artifact } from '../src/proof/circuit.ts'
import { type ProveRequest, prove } from '../src/proof/prove.ts'
import { makeSeed } from '../src/seed/seed.ts'
import { publishRecords } from '../src/services/host.ts'
import { world } from './stand-ins.ts'

const load = async (artifact: Artifact) => new Uint8Array(await readFile(new URL(`../public${artifact.path}`, import.meta.url)))
const proveHere = (request: ProveRequest) => prove(request, load)

// The inbox's counts are kept in localStorage, which Node has not.
;(globalThis as { localStorage?: Storage }).localStorage ??= (() => {
  const store = new Map<string, string>()
  return { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k), clear: () => store.clear(), key: () => null, length: 0 } as Storage
})()

let w: Awaited<ReturnType<typeof world>>
type Person = { seed: Uint8Array; p: LocalProfile }
let seller: Person
let buyer: Person
const known = () => knownHosts(w.settings.host, [seller.p, buyer.p])

/** A person through setup's face check, with one profile, which the stand-in host knows holds a row. */
async function person(label: string): Promise<Person> {
  const { seed } = makeSeed()
  await faceCheck(seed, w.settings, {}, (url) => void fetch(url, { redirect: 'manual' }), 'https://app.example/back')
  const [p] = await makeProfile(seed, label, w.settings, proveHere)
  w.host.rows.add(p!.address)
  return { seed, p: p! }
}

beforeAll(async () => {
  w = await world()
  seller = await person('tutoring/seller')
  buyer = await person('tutoring/buyer')
}, 240_000)
afterAll(() => w.close())

describe('the offer sheet', () => {
  test('posted, changed and removed, with the main key', async () => {
    const id = freshId()
    expect(id).toMatch(/^[0-9a-f]{16}$/)
    await writeOffer(seller.seed, seller.p, id, { description: 'Maths, one hour\nOnline.', price: { amount: '25', per: 'hour' } })
    const [posted] = (await ownRecords(seller.p)).offers
    expect(posted).toMatchObject({ path: `offer/${id}`, title: 'Maths, one hour', price: '$25 / hour' })
    expect(posted!.body).toEqual({ direction: 'offer', description: 'Maths, one hour\nOnline.', price: { amount: '25', mint: DOLLAR, per: 'hour' }, createdAt: posted!.body.createdAt })
    const view = await readProfile(seller.p.hosts, seller.p.address, Date.now())
    expect(view.current.get(`offer/${id}`)!.record.by).toBeUndefined()

    await writeOffer(seller.seed, seller.p, id, { description: 'Maths, ninety minutes' })
    const [changed] = (await ownRecords(seller.p)).offers
    expect(changed).toMatchObject({ title: 'Maths, ninety minutes', price: null })
    expect(changed!.body.createdAt).toBe(posted!.body.createdAt)

    await writeOffer(seller.seed, seller.p, id, null)
    expect((await ownRecords(seller.p)).offers).toEqual([])
  })

  test("a buyer's asks for something; what the sheet does not show is kept", async () => {
    await writeOffer(buyer.seed, buyer.p, 'help', { description: 'Help with physics', price: { amount: '40', per: 'job' } })
    expect((await ownRecords(buyer.p)).offers[0]).toMatchObject({ title: 'Help with physics', price: '$40', body: { direction: 'request' } })
    const before = { direction: 'offer', description: 'Old', remote: true, price: { amount: '1', mint: DOLLAR, per: 'day' }, createdAt: '2026-01-01T00:00:00.000Z' }
    expect(offerBody({ description: 'New' }, 'seller', before)).toEqual({ direction: 'offer', description: 'New', remote: true, createdAt: '2026-01-01T00:00:00.000Z' })
  })
})

describe('the review sheet', () => {
  test('posted, changed and removed, with the main key', async () => {
    await writeReview(seller.seed, seller.p, 'one', { subject: buyer.p.address, score: '8.5', text: ' On time. ' })
    expect((await ownRecords(seller.p)).written).toMatchObject([{ path: 'review/one', subject: buyer.p.address, score: '8.5', text: 'On time.' }])
    await writeReview(seller.seed, seller.p, 'one', { subject: buyer.p.address, score: '10', text: '' })
    const [changed] = (await ownRecords(seller.p)).written
    expect(changed).toMatchObject({ score: '10', text: null })
    expect('text' in changed!.body).toBe(false)
    await writeReview(seller.seed, seller.p, 'one', null)
    expect((await ownRecords(seller.p)).written).toEqual([])
  })
})

const texts = (ms: Opened[]) => ms.map((m) => [m.from === seller.p.address ? 'seller' : 'buyer', m.body.text])

describe('a thread', () => {
  test('there and back between two profiles; each side keeps a copy of what it sent', async () => {
    await send(buyer.seed, buyer.p, seller.p.address, { text: 'Is Tuesday free?' }, known())

    // The seller's count leaves out its own copies; the buyer's message counts.
    await sendPulls(await signPulls(seller.seed, [seller.p]))
    expect(inboxCounts()[seller.p.address]?.count).toBe(1)

    let inbox = await openInbox(seller.seed, seller.p)
    markRead(seller.p.address, inbox.cursors)
    expect(inboxCounts()[seller.p.address]?.count).toBe(0)
    let threads = threadsOf(inbox.messages, seller.p.address)
    expect(threads.map((t) => t.with)).toEqual([buyer.p.address])
    expect(texts(threads[0]!.messages)).toEqual([['buyer', 'Is Tuesday free?']])

    await send(seller.seed, seller.p, buyer.p.address, { text: 'Tuesday at six.' }, known())
    await sendPulls(await signPulls(seller.seed, [seller.p]))
    expect(inboxCounts()[seller.p.address]?.count).toBe(0)

    // Each side reads the whole thread from its own inbox: the other's messages and its own copies.
    inbox = await openInbox(seller.seed, seller.p)
    threads = threadsOf(inbox.messages, seller.p.address)
    expect(threads.map((t) => t.with)).toEqual([buyer.p.address])
    expect(texts(threads[0]!.messages)).toEqual([['buyer', 'Is Tuesday free?'], ['seller', 'Tuesday at six.']])
    expect(threads[0]!.messages[1]!.body).toEqual({ text: 'Tuesday at six.', to: buyer.p.address })

    const theirs = threadsOf((await openInbox(buyer.seed, buyer.p)).messages, buyer.p.address)
    expect(theirs.map((t) => t.with)).toEqual([seller.p.address])
    expect(texts(theirs[0]!.messages)).toEqual([['buyer', 'Is Tuesday free?'], ['seller', 'Tuesday at six.']])

    // Pulled again after its cursors: only what is new.
    expect((await openInbox(seller.seed, seller.p, inbox.cursors)).messages).toEqual([])
  })
})

describe('requests', () => {
  test('sent by an access key the profile lists: approved with the main key, once; the rest plain messages', async () => {
    const main = await mainKey(seller.seed, seller.p.label)
    const helper = keyFromPrivate(crypto.getRandomValues(new Uint8Array(32)))
    await publishRecords(seller.p.hosts, [permissionsRecord(main, [{ key: helper.address, scope: 'message' }], Date.now())])
    const card = (await readProfile(seller.p.hosts, seller.p.address, Date.now())).current.get('profile')!.record.body!
    const asHelper = { key: helper, from: seller.p.address, host: seller.p.hosts[0]! }
    const offer = { direction: 'offer', description: 'Chemistry, one hour', price: { amount: '30', mint: DOLLAR, per: 'hour' } }
    const bodies: Body[] = [
      { request: 'post-offer', offer },
      { request: 'send', to: buyer.p.address, text: 'Thursday works too.' },
      { request: 'pay', offer: `${seller.p.address}/offer/x`, units: 2 },
      { request: 'post-offer', offer: { description: 'no direction' } },
      { request: 'sell-everything' },
      { text: 'A note from the helper.' },
    ]
    for (const [i, body] of bodies.entries()) {
      const [took] = await deliver(seller.p.hosts, [await message(asHelper, seller.p.address, body, Date.now() + i, card)])
      expect(took!.results[0]).toMatchObject({ ok: true })
    }
    // From someone else, a request is a plain message.
    await send(buyer.seed, buyer.p, seller.p.address, { request: 'post-offer', offer }, known())

    const inbox = await openInbox(seller.seed, seller.p)
    expect(inbox.listed).toEqual([helper.address])
    const asked = inbox.messages.map((m) => requestOf(m, seller.p.address, inbox.listed)?.kind ?? null)
    expect(asked.filter(Boolean)).toEqual(['post-offer', 'send', 'pay'])
    const helpers = inbox.messages.filter((m) => m.key === helper.address)
    expect(helpers).toHaveLength(6)
    expect(new Set(helpers.map((m) => withOf(m, seller.p.address)))).toEqual(new Set([helper.address]))
    const fromBuyer = inbox.messages.find((m) => m.from === buyer.p.address && 'request' in m.body)!
    expect(requestOf(fromBuyer, seller.p.address, inbox.listed)).toBeNull()

    // A key the profile no longer lists asks for nothing.
    expect(requestOf(helpers[0]!, seller.p.address, [])).toBeNull()

    const post = requestOf(helpers[0]!, seller.p.address, inbox.listed)!
    await approve(seller.seed, seller.p, post, known())
    await approve(seller.seed, seller.p, post, known())
    const offers = (await ownRecords(seller.p)).offers.filter((o) => o.title === 'Chemistry, one hour')
    expect(offers).toHaveLength(1)
    expect(offers[0]!.path).toBe(`offer/${post.id.slice(0, 16)}`)
    expect(offers[0]!.body.createdAt).toEqual(expect.any(String))

    await approve(seller.seed, seller.p, requestOf(helpers[1]!, seller.p.address, inbox.listed)!, known())
    const buyerSees = (await openInbox(buyer.seed, buyer.p)).messages.find((m) => m.body.text === 'Thursday works too.')!
    expect(buyerSees).toMatchObject({ from: seller.p.address, to: buyer.p.address })
    expect(buyerSees.key).toBeUndefined()

    await expect(approve(seller.seed, seller.p, requestOf(helpers[2]!, seller.p.address, inbox.listed)!, known())).rejects.toThrow(/not in this app/)
  })
})
