// Your checks, from You: Back, and one card. First Face, for a face stamp, its badge, the black
// square, and nothing more: it doesn't open. Then each ID stamp, its badge and the document's own name
// (its facts' document_subtype when there is one, INE; else its kind, ID card: documents.ts), and a
// caret: it opens its page (IdPage.tsx). As the device keeps them from the Profiles folder (device.ts,
// `ids`), so nothing here asks the passkey. A check the person doesn't hold isn't listed: the dashed
// badges beside You open Get verified.

import { idName } from '../documents.ts'
import { useChecks, useIds } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { CHECK_ICON, Top } from '../ui.tsx'

type Props = { onBack: () => void; onId: (path: string) => void }

export function YourChecks({ onBack, onId }: Props) {
  const has = useChecks()
  const ids = useIds()
  // An ID check the device knows of before it read its stamp's facts: one row, ID.
  const idRows = has.has('id') ? (ids.length ? ids : [{}]) : []
  const badge = (icon: (typeof CHECK_ICON)['face']) => (
    <span className="sq sm ink">
      <Icon name={icon} fill />
    </span>
  )
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Your checks</h1>
      </Top>
      {has.size === 0 ? (
        <p className="line">Not yet</p>
      ) : (
        <div className="rows">
          {has.has('face') && (
            <div className="row">
              {badge(CHECK_ICON.face)}
              <strong className="grow">Face</strong>
            </div>
          )}
          {idRows.map((id, i) =>
            'path' in id && id.path ? (
              <button key={id.path} className="row" onClick={() => onId(id.path!)}>
                {badge(CHECK_ICON.id)}
                <strong className="grow">{idName(id)}</strong>
                <Icon name="caret-right" className="car" />
              </button>
            ) : (
              <div key={i} className="row">
                {badge(CHECK_ICON.id)}
                <strong className="grow">{idName(id)}</strong>
              </div>
            ),
          )}
        </div>
      )}
    </main>
  )
}
