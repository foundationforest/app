// What Get verified draws (Verify.tsx runs it): the two checks, each a card that is one tap, and the
// ID check's sheet. A card: its icon square in its badge's colors (the selfie's a face on mint, the
// ID's an ID card on the forest green), its name and one line, its price, a chevron; under a
// hairline, what it gives, each with its tick. A credit line shows only where the verifier gives
// credits at this host (flows/verify.ts, `creditLines`). The sheet: ID check and its price, its
// three tries, What the check keeps, closed until tapped, then the consent screen the verifier
// serves (GET /), word for word, and Pay $5 only once those words have come.

import type { Check } from '../device.ts'
import type { CreditLines } from '../flows/verify.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { Line, type Note, Sheet } from '../ui.tsx'

/** While the verifier's Stripe key is a test one (a payment id `cs_test_…`), the card that pays: Stripe's test card. */
const TEST_CARD = 'Test mode: pay with the card 4242 4242 4242 4242.'

const CARD = {
  face: { name: 'Selfie', what: 'A quick selfie', price: 'Free', icon: 'smiley' },
  id: { name: 'ID', what: 'Your ID and a selfie', price: '$5', icon: 'identification-card' },
} as const

type CardProps = { check: Check; credits: CreditLines | null; off: boolean; busy: boolean; onPick: () => void }

export function CheckCard({ check, credits, off, busy, onPick }: CardProps) {
  const { name, what, price, icon } = CARD[check]
  const gives = (check === 'id' ? [credits?.id, 'Stronger trust', 'Supports Forest'] : [credits?.face]).filter((g): g is string => !!g)
  return (
    <button className="vcard" disabled={off} onClick={onPick}>
      <span className="vhead">
        <span className={check === 'id' ? 'vico id' : 'vico'}>
          <Icon name={icon} fill />
        </span>
        <span className="two">
          <strong>{name}</strong>
          <span>{what}</span>
        </span>
        <span className="price d">{price}</span>
        {busy ? <Loader /> : <Icon name="caret-right" />}
      </span>
      {gives.length > 0 && (
        <span className="vlist" role="list">
          {gives.map((g) => (
            <span key={g} role="listitem">
              <Icon name="check-circle" fill />
              {g}
            </span>
          ))}
        </span>
      )}
    </button>
  )
}

type SheetProps = { consent: string | null; note: Note | null; stripe: string | null; paying: boolean; onPay: () => void; onClose: () => void }

export function IdSheet({ consent, note, stripe, paying, onPay, onClose }: SheetProps) {
  return (
    <Sheet label="ID check" onClose={onClose}>
      <div className="sheet-head">
        <h2>ID check</h2>
        <span className="price d">$5</span>
      </div>
      <p>Up to three tries.</p>
      {consent && (
        <details className="keeps">
          <summary>
            What the check keeps
            <Icon name="caret-down" />
          </summary>
          <p className="consent">{consent}</p>
        </details>
      )}
      <Line note={note} />
      <div className="stack">
        {stripe ? (
          <>
            <p className="line">{TEST_CARD}</p>
            <a className="button primary" href={stripe}>
              Go to Stripe
            </a>
          </>
        ) : consent ? (
          <button className="primary" disabled={paying} onClick={onPay}>
            {paying ? <Loader /> : 'Pay $5'}
          </button>
        ) : (
          !note && (
            <button className="primary" disabled>
              <Loader />
            </button>
          )
        )}
      </div>
    </Sheet>
  )
}
