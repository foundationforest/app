// The app in headless Chromium, through Playwright, with Chrome's virtual passkey authenticator,
// which has PRF, against services' own verifier (its stand-in Didit and stand-in face model) and
// host on loopback (services.ts). The app is built with its config pointed at them, served as
// Vercel serves it (vercel.ts: vercel.json's headers, its files, its rewrites, else 404) under
// vercel.json's CSP, its connect-src naming these services, at app.forest.foundation mapped to
// loopback and taken as a secure origin, so its passkeys are made for that address.
//
//   ./standard.sh services && npm run test:browser
//
//  1. Start: one button; with no passkey on this device, no sheet, and Make one; the passkey made
//     for app.forest.foundation.
//  2. Get verified: Face, free, or ID, $5; the face check in a tab of its own, opened on the tap,
//     which Didit's page sends back to /back, where it closes itself; the gift collected into the
//     wallet; the stamp kept in the Profiles folder; nothing of the seed kept.
//  3. A new profile: one pick, one unlock, the verification proven in the worker; its profile entry
//     on the host, its verification checking as any reader checks it; its card, how it is verified,
//     and Share, which copies its message link.
//  4. Settings: how the person is verified, the appearance, About.
//  5. Two people, each in their own browser with their own passkey: the first posts an offer from
//     its card (the market's own fields, its contact one tap away) and copies its Share link; the
//     second opens it with nothing set up, goes through Start and the face check, makes the
//     profile on the other side, and messages; the first sees it counted with nothing unlocked,
//     opens every inbox in one unlock, sees who it is from, Verified, and replies; the second reads
//     the reply beside what they sent, and reviews the tutor from the thread, naming the offer.
//  6. A second browser, with the same passkey, answered from the first, as a phone answers through
//     the passkey sheet's QR code: Start finds the profile and the stamp.
//  7. One passkey per person: after Forget, Start finds the passkey and asks nothing more; with no
//     passkey answering, Make one is refused the one this device knows.
//  8. Held for review: Being reviewed, the app asking all the while; approved, Continue, one unlock.
//  9. A manager that gives no PRF secret: its passkey dropped, the line naming another. A browser
//     that cannot ask for PRF: one quiet line.
// 10. The passkey belongs to app.forest.foundation: another page under forest.foundation is refused.
// 11. The build: its manifest, its service worker in control, installable.
// 12. A deploy while the app is open: the next version takes over and the old proof worker is gone;
//     the page reloads once, back on New profile, and the profile is made.
// 13. The ID check, from Settings: the verifier's consent screen word for word; paid through the
//     verifier's own stand-in for Stripe (its test card named first), the payment kept on the device
//     through Stripe's page; the check in its own tab; one unlock; both badges on every profile.
// 14. A declined check: one red line, and Start again opens a new check that passes.
// 15. Nothing the app did, through all of it, was refused by the CSP.
//
// SHOTS=<dir> keeps a screenshot of each screen there, light and dark.

import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { type Browser, type BrowserContext, type CDPSession, type Page, chromium } from 'playwright'
import { build } from 'vite'

import { liveContent, proofsOf, readFolder, verificationCheck } from '../../standard/folders/dist/index.js'
import { isLocked, openLocked } from '../../standard/folders/dist/locked.js'
import { mainKey, openingHalf } from '../../standard/keys/dist/index.js'
import { checkVerification, stampFromJson } from '../../standard/proofs/dist/index.js'
import { type Running, freePort, startServices } from './services.ts'
import { serveLikeVercel } from './vercel.ts'

const app = fileURLToPath(new URL('../../', import.meta.url))
const outDir = fileURLToPath(new URL('out/app', import.meta.url))
/** The next deploy: the same app, every chunk named anew. */
const nextDir = fileURLToPath(new URL('out/next', import.meta.url))
const shots = process.env.SHOTS
const say = (line: string) => console.log(`  ${line}`)

