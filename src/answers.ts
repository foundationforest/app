// What a check came to, said in the box (screens/CheckBox.tsx): a yellow round !, a bold title, one
// line, and its buttons at the foot. Only the verifier's answer counts, by its code: Didit's own page
// may say a check passed that the verifier then refuses, so the box never shows Didit's result.
//
// - The face check: a face Didit has seen under another person (known_face), most likely theirs on
//   a new passkey: from setup, Use my other passkey first, which adds this passkey to the one they
//   use; a face estimated under the minimum (too_young); and any other refusal, or the free face
//   check used (face_tries_used): Too many failed tries. Each points to the ID check.
// - The ID check: an ID that couldn't be accepted, while its payment has a session left: Keep
//   trying, a new session, or Skip, which cancels the payment; on its last session, Too many failed
//   tries. A person Didit has seen (known_person): another passkey of theirs holds them; Delete this
//   passkey while this one holds no stamp. A birth date under 18 (too_young). None of these is
//   charged: the price is taken only for a stamp.
// - Either: something of the app's or a service's that went wrong (the network, a 5xx, a session the
//   verifier lost or that another workflow opened): Try again, the step again.
// - Expired, or a payment gone (not_paid, payment_used): no answer, back to Get verified, the ID
//   ready to pay.

import type { Check } from './device.ts'
import { NotPassed } from './flows/verify.ts'

/** What a button or a link in an answer does. */
export type Act = 'other-passkey' | 'verify-id' | 'keep-trying' | 'skip' | 'close' | 'delete-passkey' | 'try-again' | 'contact'

/** A button at an answer's foot: strong green (`primary`), outlined, or red. */
export type AnswerButton = { act: Act; words: string; look: 'primary' | 'outline' | 'danger' }

/** An answer in the box. */
export type Answer = { title: string; line: string; buttons: AnswerButton[]; link?: { act: Act; words: string } }

/** Where the box goes instead of an answer: back to Get verified. */
export type Back = 'back'

/** What the answer is drawn for: from setup; whether the ID check can be taken; whether this passkey holds a stamp already. */
export type For = { setup: boolean; idForSale: boolean; holdsStamp: boolean }

export const KNOWN_FACE = { title: 'Someone with a similar face is already verified', line: "If it's you, sign in with your other passkey. If not, verify with your ID." }
export const FACE_TOO_YOUNG = { title: "We couldn't confirm you're 18 or older", line: 'Try with your ID instead.' }
export const FACE_TRIES = { title: 'Too many failed tries', line: 'Verify with your ID instead.' }
export const ID_RETRY = { title: "We couldn't accept this ID", line: 'Try again, or with a different ID.' }
export const ID_TRIES = { title: 'Too many failed tries', line: "You weren't charged." }
export const KNOWN_PERSON = { title: "You're already verified with another passkey", line: "Sign in with it. You weren't charged." }
export const ID_TOO_YOUNG = { title: 'Forest is for people 18 and older', line: "You weren't charged." }
export const WENT_WRONG = { title: 'Something went wrong', line: "It wasn't you. Try again." }

/** The verifier's refusals of a check, Didit's decision as one code. */
const REFUSALS = new Set(['known_person', 'known_face', 'too_young', 'face_mismatch', 'id_unclear', 'face_unclear', 'other'])

/** The codes that end in Get verified with no answer: the session ran out, or the payment is gone. */
const BACK = new Set(['expired', 'not_paid', 'payment_used'])

const verifyId = (alone: boolean): AnswerButton => ({ act: 'verify-id', words: 'Verify with your ID', look: alone ? 'primary' : 'outline' })
const close: AnswerButton = { act: 'close', words: 'Close', look: 'primary' }

/** The face check's answers point to the ID check: where it can't be taken, Close. */
const toId = (f: For): AnswerButton[] => [f.idForSale ? verifyId(true) : close]

/** What `err`, thrown on `check`, comes to: an answer in the box, or back to Get verified. */
export function answerOf(err: unknown, check: Check, f: For): Answer | Back {
  if (!(err instanceof NotPassed)) return { ...WENT_WRONG, buttons: [{ act: 'try-again', words: 'Try again', look: 'primary' }] }
  const { code } = err
  if (check === 'face') {
    if (code === 'known_face') {
      const buttons: AnswerButton[] = [...(f.setup ? [{ act: 'other-passkey' as const, words: 'Use my other passkey', look: 'primary' as const }] : []), ...(f.idForSale ? [verifyId(!f.setup)] : f.setup ? [] : [close])]
      return { ...KNOWN_FACE, buttons }
    }
    if (code === 'too_young') return { ...FACE_TOO_YOUNG, buttons: toId(f) }
    if (REFUSALS.has(code) || code === 'face_tries_used') return { ...FACE_TRIES, buttons: toId(f) }
  } else {
    if (code === 'known_person') {
      return {
        ...KNOWN_PERSON,
        buttons: [f.holdsStamp ? close : { act: 'delete-passkey', words: 'Delete this passkey', look: 'danger' }],
        link: { act: 'contact', words: 'Lost your passkey? Contact us' },
      }
    }
    if (code === 'too_young') return { ...ID_TOO_YOUNG, buttons: [close] }
    if (REFUSALS.has(code)) {
      if (err.last) return { ...ID_TRIES, buttons: [close] }
      return { ...ID_RETRY, buttons: [{ act: 'keep-trying', words: 'Keep trying', look: 'primary' }], link: { act: 'skip', words: "Skip, you won't be charged" } }
    }
  }
  if (BACK.has(code)) return 'back'
  return { ...WENT_WRONG, buttons: [{ act: 'try-again', words: 'Try again', look: 'primary' }] }
}
