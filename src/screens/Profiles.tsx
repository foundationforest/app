// Profiles, the person's home: one card per profile, those that offer first. Its market and role,
// "Clothing / seller", and the shield when it is verified; a dot when something is new on it, a
// message or a review; then its posts in its role's word, the index's rating and how many reviews
// the index counted, each left out when there is none. Nothing here asks the passkey: the device
// keeps which profiles are the person's, and all a card shows is public.

import { useCards, useHeldRated, useNews, useProfiles } from '../hooks.ts'
import { Mark } from '../mark.tsx'
import { pairOf, pairs, postCount } from '../markets.ts'
import { ratingText, reviewCount } from '../show.ts'
import { Dot, type Place, Places, Shield, Top } from '../ui.tsx'

type Props = { onOpen: (address: string) => void; onNew: () => void; go: (to: Place) => void }

export function Profiles({ onOpen, onNew, go }: Props) {
  const list = useProfiles()
  const cards = useCards(list)
  const rated = useHeldRated(list)
  const news = useNews(list).of
  const shown = list.map((p) => ({ ...p, pair: pairOf(p.label) })).sort((a, b) => Number(b.pair.offers) - Number(a.pair.offers) || a.pair.words.localeCompare(b.pair.words))
  const held = new Set(list.map((p) => p.label))
  const unreached = list.some((p) => {
    const r = rated[p.address]
    return r && 'failed' in r
  })
  return (
    <main>
      <Top>
        <Mark />
      </Top>
      <div className="cards">
        {shown.map((p) => {
          const card = cards[p.address]
          const r = rated[p.address]
          const index = r && 'rated' in r ? r.rated : null
          const n = news[p.address]
          const line = [card?.posts ? postCount(card.posts, p.label) : '', index?.rating != null ? `★ ${ratingText(index.rating)}` : '', index?.reviews ? reviewCount(index.reviews) : ''].filter(Boolean)
          return (
            <button key={p.address} className="card" onClick={() => onOpen(p.address)}>
              <span className="card-head">
                <strong>{p.pair.words}</strong>
                {card?.checks.length ? <Shield /> : null}
                <span className="fill" />
                {n && (n.messages > 0 || n.received.length > 0) && <Dot />}
              </span>
              {line.length > 0 && <span className="card-line">{line.join(' · ')}</span>}
            </button>
          )
        })}
      </div>
      {unreached && <p className="line">Can't reach the index.</p>}
      <div className="fill" />
      {pairs.some((p) => !held.has(p.label)) && (
        <button className="primary" onClick={onNew}>
          New profile
        </button>
      )}
      <Places at="profiles" go={go} />
    </main>
  )
}
