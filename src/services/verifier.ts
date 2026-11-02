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

/** A stamp as the Profiles folder keeps it: the standard's JSON of it, as text, checked as the standard reads it. The fields a verifier adds beside it (the ID check's name and birth date among them) are not kept. */
export async function stampText(json: unknown): Promise<string> {
  const { stampFromJson, stampToJson } = await stamps()
  return JSON.stringify(stampToJson(stampFromJson(json)))
}

const SERVICE = 'verifier'

/** The two checks: the face check, free, and the ID check, paid. */
export type Check = 'face' | 'id'

/** What the verifier says of itself in GET /: its name, its two keys, and its gifts, credits at one host. */
export type About = { name: string; face: { key: string }; id: { key: string }; gift?: { face: number; id: number; host: string; sponsor: string } }

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

/** The check a stamp is from, by the verifier's key that signed it. */
export async function checkOfStamp(origin: string, stamp: string): Promise<Check | null> {
  const [a, { stampFromJson }] = await Promise.all([about(origin), stamps()])
  const key = stampFromJson(JSON.parse(stamp)).verifier
  return key === a.face.key ? 'face' : key === a.id.key ? 'id' : null
}

/** A session that opened: its id, and the page the person does the check on. */
export type Session = { sessionId: string; url: string }

function sessionOf(status: number, body: any, check: Check): Session {
  if (status !== 201 || typeof body?.sessionId !== 'string' || typeof body?.url !== 'string') throw new Refused(SERVICE, status, body?.error ?? 'internal', check)
  return body
}

/** A face check: its session. `returnUrl` is where Didit sends the person after, on an app the verifier lists. */
export async function faceSession(origin: string, returnUrl?: string): Promise<Session> {
  const { status, body } = await call(SERVICE, `${origin}/face/session`, returnUrl ? { returnUrl } : {})
  return sessionOf(status, body, 'face')
}

/** The ID check's payment: its id (a Stripe Checkout Session's) and Stripe's page, which sends the person back to `returnUrl`, paid or not. */
export async function idPayment(origin: string, returnUrl: string): Promise<{ payment: string; url: string }> {
  const { status, body } = await call(SERVICE, `${origin}/id/payment`, { returnUrl })
  if (status !== 201 || typeof body?.payment !== 'string' || typeof body?.url !== 'string') throw new Refused(SERVICE, status, body?.error ?? 'internal', 'id')
  return body
}

/** An ID check: its session, for a paid payment with a try left. */
export async function idSession(origin: string, payment: string, returnUrl?: string): Promise<Session> {
  const { status, body } = await call(SERVICE, `${origin}/id/session`, { payment, ...(returnUrl && { returnUrl }) })
  return sessionOf(status, body, 'id')
}

/** What asking for the stamp came to: signed, with the gift's ticket or why none; held for review; or the verifier's no, with its code. */
export type Asked = { signed: true; stamp: string; ticket?: string; noGift?: string } | { signed: false; review: true } | { signed: false; review?: false; code: string; status: number }

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
    if (body?.stamp?.stampNumber !== ask.stampNumber.toString()) throw new Refused(SERVICE, status, 'another_stamp_number', check)
    const ticket = typeof body?.gift?.ticket === 'string' ? body.gift.ticket : undefined
    const noGift = typeof body?.gift?.error === 'string' ? body.gift.error : undefined
    return { signed: true, stamp: await stampText(body.stamp), ...(ticket && { ticket }), ...(noGift && { noGift }) }
  }
  if (status === 202) return { signed: false, review: true }
  if (typeof body?.error === 'string' && status >= 400 && status < 500) return { signed: false, code: body.error, status }
  throw new Refused(SERVICE, status, body?.error ?? 'internal', check)
}

/** The stamps the verifier signed for this stamp number, asked back, each as the Profiles folder keeps it, or null. */
export async function stampsBack(origin: string, stampNumber: bigint): Promise<Record<Check, string | null>> {
  const { status, body } = await call(SERVICE, `${origin}/stamp`, { stampNumber: stampNumber.toString() })
  if (status === 404) return { face: null, id: null }
  if (status !== 200) throw new Refused(SERVICE, status, body?.error ?? 'internal')
  return { face: body?.face ? await stampText(body.face) : null, id: body?.id ? await stampText(body.id) : null }
}

/** The stamp of `check` the verifier signed for this stamp number, asked back; null when it signed none. */
export async function stampBack(origin: string, stampNumber: bigint, check: Check): Promise<string | null> {
  return (await stampsBack(origin, stampNumber))[check]
}
