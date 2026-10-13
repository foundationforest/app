// The issuer, as the app talks to it: who it is, a face check's session (Didit sends the person back
// to the app's return address), and the note it signs for the person's note number. Ported from
// services e2e (readIssuer, faceNote, keepNote). The ID check comes later.

import { hex } from '@scure/base'

import { type NoteJson, type SignedNote, noteFromJson, noteSigned, noteToJson } from '../../standard/registry/client/src/person.ts'
import { issuerKeyBytes } from '../../standard/registry/client/src/program.ts'
import { getJson, postJson } from './http.ts'

/** Who an issuer is, as its /issuer.json says: its name, which the person's secret for it is mixed under, and its key. */
export type Issuer = { origin: string; name: string; key: string }

export async function readIssuer(origin: string): Promise<Issuer> {
  const body = await getJson(`${origin}/issuer.json`)
  if (typeof body?.name !== 'string' || !body.name) throw new Error(`${origin} names no issuer`)
  if (typeof body.key !== 'string' || !/^[0-9a-f]{128}$/.test(body.key)) throw new Error(`${origin} gives no issuer key`)
  return { origin, name: body.name, key: body.key }
}

/** A face check: its session, and the page where the person takes it. Didit sends them to `returnUrl` when done. */
export async function session(issuer: Issuer, returnUrl?: string): Promise<{ sessionId: string; url: string }> {
  const body = await postJson(`${issuer.origin}/session`, returnUrl === undefined ? {} : { returnUrl })
  if (typeof body?.sessionId !== 'string' || typeof body.url !== 'string') throw new Error('the issuer gave no session')
  return { sessionId: body.sessionId, url: body.url }
}

/**
 * The note, once the check passed: asked for the person's note number, and checked before it is
 * kept: the issuer signed it, with the key it publishes, for this note number. `json` is how the
 * vault keeps it, written again by the registry client rather than as the issuer spelled it.
 */
export async function note(issuer: Issuer, sessionId: string, noteNumber: bigint): Promise<{ note: SignedNote; json: NoteJson }> {
  const body = await postJson(`${issuer.origin}/note`, { sessionId, noteNumber: noteNumber.toString() })
  const signed = noteFromJson(body?.note)
  if (!noteSigned(signed)) throw new Error('the issuer did not sign this note')
  if (hex.encode(issuerKeyBytes(signed.issuer)) !== issuer.key) throw new Error('this note is signed by another key than the issuer publishes')
  if (signed.noteNumber !== noteNumber) throw new Error('this note is for another note number')
  return { note: signed, json: noteToJson(signed) }
}
