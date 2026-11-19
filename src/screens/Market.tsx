// A market's page, from its tile on New profile (NewProfile.tsx), a page of its own in the tiles'
// place: Back, to the tiles; the market's icon, white on its color; its name; under it, for a beta
// market, one quiet line, Beta; then the market's own summary. Then each role as a card: its name,
// and at its right, where the person has it, the soft green Yours, a tap on the card opening that
// profile; else Create, strong green, which makes it: its plus, or, while a tap will ask the
// passkey, the unlock icon in its place.

import type { CSSProperties } from 'react'

import { MarketIcon, colorOf, iconOf } from '../avatar.tsx'
import type { Profile } from '../device.ts'
import { Icon } from '../icons.tsx'
import { type MarketRoles, roleWords } from '../markets.ts'
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
        <h1>{market.words}</h1>
        {market.beta && <p className="beta-line">Beta</p>}
        {market.summary && <p className="lead">{market.summary}</p>}
      </div>
      <Line note={note} />
      <div className="stack">
        {market.roles.map((p) => {
          const had = mine.find((q) => q.label === p.label)
          return had ? (
            <button key={p.label} className="big-choice" disabled={busy} aria-label={`${roleWords(p.role)} Yours`} onClick={() => onOpen(had.address)}>
              <strong className="grow">{roleWords(p.role)}</strong>
              <span className="yours">
                <Icon name="check" bold />
                Yours
              </span>
            </button>
          ) : (
            <div key={p.label} className="big-choice">
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
