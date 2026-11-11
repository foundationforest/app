// A review, vouch or report as a card: its score with its star, or its chip; right after it the
// other profile, by the person's name for it or its short key and nothing else (its own page says
// the market); when, at the right, and a dot while it is new; then what they wrote. A tap on the
// card does what it is for (`onClick`: open it, edit it); a tap on who (`onWho`) opens their profile.
// With both, the card's tap sits under the name's, since a button holds no button.

import { Dot, SaidChip, ago, day } from '../ui.tsx'
import { NameOf } from './Who.tsx'

type Props = {
  kind: 'review' | 'vouch' | 'report'
  score: unknown
  text: unknown
  /** The other profile's address: who wrote it, or who it is about. */
  who: string
  time?: number
  /** When as a date (Nov 2), not how long ago. */
  dated?: boolean
  fresh?: boolean
  onClick?: () => void
  /** What a tap on the card does, in words, when the card's tap sits under the name's. */
  does?: string
  onWho?: () => void
}

export function SaidCard({ kind, score, text, who, time, dated = false, fresh = false, onClick, does = 'Open', onWho }: Props) {
  const head = (
    <span className="said-head">
      <SaidChip kind={kind} score={score} />
      {onWho ? (
        <button type="button" className="said-who" onClick={onWho}>
          <NameOf address={who} />
        </button>
      ) : (
        <NameOf address={who} />
      )}
      <span className="grow" />
      {time !== undefined && <span className="xs">{dated ? day(time) : ago(time)}</span>}
      {fresh && <Dot />}
    </span>
  )
  const body = typeof text === 'string' && text ? <span className="said-text">{text}</span> : null
  if (onClick && !onWho)
    return (
      <button className="card said-card" onClick={onClick}>
        {head}
        {body}
      </button>
    )
  return (
    <div className="card said-card">
      {onClick && <button type="button" className="said-open" aria-label={does} onClick={onClick} />}
      {head}
      {body}
    </div>
  )
}
