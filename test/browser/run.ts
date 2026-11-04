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
//     claims neither none nor one; Create a passkey made it for app.forest.foundation; then New to
//     Forest?, its back and two answers, I already use Forest with the unlock icon, and Yes, I'm new
//     opening Get verified, nothing asked. Here and on every screen below with a filled button, its
//     icon takes its text color.
//  2. Back on each setup step: Get verified, back and Continue alone, to New to Forest?, then to
//     Start, which now asks for the passkey made alone, never Create, and comes back to New to
//     Forest?; the ID check (its price and tries, what it keeps tapped open) to Get verified, even
//     after "Payment isn't available right now."; the face check's wait to Get verified; with a
//     check under way, Get verified's back to Start, and Start straight back to the check.
//  3. Get verified: Face picked again, Continue; the face check in a tab of its own, opened on the
//     tap, which Didit's page sends back to /back, where it closes itself; the page hidden meanwhile,
//     as the check's tab hides it, which keeps the seed: the stamp kept with nothing asked; the gift
//     collected into the wallet; the stamp kept in the Profiles folder; nothing of the seed kept;
//     then Your first profile.
//  4. The first profile, in two steps: back to Profiles and in again; a search over the markets, a
//     market, its roles, back to the markets; one pick, nothing asked, the seed held since the last
//     unlock, the verification proven in the worker; Add a second passkey, its one line, Add
//     opening Add a passkey (its line, Create a passkey with the unlock icon though the seed is
//     held), back, and Not now; Use Forest from your AI, whose Connect opens
//     Connect an AI: three steps (sign in now), no links, Copy copying the connector's address; its
//     profile entry on the host, its verification checking as any reader checks it; the face check's
//     shield, an outline, which, tapped on a card, says "Verified by face" and opens nothing; its
//     name, Tutoring tutor, the market in bold and the role muted, as on every name below; under it,
//     one line, its reviews; at its top right, Share and the inbox, its own icon and no number while
//     nothing is new, as at the top of Profiles: Share copies its page on the
//     index where there is no share sheet, and hands the sheet that page where there is; a market's
//     roles show a + or, made, Yours, quietly, which opens its profile, and no row anywhere shows the
//     unlock icon.
//  5. Settings: Face with its shield, ID with + $5, the appearance; no About.
//  6. Two people: the first, whose phone allows its location, posts an offer from their profile,
//     its price per hour, which its row shows second, its form the market's: no place until sessions
//     are In person, then the place right after, filled in with no button, "Within 5 km of you", the
//     slider moved to 10 and an area named, gone again with In person; a contact, which no market
//     lists; asking nothing, the seed still held, so Post shows no unlock icon; the second
//     opens its link with nothing set up, goes through Start, New to Forest? and the face check,
//     makes the profile on the other side from the compose screen's From, and messages, nothing
//     asked after Start; the first sees it counted with nothing unlocked, on the card and the inbox
//     at the top of Profiles, of the profile and of Notifications, never on the bell, Notifications
//     holding no message and the profile no Messages line; the page closed and opened again, the
//     inbox opens every profile's conversations: "1 new message" and Open with its unlock icon, and
//     New message at the bottom; every inbox opens in one unlock, who it is from with the shield;
//     the reply in one row, the text box and a round Send with its own icon, each message with its
//     time and the day above them; Notifications then says "Nothing yet.", its inbox no number; the
//     second, their page closed and opened again, reads the reply beside what they sent, and reviews
//     the tutor from the thread, the slider's thumb hidden until touched, naming the offer.
//  7. A second browser, with the same passkey, answered from the first, as a phone answers through
//     the passkey sheet's QR code, from another device: I already have one, then Save a passkey on
//     this device?, Save with the unlock icon, and Not now; it finds the profile and the stamp; it
//     makes a profile of its own, nothing asked again; the first, with nothing unlocked, shows New
//     profiles from another device, which, the page closed and opened again, one unlock reads.
//     Then a message from one of the person's profiles to another of theirs: To their tutor, From
//     their student; the seed held, the messages open by themselves, no Open, and it is sent, arrives
//     and opens by itself, new, with nothing asked.
//  8. One passkey per person: after Forget, Start finds the passkey and asks nothing more; with the
//     sheet closed, "No passkey chosen." and Try again, and never Create a passkey.
//     Then passkeys, every one alike, with two virtual authenticators: Settings' Passkeys says "Your
//     first passkey" and the quiet line, with no dot on + Add a passkey or the Settings tab, and no
//     "backup" anywhere; the phone's own manager, which keeps the first passkey the new one excludes,
//     refuses, in one red line; a security key, a second virtual authenticator, makes one: its row
//     by the day it was added, no line; a browser holding only that one, answered through the QR
//     code, Not now, opens the same profiles; Remove, tapped twice, the line back, and that browser's
//     next unlock, its page closed and opened again, says "This passkey no longer opens your
//     profiles."; after Forget, its Start opens its own seed, so New to Forest?, whose I already use
//     Forest refuses the same passkey, then adds this one to the first, straight to the profiles.
//     Then a browser signed in through the QR code saves a passkey: Save makes one there, added to
//     the first, the one in use there, so its next unlock asks it and not the phone; the first lists
//     three passkeys, and removes that one again.
//  9. Clothing, with the index: the first, the page closed and opened again so Post shows its unlock
//     icon, a moment hidden keeping it so, posts a coat with two photos in one unlock, redrawn on the device as JPEGs no longer
//     than 1600 pixels, their notes gone, no per to pick; for women, then a coat, and only then one
//     size question, right after them, its values by their labels (XL); picked up and shipped, a
//     choice of several; its location the offer's kept point, moved a little from the phone's, within
//     3 km of Lavapiés; its row's price reading $40, as on the buyer's pick of it in their review;
//     the index lists it. A buyer, whose phone hasn't allowed its location: told no before, a
//     request's place is one line saying why it needs it; never asked, Use my location, and the
//     prompt refused, that line; their page closed and opened again, their profile's messages say
//     "No new messages" with Open; they write with New message (their own address taken, From the
//     other side; the seller's page on the index taken as the seller's address) and reviews the coat
//     from the thread, then, from their profile's Review, vouches ("That's this profile." once) and
//     reports, and Given lists all three; the seller sees the rating and the dot on the card, "3
//     new" on the profile's rating line and 1 on its inbox, the bell counting the three and the
//     inbox the message; Reviews marks the three, and once seen there they are new no more, the
//     bell counting nothing; the review opened; Notifications lists all that came, newest first, in
//     full, with no dot and no message, and its inbox opens the messages, which hold no review.
//     Then a post an older market shaped, written to the host as the app wrote it before: its row
//     says Update this post; opened, what still fits is filled in; posted, it fits, and the line goes.
//     Then, for testing, a review of one of the person's own profiles, from their student about
//     their tutor: Notifications shows it first, new, and once shown it is seen, the bell counting
//     it no more.
//     Then the AI apps, with services' own mcp and an AI app as services' tests make one (the MCP
//     SDK's client, mcp/test/setup.ts):
//  a. its login comes to the connect page: the AI app's name, its redirect's host, the profiles
//     unticked, each with its shield; one ticked, Connect, one unlock; the AI app gets its token,
//     reads its profile and writes a post, which shows on the profile; the device keeps the AI app,
//     never a key;
//     Then a whole visit asks exactly once: from a page just opened, post, edit, open messages (by
//     themselves), message, review from the thread, the note arriving and opening by itself, an AI
//     app's profile ticked and unticked, and the post deleted, the page hidden between each;
//  b. Settings' AI apps, between Passkeys and Appearance: the AI app, its day, its one profile, kept
//     ticked while it is the last; another ticked, one unlock, then one unticked and ticked again
//     with nothing asked, the AI's profiles following with no new login; Disconnect, nothing asked:
//     the AI's next call refused, and its post stays;
//  c. a new phone, nothing set up, at a connect page: I already have one first, then Create a
//     passkey; New to Forest?, the face check and the first profile, then back to the connect page,
//     its one profile ticked, no Add a second passkey nor Use Forest from your AI; Connect, nothing
//     asked after Start;
//  d. a connector that isn't ours: one line, nothing else; a request that ran out: one line.
// 10. Held for review: Being reviewed, the app asking all the while; the page hidden meanwhile,
//     which keeps the seed; approved, Continue, nothing asked. Then the same, with the page's clock
//     run 5 minutes past the last action: Continue asks once.
// 11. A manager that gives no PRF secret: its passkey dropped, the line naming another. A browser
//     that cannot ask for PRF: one quiet line.
// 12. The passkey belongs to app.forest.foundation: another page under forest.foundation is refused.
// 13. The build: its manifest, its service worker in control, installable.
// 14. A deploy while the app is open: back in view, the page says nothing while its version is the
//     one live, then "A new version is ready." with Reload, above the screen; the next version takes
//     over and the old proof worker is gone; the page reloads once, back on a market's roles, and the
//     profile is made.
// 15. The ID check, from Settings: the verifier's consent screen word for word, tapped open; paid
//     through the verifier's own stand-in for Stripe (its test card named first), the payment kept
//     on the device through Stripe's page; the check in its own tab; one unlock; both verifications
//     on every profile, and the ID check's filled shield on every card, the profile's title, To and
//     From, Settings' ID row (tapped: "Verified with ID") and the connect page's ticks.
// 16. The seed held 5 minutes after the last action, on the page's clock: then Send shows its unlock
//     icon again.
// 17. A declined check: one red line, and Start again opens a new check that passes.
// 18. Nothing the app did, through all of it, was refused by the CSP.
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

import { type Browser, type BrowserContext, type CDPSession, type Locator, type Page, chromium } from 'playwright'
import { build } from 'vite'

import { b64u, entry, liveContent, nextTime, proofsOf, readFolder, verificationCheck, write } from '../../standard/folders/dist/index.js'
import { isLocked, openLocked } from '../../standard/folders/dist/locked.js'
import { mainKey, openingHalf } from '../../standard/keys/dist/index.js'
import { checkVerification, stampFromJson } from '../../standard/proofs/dist/index.js'
import { loadMarkets } from '../../markets/build/dist/index.js'
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

/** Where a phone that allows its location is: Madrid's Puerta del Sol. */
const SPOT = { latitude: 40.41678, longitude: -3.70379 }

/** The distance between a place's point and SPOT, in kilometres. */
function kmFromSpot(p: { lat: string; lon: string }): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const h = Math.sin(rad(Number(p.lat) - SPOT.latitude) / 2) ** 2 + Math.cos(rad(SPOT.latitude)) * Math.cos(rad(Number(p.lat))) * Math.sin(rad(Number(p.lon) - SPOT.longitude) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/**
 * A browser of its own, a phone's size, with a virtual passkey authenticator on the device (face
 * or fingerprint checked), with PRF unless `prf` is false; its passkeys made and asserted, counted;
 * at SPOT, its location allowed, when `located`, and otherwise never allowed.
 * What the CSP refuses on any of its pages is reported.
 */
async function phone({ prf = true, located = false }: { prf?: boolean; located?: boolean } = {}): Promise<Phone> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'en-US',
    permissions: ['clipboard-read', 'clipboard-write', ...(located ? ['geolocation'] : [])],
    ...(located && { geolocation: SPOT }),
  })
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
/** The shield a verified profile shows, by its strongest check: an outline for the face check, filled for the ID check; an icon, whose words show only when tapped. */
const shield = (within: { getByRole: Page['getByRole'] }, check: 'face' | 'id' = 'face') => within.getByRole('img', { name: check === 'id' ? 'Verified with ID' : 'Verified by face', exact: true })

/** Whether a shield is drawn filled, as the ID check's is, or as an outline, as the face check's. */
const filled = (badge: Locator) => badge.evaluate((b) => b.querySelector('path')!.getAttribute('fill') !== 'none')

/**
 * The page hidden a moment and shown again, as when the person goes to another app or tab, or locks
 * the phone, and comes back: its visibility and the event, as the page sees them. Headless Chromium
 * never hides a page, so the test tells it.
 */
async function away(page: Page) {
  await page.evaluate(() => {
    for (const state of ['hidden', 'visible']) {
      Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    }
    delete (document as { visibilityState?: string }).visibilityState
  })
}

/** Whether `b` shows the unlock icon: it does only when a tap on it will ask the passkey. */
const asks = async (b: Locator) => (await b.locator('.unlock').count()) === 1

/** The inbox at the top right of the screen: the way into messages, its number only when some are new. */
const inbox = (page: Page) => page.locator('.top-right').getByRole('button', { name: /^Messages/ })

/** A profile's messages, from its card on Profiles (tapped on its name: a tap on its shield only says its words) and the inbox at its top. */
async function messagesOf(page: Page, card: string) {
  await page.locator('button.card', { hasText: card }).locator('.named').click()
  await inbox(page).click()
  await page.getByRole('heading', { name: card }).waitFor()
}

