// Each service client against what it talks to, on loopback: records' reference host for records
// and the inbox, and stand-ins for the issuer, the host's credit route, the registry payer, the
// index and the RPC (test/stand-ins.ts), as mcp's tests stand in for an index.

import { randomBytes } from 'node:crypto'

import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { inboxKey, issuerSecret, mainKey, newSeed } from '../standard/keys/src/index.ts'
import { type Body, deliver, hostsRecord, keyFromPrivate, ownerRecord, accessRecord, readProfile } from '../standard/records/src/index.ts'
import { message } from '../standard/records/src/private.ts'
import { noteToJson } from '../standard/registry/client/src/index.ts'
import { CREDIT_BYTES } from '../src/services/credits.ts'
import { Refused, pullInbox, publishRecords, readOwn, spend } from '../src/services/host.ts'
import * as indexes from '../src/services/indexes.ts'
import { note, readIssuer, session } from '../src/services/issuer.ts'
import { payerOf, register } from '../src/services/registry-payer.ts'
import { latestBlockhash } from '../src/services/solana.ts'
import { creditService, issuerStandIn, serve, startHost, throwawayIssuer } from './stand-ins.ts'

const card = (inbox: string): Body => ({
  market: 'tutoring',
  role: 'seller',
  name: 'a seller',
  inboxKey: inbox,
  inbox: { senders: 'anyone' },
  createdAt: '2026-10-13T12:00:00Z',
})

