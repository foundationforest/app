// The app in headless Chromium, through Playwright, with Chrome's virtual passkey authenticator,
// which has PRF, against services' own verifier (its stand-in Didit and stand-in face model), host
// and index on loopback (services.ts), and services' own mcp, its APP_URL this app's /connect, as
// services' tests run it (mcp/test/setup.ts: its host reached with plain fetch, on loopback), and
// OpenFreeMap's stand-in for the map's tiles (tiles.ts). The app is built with its config pointed at
// them, served as Vercel serves it (vercel.ts: vercel.json's headers, its files, its rewrites, else
// 404) under vercel.json's CSP, its connect-src and img-src naming these services, at
// app.forest.foundation mapped to loopback and taken as a secure origin, so its passkeys are made
// for that address.
//
//   ./standard.sh services && npm run test:browser
//
//  1. Start, on a device that knows no passkey: the deep green, Forest, one cream Start, nothing
//     asked; tapped, First time here?, Yes, I'm new the primary and I use Forest on another device
//     with its QR code, neither with the unlock icon; the second with the passkey sheet closed: No
//     passkey found, its line, Try again with its QR code and Type my 24 words; Yes, I'm new made
//     the passkey for app.forest.foundation and opened Get verified, nothing asked. Here and on
//     every screen below with a filled button, its icon takes its text color.
//  2. Back on each setup step: Get verified, its title, its line, two cards (Selfie, Free, its
//     credits; ID, $5 one time, ten times them, stronger trust, Forest supported), and "You can add
//     the other one later.", back to Start, which now asks for the passkey made alone, never First
//     time here?, and goes straight back to Get verified; the ID card's sheet, ID check, $5 one time,
//     "You're only charged if it passes." and nothing more, What the check keeps closed, then the
//     verifier's words word for word before Pay, which asks nothing with the seed held, and "Payment
//     isn't available right now." once paying fails, then the sheet closed; the selfie, in this same
//     tab, left unfinished at Didit: back at /back, the passkey asked by the page itself, nothing
//     tapped, then Waiting for your check, the loader and Open it again only; Open it again, in this
//     tab too, the same check, back where the browser wants a tap first: Continue, with the unlock
//     icon, one tap, one unlock; back to Get verified, the check still under way; Start again,
//     straight to the wait. On a laptop, the deep green panel beside it, the screen 520px wide at
//     most.
//  3. The selfie: its card, its check in this tab, Didit's page sending it back to /back, where the
//     page, which holds no seed, asks the passkey by itself, once, nothing tapped, and keeps the
//     stamp; the gift collected into the wallet; the stamp kept in the Profiles folder; nothing of
//     the seed kept, nothing waiting in the tab; then Your first profile, "You're verified" under it.
//  4. The first profile: Later, to Connect your AI, Skip, to Home, empty, whose New profile comes
//     back; every market a tile, a tint of its color with its icon in its color, two to a row; a
//     search over the markets, by their roles' words too; a tile's sheet, its roles, Seller on a
//     solid avatar and Buyer on a light one, each with Create, in the forest green, its plus while
//     the seed is held, closed; one Create, nothing asked, the seed held since the last unlock,
//     Making your Tutoring tutor, the
//     verification proven in the worker; Connect your AI: its line, Claude or ChatGPT, three steps
//     in the app picked, no links, Copy address copying the connector's address in full, Copied, and
//     the steps still there, Skip then Done, to Home; its profile entry on the host, its
//     verification checking as any reader checks it; its market's
//     avatar, solid, a tutor offering; no badge on its card: beside Your profiles, the person's, once,
//     the selfie check's, a face being scanned on the forest green, its words its label and title,
//     and the ID's outline, dashed and muted, which opens Get verified with the ID's sheet up; on the
//     profile's header, where its badge stands alone, a tap says "Verified with a selfie"; its
//     avatar the animal its address picks, white on its market's color, the same on its card; the
//     header on a tint of its market's color, its bottom corners rounded, in four parts: the market
//     small, the role big in the titles' face, Tutor, the badge right after it, and under them its
//     rating, none yet, no pill; two tabs, Offers and Reviews, Offers open, New offer with its plus
//     at the foot; at its top right, Messages, its own icon and no number while nothing is new, then
//     Share: Share copies its page on the index where there is no share sheet, and hands the sheet
//     that page where there is; Home with the mark, Search Forest opening the index in a new tab, no
//     Messages, the three tabs, the card its market in bold over its role, No reviews at its right,
//     no count while nothing is new, no chevron; New profile's role made shows the check, in Create's
//     forest green, which opens its profile, and no row anywhere shows the unlock icon; the role
//     sheet's avatars its market's icon, no animal; one search on Home, Search Forest, and New
//     profile floating at the bottom right above the tabs, forest with its plus, no dashed card.
//  5. You: Selfie, its badge's forest square, Verified on its mint chip; ID, its badge's outline,
//     dashed, its line from the verifier's gifts and Add, $5;
//     the rows Passkeys (1 passkey), Your AI, Appearance (Auto) and About Forest; Forget this device
//     in red with its icon. Appearance's sheet, from the bottom, one choice: radio rows, Dark picked
//     and the sheet closed, kept through a reload, then Auto. About Forest: Privacy, Terms and Source code, each in
//     a new tab, and the version. Your AI's Connect another opens Connect your AI, with a back and
//     no Skip. On a laptop, no tabs: the sidebar, its places, the profiles with their animals,
//     Profiles with its small mint New, which opens New profile, no New profile row and no AI card;
//     Appearance a dialog in the middle, about 420px wide, over the dimmed page, closed by Escape and
//     by a click outside; a profile opened from it; Home's New profile at its top right.
//  6. Two people: the first, whose phone allows its location, posts an offer from their profile,
//     its price per hour side by side, its subjects from a long list, a row whose sheet has a search
//     and ticks, its card its first line, its subjects, then $30 and per hour under it; its form the
//     market's: no place until sessions are In person (a chip with its tick), then the place right
//     after, one row with its pin, Choose on the map, and nothing of the map
//     asked for yet; its screen: Area, the map from OpenFreeMap's stand-in with its attribution, a
//     circle round the phone at the market's 5 km, its centre kept a few hundred metres from it, the
//     slider moved to 10 and a place name given, Done, and the row says so, its name, then how far;
//     opened again, the phone's back closes it, keeping the form; the place gone again with In person;
//     a contact, which no market
//     lists; asking nothing, the seed still held, so Post shows no unlock icon; the second
//     opens its link with nothing set up, goes through Start, Yes, I'm new and the selfie (the link
//     waiting in the tab through Didit's page and back), makes the profile on the other side from
//     the compose screen's From, To the link's profile as its card, by its short key once, its
//     market and role apart, and messages, nothing asked after the unlock back from the check; the
//     first sees it counted with nothing unlocked, on the card's avatar (1), the
//     Notifications tab, which counts everything new, and the Messages button of the profile and of
//     Notifications, Notifications holding no message and the profile no Messages line; the page
//     closed and opened again, Messages opens every profile's conversations: only what is true before
//     the unlock, the avatar of the profile it came to, its animal, "1 new message" and Open with its
//     unlock icon, no chips, New message the round pencil at the top and no back, the tabs below with
//     Notifications picked; every inbox opens in one unlock, chips for All and Tutoring tutor, a dot
//     in its market's color and no avatar; each row their animal, their short key, bold, in the key's
//     face, and the time of day, then the last message, bold with its dot, and nothing else: no
//     badge, no market or role, no "to your"; the thread with no tabs, its header, to which profile,
//     Review soft with its star; the reply in one row, the pill
//     and a round Send with its arrow, the time under each run and Today above them; Notifications
//     then says "Nothing yet.", its Messages no number; the second, their page closed and opened
//     again, opens Messages from their profile, picked to it before the unlock and after, reads the
//     reply beside what they sent, and reviews the tutor from the thread: Close, Score, Vouch and
//     Report, Score picked, its line, the slider's thumb hidden until touched, naming no listing.
//  7. A second browser, with the same passkey, answered from the first, as a phone answers through
//     the passkey sheet's QR code, from another device: I use Forest on another device, then the
//     sheet Save a passkey on this device?, Save with the unlock icon, and Not now; it finds the
//     profile and the stamp; it
//     makes a profile of its own, nothing asked again; the first, with nothing unlocked, shows New
//     profiles from another device, which, the page closed and opened again, one unlock reads.
//     Then a message from one of the person's profiles to another of theirs: To their tutor, From
//     their student; the seed held, the messages open by themselves, no Open, the inbox's read
//     slowed: the loader, hidden for its first half second, then shown; and it is sent, arrives and
//     opens by itself, new, with nothing asked.
//  8. One passkey per person: after Forget, Start finds the passkey, straight to Home, and asks
//     nothing more; with the sheet closed, No passkey found, Try again, Home, and never First time
//     here?.
//     Then passkeys, every one a row, with two virtual authenticators, which send no maker id:
//     Passkeys, from You, says Passkey, Main on mint (what the device knew of it went with Forget),
//     its key square and chevron, no Remove in the list, and the quiet line, no dot; its sheet, the
//     name its title, a Name field and Save, no Remove at all; renamed My phone, nothing asked, kept
//     on the device, then its name taken back; the phone's own manager, which keeps the first
//     passkey the new one excludes, refuses, in one red line; a security key, a second virtual
//     authenticator, makes one: Passkey 2, no line, renamed Security key; its sheet from the bottom,
//     Remove in red text at the left, Save at the right, no Cancel; on a laptop a dialog in the
//     middle, Remove, Cancel and Save, left to right, Cancel closing it, Main's with no Remove; a
//     browser holding only that one, answered through the QR code, Not now, opens the same profiles;
//     Remove on its sheet, tapped twice, the line back, and that browser's next unlock, its page closed and
//     opened again, says "This passkey no longer opens your profiles."; after Forget, its Start
//     opens its own seed, with no stamp: Get verified.
//     Then a browser signed in through the QR code saves a passkey: Save makes one there, added to
//     the first, the one in use there, so its next unlock asks it and not the phone; the first lists
//     it, Passkey 2, and removes it again from its sheet.
//     Then 24 words: Passkeys' Your 24 words, a sheet, its red warning square and its warning, Show
//     words asking the passkey though the seed is held, Cancel asking nothing; the standard's words
//     for the seed, in three columns, each its number, the line under them, nothing keeping them,
//     gone with Done and with a reload, which opens Passkeys; another browser, which
//     lists a Forest of its own (a passkey just made, Get verified, back), its passkey sheet closed
//     at Start, No passkey found, types them on Type my 24 words: "23 of 24" and Continue off; a
//     word wrong, a red line; then "These words open a different Forest." with Forget this device
//     in place of Continue, and no passkey made; forgotten, Continue, with the unlock icon, makes
//     one, and it opens the same profiles; its next unlock shows the same words, the passkey made
//     there Passkey 2; the first lists one passkey more.
//  9. Clothing, with the index: the first, the page closed and opened again so Post shows its unlock
//     icon, a moment hidden keeping it so, posts a coat with two photos in one unlock, redrawn on the device as JPEGs no longer
//     than 1600 pixels, their notes gone, no per to pick; for women, one of several, its chip with its
//     tick; then a coat from the kind's sheet, one choice, radio rows with no tick box and no Done, a
//     tap picking it and closing the sheet; and only then one size question, right after them, its
//     values by their labels (XL) on its sheet; its condition, one of five chips, a second pick
//     unpicking the first, no tick; picked up and shipped, a choice of several; its location the offer's kept point, the circle the map opens on, moved a
//     little from the phone's, within 3 km of Lavapiés, an exact spot showing no pin and no Done
//     until one is dropped; its card's price reading $40; the index lists it. A buyer, whose phone
//     hasn't allowed its location: told no before,
//     the map opens on the whole world, with no circle and no button for the location; a tap puts
//     the circle there and the map fits it, a drag carries it east and keeps a second centre; then
//     an exact spot, a tap on the map's middle, its one quiet line, posted exactly there; never
//     asked, the map's button asks, and the prompt refused, one quiet line, the button gone; the
//     map's code never in the service worker's install; their page closed and opened again, their
//     profile's messages, none new, show a lock, Open your messages and Open, never "No new
//     messages"; they write with the round pencil (their own address taken, From the other side;
//     Change, and the seller's page on the index taken as the seller's address) and review the
//     seller from the thread, a score with the market's own question in one row, As described, Yes
//     or No, naming no listing; then, from their profile's Reviews tab, under its quiet line, Review
//     someone asks who on a sheet, the seller among those they have a conversation with ("That's
//     this profile." there, once): a vouch, its mint square, written again in the same place, and a
//     report, its red square, Report in red; the tab lists all three, each its score or chip, then
//     the seller's short key and nothing else of them, the time at the right; one opens to edit; who
//     it is about, tapped, opens their profile, Not yours. The seller sees the rating with its star
//     over 1 review on the card and on the profile's pill, its dot and chevron, 1 on its Messages,
//     the tab and the card counting the three and the message; the pill opens the profile's
//     Reviews, the score large, how many and which index, marking the three, each a card with who
//     wrote it right after its score, by their key, and once seen there they are new no more, the
//     pill's dot gone, the tab counting the message alone; the review opened: the day, the score big
//     with its star, no listing named, From a row with who wrote it, their badge, market and role
//     and chevron, Message and Review back side by side, Review back the one filled, Report under
//     them in red; From opens their profile: Not yours, their header, their short key on its chip
//     with a pencil, no rating, one request and three written, Message filled, Review, which opens
//     Review about them, and See everything on the index in a new tab; Review back opens Review
//     about them too; Notifications lists all that came, under Today, newest first, in full, each
//     with the avatar of who wrote it, their key after its chip, and what it is on which profile,
//     with no dot and no message, and its Messages opens the messages, which hold no review.
//     Then someone else's profile from a conversation, and names: the seller's messages, one unlock;
//     the thread with the buyer, its header, by their key, a tap opening their profile; Message
//     there opens the conversation again; the naming sheet: the key its title, the full key with
//     Copy, an empty Name, Only you see it, Save asking nothing with the seed held; Marta saved, the
//     chip saying so, the key gone from beside it; underneath, one locked entry at names in the
//     Profiles folder, nothing readable, nothing in the seller's own folder, a copy on the device;
//     Marta in place of the key in the thread's header, Review's, Messages, Notifications (whose
//     name opens her profile) and the reviews she wrote; another browser, the same passkey
//     answering, has Marta after its one unlock at Start; Show the key instead takes it back, the
//     key again, the entry deleted, nothing kept; on a laptop, the naming sheet a dialog in the middle,
//     closed by Escape.
//     Then a listing an older market shaped, written to the host as the app wrote it before, days
//     ago: its card says Needs an update and opens its form, and Notifications holds a notice for
//     it under Earlier, its sun square and no time, the tab counting it; opened there, what still
//     fits is filled in; posted, it fits, and both go. Then a review an older market shaped: its
//     notice; opened, its kind kept, what still fits; posted, gone.
//     Then a review of one of the person's own profiles, from their student about their tutor:
//     refused on the who sheet, in one red line, nothing asked. Someone else, their Reviews tab
//     empty but for its one quiet line, vouches for the tutor: Notifications shows it first, new,
//     the avatar of who wrote it; once shown it is seen, the tab counting it no more, and a tap opens
//     the tutor's Reviews, the vouch among them, by their key. The tutor vouches back: with no score
//     yet, their pill reads 1 vouch, opening their Reviews.
//     Then the AI apps, with services' own mcp and an AI app as services' tests make one (the MCP
//     SDK's client, mcp/test/setup.ts):
//  a. its login comes to the connect page: the AI app's name, its redirect's host, the profiles
//     unticked, none with a badge; one ticked, Connect, one unlock; the AI app gets its token,
//     reads its profile and writes a listing, which shows on the profile; the device keeps the AI app,
//     never a key; a browser with the same seed, as one set up before the AI app connected: Your AI
//     empty, with no Find AI apps; its next unlock, for the messages, finds the AI app by itself;
//     Then a whole visit asks exactly once: from a page just opened, post, edit, open messages (by
//     themselves), message, review from a thread with someone else, the note arriving and opening
//     by itself, an AI app's profile ticked and unticked, and the listing deleted, the page hidden
//     between each;
//  b. You's Your AI: the AI app, its one profile, since its day; its screen, Connected and its day,
//     Acts for, kept ticked while it is the last; another ticked, one unlock, then one unticked and ticked again
//     with nothing asked, the AI's profiles following with no new login; Disconnect, nothing asked:
//     back on Your AI, the AI's next call refused, and its listing stays;
//  c. a new phone, nothing set up, at a connect page: First time here? with I use Forest on another
//     device first, the primary, then Yes, I'm new; the selfie and the first profile, then back to
//     the connect page (the login waiting in the tab through Didit's page and back), its one
//     profile ticked, no Connect your AI; Connect, nothing asked after the unlock back from the
//     check;
//  d. a connector that isn't ours: one line, nothing else; a request that ran out: one line.
// 10. A face seen before (face_seen, which services' next verifier answers; answered here in its
//     place): Get verified, its notice pointing to the ID, the selfie's card greyed, and, in place of
//     the line on the other check, I already use Forest, with the unlock icon; for someone verified
//     in another browser who made a passkey in this one by mistake: their passkey answers, as a phone
//     does through the QR code, this browser's is added to it as a backup, and they're in; opened
//     again, the first profile asks this browser's own passkey, which opens their Forest, and
//     their Profiles folder lists it; the other browser asked nothing more.
// 11. A manager that gives no PRF secret: its passkey dropped, the line naming another. A browser
//     that cannot ask for PRF: one quiet line.
// 12. The passkey belongs to app.forest.foundation: another page under forest.foundation is refused.
// 13. The build: its manifest, its service worker in control, installable, and nothing of the map
//     precached: its code comes with the place screen alone.
// 14. A deploy while the app is open: back in view, the page says nothing while its version is the
//     one live, then "A new version is ready." with Reload, above the screen; the next version takes
//     over and the old proof worker is gone; the page reloads once, back on a market's roles, and the
//     profile is made.
// 15. The ID check, from You's Add, $5: Get verified, the selfie's card greyed, the ID's sheet open:
//     ID check, $5 one time, "You're only charged if it passes.", What the check keeps, Pay $5, and
//     nothing more; the verifier's consent screen word for word, tapped open; Pay with the unlock
//     icon, since no seed is held and it asks the verifier first for an ID stamp this seed has, by
//     its stamp number: one unlock, none there; paid through the verifier's own stand-in for Stripe
//     (its test card named first), the payment kept on the device; Stripe's page, then at once,
//     nothing tapped, Didit's, both in this tab, no tab opened; back from Didit, one unlock asked by
//     the page itself; both verifications
//     on every profile, and both badges, the same forest square, the selfie's first, beside Your
//     profiles (no outline, none on a card), on the profile's header, To and From; You's ID Verified, nothing to add; the connect page's
//     ticks with no badge; a student's avatar light, a tint of its market's color. Every tick
//     and card, here and above, is tapped on the row itself, as a person taps it.
// 16. The seed held 5 minutes after the last action, on the page's clock: then Send shows its unlock
//     icon again.
// 17. A selfie that doesn't pass: Get verified, its notice, "That selfie didn't pass. Try again, or
//     use your ID."; then the ID: its sheet, the verifier's words before Pay, the stand-in Stripe,
//     then the ID check at once, in this tab, no Start between, one unlock back from it by itself,
//     and Your first profile.
// 18. The app on a laptop, 1280px wide: Home's cards three to a row of about 300px, every card one
//     height, rated or not, New profile at Home's top right, no dashed card; every name inside its card on
//     two lines and before its rating, the longest too (Software development developer, made from
//     the sidebar's New); Messages in two panes, the
//     conversations without a back on the left, nothing open on the right until one is tapped, then
//     it, marked in the list; the sidebar and Home in one order, the most recently used first, then a
//     listing an older market shaped putting its profile on top; past eight profiles (the device's
//     list made longer with the same seed's addresses, never written, so no more proofs), every one
//     in the sidebar, in Home's order, no All profiles, the sidebar scrolling inside itself and the
//     page not; Home lists them all, and its one search is Search Forest.
// 19. Nothing the app did, through all of it, was refused by the CSP.
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
import { exportWords, mainKey, openingHalf } from '../../standard/keys/dist/index.js'
import { checkVerification, stampFromJson } from '../../standard/proofs/dist/index.js'
import { loadMarkets } from '../../markets/build/dist/index.js'
import { type Served, serve } from '../../services/mcp/src/server.ts'
import { App } from '../../services/mcp/test/app.ts'
import { REDIRECT, aiApp, lesson } from '../../services/mcp/test/setup.ts'
import { colorIn, colorsFor } from '../../services/index/src/avatar.ts'
import { animalOf } from '../../src/animals.ts'
import { type Running, freePort, startServices } from './services.ts'
import { type Tiles, standInTiles } from './tiles.ts'
import { serveLikeVercel } from './vercel.ts'

const app = fileURLToPath(new URL('../../', import.meta.url))
const outDir = fileURLToPath(new URL('out/app', import.meta.url))
/** The next deploy: the same app, every chunk named anew. */
const nextDir = fileURLToPath(new URL('out/next', import.meta.url))
const shots = process.env.SHOTS
const say = (line: string) => console.log(`  ${line}`)

let services: Running
/** OpenFreeMap's stand-in, for the place screen's map. */
let tiles: Tiles
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

type Phone = { context: BrowserContext; page: Page; cdp: CDPSession; authenticator: string; counts: { created: number; asserted: number }; went: Went[] }
/** A stand-in's page the person was sent to, Stripe's or Didit's, and the tab it opened in. */
type Went = { to: 'stripe' | 'didit'; page: Page }
/** The first person's browser, its seed (asked of its passkey by the test itself), and their profile. */
let first: Phone
let seed: Uint8Array
let tutor: string
/** The clothing buyer's profile, another person's. */
let buyerAt: string

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

/** A point as a place holds it, in degrees as decimal text. */
type Point = { lat: string; lon: string }

/** The distance between two points, in kilometres. */
function kmApart(a: Point, b: Point): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const h = Math.sin(rad(Number(b.lat) - Number(a.lat)) / 2) ** 2 + Math.cos(rad(Number(a.lat))) * Math.cos(rad(Number(b.lat))) * Math.sin(rad(Number(b.lon) - Number(a.lon)) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/** The distance between a place's point and SPOT, in kilometres. */
const kmFromSpot = (p: Point) => kmApart(p, { lat: String(SPOT.latitude), lon: String(SPOT.longitude) })

/** A place's screen, opened from its row in the form, named by its field, once its map is drawn. */
async function placeScreen(page: Page, field: string) {
  await page.getByRole('group', { name: field }).getByRole('button').click()
  const screen = page.getByRole('dialog', { name: field })
  await screen.locator('.maplibregl-canvas').waitFor()
  return screen
}

/** The middle of a place screen's map, on the page. */
async function middleOf(screen: Locator) {
  const box = (await screen.locator('.map').boundingBox())!
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/** The centres this device keeps for areas, once there are `n`. */
async function keptPoints(page: Page, n: number): Promise<Point[]> {
  for (const until = Date.now() + 10_000; ; await page.waitForTimeout(100)) {
    const points = JSON.parse((await kept(page))['forest.points'] ?? '[]') as Point[]
    if (points.length === n) return points
    if (Date.now() > until) throw new Error(`the device keeps ${points.length} points, not ${n}`)
  }
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
  const went: Went[] = []
  // Didit's page, for the stand-in Didit's sessions: done at once, it sends the person back, as Didit does to the verifier's callback.
  await context.route('https://fake-didit.invalid/**', (route) => {
    went.push({ to: 'didit', page: route.request().frame().page() })
    return route.fulfill({ contentType: 'text/html', body: `<script>location.replace(${JSON.stringify(`${APP}back`)})</script>` })
  })
  // Stripe's Checkout page, the verifier's own stand-in's: paid at once, and back to the app's page, as Stripe sends the person.
  await context.route('https://checkout.stripe.example/**', (route) => {
    const payment = new URL(route.request().url()).pathname.split('/').pop()!
    services.payments.pay(payment)
    went.push({ to: 'stripe', page: route.request().frame().page() })
    return route.fulfill({ contentType: 'text/html', body: `<script>location.replace(${JSON.stringify(services.payments.returnUrls.get(payment))})</script>` })
  })
  // A browser that wants a tap before the passkey is asked (as Safari may): the next page the app
  // opens, once the test says so, has its first ask refused, as such a browser refuses it.
  await context.addInitScript(() => {
    if (localStorage.getItem('test.tap') !== 'first') return
    localStorage.removeItem('test.tap')
    const own = navigator.credentials.get.bind(navigator.credentials)
    navigator.credentials.get = () => {
      navigator.credentials.get = own
      return Promise.reject(new DOMException('A tap first.', 'NotAllowedError'))
    }
  })
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
  return { context, page, cdp, authenticator: authenticatorId, counts, went }
}

/** The next page the app opens in `p`'s browser wants a tap before it asks the passkey. */
const wantsATap = (p: Phone) => p.page.evaluate(() => localStorage.setItem('test.tap', 'first'))

/** Where `p` has been sent since `since` stand-in pages: each to and whether it was in `p`'s own tab. */
const wentFrom = (p: Phone, since: number) => p.went.slice(since).map((w) => [w.to, w.page === p.page])

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
/** The badge a verified profile shows for one of its checks: the same forest square, a face being scanned or an ID card inside; an icon, whose words show only when tapped. */
const badge = (within: { getByRole: Page['getByRole'] }, check: 'face' | 'id' = 'face') => within.getByRole('img', { name: check === 'id' ? 'Verified with ID' : 'Verified with a selfie', exact: true })
/** Home, its card for `words` there, and the person's badge of `check` beside Your profiles: the profiles found, and how the person is verified. */
async function homeWith(page: Page, words: string, check: 'face' | 'id' = 'face', timeout = 60_000) {
  await page.locator('button.card', { hasText: words }).waitFor({ timeout })
  await badge(page.getByRole('group', { name: "How you're verified" }), check).waitFor({ timeout })
}

/** Which badge it is, as drawn: on the forest green, both; a face being scanned inside, the selfie check's; an ID card, the ID check's. */
const drawnAs = (b: Locator) =>
  b.evaluate((el) => {
    const probe = document.body.appendChild(document.createElement('span'))
    probe.style.color = 'var(--forest)'
    const ground = getComputedStyle(probe).color
    probe.remove()
    return { check: (el as HTMLElement).dataset.check, icon: el.querySelector('svg')!.dataset.icon, ground: getComputedStyle(el).backgroundColor === ground }
  })
const SELFIE = { check: 'face', icon: 'scan-smiley', ground: true }
const ID = { check: 'id', icon: 'identification-card', ground: true }

/** A profile's avatar as drawn: its market's color (services' avatar.ts), solid or light, and its animal, or for a market or a role, its market's icon. */
const avatarOf = (av: Locator) =>
  av.evaluate((el) => ({ light: el.classList.contains('look'), h: getComputedStyle(el).getPropertyValue('--h').trim(), ground: getComputedStyle(el).backgroundColor, icon: el.querySelector('svg')?.dataset.icon ?? el.querySelector('svg')?.dataset.animal }))
/** The animal the app draws for the profile at `address`. */
const animal = (address: string) => animalOf(address)[0]
/** A market's color, as the app gives it: the directory walked in its order (services' avatar.ts). */
const colorOf = (market: string) => colorIn(colorsFor(loadMarkets().directory.markets.map((m) => m.name)), market)
/** `#3d76c9` as the page computes it: rgb(61, 118, 201). */
const rgbOf = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`

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

/** A small choice or edit on a laptop: a dialog in the middle of the screen, about 420px wide, over the dimmed page, no grab. */
async function inTheMiddle(page: Page, dialog: Locator) {
  await dialog.waitFor()
  const box = (await dialog.boundingBox())!
  const { width, height } = page.viewportSize()!
  assert.ok(Math.abs(box.width - 420) < 2, `about 420px wide: ${box.width}`)
  assert.ok(Math.abs(box.x + box.width / 2 - width / 2) < 2 && Math.abs(box.y + box.height / 2 - height / 2) < 2, `in the middle: ${JSON.stringify(box)}`)
  assert.ok(await page.locator('.scrim').isVisible(), 'over the dimmed page')
  assert.equal(await dialog.locator('.grab').isVisible(), false, 'no grab')
}

/** The same on a phone: a sheet risen from the bottom, its grab on top. */
async function fromTheBottom(page: Page, dialog: Locator) {
  await dialog.waitFor()
  const box = (await dialog.boundingBox())!
  assert.ok(Math.abs(box.y + box.height - page.viewportSize()!.height) < 2 && box.width === page.viewportSize()!.width, `from the bottom, the screen's width: ${JSON.stringify(box)}`)
  assert.ok(await dialog.locator('.grab').isVisible(), 'its grab')
}

/** Whether `b` shows the unlock icon: it does only when a tap on it will ask the passkey. */
const asks = async (b: Locator) => (await b.locator('.unlock').count()) === 1

/** The round Messages button at the top right of the screen: the way into messages, its number only when some are new. */
const inbox = (page: Page) => page.locator('.top-right').getByRole('button', { name: /^Messages/ })

/** A profile's messages, from its card on Home and the round button at its top: Messages, picked to it. */
async function messagesOf(page: Page, card: string) {
  await page.locator('button.card', { hasText: card }).click()
  await inbox(page).click()
  await page.getByRole('heading', { name: 'Messages', exact: true }).waitFor()
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
    await button(page, 'You').click()
    await button(page, /Notifications$/).click()
    const row = page.locator('main .rows .nrow', { hasText: text })
    try {
      await row.waitFor({ timeout: 5_000 })
      return row
    } catch {
      if (Date.now() > until) throw new Error(`Notifications never said ${text}`)
    }
  }
}
/** On Notifications, once its tab counts `n` beyond the messages its round button counts: the tab counts everything new, messages included. */
async function noticesCounted(page: Page, n: number) {
  const until = Date.now() + 45_000
  for (;;) {
    const [tab, messages] = await page.evaluate(() => ['.tabbar .count', '.top-right .round .count'].map((at) => Number(document.querySelector(at)?.textContent ?? 0)))
    if (tab! - messages! === n) return
    if (Date.now() > until) throw new Error(`the Notifications tab counts ${tab}, its Messages ${messages}: not ${n} beyond them`)
    await page.waitForTimeout(200)
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
    muted.style.color = 'var(--ink2)'
    el.append(muted)
    const ink2 = getComputedStyle(muted).color
    muted.remove()
    const [market, role] = [el.querySelector('strong')!, el.querySelector('.role')!]
    return { text: el.textContent, market: [market.textContent, getComputedStyle(market).fontWeight], role: [role.textContent, getComputedStyle(role).fontWeight, getComputedStyle(role).color === ink2] }
  })
  const [market, role] = [words.slice(0, words.lastIndexOf(' ')), words.slice(words.lastIndexOf(' ') + 1)]
  assert.deepEqual(seen, { text: words, market: [market, '700'], role: [role, '500', true] }, `${words}: the market in bold, the role muted, nothing between`)
}

