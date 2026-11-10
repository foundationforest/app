// Home, the person's profiles: on a phone, the mark and Search Forest at the top (on a laptop the
// search is in the sidebar); then Your profiles, with New while a market's role has no profile of
// theirs, and one card per profile, those that offer first. A card shows its market's avatar, its
// market and role, "Clothing seller" (the market in bold, the role muted), and the badge of its
// strongest check; the index's rating with its star and how many reviews it counted, left out when
// there is none; and how many things are new on it (messages, and reviews, vouches and reports),
// else a chevron. Nothing on a card asks the passkey: the device keeps which profiles are the
// person's, and all a card shows is public. Above them, when the Profiles folder holds a profile
// made on another device, one row, New profiles from another device: one unlock reads them, and
// their cards show (flows/elsewhere.ts); a row, so it shows no unlock icon.

import { Avatar } from '../avatar.tsx'
import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { strongest } from '../flows/cards.ts'
import { takeElsewhere } from '../flows/elsewhere.ts'
import { useWide } from '../frame.tsx'
import { useCards, useElsewhere, useHeldRated, useNews, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader, Mark } from '../mark.tsx'
import { offersFirst, pairs } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { ratingText, reviewCount } from '../show.ts'
import { Line, Named, Rating, Search, Verified, useAction } from '../ui.tsx'

type Props = { onOpen: (address: string) => void; onNew: () => void }

export function Home({ onOpen, onNew }: Props) {
  const wide = useWide()
  const list = useProfiles()
  const cards = useCards(list)
  const rated = useHeldRated(list)
  const { of: news } = useNews(list)
  const held = new Set(list.map((p) => p.label))
  const unreached = list.some((p) => {
    const r = rated[p.address]
    return r && 'failed' in r
  })
  const elsewhere = useElsewhere()
  const take = useAction(async () => {
    await withSeed(passkey()!, (seed) => takeElsewhere(config, seed))
  })
  return (
    <main className="home">
      {!wide && (
        <div className="top">
          <Mark size={30} />
          <Search />
        </div>
      )}
      <div className="titled">
        <h1 className="fill">Your profiles</h1>
        {pairs.some((p) => !held.has(p.label)) && (
          <button className="soft small" aria-label="New profile" onClick={onNew}>
            <Icon name="plus" bold />
            New
          </button>
        )}
      </div>
      {elsewhere && (
        <div className="rows">
          <button className="row" disabled={take.busy} onClick={() => take.run()}>
            <span>New profiles from another device</span>
            {take.busy && <Loader />}
          </button>
        </div>
      )}
      <Line note={take.note} />
      <div className="cards">
        {offersFirst(list).map((p) => {
          const card = cards[p.address]
          const r = rated[p.address]
          const index = r && 'rated' in r ? r.rated : null
          const n = news[p.address]
          const fresh = n ? n.messages + n.received.length : 0
          const check = card ? strongest(card.checks) : null
          return (
            <button key={p.address} className="card" onClick={() => onOpen(p.address)}>
              <Avatar label={p.label} />
              <span className="two">
                <span className="who">
                  <Named label={p.label} />
                  {check && <Verified check={check} />}
                </span>
                {(index?.rating != null || !!index?.reviews) && (
                  <span className="card-line">
                    {index?.rating != null && <Rating value={ratingText(index.rating)} />}
                    {!!index?.reviews && <span>{reviewCount(index.reviews)}</span>}
                  </span>
                )}
              </span>
              {fresh > 0 ? <span className="chip new">{fresh} new</span> : <Icon name="caret-right" className="car" />}
            </button>
          )
        })}
      </div>
      {unreached && <p className="line">Can't reach the index.</p>}
    </main>
  )
}
