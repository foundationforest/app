// A listing as a card, on its profile's Offers or Requests: its first photo, from the host, on the
// left; its first line as its title and one quiet line under it (show.ts, cardLines), a place by the
// caption places gives it; its first price at the right, the amount in the titles' face (a request's
// as Up to), what it is for under it, and how many more it gives (+1 more). One of the person's own that no longer fits its market,
// which the index doesn't list, says Needs updating. A tap edits it.

import type { Body } from '@foundationforest/folders'

import { config } from '../config.ts'
import { photoUrl, photosIn } from '../flows/photos.ts'
import { useCaptions } from '../hooks.ts'
import type { Market } from '../markets.ts'
import { cardLines, isPlace, morePrices } from '../show.ts'

/** A listing's first photo: the first its market's file fields hold, in the order the market lists them. */
export function firstPhoto(market: Market, body: Body): string | undefined {
  for (const [name, field] of Object.entries(market.listing)) {
    const first = field.piece === 'photo' ? photosIn(body[name])[0] : undefined
    if (first) return first
  }
  return undefined
}

type Props = { market: Market; body: Body; request?: boolean; onClick: () => void; update?: boolean }

/** The places a listing holds, in any of its fields. */
export const placesIn = (market: Market, body: Body) =>
  Object.entries(market.listing).flatMap(([name, f]) => (f.piece === 'place' ? (Array.isArray(body[name]) ? (body[name] as unknown[]) : [body[name]]).filter(isPlace) : []))

export function ListingCard({ market, body, request = false, onClick, update }: Props) {
  const photo = firstPhoto(market, body)
  const caption = useCaptions(placesIn(market, body))
  const { title, line, price } = cardLines(market, body, { request, caption })
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
