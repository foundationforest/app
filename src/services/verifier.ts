// The verifier's routes the app calls (services' verifier/README.md, Its API): who it is and its
// gifts; for each check, a session and the stamp asked for it; the ID check's payment; and a stamp
// asked back by its stamp number. Each is a POST with a JSON body, so nothing the person sends is in
// a URL. A refusal is the verifier's code, said in words.ts's words for the check the person is on.

import { lazy } from '../version.ts'
import { Refused, call } from './http.ts'

/**
 * The standard's stamp functions, loaded when a stamp is first read: they come with the proofs'
 * library, snarkjs and all, which the page needs for nothing else, so it stays out of the first load.
 */
export const stamps = () => lazy(() => import('@foundationforest/proofs'))

/**
 * A stamp as the Profiles folder keeps it: the standard's JSON of it, as text, checked as the standard
 * reads it. What a verifier adds beside it is kept too, since the standard's stampToJson passes it
 * through: our verifier's `factList`, the list of what the check saw that its facts were made from,
 * which the person needs to show any of those facts later. A stamp asked back comes without it.
 */
export async function stampText(json: unknown): Promise<string> {
  const { stampFromJson, stampToJson } = await stamps()
  return JSON.stringify(stampToJson(stampFromJson(json)))
}

const SERVICE = 'verifier'

/** The two checks: the face check, free, and the ID check, paid. */
export type Check = 'face' | 'id'

/** An amount as Stripe's Price says it: in the currency's smallest unit (500 is $5), and its code, lower case. */
export type Price = { amount: number; currency: string }

/**
 * What the verifier says of itself in GET /: its name, its two keys, each with the names of its facts
 * in their list's order (`facts`); the face key with `consent`, the text an app shows before the face
 * check; the ID key with whether it is for sale (`forSale`, false while it has no Stripe key), whether
 * its payments are test payments, which charge nobody (`testPayments`), its prices (`price` for a
 * first ID, `addedPrice` for one more, null until Stripe has said them) and `cancelRight`, the line
 * the person agrees to that starts the ID check at once; the recipe its facts are made by (`recipe`,
 * the standard's facts as a list); `consent`, the text an app shows before the ID check; `agree`, the
 * one line the person ticks before either check; and its gifts, credits at one host.
 */
export type About = {
  name: string
  face: { key: string; facts?: string[]; consent?: string }
  id: { key: string; facts?: string[]; forSale?: boolean; testPayments?: boolean; price?: Price | null; addedPrice?: Price | null; cancelRight?: string }
  recipe?: string
  consent?: string
  agree?: string
  gift?: { face: number; id: number; host: string; sponsor: string }
}

const known = new Map<string, Promise<About>>()

/** The verifier at `origin`, as it says it is: asked once a page. */
export function about(origin: string): Promise<About> {
  let got = known.get(origin)
  if (!got) {
    got = call(SERVICE, `${origin}/`).then(({ status, body }) => {
      if (status !== 200 || typeof body?.name !== 'string' || typeof body?.face?.key !== 'string' || typeof body?.id?.key !== 'string') throw new Refused(SERVICE, status, body?.error ?? 'not_a_verifier')
      return body as About
    })
    got.catch(() => known.delete(origin))
    known.set(origin, got)
  }
  return got
}

/** The check a stamp is from, by the verifier's key that signed it; null for a key it no longer signs with, which counts for nothing. */
export async function checkOfStamp(origin: string, stamp: string): Promise<Check | null> {
  const [a, { stampFromJson }] = await Promise.all([about(origin), stamps()])
  const key = stampFromJson(JSON.parse(stamp)).verifier
  return key === a.face.key ? 'face' : key === a.id.key ? 'id' : null
}

/** The stamps among `held` from the verifier's current keys, as GET / names them: the only ones a profile shows a verification of. */
export async function counted(origin: string, held: string[]): Promise<string[]> {
  const of = await Promise.all(held.map((stamp) => checkOfStamp(origin, stamp)))
  return held.filter((_, i) => of[i] !== null)
}

/** A session that opened: its id, and the page the person does the check on. */
export type Session = { sessionId: string; url: string }

function sessionOf(status: number, body: any, check: Check): Session {
  if (status !== 201 || typeof body?.sessionId !== 'string' || typeof body?.url !== 'string') throw new Refused(SERVICE, status, body?.error ?? 'internal', check)
  return body
}

/** A face check: its session, opened for this stamp number, which alone it can give a stamp to, while its free try is left. */
export async function faceSession(origin: string, stampNumber: bigint): Promise<Session> {
  const { status, body } = await call(SERVICE, `${origin}/face/session`, { stampNumber: stampNumber.toString() })
  return sessionOf(status, body, 'face')
}

