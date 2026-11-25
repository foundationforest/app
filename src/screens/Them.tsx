// Someone else's profile, opened by a tap on another profile wherever it shows: a conversation's
// header, a review's From, a reviewer of theirs. Back, and a
// quiet Not yours. Then its header as a profile of the person's has it: its avatar, large; its
// market, small, in its color; its role, big, with its badges; and under it who they are to the
// person, the name they gave them or else their short key, on a chip with a pencil that opens the
// naming, in place under the header (Naming.tsx). Three numbers, as the index counts them: their rating and how many
// reviews; how many listings they list, in their side's word; how many reviews, vouches and reports
// they wrote. Message, which opens the conversation with them, or the writing screen; Review, outlined, from the
// person's profile on the other side of their market, or one line on why it can't be. Reviews they
// received, each its score, who wrote it, by name or key, and the day, and what they wrote. Then
// See everything on the index, their page there, in a new tab. Read from the host (who they are) and
// the index (what it counts), as the person's own ratings are; nothing kept, nothing unlocked. Its
// ··· (MoreMenu.tsx): Share profile, and Report, a sheet of two ways: Warn others, a report people
// will see on this profile, written from the person's profile on the other side; and Illegal
// content, an email to Forest's host, naming the profile's page on the index.

import { type CSSProperties, useState } from 'react'

import { Avatar, colorOf } from '../avatar.tsx'
import { useIndexed, useNames, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { kindWords, marketWords, otherSide, roleWords } from '../markets.ts'
import { ratingText, reviewCount } from '../show.ts'
import { config } from '../config.ts'
import { Sheet } from '../sheet.tsx'
import { Badges, Line, type Note, Top, short } from '../ui.tsx'
import { MoreMenu } from './MoreMenu.tsx'
import { Naming } from './Naming.tsx'
import { nameShown } from '../flows/names.ts'
import { pageOf } from './Profile.tsx'
import { listingOf } from '../about.ts'
import { SaidCard } from './SaidCard.tsx'
import { labelOf, useWho } from './Who.tsx'

type Props = { address: string; onBack: () => void; onMessage: (to: string) => void; onReview: (mine: string, subject: string) => void; onReport: (mine: string, subject: string) => void; onWho: (address: string) => void }

/** Illegal content: an email to Forest's host, its subject said, its body the profile's page on the index. */
export const illegalMail = (address: string) => `mailto:${config.contact}?subject=${encodeURIComponent('Illegal content')}&body=${encodeURIComponent(pageOf(address))}`

/** How many of something, its word after: 1 request, 2 requests. */
const many = (n: number, word: string) => `${word}${n === 1 ? '' : 's'}`

export function Them({ address, onBack, onMessage, onReview, onReport, onWho }: Props) {
  const [reporting, setReporting] = useState(false)
  const who = useWho(address)
  const held = useIndexed(address)
  const given = useNames()[address]
  const name = given && nameShown(given)
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
  const warn = () => {
    setReporting(false)
    if (mine) return onReport(mine.address, address)
    if (who && side) setNote({ text: `To report them, first make your ${marketWords(who.market)} ${side} profile.`, red: false })
  }
  return (
    <main className="them">
      <Top
        onBack={onBack}
        clear
        right={
          <>
            <span className="chip">Not yours</span>
            <MoreMenu url={pageOf(address)} items={[{ words: 'Report', onPick: () => setReporting(true) }]} />
          </>
        }
      />
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
          <button className={name ? 'idchip' : 'idchip key'} aria-label={`${name ?? short(address)}, name them`} aria-expanded={naming} onClick={() => setNaming(!naming)}>
            {name ?? short(address)}
            <Icon name="pencil-simple" />
          </button>
        </div>
      </div>
      {naming && <Naming address={address} onClose={() => setNaming(false)} />}
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
          <Icon name="star" fill className="sun" />
          Review
        </button>
      </div>
      <Line note={note} />
      {rated && rated.received.length > 0 && (
        <>
          <h2 className="sect">Reviews they received</h2>
          <div className="cards">
            {rated.received.map((r) => (
              <SaidCard key={r.address} kind={r.kind} score={r.body.score} text={r.body.text} listing={listingOf(r.body.listing, [r.writer, address])} who={r.writer} {...(r.time !== undefined && { time: r.time })} dated onWho={() => onWho(r.writer)} />
            ))}
          </div>
        </>
      )}
      <a className="out" href={pageOf(address)} target="_blank" rel="noopener noreferrer">
        See everything on the index
        <Icon name="arrow-up-right" bold />
      </a>
      {reporting && (
        <Sheet label="Report" onClose={() => setReporting(false)}>
          <h2>Report</h2>
          <div className="rows">
            <button type="button" className="row" onClick={warn}>
              <span className="two">
                <strong>Warn others</strong>
                <span>People will see it on this profile</span>
              </span>
              <Icon name="caret-right" className="car" />
            </button>
            <a className="row" href={illegalMail(address)} onClick={() => setReporting(false)}>
              <span className="two">
                <strong>Illegal content</strong>
                <span>Tell Forest's host by email</span>
              </span>
              <Icon name="arrow-up-right" bold />
            </a>
          </div>
        </Sheet>
      )}
    </main>
  )
}