let services: Running
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
const balance = async (folder: string) => ((await (await fetch(`${services.host}/credits/balance/${folder}`)).json()) as { credits: number }).credits
const button = (page: Page, name: string | RegExp) => page.getByRole('button', { name, exact: typeof name === 'string' })

/** A new person in `p`'s browser through Start, Make one and the face check, on Profiles at the end. */
async function newPerson(p: Phone) {
  await p.page.goto(APP)
  await button(p.page, 'Start').click()
  await button(p.page, 'Make one').click()
  await p.page.getByRole('heading', { name: 'Get verified' }).waitFor()
  const tab = p.context.waitForEvent('page')
  await button(p.page, /^Face/).click()
  await (await tab).waitForEvent('close')
}

before(async () => {
  const port = await freePort()
  APP = `http://app.forest.foundation:${port}/`
  OTHER = `http://other.forest.foundation:${port}/`
  services = await startServices({ appOrigin: APP.slice(0, -1), say })
  // The app's one config file, pointed at these services (src/config.ts); the connector is not used yet.
  process.env.VITE_FOREST_CONFIG = JSON.stringify({ app: APP.slice(0, -1), verifier: services.verifier, host: services.host, connector: 'http://127.0.0.1:9' })
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir, emptyOutDir: true } })
  const renamed = { entryFileNames: 'assets/[name]-next-[hash].js', chunkFileNames: 'assets/[name]-next-[hash].js' }
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir: nextDir, emptyOutDir: true, rolldownOptions: { output: renamed } }, worker: { rolldownOptions: { output: renamed } } })
  // vercel.json's CSP, its connect-src naming these services in place of ours (test/build.test.ts checks it names ours).
  const vercel = JSON.parse(readFileSync(`${app}vercel.json`, 'utf8'))
  const real: string = vercel.headers.find((h: any) => h.source === '/(.*)').headers.find((h: any) => h.key === 'Content-Security-Policy').value
  csp = real
    .split('; ')
    .map((d) => (d.startsWith('connect-src ') ? `connect-src 'self' ${services.verifier} ${services.host} http://127.0.0.1:9` : d))
    .join('; ')
  server = await serveLikeVercel({ root: outDir, port, override: { 'Content-Security-Policy': csp } })
  // Chromium itself, not its headless shell, which does not take an insecure origin as secure; and WebAuthn wants a secure one.
  CHROME_ARGS = ['--host-resolver-rules=MAP *.forest.foundation 127.0.0.1', `--unsafely-treat-insecure-origin-as-secure=${[APP, OTHER].map((o) => o.slice(0, -1)).join(',')}`]
  browser = await chromium.launch({ channel: 'chromium', args: CHROME_ARGS })
  first = await phone()
  say(`Chromium ${browser.version()}, the app at ${APP}, services' verifier at ${services.verifier} and host at ${services.host}`)
})

after(async () => {
  await browser?.close()
  await server?.close()
  await services?.stop()
})

test('Start: one button; no passkey on this device, so no sheet, and Make one; the passkey made for app.forest.foundation', async () => {
  const { page, counts, cdp, authenticator } = first
  const res = await page.goto(APP)
  assert.equal(res?.headers()['content-security-policy'], csp, 'the page comes with the CSP')
  await shot(page, 'start')
  await button(page, 'Start').click()
  await page.getByText('No Forest passkey here.').waitFor()
  assert.equal(counts.asserted, 0, 'asked without the sheet, nothing answered')
  assert.ok(await button(page, 'Use another device').isVisible(), 'and the sheet, with its QR code, one tap away')
  await shot(page, 'start-none')
  await button(page, 'Make one').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  assert.equal(counts.created, 1)
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId: authenticator })
  assert.deepEqual(credentials.map((c) => [c.rpId, c.isResidentCredential]), [['app.forest.foundation', true]])
  const local = await kept(page)
  assert.deepEqual(Object.keys(local).sort(), ['forest.passkeys', 'forest.v'], 'the passkey known, not yet in use: no one is verified here yet')
  await shot(page, 'verify')
  say('Start: no sheet with no passkey here; Make one made it for app.forest.foundation')
})

