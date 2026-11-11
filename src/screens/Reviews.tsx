// A profile's Reviews, from the rating under its name or from Notifications: what the index counted
// about it, reviews, vouches and reports together, newest first. At the top, the rating large with
// its star (or, with no score yet, what came: 1 vouch), how many reviews, and quietly which index
// rated it. Then each a card: its score with its star, or its chip, when, and a dot on those that
// came after the newest its Reviews or Notifications had shown of it, as the screen opened; from now
// they are seen (device.ts), so the profile's card and its rating count them new no more; who wrote
// it, right after its score, by the person's name for them or their short key; and what they wrote.
// A tap opens it (Received.tsx), whose From opens who wrote it. Nothing here asks the passkey.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { saveSeen, seen } from '../device.ts'
import { newest } from '../flows/feedback.ts'
import { useProfiles, useRated } from '../hooks.ts'
import { ratingText, reviewCount, saidCount } from '../show.ts'
import { Named, Rating, Top } from '../ui.tsx'
import { SaidCard } from './SaidCard.tsx'

type Props = { address: string; onBack: () => void; onOpen: (at: string) => void }

export function Reviews({ address, onBack, onOpen }: Props) {
  const me = useProfiles().find((p) => p.address === address)
  const held = useRated(me ? [me] : [])[address]
  // The newest its Reviews had shown of this profile as the screen opened: what came after has its
  // dot while it is open. A profile with no mark yet is marked at what the index holds when first
  // read (flows/feedback.ts), so none is new.
  const [since] = useState(() => seen()[address] ?? Infinity)
  useEffect(() => {
    if (!held || !('rated' in held)) return
    const last = newest(held.rated)
    if (last > (seen()[address] ?? 0)) saveSeen({ [address]: last })
  }, [held])
  if (!me) return null
  const rated = held && 'rated' in held ? held.rated : null
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Reviews</h1>
      </Top>
      <p className="s">
        Of your <Named label={me.label} />
      </p>
      {!held ? null : !rated ? (
        <p className="line">Can't reach the index.</p>
      ) : (
        <>
          <div className="rated">
            {rated.rating != null ? <Rating value={ratingText(rated.rating)} /> : <strong className="d">{saidCount(rated.received) || 'No reviews yet'}</strong>}
            {rated.rating != null && <span>{reviewCount(rated.reviews)}</span>}
            <span className="xs">Rated by {new URL(config.index).host}</span>
          </div>
          <div className="cards">
            {rated.received.map((r) => (
              <SaidCard key={r.address} kind={r.kind} score={r.body.score} text={r.body.text} who={r.writer} {...(r.time !== undefined && { time: r.time })} fresh={(r.time ?? 0) > since} onClick={() => onOpen(r.address)} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
