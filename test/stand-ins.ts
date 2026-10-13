// What the tests talk to, on loopback: records' reference host, and stand-ins for the services the
// app reads (an issuer signing notes with a throwaway key, a registry payer, an index, an RPC, and
// the host's credit routes). Credits are real ones, made by Cloudflare's own Privacy Pass issuer, as
// services' e2e tests make them, and bought with a sponsor's ticket as the issuer's welcome gift
// pays for them. Every stand-in answers CORS as the services do, so the browser test uses them too.
// `world` starts one of each, wired together as on devnet.

import { createPublicKey, generateKeyPairSync, randomBytes, sign, verify } from 'node:crypto'
import { type IncomingMessage, type Server, createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

import { genericBatched, publicVerif } from '@cloudflare/privacypass-ts'
import { base58, base64urlnopad as b64u } from '@scure/base'

import { decodeRecord, keyFromPrivate, readAll } from '../standard/records/src/index.ts'
import { Host, type HostOptions } from '../standard/records/src/host.ts'
import { issuerKeyBytes, noteToJson, signNote } from '../standard/registry/client/src/index.ts'
import { type Credit, buy, finish, referenceOf, serviceOf } from '../src/services/credits.ts'
import type { Settings } from '../src/settings.ts'

/** A route's answer: a status, a body (JSON, or bytes or text sent as they are when `headers` names a content-type), and headers. */
export type Answer = [status: number, body: unknown, headers?: Record<string, string>]
/** A route: a JSON request's body parsed, any other's as bytes. */
export type Route = (body: any, req: IncomingMessage) => Answer | Promise<Answer>

const CORS = { 'access-control-allow-origin': '*' }
const PREFLIGHT = { ...CORS, 'access-control-allow-methods': 'GET, POST, PUT', 'access-control-allow-headers': 'content-type, authorization, forest-payment' }

async function bodyOf(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks)
}

async function listen(server: Server): Promise<{ url: string; close: () => Promise<void> }> {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  return { url, close: () => new Promise((resolve) => (server.closeAllConnections(), server.close(() => resolve()))) }
}

/**
 * A JSON server: each `METHOD /path` to its route, a key ending in `*` to every path it starts, 404
 * for the rest; what each route was asked, kept. Routes may be added once it listens.
 */
export async function serve(routes: Record<string, Route>) {
  const asked: { route: string; body: any; headers: IncomingMessage['headers'] }[] = []
  const server = createServer(async (req, res) => {
    if (req.method === 'OPTIONS') return void res.writeHead(204, PREFLIGHT).end()
    const raw = await bodyOf(req)
    const route = `${req.method} ${new URL(req.url ?? '/', 'http://x').pathname}`
    const json = (req.headers['content-type'] ?? 'application/json').includes('json')
    const body = json ? (raw.length ? JSON.parse(raw.toString('utf8')) : undefined) : new Uint8Array(raw)
    asked.push({ route, body, headers: req.headers })
    const handle = routes[route] ?? Object.entries(routes).find(([key]) => key.endsWith('*') && route.startsWith(key.slice(0, -1)))?.[1]
    if (!handle) return void res.writeHead(404, { ...CORS, 'content-type': 'application/json' }).end('{"error":"not_found"}')
    const [status, answer, headers = {}] = await handle(body, req)
    if (headers['content-type'] || headers.location) res.writeHead(status, { ...CORS, ...headers }).end(answer as Uint8Array | string)
    else res.writeHead(status, { ...CORS, 'content-type': 'application/json' }).end(JSON.stringify(answer))
  })
  return { ...(await listen(server)), asked, routes }
}

/** Records' reference host on loopback, in a temporary directory removed on close. */
export async function startHost(options: HostOptions = {}): Promise<{ url: string; close: () => Promise<void> }> {
  const host = new Host(options)
  const url = await host.listen(0)
  return { url, close: () => host.close() }
}

