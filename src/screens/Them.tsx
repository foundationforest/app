// Someone else's profile, opened by a tap on another profile wherever it shows: a conversation's
// header, a review's From, who a review is about, a notification, a reviewer of theirs. Back, and a
// quiet Not yours. Then its header as a profile of the person's has it: its avatar, large; its
// market, small, in its color; its role, big, with its badges; and under it who they are to the
// person, the name they gave them or else their short key, on a chip with a pencil that opens the
// naming sheet (NameSheet.tsx). Three numbers, as the index counts them: their rating and how many
// reviews; how many listings they list, in their side's word; how many reviews, vouches and reports
// they wrote. Message, which opens the conversation with them, or a new message; Review, from the
// person's profile on the other side of their market, or one line on why it can't be. Reviews they
// received, each its score, who wrote it, by name or key, and the day, and what they wrote. Then
// See everything on the index, their page there, in a new tab. Read from the host (who they are) and
// the index (what it counts), as the person's own ratings are; nothing kept, nothing unlocked.

import { type CSSProperties, useState } from 'react'

import { Avatar, colorOf } from '../avatar.tsx'
import { useIndexed, useNames, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { kindWords, marketWords, otherSide, roleWords } from '../markets.ts'
import { ratingText, reviewCount } from '../show.ts'
import { Badges, Line, type Note, Top, short } from '../ui.tsx'
import { NameSheet } from './NameSheet.tsx'
import { pageOf } from './Profile.tsx'
import { SaidCard } from './SaidCard.tsx'
import { labelOf, useWho } from './Who.tsx'

type Props = { address: string; onBack: () => void; onMessage: (to: string) => void; onReview: (mine: string, subject: string) => void; onWho: (address: string) => void }

/** How many of something, its word after: 1 request, 2 requests. */
const many = (n: number, word: string) => `${word}${n === 1 ? '' : 's'}`

export function Them({ address, onBack, onMessage, onReview, onWho }: Props) {
  const who = useWho(address)
  const held = useIndexed(address)
  const name = useNames()[address]
  const list = useProfiles()
  const [naming, setNaming] = useState(false)
  const [note, setNote] = useState<Note | null>(null)
  const rated = held && 'rated' in held ? held.rated : null
  const word = who ? kindWords('listing', labelOf(who)).toLowerCase() : 'listing'
  // The person's profile on the other side of their market, which a review of them is written from.
  const side = who ? otherSide(who.market, who.role)[0] : undefined
  const mine = who && side ? list.find((p) => p.label === `${who.market}/${side}`) : undefined
  const review = () => {
    if (mine) return onReview(mine.address, address)
    if (who && side) setNote({ text: `To review them, first make your ${marketWords(who.market)} ${side} profile.`, red: false })
  }
  return (
    <main className="them">
      <Top onBack={onBack} clear right={<span className="chip">Not yours</span>} />
      <div className="titled" style={who ? ({ '--h': colorOf(who.market) } as CSSProperties) : undefined}>
        {who ? <Avatar label={labelOf(who)} address={address} size="lg" /> : <span className="av lg blank" aria-hidden />}
        <div className="ph2">
          <h1>
            {who && <span className="mk">{marketWords(who.market)}</span>}{' '}
            {who && (
              <span className="rl">
                {roleWords(who.role)}
                <Badges checks={who.checks} big alone />
              </span>
            )}
          </h1>
          <button className={name ? 'idchip' : 'idchip key'} aria-label={`${name ?? short(address)}, name them`} onClick={() => setNaming(true)}>
            {name ?? short(address)}
            <Icon name="pencil-simple" />
          </button>
        </div>
      </div>
      {held && 'failed' in held && <p className="line">Can't reach the index.</p>}
      {rated && (
        <div className="stat3">
          <span>
            <span className="d">{rated.rating != null ? ratingText(rated.rating) : '–'}</span>
            <span className="xs">{rated.reviews > 0 ? reviewCount(rated.reviews) : 'No reviews'}</span>
          </span>
          <span>
            <span className="d">{rated.listed}</span>
            <span className="xs">{many(rated.listed, word)}</span>
          </span>
          <span>
            <span className="d">{rated.written}</span>
            <span className="xs">written</span>
          </span>
        </div>
      )}
      <div className="pair">
        <button className="primary" onClick={() => onMessage(address)}>
          <Icon name="chat-circle" fill />
          Message
        </button>
        <button disabled={!who} onClick={review}>
          <Icon name="star" />
          Review
        </button>
      </div>
      <Line note={note} />
      {rated && rated.received.length > 0 && (
        <>
          <h2 className="sect">Reviews they received</h2>
          <div className="cards">
            {rated.received.map((r) => (
              <SaidCard key={r.address} kind={r.kind} score={r.body.score} text={r.body.text} who={r.writer} {...(r.time !== undefined && { time: r.time })} dated onWho={() => onWho(r.writer)} />
            ))}
          </div>
        </>
      )}
      <a className="out" href={pageOf(address)} target="_blank" rel="noopener noreferrer">
        See everything on the index
        <Icon name="arrow-up-right" bold />
      </a>
      {naming && <NameSheet address={address} onClose={() => setNaming(false)} />}
    </main>
  )
}
