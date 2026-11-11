// The verification: the face check, free, or the ID check, paid; its gift, the wallet and the stamp
// kept; then every profile made to show the new stamp. In steps the app can come back to: close the
// page anywhere, or come back from Stripe, and the next step picks up, losing nothing.
//
//   1. pay (the ID check only): first the stamp number's ID stamp asked back, since there is one ID
//      stamp a person: one from the verifier's current ID key is kept, and nothing is paid. Else the
//      gift's buy, then the payment at the verifier, its id kept on the device (device.ts, `Under`),
//      since Stripe sends the person back with none. On Stripe's page, $5 is held on their card, and
//      charged only once a stamp comes from it. Back from Stripe's page without paying, the payment
//      is dropped, and nothing is said;
//   2. open: the gift's buy (one buy at the host for exactly the check's gift, as services'
//      end-to-end test buys it), then a session at the verifier, kept on the device with its page, so
//      a tab closed midway opens the same check again; the ID check's with its payment, each session
//      one of its three tries, counted on the device, so the third that doesn't pass says so;
//   3. ask: the session's stamp, with the buy's reference (and the payment); the gift's ticket comes
//      with it and is kept. The same session and stamp number give the same stamp and ticket within
//      its hour, and after it the verifier hands the stamp back by its stamp number. A session that
//      will never pass (declined, expired, a face seen before, or a check that did not count) is
//      dropped, and the next open is a new one;
//   4. collect: the buy collected with the ticket, its credits spent into the wallet, the Profiles
//      folder's balance. Collected again, a buy gets the same answer;
//   5. keep: the stamp in the Profiles folder, its first write paid from the wallet;
//   6. show: each profile's entry written again with a verification of the new stamp (stamps.ts).
//      Then nothing of the verification is left on the device, but an ID check's payment no stamp
//      used (paid, then left for the face check), so the ID check added later opens paid.
//
// The device keeps the check's session and the gift's buy because both are lost otherwise: a second
// check of the same face is refused as a face seen before, and a gift is given once a stamp number.
// It keeps the payment because it holds the person's $5. Going back to the two checks and picking one
// again changes none of it (`choose`).
//
// How the person is verified is worked out fresh from the Profiles folder's stamps each time it is
// opened here, against the verifier's current keys: a stamp from a key it no longer signs with (the
// ID key before services#123) counts for nothing.

import { seedNumber, stampNumberOf } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { type Check, type Under, endUnder, keepUnder, saveChecks, under, usePasskey } from '../device.ts'
import { collectGift, giftBuy } from '../services/credits.ts'
import { Refused } from '../services/http.ts'
import { type About, about, askStamp, checkOfStamp, faceSession, idPayment, idSession, stampBack, stamps, stampsBack } from '../services/verifier.ts'
import { Said, TRIES_USED, verifierSays } from '../words.ts'
import type { Prove } from './profile.ts'
import { addTo, openProfiles } from './profiles.ts'
import { showStamps } from './stamps.ts'

/**
 * Where a verification stands: nothing under way, so a check to choose; the ID check not paid yet;
 * a check to open; open in its tab and not finished; signed; or kept, with only the profiles left to
 * show it.
 */
export type Step = { at: 'choose' } | { at: 'consent' } | { at: 'start' } | { at: 'away' } | { at: 'signed'; stamp: string } | { at: 'kept' }

/** How many sessions one payment opens. */
export const TRIES = 3

/** The check refused for good, in the verifier's words for why, or `said`: its session is done, and the next open is a new one. */
export class NotPassed extends Said {
  readonly code: string
  readonly check: Check
  constructor(code: string, check: Check, said = verifierSays(code, check)) {
    super(said.message, said.red)
    this.name = 'NotPassed'
    this.code = code
    this.check = check
  }
}

/** Back from Stripe's page without paying: the payment opened no session and holds nothing, so it is dropped, and nothing is said. */
export class Unpaid extends Error {
  constructor() {
    super('Not paid.')
    this.name = 'Unpaid'
  }
}

/** The check is still not finished after a long while. */
export class NotFinished extends Said {
  constructor() {
    super('Not finished.')
    this.name = 'NotFinished'
  }
}

/** The verification under way for this passkey, if any. */
const mine = (passkey: string): Under | null => {
  const u = under()
  return u?.passkey === passkey ? u : null
}

