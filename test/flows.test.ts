// The app's flows against one of each stand-in (test/stand-ins.ts, `world`), on loopback, in Node:
// setup's face check with the welcome gift and the first vault, and one taken up again from what it
// kept; one done again elsewhere, its gift given before, so no credits; a vault with its credits at
// the top, as an older app wrote it, moved; the vault's own folder topped up from its credits when
// a host refuses a vault write for want of them; a profile made, its proof made as the worker makes
// it; made again after a stop; signing in with the passkey's seed; the card's own records and what
// the index says; an access key removed; access keys made, each acting as its scope allows, and the
// paste; access keys that a host would not take for want of credits, with none left in the vault,
// taken out again. Offers, reviews, the inbox, requests and grants: test/inbox.test.ts. The seed
// from the passkey: test/seed.test.ts. The screens around them, in a browser: test/browser/app.ts.

import { createPublicKey, randomBytes, verify } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { VersionedTransaction } from '@solana/web3.js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { inboxKey, mainKey, newSeed } from '../standard/keys/src/index.ts'
import { accessRecord, b64u, deliver, keyFromPrivate, ownerRecord, permissionsRecord, pull, pullRequest, readProfile } from '../standard/records/src/index.ts'
import { makePrivate, message, openMessage, openPrivate } from '../standard/records/src/private.ts'
import { makeAccessKeys, pasteOf, removeAccessKey } from '../src/flows/access.ts'
import { makeProfile } from '../src/flows/profile.ts'
import { signIn } from '../src/flows/signin.ts'
import { type Check, type Kept, collectGift, faceCheck, giftGiven } from '../src/flows/setup.ts'
import { indexed, ownRecords, priceText, roleWord, titleOf, words } from '../src/cards.ts'
import type { Artifact } from '../src/proof/circuit.ts'
import { type ProveRequest, prove } from '../src/proof/prove.ts'
import { pack, unpack } from '../src/seed/seed.ts'
import { publishRecords } from '../src/services/host.ts'
import { saveSettings } from '../src/settings.ts'
import { type AppVault, NoVaultWrites, creditsOf, openVault, saveVault, vaultKeys, withCredits } from '../src/vault.ts'
import { MARKETS, world } from './stand-ins.ts'

const load = async (artifact: Artifact) => new Uint8Array(await readFile(new URL(`../public${artifact.path}`, import.meta.url)))
const proveHere = (request: ProveRequest) => prove(request, load)
const LABEL = 'tutoring/seller'

// Settings are kept in localStorage, which Node has not: signing in saves the vault's there.
;(globalThis as { localStorage?: Storage }).localStorage ??= (() => {
  const store = new Map<string, string>()
  return { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k), clear: () => store.clear(), key: () => null, length: 0 } as Storage
})()

let w: Awaited<ReturnType<typeof world>>
// A passkey's PRF secret, as the app uses it: 32 bytes, the seed as it is.
const seed = newSeed()

// The vault's host, where a write short of credits is topped up from, is the settings'.
beforeAll(async () => {
  w = await world()
  saveSettings(w.settings)
})
afterAll(() => w.close())

const hostCredits = (vault: AppVault) => creditsOf(vault).filter((c) => c.service === w.settings.host).length
const payerCredits = (vault: AppVault) => creditsOf(vault).filter((c) => c.service === w.settings.registryPayer).length

