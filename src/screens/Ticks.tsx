// The person's profiles as checkboxes, each by its avatar and its market and role (Tutoring tutor),
// no badge, since every profile of one person carries the same checks: the connect page's and an AI
// app's. A row never shows the unlock icon, even where its tick asks the passkey; the one at work
// shows the loader. A row that can't change (an AI app's last profile) is disabled.

import { Avatar } from '../avatar.tsx'
import { useProfiles } from '../hooks.ts'
import { Loader } from '../mark.tsx'
import { Named, TickBox } from '../ui.tsx'

type Props = { labels: string[]; ticked: Set<string>; onTick: (label: string) => void; disabled?: boolean; fixed?: string | null; busy?: string | null }

export function Ticks({ labels, ticked, onTick, disabled = false, fixed = null, busy = null }: Props) {
  const list = useProfiles()
  return (
    <div className="rows" role="group" aria-label="Profiles">
      {labels.map((label) => (
        <button key={label} role="checkbox" aria-checked={ticked.has(label)} className="row pick" disabled={disabled || label === fixed} onClick={() => onTick(label)}>
          <Avatar label={label} {...withAddress(list, label)} size="sm" />
          <span className="who">
            <Named label={label} />
          </span>
          <span className="aside">{busy === label ? <Loader /> : <TickBox ticked={ticked.has(label)} />}</span>
        </button>
      ))}
    </div>
  )
}

/** The address of the person's profile of `label`, for its animal, when the device lists it. */
const withAddress = (list: Array<{ label: string; address: string }>, label: string) => {
  const address = list.find((p) => p.label === label)?.address
  return address ? { address } : {}
}
