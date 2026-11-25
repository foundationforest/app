// The verification: the face check, free once, or the ID check, paid; its gift, the wallet and the
// stamps kept; then every profile made to show them. All of it runs in one box on Get verified
// (screens/CheckBox.tsx), the page never leaving, so the seed held as it starts is held to its end.
// In steps the app can come back to: close the page anywhere, and the next step picks up, losing
// nothing.
//
//   1. pay (the ID check only): first the stamps the verifier signed this stamp number asked back,
//      since one signed and never kept (a device lost after the signing) is kept, and nothing is
//      paid. Else the gift's buy, then the payment at the verifier, for the stamp number, which it
//      locks inside it, kept on the device (device.ts, `Under`), and the client secret of the
//      verifier's payment page, which the box frames. There the person pays, and the page tells the
//      box only that they are done; the price is held on their card, and taken only once a stamp
//      comes from it;
//   2. open: the gift's buy (one buy at the host for exactly the check's gift, as services'
//      end-to-end test buys it), then a session at the verifier: the face check's for the seed's
//      stamp number, which alone it can give a stamp to, while its one free try is left; the ID
//      check's with its payment alone, which carries the stamp number, each session one of the
//      payment's three tries, counted on the device, so the third that doesn't pass says it was the
//      last. Kept on the device with its page, so a box closed midway opens the same check again;
//   3. ask: the session's stamp, with the buy's reference (and the payment); the gift's ticket comes
//      with it and is kept, and the ID check's face stamp from the same selfie, when this stamp
//      number held none. The same session and stamp number give the same stamp and ticket within its
//      hour, and after it the verifier hands the stamps back by the stamp number. A session that will
//      never pass is dropped, with the verifier's code for why (`NotPassed`), and the next open is a
//      new one;
//   4. collect: the buy collected with the ticket, its credits spent into the wallet, the Profiles
//      folder's balance. Collected again, a buy gets the same answer;
//   5. keep: each stamp in the Profiles folder, its first write paid from the wallet, with the list of
//      what the check saw beside it (`factList`), which the person needs to show any of it later.
//      The same stamp is never kept twice, so one asked back, which comes without its list, never
//      takes the place of one that has it;
//   6. show: each profile's entry written again with a verification of each new stamp (stamps.ts).
//      Then nothing of the verification is left on the device, but an ID check's payment no stamp
//      used (paid, then left for the face check), so the ID check added later opens paid.
//
// The device keeps the check's session and the gift's buy because both are lost otherwise: a session
// asked again gives the same stamp, and a gift is given once a stamp number. It keeps the payment
// because it holds the person's money. Closing the box and picking the same check again changes none
// of it (`choose`). The person may cancel the ID check while its payment gave no stamp (`cancel`):
// its hold ends at once.
//
// How the person is verified is worked out fresh from the Profiles folder's stamps each time it is
// opened here, against the verifier's current keys: a stamp from a key it no longer signs with counts
// for nothing, so a person whose stamps all come from such keys checks again.

import { seedNumber, stampNumberOf } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { type Check, type IdShown, type Under, endUnder, keepIds, keepUnder, saveChecks, under, usePasskey } from '../device.ts'
import { collectGift, giftBuy } from '../services/credits.ts'
import { readView } from '../services/host.ts'
import { Refused } from '../services/http.ts'
import { type About, type Price, about, askStamp, checkOfStamp, counted, faceSession, idCancel, idPayment, idSession, stamps, stampsBack } from '../services/verifier.ts'
import { Said, verifierSays } from '../words.ts'
import type { Prove } from './profile.ts'
import { addTo, openProfiles } from './profiles.ts'
import { showStamps } from './stamps.ts'

/**
 * Where a verification stands: nothing under way, so a check to choose; a check chosen, with no
 * session yet; a session open and not finished; signed, its stamps to keep; or kept, with only the
 * profiles left to show them.
 */
export type Step = { at: 'choose' } | { at: 'start' } | { at: 'away' } | { at: 'signed'; stamps: string[] } | { at: 'kept' }

/** How many sessions one payment opens. */
export const TRIES = 3

