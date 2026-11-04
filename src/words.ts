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
const VERIFIER_DOWN: Line = ["The verifier isn't working right now. Try again later.", false]
/** What the app says of a request it should never have made: a code the person can do nothing about. */
const OURS: Line = [SOMETHING, false]

/** Each verifier code. `{check}` is the check the person is on: face or ID. */
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
  // 402
  not_paid: ['Not paid.', false],
  // 403: the check does not count. All but not_approved end the session.
  not_approved: ['Not finished.', false],
  unknown_session: [`That check was lost. ${START_AGAIN}`, false],
  wrong_workflow: [`That check was lost. ${START_AGAIN}`, false],
  declined: [`The check didn't pass. ${START_AGAIN}`, true],
  expired: [`The check ran out of time. ${START_AGAIN}`, false],
  no_liveness: [`The check couldn't see you live. ${START_AGAIN}`, true],
  liveness_not_passed: [`The check couldn't see you live. ${START_AGAIN}`, true],
  no_face: [`The check saw no face. ${START_AGAIN}`, true],
  no_document: [`Your ID couldn't be checked. ${START_AGAIN}`, true],
  document_not_passed: [`Your ID couldn't be checked. ${START_AGAIN}`, true],
  no_face_match: [`Your face didn't match your ID. ${START_AGAIN}`, true],
  face_match_not_passed: [`Your face didn't match your ID. ${START_AGAIN}`, true],
  no_document_data: [`Your ID's name or birth date couldn't be read. ${START_AGAIN}`, true],
  duplicate_document: ['This ID was already used to verify someone else.', true],
  // 409
  session_used: [`That check was already used. ${START_AGAIN}`, false],
  payment_used: ['This payment is used up. Pay again.', false],
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

/** The codes the verifier answers that the app has its own line for. */
export const VERIFIER_CODES = Object.keys(VERIFIER)

/** The verifier's `code`, said for the check the person is on. */
export function verifierSays(code: string, check: 'face' | 'id' = 'face'): Said {
  const [text, red] = VERIFIER[code] ?? [SOMETHING, false]
  return new Said(text.replace('{check}', check === 'id' ? 'ID check' : 'face check'), red)
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

/**
 * What checkEntry said (the markets' package, in its own words for a program), as one red line: the
 * field it names that does not fit, or the entry as a whole. `names` are the body's fields.
 */
export function entrySays(why: string, names: string[]): Said {
  const named = names.find((n) => why.startsWith(`${n} `) || why.endsWith(` ${n}`))
  return new Said(named ? `${fieldWords(named)} doesn't fit.` : "This doesn't fit the market.", true)
}