/** The page closed and opened again, on the same screen: what drops the seed now, besides 5 minutes with nothing done. */
async function closed(page: Page) {
  await page.reload()
  await page.locator('main').waitFor()
}

/** Notifications opened again and again, so it reads the index each time, until a row says `text`. */
async function untilNotice(page: Page, text: string) {
  const until = Date.now() + 90_000
  for (;;) {
    await button(page, 'Settings').click()
    await button(page, /Notifications$/).click()
    const row = page.locator('main .rows button.row', { hasText: text })
    try {
      await row.waitFor({ timeout: 5_000 })
      return row
    } catch {
      if (Date.now() > until) throw new Error(`Notifications never said ${text}`)
    }
  }
}
const balance = async (folder: string) => ((await (await fetch(`${services.host}/credits/balance/${folder}`)).json()) as { credits: number }).credits
const button = (page: Page, name: string | RegExp) => page.getByRole('button', { name, exact: typeof name === 'string' })

/** A profile's name as it shows in `within`: its market in bold, then its role in the muted tone, no symbol between. */
async function named(within: Locator, words: string) {
  const name = within.locator('.named', { hasText: words }).first()
  await name.waitFor()
  const seen = await name.evaluate((el) => {
    const muted = document.createElement('span')
    muted.style.color = 'var(--ink-2)'
    el.append(muted)
    const ink2 = getComputedStyle(muted).color
    muted.remove()
    const [market, role] = [el.querySelector('strong')!, el.querySelector('.role')!]
    return { text: el.textContent, market: [market.textContent, getComputedStyle(market).fontWeight], role: [role.textContent, getComputedStyle(role).fontWeight, getComputedStyle(role).color === ink2] }
  })
  const [market, role] = [words.slice(0, words.lastIndexOf(' ')), words.slice(words.lastIndexOf(' ') + 1)]
  assert.deepEqual(seen, { text: words, market: [market, '700'], role: [role, '400', true] }, `${words}: the market in bold, the role muted, nothing between`)
}

/** The muted tone, ink-2, as the page draws it now. */
const muted = (page: Page) =>
  page.evaluate(() => {
    const span = document.body.appendChild(document.createElement('span'))
    span.style.color = 'var(--ink-2)'
    const color = getComputedStyle(span).color
    span.remove()
    return color
  })

/** Every icon on a filled button on the page, in its button's text color; how many there were. */
async function iconsInTheirButtonsColor(page: Page): Promise<number> {
  const icons = await page.evaluate(() =>
    [...document.querySelectorAll('button.primary .icon, button.solid .icon')].map((icon) => ({ on: icon.closest('button')!.textContent || icon.closest('button')!.getAttribute('aria-label'), same: getComputedStyle(icon).color === getComputedStyle(icon.closest('button')!).color })),
  )
  assert.deepEqual(icons.filter((i) => !i.same).map((i) => i.on), [], "every icon on a filled button in the button's text color")
  return icons.length
}

/** No list row on the page shows the unlock icon: on a row, an open padlock reads as locked. */
const noLockOnRows = async (page: Page) => assert.equal(await page.locator('button.row .unlock').count(), 0, 'no unlock icon on a list row')

/** The face check picked, then Continue, its tab opened on the tap and closed by Didit's page sending it back. */
async function faceCheck(p: Phone) {
  await p.page.getByRole('heading', { name: 'Get verified' }).waitFor()
  await p.page.getByRole('radio', { name: /^Face/ }).click()
  const tab = p.context.waitForEvent('page')
  await button(p.page, 'Continue').click()
  await (await tab).waitForEvent('close')
}

/** New to Forest?, right after Create a passkey: Yes, I'm new, on to Get verified. */
async function imNew(p: Phone) {
  await p.page.getByRole('heading', { name: 'New to Forest?' }).waitFor({ timeout: 60_000 })
  await button(p.page, "Yes, I'm new").click()
}

/** A new person in `p`'s browser through Start's Create a passkey, New to Forest?, and the face check. */
async function newPerson(p: Phone) {
  await p.page.goto(APP)
  await button(p.page, 'Create a passkey').click()
  await imNew(p)
  await faceCheck(p)
}

/** A role in words, as New profile shows it: Seller. */
const roleWords = (role: string) => role.charAt(0).toUpperCase() + role.slice(1)

/** A profile's name, "Clothing seller", as its market and its role. */
const split = (words: string) => [words.slice(0, words.lastIndexOf(' ')), words.slice(words.lastIndexOf(' ') + 1)] as [string, string]

/** One of the markets' roles picked on New profile: its market found by searching, then its role; one unlock, then its profile. */
async function pickProfile(page: Page, words: string) {
  const [market, role] = split(words)
  await page.getByLabel('Search').fill(market.toLowerCase())
  await button(page, market).click()
  await button(page, roleWords(role)).click()
  await page.getByRole('heading', { name: words }).waitFor({ timeout: 120_000 })
}

/** A first profile picked on Your first profile: its market found by searching, then its role; one unlock, then Add a second passkey. */
async function pickFirst(page: Page, words: string) {
  const [market, role] = split(words)
  await page.getByLabel('Search').fill(market.toLowerCase())
  await button(page, market).click()
  await button(page, roleWords(role)).click()
  await page.getByRole('heading', { name: 'Add a second passkey' }).waitFor({ timeout: 120_000 })
}

/**
 * `p`'s passkey sheet answered by `from`'s passkeys, as a phone answers through the sheet's QR
 * code: their PRF secret for the same salt, from another device (cross-platform). With `only`, the
 * one passkey it names answers, as the person picks it on that phone. A passkey `p`'s own
 * authenticator holds, once one is saved there, answers there.
 */
async function answerFrom(p: Phone, from: Phone, only?: () => string) {
  await p.context.exposeFunction('answerFromFirst', (wire: { rpId: string; allow: number[][]; first: number[] }) =>
    from.page.evaluate(
      async (w) => {
        try {
          const got = (await navigator.credentials.get({
            publicKey: { rpId: w.rpId, challenge: crypto.getRandomValues(new Uint8Array(32)), userVerification: 'required', ...(w.allow.length && { allowCredentials: w.allow.map((id) => ({ type: 'public-key' as const, id: new Uint8Array(id) })) }), extensions: { prf: { eval: { first: new Uint8Array(w.first) } } } },
          })) as PublicKeyCredential
          return { rawId: Array.from(new Uint8Array(got.rawId)), first: Array.from(new Uint8Array(got.getClientExtensionResults().prf!.results!.first as ArrayBuffer)) }
        } catch (err) {
          return { error: { name: (err as Error).name, message: (err as Error).message } }
        }
      },
      only ? { ...wire, allow: [[...Buffer.from(only(), 'base64url')]] } : wire,
    ),
  )
  await p.context.addInitScript(() => {
    const own = navigator.credentials.get.bind(navigator.credentials)
    const bytes = (b: BufferSource) => Array.from(b instanceof ArrayBuffer ? new Uint8Array(b) : new Uint8Array(b.buffer, b.byteOffset, b.byteLength))
    navigator.credentials.get = async (options?: CredentialRequestOptions) => {
      const pk = options?.publicKey
      if (!pk) return own(options)
      // A passkey named that this browser's own authenticator holds (one saved here) answers here;
      // one it doesn't hold, it says so at once, and the phone answers.
      if (pk.allowCredentials?.length) {
        try {
          return await own(options)
        } catch (err) {
          if ((err as Error).name !== 'NotAllowedError') throw err
        }
      }
      const got = await (globalThis as any).answerFromFirst({ rpId: pk.rpId, allow: (pk.allowCredentials ?? []).map((c) => bytes(c.id)), first: bytes(pk.extensions!.prf!.eval!.first) })
      if (got.error) throw new DOMException(got.error.message, got.error.name)
      const first = new Uint8Array(got.first).buffer
      // From another device, as a phone through the QR code answers: cross-platform.
      return { type: 'public-key', id: '', rawId: new Uint8Array(got.rawId).buffer, authenticatorAttachment: 'cross-platform', getClientExtensionResults: () => ({ prf: { results: { first } } }) } as unknown as Credential
    }
  })
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

/** A profile opened again and again from its card, so it reads the index each time, until its rating line says `text`. */
async function untilLine(page: Page, card: string, text: string) {
  const until = Date.now() + 90_000
  for (;;) {
    await page.locator('button.card', { hasText: card }).locator('.named').click()
    const line = page.locator('button.link').first()
    if (((await line.textContent({ timeout: 10_000 })) ?? '').includes(text)) return line
    if (Date.now() > until) throw new Error(`${card}'s rating line never said ${text}`)
    await button(page, 'Back').click()
    await button(page, 'Settings').click()
    await button(page, 'Profiles').click()
    await page.waitForTimeout(1_000)
  }
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
  first = await phone({ located: true })
  say(`Chromium ${browser.version()}, the app at ${APP}, services' verifier at ${services.verifier}, host at ${services.host}, index at ${services.index} and mcp at ${mcp.origin}`)
})

after(async () => {
  await browser?.close()
  await server?.close()
  await mcp?.close()
  if (mcpDir) rmSync(mcpDir, { recursive: true, force: true })
  await services?.stop()
})

test("Start, on a device that knows no passkey: two buttons at once, nothing asked; a closed sheet claims neither; Create a passkey made it for app.forest.foundation; then New to Forest?, and Yes, I'm new opens Get verified", async () => {
  const { page, counts, cdp, authenticator } = first
  const res = await page.goto(APP)
  assert.equal(res?.headers()['content-security-policy'], csp, 'the page comes with the CSP')
  await button(page, 'Create a passkey').waitFor()
  assert.ok(await button(page, 'I already have one').isVisible(), 'and the sheet, with its QR code, one tap away')
  assert.equal(await button(page, 'Start').count(), 0, 'no sheet first')
  assert.equal(counts.asserted + counts.created, 0, 'nothing asked')
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Create a passkey's unlock icon, in its text color")
  await shot(page, 'start')
  await closeTheSheetOnce(page)
  await button(page, 'I already have one').click()
  await page.getByText('No passkey chosen.').waitFor()
  assert.ok((await button(page, 'Create a passkey').isVisible()) && (await button(page, 'I already have one').isVisible()), 'both still there')
  await shot(page, 'start-closed')
  await button(page, 'Create a passkey').click()
  await page.getByRole('heading', { name: 'New to Forest?' }).waitFor()
  assert.equal(counts.created, 1)
  assert.deepEqual((await page.locator('main button').allTextContents()).map((t) => t.trim()), ['', "Yes, I'm new", 'I already use Forest'], 'back, and the two answers')
  assert.ok(await asks(button(page, 'I already use Forest')), 'I already use Forest shows the unlock icon: it asks the passkey they use')
  assert.equal(await page.locator('main p').count(), 0, 'no line explaining the title')
  await shot(page, 'new-here')
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId: authenticator })
  assert.deepEqual(credentials.map((c) => [c.rpId, c.isResidentCredential]), [['app.forest.foundation', true]])
  const local = await kept(page)
  assert.deepEqual(Object.keys(local).sort(), ['forest.folder', 'forest.passkeys'], 'the passkey known, not yet in use: no one is verified here yet')
  assert.deepEqual(JSON.parse(local['forest.folder']!).labels, {}, 'its Profiles folder looked at, with no profile in it')
  const asked = counts.asserted
  await button(page, "Yes, I'm new").click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  assert.equal(counts.asserted, asked, 'nothing asked')
  await shot(page, 'verify')
  say("Start: two buttons, nothing asked first; Create a passkey made it for app.forest.foundation; New to Forest?, then Get verified")
})

test("back on each setup step: Get verified to New to Forest?, then to Start, which asks for the passkey made alone and comes back to New to Forest?; the ID check to Get verified, even after a payment that failed; the face check's wait to Get verified; a check under way, Start goes straight to Get verified", async () => {
  const { page, context, counts } = first
  const rows = await page.getByRole('radio').allTextContents()
  assert.deepEqual(rows, ['FaceA selfieFree', 'IDYour ID and a selfie · counts more$5'], 'two rows, and no other words')
  assert.ok(await button(page, 'Continue').isDisabled(), 'Continue once a row is picked')
  assert.deepEqual((await page.locator('main button:not([role=radio])').allTextContents()).map((t) => t.trim()), ['', 'Continue'], 'back and Continue: no Link')

  // Get verified, back to New to Forest?, then to Start: this device knows the passkey now, so Start asks for it alone.
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'New to Forest?' }).waitFor()
  await button(page, 'Back').click()
  await button(page, 'Start').waitFor()
  assert.equal(await button(page, 'Create a passkey').count(), 0, 'never a second passkey')
  await shot(page, 'start-known')
  const asked = counts.asserted
  await button(page, 'Start').click()
  await page.getByRole('heading', { name: 'New to Forest?' }).waitFor()
  assert.equal(counts.asserted - asked, 1, 'one unlock, by the passkey made: no stamp yet, nothing under way, so New to Forest? again')
  await button(page, "Yes, I'm new").click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()

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
  // A check under way: Get verified's back goes to Start, and Start straight back to the check, then
  // its back to Get verified, the check still picked.
  await button(page, 'Back').click()
  await button(page, 'Start').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  assert.equal(await page.getByRole('heading', { name: 'New to Forest?' }).count(), 0, 'no New to Forest? once a check is under way')
  await button(page, 'Back').click()
  assert.equal(await page.getByRole('radio', { name: /^Face/ }).getAttribute('aria-checked'), 'true', 'the face check still picked')
  unfinished = false
  say('back: Get verified to New to Forest? and Start, the ID check after a failed payment, and the face check waiting, each to Get verified; under way, Start to Get verified')
})