/** Another profile's market and role, as it shows apart from who they are to the person: the market in its color, bold, then the role, muted. */
async function mkrIn(within: Locator, market: string, role: string) {
  const m = within.locator('.mkr', { hasText: `${market} ${role}` }).first()
  await m.waitFor()
  const seen = await m.evaluate((el) => {
    const [mk, r] = [el.querySelector('.m')!, el.querySelector('.r')!]
    return [mk.textContent, getComputedStyle(mk).fontWeight, r.textContent, getComputedStyle(r).color]
  })
  assert.deepEqual(seen, [market, '700', role, await muted(within.page())], `${market} ${role}: the market bold in its color, the role muted`)
}

/** An address cut short, as the app shows a profile no one named: its start and end. */
const short = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`

/** A profile's card on Home: its market in bold over its role, muted. */
async function cardNamed(card: Locator, market: string, role: string) {
  const seen = await card.locator('.nm2').evaluate((el) => {
    const [m, r] = [el.querySelector('strong')!, el.querySelector('span')!]
    return [m.textContent, getComputedStyle(m).fontWeight, r.textContent, getComputedStyle(r).fontWeight]
  })
  assert.deepEqual(seen, [market, '700', role, '400'], `${market} ${role}: the market in bold over the role`)
}

/** On a field with a long list, its row tapped, then `words` on its sheet: of one choice, a radio row, picked, closes it; of several, a tick box, and Done does. */
async function pick(page: Page, field: string, words: string) {
  await page.getByRole('group', { name: field, exact: true }).locator('button.open-row').click()
  const sheet = page.getByRole('dialog', { name: field })
  const one = (await sheet.getByRole('radiogroup').count()) === 1
  await sheet.getByRole(one ? 'radio' : 'checkbox', { name: words, exact: true }).click()
  if (!one) await sheet.getByRole('button', { name: 'Done' }).click()
  await sheet.waitFor({ state: 'detached' })
}

/** The quiet tone, ink3, as the page draws it now. */
const muted = (page: Page) =>
  page.evaluate(() => {
    const span = document.body.appendChild(document.createElement('span'))
    span.style.color = 'var(--ink3)'
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

/** Get verified's two cards, by their names. */
const checkCard = (page: Page, name: 'Selfie' | 'ID') => page.getByRole('button', { name: new RegExp(`^${name}(?![a-z])`) })

/** The selfie's card tapped on Get verified: its check in this tab, Didit's page sending it back to /back, where the page asks the passkey by itself. */
async function faceCheck(p: Phone) {
  await p.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  const since = p.went.length
  await checkCard(p.page, 'Selfie').click()
  await backFrom(p, since)
  assert.deepEqual(wentFrom(p, since), [['didit', true]], "Didit's page, in this tab")
}

/** Back in the app from the stand-in pages `p` was sent to since `since`: once Didit's has been, the app's own page again. */
async function backFrom(p: Phone, since: number) {
  for (const until = Date.now() + 60_000; !p.went.slice(since).some((w) => w.to === 'didit'); await p.page.waitForTimeout(100)) if (Date.now() > until) throw new Error("never sent to Didit's page")
  await p.page.waitForURL(`${APP}id`, { timeout: 60_000 })
}

/** Start on a device that knows no passkey: its sheet, First time here?, and Yes, I'm new, which makes the passkey. */
async function imNew(p: Phone) {
  await button(p.page, 'Start').click()
  await p.page.getByRole('dialog', { name: 'First time here?' }).waitFor()
  await button(p.page, "Yes, I'm new").click()
}

/** A new person in `p`'s browser through Start, Yes, I'm new, and the selfie. */
async function newPerson(p: Phone) {
  await p.page.goto(APP)
  await imNew(p)
  await faceCheck(p)
}

/** Start on a device that knows no passkey: its sheet, and I use Forest on another device, which asks for any. */
async function elsewhere(p: Phone) {
  await button(p.page, 'Start').click()
  await button(p.page, 'I use Forest on another device').click()
}

/** A role's Create on the role sheet: Create seller. */
const create = (role: string) => ({ name: `Create ${role}`, exact: true })

/** A profile's name, "Clothing seller", as its market and its role. */
const split = (words: string) => [words.slice(0, words.lastIndexOf(' ')), words.slice(words.lastIndexOf(' ') + 1)] as [string, string]

/** One of the markets' roles picked on New profile: its market's tile found by searching, then its role on the tile's sheet; one unlock, then its profile. */
async function pickProfile(page: Page, words: string) {
  const [market, role] = split(words)
  await page.getByLabel('Search').fill(market.toLowerCase())
  await button(page, market).click()
  await page.getByRole('button', create(role)).click()
  await page.getByRole('heading', { name: words }).waitFor({ timeout: 120_000 })
}

/** A first profile picked on Your first profile, as on New profile; one unlock, then Connect your AI. */
async function pickFirst(page: Page, words: string) {
  const [market, role] = split(words)
  await page.getByLabel('Search').fill(market.toLowerCase())
  await button(page, market).click()
  await page.getByRole('button', create(role)).click()
  await page.getByRole('heading', { name: 'Connect your AI' }).waitFor({ timeout: 120_000 })
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

/** The rating pill under a profile's role, or its line, its parts as they read: 10.0 1 review. */
const lineOf = async (page: Page) =>
  (await page.locator('.ratepill > *, .rate-line').allTextContents())
    .map((t) => t.replace(/^· /, ''))
    .filter(Boolean)
    .join(' ')

/** A profile opened again and again from its card, so it reads the index each time, until its rating line says `text`. */
async function untilLine(page: Page, card: string, text: string) {
  const until = Date.now() + 90_000
  for (;;) {
    await page.locator('button.card', { hasText: card }).click()
    await page.locator('.ratepill, .rate-line').first().waitFor({ timeout: 10_000 })
    if ((await lineOf(page)).includes(text)) return
    if (Date.now() > until) throw new Error(`${card}'s rating line never said ${text}`)
    await button(page, 'Back').click()
    await button(page, 'You').click()
    await button(page, 'Home').click()
    await page.waitForTimeout(1_000)
  }
}

/** What a card says: its words, and the words of what it shows as a sign alone (its new-count, 3 new). */
const cardSays = (card: Locator, timeout = 10_000) => card.evaluate((el) => [el.textContent ?? '', ...[...el.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label'))].join(' '), undefined, { timeout })

/** Home opened again and again, so it reads the index each time, until `card` says `text`. */
async function untilCard(page: Page, card: string, text: string) {
  const until = Date.now() + 90_000
  for (;;) {
    await button(page, 'You').click()
    await button(page, 'Home').click()
    const line = page.locator('button.card', { hasText: card })
    if ((await cardSays(line)).includes(text)) return line
    if (Date.now() > until) throw new Error(`${card} never said ${text}`)
    await page.waitForTimeout(1_000)
  }
}

before(async () => {
  const port = await freePort()
  APP = `http://app.forest.foundation:${port}/`
  OTHER = `http://other.forest.foundation:${port}/`
  services = await startServices({ appOrigin: APP.slice(0, -1), say })
  tiles = await standInTiles()
  mcpDir = mkdtempSync(join(tmpdir(), 'forest-app-mcp-'))
  mcp = await serve({ appUrl: `${APP}connect`, dataDir: mcpDir, read: { index: services.index }, hostFetch: fetch }, '127.0.0.1', 0)
  // The app's one config file, pointed at these services (src/config.ts).
  process.env.VITE_FOREST_CONFIG = JSON.stringify({ app: APP.slice(0, -1), verifier: services.verifier, host: services.host, connector: mcp.origin, index: services.index, tiles: tiles.origin })
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir, emptyOutDir: true } })
  const renamed = { entryFileNames: 'assets/[name]-next-[hash].js', chunkFileNames: 'assets/[name]-next-[hash].js' }
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir: nextDir, emptyOutDir: true, rolldownOptions: { output: renamed } }, worker: { rolldownOptions: { output: renamed } } })
  // vercel.json's CSP, its connect-src and img-src naming these services in place of ours (test/build.test.ts checks it names ours).
  const vercel = JSON.parse(readFileSync(`${app}vercel.json`, 'utf8'))
  const real: string = vercel.headers.find((h: any) => h.source === '/(.*)').headers.find((h: any) => h.key === 'Content-Security-Policy').value
  csp = real
    .split('; ')
    .map((d) => (d.startsWith('connect-src ') ? `connect-src 'self' ${services.verifier} ${services.host} ${mcp.origin} ${services.index} ${tiles.origin}` : d.startsWith('img-src ') ? d.replace('https://host.forest.foundation', services.host) : d))
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
  await tiles?.close()
  if (mcpDir) rmSync(mcpDir, { recursive: true, force: true })
  await services?.stop()
})

test("Start, on a device that knows no passkey: one cream Start, nothing asked; First time here?; with the passkey sheet closed, No passkey found; Yes, I'm new made the passkey for app.forest.foundation and opened Get verified", async () => {
  const { page, counts, cdp, authenticator } = first
  const res = await page.goto(APP)
  assert.equal(res?.headers()['content-security-policy'], csp, 'the page comes with the CSP')
  const start = button(page, 'Start')
  await start.waitFor()
  assert.deepEqual((await page.locator('main button').allTextContents()).map((t) => t.trim()), ['Start'], 'one button')
  assert.match((await start.getAttribute('class')) ?? '', /cream/)
  await page.getByRole('heading', { name: 'Forest' }).waitFor()
  assert.equal(counts.asserted + counts.created, 0, 'nothing asked')
  await shot(page, 'start')
  await start.click()
  const sheet = page.getByRole('dialog', { name: 'First time here?' })
  await sheet.waitFor()
  assert.deepEqual((await sheet.getByRole('button').allTextContents()).map((t) => t.trim()), ["Yes, I'm new", 'I use Forest on another device'])
  assert.match((await button(page, "Yes, I'm new").getAttribute('class')) ?? '', /primary/)
  assert.equal(await button(page, 'I use Forest on another device').locator('[data-icon="qr-code"]').count(), 1, 'with its QR code')
  assert.equal(await page.locator('.unlock').count(), 0, 'no unlock icon on Start or its sheet, where every button asks')
  assert.equal(counts.asserted + counts.created, 0, 'nothing asked yet')
  await shot(page, 'start-first-time')
  // The passkey sheet closed: a browser can't tell that from no passkey, so No passkey found, and its two ways on.
  await closeTheSheetOnce(page)
  await button(page, 'I use Forest on another device').click()
  const none = page.getByRole('dialog', { name: 'No passkey found' })
  await none.getByText('Try again with the device that has it, or type your 24 words.').waitFor()
  assert.deepEqual((await none.getByRole('button').allTextContents()).map((t) => t.trim()), ['Try again', 'Type my 24 words'])
  assert.equal(await button(page, 'Try again').locator('[data-icon="qr-code"]').count(), 1, 'Try again, with its QR code')
  assert.match((await button(page, 'Type my 24 words').getAttribute('class')) ?? '', /quiet/)
  assert.equal(await page.locator('.unlock').count(), 0, 'and no unlock icon')
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Try again's QR code, in its text color")
  assert.equal(counts.created, 0, 'nothing made')
  await shot(page, 'start-no-passkey')
  // Closed, and Start again: Yes, I'm new makes the passkey, and Get verified.
  await page.keyboard.press('Escape')
  await none.waitFor({ state: 'detached' })
  await imNew(first)
  await page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.created, 1)
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId: authenticator })
  assert.deepEqual(credentials.map((c) => [c.rpId, c.isResidentCredential]), [['app.forest.foundation', true]])
  const local = await kept(page)
  assert.deepEqual(Object.keys(local).sort(), ['forest.folder', 'forest.passkeys'], 'the passkey known, not yet in use: no one is verified here yet; nothing noted of it, since this one sends no maker')
  assert.deepEqual(JSON.parse(local['forest.folder']!).labels, {}, 'its Profiles folder looked at, with no profile in it')
  await shot(page, 'verify')
  say("Start: one button, nothing asked first; First time here?; No passkey found; Yes, I'm new made it for app.forest.foundation, then Get verified")
})

test("back on each setup step: Get verified to Start, which asks for the passkey made alone and goes straight back; the ID's sheet, its few words, the verifier's words before Pay, closed after a payment that failed; the selfie, in this tab, back to a wait that asks the passkey by itself, or with Continue where the browser wants a tap; the wait to Get verified; on a laptop, the deep green panel beside it", async () => {
  const { page, context, counts } = first
  // Get verified: its line, two cards, each in its badge's colors, and one quiet line under them.
  await page.getByText("So people know you're real.").waitFor()
  await checkCard(page, 'ID').getByText('10× the free credits').waitFor()
  const cards = await page.locator('button.vcard').evaluateAll((b) => b.map((x) => [...x.querySelectorAll('.two > *, .price, .vlist > span')].map((e) => e.textContent)))
  assert.deepEqual(cards, [
    ['Selfie', 'A quick selfie', 'Free', 'Free credits for posts and messages'],
    ['ID', 'Your ID and a selfie', '$5 one time', '10× the free credits', 'Stronger trust', 'Supports Forest'],
  ])
  const ground = (token: string) =>
    page.evaluate((t) => {
      const span = document.body.appendChild(document.createElement('span'))
      span.style.background = `var(--${t})`
      const color = getComputedStyle(span).backgroundColor
      span.remove()
      return color
    }, token)
  const squares = await page.locator('button.vcard .vico').evaluateAll((v) => v.map((x) => [getComputedStyle(x).backgroundColor, x.querySelector('svg')?.dataset.icon]))
  assert.deepEqual(squares, [
    [await ground('forest'), 'scan-smiley'],
    [await ground('forest'), 'identification-card'],
  ], "each card's square as its badge draws it")
  await page.getByText('You can add the other one later.').waitFor()

  // Back to Start: this device knows the passkey now, so Start asks for it alone, and goes straight back to Get verified.
  await button(page, 'Back').click()
  await button(page, 'Start').waitFor()
  await shot(page, 'start-known')
  const asked = counts.asserted
  await button(page, 'Start').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock, by the passkey made, and no question first')

  // The ID: its sheet, its price once, one line, what it keeps behind a tap, the verifier's words before Pay; the payment fails, and the sheet closed.
  let unavailable = true
  await answer(context, `${services.verifier}/id/payment`, 503, { error: 'payment_unavailable' }, () => unavailable)
  await checkCard(page, 'ID').click()
  const sheet = page.getByRole('dialog', { name: 'ID check' })
  await sheet.getByText("You're only charged if it passes.", { exact: true }).waitFor()
  assert.equal(await sheet.locator('.sheet-head h2').textContent(), 'ID check')
  assert.equal(await sheet.locator('.sheet-head .price').textContent(), '$5 one time')
  assert.deepEqual(await sheet.locator('.sheet-head ~ p').allTextContents(), ["You're only charged if it passes."], 'one line under the price: no hold, no tries')
  const keeps = sheet.getByText('What the check keeps')
  await keeps.waitFor()
  assert.equal(await page.locator('.consent').isVisible(), false, 'what the check keeps, behind a tap')
  await keeps.click()
  const { consent } = (await (await fetch(`${services.verifier}/`)).json()) as { consent: string }
  assert.equal(await page.locator('.consent').textContent(), consent, "the verifier's words, word for word")
  assert.ok(await button(page, 'Pay $5').isVisible(), 'shown before Pay')
  assert.equal(await asks(button(page, 'Pay $5')), false, 'the seed held since Start: Pay asks nothing')
  await shot(page, 'id-sheet')
  await button(page, 'Pay $5').click()
  await sheet.getByText("Payment isn't available right now. Try again in a minute.").waitFor()
  await page.keyboard.press('Escape')
  await sheet.waitFor({ state: 'detached' })
  unavailable = false

  // The selfie, in this tab, left unfinished at Didit: back at /back, the page asks the passkey by
  // itself, nothing tapped; then Waiting for your check, the loader and Open it again only; back,
  // the asking stopped.
  let unfinished = true
  await answer(context, `${services.verifier}/face/stamp`, 403, { error: 'not_approved' }, () => unfinished)
  const opened = context.pages().length
  let since = first.went.length
  const byItself = counts.asserted
  await checkCard(page, 'Selfie').click()
  await backFrom(first, since)
  assert.deepEqual(wentFrom(first, since), [['didit', true]], "Didit's page, in this tab")
  await page.getByText('Waiting for your check').waitFor()
  await page.locator('.waiting .loader').waitFor()
  await button(page, 'Continue').waitFor({ state: 'detached' })
  assert.equal(counts.asserted - byItself, 1, 'the passkey asked by the page itself, once, with no tap')
  assert.deepEqual((await page.locator('main button').allTextContents()).map((t) => t.trim()), ['', 'Open it again'], 'back, and Open it again')
  assert.equal(await button(page, 'Open it again').locator('[data-icon="arrow-square-out"]').count(), 1)
  const session = JSON.parse((await kept(page))['forest.setup']!).session as string
  assert.ok(session, 'the check under way, kept')
  await shot(page, 'face-away')
  // Open it again, where the browser wants a tap before the passkey is asked: back, Continue with the unlock icon, and one tap asks it.
  await wantsATap(first)
  since = first.went.length
  await button(page, 'Open it again').click()
  await backFrom(first, since)
  assert.deepEqual(wentFrom(first, since), [['didit', true]], 'the same tab again')
  assert.equal(JSON.parse((await kept(page))['forest.setup']!).session, session, 'the same check, opened again')
  const continuing = button(page, 'Continue')
  await continuing.waitFor()
  assert.ok(await asks(continuing), 'Continue, with the unlock icon')
  assert.equal(await page.locator('.line.red').count(), 0, 'nothing said of the passkey')
  const tapped = counts.asserted
  await continuing.click()
  await page.locator('.waiting .loader').waitFor()
  await continuing.waitFor({ state: 'detached' })
  assert.equal(counts.asserted - tapped, 1, 'one tap, one unlock')
  assert.equal(context.pages().length, opened, 'no tab opened')
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  assert.equal(JSON.parse((await kept(page))['forest.setup']!).session, session, 'and still under way')
  // Under way: Get verified's back to Start, and Start straight back to the wait, then back to Get verified.
  await button(page, 'Back').click()
  await button(page, 'Start').click()
  await page.getByText('Waiting for your check').waitFor({ timeout: 60_000 })
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  unfinished = false

  // On a laptop: the deep green panel on the left, with the mark and Forest, and the screen beside it, 520px wide at most.
  await page.setViewportSize({ width: 1280, height: 800 })
  const panel = page.locator('.setup-panel')
  await panel.waitFor()
  assert.equal(await panel.textContent(), 'Forest')
  const [left, right] = [await panel.boundingBox(), await page.locator('.setup-main > main').boundingBox()]
  assert.ok(Math.abs(left!.width - 512) < 2, `the panel about 40% of the page: ${left!.width}`)
  assert.ok(right!.width - 40 <= 520, `the screen 520px wide at most: ${right!.width - 40}`)
  await shot(page, 'laptop-verify')
  await page.setViewportSize({ width: 390, height: 844 })
  await panel.waitFor({ state: 'hidden' })
  assert.ok(await checkCard(page, 'Selfie').isVisible(), 'the same screen, its state kept through the resize')
  say('back: Get verified to Start and straight back; the ID sheet after a failed payment, and the selfie waiting, each to Get verified; on a laptop, the panel')
})

test("the selfie: its card, its check in this tab, back through /back, where the page asks the passkey by itself, once, nothing tapped, and the stamp is kept; the gift in the wallet, the stamp in the Profiles folder; then Your first profile, You're verified", async () => {
  const { page, context, counts } = first
  // The page that went to Didit's held the seed; the one Didit sends back to holds none: it asks
  // the passkey at once, by itself, and with it the stamp, kept as soon as it comes.
  const asked = counts.asserted
  const opened = context.pages().length
  await faceCheck(first)
  say("the check in this tab: Didit's page, then back at /back")
  await page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock, asked by the page itself back from Didit, nothing tapped')
  assert.equal(context.pages().length, opened, 'no tab opened')
  const chip = page.locator('.chip.new', { hasText: "You're verified" })
  await chip.waitFor()
  assert.equal(await chip.locator('.icon').getAttribute('data-icon'), 'scan-smiley', "the selfie badge's icon")
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
  assert.deepEqual(Object.keys(local).sort(), ['forest.folder', 'forest.passkey', 'forest.passkeys', 'forest.verified'])
  assert.deepEqual(await page.evaluate(() => Object.keys(sessionStorage)), [], 'nothing waits in this tab')
  assert.deepEqual(JSON.parse(local['forest.verified']!), ['face'], 'how the person is verified')
  assert.deepEqual(JSON.parse(local['forest.folder']!), { address: wallet.address, labels: {} }, "the Profiles folder's address, never a key")
  for (const secret of [Buffer.from(seed).toString('hex'), Buffer.from(seed).toString('base64url'), String(stamp.signature.S)]) assert.ok(!JSON.stringify(local).includes(secret), 'nothing of the seed or the stamp kept')
  say(`verified: the stamp in the Profiles folder, the wallet at ${left} credits`)
})

