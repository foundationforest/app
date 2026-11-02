// The verifier's routes the app calls (services' verifier/README.md, Its API): who it is and its
// gift, a face check's session, the stamp asked for that session, and a stamp asked back by its
// stamp number. Each is a POST with a JSON body, so nothing the person sends is in a URL.

import { lazy } from '../version.ts'
import { Refused, call } from './http.ts'

/**
 * The standard's stamp functions, loaded when a stamp is first read: they come with the proofs'
 * library, snarkjs and all, which the page needs for nothing else, so it stays out of the first load.
 */
export const stamps = () => lazy(() => import('@foundationforest/proofs'))

/** A stamp as the Profiles folder keeps it: the standard's JSON of it, as text, checked as the standard reads it. */
export async function stampText(json: unknown): Promise<string> {
  const { stampFromJson, stampToJson } = await stamps()
  return JSON.stringify(stampToJson(stampFromJson(json)))
}

const SERVICE = 'verifier'

/** What the verifier says of itself in GET /: its name, its two keys, and its gifts, credits at one host. */
export type About = { name: string; face: { key: string }; id: { key: string }; gift?: { face: number; id: number; host: string; sponsor: string } }

const known = new Map<string, Promise<About>>()

/** The verifier at `origin`, as it says it is: asked once a page. */
export function about(origin: string): Promise<About> {
  let got = known.get(origin)
  if (!got) {
    got = call(SERVICE, `${origin}/`).then(({ status, body }) => {
      if (status !== 200 || typeof body?.name !== 'string' || typeof body?.face?.key !== 'string') throw new Refused(SERVICE, status, body?.error ?? 'not_a_verifier')
      return body as About
    })
    got.catch(() => known.delete(origin))
    known.set(origin, got)
  }
  return got
}

/** A face check: its session, and the page the person does it on. `returnUrl` is where Didit sends them after, on an app the verifier lists. */
export async function session(origin: string, returnUrl?: string): Promise<{ sessionId: string; url: string }> {
  const { status, body } = await call(SERVICE, `${origin}/face/session`, returnUrl ? { returnUrl } : {})
  if (status !== 201 || typeof body?.sessionId !== 'string' || typeof body?.url !== 'string') throw new Refused(SERVICE, status, body?.error ?? 'no_session')
  return body
}

/** What asking for the stamp came to: signed, with the gift's ticket or why none; held for review; not finished (or declined: the verifier says the same); or no. */
export type Asked =
  | { signed: true; stamp: string; ticket?: string; noGift?: string }
  | { signed: false; why: 'review' | 'unfinished' | 'used' | 'unknown' }

/**
 * The stamp for the check `sessionId`, for this stamp number, and with `gift`, a buy's reference,
 * its gift's ticket. The stamp comes back as the Profiles folder keeps it: the standard's JSON of
 * it, as text (the reference app's `keep`).
 */
export async function askStamp(origin: string, sessionId: string, stampNumber: bigint, gift?: string): Promise<Asked> {
  const { status, body } = await call(SERVICE, `${origin}/face/stamp`, { sessionId, stampNumber: stampNumber.toString(), ...(gift && { gift }) })
  if (status === 200) {
    if (body?.stamp?.stampNumber !== stampNumber.toString()) throw new Refused(SERVICE, status, 'another_stamp_number')
    const ticket = typeof body?.gift?.ticket === 'string' ? body.gift.ticket : undefined
    const noGift = typeof body?.gift?.error === 'string' ? body.gift.error : undefined
    return { signed: true, stamp: await stampText(body.stamp), ...(ticket && { ticket }), ...(noGift && { noGift }) }
  }
  if (status === 202) return { signed: false, why: 'review' }
  if (status === 403 && body?.error === 'not_approved') return { signed: false, why: 'unfinished' }
  if (status === 409 && body?.error === 'session_used') return { signed: false, why: 'used' }
  if (status === 403 && body?.error === 'unknown_session') return { signed: false, why: 'unknown' }
  throw new Refused(SERVICE, status, body?.error ?? String(status))
}

/** The face stamp the verifier signed for this stamp number, asked back, as the Profiles folder keeps it; null when it signed none. */
export async function stampBack(origin: string, stampNumber: bigint): Promise<string | null> {
  const { status, body } = await call(SERVICE, `${origin}/stamp`, { stampNumber: stampNumber.toString() })
  if (status === 404) return null
  if (status !== 200) throw new Refused(SERVICE, status, body?.error ?? String(status))
  return body?.face ? stampText(body.face) : null
}