/**
 * The ID check's payment, for this stamp number, which the verifier locks inside it: the payment, which
 * opens the check's sessions, and the client secret of the verifier's payment page, which the app
 * frames, so the person pays without leaving it.
 */
export async function idPayment(origin: string, stampNumber: bigint): Promise<{ payment: string; clientSecret: string }> {
  const { status, body } = await call(SERVICE, `${origin}/id/payment`, { stampNumber: stampNumber.toString() })
  if (status !== 201 || typeof body?.payment !== 'string' || typeof body?.clientSecret !== 'string') throw new Refused(SERVICE, status, body?.error ?? 'internal', 'id')
  return body
}

/** An ID check: its session, for a paid payment with a try left, opened for the stamp number the payment carries. */
export async function idSession(origin: string, payment: string): Promise<Session> {
  const { status, body } = await call(SERVICE, `${origin}/id/session`, { payment })
  return sessionOf(status, body, 'id')
}

/** The ID check cancelled while its payment gave no stamp: its hold cancelled, and the payment opens no more sessions. */
export async function idCancel(origin: string, payment: string): Promise<void> {
  const { status, body } = await call(SERVICE, `${origin}/id/cancel`, { payment })
  if (status !== 200) throw new Refused(SERVICE, status, body?.error ?? 'internal', 'id')
}

/** What asking for the stamp came to: signed, with the gift's ticket or why none, and on the ID check the face stamp signed from the same selfie, when this stamp number held none; or the verifier's no, with its code. */
export type Asked = { signed: true; stamp: string; face?: string; ticket?: string; noGift?: string } | { signed: false; code: string; status: number }

/**
 * The stamp for the session `sessionId` of `check`, for this stamp number, with `gift`, a buy's
 * reference, its gift's ticket; the ID check's with its payment. The stamp comes back as the
 * Profiles folder keeps it: the standard's JSON of it, as text (the reference app's `keep`).
 */
export async function askStamp(origin: string, check: Check, ask: { sessionId: string; stampNumber: bigint; gift?: string; payment?: string }): Promise<Asked> {
  const { status, body } = await call(SERVICE, `${origin}/${check}/stamp`, {
    sessionId: ask.sessionId,
    stampNumber: ask.stampNumber.toString(),
    ...(check === 'id' && { payment: ask.payment }),
    ...(ask.gift && { gift: ask.gift }),
  })
  if (status === 200) {
    const ours = (s: any) => s?.stampNumber === ask.stampNumber.toString()
    if (!ours(body?.stamp) || (body?.face && !ours(body.face))) throw new Refused(SERVICE, status, 'another_stamp_number', check)
    const ticket = typeof body?.gift?.ticket === 'string' ? body.gift.ticket : undefined
    const noGift = typeof body?.gift?.error === 'string' ? body.gift.error : undefined
    const face = check === 'id' && body?.face ? await stampText(body.face) : undefined
    return { signed: true, stamp: await stampText(body.stamp), ...(face && { face }), ...(ticket && { ticket }), ...(noGift && { noGift }) }
  }
  if (typeof body?.error === 'string' && status >= 400 && status < 500) return { signed: false, code: body.error, status }
  throw new Refused(SERVICE, status, body?.error ?? 'internal', check)
}

/** What the verifier keeps for a stamp number: its face stamp and each ID stamp, from its current keys, each as the Profiles folder keeps it but without its list of facts, which only the answer that signed it carries; and how many free face tries it has left. */
export type Back = { face: string | null; id: string[]; faceTriesLeft: number }

/** The stamps the verifier signed for this stamp number, asked back, and its free face tries left. A stamp not from the current key of its check is left out. */
export async function stampsBack(origin: string, stampNumber: bigint): Promise<Back> {
  const { status, body } = await call(SERVICE, `${origin}/stamp`, { stampNumber: stampNumber.toString() })
  if (status !== 200) throw new Refused(SERVICE, status, body?.error ?? 'internal')
  const back = async (check: Check, json: unknown): Promise<string | null> => {
    if (!json || typeof json !== 'object') return null
    const stamp = await stampText(json)
    return (await checkOfStamp(origin, stamp)) === check ? stamp : null
  }
  const ids = Array.isArray(body?.id) ? await Promise.all(body.id.map((s: unknown) => back('id', s))) : []
  const left = Number.isSafeInteger(body?.faceTriesLeft) ? (body.faceTriesLeft as number) : 0
  return { face: await back('face', body?.face), id: ids.filter((s): s is string => s !== null), faceTriesLeft: Math.max(0, left) }
}
