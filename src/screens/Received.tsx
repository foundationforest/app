// A review, vouch or report about one of the person's profiles, opened from its profile's Reviews, as
// the index counted it: which profile it is on and the day, the score big with its star, its text,
// then the market's review fields it holds, and the listing it names when it names one, in its About
// box (AboutListing.tsx): its photo, title and price, a tap opening it on the index, or No longer
// listed. Then From, who
// wrote it, as a row: their avatar, who they are to the person (the name they gave them, else their
// short key) with their badges, their market and role, their rating; a tap opens their
// profile (Them.tsx). At the foot, Message them and Review back, side by side, both outlined, Review
// back's star in the sun, and Report under them, in red.

import { useProfiles, useIndexed, useRated } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { askOf, markets, pairOf } from '../markets.ts'
import { answerText, ratingText } from '../show.ts'
import { Named, Rating, SaidChip, Top, day } from '../ui.tsx'
import { listingOf } from '../about.ts'
import { AboutBox } from './AboutListing.tsx'
import { Who, WhoAvatar } from './Who.tsx'

type Props = { mine: string; at: string; onBack: () => void; onMessage: (writer: string) => void; onReview: (writer: string) => void; onReport: (writer: string) => void; onWho: (writer: string) => void }

export function Received({ mine, at, onBack, onMessage, onReview, onReport, onWho }: Props) {
  const me = useProfiles().find((p) => p.address === mine)
  const held = useRated(me ? [me] : [])[mine]
  const rated = held && 'rated' in held ? held.rated : null
  const r = rated?.received.find((x) => x.address === at)
  const theirs = useIndexed(r?.writer ?? '')
  if (!me) return null
  const pair = pairOf(me.label)
  const market = markets.market(pair.market)
  const body = r?.body ?? {}
  // The listing it names, when it is the writer's or this profile's own: any other is left out.
  const about = r ? listingOf(body.listing, [r.writer, mine]) : undefined
  const rows: Array<[string, string]> = []
  if (r?.kind === 'review' && market?.review) {
    // The market's own fields of a review about this profile's role, by the words it asks them with:
    // a review's are picked by the role reviewed, whoever wrote it.
    for (const field of askOf(pair.market, pair.role, 'review', pair.role)) {
      if (!Object.hasOwn(market.review, field.name)) continue
      const text = answerText(field, body[field.name])
      if (text) rows.push([field.label, text])
    }
  }
  const writerRating = r && theirs && 'rated' in theirs ? theirs.rated.rating : null
  return (
    <main>
      <Top onBack={onBack} clear />
      {!held ? null : !r ? (
        <p className="line">{'failed' in held ? "Can't reach the index." : "This isn't counted any more."}</p>
      ) : (
        <>
          <p className="s">
            On your <Named label={me.label} />
            {r.time !== undefined && `, ${day(r.time)}`}
          </p>
          {r.kind === 'review' ? (
            <span className="score-big">
              <Icon name="star" fill />
              <span className="d">{typeof body.score === 'string' ? body.score : '–'}</span>
            </span>
          ) : (
            <SaidChip kind={r.kind} />
          )}
          {typeof body.text === 'string' && body.text && <p className="said-text big">{body.text}</p>}
          {rows.length > 0 && (
            <dl className="facts">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {about && <AboutBox address={about} />}
          <h2 className="sect">From</h2>
          <button className="whorow" onClick={() => onWho(r.writer)}>
            <WhoAvatar address={r.writer} />
            <Who address={r.writer} />
            {writerRating != null && <Rating value={ratingText(writerRating)} />}
          </button>
          <div className="fill" />
          <div className="foot">
            <div className="pair">
              <button onClick={() => onMessage(r.writer)}>
                <Icon name="chat-circle" />
                Message
              </button>
              <button onClick={() => onReview(r.writer)}>
                <Icon name="star" fill className="sun" />
                Review back
              </button>
            </div>
            <button className="danger" onClick={() => onReport(r.writer)}>
              <Icon name="flag" />
              Report
            </button>
          </div>
        </>
      )}
    </main>
  )
}
