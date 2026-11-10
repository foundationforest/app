// A market's roles, on a sheet over its tile (NewProfile.tsx): the market's name, then one big row
// per role, its avatar as a profile of it shows (solid when it offers, light when it looks for),
// who the person is ("I'm a tutor") and what they do ("You offer"). A role the person has says
// "Yours", quietly, and a tap opens that profile; any other, a tap makes it. A row never shows the
// unlock icon.

import { Avatar } from '../avatar.tsx'
import type { Profile } from '../device.ts'
import { Icon } from '../icons.tsx'
import { type MarketRoles, doesWords, withArticle } from '../markets.ts'
import { Line, type Note, Sheet } from '../ui.tsx'

type Props = { market: MarketRoles; mine: Profile[]; note: Note | null; busy: boolean; onPick: (label: string) => void; onOpen: (address: string) => void; onClose: () => void }

export function RoleSheet({ market, mine, note, busy, onPick, onOpen, onClose }: Props) {
  return (
    <Sheet label={market.words} onClose={onClose}>
      <h2>{market.words}</h2>
      <Line note={note} />
      <div className="stack">
        {market.roles.map((p) => {
          const had = mine.find((q) => q.label === p.label)
          return (
            <button key={p.label} className="big-choice" disabled={busy} onClick={() => (had ? onOpen(had.address) : onPick(p.label))}>
              <Avatar label={p.label} />
              <span className="two">
                <strong>I'm {withArticle(p.role)}</strong>
                <span>{doesWords(p.offers)}</span>
              </span>
              {had ? <span className="aside">Yours</span> : <Icon name="caret-right" />}
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
