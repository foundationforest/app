// A market's page, from its tile on New profile (NewProfile.tsx), a page of its own in the tiles'
// place: Back, to the tiles; the market's icon, on a tint of its color as its tile has it; its name,
// with a small Beta chip after it for a beta market; one quiet line under it, the market's own
// summary; and for a beta market one more (BETA, said once where a profile is made); then one big
// row per role, its avatar as a profile of it shows (solid when it offers, light when it looks for)
// and the role's name, nothing else. A role the person has shows the check, and a tap on its row
// opens that profile; any other holds Create, which makes it: its plus, or, while a tap will ask the
// passkey, the unlock icon in its place.

import type { CSSProperties } from 'react'

import { Avatar, MarketIcon, colorOf, iconOf } from '../avatar.tsx'
import type { Profile } from '../device.ts'
import { Icon } from '../icons.tsx'
import { BETA, type MarketRoles, roleWords } from '../markets.ts'
import { useHeld } from '../hooks.ts'
import { Line, type Note, Top, UnlockIcon } from '../ui.tsx'

type Props = { market: MarketRoles; mine: Profile[]; note: Note | null; busy: boolean; onPick: (label: string) => void; onOpen: (address: string) => void; onBack: () => void }

export function Market({ market, mine, note, busy, onPick, onOpen, onBack }: Props) {
  const held = useHeld()
  const icon = iconOf(market.market)
  return (
    <main className="market-page">
      <Top onBack={onBack} clear />
      <span className="market-icon" style={{ '--h': colorOf(market.market) } as CSSProperties} aria-hidden>
        {icon ? <MarketIcon name={icon} /> : <span className="letter">{market.words.charAt(0)}</span>}
      </span>
      <div className="stack">
        {market.beta ? (
          <h1 className="with-chip">
            {market.words}
            <span className="chip beta">Beta</span>
          </h1>
        ) : (
          <h1>{market.words}</h1>
        )}
        {market.summary && <p className="lead">{market.summary}</p>}
        {market.beta && <p className="hint">{BETA}</p>}
      </div>
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
    </main>
  )
}
