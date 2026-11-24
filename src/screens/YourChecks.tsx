// Your checks, from You: one row for each check the person holds, its badge, the black square, then
// its name and its line: the selfie, Verified; each ID stamp by its kind of document, its country
// and the year it runs out, from its facts (documents.ts: "ID card", "Mexico · until 2031"), as the
// device keeps them from the Profiles folder (device.ts, `ids`); an ID stamp kept without its list,
// just ID. Then each check they don't hold, its badge's outline, dashed, its name and its price at
// the right (Free, $5), a tap opening Get verified; the ID's only while the verifier sells it (GET
// /, `forSale`). Nothing here asks the passkey.

import type { Check } from '../device.ts'
import { idLine, idName } from '../documents.ts'
import { useChecks, useIdCheck, useIds } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { CHECK_ICON, Top } from '../ui.tsx'

/** What a check not held costs, as Get verified says it. */
const PRICE: Record<Check, string> = { face: 'Free', id: '$5' }

type Props = { onBack: () => void; onCheck: (check: Check) => void }

export function YourChecks({ onBack, onCheck }: Props) {
  const has = useChecks()
  const { forSale } = useIdCheck()
  const ids = useIds()
  // An ID check the device knows of before it read its stamp's facts: one row, ID.
  const idRows = has.has('id') ? (ids.length ? ids : [{}]) : []
  const missing = (['face', 'id'] as const).filter((c) => !has.has(c) && (c === 'face' || forSale))
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Your checks</h1>
      </Top>
      <div className="rows">
        {has.has('face') && (
          <div className="row">
            <span className="sq sm ink">
              <Icon name={CHECK_ICON.face} fill />
            </span>
            <span className="two">
              <strong>Selfie</strong>
              <span>Verified</span>
            </span>
          </div>
        )}
        {idRows.map((id, i) => (
          <div key={i} className="row">
            <span className="sq sm ink">
              <Icon name={CHECK_ICON.id} fill />
            </span>
            <span className="two">
              <strong>{idName(id)}</strong>
              {idLine(id) && <span>{idLine(id)}</span>}
            </span>
          </div>
        ))}
        {missing.map((c) => (
          <button key={c} className="row" onClick={() => onCheck(c)}>
            <span className="sq sm outline">
              <Icon name={CHECK_ICON[c]} />
            </span>
            <strong className="grow">{c === 'face' ? 'Selfie' : 'ID'}</strong>
            <span className="aside">{PRICE[c]}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
