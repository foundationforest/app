// The app in headless Chromium, through Playwright, with Chrome's virtual passkey authenticator,
// which has PRF, against services' own verifier (its stand-in Didit and stand-in face model), host
// and index on loopback (services.ts), and services' own mcp, its APP_URL this app's /connect, as
// services' tests run it (mcp/test/setup.ts: its host reached with plain fetch, on loopback). The app is built with its config pointed at them, served as
// Vercel serves it (vercel.ts: vercel.json's headers, its files, its rewrites, else 404) under
// vercel.json's CSP, its connect-src and img-src naming these services, at app.forest.foundation
// mapped to loopback and taken as a secure origin, so its passkeys are made for that address.
//
//   ./standard.sh services && npm run test:browser
//
//  1. Start, on a device that knows no passkey: two buttons at once, nothing asked; a closed sheet
//     claims neither none nor one; Create a passkey made it for app.forest.foundation.
//  2. Back on each setup step: Get verified to Start, which now asks for the passkey made alone,
//     never Create; the ID check (its price and tries, what it keeps tapped open) to Get verified,
//     even after "Payment isn't available right now."; the face check's wait to Get verified.
//  3. Get verified: Face picked again, Continue; the face check in a tab of its own, opened on the
//     tap, which Didit's page sends back to /back, where it closes itself; the gift collected into
//     the wallet; the stamp kept in the Profiles folder; nothing of the seed kept; then Your first
//     profile.
//  4. The first profile, in two steps: back to Profiles and in again; a search over the markets, a
//     market, its roles, back to the markets; one pick, one unlock, the verification proven in the
//     worker; Use Forest from your AI, whose Connect opens Connect an AI: three steps, no links, Copy
//     copying the connector's address; its profile entry on the host, its verification checking as
//     any reader checks it; the shield; Share, a sheet whose Copy copies its address; a market's role
//     made is gone from it.
//  5. Settings: Face with its check, ID with + $5, the appearance; no About.
//  6. Two people: the first posts an offer from their profile, its price per hour; the second opens
//     its link with nothing set up, goes through Start and the face check, makes the profile on the
//     other side from the compose screen's From, and messages; the first sees it counted with nothing
//     unlocked, opens every inbox in one unlock, sees who it is from with the shield, and replies; the
//     second reads the reply beside what they sent, and reviews the tutor from the thread, the
//     slider's thumb hidden until touched, naming the offer.
//  7. A second browser, with the same passkey, answered from the first, as a phone answers through
//     the passkey sheet's QR code: I already have one finds the profile and the stamp.
//  8. One passkey per person: after Forget, Start finds the passkey and asks nothing more; with the
//     sheet closed, "No passkey chosen." and Try again, and never Create a passkey.
//  9. Clothing, with the index: the first posts a coat with two photos, redrawn on the device as
//     JPEGs no longer than 1600 pixels, their notes gone, no per to pick, an area alone; a buyer
//     writes with the pencil's compose screen (their own address refused once) and reviews the coat
//     from the thread, then, from their profile's Review, vouches (their own address refused once)
//     and reports, and Given lists all three; the seller sees the rating on the card, in Reviews, and
//     the review in the Inbox with its dot, until the Inbox has shown it, and opens it.
//     Then the AI apps, with services' own mcp and an AI app as services' tests make one (the MCP
//     SDK's client, mcp/test/setup.ts):
//  a. its login comes to the connect page: the AI app's name, its redirect's host, the profiles
//     unticked; one ticked, Connect, one unlock; the AI app gets its token, reads its profile and
//     writes a post, which shows on the profile; the device keeps the AI app, never a key;
//  b. Settings' AI apps, between Verified and Appearance: the AI app, its day, its one profile, kept
//     ticked while it is the last; another ticked, one unticked and ticked again, one unlock each,
//     the AI's profiles following with no new login; Disconnect, one unlock: the AI's next call
//     refused, and its post stays;
//  c. a new phone, nothing set up, at a connect page: I already have one first, then Create a
//     passkey; the face check and the first profile, then back to the connect page, its one profile
//     ticked, no Use Forest from your AI; Connect;
//  d. a connector that isn't ours: one line, nothing else; a request that ran out: one line.
// 10. Held for review: Being reviewed, the app asking all the while; approved, Continue, one unlock.
// 11. A manager that gives no PRF secret: its passkey dropped, the line naming another. A browser
//     that cannot ask for PRF: one quiet line.
// 12. The passkey belongs to app.forest.foundation: another page under forest.foundation is refused.
// 13. The build: its manifest, its service worker in control, installable.
// 14. A deploy while the app is open: the next version takes over and the old proof worker is gone;
//     the page reloads once, back on a market's roles, and the profile is made.
// 15. The ID check, from Settings: the verifier's consent screen word for word, tapped open; paid
//     through the verifier's own stand-in for Stripe (its test card named first), the payment kept
//     on the device through Stripe's page; the check in its own tab; one unlock; both verifications
//     on every profile.
// 16. A declined check: one red line, and Start again opens a new check that passes.
// 17. Nothing the app did, through all of it, was refused by the CSP.
//
// SHOTS=<dir> keeps a screenshot of each screen there, light and dark.

import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { crc32 } from 'node:zlib'

import { Resvg } from '@resvg/resvg-js'

import { type Browser, type BrowserContext, type CDPSession, type Page, chromium } from 'playwright'
import { build } from 'vite'

import { b64u, liveContent, proofsOf, readFolder, verificationCheck } from '../../standard/folders/dist/index.js'
import { isLocked, openLocked } from '../../standard/folders/dist/locked.js'
import { mainKey, openingHalf } from '../../standard/keys/dist/index.js'
import { checkVerification, stampFromJson } from '../../standard/proofs/dist/index.js'
import { type Served, serve } from '../../services/mcp/src/server.ts'
import { App } from '../../services/mcp/test/app.ts'
import { REDIRECT, aiApp, lesson } from '../../services/mcp/test/setup.ts'
import { type Running, freePort, startServices } from './services.ts'
import { serveLikeVercel } from './vercel.ts'

const app = fileURLToPath(new URL('../../', import.meta.url))
const outDir = fileURLToPath(new URL('out/app', import.meta.url))
/** The next deploy: the same app, every chunk named anew. */
const nextDir = fileURLToPath(new URL('out/next', import.meta.url))
const shots = process.env.SHOTS
const say = (line: string) => console.log(`  ${line}`)

let services: Running
/** Services' own mcp, and the directory it keeps its two keys in. */
let mcp: Served
let mcpDir: string
let server: Awaited<ReturnType<typeof serveLikeVercel>>
let browser: Browser
let APP: string
let OTHER: string
let csp: string
/** app.forest.foundation and other.forest.foundation on loopback, each taken as a secure origin. */
let CHROME_ARGS: string[]
const refused: string[] = []

type Phone = { context: BrowserContext; page: Page; cdp: CDPSession; authenticator: string; counts: { created: number; asserted: number } }
/** The first person's browser, its seed (asked of its passkey by the test itself), and their profile. */
let first: Phone
let seed: Uint8Array
let tutor: string

async function shot(page: Page, name: string) {
  if (!shots) return
  mkdirSync(shots, { recursive: true })
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.screenshot({ path: `${shots}/${name}-${scheme}.png`, fullPage: true })
  }
  await page.emulateMedia({ colorScheme: 'light' })
}

/**
 * A browser of its own, a phone's size, with a virtual passkey authenticator on the device (face
 * or fingerprint checked), with PRF unless `prf` is false; its passkeys made and asserted, counted.
 * What the CSP refuses on any of its pages is reported.
 */
async function phone({ prf = true }: { prf?: boolean } = {}): Promise<Phone> {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] })
  await context.exposeFunction('cspRefused', (what: string) => void refused.push(what))
  await context.addInitScript(() => addEventListener('securitypolicyviolation', (e) => (globalThis as any).cspRefused(`${e.violatedDirective} ${e.blockedURI}`)))
  // Didit's page, for the stand-in Didit's sessions: done at once, it sends the person back, as Didit does to the verifier's callback.
  await context.route('https://fake-didit.invalid/**', (route) => route.fulfill({ contentType: 'text/html', body: `<script>location.replace(${JSON.stringify(`${APP}back`)})</script>` }))
  const page = await context.newPage()
  page.on('pageerror', (err) => say(`page error: ${err.message}`))
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable', { enableUI: false })
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, hasPrf: prf, automaticPresenceSimulation: true },
  })
  const counts = { created: 0, asserted: 0 }
  cdp.on('WebAuthn.credentialAdded', () => void counts.created++)
  cdp.on('WebAuthn.credentialAsserted', () => void counts.asserted++)
  return { context, page, cdp, authenticator: authenticatorId, counts }
}

