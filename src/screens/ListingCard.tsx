// A listing as a card, on its profile's Offers or Requests: its first photo, from the host, on the
// left; its first line as its title and one quiet line under it (show.ts, cardLines); its first price
// at the right, the amount in the titles' face, what it is for under it, and how many more it gives
// (+1 more), as the index's cards show it. One of the person's own that no longer fits its market,
// which the index doesn't list, says Needs updating. A tap edits it.

import type { Body } from '@foundationforest/folders'

import { config } from '../config.ts'
import { photoUrl, photosIn } from '../flows/photos.ts'
import type { Market } from '../markets.ts'
import { cardLines, morePrices } from '../show.ts'

/** A listing's first photo: the first its market's file fields hold, in the order the market lists them. */
export function firstPhoto(market: Market, body: Body): string | undefined {
  for (const [name, field] of Object.entries(market.listing)) {
    const first = field.type === 'file' ? photosIn(body[name])[0] : undefined
    if (first) return first
  }
  return undefined
}

type Props = { market: Market; body: Body; onClick: () => void; update?: boolean }

export function ListingCard({ market, body, onClick, update }: Props) {
  const photo = firstPhoto(market, body)
  const { title, line, price } = cardLines(market, body)
  return (
    <button type="button" className="card listing-card" onClick={onClick}>
      {photo ? <img className="thumb" src={photoUrl(config.host, photo)} alt="" loading="lazy" /> : null}
      <span className="two">
        <strong>{title}</strong>
        {line && <span>{line}</span>}
        {update && <span className="chip warn">Needs updating</span>}
      </span>
      {price && (
        <span className="price-col">
          <span className="d">{price.amount}</span>
          {price.per && <span className="xs">{price.per}</span>}
          {price.more > 0 && <span className="xs more">{morePrices(price.more)}</span>}
        </span>
      )}
    </button>
  )
}
