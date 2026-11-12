// What Get verified draws (Verify.tsx runs it): the two checks, each a card, and what the checks keep.
// A card: its icon square as its badge draws it (the mint, a face being scanned for the
// selfie, an ID card for the ID), its name and one line, and then, by where the check stands:
// - not done, a button: its price (Free; $5 with "one time" small under it, the two in one column of
//   one size), a chevron, and under a hairline what it gives, each with its tick: the selfie its
//   credits, the ID ten times them, stronger trust, and that the person is only charged if it
//   passes. A credit line shows only where the verifier gives credits at this host
//   (flows/verify.ts, `creditLines`). While the verifier's payments are test payments, the ID's one
//   quiet line more under them: Stripe's test card, so a tester knows what to pay with. No unlock
//   icon, though the ID's tap asks the passkey when no seed is held, as a row of ticks shows none;
// - done, the mint Verified chip alone, and no tap;
// - tried, one that can't help this person any more (a face seen before, an ID already used):
//   greyed, its name and line alone, and no tap.
// What the checks keep: under its link, in place, the consent screen the verifier serves (GET /),
// word for word, the one text it gives for its checks.

import type { Check } from '../device.ts'
import type { CreditLines } from '../flows/verify.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { Line, type Note } from '../ui.tsx'
import { TEST_PAYMENTS } from '../words.ts'

/** What paying for the ID check costs: nothing, unless its check passes. */
const CHARGED = "You're only charged if it passes."

const CARD = {
  face: { name: 'Selfie', what: 'A quick selfie', price: <span className="d">Free</span>, icon: 'scan-smiley' },
  id: {
    name: 'ID',
    what: 'Your ID and a selfie',
    price: (
      <>
        <span className="d">$5</span>
        <span className="once">one time</span>
      </>
    ),
    icon: 'identification-card',
  },
} as const

/** Where a check stands for this person: one to do, done, or one that can't help them any more. */
export type Standing = 'open' | 'done' | 'tried'

type CardProps = { check: Check; standing: Standing; credits: CreditLines | null; testPayments?: boolean; disabled: boolean; busy: boolean; onPick: () => void }

export function CheckCard({ check, standing, credits, testPayments = false, disabled, busy, onPick }: CardProps) {
  const { name, what, price, icon } = CARD[check]
  const head = (
    <span className="vhead">
      <span className="vico">
        <Icon name={icon} fill />
      </span>
      <span className="two">
        <strong>{name}</strong>
        <span>{what}</span>
      </span>
      {standing === 'done' && (
        <span className="donechip">
          <Icon name="check" bold />
          Verified
        </span>
      )}
      {standing === 'open' && (
        <>
          <span className="price3">{price}</span>
          {busy ? <Loader /> : <Icon name="caret-right" />}
        </>
      )}
    </span>
  )
  if (standing !== 'open')
    return (
      <div className={standing === 'tried' ? 'vcard tried' : 'vcard'} data-check={check} {...(standing === 'tried' && { 'aria-disabled': true })}>
        {head}
      </div>
    )
  const gives = (check === 'id' ? [credits?.id, 'Stronger trust', CHARGED] : [credits?.face]).filter((g): g is string => !!g)
  return (
    <button className="vcard" data-check={check} disabled={disabled} onClick={onPick}>
      {head}
      {gives.length > 0 && (
        <span className="vlist" role="list">
          {gives.map((g) => (
            <span key={g} role="listitem">
              <span className="got" aria-hidden>
                <Icon name="check" bold />
              </span>
              {g}
            </span>
          ))}
        </span>
      )}
      {check === 'id' && testPayments && <span className="vtest">{TEST_PAYMENTS}</span>}
    </button>
  )
}

type KeepsProps = { consent: string | null; note: Note | null }

/** What the checks keep, opened under its link: the verifier's words, as it serves them; the loader until they come, or one line when they can't. */
export function Keeps({ consent, note }: KeepsProps) {
  return (
    <section id="keeps" className="exp card keeps" aria-label="What the checks keep">
      {consent ? <p className="consent">{consent}</p> : note ? <Line note={note} /> : <Loader />}
    </section>
  )
}
