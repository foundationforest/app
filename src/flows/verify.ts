// The verification: the face check, its gift, the wallet and the stamp kept, in steps the app can
// come back to. Close the page anywhere and Start picks it up, losing nothing:
//
//   1. open: the gift's buy (one buy at the host for exactly the verifier's gift, services' loop's
//      way), then a session at the verifier, both kept on the device (device.ts, `Under`);
//   2. ask: the session's stamp, with the buy's reference; the gift's ticket comes with it and is
//      kept. The same session and stamp number give the same stamp and ticket within its hour, and
//      after it the verifier hands the stamp back by its stamp number;
//   3. collect: the buy collected with the ticket, its credits spent into the wallet, the Profiles
//      folder's balance. Collected again, a buy gets the same answer;
//   4. keep: the stamp in the Profiles folder, its first write paid from the wallet. Then nothing
//      of the verification is left on the device.
//
// The device keeps the check's session and the gift's buy because both are lost otherwise: a second
// check of the same face goes to review, and a gift is given once a stamp number.

import { seedNumber, stampNumberOf } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { endUnder, keepUnder, under, usePasskey } from '../device.ts'
import { collectGift, giftBuy } from '../services/credits.ts'
import { Refused } from '../services/http.ts'
import { about, askStamp, session, stampBack, stamps } from '../services/verifier.ts'
import { addTo, openProfiles } from './profiles.ts'

/** Where a verification stands: none open, so Start opens one; open in its tab and not finished; held for review; or signed. */
export type Step = { at: 'start' } | { at: 'away' } | { at: 'review' } | { at: 'signed'; stamp: string }

/** The check refused for good: Didit did not pass it. */
export class NotPassed extends Error {
  constructor() {
    super("The check didn't pass.")
    this.name = 'NotPassed'
  }
}

/** The check is still not finished after a long while, or was declined: the verifier says the same for both. */
export class NotFinished extends Error {
  constructor() {
    super('Not finished.')
    this.name = 'NotFinished'
  }
}

/** The person's stamp number at the verifier: the only thing mixed from the seed it ever sees. */
export async function stampNumberAt(s: Services, seed: Uint8Array): Promise<bigint> {
  return stampNumberOf(seedNumber(seed), (await about(s.verifier)).name)
}

/**
 * Opens a face check for the passkey `passkey`: the gift's buy first, when the verifier gives one
 * at this host and none is kept, then a session, kept in place of any before it. Gives back the page
 * the person does the check on. `returnUrl` is where the verifier has Didit send them after.
 */
export async function open(s: Services, passkey: string, returnUrl?: string): Promise<string> {
  const a = await about(s.verifier)
  const was = under()
  const u = was?.passkey === passkey ? { ...was } : { passkey }
  if (!u.gift && a.gift && a.gift.face > 0 && a.gift.host === s.host) {
    u.gift = await giftBuy(s.host, a.gift.face)
    keepUnder(u)
  }
  const { sessionId, url } = await session(s.verifier, returnUrl)
  keepUnder({ ...u, session: sessionId })
  return url
}

/** Asks the verifier for the stamp of the check under way, keeping the gift's ticket as soon as it comes. */
export async function ask(s: Services, passkey: string, stampNumber: bigint): Promise<Step> {
  const u = under()
  if (u?.passkey !== passkey || !u.session) return { at: 'start' }
  const got = await askStamp(s.verifier, u.session, stampNumber, u.gift?.reference).catch((err: unknown) => {
    // Any other 403 is a check that does not count (no liveness, no face): the session is done.
    if (!(err instanceof Refused && err.status === 403)) throw err
    keepUnder({ passkey, ...(u.gift && { gift: u.gift }) })
    throw new NotPassed()
  })
  if (got.signed) {
    if (u.gift && got.ticket) keepUnder({ ...u, gift: { ...u.gift, ticket: got.ticket } })
    // `given` or `bad_gift`: this stamp number's gift went to another buy, so this one gets nothing.
    else if (u.gift && got.noGift) keepUnder({ passkey, session: u.session })
    return { at: 'signed', stamp: got.stamp }
  }
  if (got.why === 'review') return { at: 'review' }
  if (got.why === 'unfinished') return { at: 'away' }
  // Its hour is over, so the verifier keeps it only by its stamp number; or it never knew it.
  const back = got.why === 'used' ? await stampBack(s.verifier, stampNumber) : null
  if (back) return { at: 'signed', stamp: back }
  keepUnder({ passkey, ...(u.gift && { gift: u.gift }) })
  return { at: 'start' }
}

/** The gift's credits into the wallet, once its ticket is kept; then only the stamp is left to keep. Gives back how many. */
export async function collect(s: Services, passkey: string, wallet: string): Promise<number> {
  const u = under()
  if (u?.passkey !== passkey || !u.gift?.ticket) return 0
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

/** The stamp's last steps: the gift collected, the stamp kept in the Profiles folder unless it is there, and the verification over: the passkey is in use here from now. */
export async function finish(s: Services, passkey: string, seed: Uint8Array, stamp: string): Promise<void> {
  const folder = await openProfiles(seed, s.host)
  await collect(s, passkey, folder.key.address)
  const kept = await Promise.all(folder.stamps.map((k) => sameStamp(k, stamp)))
  if (!kept.includes(true)) await addTo(folder, s.host, 'stamp', { stamp })
  endUnder()
  usePasskey(passkey)
}

/**
 * Where the person whose seed this is stands: verified, with the labels their Profiles folder
 * lists, or the step their verification stopped at, taken up as far as it goes. A stamp the
 * verifier signed and the app had not kept yet is kept now.
 */
export async function resume(s: Services, passkey: string, seed: Uint8Array): Promise<{ verified: true; labels: string[] } | { verified: false; step: Step }> {
  const folder = await openProfiles(seed, s.host)
  if (folder.stamps.length) {
    if (under()?.passkey === passkey) {
      await collect(s, passkey, folder.key.address)
      endUnder()
    }
    return { verified: true, labels: folder.labels }
  }
  const stampNumber = await stampNumberAt(s, seed)
  let step = await ask(s, passkey, stampNumber)
  if (step.at === 'start') {
    const back = await stampBack(s.verifier, stampNumber)
    if (back) step = { at: 'signed', stamp: back }
  }
  if (step.at !== 'signed') return { verified: false, step }
  await finish(s, passkey, seed, step.stamp)
  return { verified: true, labels: folder.labels }
}