test('Get verified: Face, free, or ID, $5; the face check in its own tab, back through /back; the gift in the wallet, the stamp in the Profiles folder', async () => {
  const { page, context } = first
  assert.ok(await button(page, /^ID\s*\$5$/).isVisible(), 'and the ID check beside it')
  const tab = context.waitForEvent('page')
  await button(page, /^Face\s*Free$/).click()
  const didit = await tab
  await didit.waitForEvent('close')
  say(`the check's tab opened on the tap, went to ${new URL(didit.url()).pathname} and closed itself`)
  await button(page, 'New profile').waitFor({ timeout: 60_000 })
  await shot(page, 'profiles-empty')
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

test('a new profile: one pick, one unlock, its verification proven in the worker; its card and Share', async () => {
  const { page, counts } = first
  await button(page, 'New profile').click()
  await page.getByRole('heading', { name: 'New profile' }).waitFor()
  await shot(page, 'new-profile')
  const rows = await page.locator('button.row').allTextContents()
  assert.ok(rows.includes('Tutoring · tutor') && rows.includes('Home cleaning · client'), `in each market's words: ${rows.join(', ')}`)
  const asked = counts.asserted
  const started = Date.now()
  await button(page, 'Tutoring · tutor').click()
  await page.getByRole('heading', { name: 'Tutoring' }).waitFor({ timeout: 120_000 })
  await page.getByText('Face check').waitFor()
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  say(`a profile made in ${((Date.now() - started) / 1000).toFixed(1)} s, its proof in the worker`)
  await shot(page, 'card')
  const main = await mainKey(seed, 'tutoring/tutor')
  tutor = main.address
  const body = (await readFolder([services.host], tutor, Date.now())).current.get('profile')?.entry.body
  assert.deepEqual([body?.market, body?.role, body?.hosts], ['tutoring', 'tutor', [services.host]])
  const check = verificationCheck(proofsOf(body).find((p) => p.circuit === 'verification'), tutor)
  assert.ok(check && (await checkVerification(check)), 'its verification checks, as any reader checks it')
  await button(page, 'Share').click()
  await button(page, 'Copied').waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), `${APP}message?to=${tutor}`)
  await button(page, 'Back').click()
  await page.locator('button.card', { hasText: 'Tutoring' }).getByText('Face check').waitFor()
  assert.deepEqual(JSON.parse((await kept(page))['forest.profiles']!), [{ label: 'tutoring/tutor', address: tutor }])
  await shot(page, 'profiles')
})

test('Settings: how the person is verified, the appearance, About', async () => {
  const { page } = first
  await button(page, 'Settings').click()
  await page.getByRole('heading', { name: 'Settings' }).waitFor()
  await page.getByText('Face check').waitFor()
  await shot(page, 'settings')
  await page.getByRole('radio', { name: 'Dark' }).click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
  await page.reload()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'kept, and back on Settings after a reload')
  await page.getByRole('radio', { name: 'Device' }).click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), undefined)
  assert.match((await page.getByText(/^Version /).textContent()) ?? '', /^Version ([0-9a-f]{7}|dev)$/)
  await button(page, 'Profiles').click()
})

const ASK = 'Is Tuesday at six free?'
const YES = 'Tuesday at six, yes.'
const OFFER = 'Maths for secondary school, one hour online.'

/** The live entries of a folder under `kind/`, as the host serves it now. */
const entriesOf = async (address: string, kind: string) => [...liveContent(await readFolder([services.host], address, Date.now()))].filter(([path]) => path.startsWith(`${kind}/`))

