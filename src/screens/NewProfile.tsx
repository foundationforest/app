// Your first profiles, in setup, or New profile, from Home (with a back arrow): one screen. Over the
// markets, a search over their whole names and their roles' words; then every market as a tile, live
// and beta alike, two to a row on a phone, on a laptop as many columns of about 170px as fit: its
// color filling it, its icon big and faint at the top right, cut by the tile's edge, its whole name in
// white at the bottom left, and a round mark at its top left: a + while none of its roles is the
// person's, a ✓ once one is, with the names of the roles they have small under the market's name. A
// tap opens the market's roles in a sheet (MarketSheet.tsx), where Create makes a profile and the sheet
// stays. In setup, Continue, strong green, at the foot, always, since profiles are optional: on to
// Connect your AI, or back to an AI app's login when one waits (App.tsx).

import { type CSSProperties, useState } from 'react'

import { MarketIcon, colorOf, iconOf } from '../avatar.tsx'
import { useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { marketList, roleWords } from '../markets.ts'
import { Top } from '../ui.tsx'
import { MarketSheet } from './MarketSheet.tsx'

type Props = {
  /** Your first profiles, in setup: Continue at the foot, and no back. */
  setup: boolean
  /** A role the person has: its profile. */
  onOpen: (address: string) => void
  onBack: () => void
  onContinue: () => void
}

export function NewProfile({ setup, onOpen, onBack, onContinue }: Props) {
  const list = useProfiles()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const market = marketList.find((m) => m.market === open)

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const shown = marketList.filter((m) => words.every((w) => [m.words, ...m.roles.map((p) => p.role)].join(' ').toLowerCase().includes(w)))
  return (
    <main className="new-profile">
      {setup ? (
        <h1>Your first profiles</h1>
      ) : (
        <>
          <Top onBack={onBack} />
          <h1>New profile</h1>
        </>
      )}
      <input type="search" aria-label="Search" placeholder="Search" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="market-tiles">
        {shown.map((m) => {
          const icon = iconOf(m.market)
          const mine = m.roles.filter((p) => list.some((q) => q.label === p.label))
          const label = [m.words, ...(m.beta ? ['beta'] : []), ...(mine.length ? [`yours: ${mine.map((p) => roleWords(p.role)).join(', ')}`] : [])].join(', ')
          return (
            <button key={m.market} className="market-tile" style={{ '--h': colorOf(m.market) } as CSSProperties} aria-label={label} onClick={() => setOpen(m.market)}>
              {icon ? <MarketIcon name={icon} /> : <span className="letter" aria-hidden>{m.words.charAt(0)}</span>}
              <span className={mine.length ? 'tile-mark yours' : 'tile-mark'} aria-hidden>
                <Icon name={mine.length ? 'check' : 'plus'} bold />
              </span>
              <span className="tile-name">
                {m.words}
                {mine.length > 0 && <span className="tile-roles">{mine.map((p) => roleWords(p.role)).join(', ')}</span>}
              </span>
            </button>
          )
        })}
      </div>
      {setup && (
        <>
          <div className="fill" />
          <div className="foot">
            <button className="primary" onClick={onContinue}>
              Continue
            </button>
          </div>
        </>
      )}
      {market && <MarketSheet market={market} mine={list} onOpen={onOpen} onClose={() => setOpen(null)} />}
    </main>
  )
}