test("Get verified: Face picked again, then Continue; the face check in its own tab, back through /back, the page hidden meanwhile, which keeps the seed, so the stamp kept with nothing asked; the gift in the wallet, the stamp in the Profiles folder; then Your first profile", async () => {
  const { page, context, counts } = first
  await page.getByRole('radio', { name: /^Face/ }).click()
  // The check's tab hides the app's page, which keeps the seed now, under 5 minutes since the last
  // action: the stamp is asked for, and once it comes, kept at once, nothing asked.
  await away(page)
  const asked = counts.asserted
  const tab = context.waitForEvent('page')
  await button(page, 'Continue').click()
  const didit = await tab
  await didit.waitForEvent('close')
  say(`the check's tab opened on the tap, went to ${new URL(didit.url()).pathname} and closed itself`)
  await page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked: the seed held through the check, the page hidden or not')
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
  assert.deepEqual(Object.keys(local).sort(), ['forest.checks', 'forest.folder', 'forest.passkey', 'forest.passkeys'])
  assert.deepEqual(JSON.parse(local['forest.checks']!), ['face'], 'how the person is verified')
  assert.deepEqual(JSON.parse(local['forest.folder']!), { address: wallet.address, labels: {} }, "the Profiles folder's address, never a key")
  for (const secret of [Buffer.from(seed).toString('hex'), Buffer.from(seed).toString('base64url'), String(stamp.signature.S)]) assert.ok(!JSON.stringify(local).includes(secret), 'nothing of the seed or the stamp kept')
  say(`verified: the stamp in the Profiles folder, the wallet at ${left} credits`)
})

test("the first profile, in two steps: back to Profiles and in again; a search, a market, its roles, each with its +; one pick, one unlock, its verification proven in the worker; the shield; its name; Share hands out its page on the index; a role made says Yours", async () => {
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
  assert.equal(await page.locator('button.row .icon').count(), 2, 'each with its +')
  await noLockOnRows(page)
  await shot(page, 'first-profile-roles')
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Your first profile' }).waitFor()
  const asked = counts.asserted
  const started = Date.now()
  await pickFirst(page, 'Tutoring tutor')
  assert.equal(counts.asserted - asked, 0, 'nothing asked: the seed held since the unlock at Start')
  say(`a profile made in ${((Date.now() - started) / 1000).toFixed(1)} s, its proof in the worker`)
  // Add a second passkey, once: its line, Add and Not now. Add opens Add a passkey, whose back comes back here.
  assert.deepEqual(await page.getByRole('button').allTextContents(), ['Add', 'Not now'])
  assert.deepEqual(await page.locator('main p').allTextContents(), ["Add a second, so losing one doesn't lose your profiles."])
  await shot(page, 'second-passkey')
  await button(page, 'Add').click()
  await page.getByRole('heading', { name: 'Add a passkey', exact: true }).waitFor()
  assert.deepEqual(await page.locator('main p').allTextContents(), ['Save it in another password manager, on a second phone, or on a security key.'])
  assert.ok(await asks(button(page, 'Create a passkey')), 'Create a passkey shows the unlock icon, even with the seed held: it makes a passkey')
  await shot(page, 'add-passkey')
  await button(page, 'Back').click()
  await button(page, 'Not now').click()
  // Use Forest from your AI, once: Connect opens Connect an AI, three steps and no links.
  await page.getByRole('heading', { name: 'Use Forest from your AI' }).waitFor()
  assert.deepEqual(await page.getByRole('button').allTextContents(), ['Connect', 'Not now'])
  await shot(page, 'use-ai')
  await button(page, 'Connect').click()
  await page.getByRole('heading', { name: 'Connect an AI' }).waitFor()
  assert.deepEqual(await page.locator('.steps > li').allTextContents(), ['In your AI app, add a connector. If it asks how to sign in, pick Sign in now.', `Paste this address:${mcp.origin}Copy`, 'It brings you back here to pick its profiles.'])
  assert.equal(await page.locator('a').count(), 0, 'no links to other sites')
  await button(page, 'Copy').click()
  await button(page, 'Copied').waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), mcp.origin, 'the address shown, in full')
  await shot(page, 'connect-ai')
  // Back: Profiles, and Add a second passkey and Use Forest from your AI never again.
  await button(page, 'Back').click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.named').click()
  await shield(page.getByRole('heading', { name: 'Tutoring tutor' })).waitFor()
  await named(page.getByRole('heading', { name: 'Tutoring tutor' }), 'Tutoring tutor')
  await page.getByRole('button', { name: /No reviews yet/ }).waitFor()
  // Under the name, one line, its reviews, nothing new; at the top right, Share, then the inbox, always there, with no number while nothing is new.
  assert.deepEqual(await page.locator('.lines button.link').allTextContents(), ['No reviews yet ›'])
  assert.deepEqual(await page.locator('.top-right button').evaluateAll((b) => b.map((x) => x.textContent || x.getAttribute('aria-label'))), ['Share', 'Messages'])
  assert.deepEqual([await inbox(page).locator('.icon').count(), await inbox(page).locator('.count').count(), await inbox(page).locator('.unlock').count()], [1, 0, 0], 'its own icon, no number, no padlock')
  assert.equal(await filled(shield(page.getByRole('heading', { name: 'Tutoring tutor' }))), false, "the face check's shield, an outline")
  await shot(page, 'profile')
  const main = await mainKey(seed, 'tutoring/tutor')
  tutor = main.address
  const body = (await readFolder([services.host], tutor, Date.now())).current.get('profile')?.entry.body
  assert.deepEqual([body?.market, body?.role, body?.hosts], ['tutoring', 'tutor', [services.host]])
  const check = verificationCheck(proofsOf(body).find((p) => p.circuit === 'verification'), tutor)
  assert.ok(check && (await checkVerification(check)), 'its verification checks, as any reader checks it')
  // Share: the profile's page on the index. Here, as on most laptops, there is no share sheet, so its link is copied.
  const onTheIndex = `${services.index}/profiles/${tutor}`
  await page.evaluate(() => delete (Navigator.prototype as { share?: unknown }).share)
  await button(page, 'Share').click()
  await button(page, 'Copied').waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), onTheIndex, "the profile's page on the index")
  assert.equal(await page.getByRole('dialog').count(), 0, 'no sheet of its own')
  await shot(page, 'profile-copied')
  // Where there is a share sheet, as on a phone, the sheet gets the page's link, and only that.
  await page.evaluate(() => void ((navigator as { share?: unknown }).share = async (data: ShareData) => void ((globalThis as { shared?: ShareData }).shared = data)))
  await button(page, 'Share').click({ timeout: 5_000 })
  assert.deepEqual(await page.waitForFunction(() => (globalThis as { shared?: ShareData }).shared).then((h) => h.jsonValue()), { url: onTheIndex })
  await button(page, 'Back').click()
  const card = page.locator('button.card', { hasText: 'Tutoring tutor' })
  await shield(card).waitFor()
  await named(card, 'Tutoring tutor')
  assert.equal(await card.locator('.dot').count(), 0, 'nothing new')
  assert.deepEqual(JSON.parse((await kept(page))['forest.profiles']!), [{ label: 'tutoring/tutor', address: tutor }])
  // At the top right of Profiles, the inbox too: every profile's messages, here none new.
  await inbox(page).waitFor()
  assert.equal(await inbox(page).locator('.count').count(), 0)
  await shot(page, 'profiles')
  // The shield, tapped on its card: its words, for a moment; the card stays shut.
  await shield(card).click()
  await page.getByText('Verified by face', { exact: true }).waitFor()
  assert.equal(await page.getByRole('heading', { name: 'Tutoring tutor' }).count(), 0, 'the card not opened')
  await shot(page, 'profiles-shield-tapped')
  await page.getByText('Verified by face', { exact: true }).waitFor({ state: 'detached' })
  // A role made says Yours, quietly, and opens its profile; one not made shows its +; back is the roles again.
  await button(page, 'New profile').click()
  await button(page, 'Tutoring').click()
  assert.deepEqual(await page.locator('button.row').allTextContents(), ['TutorYours', 'Student'], 'every role')
  assert.equal(await button(page, 'Student').locator('.icon').count(), 1, 'Student, with its +')
  assert.equal(await page.locator('button.row', { hasText: 'Yours' }).locator('.icon').count(), 0, 'Yours, with no icon')
  assert.equal(await page.getByText('Yours', { exact: true }).evaluate((e) => getComputedStyle(e).color), await muted(page), 'in the muted tone')
  await noLockOnRows(page)
  await shot(page, 'new-profile-made')
  const asked2 = counts.asserted
  await page.locator('button.row', { hasText: 'Yours' }).click()
  await shield(page.getByRole('heading', { name: 'Tutoring tutor' })).waitFor()
  assert.equal(counts.asserted - asked2, 0, 'opened, nothing unlocked')
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Tutoring', exact: true }).waitFor()
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  await card.waitFor()
})

