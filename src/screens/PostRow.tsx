// A post as a row: its first photo, from the host, then two lines: its preview's first (the market's
// `preview` fields, those it holds), and its price when it has one, else its preview's next
// (show.ts, rowLines). On a profile, a tap edits it; in Review someone, a tap picks it.

import type { Body } from '@foundationforest/folders'

import { config } from '../config.ts'
import { photoUrl, photosIn } from '../flows/photos.ts'
import type { Market } from '../markets.ts'
import { rowLines } from '../show.ts'

/** A post's first photo: the first its market's file fields hold, in the order the market lists them. */
export function firstPhoto(market: Market, body: Body): string | undefined {
  for (const [name, field] of Object.entries(market.post)) {
    const first = field.type === 'file' ? photosIn(body[name])[0] : undefined
    if (first) return first
  }
  return undefined
}

type Props = { market: Market; body: Body; onClick: () => void; chosen?: boolean }

export function PostRow({ market, body, onClick, chosen }: Props) {
  const photo = firstPhoto(market, body)
  const lines = rowLines(market, body)
  return (
    <button type="button" className={chosen ? 'row post-row chosen' : 'row post-row'} {...(chosen !== undefined && { 'aria-pressed': chosen })} onClick={onClick}>
      {photo ? <img className="thumb" src={photoUrl(config.host, photo)} alt="" loading="lazy" /> : null}
      <span className="two">
        {lines.slice(0, 2).map((l, i) => (i === 0 ? <strong key={i}>{l}</strong> : <span key={i}>{l}</span>))}
      </span>
    </button>
  )
}