test('two people, each with their own passkey: one posts an offer, the other finds it by its address and messages it, the first replies, and the second reviews', async () => {
  const { page, counts } = first
  // The offer, from the tutor's card, in the market's own fields.
  await page.locator('button.card', { hasText: 'Tutoring' }).click()
  await button(page, 'Post').click()
  await button(page, 'Offer').click()
  await page.getByRole('heading', { name: 'Offer' }).waitFor()
  await page.getByLabel('Description').fill(OFFER)
  await page.getByLabel('Price').fill('30')
  await page.getByLabel('Per').fill('hour')
  await page.getByRole('group', { name: 'Subjects' }).getByRole('button', { name: 'Maths' }).click()
  await page.getByRole('group', { name: 'Place' }).getByRole('button', { name: 'Online' }).click()
  await page.getByLabel('Contact').fill('ada@example.com')
  await page.getByText('Public. The same contact on two posts links them.').waitFor()
  await shot(page, 'post-offer')
  let asked = counts.asserted
  await button(page, 'Post').click()
  const entry = page.locator('.entry', { hasText: OFFER })
  await entry.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  assert.equal(await entry.getByRole('link', { name: 'ada@example.com' }).getAttribute('href'), 'mailto:ada@example.com', 'its contact one tap away')
  const posts = await entriesOf(tutor, 'post')
  assert.equal(posts.length, 1)
  const [offerPath, offer] = posts[0]!
  assert.match(offerPath, /^post\/[0-9a-f]{32}$/, 'at a random id')
  assert.deepEqual(offer.entry.body, { description: OFFER, price: { amount: '30', currency: 'USD', per: 'hour' }, subjects: ['maths'], place: { online: true }, contact: 'ada@example.com' })
  await button(page, 'Share').click()
  await button(page, 'Copied').waitFor()
  const link = await page.evaluate(() => navigator.clipboard.readText())
  await shot(page, 'card-posts')

  // The second person opens the link with nothing set up: Start and the face check first, then the message.
  const second = await phone()
  await second.page.goto(link)
  await button(second.page, 'Start').click()
  await button(second.page, 'Make one').click()
  await second.page.getByRole('heading', { name: 'Get verified' }).waitFor()
  const tab = second.context.waitForEvent('page')
  await button(second.page, /^Face/).click()
  await (await tab).waitForEvent('close')
  await button(second.page, 'New profile: Tutoring · student').click({ timeout: 60_000 })
  await second.page.getByLabel('Message').waitFor({ timeout: 120_000 })
  assert.equal(new URL(second.page.url()).search, '', "the profile's address out of the path")
  await second.page.locator('.who', { hasText: 'Tutoring · tutor' }).getByText('Verified').waitFor()
  await shot(second.page, 'message')
  await second.page.getByLabel('Message').fill(ASK)
  await button(second.page, 'Send').click()
  await second.page.locator('.said.mine', { hasText: ASK }).waitFor({ timeout: 60_000 })
  const student = JSON.parse((await kept(second.page))['forest.profiles']!)[0].address as string

  // The first: counted with nothing unlocked; one unlock opens every inbox; who it is from; the reply.
  await button(page, 'Back').click()
  await page.locator('.places .count', { hasText: '1' }).waitFor({ timeout: 45_000 })
  asked = counts.asserted
  await button(page, /Messages$/).click()
  await button(page, 'Open').click()
  const row = page.locator('button.card', { hasText: 'Tutoring · student' })
  await row.getByText('Verified').waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock opens every inbox')
  await row.getByText('To your Tutoring · tutor').waitFor()
  await page.locator('.places .count').waitFor({ state: 'detached' })
  await shot(page, 'messages')
  await row.click()
  await page.getByText(ASK).waitFor()
  await page.getByLabel('Reply').fill(YES)
  await button(page, 'Send').click()
  await page.locator('.said.mine', { hasText: YES }).waitFor({ timeout: 60_000 })
  await shot(page, 'thread')
  assert.equal((await entriesOf(tutor, 'sent')).length, 1, "the reply's copy, in the tutor's own folder")

  // The second reads the reply beside what they sent, and reviews the tutor from the thread.
  await button(second.page, 'Back').click()
  await second.page.locator('.places .count', { hasText: '1' }).waitFor({ timeout: 45_000 })
  await button(second.page, /Messages$/).click()
  await button(second.page, 'Open').click()
  await second.page.locator('button.card', { hasText: 'Tutoring · tutor' }).click()
  await second.page.locator('.said.mine', { hasText: ASK }).waitFor()
  await second.page.locator('.said:not(.mine)', { hasText: YES }).waitFor()
  await button(second.page, 'Post').click()
  await button(second.page, 'Review').click()
  await second.page.locator('.who', { hasText: 'Tutoring · tutor' }).waitFor()
  const score = second.page.getByLabel('Score')
  await score.focus()
  for (let i = 0; i < 4; i++) await score.press('ArrowRight')
  await second.page.locator('.score strong', { hasText: '9' }).waitFor()
  await second.page.getByLabel('Text').fill('Clear and patient.')
  await second.page.getByRole('button', { name: OFFER }).click()
  await shot(second.page, 'post-review')
  await button(second.page, 'Post').click()
  await second.page.getByLabel('Reply').waitFor({ timeout: 60_000 })
  const reviews = await entriesOf(student, 'review')
  assert.equal(reviews.length, 1)
  const [, review] = reviews[0]!
  assert.deepEqual(review.entry.body, { subject: tutor, score: '9', text: 'Clear and patient.', post: `${tutor}/${offerPath}` }, 'about the tutor, naming the offer')
  await second.context.close()
  await button(page, 'Back').click()
  say('two people: an offer posted, found by its Share link, messaged, replied to, reviewed')
})