test("Settings: Face with its check's shield, ID with + $5, the appearance as three icons; no About, version or source", async () => {
  const { page } = first
  await button(page, 'Settings').click()
  await page.getByRole('heading', { name: 'Settings' }).waitFor()
  const face = page.locator('div.row', { hasText: 'Face' })
  await shield(face).waitFor()
  assert.equal(await filled(shield(face)), false, "Face, with the face check's shield, an outline")
  assert.equal(await page.locator('main .verified').count(), 1, 'and no other')
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

test('two people: one posts an offer, its price per hour, the place only for sessions in person, a contact, asking nothing while the seed is held; the other opens its link, messages it, gets the reply, and reviews it from the thread; the inbox counts it, the bell does not', async () => {
  const { page, counts } = first
  // The offer, from the tutor's profile, in the market's own fields; a price per one of its field's values.
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.named').click()
  await button(page, 'New offer').click()
  await page.getByRole('heading', { name: 'New offer' }).waitFor()
  await page.getByLabel('Description').fill(OFFER)
  await page.getByLabel('Price').fill('30')
  assert.deepEqual(await page.getByRole('group', { name: 'Per' }).getByRole('button').allTextContents(), ['per hour', 'per session'], "exactly the field's per values")
  await page.getByRole('group', { name: 'Per' }).getByRole('button', { name: 'per hour' }).click()
  await page.getByRole('group', { name: 'Subjects' }).getByRole('button', { name: 'Maths' }).click()
  // How sessions are held: no place until they are in person; then the place, right after, filled
  // in from the phone's location with no button, since this phone allows it.
  const mode = page.getByRole('group', { name: 'Mode' })
  const place = page.getByRole('group', { name: 'Place' })
  assert.equal(await place.count(), 0, 'no place before In person')
  await mode.getByRole('button', { name: 'In person' }).click()
  await place.getByText('Within 5 km of you', { exact: true }).waitFor()
  assert.equal(await place.getByRole('button', { name: 'Use my location' }).count(), 0, 'allowed already: no button')
  const labels = async () => (await page.locator('form > .field > .label').allTextContents()).map((l) => l.replace('Public.', ''))
  assert.deepEqual(await labels(), ['Subjects', 'Description', 'Price', 'Mode', 'Place', 'Levels', 'Minutes', 'Hours', 'Contact'], "the preview's fields first, the place right after how sessions are held, contact last")
  // The radius on a slider, from the field's 5 km: 10 km is its sixth step (0, 1, 2, 3, 5, 10).
  await place.getByRole('slider', { name: 'Within' }).fill('5')
  await place.getByLabel('Area').fill('Chamberí')
  await place.getByText('Chamberí, within 10 km of you', { exact: true }).waitFor()
  await page.getByLabel('Contact').fill('ada@example.com')
  await page.getByText('Public.').waitFor()
  await shot(page, 'post-offer-in-person')
  // Online only: the place goes, and nothing of it is posted.
  await mode.getByRole('button', { name: 'In person' }).click()
  await place.waitFor({ state: 'detached' })
  await mode.getByRole('button', { name: 'Online' }).click()
  // Settings' reload dropped the seed: Post will ask, and says so.
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Post's unlock icon, in its text color")
  await shot(page, 'post-offer')
  let asked = counts.asserted
  await button(page, 'Post').click()
  // Its row: its subjects, then its price, in every market its second line.
  const offerRow = page.locator('.post-row', { hasText: '$30 per hour' })
  await offerRow.waitFor({ timeout: 60_000 })
  assert.deepEqual(await offerRow.locator('.two > *').allTextContents(), ['Maths', '$30 per hour'])
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  // Edited and posted again: the seed held since that unlock, Post shows no unlock icon, and asks nothing.
  await offerRow.click()
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  assert.equal(await asks(button(page, 'Post')), false, 'no unlock icon: a tap will not ask')
  await shot(page, 'post-offer-held')
  asked = counts.asserted
  await button(page, 'Post').click()
  await page.getByRole('heading', { name: 'Your offers' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked')
  const posts = await entriesOf(tutor, 'post')
  assert.equal(posts.length, 1)
  const [offerPath, offer] = posts[0]!
  assert.match(offerPath, /^post\/[0-9a-f]{32}$/, 'at a random id')
  assert.deepEqual(offer.entry.body, { description: OFFER, price: { amount: '30', currency: 'USD', per: 'hour' }, subjects: ['maths'], mode: ['online'], contact: 'ada@example.com' })
  await page.getByRole('heading', { name: 'Your offers' }).waitFor()
  await shot(page, 'profile-posts')

  // The second person opens a message link with nothing set up: Start and the face check first, then the message.
  const second = await phone()
  await second.page.goto(`${APP}message?to=${tutor}`)
  await button(second.page, 'Create a passkey').click()
  await imNew(second)
  await faceCheck(second)
  // The compose screen, all of it there: To filled with the link's address and who it is under it; From, the profile to make.
  await second.page.getByRole('heading', { name: 'New message' }).waitFor({ timeout: 60_000 })
  assert.equal(new URL(second.page.url()).search, '', "the profile's address out of the path")
  assert.equal(await second.page.getByLabel('To').inputValue(), tutor)
  await shield(second.page.locator('.who', { hasText: 'Tutoring tutor' })).waitFor()
  await second.page.locator('.from', { hasText: 'Tutoring student' }).waitFor()
  await named(second.page.locator('.who'), 'Tutoring tutor')
  await named(second.page.locator('.from'), 'Tutoring student')
  assert.ok(await second.page.getByLabel('Message').isVisible(), 'the message box from the start')
  assert.ok(await button(second.page, 'Send').isDisabled(), 'Send once there is a profile to send from')
  await shot(second.page, 'message-new-profile')
  const secondAsked = second.counts.asserted
  await button(second.page, 'New profile').click()
  await second.page.locator('.from button').waitFor({ state: 'detached', timeout: 120_000 })
  assert.ok(await second.page.locator('.from', { hasText: 'Tutoring student' }).isVisible(), 'from the profile just made')
  await shield(second.page.locator('.from')).waitFor()
  await second.page.getByLabel('Message').fill(ASK)
  assert.equal(await asks(button(second.page, 'Send')), false, 'the seed held since Start: Send will ask nothing')
  await shot(second.page, 'message')
  await button(second.page, 'Send').click()
  await second.page.locator('.said.mine', { hasText: ASK }).waitFor({ timeout: 60_000 })
  assert.equal(second.counts.asserted - secondAsked, 0, 'the profile made and the message sent, nothing asked: the seed held since Start')
  const student = JSON.parse((await kept(second.page))['forest.profiles']!)[0].address as string

  // The first: counted with nothing unlocked, on the card, on the inbox at the top of Profiles, of
  // the profile and of Notifications, never on the bell, which counts reviews; Notifications holds
  // no message. After the page was closed, its inbox opens every profile's conversations, and one
  // unlock opens every inbox; who it is from; the reply.
  await button(page, 'Back').click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.dot').waitFor({ timeout: 45_000 })
  await inbox(page).locator('.count', { hasText: '1' }).waitFor({ timeout: 45_000 })
  assert.equal(await inbox(page).getAttribute('aria-label'), 'Messages, 1 new')
  assert.equal(await page.locator('.places .count').count(), 0, 'the bell counts reviews, vouches and reports alone')
  await shot(page, 'profiles-message')
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.named').click()
  await inbox(page).locator('.count', { hasText: '1' }).waitFor()
  assert.deepEqual(await page.locator('.lines button.link').allTextContents(), ['No reviews yet ›'], 'no Messages line')
  await shot(page, 'profile-message')
  await button(page, 'Back').click()
  await button(page, /Notifications$/).click()
  await page.getByRole('heading', { name: 'Notifications' }).waitFor()
  await page.getByText('Nothing yet.').waitFor()
  assert.equal(await page.locator('main .rows button.row').count(), 0, 'no message row')
  await inbox(page).locator('.count', { hasText: '1' }).waitFor()
  await shot(page, 'notifications-message')
  // The page closed and opened again (the seed dropped), then its inbox: every profile's conversations.
  await closed(page)
  await inbox(page).click()
  await page.getByRole('heading', { name: 'Messages' }).waitFor()
  await page.locator('.messages-row', { hasText: '1 new message' }).getByRole('button', { name: 'Open' }).waitFor()
  assert.equal(await page.getByRole('tab').count(), 0, 'messages only: no filters')
  assert.deepEqual(await page.locator('.top button').evaluateAll((b) => b.map((x) => x.getAttribute('aria-label'))), ['Back'], 'nothing at the top but back: no pencil')
  const compose = button(page, 'New message')
  assert.match((await compose.getAttribute('class')) ?? '', /primary/, 'New message, a labeled button')
  assert.ok((await compose.boundingBox())!.y > (await page.locator('.messages-row').boundingBox())!.y, 'at the bottom')
  // No seed held: Open asks, and says so.
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Open's unlock icon, in its text color, on its row")
  await shot(page, 'messages-asking')
  asked = counts.asserted
  await button(page, 'Open').click()
  const row = page.locator('button.row', { hasText: 'Tutoring student' })
  await shield(row).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock opens every inbox')
  await named(row, 'Tutoring student')
  await row.locator('.dot').waitFor()
  assert.equal(await page.locator('.messages-row').count(), 0, 'opened: the row gone')
  await shot(page, 'messages')
  await row.click()
  await page.getByText(ASK).waitFor()
  await page.getByText('Your Tutoring tutor').waitFor()
  await named(page.locator('.top'), 'Tutoring student')
  // The reply, in one row: the text box and a round Send, which shows its own icon.
  const reply = page.getByLabel('Reply')
  const send = button(page, 'Send')
  const [box, round] = [(await reply.boundingBox())!, (await send.boundingBox())!]
  assert.ok(round.y < box.y + box.height && box.y < round.y + round.height && round.x > box.x + box.width - 1, 'side by side, in one row')
  assert.equal(Math.round(round.width), Math.round(round.height), 'as wide as it is high')
  assert.equal(await send.evaluate((b) => getComputedStyle(b).borderRadius), '50%', 'round')
  assert.deepEqual([await send.locator('.icon').count(), await send.locator('.unlock').count(), await send.textContent()], [1, 0, ''], 'its own icon, no word, no padlock')
  await reply.fill(YES)
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Send's icon, in its text color")
  await send.click()
  await page.locator('.said.mine', { hasText: YES }).waitFor({ timeout: 60_000 })
  // Each message with the time it was sent, quietly; the day once, above them, since they are of one day.
  const times = await page.locator('.said .sent').allTextContents()
  assert.equal(times.length, 2)
  for (const t of times) assert.match(t, /^\d{1,2}:\d{2}\s?[AP]M$/, `a time of day: ${t}`)
  assert.deepEqual(await page.locator('.thread > *').evaluateAll((els) => els.map((e) => e.className)), ['day-line', 'said', 'said mine'], 'one day line, before the first')
  assert.equal(await page.locator('.day-line').textContent(), await page.evaluate(() => new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })))
  await shot(page, 'thread')
  assert.equal((await entriesOf(tutor, 'sent')).length, 1, "the reply's copy, in the tutor's own folder")
  await button(page, 'Back').click()
  assert.equal(await row.locator('.dot').count(), 0, 'looked at: new no more')
  await button(page, 'Back').click()
  await inbox(page).locator('.count').waitFor({ state: 'detached' })
  assert.equal(await page.locator('main .rows button.row').count(), 0, 'nothing yet about the tutor')
  await page.getByText('Nothing yet.').waitFor()
  await shot(page, 'notifications-none')

  // The second reads the reply beside what they sent, and reviews the tutor from the thread; their
  // page closed and opened again first, so Open asks.
  await button(second.page, 'Back').click()
  await closed(second.page)
  await inbox(second.page).locator('.count', { hasText: '1' }).waitFor({ timeout: 45_000 })
  await messagesOf(second.page, 'Tutoring student')
  await button(second.page, 'Open').click()
  await second.page.locator('button.row', { hasText: 'Tutoring tutor' }).click()
  await second.page.locator('.said.mine', { hasText: ASK }).waitFor()
  await second.page.locator('.said:not(.mine)', { hasText: YES }).waitFor()
  await button(second.page, 'Review').click()
  await shield(second.page.locator('.who', { hasText: 'Tutoring tutor' })).waitFor()
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
  await second.page.getByRole('button', { name: /^Maths\s*\$30 per hour$/ }).click()
  await shot(second.page, 'review-someone')
  await button(second.page, 'Post').click()
  await second.page.getByLabel('Reply').waitFor({ timeout: 60_000 })
  const reviews = await entriesOf(student, 'review')
  assert.equal(reviews.length, 1)
  const [, review] = reviews[0]!
  assert.deepEqual(review.entry.body, { subject: tutor, score: '9.4', text: 'Clear and patient.', post: `${tutor}/${offerPath}` }, 'about the tutor, naming the offer, in tenths')
  await second.context.close()
  await button(page, 'Profiles').click()
  say('two people: an offer per hour, found by its link, messaged, replied to, reviewed in tenths; nothing asked while the seed was held')
})

test("a second browser, the same passkey answering from the first, as a phone answers through the sheet's QR code: I already have one finds the profile and the stamp, after Save a passkey on this device?, Not now; a profile it makes, the first shows as New profiles from another device, read in one unlock", async () => {
  const second = await phone()
  // The second browser's own authenticator holds no Forest passkey. Asked with the sheet, the first
  // browser's answers, as a phone does through the QR code: its PRF secret for the same salt.
  await answerFrom(second, first)
  const asked = first.counts.asserted
  await second.page.goto(APP)
  await button(second.page, 'I already have one').click()
  // From another device: once, Save a passkey on this device?, Save and Not now.
  await second.page.getByRole('heading', { name: 'Save a passkey on this device?' }).waitFor({ timeout: 60_000 })
  assert.deepEqual((await second.page.locator('main button').allTextContents()).map((t) => t.trim()), ['Save', 'Not now'])
  assert.ok(await asks(button(second.page, 'Save')), 'Save shows the unlock icon: it makes a passkey')
  await shot(second.page, 'save-passkey')
  await button(second.page, 'Not now').click()
  await shield(second.page.locator('button.card', { hasText: 'Tutoring tutor' })).waitFor({ timeout: 60_000 })
  assert.equal(first.counts.asserted - asked, 1, "answered once, by the first browser's passkey")
  assert.equal(second.counts.created, 0, 'and no second passkey')
  assert.deepEqual(JSON.parse((await kept(second.page))['forest.profiles']!), [{ label: 'tutoring/tutor', address: tutor }])

  // The second browser makes a profile of its own, with the seed it holds since its Start.
  await button(second.page, 'New profile').click()
  await pickProfile(second.page, 'Tutoring student')
  assert.equal(first.counts.asserted - asked, 1, 'nothing asked again: the seed held since Start')
  await second.context.close()
  const student = (await mainKey(seed, 'tutoring/student')).address

  // The first, with nothing unlocked, tells it; one unlock reads it, and its card shows.
  const { page, counts } = first
  await button(page, 'Settings').click()
  await button(page, 'Profiles').click()
  const row = button(page, 'New profiles from another device')
  await row.waitFor({ timeout: 30_000 })
  assert.equal(first.counts.asserted - asked, 1, 'told with nothing unlocked')
  await noLockOnRows(page)
  await shot(page, 'profiles-elsewhere')
  await closed(page)
  await row.waitFor({ timeout: 30_000 })
  const before = counts.asserted
  await row.click()
  await page.locator('button.card', { hasText: 'Tutoring student' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - before, 1, 'one unlock')
  await row.waitFor({ state: 'detached' })
  assert.deepEqual(JSON.parse((await kept(page))['forest.profiles']!), [
    { label: 'tutoring/student', address: student },
    { label: 'tutoring/tutor', address: tutor },
  ])
  say('a second browser found the profile and its verification, answered by the same passkey; the profile it made, the first read in one unlock')
})

const NOTE = 'Note to self: Tuesday at six.'

test("a message to one of the person's own profiles: To their tutor, From their student; with the seed held since the last unlock, the messages open by themselves, and it is sent and opens with nothing asked", async () => {
  const { page, counts } = first
  const asked = counts.asserted
  await messagesOf(page, 'Tutoring tutor')
  // The seed held: no Open, the conversations opened by themselves.
  await page.locator('button.row', { hasText: 'Tutoring student' }).waitFor({ timeout: 60_000 })
  assert.equal(await page.locator('.messages-row').count(), 0, 'no Open')
  await shot(page, 'messages-held')
  await button(page, 'New message').click()
  await page.getByLabel('To').fill(tutor)
  await shield(page.locator('.who', { hasText: 'Tutoring tutor' })).waitFor()
  await page.locator('.from', { hasText: 'Tutoring student' }).waitFor()
  assert.equal(await page.locator('main .line').count(), 0, 'not refused')
  assert.equal(await page.locator('.from button').count(), 0, 'from the student they have')
  await page.getByLabel('Message').fill(NOTE)
  await button(page, 'Send').click()
  await page.locator('.said.mine', { hasText: NOTE }).waitFor({ timeout: 60_000 })
  await page.getByText('Your Tutoring student').waitFor()
  await button(page, 'Back').click()
  // The tutor's messages: it arrives, and with the seed held it opens by itself, from the student, new.
  const row = page.locator('button.row', { hasText: NOTE }).filter({ hasText: 'Tutoring student' })
  await shield(row).waitFor({ timeout: 90_000 })
  assert.equal(await page.locator('.messages-row').count(), 0, 'never an Open row')
  assert.equal(counts.asserted - asked, 0, 'opened, sent and opened again, nothing asked')
  await row.locator('.dot').waitFor()
  await row.click()
  await page.locator('.said:not(.mine)', { hasText: NOTE }).waitFor()
  await page.getByText('Your Tutoring tutor').waitFor()
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  say("a message from the person's student to their own tutor: sent, counted, opened")
})

test('one passkey per person: after Forget, Start finds it; with the sheet closed, "No passkey chosen." and Try again, never Create a passkey', async () => {
  const { page, counts, cdp, authenticator } = first
  await button(page, 'Settings').click()
  await button(page, 'Forget this device').click()
  await page.getByText('Your passkey stays in your password manager.').waitFor()
  await button(page, 'Forget').click()
  await button(page, 'Start').click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).waitFor({ timeout: 60_000 })
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
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.created, 1, 'and no second passkey')
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId: authenticator })
  assert.equal(credentials.length, 1)
  say('one passkey: found after Forget; a closed sheet, Try again, and never a second')
})

