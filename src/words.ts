// What the app says when something can't be done: one plain line, red when what was given is wrong,
// quiet when something is still missing or busy. Every code a service answers maps to one line here,
// from each one's own list (services' verifier/src/codes.ts and host/src/codes.ts, and the
// standard's CODES, which the host answers with), so no code ever reaches the screen. Any other
// error shows the one line `SOMETHING`.

/** An error the app says in its own words: `red` when what was given is wrong, else a quiet line. */
export class Said extends Error {
  readonly red: boolean
  constructor(text: string, red = false) {
    super(text)
    this.name = 'Said'
    this.red = red
  }
}

type Line = [text: string, red: boolean]

/** What the app says of an error it has no line for. */
export const SOMETHING = 'Something went wrong. Try again.'

const START_AGAIN = 'Start again.'
/** A check that did not pass, whatever Didit saw: one line for the check, by verifierSays, never by its code. */
const DIDNT_PASS: Line = ['{didnt}', false]
const VERIFIER_DOWN: Line = ["The verifier isn't working right now. Try again later.", false]
/** What the app says of a request it should never have made: a code the person can do nothing about. */
const OURS: Line = [SOMETHING, false]

/** Each verifier code. `{check}` is the check the person is on: the selfie check or the ID check. */
const VERIFIER: Record<string, Line> = {
  // 400: the app sent what the verifier does not take. Only the return address is the person's place.
  bad_return_url: ["The ID check can't be paid for from this address.", false],
  not_json: OURS,
  not_an_object: OURS,
  expected_empty_body: OURS,
  expected_exactly_returnUrl: OURS,
  expected_exactly_payment: OURS,
  expected_exactly_payment_and_returnUrl: OURS,
  expected_exactly_sessionId_and_stampNumber: OURS,
  expected_exactly_sessionId_and_stampNumber_and_payment: OURS,
  expected_exactly_stampNumber: OURS,
  bad_session_id: OURS,
  bad_stamp_number: OURS,
  bad_payment: OURS,
  // 402: no hold on the person's card for this check: held over a day ago, or held for another
  // check. (Never paid at all, back from Stripe's page: flows/verify.ts says nothing of it.)
  not_paid: ['{triesUsed}', false],
  // 403: the check does not count. All but not_approved end the session; every one the person can
  // try again after says one line, the same whatever Didit saw.
  not_approved: ['Not finished.', false],
  unknown_session: [`That check was lost. ${START_AGAIN}`, false],
  wrong_workflow: DIDNT_PASS,
  declined: DIDNT_PASS,
  expired: DIDNT_PASS,
  no_liveness: DIDNT_PASS,
  liveness_not_passed: DIDNT_PASS,
  no_face: DIDNT_PASS,
  no_document: DIDNT_PASS,
  document_not_passed: DIDNT_PASS,
  no_face_match: DIDNT_PASS,
  face_match_not_passed: DIDNT_PASS,
  no_document_data: DIDNT_PASS,
  // One ID stamp a person: this ID, and the face that goes with it, already gave one to another seed.
  duplicate_document: ['This ID is already verified with another passkey. Nothing was charged.', false],
  // A face Didit has seen verified before: the selfie check can't give this seed a stamp.
  face_seen: ['A similar face is already verified. Verify with your ID instead.', false],
  // 409
  session_used: [`That check was already used. ${START_AGAIN}`, false],
  // Its three tries opened, or its hold cancelled. One whose stamp was given is never said: the
  // stamp is asked back first (flows/verify.ts).
  payment_used: ['{triesUsed}', false],
  // 502, 503
  face_check_unavailable: ["The {check} isn't available right now. Try again in a minute.", false],
  payment_unavailable: ["Payment isn't available right now. Try again in a minute.", false],
  not_for_sale: ["The ID check isn't available yet.", false],
  // 404, 405, 413, 500, and what the app makes of an answer no verifier gives.
  not_found: VERIFIER_DOWN,
  post_only: VERIFIER_DOWN,
  get_only: VERIFIER_DOWN,
  too_large: VERIFIER_DOWN,
  internal: VERIFIER_DOWN,
  not_a_verifier: VERIFIER_DOWN,
  another_stamp_number: VERIFIER_DOWN,
}

/** A face seen before, while the ID check isn't for sale: nothing to point to yet. */
export const FACE_SEEN_NOT_FOR_SALE = 'A similar face is already verified. The ID check opens soon.'