test("a second browser, the same passkey answering from the first, as a phone answers through the sheet's QR code: Start finds the profile and the stamp", async () => {
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
      if (!pk || (options as { uiMode?: string }).uiMode === 'immediate') return own(options)
      const got = await (globalThis as any).answerFromFirst({ rpId: pk.rpId, allow: (pk.allowCredentials ?? []).map((c) => bytes(c.id)), first: bytes(pk.extensions!.prf!.eval!.first) })
      if (got.error) throw new DOMException(got.error.message, got.error.name)
      const first = new Uint8Array(got.first).buffer
      return { type: 'public-key', id: '', rawId: new Uint8Array(got.rawId).buffer, getClientExtensionResults: () => ({ prf: { results: { first } } }) } as unknown as Credential
    }
  })
  const asked = first.counts.asserted
  await second.page.goto(APP)
  await button(second.page, 'Start').click()
  await button(second.page, 'Use another device').click()
  await second.page.locator('button.card', { hasText: 'Tutoring' }).getByText('Face check').waitFor({ timeout: 60_000 })
  assert.equal(first.counts.asserted - asked, 1, "answered once, by the first browser's passkey")
  assert.equal(second.counts.created, 0, 'and no second passkey')
  assert.deepEqual(JSON.parse((await kept(second.page))['forest.profiles']!), [{ label: 'tutoring/tutor', address: tutor }])
  await second.context.close()
  say('a second browser found the profile and its verification, answered by the same passkey')
})

