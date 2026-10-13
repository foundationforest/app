// The app's modules in a real browser: headless Chromium, through Playwright, with a virtual passkey
// authenticator (Chrome's DevTools WebAuthn domain) that has PRF, and one that has not.
//
//   npm run test:browser
//
// 1. The seed: made, locked under the passkey's PRF secret in IndexedDB, opened per action (one
//    face each), never stored but encrypted; refused, with nothing stored, where PRF is missing.
// 2. The proof: made in the worker, off the page's thread, from a note a throwaway issuer key
//    signed; checked in Node; timed, cold (proving files fetched) and warm.
// 3. Services from the page, over CORS: records published to and read from records' reference host
//    on loopback, the inbox pulled and opened, an issuer stand-in's session and note; with no
//    global Buffer on the page, which the standard's libraries no longer need.
// 4. The app's own build: its manifest, its service worker, and Chrome's word that it is installable.

import assert from 'node:assert/strict'
import { createPublicKey, verify } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { PublicKey, VersionedTransaction } from '@solana/web3.js'
import { type Browser, type BrowserContext, type CDPSession, type Page, chromium } from 'playwright'
import { build, preview, type PreviewServer } from 'vite'

import { importWords, issuerSecret, mainKey } from '../../standard/keys/src/index.ts'
import { deliver, readProfile } from '../../standard/records/src/index.ts'
import { message } from '../../standard/records/src/private.ts'
import { noteToJson, proofFromBytes, rowAddress, stampOf, verifyPerson } from '../../standard/registry/client/src/index.ts'
import { issuerStandIn, startHost, throwawayIssuer } from '../stand-ins.ts'

const app = fileURLToPath(new URL('../..', import.meta.url))
const here = fileURLToPath(new URL('.', import.meta.url))
const LABEL = 'tutoring/seller'
const REGISTRY_PROGRAM: string = JSON.parse(readFileSync(`${app}standard/registry/devnet/devnet.json`, 'utf8')).registry.programId
const report: string[] = []
const say = (line: string) => {
  report.push(line)
  console.log(`  ${line}`)
}

async function freePort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as { port: number }).port
  await new Promise((resolve) => server.close(resolve))
  return port
}

/** A page with a virtual passkey authenticator on this device (platform, face or fingerprint checked), with PRF or not. */
async function pageWith(browser: Browser, url: string, prf: boolean): Promise<{ context: BrowserContext; page: Page; cdp: CDPSession; asserted: () => number }> {
  const context = await browser.newContext()
  const page = await context.newPage()
  page.on('pageerror', (err) => console.log(`  page error: ${err.message}`))
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable', { enableUI: false })
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, hasPrf: prf, automaticPresenceSimulation: true },
  })
  let assertions = 0
  cdp.on('WebAuthn.credentialAsserted', () => void assertions++)
  await page.goto(url)
  await page.waitForFunction(() => 'forest' in globalThis)
  return { context, page, cdp, asserted: () => assertions }
}

let browser: Browser
let harness: PreviewServer
let host: Awaited<ReturnType<typeof startHost>>
let issuerServer: Awaited<ReturnType<typeof issuerStandIn>>
let seller: Awaited<ReturnType<typeof pageWith>>
let words: string

before(async () => {
  await build({ configFile: `${here}vite.config.ts` })
  harness = await preview({ configFile: `${here}vite.config.ts`, preview: { host: 'localhost', port: await freePort(), strictPort: true } })
  host = await startHost()
  issuerServer = await issuerStandIn()
  browser = await chromium.launch()
  say(`Chromium ${browser.version()}`)
  seller = await pageWith(browser, `${harness.resolvedUrls!.local[0]}harness.html`, true)
})

after(async () => {
  await browser?.close()
  await harness?.close()
  await host?.close()
  await issuerServer?.close()
})

test('the seed: locked under a passkey PRF secret in IndexedDB, opened once per action', async () => {
  const { page, asserted } = seller
  const made = await page.evaluate(async () => {
    const f = (globalThis as any).forest
    const { seed, words } = f.makeSeed()
    const { persisted } = await f.lockSeed(seed)
    seed.fill(0)
    const lock = await f.readLock()
    return { words, persisted, lock: { keys: Object.keys(lock).sort(), sealed: Array.from(lock.sealed as Uint8Array), credential: lock.credential.length } }
  })
  words = made.words
  const seed = importWords(words)
  assert.deepEqual(made.lock.keys, ['credential', 'iv', 'salt', 'sealed', 'v'], 'IndexedDB holds the passkey id, the salt, the iv and the sealed seed, nothing else')
  assert.equal(made.lock.sealed.length, 48, 'the seed sealed: 32 bytes and the tag')
  assert.ok(!Buffer.from(made.lock.sealed).includes(Buffer.from(seed.subarray(0, 8))), 'and not in the clear')
  say(`seed locked; persistent storage granted: ${made.persisted}`)

  const before = asserted()
  const address = () => page.evaluate((label) => (globalThis as any).forest.withSeed(async (s: Uint8Array) => (await (globalThis as any).forest.mainKey(s, label)).address), LABEL)
  const want = (await mainKey(seed, LABEL)).address
  assert.equal(await address(), want, 'withSeed opens the seed the words give')
  assert.equal(await address(), want)
  assert.equal(asserted() - before, 2, 'one face or fingerprint per action')
  await assert.rejects(page.evaluate(async () => (globalThis as any).forest.lockSeed(new Uint8Array(32))), /already locked/)
  say('withSeed: the right main key, one passkey assertion per action')
})

