// A profile of the person's, opened from its card. Its header, on a light tint of its market's color
// with its bottom corners rounded: Back on the left; on the right, round, its messages, with its
// conversations' mark (counts.ts), which opens Messages on its chip, then Share. Share hands out the
// profile's page on the index: the phone's share sheet where there is one, else the page's link
// copied, the button saying so for a moment. A link, not a fetch: nothing here reaches the index for
// it. Then its avatar, large; its market, big, in the titles' face; its role, small, with the badges
// of its checks after it; and what the index says, a pill with its star, its score and how many
// reviews it counted, or, with no score yet, what came (1 vouch), or No reviews yet, which opens its
// Reviews (Reviews.tsx), saying "1 new", up to "9+ new", while something it received is new, and the
// yellow ! while a review it wrote needs updating.
// Then its offers (or requests, as its role posts), what is new or needs the person first, newest
// first, then the rest (order.ts): on a phone each its own card, with gaps between, on a laptop a grid
// of photo tiles (Offers.tsx), each with its mark on its picture's corner, a tap opening its page
// (Offer.tsx); No offers yet, quiet, in the middle, with none. New offer, strong green, the screen's
// one main action: at the foot on a phone, beside the Offers heading on a laptop. Nothing here asks
// the passkey: its folder is public, and so is what the index says.

import { type CSSProperties, useState } from 'react'

import { Avatar, colorOf } from '../avatar.tsx'
import { config } from '../config.ts'
import { newText } from '../counts.ts'
import { useWide } from '../frame.tsx'
import { useCards, useEntries, useMarks, useOffers, useOutgrown, useProfiles, useRated, useSteady } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { kindWords, marketWords, markets, pairOf, roleWords } from '../markets.ts'
import { ratingText, reviewCount, saidCount } from '../show.ts'
import { Badges, Corner, Line, MessagesButton, Rating, noteOf } from '../ui.tsx'
import { OfferCard, offersInOrder } from './Offers.tsx'

type Props = {
  address: string
  onBack: () => void
  onNew: () => void
  onOffer: (path: string) => void
  onReviews: () => void
  onMessages: () => void
}

/** A profile's page on the index, or a listing's: what Share hands out. */
export const pageOf = (address: string) => `${config.index}/profiles/${address}`

/** The phone's share sheet, with `url`; where there is none, the link copied, `copied` told for a moment. A sheet closed with no answer is no error. */
export async function share(url: string, copied: (on: boolean) => void): Promise<void> {
  if (typeof navigator.share === 'function') return navigator.share({ url }).catch(() => undefined)
  await navigator.clipboard.writeText(url)
  copied(true)
  setTimeout(() => copied(false), 2000)
}

/** Share, round: the page at `url` handed out. */
export function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button className="round" aria-label={copied ? 'Copied' : 'Share'} onClick={() => void share(url, setCopied)}>
      <Icon name={copied ? 'check' : 'export'} />
    </button>
  )
}

export function Profile({ address, onBack, onNew, onOffer, onReviews, onMessages }: Props) {
  const wide = useWide()
  const list = useProfiles()
  const profile = list.find((p) => p.address === address)
  const mine = profile ? [profile] : []
  const card = useCards(mine)[address]
  const held = useRated(mine)[address]
  useOutgrown(mine)
  const news = useMarks(mine).of[address]
  const read = useEntries(mine)[address]
  const listings = read && 'entries' in read ? read.entries.filter((x) => x.kind === 'listing') : null
  const outgrown = news?.outgrown ?? []
  const offers = useOffers(address, listings ?? [], outgrown)
  const shown = useSteady(offersInOrder(listings ?? [], offers), (l) => l.path)
  if (!profile) return null
  const pair = pairOf(profile.label)
  const market = markets.market(pair.market)
  const rated = held && 'rated' in held ? held.rated : null
  const word = kindWords('listing', profile.label)
  const fresh = news?.received.length ?? 0
  const update = outgrown.some((o) => o.kind !== 'listing')
  const newOne = (
    <button className={wide ? 'primary small' : 'primary'} onClick={onNew}>
      <Icon name="plus" bold />
      New {word.toLowerCase()}
    </button>
  )
  return (
    <main className="profile">
      <header className="profile-head" style={{ '--h': colorOf(pair.market) } as CSSProperties}>
        <div className="head-bar">
          <button className="round" aria-label="Back" onClick={onBack}>
            <Icon name="arrow-left" />
          </button>
          <span className="grow" />
          <div className="top-right">
            <MessagesButton mark={news?.messages ?? 0} onOpen={onMessages} />
            <ShareButton url={pageOf(address)} />
          </div>
        </div>
        <div className="titled">
          <Avatar label={profile.label} size="lg" />
          <div className="ph2">
            <h1>
              <span className="mk">{marketWords(pair.market)}</span>{' '}
              <span className="rl">
                {roleWords(pair.role)}
                {card && <Badges checks={card.checks} alone />}
              </span>
            </h1>
            {held && 'failed' in held ? (
              <span className="rate-line">Can't reach the index.</span>
            ) : (
              rated && (
                <button className="ratepill" onClick={onReviews}>
                  {rated.rating != null ? (
                    <>
                      <Rating value={ratingText(rated.rating)} />
                      <span>{reviewCount(rated.reviews)}</span>
                    </>
                  ) : (
                    <span>{saidCount(rated.received) || 'No reviews yet'}</span>
                  )}
                  {fresh > 0 && <strong className="new-words">{newText(fresh)}</strong>}
                  {update && <Corner mark="warn" />}
                </button>
              )
            )}
          </div>
        </div>
      </header>
      {wide && (
        <div className="offers-head">
          <h2 className="sect">{word}s</h2>
          {newOne}
        </div>
      )}
      {read && 'failed' in read && <Line note={noteOf(read.failed)} />}
      {listings && market && listings.length > 0 && (
        <div className={wide ? 'tiles' : 'offers'}>
          {shown.map((l) => (
            <OfferCard key={l.path} market={market} listing={l} request={!pair.offers} mark={offers[l.path]?.mark ?? 0} look={wide ? 'tile' : 'card'} onClick={() => onOffer(l.path)} />
          ))}
        </div>
      )}
      {listings && listings.length === 0 && (
        <>
          <div className="fill" />
          <p className="quiet none">No {word.toLowerCase()}s yet</p>
          <div className="fill" />
        </>
      )}
      {!wide && <div className="foot">{newOne}</div>}
    </main>
  )
}