/** A throwaway issuer key and what it signs, as the registry client's own tests sign notes. */
export function throwawayIssuer(name = 'issuer.test') {
  const privateKey = new Uint8Array(randomBytes(32))
  const sign = (noteNumber: bigint, tier = 1n) =>
    signNote(privateKey, { noteNumber, embedding: new Uint8Array(Float32Array.from([0.25, -0.5, 0.125]).buffer), model: 'example-face-model/1', tier })
  const key = Buffer.from(issuerKeyBytes(sign(1n).issuer)).toString('hex')
  return { name, privateKey, key, sign }
}

/** A sponsor's key, which signs tickets for buys, as the issuer's welcome gift does (services' host README, The ways to pay). */
export function sponsorKey() {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  const address = base58.encode(Buffer.from(publicKey.export({ format: 'jwk' }).x!, 'base64url'))
  /** The ticket for a buy of `n` credits at `origin`: `<sponsor>.<n>.<signature>`. */
  const ticket = (origin: string, reference: string, n: number) => `${address}.${n}.${b64u.encode(sign(null, Buffer.from(`forest credit ticket\n${origin}\n${reference}\n${n}`), privateKey))}`
  return { address, ticket }
}

function ticketHolds(ticket: string, origin: string, reference: string, sponsors: string[]): boolean {
  const [sponsor, n, sig] = ticket.split('.')
  if (!sponsor || !sponsors.includes(sponsor) || !sig) return false
  const key = createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: Buffer.from(base58.decode(sponsor)).toString('base64url') }, format: 'jwk' })
  return verify(null, Buffer.from(`forest credit ticket\n${origin}\n${reference}\n${n}`), key, Buffer.from(sig, 'base64url'))
}

type Options = {
  /** The fake Didit page: the session's page is `/didit/<id>` here, which marks the check done and sends the person to its return address; until then, no note. */
  didit?: boolean
  /** The welcome gift: by service, where and how many; tickets signed by `sponsor`. */
  gift?: Record<string, { origin: string; credits: number }>
  sponsor?: ReturnType<typeof sponsorKey>
}

/** An issuer stand-in: /issuer.json, a face check's session (it keeps the return address), and a tier 1 note for any note number, with the gift's tickets once a note number. */
export async function issuerStandIn(issuer = throwawayIssuer(), options: Options = {}) {
  const sessions = new Map<string, string | undefined>()
  const done = new Set<string>()
  const gifts = new Map<string, string>()
  const server = await serve({
    'GET /issuer.json': () => [200, { key: issuer.key, name: issuer.name, v: 1, ...(options.gift && { gift: options.gift, sponsor: options.sponsor!.address }) }],
    'POST /session': (body) => {
      const sessionId = crypto.randomUUID()
      sessions.set(sessionId, body?.returnUrl)
      return [201, { sessionId, url: options.didit ? `${server.url}/didit/${sessionId}` : `https://verify.example/session/${sessionId}` }]
    },
    'GET /didit/*': (_body, req) => {
      const id = req.url!.split('/').pop()!
      done.add(id)
      const back = sessions.get(id)
      return back ? [302, '', { location: back }] : [200, 'done', { 'content-type': 'text/plain' }]
    },
    'POST /note': (body) => {
      if (!sessions.has(body?.sessionId)) return [403, { error: 'unknown_session' }]
      if (options.didit && !done.has(body.sessionId)) return [403, { error: 'no_liveness' }]
      const note = noteToJson(issuer.sign(BigInt(body.noteNumber)))
      if (!body.gift || !options.gift) return [200, { note }]
      const refs = body.gift as Record<string, string>
      if (Object.keys(refs).sort().join() !== Object.keys(options.gift).sort().join()) return [200, { note, gift: { error: 'bad_gift' } }]
      const asked = JSON.stringify(Object.entries(refs).sort())
      if ((gifts.get(body.noteNumber) ?? asked) !== asked) return [200, { note, gift: { error: 'given' } }]
      gifts.set(body.noteNumber, asked)
      return [200, { note, gift: Object.fromEntries(Object.entries(options.gift).map(([s, g]) => [s, options.sponsor!.ticket(g.origin, refs[s]!, g.credits)])) }]
    },
  })
  return { ...server, issuer, sessions }
}