/** Where the verification under way for `passkey` stands, from the device alone: no seed asked. */
export function stepOf(passkey: string): Step {
  const u = mine(passkey)
  if (!u) return { at: 'choose' }
  if (u.kept) return { at: 'kept' }
  if (u.check === 'id' && !u.payment) return { at: 'consent' }
  return u.session ? { at: 'away' } : { at: 'start' }
}

/** The consent screen the verifier serves in GET /, shown before the ID check word for word; a verifier that serves none isn't answering as one. */
export async function consentOf(s: Services): Promise<string> {
  const { consent } = await about(s.verifier)
  if (typeof consent !== 'string' || !consent) throw verifierSays('not_a_verifier')
  return consent
}

/** What each check's gift comes to, as its card on Get verified says it; a check with no gift at this host says nothing of credits. */
export type CreditLines = { face?: string; id?: string }

/** Each check's credit line from the verifier's gifts at `host`: the selfie's free credits, and the ID's as so many times them, or more when the selfie gives none. */
export function creditLines(a: Pick<About, 'gift'>, host: string): CreditLines {
  const gift = a.gift?.host === host ? a.gift : undefined
  if (!gift) return {}
  const times = gift.id / gift.face
  return {
    ...(gift.face > 0 && { face: 'Free credits for posts and messages' }),
    ...(gift.id > 0 && { id: gift.face > 0 ? `${Number.isInteger(times) ? times : times.toFixed(1)}× the free credits` : 'More free credits' }),
  }
}

/** The credit lines, from the verifier this app uses. */
export async function creditsOf(s: Services): Promise<CreditLines> {
  return creditLines(await about(s.verifier), s.host)
}

/** The person's stamp number at the verifier: the only thing mixed from the seed it ever sees. */
export async function stampNumberAt(s: Services, seed: Uint8Array): Promise<bigint> {
  return stampNumberOf(seedNumber(seed), (await about(s.verifier)).name)
}

/** `u` with the gift's buy for `check`, when the verifier gives one at this host and none of that size is kept. */
async function withGift(s: Services, u: Under, check: Check): Promise<Under> {
  const a = await about(s.verifier)
  const credits = a.gift?.host === s.host ? a.gift[check] : 0
  if (!credits || u.gift?.pending.blinds.length === credits) return u
  const gift = await giftBuy(s.host, credits)
  return { ...u, gift }
}

/**
 * `check` chosen for `passkey`. The check under way stays as it is when it is the same one, so going
 * back and picking it again loses nothing; another drops its session, keeping the gift's buy and the
 * ID check's payment, which is the person's $5.
 */
export function choose(passkey: string, check: Check): void {
  const was = mine(passkey)
  if (was?.check === check) return
  keepUnder({ passkey, check, ...(was?.gift && { gift: was.gift }), ...(was?.payment && { payment: was.payment, ...(was.tries && { tries: was.tries }) }) })
}

/** The ID check's payment under way that no stamp has used, with its tries: paid for, then left for the face check. */
const unused = (u: Under | null): Pick<Under, 'payment' | 'tries'> => (u?.check === 'face' && u.payment ? { payment: u.payment, ...(u.tries && { tries: u.tries }) } : {})

/** The verification over: nothing of it left on the device but a payment no stamp used, so the ID check opens paid. */
function over(passkey: string): void {
  const left = unused(mine(passkey))
  if (left.payment) keepUnder({ passkey, check: 'id', ...left })
  else endUnder()
}

/**
 * The ID check sold, unless the verifier signed this stamp number an ID stamp from its current ID key
 * already (one ID stamp a person): then that stamp, to keep, and nothing paid. Else the gift's buy for
 * the ID check, then the payment, its id kept from now, in place of any check under way; and Stripe's
 * page, which sends the person to `returnUrl`.
 */
export async function pay(s: Services, passkey: string, returnUrl: string, stampNumber: bigint): Promise<{ stamp: string } | { url: string }> {
  const signed = await stampBack(s.verifier, stampNumber, 'id')
  if (signed) {
    choose(passkey, 'id')
    return { stamp: signed }
  }
  const was = mine(passkey)
  let u: Under = { passkey, check: 'id', ...(was?.gift && { gift: was.gift }) }
  u = await withGift(s, u, 'id')
  keepUnder(u)
  const { payment, url } = await idPayment(s.verifier, returnUrl)
  keepUnder({ ...u, payment })
  return { url }
}

/** The payment dropped, with its tries: Pay again is the next step. */
const unpaid = (u: Under): Under => {
  const { payment: _, tries: __, session: ___, url: ____, ...rest } = u
  return rest
}

