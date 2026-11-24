// A profile's Reviews, from the rating pill on its page: what the index counted about it, reviews,
// vouches and reports together. At the top, Back and Reviews; then one line with the profile, its
// avatar small, its market and role, and at its right "You wrote 2 ›", an underlined link to the
// ones it wrote (Written.tsx), with the yellow ! while one needs updating; then the rating large with
// its star (or, with no score yet, what came: 1 vouch), and how many reviews. Then each a card: its
// score with its star, or its chip, when, and a dot on those that came after the newest its Reviews
// had shown of it, as the screen opened, those first, newest first, then the rest (order.ts); from
// now they are seen (device.ts), so the profile's mark and its rating count them new no more; who
// wrote it, right after its score, by the person's name for them or their short key; and what they
// wrote. A tap opens it (Received.tsx), whose From opens who wrote it. Nothing here asks the passkey.

import { useEffect, useState } from 'react'

import { Avatar } from '../avatar.tsx'
import { saveSeen, seen } from '../device.ts'
import { givenOf, newest } from '../flows/feedback.ts'
import { useEntries, useOutgrown, useProfiles, useRated, useSteady } from '../hooks.ts'
import { newFirst } from '../order.ts'
import { ratingText, reviewCount, saidCount } from '../show.ts'
import { Corner, Named, Rating, Top } from '../ui.tsx'
import { listingOf } from '../about.ts'
import { SaidCard } from './SaidCard.tsx'

type Props = { address: string; onBack: () => void; onOpen: (at: string) => void; onWritten: () => void }

export function Reviews({ address, onBack, onOpen, onWritten }: Props) {
  const me = useProfiles().find((p) => p.address === address)
  const mine = me ? [me] : []
  const held = useRated(mine)[address]
  const read = useEntries(mine)[address]
  const outgrown = useOutgrown(mine)[address] ?? []
  // The newest its Reviews had shown of this profile as the screen opened: what came after has its
  // dot while it is open. A profile with no mark yet is marked at what the index holds when first
  // read (flows/feedback.ts), so none is new.
  const [since] = useState(() => seen()[address] ?? Infinity)
  useEffect(() => {
    if (!held || !('rated' in held)) return
    const last = newest(held.rated)
    if (last > (seen()[address] ?? 0)) saveSeen({ [address]: last })
  }, [held])
  const rated = held && 'rated' in held ? held.rated : null
  const fresh = (r: { time?: number }) => (r.time ?? 0) > since
  const received = useSteady(
    newFirst(rated?.received ?? [], fresh, (r) => r.time ?? 0),
    (r) => r.address,
  )
  if (!me) return null
  const written = read && 'entries' in read ? givenOf(read.entries).length : 0
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Reviews</h1>
      </Top>
      <div className="of-line">
        <Avatar label={me.label} size="sm" />
        <Named label={me.label} />
        <span className="grow" />
        {written > 0 && (
          <button className="link" onClick={onWritten}>
            You wrote {written} ›
          </button>
        )}
        {outgrown.some((o) => o.kind !== 'listing') && <Corner mark="warn" />}
      </div>
      {!held ? null : !rated ? (
        <p className="line">Can't reach the index.</p>
      ) : (
        <>
          <div className="rated">
            {rated.rating != null ? <Rating value={ratingText(rated.rating)} /> : <strong className="d">{saidCount(rated.received) || 'No reviews yet'}</strong>}
            {rated.rating != null && <span>{reviewCount(rated.reviews)}</span>}
          </div>
          <div className="cards">
            {received.map((r) => (
              <SaidCard key={r.address} kind={r.kind} score={r.body.score} text={r.body.text} listing={listingOf(r.body.listing, [r.writer, address])} who={r.writer} {...(r.time !== undefined && { time: r.time })} fresh={fresh(r)} onClick={() => onOpen(r.address)} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