/** The live, locked backup/<id> entries of the Profiles folder at `wallet`, as anyone reads them. */
const backupsOn = async (wallet: string) => (await entriesOf(wallet, 'backup')).filter(([, c]) => isLocked(c.entry.body))

/** A passkey's id as the app keeps it, from the id the virtual authenticator gives. */
const idOf = (credentialId: string) => Buffer.from(credentialId, 'base64').toString('base64url')

/** The rows of Settings' Passkeys, by their words. */
const passkeyRows = (page: Page) => page.locator('section', { has: page.getByRole('heading', { name: 'Passkeys' }) }).locator('div.row > span')

test("passkeys, every one alike: Your first passkey and the quiet line, no dots; the same manager refused; a security key made one, shown by the day it was added; a browser holding only that one opens the same profiles; removed, it opens them no more; after Forget, New to Forest?, whose I already use Forest refuses the same passkey and adds this one to the first", async () => {
  const { page, cdp, counts } = first
  const mainId = JSON.parse((await kept(page))['forest.passkey']!) as string
  const wallet = (await mainKey(seed, '')).address
  const passkeys = page.locator('section', { has: page.getByRole('heading', { name: 'Passkeys' }) })
  const add = button(page, '+ Add a passkey')
  const why = passkeys.getByText("Add a second, so losing one doesn't lose your profiles.", { exact: true })
  await button(page, 'Settings').click()
  await passkeys.getByText('Your first passkey', { exact: true }).waitFor()
  assert.deepEqual(await passkeyRows(page).allTextContents(), ['Your first passkey'])
  await why.waitFor()
  assert.equal(await why.getAttribute('class'), 'line', 'a quiet line')
  assert.equal(await add.locator('.dot').count(), 0, 'no dot on + Add a passkey')
  assert.equal(await page.locator('nav.places .dot').count(), 0, 'nor on the Settings tab')
  assert.equal(await page.getByText(/backup/i).count(), 0, 'no backup on the screen')
  await shot(page, 'settings-passkeys-one')

  // The phone's own manager keeps the Forest passkey, which the new one excludes: it refuses.
  const made = counts.created
  await add.click()
  await page.getByRole('heading', { name: 'Add a passkey', exact: true }).waitFor()
  await button(page, 'Create a passkey').click()
  const same = page.getByText('This password manager already has your Forest passkey. Save the new one in another.')
  await same.waitFor()
  assert.equal(await same.getAttribute('class'), 'line red')
  assert.equal(counts.created, made, 'nothing made')
  await shot(page, 'add-passkey-same-manager')

  // A security key, a second virtual authenticator: it makes the new passkey.
  const { authenticatorId: key } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'usb', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, hasPrf: true, automaticPresenceSimulation: true },
  })
  await button(page, 'Create a passkey').click()
  await page.getByRole('heading', { name: 'Settings' }).waitFor({ timeout: 60_000 })
  const onKey = (await cdp.send('WebAuthn.getCredentials', { authenticatorId: key })).credentials
  assert.deepEqual(onKey.map((c) => [c.rpId, c.isResidentCredential]), [['app.forest.foundation', true]], 'made on the security key')
  assert.equal((await cdp.send('WebAuthn.getCredentials', { authenticatorId: first.authenticator })).credentials.length, 1, "none more in the phone's own manager")
  const addedId = idOf(onKey[0]!.credentialId)
  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  await passkeys.locator('div.row', { hasText: today }).waitFor()
  assert.deepEqual(await passkeyRows(page).allTextContents(), ['Your first passkey', today], "the day it was added: no manager's name, since this one sends none")
  const row = passkeys.locator('div.row', { hasText: today })
  assert.equal(await why.count(), 0, 'two: no line')
  assert.equal(await row.locator('.unlock').count(), 0, 'no unlock icon on a row')
  assert.equal(await page.getByText(/backup/i).count(), 0, 'no backup on the screen')
  await shot(page, 'settings-passkeys-two')
  assert.equal((await backupsOn(wallet)).length, 1, 'underneath, the standard\'s backup/<id> entry in the Profiles folder')
  assert.ok((JSON.parse((await kept(page))['forest.passkeys']!) as string[]).includes(addedId), 'the device knows it')

  // A browser holding only that passkey, answered through the sheet's QR code: Save a passkey on this device?, Not now, and the same profiles.
  const other = await phone()
  let answering = addedId
  await answerFrom(other, first, () => answering)
  await other.page.goto(APP)
  await button(other.page, 'I already have one').click()
  await button(other.page, 'Not now').click({ timeout: 60_000 })
  await shield(other.page.locator('button.card', { hasText: 'Tutoring tutor' })).waitFor({ timeout: 60_000 })
  const there = await kept(other.page)
  assert.equal(JSON.parse(there['forest.passkey']!), addedId, 'that passkey, the one in use there')
  assert.deepEqual((JSON.parse(there['forest.profiles']!) as Array<{ label: string }>).map((x) => x.label), ['tutoring/student', 'tutoring/tutor'])
  assert.equal(JSON.parse(there['forest.folder']!).address, wallet, "the first passkey's Profiles folder")

  // Removed, tapped twice: one passkey again, the line back, and that passkey opens the profiles no more.
  const remove = row.getByRole('button', { name: 'Remove' })
  await remove.click()
  assert.match((await remove.getAttribute('class')) ?? '', /solid/, 'tapped once, it fills red')
  await shot(page, 'settings-passkeys-remove')
  await remove.click()
  await row.waitFor({ state: 'detached', timeout: 30_000 })
  await why.waitFor()
  assert.equal((await backupsOn(wallet)).length, 0)
  await closed(other.page)
  await messagesOf(other.page, 'Tutoring tutor')
  await button(other.page, 'Open').click()
  const gone = other.page.getByText('This passkey no longer opens your profiles.')
  await gone.waitFor({ timeout: 30_000 })
  assert.equal(await gone.getAttribute('class'), 'line red')
  await shot(other.page, 'not-yours')

  // After Forget, Start with it: its own seed, no stamp, nothing under way, so New to Forest?.
  await button(other.page, 'Back').click()
  await button(other.page, 'Back').click()
  await button(other.page, 'Settings').click()
  await button(other.page, 'Forget this device').click()
  await button(other.page, 'Forget').click()
  await button(other.page, 'Start').click()
  await other.page.getByRole('heading', { name: 'New to Forest?' }).waitFor({ timeout: 60_000 })
  const using = button(other.page, 'I already use Forest')
  // The same passkey picked on the sheet: refused.
  await using.click()
  const self = other.page.getByText("That's this passkey.")
  await self.waitFor({ timeout: 30_000 })
  assert.equal(await self.getAttribute('class'), 'line red')
  await shot(other.page, 'new-here-same')
  // The first passkey picked: this one added to it, and straight in. The security key unplugged from
  // the first phone first, since a virtual one asked for a passkey it doesn't hold answers at once
  // that it has none, where a real sheet waits for the person's pick.
  await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId: key })
  answering = mainId
  await using.click()
  await shield(other.page.locator('button.card', { hasText: 'Tutoring tutor' })).waitFor({ timeout: 60_000 })
  assert.equal(await other.page.getByRole('heading', { name: 'Get verified' }).count(), 0, 'straight to their profiles')
  const linked = await kept(other.page)
  assert.equal(JSON.parse(linked['forest.passkey']!), addedId, 'this passkey stays the one in use here')
  assert.ok((JSON.parse(linked['forest.passkeys']!) as string[]).includes(mainId), 'and the device knows the first')
  assert.equal((await backupsOn(wallet)).length, 1, 'added again')
  await other.context.close()

  await button(page, 'Profiles').click()
  await button(page, 'Settings').click()
  await passkeys.locator('div.row', { hasText: today }).waitFor({ timeout: 30_000 })
  assert.equal(await passkeyRows(page).count(), 2)
  await button(page, 'Profiles').click()
  say('passkeys: one made on a security key, opened elsewhere, removed, then one added from New to Forest?')
})

test('signed in through the QR code: Save a passkey on this device? once; Save makes one here, added to the first, and the one in use here from then, so the next unlock asks this device, not the phone', async () => {
  const third = await phone()
  await answerFrom(third, first)
  const asked = first.counts.asserted
  await third.page.goto(APP)
  await button(third.page, 'I already have one').click()
  await third.page.getByRole('heading', { name: 'Save a passkey on this device?' }).waitFor({ timeout: 60_000 })
  await button(third.page, 'Save').click()
  await shield(third.page.locator('button.card', { hasText: 'Tutoring tutor' })).waitFor({ timeout: 60_000 })
  assert.equal(first.counts.asserted - asked, 1, 'the phone asked once, to sign in')
  assert.equal(third.counts.created, 1, 'one made here')
  const { credentials } = await third.cdp.send('WebAuthn.getCredentials', { authenticatorId: third.authenticator })
  assert.equal(credentials.length, 1)
  const here = idOf(credentials[0]!.credentialId)
  assert.equal(JSON.parse((await kept(third.page))['forest.passkey']!), here, 'the one in use here')
  const wallet = (await mainKey(seed, '')).address
  assert.equal((await backupsOn(wallet)).length, 2, 'added to the first')

  // The page closed: the next unlock is this device's own, the phone left alone.
  await closed(third.page)
  const before = [first.counts.asserted, third.counts.asserted]
  await messagesOf(third.page, 'Tutoring tutor')
  await button(third.page, 'Open').click()
  await third.page.locator('.messages-row').waitFor({ state: 'detached', timeout: 60_000 })
  assert.deepEqual([first.counts.asserted - before[0]!, third.counts.asserted - before[1]!], [0, 1], 'this device asked, not the phone')
  await third.context.close()

  // On the first device, three passkeys alike; the one saved there removed again.
  const { page } = first
  await button(page, 'Settings').click()
  await passkeyRows(page).nth(2).waitFor({ timeout: 30_000 })
  assert.equal(await passkeyRows(page).count(), 3)
  const last = page.locator('section', { has: page.getByRole('heading', { name: 'Passkeys' }) }).locator('div.row').nth(2)
  await last.getByRole('button', { name: 'Remove' }).click()
  await last.getByRole('button', { name: 'Remove' }).click()
  await passkeyRows(page).nth(2).waitFor({ state: 'detached', timeout: 30_000 })
  await button(page, 'Profiles').click()
  say('signed in through the QR code: a passkey saved here, the next unlock asked here')
})

const COAT = 'A wool coat, worn twice.'