/** The seed as the app derives it, asked by the test itself: the PRF secret for "forest-seed-v1", relying party app.forest.foundation. One assertion. */
async function seedOn(page: Page): Promise<Uint8Array> {
  const bytes = await page.evaluate(async () => {
    const got = (await navigator.credentials.get({
      publicKey: { rpId: 'app.forest.foundation', challenge: crypto.getRandomValues(new Uint8Array(32)), userVerification: 'required', extensions: { prf: { eval: { first: new TextEncoder().encode('forest-seed-v1') } } } },
    })) as PublicKeyCredential
    return Array.from(new Uint8Array(got.getClientExtensionResults().prf!.results!.first as ArrayBuffer))
  })
  return new Uint8Array(bytes)
}

const kept = (page: Page) => page.evaluate(() => ({ ...localStorage }))
/** The shield a verified profile shows: an icon, never a word. */
const shield = (within: { getByRole: Page['getByRole'] }) => within.getByRole('img', { name: 'Verified' })
const balance = async (folder: string) => ((await (await fetch(`${services.host}/credits/balance/${folder}`)).json()) as { credits: number }).credits
const button = (page: Page, name: string | RegExp) => page.getByRole('button', { name, exact: typeof name === 'string' })

/** The face check picked, then Continue, its tab opened on the tap and closed by Didit's page sending it back. */
async function faceCheck(p: Phone) {
  await p.page.getByRole('heading', { name: 'Get verified' }).waitFor()
  await p.page.getByRole('radio', { name: /^Face/ }).click()
  const tab = p.context.waitForEvent('page')
  await button(p.page, 'Continue').click()
  await (await tab).waitForEvent('close')
}

/** A new person in `p`'s browser through Start's Create a passkey and the face check. */
async function newPerson(p: Phone) {
  await p.page.goto(APP)
  await button(p.page, 'Create a passkey').click()
  await faceCheck(p)
}

/** A role in words, as New profile shows it: Seller. */
const roleWords = (role: string) => role.charAt(0).toUpperCase() + role.slice(1)

/** One of the markets' roles picked on New profile: its market found by searching, then its role; one unlock, then its profile. */
async function pickProfile(page: Page, words: string) {
  const [market, role] = words.split(' / ') as [string, string]
  await page.getByLabel('Search').fill(market.toLowerCase())
  await button(page, market).click()
  await button(page, roleWords(role)).click()
  await page.getByRole('heading', { name: words }).waitFor({ timeout: 120_000 })
}

/** A first profile picked on Your first profile: its market found by searching, then its role; one unlock, then Use Forest from your AI. */
async function pickFirst(page: Page, words: string) {
  const [market, role] = words.split(' / ') as [string, string]
  await page.getByLabel('Search').fill(market.toLowerCase())
  await button(page, market).click()
  await button(page, roleWords(role)).click()
  await page.getByRole('heading', { name: 'Use Forest from your AI' }).waitFor({ timeout: 120_000 })
}

/** The page's own navigator.credentials.get, answering once as a closed sheet does: no passkey. */
const closeTheSheetOnce = (page: Page) =>
  page.evaluate(() => {
    const own = navigator.credentials.get
    navigator.credentials.get = () => {
      navigator.credentials.get = own
      return Promise.reject(new DOMException('The sheet was closed.', 'NotAllowedError'))
    }
  })

/** A service's route in `context` answered with `status` and `body`, and CORS as the services answer it. */
async function answer(context: BrowserContext, url: string, status: number, body: unknown, when: () => boolean = () => true) {
  await context.route(url, (route) => {
    if (!when()) return route.continue()
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST' }
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    return route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) })
  })
}

/** A PNG of `width` by `height`, drawn from an SVG, carrying a note as a camera's location would be carried: what the device's redraw must leave behind. */
function photoPng(width: number, height: number, color: string, note: string): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/><circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 3}" fill="#edeae0"/></svg>`
  const png = Buffer.from(new Resvg(svg).render().asPng())
  const data = Buffer.concat([Buffer.from('Comment\0', 'latin1'), Buffer.from(note, 'latin1')])
  const chunk = Buffer.alloc(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  chunk.write('tEXt', 4, 'latin1')
  data.copy(chunk, 8)
  chunk.writeUInt32BE(crc32(Buffer.concat([Buffer.from('tEXt', 'latin1'), data])), 8 + data.length)
  const end = png.length - 12
  return Buffer.concat([png.subarray(0, end), chunk, png.subarray(end)])
}

/** A JPEG's width and height, from its frame header. */
function jpegSize(b: Uint8Array): { width: number; height: number } {
  assert.deepEqual([b[0], b[1]], [0xff, 0xd8], 'a JPEG')
  for (let i = 2; i + 9 < b.length; ) {
    const marker = b[i + 1]!
    const length = (b[i + 2]! << 8) | b[i + 3]!
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: (b[i + 5]! << 8) | b[i + 6]!, width: (b[i + 7]! << 8) | b[i + 8]! }
    i += 2 + length
  }
  throw new Error('no frame header')
}

/** Profiles opened again and again, so it reads the index each time, until `card` says `text`. */
async function untilCard(page: Page, card: string, text: string) {
  const until = Date.now() + 90_000
  for (;;) {
    await button(page, 'Settings').click()
    await button(page, 'Profiles').click()
    const line = page.locator('button.card', { hasText: card })
    if (((await line.textContent({ timeout: 10_000 })) ?? '').includes(text)) return line
    if (Date.now() > until) throw new Error(`${card} never said ${text}`)
    await page.waitForTimeout(1_000)
  }
}

before(async () => {
  const port = await freePort()
  APP = `http://app.forest.foundation:${port}/`
  OTHER = `http://other.forest.foundation:${port}/`
  services = await startServices({ appOrigin: APP.slice(0, -1), say })
  mcpDir = mkdtempSync(join(tmpdir(), 'forest-app-mcp-'))
  mcp = await serve({ appUrl: `${APP}connect`, dataDir: mcpDir, read: { index: services.index }, hostFetch: fetch }, '127.0.0.1', 0)
  // The app's one config file, pointed at these services (src/config.ts).
  process.env.VITE_FOREST_CONFIG = JSON.stringify({ app: APP.slice(0, -1), verifier: services.verifier, host: services.host, connector: mcp.origin, index: services.index })
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir, emptyOutDir: true } })
  const renamed = { entryFileNames: 'assets/[name]-next-[hash].js', chunkFileNames: 'assets/[name]-next-[hash].js' }
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir: nextDir, emptyOutDir: true, rolldownOptions: { output: renamed } }, worker: { rolldownOptions: { output: renamed } } })
  // vercel.json's CSP, its connect-src and img-src naming these services in place of ours (test/build.test.ts checks it names ours).
  const vercel = JSON.parse(readFileSync(`${app}vercel.json`, 'utf8'))
  const real: string = vercel.headers.find((h: any) => h.source === '/(.*)').headers.find((h: any) => h.key === 'Content-Security-Policy').value
  csp = real
    .split('; ')
    .map((d) => (d.startsWith('connect-src ') ? `connect-src 'self' ${services.verifier} ${services.host} ${mcp.origin} ${services.index}` : d.startsWith('img-src ') ? d.replace('https://host.forest.foundation', services.host) : d))
    .join('; ')
  server = await serveLikeVercel({ root: outDir, port, override: { 'Content-Security-Policy': csp } })
  // Chromium itself, not its headless shell, which does not take an insecure origin as secure; and WebAuthn wants a secure one.
  CHROME_ARGS = ['--host-resolver-rules=MAP *.forest.foundation 127.0.0.1', `--unsafely-treat-insecure-origin-as-secure=${[APP, OTHER].map((o) => o.slice(0, -1)).join(',')}`]
  browser = await chromium.launch({ channel: 'chromium', args: CHROME_ARGS })
  first = await phone()
  say(`Chromium ${browser.version()}, the app at ${APP}, services' verifier at ${services.verifier}, host at ${services.host}, index at ${services.index} and mcp at ${mcp.origin}`)
})

after(async () => {
  await browser?.close()
  await server?.close()
  await mcp?.close()
  if (mcpDir) rmSync(mcpDir, { recursive: true, force: true })
  await services?.stop()
})

test('Start, on a device that knows no passkey: two buttons at once, nothing asked; a closed sheet claims neither; Create a passkey made it for app.forest.foundation', async () => {
  const { page, counts, cdp, authenticator } = first
  const res = await page.goto(APP)
  assert.equal(res?.headers()['content-security-policy'], csp, 'the page comes with the CSP')
  await button(page, 'Create a passkey').waitFor()
  assert.ok(await button(page, 'I already have one').isVisible(), 'and the sheet, with its QR code, one tap away')
  assert.equal(await button(page, 'Start').count(), 0, 'no sheet first')
  assert.equal(counts.asserted + counts.created, 0, 'nothing asked')
  await shot(page, 'start')
  await closeTheSheetOnce(page)
  await button(page, 'I already have one').click()
  await page.getByText('No passkey chosen.').waitFor()
  assert.ok((await button(page, 'Create a passkey').isVisible()) && (await button(page, 'I already have one').isVisible()), 'both still there')
  await shot(page, 'start-closed')
  await button(page, 'Create a passkey').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  assert.equal(counts.created, 1)
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId: authenticator })
  assert.deepEqual(credentials.map((c) => [c.rpId, c.isResidentCredential]), [['app.forest.foundation', true]])
  const local = await kept(page)
  assert.deepEqual(Object.keys(local).sort(), ['forest.passkeys', 'forest.v'], 'the passkey known, not yet in use: no one is verified here yet')
  await shot(page, 'verify')
  say('Start: two buttons, nothing asked first; Create a passkey made it for app.forest.foundation')
})

