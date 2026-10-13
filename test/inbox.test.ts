// Offers, reviews and the inbox against one of each stand-in (test/stand-ins.ts, `world`), on
// loopback, in Node, as the sheets and the inbox screen run them: an offer posted, changed and
// removed; a review the same; a thread between two people's profiles, there and back, each side's
// copy in its own inbox, and the count that leaves out a profile's own copies; a message to a
// profile on a host the app does not reach; requests sent by an access key, approved and declined,
// the bodies that are not requests, and every field of what approving one signs; a grant kept in
// the vault, and not counted; and a write short of credits, topped up from the vault once, until
// the vault has none.

import { readFile } from 'node:fs/promises'

import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { inboxKey, mainKey } from '../standard/keys/src/index.ts'
import { type Body, b64u, deliver, hostsRecord, keyFromPrivate, ownerRecord, permissionsRecord, readProfile } from '../standard/records/src/index.ts'
import { message } from '../standard/records/src/private.ts'
import { DOLLAR, localTime, ownRecords } from '../src/cards.ts'
import { type Opened, approve, fieldsOf, grantsOf, knownHosts, openInbox, requestOf, send, threadsOf, toSign, withOf } from '../src/flows/messages.ts'
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
import { saveSettings } from '../src/settings.ts'
import { creditsOf, keepGrants, openVault, saveVault, vaultKeys, withCredits } from '../src/vault.ts'
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
  // The vault's host, where a write short of credits is topped up from, is the settings'.
  saveSettings(w.settings)
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

