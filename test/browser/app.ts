// The app's screens in headless Chromium, through Playwright, with a virtual passkey authenticator
// that has PRF, against one of each stand-in on loopback (test/stand-ins.ts, `world`): the app's own
// build, its settings pointed at the stand-ins, served as Vercel serves it (vercel.ts: vercel.json's
// headers, its files, its rewrites, else 404), under vercel.json's CSP (its connect-src naming the
// stand-ins in place of devnet's services), at app.forest.foundation, mapped to loopback and taken
// as a secure origin, so its passkeys are made for that address.
//
//   npm run test:browser
//
// 0. The CSP: on every response; an inline script, an inline handler and another origin refused.
// 1. Setup: Open with your face, the passkey made for app.forest.foundation, its PRF secret the seed,
//    nothing of it kept but its fingerprint; the face check in a tab of its own (the stand-in's
//    Didit page sends it back to /back), the screen saying so meanwhile; the gift collected; the
//    vault's first write refused, so setup stops there; after a reload, taken up again with one
//    face, and the vault written.
// 2. A new profile, made with one face: the proof in the worker, the row, the folder, the vault.
// 3. The board and the card page: offers, the score and the reviews about it from the index, the
//    address copied, a writing key removed with one face, the inbox counted at that face, a grant
//    not counted; the menu's face check, one face, its facts from the vault and its face numbers
//    copied.
// 4. An offer posted from its sheet with its market's fields (subjects as chips, languages as BCP 47
//    tags, a name refused, saying why), then changed, one face each; Post closed until there is a
//    description, and a wrong price refused, in red, each saying why; posted with an empty folder,
//    one more of the vault's credits goes in, silently; with none left there, no writes left.
// 5. A second person, in a browser of their own, through the message door with no seed yet:
//    setup, a new profile, then the message, sent with one face.
// 6. The inbox, after one face: the thread with the second person, a reply, and a review from the
//    thread: one score on a slider, none until it moves, shown large; text counted to 500; refused,
//    before any face and in red, about a profile in another market, naming the other side; then
//    posted about the second person; the reply in the second person's inbox, whose buyer's card
//    calls its offers requests.
// 7. Requests an access key sent: every field of what Approve signs on the card, the dollar by its
//    name and the time in the person's own clock; one approved, signed as shown with the main key
//    after one face; one the app cannot do, saying so, declined.
// 8. Access keys: a writing key and an inbox key made with one face; the paste, shown once, the
//    profile and a line for each, copied; nothing of the private halves left on the device; each key
//    acts as its scope allows; one row for each kind; the inbox key removed, its two keys together.
// 9. A profile hidden from the board, held down or from its page's menu, and shown again from the
//    menu.
// 10. The menu: forgetting the device; then Start, refused the passkey the manager holds, straight
//     into Sign in, which brings everything back with one face; another subdomain refused the app's
//     passkeys; then, every bit of the app's storage cleared as on a new device, the same passkey
//     (the same tab), Sign in: one face, everything back, and an action after it.
// 11. A setup that stopped after its note, on a device since lost: Sign in goes on to its face
//     check; the gift given before, so no credits, and setup waits, saying so; once the vault's
//     folder can pay, it finishes, saying so. A face the issuer has from another setup: the passkey
//     this setup made dropped, and Start says to sign in. A passkey saved where no PRF secret can be
//     had, as it is made or at the get after: dropped, and Start says to save it in another password
//     manager. A browser that cannot ask for PRF: Start says so. Nothing kept, either way.
// 12. Start twice on one device: back from each step of setup, Start holding no Forget; the second
//     Start refused the passkey the first made, straight into Sign in, which takes up its setup at
//     the face check with one face, and asks no more when Start shows again; one passkey at the end.
// 13. A deploy while setup is open: build A served, its service worker in control, setup opened;
//     build B, every chunk named anew, put in its place, its service worker taking over and A's
//     files gone; Start: A's flow is a 404, the check's tab closes, the page reloads once onto B,
//     back on the face check; Start again, and the check opens. No blank tab at any point.
// 14. Nothing the app did, through all of it, was refused by the CSP.
//
// SHOTS=<dir> keeps a screenshot of each screen there, in light and dark.

import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { type Browser, type BrowserContext, type CDPSession, type Page, chromium } from 'playwright'
import { build } from 'vite'

import { mainKey, vaultKey } from '../../standard/keys/src/index.ts'
import { accessRecord, b64u, deliver, keyFromPrivate, ownerRecord, permissionsRecord, pull, pullRequest, readProfile } from '../../standard/records/src/index.ts'
import { DOLLAR } from '../../src/cards.ts'
import { message, openMessage } from '../../standard/records/src/private.ts'
import { publishRecords } from '../../src/services/host.ts'
import { creditsOf, openVault, vaultKeys } from '../../src/vault.ts'
import { profileTwin, world } from '../stand-ins.ts'
import { serveLikeVercel } from './vercel.ts'

const app = fileURLToPath(new URL('../..', import.meta.url))
const outDir = fileURLToPath(new URL('app-dist', import.meta.url))
/** The next deploy: the same app, every chunk named anew. */
const nextDir = fileURLToPath(new URL('app-dist-next', import.meta.url))
const LABEL = 'tutoring/seller'
const shots = process.env.SHOTS
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

let browser: Browser
let server: Awaited<ReturnType<typeof serveLikeVercel>>
let w: Awaited<ReturnType<typeof world>>
let context: BrowserContext
let page: Page
/** The first browser's passkeys made and asserted. */
let counts: { created: number; asserted: number }
let cdp: { session: CDPSession; authenticatorId: string }
/** The first person's seed, asked of their passkey by the test itself (`seedOn`). */
let seed: Uint8Array
let address: string
/** The app's origin, and another subdomain's, both on loopback; and the address a deploy lands on while setup is open. */
let APP: string
let OTHER: string
let DEPLOY: string
let deployPort: number
/** The CSP the app is served with, and what it refused on any page, as `<directive> <blocked>`. */
let csp: string
const refused: string[] = []

async function shot(name: string) {
  if (!shots) return
  mkdirSync(shots, { recursive: true })
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.screenshot({ path: `${shots}/${name}-${scheme}.png`, fullPage: true })
  }
  await page.emulateMedia({ colorScheme: 'light' })
}

const card = (title: string) => page.locator('button.card', { hasText: title })

/**
 * A browser of its own, a phone's size, with the app's settings pointed at the stand-ins and a
 * virtual passkey authenticator, with PRF unless `prf` is false; its passkeys made and asserted,
 * counted. `browserPrf` false makes the browser say it cannot ask for PRF at all.
 */
async function phone({ prf = true, browserPrf = true } = {}) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] })
  // The app's settings, pointed at the stand-ins, on every page it loads; and what the CSP refuses there, reported.
  await context.exposeFunction('cspRefused', (what: string) => void refused.push(what))
  await context.addInitScript((s) => {
    localStorage.setItem('forest.settings', JSON.stringify(s))
    addEventListener('securitypolicyviolation', (e) => (globalThis as any).cspRefused(`${e.violatedDirective} ${e.blockedURI}`))
  }, w.settings)
  if (!browserPrf) await context.addInitScript(() => void ((PublicKeyCredential as any).getClientCapabilities = async () => ({ 'extension:prf': false })))
  const page = await context.newPage()
  page.on('pageerror', (err) => console.log(`  page error: ${err.message}`))
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable', { enableUI: false })
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, hasPrf: prf, automaticPresenceSimulation: true },
  })
  const counts = { created: 0, asserted: 0 }
  cdp.on('WebAuthn.credentialAdded', () => void counts.created++)
  cdp.on('WebAuthn.credentialAsserted', () => void counts.asserted++)
  return { context, page, counts, cdp: { session: cdp, authenticatorId } }
}

/** The seed as the app is to derive it, asked by the test itself: the PRF secret for "forest-seed-v1", relying party app.forest.foundation. One assertion. */
async function seedOn(page: Page): Promise<Uint8Array> {
  const bytes = await page.evaluate(async () => {
    const got = (await navigator.credentials.get({
      publicKey: { rpId: 'app.forest.foundation', challenge: crypto.getRandomValues(new Uint8Array(32)), userVerification: 'required', extensions: { prf: { eval: { first: new TextEncoder().encode('forest-seed-v1') } } } },
    })) as PublicKeyCredential
    return Array.from(new Uint8Array(got.getClientExtensionResults().prf!.results!.first as ArrayBuffer))
  })
  return new Uint8Array(bytes)
}

/** What the page keeps: localStorage, and the names of its IndexedDB databases. */
const kept = (page: Page) => page.evaluate(async () => ({ local: { ...localStorage }, databases: (await indexedDB.databases()).map((d) => d.name) }))

