// The app's screens in headless Chromium, through Playwright, with a virtual passkey authenticator
// that has PRF, against one of each stand-in on loopback (test/stand-ins.ts, `world`): the app's own
// build, its settings pointed at the stand-ins.
//
//   npm run test:browser
//
// 1. Setup: the words, saved and checked; the face check in a tab of its own (the stand-in's Didit
//    page sends it back to /back); the gift collected, the vault written, the seed locked.
// 2. A new profile, made with one face: the proof in the worker, the row, the folder, the vault.
// 3. The board and the card page: offers, the score and the reviews about it from the index, an
//    access key removed with one face, the inbox counted at the face.
// 4. The menu: the 24 words after a face; forgetting the device; the words bring everything back.
//
// SHOTS=<dir> keeps a screenshot of each screen there, in light and dark.

import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { type Browser, type BrowserContext, type Page, chromium } from 'playwright'
import { type PreviewServer, build, preview } from 'vite'

import { importWords, mainKey } from '../../standard/keys/src/index.ts'
import { deliver, keyFromPrivate, ownerRecord, permissionsRecord, readProfile } from '../../standard/records/src/index.ts'
import { message } from '../../standard/records/src/private.ts'
import { publishRecords } from '../../src/services/host.ts'
import { openVault, vaultKeys } from '../../src/vault.ts'
import { world } from '../stand-ins.ts'

const app = fileURLToPath(new URL('../..', import.meta.url))
const outDir = fileURLToPath(new URL('app-dist', import.meta.url))
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
let server: PreviewServer
let w: Awaited<ReturnType<typeof world>>
let context: BrowserContext
let page: Page
let created = 0
let asserted = 0
let words: string
let address: string

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

before(async () => {
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir, emptyOutDir: true } })
  server = await preview({ root: app, configFile: `${app}vite.config.ts`, build: { outDir }, preview: { host: 'localhost', port: await freePort(), strictPort: true } })
  w = await world()
  browser = await chromium.launch()
  context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  // The app's settings, pointed at the stand-ins, on every page it loads.
  await context.addInitScript((s) => localStorage.setItem('forest.settings', JSON.stringify(s)), w.settings)
  page = await context.newPage()
  page.on('pageerror', (err) => console.log(`  page error: ${err.message}`))
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable', { enableUI: false })
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, hasPrf: true, automaticPresenceSimulation: true },
  })
  cdp.on('WebAuthn.credentialAdded', () => void created++)
  cdp.on('WebAuthn.credentialAsserted', () => void asserted++)
  say(`Chromium ${browser.version()}, the app at ${server.resolvedUrls!.local[0]}`)
})

after(async () => {
  await browser?.close()
  await server?.close()
  await w?.close()
  console.log('\nApp report:\n' + report.map((l) => `- ${l}`).join('\n'))
})

test('setup: the words saved and checked, the face check in its own tab, the seed locked', async () => {
  await page.goto(server.resolvedUrls!.local[0]!)
  await page.getByText('One human, one record, any market, no one in between.').waitFor()
  await shot('1-start')
  await page.getByRole('button', { name: 'Start', exact: true }).click()

  await page.getByRole('heading', { name: 'Your 24 words' }).waitFor()
  words = (await page.locator('ol.words li span:last-child').allTextContents()).join(' ')
  assert.equal(words.split(' ').length, 24)
  const form = await page.locator('form').evaluate((f) => [...new FormData(f as HTMLFormElement)].map(([k, v]) => [k, v]))
  assert.deepEqual(form, [['username', 'Forest'], ['password', words]], 'the form the password manager saves: username Forest, the words as the password')
  await shot('2-words')
  await page.getByRole('button', { name: 'Save to password manager' }).click()

  await page.getByRole('heading', { name: "Check they're saved" }).waitFor()
  const next = page.getByRole('button', { name: 'Next' })
  assert.equal(await next.isDisabled(), true)
  await page.getByLabel('Your 24 words').fill(words.split(' ').slice(0, 23).join(' ') + ' zoo')
  assert.equal(await next.isDisabled(), true, 'Next waits for the words themselves')
  await page.getByLabel('Your 24 words').fill(words.toUpperCase())
  await shot('3-check')
  await next.click()

  await page.getByRole('heading', { name: 'One face check' }).waitFor()
  await shot('4-face')
  const tab = context.waitForEvent('page')
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  const didit = await tab
  await page.getByRole('button', { name: 'New profile' }).waitFor({ timeout: 60_000 })
  await shot('5-board-empty')
  say(`setup: the check's tab went to the stand-in's Didit page and back to /back, closed itself: ${didit.isClosed()}`)
  assert.equal(created, 1, 'one passkey made, to lock the seed')
  assert.deepEqual(await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name)), ['forest-app'])

  const seed = importWords(words)
  const vault = (await openVault([w.settings.host], await vaultKeys(seed)))!.vault
  assert.equal(vault.issuerNotes?.[0]?.issuer, 'issuer.test')
  assert.deepEqual(vault.settings, { forestApp: w.settings })
  assert.equal(vault.credits?.length, 4, 'the gift: 2 registrations and 3 host credits, one spent into the vault folder')
  say('setup: vault on the host with the note, 4 credits and the settings; seed locked under a passkey')
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
  const faces = asserted
  const started = Date.now()
  await page.getByRole('button', { name: 'Make' }).click()
  await card('Tutoring').waitFor({ timeout: 120_000 })
  say(`new profile: made in ${Date.now() - started} ms, proof in the worker included`)
  assert.equal(asserted - faces, 1, 'one face for the whole of it')

  address = (await mainKey(importWords(words), LABEL)).address
  const view = await readProfile([w.settings.host], address, Date.now())
  assert.deepEqual(Object.keys(view.current.get('profile')!.record.body!).sort(), ['createdAt', 'inbox', 'inboxKey', 'market', 'role'], 'a card without a name')
  assert.equal(w.registryPayer.sent.length, 1, 'one row through the registry payer')
  assert.equal(await card('Tutoring').getByText('Teacher').count(), 1, "the market's word for the side")
  const local = await page.evaluate(() => localStorage.getItem('forest.profiles'))
  assert.deepEqual(JSON.parse(local!), [{ label: LABEL, address, hosts: [w.settings.host] }])
})