/** The ID card's one quiet line while the verifier's payments are test payments, which charge nobody: Stripe's own test card. */
export const TEST_PAYMENTS = 'Test mode: pay with the card 4242 4242 4242 4242.'

/** What the app says when a payment ends with no stamp from it (its third try didn't pass, its tries used, or its hold over): nothing was charged. */
export const TRIES_USED = 'Your tries are used up. Nothing was charged. Pay again to continue.'

/** The codes the verifier answers that the app has its own line for. */
export const VERIFIER_CODES = Object.keys(VERIFIER)

/** The verifier's `code`, said for the check the person is on. A check that didn't pass offers the selfie's way on: the ID. */
export function verifierSays(code: string, check: 'face' | 'id' = 'face'): Said {
  const [text, red] = VERIFIER[code] ?? [SOMETHING, false]
  if (text === DIDNT_PASS[0]) return new Said(check === 'id' ? "That ID check didn't pass. Try again." : "That selfie didn't pass. Try again, or use your ID.")
  if (text === '{triesUsed}') return new Said(TRIES_USED)
  return new Said(text.replace('{check}', check === 'id' ? 'ID check' : 'selfie check'), red)
}

/** Each host refusal: of an entry or an inbox entry (the standard's codes and the host's), and of a credit route. */
const HOST_DOWN: Line = ["The host didn't take it. Try again.", false]
const HOST: Record<string, Line> = {
  // A folder's balance: the wallet tops it up first, so this is the wallet out of credits.
  refused: ['No credits left in your wallet.', false],
  not_paid: ['No credits left in your wallet.', false],
  no_inbox: ['This profile takes no messages.', false],
  future: ["Your device's clock is ahead. Set it right, then try again.", true],
  older: ['Something newer is there already. Try again.', false],
  size: ["That's too long.", true],
  too_big: ["That's too long.", true],
  // The standard's checks, which what the app signs always passes, and the host's own.
  canonical: HOST_DOWN,
  shape: HOST_DOWN,
  version: HOST_DOWN,
  key: HOST_DOWN,
  path: HOST_DOWN,
  time: HOST_DOWN,
  body: HOST_DOWN,
  profile: HOST_DOWN,
  files: HOST_DOWN,
  unlisted: HOST_DOWN,
  signature: HOST_DOWN,
  batch: HOST_DOWN,
  duplicate: HOST_DOWN,
  unnamed: HOST_DOWN,
  hash: HOST_DOWN,
  not_a_buy: HOST_DOWN,
  too_many: HOST_DOWN,
  bad_payment: HOST_DOWN,
  bad_request: HOST_DOWN,
  credit: HOST_DOWN,
  spent: HOST_DOWN,
  method: HOST_DOWN,
  invalid: HOST_DOWN,
  no_credits: HOST_DOWN,
  // The morning email's (host/src/email.ts, the Email screen). `unknown` is the email turned off
  // elsewhere: the flow shows it as Off and says nothing (flows/email.ts), so its line is never read.
  not_signed: HOST_DOWN,
  not_here: ["One of these profiles isn't on this host yet.", false],
  too_soon: ['Wait a minute, then send a new code.', false],
  code: ["That code isn't right, or it has expired. Send a new one.", false],
  unknown: HOST_DOWN,
  not_sent: ["The email didn't go out. Try again.", false],
  // A reader's, never a host's answer: what the app's own reading throws, which says SOMETHING (ui.tsx, noteOf).
  locked: OURS,
  to: OURS,
}

/** The codes the host and the standard's plug answer that the app has its own line for. */
export const HOST_CODES = Object.keys(HOST)

/** The host's `code`. */
export function hostSays(code: string): Said {
  const [text, red] = HOST[code] ?? HOST_DOWN
  return new Said(text, red)
}

/** A field's name in words: `groupSize` is Group size. */
export function fieldWords(name: string): string {
  const words = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** A field whose value runs backwards, as one red line: a span that ends before it starts, a range from more to less. */
export function turnedSays(name: string, field: { type: string }): Said {
  return new Said(field.type === 'moment' ? `${fieldWords(name)} ends before it starts.` : `${fieldWords(name)}: From is more than To.`, true)
}

/**
 * What checkEntry said (the markets' package, in its own words for a program), as one red line: the
 * field it names that does not fit, or the entry as a whole. `names` are the body's fields.
 */
export function entrySays(why: string, names: string[]): Said {
  const named = names.find((n) => why.startsWith(`${n} `) || why.endsWith(` ${n}`))
  return new Said(named ? `${fieldWords(named)} doesn't fit.` : "This doesn't fit the market.", true)
}