describe('setup', () => {
  test('the face check: a note once the check is done, the gift collected, the first vault written', async () => {
    const check: Check = {}
    const opened: string[] = []
    const vault = await faceCheck(seed, w.settings, check, (url) => {
      opened.push(url)
      void fetch(url, { redirect: 'manual' })
    }, 'https://app.example/back')
    expect(opened).toHaveLength(1)
    expect(w.issuer.sessions.get(opened[0]!.split('/').pop()!)).toBe('https://app.example/back')
    expect(vault.issuerNotes).toEqual([{ issuer: 'issuer.test', note: check.note }])
    expect(vault.settings).toEqual({ forestApp: { ...w.settings, credits: creditsOf(vault) } })
    expect('credits' in vault).toBe(false)
    // 2 registrations and 3 host credits; one host credit went into the vault's own folder.
    expect([payerCredits(vault), hostCredits(vault)]).toEqual([2, 2])

    const keys = await vaultKeys(seed)
    const read = await openVault([w.settings.host], keys)
    expect(read?.vault).toEqual(vault)
    expect(read?.hosts).toEqual([w.settings.host])
    expect(w.host.balances.get(keys.key.address)).toBeCloseTo(0.99)

    // Coming back after the stop: nothing is asked again.
    const sessions = w.issuer.sessions.size
    expect(await faceCheck(seed, w.settings, check, () => expect.unreachable(), 'https://app.example/back')).toBe(vault)
    expect(w.issuer.sessions.size).toBe(sessions)
  })

  test('a gift the issuer gave before gives no credits; a vault there already keeps what it held', async () => {
    expect(await collectGift([], { error: 'given' })).toEqual([])
    const keys = await vaultKeys(seed)
    const before = (await openVault([w.settings.host], keys))!.vault
    const again = await faceCheck(seed, w.settings, {}, (url) => void fetch(url, { redirect: 'manual' }), 'https://app.example/back')
    expect(again.issuerNotes).toEqual(before.issuerNotes)
    expect(creditsOf(again)).toEqual(creditsOf(before))
  })

  test('stopped before the vault: what it kept brings back the gift, with no new face check', async () => {
    const other = newSeed()
    // Kept as the device keeps it: JSON, its bytes as base64url.
    let kept: Kept = {}
    const keep = async (k: Kept) => void (kept = unpack(pack(k)))
    // The vault's first write is refused: setup stops after the note, its tickets kept.
    const stop = w.host.refuse(1)
    await expect(faceCheck(other, w.settings, {}, (url) => void fetch(url, { redirect: 'manual' }), 'https://app.example/back', { keep })).rejects.toThrow()
    stop()
    expect(Object.keys(kept.tickets ?? {}).sort()).toEqual(['host', 'registryPayer'])
    // Taken up again, as the app does after a reload: from what was kept alone.
    const sessions = w.issuer.sessions.size
    const vault = await faceCheck(other, w.settings, unpack(pack(kept)), () => expect.unreachable(), 'https://app.example/back', { keep })
    expect(w.issuer.sessions.size).toBe(sessions)
    expect([payerCredits(vault), hostCredits(vault)]).toEqual([2, 2])
    expect((await openVault([w.settings.host], await vaultKeys(other)))!.vault).toEqual(vault)
  })

  test('done again elsewhere, its first buys lost: the gift given, so no credits; the vault written once its folder can pay for it', async () => {
    const other = newSeed()
    const keys = await vaultKeys(other)
    // The first try stops at the vault, after the note and its tickets, on a device since lost.
    const stop = w.host.refuse(1)
    await expect(faceCheck(other, w.settings, {}, (url) => void fetch(url, { redirect: 'manual' }), 'https://app.example/back')).rejects.toThrow()
    stop()
    // Again from nothing, as Sign in goes on to it: new buys, so the gift was given; no credits, and the vault's folder holds none.
    const check: Check = {}
    await expect(faceCheck(other, w.settings, check, (url) => void fetch(url, { redirect: 'manual' }), 'https://app.example/back')).rejects.toThrow(NoVaultWrites)
    expect(giftGiven(check)).toBe(true)
    expect(check.credits).toEqual([])
    expect(await openVault([w.settings.host], keys)).toBeNull()
    // A credit put into the vault's folder: taken up again, the vault is written, with no credits in it.
    w.host.balances.set(keys.key.address, 1)
    const vault = await faceCheck(other, w.settings, check, () => expect.unreachable(), 'https://app.example/back')
    expect(creditsOf(vault)).toEqual([])
    expect(vault.issuerNotes).toEqual([{ issuer: 'issuer.test', note: check.note }])
    expect((await openVault([w.settings.host], keys))!.vault).toEqual(vault)
  })

  test('a vault with its credits at the top, as an older app wrote it: moved into the settings when read', async () => {
    const other = newSeed()
    const keys = await vaultKeys(other)
    const vault = await faceCheck(other, w.settings, {}, (url) => void fetch(url, { redirect: 'manual' }), 'https://app.example/back')
    const credits = creditsOf(vault)
    const read = (await openVault([w.settings.host], keys))!
    await saveVault(keys, read.hosts, { ...vault, credits, settings: { forestApp: w.settings, other: { kept: true } } }, read.time)
    const moved = (await openVault([w.settings.host], keys))!.vault
    expect('credits' in moved).toBe(false)
    expect(moved.settings).toEqual({ forestApp: { ...w.settings, credits }, other: { kept: true } })
  })
})

