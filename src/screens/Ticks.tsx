// The person's profiles as checkboxes, each by its market and role (Tutoring / tutor): the connect
// page's and an AI app's. Where each tick asks the passkey, every row shows the unlock icon, and the
// one at work its spinner. A row that can't change (an AI app's last profile) is disabled.

import { pairOf } from '../markets.ts'
import { Spinner, TickBox, UnlockIcon } from '../ui.tsx'

type Props = { labels: string[]; ticked: Set<string>; onTick: (label: string) => void; disabled?: boolean; fixed?: string | null; unlock?: boolean; busy?: string | null }

export function Ticks({ labels, ticked, onTick, disabled = false, fixed = null, unlock = false, busy = null }: Props) {
  return (
    <div className="rows" role="group" aria-label="Profiles">
      {labels.map((label) => (
        <button key={label} role="checkbox" aria-checked={ticked.has(label)} className="row pick" disabled={disabled || label === fixed} onClick={() => onTick(label)}>
          <span>{pairOf(label).words}</span>
          <span className="aside">
            {busy === label ? (
              <Spinner />
            ) : (
              <>
                {unlock && <UnlockIcon />}
                <TickBox ticked={ticked.has(label)} />
              </>
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
