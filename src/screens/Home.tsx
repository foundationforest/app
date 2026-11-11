// Home, the person's profiles: on a phone, the mark and Search Forest at the top (on a laptop the
// search is in the sidebar); then Your profiles, with the person's badges beside it, once, since
// every profile of one person carries the same checks: a check done its badge (a tap says its
// words), one not done its badge's outline, dashed and muted, which starts it. Then one card per
// profile, in the app's order (order.ts): those with something new first, then the most recently
// used here. A card shows its market's avatar, with how many things are new on it (messages, and
// reviews, vouches and reports) in a small green count on its corner; its market in bold and its
// role muted under it, each line ending short when too long; and at its right the index's rating
// with its star over how many reviews it counted, or what came with no score yet (1 vouch), or No
// reviews. Every card is one height, rated or not, so a list never jumps as ratings come; on a
// laptop, as many columns of about 300px as fit. Then, while a market's role has no profile of
// theirs, New profile, a card of its own, dashed. Past eight profiles, a search over their names.
// Nothing on a card asks the passkey: the device keeps which profiles are the person's, and all a
// card shows is public. Above them, when the Profiles folder holds a profile made on another
// device, one row, New profiles from another device: one unlock reads them, and their cards show
// (flows/elsewhere.ts); a row, so it shows no unlock icon.

import { useState } from 'react'

import { Avatar } from '../avatar.tsx'
import { config } from '../config.ts'
import { type Check, passkey } from '../device.ts'
import { takeElsewhere } from '../flows/elsewhere.ts'
import { useWide } from '../frame.tsx'
import { useChecks, useElsewhere, useHeldRated, useNews, useOrdered, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader, Mark } from '../mark.tsx'
import { marketWords, pairs } from '../markets.ts'
import { MOST } from '../order.ts'
import { withSeed } from '../passkey.ts'
import { ratingText, reviewCount, saidCount } from '../show.ts'
import { Line, Rating, Search, Unverified, Verified, useAction } from '../ui.tsx'

type Props = { onOpen: (address: string) => void; onNew: () => void; onCheck: (check: Check) => void }

export function Home({ onOpen, onNew, onCheck }: Props) {
  const wide = useWide()
  const list = useProfiles()
  const shown = useOrdered(list)
  const has = useChecks()
  const rated = useHeldRated(list)
  const { of: news } = useNews(list)
  const [query, setQuery] = useState('')
  const held = new Set(list.map((p) => p.label))
  const unreached = list.some((p) => {
    const r = rated[p.address]
    return r && 'failed' in r
  })
  const elsewhere = useElsewhere()
  const take = useAction(async () => {
    await withSeed(passkey()!, (seed) => takeElsewhere(config, seed))
  })
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const found = list.length > MOST ? shown.filter((p) => words.every((w) => p.pair.words.toLowerCase().includes(w))) : shown
  return (
    <main className="home">
      {!wide && (
        <div className="top">
          <Mark size={30} />
          <Search />
        </div>
      )}
      <div className="titled">
        <h1>Your profiles</h1>
        <span className="badges" role="group" aria-label="How you're verified">
          {(['face', 'id'] as const).map((c) => (has.has(c) ? <Verified key={c} check={c} big alone /> : <Unverified key={c} check={c} onClick={() => onCheck(c)} />))}
        </span>
      </div>
      {list.length > MOST && <input type="search" aria-label="Search your profiles" placeholder="Search your profiles" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />}
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
        {found.map((p) => {
          const r = rated[p.address]
          const index = r && 'rated' in r ? r.rated : null
          const n = news[p.address]
          const fresh = n ? n.messages + n.received.length : 0
          return (
            <button key={p.address} className="card profile-card" onClick={() => onOpen(p.address)}>
              <span className="avwrap">
                <Avatar label={p.label} />
                {fresh > 0 && (
                  <span className="newpip" aria-label={`${fresh} new`}>
                    {fresh}
                  </span>
                )}
              </span>
              <span className="nm2">
                <strong>{marketWords(p.pair.market)}</strong> <span>{p.pair.role}</span>
              </span>
              <span className="rt2">
                {index && (index.rating != null ? (
                  <>
                    <Rating value={ratingText(index.rating)} />
                    <span className="xs">{reviewCount(index.reviews)}</span>
                  </>
                ) : (
                  <span className="xs">{index.received.length > 0 ? saidCount(index.received) : 'No reviews'}</span>
                ))}
              </span>
            </button>
          )
        })}
        {pairs.some((p) => !held.has(p.label)) && (
          <button className="addcard" onClick={onNew}>
            <Icon name="plus" bold />
            New profile
          </button>
        )}
      </div>
      {unreached && <p className="line">Can't reach the index.</p>}
    </main>
  )
}