test('clothing, with the index: a coat with two photos redrawn on the device, no per, for women, size XL, picked up or shipped, near Lavapiés, $40, listed; a buyer, with no location allowed, sees why a post needs it; the buyer messages, reviews, vouches and reports; the seller sees the rating, "3 new" on the profile, the bell counting the three and the inbox the message, the three marked in Reviews and seen there; Notifications lists them, and no message', async () => {
  const { page, counts } = first
  // The seller's profile, and the coat.
  await button(page, 'New profile').click()
  await pickProfile(page, 'Clothing seller')
  const seller = (await mainKey(seed, 'clothing/seller')).address
  // The page closed and opened again on the profile: the seed dropped, so Post will ask, and show it.
  await closed(page)
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
  // Who it's for, then the kind, and only then one size question, right after them, by its labels.
  await page.getByRole('group', { name: 'Wearer' }).getByRole('button', { name: 'Women' }).click()
  assert.equal(await page.getByLabel('Size', { exact: true }).count(), 0, 'no size before the kind')
  await page.getByLabel('Kind', { exact: true }).selectOption({ label: 'Coat' })
  const coatLabels = (await page.locator('form > .field > .label').allTextContents()).map((l) => l.replace('Public.', ''))
  assert.deepEqual(coatLabels, ['Photos', 'Description', 'Price', 'Wearer', 'Kind', 'Size', 'Brand', 'Condition', 'Location', 'Delivery', 'Contact'], 'one size question, right after who and the kind')
  assert.deepEqual((await page.getByLabel('Size', { exact: true }).locator('option').allTextContents()).slice(1), ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'One size'], 'each value by its label, else in words')
  await page.getByLabel('Size', { exact: true }).selectOption({ label: 'XL' })
  // A choice of several: picked up and shipped.
  const delivery = page.getByRole('group', { name: 'Delivery' })
  await delivery.getByRole('button', { name: 'Pickup' }).click()
  await delivery.getByRole('button', { name: 'Shipping' }).click()
  // Where the coat is: from the phone's location, with no button; the slider from the field's 2 km to 3.
  const location = page.getByRole('group', { name: 'Location' })
  await location.getByText('Within 2 km of you', { exact: true }).waitFor()
  await location.getByRole('slider', { name: 'Within' }).fill('3')
  await location.getByLabel('Area').fill('Lavapiés, Madrid')
  await location.getByText('Lavapiés, Madrid, within 3 km of you', { exact: true }).waitFor()
  await page.getByLabel('Contact').fill('@coats')
  // The page hidden a moment keeps the seed, which closing it dropped: Post asks, and shows it.
  await away(page)
  assert.equal(await asks(button(page, 'Post')), true, 'the unlock icon on Post')
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Post's unlock icon, in its text color")
  await shot(page, 'post-coat')
  const asked = counts.asserted
  await button(page, 'Post').click()
  const coatRow = page.locator('.post-row', { hasText: COAT })
  await coatRow.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock: the post and its photos')
  const [[coatPath, coat]] = (await entriesOf(seller, 'post')) as unknown as [[string, { entry: { body: any } }]]
  const body = coat.entry.body
  assert.deepEqual([body.description, body.price, body.wearer, body.kind, body.size, body.delivery, body.contact], [COAT, { amount: '40', currency: 'USD' }, ['women'], 'coat', 'xl', ['pickup', 'shipping'], '@coats'], 'no per; who, the kind, the size by its value, several deliveries')
  assert.deepEqual([body.location.radiusKm, body.location.area], [3, 'Lavapiés, Madrid'])
  const km = kmFromSpot(body.location)
  assert.ok(km > 0.1 && km < 0.8, `its point moved a little from the phone's, ${km.toFixed(2)} km`)
  assert.deepEqual(JSON.parse((await kept(page))['forest.points']!), [{ lat: body.location.lat, lon: body.location.lon }], "the device's one kept point, which the offer's place took too: never a new one from the same spot")
  assert.equal(loadMarkets().checkEntry('clothing', 'seller', 'post', body), null, 'it fits the market')
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
  await coatRow.getByText('$40', { exact: true }).waitFor()
  assert.equal(await coatRow.getByText('Update this post').count(), 0, 'it fits: nothing to update')
  await shot(page, 'profile-coat')
  // The index lists it: it fits the market as the index reads it.
  const onIndex = `${services.index}/profiles/${seller}/${coatPath}.json`
  for (const until = Date.now() + 45_000; ; ) {
    const res = await fetch(onIndex)
    const listed = res.ok ? ((await res.json()) as { post: { listed: boolean; why?: string } }).post : null
    if (listed?.listed) break
    if (Date.now() > until) throw new Error(`the index never listed the coat: ${listed?.why ?? res.status}`)
    await new Promise((r) => setTimeout(r, 1_000))
  }

  // A buyer: verified, their first profile, a message with the pencil, and a review from the thread.
  const buyer = await phone()
  await newPerson(buyer)
  await buyer.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  await pickFirst(buyer.page, 'Clothing buyer')
  const buying = (await kept(buyer.page))['forest.profiles']!
  const buyerAddress = JSON.parse(buying)[0].address as string
  await button(buyer.page, 'Not now').click()
  await buyer.page.getByRole('heading', { name: 'Use Forest from your AI' }).waitFor()
  await button(buyer.page, 'Not now').click()
  // A phone that hasn't allowed its location. Its browser told no before (headless Chromium's
  // answer for a site never granted): one line says why the post needs it, and nothing to tap.
  const NO_LOCATION = 'Allow your location so people nearby find this post.'
  await buyer.page.locator('button.card', { hasText: 'Clothing buyer' }).locator('.named').click()
  await button(buyer.page, 'New request').click()
  const where = buyer.page.getByRole('group', { name: 'Location' })
  await where.getByText(NO_LOCATION, { exact: true }).waitFor()
  assert.equal(await where.getByRole('button').count(), 0, 'told no before: the line alone')
  await button(buyer.page, 'Back').click()
  // Never asked: one button, Use my location, and the browser's own prompt only on its tap; here
  // the prompt is refused, so the same line.
  const { targetInfo } = await buyer.cdp.send('Target.getTargetInfo')
  await buyer.cdp.send('Browser.setPermission', { permission: { name: 'geolocation' }, setting: 'prompt', origin: APP.slice(0, -1), browserContextId: targetInfo.browserContextId! })
  await button(buyer.page, 'New request').click()
  await where.getByRole('button', { name: 'Use my location' }).waitFor()
  assert.equal(await where.getByRole('slider').count(), 0, 'no radius before a point')
  await shot(buyer.page, 'post-request-location')
  await where.getByRole('button', { name: 'Use my location' }).click()
  await where.getByText(NO_LOCATION, { exact: true }).waitFor()
  assert.equal(await where.getByRole('button').count(), 0, 'refused: the line alone')
  await shot(buyer.page, 'post-request-no-location')
  await button(buyer.page, 'Back').click()
  await button(buyer.page, 'Back').click()
  // The page closed and opened again, so no seed is held; before the unlock, how many are new, here none, with Open.
  await closed(buyer.page)
  await messagesOf(buyer.page, 'Clothing buyer')
  await buyer.page.locator('.messages-row', { hasText: 'No new messages' }).getByRole('button', { name: 'Open' }).waitFor()
  await shot(buyer.page, 'messages-none')
  await button(buyer.page, 'New message').click()
  await buyer.page.getByRole('heading', { name: 'New message' }).waitFor()
  assert.ok((await buyer.page.getByLabel('To').isVisible()) && (await buyer.page.getByLabel('Message').isVisible()), 'To and the message box, from the start')
  await shot(buyer.page, 'message-empty')
  // Their own profile: taken, From their profile on the other side, to make.
  await buyer.page.getByLabel('To').fill(buyerAddress)
  await shield(buyer.page.locator('.who', { hasText: 'Clothing buyer' })).waitFor()
  await buyer.page.locator('.from', { hasText: 'Clothing seller' }).getByRole('button', { name: 'New profile' }).waitFor()
  assert.equal(await buyer.page.locator('main .line').count(), 0, 'not refused')
  // The seller's page on the index, as their Share hands it out: taken as their address.
  await buyer.page.getByLabel('To').fill(`${services.index}/profiles/${seller}`)
  await shield(buyer.page.locator('.who', { hasText: 'Clothing seller' })).waitFor()
  await buyer.page.locator('.from', { hasText: 'Clothing buyer' }).waitFor()
  assert.equal(await buyer.page.locator('main .line').count(), 0)
  await buyer.page.getByLabel('Message').fill('Is the coat still there?')
  await button(buyer.page, 'Send').click()
  await buyer.page.locator('.said.mine', { hasText: 'Is the coat still there?' }).waitFor({ timeout: 60_000 })
  await button(buyer.page, 'Review').click()
  const score = buyer.page.getByLabel('Score')
  await score.focus()
  await score.press('End')
  await buyer.page.getByRole('group', { name: 'As described' }).getByRole('button', { name: 'Yes' }).click()
  assert.deepEqual(await buyer.page.getByRole('button', { name: COAT }).locator('.two > *').allTextContents(), [COAT, '$40'], 'its pick: the coat, then its price')
  await buyer.page.getByRole('button', { name: COAT }).getByText('$40', { exact: true }).waitFor()
  await buyer.page.getByRole('button', { name: COAT }).click()
  await buyer.page.getByLabel('Comment').fill('Just like the photos.')
  await button(buyer.page, 'Post').click()
  await buyer.page.getByLabel('Reply').waitFor({ timeout: 60_000 })
  const [[, reviewed]] = (await entriesOf(buyerAddress, 'review')) as unknown as [[string, { entry: { body: any } }]]
  assert.deepEqual(reviewed.entry.body, { asDescribed: 'yes', subject: seller, text: 'Just like the photos.', score: '10', post: `${seller}/${coatPath}` })

  // From the buyer's profile, Review beside New request: a vouch (no score), then a report, each about the seller by address; Given lists all three.
  await button(buyer.page, 'Back').click()
  await button(buyer.page, 'Back').click()
  await buyer.page.getByRole('heading', { name: 'Clothing buyer' }).waitFor()
  assert.deepEqual(await buyer.page.locator('.foot button').allTextContents(), ['Review', 'New request'], 'side by side')
  await shot(buyer.page, 'profile-review')
  await button(buyer.page, 'Review').click()
  await buyer.page.getByRole('heading', { name: 'Review' }).waitFor()
  // The profile itself: refused, in one line, under the box; Post says it no twice.
  await buyer.page.getByLabel('Their address').fill(buyerAddress)
  const own = buyer.page.getByText("That's this profile.")
  await own.waitFor()
  await button(buyer.page, 'Post').click()
  await buyer.page.waitForTimeout(500)
  assert.equal(await buyer.page.locator('main .line').count(), 1, 'one line, once')
  await buyer.page.getByLabel('Their address').fill(seller)
  await shield(buyer.page.locator('.who', { hasText: 'Clothing seller' })).waitFor()
  await button(buyer.page, 'No score').click()
  await buyer.page.getByText("You know they're real.").waitFor()
  assert.equal(await buyer.page.getByLabel('Score').count(), 0, 'no score: a vouch')
  await buyer.page.getByLabel('Comment').fill('Real and kind.')
  await button(buyer.page, 'Post').click()
  await button(buyer.page, 'Review').waitFor({ timeout: 60_000 })
  await button(buyer.page, 'Review').click()
  await buyer.page.getByLabel('Their address').fill(seller)
  await buyer.page.locator('.who', { hasText: 'Clothing seller' }).waitFor()
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
  for (let i = 0; i < 3; i++) await given.nth(i).locator('.who', { hasText: 'Clothing seller' }).waitFor()
  await shot(buyer.page, 'reviews-given')
  for (const kind of ['vouch', 'report']) assert.equal((await entriesOf(buyerAddress, kind)).length, 1, `one ${kind}, in the buyer's folder`)
  await buyer.context.close()

  // The seller: the index's rating on the card, with the dot.
  await button(page, 'Back').click()
  const card = await untilCard(page, 'Clothing seller', '★ 10.0')
  await card.locator('.card-line', { hasText: '1 offer · ★ 10.0 · 1 review' }).waitFor()
  await card.locator('.dot').waitFor()
  // The review, the vouch and the report: "3 new" on the profile's rating line, once the index counts all three; the message, 1 on its inbox.
  await untilLine(page, 'Clothing seller', '★ 10.0 · 1 review · 3 new ›')
  await inbox(page).locator('.count', { hasText: '1' }).waitFor({ timeout: 45_000 })
  await shot(page, 'profile-new')
  // The bell counts the review, the vouch and the report; the inbox, the message.
  await button(page, 'Back').click()
  await page.locator('.places .count', { hasText: '3' }).waitFor({ timeout: 45_000 })
  await inbox(page).locator('.count', { hasText: '1' }).waitFor()
  await shot(page, 'profiles-rated')
  await page.locator('button.card', { hasText: 'Clothing seller' }).locator('.named').click()
  const line = page.locator('button.link').first()
  // Reviews marks the new ones; seeing them, they are new no more.
  await line.click()
  await page.locator('.big', { hasText: '10.0' }).waitFor()
  await page.getByText(`Rated by ${new URL(services.index).host}`).waitFor()
  const received = page.locator('button.said-row', { hasText: 'Just like the photos.' })
  await received.waitFor({ timeout: 60_000 })
  assert.equal(await page.locator('button.said-row').count(), 3)
  assert.equal(await page.locator('button.said-row .dot').count(), 3, 'each with its dot')
  await shot(page, 'reviews')
  await received.click()
  await page.getByText(/^On your Clothing seller · /).waitFor()
  await page.locator('.big', { hasText: '10 / 10' }).waitFor()
  const facts = page.locator('.facts')
  await facts.getByText('As described').waitFor()
  await facts.getByText('Yes').waitFor()
  await facts.getByText('Offer').waitFor()
  await facts.getByText(COAT).waitFor()
  await shield(facts.locator('.who', { hasText: 'Clothing buyer' })).waitFor()
  assert.ok(await button(page, 'Message').isVisible())
  assert.match((await button(page, 'Report').getAttribute('class')) ?? '', /danger/)
  await shot(page, 'received')
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  await button(page, '★ 10.0 · 1 review ›').waitFor()
  await button(page, 'Back').click()
  await page.locator('.places .count').waitFor({ state: 'detached' })
  assert.equal(await inbox(page).locator('.count').textContent(), '1', 'the bell counting nothing now, the three seen in Reviews; the inbox, the message')
  await page.locator('button.card', { hasText: 'Clothing seller' }).locator('.named').click()
  await button(page, '★ 10.0 · 1 review ›').click()
  await received.waitFor()
  assert.equal(await page.locator('button.said-row .dot').count(), 0, 'seen once: new no more')
  await button(page, 'Back').click()
  await button(page, 'Back').click()

  // Notifications: all that came to any profile, newest first, the three seen already, so with no
  // dot, and no message; its inbox, counting the message, opens every profile's conversations.
  await button(page, /Notifications$/).click()
  const rows = page.locator('main .rows button.row')
  await rows.nth(3).waitFor()
  assert.equal(await rows.count(), 4, 'no message row')
  assert.deepEqual(await rows.locator('.said-chip').allTextContents(), ['Report', 'Vouch', '10 ★', '9.4 ★'], "the coat's three, newest first, then the tutor's review")
  assert.equal(await rows.locator('.dot').count(), 0, 'seen in Reviews, or before this device forgot and started again')
  assert.equal(await rows.nth(0).locator('.said-text').textContent(), 'Sold me the wrong size twice.', 'in full')
  await named(rows.nth(0), 'Clothing seller')
  await inbox(page).locator('.count', { hasText: '1' }).waitFor()
  await shot(page, 'notifications')
  await closed(page)
  await inbox(page).click()
  await page.getByRole('heading', { name: 'Messages' }).waitFor()
  await page.getByText('1 new message').waitFor()
  assert.equal(await page.locator('.said-chip').count(), 0, 'messages only: no review, vouch or report')
  await button(page, 'Back').click()
  await button(page, 'Profiles').click()
  say('clothing: two photos redrawn and sent, a review, a vouch and a report; the rating, the dot, "3 new", the bell counting three and the inbox one, Reviews, and Notifications')
})