before(async () => {
  w = await world()
  // vercel.json's CSP, its connect-src naming the stand-ins in place of devnet's services (test/bundle.test.ts checks it names those).
  const vercel = JSON.parse(readFileSync(`${app}vercel.json`, 'utf8'))
  const real: string = vercel.headers.find((h: any) => h.source === '/(.*)').headers.find((h: any) => h.key === 'Content-Security-Policy').value
  const { mcp: _, ...services } = w.settings
  csp = real
    .split('; ')
    .map((d) => (d.startsWith('connect-src ') ? `connect-src 'self' ${Object.values(services).join(' ')}` : d))
    .join('; ')
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir, emptyOutDir: true } })
  const renamed = { entryFileNames: 'assets/[name]-next-[hash].js', chunkFileNames: 'assets/[name]-next-[hash].js' }
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir: nextDir, emptyOutDir: true, rolldownOptions: { output: renamed } } })
  const port = await freePort()
  server = await serveLikeVercel({ root: outDir, port, override: { 'Content-Security-Policy': csp } })
  APP = `http://app.forest.foundation:${port}/`
  OTHER = `http://other.forest.foundation:${port}/`
  deployPort = await freePort()
  DEPLOY = `http://app.forest.foundation:${deployPort}/`
  // Chromium itself, not its headless shell, which does not take an insecure origin as secure; and WebAuthn wants a secure one.
  browser = await chromium.launch({
    channel: 'chromium',
    args: ['--host-resolver-rules=MAP *.forest.foundation 127.0.0.1', `--unsafely-treat-insecure-origin-as-secure=${[APP, OTHER, DEPLOY].map((o) => o.slice(0, -1)).join(',')}`],
  })
  ;({ context, page, counts, cdp } = await phone())
  say(`Chromium ${browser.version()}, the app at ${APP} (and ${OTHER}), served from 127.0.0.1`)
})

after(async () => {
  await browser?.close()
  await server?.close()
  await w?.close()
  console.log('\nApp report:\n' + report.map((l) => `- ${l}`).join('\n'))
})

test('the CSP: on every response; an inline script, an inline handler and another origin refused', async () => {
  const res = await page.goto(APP)
  assert.equal(res!.headers()['content-security-policy'], csp)
  // What runs here is the test's own, which DevTools exempts from the CSP; what it adds to the page is not.
  const tried = await page.evaluate(async () => {
    const script = document.createElement('script')
    script.textContent = 'globalThis.inline = true'
    document.head.append(script)
    const button = document.createElement('button')
    button.setAttribute('onclick', 'globalThis.handler = true')
    document.body.append(button)
    button.click()
    button.remove()
    let fetched = 'fetched'
    try {
      await fetch('https://example.com/')
    } catch (err) {
      fetched = (err as Error).name
    }
    return { inline: (globalThis as any).inline ?? false, handler: (globalThis as any).handler ?? false, fetched }
  })
  assert.deepEqual(tried, { inline: false, handler: false, fetched: 'TypeError' })
  for (let i = 0; i < 100 && refused.length < 3; i++) await new Promise((r) => setTimeout(r, 20))
  assert.deepEqual(refused.map((r) => r.split(' ')[0]).sort(), ['connect-src', 'script-src-attr', 'script-src-elem'])
  say(`CSP on every response: "${csp.replace(/connect-src [^;]+/, "connect-src 'self' <the stand-ins>")}"; an inline script, an inline handler and another origin refused`)
  refused.length = 0
})

test("setup: Open with your face, the passkey's PRF secret the seed, nothing of it kept but its fingerprint; the face check in its own tab", async () => {
  await page.goto(APP)
  await page.getByText('One human, one record, any market, no one in between.').waitFor()
  await page.getByRole('button', { name: 'Sign in' }).waitFor()
  await shot('1-start')
  await page.getByRole('button', { name: 'Start', exact: true }).click()

  await page.getByRole('heading', { name: 'Your passkey' }).waitFor()
  await page.getByText('This passkey is you: lose it and nothing brings it back.', { exact: false }).waitFor()
  await shot('2-passkey')
  await page.getByRole('button', { name: 'Open with your face' }).click()

  await page.getByRole('heading', { name: 'One face check' }).waitFor()
  await page.getByText('This ties your passkey to you: one real person, accountable for it.').waitFor()
  assert.equal(counts.created, 1, 'one passkey made')
  assert.equal(counts.asserted, 0, 'its PRF secret given as it was made, so no get followed (a Safari passkey would need one)')
  const { credentials } = (await cdp.session.send('WebAuthn.getCredentials', { authenticatorId: cdp.authenticatorId })) as { credentials: { rpId?: string; isResidentCredential: boolean; userName?: string }[] }
  assert.deepEqual(credentials.map((c) => [c.rpId, c.isResidentCredential, c.userName]), [['app.forest.foundation', true, 'Forest']], 'made for app.forest.foundation, resident, named Forest')

  seed = await seedOn(page)
  const device = await kept(page)
  assert.deepEqual(Object.keys(device.local).sort(), ['forest.fingerprint', 'forest.passkeys', 'forest.settings', 'forest.setup'])
  assert.equal(JSON.parse(device.local['forest.passkeys']!).length, 1, "the passkey's id, kept with those made here")
  assert.equal(JSON.parse(device.local['forest.fingerprint']!), (await vaultKey(seed)).address, "the fingerprint: the vault key's public half, of the seed the passkey gives for forest-seed-v1")
  const stored = JSON.stringify(device.local)
  assert.ok(!stored.includes(Buffer.from(seed).toString('base64url')) && !stored.includes(Buffer.from(seed).toString('hex')), 'and not the seed')
  assert.deepEqual(device.databases, [], 'nothing in IndexedDB')
  await shot('4-face')
  // Whether the screen said where the check is while it ran: it shows only until the note is here.
  await page.evaluate(() => {
    const seen = ((globalThis as any).away = { said: false })
    new MutationObserver(() => void (seen.said ||= !!document.body.textContent?.includes('Finish it in the other tab.'))).observe(document.body, { subtree: true, childList: true, characterData: true })
  })
  // The vault's first write refused: setup stops after the note and the gift, as a closed tab would stop it.
  const stop = w.host.refuse(1)
  const sessions = w.issuer.sessions.size
  const tab = context.waitForEvent('page')
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  const didit = await tab
  await page.locator('.error').waitFor({ timeout: 60_000 })
  stop()
  assert.equal(await page.evaluate(() => (globalThis as any).away.said), true, 'the screen said to finish the check in the other tab')
  assert.equal(await page.getByText('Finish it in the other tab.').count(), 0, 'and no longer, once the note came')
  say(`setup: the check's tab went to the stand-in's Didit page and back to /back, closed itself: ${didit.isClosed()}; the vault's first write refused: "${await page.locator('.error').textContent()}"`)

  // Reloaded, the app comes back to the face check, and takes it up again from what the device kept, with one face.
  await page.reload()
  await page.getByRole('heading', { name: 'One face check' }).waitFor()
  const faces = counts.asserted
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await page.getByRole('button', { name: 'New profile' }).waitFor({ timeout: 60_000 })
  await shot('5-board-empty')
  assert.equal(counts.asserted - faces, 1, 'one face to take it up again')
  assert.equal(w.issuer.sessions.size, sessions + 1, 'one face check in all: the note and its tickets came back from what the device kept, sealed')
  assert.equal(counts.created, 1, 'one passkey made')
  const done = await kept(page)
  assert.equal('forest.setup' in done.local, false, "setup's stages removed once the vault was written")
  assert.deepEqual(done.databases, [])

  const vault = (await openVault([w.settings.host], await vaultKeys(seed)))!.vault
  assert.equal(vault.issuerNotes?.[0]?.issuer, 'issuer.test')
  assert.deepEqual(vault.settings, { forestApp: { ...w.settings, credits: creditsOf(vault) } })
  assert.equal('credits' in vault, false)
  assert.equal(creditsOf(vault).length, 4, 'the gift: 2 registrations and 3 host credits, one spent into the vault folder')
  say("setup: one passkey for app.forest.foundation, its PRF secret given as it was made; the device keeps the fingerprint and nothing of the seed; stopped at the vault, taken up again after a reload with one face; vault on the host with the note, and 4 credits with the settings in the app's field")
})