test("the first profile: Later, Connect your AI and Skip, then back; every market a tile, a search, a tile's roles on a sheet; one pick, nothing asked, Making, its verification proven in the worker; Connect your AI, Copy address, Done; the badge; its name; Share hands out its page on the index; a role made says Yours", async () => {
  const { page, counts } = first
  // Being verified can't be undone: no back, but Later, on to Connect your AI, whose Skip goes Home, empty, whose New profile comes back here.
  assert.equal(await button(page, 'Back').count(), 0, 'no back')
  await button(page, 'Later').click()
  await page.getByRole('heading', { name: 'Connect your AI' }).waitFor()
  assert.equal(await button(page, 'Back').count(), 0, 'no back in setup')
  await button(page, 'Skip').click()
  await button(page, 'New profile').click()
  await page.getByRole('heading', { name: 'Your first profile' }).waitFor()
  // Every market a tile, two to a row: a tint of its color, its icon in its color, its name.
  const tiles = page.locator('button.market-tile')
  const names = await tiles.allTextContents()
  assert.ok(names.includes('Tutoring') && names.includes('Home cleaning') && names.includes('Tennis matches'), `one tile a market, in its words: ${names.join(', ')}`)
  const tutoring = await page.locator('button.market-tile', { hasText: 'Tutoring' }).evaluate((el) => ({ h: getComputedStyle(el).getPropertyValue('--h').trim(), ground: getComputedStyle(el).backgroundColor, icon: el.querySelector('svg')?.dataset.icon }))
  assert.deepEqual([tutoring.h, tutoring.icon], [colorOf('tutoring'), 'graduation-cap'], "the tutoring market's color and icon")
  assert.notEqual(tutoring.ground, rgbOf(colorOf('tutoring')), 'a tint of it, not the color itself')
  const [a, b] = [await tiles.nth(0).boundingBox(), await tiles.nth(1).boundingBox()]
  assert.equal(a!.y, b!.y, 'two to a row')
  await page.getByLabel('Search').fill('home')
  assert.deepEqual(await tiles.allTextContents(), ['Home cleaning', 'Home repair'], 'the search narrows the markets')
  await page.getByLabel('Search').fill('seller')
  assert.deepEqual(await tiles.allTextContents(), ['Clothing', 'Electronics'], "and finds them by their roles' words")
  await page.getByLabel('Search').fill('')
  await shot(page, 'first-profile-markets')
  // A tile opens its roles on a sheet: each its avatar and the role's name, nothing else, and Create, in the forest green, its plus.
  await button(page, 'Clothing').click()
  const roles = page.getByRole('dialog', { name: 'Clothing' })
  await roles.getByRole('heading', { name: 'Clothing' }).waitFor()
  assert.deepEqual(await roles.locator('.big-choice').evaluateAll((r) => r.map((x) => [...x.children].map((c) => c.textContent))), [
    ['', 'Seller', 'Create'],
    ['', 'Buyer', 'Create'],
  ])
  assert.deepEqual(await roles.locator('.av').evaluateAll((v) => v.map((x) => x.classList.contains('look'))), [false, true], "a seller's avatar solid, a buyer's light")
  const forest = await page.evaluate(() => {
    const probe = document.body.appendChild(document.createElement('span'))
    probe.style.color = 'var(--forest)'
    const c = getComputedStyle(probe).color
    probe.remove()
    return c
  })
  assert.deepEqual(await roles.getByRole('button', create('seller')).evaluate((b) => [getComputedStyle(b).backgroundColor, (b.querySelector('.icon') as SVGElement).dataset.icon]), [forest, 'plus'], 'Create in the forest green, its plus: the seed is held, so no unlock icon')
  await shot(page, 'first-profile-roles')
  await page.keyboard.press('Escape')
  await roles.waitFor({ state: 'detached' })
  const asked = counts.asserted
  const started = Date.now()
  await page.getByLabel('Search').fill('tutoring')
  await button(page, 'Tutoring').click()
  await page.getByRole('button', create('tutor')).click()
  await page.getByText('Making your Tutoring tutor').waitFor()
  await shot(page, 'making')
  await page.getByRole('heading', { name: 'Connect your AI' }).waitFor({ timeout: 120_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked: the seed held since the unlock at Start')
  say(`a profile made in ${((Date.now() - started) / 1000).toFixed(1)} s, its proof in the worker`)
  // Connect your AI: what an AI app then does, the app picked, three steps in its name, and no links to other sites.
  await page.getByText('Claude or ChatGPT can then search, post and reply for you.').waitFor()
  const steps = () => page.locator('.step-card > li').allTextContents()
  assert.deepEqual(await steps(), [`1Copy this address${mcp.origin}`, '2Add it in Claude as a connector', '3Sign in when Claude asks'])
  await button(page, 'ChatGPT').click()
  assert.deepEqual((await steps()).slice(1), ['2Add it in ChatGPT as a connector', '3Sign in when ChatGPT asks'])
  assert.equal(await page.locator('main a').count(), 0, 'no links to other sites')
  const foot = page.locator('main .foot')
  assert.deepEqual((await foot.getByRole('button').allTextContents()).map((t) => t.trim()), ['Copy address', 'Skip'])
  await shot(page, 'connect-ai')
  // Copy address: the address in full, Copied, and the steps still there while the person does them; then Done.
  await foot.getByRole('button', { name: 'Copy address' }).click()
  await foot.getByRole('button', { name: 'Copied' }).waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), mcp.origin, 'the address shown, in full')
  assert.equal((await steps()).length, 3, 'the steps still there')
  await shot(page, 'connect-ai-copied')
  await foot.getByRole('button', { name: 'Done' }).click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).click()
  await badge(page.getByRole('heading', { name: 'Tutoring tutor' })).waitFor()
  // The header, on a tint of the market's color, its bottom corners rounded; four parts apart: the market, small, in its color; the
  // role, big, in the titles' face, capitalized; its badges right after the role; under them, its rating, here none yet. At
  // the top right, its messages, always there, with no number while nothing is new, then Share, each round with its own icon.
  const head = page.locator('.profile-head')
  const parts = await head.locator('.ph2').evaluate((el) => {
    const [mk, rl] = [el.querySelector('.mk')!, el.querySelector('.rl')!]
    return { market: [mk.textContent, getComputedStyle(mk).fontSize], role: [rl.firstChild?.textContent, getComputedStyle(rl).fontSize, getComputedStyle(rl).fontFamily.includes('Bricolage')], badges: [...rl.querySelectorAll('.vb')].map((b) => (b as HTMLElement).dataset.check) }
  })
  assert.deepEqual(parts, { market: ['Tutoring', '14px'], role: ['Tutor', '28px', true], badges: ['face'] }, 'the market small, the role big, the badge after it')
  assert.equal(await head.evaluate((h) => getComputedStyle(h).borderBottomLeftRadius), '30px', 'its bottom corners rounded')
  assert.equal(await head.evaluate((h) => (h as HTMLElement).style.getPropertyValue('--h')), colorOf('tutoring'), "a tint of its market's color")
  assert.equal(await head.locator('.rate-line').textContent(), 'No reviews yet')
  // Its two tabs: Offers, in its role's word, then Reviews; Offers open, with New offer at the foot, its plus.
  assert.deepEqual(await page.getByRole('tab').allTextContents(), ['Offers', 'Reviews'])
  assert.equal(await head.locator('button.ratepill').count(), 0, 'with nothing received, no pill')
  assert.equal(await page.getByRole('tab', { name: 'Offers' }).getAttribute('aria-selected'), 'true')
  assert.equal(await button(page, 'New offer').locator('.icon').getAttribute('data-icon'), 'plus')
  assert.deepEqual(await page.locator('.top-right button').evaluateAll((b) => b.map((x) => x.getAttribute('aria-label'))), ['Messages', 'Share'])
  assert.deepEqual(await page.locator('.top-right button .icon').evaluateAll((i) => i.map((x) => (x as SVGElement).dataset.icon)), ['chat-circle', 'export'])
  assert.deepEqual([await inbox(page).locator('.icon').count(), await inbox(page).locator('.count').count(), await inbox(page).locator('.unlock').count()], [1, 0, 0], 'its own icon, no number, no fingerprint')
  // Its avatar, solid: a tutor offers; its animal, from its address, white on its market's color; and the selfie check's badge.
  const tutorAnimal = animal((await mainKey(seed, 'tutoring/tutor')).address)
  assert.deepEqual(await avatarOf(page.locator('.titled .av')), { light: false, h: colorOf('tutoring'), ground: rgbOf(colorOf('tutoring')), icon: tutorAnimal }, 'its animal, white on its color')
  assert.deepEqual(await drawnAs(badge(page.getByRole('heading', { name: 'Tutoring tutor' }))), SELFIE, "the selfie check's badge, a face being scanned on the forest green")
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
  assert.equal(await button(page, 'Copied').locator('.icon').getAttribute('data-icon'), 'check')
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), onTheIndex, "the profile's page on the index")
  assert.equal(await page.getByRole('dialog').count(), 0, 'no sheet of its own')
  await shot(page, 'profile-copied')
  // Where there is a share sheet, as on a phone, the sheet gets the page's link, and only that.
  await page.evaluate(() => void ((navigator as { share?: unknown }).share = async (data: ShareData) => void ((globalThis as { shared?: ShareData }).shared = data)))
  await button(page, 'Share').click({ timeout: 5_000 })
  assert.deepEqual(await page.waitForFunction(() => (globalThis as { shared?: ShareData }).shared).then((h) => h.jsonValue()), { url: onTheIndex })
  await button(page, 'Back').click()
  const card = page.locator('button.card', { hasText: 'Tutoring tutor' })
  await card.waitFor()
  await cardNamed(card, 'Tutoring', 'tutor')
  assert.equal(await card.locator('.vb').count(), 0, "no badge on the card: the person's badges are beside the title")
  assert.deepEqual([(await avatarOf(card.locator('.av'))).h, (await avatarOf(card.locator('.av'))).icon], [colorOf('tutoring'), tutorAnimal], 'its avatar: the same animal, on its color')
  await card.locator('.rt2', { hasText: 'No reviews' }).waitFor()
  assert.deepEqual([await card.locator('.newpip').count(), await card.locator('[data-icon="caret-right"]').count()], [0, 0], 'nothing new, no count; no chevron')
  assert.deepEqual(JSON.parse((await kept(page))['forest.profiles']!), [{ label: 'tutoring/tutor', address: tutor }])
  // At the top of Home, the mark and Search Forest, the index in a new tab; no Messages button: they open from Notifications.
  const search = page.getByRole('link', { name: 'Search Forest' })
  assert.deepEqual([await search.getAttribute('href'), await search.getAttribute('target')], [services.index, '_blank'])
  assert.equal(await inbox(page).count(), 0, 'no Messages on Home')
  assert.deepEqual(await page.locator('.tabbar button').allTextContents(), ['Home', 'Notifications', 'You'])
  assert.equal(await page.locator('.tabbar button[aria-current="page"] .icon').getAttribute('data-icon'), 'house')
  // One search, Search Forest; and New profile floating at the bottom right, above the tabs, forest with its plus; no dashed card.
  assert.deepEqual([await page.getByRole('searchbox').count(), await page.locator('.addcard').count()], [0, 0], 'no search of their own profiles, no dashed card')
  const fab = page.locator('button.fab', { hasText: 'New profile' })
  const [fabBox, tabsBox] = [(await fab.boundingBox())!, (await page.locator('.tabbar').boundingBox())!]
  assert.ok(fabBox.y + fabBox.height < tabsBox.y && 390 - (fabBox.x + fabBox.width) < 30, `at the bottom right, above the tabs: ${JSON.stringify(fabBox)}`)
  assert.deepEqual(await fab.evaluate((b) => [getComputedStyle(b).position, getComputedStyle(b).backgroundColor, (b.querySelector('.icon') as SVGElement).dataset.icon]), ['fixed', await page.evaluate(() => { const s = document.body.appendChild(document.createElement('span')); s.style.background = 'var(--forest)'; const c = getComputedStyle(s).backgroundColor; s.remove(); return c }), 'plus'])
  await shot(page, 'home')
  // Beside Your profiles, the person's badges, once: the selfie's, its words its label and its title; the ID's not done, its
  // outline, dashed and muted, a button that starts the ID check: Get verified, the ID's sheet up; closed, and back, Home.
  const badges = page.getByRole('group', { name: "How you're verified" })
  await badge(badges).waitFor()
  assert.deepEqual(await drawnAs(badge(badges)), SELFIE, "the selfie check's badge")
  assert.equal(await badge(badges).getAttribute('title'), 'Verified with a selfie')
  const outline = badges.getByRole('button', { name: 'Verify with ID' })
  assert.deepEqual(await outline.evaluate((b) => [getComputedStyle(b).borderTopStyle, (b.querySelector('.icon') as SVGElement).dataset.icon]), ['dashed', 'identification-card'], "the ID's outline, dashed")
  assert.equal(await outline.evaluate((b) => getComputedStyle(b).color), await muted(page), 'muted')
  await outline.click()
  const idSheet = page.getByRole('dialog', { name: 'ID check' })
  await idSheet.getByText("You're only charged if it passes.", { exact: true }).waitFor()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  await page.keyboard.press('Escape')
  await idSheet.waitFor({ state: 'detached' })
  await button(page, 'Back').click()
  await badges.waitFor()
  await card.click()
  const title = page.getByRole('heading', { name: 'Tutoring tutor' })
  await title.waitFor()
  // On the profile's header, its badge stands alone: a tap says its words for a moment.
  await badge(title).click()
  await page.getByText('Verified with a selfie', { exact: true }).waitFor()
  await shot(page, 'profile-badge-tapped')
  await page.getByText('Verified with a selfie', { exact: true }).waitFor({ state: 'detached' })
  await button(page, 'Back').click()
  // On New profile, a role made shows the check, in the same forest green as Create, never a second green, and its row opens its
  // profile; one not made holds Create; back is the sheet again.
  await button(page, 'New profile').click()
  await page.getByRole('heading', { name: 'New profile' }).waitFor()
  await button(page, 'Tutoring').click()
  const tutoringRoles = page.getByRole('dialog', { name: 'Tutoring' })
  assert.deepEqual(await tutoringRoles.locator('.big-choice').allTextContents(), ['Tutor', 'StudentCreate'], 'every role')
  const yours = tutoringRoles.getByRole('button', { name: 'Tutor Yours', exact: true })
  const [tick, made] = [await yours.locator('[data-icon="check-circle"]').evaluate((i) => getComputedStyle(i).color), await tutoringRoles.getByRole('button', create('student')).evaluate((b) => getComputedStyle(b).backgroundColor)]
  assert.equal(tick, made, "the check in Create's forest green")
  assert.equal(await tutoringRoles.locator('[data-icon="caret-right"]').count(), 0, 'no chevrons')
  assert.deepEqual(await tutoringRoles.locator('.av').evaluateAll((a) => a.map((x) => [(x.querySelector('svg') as SVGElement).dataset.icon ?? null, (x.querySelector('svg') as SVGElement).dataset.animal ?? null])), [['graduation-cap', null], ['graduation-cap', null]], "the role sheet keeps its market's icon, no animal")
  await shot(page, 'new-profile-made')
  const asked2 = counts.asserted
  await yours.click()
  await badge(page.getByRole('heading', { name: 'Tutoring tutor' })).waitFor()
  assert.equal(counts.asserted - asked2, 0, 'opened, nothing unlocked')
  await button(page, 'Back').click()
  await tutoringRoles.waitFor()
  await page.keyboard.press('Escape')
  await tutoringRoles.waitFor({ state: 'detached' })
  await button(page, 'Back').click()
  await card.waitFor()
})

test("You: Selfie Verified on its badge's square, the ID's outline, its line and Add, $5; Passkeys, Your AI, Appearance on a sheet, About Forest and its links and version; Forget this device in red; on a laptop, the sidebar in place of the tabs, its mint New beside Profiles", async () => {
  const { page } = first
  await button(page, 'You').click()
  await page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  // One card, Selfie and ID, each with its badge's square: the selfie's done, its badge's forest square, Verified on a mint chip;
  // the ID's not, its badge's outline, dashed, which starts it, its line from the verifier's gifts and a plain Add, $5.
  const checks = page.getByRole('group', { name: 'Verified' })
  const selfie = checks.locator('.row', { hasText: 'Selfie' })
  await selfie.locator('.chip.new', { hasText: 'Verified' }).waitFor()
  assert.equal(await selfie.locator('.sq.forest [data-icon="scan-smiley"]').count(), 1, "the selfie's badge, its forest square")
  const id = checks.locator('.row', { hasText: 'ID' })
  const idOutline = id.getByRole('button', { name: 'Verify with ID' })
  assert.deepEqual(await idOutline.evaluate((b) => [getComputedStyle(b).borderTopStyle, (b.querySelector('.icon') as SVGElement).dataset.icon]), ['dashed', 'identification-card'], "the ID's outline, dashed")
  await id.getByText('Stronger trust, 10× the free credits', { exact: true }).waitFor()
  assert.ok(await id.getByRole('button', { name: 'Add, $5' }).isVisible(), 'Add, $5')
  assert.equal(await page.getByText('Face', { exact: true }).count(), 0, 'Selfie, never Face')
  // Then the rows, each opening its own screen: Passkeys with how many, Your AI with the apps' names (none yet), Appearance, About Forest.
  await page.locator('button.row', { hasText: '1 passkey' }).waitFor()
  assert.deepEqual(await page.locator('main .rows:not([role]) button.row strong').allTextContents(), ['Passkeys', 'Your AI', 'Appearance', 'About Forest'])
  assert.equal(await page.locator('button.row', { hasText: 'Appearance' }).locator('.two > span').textContent(), 'Auto')
  const forget = button(page, 'Forget this device')
  assert.deepEqual(await forget.evaluate((b) => [getComputedStyle(b).color, (b.querySelector('.icon') as SVGElement).dataset.icon]), [await page.evaluate(() => {
    const span = document.body.appendChild(document.createElement('span'))
    span.style.color = 'var(--danger)'
    const color = getComputedStyle(span).color
    span.remove()
    return color
  }), 'sign-out'], 'Forget this device, red text with its icon')
  await shot(page, 'you')
  // Appearance: a sheet of one choice, rows with a radio mark; a tap picks it and closes the sheet; kept through a reload.
  await page.locator('button.row', { hasText: 'Appearance' }).click()
  const looks = page.getByRole('dialog', { name: 'Appearance' })
  await fromTheBottom(page, looks)
  assert.deepEqual(await looks.getByRole('radio').allTextContents(), ['Auto', 'Light', 'Dark'])
  assert.equal(await looks.getByRole('radio', { name: 'Auto' }).getAttribute('aria-checked'), 'true')
  assert.equal(await looks.getByRole('checkbox').count(), 0, 'no tick boxes for one choice')
  await shot(page, 'appearance')
  await looks.getByRole('radio', { name: 'Dark' }).click()
  await looks.waitFor({ state: 'detached' })
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
  await page.reload()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'kept, and back on You after a reload')
  await page.locator('button.row', { hasText: 'Appearance' }).locator('.two > span', { hasText: 'Dark' }).waitFor()
  await page.locator('button.row', { hasText: 'Appearance' }).click()
  await looks.getByRole('radio', { name: 'Auto' }).click()
  await looks.waitFor({ state: 'detached' })
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), undefined)
  // About Forest: Privacy, Terms and Source code, each opening in a new tab, and the version, quietly.
  await page.locator('button.row', { hasText: 'About Forest' }).click()
  await page.getByRole('heading', { name: 'About Forest' }).waitFor()
  const links = await page.locator('main a.row').evaluateAll((a) => a.map((x) => [x.textContent, x.getAttribute('href'), x.getAttribute('target'), x.getAttribute('rel')]))
  assert.deepEqual(links, [
    ['Privacy', 'https://forest.foundation/privacy', '_blank', 'noopener noreferrer'],
    ['Terms', 'https://forest.foundation/terms', '_blank', 'noopener noreferrer'],
    ['Source code', 'https://github.com/foundationforest/app', '_blank', 'noopener noreferrer'],
  ])
  assert.match((await page.getByText(/^Version /).textContent())!, /^Version ([0-9a-f]{7}|dev)$/, 'the commit it was built from')
  await shot(page, 'about')
  await button(page, 'Back').click()
  // Your AI: none yet, then Connect another, which opens Connect your AI, with a back and no Skip.
  await page.locator('button.row', { hasText: 'Your AI' }).click()
  await page.getByRole('heading', { name: 'Your AI' }).waitFor()
  await button(page, 'Connect another').click()
  await page.getByRole('heading', { name: 'Connect your AI' }).waitFor()
  assert.deepEqual((await page.locator('main .foot').getByRole('button').allTextContents()).map((t) => t.trim()), ['Copy address'], 'no Skip')
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Your AI' }).waitFor()
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  // On a laptop: no tabs; the sidebar, its places and the profiles, beside every screen; Profiles with a small mint New at its
  // right, which opens New profile; no New profile row, no AI card.
  await page.setViewportSize({ width: 1280, height: 800 })
  const side = page.locator('aside.side')
  await side.waitFor()
  assert.equal(await page.locator('.tabbar').count(), 0, 'no tabs')
  assert.deepEqual(await side.getByRole('navigation', { name: 'Places' }).getByRole('button').allTextContents(), ['Home', 'Notifications', 'Messages', 'You'])
  assert.equal(await side.locator('button[aria-current="page"]').textContent(), 'You')
  const row = side.getByRole('button', { name: 'Tutoring tutor' })
  assert.deepEqual([(await avatarOf(row.locator('.av.sm'))).h, (await avatarOf(row.locator('.av.sm'))).icon], [colorOf('tutoring'), animal(tutor)], 'the same animal as on its card')
  const plus = side.locator('.side-head').getByRole('button', { name: 'New profile' })
  assert.deepEqual(await plus.evaluate((b) => [b.textContent, (b.querySelector('.icon') as SVGElement).dataset.icon, b.getBoundingClientRect().height]), ['New', 'plus', 28], 'a small New pill, its plus, beside Profiles')
  assert.equal(await plus.evaluate((b) => getComputedStyle(b).backgroundColor), await page.evaluate(() => {
    const span = document.body.appendChild(document.createElement('span'))
    span.style.color = 'var(--mint)'
    const color = getComputedStyle(span).color
    span.remove()
    return color
  }), 'on mint')
  assert.equal(await side.getByRole('button', { name: 'New profile' }).count(), 1, 'and no New profile row')
  assert.equal(await side.locator('.ai-app, [data-icon="sparkle"]').count(), 0, 'no AI card')
  await shot(page, 'laptop-you')
  // Appearance, on a laptop: a dialog in the middle; Escape closes it, and so does a click outside it.
  await page.locator('button.row', { hasText: 'Appearance' }).click()
  await inTheMiddle(page, looks)
  await shot(page, 'laptop-appearance')
  await page.keyboard.press('Escape')
  await looks.waitFor({ state: 'detached' })
  await page.locator('button.row', { hasText: 'Appearance' }).click()
  await looks.waitFor()
  await page.mouse.click(12, 790)
  await looks.waitFor({ state: 'detached' })
  await plus.click()
  await page.getByRole('heading', { name: 'New profile' }).waitFor()
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  await row.click()
  await page.getByRole('heading', { name: 'Tutoring tutor' }).waitFor()
  assert.equal(await side.locator('button[aria-current="page"]').textContent(), 'Tutoring tutor', 'the profile, selected')
  await side.getByRole('button', { name: 'Home' }).click()
  await page.getByRole('heading', { name: 'Your profiles' }).waitFor()
  assert.equal(await page.locator('main .search').count(), 0, 'Search Forest in the sidebar, not on Home')
  // New profile at the top right of Home, in the row of its title; nothing floating.
  const newOne = page.locator('main .titled').getByRole('button', { name: 'New profile' })
  const [newBox, mainBox] = [(await newOne.boundingBox())!, (await page.locator('main.home').boundingBox())!]
  assert.ok(mainBox.x + mainBox.width - (newBox.x + newBox.width) < 40, `at the right: ${JSON.stringify(newBox)}`)
  assert.equal(await page.locator('button.fab').count(), 0, 'nothing floating on a laptop')
  await shot(page, 'laptop-home')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.tabbar').waitFor()
  assert.equal(await page.locator('aside.side').count(), 0, 'no sidebar on a phone')
})

const ASK = 'Is Tuesday at six free?'
const YES = 'Tuesday at six, yes.'
const OFFER = 'Maths for secondary school, one hour online.'

/** The live entries of a folder under `kind/`, as the host serves it now. */
const entriesOf = async (address: string, kind: string) => [...liveContent(await readFolder([services.host], address, Date.now()))].filter(([path]) => path.startsWith(`${kind}/`))

