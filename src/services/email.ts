// The host's morning email routes (services' host/README.md, Email), asked as they are written
// there: a code sent to an email address, the code confirmed, the profiles it counts changed, and
// it turned off. What each profile signs for it is services' own (host/client/email.ts, used by
// flows/email.ts as it is). A refusal is the host's own code, said as words.ts says it (`Refused`,
// with the code kept, so a flow can tell `unknown`: the email was turned off elsewhere).

import { Refused, Unreachable, call } from './http.ts'

/** One profile as the host lists it: its address, and its main key's signature for the email address. */
export type Signed = { profile: string; sig: string }

/** An id the host makes: 16 random bytes in base64url. */
export const ID = /^[A-Za-z0-9_-]{22}$/

/** The id an answer holds, else the answer is a refusal, or not a host's. */
function idOf(answer: { status: number; body: any }): string {
  if (answer.status !== 200) throw new Refused('host', answer.status, typeof answer.body?.error === 'string' ? answer.body.error : String(answer.status))
  if (typeof answer.body?.id !== 'string' || !ID.test(answer.body.id)) throw new Unreachable('host')
  return answer.body.id
}

/** A code emailed to `email`, to count `profiles`: the id the code is confirmed with. */
export async function sendCode(host: string, email: string, timeZone: string, profiles: Signed[]): Promise<string> {
  return idOf(await call('host', `${host}/email`, { email, timeZone, profiles }))
}

/** The code the email address was sent, confirmed: it is on. Refused with `code` when it is wrong or has expired. */
export async function confirmCode(host: string, id: string, code: string): Promise<void> {
  idOf(await call('host', `${host}/email/confirm`, { id, code }))
}

/** The profiles it counts, and the time zone, changed with no code. Refused with `unknown` when it was turned off elsewhere. */
export async function changeProfiles(host: string, id: string, timeZone: string, profiles: Signed[]): Promise<void> {
  idOf(await call('host', `${host}/email/${id}`, { timeZone, profiles }))
}

/** It turned off, all of it deleted at the host. The host answers a page, whatever the id. */
export async function stopEmail(host: string, id: string): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${host}/email/stop/${id}`, { method: 'POST', redirect: 'error' })
  } catch {
    throw new Unreachable('host')
  }
  if (!res.ok) throw new Unreachable('host')
}