test('a new profile, made with one face', async () => {
  await page.getByRole('button', { name: 'New profile' }).click()
  await page.getByRole('button', { name: 'Tennis' }).waitFor()
  await shot('6-markets')
  await page.getByLabel('Market').fill('tut')
  assert.equal(await page.getByRole('button', { name: 'Tennis' }).count(), 0, 'the list filters as the person types')
  await page.getByRole('button', { name: 'Tutoring' }).click()
  await page.getByRole('radio', { name: 'Teacher' }).click()
  await shot('7-side')
  const faces = counts.asserted
  const started = Date.now()
  await page.getByRole('button', { name: 'Make' }).click()
  await card('Tutoring').waitFor({ timeout: 120_000 })
  say(`new profile: made in ${Date.now() - started} ms, proof in the worker included`)
  assert.equal(counts.asserted - faces, 1, 'one face for the whole of it')

  address = (await mainKey(seed, LABEL)).address
  const view = await readProfile([w.settings.host], address, Date.now())
  assert.deepEqual(Object.keys(view.current.get('profile')!.record.body!).sort(), ['createdAt', 'inbox', 'inboxKey', 'market', 'role'], 'a card without a name')
  assert.equal(w.registryPayer.sent.length, 1, 'one row through the registry payer')
  assert.equal(await card('Tutoring').getByText('Teacher').count(), 1, "the market's word for the side")
  const local = await page.evaluate(() => localStorage.getItem('forest.profiles'))
  assert.deepEqual(JSON.parse(local!), [{ label: LABEL, address, hosts: [w.settings.host] }])
})

test('the board and the card: offers, the score and reviews from the index, an access key removed, the inbox counted', async () => {
  const main = await mainKey(seed, LABEL)
  const writer = keyFromPrivate(new Uint8Array(32).fill(42))
  const now = Date.now()
  await publishRecords([w.settings.host], [
    permissionsRecord(main, [{ key: writer.address, scope: 'write', paths: ['offer', 'review'] }], now),
    ownerRecord(main, 'offer/maths', { direction: 'offer', description: 'Maths, one hour', price: { amount: '25', mint: 'J2QBACfPPb1ys2UyGx3ecXHgCr4hWuHFT3C2Nr6TSVSa', per: 'hour' }, createdAt: new Date(now).toISOString() }, now),
    ownerRecord(main, 'review/one', { subject: w.registryPayer.payer, ratings: { overall: '9' }, text: 'On time, clear.', createdAt: new Date(now).toISOString() }, now),
  ])
  w.index.profiles.set(address, {
    scores: { rating: { value: 8.5, details: { reviews: 2 } } },
    reviews: { received: [{ uri: 'a', reviewer: w.registryPayer.payer, overall: 9, text: 'Patient and clear.' }, { uri: 'b', reviewer: writer.address, overall: 8, text: null }] },
  })
  await page.reload()
  await card('Tutoring').getByText('Maths, one hour').waitFor()
  assert.equal(await card('Tutoring').getByText('$25 / hour').count(), 1)
  assert.equal(await card('Tutoring').locator('.score').textContent(), '8.5')
  assert.equal(await card('Tutoring').locator('.badge').textContent(), '2', 'two reviews not yet seen')
  await shot('8-board')

  await card('Tutoring').click()
  await page.getByRole('heading', { name: 'Access keys' }).waitFor()
  await page.getByText(`${address.slice(0, 4)}…${address.slice(-4)}`).waitFor()
  await page.getByRole('button', { name: 'Copy address' }).click()
  await page.getByRole('button', { name: 'Copied' }).waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), address, 'the address under the role word, copied whole')
  await page.getByText('2 reviews').waitFor()
  assert.equal(await page.locator('.dot').count(), 1, 'the bell shows new reviews')
  await page.getByText('On time, clear.').waitFor()
  await shot('9-card')
  await page.getByRole('button', { name: 'Reviews about this profile' }).click()
  await page.getByText('Patient and clear.').waitFor()
  await shot('10-reviews')
  await page.locator('.sheet-back').click({ position: { x: 20, y: 20 } })
  assert.equal(await page.locator('.dot').count(), 0, 'seen')

  // A message from someone with a row, and a grant: the next face counts the message alone.
  const buyer = await mainKey(new Uint8Array(32).fill(7), 'tutoring/buyer')
  w.host.rows.add(buyer.address)
  const theCard = (await readProfile([w.settings.host], address, Date.now())).current.get('profile')!.record.body!
  const grant = { key: b64u.encode(new Uint8Array(32).fill(9)), folder: buyer.address, scope: 'write', paths: ['offer'], from: buyer.address, since: Date.now() }
  const [taken] = await deliver([w.settings.host], [await message(buyer, address, { text: 'Is Tuesday free?' }, Date.now(), theCard), await message(buyer, address, { grant }, Date.now() + 1, theCard)])
  assert.deepEqual(taken!.results.map((r) => r.ok), [true, true])

  const faces = counts.asserted
  await page.locator('div.row', { hasText: 'Writing key' }).getByRole('button', { name: 'Remove' }).click()
  await page.locator('button.remove').waitFor({ state: 'detached' })
  assert.equal(counts.asserted - faces, 1)
  assert.deepEqual((await readProfile([w.settings.host], address, Date.now())).access, [{ key: writer.address, was: 'write', paths: ['offer', 'review'] }])
  say('card: offers and the reviews written from the host; score, review count and the bell from the index; an access key made past with one face')

  await page.getByRole('button', { name: 'Back' }).click()
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'Forget this device' }).waitFor()
  assert.equal(await page.getByText('24 words').count(), 0, 'no words in the menu')
  await shot('11-menu')
  await page.locator('.sheet-back').click({ position: { x: 20, y: 20 } })
  await card('Tutoring').locator('.badge', { hasText: '1' }).waitFor()
  assert.equal(await page.evaluate((a) => JSON.parse(localStorage.getItem('forest.inbox')!)[a].count, address), 1, 'the grant not counted')
  say('inbox: the message counted by the pull signed at the face that removed the key, shown on the card; the grant beside it not counted')

  // The face check, as the vault keeps it: one face, then its facts, and its face numbers copied as JSON.
  await page.getByRole('button', { name: 'Menu' }).click()
  const item = page.locator('.item', { has: page.getByRole('heading', { name: 'Your face check' }) })
  const before = counts.asserted
  await page.getByRole('button', { name: 'Your face check' }).click()
  await item.waitFor()
  assert.equal(counts.asserted - before, 1, 'one face')
  const facts = Object.fromEntries((await item.locator('dl').evaluate((dl) => [...dl.querySelectorAll('dt')].map((dt) => [dt.textContent, dt.nextElementSibling!.textContent]))) as [string, string][])
  const made = (await readProfile([w.settings.host], (await vaultKeys(seed)).key.address, Date.now())).current.get('hosts')!.record.time
  const date = await page.evaluate((t) => new Date(t).toLocaleDateString([], { dateStyle: 'medium' }), made)
  assert.deepEqual(facts, { issuer: 'issuer.test', date, tier: '1', model: 'example-face-model/1', 'face numbers': '3' }, "the note's facts; the date, the vault's, made right after the note")
  await item.getByText('These stay in your vault; copy them only to test.').waitFor()
  await item.getByRole('button', { name: 'Copy' }).click()
  await item.getByRole('button', { name: 'Copied' }).waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), JSON.stringify([0.25, -0.5, 0.125]), 'the face numbers, as JSON')
  await shot('11b-face-check')
  await page.locator('.sheet-back').click({ position: { x: 20, y: 20 } })
  await item.waitFor({ state: 'detached' })
  say(`menu: the face check after one face, from the vault: ${JSON.stringify(facts)}; its face numbers copied as JSON`)
})