/** A payment's last try didn't pass: its hold ends, and no stamp came from it. */
const triesUsed = () => new NotPassed('payment_used', 'id', new Said(TRIES_USED))

/** The session dropped: the next open is a new one. */
const noSession = (u: Under): Under => {
  const { session: _, url: __, ...rest } = u
  return rest
}

/**
 * The check chosen for `passkey`, opened: the same session again while one is kept, else the gift's
 * buy when none is kept, then a new session, kept with its page. Gives back the page the person does
 * the check on. `returnUrl` is where the verifier has Didit send them after.
 */
export async function open(s: Services, passkey: string, returnUrl?: string): Promise<string> {
  let u: Under = mine(passkey) ?? { passkey, check: 'face' }
  if (u.session && u.url) return u.url
  const check = u.check
  if (check === 'id' && !u.payment) throw new Said('Pay first.')
  if (check === 'id' && (u.tries ?? 0) >= TRIES) {
    keepUnder(unpaid(u))
    throw triesUsed()
  }
  u = await withGift(s, u, check)
  keepUnder(u)
  let session
  try {
    session = check === 'face' ? await faceSession(s.verifier, returnUrl) : await idSession(s.verifier, u.payment!, returnUrl)
  } catch (err) {
    // Not paid after all, or its tries used, or its hold over: the payment dropped, so the next tap
    // pays again. One that opened no session was never paid (back from Stripe's page): nothing said.
    if (err instanceof Refused && (err.code === 'not_paid' || err.code === 'payment_used')) {
      keepUnder(unpaid(u))
      if (err.code === 'not_paid' && !u.tries) throw new Unpaid()
      throw new NotPassed(err.code, 'id')
    }
    throw err
  }
  keepUnder({ ...u, session: session.sessionId, url: session.url, ...(check === 'id' && { tries: (u.tries ?? 0) + 1 }) })
  return session.url
}

/** Asks the verifier for the stamp of the check under way, keeping the gift's ticket as soon as it comes. */
export async function ask(s: Services, passkey: string, stampNumber: bigint): Promise<Step> {
  const u = mine(passkey)
  if (!u?.session) return u ? stepOf(passkey) : { at: 'choose' }
  const check = u.check
  const got = await askStamp(s.verifier, check, { sessionId: u.session, stampNumber, gift: u.gift?.reference, payment: u.payment })
  if (got.signed) {
    if (u.gift && got.ticket) keepUnder({ ...u, gift: { ...u.gift, ticket: got.ticket } })
    // `given` or `bad_gift`: this stamp number's gift went to another buy, so this one gets nothing.
    else if (u.gift && got.noGift) keepUnder({ ...u, gift: undefined })
    return { at: 'signed', stamp: got.stamp }
  }
  if (got.code === 'not_approved') return { at: 'away' }
  // Its hour is over, the verifier never knew it, or (the ID check) its payment gave its stamp: the
  // verifier keeps the stamp only by its stamp number, if it signed one.
  if (got.code === 'session_used' || got.code === 'unknown_session' || got.code === 'payment_used') {
    const back = await stampBack(s.verifier, stampNumber, check)
    if (back) return { at: 'signed', stamp: back }
  }
  if (got.code === 'payment_used' || got.code === 'not_paid') {
    keepUnder(unpaid(u))
    throw new NotPassed(got.code, check)
  }
  if (got.code === 'session_used' || got.code === 'unknown_session') {
    keepUnder(noSession(u))
    return { at: 'start' }
  }
  // An ID already verified with another seed: the verifier cancels the hold and uses the payment
  // up, so it is dropped too, and the next tap pays again.
  if (got.code === 'duplicate_document') {
    keepUnder(unpaid(u))
    throw new NotPassed(got.code, check)
  }
  // The payment's last try, and it didn't pass: Pay again, nothing charged.
  if (check === 'id' && (u.tries ?? 0) >= TRIES) {
    keepUnder(unpaid(u))
    throw triesUsed()
  }
  keepUnder(noSession(u))
  throw new NotPassed(got.code, check)
}

/** The gift's credits into the wallet, once its ticket is kept; then only the stamp is left to keep. Gives back how many. */
export async function collect(s: Services, passkey: string, wallet: string): Promise<number> {
  const u = mine(passkey)
  if (!u?.gift?.ticket) return 0
  const n = await collectGift(s.host, u.gift.pending, u.gift.ticket, wallet)
  const { gift: _, ...rest } = u
  keepUnder(rest)
  return n
}