/**
 * The check refused for good, or a step that went wrong, by the verifier's code (and `expired`,
 * `not_paid` and the rest as it answers them): its session is done, and the next open is a new one.
 * `last`, on the ID check, when it was the payment's last session, so the payment is used up.
 */
export class NotPassed extends Said {
  readonly code: string
  readonly check: Check
  readonly last: boolean
  constructor(code: string, check: Check, last = false) {
    super(verifierSays(code, check).message)
    this.name = 'NotPassed'
    this.code = code
    this.check = check
    this.last = last
  }
}

/** The refusals that end an ID check's payment whatever its tries: a person or a face Didit has seen, or a birth date under 18. The verifier cancels its hold. */
const ENDS_PAYMENT = new Set(['known_person', 'known_face', 'too_young'])

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
  return u.session ? { at: 'away' } : { at: 'start' }
}

/** What a check's Before step shows, as the verifier serves it in GET /: its consent screen, word for word, and the line the person ticks, with, for the ID, the right to cancel after it. */
export type Consent = { consent: string; agree: string; cancelRight?: string }

/** The consent screen for `check`: a verifier that serves none isn't answering as one. */
export async function consentOf(s: Services, check: Check): Promise<Consent> {
  const a = await about(s.verifier)
  const consent = check === 'face' ? a.face.consent : a.consent
  const cancelRight = a.id.cancelRight
  if (typeof consent !== 'string' || !consent || typeof a.agree !== 'string' || !a.agree) throw verifierSays('not_a_verifier')
  if (check === 'id' && (typeof cancelRight !== 'string' || !cancelRight)) throw verifierSays('not_a_verifier')
  return { consent, agree: a.agree, ...(check === 'id' && { cancelRight }) }
}

/** The ID check as GET / says it: for sale, whether its payments are test payments, each true only when it says so; and its price for a first ID, in words ("$5"), once Stripe has said it. */
export type IdCheck = { forSale: boolean; testPayments: boolean; price?: string }

/** A price in words, as its currency writes it: 500 usd is $5; cents only where it has them. */
export function priceText(p: Price | null | undefined): string | undefined {
  if (!p || !Number.isSafeInteger(p.amount) || typeof p.currency !== 'string') return undefined
  const cents = p.amount % 100 !== 0
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency.toUpperCase(), minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 }).format(p.amount / 100)
  } catch {
    return undefined
  }
}

/** The ID check, from the verifier this app uses: shown only where it is for sale. */
export async function idCheckOf(s: Services): Promise<IdCheck> {
  const { id } = await about(s.verifier)
  const price = priceText(id.price)
  return { forSale: id.forSale === true, testPayments: id.testPayments === true, ...(price && { price }) }
}

/** What each check's gift comes to, as its card on Get verified says it; a check with no gift at this host says nothing of credits. */
export type CreditLines = { face?: string; id?: string }

