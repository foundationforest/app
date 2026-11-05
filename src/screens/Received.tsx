// A review, vouch or report about one of the person's profiles, opened from Notifications or its
// profile's Feedback, as the index counted it: which profile it is on and when, the score big, its
// text, then the market's review fields it holds, the listing it names (by its preview's first
// line, as the index keeps it, so even a deleted one shows) and who wrote it. Message them, or
// Report them, in red.

import { useProfiles, useRated } from '../hooks.ts'
import { kindWords, markets, pairOf } from '../markets.ts'
import { previewLines, valueText } from '../show.ts'
import { Named, SaidChip, Spinner, Top, ago } from '../ui.tsx'
import { fieldWords } from '../words.ts'
import { Who } from './Who.tsx'

type Props = { mine: string; at: string; onBack: () => void; onMessage: (writer: string) => void; onReport: (writer: string) => void }

export function Received({ mine, at, onBack, onMessage, onReport }: Props) {
  const me = useProfiles().find((p) => p.address === mine)
  const held = useRated(me ? [me] : [])[mine]
  if (!me) return null
  const pair = pairOf(me.label)
  const market = markets.market(pair.market)
  const rated = held && 'rated' in held ? held.rated : null
  const r = rated?.received.find((x) => x.address === at)
  const body = r?.body ?? {}
  const named = typeof body.listing === 'string' ? rated?.listings[body.listing] : undefined
  const rows: Array<[string, string]> = []
  if (r?.kind === 'review' && market?.review) {
    for (const [name, field] of Object.entries(market.review)) {
      const text = valueText(field, body[name])
      if (text) rows.push([fieldWords(name), text])
    }
  }
  if (named && market) rows.push([kindWords('listing', me.label), previewLines(market, named)[0] ?? ''])
  return (
    <main>
      <Top onBack={onBack} />
      {!held ? (
        <Spinner />
      ) : !r ? (
        <p className="line">{'failed' in held ? "Can't reach the index." : "This isn't counted any more."}</p>
      ) : (
        <>
          <p>
            On your <Named label={me.label} />
            {r.time !== undefined && ` · ${ago(r.time)}`}
          </p>
          {r.kind === 'review' ? <strong className="big">{typeof body.score === 'string' ? body.score : '–'} / 10</strong> : <SaidChip kind={r.kind} />}
          {typeof body.text === 'string' && <p className="said-text">{body.text}</p>}
          <dl className="facts">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div>
              <dt>From</dt>
              <dd>
                <Who address={r.writer} />
              </dd>
            </div>
          </dl>
          <div className="fill" />
          <div className="pair">
            <button onClick={() => onMessage(r.writer)}>Message</button>
            <button className="danger" onClick={() => onReport(r.writer)}>
              Report
            </button>
          </div>
        </>
      )}
    </main>
  )
}