test('the offer sheet: posted, then changed, one face each', async () => {
  await card('Tutoring').click()
  await page.getByRole('heading', { name: 'Access keys' }).waitFor()
  await page.getByRole('button', { name: '+ Offer' }).click()
  const sheet = page.getByRole('dialog', { name: 'Offer' })
  assert.equal(await sheet.getByLabel('Description').getAttribute('placeholder'), 'Title on the first line')
  // Post closed until there is a description, and saying so; a price that is not one refused, in red, saying why.
  await sheet.getByText('Write a description.').waitFor()
  assert.equal(await sheet.getByRole('button', { name: 'Post' }).isDisabled(), true)
  await sheet.getByLabel('Description').fill('Physics, one hour\nOnline, any level.')
  await sheet.getByLabel('Price').fill('thirty')
  const wrongPrice = sheet.getByText('A price is a number above 0, such as 25 or 12.50.')
  await wrongPrice.waitFor()
  assert.equal(await wrongPrice.evaluate((e) => getComputedStyle(e).color), 'rgb(179, 38, 30)', 'in red')
  assert.equal(await sheet.getByRole('button', { name: 'Post' }).isDisabled(), true)
  await sheet.getByLabel('Price').fill('30')
  await wrongPrice.waitFor({ state: 'detached' })
  await sheet.getByRole('radio', { name: 'Hour' }).click()
  // The market's fields, under them: subjects as chips; languages as BCP 47 tags, a name refused.
  await sheet.getByText('Languages it is offered in, as BCP 47 tags such as en or es.').waitFor()
  await sheet.getByLabel('Subjects').fill('Physics')
  await sheet.getByLabel('Subjects').press('Enter')
  await sheet.getByLabel('Subjects').fill('Maths')
  await sheet.getByLabel('Languages').fill('english')
  assert.equal(await sheet.getByRole('button', { name: 'Remove Maths' }).count(), 1, 'what was typed becomes a chip on leaving the field')
  await sheet.getByLabel('Languages').press('Enter')
  assert.equal(await sheet.getByLabel('Languages').getAttribute('aria-invalid'), 'true', "a language's name is not a tag")
  assert.equal(await sheet.getByLabel('Languages').inputValue(), 'english', 'and is not taken')
  await sheet.getByText(`"english" isn't a language tag, such as en or pt-BR.`).waitFor()
  await sheet.getByLabel('Languages').fill('en')
  await sheet.getByLabel('Languages').press('Enter')
  await sheet.getByLabel('Languages').fill('PT-br')
  await sheet.getByLabel('Languages').press('Enter')
  await sheet.getByRole('button', { name: 'Remove pt-BR' }).waitFor()
  await shot('14-offer-sheet')
  // The folder's balance spent: the post takes one more of the vault's host credits into it, and nothing shows.
  const keys = await vaultKeys(seed)
  const hostCredits = async () => creditsOf((await openVault([w.settings.host], keys))!.vault).filter((c) => c.service === w.settings.host).length
  assert.equal(await hostCredits(), 1)
  w.host.balances.set(address, 0)
  let faces = counts.asserted
  await sheet.getByRole('button', { name: 'Post' }).click()
  await sheet.waitFor({ state: 'detached' })
  const row = page.locator('button.tint', { hasText: 'Physics, one hour' })
  await row.getByText('$30 / hour').waitFor()
  assert.equal(counts.asserted - faces, 1, 'one face to post it')
  assert.equal(await hostCredits(), 0, "one of the vault's credits went into the folder")
  assert.ok(Math.abs(w.host.balances.get(address)! - 0.99) < 1e-9)

  const fields = async () => {
    const body = [...(await readProfile([w.settings.host], address, Date.now())).current].find(([path, c]) => path.startsWith('offer/') && c.record.body?.description === 'Physics, one hour\nOnline, any level.')![1].record.body!
    return { subjects: body.subjects, languages: body.languages }
  }
  assert.deepEqual(await fields(), { subjects: ['Physics', 'Maths'], languages: ['en', 'pt-BR'] }, "the market's fields, as its file asks")

  await row.click()
  assert.equal(await sheet.getByLabel('Description').inputValue(), 'Physics, one hour\nOnline, any level.', 'the sheet opens on what is there')
  await sheet.getByRole('button', { name: 'Remove Maths' }).click()
  await sheet.getByLabel('Price').fill('45')
  await sheet.getByRole('radio', { name: 'Total' }).click()
  faces = counts.asserted
  await sheet.getByRole('button', { name: 'Post' }).click()
  await page.locator('button.tint', { hasText: 'Physics, one hour' }).getByText('$45', { exact: true }).waitFor()
  assert.equal(counts.asserted - faces, 1)
  const offers = [...(await readProfile([w.settings.host], address, Date.now())).current].filter(([path, c]) => path.startsWith('offer/') && c.record.body?.description === 'Physics, one hour\nOnline, any level.')
  assert.equal(offers.length, 1, 'changed in place')
  assert.deepEqual(offers[0]![1].record.body!.price, { amount: '45', mint: 'J2QBACfPPb1ys2UyGx3ecXHgCr4hWuHFT3C2Nr6TSVSa', per: 'job' })
  assert.deepEqual(await fields(), { subjects: ['Physics'], languages: ['en', 'pt-BR'] }, 'a chip removed')
  await shot('15-card-offer')

  // Spent again, with none left in the vault: the sheet says so, in plain words.
  const held = w.host.balances.get(address)!
  w.host.balances.set(address, 0)
  await page.locator('button.tint', { hasText: 'Physics, one hour' }).click()
  await sheet.getByLabel('Price').fill('50')
  await sheet.getByRole('button', { name: 'Post' }).click()
  await sheet.getByText('This profile has no writes left.').waitFor()
  await page.locator('.sheet-back').click({ position: { x: 20, y: 20 } })
  await sheet.waitFor({ state: 'detached' })
  w.host.balances.set(address, held)
  say("offer sheet: posted and changed from the card, one face each, signed by the main key, with the market's fields (subjects as chips, languages as BCP 47 tags, \"english\" refused, \"PT-br\" written pt-BR); an empty folder topped up from the vault's credits without a word, and with none left, \"This profile has no writes left.\"")
})

let second: Awaited<ReturnType<typeof phone>>
let secondAddress: string

test('a second person through the message door: setup, a new profile, then the message', async () => {
  second = await phone()
  const b = second.page
  await b.goto(`${APP}message?to=${address}`)
  await b.getByRole('button', { name: 'Start', exact: true }).click()
  assert.equal(await b.evaluate(() => location.pathname), '/', 'the door leaves the address bar')
  await b.getByRole('button', { name: 'Open with your face' }).click()
  await b.getByRole('heading', { name: 'One face check' }).waitFor()
  const tab = second.context.waitForEvent('page')
  await b.getByRole('button', { name: 'Start', exact: true }).click()
  await tab

  // No profile yet: a new one first.
  await b.getByRole('button', { name: 'Tutoring' }).click({ timeout: 60_000 })
  await b.getByRole('radio', { name: 'Student' }).click()
  await b.getByRole('button', { name: 'Make' }).click()

  // Then the message, to the first person's card.
  const sheet = b.getByRole('dialog', { name: 'Message' })
  await sheet.waitFor({ timeout: 120_000 })
  await sheet.getByText('Tutoring teacher').waitFor()
  assert.equal(await sheet.getByRole('radio', { checked: true }).textContent(), 'Tutoring student', 'sent from the profile in the same market')
  // The stand-in host takes a message to an inbox open to the issuer's people from a sender it knows holds a row.
  secondAddress = JSON.parse((await b.evaluate(() => localStorage.getItem('forest.profiles')))!)[0].address
  w.host.rows.add(secondAddress)
  w.host.rows.add(address)
  await sheet.getByLabel('Message').fill('Can we do Thursday?')
  if (shots) await b.screenshot({ path: `${shots}/16-door-light.png` })
  const faces = second.counts.asserted
  await sheet.getByRole('button', { name: 'Send' }).click()
  await sheet.waitFor({ state: 'detached' })
  assert.equal(second.counts.asserted - faces, 1, 'one face to send it')
  await b.locator('button.card', { hasText: 'Tutoring' }).waitFor()
  say('message door: not set up yet, so setup, then a new profile, then the message, sent with one face')
})