test('two people: one posts an offer, its price per hour, the place only for sessions in person, a contact, asking nothing while the seed is held; the other opens its link, messages it, gets the reply, and reviews it from the thread; the Notifications tab counts it, and Messages', async () => {
  const { page, counts } = first
  // The offer, from the tutor's profile, in the market's own fields; a price per one of its field's values.
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).click()
  await button(page, 'New offer').click()
  await page.getByRole('heading', { name: 'New offer' }).waitFor()
  await page.getByLabel('Description').fill(OFFER)
  await page.getByLabel('Price').fill('30')
  assert.deepEqual(await page.getByRole('group', { name: 'Per' }).getByRole('button').allTextContents(), ['per hour', 'per session'], "exactly the field's per values")
  await page.getByRole('group', { name: 'Per' }).getByRole('button', { name: 'per hour' }).click()
  assert.equal(await page.getByRole('group', { name: 'Per' }).getByRole('button', { name: 'per hour' }).getAttribute('aria-pressed'), 'true', 'side by side, one picked')
  // A long list (a tutor's 22 subjects): one row, Choose; tapped, a sheet with a search and each with its tick; Done.
  const subjects = page.getByRole('group', { name: 'Subjects' }).locator('button.open-row')
  assert.equal(await subjects.textContent(), 'Choose')
  await subjects.click()
  const picker = page.getByRole('dialog', { name: 'Subjects' })
  assert.equal(await picker.getByRole('checkbox').count(), 22, 'every subject')
  await picker.getByLabel('Search').fill('mat')
  assert.deepEqual(await picker.getByRole('checkbox').allTextContents(), ['Maths'], 'the search, by their words')
  await picker.getByRole('checkbox', { name: 'Maths' }).click()
  assert.equal(await picker.getByRole('checkbox', { name: 'Maths' }).getAttribute('aria-checked'), 'true', 'ticked')
  await shot(page, 'picker')
  await picker.getByRole('button', { name: 'Done' }).click()
  await picker.waitFor({ state: 'detached' })
  assert.deepEqual(await subjects.locator('.chip').allTextContents(), ['Maths'], 'the row shows it')
  // How sessions are held: no place until they are in person; then the place, right after, one row,
  // and nothing of the map asked for yet: its code and its tiles come with its screen alone.
  const mode = page.getByRole('group', { name: 'Mode' })
  const place = page.getByRole('group', { name: 'Place' })
  const mapCode: string[] = []
  const watch = (r: { url: () => string }) => void (/\/assets\/(PlaceMap|maplibre-gl-worker)-/.test(r.url()) && mapCode.push(r.url()))
  page.on('request', watch)
  assert.equal(await place.count(), 0, 'no place before In person')
  await mode.getByRole('button', { name: 'In person' }).click()
  assert.equal(await mode.getByRole('button', { name: 'In person' }).locator('[data-icon="check"]').count(), 1, 'two that can both be picked: chips with their tick')
  await place.getByRole('button', { name: 'Choose on the map' }).waitFor()
  assert.equal(await place.locator('[data-icon="map-pin"]').count(), 1, 'its row, with its pin')
  const labels = async () => (await page.locator('form > .field > .label').allTextContents()).map((l) => l.replace('Public.', ''))
  assert.deepEqual(await labels(), ['Subjects', 'Description', 'Price', 'Mode', 'Place', 'Levels', 'Minutes', 'Hours', 'Contact'], "the preview's fields first, the place right after how sessions are held, contact last")
  assert.deepEqual([mapCode, tiles.asked], [[], { styles: [], tilejson: 0, tiles: 0 }], 'nothing of the map yet')
  // Its screen: an area, on OpenFreeMap's tiles (the stand-in's), its attribution shown; the map's
  // own button for the location; a circle round the phone at the market's 5 km, its centre kept, a
  // few hundred metres from the phone.
  const placing = await placeScreen(page, 'Place')
  assert.equal(await placing.getByRole('button', { name: 'Area' }).getAttribute('aria-pressed'), 'true')
  await placing.locator('.maplibregl-ctrl-attrib', { hasText: 'OpenFreeMap stand-in' }).waitFor()
  assert.ok(mapCode.some((u) => u.includes('/PlaceMap-')) && tiles.asked.styles[0] === 'positron' && tiles.asked.tiles > 0, "the map's code, its style and its tiles, now")
  page.off('request', watch)
  await placing.getByRole('button', { name: 'Your location' }).waitFor()
  await placing.getByText('Within 5 km', { exact: true }).waitFor()
  const [centre] = await keptPoints(page, 1)
  const fromPhone = kmFromSpot(centre!)
  assert.ok(fromPhone > 0.1 && fromPhone < 0.8, `the circle's centre moved a little from the phone's spot, ${fromPhone.toFixed(2)} km`)
  // The radius on a slider, from the field's 5 km: 10 km is its fifth step (1, 2, 3, 5, 10).
  await placing.getByRole('slider', { name: 'Within' }).fill('4')
  await placing.getByText('Within 10 km', { exact: true }).waitFor()
  await placing.getByLabel('Place name').fill('Chamberí')
  await shot(page, 'place-area')
  await placing.getByRole('button', { name: 'Done' }).click()
  await placing.waitFor({ state: 'detached' })
  await place.getByRole('button', { name: /^Chamberí\s*Within 10 km$/ }).waitFor()
  // Opened again, on that circle; the phone's back closes it, keeping nothing changed there, and the form keeps all it holds.
  await placeScreen(page, 'Place')
  await placing.getByText('Within 10 km', { exact: true }).waitFor()
  await placing.getByRole('slider', { name: 'Within' }).fill('0')
  await page.goBack()
  await placing.waitFor({ state: 'detached' })
  await place.getByRole('button', { name: /^Chamberí\s*Within 10 km$/ }).waitFor()
  assert.equal(await page.getByLabel('Description').inputValue(), OFFER)
  assert.equal(new URL(page.url()).pathname, '/listing', 'still the offer')
  await page.getByLabel('Contact').fill('ada@example.com')
  await page.getByText('Public.').waitFor()
  await shot(page, 'listing-offer-in-person')
  // Online only: the place goes, and nothing of it is posted.
  await mode.getByRole('button', { name: 'In person' }).click()
  await place.waitFor({ state: 'detached' })
  await mode.getByRole('button', { name: 'Online' }).click()
  // You's reload dropped the seed: Post will ask, and says so.
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Post's unlock icon, in its text color")
  await shot(page, 'listing-offer')
  let asked = counts.asserted
  await button(page, 'Post').click()
  // Its card: its description's first line, then its subjects, quietly; its price at the right, the amount, then per hour under it.
  const offerRow = page.locator('.listing-card', { hasText: OFFER })
  await offerRow.waitFor({ timeout: 60_000 })
  assert.deepEqual(await offerRow.locator('.two > *').allTextContents(), [OFFER, 'Maths'])
  assert.deepEqual(await offerRow.locator('.price-col > *').allTextContents(), ['$30', 'per hour'])
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  // Edited and posted again: the seed held since that unlock, Post shows no unlock icon, and asks nothing.
  await offerRow.click()
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  assert.equal(await asks(button(page, 'Post')), false, 'no unlock icon: a tap will not ask')
  await shot(page, 'listing-offer-held')
  asked = counts.asserted
  await button(page, 'Post').click()
  await page.getByRole('tab', { name: 'Offers', selected: true }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked')
  const listings = await entriesOf(tutor, 'listing')
  assert.equal(listings.length, 1)
  const [offerPath, offer] = listings[0]!
  assert.match(offerPath, /^listing\/[0-9a-f]{32}$/, 'at a random id')
  assert.deepEqual(offer.entry.body, { description: OFFER, price: { amount: '30', currency: 'USD', per: 'hour' }, subjects: ['maths'], mode: ['online'], contact: 'ada@example.com' })
  await offerRow.waitFor()
  await shot(page, 'profile-listings')

  // The second person opens a message link with nothing set up: Start and the selfie first, then the message.
  const second = await phone()
  await second.page.goto(`${APP}message?to=${tutor}`)
  await imNew(second)
  await faceCheck(second)
  // The compose screen, all of it there: To, the link's profile as its card, who it is and its address cut short; From, the profile to make.
  await second.page.getByRole('heading', { name: 'New message' }).waitFor({ timeout: 60_000 })
  assert.equal(new URL(second.page.url()).search, '', "the profile's address out of the path")
  const toCard = second.page.locator('.person.to')
  await toCard.locator('.name.key', { hasText: short(tutor) }).waitFor()
  assert.equal(await second.page.getByLabel('To').count(), 0, 'its card, in place of the box')
  await badge(toCard.locator('.who', { hasText: 'Tutoring tutor' })).waitFor()
  await second.page.locator('.from', { hasText: 'Tutoring student' }).waitFor()
  await mkrIn(toCard, 'Tutoring', 'tutor')
  assert.equal(await toCard.getByText(short(tutor)).count(), 1, 'its short key once: no one named it')
  await named(second.page.locator('.from'), 'Tutoring student')
  assert.ok(await second.page.getByLabel('Message').isVisible(), 'the message box from the start')
  assert.ok(await button(second.page, 'Send').isDisabled(), 'Send once there is a profile to send from')
  await shot(second.page, 'message-new-profile')
  const secondAsked = second.counts.asserted
  await button(second.page, 'New profile').click()
  await second.page.locator('.from button').waitFor({ state: 'detached', timeout: 120_000 })
  assert.ok(await second.page.locator('.from', { hasText: 'Tutoring student' }).isVisible(), 'from the profile just made')
  await badge(second.page.locator('.from')).waitFor()
  await second.page.getByLabel('Message').fill(ASK)
  assert.equal(await asks(button(second.page, 'Send')), false, 'the seed held since the unlock back from the check: Send will ask nothing')
  await shot(second.page, 'message')
  await button(second.page, 'Send').click()
  await second.page.locator('.said.mine', { hasText: ASK }).waitFor({ timeout: 60_000 })
  assert.equal(second.counts.asserted - secondAsked, 0, 'the profile made and the message sent, nothing asked: the seed held since the unlock back from the check')
  const student = JSON.parse((await kept(second.page))['forest.profiles']!)[0].address as string

  // The first: counted with nothing unlocked, on the card, on the Notifications tab, which counts
  // everything new, and on the Messages button at the top of the profile and of Notifications;
  // Notifications holds no message. After the page was closed, its Messages button opens every
  // profile's conversations, and one unlock opens every inbox; who it is from; the reply.
  await button(page, 'Back').click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.newpip[aria-label="1 new"]').waitFor({ timeout: 45_000 })
  await page.locator('.tabbar .count', { hasText: '1' }).waitFor({ timeout: 45_000 })
  assert.equal(await page.locator('.tabbar .count').getAttribute('aria-label'), '1 new', 'the tab counts the message too')
  await shot(page, 'home-message')
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).click()
  await inbox(page).locator('.count', { hasText: '1' }).waitFor()
  assert.equal(await inbox(page).getAttribute('aria-label'), 'Messages, 1 new')
  assert.equal(await page.locator('.rate-line').textContent(), 'No reviews yet', 'no Messages line')
  await shot(page, 'profile-message')
  await button(page, 'Back').click()
  await button(page, /Notifications$/).click()
  await page.getByRole('heading', { name: 'Notifications' }).waitFor()
  await page.getByText('Nothing yet.').waitFor()
  assert.equal(await page.locator('main .rows button').count(), 0, 'no message row')
  await inbox(page).locator('.count', { hasText: '1' }).waitFor()
  await shot(page, 'notifications-message')
  // The page closed and opened again (the seed dropped), then its inbox: every profile's conversations.
  // Before the unlock, only what is true: the avatar of the profile it came to, how many, and Open;
  // at the top, Back, the title, and the round New message, its pencil.
  await closed(page)
  await inbox(page).click()
  await page.getByRole('heading', { name: 'Messages', exact: true }).waitFor()
  const unopened = page.locator('.unopened', { hasText: '1 new message' })
  await unopened.waitFor()
  assert.deepEqual(await unopened.locator('.av').evaluateAll((a) => a.map((x) => (x as HTMLElement).dataset.market)), ['tutoring'], "the avatar of the person's own profile it came to: an envelope shows no one who wrote it")
  assert.deepEqual(await avatarOf(unopened.locator('.av')), { light: false, h: colorOf('tutoring'), ground: rgbOf(colorOf('tutoring')), icon: animal(tutor) }, "the tutor's animal, solid")
  assert.equal(await page.getByText('No new messages').count(), 0)
  assert.equal(await page.locator('.filters').count(), 0, 'no chips before the unlock')
  assert.deepEqual(await page.locator('.top button').evaluateAll((b) => b.map((x) => x.getAttribute('aria-label'))), ['New message'], 'no back: the tabs are there')
  // On a phone, the tabs stay on Messages, Notifications selected, since Messages opens from there.
  assert.match((await page.locator('.tabbar button[aria-current="page"]').textContent()) ?? '', /Notifications$/)
  assert.equal(await page.locator('.top-right').getByRole('button', { name: 'New message' }).locator('.icon').getAttribute('data-icon'), 'note-pencil', 'round, its pencil')
  // No seed held: Open asks, and says so.
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Open's unlock icon, in its text color")
  await shot(page, 'messages-asking')
  asked = counts.asserted
  await button(page, 'Open').click()
  const row = page.locator('button.thread-row', { hasText: short(student) })
  await row.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock opens every inbox')
  // A row says only what tells it apart: their animal, their short key, bold in the key's face, and when; the last message, bold
  // with its dot while new. No badge, no market or role, no "to your": those are on their profile, one tap away.
  await row.locator('.dot').waitFor()
  assert.equal((await avatarOf(row.locator('.av'))).icon, animal(student), 'their animal')
  const key = row.locator('.thread-top .name.key')
  assert.deepEqual(await key.evaluate((k) => [k.textContent, getComputedStyle(k).fontWeight, getComputedStyle(k).fontFamily.includes('monospace')]), [short(student), '700', true], 'their key, bold, in its own face')
  assert.match((await row.locator('.thread-top .xs').textContent()) ?? '', /^\d{1,2}:\d{2}\s?[AP]M$/, 'today: the time of day')
  assert.equal(await row.locator('.thread-last .text.fresh').textContent(), ASK, 'its last message, bold while new')
  assert.deepEqual([await row.locator('.vb').count(), await row.locator('.mkr').count(), await row.getByText('to your').count()], [0, 0, 0], 'nothing else')
  assert.deepEqual((await row.locator('.two > *').allTextContents()).length, 2, 'two lines')
  assert.equal(await page.locator('.unopened').count(), 0, 'opened')
  // Chips that pick whose: All, then each profile, a dot in its market's color and its market and role, no avatar.
  assert.deepEqual(await page.locator('.filters button').allTextContents(), ['All', 'Tutoring tutor'])
  assert.deepEqual(await button(page, 'Tutoring tutor').evaluate((b) => [getComputedStyle(b.querySelector('.fdot')!).backgroundColor, b.querySelectorAll('.av').length]), [rgbOf(colorOf('tutoring')), 0], "its market's dot, no avatar")
  assert.equal(await button(page, 'All').getAttribute('aria-pressed'), 'true')
  await shot(page, 'messages')
  await row.click()
  await page.getByText(ASK).waitFor()
  assert.equal(await page.locator('.tabbar').count(), 0, 'a conversation keeps its own full screen')
  // Its header: their avatar, who they are and to which of the person's, and Review, soft, its star.
  const convo = page.locator('.top')
  await convo.getByText('to your Tutoring tutor').waitFor()
  await mkrIn(convo, 'Tutoring', 'student')
  assert.equal(await convo.locator('.convo-head .av').getAttribute('data-market'), 'tutoring')
  assert.deepEqual([await button(page, 'Review').getAttribute('class'), await button(page, 'Review').locator('.icon').getAttribute('data-icon')], ['soft small', 'star'])
  // The reply, in one row: the pill and a round Send, which shows its own icon.
  const reply = page.getByLabel('Message')
  const send = button(page, 'Send')
  const [box, round] = [(await reply.boundingBox())!, (await send.boundingBox())!]
  assert.ok(round.y < box.y + box.height && box.y < round.y + round.height && round.x > box.x + box.width - 1, 'side by side, in one row')
  assert.equal(Math.round(round.width), Math.round(round.height), 'as wide as it is high')
  assert.equal(await send.evaluate((b) => getComputedStyle(b).borderRadius), '50%', 'round')
  assert.deepEqual([await send.locator('.icon').count(), await send.locator('.unlock').count(), await send.textContent(), await send.locator('.icon').getAttribute('data-icon')], [1, 0, '', 'arrow-up'], 'its own icon, no word, no padlock')
  await reply.fill(YES)
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Send's icon, in its text color")
  await send.click()
  await page.locator('.said.mine', { hasText: YES }).waitFor({ timeout: 60_000 })
  // The time under the last message of each run, quietly, at its side; the day once, above them, since they are of one day: Today.
  const times = await page.locator('.thread .stamp').allTextContents()
  assert.equal(times.length, 2, 'two runs, one each')
  for (const t of times) assert.match(t, /^\d{1,2}:\d{2}\s?[AP]M$/, `a time of day: ${t}`)
  assert.deepEqual(await page.locator('.thread > *').evaluateAll((els) => els.map((e) => e.className)), ['day-line', 'said', 'stamp', 'said mine gap', 'stamp mine'], 'one day line, before the first')
  assert.equal(await page.locator('.day-line').textContent(), 'Today')
  await shot(page, 'thread')
  assert.equal((await entriesOf(tutor, 'sent')).length, 1, "the reply's copy, in the tutor's own folder")
  await button(page, 'Back').click()
  assert.equal(await row.locator('.dot').count(), 0, 'looked at: new no more')
  await button(page, /Notifications$/).click()
  await inbox(page).locator('.count').waitFor({ state: 'detached' })
  assert.equal(await page.locator('main .rows button').count(), 0, 'nothing yet about the tutor')
  await page.getByText('Nothing yet.').waitFor()
  await shot(page, 'notifications-none')

  // The second reads the reply beside what they sent, and reviews the tutor from the thread; their
  // page closed and opened again first, so Open asks.
  await button(second.page, 'Back').click()
  await closed(second.page)
  await second.page.locator('button.card', { hasText: 'Tutoring student' }).locator('.newpip[aria-label="1 new"]').waitFor({ timeout: 45_000 })
  // From the profile's own Messages button: Messages picked to it, before the unlock its avatar and how many, after it its chip pressed.
  await messagesOf(second.page, 'Tutoring student')
  await second.page.locator('.unopened', { hasText: '1 new message' }).locator('.av[data-market="tutoring"].look').waitFor()
  await shot(second.page, 'messages-picked-asking')
  await button(second.page, 'Open').click()
  await second.page.locator('button.thread-row', { hasText: short(tutor) }).waitFor({ timeout: 60_000 })
  assert.equal(await button(second.page, 'Tutoring student').getAttribute('aria-pressed'), 'true', 'picked to the profile it was opened from')
  assert.equal(await button(second.page, 'All').getAttribute('aria-pressed'), 'false')
  await shot(second.page, 'messages-picked')
  await second.page.locator('button.thread-row', { hasText: short(tutor) }).click()
  await second.page.locator('.said.mine', { hasText: ASK }).waitFor()
  await second.page.locator('.said:not(.mine)', { hasText: YES }).waitFor()
  // Review, from the thread: who it is about known, at the top with Close; Score, Vouch and Report, Score picked, its line.
  await button(second.page, 'Review').click()
  await badge(second.page.locator('.top .who', { hasText: 'Tutoring tutor' })).waitFor()
  assert.equal(await button(second.page, 'Close').locator('.icon').getAttribute('data-icon'), 'x')
  const kinds = second.page.getByRole('group', { name: 'Kind' })
  assert.deepEqual(await kinds.getByRole('button').allTextContents(), ['Score', 'Vouch', 'Report'])
  assert.deepEqual(await kinds.getByRole('button').evaluateAll((b) => b.map((x) => [x.getAttribute('aria-pressed'), (x.querySelector('.icon') as SVGElement).dataset.icon])), [['true', 'star'], ['false', 'handshake'], ['false', 'flag']])
  await second.page.getByText('How did it go, from 1 to 10?').waitFor()
  assert.equal(await second.page.getByLabel('Comment').getAttribute('placeholder'), "What went well, or didn't?")
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
  assert.equal(await second.page.getByText('$30 per hour').count(), 0, 'none of their listings to name')
  await shot(second.page, 'review-someone')
  await button(second.page, 'Post').click()
  await second.page.getByLabel('Message').waitFor({ timeout: 60_000 })
  const reviews = await entriesOf(student, 'review')
  assert.equal(reviews.length, 1)
  const [, review] = reviews[0]!
  assert.deepEqual(review.entry.body, { subject: tutor, score: '9.4', text: 'Clear and patient.' }, 'about the tutor, in tenths, naming none of their listings')
  await second.context.close()
  await button(page, 'Home').click()
  say('two people: an offer per hour, found by its link, messaged, replied to, reviewed in tenths; nothing asked while the seed was held')
})

test("a second browser, the same passkey answering from the first, as a phone answers through the sheet's QR code: I use Forest on another device finds the profile and the stamp, after the sheet Save a passkey on this device?, Not now; a profile it makes, the first shows as New profiles from another device, read in one unlock", async () => {
  const second = await phone()
  // The second browser's own authenticator holds no Forest passkey. Asked with the sheet, the first
  // browser's answers, as a phone does through the QR code: its PRF secret for the same salt.
  await answerFrom(second, first)
  const asked = first.counts.asserted
  await second.page.goto(APP)
  await elsewhere(second)
  // From another device: once, the sheet Save a passkey on this device?, Save and Not now.
  const save = second.page.getByRole('dialog', { name: 'Save a passkey on this device?' })
  await save.waitFor({ timeout: 60_000 })
  assert.deepEqual((await save.getByRole('button').allTextContents()).map((t) => t.trim()), ['Save', 'Not now'])
  assert.ok(await asks(button(second.page, 'Save')), 'Save shows the unlock icon: it makes a passkey')
  await shot(second.page, 'save-passkey')
  await button(second.page, 'Not now').click()
  await homeWith(second.page, 'Tutoring tutor')
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
  await button(page, 'You').click()
  await button(page, 'Home').click()
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

test("a message to one of the person's own profiles: To their tutor, From their student; with the seed held since the last unlock, the messages open by themselves, the loader showing past half a second, and it is sent and opens with nothing asked", async () => {
  const { page, context, counts } = first
  const asked = counts.asserted
  const ownStudent = short((await mainKey(seed, 'tutoring/student')).address)
  // Reading the inbox, slowed here, is a known long wait: the loader shows, once it passes half a second.
  const inboxes = `${services.host}/v1/inbox/read`
  await context.route(inboxes, async (route) => {
    await new Promise((r) => setTimeout(r, 1_500))
    await route.continue()
  })
  await messagesOf(page, 'Tutoring tutor')
  const loader = page.locator('main .loader.big')
  await loader.waitFor({ state: 'attached' })
  assert.deepEqual(await loader.evaluate((l) => [getComputedStyle(l).animationName, getComputedStyle(l).animationDelay]), ['late', '0.5s'], 'shown only once the wait passes half a second')
  await loader.waitFor()
  await shot(page, 'messages-loading')
  // The seed held: no Open, the conversations opened by themselves.
  await page.locator('button.thread-row').first().waitFor({ timeout: 60_000 })
  await context.unroute(inboxes)
  assert.equal(await page.locator('.unopened').count(), 0, 'no Open')
  await shot(page, 'messages-held')
  await button(page, 'New message').click()
  await page.getByLabel('To').fill(tutor)
  await badge(page.locator('.who', { hasText: 'Tutoring tutor' })).waitFor()
  await page.locator('.from', { hasText: 'Tutoring student' }).waitFor()
  assert.equal(await page.locator('main .line').count(), 0, 'not refused')
  assert.equal(await page.locator('.from button').count(), 0, 'from the student they have')
  await page.getByLabel('Message').fill(NOTE)
  await button(page, 'Send').click()
  await page.locator('.said.mine', { hasText: NOTE }).waitFor({ timeout: 60_000 })
  await page.getByText('to your Tutoring student').waitFor()
  await button(page, 'Back').click()
  // The tutor's messages: it arrives, and with the seed held it opens by itself, from the student, new.
  const row = page.locator('button.thread-row', { hasText: NOTE }).filter({ hasText: ownStudent })
  await row.waitFor({ timeout: 90_000 })
  assert.equal(await page.locator('.unopened').count(), 0, 'never Open')
  assert.equal(counts.asserted - asked, 0, 'opened, sent and opened again, nothing asked')
  await row.locator('.dot').waitFor()
  await row.click()
  await page.locator('.said:not(.mine)', { hasText: NOTE }).waitFor()
  await page.getByText('to your Tutoring tutor').waitFor()
  await button(page, 'Back').click()
  // No back on Messages: the phone's own back, to the profile it was opened from, then Home's.
  await page.goBack()
  await button(page, 'Back').click()
  say("a message from the person's student to their own tutor: sent, counted, opened")
})

test('one passkey per person: after Forget, Start finds it, straight to Home; with the sheet closed, No passkey found and Try again, never First time here?', async () => {
  const { page, counts, cdp, authenticator } = first
  await button(page, 'You').click()
  await button(page, 'Forget this device').click()
  await page.getByText('Your passkey stays in your password manager.').waitFor()
  await button(page, 'Forget').click()
  await button(page, 'Start').click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.created, 1, 'Start found the passkey; nothing made')

  await button(page, 'You').click()
  await button(page, 'Forget this device').click()
  await button(page, 'Forget').click()
  // The person closes the passkey sheet: a browser can't tell that from no passkey, so No passkey found.
  await closeTheSheetOnce(page)
  await button(page, 'Start').click()
  await page.getByRole('dialog', { name: 'No passkey found' }).waitFor()
  assert.equal(await page.getByRole('dialog', { name: 'First time here?' }).count(), 0, 'never First time here? where a passkey is known')
  await shot(page, 'start-closed-known')
  await button(page, 'Try again').click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.created, 1, 'and no second passkey')
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId: authenticator })
  assert.equal(credentials.length, 1)
  say('one passkey: found after Forget, straight to Home; a closed sheet, No passkey found, Try again, and never a second')
})

/** The live, locked backup/<id> entries of the Profiles folder at `wallet`, as anyone reads them. */
const backupsOn = async (wallet: string) => (await entriesOf(wallet, 'backup')).filter(([, c]) => isLocked(c.entry.body))

/** A passkey's id as the app keeps it, from the id the virtual authenticator gives. */
const idOf = (credentialId: string) => Buffer.from(credentialId, 'base64').toString('base64url')

/** The rows of Passkeys, one per passkey. */
const passkeyRows = (page: Page) => page.getByRole('list', { name: 'Your passkeys' }).getByRole('listitem')
/** Each passkey's row in words: its name, and Main on the first. */
const passkeyWords = (page: Page) => passkeyRows(page).evaluateAll((rows) => rows.map((r) => [...r.querySelectorAll('.grow > *')].map((x) => x.textContent)))
/** A passkey's sheet, from its row: its name its title. */
async function passkeySheet(page: Page, name: string) {
  await passkeyRows(page).filter({ hasText: name }).first().click()
  const sheet = page.getByRole('dialog', { name })
  await sheet.getByRole('heading', { name }).waitFor()
  return sheet
}
/** A passkey renamed on its sheet: its Name field, then Save, which closes it. */
async function renamePasskey(page: Page, from: string, to: string) {
  const sheet = await passkeySheet(page, from)
  await sheet.getByLabel('Name').fill(to)
  await sheet.getByRole('button', { name: 'Save' }).click()
  await sheet.waitFor({ state: 'detached' })
}
/** A passkey removed from its sheet: Remove, tapped twice, then its row gone. */
async function removePasskey(page: Page, name: string) {
  const sheet = await passkeySheet(page, name)
  const remove = sheet.getByRole('button', { name: 'Remove', exact: true })
  await remove.click()
  assert.match((await remove.getAttribute('class')) ?? '', /solid/, 'tapped once, it fills red')
  await remove.click()
  await sheet.waitFor({ state: 'detached', timeout: 30_000 })
  await passkeyRows(page).filter({ hasText: name }).waitFor({ state: 'detached' })
}
/** Passkeys, from You, from a place. */
async function toPasskeys(page: Page) {
  await button(page, 'You').click()
  await page.locator('button.row', { hasText: 'Passkeys' }).click()
  await page.getByRole('heading', { name: 'Passkeys' }).waitFor()
  await passkeyRows(page).first().waitFor({ timeout: 30_000 })
}
/** Back from Passkeys to You, then Home: twice after a reload on Your 24 words, which opens Passkeys in its place, each back waited for by a mark left on the entry it leaves. */
async function passkeysHome(page: Page) {
  const you = page.getByRole('heading', { name: 'You', exact: true })
  for (let i = 0; i < 3 && !(await you.isVisible()); i++) {
    await page.evaluate(() => history.replaceState({ ...history.state, left: true }, ''))
    await button(page, 'Back').click()
    await page.waitForFunction(() => !history.state?.left && document.querySelector('main h1')?.textContent === (location.pathname === '/you' ? 'You' : 'Passkeys'))
  }
  await you.waitFor()
  await button(page, 'Home').click()
}