const TROUSERS = 'Linen trousers, worn once.'

test('a post an older market shaped: its row says Update this post; opened, what still fits is filled in; posted, it fits and the line is gone', async () => {
  const { page } = first
  // Written to the host as the app wrote it before the markets moved: one wearer, a size as text,
  // either for delivery, an area alone for its location.
  const main = await mainKey(seed, 'clothing/seller')
  const path = 'post/0123456789abcdef0123456789abcdef'
  const old = { description: TROUSERS, price: { amount: '25', currency: 'USD' }, kind: 'trousers', wearer: 'women', size: 'EU 38', delivery: 'either', location: { area: 'Lavapiés, Madrid' }, contact: '@coats' }
  assert.notEqual(loadMarkets().checkEntry('clothing', 'seller', 'post', old), null, "it doesn't fit the market today")
  const view = await readFolder([services.host], main.address, Date.now())
  const [outcome] = await write([services.host], [entry(main, path, old, nextTime(Date.now(), view, path))])
  assert.ok(outcome?.results.length === 1 && outcome.results[0]!.ok, 'written')

  await page.locator('button.card', { hasText: 'Clothing seller' }).locator('.named').click()
  const row = page.locator('.post-row', { hasText: TROUSERS })
  await row.getByText('Update this post', { exact: true }).waitFor()
  assert.equal(await page.locator('.post-row', { hasText: COAT }).getByText('Update this post').count(), 0, 'the coat fits')
  await shot(page, 'profile-update')
  await row.click()
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  // What still fits, filled in: the description, the price, the kind and the contact. Who it's for
  // and the delivery asked again; the location from the phone, its old area gone with it.
  assert.equal(await page.getByLabel('Description').inputValue(), TROUSERS)
  assert.equal(await page.getByLabel('Price').inputValue(), '25')
  assert.equal(await page.getByLabel('Kind', { exact: true }).inputValue(), 'trousers')
  assert.equal(await page.getByLabel('Contact').inputValue(), '@coats')
  assert.equal(await page.getByRole('group', { name: 'Wearer' }).locator('[aria-pressed=true]').count(), 0)
  assert.equal(await page.getByRole('group', { name: 'Delivery' }).locator('[aria-pressed=true]').count(), 0)
  await page.getByRole('group', { name: 'Location' }).getByText('Within 2 km of you', { exact: true }).waitFor()
  await shot(page, 'post-update')
  // For women: trousers then ask their waist, right after the kind.
  await page.getByRole('group', { name: 'Wearer' }).getByRole('button', { name: 'Women' }).click()
  await page.getByLabel('Waist', { exact: true }).selectOption({ label: 'W30' })
  await button(page, 'Post').click()
  await page.getByRole('heading', { name: 'Your offers' }).waitFor({ timeout: 60_000 })
  await page.locator('.post-row', { hasText: TROUSERS }).waitFor()
  assert.equal(await page.locator('.post-row', { hasText: TROUSERS }).getByText('Update this post').count(), 0, 'it fits now: the line is gone')
  const body = (await entriesOf(main.address, 'post')).find(([p]) => p === path)![1].entry.body as any
  assert.equal(loadMarkets().checkEntry('clothing', 'seller', 'post', body), null, 'it fits the market')
  assert.deepEqual([body.description, body.price, body.kind, body.wearer, body.waist, body.contact, body.location.radiusKm, body.location.area], [TROUSERS, { amount: '25', currency: 'USD' }, 'trousers', ['women'], 'w30', '@coats', 2, undefined])
  assert.deepEqual([body.size, body.delivery], [undefined, undefined], "what didn't fit, gone")
  await button(page, 'Back').click()
  say('an old post: Update this post on its row, what fits filled in, posted in the market\'s shape today')
})

const OWN = 'Patient with my own questions.'

test("for now, for testing, a review of one of the person's own profiles: from their student, about their tutor; Notifications shows it first, new; opened, it is seen", async () => {
  const { page } = first
  await page.locator('button.card', { hasText: 'Tutoring student' }).locator('.named').click()
  await button(page, 'Review').click()
  await page.getByLabel('Their address').fill(tutor)
  await shield(page.locator('.who', { hasText: 'Tutoring tutor' })).waitFor()
  assert.equal(await page.locator('main .line').count(), 0, 'not refused')
  const score = page.getByLabel('Score')
  await score.focus()
  await score.press('End')
  await page.getByLabel('Comment').fill(OWN)
  await shot(page, 'review-own')
  await button(page, 'Post').click()
  await button(page, 'Review').waitFor({ timeout: 60_000 })
  await button(page, 'Back').click()

  // Counted by the index, it is new: first of what came, with its dot, in full.
  const row = await untilNotice(page, OWN)
  await row.locator('.dot').waitFor()
  await named(row, 'Tutoring tutor')
  const rows = page.locator('main .rows button.row')
  assert.equal(await rows.nth(0).textContent().then((t) => t?.includes(OWN)), true, 'the newest first')
  await shot(page, 'notifications-new')
  // Shown, it is seen: the bell counts it no more.
  await page.locator('.places .count').waitFor({ state: 'detached' })
  await row.click()
  await page.getByText(/^On your Tutoring tutor · /).waitFor()
  await shield(page.locator('.facts .who', { hasText: 'Tutoring student' })).waitFor()
  await button(page, 'Back').click()
  await rows.nth(1).waitFor()
  assert.equal(await rows.locator('.dot').count(), 0, 'new no more')
  await button(page, 'Profiles').click()
  assert.equal(await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.dot').count(), 0, 'nor on its card')
  say("a review of one's own profile, for testing: posted, new in Notifications, seen once shown")
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
/** The AI's post as its row shows it: its subjects, then its price; its description shows when it is opened. */
const AI_ROW = 'Maths, Physics'

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
  assert.deepEqual(await ticks(page), { 'Clothing seller': 'false', 'Tutoring student': 'false', 'Tutoring tutor': 'false' }, 'none ticked: there are three')
  assert.ok(await button(page, 'Connect').isDisabled(), 'Connect once one is ticked')
  await named(page.getByRole('checkbox', { name: 'Tutoring tutor' }), 'Tutoring tutor')
  for (const words of ['Clothing seller', 'Tutoring student', 'Tutoring tutor']) await shield(page.getByRole('checkbox', { name: words })).waitFor()
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Connect's unlock icon, in its text color")
  await shot(page, 'connect')
  await page.getByRole('checkbox', { name: 'Tutoring tutor' }).click()
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
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.named').click()
  await page.locator('.post-row', { hasText: AI_ROW }).waitFor()
  await shot(page, 'profile-ai-post')

  // The device: the AI app's name, its day, its folder's address and its profile; no key.
  const local = await kept(page)
  const [conn] = await new App({ seed, hosts: [services.host] }).connections()
  assert.deepEqual(JSON.parse(local['forest.connections']!), [{ address: conn!.address, name: 'An AI app', time: conn!.view.current.get('connection')!.entry.time, labels: ['tutoring/tutor'] }])
  const all = JSON.stringify(local)
  for (const secret of [b64u.encode(conn!.key.secret), ...conn!.access.map((a) => a.body.key as string)]) assert.equal(all.includes(secret), false, 'never a key')
  say('an AI app connected: one unlock, and its post on the profile')
})

const VISIT = 'Physics for the visit, one hour online.'
const VISIT_NOTE = 'A note from the visit.'

test('a whole visit asks exactly once: post, edit, message, open messages, review, tick an AI app, the page hidden between each, as a window another covers is', async () => {
  const { page, counts } = first
  await page.getByRole('heading', { name: 'Tutoring tutor' }).waitFor()
  const asked = counts.asserted
  // Post: the one unlock.
  await button(page, 'New offer').click()
  await page.getByLabel('Description').fill(VISIT)
  await page.getByLabel('Price').fill('20')
  await page.getByRole('group', { name: 'Per' }).getByRole('button', { name: 'per hour' }).click()
  await page.getByRole('group', { name: 'Subjects' }).getByRole('button', { name: 'Physics' }).click()
  await page.getByRole('group', { name: 'Mode' }).getByRole('button', { name: 'Online' }).click()
  await page.getByLabel('Contact').fill('ada@example.com')
  assert.equal(await asks(button(page, 'Post')), true, 'Post will ask: the one unlock of the visit')
  await button(page, 'Post').click()
  const posted = page.locator('.post-row', { hasText: '$20 per hour' })
  await posted.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1)
  await away(page)
  // Edit.
  await posted.click()
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  await page.getByLabel('Price').fill('25')
  assert.equal(await asks(button(page, 'Post')), false, 'hidden, and the seed still held')
  await button(page, 'Post').click()
  const edited = page.locator('.post-row', { hasText: '$25 per hour' })
  await edited.waitFor({ timeout: 60_000 })
  await away(page)
  // Open messages: by themselves, the seed held.
  await inbox(page).click()
  await page.locator('button.row', { hasText: 'Tutoring student' }).first().waitFor({ timeout: 60_000 })
  assert.equal(await page.locator('.messages-row').count(), 0, 'no Open')
  await away(page)
  // Message: from their student to their tutor.
  await button(page, 'New message').click()
  await page.getByLabel('To').fill(tutor)
  await page.locator('.from', { hasText: 'Tutoring student' }).waitFor()
  await page.getByLabel('Message').fill(VISIT_NOTE)
  assert.equal(await asks(button(page, 'Send')), false)
  await button(page, 'Send').click()
  await page.locator('.said.mine', { hasText: VISIT_NOTE }).waitFor({ timeout: 60_000 })
  await away(page)
  // Review, from the thread.
  await button(page, 'Review').click()
  await shield(page.locator('.who', { hasText: 'Tutoring tutor' })).waitFor()
  const score = page.getByLabel('Score')
  await score.focus()
  await score.press('End')
  assert.equal(await asks(button(page, 'Post')), false)
  await button(page, 'Post').click()
  await page.getByLabel('Reply').waitFor({ timeout: 60_000 })
  await away(page)
  // The tutor's messages again: the note arrives and opens by itself.
  await button(page, 'Back').click()
  await page.locator('button.row', { hasText: VISIT_NOTE }).waitFor({ timeout: 90_000 })
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  // Tick an AI app: a profile given to it, and taken back.
  await button(page, 'Settings').click()
  await page.locator('button.row', { hasText: 'An AI app' }).click()
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  for (const ticked of [true, false]) {
    await page.getByRole('checkbox', { name: 'Clothing seller' }).click()
    await page.getByRole('checkbox', { name: 'Clothing seller', checked: ticked }).waitFor({ timeout: 60_000 })
    await button(page, 'Disconnect').and(page.locator(':enabled')).waitFor()
    await away(page)
  }
  assert.equal(await page.locator('p.line').count(), 0, (await page.locator('p.line').allTextContents()).join(' '))
  // The visit's post deleted, which asks nothing either.
  await button(page, 'Back').click()
  await button(page, 'Profiles').click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.named').click()
  await edited.click()
  await button(page, 'Delete').click()
  await button(page, 'Delete').click()
  await page.getByRole('heading', { name: 'Your offers' }).waitFor({ timeout: 60_000 })
  await edited.waitFor({ state: 'detached' })
  assert.equal(counts.asserted - asked, 1, 'the whole visit, one unlock')
  // The page closed, as the next tests start: the seed dropped.
  await page.goto(APP)
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.named').click()
  say('a whole visit: post, edit, open messages, message, review, an AI app ticked and unticked, a post deleted, one unlock')
})