/** A service selling credits: Cloudflare's Privacy Pass issuer for a fresh key, and its directory. */
export async function creditService(origin: string) {
  const keys = await publicVerif.Issuer.generateKey(publicVerif.BlindRSAMode.PSS, { modulusLength: 2048, publicExponent: Uint8Array.from([1, 0, 1]) })
  const issuer = new publicVerif.Issuer(publicVerif.BlindRSAMode.PSS, new URL(origin).host, keys.privateKey, keys.publicKey)
  const key = await publicVerif.getPublicKeyBytes(keys.publicKey)
  const directory = {
    'issuer-request-uri': '/credits/buy',
    'token-keys': [{ 'token-type': 2, 'token-key': b64u.encode(key) }],
    'forest-credit': { unit: 'one write', address: base58.encode(new Uint8Array(32).fill(3)), mint: 'J2QBACfPPb1ys2UyGx3ecXHgCr4hWuHFT3C2Nr6TSVSa', price: '0.01' },
  }
  const service = serviceOf(origin, directory)
  /** The answer to a buy: its blind signatures. */
  const sign = async (bought: Uint8Array) => (await new genericBatched.Issuer(issuer).issue(genericBatched.BatchedTokenRequest.deserialize(bought))).serialize()
  /** `n` credits, bought and finished as the app does, the service signing them blind. */
  const credits = async (n: number): Promise<Credit[]> => {
    const b = await buy(service, n)
    return finish(b.pending, await sign(b.buy))
  }
  return { service, directory, sign, credits }
}

/**
 * The credit routes a service sells with, added to its routes: its directory, and a buy collected
 * with a ticket from one of `sponsors`. `spend` takes a credit once, by its nonce.
 */
async function sellCredits(routes: Record<string, Route>, origin: string, sponsors: string[]) {
  const seller = await creditService(origin)
  const spent = new Set<string>()
  routes['GET /.well-known/private-token-issuer-directory'] = () => [200, seller.directory]
  routes['POST /credits/buy'] = async (bought: Uint8Array, req) => {
    const [kind, ticket] = String(req.headers['forest-payment'] ?? '').split(' ')
    if (kind !== 'ticket' || !ticket || !ticketHolds(ticket, origin, await referenceOf(bought), sponsors)) return [402, { error: 'not_paid' }]
    return [200, await seller.sign(bought), { 'content-type': 'application/private-token-generic-batch-response' }]
  }
  const spend = (credit: string): boolean => {
    const nonce = Buffer.from(credit, 'base64url').subarray(2, 34).toString('hex')
    if (spent.has(nonce)) return false
    spent.add(nonce)
    return true
  }
  return { ...seller, spend }
}

/**
 * A host stand-in: records' reference host behind a front that sells its credits, keeps each
 * folder's balance, and refuses each content record its folder cannot pay for, in the words the
 * foundation's host uses, while the rest go through (0.01 credit a write here; hosts and
 * permissions records are free). An inbox for one issuer's people takes a sender the test puts in
 * `rows`. A message a message key signed is taken once the sender's records, read from the host it
 * names, list the key.
 */