test("back on each setup step: Get verified to Start, which asks for the passkey made alone; the ID check to Get verified, even after a payment that failed; the face check's wait to Get verified", async () => {
  const { page, context, counts } = first
  const rows = await page.getByRole('radio').allTextContents()
  assert.deepEqual(rows, ['FaceA selfieFree', 'IDYour ID and a selfie · counts more$5'], 'two rows, and no other words')
  assert.ok(await button(page, 'Continue').isDisabled(), 'Continue once a row is picked')

  // Get verified, back to Start: this device knows the passkey now, so Start asks for it alone.
  await button(page, 'Back').click()
  await button(page, 'Start').waitFor()
  assert.equal(await button(page, 'Create a passkey').count(), 0, 'never a second passkey')
  await shot(page, 'start-known')
  const asked = counts.asserted
  await button(page, 'Start').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  assert.equal(counts.asserted - asked, 1, 'one unlock, by the passkey made')

  // The ID check: its price and tries, what it keeps behind a tap; the payment fails, and back.
  let unavailable = true
  await answer(context, `${services.verifier}/id/payment`, 503, { error: 'payment_unavailable' }, () => unavailable)
  await page.getByRole('radio', { name: /^ID/ }).click()
  await button(page, 'Continue').click()
  await page.getByRole('heading', { name: 'ID check' }).waitFor()
  await page.getByText('$5 · up to three tries').waitFor()
  assert.equal(await page.locator('.consent').isVisible(), false, 'what the check keeps, behind a tap')
  await page.getByText('What the check keeps').click()
  await page.locator('.consent').waitFor()
  await shot(page, 'id-before-paying')
  await button(page, 'Pay $5').click()
  await page.getByText("Payment isn't available right now. Try again in a minute.").waitFor()
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  assert.equal(await page.getByRole('radio', { name: /^ID/ }).getAttribute('aria-checked'), 'true', 'the ID check still picked')
  unavailable = false

  // The face check, left unfinished in its tab: Finish in the other tab, and back, the asking stopped.
  let unfinished = true
  await answer(context, `${services.verifier}/face/stamp`, 403, { error: 'not_approved' }, () => unfinished)
  await page.getByRole('radio', { name: /^Face/ }).click()
  const tab = context.waitForEvent('page')
  await button(page, 'Continue').click()
  await (await tab).waitForEvent('close')
  await page.getByText('Finish in the other tab.').waitFor()
  const session = JSON.parse((await kept(page))['forest.setup']!).session as string
  assert.ok(session, 'the check under way, kept')
  await shot(page, 'face-away')
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  await page.waitForFunction(() => !(document.querySelector('main button.primary') as HTMLButtonElement | null)?.disabled, null, { timeout: 5_000 })
  assert.equal(await page.getByRole('radio', { name: /^Face/ }).getAttribute('aria-checked'), 'true', 'the face check still picked')
  assert.equal(JSON.parse((await kept(page))['forest.setup']!).session, session, 'and still under way')
  unfinished = false
  say('back: Get verified to Start, the ID check after a failed payment, and the face check waiting, each to Get verified')
})

test('Get verified: Face picked again, then Continue; the face check in its own tab, back through /back; the gift in the wallet, the stamp in the Profiles folder; then Your first profile', async () => {
  const { page, context } = first
  await page.getByRole('radio', { name: /^Face/ }).click()
  const tab = context.waitForEvent('page')
  await button(page, 'Continue').click()
  const didit = await tab
  await didit.waitForEvent('close')
  say(`the check's tab opened on the tap, went to ${new URL(didit.url()).pathname} and closed itself`)
  await page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  await shot(page, 'first-profile')
  seed = await seedOn(page)
  const wallet = await mainKey(seed, '')
  const left = await balance(wallet.address)
  assert.ok(left > 9.9 && left < 10, `the gift's 10 credits in the wallet, less the Profiles folder's first write: ${left}`)
  const view = await readFolder([services.host], wallet.address, Date.now())
  assert.deepEqual(view.current.get('profile')?.entry.body, { hosts: [services.host] })
  const { identity } = await openingHalf(wallet.secret)
  const stamps = [...liveContent(view)].filter(([path]) => path.startsWith('stamp/'))
  assert.equal(stamps.length, 1)
  const body = stamps[0]![1].entry.body
  assert.ok(isLocked(body))
  const stamp = stampFromJson(JSON.parse((await openLocked(body, identity)).stamp as string))
  assert.equal(stamp.verifier, services.faceKey, "the stamp from the verifier's face key")
  const local = await kept(page)
  assert.deepEqual(Object.keys(local).sort(), ['forest.checks', 'forest.passkey', 'forest.passkeys', 'forest.v'])
  assert.deepEqual(JSON.parse(local['forest.checks']!), ['face'], 'how the person is verified')
  for (const secret of [Buffer.from(seed).toString('hex'), Buffer.from(seed).toString('base64url'), String(stamp.signature.S)]) assert.ok(!JSON.stringify(local).includes(secret), 'nothing of the seed or the stamp kept')
  say(`verified: the stamp in the Profiles folder, the wallet at ${left} credits`)
})

test('the first profile, in two steps: back to Profiles and in again; a search, a market, its roles; one pick, one unlock, its verification proven in the worker; the shield; Share shows its address, and Copy copies it', async () => {
  const { page, counts } = first
  // Your first profile has a back too: to Profiles, empty, whose New profile comes back here.
  await button(page, 'Back').click()
  await button(page, 'New profile').click()
  await page.getByRole('heading', { name: 'Your first profile' }).waitFor()
  await page.getByLabel('Search').fill('home')
  const found = await page.locator('button.row').allTextContents()
  assert.deepEqual(found, ['Home cleaning', 'Home repair'], 'the search narrows the markets')
  await page.getByLabel('Search').fill('seller')
  assert.deepEqual(await page.locator('button.row').allTextContents(), ['Clothing', 'Electronics'], "and finds them by their roles' words")
  await page.getByLabel('Search').fill('')
  const rows = await page.locator('button.row').allTextContents()
  assert.ok(rows.includes('Tutoring') && rows.includes('Home cleaning') && rows.includes('Tennis matches'), `one row a market, in its words: ${rows.join(', ')}`)
  await shot(page, 'first-profile-markets')
  await button(page, 'Clothing').click()
  await page.getByRole('heading', { name: 'Clothing' }).waitFor()
  assert.deepEqual(await page.locator('button.row').allTextContents(), ['Seller', 'Buyer'], 'then its roles')
  await shot(page, 'first-profile-roles')
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Your first profile' }).waitFor()
  const asked = counts.asserted
  const started = Date.now()
  await pickFirst(page, 'Tutoring / tutor')
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  say(`a profile made in ${((Date.now() - started) / 1000).toFixed(1)} s, its proof in the worker`)
  // Use Forest from your AI, once: Connect opens Connect an AI, three steps and no links.
  assert.deepEqual(await page.getByRole('button').allTextContents(), ['Connect', 'Not now'])
  await shot(page, 'use-ai')
  await button(page, 'Connect').click()
  await page.getByRole('heading', { name: 'Connect an AI' }).waitFor()
  assert.deepEqual(await page.locator('.steps > li').allTextContents(), ['In your AI app, add a connector.', `Paste this address:${mcp.origin}Copy`, 'It brings you back here to pick its profiles.'])
  assert.equal(await page.locator('a').count(), 0, 'no links to other sites')
  await button(page, 'Copy').click()
  await button(page, 'Copied').waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), mcp.origin, 'the address shown, in full')
  await shot(page, 'connect-ai')
  // Back: Profiles, and Use Forest from your AI never again.
  await button(page, 'Back').click()
  await page.locator('button.card', { hasText: 'Tutoring / tutor' }).click()
  await shield(page.getByRole('heading', { name: 'Tutoring / tutor' })).waitFor()
  await page.getByRole('button', { name: /No reviews yet/ }).waitFor()
  await shot(page, 'profile')
  const main = await mainKey(seed, 'tutoring/tutor')
  tutor = main.address
  const body = (await readFolder([services.host], tutor, Date.now())).current.get('profile')?.entry.body
  assert.deepEqual([body?.market, body?.role, body?.hosts], ['tutoring', 'tutor', [services.host]])
  const check = verificationCheck(proofsOf(body).find((p) => p.circuit === 'verification'), tutor)
  assert.ok(check && (await checkVerification(check)), 'its verification checks, as any reader checks it')
  await button(page, 'Share').click()
  await page.getByRole('dialog').getByText(tutor).waitFor()
  await shot(page, 'share')
  await button(page, 'Copy').click()
  await button(page, 'Copied').waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), tutor, 'its address, in full')
  await page.locator('.sheet-cover').click({ position: { x: 10, y: 10 } })
  await button(page, 'Back').click()
  const card = page.locator('button.card', { hasText: 'Tutoring / tutor' })
  await shield(card).waitFor()
  assert.equal(await card.locator('.dot').count(), 0, 'nothing new')
  assert.deepEqual(JSON.parse((await kept(page))['forest.profiles']!), [{ label: 'tutoring/tutor', address: tutor }])
  await shot(page, 'profiles')
  // A role made is gone from its market.
  await button(page, 'New profile').click()
  await button(page, 'Tutoring').click()
  assert.deepEqual(await page.locator('button.row').allTextContents(), ['Student'], 'the tutor made, the student left')
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  await card.waitFor()
})