test("passkeys, every one a row: the first Main, by the name it was given else Passkey after Forget, renamed and back, its sheet with no Remove; the same manager refused; a security key made one, Passkey 2, since it sends no maker, renamed; a browser holding only that one opens the same profiles; removed from its sheet, it opens them no more; after Forget, its own seed, Get verified", async () => {
  const { page, cdp, counts } = first
  const wallet = (await mainKey(seed, '')).address
  const passkeys = page.getByRole('list', { name: 'Your passkeys' })
  const add = button(page, 'Add a passkey')
  const why = page.getByText("Add a second, so losing one doesn't lose your profiles.", { exact: true })
  await button(page, 'You').click()
  await page.locator('button.row', { hasText: 'Passkeys' }).locator('.two > span', { hasText: '1 passkey' }).waitFor()
  await toPasskeys(page)
  // The first: Passkey, since this device forgot what it knew of it, and since this one sends no maker; Main, the mint chip; its
  // square a key; a chevron; no dates, no line under it, no Remove in the list.
  assert.deepEqual(await passkeyWords(page), [['Passkey', 'Main']])
  const main = passkeyRows(page).first()
  assert.deepEqual(await main.evaluate((r) => [(r.querySelector('.sq .icon') as SVGElement).dataset.icon, !!r.querySelector('[data-icon="caret-right"]'), getComputedStyle(r.querySelector('.mainchip')!).backgroundColor]), ['key', true, await page.evaluate(() => {
    const span = document.body.appendChild(document.createElement('span'))
    span.style.color = 'var(--mint)'
    const color = getComputedStyle(span).color
    span.remove()
    return color
  })], 'a key, a chevron, Main on mint')
  assert.equal(await passkeys.getByRole('button', { name: /Remove/ }).count(), 0, 'no Remove in the list')
  // Its sheet: its name the title, a Name field, Save; no Remove at all, since the app never removes the passkey the seed comes from.
  const mainSheet = await passkeySheet(page, 'Passkey')
  assert.equal(await mainSheet.getByLabel('Name').inputValue(), 'Passkey')
  assert.equal(await mainSheet.getByRole('button', { name: /Remove/ }).count(), 0, 'the first, never removed')
  await shot(page, 'passkey-sheet-main')
  await page.keyboard.press('Escape')
  await mainSheet.waitFor({ state: 'detached' })
  // Renamed, on this device alone, nothing asked; its name taken back with the field emptied.
  const renamedAsked = counts.asserted
  await renamePasskey(page, 'Passkey', 'My phone')
  assert.deepEqual(await passkeyWords(page), [['My phone', 'Main']])
  assert.deepEqual(JSON.parse((await kept(page))['forest.backups']!), { first: { name: 'My phone' } }, 'kept on the device')
  await renamePasskey(page, 'My phone', '')
  assert.deepEqual(await passkeyWords(page), [['Passkey', 'Main']])
  assert.equal(counts.asserted - renamedAsked, 0, 'nothing asked')
  await why.waitFor()
  assert.equal(await why.getAttribute('class'), 'line', 'a quiet line')
  assert.equal(await add.locator('[data-icon="plus"]').count(), 1, 'Add a passkey, its plus')
  assert.equal(await page.locator('.dot').count(), 0, 'no dot')
  await page.getByRole('heading', { name: 'If you lose every passkey' }).waitFor()
  await page.locator('button.row', { hasText: 'Your 24 words' }).getByText('Write them down to get back in', { exact: true }).waitFor()
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
  await page.getByRole('heading', { name: 'Passkeys' }).waitFor({ timeout: 60_000 })
  const onKey = (await cdp.send('WebAuthn.getCredentials', { authenticatorId: key })).credentials
  assert.deepEqual(onKey.map((c) => [c.rpId, c.isResidentCredential]), [['app.forest.foundation', true]], 'made on the security key')
  assert.equal((await cdp.send('WebAuthn.getCredentials', { authenticatorId: first.authenticator })).credentials.length, 1, "none more in the phone's own manager")
  const addedId = idOf(onKey[0]!.credentialId)
  await passkeyRows(page).nth(1).waitFor()
  assert.deepEqual(await passkeyWords(page), [['Passkey', 'Main'], ['Passkey 2']], 'it sends no maker, so Passkey, and a second Passkey takes 2')
  assert.equal(await why.count(), 0, 'two: no line')
  assert.equal(await passkeyRows(page).nth(1).locator('.unlock').count(), 0, 'no unlock icon on a row')
  await renamePasskey(page, 'Passkey 2', 'Security key')
  assert.deepEqual(await passkeyWords(page), [['Passkey', 'Main'], ['Security key']])
  await shot(page, 'settings-passkeys-two')
  // Its sheet: the name its title, the Name field, then one row: Remove in red text at the left, Save at the right.
  const buttonsOf = (sheet: Locator) => sheet.locator('.sheet-buttons button').evaluateAll((b) => b.map((x) => [x.textContent!.trim(), Math.round(x.getBoundingClientRect().x), x.className]))
  const keySheet = await passkeySheet(page, 'Security key')
  await fromTheBottom(page, keySheet)
  const onPhone = await buttonsOf(keySheet)
  assert.deepEqual(onPhone.map(([words, , kind]) => [words, kind]), [['Remove', 'danger text small'], ['Save', 'primary small']], 'Remove, then Save; no Cancel on a phone')
  assert.ok((onPhone[0]![1] as number) < (onPhone[1]![1] as number), 'Remove at the left')
  await page.keyboard.press('Escape')
  await keySheet.waitFor({ state: 'detached' })
  // On a laptop: a dialog in the middle, Remove at the left, then Cancel and Save; Cancel closes it. Main's, Cancel and Save alone.
  await page.setViewportSize({ width: 1280, height: 800 })
  const keyDialog = await passkeySheet(page, 'Security key')
  await inTheMiddle(page, keyDialog)
  const onLaptop = await buttonsOf(keyDialog)
  assert.deepEqual(onLaptop.map(([words]) => words), ['Remove', 'Cancel', 'Save'])
  assert.ok((onLaptop[0]![1] as number) < (onLaptop[1]![1] as number) && (onLaptop[1]![1] as number) < (onLaptop[2]![1] as number), 'in that order, left to right')
  await shot(page, 'laptop-passkey-dialog')
  await keyDialog.getByRole('button', { name: 'Cancel' }).click()
  await keyDialog.waitFor({ state: 'detached' })
  const mainDialog = await passkeySheet(page, 'Passkey')
  await inTheMiddle(page, mainDialog)
  assert.deepEqual((await buttonsOf(mainDialog)).map(([words]) => words), ['Cancel', 'Save'], 'never Remove on Main')
  await page.keyboard.press('Escape')
  await mainDialog.waitFor({ state: 'detached' })
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal((await backupsOn(wallet)).length, 1, 'underneath, the standard\'s backup/<id> entry in the Profiles folder')
  assert.ok((JSON.parse((await kept(page))['forest.passkeys']!) as string[]).includes(addedId), 'the device knows it')

  // A browser holding only that passkey, answered through the sheet's QR code: Save a passkey on this device?, Not now, and the same profiles.
  const other = await phone()
  await answerFrom(other, first, () => addedId)
  await other.page.goto(APP)
  await elsewhere(other)
  await button(other.page, 'Not now').click({ timeout: 60_000 })
  await homeWith(other.page, 'Tutoring tutor')
  const there = await kept(other.page)
  assert.equal(JSON.parse(there['forest.passkey']!), addedId, 'that passkey, the one in use there')
  assert.deepEqual((JSON.parse(there['forest.profiles']!) as Array<{ label: string }>).map((x) => x.label), ['tutoring/student', 'tutoring/tutor'])
  assert.equal(JSON.parse(there['forest.folder']!).address, wallet, "the first passkey's Profiles folder")

  // Removed from its sheet, tapped twice: one passkey again, the line back, and that passkey opens the profiles no more.
  await removePasskey(page, 'Security key')
  await why.waitFor()
  assert.equal(JSON.parse((await kept(page))['forest.backups'] ?? '{}')[(await backupsOn(wallet))[0]?.[0] ?? ''], undefined, 'its name gone with it')
  assert.equal((await backupsOn(wallet)).length, 0)
  await closed(other.page)
  await messagesOf(other.page, 'Tutoring tutor')
  await button(other.page, 'Open').click()
  const gone = other.page.getByText('This passkey no longer opens your profiles.')
  await gone.waitFor({ timeout: 30_000 })
  assert.equal(await gone.getAttribute('class'), 'line red')
  await shot(other.page, 'not-yours')

  // After Forget, Start with it: its own seed, with no stamp, so Get verified. Messages has no back: the phone's own.
  await other.page.goBack()
  await button(other.page, 'Back').click()
  await button(other.page, 'You').click()
  await button(other.page, 'Forget this device').click()
  await button(other.page, 'Forget').click()
  await button(other.page, 'Start').click()
  await other.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  await other.context.close()
  await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId: key })

  assert.equal(await passkeyRows(page).count(), 1)
  await passkeysHome(page)
  say('passkeys: one made on a security key, opened elsewhere, removed, and its own seed after Forget')
})

test('signed in through the QR code: Save a passkey on this device? once; Save makes one here, added to the first, and the one in use here from then, so the next unlock asks this device, not the phone', async () => {
  const third = await phone()
  await answerFrom(third, first)
  const asked = first.counts.asserted
  await third.page.goto(APP)
  await elsewhere(third)
  await third.page.getByRole('dialog', { name: 'Save a passkey on this device?' }).waitFor({ timeout: 60_000 })
  await button(third.page, 'Save').click()
  await homeWith(third.page, 'Tutoring tutor')
  assert.equal(first.counts.asserted - asked, 1, 'the phone asked once, to sign in')
  assert.equal(third.counts.created, 1, 'one made here')
  const { credentials } = await third.cdp.send('WebAuthn.getCredentials', { authenticatorId: third.authenticator })
  assert.equal(credentials.length, 1)
  const here = idOf(credentials[0]!.credentialId)
  assert.equal(JSON.parse((await kept(third.page))['forest.passkey']!), here, 'the one in use here')
  const wallet = (await mainKey(seed, '')).address
  assert.equal((await backupsOn(wallet)).length, 1, 'added to the first')

  // The page closed: the next unlock is this device's own, the phone left alone.
  await closed(third.page)
  const before = [first.counts.asserted, third.counts.asserted]
  await messagesOf(third.page, 'Tutoring tutor')
  await button(third.page, 'Open').click()
  await third.page.locator('.unopened').waitFor({ state: 'detached', timeout: 60_000 })
  assert.deepEqual([first.counts.asserted - before[0]!, third.counts.asserted - before[1]!], [0, 1], 'this device asked, not the phone')
  await third.context.close()

  // On the first device, two passkeys alike; the one saved there removed again.
  const { page } = first
  await toPasskeys(page)
  await passkeyRows(page).nth(1).waitFor({ timeout: 30_000 })
  assert.equal(await passkeyRows(page).count(), 2)
  assert.deepEqual((await passkeyWords(page))[1], ['Passkey 2'], 'made on another device: nothing known of it here')
  await removePasskey(page, 'Passkey 2')
  await passkeysHome(page)
  say('signed in through the QR code: a passkey saved here, the next unlock asked here')
})

/** What the sheet before the 24 words warns, and the line under them. */
const WARNING = 'Anyone who sees them can act as you. Write them on paper and keep it somewhere safe.'
const NEVER = "Never type them into a site or app you don't trust."

/** Passkeys' Your 24 words, its sheet's Show words: the passkey asked, and the words' screen. */
async function showWords(page: Page) {
  await page.locator('button.row', { hasText: 'Your 24 words' }).click()
  await page.getByRole('dialog', { name: 'Show your 24 words?' }).getByRole('button', { name: 'Show words' }).click()
  await page.locator('.words li').nth(23).waitFor({ timeout: 30_000 })
}

/** The 24 words Your 24 words shows, in order, without their numbers. */
const wordsShown = async (page: Page) => (await page.locator('.words li').allTextContents()).map((t) => t.replace(/^\d+\s*/, '').trim())

test("24 words: Passkeys' Your 24 words, a sheet with its warning, Show words asking the passkey, the seed held or not, then the words in three columns, kept nowhere, gone with Done and with a reload; another browser types them from No passkey found: refused while it lists a different Forest, until Forget; then a new passkey opens the same profiles, and the first lists it", async () => {
  const { page, counts } = first
  await toPasskeys(page)
  const before = await passkeyRows(page).count()
  // The sheet: a red warning square, its question, its warning; Show words with the unlock icon, even with the seed held; Cancel.
  await page.locator('button.row', { hasText: 'Your 24 words' }).click()
  const sheet = page.getByRole('dialog', { name: 'Show your 24 words?' })
  await sheet.getByRole('heading', { name: 'Show your 24 words?' }).waitFor()
  await sheet.getByText(WARNING, { exact: true }).waitFor()
  assert.equal(await sheet.locator('.sq.red [data-icon="warning"]').count(), 1, 'its red warning square')
  const show = sheet.getByRole('button', { name: 'Show words' })
  assert.ok(await asks(show), 'Show words asks the passkey, even with the seed held')
  assert.equal((await sheet.locator('button.primary').textContent())?.trim(), 'Show words', 'the primary')
  await shot(page, 'words-sheet')
  const asked = counts.asserted
  await sheet.getByRole('button', { name: 'Cancel' }).click()
  await sheet.waitFor({ state: 'detached' })
  assert.equal(counts.asserted, asked, 'Cancel asks nothing')
  await page.locator('button.row', { hasText: 'Your 24 words' }).click()
  await show.click()
  await page.getByRole('heading', { name: 'Your 24 words' }).waitFor()
  await page.locator('.words li').nth(23).waitFor()
  assert.equal(counts.asserted, asked + 1, 'one unlock')
  const words = await wordsShown(page)
  assert.equal(words.join(' '), exportWords(seed), "the standard's 24 words for the seed")
  assert.equal((await page.locator('.words').evaluate((g) => getComputedStyle(g).gridTemplateColumns)).split(' ').length, 3, 'three columns')
  assert.deepEqual(await page.locator('.words li .xs').evaluateAll((n) => n.slice(0, 3).map((x) => x.textContent)), ['1', '2', '3'], 'each its number')
  await page.getByText(NEVER, { exact: true }).waitFor()
  await shot(page, 'words')
  const stored = JSON.stringify({ local: await kept(page), session: await page.evaluate(() => ({ ...sessionStorage })), history: await page.evaluate(() => history.state) })
  for (let i = 0; i + 3 <= 24; i++) assert.ok(!stored.includes(words.slice(i, i + 3).join(' ')), 'nothing keeps them')
  // Done: back on Passkeys, the words gone; shown again and the page reloaded: Passkeys, the words gone too.
  await button(page, 'Done').click()
  await page.getByRole('heading', { name: 'Passkeys' }).waitFor()
  assert.equal(await page.locator('.words li').count(), 0, 'gone once the screen closed')
  await showWords(page)
  await page.reload()
  await page.getByRole('heading', { name: 'Passkeys' }).waitFor()
  assert.equal(await page.locator('.words li').count(), 0, 'gone with the page: a reload opens Passkeys')
  await passkeysHome(page)
  await page.locator('button.card').first().waitFor()
  const cards = (await page.locator('button.card .nm2').allTextContents()).sort()

  // Another browser, which lists a Forest of its own: a passkey just made, Get verified, and back; its passkey sheet closed at Start, No passkey found, and Type my 24 words.
  const other = await phone()
  await other.page.goto(APP)
  await imNew(other)
  await other.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  await button(other.page, 'Back').click()
  await closeTheSheetOnce(other.page)
  await button(other.page, 'Start').click()
  await button(other.page, 'Type my 24 words').click()
  await other.page.getByRole('heading', { name: 'Your 24 words' }).waitFor()
  // Its back: No passkey found again.
  await button(other.page, 'Back').click()
  await other.page.getByRole('dialog', { name: 'No passkey found' }).waitFor()
  await button(other.page, 'Type my 24 words').click()
  const box = other.page.getByLabel('Your 24 words')
  const create = button(other.page, 'Continue')
  assert.ok(await asks(create), 'Continue shows the unlock icon: it makes a passkey')
  const count = other.page.locator('.words-count')
  assert.equal(await count.textContent(), 'In order, with spaces between them0 of 24')
  assert.ok(await create.isDisabled(), 'Continue off until all 24 are there')
  await shot(other.page, 'words-in')
  const made = other.counts.created
  const line = other.page.locator('main .line')
  // Some missing: how many, and Continue still off; a word wrong: a red line; neither makes a passkey.
  await box.fill(words.slice(0, 23).join(' '))
  assert.equal(await count.textContent(), 'In order, with spaces between them23 of 24')
  assert.ok(await create.isDisabled(), 'still off at 23')
  await box.fill([...words.slice(0, 23), 'forest1'].join(' '))
  await create.click()
  await line.getByText('A word is wrong, or in the wrong place.', { exact: true }).waitFor()
  assert.equal(await line.getAttribute('class'), 'line red')
  // The person's words, on a browser that lists another Forest: never two seeds on one device.
  await box.fill(words.join('  ').toUpperCase())
  await create.click()
  await line.getByText('These words open a different Forest.', { exact: true }).waitFor()
  assert.equal(await line.getAttribute('class'), 'line red')
  assert.equal(await button(other.page, 'Continue').count(), 0, 'Forget this device in its place')
  assert.equal(other.counts.created, made, 'no passkey made')
  await shot(other.page, 'words-different')
  await button(other.page, 'Forget this device').click()
  await line.waitFor({ state: 'detached' })
  assert.deepEqual(Object.keys(await kept(other.page)), ['forest.passkeys'], 'forgotten: only the passkeys it knows')
  await button(other.page, 'Continue').click()
  await other.page.locator('button.card').first().waitFor({ timeout: 60_000 })
  assert.equal(other.counts.created, made + 1, 'one passkey made')
  assert.deepEqual((await other.page.locator('button.card .nm2').allTextContents()).sort(), cards, 'the same profiles')
  const there = JSON.stringify({ local: await kept(other.page), session: await other.page.evaluate(() => ({ ...sessionStorage })), history: await other.page.evaluate(() => history.state) })
  for (let i = 0; i + 3 <= 24; i++) assert.ok(!there.includes(words.slice(i, i + 3).join(' ')), 'nothing keeps them there either')
  // Its next unlock follows the new passkey's seed entry to the seed: the same words. There, the passkey made for the words is the
  // last, Passkey 2, since it sends no maker.
  await closed(other.page)
  await toPasskeys(other.page)
  assert.deepEqual((await passkeyWords(other.page)).at(-1), ['Passkey 2'], 'made there, for the words')
  await showWords(other.page)
  assert.deepEqual(await wordsShown(other.page), words, 'the same seed')
  await other.context.close()

  // The first lists one passkey more.
  await toPasskeys(page)
  await passkeyRows(page).nth(before).waitFor({ timeout: 30_000 })
  assert.equal(await passkeyRows(page).count(), before + 1)
  await passkeysHome(page)
  say('24 words: shown after an unlock and kept nowhere; typed in another browser, refused while it lists another Forest, then a passkey there opening the same profiles')
})

const COAT = 'A wool coat, worn twice.'
/** What the buyer asks for, at an exact spot. */
const WANTED = 'A warm winter coat, size M.'