test('the inbox: the thread, a reply, and a review from the thread, refused about another market first', async () => {
  let faces = counts.asserted
  await page.getByRole('button', { name: 'Inbox' }).click()
  const thread = page.locator('button.thread', { hasText: 'Tutoring student' })
  await thread.waitFor()
  assert.equal(counts.asserted - faces, 1, 'face first')
  assert.equal(await page.locator('button.thread').first().textContent().then((t) => t?.startsWith('Tutoring student')), true, 'newest first')
  await shot('17-inbox')
  await thread.click()
  await page.getByText('Can we do Thursday?').waitFor()
  await page.getByLabel('Message').fill('Thursday at five.')
  await page.getByRole('button', { name: 'Send' }).click()
  await page.locator('.message.mine', { hasText: 'Thursday at five.' }).waitFor()
  await shot('18-thread')

  // The second person, a student in the same market, and a profile the index has in another market.
  const elsewhere = keyFromPrivate(new Uint8Array(32).fill(44)).address
  w.index.profiles.set(elsewhere, profileTwin(elsewhere, 'cleaning/buyer'))
  w.index.profiles.set(secondAddress, profileTwin(secondAddress, 'tutoring/buyer'))
  await page.getByRole('button', { name: 'Review' }).click()
  const sheet = page.getByRole('dialog', { name: 'Review' })
  assert.equal(await sheet.getByLabel('Address').inputValue(), secondAddress, 'the address filled from the thread')
  // One score, on a slider from 1 to 10 in half points: none until it moves, and Post says so.
  const post = sheet.getByRole('button', { name: 'Post' })
  await sheet.getByText('Move the slider to give a score.').waitFor()
  assert.equal(await post.isDisabled(), true)
  assert.equal(await sheet.getByRole('slider').count(), 1, 'one score, no other rows')
  const slider = sheet.getByRole('slider', { name: 'Score' })
  assert.deepEqual(await slider.evaluate((e: HTMLInputElement) => [e.min, e.max, e.step]), ['1', '10', '0.5'])
  await slider.focus()
  await slider.press('End')
  for (let i = 0; i < 3; i++) await slider.press('ArrowLeft')
  assert.equal(await sheet.locator('output.big').textContent(), '8.5', 'the score, large above it')
  await sheet.getByLabel('Text').fill('Clear about what they wanted.')
  assert.equal(await sheet.locator('.count').textContent(), '29/500', 'the text counted, to 500')
  assert.equal(await sheet.getByLabel('Text').getAttribute('maxlength'), '500')

  // About a profile the index has in another market: refused before any face, in red, naming the other side.
  await sheet.getByLabel('Address').fill(elsewhere)
  const refusal = sheet.getByText("This address doesn't belong to a Tutoring student.")
  await refusal.waitFor()
  assert.equal(await refusal.evaluate((e) => getComputedStyle(e).color), 'rgb(179, 38, 30)', 'in red')
  assert.equal(await post.isDisabled(), true, 'Post not open')
  await shot('18b-review-other-market')

  // About the second person: posted with one face.
  await sheet.getByLabel('Address').fill(secondAddress)
  await refusal.waitFor({ state: 'detached' })
  faces = counts.asserted
  await post.click()
  await sheet.waitFor({ state: 'detached' })
  assert.equal(counts.asserted - faces, 1)
  const reviews = [...(await readProfile([w.settings.host], address, Date.now())).current].filter(([path, c]) => path.startsWith('review/') && c.record.body?.subject === secondAddress)
  assert.equal(reviews.length, 1)
  assert.deepEqual(reviews[0]![1].record.body!.ratings, { overall: '8.5' })
  assert.equal(reviews[0]![1].record.body!.text, 'Clear about what they wanted.')
  const read = await page.evaluate((a) => JSON.parse(localStorage.getItem('forest.inbox')!)[a].count, address)
  assert.equal(read, 0, 'what the inbox showed is read')

  // The reply, in the second person's inbox.
  const b = second.page
  await b.locator('button.card', { hasText: 'Tutoring' }).click()
  // A buyer's profile asks for things: its offers are requests.
  await b.getByRole('heading', { name: 'Requests' }).waitFor()
  await b.getByRole('button', { name: '+ Request' }).click()
  await b.getByRole('dialog', { name: 'Request' }).waitFor()
  await b.locator('.sheet-back').click({ position: { x: 20, y: 20 } })
  await b.getByRole('button', { name: 'Inbox' }).click()
  await b.locator('button.thread', { hasText: 'Tutoring teacher' }).click()
  await b.getByText('Thursday at five.').waitFor()
  assert.equal(await b.locator('.message.mine', { hasText: 'Can we do Thursday?' }).count(), 1, 'their own message, from the copy in their own inbox')
  await second.context.close()
  await page.goto(APP)
  await card('Tutoring').waitFor()
  say(`inbox: one face, the thread named by the card, a reply sealed and copied; a review from the thread, one score on a slider (8.5), its text counted to 500, refused before any face about a profile the index has in another market ("This address doesn't belong to a Tutoring student.", in red), then posted about the student; the reply read on the other side, whose buyer's card says Requests`)
})

test('requests from an access key: one approved with one face, one declined', async () => {
  const main = await mainKey(seed, LABEL)
  const helper = keyFromPrivate(new Uint8Array(32).fill(43))
  const view = await readProfile([w.settings.host], address, Date.now())
  await publishRecords([w.settings.host], [permissionsRecord(main, [...view.access, { key: helper.address, scope: 'message' }], Date.now())])
  const theCard = view.current.get('profile')!.record.body!
  const asHelper = { key: helper, from: address, host: w.settings.host }
  const offer = { direction: 'offer', description: 'Chemistry, one hour', price: { amount: '35', mint: 'J2QBACfPPb1ys2UyGx3ecXHgCr4hWuHFT3C2Nr6TSVSa', per: 'hour' } }
  await deliver([w.settings.host], [await message(asHelper, address, { request: 'post-offer', offer }, Date.now(), theCard)])
  await deliver([w.settings.host], [await message(asHelper, address, { request: 'pay', offer: `${address}/offer/maths`, units: 2 }, Date.now() + 1, theCard)])

  await card('Tutoring').click()
  await page.getByRole('button', { name: 'Inbox' }).click()
  await page.locator('button.thread', { hasText: 'Access key' }).click()
  const asked = page.getByRole('group', { name: 'Request' })
  await asked.first().waitFor()
  assert.equal(await asked.count(), 2)
  const post = asked.filter({ hasText: 'Post an offer' })
  await post.getByText('$35 / hour').waitFor()
  const signs = Object.fromEntries((await post.locator('dl.fields').evaluate((dl) => [...dl.querySelectorAll('dt')].map((dt) => [dt.textContent, dt.nextElementSibling!.textContent]))) as [string, string][])
  assert.deepEqual(Object.keys(signs), ['path', 'description', 'direction', 'price.amount', 'price.mint', 'price.per', 'createdAt'], 'every field of what Approve signs')
  assert.match(signs.path!, /^offer\/[0-9a-f]{16}$/)
  assert.equal(signs['price.mint'], 'devnet dollar', "the index's dollar by its name")
  assert.equal(await asked.filter({ hasText: 'Pay' }).getByRole('button', { name: 'Approve' }).count(), 0, 'a payment is not in this app yet: decline only')
  await asked.filter({ hasText: 'Pay' }).getByText("This app can't do this yet: you can only decline it.").waitFor()
  await shot('19-requests')
  let faces = counts.asserted
  await post.getByRole('button', { name: 'Approve' }).click()
  await post.waitFor({ state: 'detached' })
  assert.equal(counts.asserted - faces, 1, 'one face to approve it')
  const posted = (await readProfile([w.settings.host], address, Date.now())).current.get(signs.path!)
  assert.ok(posted, 'the offer, at the path the card showed')
  assert.equal(posted!.record.by, undefined, 'signed by the main key')
  const createdAt = posted!.record.body!.createdAt as string
  assert.equal(signs.createdAt, await page.evaluate((t) => new Date(t).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }), createdAt), "the time in the person's own clock")
  assert.deepEqual(posted!.record.body, { description: signs.description, direction: signs.direction, price: { amount: signs['price.amount'], mint: DOLLAR, per: signs['price.per'] }, createdAt }, 'signed as the card showed it')
  faces = counts.asserted
  await asked.filter({ hasText: 'Pay' }).getByRole('button', { name: 'Decline' }).click()
  await asked.first().waitFor({ state: 'detached' })
  assert.equal(counts.asserted - faces, 0, 'declining needs no face')
  await page.goto(APP)
  await card('Tutoring').getByText('Chemistry, one hour').waitFor()
  say("requests: an access key asked; the card listed every field of what Approve signs, the devnet dollar by name and the time in the person's clock; approved with one face, signed as shown by the main key; a payment declined")
})

