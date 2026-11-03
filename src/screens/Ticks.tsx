// The person's profiles as checkboxes, each by its market and role (Tutoring tutor) and the shield
// of its strongest check, read from its card: the connect page's and an AI app's. A row never shows the unlock icon, even where its tick asks the passkey;
// the one at work shows its spinner. A row that can't change (an AI app's last profile) is disabled.

import { strongest } from '../flows/cards.ts'
import { useCards, useProfiles } from '../hooks.ts'
import { Named, Spinner, TickBox, Verified } from '../ui.tsx'

type Props = { labels: string[]; ticked: Set<string>; onTick: (label: string) => void; disabled?: boolean; fixed?: string | null; busy?: string | null }

export function Ticks({ labels, ticked, onTick, disabled = false, fixed = null, busy = null }: Props) {
  const list = useProfiles()
  const cards = useCards(list)
  const checkOf = (label: string) => {
    const card = cards[list.find((p) => p.label === label)?.address ?? '']
    return card ? strongest(card.checks) : null
  }
  return (
    <div className="rows" role="group" aria-label="Profiles">
      {labels.map((label) => (
        <button key={label} role="checkbox" aria-checked={ticked.has(label)} className="row pick" disabled={disabled || label === fixed} onClick={() => onTick(label)}>
          <span className="who">
            <Named label={label} />
            {checkOf(label) && <Verified check={checkOf(label)!} />}
          </span>
          <span className="aside">{busy === label ? <Spinner /> : <TickBox ticked={ticked.has(label)} />}</span>
        </button>
      ))}
    </div>
  )
}
