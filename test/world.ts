// What the flows are tested against, on loopback, in this process:
//
//   the verifier   services' own (services/verifier/src), with its own stand-ins for Didit and for
//                  Stripe and its embedder that knows faces by name (verifier/test/fakes.ts), so the
//                  verifier's own code says what each decision, payment, try and refusal comes to.
//                  Didit approves every face check session it opens unless a test says it is
//                  unfinished, declined, expired, not passed, or past its hour; an
//                  ID check's session comes to what a test sets;
//   the host       services' own host (services/host/src), as `npm start` runs it, the plug and the
//                  credits, taking the verifier's sponsor's tickets;
//   the index      a stand-in answering /profiles/<address>.json in the shape services' index
//                  answers it (index/src/pages/profile.ts), each page what a test says the index made
//                  of the profile; 404 for any other, and down when a test says so. Services' index
//                  itself runs in the browser test, reading the host there.
//   the connector  a stand-in answering /open-key as services' mcp does (mcp/README.md, The
//                  connection), its identity kept so a test opens what is locked to it as the mcp
//                  would. Services' mcp itself runs in the browser test.
//
// And the device's storage, in memory, as a fresh browser has it.
//
// The verifier's code needs its own packages, which only `./standard.sh services` installs, so the
// app's build (Vercel's, with `./standard.sh` alone) never type-checks this (tsconfig.build.json);
// `npm run check` does.

import { mkdtempSync, rmSync } from 'node:fs'
import { type Server, createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { b64u } from '@foundationforest/folders'
import { newAccessKey, newSeed } from '@foundationforest/keys'
import { checkVerification, proofBytes, proveVerification, stampFromJson } from '@foundationforest/proofs'

import { readConfig, startHost } from '../services/host/src/host.ts'
import type { Decision as Decided } from '../services/verifier/src/didit.ts'
import { readConfig as verifierConfig, startVerifier } from '../services/verifier/src/service.ts'
import { FACE_WORKFLOW, FakeFaceCheck, FakePayments, ID_WORKFLOW, namedFaces, passed } from '../services/verifier/test/fakes.ts'
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

/** A port free on loopback. */
export async function freePort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  await new Promise<void>((resolve) => server.close(() => resolve()))
  return port
}

/** What Didit decided for a face check's session, as a test says it. */
export type Decision = 'approved' | 'unfinished' | 'declined' | 'expired' | 'not_passed' | 'past_its_hour'

/** The face every face check here takes a selfie of: the embedder knows it by name. */
const FACE = 'ada'

/** Each decision but the hour's, as Didit gives it to the verifier, in services' own fakes' words. */
const AS_DIDIT: Record<Exclude<Decision, 'past_its_hour'>, Decided> = {
  approved: passed(FACE),
  unfinished: passed(FACE, { status: 'In Progress' }),
  declined: passed(FACE, { status: 'Declined' }),
  expired: passed(FACE, { status: 'Expired' }),
  not_passed: passed(FACE, { liveness: [{ status: 'Declined' }] }),
}

/** Services' stand-in Didit for the face check, deciding every session it opens as `decideAll` says, but each one `decide` names. */
export class FaceDidit extends FakeFaceCheck {
  #all: Decision = 'approved'
  readonly #alone = new Set<string>()

  override async createSession(options: { callback?: string } = {}) {
    const session = await super.createSession(options)
    this.#apply(session.sessionId, this.#all)
    return session
  }

  decideAll(d: Decision): void {
    this.#all = d
    for (const id of [...this.sessions.keys()]) if (!this.#alone.has(id)) this.#apply(id, d)
  }

  decide(session: string, d: Decision): void {
    this.#alone.add(session)
    this.#apply(session, d)
  }

  /** Past its hour, the session is deleted at Didit, as the verifier's sweep does then: the verifier answers that it was used. */
  #apply(session: string, d: Decision): void {
    if (d === 'past_its_hour') this.sessions.delete(session)
    else this.set(session, AS_DIDIT[d])
  }
}

/** The verifier's name here, its gifts' credits (its own defaults: the ID check's ten times the face check's), and where Didit and Stripe may send a person back. */
export const VERIFIER_NAME = 'verifier.app-vitest.invalid'
export const FACE_CREDITS = 10
export const ID_CREDITS = 100
export const APP = 'https://app.example'

/** What a stand-in index page holds of a profile: the index's own JSON for it, as services' index writes it. */
export type IndexPage = { [key: string]: unknown }