test('access keys: a writing key and an inbox key made with one face, the paste shown once, each key acting; one row each; the inbox key removed', async () => {
  await card('Tutoring').click()
  await page.getByRole('heading', { name: 'Access keys' }).waitFor()
  const before = (await readProfile([w.settings.host], address, Date.now())).access
  await page.getByRole('button', { name: '+ Access key' }).click()
  const sheet = page.getByRole('dialog', { name: 'Access key' })
  const make = sheet.getByRole('button', { name: 'Make' })
  assert.equal(await make.isDisabled(), true, 'Make waits for a choice')
  await sheet.getByText('Pick at least one.').waitFor()
  for (const name of ['Writing key', 'Inbox key']) await sheet.getByLabel(name).check()
  await sheet.getByText('Pick at least one.').waitFor({ state: 'detached' })
  await shot('20-access-key')
  const faces = counts.asserted
  await make.click()
  const paste = sheet.locator('pre.paste')
  await paste.waitFor()
  assert.equal(counts.asserted - faces, 1, 'one face to make them')
  const text = (await paste.textContent())!
  const lines = text.split('\n')
  assert.equal(lines.length, 3, 'the profile, and a line for each kind: no MCP door, no instructions')
  assert.equal(lines[0], `Forest profile: ${address} (Tutoring, teacher)`)
  assert.match(lines[1]!, /^writingKey: [A-Za-z0-9_-]{43}$/)
  assert.match(lines[2]!, /^inboxKey: [A-Za-z0-9_-]{43}\.AGE-SECRET-KEY-PQ-1[0-9A-Z]+$/, 'its message key, a dot, its read key')
  const writeKey = lines[1]!.split(': ')[1]!
  const [messageKey, readKey] = lines[2]!.split(': ')[1]!.split('.') as [string, string]
  await shot('21-access-paste')
  await sheet.getByRole('button', { name: 'Copy' }).click()
  await sheet.getByRole('button', { name: 'Copied' }).waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), text, 'copied as shown')
  await page.locator('.sheet-back').click({ position: { x: 20, y: 20 } })
  assert.equal(await paste.count(), 1, 'the backdrop does not close the paste: only Done does')
  await sheet.getByRole('button', { name: 'Done' }).click()
  await sheet.waitFor({ state: 'detached' })

  // Nothing of the private halves on the device: not in its storage, not on the page.
  const device = await page.evaluate(async () => ({
    storage: JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }),
    html: document.documentElement.outerHTML,
    databases: (await indexedDB.databases()).map((d) => d.name),
  }))
  for (const key of [writeKey, messageKey, readKey]) assert.ok(!device.storage.includes(key) && !device.html.includes(key), 'no private half kept')
  assert.deepEqual(device.databases, [])

  // On the host: the permissions record's public part, the card's readers.
  const view = await readProfile([w.settings.host], address, Date.now())
  const writer = keyFromPrivate(b64u.decode(writeKey))
  const messenger = keyFromPrivate(b64u.decode(messageKey))
  const reader = view.access.at(-1)!.key
  assert.deepEqual(view.access, [...before, { key: writer.address, scope: 'write', paths: ['offer', 'review'] }, { key: messenger.address, scope: 'message' }, { key: reader, scope: 'read' }])
  const theCard = view.current.get('profile')!.record.body!
  assert.deepEqual((theCard.inbox as { readers?: string[] }).readers, [reader])
  // On the card, one row for each, by its kind: the message key that sent the requests, made before the two kinds, then the two made now.
  const rows = page.locator('section', { has: page.getByRole('heading', { name: 'Access keys' }) }).locator('div.row')
  await rows.filter({ hasText: 'Inbox key' }).waitFor()
  assert.deepEqual(await rows.locator(':scope > span').allTextContents(), ['Message key', 'Writing key', 'Inbox key'])
  await shot('22-access-rows')

  // Each acts: the writing key posts an offer, as an AI's door does; the inbox key's message key pulls the inbox and its read key opens what is in it.
  await publishRecords([w.settings.host], [accessRecord(writer, address, 'offer/from-my-ai', { direction: 'offer', description: 'Posted by my AI', createdAt: new Date().toISOString() }, Date.now())])
  const stranger = await mainKey(new Uint8Array(32).fill(8), 'tutoring/buyer')
  w.host.rows.add(stranger.address)
  await deliver([w.settings.host], [await message(stranger, address, { text: 'Are you free on Monday?' }, Date.now(), theCard)])
  const page1 = await pull(w.settings.host, pullRequest({ key: messenger, profile: address }, 0, Date.now()))
  assert.deepEqual((await openMessage(page1.messages.at(-1)!.message, readKey)).body, { text: 'Are you free on Monday?' })
  await page.reload()
  await card('Tutoring').getByText('Posted by my AI').waitFor()
  await card('Tutoring').click()
  await page.getByRole('heading', { name: 'Access keys' }).waitFor()

  // The inbox key removed from its row, its two keys in one write: the message key made past, the read key deleted and dropped from the card's readers.
  const faces2 = counts.asserted
  await rows.filter({ hasText: 'Inbox key' }).getByRole('button', { name: 'Remove' }).click()
  await rows.filter({ hasText: 'Inbox key' }).waitFor({ state: 'detached' })
  assert.equal(counts.asserted - faces2, 1)
  const after = await readProfile([w.settings.host], address, Date.now())
  assert.equal(after.access.some((e) => e.key === reader), false)
  assert.deepEqual(after.access.find((e) => e.key === messenger.address), { key: messenger.address, was: 'message' })
  assert.equal((after.current.get('profile')!.record.body!.inbox as { readers?: string[] }).readers, undefined)
  await page.getByRole('button', { name: 'Back' }).click()
  await card('Tutoring').waitFor()
  say('access keys: a writing key and an inbox key made with one face; the paste shown once, the profile and a line for each, copied, closed only by Done, nothing of it left on the device; the writing key posted, the message key pulled, the read key opened; one row for each kind; the inbox key removed, its two keys in one write')
})

test('a profile hidden from the board, held down or from its page, and shown again from the menu', async () => {
  const hidden = page.locator('.item', { has: page.getByRole('heading', { name: 'Hidden profiles' }) })
  const showAgain = async () => {
    await page.getByRole('button', { name: 'Menu' }).click()
    await hidden.locator('.row', { hasText: 'Tutoring teacher' }).getByRole('button', { name: 'Show' }).click()
    await hidden.waitFor({ state: 'detached' })
    await page.locator('.sheet-back').click({ position: { x: 20, y: 20 } })
    await card('Tutoring').waitFor()
  }

  // Held down on the board.
  const box = (await card('Tutoring').boundingBox())!
  await page.mouse.move(box.x + 24, box.y + 24)
  await page.mouse.down()
  await page.getByRole('dialog', { name: 'Profile' }).waitFor()
  await page.mouse.up()
  assert.equal(await page.getByRole('heading', { name: 'Access keys' }).count(), 0, 'held, the card does not open')
  await shot('23-profile-menu')
  await page.getByRole('dialog', { name: 'Profile' }).getByRole('button', { name: 'Hide' }).click()
  await card('Tutoring').waitFor({ state: 'detached' })
  assert.deepEqual(JSON.parse((await page.evaluate(() => localStorage.getItem('forest.profiles')))!).map((p: { address: string }) => p.address), [address], 'nothing deleted')
  await page.getByRole('button', { name: 'Menu' }).click()
  await hidden.waitFor()
  await shot('24-menu-hidden')
  await page.locator('.sheet-back').click({ position: { x: 20, y: 20 } })
  await showAgain()

  // From its page's menu.
  await card('Tutoring').click()
  await page.getByRole('button', { name: 'Profile menu' }).click()
  await page.getByRole('dialog', { name: 'Profile' }).getByRole('button', { name: 'Hide' }).click()
  await page.getByRole('button', { name: 'New profile' }).waitFor()
  assert.equal(await card('Tutoring').count(), 0)
  await showAgain()
  say('hide: a profile held down on the board, or from its page, hidden; the menu shows it again; nothing deleted')
})