test('Settings, AI apps: the AI app, its day and its one profile, kept ticked while it is the last; another ticked, one unlock, then one unticked and ticked again, and Disconnect, nothing more asked, with no new login; its next call refused, its post kept', async () => {
  const { page, counts } = first
  await button(page, 'Back').click()
  await button(page, 'Settings').click()
  assert.deepEqual(await page.getByRole('heading', { level: 2 }).allTextContents(), ['Verified', 'Passkeys', 'AI apps', 'Appearance'], 'between Passkeys and Appearance')
  const row = page.locator('button.row', { hasText: 'An AI app' })
  assert.match((await row.textContent()) ?? '', /^An AI app\d{1,2} \w{3}1 profile$|^An AI app\w{3} \d{1,2}1 profile$/, 'its name, its day, its one profile')
  assert.equal(await button(page, 'Find AI apps').count(), 0, 'every key listed is one this device made')
  await shot(page, 'settings-ai')
  await row.click()
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  assert.deepEqual(await ticks(page), { 'Clothing seller': 'false', 'Tutoring student': 'false', 'Tutoring tutor': 'true' })
  assert.ok(await page.getByRole('checkbox', { name: 'Tutoring tutor' }).isDisabled(), 'the last one stays ticked')
  await noLockOnRows(page)
  assert.equal(await button(page, 'Disconnect').locator('.unlock').count(), 1, 'Disconnect keeps its unlock icon')
  await shot(page, 'ai-app')

  /** One tick, and the AI's profiles after it, with no new login; `unlocks`, how many it asked: one, or none with the seed held. */
  const tickOne = async (words: string, ticked: boolean, profiles: string[], unlocks: number) => {
    const asked = counts.asserted
    await page.getByRole('checkbox', { name: words }).click()
    await page.getByRole('checkbox', { name: words, checked: ticked }).waitFor({ timeout: 60_000 })
    await button(page, 'Disconnect').and(page.locator(':enabled')).waitFor()
    assert.equal(await page.locator('p.line').count(), 0, (await page.locator('p.line').allTextContents()).join(' '))
    assert.equal(counts.asserted - asked, unlocks, unlocks ? 'one unlock' : 'nothing asked: the seed held')
    assert.deepEqual(await tool(ai, 'my_profiles'), { profiles: profiles.map((label) => ({ label, can: SWITCHES })) })
  }
  await tickOne('Clothing seller', true, ['clothing/seller', 'tutoring/tutor'], 1)
  assert.equal(await asks(button(page, 'Disconnect')), false, 'Disconnect, with the seed held, shows no unlock icon')
  await tickOne('Tutoring tutor', false, ['clothing/seller'], 0)
  assert.ok(await page.getByRole('checkbox', { name: 'Clothing seller' }).isDisabled(), 'now the seller is the last')
  await tickOne('Tutoring tutor', true, ['clothing/seller', 'tutoring/tutor'], 0)

  const asked = counts.asserted
  await button(page, 'Disconnect').click()
  await page.getByRole('heading', { name: 'Settings' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked: the seed held')
  assert.equal(await page.locator('button.row', { hasText: 'An AI app' }).count(), 0)
  await assert.rejects(ai.client.callTool({ name: 'my_profiles', arguments: {} }), (err: Error) => err.constructor.name === 'UnauthorizedError', 'its next call refused')
  assert.deepEqual(JSON.parse((await kept(page))['forest.connections']!), [])
  await button(page, 'Profiles').click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.named').click()
  await page.locator('.post-row', { hasText: AI_ROW }).waitFor()
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
  await imNew(p)
  await faceCheck(p)
  await p.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  await p.page.getByLabel('Search').fill('tutoring')
  await button(p.page, 'Tutoring').click()
  await button(p.page, 'Student').click()
  await p.page.getByRole('heading', { name: 'An AI app' }).waitFor({ timeout: 120_000 })
  assert.equal(await p.page.getByRole('heading', { name: 'Use Forest from your AI' }).count(), 0, 'no Use Forest from your AI')
  assert.equal(await p.page.getByRole('heading', { name: 'Add a second passkey' }).count(), 0, 'nor Add a second passkey')
  assert.deepEqual(await ticks(p.page), { 'Tutoring student': 'true' }, 'its one profile, ticked')
  const asked = p.counts.asserted
  const code = backToTheAiApp(p.page)
  await button(p.page, 'Connect').click()
  await login.transport.finishAuth(await code)
  assert.equal(p.counts.asserted - asked, 0, 'nothing asked: the seed held since Start')
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

test('held for review: Being reviewed, and the app keeps asking; the page hidden meanwhile keeps the seed; approved, Continue, nothing asked; after 5 minutes with nothing done, Continue asks once', async () => {
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
  // Away from the app while a person reviews it: hidden is not closed, so the seed stays, and keeping the stamp asks nothing.
  await away(p.page)
  const asked = p.counts.asserted
  const keep = button(p.page, 'Continue')
  await keep.waitFor({ timeout: 90_000 })
  assert.equal(await asks(keep), false, 'Continue will ask nothing')
  await keep.click()
  await p.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  assert.equal(p.counts.asserted - asked, 0, 'nothing asked: the seed held')
  assert.ok(held >= 3, 'it kept asking')
  await p.context.close()

  // The same, its clock run 5 minutes past the last action while the review waits: Continue asks once.
  const q = await phone()
  let waits = 0
  await q.context.route(`${services.verifier}/face/stamp`, (route) => {
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST' }
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    if (waits++ < 1) return route.fulfill({ status: 202, headers: { ...cors, 'content-type': 'application/json' }, body: '{"waiting":"review"}' })
    return route.continue()
  })
  await q.page.clock.install()
  await newPerson(q)
  await q.page.getByText('Being reviewed').waitFor()
  await q.page.clock.fastForward('05:01')
  const again = button(q.page, 'Continue')
  await again.locator('.unlock').waitFor({ timeout: 90_000 })
  const before = q.counts.asserted
  await again.click()
  await q.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  assert.equal(q.counts.asserted - before, 1, 'one unlock, to keep the stamp')
  await q.context.close()
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

test("a deploy while the app is open: one quiet line says a new version is ready, with Reload; the old proof worker gone, the page reloads once, back on a market's roles, and the profile is made", async () => {
  const { page } = first
  await page.goto(`${APP}new`)
  await button(page, 'Electronics').click()
  await button(page, 'Seller').waitFor()
  const before = await page.evaluate(() => document.querySelector('script[type=module]')?.getAttribute('src') ?? '')
  assert.ok(!before.includes('-next-'))
  // Nothing newer yet: back in view, the page asks, and says nothing.
  await away(page)
  await page.waitForTimeout(1_000)
  assert.equal(await page.getByText('A new version is ready.').count(), 0, 'the version live is this one')
  // The next version in place of this one, its service worker taking over: this version's files are gone.
  server.root = nextDir
  await page.evaluate(async () => {
    const changed = new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }))
    await (await navigator.serviceWorker.getRegistration())!.update()
    await changed
  })
  // Back in view, the page asks the server which version is live, and says so, quietly, at the top, with Reload.
  await away(page)
  const ready = page.locator('p.line', { hasText: 'A new version is ready.' })
  await ready.waitFor()
  assert.ok(await ready.getByRole('button', { name: 'Reload' }).isVisible())
  assert.ok((await ready.boundingBox())!.y < (await page.getByRole('heading', { name: 'Electronics' }).boundingBox())!.y, 'above the screen')
  await shot(page, 'new-version')
  const loads: string[] = []
  page.on('load', () => loads.push(page.url()))
  await button(page, 'Seller').click()
  await page.waitForEvent('load', { timeout: 60_000 })
  assert.deepEqual(loads.map((u) => new URL(u).pathname), ['/new'], 'one reload, back on New profile')
  assert.ok((await page.evaluate(() => document.querySelector('script[type=module]')?.getAttribute('src') ?? '')).includes('-next-'), 'on the next version')
  await page.getByRole('heading', { name: 'Electronics' }).waitFor()
  await button(page, 'Seller').click()
  await page.getByRole('heading', { name: 'Electronics seller' }).waitFor({ timeout: 120_000 })
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
  const { consent } = (await (await fetch(`${services.verifier}/`)).json()) as { consent: string }
  await page.getByText('What the check keeps').click()
  assert.equal(await page.locator('.consent').textContent(), consent, "the consent screen the verifier serves, word for word")
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
  for (let i = 0; i < n; i++) {
    await shield(cards.nth(i), 'id').waitFor()
    assert.equal(await filled(shield(cards.nth(i), 'id')), true, "the ID check's shield, filled")
  }
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
  // The same shield everywhere: the profile's title; New message's To, who it is, and From.
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.named').click()
  await shield(page.getByRole('heading', { name: 'Tutoring tutor' }), 'id').waitFor()
  await shot(page, 'profile-id')
  await page.getByRole('button', { name: /^Messages/ }).click()
  await button(page, 'New message').click()
  await page.getByLabel('To').fill(tutor)
  await shield(page.locator('.who', { hasText: 'Tutoring tutor' }), 'id').waitFor({ timeout: 60_000 })
  await shield(page.locator('.from', { hasText: 'Tutoring student' }), 'id').waitFor()
  await shot(page, 'message-id')
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  // Settings: Face with its outline, ID with its filled shield, which, tapped, says so.
  await button(page, 'Settings').click()
  const id = page.locator('div.row', { hasText: 'ID' })
  await shield(id, 'id').waitFor()
  assert.equal(await filled(shield(page.locator('div.row', { hasText: 'Face' }))), false, 'Face, an outline')
  assert.equal(await button(page, '+ $5').count(), 0)
  await shield(id, 'id').click()
  await page.getByText('Verified with ID', { exact: true }).waitFor()
  await shot(page, 'settings-id')
  // The connect page's ticks, from an AI app's login: each profile with its filled shield.
  const login = await aiLogin()
  await page.goto(login.app.authorization!.href)
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  for (const words of ['Clothing seller', 'Tutoring student', 'Tutoring tutor']) await shield(page.getByRole('checkbox', { name: words }), 'id').waitFor()
  await shot(page, 'connect-id')
  await login.client.close()
  await page.goto(APP)
  say('the ID check: paid through the stand-in Stripe, one unlock, both verifications on every profile, and its filled shield everywhere')
})

test('the seed held for 5 minutes after the last action: a button that will not ask shows no unlock icon, until the 5 minutes run out', async () => {
  const { page, counts } = first
  await page.clock.install()
  await page.goto(APP)
  await messagesOf(page, 'Tutoring tutor')
  const open = button(page, 'Open')
  assert.equal(await asks(open), true, 'a page just opened holds no seed: Open will ask')
  const asked = counts.asserted
  await open.click()
  await page.locator('.messages-row').waitFor({ state: 'detached', timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  await button(page, 'New message').click()
  const send = button(page, 'Send')
  assert.equal(await asks(send), false, 'within the 5 minutes, Send will ask nothing')
  await page.clock.fastForward('04:50')
  assert.equal(await asks(send), false, 'still held')
  await page.clock.fastForward('00:15')
  await send.locator('.unlock').waitFor()
  await shot(page, 'message-asks-again')
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  say('the seed held 5 minutes after the last action, then dropped: the unlock icon back')
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
