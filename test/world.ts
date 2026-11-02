// What the flows are tested against, on loopback, in this process:
//
//   the host       services' own host (services/host/src), as `npm start` runs it, the plug and the
//                  credits, taking the stand-in verifier's sponsor's tickets;
//   the verifier   a stand-in answering the routes the app calls as services' verifier does
//                  (verifier/README.md, Its API): real stamps, signed with a service key by the
//                  standard's signStamp, and real tickets, signed by services' own ticket code; each
//                  check approved unless a test says it is unfinished, held for review, declined,
//                  expired, not passed, or past its hour. Services' verifier itself runs in the ID
//                  check's tests (id.test.ts) and the browser test, with its stand-ins; here a test
//                  says what Didit decided.
//
// `services()` is the other world: services' own verifier, in this process, with its own stand-ins
// for Didit and for Stripe (verifier/test/fakes.ts) and its embedder that knows faces by name, its
// gifts credits at services' own host. The ID check's tests run there, so the verifier's own code
// says what a payment, a try and each refusal come to.
//
// And the device's storage, in memory, as a fresh browser has it.

import { randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { type Server, createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { b64u } from '@foundationforest/folders'
import { newSeed, serviceKey } from '@foundationforest/keys'
import { checkVerification, proofBytes, proveVerification, signStamp, stampFromJson, stampToJson } from '@foundationforest/proofs'

import { readConfig, startHost } from '../services/host/src/host.ts'
import { ticketFor } from '../services/verifier/src/gift.ts'
import { ed25519 } from '../services/verifier/src/seed.ts'
import { readConfig as verifierConfig, startVerifier } from '../services/verifier/src/service.ts'
import { FACE_WORKFLOW, FakeFaceCheck, FakePayments, ID_WORKFLOW, namedFaces } from '../services/verifier/test/fakes.ts'
import type { Services } from '../src/config.ts'
import type { CheckProofs } from '../src/flows/inbox.ts'
import { type Prove, makeProfile } from '../src/flows/profile.ts'
import { ask, finish, open, stampNumberAt } from '../src/flows/verify.ts'

/** localStorage and sessionStorage, in memory. */
export function memoryStorage(): Storage {
  const map = new Map<string, string>()
  const storage = {
    get length() {
      return map.size
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  }
  // Object.keys(localStorage) lists its keys, as a browser's does.
  return new Proxy(storage, {
    get: (target, k) => (typeof k === 'string' && !(k in target) ? map.get(k) : Reflect.get(target, k)),
    ownKeys: () => [...map.keys()],
    getOwnPropertyDescriptor: (_t, k) => (typeof k === 'string' && map.has(k) ? { enumerable: true, configurable: true, value: map.get(k) } : undefined),
  }) as unknown as Storage
}

/** A fresh device: empty storage. */
export function freshDevice(): void {
  globalThis.localStorage = memoryStorage()
  globalThis.sessionStorage = memoryStorage()
}

async function freePort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  await new Promise<void>((resolve) => server.close(() => resolve()))
  return port
}

/** What the stand-in Didit decided for a session. */
export type Decision = 'approved' | 'unfinished' | 'review' | 'declined' | 'expired' | 'not_passed' | 'past_its_hour'

export const VERIFIER_NAME = 'verifier.stand-in.invalid'
export const FACE_CREDITS = 10

export type World = Services & {
  faceKey: string
  /** What Didit decides for every session from now, unless `decide` names one. */
  decideAll(d: Decision): void
  decide(session: string, d: Decision): void
  /** The sessions opened, in order, with the return address each was opened with. */
  sessions: Array<{ id: string; returnUrl?: string }>
  /** How many stamp requests carried a gift's reference, and how many tickets were signed. */
  asked: { stamps: number; tickets: number }
  /** A folder's balance at the host, in credits. */
  balance(folder: string): Promise<number>
  close(): Promise<void>
}

/**
 * The host and a stand-in verifier, on loopback. `entryPerKb` is the host's price of a kilobyte of
 * an entry, in credits; its own default unless a test sets it.
 */
export async function world({ entryPerKb }: { entryPerKb?: string } = {}): Promise<World> {
  const dir = mkdtempSync(join(tmpdir(), 'forest-app-'))
  const sponsor = ed25519(newSeed())
  const face = serviceKey(newSeed())
  const id = serviceKey(newSeed())
  const hostPort = await freePort()
  const host = `http://127.0.0.1:${hostPort}`
  const running = await startHost(readConfig({ DATA_DIR: join(dir, 'host'), PUBLIC_ORIGIN: host, PORT: String(hostPort), SPONSORS: sponsor.address, ...(entryPerKb && { ENTRY_PER_KB: entryPerKb }) }))

  let all: Decision = 'approved'
  const decided = new Map<string, Decision>()
  const sessions: World['sessions'] = []
  /** Each session's stamp number, once it gave its stamp; each stamp number's stamp and gift. */
  const usedBy = new Map<string, string>()
  const stamps = new Map<string, unknown>()
  const gifts = new Map<string, string>()
  const asked = { stamps: 0, tickets: 0 }
  const gift = { origin: host, credits: { face: FACE_CREDITS, id: 100 } }

  const answer = (status: number, body: unknown, res: import('node:http').ServerResponse) => {
    res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }).end(JSON.stringify(body))
  }
  const verifier: Server = createServer((req, res) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => {
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
      if (req.method === 'GET' && req.url === '/') {
        return answer(200, { name: VERIFIER_NAME, face: { key: face.address, facts: 'stand-in' }, id: { key: id.address, facts: 'stand-in' }, gift: { face: FACE_CREDITS, host, id: 100, sponsor: sponsor.address } }, res)
      }
      if (req.url === '/face/session') {
        const sessionId = randomUUID()
        sessions.push({ id: sessionId, ...(body.returnUrl && { returnUrl: body.returnUrl }) })
        return answer(201, { sessionId, url: `https://didit.invalid/session/${sessionId}` }, res)
      }
      if (req.url === '/face/stamp') {
        const { sessionId, stampNumber, gift: reference, ...rest } = body
        if (Object.keys(rest).length) return answer(400, { error: 'expected_exactly_sessionId_and_stampNumber' }, res)
        if (!sessions.some((s) => s.id === sessionId)) return answer(403, { error: 'unknown_session' }, res)
        const d = decided.get(sessionId) ?? all
        if (d === 'review') return answer(202, { waiting: 'review' }, res)
        if (d === 'unfinished') return answer(403, { error: 'not_approved' }, res)
        if (d === 'not_passed') return answer(403, { error: 'liveness_not_passed' }, res)
        if (d === 'declined' || d === 'expired') return answer(403, { error: d }, res)
        const was = usedBy.get(sessionId)
        if (d === 'past_its_hour' || (was && was !== stampNumber)) return answer(409, { error: 'session_used' }, res)
        usedBy.set(sessionId, stampNumber)
        if (!stamps.has(stampNumber)) {
          const signed = signStamp(face.secret, { stampNumber: BigInt(stampNumber), facts: 7n, verifierName: VERIFIER_NAME, model: 'stand-in', embedding: 'AAAA' })
          stamps.set(stampNumber, stampToJson(signed))
        }
        const out: Record<string, unknown> = { stamp: stamps.get(stampNumber) }
        if (reference !== undefined) {
          asked.stamps++
          const given = gifts.get(stampNumber)
          if (given && given !== reference) out.gift = { error: 'given' }
          else {
            const ticket = ticketFor(gift, 'face', reference, sponsor)
            if (ticket === 'bad_gift') out.gift = { error: ticket }
            else {
              gifts.set(stampNumber, reference)
              asked.tickets++
              out.gift = { ticket }
            }
          }
        }
        return answer(200, out, res)
      }
      if (req.url === '/stamp') {
        const kept = stamps.get(body.stampNumber)
        return kept ? answer(200, { face: kept, id: null }, res) : answer(404, { error: 'not_found' }, res)
      }
      if (req.url?.startsWith('/id/')) return answer(503, { error: 'not_for_sale' }, res)
      answer(404, { error: 'not_found' }, res)
    })
  })
  await new Promise<void>((resolve) => verifier.listen(0, '127.0.0.1', resolve))

  return {
    verifier: `http://127.0.0.1:${(verifier.address() as AddressInfo).port}`,
    host,
    faceKey: face.address,
    decideAll: (d) => void (all = d),
    decide: (session, d) => void decided.set(session, d),
    sessions,
    asked,
    balance: async (folder) => ((await (await fetch(`${host}/credits/balance/${folder}`)).json()) as { credits: number }).credits,
    close: async () => {
      await new Promise<void>((resolve) => verifier.close(() => resolve()))
      await running.close()
      rmSync(dir, { recursive: true, force: true })
    },
  }
}

