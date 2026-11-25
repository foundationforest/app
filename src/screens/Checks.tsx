// Get verified's two cards (Verify.tsx runs them), Face first, then Face + ID. A card: its badge (the
// black square: a face being scanned for the face check, an ID card for the ID), its name and one
// line, and then, by where the check stands:
// - to do: its price at the right, in ink (Free; the ID's price as the verifier says it, "$5", with
//   "one time" small under it, the two in one column of one size); under a hairline what it gives,
//   each with its tick: the face its credits; the ID so many times them, Higher trust and Supports
//   Forest. A credit line shows only where the verifier gives credits at this host (flows/verify.ts,
//   `creditLines`). While the verifier's payments are test payments, the ID's one quiet line more:
//   Stripe's test card, so a tester knows what to pay with. Then its button, strong green, the card's
//   whole width: Take a selfie, Verify with your ID, which opens the check's box. No unlock icon: the
//   card is the choice itself, and the box asks, where it must, on its own button;
// - done: shrunk to its badge and its name, with the soft green ✓ Verified at the right;
// - used, the face check whose one free try is gone, with no face stamp: greyed, its name alone.

import type { Check } from '../device.ts'
import type { CreditLines } from '../flows/verify.ts'
import { Icon } from '../icons.tsx'
import { TEST_PAYMENTS } from '../words.ts'

/** Each check as Get verified names it. */
export const CHECK_NAME: Record<Check, string> = { face: 'Face', id: 'Face + ID' }

const CARD = {
  face: { what: 'Quick start', icon: 'scan-smiley', act: 'Take a selfie' },
  id: { what: 'Have an official ID in hand', icon: 'identification-card', act: 'Verify with your ID' },
} as const

/** Where a check stands for this person: one to do, done, or used up. */
export type Standing = 'open' | 'done' | 'used'

type CardProps = { check: Check; standing: Standing; credits: CreditLines | null; price?: string; testPayments?: boolean; disabled: boolean; onPick: () => void }

export function CheckCard({ check, standing, credits, price, testPayments = false, disabled, onPick }: CardProps) {
  const { what, icon, act } = CARD[check]
  const name = CHECK_NAME[check]
  const head = (
    <span className="vhead">
      <span className="vico">
        <Icon name={icon} fill />
      </span>
      <span className="two">
        <strong>{name}</strong>
        {standing === 'open' && <span>{what}</span>}
      </span>
      {standing === 'done' && (
        <span className="donechip">
          <Icon name="check" bold />
          Verified
        </span>
      )}
      {standing === 'open' && (
        <span className="price3">
          {check === 'face' ? (
            <span className="d">Free</span>
          ) : (
            price && (
              <>
                <span className="d">{price}</span>
                <span className="once">one time</span>
              </>
            )
          )}
        </span>
      )}
    </span>
  )
  if (standing !== 'open')
    return (
      <div className={standing === 'used' ? 'vcard tried' : 'vcard done'} data-check={check} {...(standing === 'used' && { 'aria-disabled': true })}>
        {head}
      </div>
    )
  const gives = (check === 'id' ? [credits?.id, 'Higher trust', 'Supports Forest'] : [credits?.face]).filter((g): g is string => !!g)
  return (
    <div className="vcard" data-check={check}>
      {head}
      {gives.length > 0 && (
        <span className="vlist" role="list">
          {gives.map((g) => (
            <span key={g} role="listitem">
              <Icon name="check" bold />
              {g}
            </span>
          ))}
        </span>
      )}
      {check === 'id' && testPayments && <span className="vtest">{TEST_PAYMENTS}</span>}
      <button className="primary" disabled={disabled} onClick={onPick}>
        {act}
      </button>
    </div>
  )
}