test('clothing, with the index: a coat with two photos redrawn on the device, no per, for women, size XL, picked up or shipped, near Lavapiés, $40, listed; a buyer, with no location allowed, puts an area on the map and asks for a coat at an exact spot; the buyer messages, reviews, vouches and reports; the seller sees the rating, "3 new" on the profile, the tab counting the three and the message, the three marked in the profile\'s Feedback and seen there; Notifications lists them, and no message', async () => {
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
  // Who it's for, then the kind, and only then one size question, right after them, by its labels. Who it's for takes several:
  // each chip picked shows its tick. The kind takes one: on its sheet, rows with a radio mark and no tick box, no Done, and a
  // tap picks it and closes the sheet.
  const wearer = page.getByRole('group', { name: 'Wearer' })
  await wearer.getByRole('button', { name: 'Women' }).click()
  assert.deepEqual([await wearer.getByRole('button', { name: 'Women' }).getAttribute('aria-pressed'), await wearer.getByRole('button', { name: 'Women' }).locator('[data-icon="check"]').count()], ['true', 1], 'one of several, its tick')
  assert.equal(await page.getByLabel('Size', { exact: true }).count(), 0, 'no size before the kind')
  await page.getByRole('group', { name: 'Kind', exact: true }).locator('button.open-row').click()
  const kindSheet = page.getByRole('dialog', { name: 'Kind' })
  assert.deepEqual([await kindSheet.getByRole('radiogroup').count(), await kindSheet.getByRole('checkbox').count(), await kindSheet.locator('.tick').count(), await kindSheet.getByRole('button', { name: 'Done' }).count()], [1, 0, 0, 0], 'one choice: radio rows, no tick box, no Done')
  assert.equal(await kindSheet.getByRole('radio').first().locator('.radio').count(), 1, 'each row its radio mark')
  await shot(page, 'picker-one')
  await kindSheet.getByRole('radio', { name: 'Coat', exact: true }).click()
  await kindSheet.waitFor({ state: 'detached' })
  assert.equal(await page.getByRole('group', { name: 'Kind', exact: true }).locator('button.open-row').textContent(), 'Coat', 'one picked, in words, on its row')
  const coatLabels = (await page.locator('form > .field > .label').allTextContents()).map((l) => l.replace('Public.', ''))
  assert.deepEqual(coatLabels, ['Photos', 'Description', 'Price', 'Wearer', 'Kind', 'Size', 'Brand', 'Condition', 'Location', 'Delivery', 'Contact'], 'one size question, right after who and the kind')
  await page.getByRole('group', { name: 'Size', exact: true }).locator('button.open-row').click()
  assert.deepEqual(await page.getByRole('dialog', { name: 'Size' }).getByRole('radio').allTextContents(), ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'One size'], 'each value by its label, else in words')
  await page.keyboard.press('Escape')
  await pick(page, 'Size', 'XL')
  // A choice of one among chips behaves as one: picking another unpicks the first, and none shows a tick.
  const condition = page.getByRole('radiogroup', { name: 'Condition' })
  await condition.getByRole('radio', { name: 'Good' }).click()
  await condition.getByRole('radio', { name: 'Like new' }).click()
  assert.deepEqual(await condition.getByRole('radio', { checked: true }).allTextContents(), ['Like new'], 'one picked, the other unpicked')
  assert.equal(await condition.locator('[data-icon="check"]').count(), 0, 'no tick')
  // A choice of several: picked up and shipped.
  const delivery = page.getByRole('group', { name: 'Delivery' })
  await delivery.getByRole('button', { name: 'Pickup' }).click()
  await delivery.getByRole('button', { name: 'Shipping' }).click()
  // Where the coat is: on its screen, the circle round the phone's one kept point, the offer's; the
  // slider from the field's 2 km to 3. An exact spot: its one quiet line, and no pin, so no Done, until
  // one is dropped; back to the area, Done.
  const location = page.getByRole('group', { name: 'Location' })
  await location.getByRole('button', { name: 'Choose on the map' }).waitFor()
  const where = await placeScreen(page, 'Location')
  await where.getByText('Within 2 km', { exact: true }).waitFor()
  await where.getByRole('slider', { name: 'Within' }).fill('2')
  await where.getByText('Within 3 km', { exact: true }).waitFor()
  await where.getByLabel('Place name').fill('Lavapiés, Madrid')
  await where.getByRole('button', { name: 'Exact spot' }).click()
  await where.getByText('Anyone can see this exact spot.', { exact: true }).waitFor()
  assert.equal(await where.locator('.maplibregl-marker').count(), 0, 'no pin until one is dropped')
  assert.ok(await where.getByRole('button', { name: 'Done' }).isDisabled(), 'so no Done')
  await where.getByRole('button', { name: 'Area' }).click()
  await where.getByRole('button', { name: 'Done' }).click()
  await location.getByRole('button', { name: /^Lavapiés, Madrid\s*Within 3 km$/ }).waitFor()
  await page.getByLabel('Contact').fill('@coats')
  // The page hidden a moment keeps the seed, which closing it dropped: Post asks, and shows it.
  await away(page)
  assert.equal(await asks(button(page, 'Post')), true, 'the unlock icon on Post')
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Post's unlock icon, in its text color")
  await shot(page, 'listing-coat')
  const asked = counts.asserted
  await button(page, 'Post').click()
  const coatRow = page.locator('.listing-card', { hasText: COAT })
  await coatRow.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock: the listing and its photos')
  const [[coatPath, coat]] = (await entriesOf(seller, 'listing')) as unknown as [[string, { entry: { body: any } }]]
  const body = coat.entry.body
  assert.deepEqual([body.description, body.price, body.wearer, body.kind, body.size, body.delivery, body.contact], [COAT, { amount: '40', currency: 'USD' }, ['women'], 'coat', 'xl', ['pickup', 'shipping'], '@coats'], 'no per; who, the kind, the size by its value, several deliveries')
  assert.deepEqual([body.location.radiusKm, body.location.area], [3, 'Lavapiés, Madrid'])
  const km = kmFromSpot(body.location)
  assert.ok(km > 0.1 && km < 0.8, `its point moved a little from the phone's, ${km.toFixed(2)} km`)
  assert.deepEqual(JSON.parse((await kept(page))['forest.points']!), [{ lat: body.location.lat, lon: body.location.lon }], "the device's one kept point, which the offer's place took too: never a new one from the same spot")
  assert.equal(loadMarkets().checkEntry('clothing', 'seller', 'listing', body), null, 'it fits the market')
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
  assert.equal(await coatRow.getByText('Needs an update').count(), 0, 'it fits: nothing to update')
  await shot(page, 'profile-coat')
  // The index lists it: it fits the market as the index reads it.
  const onIndex = `${services.index}/profiles/${seller}/${coatPath}.json`
  for (const until = Date.now() + 45_000; ; ) {
    const res = await fetch(onIndex)
    const listed = res.ok ? ((await res.json()) as { listing: { listed: boolean; why?: string } }).listing : null
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
  buyerAt = buyerAddress
  await button(buyer.page, 'Skip').click()
  // A phone that hasn't allowed its location. Its browser told no before (headless Chromium's
  // answer for a site never granted): the map opens on the whole world, with no circle, no Done, no
  // button for the location and no line. A tap puts the circle there, round the centre it keeps, and
  // the map fits it; a drag carries it east, more than a kept centre's reach, so a second is kept.
  await buyer.page.locator('button.card', { hasText: 'Clothing buyer' }).click()
  await button(buyer.page, 'New request').click()
  const map = await placeScreen(buyer.page, 'Location')
  assert.equal(await map.getByRole('button', { name: 'Your location' }).count(), 0, 'told no before: no button')
  assert.equal(await map.locator('.line').count(), 0, 'and no line')
  assert.ok(await map.getByRole('button', { name: 'Done' }).isDisabled(), 'no circle yet')
  const middle = await middleOf(map)
  await buyer.page.mouse.click(middle.x, middle.y)
  const [tapped] = await keptPoints(buyer.page, 1)
  await buyer.page.waitForTimeout(1_000)
  await buyer.page.mouse.move(middle.x, middle.y)
  await buyer.page.mouse.down()
  for (let step = 1; step <= 10; step++) await buyer.page.mouse.move(middle.x + step * 12, middle.y)
  await buyer.page.mouse.up()
  const [, carried] = await keptPoints(buyer.page, 2)
  assert.ok(Number(carried!.lon) > Number(tapped!.lon) && kmApart(tapped!, carried!) > 0.8, `carried east, ${kmApart(tapped!, carried!).toFixed(2)} km`)
  await shot(buyer.page, 'place-carried')
  // An exact spot, a tap on the map's middle, where the first circle put it, the map the same size
  // as for the area: posted exactly there.
  await map.getByRole('button', { name: 'Exact spot' }).click()
  await map.getByText('Anyone can see this exact spot.', { exact: true }).waitFor()
  assert.deepEqual(await middleOf(map), middle, 'the map kept its size')
  await buyer.page.mouse.click(middle.x, middle.y)
  await map.locator('.maplibregl-marker').waitFor()
  await shot(buyer.page, 'place-spot')
  await map.getByRole('button', { name: 'Done' }).click()
  await buyer.page.getByRole('group', { name: 'Location' }).getByRole('button', { name: 'An exact spot' }).waitFor()
  await buyer.page.getByLabel('Description').fill(WANTED)
  await button(buyer.page, 'Post').click()
  await buyer.page.locator('.listing-card', { hasText: WANTED }).waitFor({ timeout: 60_000 })
  const [[, wanted]] = (await entriesOf(buyerAddress, 'listing')) as unknown as [[string, { entry: { body: any } }]]
  const spot = wanted.entry.body.location
  assert.equal(spot.radiusKm, 0, 'an exact spot')
  assert.match(spot.lat, /^-?\d+\.\d{5}$/, 'to about a metre')
  assert.ok(kmApart(spot, tapped!) < 0.05, `where the pin was dropped, ${(kmApart(spot, tapped!) * 1000).toFixed(0)} m from the map's middle`)
  assert.equal(loadMarkets().checkEntry('clothing', 'buyer', 'listing', wanted.entry.body), null, 'it fits the market')
  // Never asked: the map's own button asks, and the browser's own prompt only on its tap; here the
  // prompt is refused: one quiet line, and the button goes.
  const { targetInfo } = await buyer.cdp.send('Target.getTargetInfo')
  await buyer.cdp.send('Browser.setPermission', { permission: { name: 'geolocation' }, setting: 'prompt', origin: APP.slice(0, -1), browserContextId: targetInfo.browserContextId! })
  await button(buyer.page, 'New request').click()
  const asking = await placeScreen(buyer.page, 'Location')
  await asking.getByRole('button', { name: 'Your location' }).click()
  await asking.getByText("Your location isn't allowed.", { exact: true }).waitFor()
  assert.equal(await asking.getByRole('button', { name: 'Your location' }).count(), 0, 'refused: the line alone')
  await shot(buyer.page, 'place-refused')
  await asking.getByRole('button', { name: 'Back' }).click()
  await asking.waitFor({ state: 'detached' })
  await button(buyer.page, 'Close').click()
  await button(buyer.page, 'Back').click()
  // The page closed and opened again, so no seed is held; before the unlock, with none new, a lock and Open your messages, and Open.
  await closed(buyer.page)
  await messagesOf(buyer.page, 'Clothing buyer')
  const none = buyer.page.locator('.unopened', { hasText: 'Open your messages' })
  await none.locator('[data-icon="lock-simple"]').waitFor()
  await button(buyer.page, 'Open').waitFor()
  assert.equal(await buyer.page.getByText('No new messages').count(), 0, 'never "No new messages" beside Open')
  await shot(buyer.page, 'messages-none')
  // New message, the round pencil at the top, before the unlock too.
  await button(buyer.page, 'New message').click()
  await buyer.page.getByRole('heading', { name: 'New message' }).waitFor()
  assert.ok((await buyer.page.getByLabel('To').isVisible()) && (await buyer.page.getByLabel('Message').isVisible()), 'To and the message box, from the start')
  await shot(buyer.page, 'message-empty')
  // Their own profile: taken, From their profile on the other side, to make.
  await buyer.page.getByLabel('To').fill(buyerAddress)
  await badge(buyer.page.locator('.who', { hasText: 'Clothing buyer' })).waitFor()
  await buyer.page.locator('.from', { hasText: 'Clothing seller' }).getByRole('button', { name: 'New profile' }).waitFor()
  assert.equal(await buyer.page.locator('main .line').count(), 0, 'not refused')
  // Changed: the box again. The seller's page on the index, as their Share hands it out: taken as their address.
  await button(buyer.page, 'Change').click()
  await buyer.page.getByLabel('To').fill(`${services.index}/profiles/${seller}`)
  await badge(buyer.page.locator('.who', { hasText: 'Clothing seller' })).waitFor()
  await buyer.page.locator('.from', { hasText: 'Clothing buyer' }).waitFor()
  assert.equal(await buyer.page.locator('main .line').count(), 0)
  await buyer.page.getByLabel('Message').fill('Is the coat still there?')
  await button(buyer.page, 'Send').click()
  await buyer.page.locator('.said.mine', { hasText: 'Is the coat still there?' }).waitFor({ timeout: 60_000 })
  // Score, with the market's own question for a seller, in its own words, in one row: Yes or No.
  await button(buyer.page, 'Review').click()
  const score = buyer.page.getByLabel('Score')
  await score.focus()
  await score.press('End')
  const question = buyer.page.getByRole('group', { name: 'As described' })
  assert.deepEqual([await question.locator('strong').textContent(), await question.getByRole('button').allTextContents()], ['As described', ['Yes', 'No']])
  const [words, chips] = [(await question.locator('strong').boundingBox())!, (await question.getByRole('button', { name: 'No' }).boundingBox())!]
  assert.ok(Math.abs(words.y + words.height / 2 - (chips.y + chips.height / 2)) < 4 && chips.x > words.x, 'in one row: its words, then its chips')
  await question.getByRole('button', { name: 'Yes' }).click()
  assert.equal(await buyer.page.getByRole('button', { name: COAT }).count(), 0, 'no listing of theirs to name')
  await buyer.page.getByLabel('Comment').fill('Just like the photos.')
  await shot(buyer.page, 'review-question')
  await button(buyer.page, 'Post').click()
  await buyer.page.getByLabel('Message').waitFor({ timeout: 60_000 })
  const [[, reviewed]] = (await entriesOf(buyerAddress, 'review')) as unknown as [[string, { entry: { body: any } }]]
  assert.deepEqual(reviewed.entry.body, { asDescribed: 'yes', subject: seller, text: 'Just like the photos.', score: '10' })

  // From the buyer's profile, its Reviews tab and Review someone: who first, on a sheet, the seller among
  // those it has a conversation with; a vouch, written again in its place, then a report, each about
  // the seller; the tab lists all three, each with the seller's short key, no one having named them.
  await button(buyer.page, 'Back').click()
  await buyer.page.goBack()
  await buyer.page.getByRole('heading', { name: 'Clothing buyer' }).waitFor()
  await buyer.page.getByRole('tab', { name: 'Reviews' }).click()
  await buyer.page.getByText("Reviews you've written about others.", { exact: true }).waitFor()
  assert.deepEqual([await button(buyer.page, 'Review someone').getAttribute('class'), await button(buyer.page, 'Review someone').locator('.icon').getAttribute('data-icon')], [null, 'star'], 'plain, its star, at the foot')
  await shot(buyer.page, 'profile-reviews-none')
  await button(buyer.page, 'Review someone').click()
  const whom = buyer.page.getByRole('dialog', { name: 'Who are you reviewing?' })
  await badge(whom.locator('button.row', { hasText: 'Clothing seller' })).waitFor()
  await shot(buyer.page, 'review-who')
  // The profile itself: refused, in one line, on the sheet, which stays.
  await whom.getByLabel('Their address').fill(buyerAddress)
  await whom.getByText("That's this profile.").waitFor()
  await whom.locator('button.row', { hasText: 'Clothing seller' }).click()
  await whom.waitFor({ state: 'detached' })
  await badge(buyer.page.locator('.top .who', { hasText: 'Clothing seller' })).waitFor()
  // Vouch: its line, its mint square, no score, its comment's own placeholder, and Vouch at the foot.
  const kinds = buyer.page.getByRole('group', { name: 'Kind' })
  await kinds.getByRole('button', { name: 'Vouch' }).click()
  await buyer.page.getByText("Say they're real and honest, without a score.").waitFor()
  assert.equal(await kinds.getByRole('button', { name: 'Vouch' }).locator('.icon').getAttribute('data-icon'), 'handshake')
  assert.equal(await buyer.page.locator('.kind-mark .sq.mint [data-icon="handshake"]').count(), 1, 'its mint square')
  assert.equal(await buyer.page.getByLabel('Score').count(), 0, 'no score: a vouch')
  assert.equal(await buyer.page.getByRole('group', { name: 'As described' }).count(), 0, "a review's question only")
  assert.equal(await buyer.page.getByLabel('Comment').getAttribute('placeholder'), 'How do you know them? (optional)')
  assert.match((await button(buyer.page, 'Vouch').last().getAttribute('class')) ?? '', /primary/)
  await shot(buyer.page, 'review-vouch')
  await buyer.page.getByLabel('Comment').fill('Real.')
  await buyer.page.locator('.foot').getByRole('button', { name: 'Vouch' }).click()
  await button(buyer.page, 'Review someone').waitFor({ timeout: 60_000 })
  const [[vouchAt]] = await entriesOf(buyerAddress, 'vouch')
  // Vouched again for the same person: in place of the first, never a second.
  await button(buyer.page, 'Review someone').click()
  await whom.locator('button.row', { hasText: 'Clothing seller' }).click()
  await kinds.getByRole('button', { name: 'Vouch' }).click()
  await buyer.page.getByLabel('Comment').fill('Real and kind.')
  await buyer.page.locator('.foot').getByRole('button', { name: 'Vouch' }).click()
  await button(buyer.page, 'Review someone').waitFor({ timeout: 60_000 })
  const vouches = await entriesOf(buyerAddress, 'vouch')
  assert.deepEqual(vouches.map(([path, c]) => [path, c.entry.body]), [[vouchAt, { subject: seller, text: 'Real and kind.' }]], 'one vouch, at the first one\'s path')
  // Report, the seller's address pasted: its line, its red square, Report in red at the foot.
  await button(buyer.page, 'Review someone').click()
  await whom.getByLabel('Their address').fill(seller)
  await whom.waitFor({ state: 'detached' })
  await buyer.page.locator('.top .who', { hasText: 'Clothing seller' }).waitFor()
  await kinds.getByRole('button', { name: 'Report' }).click()
  await buyer.page.getByText("Warn others it's fake or a scam.").waitFor()
  assert.equal(await buyer.page.locator('.kind-mark .sq.red [data-icon="flag"]').count(), 1, 'its red square')
  assert.equal(await buyer.page.getByLabel('Score').count(), 0, 'a report: text only')
  assert.equal(await buyer.page.getByLabel('Comment').getAttribute('placeholder'), 'What happened?')
  await buyer.page.getByLabel('Comment').fill('Sold me the wrong size twice.')
  const red = buyer.page.locator('.foot').getByRole('button', { name: 'Report' })
  assert.match((await red.getAttribute('class')) ?? '', /danger solid/, 'posted in red')
  assert.equal(await asks(red), false, 'the seed held since the review: Report will ask nothing')
  await shot(buyer.page, 'report')
  await red.click()
  await button(buyer.page, 'Review someone').waitFor({ timeout: 60_000 })
  const given = buyer.page.locator('main .cards > .said-card')
  await given.nth(2).waitFor()
  assert.deepEqual((await given.locator('.said-chip').allTextContents()).sort(), ['10', 'Report', 'Vouch'])
  for (let i = 0; i < 3; i++) {
    // Its score or chip, right after it who it is about by their key, and nothing else of them; the time at the right.
    assert.deepEqual(await given.nth(i).locator('.said-head').evaluate((h) => [...h.children].map((c) => c.classList[0])), ['said-chip', 'said-who', 'grow', 'xs'], 'its score, who, then the time')
    assert.equal(await given.nth(i).locator('.said-who').textContent(), short(seller), 'their short key, no one having named them')
    assert.deepEqual([await given.nth(i).locator('.av, .mkr, .vb, .named').count(), await given.nth(i).getByText('About').count()], [0, 0], 'no avatar, market, role or badge, no About')
  }
  await shot(buyer.page, 'profile-written')
  // Tapped, one opens to edit: its kind kept, its Delete.
  await given.filter({ hasText: 'Real and kind.' }).getByRole('button', { name: 'Edit your vouch' }).click()
  await button(buyer.page, 'Delete').waitFor()
  assert.equal(await buyer.page.getByRole('group', { name: 'Kind' }).count(), 0, 'an edit keeps its kind')
  await button(buyer.page, 'Close').click()
  await buyer.page.getByRole('tab', { name: 'Reviews', selected: true }).waitFor()
  // Who it is about, tapped: their profile, Not yours.
  await given.filter({ hasText: 'Real and kind.' }).locator('.said-who').click()
  await buyer.page.locator('main.them .chip', { hasText: 'Not yours' }).waitFor()
  await buyer.page.locator('main.them .idchip.key', { hasText: short(seller) }).waitFor()
  await button(buyer.page, 'Back').click()
  await buyer.page.getByRole('tab', { name: 'Reviews', selected: true }).waitFor()
  for (const kind of ['vouch', 'report']) assert.equal((await entriesOf(buyerAddress, kind)).length, 1, `one ${kind}, in the buyer's folder`)
  await buyer.context.close()

  // The seller: the index's rating on the card, with its star, and what is new.
  await button(page, 'Back').click()
  const card = await untilCard(page, 'Clothing seller', '10.0')
  assert.deepEqual(await card.locator('.rt2 > *').allTextContents(), ['10.0', '1 review'], 'its rating over how many reviews')
  assert.equal(await card.locator('.rate .icon').getAttribute('data-icon'), 'star')
  // The card counts all that is new, once the index counts all three: the review, the vouch, the report and the message; the Notifications tab, the same four.
  await untilCard(page, 'Clothing seller', '4 new')
  await page.locator('.tabbar .count', { hasText: '4' }).waitFor()
  await shot(page, 'home-rated')
  // The profile: the rating under its role, a pill, its star, its score, how many reviews, its dot
  // while something came, its chevron; the message, 1 on its Messages button.
  await untilLine(page, 'Clothing seller', '10.0 1 review')
  await page.locator('button.ratepill .dot').waitFor()
  assert.deepEqual(await page.locator('button.ratepill .icon').evaluateAll((i) => i.map((x) => (x as SVGElement).dataset.icon)), ['star', 'caret-right'])
  await inbox(page).locator('.count', { hasText: '1' }).waitFor()
  await shot(page, 'profile-new')
  await button(page, 'Back').click()
  // The rating opens the profile's Reviews: the score large, how many, and which index rated it;
  // they mark the new ones; seeing them, they are new no more. Each a card: its score or chip, who
  // wrote it right after, by their key, when and its dot, then what they wrote.
  await page.locator('button.card', { hasText: 'Clothing seller' }).click()
  await page.locator('button.ratepill').click()
  await page.getByRole('heading', { name: 'Reviews' }).waitFor()
  await page.locator('.rated .rate', { hasText: '10.0' }).waitFor({ timeout: 60_000 })
  await page.locator('.rated').getByText('1 review', { exact: true }).waitFor()
  const said = page.locator('main .cards button.said-card')
  const received = said.filter({ hasText: 'Just like the photos.' })
  await received.waitFor({ timeout: 60_000 })
  await said.nth(2).waitFor()
  assert.equal(await said.count(), 3)
  assert.deepEqual(await said.locator('.said-chip').allTextContents(), ['Report', 'Vouch', '10'], 'newest first')
  assert.deepEqual(await said.locator('.said-chip .icon').evaluateAll((i) => i.map((x) => (x as SVGElement).dataset.icon)), ['flag', 'handshake', 'star'])
  assert.equal(await said.locator('.dot').count(), 3, 'each with its dot')
  for (let i = 0; i < 3; i++) {
    assert.equal(await said.nth(i).locator('.said-head .name.key').textContent(), short(buyerAddress), 'who wrote it, by their key')
    assert.equal(await said.nth(i).getByText('From').count(), 0, 'no From')
  }
  await page.locator('.rated').getByText(`Rated by ${new URL(services.index).host}`).waitFor()
  await shot(page, 'profile-reviews')
  // A card opened: the review as received, the day, the score big with its star, its market's field,
  // and no listing named; From, a row: who wrote it, by their key, their badge, their market and
  // role; at the foot Message and Review back side by side, Report under them in red.
  await received.click()
  await page.getByText(/^On your Clothing seller, /).waitFor()
  await page.locator('.score-big', { hasText: '10' }).locator('[data-icon="star"]').waitFor()
  const facts = page.locator('.facts')
  await facts.getByText('As described').waitFor()
  await facts.getByText('Yes').waitFor()
  assert.equal(await facts.getByText('Offer').count(), 0, 'no listing named')
  const from = page.locator('button.whorow')
  await badge(from).waitFor()
  await from.locator('.name.key', { hasText: short(buyerAddress) }).waitFor()
  await mkrIn(from, 'Clothing', 'buyer')
  assert.equal(await from.locator('[data-icon="caret-right"]').count(), 1, 'its chevron')
  const [message, back, report] = [button(page, 'Message'), button(page, 'Review back'), button(page, 'Report')]
  const [m, b] = [(await message.boundingBox())!, (await back.boundingBox())!]
  assert.ok(Math.abs(m.y - b.y) < 2 && m.x < b.x, 'Message and Review back side by side')
  assert.match((await back.getAttribute('class')) ?? '', /primary/, 'Review back, the one filled')
  assert.ok((await report.boundingBox())!.y > m.y, 'Report under them')
  assert.match((await report.getAttribute('class')) ?? '', /danger/)
  await shot(page, 'received')
  // From, tapped: their profile. Back, and Not yours; their header; their key on its chip; three numbers; Message and Review;
  // their page on the index in a new tab.
  await from.click()
  const them = page.locator('main.them')
  await them.locator('.chip', { hasText: 'Not yours' }).waitFor()
  assert.deepEqual(await them.locator('.ph2').evaluate((el) => [el.querySelector('.mk')?.textContent, el.querySelector('.rl')?.firstChild?.textContent]), ['Clothing', 'Buyer'])
  await badge(them.locator('.ph2')).waitFor()
  const chip = them.locator('button.idchip.key')
  await chip.locator('[data-icon="pencil-simple"]').waitFor()
  assert.equal(await chip.textContent(), short(buyerAddress), 'their short key: no one named them')
  await them.locator('.stat3').waitFor({ timeout: 30_000 })
  assert.deepEqual(await them.locator('.stat3 > span').evaluateAll((s) => s.map((x) => [...x.children].map((c) => c.textContent))), [['–', 'No reviews'], ['1', 'request'], ['3', 'written']], 'no rating, one request, three written')
  assert.match((await button(page, 'Message').getAttribute('class')) ?? '', /primary/)
  const site = them.getByRole('link', { name: 'See everything on the index' })
  assert.deepEqual([await site.getAttribute('href'), await site.getAttribute('target')], [`${services.index}/profiles/${buyerAddress}`, '_blank'])
  await shot(page, 'them')
  // Review: from the seller, about them; closed, their profile again.
  await button(page, 'Review').click()
  await page.locator('.top .who .name.key', { hasText: short(buyerAddress) }).waitFor()
  await button(page, 'Close').click()
  await them.waitFor()
  await button(page, 'Back').click()
  // Review back, from the review: about who wrote it, from the profile it was on.
  await button(page, 'Review back').click()
  await page.locator('.top .who .name.key', { hasText: short(buyerAddress) }).waitFor()
  await button(page, 'Close').click()
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Reviews' }).waitFor()
  await button(page, 'Back').click()
  await page.locator('button.ratepill').waitFor()
  assert.equal(await page.locator('button.ratepill .dot').count(), 0, 'seen: the rating with no dot')
  await button(page, 'Back').click()
  await page.locator('.tabbar .count', { hasText: '1' }).waitFor()
  assert.equal(await card.locator('.newpip').getAttribute('aria-label'), '1 new', "the tab and the card counting the message alone now, the three seen in the profile's Reviews")
  await page.locator('button.card', { hasText: 'Clothing seller' }).click()
  await page.locator('button.ratepill').click()
  await received.waitFor()
  assert.equal(await said.locator('.dot').count(), 0, 'seen once: new no more')
  await button(page, 'Back').click()
  await button(page, 'Back').click()

  // Notifications: all that came to any profile, under Today, newest first, the three seen already,
  // so with no dot, and no message: each with the avatar of who wrote it, what it is on which
  // profile, its score or chip, what they wrote, in full. Its Messages button, counting the
  // message, opens every profile's conversations.
  await button(page, /Notifications$/).click()
  const rows = page.locator('main .rows .nrow')
  await rows.nth(3).waitFor()
  assert.equal(await rows.count(), 4, 'no message row')
  assert.deepEqual(await page.locator('main h2').allTextContents(), ['Today'])
  assert.deepEqual(await rows.locator('.nrow-head > strong').allTextContents(), ['Report on your Clothing seller', 'Vouch on your Clothing seller', 'Review on your Clothing seller', 'Review on your Tutoring tutor'])
  assert.deepEqual(await rows.locator('.said-chip').allTextContents(), ['Report', 'Vouch', '10', '9.4'], "the coat's three, newest first, then the tutor's review")
  assert.deepEqual(await rows.locator('.said-chip .icon').evaluateAll((i) => i.map((x) => (x as SVGElement).dataset.icon)), ['flag', 'handshake', 'star', 'star'])
  await rows.nth(3).locator('.av[data-market]').waitFor()
  assert.deepEqual(await rows.evaluateAll((r) => r.map((x) => [(x.querySelector('.av') as HTMLElement).dataset.market, x.querySelector('.av')!.classList.contains('look')])), [['clothing', true], ['clothing', true], ['clothing', true], ['tutoring', true]], 'each with the avatar of who wrote it: a buyer, a student, light')
  assert.equal(await rows.locator('.dot').count(), 0, "seen in the profile's Reviews, or before this device forgot and started again")
  assert.equal(await rows.nth(0).locator('.said-text').textContent(), 'Sold me the wrong size twice.', 'in full')
  assert.equal(await rows.nth(0).locator('.said-head .name.key').textContent(), short(buyerAddress), 'who wrote it, after its chip, by their key')
  await inbox(page).locator('.count', { hasText: '1' }).waitFor()
  await shot(page, 'notifications')
  await closed(page)
  await inbox(page).click()
  await page.getByRole('heading', { name: 'Messages', exact: true }).waitFor()
  await page.getByText('1 new message').waitFor()
  assert.equal(await page.locator('.said-chip').count(), 0, 'messages only: no review, vouch or report')
  await button(page, 'Home').click()
  say("clothing: two photos redrawn and sent, a review with its market's question, a vouch and a report, Written by you; the rating, its dot, the tab counting them and the message, the profile's Reviews, and Notifications")
})

test("someone else's profile from a conversation, and the names you give others: their short key by default; Message from their profile opens the conversation; a name, saved on their naming sheet, for you alone, in the Profiles folder, locked; the name in place of the key in the conversation, Messages, Review, Notifications and the reviews they wrote; the name back on another device after one unlock; Show the key instead", async () => {
  const { page, counts } = first
  const wallet = await mainKey(seed, '')
  const key = short(buyerAt)
  // The seller's conversation with the buyer: one unlock opens the messages; its header, a tap, opens their profile.
  await button(page, /Notifications$/).click()
  await inbox(page).click()
  let asked = counts.asserted
  await button(page, 'Open').click()
  const row = page.locator('button.thread-row', { hasText: key })
  await row.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  await row.click()
  const head = page.locator('button.convo-head')
  await head.locator('.name.key', { hasText: key }).waitFor()
  await head.click()
  const them = page.locator('main.them')
  await them.locator('.chip', { hasText: 'Not yours' }).waitFor()
  const chip = them.locator('button.idchip')
  assert.deepEqual([await chip.textContent(), await chip.getAttribute('class')], [key, 'idchip key'], 'their short key, in its own face')
  // Message: the conversation open in this page, again; back, their profile.
  await button(page, 'Message').click()
  await page.getByText('Is the coat still there?').waitFor()
  await button(page, 'Back').click()
  await them.waitFor()

  // The naming sheet: the key its title, the full key with Copy, an empty Name, only you see it; no Show the key instead yet.
  await chip.click()
  const sheet = page.getByRole('dialog', { name: key })
  await sheet.locator('h2.key', { hasText: key }).waitFor()
  assert.equal(await sheet.locator('.keybox .grow').textContent(), buyerAt, 'the full key')
  await sheet.getByRole('button', { name: 'Copy' }).click()
  await sheet.getByRole('button', { name: 'Copied' }).waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), buyerAt)
  assert.equal(await sheet.getByLabel('Name').inputValue(), '')
  await sheet.getByText('Only you see it.', { exact: true }).waitFor()
  assert.equal(await sheet.getByRole('button', { name: 'Show the key instead' }).count(), 0)
  const save = sheet.getByRole('button', { name: 'Save' })
  assert.equal(await asks(save), false, 'the seed held since Open: Save will ask nothing')
  await shot(page, 'name-sheet')
  await sheet.getByLabel('Name').fill('Marta')
  asked = counts.asserted
  await save.click()
  await sheet.waitFor({ state: 'detached', timeout: 30_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked')
  assert.deepEqual([await chip.textContent(), await chip.getAttribute('class')], ['Marta', 'idchip'], 'the name, in place of the key')
  assert.equal(await them.getByText(key).count(), 0, 'never the name and the key side by side')
  await shot(page, 'them-named')
  // Underneath: one locked entry in the Profiles folder, which only the seed opens; nothing in the seller's own folder.
  const body = (await readFolder([services.host], wallet.address, Date.now())).current.get('names')?.entry.body
  assert.ok(isLocked(body), 'locked')
  assert.ok(!JSON.stringify(body).includes('Marta') && !JSON.stringify(body).includes(buyerAt), 'nothing readable')
  assert.deepEqual(await openLocked(body!, (await openingHalf(wallet.secret)).identity), { names: [{ address: buyerAt, name: 'Marta' }] })
  const seller = (await mainKey(seed, 'clothing/seller')).address
  assert.equal((await readFolder([services.host], seller, Date.now())).current.has('names'), false, "nothing in the seller's own folder")
  assert.deepEqual(JSON.parse((await kept(page))['forest.names']!), { [buyerAt]: 'Marta' }, 'a copy on the device')

  // The name everywhere they show, for this person: the conversation's header, Review's, Messages, Notifications, the reviews they wrote.
  await button(page, 'Back').click()
  await head.locator('.name', { hasText: 'Marta' }).waitFor()
  assert.equal(await head.getByText(key).count(), 0)
  await mkrIn(head, 'Clothing', 'buyer')
  await button(page, 'Review').click()
  await page.locator('.top .who .name', { hasText: 'Marta' }).waitFor()
  await button(page, 'Close').click()
  await button(page, 'Back').click()
  await page.locator('button.thread-row', { hasText: 'Marta' }).waitFor()
  assert.equal(await page.locator('button.thread-row', { hasText: key }).count(), 0, 'in Messages, the name alone')
  assert.equal(await page.locator('button.thread-row', { hasText: 'Marta' }).locator('.thread-top .name:not(.key)').textContent(), 'Marta', 'bold, in the words\' face')
  await shot(page, 'messages-named')
  await button(page, /Notifications$/).click()
  const fromHer = page.locator('main .rows .nrow', { hasText: 'Clothing seller' })
  await fromHer.first().waitFor()
  assert.deepEqual(await fromHer.locator('.said-head .name').allTextContents(), ['Marta', 'Marta', 'Marta'], 'her three, by her name')
  // A notification's name, tapped: her profile.
  await fromHer.first().locator('.said-head .said-who').click()
  await chip.filter({ hasText: 'Marta' }).waitFor()
  await button(page, 'Back').click()
  await button(page, 'Home').click()
  await page.locator('button.card', { hasText: 'Clothing seller' }).click()
  await page.locator('button.ratepill').click()
  const said = page.locator('main .cards button.said-card')
  await said.nth(2).waitFor({ timeout: 30_000 })
  assert.deepEqual(await said.locator('.said-head .name').allTextContents(), ['Marta', 'Marta', 'Marta'], 'on the reviews she wrote')
  await button(page, 'Back').click()
  await button(page, 'Back').click()

  // Another device, the same passkey answering: after the one unlock at Start, the name there too.
  const other = await phone()
  await answerFrom(other, first)
  await other.page.goto(APP)
  await elsewhere(other)
  await button(other.page, 'Not now').click({ timeout: 60_000 })
  await homeWith(other.page, 'Clothing seller')
  assert.deepEqual(JSON.parse((await kept(other.page))['forest.names']!), { [buyerAt]: 'Marta' }, 'read from the Profiles folder at the unlock')
  await button(other.page, /Notifications$/).click()
  await other.page.locator('main .rows .nrow .said-head .name', { hasText: 'Marta' }).first().waitFor({ timeout: 60_000 })
  await other.context.close()

  // Show the key instead: the name taken back, the key again, the entry deleted, and the device's copy.
  await button(page, /Notifications$/).click()
  await fromHer.first().locator('.said-head .said-who').click()
  await chip.filter({ hasText: 'Marta' }).click()
  const named = page.getByRole('dialog', { name: 'Marta' })
  await named.locator('h2', { hasText: 'Marta' }).waitFor()
  assert.equal(await named.getByLabel('Name').inputValue(), 'Marta')
  await shot(page, 'name-sheet-named')
  await named.getByRole('button', { name: 'Show the key instead' }).click()
  await named.waitFor({ state: 'detached', timeout: 30_000 })
  assert.deepEqual([await chip.textContent(), await chip.getAttribute('class')], [key, 'idchip key'], 'the key again')
  assert.equal((await kept(page))['forest.names'], undefined, 'nothing kept')
  assert.equal((await readFolder([services.host], wallet.address, Date.now())).current.get('names')?.entry.body, null, 'the entry deleted')
  // Naming someone, on a laptop: a dialog in the middle; Escape closes it.
  await page.setViewportSize({ width: 1280, height: 800 })
  await chip.click()
  const naming = page.getByRole('dialog', { name: key })
  await inTheMiddle(page, naming)
  await shot(page, 'laptop-name-dialog')
  await page.keyboard.press('Escape')
  await naming.waitFor({ state: 'detached' })
  await page.setViewportSize({ width: 390, height: 844 })
  await button(page, 'Back').click()
  await button(page, 'Home').click()
  say("someone else's profile, from a conversation and a notification; named, the name everywhere, on another device after its unlock; the key again")
})