/** The same stamp, by its signature. */
async function sameStamp(a: string, b: string): Promise<boolean> {
  const { stampFromJson } = await stamps()
  const [x, y] = [stampFromJson(JSON.parse(a)), stampFromJson(JSON.parse(b))]
  return x.verifier === y.verifier && x.signature.S === y.signature.S
}

/** How the person is verified, worked out fresh from the stamps their Profiles folder holds, against the verifier's current keys, and kept on the device in place of what it kept before. */
async function noteChecks(s: Services, held: string[]): Promise<void> {
  const found = await Promise.all(held.map((stamp) => checkOfStamp(s.verifier, stamp)))
  saveChecks(found.filter((c): c is Check => c !== null))
}

/**
 * The stamp's last steps: the gift collected, the stamp kept in the Profiles folder unless it is
 * there, every profile made to show it, and the verification over: the passkey is in use here from
 * now.
 */
export async function finish(s: Services, passkey: string, seed: Uint8Array, stamp: string, prove: Prove): Promise<void> {
  const folder = await openProfiles(seed, s.host)
  await collect(s, passkey, folder.key.address)
  const kept = await Promise.all(folder.stamps.map((k) => sameStamp(k, stamp)))
  if (!kept.includes(true)) await addTo(folder, s.host, 'stamp', { stamp })
  const held = kept.includes(true) ? folder.stamps : [...folder.stamps, stamp]
  await noteChecks(s, held)
  const u = mine(passkey)
  if (u) keepUnder({ passkey, check: u.check, kept: true, ...unused(u) })
  await showStamps(s, seed, { labels: folder.labels, stamps: held }, prove)
  over(passkey)
  usePasskey(passkey)
}

/** A stamp kept, its profiles not all showing it yet when the page closed: they are made to now, and the verification is over. */
export async function finishShowing(s: Services, passkey: string, seed: Uint8Array, prove: Prove): Promise<void> {
  const folder = await openProfiles(seed, s.host)
  await showStamps(s, seed, folder, prove)
  if (mine(passkey)) over(passkey)
}

/**
 * The verification under way, taken one step on with the seed: the stamp asked for, and when it is
 * signed, kept and shown. Gives back where it stands, or null once it is over.
 */
export async function advance(s: Services, passkey: string, seed: Uint8Array, prove: Prove): Promise<Step | null> {
  if (stepOf(passkey).at === 'kept') {
    await finishShowing(s, passkey, seed, prove)
    return null
  }
  const step = await ask(s, passkey, await stampNumberAt(s, seed))
  if (step.at !== 'signed') return step
  await finish(s, passkey, seed, step.stamp, prove)
  return null
}

/**
 * Where the person whose seed this is stands: verified, with the labels their Profiles folder
 * lists, or the step their verification stopped at, taken up as far as it goes. A stamp the
 * verifier signed and the app had not kept yet is kept now. A verified person's ID check under way
 * stays under way, to go on from You or Home.
 */
export async function resume(s: Services, passkey: string, seed: Uint8Array, prove: Prove): Promise<{ verified: true; labels: string[] } | { verified: false; step: Step }> {
  const folder = await openProfiles(seed, s.host)
  const u = mine(passkey)
  if (folder.stamps.length) {
    await noteChecks(s, folder.stamps)
    if (u?.kept) await finishShowing(s, passkey, seed, prove)
    else if (u?.check === 'face') {
      // The face stamp is kept: only its gift may be left to collect.
      await collect(s, passkey, folder.key.address)
      over(passkey)
    } else if (u?.session) await advance(s, passkey, seed, prove).catch(() => undefined)
    return { verified: true, labels: folder.labels }
  }
  const stampNumber = await stampNumberAt(s, seed)
  let step = await ask(s, passkey, stampNumber)
  if (step.at === 'start' || step.at === 'choose') {
    // A stamp signed and never kept, for this check or the other: a device lost after the signing.
    const back = await stampsBack(s.verifier, stampNumber)
    // The check under way first, else the face check.
    const first = mine(passkey)?.check ?? 'face'
    const stamp = back[first] ?? back[first === 'face' ? 'id' : 'face']
    if (stamp) step = { at: 'signed', stamp }
  }
  if (step.at !== 'signed') return { verified: false, step }
  await finish(s, passkey, seed, step.stamp, prove)
  return { verified: true, labels: folder.labels }
}