test('one passkey per person: after Forget, Start finds it; with none answering, Make one is refused the one this device knows', async () => {
  const { page, counts, cdp, authenticator } = first
  await button(page, 'Settings').click()
  await button(page, 'Forget this device').click()
  await page.getByText('Your passkey stays in your password manager.').waitFor()
  await button(page, 'Forget').click()
  await button(page, 'Start').click()
  await page.locator('button.card', { hasText: 'Tutoring' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.created, 1, 'Start found the passkey; nothing made')

  await button(page, 'Settings').click()
  await button(page, 'Forget this device').click()
  await button(page, 'Forget').click()
  // The person closes the passkey sheet, so no passkey answers; the manager still holds the one this device knows.
  await page.evaluate(() => void (navigator.credentials.get = () => Promise.reject(new DOMException('The sheet was closed.', 'NotAllowedError'))))
  await button(page, 'Start').click()
  await button(page, 'Make one').click()
  await page.getByText('You already have a Forest passkey.').waitFor()
  assert.equal(counts.created, 1, 'and no second passkey')
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId: authenticator })
  assert.equal(credentials.length, 1)
  await page.reload()
  await button(page, 'Start').click()
  await page.locator('button.card', { hasText: 'Tutoring' }).waitFor({ timeout: 60_000 })
  say('one passkey: found after Forget, and never a second')
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
  await button(p.page, 'New profile').waitFor({ timeout: 60_000 })
  assert.equal(p.counts.asserted - asked, 1, 'one unlock, to keep the stamp')
  assert.ok(held >= 3, 'it kept asking')
  await p.context.close()
})

test('a manager that gives no PRF secret: its passkey dropped, and one red line names another; a browser that cannot ask for it: one quiet line', async () => {
  const p = await phone({ prf: false })
  await p.page.goto(APP)
  await button(p.page, 'Start').click()
  await button(p.page, 'Make one').click()
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
  await button(old.page, 'Start').click()
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

test('a deploy while the app is open: the old proof worker gone, the page reloads once, back on New profile, and the profile is made', async () => {
  const { page } = first
  await page.goto(`${APP}new`)
  await button(page, 'Clothing · seller').waitFor()
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
  await button(page, 'Clothing · seller').click()
  await page.waitForEvent('load', { timeout: 60_000 })
  assert.deepEqual(loads.map((u) => new URL(u).pathname), ['/new'], 'one reload, back on New profile')
  assert.ok((await page.evaluate(() => document.querySelector('script[type=module]')?.getAttribute('src') ?? '')).includes('-next-'), 'on the next version')
  await button(page, 'Clothing · seller').click()
  await page.getByRole('heading', { name: 'Clothing' }).waitFor({ timeout: 120_000 })
  assert.equal(loads.length, 1, 'and no reload more')
  say('a deploy while open: one reload onto the next version, and the profile made')
})

test('the ID check through the stand-in Stripe: consent word for word, paid, checked in its own tab, one unlock, and both badges on every profile', async () => {
  const { page, context, counts } = first
  // Stripe's Checkout page, the verifier's own stand-in's: paid at once, and back to the app's page, paid, as Stripe sends the person.
  await context.route('https://checkout.stripe.example/**', (route) => {
    const payment = new URL(route.request().url()).pathname.split('/').pop()!
    services.payments.pay(payment)
    return route.fulfill({ contentType: 'text/html', body: `<script>location.replace(${JSON.stringify(services.payments.returnUrls.get(payment))})</script>` })
  })
  await page.goto(APP)
  await button(page, 'Settings').click()
  await button(page, 'Get the ID check').click()
  const verifier = readFileSync(`${app}services/verifier/README.md`, 'utf8')
  const consent = verifier.slice(verifier.indexOf('**The consent screen.**')).split('\n\n')[1]!.split('\n').map((l) => l.replace(/^> /, '')).join(' ')
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
  assert.ok(n >= 2, `every profile: ${n}`)
  for (let i = 0; i < n; i++) for (const badge of ['Face check', 'ID check']) await cards.nth(i).getByText(badge).waitFor()
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
  await page.getByText('Face check, ID check').waitFor()
  assert.equal(await button(page, 'Get the ID check').count(), 0)
  await button(page, 'Profiles').click()
  say('the ID check: paid through the stand-in Stripe, one unlock, both badges on every profile')
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
  await button(p.page, 'New profile').waitFor({ timeout: 60_000 })
  assert.ok(asked >= 2)
  await p.context.close()
})

test('nothing the app did was refused by the CSP', () => {
  assert.deepEqual(refused, [])
})