describe("the vault's own folder", () => {
  test("spent: one of the vault's host credits goes in, and the vault is written without it; with none left, no writes left", async () => {
    const other = newSeed()
    const keys = await vaultKeys(other)
    await faceCheck(other, w.settings, {}, (url) => void fetch(url, { redirect: 'manual' }), 'https://app.example/back')
    let read = (await openVault([w.settings.host], keys))!
    expect(hostCredits(read.vault)).toBe(2)
    w.host.balances.set(keys.key.address, 0)
    const written = await saveVault(keys, read.hosts, read.vault, read.time)
    expect(hostCredits(written)).toBe(1)
    expect(w.host.balances.get(keys.key.address)).toBeCloseTo(0.99)
    read = (await openVault([w.settings.host], keys))!
    expect(read.vault).toEqual(written)

    w.host.balances.set(keys.key.address, 0)
    const none = withCredits(read.vault, creditsOf(read.vault).filter((c) => c.service !== w.settings.host))
    await expect(saveVault(keys, read.hosts, none, read.time)).rejects.toThrow('Your vault has no writes left.')
  })
})

describe('a profile', () => {
  test('made: the row through the registry payer, signed by its main key; its folder; the vault after', async () => {
    const profiles = await makeProfile(seed, LABEL, w.settings, proveHere)
    const main = await mainKey(seed, LABEL)
    expect(profiles).toEqual([{ label: LABEL, address: main.address, hosts: [w.settings.host] }])

    const [{ transaction, authorization }] = w.registryPayer.sent as [(typeof w.registryPayer.sent)[number]]
    expect(authorization).toMatch(/^PrivateToken token=/)
    const tx = VersionedTransaction.deserialize(transaction)
    const at = tx.message.staticAccountKeys.findIndex((k) => k.toBase58() === main.address)
    const key = createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: Buffer.from(main.publicKey).toString('base64url') }, format: 'jwk' })
    expect(verify(null, tx.message.serialize(), key, tx.signatures[at]!)).toBe(true)
    expect(tx.message.staticAccountKeys[0]!.toBase58()).toBe(w.registryPayer.payer)

    const view = await readProfile([w.settings.host], main.address, Date.now())
    expect(view.hosts).toEqual([w.settings.host])
    const card = view.current.get('profile')!.record.body!
    expect(card).toEqual({ market: 'tutoring', role: 'seller', inboxKey: (await inboxKey(main.privateKey)).recipient, inbox: { senders: { issuer: w.issuer.issuer.key } }, createdAt: card.createdAt })
    expect('name' in card).toBe(false)

    const vault = (await openVault([w.settings.host], await vaultKeys(seed)))!.vault
    expect(vault.profiles).toEqual([{ label: LABEL, hosts: [w.settings.host] }])
    expect([payerCredits(vault), hostCredits(vault)]).toEqual([1, 1])
  }, 120_000)

  test('made again after a stop: the row is there already, so no registry credit is spent; the vault lists it once', async () => {
    await makeProfile(seed, LABEL, w.settings, proveHere)
    const vault = (await openVault([w.settings.host], await vaultKeys(seed)))!.vault
    expect(vault.profiles).toHaveLength(1)
    expect([payerCredits(vault), hostCredits(vault)]).toEqual([1, 0])
    // No host credit left: the next folder's card would be refused, so the app says so first.
    await expect(makeProfile(seed, 'tutoring/buyer', w.settings, proveHere)).rejects.toThrow(/No credits left/)
  }, 120_000)

  test("signed in with the passkey's seed: the vault read, its settings taken; none for a seed that made no vault", async () => {
    const main = await mainKey(seed, LABEL)
    expect(await signIn(seed, w.settings)).toEqual([{ label: LABEL, address: main.address, hosts: [w.settings.host] }])
    expect(JSON.parse(localStorage.getItem('forest.settings')!)).toEqual(w.settings)
    expect(await signIn(newSeed(), w.settings)).toBeNull()
  })

  test('a host that does not answer is not taken for no setup', async () => {
    await expect(signIn(seed, { ...w.settings, host: 'http://127.0.0.1:9' })).rejects.toThrow(/did not answer|fetch/)
  })
})