test('Settings: Face with its check, ID with + $5, the appearance as three icons; no About, version or source', async () => {
  const { page } = first
  await button(page, 'Settings').click()
  await page.getByRole('heading', { name: 'Settings' }).waitFor()
  await page.getByRole('img', { name: 'Done' }).waitFor()
  assert.equal(await page.getByRole('img', { name: 'Done' }).count(), 1, 'Face, checked')
  assert.ok(await button(page, '+ $5').isVisible(), 'and the ID check, for $5')
  for (const gone of ['About', /^Version/, 'Source']) assert.equal(await page.getByText(gone).count(), 0, `no ${gone}`)
  await shot(page, 'settings')
  await page.getByRole('radio', { name: 'Dark' }).click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
  await page.reload()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'kept, and back on Settings after a reload')
  await page.getByRole('radio', { name: 'Device' }).click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), undefined)
  assert.ok(await button(page, 'Forget this device').isVisible())
  await button(page, 'Profiles').click()
})

const ASK = 'Is Tuesday at six free?'
const YES = 'Tuesday at six, yes.'
const OFFER = 'Maths for secondary school, one hour online.'

/** The live entries of a folder under `kind/`, as the host serves it now. */
const entriesOf = async (address: string, kind: string) => [...liveContent(await readFolder([services.host], address, Date.now()))].filter(([path]) => path.startsWith(`${kind}/`))

