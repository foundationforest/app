// A review, vouch or report about one of the person's profiles, opened from its profile's Reviews, as
// the index counted it: which profile it is on and the day, the score big with its star, its text,
// then the market's review fields it holds and the listing it names when another app named one (by
// its preview's first line, as the index keeps it, so even a deleted one shows, and of it only what
// still fits its market, a listing its market outgrew never breaking the screen). Then From, who
// wrote it, as a row: their avatar, who they are to the person (the name they gave them, else their
// short key) with their badges, their market and role, their rating, a chevron; a tap opens their
// profile (Them.tsx). At the foot, Message them and Review back, side by side, and Report under
// them, in red.

import { useProfiles, useIndexed, useRated } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { kindWords, markets, pairOf } from '../markets.ts'
import { fitting } from '../form.ts'
import { previewLines, ratingText, valueText } from '../show.ts'
import { Named, Rating, SaidChip, Top, day } from '../ui.tsx'
import { fieldWords } from '../words.ts'
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
  const named = typeof body.listing === 'string' ? rated?.listings[body.listing] : undefined
  const rows: Array<[string, string]> = []
  if (r?.kind === 'review' && market?.review) {
    for (const [name, field] of Object.entries(market.review)) {
      const text = valueText(field, body[name])
      if (text) rows.push([fieldWords(name), text])
    }
  }
  if (named && market) rows.push([kindWords('listing', me.label), previewLines(market, fitting(pair.market, pair.role, named))[0] ?? ''])
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
          <h2 className="sect">From</h2>
          <button className="whorow" onClick={() => onWho(r.writer)}>
            <WhoAvatar address={r.writer} />
            <Who address={r.writer} />
            {writerRating != null && <Rating value={ratingText(writerRating)} />}
            <Icon name="caret-right" className="car" />
          </button>
          <div className="fill" />
          <div className="foot">
            <div className="pair">
              <button onClick={() => onMessage(r.writer)}>
                <Icon name="chat-circle" />
                Message
              </button>
              <button className="soft" onClick={() => onReview(r.writer)}>
                <Icon name="star" bold />
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