describe('a card', () => {
  test('its own records from its host, the index on it, an access key removed', async () => {
    const main = await mainKey(seed, LABEL)
    const p = { label: LABEL, address: main.address, hosts: [w.settings.host] }
    const writer = keyFromPrivate(new Uint8Array(randomBytes(32)))
    const reader = await inboxKey(new Uint8Array(randomBytes(32)))
    const now = Date.now()
    const card = (await readProfile(p.hosts, p.address, now)).current.get('profile')!.record.body!
    w.host.balances.set(p.address, 1)
    await publishRecords(p.hosts, [
      permissionsRecord(main, [{ key: writer.address, scope: 'write', paths: ['offer', 'review'] }, { key: reader.recipient, scope: 'read' }], now + 1),
      ownerRecord(main, 'profile', { ...card, inbox: { ...(card.inbox as object), readers: [reader.recipient] } }, now + 1),
      ownerRecord(main, 'offer/maths', { direction: 'offer', description: 'Maths, one hour\nOnline.', price: { amount: '25', mint: 'J2QBACfPPb1ys2UyGx3ecXHgCr4hWuHFT3C2Nr6TSVSa', per: 'hour' }, createdAt: new Date(now).toISOString() }, now + 1),
      ownerRecord(main, 'review/one', { subject: w.registryPayer.payer, ratings: { overall: '9' }, text: 'On time.', createdAt: new Date(now).toISOString() }, now + 2),
    ])
    const own = await ownRecords(p)
    expect(own.offers).toMatchObject([{ path: 'offer/maths', title: 'Maths, one hour', price: '$25 / hour' }])
    expect(own.written).toMatchObject([{ path: 'review/one', subject: w.registryPayer.payer, score: '9', text: 'On time.' }])
    expect(own.access.map((e) => e.key)).toEqual([writer.address, reader.recipient])

    expect(await indexed(w.settings.index, p.address)).toBeNull()
    w.index.profiles.set(p.address, { scores: { rating: { value: 8.5, details: { reviews: 2 } } }, reviews: { received: [{ uri: 'u', reviewer: w.registryPayer.payer, overall: 8, text: 'Good.' }] } })
    expect(await indexed(w.settings.index, p.address)).toEqual({ rating: { value: 8.5, reviews: 2 }, received: [{ uri: 'u', reviewer: w.registryPayer.payer, score: 8, text: 'Good.' }] })

    await removeAccessKey(seed, p, writer.address)
    await removeAccessKey(seed, p, reader.recipient)
    const view = await readProfile(p.hosts, p.address, Date.now())
    expect(view.access).toEqual([{ key: writer.address, was: 'write', paths: ['offer', 'review'] }])
    expect((view.current.get('profile')!.record.body!.inbox as { readers?: string[] }).readers).toBeUndefined()
    expect((await ownRecords(p)).access).toEqual([])
  })

  test('access keys made: listed by their public halves and scopes alone, the read key among the inbox readers; each acts; the paste', async () => {
    const main = await mainKey(seed, LABEL)
    const p = { label: LABEL, address: main.address, hosts: [w.settings.host] }
    const before = (await readProfile(p.hosts, p.address, Date.now())).access
    const made = await makeAccessKeys(seed, p, { write: true, message: true, read: true })
    expect(made.write).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(made.message).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(made.read).toMatch(/^AGE-SECRET-KEY-PQ-1/)
    const writer = keyFromPrivate(b64u.decode(made.write!))
    const messenger = keyFromPrivate(b64u.decode(made.message!))

    const view = await readProfile(p.hosts, p.address, Date.now())
    const reader = view.access.at(-1)!.key
    expect(view.access).toEqual([...before, { key: writer.address, scope: 'write', paths: ['offer', 'review'] }, { key: messenger.address, scope: 'message' }, { key: reader, scope: 'read' }])
    expect(Object.keys(view.current.get('permissions')!.record.body!)).toEqual(['access'])
    const card = view.current.get('profile')!.record.body!
    expect((card.inbox as { readers?: string[] }).readers).toEqual([reader])

    // The write key writes an offer, as an AI's door does; the message key pulls the inbox, and the read key opens what is in it.
    await publishRecords(p.hosts, [accessRecord(writer, p.address, 'offer/by-key', { direction: 'offer', description: 'Written with a key', createdAt: new Date().toISOString() }, Date.now())])
    expect((await ownRecords(p)).offers.map((o) => o.path)).toContain('offer/by-key')
    const buyer = await mainKey(newSeed(), 'tutoring/buyer')
    w.host.rows.add(buyer.address)
    await deliver(p.hosts, [await message(buyer, p.address, { text: 'For the helper too.' }, Date.now(), card)])
    const page = await pull(w.settings.host, pullRequest({ key: messenger, profile: p.address }, 0, Date.now()))
    const opened = await openMessage(page.messages.at(-1)!.message, made.read!)
    expect(opened.body).toEqual({ text: 'For the helper too.' })
    expect(await openPrivate(await makePrivate({ x: 1 }, [reader]), made.read!)).toEqual({ x: 1 })

    expect(pasteOf('https://mcp.example/mcp', 'Tutoring', 'teacher', p.address, made).split('\n')).toEqual([
      'MCP: https://mcp.example/mcp (add it to your AI once)',
      'Forest, act for my profile (Tutoring, teacher).',
      `profile: ${p.address}`,
      `writeKey: ${made.write}`,
      `messageKey: ${made.message}`,
      `readKey: ${made.read}`,
      "Anything else, send me a request and I'll approve it in the app.",
    ])
    expect(pasteOf('https://mcp.example/mcp', 'Tutoring', 'teacher', p.address, { message: made.message }).split('\n')).toHaveLength(5)

    // Removed as before: the read key leaves the readers; the others are made past.
    for (const key of [writer.address, messenger.address, reader]) await removeAccessKey(seed, p, key)
    const after = await readProfile(p.hosts, p.address, Date.now())
    expect(after.access.filter((e) => e.scope)).toEqual([])
    expect((after.current.get('profile')!.record.body!.inbox as { readers?: string[] }).readers).toBeUndefined()
    await expect(makeAccessKeys(seed, p, { write: false, message: false, read: false })).rejects.toThrow(/at least one/)
  })

  test('access keys a host will not take for want of credits, with none left in the vault: no writes left, and the keys taken out again', async () => {
    const main = await mainKey(seed, LABEL)
    const p = { label: LABEL, address: main.address, hosts: [w.settings.host] }
    expect(hostCredits((await openVault([w.settings.host], await vaultKeys(seed)))!.vault)).toBe(0)
    const before = await readProfile(p.hosts, p.address, Date.now())
    const held = w.host.balances.get(p.address)
    w.host.balances.set(p.address, 0)
    // The permissions record, which is free, is taken; the card, with the read key among its readers, is not.
    await expect(makeAccessKeys(seed, p, { write: true, message: false, read: true })).rejects.toThrow('This profile has no writes left.')
    const after = await readProfile(p.hosts, p.address, Date.now())
    expect(after.access).toEqual(before.access)
    expect(after.current.get('profile')!.record.body).toEqual(before.current.get('profile')!.record.body)
    w.host.balances.set(p.address, held!)
  })

  test('words: role names, prices, titles', () => {
    expect(roleWord('seller', MARKETS.tutoring as never)).toBe('teacher')
    expect(roleWord('buyer', MARKETS.cleaning as never)).toBe('buyer')
    expect(words('music-lessons')).toBe('Music lessons')
    expect(priceText({ amount: '40', mint: 'So11111111111111111111111111111111111111112', per: 'job' })).toBe('40')
    expect(priceText(undefined)).toBeNull()
    expect(titleOf('  A line\nand more')).toBe('A line')
  })
})
