// A market's roles, on a sheet over its tile (NewProfile.tsx): the market's name, then one big row
// per role, its avatar as a profile of it shows (solid when it offers, light when it looks for) and
// the role's name, nothing else. A role the person has shows the check, in the forest green, and a
// tap on its row opens that profile; any other holds Create, which makes it: its plus, or, while a
// tap will ask the passkey, the unlock icon in its place.

import { Avatar } from '../avatar.tsx'
import type { Profile } from '../device.ts'
import { Icon } from '../icons.tsx'
import { type MarketRoles, roleWords } from '../markets.ts'
import { useHeld } from '../hooks.ts'
import { Line, type Note, Sheet, UnlockIcon } from '../ui.tsx'

type Props = { market: MarketRoles; mine: Profile[]; note: Note | null; busy: boolean; onPick: (label: string) => void; onOpen: (address: string) => void; onClose: () => void }

export function RoleSheet({ market, mine, note, busy, onPick, onOpen, onClose }: Props) {
  const held = useHeld()
  return (
    <Sheet label={market.words} onClose={onClose}>
      <h2>{market.words}</h2>
      <Line note={note} />
      <div className="stack">
        {market.roles.map((p) => {
          const had = mine.find((q) => q.label === p.label)
          return had ? (
            <button key={p.label} className="big-choice" disabled={busy} onClick={() => onOpen(had.address)}>
              <Avatar label={p.label} />
              <strong className="grow">{roleWords(p.role)}</strong>
              <span className="have" role="img" aria-label="Yours">
                <Icon name="check-circle" fill />
              </span>
            </button>
          ) : (
            <div key={p.label} className="big-choice">
              <Avatar label={p.label} />
              <strong className="grow">{roleWords(p.role)}</strong>
              <button className="create" disabled={busy} aria-label={`Create ${p.role}`} onClick={() => onPick(p.label)}>
                {held ? <Icon name="plus" bold /> : <UnlockIcon />}
                Create
              </button>
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}