test('the board and the card: offers, the score and reviews from the index, an access key removed, the inbox counted', async () => {
  const main = await mainKey(importWords(words), LABEL)
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
  await page.getByText('2 reviews').waitFor()
  assert.equal(await page.locator('.dot').count(), 1, 'the bell shows new reviews')
  await page.getByText('On time, clear.').waitFor()
  await shot('9-card')
  await page.getByRole('button', { name: 'Reviews about this profile' }).click()
  await page.getByText('Patient and clear.').waitFor()
  await shot('10-reviews')
  await page.locator('.sheet-back').click({ position: { x: 20, y: 20 } })
  assert.equal(await page.locator('.dot').count(), 0, 'seen')

  const faces = asserted
  await page.getByRole('button', { name: 'Remove' }).click()
  await page.locator('button.remove').waitFor({ state: 'detached' })
  assert.equal(asserted - faces, 1)
  assert.deepEqual((await readProfile([w.settings.host], address, Date.now())).access, [{ key: writer.address, was: 'write', paths: ['offer', 'review'] }])
  say('card: offers and the reviews written from the host; score, review count and the bell from the index; an access key made past with one face')

  // A message from someone with a row; the next face counts it.
  const buyer = await mainKey(new Uint8Array(32).fill(7), 'tutoring/buyer')
  w.host.rows.add(buyer.address)
  const theCard = (await readProfile([w.settings.host], address, Date.now())).current.get('profile')!.record.body!
  const [taken] = await deliver([w.settings.host], [await message(buyer, address, { text: 'Is Tuesday free?' }, Date.now(), theCard)])
  assert.equal(taken!.results[0]!.ok, true)
  await page.getByRole('button', { name: 'Back' }).click()
  await page.getByRole('button', { name: 'Menu' }).click()
  await shot('11-menu')
  await page.getByRole('button', { name: 'Your 24 words' }).click()
  await page.locator('.sheet ol.words').waitFor()
  assert.equal((await page.locator('.sheet ol.words li span:last-child').allTextContents()).join(' '), words)
  await shot('12-menu-words')
  await page.locator('.sheet-back').click({ position: { x: 20, y: 20 } })
  await card('Tutoring').locator('.badge', { hasText: '1' }).waitFor()
  say('inbox: the message counted by the pull signed at the last face, shown on the card')
})

test('the menu: appearance; forget this device; the words bring everything back', async () => {
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('radio', { name: 'Dark' }).click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(18, 26, 21)')
  await page.getByRole('radio', { name: 'Device' }).click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), undefined)

  await page.getByRole('button', { name: 'Forget this device' }).click()
  await page.getByRole('button', { name: 'Forget this device' }).click()
  await page.getByRole('button', { name: 'I have my 24 words' }).waitFor()
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), [])
  assert.deepEqual(await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name)), [])

  await page.reload()
  await page.getByRole('button', { name: 'I have my 24 words' }).click()
  await page.getByLabel('Your 24 words').fill(words)
  await shot('13-restore')
  const made = created
  await page.getByRole('button', { name: 'Restore' }).click()
  await card('Tutoring').waitFor({ timeout: 30_000 })
  assert.equal(created - made, 1, 'locked again under a new passkey')
  await card('Tutoring').getByText('Maths, one hour').waitFor()
  say('forget, then restore: the board back from the vault, the seed locked again')
})