test('no PRF: refused with a clear message, nothing stored', async () => {
  const other = await pageWith(browser, `${harness.resolvedUrls!.local[0]}harness.html`, false)
  const refused = await other.page.evaluate(async () => {
    const f = (globalThis as any).forest
    try {
      await f.lockSeed(f.makeSeed().seed)
      return null
    } catch (err) {
      return { name: (err as Error).name, message: (err as Error).message, stored: await f.hasSeed() }
    }
  })
  assert.equal(refused?.name, 'NoPrf')
  assert.equal(refused?.stored, false)
  say(`no PRF: refused, "${refused?.message}"`)
  await other.context.close()
})

test('the proof: made in the worker, off the page thread, from a throwaway issuer key\'s note', async () => {
  const seed = importWords(words)
  const issuer = throwawayIssuer()
  const { secret, noteNumber } = await issuerSecret(seed, issuer.name)
  const main = await mainKey(seed, LABEL)
  const noteJson = noteToJson(issuer.sign(noteNumber))
  const payer = (await mainKey(new Uint8Array(32).fill(9), 'payer')).address

  const run = () =>
    seller.page.evaluate(
      async ({ label, issuerName, noteJson, payer }) => {
        const f = (globalThis as any).forest
        return f.withSeed(async (seed: Uint8Array) => {
          const main = await f.mainKey(seed, label)
          const { secret } = await f.issuerSecret(seed, issuerName)
          const { result, stallMs, ms } = await f.longestStall(() =>
            f.proveInWorker({ secret, note: f.noteFromJson(noteJson), label, profile: main.address, payer, recentBlockhash: payer, programId: f.REGISTRY_PROGRAM }),
          )
          const tx = f.VersionedTransaction.deserialize(result.transaction)
          tx.sign([f.Keypair.fromSeed(main.privateKey)])
          return { transaction: Array.from(tx.serialize() as Uint8Array), stamp: String(result.stamp), proof: Array.from(result.proof as Uint8Array), row: result.row, proveMs: result.ms, ms, stallMs, secretLeft: (secret as Uint8Array).byteLength }
        })
      },
      { label: LABEL, issuerName: issuer.name, noteJson, payer },
    )

  const cold = await run()
  const warm = await run()
  for (const got of [cold, warm]) {
    assert.equal(got.secretLeft, 0, 'the secret moved to the worker: the page keeps no copy')
    assert.equal(BigInt(got.stamp), stampOf(secret, LABEL))
    assert.ok(await verifyPerson({ proof: proofFromBytes(new Uint8Array(got.proof)), issuer: issuer.sign(noteNumber).issuer, label: LABEL, profile: main.publicKey, stamp: BigInt(got.stamp), tier: 1n }), 'the proof holds, checked in Node')
    const tx = VersionedTransaction.deserialize(new Uint8Array(got.transaction))
    const at = tx.message.staticAccountKeys.findIndex((k) => k.toBase58() === main.address)
    const key = createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: Buffer.from(main.publicKey).toString('base64url') }, format: 'jwk' })
    assert.ok(verify(null, tx.message.serialize(), key, tx.signatures[at]!), 'the main key signed the register transaction')
    assert.equal(got.row, rowAddress(BigInt(got.stamp), new PublicKey(REGISTRY_PROGRAM)).toBase58(), "the row's address, at the devnet registry")
  }
  say(`proof in the worker, cold: ${cold.proveMs.toFixed(0)} ms proving, ${cold.ms.toFixed(0)} ms in all with the proving files fetched (6.2 MB)`)
  say(`proof in the worker, warm: ${warm.proveMs.toFixed(0)} ms proving, ${warm.ms.toFixed(0)} ms in all`)
  say(`page thread's longest stall while proving: ${Math.max(cold.stallMs, warm.stallMs).toFixed(0)} ms`)
  assert.ok(warm.stallMs < 250, `the page thread kept running: its longest stall was ${warm.stallMs.toFixed(0)} ms`)
})