test('the menu: forget this device; Start refused the passkey held, into Sign in; then Sign in on a cleared device: everything back; another subdomain refused', async () => {
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('radio', { name: 'Dark' }).click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(18, 26, 21)')
  await page.getByRole('radio', { name: 'Device' }).click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), undefined)

  await page.getByRole('button', { name: 'Forget this device' }).click()
  await page.getByText('Your passkey stays in your password manager. Sign in with it to come back.').waitFor()
  await shot('12-forget')
  await page.getByRole('button', { name: 'Forget this device' }).click()
  await page.getByRole('button', { name: 'Sign in' }).waitFor()
  const forgotten = await kept(page)
  assert.deepEqual([Object.keys(forgotten.local), forgotten.databases], [['forest.passkeys'], []], 'the cache and the fingerprint cleared; the ids of the passkeys made here kept')
  const { credentials } = (await cdp.session.send('WebAuthn.getCredentials', { authenticatorId: cdp.authenticatorId })) as { credentials: unknown[] }
  assert.equal(credentials.length, 1, 'the passkey kept')

  // Start again here: the manager holds the passkey this device made, so it makes no second one, and
  // Start goes straight into Sign in, saying why, its sheet open: one face, and the board is back.
  // Reloaded first, so the settings the test puts on every page point at the stand-ins again.
  await page.reload()
  const before = { created: counts.created, asserted: counts.asserted }
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await page.getByRole('heading', { name: 'Your passkey' }).waitFor()
  await page.evaluate(() => {
    const seen = ((globalThis as any).hasPasskey = { said: false, signingIn: false })
    new MutationObserver(() => {
      seen.said ||= !!document.body.textContent?.includes('You already have a Forest passkey. Sign in with it.')
      seen.signingIn ||= seen.said && !!document.querySelector('[role=status]')
    }).observe(document.body, { subtree: true, childList: true, characterData: true })
  })
  await page.getByRole('button', { name: 'Open with your face' }).click()
  await card('Tutoring').getByText('Maths, one hour').waitFor({ timeout: 30_000 })
  assert.deepEqual(await page.evaluate(() => (globalThis as any).hasPasskey), { said: true, signingIn: true }, 'Start said why, and signed in at once')
  assert.equal(counts.created - before.created, 0, 'no passkey made')
  assert.equal(counts.asserted - before.asserted, 1, 'one face, the sign in')
  assert.equal(((await cdp.session.send('WebAuthn.getCredentials', { authenticatorId: cdp.authenticatorId })) as { credentials: unknown[] }).credentials.length, 1)
  assert.equal(JSON.parse((await page.evaluate(() => localStorage.getItem('forest.fingerprint')))!), (await vaultKey(seed)).address, 'signed in as before')

  // Back on the app, every bit of its storage cleared, as a new device has it: its service worker,
  // its caches, its local and session storage. The same tab, so the same virtual passkey: Chrome's
  // DevTools cannot hand a passkey's PRF secret to another browser context.
  await page.evaluate(async () => {
    for (const registration of await navigator.serviceWorker.getRegistrations()) await registration.unregister()
    for (const name of await caches.keys()) await caches.delete(name)
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
  await page.getByRole('button', { name: 'Sign in' }).waitFor()
  assert.equal(await page.evaluate(() => navigator.serviceWorker.controller), null, 'no service worker from before')
  assert.deepEqual(await kept(page), { local: { 'forest.settings': JSON.stringify(w.settings) }, databases: [] }, 'nothing but the settings the test puts on every page')
  const made = counts.created
  let faces = counts.asserted
  await page.getByRole('button', { name: 'Sign in' }).click()
  await card('Tutoring').getByText('Maths, one hour').waitFor({ timeout: 30_000 })
  await shot('13-signed-in')
  assert.equal(counts.created - made, 0, 'no passkey made')
  assert.equal(counts.asserted - faces, 1, 'one face')
  const device = await kept(page)
  assert.equal(JSON.parse(device.local['forest.fingerprint']!), (await vaultKey(seed)).address, 'the fingerprint kept again')
  assert.deepEqual(JSON.parse(device.local['forest.profiles']!), [{ label: LABEL, address, hosts: [w.settings.host] }], 'the board, from the vault')
  assert.equal('forest.setup' in device.local, false)

  // An action there: the inbox, with one face.
  faces = counts.asserted
  await card('Tutoring').click()
  await page.getByRole('button', { name: 'Inbox' }).click()
  await page.locator('button.thread', { hasText: 'Tutoring student' }).waitFor()
  assert.equal(counts.asserted - faces, 1)

  // Another subdomain cannot ask for the app's passkeys.
  await page.goto(OTHER)
  const there = await page.evaluate(async () => {
    try {
      await navigator.credentials.get({ publicKey: { rpId: 'app.forest.foundation', challenge: new Uint8Array(32), userVerification: 'required' } })
      return 'given'
    } catch (err) {
      return (err as Error).name
    }
  })
  assert.equal(there, 'SecurityError', `${new URL(OTHER).host} may not ask for app.forest.foundation's passkeys`)

  say(`forget: the ids of the passkeys made here kept, so Start then made none: "You already have a Forest passkey. Sign in with it.", the sign in under way at once, the board back with one face; the app's storage cleared, then Sign in with the same passkey: one face, the board back from the vault, the fingerprint kept; the inbox opened with one face; ${new URL(OTHER).host} refused app.forest.foundation's passkeys (SecurityError)`)
})

test('a setup that stopped after its note, on a device since lost: Sign in goes on to its face check; no credits, then finished', async () => {
  const third = await phone()
  const p = third.page
  const gift = 'Your welcome credits were already given once; write to us to get more.'
  await p.goto(APP)
  await p.getByRole('button', { name: 'Start', exact: true }).click()
  await p.getByRole('button', { name: 'Open with your face' }).click()
  await p.getByRole('heading', { name: 'One face check' }).waitFor()
  // Stopped at the vault, after the note and the gift's tickets.
  const stop = w.host.refuse(1)
  let tab = third.context.waitForEvent('page')
  await p.getByRole('button', { name: 'Start', exact: true }).click()
  await tab
  await p.locator('.error').waitFor({ timeout: 60_000 })
  stop()

  // Another device: nothing of this one kept. Sign in finds no vault for the passkey, every host answering, and goes on to its face check.
  await p.evaluate(() => localStorage.clear())
  await p.reload()
  const made = third.counts.created
  await p.getByRole('button', { name: 'Sign in' }).click()
  await p.getByRole('heading', { name: 'One face check' }).waitFor()
  assert.equal(third.counts.created - made, 0, 'the passkey signed in with, no new one')
  const folder: string = JSON.parse((await p.evaluate(() => localStorage.getItem('forest.fingerprint')))!)

  // The check again: new buys, so the issuer says the gift was given; no credits, and the vault's folder holds none.
  tab = third.context.waitForEvent('page')
  await p.getByRole('button', { name: 'Start', exact: true }).click()
  await tab
  await p.getByText(gift).waitFor({ timeout: 60_000 })
  assert.equal('forest.setup' in (await kept(p)).local, true, 'setup waits, nothing lost')
  if (shots) await p.screenshot({ path: `${shots}/27-gift-given-waiting-light.png` })

  // A credit put into the vault's folder, its address the fingerprint: Try again finishes setup, with no new check.
  w.host.balances.set(folder, 1)
  const sessions = w.issuer.sessions.size
  await p.getByRole('button', { name: 'Try again' }).click()
  await p.getByRole('button', { name: 'Continue' }).waitFor({ timeout: 60_000 })
  await p.getByText(gift).waitFor()
  assert.equal(w.issuer.sessions.size, sessions, 'the note kept, no check again')
  if (shots) await p.screenshot({ path: `${shots}/28-gift-given-done-light.png` })
  await p.getByRole('button', { name: 'Continue' }).click()
  await p.getByRole('button', { name: 'New profile' }).waitFor()
  const vault = (await openVault([w.settings.host], await vaultKeys(await seedOn(p))))!.vault
  assert.equal(vault.issuerNotes?.length, 1)
  assert.deepEqual(creditsOf(vault), [], 'no credits')
  await third.context.close()
  say(`a setup stopped after its note, its device lost: Sign in went on to its face check with the same passkey; the gift given, so no credits, setup waiting with "${gift}"; finished once the vault's folder held a credit, the vault written with the note and no credits`)
})

test('a face the issuer has from another setup: the passkey made dropped, and Start says to sign in', async () => {
  const fourth = await phone()
  const p = fourth.page
  await p.goto(APP)
  await p.getByRole('button', { name: 'Start', exact: true }).click()
  await p.getByRole('button', { name: 'Open with your face' }).click()
  await p.getByRole('heading', { name: 'One face check' }).waitFor()
  w.issuer.faceSeen(true)
  const tab = fourth.context.waitForEvent('page')
  await p.getByRole('button', { name: 'Start', exact: true }).click()
  await tab
  await p.getByText('This face already has a setup. Sign in with that passkey.').waitFor({ timeout: 60_000 })
  w.issuer.faceSeen(false)
  assert.equal(await p.getByRole('button', { name: 'Sign in' }).count(), 1, 'on Start, with Sign in')
  assert.deepEqual(Object.keys((await kept(p)).local).sort(), ['forest.passkeys', 'forest.settings'], "the setup and its fingerprint gone; the ids of the passkeys made here kept")
  const left = ((await fourth.cdp.session.send('WebAuthn.getCredentials', { authenticatorId: fourth.cdp.authenticatorId })) as { credentials: unknown[] }).credentials.length
  assert.equal(left, 0, 'the passkey this setup made, dropped')
  if (shots) await p.screenshot({ path: `${shots}/29-duplicate-face-light.png` })
  await fourth.context.close()
  say('a face the issuer has from another setup: "This face already has a setup. Sign in with that passkey." on Start, the setup gone, and the passkey it made dropped from the authenticator')
})