/** Each check's credit line from the verifier's gifts at `host`: the face's free credits, and the ID's as so many times them, or more when the face gives none. */
export function creditLines(a: Pick<About, 'gift'>, host: string): CreditLines {
  const gift = a.gift?.host === host ? a.gift : undefined
  if (!gift) return {}
  const times = gift.id / gift.face
  return {
    ...(gift.face > 0 && { face: 'Free credits' }),
    ...(gift.id > 0 && { id: gift.face > 0 ? `${Number.isInteger(times) ? times : times.toFixed(1)}× the credits` : 'More credits' }),
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

/** Whether the stamp number's one free face check is left, as the verifier keeps it. */
export async function faceTryLeft(s: Services, stampNumber: bigint): Promise<boolean> {
  return (await stampsBack(s.verifier, stampNumber)).faceTriesLeft > 0
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
 * `check` chosen for `passkey`. The check under way stays as it is when it is the same one, so closing
 * the box and picking it again loses nothing; another drops its session, keeping the gift's buy and
 * the ID check's payment, which holds the person's money.
 */
export function choose(passkey: string, check: Check): void {
  const was = mine(passkey)
  if (was?.check === check) return
  keepUnder({ passkey, check, ...(was?.gift && { gift: was.gift }), ...(was?.payment && { payment: was.payment, ...(was.tries && { tries: was.tries }) }) })
}

/** Whether a payment is kept for the ID check under way: the Paying step can be skipped. */
export const paymentKept = (passkey: string): boolean => !!mine(passkey)?.payment

/** The ID check's payment under way that no stamp has used, with its tries: paid for, then left for the face check. */
const unused = (u: Under | null): Pick<Under, 'payment' | 'tries'> => (u?.check === 'face' && u.payment ? { payment: u.payment, ...(u.tries && { tries: u.tries }) } : {})

/** The verification over: nothing of it left on the device but a payment no stamp used, so the ID check opens paid. */
function over(passkey: string): void {
  const left = unused(mine(passkey))
  if (left.payment) keepUnder({ passkey, check: 'id', ...left })
  else endUnder()
}

/** The payment dropped, with its tries and its session: the next ID check pays again. */
const unpaid = (u: Under): Under => {
  const { payment: _, tries: __, session: ___, url: ____, ...rest } = u
  return rest
}

/** The session dropped: the next open is a new one. */
const noSession = (u: Under): Under => {
  const { session: _, url: __, ...rest } = u
  return rest
}

/**
 * The ID check paid for: first the stamps the verifier signed this stamp number from its current ID
 * key, asked back; any is to keep, and nothing is paid. Else the gift's buy for the ID check, then the
 * payment for the stamp number, kept from now, in place of any check under way, and the client
 * secret of the payment page the box frames.
 */
export async function pay(s: Services, passkey: string, stampNumber: bigint): Promise<{ stamps: string[] } | { clientSecret: string }> {
  const back = await stampsBack(s.verifier, stampNumber)
  if (back.id.length) {
    choose(passkey, 'id')
    return { stamps: [...back.id, ...(back.face ? [back.face] : [])] }
  }
  const was = mine(passkey)
  let u: Under = { passkey, check: 'id', ...(was?.gift && { gift: was.gift }) }
  u = await withGift(s, u, 'id')
  keepUnder(u)
  const { payment, clientSecret } = await idPayment(s.verifier, stampNumber)
  keepUnder({ ...u, payment })
  return { clientSecret }
}

/** The payment kept turned out never paid: dropped, so the box pays again. */
export class Unpaid extends Error {
  constructor() {
    super('Not paid.')
    this.name = 'Unpaid'
  }
}

/**
 * The check chosen for `passkey`, opened: the same session again while one is kept, else the gift's
 * buy when none is kept, then a new session, the face check's for the seed's stamp number (asked of
 * `stampNumber` only then, as it takes the seed), the ID check's with its payment. Kept with its page,
 * which the box frames. A payment never paid opens nothing (`Unpaid`, and the box pays); one paid
 * over a day ago, or used up, throws its code, and is dropped.
 */
export async function open(s: Services, passkey: string, stampNumber: () => Promise<bigint>): Promise<string> {
  let u: Under = mine(passkey) ?? { passkey, check: 'face' }
  if (u.session && u.url) return u.url
  const check = u.check
  if (check === 'id' && !u.payment) throw new Unpaid()
  if (check === 'id' && (u.tries ?? 0) >= TRIES) {
    keepUnder(unpaid(u))
    throw new NotPassed('payment_used', 'id', true)
  }
  u = await withGift(s, u, check)
  keepUnder(u)
  let session
  try {
    session = check === 'face' ? await faceSession(s.verifier, await stampNumber()) : await idSession(s.verifier, u.payment!)
  } catch (err) {
    if (err instanceof Refused && check === 'id' && (err.code === 'not_paid' || err.code === 'payment_used')) {
      keepUnder(unpaid(u))
      if (err.code === 'not_paid' && !u.tries) throw new Unpaid()
      throw new NotPassed(err.code, 'id', true)
    }
    if (err instanceof Refused && err.code === 'face_tries_used') throw new NotPassed(err.code, 'face')
    throw err
  }
  keepUnder({ ...u, session: session.sessionId, url: session.url, ...(check === 'id' && { tries: (u.tries ?? 0) + 1 }) })
  return session.url
}

/** The session under way dropped, its payment kept: Keep trying opens a new one, on the same payment. */
export function again(passkey: string): void {
  const u = mine(passkey)
  if (u) keepUnder(noSession(u))
}

/** The ID check cancelled while its payment gave no stamp: its hold ends at the verifier, and the payment is dropped here. One the verifier says gave nothing or holds nothing is dropped all the same. */
export async function cancel(s: Services, passkey: string): Promise<void> {
  const u = mine(passkey)
  if (!u?.payment) return
  try {
    await idCancel(s.verifier, u.payment)
  } catch (err) {
    if (!(err instanceof Refused) || (err.code !== 'not_paid' && err.code !== 'payment_used')) throw err
  }
  keepUnder(unpaid(u))
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
    return { at: 'signed', stamps: [got.stamp, ...(got.face ? [got.face] : [])] }
  }
  if (got.code === 'not_approved') return { at: 'away' }
  // Its hour is over, the verifier never knew it, or (the ID check) its payment gave its stamp: the
  // verifier keeps the stamps only by the stamp number, if it signed one.
  if (got.code === 'session_used' || got.code === 'unknown_session' || got.code === 'payment_used') {
    const back = await stampsBack(s.verifier, stampNumber)
    const signed = check === 'face' ? (back.face ? [back.face] : []) : back.id
    if (signed.length) return { at: 'signed', stamps: [...signed, ...(check === 'id' && back.face ? [back.face] : [])] }
  }
  if (got.code === 'payment_used' || got.code === 'not_paid') {
    keepUnder(unpaid(u))
    throw new NotPassed(got.code, check, true)
  }
  // The ID check's refusals that end its payment, and any on its last session: the payment is used up.
  if (check === 'id' && (ENDS_PAYMENT.has(got.code) || ((u.tries ?? 0) >= TRIES && got.code !== 'session_used' && got.code !== 'unknown_session' && got.code !== 'wrong_workflow'))) {
    keepUnder(unpaid(u))
    throw new NotPassed(got.code, check, true)
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

/** The same stamp, by its signature, with its list of facts or without. */
async function sameStamp(a: string, b: string): Promise<boolean> {
  const { stampFromJson } = await stamps()
  const [x, y] = [stampFromJson(JSON.parse(a)), stampFromJson(JSON.parse(b))]
  return x.verifier === y.verifier && x.signature.S === y.signature.S
}

/** One fact of a stamp's list, by its name: its value, when it is text. */
export function factOf(stamp: string, name: string): string | undefined {
  const list = (JSON.parse(stamp) as { factList?: unknown }).factList
  const f = Array.isArray(list) ? (list as Array<{ name?: unknown; value?: unknown }>).find((x) => x?.name === name) : undefined
  return typeof f?.value === 'string' && f.value ? f.value : undefined
}

/** An ID stamp as Your checks lists it, from the list of facts beside it: its document's kind and its own name for it, its country and when it runs out, and the path of its entry, which its page opens; nothing of the list for one kept without it. */
export function idShownOf(stamp: string, path?: string): IdShown {
  const fact = (name: string) => factOf(stamp, name)
  const [kind, subtype, country, until] = [fact('document_type'), fact('document_subtype'), fact('issuing_state'), fact('expiration_date')]
  return { ...(kind && { kind }), ...(subtype && { subtype }), ...(country && { country }), ...(until && { until }), ...(path && { path }) }
}

/** A stamp the Profiles folder holds, and the path of its entry there. */
export type Held = { stamp: string; path?: string }

/**
 * How the person is verified, worked out fresh from the stamps their Profiles folder holds, against
 * the verifier's current keys, and kept on the device in place of what it kept before; with each ID
 * stamp's kind, name, country, end and path, so Your checks lists them with nothing unlocked.
 */
export async function noteChecks(s: Services, held: Held[]): Promise<void> {
  const found = await Promise.all(held.map((h) => checkOfStamp(s.verifier, h.stamp)))
  saveChecks(found.filter((c): c is Check => c !== null))
  keepIds(held.filter((_, i) => found[i] === 'id').map((h) => idShownOf(h.stamp, h.path)))
}

/**
 * The stamps' last steps: the gift collected, each stamp kept in the Profiles folder unless it is
 * there (by its signature, so one asked back without its list never takes the place of the one kept
 * with it), every profile made to show them, and the verification over: the passkey is in use here
 * from now.
 */
export async function finish(s: Services, passkey: string, seed: Uint8Array, signed: string[], prove: Prove): Promise<void> {
  const folder = await openProfiles(seed, s.host)
  await collect(s, passkey, folder.key.address)
  const held: Held[] = [...folder.held]
  for (const stamp of signed) {
    const there = await Promise.all(held.map((h) => sameStamp(h.stamp, stamp)))
    if (there.includes(true)) continue
    const id = await addTo(folder, s.host, 'stamp', { stamp })
    held.push({ stamp, path: `stamp/${id}` })
    // The next write reads the folder as it now is, its profile entry there.
    folder.view = await readView(s.host, folder.key.address)
  }
  await noteChecks(s, held)
  const u = mine(passkey)
  if (u) keepUnder({ passkey, check: u.check, kept: true, ...unused(u) })
  await showStamps(s, seed, { labels: folder.labels, stamps: held.map((h) => h.stamp) }, prove)
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
  await finish(s, passkey, seed, step.stamps, prove)
  return null
}

/**
 * Where a person stands: verified, with the labels their Profiles folder lists; or not, at the step
 * their verification stopped at, with `again` when the folder holds stamps that all count for
 * nothing, and its labels, and `never` when the folder holds no stamp and no profile at all.
 */
export type Standing = { verified: true; labels: string[] } | { verified: false; step: Step; again?: { labels: string[] }; never?: true }

/**
 * Where the person whose seed this is stands: verified, with a stamp from one of the verifier's
 * current keys, and the labels their Profiles folder lists; or the step their verification stopped
 * at, taken up as far as it goes. A stamp the verifier signed and the app had not kept yet is kept
 * now. A verified person's ID check under way stays under way, to go on from You or Home. One whose
 * stamps all come from keys the verifier no longer signs with is not verified: they check again. A
 * check under way that will never pass is dropped here, as the box would drop it. `never`: no stamp,
 * no profile, and no check under way on this device.
 */
export async function resume(s: Services, passkey: string, seed: Uint8Array, prove: Prove): Promise<Standing> {
  const folder = await openProfiles(seed, s.host)
  const u = mine(passkey)
  if (folder.held.length) await noteChecks(s, folder.held)
  if ((await counted(s.verifier, folder.stamps)).length) {
    if (u?.kept) await finishShowing(s, passkey, seed, prove)
    else if (u?.check === 'face') {
      // The face stamp is kept: only its gift may be left to collect.
      await collect(s, passkey, folder.key.address)
      over(passkey)
    } else if (u?.session) await advance(s, passkey, seed, prove).catch(() => undefined)
    return { verified: true, labels: folder.labels }
  }
  const stampNumber = await stampNumberAt(s, seed)
  let step: Step
  try {
    step = await ask(s, passkey, stampNumber)
  } catch (err) {
    if (!(err instanceof NotPassed)) throw err
    step = stepOf(passkey)
  }
  if (step.at === 'start' || step.at === 'choose') {
    // Stamps signed and never kept: a device lost after the signing.
    const back = await stampsBack(s.verifier, stampNumber)
    const signed = [...back.id, ...(back.face ? [back.face] : [])]
    if (signed.length) step = { at: 'signed', stamps: signed }
  }
  if (step.at !== 'signed') {
    // Never verified: no stamp, no profile, and no check under way on this device for it.
    const never = folder.stamps.length === 0 && folder.labels.length === 0 && !mine(passkey)
    return { verified: false, step, ...(folder.stamps.length > 0 && { again: { labels: folder.labels } }), ...(never && { never: true }) }
  }
  await finish(s, passkey, seed, step.stamps, prove)
  return { verified: true, labels: folder.labels }
}