test('the host from the page: records published and read, the inbox pulled and opened', async () => {
  const seed = importWords(words)
  const main = await mainKey(seed, LABEL)
  const read = await seller.page.evaluate(
    async ({ label, host }) => {
      const f = (globalThis as any).forest
      return f.withSeed(async (seed: Uint8Array) => {
        const main = await f.mainKey(seed, label)
        const { recipient } = await f.inboxKey(main.privateKey)
        const card = { market: 'tutoring', role: 'seller', name: 'a seller', inboxKey: recipient, inbox: { senders: 'anyone' }, createdAt: '2026-10-13T12:00:00Z' }
        const now = Date.now()
        await f.publishRecords([host], [f.hostsRecord(main, [host], now), f.ownerRecord(main, 'profile', card, now)])
        const view = await f.readOwn([host], main.address)
        return { hosts: view.hosts, name: view.current.get('profile')?.record.body.name }
      })
    },
    { label: LABEL, host: host.url },
  )
  assert.deepEqual(read, { hosts: [host.url], name: 'a seller' })

  const buyer = await mainKey(new Uint8Array(32).fill(7), 'tutoring/buyer')
  const view = await readProfile([host.url], main.address, Date.now())
  const sent = await message(buyer, main.address, { text: 'Is Tuesday at six free?' }, Date.now(), view.current.get('profile')!.record.body!)
  await deliver(view.hosts, [sent])

  const inbox = await seller.page.evaluate(
    async ({ label, host }) => {
      const f = (globalThis as any).forest
      return f.withSeed(async (seed: Uint8Array) => (await f.pullInbox(host, await f.mainKey(seed, label))).messages.map((m: any) => [m.from, m.body.text]))
    },
    { label: LABEL, host: host.url },
  )
  assert.deepEqual(inbox, [[buyer.address, 'Is Tuesday at six free?']])
  say('host from the page over CORS: records published and read by POST, the inbox pulled and opened')

  // The standard's records and registry clients need no Buffer since the commit the app pins: the page has none.
  const bare = await seller.page.evaluate(
    async ({ host, address }) => {
      const f = (globalThis as any).forest
      const view = await f.readOwn([host], address)
      return { buffer: typeof (globalThis as any).Buffer, records: view.current.size, row: f.rowAddress(1n).toBase58() }
    },
    { host: host.url, address: main.address },
  )
  assert.equal(bare.buffer, 'undefined', 'no global Buffer on the page')
  assert.equal(bare.records, 2)
  assert.equal(bare.row, rowAddress(1n).toBase58())
  say(`no global Buffer on the page: records' readOwn read ${bare.records} records, registry's rowAddress gave ${bare.row.slice(0, 8)}…`)
})

test('the issuer from the page: a session with a return address, and a note', async () => {
  const seed = importWords(words)
  const name = issuerServer.issuer.name
  const { noteNumber } = await issuerSecret(seed, name)
  const got = await seller.page.evaluate(
    async ({ origin, returnUrl, name }) => {
      const f = (globalThis as any).forest
      const issuer = await f.readIssuer(origin)
      const s = await f.session(issuer, returnUrl)
      const noteNumber = await f.withSeed(async (seed: Uint8Array) => (await f.issuerSecret(seed, name)).noteNumber)
      const { json } = await f.note(issuer, s.sessionId, noteNumber)
      return { sessionId: s.sessionId, json }
    },
    { origin: issuerServer.url, returnUrl: `${harness.resolvedUrls!.local[0]}back`, name },
  )
  assert.equal(issuerServer.sessions.get(got.sessionId), `${harness.resolvedUrls!.local[0]}back`)
  assert.equal(got.json.noteNumber, noteNumber.toString())
  say('issuer from the page over CORS: a session with a return address, a note checked')
})

test("the app's build: its manifest, its service worker, and installable", async () => {
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn' })
  const server = await preview({ root: app, configFile: `${app}vite.config.ts`, preview: { host: 'localhost', port: await freePort(), strictPort: true } })
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(server.resolvedUrls!.local[0]!)
  const sw = await page.evaluate(async () => {
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 10_000))])
    return { registered: Boolean(reg), font: getComputedStyle(document.body).fontFamily, paper: getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() }
  })
  assert.ok(sw.registered, 'the service worker registers')
  await page.reload()
  const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller))
  const cdp = await context.newCDPSession(page)
  const { installabilityErrors } = (await cdp.send('Page.getInstallabilityErrors')) as { installabilityErrors: { errorId: string }[] }
  const manifest = await (await fetch(new URL('manifest.webmanifest', server.resolvedUrls!.local[0]))).json()
  say(`app build: service worker registered, controls the page after reload: ${controlled}; installability errors: ${installabilityErrors.map((e) => e.errorId).join(', ') || 'none'}; manifest "${manifest.name}", ${manifest.icons.length} icons`)
  assert.deepEqual(installabilityErrors, [])
  assert.ok(controlled)
  assert.match(sw.font, /Manrope/)
  await context.close()
  await server.close()
})

after(() => {
  console.log('\nBrowser report:\n' + report.map((l) => `- ${l}`).join('\n'))
})