/** Services' own verifier and host, on loopback: the stand-ins a test drives, and the verifier's keys. */
export type ServicesWorld = Services & {
  faceCheck: FakeFaceCheck
  idCheck: FakeFaceCheck
  /** Stripe, as the verifier sees it: a test pays a payment with `pay`. Absent when the ID check is not for sale. */
  payments?: FakePayments
  keys: { face: string; id: string }
  balance(folder: string): Promise<number>
  close(): Promise<void>
}

/** The ID check's gift, as services' verifier gives it by default: ten times the face check's. */
export const ID_CREDITS = 100

/** Services' own verifier and host, on loopback, as id.test.ts runs them. `forSale: false` is a verifier with no Stripe. */
export async function services({ forSale = true, entryPerKb }: { forSale?: boolean; entryPerKb?: string } = {}): Promise<ServicesWorld> {
  const dir = mkdtempSync(join(tmpdir(), 'forest-app-services-'))
  const hostPort = await freePort()
  const host = `http://127.0.0.1:${hostPort}`
  const faceCheck = new FakeFaceCheck()
  const idCheck = new FakeFaceCheck()
  const payments = forSale ? new FakePayments() : undefined
  const verifier = await startVerifier(
    verifierConfig({
      VERIFIER_NAME: 'verifier.app-vitest.invalid',
      DIDIT_API_KEY: 'stand-in',
      DIDIT_FACE_WORKFLOW_ID: FACE_WORKFLOW,
      DIDIT_ID_WORKFLOW_ID: ID_WORKFLOW,
      DIDIT_BASE_URL: 'http://127.0.0.1:9',
      FACE_MODEL: 'stand-in',
      HOST_URL: host,
      APP_ORIGINS: 'https://app.example',
      DATABASE_PATH: join(dir, 'verifier', 'verifier.sqlite'),
      PORT: '0',
    }),
    { faceCheck, idCheck, embedder: namedFaces(), ...(payments && { payments }), log: () => undefined },
  )
  const running = await startHost(readConfig({ DATA_DIR: join(dir, 'host'), PUBLIC_ORIGIN: host, PORT: String(hostPort), SPONSORS: verifier.sponsor!, ...(entryPerKb && { ENTRY_PER_KB: entryPerKb }) }))
  return {
    verifier: verifier.url,
    host,
    faceCheck,
    idCheck,
    ...(payments && { payments }),
    keys: verifier.keys,
    balance: async (folder) => ((await (await fetch(`${host}/credits/balance/${folder}`)).json()) as { credits: number }).credits,
    close: async () => {
      await verifier.close()
      await running.close()
      rmSync(dir, { recursive: true, force: true })
    },
  }
}

