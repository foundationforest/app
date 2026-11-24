// An offer or a request of the person's own as it shows among others: its picture, its first photo
// else its market's icon on its color, with its mark on the picture's corner (counts.ts: its
// conversations with something new, once the messages are opened, or the yellow ! when its market
// outgrew it); its title on one line, cut with "…" (show.ts, `titleOf`); and at its right its first
// price, with how many more it gives (+1 more), or, for one its market outgrew, "Needs updating" in yellow in its place. Three looks: a card
// on a profile's page on a phone, a tile in a profile's grid on a laptop, and a line under a
// profile's block on a laptop's Home. The whole of it opens it. Newest first, what is new or needs
// the person on top (order.ts).

import type { CSSProperties } from 'react'

import type { Body } from '@foundationforest/folders'

import { MarketIcon, colorOf, iconOf } from '../avatar.tsx'
import { config } from '../config.ts'
import { type Mark, marked } from '../counts.ts'
import type { Posted } from '../flows/entries.ts'
import { photoUrl, photosIn } from '../flows/photos.ts'
import type { Market } from '../markets.ts'
import { newFirst } from '../order.ts'
import { cardLines, morePrices } from '../show.ts'
import { Corner } from '../ui.tsx'

/** A listing's first photo: the first its market's file fields hold, in the order the market lists them. */
export function firstPhoto(market: Market, body: Body): string | undefined {
  for (const [name, field] of Object.entries(market.listing)) {
    const first = field.piece === 'photo' ? photosIn(body[name])[0] : undefined
    if (first) return first
  }
  return undefined
}

/** A listing's picture: its first photo, else its market's icon on its color, else a blank square. */
export function Thumb({ market, photo, big = false }: { market: string | null; photo?: string | undefined; big?: boolean }) {
  if (photo) return <img className={big ? 'thumb lg' : 'thumb'} src={photoUrl(config.host, photo)} alt="" loading="lazy" />
  const icon = market ? iconOf(market) : null
  return (
    <span className={big ? 'thumb lg mthumb' : 'thumb mthumb'} style={market ? ({ '--h': colorOf(market) } as CSSProperties) : undefined} aria-hidden>
      {icon ? <MarketIcon name={icon} /> : null}
    </span>
  )
}

/** What an offer shows of itself: its title, its first photo, and its first price as people say it, in its two parts. */
export function offerShown(market: Market, body: Body, request: boolean) {
  const { title, price } = cardLines(market, body, { request })
  return { title, photo: firstPhoto(market, body), price }
}

/** An offer's mark, and when it was last new (hooks.ts, `useOffers`). */
export type OfferMark = { mark: Mark; time: number }

/** A profile's offers in the order they show: what has a mark first, newest first; then the rest, newest first. */
export const offersInOrder = (listings: Posted[], marks: Record<string, OfferMark>): Posted[] =>
  newFirst(
    listings,
    (l) => marked(marks[l.path]?.mark ?? 0),
    (l) => marks[l.path]?.time ?? l.time,
  )

type Props = { market: Market; listing: Posted; request: boolean; mark: Mark; look?: 'card' | 'tile' | 'line'; onClick: () => void }

export function OfferCard({ market, listing, request, mark, look = 'card', onClick }: Props) {
  const { title, photo, price } = offerShown(market, listing.body, request)
  const update = mark === 'warn'
  return (
    <button type="button" className={`offer ${look}`} onClick={onClick}>
      <span className="offer-pic">
        <Thumb market={market.name} photo={photo} big={look === 'tile'} />
        <Corner mark={mark} />
      </span>
      <span className="offer-words">
        <strong className="offer-title">{title}</strong>
        {update ? (
          <span className="needs">Needs updating</span>
        ) : (
          price && (
            <span className="offer-price">
              <span className="d">{price.amount}</span>
              {price.per && <span className="xs"> {price.per}</span>}
              {price.more > 0 && <span className="xs more"> {morePrices(price.more)}</span>}
            </span>
          )
        )}
      </span>
    </button>
  )
}