export async function hostStandIn(sponsors: string[], rows = new Set<string>()) {
  // An inbox open to people with a row from an issuer takes senders in `rows`, whatever the issuer.
  const upstream = await startHost({ rowLookup: async (from) => rows.has(from), readSender: async (url, profile) => (await readAll(url, { profile })).records })
  const balances = new Map<string, number>()
  const credits = await serve({})
  // Writes still to refuse, every record in them, as a host that stops answering would.
  let refusing = 0
  const front = createServer(async (req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname
    const raw = await bodyOf(req)
    const to = path.startsWith('/credits/') || path.startsWith('/.well-known/') ? credits.url : upstream.url
    if (req.method === 'POST' && path === '/v1/records') {
      const lines = raw.toString('utf8').split('\n').filter(Boolean)
      const records = lines.map((line) => decodeRecord(line).record)
      const ndjson = (results: object[]) => void res.writeHead(200, { ...CORS, 'content-type': 'application/x-ndjson' }).end(results.map((r) => JSON.stringify(r)).join('\n') + '\n')
      if (refusing > 0) {
        refusing--
        return ndjson(records.map((_, i) => ({ i, ok: false, error: 'refused' })))
      }
      // Each content record paid for from its folder in turn; one the folder cannot pay for refused as the foundation's host refuses it.
      const results: { i: number; [field: string]: unknown }[] = []
      const paid: number[] = []
      records.forEach((r, i) => {
        if (r.path === 'hosts' || r.path === 'permissions') return void paid.push(i)
        const held = balances.get(r.profile) ?? 0
        if (held < 0.01 - 1e-9) return void results.push({ i, ok: false, error: 'refused', message: `this write costs 0.01 credits, and the folder holds ${held.toFixed(2)} here; credits are sold at /.well-known/private-token-issuer-directory` })
        balances.set(r.profile, held - 0.01)
        paid.push(i)
      })
      if (results.length) {
        if (paid.length) {
          const answer = await fetch(upstream.url + req.url, { method: 'POST', headers: { 'content-type': 'application/x-ndjson' }, body: paid.map((i) => lines[i]).join('\n') + '\n' })
          for (const line of (await answer.text()).split('\n').filter(Boolean)) {
            const r = JSON.parse(line) as { i: number }
            results.push({ ...r, i: paid[r.i]! })
          }
        }
        return ndjson(results.sort((a, b) => a.i - b.i))
      }
    }
    const headers = Object.fromEntries(Object.entries(req.headers).filter(([k]) => !['host', 'connection', 'content-length'].includes(k))) as Record<string, string>
    const answer = await fetch(to + req.url, { method: req.method, headers, body: req.method === 'GET' || req.method === 'HEAD' ? undefined : new Uint8Array(raw) })
    const back = Object.fromEntries([...answer.headers].filter(([k]) => !['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(k)))
    res.writeHead(answer.status, back).end(Buffer.from(await answer.arrayBuffer()))
  })
  const served = await listen(front)
  const seller = await sellCredits(credits.routes, served.url, sponsors)
  credits.routes['POST /credits/spend'] = (body) => {
    if (!Array.isArray(body?.credits) || body.credits.length < 1 || body.credits.length > 100) return [400, { error: 'bad_request' }]
    if (!body.credits.every(seller.spend)) return [409, { error: 'spent' }]
    balances.set(body.folder, (balances.get(body.folder) ?? 0) + body.credits.length)
    return [200, { folder: body.folder, credits: balances.get(body.folder) }]
  }
  credits.routes['GET /credits/balance/*'] = (_body, req) => {
    const folder = req.url!.split('/').pop()!
    return [200, { folder, credits: balances.get(folder) ?? 0 }]
  }
  return {
    url: served.url,
    balances,
    rows,
    /** The next `n` writes refused; the function stops refusing. */
    refuse: (n: number) => {
      refusing = n
      return () => void (refusing = 0)
    },
    close: async () => {
      await served.close()
      await credits.close()
      await upstream.close()
    },
  }
}

/** A registry payer stand-in: the key it pays as, its credits, and a row sent with one, kept here with the credit's header; a second row for one profile is `row_exists`. */
export async function registryPayerStandIn(sponsors: string[]) {
  const payer = keyFromPrivate(new Uint8Array(randomBytes(32))).address
  const sent: { transaction: Uint8Array; authorization: string }[] = []
  const rows = new Set<string>()
  const server = await serve({
    'POST /': (body) => [200, { jsonrpc: '2.0', id: body.id, result: body.method === 'getPayerSigner' ? { signer_address: payer, payment_address: payer } : null }],
  })
  const seller = await sellCredits(server.routes, server.url, sponsors)
  server.routes['POST /register'] = async (body, req) => {
    const authorization = String(req.headers.authorization ?? '')
    const credit = /^PrivateToken token="?([A-Za-z0-9_-]+)/.exec(authorization)?.[1]
    if (!credit) return [402, { error: 'credit' }]
    const transaction = new Uint8Array(Buffer.from(body.transaction, 'base64'))
    const { VersionedTransaction } = await import('@solana/web3.js')
    const profile = VersionedTransaction.deserialize(transaction).message.staticAccountKeys[1]!.toBase58()
    if (rows.has(profile)) return [409, { error: 'row_exists' }]
    if (!seller.spend(credit)) return [409, { error: 'spent' }]
    rows.add(profile)
    sent.push({ transaction, authorization })
    return [200, { signature: `signature-${sent.length}` }]
  }
  return { ...server, payer, sent }
}

/** The markets the index stand-in uses: two folders, a two-sided market with role names, one without, and a one-sided one. */
export const MARKETS = {
  tutoring: { name: 'tutoring', folder: 'education', description: 'Lessons in any subject.', sides: 'two', roleNames: { seller: 'teacher', buyer: 'student' } },
  'music-lessons': { name: 'music-lessons', folder: 'education', description: 'Lessons in an instrument.', sides: 'two', roleNames: { seller: 'teacher', buyer: 'student' } },
  cleaning: { name: 'cleaning', folder: 'home', description: 'Cleaning a home.', sides: 'two' },
  tennis: { name: 'tennis', folder: 'sports', description: 'Tennis partners.', sides: 'one' },
} as const

/** An index stand-in: its home's twin, each market's, and a profile's when the test sets one (`profiles`). */
export async function indexStandIn() {
  const profiles = new Map<string, unknown>()
  const folders = new Map<string, string[]>()
  for (const m of Object.values(MARKETS)) folders.set(m.folder, [...(folders.get(m.folder) ?? []), m.name])
  const server = await serve({
    'GET /index.json': () => [200, { folders: [...folders].map(([folder, names]) => ({ folder, markets: names.map((name) => ({ name, offers: 0 })) })) }],
    'GET /markets/*': (_body, req) => {
      const name = decodeURIComponent(req.url!.split('/').pop()!.replace(/\.json$/, '')) as keyof typeof MARKETS
      return MARKETS[name] ? [200, { market: MARKETS[name] }] : [404, { error: 'not_found' }]
    },
    'GET /profiles/*': (_body, req) => {
      const twin = profiles.get(decodeURIComponent(req.url!.split('/').pop()!.replace(/\.json$/, '')))
      return twin ? [200, twin] : [404, { error: 'not_found' }]
    },
  })
  return { ...server, profiles }
}

/** An RPC stand-in: a recent blockhash. */
export function rpcStandIn() {
  return serve({ 'POST /': (body) => [200, { jsonrpc: '2.0', id: body?.id ?? 1, result: { context: { slot: 1 }, value: { blockhash: '11111111111111111111111111111111', lastValidBlockHeight: 9 } } }] })
}

/** One of each, wired as on devnet: the issuer's gift is 2 registrations and 3 host credits, paid by its sponsor's tickets, which the host and the registry payer take. */
export async function world() {
  const sponsor = sponsorKey()
  const host = await hostStandIn([sponsor.address])
  const registryPayer = await registryPayerStandIn([sponsor.address])
  const gift = { registryPayer: { origin: registryPayer.url, credits: 2 }, host: { origin: host.url, credits: 3 } }
  const issuer = await issuerStandIn(throwawayIssuer('issuer.test'), { didit: true, gift, sponsor })
  const index = await indexStandIn()
  const rpc = await rpcStandIn()
  const settings: Settings = { issuer: issuer.url, host: host.url, registryPayer: registryPayer.url, index: index.url, rpc: rpc.url, mcp: 'https://mcp.example/mcp' }
  return {
    settings,
    host,
    registryPayer,
    issuer,
    index,
    rpc,
    close: async () => {
      for (const s of [host, registryPayer, issuer, index, rpc]) await s.close()
    },
  }
}