test('no PRF: Start says so, and nothing is kept', async () => {
  // A passkey saved where no PRF secret can be had, as it is made or at the get after: refused, and offered to be dropped.
  const none = await phone({ prf: false })
  await none.page.goto(APP)
  await none.page.getByRole('button', { name: 'Start', exact: true }).click()
  await none.page.getByRole('button', { name: 'Open with your face' }).click()
  const said = "This password manager can't open Forest. Save it in another password manager instead."
  await none.page.getByText(said).waitFor()
  assert.deepEqual([none.counts.created, none.counts.asserted], [1, 1], 'one passkey made, and one get after it, which gave no secret either')
  assert.equal(await none.page.getByRole('button', { name: 'Sign in' }).count(), 1, 'back on Start, to try again in another manager')
  assert.deepEqual(Object.keys((await kept(none.page)).local), ['forest.settings'], 'nothing kept')
  if (shots) await none.page.screenshot({ path: `${shots}/25-no-prf-light.png` })
  const left = ((await none.cdp.session.send('WebAuthn.getCredentials', { authenticatorId: none.cdp.authenticatorId })) as { credentials: unknown[] }).credentials.length
  await none.context.close()

  // A browser that says it cannot ask for PRF at all: no way on from here, so no buttons.
  const old = await phone({ prf: false, browserPrf: false })
  await old.page.goto(APP)
  await old.page.getByText("This browser can't open Forest: it can't ask a passkey for the secret Forest opens with. Open Forest on a newer device.").waitFor()
  assert.equal(await old.page.getByRole('button').count(), 0, 'and stops')
  assert.equal(old.counts.created, 0, 'no passkey made')
  if (shots) await old.page.screenshot({ path: `${shots}/26-no-prf-browser-light.png` })
  await old.context.close()
  say(`no PRF: the passkey saved where none can be had refused after the get that follows, Start says "${said}" (Passwords in its place on an Apple device), nothing kept (the drop signal ${left === 0 ? 'took the passkey off the virtual authenticator' : `left ${left} passkey on the virtual authenticator`}); a browser without PRF: Start says so, with no buttons`)
})

test('Start twice on one device: back from each step; the second Start refused the first passkey, into Sign in, which takes its setup up; one passkey', async () => {
  const p = await phone()
  const b = p.page
  const held = async () => ((await p.cdp.session.send('WebAuthn.getCredentials', { authenticatorId: p.cdp.authenticatorId })) as { credentials: unknown[] }).credentials.length
  await b.goto(APP)

  // Back from the first step: Start, nothing made.
  await b.getByRole('button', { name: 'Start', exact: true }).click()
  await b.getByRole('heading', { name: 'Your passkey' }).waitFor()
  await b.getByRole('button', { name: 'Back' }).click()
  await b.getByRole('button', { name: 'Sign in' }).waitFor()
  assert.equal(p.counts.created, 0)

  // The first Start: the passkey made, then back from the face check to Start, the setup kept; Start holds no Forget.
  await b.getByRole('button', { name: 'Start', exact: true }).click()
  await b.getByRole('button', { name: 'Open with your face' }).click()
  await b.getByRole('heading', { name: 'One face check' }).waitFor()
  if (shots) await b.screenshot({ path: `${shots}/31-face-check-back-light.png` })
  await b.getByRole('button', { name: 'Back' }).click()
  await b.getByRole('button', { name: 'Sign in' }).waitFor()
  assert.equal('forest.setup' in (await kept(b)).local, true, 'setup kept')
  assert.equal(await b.getByRole('button', { name: 'Forget this device' }).count(), 0, 'no Forget on Start')
  if (shots) await b.screenshot({ path: `${shots}/32-start-under-way-light.png` })

  // The second Start: it makes a passkey, never asks for one; the manager holds the first, so none is
  // made, and Sign in follows at once: one face, the first passkey's, and its setup at the face check.
  const faces = p.counts.asserted
  await b.getByRole('button', { name: 'Start', exact: true }).click()
  await b.getByRole('button', { name: 'Open with your face' }).click()
  await b.getByRole('heading', { name: 'One face check' }).waitFor()
  assert.equal(p.counts.created, 1, 'one passkey made')
  assert.equal(p.counts.asserted - faces, 1, 'one face')
  assert.equal(await held(), 1)

  // Back on Start, it says why it signed in, and asks no more.
  await b.goBack()
  await b.getByText('You already have a Forest passkey. Sign in with it.').waitFor()
  await b.waitForTimeout(500)
  assert.equal(p.counts.asserted - faces, 1, 'no second sheet')
  if (shots) await b.screenshot({ path: `${shots}/30-has-passkey-light.png` })

  // Sign in again takes the setup up; the check; the board. One passkey.
  await b.getByRole('button', { name: 'Sign in' }).click()
  await b.getByRole('heading', { name: 'One face check' }).waitFor()
  const tab = p.context.waitForEvent('page')
  await b.getByRole('button', { name: 'Start', exact: true }).click()
  await tab
  await b.getByRole('button', { name: 'New profile' }).waitFor({ timeout: 60_000 })
  assert.equal(p.counts.created, 1)
  assert.equal(await held(), 1, 'one passkey')
  await p.context.close()
  say('Start twice on one device: back from each step to Start, which holds no Forget; the second Start, refused the passkey the first made, went straight into Sign in: one face, that setup taken up at its face check, none made, no second sheet when Start showed again; the check, the board; one passkey at the end')
})

test('a deploy while setup is open: Start reloads once onto the new version, back on the face check, and the check opens; never a blank tab', async () => {
  const deploy = await serveLikeVercel({ root: outDir, port: deployPort, override: { 'Content-Security-Policy': csp } })
  const p = await phone()
  const b = p.page
  const tabs: Page[] = []
  p.context.on('page', (t) => void tabs.push(t))
  const entry = () => b.evaluate(() => document.querySelector<HTMLScriptElement>('script[type=module]')!.src)
  const flowA = `/assets/${readdirSync(`${outDir}/assets`).find((f) => /^setup-[\w-]+\.js$/.test(f))}`

  // Build A, its service worker in control; setup opened.
  await b.goto(DEPLOY)
  await b.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 30_000 })
  const a = await entry()
  await b.getByRole('button', { name: 'Start', exact: true }).click()
  await b.getByRole('button', { name: 'Open with your face' }).click()
  await b.getByRole('heading', { name: 'One face check' }).waitFor()

  // Build B in its place, every chunk named anew. The service worker finds it and takes over, A's files gone with the old one.
  deploy.root = nextDir
  await b.evaluate(async () => {
    const took = new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }))
    await (await navigator.serviceWorker.getRegistration())!.update()
    await took
  })
  // Asked for through the new service worker, which serves it from no cache of its own: the server's 404, not index.html.
  const gone = await b.evaluate(async (url) => {
    const res = await fetch(url)
    return { status: res.status, type: res.headers.get('content-type') }
  }, flowA)
  assert.deepEqual(gone, { status: 404, type: 'text/plain; charset=utf-8' }, "A's setup flow: a 404, not index.html")

  // Start: the check's tab opens on the tap; A's flow cannot be loaded; the tab closes and the page reloads once, onto B, back on the face check.
  const loaded = b.waitForEvent('load')
  await b.getByRole('button', { name: 'Start', exact: true }).click()
  await loaded
  await b.getByRole('heading', { name: 'One face check' }).waitFor()
  const now = await entry()
  assert.notEqual(now, a)
  assert.match(now, /-next-/, 'the new version')
  assert.equal(await b.evaluate(() => sessionStorage.getItem('forest.reloaded')), a, 'reloaded once, from A')
  assert.equal(tabs.length, 1, "the check's tab opened on the tap")
  assert.equal(tabs[0]!.isClosed(), true, 'and closed, not left blank')
  if (shots) await b.screenshot({ path: `${shots}/33-after-deploy-light.png` })

  // Start again: one face, the seed held from it, and the check's tab, which goes to the check.
  const sessions = w.issuer.sessions.size
  const faces = p.counts.asserted
  const tab = p.context.waitForEvent('page')
  await b.getByRole('button', { name: 'Start', exact: true }).click()
  const check = await tab
  await b.getByRole('button', { name: 'New profile' }).waitFor({ timeout: 60_000 })
  assert.equal(p.counts.asserted - faces, 1, 'one face')
  assert.equal(w.issuer.sessions.size, sessions + 1, 'the check opened')
  assert.equal([...w.issuer.sessions.values()].at(-1), `${DEPLOY}back`, 'and sent the person back to the app')
  assert.ok(tabs.every((t) => t.isClosed() || t.url() !== 'about:blank'), 'no blank tab')
  assert.equal(p.counts.created, 1, 'one passkey')
  say(`deploy while setup was open: build B (every chunk renamed) in place of A, its service worker in control and A's files gone; A's setup flow a 404 (${gone.type}), not index.html; Start: the tab closed, the page reloaded once onto B on the face check; Start again: one face, the check opened (its tab closed itself: ${check.isClosed()}), setup done; no blank tab`)
  await p.context.close()
  await deploy.close()
})

test('the CSP: nothing the app did, through all of it, was refused', () => {
  assert.deepEqual(refused, [])
  say('CSP: nothing refused through the whole flow, the proof in its worker included')
})