export type World = Services & {
  /** The verifier's two keys, as its GET / gives them. */
  keys: { face: string; id: string }
  /** Didit for each check, as the verifier sees it; and Stripe, where a test pays a payment with `pay`, absent when the ID check is not for sale. */
  faceCheck: FaceDidit
  idCheck: FakeFaceCheck
  payments?: FakePayments
  /** What Didit decides for every face check session from now, unless `decide` names one. */
  decideAll(d: Decision): void
  decide(session: string, d: Decision): void
  /** The stand-in index's origin. */
  index: string
  /** What the stand-in index answers for the profile at `address`, from now; null, a 404. */
  indexSays(address: string, page: IndexPage | null): void
  /** The stand-in index down, or up again. */
  indexDown(down: boolean): void
  /** The stand-in connector's origin, and the identity its open key opens with. */
  connector: string
  connectorIdentity: string
  /** A folder's balance at the host, in credits. */
  balance(folder: string): Promise<number>
  close(): Promise<void>
}

/**
 * Services' verifier and host, a stand-in index and a stand-in connector, on loopback.
 * `entryPerKb` and `filePerKb` are the host's price of a kilobyte of an entry and of a file, in
 * credits, its own defaults unless a test sets them; `forSale: false` is a verifier with no Stripe.
 */
export async function world({ entryPerKb, filePerKb, forSale = true }: { entryPerKb?: string; filePerKb?: string; forSale?: boolean } = {}): Promise<World> {
  const dir = mkdtempSync(join(tmpdir(), 'forest-app-'))
  const hostPort = await freePort()
  const host = `http://127.0.0.1:${hostPort}`
  const faceCheck = new FaceDidit()
  const idCheck = new FakeFaceCheck()
  const payments = forSale ? new FakePayments() : undefined
  const verifier = await startVerifier(
    verifierConfig({
      VERIFIER_NAME,
      DIDIT_FACE_API_KEY: 'stand-in',
      DIDIT_ID_API_KEY: 'stand-in',
      DIDIT_FACE_WORKFLOW_ID: FACE_WORKFLOW,
      DIDIT_ID_WORKFLOW_ID: ID_WORKFLOW,
      DIDIT_BASE_URL: 'http://127.0.0.1:9',
      FACE_MODEL: 'stand-in',
      HOST_URL: host,
      FACE_CREDITS: String(FACE_CREDITS),
      ID_CREDITS: String(ID_CREDITS),
      APP_ORIGINS: APP,
      DATABASE_PATH: join(dir, 'verifier', 'verifier.sqlite'),
      PORT: '0',
    }),
    { faceCheck, idCheck, embedder: namedFaces(), ...(payments && { payments }), log: () => undefined },
  )
  const running = await startHost(readConfig({ DATA_DIR: join(dir, 'host'), PUBLIC_ORIGIN: host, PORT: String(hostPort), SPONSORS: verifier.sponsor!, ...(entryPerKb && { ENTRY_PER_KB: entryPerKb }), ...(filePerKb && { FILE_PER_KB: filePerKb }) }))

  const answer = (status: number, body: unknown, res: import('node:http').ServerResponse) => {
    res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }).end(JSON.stringify(body))
  }

  const pages = new Map<string, IndexPage>()
  let down = false
  const index: Server = createServer((req, res) => {
    req.resume()
    if (down) return void res.writeHead(503).end()
    const address = /^\/profiles\/([^/]+)\.json$/.exec(req.url ?? '')?.[1]
    const page = address ? pages.get(address) : undefined
    if (!page) return answer(404, { error: 'not_found' }, res)
    answer(200, page, res)
  })
  await new Promise<void>((resolve) => index.listen(0, '127.0.0.1', resolve))

  const opening = await newAccessKey()
  const connector: Server = createServer((req, res) => {
    req.resume()
    if (req.method === 'GET' && req.url === '/open-key') return answer(200, { openKey: opening.openKey }, res)
    answer(404, { error: 'not_found' }, res)
  })
  await new Promise<void>((resolve) => connector.listen(0, '127.0.0.1', resolve))

  return {
    verifier: verifier.url,
    host,
    keys: verifier.keys,
    faceCheck,
    idCheck,
    ...(payments && { payments }),
    decideAll: (d) => faceCheck.decideAll(d),
    decide: (session, d) => faceCheck.decide(session, d),
    index: `http://127.0.0.1:${(index.address() as AddressInfo).port}`,
    indexSays: (address, page) => void (page ? pages.set(address, page) : pages.delete(address)),
    indexDown: (d) => void (down = d),
    connector: `http://127.0.0.1:${(connector.address() as AddressInfo).port}`,
    connectorIdentity: opening.identity,
    balance: async (folder) => ((await (await fetch(`${host}/credits/balance/${folder}`)).json()) as { credits: number }).credits,
    close: async () => {
      await verifier.close()
      await new Promise<void>((resolve) => index.close(() => resolve()))
      await new Promise<void>((resolve) => connector.close(() => resolve()))
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

/** A person verified by the face check as the app verifies them, Didit approving it, with a profile for each of `labels`. */
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