describe('issuer', () => {
  let stand: Awaited<ReturnType<typeof issuerStandIn>>
  beforeAll(async () => void (stand = await issuerStandIn()))
  afterAll(() => stand.close())

  test('who it is, a session with a return address, and a note checked before it is kept', async () => {
    const issuer = await readIssuer(stand.url)
    expect(issuer).toEqual({ origin: stand.url, name: stand.issuer.name, key: stand.issuer.key })

    const s = await session(issuer, 'https://app.example/back')
    expect(s.url).toMatch(/^https:\/\//)
    expect(stand.sessions.get(s.sessionId)).toBe('https://app.example/back')

    const { noteNumber } = await issuerSecret(newSeed(), issuer.name)
    const got = await note(issuer, s.sessionId, noteNumber)
    expect(got.note.noteNumber).toBe(noteNumber)
    expect(got.note.tier).toBe(1n)
    expect(got.json).toEqual(noteToJson(got.note))
  })

  test('a note from another key, or for another note number, is refused', async () => {
    const issuer = await readIssuer(stand.url)
    const s = await session(issuer)
    expect(stand.sessions.get(s.sessionId)).toBeUndefined()
    await expect(note({ ...issuer, key: throwawayIssuer().key }, s.sessionId, 5n)).rejects.toThrow(/another key/)
    const other = await serve({ 'POST /note': () => [200, { note: noteToJson(stand.issuer.sign(6n)) }] })
    await expect(note({ ...issuer, origin: other.url }, s.sessionId, 5n)).rejects.toThrow(/another note number/)
    await other.close()
  })
})

describe('host', () => {
  let host: Awaited<ReturnType<typeof startHost>>
  beforeAll(async () => void (host = await startHost()))
  afterAll(() => host.close())

  test('records published and read back by POST; the inbox pulled and opened', async () => {
    const seller = await mainKey(newSeed(), 'tutoring/seller')
    const sellerInbox = await inboxKey(seller.privateKey)
    const now = Date.now()
    await publishRecords([host.url], [hostsRecord(seller, [host.url], now), ownerRecord(seller, 'profile', card(sellerInbox.recipient), now)])
    const view = await readOwn([host.url], seller.address)
    expect(view.hosts).toEqual([host.url])
    expect(view.current.get('profile')?.record.body).toEqual(card(sellerInbox.recipient))

    const buyer = await mainKey(newSeed(), 'tutoring/buyer')
    const seen = await readProfile([host.url], seller.address, Date.now())
    const sent = await message(buyer, seller.address, { text: 'Is Tuesday at six free?' }, Date.now(), seen.current.get('profile')!.record.body!)
    const [taken] = await deliver(seen.hosts, [sent])
    expect(taken!.results[0]!.ok).toBe(true)

    const inbox = await pullInbox(host.url, seller)
    expect(inbox.messages.map((m) => [m.from, m.body])).toEqual([[buyer.address, { text: 'Is Tuesday at six free?' }]])
    expect((await pullInbox(host.url, seller, inbox.cursor)).messages).toEqual([])
  })

  test('a record the host refuses throws, naming the host and its code', async () => {
    const seller = await mainKey(newSeed(), 'tutoring/seller')
    const stranger = keyFromPrivate(new Uint8Array(randomBytes(32)))
    const now = Date.now()
    await publishRecords([host.url], [hostsRecord(seller, [host.url], now)])
    const refused = publishRecords([host.url], [accessRecord(stranger, seller.address, 'offer/x', { direction: 'offer', description: 'x' }, now)])
    await expect(refused).rejects.toBeInstanceOf(Refused)
    await expect(refused).rejects.toThrow(`${host.url}: permission`)
  })

  test('host credits spent into a folder, 100 a request', async () => {
    const seller = await mainKey(newSeed(), 'tutoring/seller')
    const { credits } = await creditService('https://host.example')
    let held = 0
    const credit = await serve({
      'POST /credits/spend': (body) => {
        held += body.credits.length
        return [200, { credits: held }]
      },
    })
    // One real credit, shown 101 times: the client splits by count, and the stand-in checks no signature.
    const [one] = await credits(1)
    expect(await spend(credit.url, seller.address, Array(101).fill(one))).toBe(101)
    expect(credit.asked.map((a) => [a.body.folder, a.body.credits.length])).toEqual([
      [seller.address, 100],
      [seller.address, 1],
    ])
    expect(Buffer.from(credit.asked[0]!.body.credits[0], 'base64url').length).toBe(CREDIT_BYTES)
    await credit.close()
  })
})

test('registry payer: the key it pays as, and a row sent with one credit', async () => {
  const payer = keyFromPrivate(new Uint8Array(randomBytes(32))).address
  const stand = await serve({
    'POST /': (body) => [200, { jsonrpc: '2.0', id: body.id, result: body.method === 'getPayerSigner' ? { signer_address: payer, payment_address: payer } : null }],
    'POST /register': () => [200, { signature: 'sig' }],
  })
  expect(await payerOf(stand.url)).toBe(payer)
  const [credit] = await (await creditService('https://registry-payer.example')).credits(1)
  const transaction = new Uint8Array(randomBytes(300))
  expect(await register(stand.url, transaction, credit!)).toBe('sig')
  const asked = stand.asked.find((a) => a.route === 'POST /register')!
  expect(asked.body).toEqual({ transaction: Buffer.from(transaction).toString('base64') })
  expect(asked.headers.authorization).toMatch(/^PrivateToken token=/)
  await stand.close()
})

test('index: its home, a market and a profile, as their JSON twins', async () => {
  const address = keyFromPrivate(new Uint8Array(randomBytes(32))).address
  const stand = await serve({
    'GET /index.json': () => [200, { markets: [{ name: 'tutoring' }] }],
    'GET /markets/tutoring.json': () => [200, { market: { name: 'tutoring' }, offers: [] }],
    [`GET /profiles/${address}.json`]: () => [200, { address, rows: [] }],
  })
  expect((await indexes.home(stand.url)).markets[0].name).toBe('tutoring')
  expect((await indexes.market(stand.url, 'tutoring')).market.name).toBe('tutoring')
  expect((await indexes.profile(stand.url, address)).address).toBe(address)
  await expect(indexes.market(stand.url, 'nothing')).rejects.toThrow(/404 not_found/)
  await stand.close()
})

test('solana: a recent blockhash from the RPC', async () => {
  const stand = await serve({ 'POST /': () => [200, { jsonrpc: '2.0', id: 1, result: { context: { slot: 1 }, value: { blockhash: 'abc', lastValidBlockHeight: 9 } } }] })
  expect(await latestBlockhash(stand.url)).toBe('abc')
  expect(stand.asked[0]!.body).toMatchObject({ method: 'getLatestBlockhash', params: [{ commitment: 'confirmed' }] })
  await stand.close()
})
