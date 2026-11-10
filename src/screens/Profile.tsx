// A profile, opened from its card. Its header, on a tint of its market's color with its bottom
// corners rounded: Back on the left; on the right its messages, a round button with how many are
// new, which opens Messages picked to it, then Share, round too. Share hands out the profile's page
// on the index: the phone's share sheet where there is one, else the page's link copied, the button
// saying so for a moment. A link, not a fetch: nothing here reaches the index for it. Then its
// avatar, large, its market and role as one title with the badge of its strongest check, and under
// it what the index says: its star, its score and how many reviews it counted, or, with no score
// yet, what came (1 vouch); a button that opens its Reviews (Reviews.tsx), with the dot while
// something there is new; "No reviews yet", no button, while nothing came. Then two tabs, kept in
// the page's history: its listings, in its role's word (Offers, Requests), each a card
// (ListingCard.tsx) tapped to edit, one that no longer fits its market saying Needs an update, with
// New offer at the foot; and Written by you (Written.tsx), what it wrote about others, with Review
// someone at the foot. Opened, the profile is used: the device notes when, for the order the app
// lists profiles in (device.ts). Nothing here asks the passkey: its folder is public, and so is what
// the index says.

import { type CSSProperties, useEffect, useState } from 'react'

import { Avatar, colorOf } from '../avatar.tsx'
import { config } from '../config.ts'
import { markUsed } from '../device.ts'
import { type Posted, readEntries } from '../flows/entries.ts'
import { strongest } from '../flows/cards.ts'
import { fits } from '../form.ts'
import { useCards, useNews, useProfiles, useRated } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { kindWords, markets, pairOf } from '../markets.ts'
import { ratingText, reviewCount, saidCount } from '../show.ts'
import { Dot, Line, MessagesButton, Named, type Note, Rating, Verified, noteOf } from '../ui.tsx'
import { ListingCard } from './ListingCard.tsx'
import { Written } from './Written.tsx'

/** A profile's two tabs: its listings, and what it wrote. */
export type Tab = 'listings' | 'written'

type Props = {
  address: string
  tab: Tab
  onTab: (tab: Tab) => void
  onBack: () => void
  onListing: (edit?: Posted) => void
  onReviews: () => void
  onEdit: (given: Posted) => void
  onReview: () => void
  onMessages: () => void
}

/** A profile's page on the index: what Share hands out. */
const pageOf = (address: string) => `${config.index}/profiles/${address}`

export function Profile({ address, tab, onTab, onBack, onListing, onReviews, onEdit, onReview, onMessages }: Props) {
  const list = useProfiles()
  const profile = list.find((p) => p.address === address)
  const mine = profile ? [profile] : []
  const card = useCards(mine)[address]
  const held = useRated(mine)[address]
  const news = useNews(mine).of[address]
  const [copied, setCopied] = useState(false)
  const [entries, setEntries] = useState<Posted[] | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  useEffect(() => markUsed(address), [address])
  useEffect(() => {
    let live = true
    readEntries(config, address).then(
      (p) => live && setEntries(p),
      (err: unknown) => live && setNote(noteOf(err)),
    )
    return () => void (live = false)
  }, [address])
  if (!profile) return null
  const pair = pairOf(profile.label)
  const market = markets.market(pair.market)
  const rated = held && 'rated' in held ? held.rated : null
  /** The phone's share sheet, with the profile's page; where there is none, the page's link copied. A sheet closed with no answer is no error. */
  const share = async () => {
    const url = pageOf(address)
    if (typeof navigator.share === 'function') return navigator.share({ url }).catch(() => undefined)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const check = card ? strongest(card.checks) : null
  const word = kindWords('listing', profile.label)
  const listings = entries?.filter((x) => x.kind === 'listing') ?? null
  return (
    <main>
      <header className="profile-head" style={{ '--h': colorOf(pair.market) } as CSSProperties}>
        <div className="head-bar">
          <button className="round" aria-label="Back" onClick={onBack}>
            <Icon name="arrow-left" />
          </button>
          <span className="grow" />
          <div className="top-right">
            <MessagesButton count={news?.messages ?? 0} onOpen={onMessages} />
            <button className="round" aria-label={copied ? 'Copied' : 'Share'} onClick={() => void share()}>
              <Icon name={copied ? 'check' : 'export'} />
            </button>
          </div>
        </div>
        <div className="titled">
          <Avatar label={profile.label} size="lg" />
          <div className="title-col">
            <h1 className="profile-title">
              <Named label={profile.label} />
              {check && <Verified check={check} big alone />}
            </h1>
            {held && 'failed' in held ? (
              <span className="rate-line">Can't reach the index.</span>
            ) : rated && rated.received.length > 0 ? (
              <button className="rate-line" onClick={onReviews}>
                {rated.rating != null ? (
                  <>
                    <Rating value={ratingText(rated.rating)} />
                    <span>· {reviewCount(rated.reviews)}</span>
                  </>
                ) : (
                  <span>{saidCount(rated.received)}</span>
                )}
                {(news?.received.length ?? 0) > 0 && <Dot />}
                <Icon name="caret-right" className="car" />
              </button>
            ) : (
              <span className="rate-line">No reviews yet</span>
            )}
          </div>
        </div>
      </header>
      <div className="tabs" role="tablist">
        {(['listings', 'written'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'here' : ''} onClick={() => onTab(t)}>
            {t === 'listings' ? `${word}s` : 'Written by you'}
          </button>
        ))}
      </div>
      {tab === 'listings' ? (
        <>
          <Line note={note} />
          {listings === null ? (
            !note && <Loader big />
          ) : (
            <div className="cards">
              {market && listings.map((l) => <ListingCard key={l.path} market={market} body={l.body} update={!fits(pair.market, pair.role, l.body)} onClick={() => onListing(l)} />)}
            </div>
          )}
          <div className="foot">
            <button className="primary" onClick={() => onListing()}>
              <Icon name="plus" bold />
              New {word.toLowerCase()}
            </button>
          </div>
        </>
      ) : (
        <>
          <Line note={note} />
          {!note && <Written entries={entries} onEdit={onEdit} onReview={onReview} />}
        </>
      )}
    </main>
  )
}