describe('a profile on another host', () => {
  test("a card whose hosts record names only hosts the app does not reach: the message is not sent", async () => {
    const far = await mainKey(makeSeed().seed, 'tutoring/seller')
    w.host.balances.set(far.address, 1)
    const now = Date.now()
    const card = { market: 'tutoring', role: 'seller', inboxKey: (await inboxKey(far.privateKey)).recipient, inbox: { senders: { issuer: w.issuer.issuer.key } }, createdAt: new Date(now).toISOString() }
    await publishRecords([w.settings.host], [hostsRecord(far, ['http://127.0.0.1:9'], now), ownerRecord(far, 'profile', card, now)])
    await expect(send(buyer.seed, buyer.p, far.address, { text: 'Hello?' }, known())).rejects.toThrow("That host isn't reachable from this app yet.")
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

describe('what a request signs', () => {
  test('every field, the path or recipient first; Approve signs what the card showed', async () => {
    const main = await mainKey(seller.seed, seller.p.label)
    const helper = keyFromPrivate(crypto.getRandomValues(new Uint8Array(32)))
    const view = await readProfile(seller.p.hosts, seller.p.address, Date.now())
    await publishRecords(seller.p.hosts, [permissionsRecord(main, [...view.access, { key: helper.address, scope: 'message' }], Date.now())])
    const card = view.current.get('profile')!.record.body!
    const asHelper = { key: helper, from: seller.p.address, host: seller.p.hosts[0]! }
    const offer = { direction: 'offer', description: 'Biology, one hour', price: { amount: '28', mint: DOLLAR, per: 'hour' } }
    const at = Date.now()
    const bodies: Body[] = [
      { request: 'post-offer', offer, id: 'bio' },
      { request: 'remove-offer', id: 'bio' },
      { request: 'send', to: buyer.p.address, text: 'See you at six.' },
    ]
    for (const [i, body] of bodies.entries()) {
      await deliver(seller.p.hosts, [await message(asHelper, seller.p.address, body, at + i, card)])
    }
    const inbox = await openInbox(seller.seed, seller.p)
    const asked = inbox.messages.filter((m) => m.key === helper.address).map((m) => requestOf(m, seller.p.address, inbox.listed)!)
    const now = Date.parse('2026-10-13T12:00:00.000Z')
    const [post, remove, sendIt] = asked.map((r) => toSign(r, inbox.own, now)!)
    expect(fieldsOf(post!)).toEqual([
      ['path', 'offer/bio'],
      ['description', 'Biology, one hour'],
      ['direction', 'offer'],
      ['price.amount', '28'],
      ['price.mint', 'devnet dollar'],
      ['price.per', 'hour'],
      ['createdAt', localTime(now)],
    ])
    // Another dollar by its mint; text that is not a time, as it is.
    expect(fieldsOf({ path: 'offer/x', body: { description: '2026-10-13', price: { amount: '1', mint: 'So11111111111111111111111111111111111111112', per: 'job' } } })).toEqual([
      ['path', 'offer/x'],
      ['description', '2026-10-13'],
      ['price.amount', '1'],
      ['price.mint', 'So11111111111111111111111111111111111111112'],
      ['price.per', 'job'],
    ])
    expect(fieldsOf(remove!)).toEqual([['path', 'offer/bio'], ['body', 'none: the record is removed']])
    expect(fieldsOf(sendIt!)).toEqual([['to', buyer.p.address], ['text', 'See you at six.']])

    await approve(seller.seed, seller.p, asked[0]!, known(), post)
    const written = (await readProfile(seller.p.hosts, seller.p.address, Date.now())).current.get('offer/bio')!.record.body
    expect(written).toEqual(post!.body)
    // Over the record there now, a request with no createdAt keeps the record's.
    const again = (await openInbox(seller.seed, seller.p)).own
    expect((toSign(asked[0]!, again, now + 60_000) as { body: Body }).body.createdAt).toBe('2026-10-13T12:00:00.000Z')
    // An empty object is a field too.
    expect(fieldsOf({ path: 'review/x', body: { subject: buyer.p.address, ratings: {} } })).toEqual([['path', 'review/x'], ['subject', buyer.p.address], ['ratings', '{}']])
    // A kind the app does not do signs nothing.
    expect(toSign({ id: 'x', kind: 'pay', params: { offer: 'a/offer/b' } }, {})).toBeNull()
  })
})

describe('grants', () => {
  test('a grant that reaches an inbox is kept in the vault, once, shown in no thread, and not counted', async () => {
    const giver = await mainKey(buyer.seed, buyer.p.label)
    const card = (await readProfile(seller.p.hosts, seller.p.address, Date.now())).current.get('profile')!.record.body!
    const grant = { key: b64u.encode(crypto.getRandomValues(new Uint8Array(32))), folder: buyer.p.address, scope: 'write' as const, paths: ['offer'], from: buyer.p.address, since: Date.now(), note: 'For your AI' }
    // One that says another profile handed it over is not taken as a grant.
    const claimed = { ...grant, key: b64u.encode(crypto.getRandomValues(new Uint8Array(32))), from: seller.p.address }
    await sendPulls(await signPulls(seller.seed, [seller.p]))
    const counted = inboxCounts()[seller.p.address]!.count
    await deliver(seller.p.hosts, [await message(giver, seller.p.address, { grant }, Date.now(), card), await message(giver, seller.p.address, { grant: claimed }, Date.now() + 1, card)])
    await deliver(seller.p.hosts, [await message(giver, seller.p.address, { text: 'And a word.' }, Date.now() + 2, card)])
    await sendPulls(await signPulls(seller.seed, [seller.p]))
    expect(inboxCounts()[seller.p.address]!.count).toBe(counted + 1)

    const inbox = await openInbox(seller.seed, seller.p)
    expect(grantsOf(inbox.messages)).toEqual([grant])
    expect(threadsOf(inbox.messages, seller.p.address).flatMap((t) => t.messages).some((m) => 'grant' in m.body)).toBe(false)

    const keys = await vaultKeys(seller.seed)
    const before = (await openVault([w.settings.host], keys))!.vault
    expect(await keepGrants(seller.seed, w.settings.host, grantsOf(inbox.messages))).toBe(1)
    expect(await keepGrants(seller.seed, w.settings.host, grantsOf(inbox.messages))).toBe(0)
    const vault = (await openVault([w.settings.host], keys))!.vault
    expect(vault).toEqual({ ...before, grants: [grant] })
  })
})

describe('credits', () => {
  test('a write its folder cannot pay for: one more of the vault\'s credits goes in, silently; with none left, no writes left', async () => {
    const keys = await vaultKeys(seller.seed)
    const hostCredits = async () => creditsOf((await openVault([w.settings.host], keys))!.vault).filter((c) => c.service === w.settings.host).length
    const before = await hostCredits()
    expect(before).toBeGreaterThan(0)
    w.host.balances.set(seller.p.address, 0)
    await writeOffer(seller.seed, seller.p, 'paid', { description: 'Paid for from the vault' })
    expect((await ownRecords(seller.p)).offers.map((o) => o.path)).toContain('offer/paid')
    expect(await hostCredits()).toBe(before - 1)
    expect(w.host.balances.get(seller.p.address)).toBeCloseTo(0.99)

    // The vault with no host credit left: the write is refused, in plain words.
    const read = (await openVault([w.settings.host], keys))!
    await saveVault(keys, read.hosts, withCredits(read.vault, creditsOf(read.vault).filter((c) => c.service !== w.settings.host)), read.time)
    w.host.balances.set(seller.p.address, 0)
    await expect(writeOffer(seller.seed, seller.p, 'unpaid', { description: 'Not paid for' })).rejects.toThrow('This profile has no writes left.')
    expect((await ownRecords(seller.p)).offers.map((o) => o.path)).not.toContain('offer/unpaid')
    w.host.balances.set(seller.p.address, 1)
  })
})
