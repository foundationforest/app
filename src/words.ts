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

const VERIFIER_DOWN: Line = ["The verifier isn't working right now. Try again later.", false]
/** What the app says of a request it should never have made: a code the person can do nothing about. */
const OURS: Line = [SOMETHING, false]
/** A check that did not count: its answer shows in the box (answers.ts); a line, where one is said, says only that. */
const DIDNT_COUNT: Line = ["That check didn't pass.", false]

/** Each verifier code (services' verifier/src/codes.ts), in one line where one shows outside the box. `{check}` is the check the person is on. */
const VERIFIER: Record<string, Line> = {
  // 400: the app sent what the verifier does not take.
  not_json: OURS,
  not_an_object: OURS,
  expected_exactly_stampNumber: OURS,
  expected_exactly_stampNumber_and_returnUrl: OURS,
  expected_exactly_payment: OURS,
  expected_exactly_payment_and_returnUrl: OURS,
  expected_exactly_sessionId_and_stampNumber: OURS,
  expected_exactly_sessionId_and_stampNumber_and_payment: OURS,
  bad_session_id: OURS,
  bad_stamp_number: OURS,
  bad_return_url: OURS,
  bad_payment: OURS,
  // 402: no hold on the person's card for this check: never paid, held over a day ago, or held for another.
  not_paid: ['Pay again to continue. Nothing was charged.', false],
  // 403: Didit's refusal, as one code, and a session not the verifier's to judge, or unfinished.
  known_person: DIDNT_COUNT,
  known_face: DIDNT_COUNT,
  too_young: DIDNT_COUNT,
  face_mismatch: DIDNT_COUNT,
  id_unclear: DIDNT_COUNT,
  face_unclear: DIDNT_COUNT,
  other: DIDNT_COUNT,
  unknown_session: OURS,
  wrong_workflow: OURS,
  expired: ['That check ran out of time. Start again.', false],
  not_approved: ['Not finished.', false],
  // 409
  session_used: OURS,
  payment_used: ['Pay again to continue. Nothing was charged.', false],
  face_tries_used: ['Your free face check is used. Verify with your ID.', false],
  // 404, 405, 413, 502, 503, 500, and what the app makes of an answer no verifier gives.
  not_found: VERIFIER_DOWN,
  post_only: VERIFIER_DOWN,
  get_only: VERIFIER_DOWN,
  too_large: VERIFIER_DOWN,
  face_check_unavailable: ["The {check} isn't available right now. Try again in a minute.", false],
  payment_unavailable: ["Payment isn't available right now. Try again in a minute.", false],
  not_for_sale: ["The ID check isn't available yet.", false],
  internal: VERIFIER_DOWN,
  not_a_verifier: VERIFIER_DOWN,
  another_stamp_number: VERIFIER_DOWN,
}

/** The ID card's one quiet line while the verifier's payments are test payments, which charge nobody: Stripe's own test card. */
export const TEST_PAYMENTS = 'Test mode: pay with the card 4242 4242 4242 4242.'

/** The codes the verifier answers that the app has its own line for. */
export const VERIFIER_CODES = Object.keys(VERIFIER)

/** Where a person's stamps all come from keys the verifier no longer signs with, Get verified's one line at the top. */
export const CHECK_AGAIN = 'Your earlier check no longer counts: the verifier changed its keys. Check again.'

/** A new profile, while no stamp of the person's counts: none is made. */
export const CHECK_FIRST = 'Get verified first: your earlier check no longer counts.'

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

/** A field whose answer runs backwards, as one red line, by its market's label: days that end before they start, a range from more to less. */
export function turnedSays(field: { label: string; piece: string }): Said {
  return new Said(field.piece === 'date' ? `${field.label} ends before it starts.` : `${field.label}: From is more than To.`, true)
}

/**
 * What checkEntry said (the markets' package, in its own words for a program), as one red line: the
 * field it names that does not fit, by its market's label, one its market has no more by its name in
 * words, or the entry as a whole. `fields` are the market's, as it asks them.
 */
export function entrySays(why: string, fields: Array<{ name: string; label: string }>): Said {
  const named = fields.find((f) => why.startsWith(`${f.name} `) || why.endsWith(` ${f.name}`))
  const gone = / has no field (\S+)$/.exec(why)?.[1]
  return new Said(named ? `${named.label} doesn't fit.` : gone ? `${fieldWords(gone)} doesn't fit.` : "This doesn't fit the market.", true)
}