test('two people: one posts an offer, its price per hour; the other opens its link, messages it, gets the reply, and reviews it from the thread', async () => {
  const { page, counts } = first
  // The offer, from the tutor's profile, in the market's own fields; a price per one of its field's values.
  await page.locator('button.card', { hasText: 'Tutoring / tutor' }).click()
  await button(page, 'New offer').click()
  await page.getByRole('heading', { name: 'New offer' }).waitFor()
  await page.getByLabel('Description').fill(OFFER)
  await page.getByLabel('Price').fill('30')
  assert.deepEqual(await page.getByRole('group', { name: 'Per' }).getByRole('button').allTextContents(), ['per hour', 'per session'], "exactly the field's per values")
  await page.getByRole('group', { name: 'Per' }).getByRole('button', { name: 'per hour' }).click()
  await page.getByRole('group', { name: 'Subjects' }).getByRole('button', { name: 'Maths' }).click()
  await page.getByRole('group', { name: 'Place' }).getByRole('button', { name: 'Online' }).click()
  await page.getByLabel('Contact').fill('ada@example.com')
  await page.getByText('Public.').waitFor()
  await shot(page, 'post-offer')
  let asked = counts.asserted
  await button(page, 'Post').click()
  await page.locator('.post-row', { hasText: OFFER }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  const posts = await entriesOf(tutor, 'post')
  assert.equal(posts.length, 1)
  const [offerPath, offer] = posts[0]!
  assert.match(offerPath, /^post\/[0-9a-f]{32}$/, 'at a random id')
  assert.deepEqual(offer.entry.body, { description: OFFER, price: { amount: '30', currency: 'USD', per: 'hour' }, subjects: ['maths'], place: { online: true }, contact: 'ada@example.com' })
  await page.getByRole('heading', { name: 'Your offers' }).waitFor()
  await shot(page, 'profile-posts')

  // The second person opens a message link with nothing set up: Start and the face check first, then the message.
  const second = await phone()
  await second.page.goto(`${APP}message?to=${tutor}`)
  await button(second.page, 'Create a passkey').click()
  await faceCheck(second)
  // The compose screen, all of it there: To filled with the link's address and who it is under it; From, the profile to make.
  await second.page.getByRole('heading', { name: 'New message' }).waitFor({ timeout: 60_000 })
  assert.equal(new URL(second.page.url()).search, '', "the profile's address out of the path")
  assert.equal(await second.page.getByLabel('To').inputValue(), tutor)
  await shield(second.page.locator('.who', { hasText: 'Tutoring / tutor' })).waitFor()
  await second.page.locator('.from', { hasText: 'Tutoring / student' }).waitFor()
  assert.ok(await second.page.getByLabel('Message').isVisible(), 'the message box from the start')
  assert.ok(await button(second.page, 'Send').isDisabled(), 'Send once there is a profile to send from')
  await shot(second.page, 'message-new-profile')
  await button(second.page, 'New profile').click()
  await second.page.locator('.from button').waitFor({ state: 'detached', timeout: 120_000 })
  assert.ok(await second.page.locator('.from', { hasText: 'Tutoring / student' }).isVisible(), 'from the profile just made')
  await shot(second.page, 'message')
  await second.page.getByLabel('Message').fill(ASK)
  await button(second.page, 'Send').click()
  await second.page.locator('.said.mine', { hasText: ASK }).waitFor({ timeout: 60_000 })
  const student = JSON.parse((await kept(second.page))['forest.profiles']!)[0].address as string

  // The first: counted with nothing unlocked; one unlock opens every inbox; who it is from; the reply.
  await button(page, 'Back').click()
  await page.locator('button.card', { hasText: 'Tutoring / tutor' }).locator('.dot').waitFor({ timeout: 45_000 })
  await page.locator('.places .count', { hasText: '1' }).waitFor({ timeout: 45_000 })
  asked = counts.asserted
  await button(page, /Inbox$/).click()
  await page.getByText('1 new message').waitFor()
  await shot(page, 'inbox-locked')
  await button(page, 'Open').click()
  const row = page.locator('button.row', { hasText: 'Tutoring / student' })
  await shield(row).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock opens every inbox')
  await row.locator('.dot').waitFor()
  await page.locator('.places .count').waitFor({ state: 'detached' })
  await shot(page, 'inbox')
  await row.click()
  await page.getByText(ASK).waitFor()
  await page.getByText('Your Tutoring / tutor').waitFor()
  await page.getByLabel('Reply').fill(YES)
  await button(page, 'Send').click()
  await page.locator('.said.mine', { hasText: YES }).waitFor({ timeout: 60_000 })
  await shot(page, 'thread')
  assert.equal((await entriesOf(tutor, 'sent')).length, 1, "the reply's copy, in the tutor's own folder")
  await button(page, 'Back').click()
  assert.equal(await row.locator('.dot').count(), 0, 'looked at: new no more')

  // The second reads the reply beside what they sent, and reviews the tutor from the thread.
  await button(second.page, 'Back').click()
  await second.page.locator('.places .count', { hasText: '1' }).waitFor({ timeout: 45_000 })
  await button(second.page, /Inbox$/).click()
  await button(second.page, 'Open').click()
  await second.page.locator('button.row', { hasText: 'Tutoring / tutor' }).click()
  await second.page.locator('.said.mine', { hasText: ASK }).waitFor()
  await second.page.locator('.said:not(.mine)', { hasText: YES }).waitFor()
  await button(second.page, 'Review').click()
  await shield(second.page.locator('.who', { hasText: 'Tutoring / tutor' })).waitFor()
  const score = second.page.getByLabel('Score')
  assert.match((await score.getAttribute('class')) ?? '', /untouched/, "the thumb hidden until touched: no score looks chosen")
  await second.page.locator('.score .big', { hasText: '–' }).waitFor()
  await shot(second.page, 'review-untouched')
  await score.focus()
  await score.press('End')
  await second.page.locator('.score .big', { hasText: '10' }).waitFor()
  assert.equal(await score.getAttribute('class'), null, 'touched: its thumb shows')
  for (let i = 0; i < 6; i++) await score.press('ArrowLeft')
  await second.page.locator('.score .big', { hasText: '9.4' }).waitFor()
  await second.page.getByLabel('Comment').fill('Clear and patient.')
  await second.page.getByRole('button', { name: OFFER }).click()
  await shot(second.page, 'review-someone')
  await button(second.page, 'Post').click()
  await second.page.getByLabel('Reply').waitFor({ timeout: 60_000 })
  const reviews = await entriesOf(student, 'review')
  assert.equal(reviews.length, 1)
  const [, review] = reviews[0]!
  assert.deepEqual(review.entry.body, { subject: tutor, score: '9.4', text: 'Clear and patient.', post: `${tutor}/${offerPath}` }, 'about the tutor, naming the offer, in tenths')
  await second.context.close()
  await button(page, 'Profiles').click()
  say('two people: an offer per hour, found by its link, messaged, replied to, reviewed in tenths')
})

test("a second browser, the same passkey answering from the first, as a phone answers through the sheet's QR code: I already have one finds the profile and the stamp", async () => {
  const second = await phone()
  // The second browser's own authenticator holds no Forest passkey. Asked with the sheet, the first
  // browser's answers, as a phone does through the QR code: its PRF secret for the same salt.
  await second.context.exposeFunction('answerFromFirst', (wire: { rpId: string; allow: number[][]; first: number[] }) =>
    first.page.evaluate(async (w) => {
      try {
        const got = (await navigator.credentials.get({
          publicKey: { rpId: w.rpId, challenge: crypto.getRandomValues(new Uint8Array(32)), userVerification: 'required', ...(w.allow.length && { allowCredentials: w.allow.map((id) => ({ type: 'public-key' as const, id: new Uint8Array(id) })) }), extensions: { prf: { eval: { first: new Uint8Array(w.first) } } } },
        })) as PublicKeyCredential
        return { rawId: Array.from(new Uint8Array(got.rawId)), first: Array.from(new Uint8Array(got.getClientExtensionResults().prf!.results!.first as ArrayBuffer)) }
      } catch (err) {
        return { error: { name: (err as Error).name, message: (err as Error).message } }
      }
    }, wire),
  )
  await second.context.addInitScript(() => {
    const own = navigator.credentials.get.bind(navigator.credentials)
    const bytes = (b: BufferSource) => Array.from(b instanceof ArrayBuffer ? new Uint8Array(b) : new Uint8Array(b.buffer, b.byteOffset, b.byteLength))
    navigator.credentials.get = async (options?: CredentialRequestOptions) => {
      const pk = options?.publicKey
      if (!pk) return own(options)
      const got = await (globalThis as any).answerFromFirst({ rpId: pk.rpId, allow: (pk.allowCredentials ?? []).map((c) => bytes(c.id)), first: bytes(pk.extensions!.prf!.eval!.first) })
      if (got.error) throw new DOMException(got.error.message, got.error.name)
      const first = new Uint8Array(got.first).buffer
      return { type: 'public-key', id: '', rawId: new Uint8Array(got.rawId).buffer, getClientExtensionResults: () => ({ prf: { results: { first } } }) } as unknown as Credential
    }
  })
  const asked = first.counts.asserted
  await second.page.goto(APP)
  await button(second.page, 'I already have one').click()
  await shield(second.page.locator('button.card', { hasText: 'Tutoring / tutor' })).waitFor({ timeout: 60_000 })
  assert.equal(first.counts.asserted - asked, 1, "answered once, by the first browser's passkey")
  assert.equal(second.counts.created, 0, 'and no second passkey')
  assert.deepEqual(JSON.parse((await kept(second.page))['forest.profiles']!), [{ label: 'tutoring/tutor', address: tutor }])
  await second.context.close()
  say('a second browser found the profile and its verification, answered by the same passkey')
})

test('one passkey per person: after Forget, Start finds it; with the sheet closed, "No passkey chosen." and Try again, never Create a passkey', async () => {
  const { page, counts, cdp, authenticator } = first
  await button(page, 'Settings').click()
  await button(page, 'Forget this device').click()
  await page.getByText('Your passkey stays in your password manager.').waitFor()
  await button(page, 'Forget').click()
  await button(page, 'Start').click()
  await page.locator('button.card', { hasText: 'Tutoring / tutor' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.created, 1, 'Start found the passkey; nothing made')

  await button(page, 'Settings').click()
  await button(page, 'Forget this device').click()
  await button(page, 'Forget').click()
  // The person closes the passkey sheet: a browser can't tell that from no passkey, so the line claims neither.
  await closeTheSheetOnce(page)
  await button(page, 'Start').click()
  const line = page.getByText('No passkey chosen.')
  await line.waitFor()
  assert.equal(await line.getAttribute('class'), 'line', 'a quiet line')
  assert.equal(await button(page, 'Create a passkey').count(), 0, 'never Create where a passkey is known')
  await shot(page, 'start-closed-known')
  await button(page, 'Try again').click()
  await page.locator('button.card', { hasText: 'Tutoring / tutor' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.created, 1, 'and no second passkey')
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId: authenticator })
  assert.equal(credentials.length, 1)
  say('one passkey: found after Forget; a closed sheet, Try again, and never a second')
})

const COAT = 'A wool coat, worn twice.'

test('clothing, with the index: a coat with two photos redrawn on the device, no per, an area alone; a buyer messages, reviews, vouches and reports; the seller sees the rating, and the review in the Inbox and in Reviews', async () => {
  const { page, counts } = first
  // The seller's profile, and the coat.
  await button(page, 'New profile').click()
  await pickProfile(page, 'Clothing / seller')
  const seller = (await mainKey(seed, 'clothing/seller')).address
  await button(page, 'New offer').click()
  await page.getByLabel('Description').fill(COAT)
  await page.getByLabel('Price').fill('40')
  assert.equal(await page.getByRole('group', { name: 'Per' }).count(), 0, 'a coat has no per to pick')
  const big = photoPng(2400, 1200, '#1e5e43', 'GPS 40.4089 -3.7007')
  const small = photoPng(800, 1000, '#313c34', 'GPS 40.4089 -3.7007')
  await page.locator('input[type=file]').setInputFiles([
    { name: 'coat.png', mimeType: 'image/png', buffer: big },
    { name: 'back.png', mimeType: 'image/png', buffer: small },
  ])
  await page.locator('.tile img').nth(1).waitFor()
  assert.equal(await page.locator('.tile img').count(), 2)
  assert.match((await page.locator('.tile img').first().getAttribute('src')) ?? '', /^blob:/, 'shown from the device until sent')
  const location = page.getByRole('group', { name: 'Location' })
  assert.equal(await location.getByRole('button', { name: 'Online' }).count(), 0, 'an item is never online')
  await location.getByLabel('Area').fill('Lavapiés, Madrid')
  assert.ok(await location.getByRole('button', { name: 'Near me' }).isVisible(), 'Near me, if wanted')
  await page.getByLabel('Contact').fill('@coats')
  await shot(page, 'post-coat')
  const asked = counts.asserted
  await button(page, 'Post').click()
  const coatRow = page.locator('.post-row', { hasText: COAT })
  await coatRow.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock: the post and its photos')
  const [[coatPath, coat]] = (await entriesOf(seller, 'post')) as unknown as [[string, { entry: { body: any } }]]
  const body = coat.entry.body
  assert.deepEqual([body.description, body.price, body.location, body.contact], [COAT, { amount: '40', currency: 'USD' }, { area: 'Lavapiés, Madrid' }, '@coats'], 'no per, and an area alone')
  assert.equal(body.photos.length, 2)
  assert.deepEqual(body.files.map((f: any) => [f.sha256, f.type]), body.photos.map((sha: string) => [sha, 'image/jpeg']), 'each photo named in its files, a JPEG')
  const sizes = []
  for (const sha of body.photos as string[]) {
    const res = await fetch(`${services.host}/v1/files/${sha}`)
    assert.equal(res.status, 200, 'sent to the host, which serves it to anyone')
    const bytes = new Uint8Array(await res.arrayBuffer())
    assert.ok(!Buffer.from(bytes).toString('latin1').includes('GPS 40.4089'), "the photo's note left on the device")
    sizes.push(jpegSize(bytes))
  }
  assert.deepEqual(sizes, [{ width: 1600, height: 800 }, { width: 800, height: 1000 }], 'its longest side at most 1600 pixels')
  assert.equal(await coatRow.locator('img.thumb').getAttribute('src'), `${services.host}/v1/files/${body.photos[0]}`, 'its first photo, from the host')
  await coatRow.locator('img.thumb').evaluate((img: HTMLImageElement) => img.decode())
  await shot(page, 'profile-coat')

  // A buyer: verified, their first profile, a message with the pencil, and a review from the thread.
  const buyer = await phone()
  await newPerson(buyer)
  await buyer.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  await pickFirst(buyer.page, 'Clothing / buyer')
  const buying = (await kept(buyer.page))['forest.profiles']!
  const buyerAddress = JSON.parse(buying)[0].address as string
  await button(buyer.page, 'Not now').click()
  await button(buyer.page, /Inbox$/).click()
  await button(buyer.page, 'New message').click()
  await buyer.page.getByRole('heading', { name: 'New message' }).waitFor()
  assert.ok((await buyer.page.getByLabel('To').isVisible()) && (await buyer.page.getByLabel('Message').isVisible()), 'To and the message box, from the start')
  await shot(buyer.page, 'message-empty')
  await buyer.page.getByLabel('To').fill(buyerAddress)
  await buyer.page.getByText("That's one of your own profiles.").waitFor()
  assert.equal(await buyer.page.locator('main .line').count(), 1, 'one line, once')
  await buyer.page.getByLabel('To').fill(seller)
  await shield(buyer.page.locator('.who', { hasText: 'Clothing / seller' })).waitFor()
  await buyer.page.locator('.from', { hasText: 'Clothing / buyer' }).waitFor()
  assert.equal(await buyer.page.locator('main .line').count(), 0)
  await buyer.page.getByLabel('Message').fill('Is the coat still there?')
  await button(buyer.page, 'Send').click()
  await buyer.page.locator('.said.mine', { hasText: 'Is the coat still there?' }).waitFor({ timeout: 60_000 })
  await button(buyer.page, 'Review').click()
  const score = buyer.page.getByLabel('Score')
  await score.focus()
  await score.press('End')
  await buyer.page.getByRole('group', { name: 'As described' }).getByRole('button', { name: 'Yes' }).click()
  await buyer.page.getByRole('button', { name: COAT }).click()
  await buyer.page.getByLabel('Comment').fill('Just like the photos.')
  await button(buyer.page, 'Post').click()
  await buyer.page.getByLabel('Reply').waitFor({ timeout: 60_000 })
  const [[, reviewed]] = (await entriesOf(buyerAddress, 'review')) as unknown as [[string, { entry: { body: any } }]]
  assert.deepEqual(reviewed.entry.body, { asDescribed: 'yes', subject: seller, text: 'Just like the photos.', score: '10', post: `${seller}/${coatPath}` })

  // From the buyer's profile, Review beside New request: a vouch (no score), then a report, each about the seller by address; Given lists all three.
  await button(buyer.page, 'Back').click()
  await button(buyer.page, 'Profiles').click()
  await buyer.page.locator('button.card', { hasText: 'Clothing / buyer' }).click()
  assert.deepEqual(await buyer.page.locator('.foot button').allTextContents(), ['Review', 'New request'], 'side by side')
  await shot(buyer.page, 'profile-review')
  await button(buyer.page, 'Review').click()
  await buyer.page.getByRole('heading', { name: 'Review' }).waitFor()
  // Their own profile: refused, in one line, under the box; Post says it no twice.
  await buyer.page.getByLabel('Their address').fill(buyerAddress)
  const own = buyer.page.getByText("That's one of your own profiles.")
  await own.waitFor()
  await button(buyer.page, 'Post').click()
  await buyer.page.waitForTimeout(500)
  assert.equal(await buyer.page.locator('main .line').count(), 1, 'one line, once')
  await buyer.page.getByLabel('Their address').fill(seller)
  await shield(buyer.page.locator('.who', { hasText: 'Clothing / seller' })).waitFor()
  await button(buyer.page, 'No score').click()
  await buyer.page.getByText("You know they're real.").waitFor()
  assert.equal(await buyer.page.getByLabel('Score').count(), 0, 'no score: a vouch')
  await buyer.page.getByLabel('Comment').fill('Real and kind.')
  await button(buyer.page, 'Post').click()
  await button(buyer.page, 'Review').waitFor({ timeout: 60_000 })
  await button(buyer.page, 'Review').click()
  await buyer.page.getByLabel('Their address').fill(seller)
  await buyer.page.locator('.who', { hasText: 'Clothing / seller' }).waitFor()
  await button(buyer.page, 'Report').click()
  await buyer.page.getByRole('heading', { name: 'Report' }).waitFor()
  assert.equal(await buyer.page.getByLabel('Score').count(), 0, 'a report: text only')
  await buyer.page.getByLabel('Comment').fill('Sold me the wrong size twice.')
  const red = button(buyer.page, 'Post')
  assert.match((await red.getAttribute('class')) ?? '', /danger/, 'posted in red')
  await shot(buyer.page, 'report')
  await red.click()
  await button(buyer.page, 'Review').waitFor({ timeout: 60_000 })
  await button(buyer.page, /^No reviews yet/).click()
  await buyer.page.getByRole('tab', { name: 'Given' }).click()
  const given = buyer.page.locator('button.said-row')
  await given.nth(2).waitFor()
  assert.deepEqual((await given.locator('.said-chip').allTextContents()).sort(), ['10 ★', 'Report', 'Vouch'])
  for (let i = 0; i < 3; i++) await given.nth(i).locator('.who', { hasText: 'Clothing / seller' }).waitFor()
  await shot(buyer.page, 'reviews-given')
  for (const kind of ['vouch', 'report']) assert.equal((await entriesOf(buyerAddress, kind)).length, 1, `one ${kind}, in the buyer's folder`)
  await buyer.context.close()

  // The seller: the index's rating on the card, with the dot; then Reviews and the review opened.
  await button(page, 'Back').click()
  const card = await untilCard(page, 'Clothing / seller', '★ 10.0')
  await card.locator('.card-line', { hasText: '1 offer · ★ 10.0 · 1 review' }).waitFor()
  await card.locator('.dot').waitFor()
  await page.locator('.places .count').waitFor()
  await shot(page, 'profiles-rated')
  await card.click()
  await button(page, '★ 10.0 · 1 review ›').click()
  await page.locator('.big', { hasText: '10.0' }).waitFor()
  await page.getByText(`Rated by ${new URL(services.index).host}`).waitFor()
  const received = page.locator('button.said-row', { hasText: 'Just like the photos.' })
  await received.waitFor({ timeout: 60_000 })
  await shot(page, 'reviews')
  await received.click()
  await page.getByText(/^On your Clothing \/ seller · /).waitFor()
  await page.locator('.big', { hasText: '10 / 10' }).waitFor()
  const facts = page.locator('.facts')
  await facts.getByText('As described').waitFor()
  await facts.getByText('Yes').waitFor()
  await facts.getByText('Offer').waitFor()
  await facts.getByText(COAT).waitFor()
  await shield(facts.locator('.who', { hasText: 'Clothing / buyer' })).waitFor()
  assert.ok(await button(page, 'Message').isVisible())
  assert.match((await button(page, 'Report').getAttribute('class')) ?? '', /danger/)
  await shot(page, 'received')
  await button(page, 'Back').click()
  await button(page, 'Back').click()

  // The Inbox: the review with its dot, the first time; shown once, no dot.
  await button(page, 'Back').click()
  await button(page, /Inbox$/).click()
  await page.getByRole('tab', { name: 'Reviews' }).click()
  const inInbox = page.locator('button.said-row', { hasText: 'Just like the photos.' })
  await inInbox.waitFor({ timeout: 60_000 })
  await inInbox.getByText('Clothing / seller').waitFor()
  await inInbox.getByText('10 ★').waitFor()
  await inInbox.locator('.dot').waitFor()
  await shot(page, 'inbox-reviews')
  await inInbox.click()
  await page.locator('.big', { hasText: '10 / 10' }).waitFor()
  await button(page, 'Back').click()
  await button(page, 'Profiles').click()
  await button(page, /Inbox$/).click()
  await page.getByRole('tab', { name: 'Reviews' }).click()
  await inInbox.waitFor()
  assert.equal(await inInbox.locator('.dot').count(), 0, 'shown once: new no more')
  await button(page, 'Profiles').click()
  say('clothing: two photos redrawn and sent, a review, a vouch and a report; the rating, the dot, Reviews and the Inbox')
})

type AiApp = Awaited<ReturnType<typeof aiApp>>
type Answer = { isError?: boolean; content: Array<{ text: string }> }
/** A tool's answer to the AI app, as JSON; an error answer throws, with its text. */
async function tool(ai: AiApp, name: string, args: Record<string, unknown> = {}): Promise<any> {
  const r = (await ai.client.callTool({ name, arguments: args })) as Answer
  if (r.isError) throw new Error(`${name}: ${r.content[0]?.text}`)
  return JSON.parse(r.content[0]!.text)
}
const SWITCHES = ['read-inbox', 'read', 'write', 'message']
/** The AI's own post, on the tutor's profile. */
const BY_THE_AI = 'Physics for secondary school, written by the AI.'

/** An AI app, as services' tests make one (mcp/test/setup.ts): the MCP SDK's own client, whose first call that acts gets the challenge, and the address it sends the browser to, to log in. */
async function aiLogin(): Promise<AiApp> {
  const ai = await aiApp(mcp.origin)
  await assert.rejects(ai.client.callTool({ name: 'my_profiles', arguments: {} }), (err: Error) => err.constructor.name === 'UnauthorizedError')
  return ai
}

/**
 * The code the connector sends the browser back to the AI app with, from the page's request for
 * the AI app's redirect: no page answers there, since the AI app is the test's own client.
 */
const backToTheAiApp = (page: Page) => page.waitForRequest((r) => r.url().startsWith(REDIRECT), { timeout: 60_000 }).then((r) => new URL(r.url()).searchParams.get('code')!)

/** The profiles' checkboxes, by their words, and whether each is ticked. */
const ticks = async (page: Page) => Object.fromEntries(await Promise.all((await page.getByRole('checkbox').all()).map(async (c) => [await c.textContent(), await c.getAttribute('aria-checked')])))

let ai: AiApp

test("an AI app's login: the connect page, its name and its redirect's host, the profiles unticked; one ticked, Connect, one unlock; the AI reads its profile and writes a post, which shows; the device keeps no key", async () => {
  const { page, counts } = first
  ai = await aiLogin()
  await page.goto(ai.app.authorization!.href)
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  assert.equal(new URL(page.url()).pathname + new URL(page.url()).search, '/connect', 'the login out of the path, into the history')
  await page.getByText('ai-app.example', { exact: true }).waitFor()
  assert.deepEqual(await ticks(page), { 'Clothing / seller': 'false', 'Tutoring / tutor': 'false' }, 'none ticked: there are two')
  assert.ok(await button(page, 'Connect').isDisabled(), 'Connect once one is ticked')
  await shot(page, 'connect')
  await page.getByRole('checkbox', { name: 'Tutoring / tutor' }).click()
  const asked = counts.asserted
  const code = backToTheAiApp(page)
  await button(page, 'Connect').click()
  await ai.transport.finishAuth(await code)
  assert.equal(counts.asserted - asked, 1, 'one unlock')

  // The AI acts: its profiles, one, with every switch; it reads its profile entry and writes a post.
  assert.deepEqual(await tool(ai, 'my_profiles'), { profiles: [{ label: 'tutoring/tutor', can: SWITCHES }] })
  const profile = await tool(ai, 'read', { label: 'tutoring/tutor', path: 'profile' })
  assert.deepEqual([profile.body.market, profile.body.role], ['tutoring', 'tutor'])
  await tool(ai, 'write', { label: 'tutoring/tutor', path: 'post/by-the-ai', body: lesson(BY_THE_AI) })
  await page.goto(APP)
  await page.locator('button.card', { hasText: 'Tutoring / tutor' }).click()
  await page.locator('.post-row', { hasText: BY_THE_AI }).waitFor()
  await shot(page, 'profile-ai-post')

  // The device: the AI app's name, its day, its folder's address and its profile; no key.
  const local = await kept(page)
  const [conn] = await new App({ seed, hosts: [services.host] }).connections()
  assert.deepEqual(JSON.parse(local['forest.connections']!), [{ address: conn!.address, name: 'An AI app', time: conn!.view.current.get('connection')!.entry.time, labels: ['tutoring/tutor'] }])
  const all = JSON.stringify(local)
  for (const secret of [b64u.encode(conn!.key.secret), ...conn!.access.map((a) => a.body.key as string)]) assert.equal(all.includes(secret), false, 'never a key')
  say('an AI app connected: one unlock, and its post on the profile')
})

test('Settings, AI apps: the AI app, its day and its one profile, kept ticked while it is the last; another ticked, one unticked, then ticked again, one unlock each, with no new login; Disconnect: its next call refused, its post kept', async () => {
  const { page, counts } = first
  await button(page, 'Back').click()
  await button(page, 'Settings').click()
  assert.deepEqual(await page.getByRole('heading', { level: 2 }).allTextContents(), ['Verified', 'AI apps', 'Appearance'], 'between Verified and Appearance')
  const row = page.locator('button.row', { hasText: 'An AI app' })
  assert.match((await row.textContent()) ?? '', /^An AI app\d{1,2} \w{3}1 profile$|^An AI app\w{3} \d{1,2}1 profile$/, 'its name, its day, its one profile')
  assert.equal(await button(page, 'Find AI apps').count(), 0, 'every key listed is one this device made')
  await shot(page, 'settings-ai')
  await row.click()
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  assert.deepEqual(await ticks(page), { 'Clothing / seller': 'false', 'Tutoring / tutor': 'true' })
  assert.ok(await page.getByRole('checkbox', { name: 'Tutoring / tutor' }).isDisabled(), 'the last one stays ticked')
  await shot(page, 'ai-app')

  /** One tick, and the AI's profiles after it, with no new login. */
  const tickOne = async (words: string, ticked: boolean, profiles: string[]) => {
    const asked = counts.asserted
    await page.getByRole('checkbox', { name: words }).click()
    await page.getByRole('checkbox', { name: words, checked: ticked }).waitFor({ timeout: 60_000 })
    await button(page, 'Disconnect').and(page.locator(':enabled')).waitFor()
    assert.equal(await page.locator('p.line').count(), 0, (await page.locator('p.line').allTextContents()).join(' '))
    assert.equal(counts.asserted - asked, 1, 'one unlock')
    assert.deepEqual(await tool(ai, 'my_profiles'), { profiles: profiles.map((label) => ({ label, can: SWITCHES })) })
  }
  await tickOne('Clothing / seller', true, ['clothing/seller', 'tutoring/tutor'])
  await tickOne('Tutoring / tutor', false, ['clothing/seller'])
  assert.ok(await page.getByRole('checkbox', { name: 'Clothing / seller' }).isDisabled(), 'now the seller is the last')
  await tickOne('Tutoring / tutor', true, ['clothing/seller', 'tutoring/tutor'])

  const asked = counts.asserted
  await button(page, 'Disconnect').click()
  await page.getByRole('heading', { name: 'Settings' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  assert.equal(await page.locator('button.row', { hasText: 'An AI app' }).count(), 0)
  await assert.rejects(ai.client.callTool({ name: 'my_profiles', arguments: {} }), (err: Error) => err.constructor.name === 'UnauthorizedError', 'its next call refused')
  assert.deepEqual(JSON.parse((await kept(page))['forest.connections']!), [])
  await button(page, 'Profiles').click()
  await page.locator('button.card', { hasText: 'Tutoring / tutor' }).click()
  await page.locator('.post-row', { hasText: BY_THE_AI }).waitFor()
  await button(page, 'Back').click()
  await ai.client.close()
  say('an AI app given a profile, one taken away and given back, and disconnected, one unlock each; its post kept')
})

test('a new phone at a connect page, nothing set up: I already have one first; the face check and the first profile, then back to the connect page, its one profile ticked; Connect', async () => {
  const p = await phone()
  const login = await aiLogin()
  await p.page.goto(login.app.authorization!.href)
  await button(p.page, 'I already have one').waitFor()
  assert.deepEqual((await p.page.getByRole('button').allTextContents()).map((t) => t.trim()), ['I already have one', 'Create a passkey'], 'I already have one, the primary, first')
  assert.match((await button(p.page, 'I already have one').getAttribute('class')) ?? '', /primary/)
  await shot(p.page, 'start-connecting')
  await button(p.page, 'Create a passkey').click()
  await faceCheck(p)
  await p.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  await p.page.getByLabel('Search').fill('tutoring')
  await button(p.page, 'Tutoring').click()
  await button(p.page, 'Student').click()
  await p.page.getByRole('heading', { name: 'An AI app' }).waitFor({ timeout: 120_000 })
  assert.equal(await p.page.getByRole('heading', { name: 'Use Forest from your AI' }).count(), 0, 'no Use Forest from your AI')
  assert.deepEqual(await ticks(p.page), { 'Tutoring / student': 'true' }, 'its one profile, ticked')
  const asked = p.counts.asserted
  const code = backToTheAiApp(p.page)
  await button(p.page, 'Connect').click()
  await login.transport.finishAuth(await code)
  assert.equal(p.counts.asserted - asked, 1, 'one unlock')
  assert.deepEqual(await tool(login, 'my_profiles'), { profiles: [{ label: 'tutoring/student', can: SWITCHES }] })
  await login.client.close()
  await p.context.close()
  say('a new phone: set up from the connect page, then back to it, and connected')
})

test("a connector that isn't ours: one line, nothing else; a request that ran out: one line", async () => {
  const p = await phone()
  await p.page.goto(`${APP}connect?connector=${encodeURIComponent('https://other.example')}&request=x.y`)
  await p.page.getByText(`Forest connects only to ${new URL(mcp.origin).host} for now.`).waitFor()
  assert.equal(await p.page.getByRole('button').count(), 0, 'nothing else')
  await shot(p.page, 'connect-not-ours')
  // A login 11 minutes old, as the clock goes: run out.
  const login = await aiLogin()
  const res = await fetch(login.app.authorization!, { redirect: 'manual' })
  const connect = res.headers.get('location')!
  assert.ok(connect.startsWith(`${APP}connect?`), connect)
  await p.page.clock.setFixedTime(Date.now() + 11 * 60_000)
  await p.page.goto(connect)
  await p.page.getByText('This took too long. Start again from your AI app.').waitFor()
  assert.equal(await p.page.getByRole('button').count(), 0, 'nothing else')
  await login.client.close()
  await p.context.close()
})

test('held for review: Being reviewed, and the app keeps asking; approved, Continue, one unlock', async () => {
  const p = await phone()
  // Didit holds this person's check in review for the first two asks: the verifier answers 202.
  let held = 0
  await p.context.route(`${services.verifier}/face/stamp`, (route) => {
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST' }
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    if (held++ < 2) return route.fulfill({ status: 202, headers: { ...cors, 'content-type': 'application/json' }, body: '{"waiting":"review"}' })
    return route.continue()
  })
  await newPerson(p)
  await p.page.getByText('Being reviewed').waitFor()
  await shot(p.page, 'review')
  const asked = p.counts.asserted
  await button(p.page, 'Continue').click({ timeout: 90_000 })
  await p.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  assert.equal(p.counts.asserted - asked, 1, 'one unlock, to keep the stamp')
  assert.ok(held >= 3, 'it kept asking')
  await p.context.close()
})

test('a manager that gives no PRF secret: its passkey dropped, and one red line names another; a browser that cannot ask for it: one quiet line', async () => {
  const p = await phone({ prf: false })
  await p.page.goto(APP)
  await button(p.page, 'Create a passkey').click()
  const line = p.page.getByText("This password manager can't keep a Forest passkey. Save it in another password manager instead.")
  await line.waitFor()
  assert.equal(await line.getAttribute('class'), 'line red')
  assert.equal((await kept(p.page))['forest.passkey'], undefined)
  const { credentials } = await p.cdp.send('WebAuthn.getCredentials', { authenticatorId: p.authenticator })
  assert.deepEqual([p.counts.created, credentials.length], [1, 0], 'made, then dropped: the manager was asked to forget it')
  await p.context.close()

  const old = await phone()
  await old.context.addInitScript(() => void ((PublicKeyCredential as any).getClientCapabilities = async () => ({ 'extension:prf': false })))
  await old.page.goto(APP)
  await button(old.page, 'Create a passkey').click()
  const quiet = old.page.getByText("This browser can't open Forest. Use a newer one.")
  await quiet.waitFor()
  assert.equal(await quiet.getAttribute('class'), 'line')
  assert.equal(old.counts.created + old.counts.asserted, 0)
  await old.context.close()
})

test('the passkey belongs to app.forest.foundation: another page under forest.foundation cannot ask for it', async () => {
  const page = await first.context.newPage()
  await page.goto(OTHER)
  const got = await page.evaluate(() =>
    navigator.credentials.get({ publicKey: { rpId: 'app.forest.foundation', challenge: new Uint8Array(32), userVerification: 'required' } }).then(
      () => 'answered',
      (err: Error) => err.name,
    ),
  )
  assert.equal(got, 'SecurityError')
  await page.close()
})

test('the build: its manifest, its service worker in control, installable', async () => {
  // A browser profile of its own, on disk: Chrome installs nothing from a private window.
  const dir = mkdtempSync(join(tmpdir(), 'forest-chrome-'))
  const context = await chromium.launchPersistentContext(dir, { channel: 'chromium', args: CHROME_ARGS })
  try {
    const page = context.pages()[0] ?? (await context.newPage())
    await page.goto(APP)
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.reload()
    assert.ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'the service worker controls the page')
    const manifest = await (await fetch(`http://127.0.0.1:${new URL(APP).port}/manifest.webmanifest`)).json()
    assert.deepEqual([manifest.name, manifest.display, manifest.start_url, manifest.icons.length], ['Forest', 'standalone', '/', 3])
    const cdp = await context.newCDPSession(page)
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors')
    assert.deepEqual(installabilityErrors, [], 'Chrome takes it as installable')
  } finally {
    await context.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test("a deploy while the app is open: the old proof worker gone, the page reloads once, back on a market's roles, and the profile is made", async () => {
  const { page } = first
  await page.goto(`${APP}new`)
  await button(page, 'Electronics').click()
  await button(page, 'Seller').waitFor()
  const before = await page.evaluate(() => document.querySelector('script[type=module]')?.getAttribute('src') ?? '')
  assert.ok(!before.includes('-next-'))
  // The next version in place of this one, its service worker taking over: this version's files are gone.
  server.root = nextDir
  await page.evaluate(async () => {
    const changed = new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }))
    await (await navigator.serviceWorker.getRegistration())!.update()
    await changed
  })
  const loads: string[] = []
  page.on('load', () => loads.push(page.url()))
  await button(page, 'Seller').click()
  await page.waitForEvent('load', { timeout: 60_000 })
  assert.deepEqual(loads.map((u) => new URL(u).pathname), ['/new'], 'one reload, back on New profile')
  assert.ok((await page.evaluate(() => document.querySelector('script[type=module]')?.getAttribute('src') ?? '')).includes('-next-'), 'on the next version')
  await page.getByRole('heading', { name: 'Electronics' }).waitFor()
  await button(page, 'Seller').click()
  await page.getByRole('heading', { name: 'Electronics / seller' }).waitFor({ timeout: 120_000 })
  assert.equal(loads.length, 1, 'and no reload more')
  say('a deploy while open: one reload onto the next version, and the profile made')
})

test('the ID check through the stand-in Stripe: consent word for word, paid, checked in its own tab, one unlock, and both verifications on every profile', async () => {
  const { page, context, counts } = first
  // Stripe's Checkout page, the verifier's own stand-in's: paid at once, and back to the app's page, paid, as Stripe sends the person.
  await context.route('https://checkout.stripe.example/**', (route) => {
    const payment = new URL(route.request().url()).pathname.split('/').pop()!
    services.payments.pay(payment)
    return route.fulfill({ contentType: 'text/html', body: `<script>location.replace(${JSON.stringify(services.payments.returnUrls.get(payment))})</script>` })
  })
  await page.goto(APP)
  await button(page, 'Settings').click()
  await button(page, '+ $5').click()
  const verifier = readFileSync(`${app}services/verifier/README.md`, 'utf8')
  const consent = verifier.slice(verifier.indexOf('**The consent screen.**')).split('\n\n')[1]!.split('\n').map((l) => l.replace(/^> /, '')).join(' ')
  await page.getByText('What the check keeps').click()
  assert.equal(await page.locator('.consent').textContent(), consent, "the verifier's consent screen, word for word")
  await shot(page, 'consent')
  await button(page, 'Pay $5').click()
  await page.getByText('Test mode: pay with the card 4242 4242 4242 4242.').waitFor()
  const payment = JSON.parse((await kept(page))['forest.setup']!).payment as string
  assert.match(payment, /^cs_test_/, "the payment's id kept on the device before Stripe")
  await page.getByRole('link', { name: 'Go to Stripe' }).click()
  await page.waitForURL(`${APP}id`)
  assert.equal(JSON.parse((await kept(page))['forest.setup']!).payment, payment, 'back from Stripe, nothing lost')
  const tab = context.waitForEvent('page')
  await button(page, 'Start').click()
  await (await tab).waitForEvent('close')
  await page.getByText('Finish in the other tab.').waitFor()
  await shot(page, 'id-away')
  const asked = counts.asserted
  await button(page, 'Continue').click()
  await button(page, 'New profile').waitFor({ timeout: 180_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock: the stamp, its gift, and every profile')
  const cards = page.locator('button.card')
  const n = await cards.count()
  assert.ok(n >= 3, `every profile: ${n}`)
  for (let i = 0; i < n; i++) await shield(cards.nth(i)).waitFor()
  for (const label of JSON.parse((await kept(page))['forest.profiles']!) as Array<{ address: string }>) {
    const body = (await readFolder([services.host], label.address, Date.now())).current.get('profile')?.entry.body
    const keys: string[] = []
    for (const proof of proofsOf(body).filter((p) => p.circuit === 'verification')) {
      const check = verificationCheck(proof, label.address)
      assert.ok(check && (await checkVerification(check)), 'each verification checks, as any reader checks it')
      keys.push(proof.verifier as string)
    }
    assert.deepEqual(keys.sort(), [services.faceKey, services.idKey].sort())
  }
  assert.equal((await kept(page))['forest.setup'], undefined, 'nothing of the verification left on the device')
  await shot(page, 'profiles-both')
  await button(page, 'Settings').click()
  await page.getByRole('img', { name: 'Done' }).nth(1).waitFor()
  assert.equal(await button(page, '+ $5').count(), 0)
  await button(page, 'Profiles').click()
  say('the ID check: paid through the stand-in Stripe, one unlock, both verifications on every profile')
})

test('a declined check: one red line, and Start again opens a new check that passes', async () => {
  const p = await phone()
  // The verifier answers the first stamp asked for as Didit declined it; then as it is.
  let asked = 0
  await p.context.route(`${services.verifier}/face/stamp`, (route) => {
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST' }
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    if (asked++ === 0) return route.fulfill({ status: 403, headers: { ...cors, 'content-type': 'application/json' }, body: '{"error":"declined"}' })
    return route.continue()
  })
  await newPerson(p)
  const line = p.page.getByText("The check didn't pass. Start again.")
  await line.waitFor()
  assert.equal(await line.getAttribute('class'), 'line red')
  await shot(p.page, 'declined')
  const sessions = JSON.parse((await kept(p.page))['forest.setup']!)
  assert.equal(sessions.session, undefined, 'the declined session dropped')
  const tab = p.context.waitForEvent('page')
  await button(p.page, 'Start').click()
  await (await tab).waitForEvent('close')
  await p.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  assert.ok(asked >= 2)
  await p.context.close()
})

test('nothing the app did was refused by the CSP', () => {
  assert.deepEqual(refused, [])
})