/** The verification circuit's committed proving files, in the standard at STANDARD. */
export const PROOF_FILES = {
  wasm: new URL('../standard/proofs/verification/setup/verification.wasm', import.meta.url).pathname,
  zkey: new URL('../standard/proofs/verification/setup/verification.zkey', import.meta.url).pathname,
}

/** A verification made as the app's worker makes it, here on Node's thread. */
export const proveHere: Prove = async (seed, stamp, label) => {
  const r = await proveVerification({ seed, stamp: stampFromJson(JSON.parse(stamp)), label, artifacts: PROOF_FILES })
  return { verifier: r.verifier, verifierName: r.verifierName, label, proof: b64u.encode(proofBytes(r.proof)) }
}

/** A person: a seed, and the id of the passkey that gave it. */
export const person = () => ({ seed: newSeed(), id: `passkey-${crypto.randomUUID()}` })

/** A person verified by the face check as the app verifies them, at the stand-in verifier, with a profile for each of `labels`. */
export async function verifiedWith(w: Services, ...labels: string[]) {
  const p = person()
  await open(w, p.id)
  const step = await ask(w, p.id, await stampNumberAt(w, p.seed))
  if (step.at !== 'signed') throw new Error(`not signed: ${step.at}`)
  await finish(w, p.id, p.seed, step.stamp, proveHere)
  const profiles = []
  for (const label of labels) profiles.push(await makeProfile(w, p.seed, label, proveHere))
  return { ...p, profiles }
}

/** Verifications checked as the app's worker checks them, here on Node's thread. */
export const checkHere: CheckProofs = async (checks) => {
  for (const c of checks) if (await checkVerification(c)) return true
  return false
}
