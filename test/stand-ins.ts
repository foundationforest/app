// What the tests talk to, on loopback: records' reference host, and stand-ins for the services the
// app reads (an issuer signing notes with a throwaway key, a registry payer, an index, an RPC, and
// the host's credit route). Credits are real ones, made by Cloudflare's own Privacy Pass issuer, as
// services' e2e tests make them. Every stand-in answers CORS as the services do, so the browser test
// uses them too.

import { randomBytes } from 'node:crypto'
import { type IncomingMessage, type Server, createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

import { genericBatched, publicVerif } from '@cloudflare/privacypass-ts'
import { base58, base64urlnopad as b64u } from '@scure/base'

import { Host } from '../standard/records/src/host.ts'
import { issuerKeyBytes, noteToJson, signNote } from '../standard/registry/client/src/index.ts'
import { type Credit, buy, finish, serviceOf } from '../src/services/credits.ts'

export type Route = (body: any, req: IncomingMessage) => [status: number, body: unknown] | Promise<[number, unknown]>

/** A JSON server: each `METHOD /path` to its route, 404 for the rest; what each route was asked, kept. */
export async function serve(routes: Record<string, Route>): Promise<{ url: string; asked: { route: string; body: any; headers: IncomingMessage['headers'] }[]; close: () => Promise<void> }> {
  const asked: { route: string; body: any; headers: IncomingMessage['headers'] }[] = []
  const cors = { 'access-control-allow-origin': '*' }
  const server: Server = createServer(async (req, res) => {
    if (req.method === 'OPTIONS') return void res.writeHead(204, { ...cors, 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type, authorization' }).end()
    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(chunk as Buffer)
    const text = Buffer.concat(chunks).toString('utf8')
    const route = `${req.method} ${new URL(req.url ?? '/', 'http://x').pathname}`
    const body = text ? JSON.parse(text) : undefined
    asked.push({ route, body, headers: req.headers })
    const handle = routes[route]
    if (!handle) return void res.writeHead(404, { ...cors, 'content-type': 'application/json' }).end('{"error":"not_found"}')
    const [status, answer] = await handle(body, req)
    res.writeHead(status, { ...cors, 'content-type': 'application/json' }).end(JSON.stringify(answer))
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  return { url, asked, close: () => new Promise((resolve) => server.close(() => resolve())) }
}

/** Records' reference host on loopback, in a temporary directory removed on close. */
export async function startHost(): Promise<{ url: string; close: () => Promise<void> }> {
  const host = new Host()
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

/** An issuer stand-in: /issuer.json, a face check's session (it keeps the return address), and a tier 1 note for any note number. */
export async function issuerStandIn(issuer = throwawayIssuer()) {
  const sessions = new Map<string, string | undefined>()
  const server = await serve({
    'GET /issuer.json': () => [200, { key: issuer.key, name: issuer.name, v: 1 }],
    'POST /session': (body) => {
      const sessionId = crypto.randomUUID()
      sessions.set(sessionId, body?.returnUrl)
      return [201, { sessionId, url: `https://verify.example/session/${sessionId}` }]
    },
    'POST /note': (body) => {
      if (!sessions.has(body?.sessionId)) return [403, { error: 'unknown_session' }]
      return [200, { note: noteToJson(issuer.sign(BigInt(body.noteNumber))) }]
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
  /** `n` credits, bought and finished as the app does, the service signing them blind. */
  const credits = async (n: number): Promise<Credit[]> => {
    const b = await buy(service, n)
    const answer = (await new genericBatched.Issuer(issuer).issue(genericBatched.BatchedTokenRequest.deserialize(b.buy))).serialize()
    return finish(b.pending, answer)
  }
  return { service, credits }
}
