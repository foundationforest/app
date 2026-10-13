// The app's flows against one of each stand-in (test/stand-ins.ts, `world`), on loopback, in Node:
// setup's face check with the welcome gift and the first vault; a profile made, its proof made as the
// worker makes it; made again after a stop; restore from the words; the card's own records and what
// the index says; an access key removed. The screens around them, in a browser: test/browser/app.ts.

import { createPublicKey, randomBytes, verify } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { VersionedTransaction } from '@solana/web3.js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { inboxKey, mainKey } from '../standard/keys/src/index.ts'
import { keyFromPrivate, ownerRecord, permissionsRecord, readProfile } from '../standard/records/src/index.ts'
import { removeAccessKey } from '../src/flows/access.ts'
import { makeProfile } from '../src/flows/profile.ts'
import { restore } from '../src/flows/restore.ts'
import { type Check, collectGift, faceCheck } from '../src/flows/setup.ts'
import { indexed, ownRecords, priceText, roleWord, titleOf, words } from '../src/cards.ts'
import type { Artifact } from '../src/proof/circuit.ts'
import { type ProveRequest, prove } from '../src/proof/prove.ts'
import { makeSeed } from '../src/seed/seed.ts'
import { publishRecords } from '../src/services/host.ts'
import { openVault, vaultKeys } from '../src/vault.ts'
import { MARKETS, world } from './stand-ins.ts'

const load = async (artifact: Artifact) => new Uint8Array(await readFile(new URL(`../public${artifact.path}`, import.meta.url)))
const proveHere = (request: ProveRequest) => prove(request, load)
const LABEL = 'tutoring/seller'

// Settings are kept in localStorage, which Node has not: restore saves the vault's there.
;(globalThis as { localStorage?: Storage }).localStorage ??= (() => {
  const store = new Map<string, string>()
  return { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k), clear: () => store.clear(), key: () => null, length: 0 } as Storage
})()

let w: Awaited<ReturnType<typeof world>>
const { seed } = makeSeed()

beforeAll(async () => void (w = await world()))
afterAll(() => w.close())

const hostCredits = (credits: { service: string }[] | undefined) => (credits ?? []).filter((c) => c.service === w.settings.host).length
const payerCredits = (credits: { service: string }[] | undefined) => (credits ?? []).filter((c) => c.service === w.settings.registryPayer).length

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
    expect(vault.settings).toEqual({ forestApp: w.settings })
    // 2 registrations and 3 host credits; one host credit went into the vault's own folder.
    expect([payerCredits(vault.credits), hostCredits(vault.credits)]).toEqual([2, 2])

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
    expect(again.credits).toEqual(before.credits)
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
    expect([payerCredits(vault.credits), hostCredits(vault.credits)]).toEqual([1, 1])
  }, 120_000)

  test('made again after a stop: the row is there already, so no registry credit is spent; the vault lists it once', async () => {
    await makeProfile(seed, LABEL, w.settings, proveHere)
    const vault = (await openVault([w.settings.host], await vaultKeys(seed)))!.vault
    expect(vault.profiles).toHaveLength(1)
    expect([payerCredits(vault.credits), hostCredits(vault.credits)]).toEqual([1, 0])
    // No host credit left: the next folder's card would be refused, so the app says so first.
    await expect(makeProfile(seed, 'tutoring/buyer', w.settings, proveHere)).rejects.toThrow(/No credits left/)
  }, 120_000)

  test('restored from the words: the vault read, its settings taken; none for words that made no vault', async () => {
    const main = await mainKey(seed, LABEL)
    expect(await restore(seed, w.settings)).toEqual([{ label: LABEL, address: main.address, hosts: [w.settings.host] }])
    expect(JSON.parse(localStorage.getItem('forest.settings')!)).toEqual(w.settings)
    expect(await restore(makeSeed().seed, w.settings)).toBeNull()
  })

  test('a host that does not answer is not taken for no vault', async () => {
    await expect(restore(seed, { ...w.settings, host: 'http://127.0.0.1:9' })).rejects.toThrow()
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
    expect(own.offers).toEqual([{ path: 'offer/maths', title: 'Maths, one hour', price: '$25 / hour' }])
    expect(own.written).toEqual([{ path: 'review/one', subject: w.registryPayer.payer, score: '9', text: 'On time.' }])
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

  test('words: role names, prices, titles', () => {
    expect(roleWord('seller', MARKETS.tutoring as never)).toBe('teacher')
    expect(roleWord('buyer', MARKETS.cleaning as never)).toBe('buyer')
    expect(words('music-lessons')).toBe('Music lessons')
    expect(priceText({ amount: '40', mint: 'So11111111111111111111111111111111111111112', per: 'job' })).toBe('40')
    expect(priceText(undefined)).toBeNull()
    expect(titleOf('  A line\nand more')).toBe('A line')
  })
})