const TROUSERS = 'Linen trousers, worn once.'

/** The notice Notifications holds for an entry a market outgrew, by what it needs and its line. */
const noticeOf = (page: Page, needs: string, line: string) => page.locator('main .rows button', { hasText: needs }).filter({ hasText: line })

test('a listing an older market shaped: its row says Update this listing, and Notifications holds a notice for it, the tab counting it; opened there, what still fits is filled in; posted, it fits and both are gone', async () => {
  const { page } = first
  // Written to the host as the app wrote it before the markets moved: one wearer, a size as text,
  // either for delivery, an area alone for its location.
  const main = await mainKey(seed, 'clothing/seller')
  const path = 'listing/0123456789abcdef0123456789abcdef'
  const old = { description: TROUSERS, price: { amount: '25', currency: 'USD' }, kind: 'trousers', wearer: 'women', size: 'EU 38', delivery: 'either', location: { area: 'Lavapiés, Madrid' }, contact: '@coats' }
  assert.notEqual(loadMarkets().checkEntry('clothing', 'seller', 'listing', old), null, "it doesn't fit the market today")
  // Three days ago, so it was posted before what came today.
  const view = await readFolder([services.host], main.address, Date.now())
  const [outcome] = await write([services.host], [entry(main, path, old, nextTime(Date.now() - 3 * 86_400_000, view, path))])
  assert.ok(outcome?.results.length === 1 && outcome.results[0]!.ok, 'written')

  // On the profile's Offers, its card says so, in the sun; a tap opens its form.
  await page.locator('button.card', { hasText: 'Clothing seller' }).click()
  const row = page.locator('.listing-card', { hasText: TROUSERS })
  const chip = row.locator('.chip.warn', { hasText: 'Needs an update' })
  await chip.waitFor()
  assert.equal(await page.locator('.listing-card', { hasText: COAT }).getByText('Needs an update').count(), 0, 'the coat fits')
  await shot(page, 'profile-update')
  await row.click()
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  assert.equal(await page.getByLabel('Description').inputValue(), TROUSERS)
  await button(page, 'Close').click()
  await row.waitFor()
  await button(page, 'Back').click()

  // Notifications: a notice for it, under Earlier, by when it was posted, after what came today: its
  // sun square, its first line, that the market changed; the tab counting it.
  await button(page, /Notifications$/).click()
  await page.getByRole('heading', { name: 'Notifications' }).waitFor()
  const notice = noticeOf(page, `${TROUSERS.replace(/\.$/, '')} needs an update`, 'The Clothing market changed. Tap to fix it.')
  await notice.waitFor()
  await noticesCounted(page, 1)
  assert.equal(await notice.locator('.sq.sun [data-icon="warning"]').count(), 1, 'its sun square')
  assert.equal(await notice.locator('.xs').count(), 0, 'no time: when the market changed, the app cannot know')
  assert.deepEqual(await page.locator('main h2').allTextContents(), ['Today', 'Earlier'])
  assert.equal(await page.locator('main section', { hasText: 'Earlier' }).locator('.rows button').count(), 1, 'Earlier: the notice alone')
  assert.equal(await page.locator('main .rows button', { hasText: 'needs an update' }).count(), 1, 'the coat fits: no notice')
  await shot(page, 'notifications-update')
  await notice.click()
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  // What still fits, filled in: the description, the price, the kind and the contact. Who it's for
  // and the delivery asked again; the location set again on its screen, round the phone's kept
  // point at the field's 2 km, its old area gone with it.
  assert.equal(await page.getByLabel('Description').inputValue(), TROUSERS)
  assert.equal(await page.getByLabel('Price').inputValue(), '25')
  assert.equal(await page.getByRole('group', { name: 'Kind', exact: true }).locator('button.open-row').textContent(), 'Trousers')
  assert.equal(await page.getByLabel('Contact').inputValue(), '@coats')
  assert.equal(await page.getByRole('group', { name: 'Wearer' }).locator('[aria-pressed=true]').count(), 0)
  assert.equal(await page.getByRole('group', { name: 'Delivery' }).locator('[aria-pressed=true]').count(), 0)
  await page.getByRole('group', { name: 'Location' }).getByRole('button', { name: 'Choose on the map' }).waitFor()
  const again = await placeScreen(page, 'Location')
  await again.getByText('Within 2 km', { exact: true }).waitFor()
  await again.getByRole('button', { name: 'Done' }).click()
  await page.getByRole('group', { name: 'Location' }).getByRole('button', { name: 'Within 2 km', exact: true }).waitFor()
  await shot(page, 'listing-update')
  // For women: trousers then ask their waist, right after the kind.
  await page.getByRole('group', { name: 'Wearer' }).getByRole('button', { name: 'Women' }).click()
  await pick(page, 'Waist', 'W30')
  await button(page, 'Post').click()
  // Back on Notifications: posted, it fits, so the notice is gone, and the tab counts it no more.
  await page.getByRole('heading', { name: 'Notifications' }).waitFor({ timeout: 60_000 })
  await notice.waitFor({ state: 'detached', timeout: 30_000 })
  await noticesCounted(page, 0)
  const body = (await entriesOf(main.address, 'listing')).find(([p]) => p === path)![1].entry.body as any
  assert.equal(loadMarkets().checkEntry('clothing', 'seller', 'listing', body), null, 'it fits the market')
  assert.deepEqual([body.description, body.price, body.kind, body.wearer, body.waist, body.contact, body.location.radiusKm, body.location.area], [TROUSERS, { amount: '25', currency: 'USD' }, 'trousers', ['women'], 'w30', '@coats', 2, undefined])
  assert.deepEqual([body.size, body.delivery], [undefined, undefined], "what didn't fit, gone")
  await button(page, 'Home').click()
  await page.locator('button.card', { hasText: 'Clothing seller' }).click()
  await page.locator('.listing-card', { hasText: TROUSERS }).waitFor()
  assert.equal(await page.locator('.listing-card', { hasText: TROUSERS }).getByText('Needs an update').count(), 0, 'nor on its card')
  await button(page, 'Back').click()
  say("an old listing: Needs an update on its card and in Notifications, under Earlier, what fits filled in, posted in the market's shape today")
})

const PAID = 'Paid on time, picked it up as agreed.'

test('a review an older market shaped: Notifications holds a notice for it, Update this review; opened, what still fits is filled in; posted, it fits and the notice is gone', async () => {
  const { page } = first
  // Written to the host from the seller about the buyer, as an older app might have: whether it
  // was as described is a field for reviews of sellers only.
  const main = await mainKey(seed, 'clothing/seller')
  const path = 'review/0123456789abcdef0123456789abcdef'
  const old = { subject: buyerAt, score: '8', text: PAID, asDescribed: 'yes' }
  assert.notEqual(loadMarkets().checkEntry('clothing', 'seller', 'review', old, 'buyer'), null, "it doesn't fit the market today")
  const view = await readFolder([services.host], main.address, Date.now())
  const [outcome] = await write([services.host], [entry(main, path, old, nextTime(Date.now(), view, path))])
  assert.ok(outcome?.results.length === 1 && outcome.results[0]!.ok, 'written')

  await button(page, /Notifications$/).click()
  const notice = noticeOf(page, 'Your review needs an update', 'The Clothing market changed. Tap to fix it.')
  await notice.waitFor({ timeout: 30_000 })
  await noticesCounted(page, 1)
  await notice.click()
  // The edit: its kind kept, so no switch; who it is about at the top.
  await badge(page.locator('.top .who', { hasText: 'Clothing buyer' })).waitFor()
  assert.equal(await page.getByRole('group', { name: 'Kind' }).count(), 0, 'an edit keeps its kind')
  assert.equal(await page.getByLabel('Comment').inputValue(), PAID)
  assert.equal(await page.locator('.score .big').textContent(), '8')
  await shot(page, 'review-update')
  await button(page, 'Post').click()
  await page.getByRole('heading', { name: 'Notifications' }).waitFor({ timeout: 60_000 })
  await notice.waitFor({ state: 'detached', timeout: 30_000 })
  await noticesCounted(page, 0)
  const body = (await entriesOf(main.address, 'review')).find(([p]) => p === path)![1].entry.body as any
  assert.equal(loadMarkets().checkEntry('clothing', 'seller', 'review', body, 'buyer'), null, 'it fits the market')
  assert.deepEqual(body, { subject: buyerAt, score: '8', text: PAID }, "what didn't fit, gone")
  await button(page, 'Home').click()
  say('an old review: its notice in Notifications, what fits filled in, posted in the shape today')
})

const OWN = 'Patient with my own questions.'
const VOUCH = 'Real, and there every week.'

test("no review of one's own profiles: from their student, about their tutor, refused before the unlock in one red line; someone else's vouch shows first in Notifications, new; opened, it is seen", async () => {
  const { page, counts } = first
  await page.locator('button.card', { hasText: 'Tutoring student' }).click()
  await page.getByRole('tab', { name: 'Reviews' }).click()
  const asked = counts.asserted
  await button(page, 'Review someone').click()
  const whom = page.getByRole('dialog', { name: 'Who are you reviewing?' })
  await whom.getByLabel('Their address').fill(tutor)
  const line = whom.getByText("That's one of your profiles.", { exact: true })
  await line.waitFor()
  assert.equal(await line.getAttribute('class'), 'line red')
  await page.waitForTimeout(500)
  assert.equal(await whom.locator('.line').count(), 1, 'said once, on the sheet, which stays')
  assert.equal(counts.asserted, asked, 'refused before the unlock: nothing asked')
  assert.equal((await entriesOf((await mainKey(seed, 'tutoring/student')).address, 'review')).length, 0, 'nothing written')
  await shot(page, 'review-own')
  // Closed with no one picked: Review someone closes too.
  await page.keyboard.press('Escape')
  await page.getByRole('tab', { name: 'Reviews', selected: true }).waitFor()
  await button(page, 'Back').click()

  // Someone else, a student, vouches for the tutor.
  const other = await phone()
  await newPerson(other)
  await other.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  await pickFirst(other.page, 'Tutoring student')
  await button(other.page, 'Skip').click()
  await other.page.locator('button.card', { hasText: 'Tutoring student' }).click()
  // Nothing written yet: the tab's one quiet line, saying what it holds, over Review someone, and nothing more.
  await other.page.getByRole('tab', { name: 'Reviews' }).click()
  const none = other.page.getByText("Reviews you've written about others.", { exact: true })
  await none.waitFor()
  assert.equal(await none.getAttribute('class'), 'ctx', 'one quiet line')
  assert.equal(await other.page.locator('main .said-card').count(), 0, 'no cards')
  await shot(other.page, 'profile-written-none')
  await button(other.page, 'Review someone').click()
  await other.page.getByLabel('Their address').fill(tutor)
  await badge(other.page.locator('.top .who', { hasText: 'Tutoring tutor' })).waitFor()
  assert.equal(await other.page.locator('main .line').count(), 0, 'not refused')
  await other.page.getByRole('group', { name: 'Kind' }).getByRole('button', { name: 'Vouch' }).click()
  await other.page.getByLabel('Comment').fill(VOUCH)
  await other.page.locator('.foot').getByRole('button', { name: 'Vouch' }).click()
  await button(other.page, 'Review someone').waitFor({ timeout: 60_000 })
  const theirs = (JSON.parse((await kept(other.page))['forest.profiles']!) as Array<{ address: string }>)[0]!.address
  await button(other.page, 'Back').click()

  // Counted by the index, it is new: first of what came, with its dot, in full.
  const row = await untilNotice(page, VOUCH)
  await row.locator('.dot').waitFor()
  assert.equal(await row.locator('.nrow-head > strong').textContent(), 'Vouch on your Tutoring tutor')
  await row.locator('.chip.new', { hasText: 'Vouch' }).locator('[data-icon="handshake"]').waitFor()
  assert.deepEqual(await row.locator('.av[data-market]').evaluate((a) => [(a as HTMLElement).dataset.market, a.classList.contains('look')]), ['tutoring', true], 'the avatar of who wrote it, a student')
  const rows = page.locator('main .rows .nrow')
  assert.equal(await rows.nth(0).textContent().then((t) => t?.includes(VOUCH)), true, 'the newest first')
  await shot(page, 'notifications-new')
  // Shown, it is seen: the tab counts it no more. Tapped: the tutor's Reviews, the vouch among them, by who wrote it.
  await noticesCounted(page, 0)
  // Tapped away from who wrote it, whose name opens their profile instead.
  await row.locator('button.said-open').click({ position: { x: (await row.boundingBox())!.width - 24, y: 12 } })
  await page.getByRole('heading', { name: 'Reviews' }).waitFor()
  await page.getByText('Of your Tutoring tutor').waitFor()
  const vouch = page.locator('button.said-card', { hasText: VOUCH })
  await vouch.locator('.said-head .name.key', { hasText: short(theirs) }).waitFor()
  await vouch.locator('.chip.new', { hasText: 'Vouch' }).waitFor()
  await button(page, 'Back').click()
  await rows.nth(1).waitFor()
  assert.equal(await rows.locator('.dot').count(), 0, 'new no more')
  await button(page, 'Home').click()
  assert.equal(await page.locator('button.card', { hasText: 'Tutoring tutor' }).locator('.newpip').count(), 0, 'nor on its card')

  // The tutor vouches back. A profile with no score yet, only a vouch: its rating line reads what came, 1 vouch, a button to its Reviews.
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).click()
  await page.getByRole('tab', { name: 'Reviews' }).click()
  await button(page, 'Review someone').click()
  await page.getByLabel('Their address').fill(theirs)
  await badge(page.locator('.top .who', { hasText: 'Tutoring student' })).waitFor()
  await page.getByRole('group', { name: 'Kind' }).getByRole('button', { name: 'Vouch' }).click()
  await page.locator('.foot').getByRole('button', { name: 'Vouch' }).click()
  await button(page, 'Review someone').waitFor({ timeout: 60_000 })
  await button(page, 'Back').click()
  await untilLine(other.page, 'Tutoring student', '1 vouch')
  assert.equal(await other.page.locator('button.ratepill').count(), 1, 'a button')
  await shot(other.page, 'profile-vouched')
  await other.page.locator('button.ratepill').click()
  await other.page.getByRole('heading', { name: 'Reviews' }).waitFor()
  await other.page.locator('.rated').getByText('1 vouch', { exact: true }).waitFor()
  await other.page.locator('button.said-card .said-head .name.key', { hasText: short(tutor) }).waitFor()
  await other.context.close()
  say("one's own profile: refused before the unlock; someone else's vouch, new in Notifications, seen once shown; a vouch alone, 1 vouch under the name")
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
/** The AI's own listing, on the tutor's profile. */
const BY_THE_AI = 'Physics for secondary school, written by the AI.'
/** The AI's listing as its row shows it: its subjects, then its price; its description shows when it is opened. */
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

/**
 * The app opened again after the AI app's redirect, which loads nowhere here: once its error page is
 * in, so it never cuts the app's own load short. A redirect that fails while this waits (a slow
 * lookup of the AI app's host, as on GitHub's runners) throws its network error first, and its error
 * page follows.
 */
async function backToTheApp(page: Page) {
  const errorPage = () => page.waitForURL((url) => url.protocol === 'chrome-error:', { waitUntil: 'commit', timeout: 30_000 })
  await errorPage().catch((err: Error) => {
    if (!err.message.includes('net::ERR_')) throw err
    return errorPage()
  })
  await page.goto(APP)
}

/** The profiles' checkboxes, by their words, and whether each is ticked. */
const ticks = async (page: Page) => Object.fromEntries(await Promise.all((await page.getByRole('checkbox').all()).map(async (c) => [await c.textContent(), await c.getAttribute('aria-checked')])))

let ai: AiApp

test("an AI app's login: the connect page, its name and its redirect's host, the profiles unticked; one ticked, Connect, one unlock; the AI reads its profile and writes a listing, which shows; the device keeps no key", async () => {
  const { page, counts } = first
  ai = await aiLogin()
  await page.goto(ai.app.authorization!.href)
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  assert.equal(new URL(page.url()).pathname + new URL(page.url()).search, '/connect', 'the login out of the path, into the history')
  await page.getByText('ai-app.example', { exact: true }).waitFor()
  assert.deepEqual(await ticks(page), { 'Clothing seller': 'false', 'Tutoring student': 'false', 'Tutoring tutor': 'false' }, 'none ticked: there are three')
  assert.ok(await button(page, 'Connect').isDisabled(), 'Connect once one is ticked')
  await named(page.getByRole('checkbox', { name: 'Tutoring tutor' }), 'Tutoring tutor')
  assert.equal(await page.getByRole('checkbox').locator('.vb').count(), 0, "no badge on the person's own profiles: it is theirs, not each profile's")
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Connect's unlock icon, in its text color")
  await shot(page, 'connect')
  await page.getByRole('checkbox', { name: 'Tutoring tutor' }).click()
  const asked = counts.asserted
  const code = backToTheAiApp(page)
  await button(page, 'Connect').click()
  await ai.transport.finishAuth(await code)
  assert.equal(counts.asserted - asked, 1, 'one unlock')

  // The AI acts: its profiles, one, with every switch; it reads its profile entry and writes a listing.
  assert.deepEqual(await tool(ai, 'my_profiles'), { profiles: [{ label: 'tutoring/tutor', can: SWITCHES }] })
  const profile = await tool(ai, 'read', { label: 'tutoring/tutor', path: 'profile' })
  assert.deepEqual([profile.body.market, profile.body.role], ['tutoring', 'tutor'])
  await tool(ai, 'write', { label: 'tutoring/tutor', path: 'listing/by-the-ai', body: lesson(BY_THE_AI) })
  await backToTheApp(page)
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).click()
  await page.locator('.listing-card', { hasText: AI_ROW }).waitFor()
  await shot(page, 'profile-ai-listing')

  // The device: the AI app's name, its day, its folder's address and its profile; no key.
  const local = await kept(page)
  const [conn] = await new App({ seed, hosts: [services.host] }).connections()
  assert.deepEqual(JSON.parse(local['forest.connections']!), [{ address: conn!.address, name: 'An AI app', time: conn!.view.current.get('connection')!.entry.time, labels: ['tutoring/tutor'] }])
  const all = JSON.stringify(local)
  for (const secret of [b64u.encode(conn!.key.secret), ...conn!.access.map((a) => a.body.key as string)]) assert.equal(all.includes(secret), false, 'never a key')
  say('an AI app connected: one unlock, and its listing on the profile')
})

test('an AI app connected in another browser comes back here by itself, at the next unlock: Your AI has no Find AI apps', async () => {
  // A browser with the same seed, as one set up before the AI app connected: what it knew of AI apps and their keys taken back.
  const b = await phone()
  await answerFrom(b, first)
  await b.page.goto(APP)
  await elsewhere(b)
  await button(b.page, 'Not now').click()
  await homeWith(b.page, 'Tutoring tutor')
  await b.page.evaluate(() => ['forest.connections', 'forest.known'].forEach((k) => localStorage.removeItem(k)))
  await closed(b.page)
  // Home reads every profile's entry: the tutor's lists the AI app's key, which this browser doesn't know.
  await homeWith(b.page, 'Tutoring tutor')
  await b.page.waitForTimeout(1_000)
  await button(b.page, 'You').click()
  await b.page.locator('button.row', { hasText: 'Your AI' }).click()
  await b.page.getByRole('heading', { name: 'Your AI' }).waitFor()
  assert.deepEqual(await b.page.locator('main .rows button.row').allTextContents(), ['Connect another'], 'none yet, and nothing to tap to find it')
  assert.equal(await button(b.page, 'Find AI apps').count(), 0, 'no Find AI apps')
  // The next unlock, for anything (the messages): the AI app found by itself, nothing more asked.
  const asked = first.counts.asserted
  await button(b.page, 'Back').click()
  await button(b.page, /Notifications$/).click()
  await b.page.locator('.top-right').getByRole('button', { name: /^Messages/ }).click()
  await button(b.page, 'Open').click()
  await b.page.locator('.unopened').waitFor({ state: 'detached', timeout: 60_000 })
  assert.equal(first.counts.asserted - asked, 1, 'one unlock, for the messages')
  await button(b.page, /Notifications$/).click()
  await button(b.page, 'You').click()
  await b.page.locator('button.row', { hasText: 'Your AI' }).locator('.two > span', { hasText: 'An AI app' }).waitFor({ timeout: 30_000 })
  await b.page.locator('button.row', { hasText: 'Your AI' }).click()
  await b.page.locator('button.row', { hasText: 'An AI app' }).waitFor()
  assert.equal(first.counts.asserted - asked, 1, 'and nothing more asked')
  await b.context.close()
  say('an AI app made in another browser: found at the next unlock, by itself')
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
  await pick(page, 'Subjects', 'Physics')
  await page.getByRole('group', { name: 'Mode' }).getByRole('button', { name: 'Online' }).click()
  await page.getByLabel('Contact').fill('ada@example.com')
  assert.equal(await asks(button(page, 'Post')), true, 'Post will ask: the one unlock of the visit')
  await button(page, 'Post').click()
  const posted = page.locator('.listing-card', { hasText: VISIT }).filter({ hasText: '$20' })
  await posted.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1)
  await away(page)
  // Edit.
  await posted.click()
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  await page.getByLabel('Price').fill('25')
  assert.equal(await asks(button(page, 'Post')), false, 'hidden, and the seed still held')
  await button(page, 'Post').click()
  const edited = page.locator('.listing-card', { hasText: VISIT }).filter({ hasText: '$25' })
  await edited.waitFor({ timeout: 60_000 })
  await away(page)
  // Open messages: by themselves, the seed held.
  await inbox(page).click()
  await page.locator('button.thread-row').first().waitFor({ timeout: 60_000 })
  assert.equal(await page.locator('.unopened').count(), 0, 'no Open')
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
  // Review, from a thread: the tutor's with the other person's student, never one of their own.
  await button(page, 'Back').click()
  await page.locator('button.thread-row', { hasText: YES }).click()
  await page.getByLabel('Message').waitFor()
  await button(page, 'Review').click()
  await badge(page.locator('.top .who', { hasText: 'Tutoring student' })).waitFor()
  const score = page.getByLabel('Score')
  await score.focus()
  await score.press('End')
  assert.equal(await asks(button(page, 'Post')), false)
  await button(page, 'Post').click()
  await page.getByLabel('Message').waitFor({ timeout: 60_000 })
  await away(page)
  // The tutor's messages again: the note arrives and opens by itself.
  await button(page, 'Back').click()
  await page.locator('button.thread-row', { hasText: VISIT_NOTE }).waitFor({ timeout: 90_000 })
  await page.goBack()
  await button(page, 'Back').click()
  // Tick an AI app: a profile given to it, and taken back.
  await button(page, 'You').click()
  await page.locator('button.row', { hasText: 'Your AI' }).click()
  await page.locator('button.row', { hasText: 'An AI app' }).click()
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  for (const ticked of [true, false]) {
    await page.getByRole('checkbox', { name: 'Clothing seller' }).click()
    await page.getByRole('checkbox', { name: 'Clothing seller', checked: ticked }).waitFor({ timeout: 60_000 })
    await button(page, 'Disconnect').and(page.locator(':enabled')).waitFor()
    await away(page)
  }
  assert.equal(await page.locator('p.line').count(), 0, (await page.locator('p.line').allTextContents()).join(' '))
  // The visit's listing deleted, which asks nothing either.
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Your AI' }).waitFor()
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  await button(page, 'Home').click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).click()
  await edited.click()
  await button(page, 'Delete').click()
  await button(page, 'Delete').click()
  await page.getByRole('tab', { name: 'Offers', selected: true }).waitFor({ timeout: 60_000 })
  await edited.waitFor({ state: 'detached' })
  assert.equal(counts.asserted - asked, 1, 'the whole visit, one unlock')
  // The page closed, as the next tests start: the seed dropped.
  await page.goto(APP)
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).click()
  say('a whole visit: post, edit, open messages, message, review, an AI app ticked and unticked, a listing deleted, one unlock')
})

test("Your AI: the AI app, its profiles and its day; its screen, Connected and Acts for, kept ticked while it is the last; another ticked, one unlock, then one unticked and ticked again, and Disconnect, nothing more asked, with no new login; its next call refused, its listing kept", async () => {
  const { page, counts } = first
  await button(page, 'Back').click()
  await button(page, 'You').click()
  // You's row names it; Your AI lists it: its name, how many profiles, since when; then Connect another.
  await page.locator('button.row', { hasText: 'Your AI' }).locator('.two > span', { hasText: 'An AI app' }).waitFor()
  await page.locator('button.row', { hasText: 'Your AI' }).click()
  await page.getByRole('heading', { name: 'Your AI' }).waitFor()
  const row = page.locator('button.row', { hasText: 'An AI app' })
  assert.match((await row.locator('.two > span').textContent()) ?? '', /^1 profile, since (\d{1,2} \w{3}|\w{3} \d{1,2})$/, 'its one profile, since its day')
  assert.equal(await button(page, 'Find AI apps').count(), 0, 'no Find AI apps')
  assert.deepEqual(await page.locator('main .rows button.row').allTextContents().then((t) => t.map((x) => x.replace(/1 profile.*/, ''))), ['An AI app', 'Connect another'])
  await shot(page, 'your-ai')
  await row.click()
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  assert.match((await page.locator('.app-head .two > span').textContent()) ?? '', /^Connected (\d{1,2} \w{3}|\w{3} \d{1,2})$/)
  await page.getByRole('heading', { name: 'Acts for' }).waitFor()
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
  await page.getByRole('heading', { name: 'Your AI' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked: the seed held')
  assert.equal(await page.locator('button.row', { hasText: 'An AI app' }).count(), 0)
  await assert.rejects(ai.client.callTool({ name: 'my_profiles', arguments: {} }), (err: Error) => err.constructor.name === 'UnauthorizedError', 'its next call refused')
  assert.deepEqual(JSON.parse((await kept(page))['forest.connections']!), [])
  await button(page, 'Back').click()
  await button(page, 'Home').click()
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).click()
  await page.locator('.listing-card', { hasText: AI_ROW }).waitFor()
  await button(page, 'Back').click()
  await ai.client.close()
  say('an AI app given a profile, one taken away and given back, and disconnected, one unlock each; its listing kept')
})

test('a new phone at a connect page, nothing set up: I use Forest on another device first; Yes, I\'m new, the selfie and the first profile, then back to the connect page, its one profile ticked; Connect', async () => {
  const p = await phone()
  const login = await aiLogin()
  await p.page.goto(login.app.authorization!.href)
  await button(p.page, 'Start').click()
  const sheet = p.page.getByRole('dialog', { name: 'First time here?' })
  await sheet.waitFor()
  assert.deepEqual((await sheet.getByRole('button').allTextContents()).map((t) => t.trim()), ['I use Forest on another device', "Yes, I'm new"], 'I use Forest on another device, first')
  assert.match((await button(p.page, 'I use Forest on another device').getAttribute('class')) ?? '', /primary/, 'the primary')
  await shot(p.page, 'start-connecting')
  await button(p.page, "Yes, I'm new").click()
  await faceCheck(p)
  await p.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  await p.page.getByLabel('Search').fill('tutoring')
  await button(p.page, 'Tutoring').click()
  await p.page.getByRole('button', create('student')).click()
  await p.page.getByRole('heading', { name: 'An AI app' }).waitFor({ timeout: 120_000 })
  assert.equal(await p.page.getByRole('heading', { name: 'Connect your AI' }).count(), 0, 'no Connect your AI')
  assert.deepEqual(await ticks(p.page), { 'Tutoring student': 'true' }, 'its one profile, ticked')
  const asked = p.counts.asserted
  const code = backToTheAiApp(p.page)
  await button(p.page, 'Connect').click()
  await login.transport.finishAuth(await code)
  assert.equal(p.counts.asserted - asked, 0, 'nothing asked: the seed held since the unlock back from the check')
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

test("a face seen before: Get verified says so and points to the ID, the selfie greyed; I already use Forest asks for the passkey the person uses, adds the one made here by mistake to it, and they're in; from then this browser's own passkey opens their Forest", async () => {
  // Someone verified in one browser; in a second, Yes, I'm new by mistake, and the selfie.
  const a = await phone()
  await newPerson(a)
  await a.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 90_000 })
  const b = await phone()
  // The passkey sheet with no passkey named: the first browser's answers, as a phone does through the QR code.
  await answerFrom(b, a)
  // services' next verifier answers face_seen where Didit has seen the face verified before; the one at SERVICES can't yet.
  await answer(b.context, `${services.verifier}/face/stamp`, 403, { error: 'face_seen' })
  await newPerson(b)
  const notice = b.page.locator('.notice', { hasText: 'A similar face is already verified. Verify with your ID to continue.' })
  await notice.waitFor({ timeout: 60_000 })
  await b.page.getByRole('heading', { name: 'Get verified' }).waitFor()
  assert.ok(await checkCard(b.page, 'Selfie').isDisabled(), "the selfie's card greyed")
  assert.ok(await checkCard(b.page, 'ID').isEnabled(), 'the ID check, to continue')
  const already = button(b.page, 'I already use Forest')
  assert.ok(await asks(already), 'it asks a passkey, whatever is held')
  assert.equal(await b.page.getByText('You can add the other one later.').count(), 0, 'the link in its place')
  await shot(b.page, 'face-seen')

  const own = JSON.parse((await kept(b.page))['forest.passkeys']!) as string[]
  assert.equal(own.length, 1, 'the passkey made here')
  const asked = a.counts.asserted
  await already.click()
  await b.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 90_000 })
  assert.equal(a.counts.asserted - asked, 1, 'the passkey the person uses, asked once')
  const local = await kept(b.page)
  assert.equal(JSON.parse(local['forest.passkey']!), own[0], "this browser's own passkey, in use here")
  assert.ok(!('first' in JSON.parse(local['forest.backups'] ?? '{}')), 'a backup now, not a first passkey')
  assert.equal((await backupsOn(JSON.parse(local['forest.folder']!).address)).length, 1, "added to the person's Forest: a backup/<id> in their Profiles folder")
  assert.equal(JSON.parse(local['forest.folder']!).address, JSON.parse((await kept(a.page))['forest.folder']!).address, "the first browser's Forest")

  // Opened again, no seed held: the first profile asks this browser's own passkey, in use here, which opens the same Forest; the first browser isn't asked.
  await b.page.reload()
  await b.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 60_000 })
  const mine = b.counts.asserted
  await pickFirst(b.page, 'Tutoring tutor')
  assert.equal(b.counts.asserted - mine, 1, "this browser's own passkey, asked once")
  assert.equal(a.counts.asserted - asked, 1, 'nothing more asked of the first browser')
  assert.equal((await entriesOf(JSON.parse(local['forest.folder']!).address, 'label')).length, 1, "the profile listed in the person's Profiles folder")
  await a.context.close()
  await b.context.close()
  say("a face seen before: the line, the selfie greyed, the ID; I already use Forest added this browser's passkey to the person's, and it opens their Forest from then")
})

test('a manager that gives no PRF secret: its passkey dropped, and one red line names another; a browser that cannot ask for it: one quiet line', async () => {
  const p = await phone({ prf: false })
  await p.page.goto(APP)
  await imNew(p)
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
  await imNew(old)
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
    const cached = await page.evaluate(async () => (await Promise.all((await caches.keys()).map(async (name) => (await (await caches.open(name)).keys()).map((r) => r.url)))).flat())
    assert.ok(cached.some((url) => /\/assets\/index-[\w-]+\.js/.test(url)), "the app's code, precached")
    assert.deepEqual(cached.filter((url) => /PlaceMap|maplibre/.test(url)), [], "nothing of the map's: it comes with the place screen alone")
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
  const seller = page.getByRole('button', create('seller'))
  await seller.waitFor()
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
  await seller.click()
  await page.waitForEvent('load', { timeout: 60_000 })
  assert.deepEqual(loads.map((u) => new URL(u).pathname), ['/new'], 'one reload, back on New profile')
  assert.ok((await page.evaluate(() => document.querySelector('script[type=module]')?.getAttribute('src') ?? '')).includes('-next-'), 'on the next version')
  await page.getByRole('heading', { name: 'Electronics' }).waitFor()
  await seller.click()
  await page.getByRole('heading', { name: 'Electronics seller' }).waitFor({ timeout: 120_000 })
  assert.equal(loads.length, 1, 'and no reload more')
  say('a deploy while open: one reload onto the next version, and the profile made')
})

test("the ID check through the stand-in Stripe, from You's Add, $5: Get verified, the selfie greyed, the sheet open, its few words, consent word for word, Pay asking once; paid, then the check, in this same tab with no tap between, and back, one unlock asked by the page itself; both verifications on every profile", async () => {
  const { page, context, counts } = first
  await page.goto(APP)
  await button(page, 'You').click()
  await button(page, 'Add, $5').click()
  // Get verified, the selfie the person has greyed, and the ID's sheet open: nothing is paid yet. ID check, $5 one time, one line, What the check keeps, Pay $5.
  const idSheet = page.getByRole('dialog', { name: 'ID check' })
  await idSheet.getByRole('button', { name: 'Pay $5' }).waitFor()
  assert.deepEqual(await idSheet.evaluate((d) => [...d.querySelectorAll('h2, .price, p:not(.consent), summary, button')].map((e) => e.textContent!.trim())), ['ID check', '$5 one time', "You're only charged if it passes.", 'What the check keeps', 'Pay $5'], 'its words, and nothing more')
  assert.equal(await idSheet.getByText('Up to three tries.', { exact: true }).count(), 0, 'no tries')
  assert.equal(await idSheet.getByText('We hold $5 on your card and only charge it if your ID check passes.', { exact: true }).count(), 0, 'no hold')
  assert.ok(await checkCard(page, 'Selfie').isDisabled(), 'the selfie, which they have, greyed')
  assert.equal(await page.getByText('You can add the other one later.').count(), 0, 'and no line on the other one')
  const { consent } = (await (await fetch(`${services.verifier}/`)).json()) as { consent: string }
  await page.getByText('What the check keeps').click()
  assert.equal(await page.locator('.consent').textContent(), consent, "the consent screen the verifier serves, word for word")
  await shot(page, 'consent')
  // Pay asks the verifier first for an ID stamp it signed this seed already, by its stamp number: one unlock, with no seed held.
  assert.ok(await asks(button(page, 'Pay $5')), 'Pay, with the unlock icon')
  const paying = counts.asserted
  await button(page, 'Pay $5').click()
  await page.getByText('Test mode: pay with the card 4242 4242 4242 4242.').waitFor()
  assert.equal(counts.asserted - paying, 1, 'one unlock, for the stamp number; none signed, so Stripe')
  const payment = JSON.parse((await kept(page))['forest.setup']!).payment as string
  assert.match(payment, /^cs_test_/, "the payment's id kept on the device before Stripe")
  // Go to Stripe (test mode's one tap): paid there, then straight into the ID check, then back, all in
  // this tab, with no tap between; back from Didit, the page asks the passkey by itself.
  const opened = context.pages().length
  const since = first.went.length
  const asked = counts.asserted
  await page.getByRole('link', { name: 'Go to Stripe' }).click()
  await backFrom(first, since)
  assert.deepEqual(wentFrom(first, since), [['stripe', true], ['didit', true]], "Stripe's page, then Didit's, in this tab, nothing tapped between")
  await button(page, 'New profile').waitFor({ timeout: 180_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock, asked by the page itself: the stamp, its gift, and every profile')
  assert.equal(context.pages().length, opened, 'no tab opened')
  assert.equal(JSON.parse(JSON.stringify(services.payments.returnUrls.get(payment))), `${APP}paid`, "Stripe's way back: the app's /paid")
  // Beside Your profiles, both of the person's badges now, the ID's an ID card on forest green; no outline, and none on a card.
  const badges = page.getByRole('group', { name: "How you're verified" })
  await badge(badges, 'id').waitFor()
  assert.deepEqual(await drawnAs(badge(badges, 'id')), ID, "the ID check's badge, an ID card on forest green")
  assert.deepEqual(await drawnAs(badge(badges)), SELFIE, "and the selfie's")
  assert.equal(await badges.getByRole('button').count(), 0, 'no outline: both done')
  const cards = page.locator('button.card')
  assert.ok((await cards.count()) >= 3, 'every profile')
  assert.equal(await cards.locator('.vb').count(), 0, 'no badge on a card')
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
  await shot(page, 'home-both')
  // A student requests: its avatar light, a tint of the market's color with its icon in it.
  const student = await avatarOf(page.locator('button.card', { hasText: 'Tutoring student' }).locator('.av'))
  assert.deepEqual([student.light, student.h, student.icon], [true, colorOf('tutoring'), 'graduation-cap'])
  assert.notEqual(student.ground, rgbOf(colorOf('tutoring')), 'a tint of it, not the color itself')
  // Both badges everywhere, the selfie's first: the profile's header, right after its role; New message's To, who it is, and From.
  await page.locator('button.card', { hasText: 'Tutoring tutor' }).click()
  const title = page.getByRole('heading', { name: 'Tutoring tutor' })
  await badge(title, 'id').waitFor()
  assert.deepEqual([await drawnAs(badge(title)), await drawnAs(badge(title, 'id'))], [SELFIE, ID], 'both, the same forest square, the picture inside telling them apart')
  assert.deepEqual(await title.locator('.vb').evaluateAll((b) => b.map((x) => (x as HTMLElement).dataset.check)), ['face', 'id'], 'the selfie first')
  await shot(page, 'profile-id')
  await page.getByRole('button', { name: /^Messages/ }).click()
  await button(page, 'New message').click()
  await page.getByLabel('To').fill(tutor)
  await badge(page.locator('.who', { hasText: 'Tutoring tutor' }), 'id').waitFor({ timeout: 60_000 })
  await badge(page.locator('.who', { hasText: 'Tutoring tutor' })).waitFor()
  await badge(page.locator('.from', { hasText: 'Tutoring student' }), 'id').waitFor()
  await badge(page.locator('.from', { hasText: 'Tutoring student' })).waitFor()
  await shot(page, 'message-id')
  await button(page, 'Back').click()
  await page.goBack()
  await button(page, 'Back').click()
  // You: Selfie and ID, both Verified on their mint chips, no Add.
  await button(page, 'You').click()
  const checks = page.getByRole('group', { name: 'Verified' })
  await checks.locator('.row', { hasText: 'ID' }).locator('.chip.new', { hasText: 'Verified' }).waitFor()
  assert.equal(await checks.locator('.chip.new', { hasText: 'Verified' }).count(), 2, 'both')
  assert.equal(await checks.getByRole('button').count(), 0, 'nothing to add')
  await shot(page, 'you-id')
  // The connect page's ticks, from an AI app's login: each of the person's profiles, with no badge.
  const login = await aiLogin()
  await page.goto(login.app.authorization!.href)
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  for (const words of ['Clothing seller', 'Tutoring student', 'Tutoring tutor']) await page.getByRole('checkbox', { name: words }).waitFor()
  assert.equal(await page.getByRole('checkbox').locator('.vb').count(), 0, 'no badge on a tick row')
  await shot(page, 'connect-id')
  await login.client.close()
  await page.goto(APP)
  say('the ID check: paid through the stand-in Stripe, one unlock, both verifications on every profile, and its badge everywhere')
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
  await page.locator('.unopened').waitFor({ state: 'detached', timeout: 60_000 })
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
  await page.goBack()
  await button(page, 'Back').click()
  say('the seed held 5 minutes after the last action, then dropped: the unlock icon back')
})

test("a selfie that doesn't pass: Get verified, its notice; then the ID, its sheet and the verifier's words before Pay, the stand-in Stripe, then the check, in this tab with no tap between and no Start, and Your first profile", async () => {
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
  // No screen of its own: Get verified again, one line on top in a notice.
  const notice = p.page.locator('.notice', { hasText: "That selfie didn't pass. Try again, or use your ID." })
  await notice.waitFor()
  await p.page.getByRole('heading', { name: 'Get verified' }).waitFor()
  assert.equal(await p.page.locator('.line.red').count(), 0, 'no red line')
  await shot(p.page, 'declined')
  const sessions = JSON.parse((await kept(p.page))['forest.setup']!)
  assert.equal(sessions.session, undefined, 'the declined session dropped')
  // The ID: its sheet, the verifier's words before Pay, then Stripe's page and back, paid.
  await checkCard(p.page, 'ID').click()
  const { consent } = (await (await fetch(`${services.verifier}/`)).json()) as { consent: string }
  await p.page.getByText('What the check keeps').click()
  assert.equal(await p.page.locator('.consent').textContent(), consent, "the verifier's words, word for word, before Pay")
  await button(p.page, 'Pay $5').click()
  // Not in yet here, and no Start: back from Stripe's page, the ID check at once, then back from Didit's, one unlock by itself.
  const since = p.went.length
  const unlocks = p.counts.asserted
  await p.page.getByRole('link', { name: 'Go to Stripe' }).click()
  await backFrom(p, since)
  assert.deepEqual(wentFrom(p, since), [['stripe', true], ['didit', true]], 'in this tab, nothing tapped between')
  await p.page.getByRole('heading', { name: 'Your first profile' }).waitFor({ timeout: 90_000 })
  assert.equal(p.counts.asserted - unlocks, 1, 'one unlock, by the page itself')
  assert.equal(await button(p.page, 'Start').count(), 0)
  await p.page.locator('.chip.new', { hasText: "You're verified" }).locator('[data-icon="identification-card"]').waitFor()
  assert.deepEqual(JSON.parse((await kept(p.page))['forest.verified']!), ['id'], 'verified by the ID alone')
  await p.context.close()
})

test("the app on a laptop: Home's cards fit, the longest name too, three to a row, every card one height, rated or not, New profile at the top right and no dashed card; Messages in two panes; the sidebar's order, something new on top, then the most recently used; past eight, every profile, the sidebar scrolling, and one search, Search Forest", async () => {
  const { page } = first
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(APP)
  const side = page.locator('aside.side')
  await side.waitFor()
  // The longest market and role, made from the sidebar's plus.
  await side.locator('.side-head').getByRole('button', { name: 'New profile' }).click()
  await page.getByRole('heading', { name: 'New profile' }).waitFor()
  await pickProfile(page, 'Software development developer')
  await side.getByRole('button', { name: 'Home' }).click()
  await page.getByRole('heading', { name: 'Your profiles' }).waitFor()
  const cards = page.locator('main .cards > button.card')
  await cards.nth(4).waitFor()
  // Three columns of about 300px; every card one height, those rated and those not; New profile at the top right, no dashed card.
  await cards.filter({ hasText: 'Clothing seller' }).locator('.rt2 .rate').waitFor({ timeout: 30_000 })
  await cards.filter({ hasText: 'Software development' }).locator('.rt2', { hasText: 'No reviews' }).waitFor({ timeout: 30_000 })
  const all8 = page.locator('main .cards > button')
  const boxes = await all8.evaluateAll((c) => c.map((x) => x.getBoundingClientRect()).map((r) => ({ x: Math.round(r.left), y: Math.round(r.top), h: Math.round(r.height), w: r.width })))
  assert.equal(new Set(boxes.map((b) => b.x)).size, 3, 'three columns')
  assert.ok(boxes.every((b) => b.w >= 290), 'each about 300px wide or more')
  assert.equal(new Set(boxes.map((b) => b.h)).size, 1, 'every card one height')
  assert.equal(await page.locator('main .cards .addcard, main .cards > button:not(.card)').count(), 0, 'no dashed card: every one a profile')
  await page.locator('main .titled').getByRole('button', { name: 'New profile' }).waitFor()
  // Every name inside its card, in two lines, before its rating: the longest too.
  const dev = cards.filter({ hasText: 'Software development' })
  await cardNamed(dev, 'Software development', 'developer')
  for (const card of await cards.all()) {
    const fits = await card.evaluate((c) => {
      const box = c.getBoundingClientRect()
      const [market, role] = [c.querySelector('.nm2 strong')!, c.querySelector('.nm2 span')!].map((x) => x.getBoundingClientRect())
      const end = c.querySelector(':scope > .rt2')!.getBoundingClientRect()
      return market!.right <= end.left && role!.right <= end.left && market!.left >= box.left && role!.bottom <= box.bottom && role!.top >= market!.bottom - 1
    })
    assert.ok(fits, `${await card.locator('.nm2').textContent()}: inside its card, on two lines, before its rating`)
  }
  await shot(page, 'laptop-home-cards')

  // Messages: the conversations on the left, nothing open on the right; one tapped opens there, marked in the list.
  await side.getByRole('button', { name: /^Messages/ }).click()
  const list = page.getByRole('region', { name: 'Conversations', exact: true })
  const open = page.getByRole('region', { name: 'Conversation', exact: true })
  await list.locator('button.thread-row').first().waitFor({ timeout: 60_000 })
  await open.getByText('Pick a conversation.', { exact: true }).waitFor()
  assert.equal(await list.getByRole('button', { name: 'Back' }).count(), 0, 'no back: the sidebar is there')
  await list.getByRole('group', { name: 'Whose' }).waitFor()
  await list.locator('button.thread-row').first().click()
  await open.getByRole('textbox', { name: 'Message' }).waitFor()
  assert.equal(await list.locator('button.thread-row[aria-current="true"]').count(), 1, 'the one open, marked')
  const [left, right] = await Promise.all([list.boundingBox(), open.boundingBox()])
  assert.ok(left && right && left.x + left.width <= right.x + 1 && Math.abs(left.y - right.y) < 2, 'side by side')
  assert.equal(await open.getByRole('button', { name: 'Back' }).count(), 0)
  await open.getByRole('button', { name: 'Review' }).waitFor()
  await shot(page, 'laptop-messages')

  // The order: nothing new anywhere now, so the most recently used first, the developer just made; then
  // an electronics listing an older market shaped, a listing to update: the electronics seller on top.
  const sideRows = side.locator('button.nav.profile .named')
  await side.getByRole('button', { name: 'Home' }).click()
  await page.getByRole('heading', { name: 'Your profiles' }).waitFor()
  assert.equal(await sideRows.first().textContent(), 'Software development developer', 'the most recently used first')
  assert.equal(await cards.first().locator('.nm2').textContent(), 'Software development developer', 'on Home too')
  const electronics = await mainKey(seed, 'electronics/seller')
  const path = 'listing/fedcba9876543210fedcba9876543210'
  const old = { description: 'An old phone.', kind: 'phone', condition: 'mint' }
  assert.notEqual(loadMarkets().checkEntry('electronics', 'seller', 'listing', old), null, "it doesn't fit the market today")
  const view = await readFolder([services.host], electronics.address, Date.now())
  await write([services.host], [entry(electronics, path, old, nextTime(Date.now(), view, path))])
  await side.getByRole('button', { name: 'You' }).click()
  await side.getByRole('button', { name: 'Home' }).click()
  await page.waitForFunction(() => document.querySelector('aside .nav.profile .named')?.textContent === 'Electronics seller', null, { timeout: 30_000 })
  assert.equal(await cards.first().locator('.nm2').textContent(), 'Electronics seller', 'something new on top, on Home too')
  await shot(page, 'laptop-order')
  const now = await readFolder([services.host], electronics.address, Date.now())
  await write([services.host], [entry(electronics, path, null, nextTime(Date.now(), now, path))])

  // Past eight: the device's list made longer with profiles of the same seed (their addresses as any app works them out, never
  // written: nine more proofs would add minutes). The sidebar lists every one, in Home's order, scrolling inside itself; Home
  // lists them all, with one search, Search Forest, in the sidebar.
  const listed = (await kept(page))['forest.profiles']!
  const more = await Promise.all(['home-cleaning/cleaner', 'home-cleaning/client', 'home-repair/repairer', 'sports-coaching/coach', 'tennis-matches/player'].map(async (label) => ({ label, address: (await mainKey(seed, label)).address })))
  const all = [...(JSON.parse(listed) as Array<{ label: string; address: string }>), ...more]
  assert.ok(all.length > 8, `more than eight: ${all.length}`)
  await page.evaluate((list) => localStorage.setItem('forest.profiles', JSON.stringify(list)), all)
  await page.reload()
  await page.getByRole('heading', { name: 'Your profiles' }).waitFor()
  await cards.nth(all.length - 1).waitFor()
  assert.equal(await side.locator('button.nav.profile').count(), all.length, 'every profile in the sidebar')
  assert.equal(await side.getByRole('button', { name: /^All profiles/ }).count(), 0, 'no All profiles')
  assert.deepEqual(await sideRows.allTextContents(), await cards.locator('.nm2').allTextContents(), "in Home's order")
  const scrolls = await side.evaluate((s) => [s.scrollHeight > s.clientHeight, getComputedStyle(s).overflowY, s.getBoundingClientRect().height])
  assert.deepEqual(scrolls, [true, 'auto', 800], 'the sidebar scrolls inside itself, the screen tall')
  const lastRow = side.locator('button.nav.profile').last()
  await lastRow.scrollIntoViewIfNeeded()
  assert.ok(await lastRow.isVisible(), 'the last, scrolled to')
  assert.equal(await side.evaluate((s) => s.scrollTop > 0), true, 'scrolled inside the sidebar')
  assert.equal(await page.evaluate(() => scrollY), 0, 'the page itself did not scroll')
  assert.equal(await cards.count(), all.length, 'Home lists them all')
  assert.deepEqual([await page.getByRole('searchbox').count(), await page.getByRole('link', { name: 'Search Forest' }).count()], [0, 1], 'one search: Search Forest')
  await shot(page, 'laptop-many')
  await page.evaluate((list) => localStorage.setItem('forest.profiles', list), listed)
  await page.reload()
  await page.setViewportSize({ width: 390, height: 844 })
  say('a laptop: the cards fit, two panes for Messages, the sidebar in order and every profile in it, scrolling, and one search')
})

test('nothing the app did was refused by the CSP', () => {
  assert.deepEqual(refused, [])
})
