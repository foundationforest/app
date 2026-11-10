// A profile, opened from its card: its avatar, its market and role with the badge of its strongest
// check; at the top right, its messages, a round button with how many are new, which opens its
// conversations, then Share, round too. Share hands out the profile's page on the index: the phone's share sheet where
// there is one, else the page's link copied, the button saying so for a moment. A link, not a fetch: nothing here reaches the index for
// it. Under the name, one line: the index's rating with its star, how many reviews it counted, and how many
// reviews, vouches and reports are new, which opens its Feedback. Then its listings, each a row with
// its first photo and its preview (ListingRow.tsx), tapped to edit, one that no longer fits its
// market saying Update this listing; and at the bottom, side by side, Review, which opens Review
// someone, and a new listing in its role's word. Nothing here asks the passkey: its folder is
// public, and so is what the index says.

import { useEffect, useState } from 'react'

import { Avatar } from '../avatar.tsx'
import { config } from '../config.ts'
import { type Posted, readEntries } from '../flows/entries.ts'
import { strongest } from '../flows/cards.ts'
import { fits } from '../form.ts'
import { useCards, useNews, useProfiles, useRated } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { kindWords, markets, pairOf, yourListings } from '../markets.ts'
import { ratingText, reviewCount } from '../show.ts'
import { Line, MessagesButton, Named, type Note, Rating, Top, Verified, noteOf } from '../ui.tsx'
import { ListingRow } from './ListingRow.tsx'

type Props = { address: string; onBack: () => void; onListing: (edit?: Posted) => void; onFeedback: () => void; onReview: () => void; onMessages: () => void }

/** A profile's page on the index: what Share hands out. */
const pageOf = (address: string) => `${config.index}/profiles/${address}`

export function Profile({ address, onBack, onListing, onFeedback, onReview, onMessages }: Props) {
  const list = useProfiles()
  const profile = list.find((p) => p.address === address)
  const mine = profile ? [profile] : []
  const card = useCards(mine)[address]
  const held = useRated(mine)[address]
  const news = useNews(mine).of[address]
  const [copied, setCopied] = useState(false)
  const [listings, setListings] = useState<Posted[] | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  useEffect(() => {
    let live = true
    readEntries(config, address).then(
      (p) => live && setListings(p.filter((x) => x.kind === 'listing')),
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
  return (
    <main className="with-foot">
      <Top
        onBack={onBack}
        right={
          <>
            <MessagesButton count={news?.messages ?? 0} onOpen={onMessages} />
            <button className="round" aria-label={copied ? 'Copied' : 'Share'} onClick={() => void share()}>
              <Icon name={copied ? 'check' : 'export'} />
            </button>
          </>
        }
      />
      <div className="stack">
        <div className="titled">
          <Avatar label={profile.label} size="lg" />
          <h1 className="profile-title">
            <Named label={profile.label} />
            {check && <Verified check={check} big alone />}
          </h1>
        </div>
        <div className="lines">
          <button className="link" onClick={onFeedback}>
            {held && 'failed' in held ? (
              'Feedback'
            ) : rated?.rating != null ? (
              <>
                <Rating value={ratingText(rated.rating)} /> · {reviewCount(rated.reviews)}
              </>
            ) : (
              'No reviews yet'
            )}
            <New n={news?.received.length ?? 0} />
            <Icon name="caret-right" className="car" />
          </button>
        </div>
        {held && 'failed' in held && <p className="line">Can't reach the index.</p>}
      </div>
      <h2>{yourListings(profile.label)}</h2>
      <Line note={note} />
      {listings === null ? (
        !note && <Loader big />
      ) : (
        <div className="rows">
          {market && listings.map((l) => <ListingRow key={l.path} market={market} body={l.body} update={!fits(pair.market, pair.role, l.body)} onClick={() => onListing(l)} />)}
        </div>
      )}
      <div className="foot pair">
        <button onClick={onReview}>Review</button>
        <button className="primary" onClick={() => onListing()}>
          New {kindWords('listing', profile.label).toLowerCase()}
        </button>
      </div>
    </main>
  )
}

/** How many are new, after a line's words: " · 1 new", in bold; nothing when none is. */
const New = ({ n }: { n: number }) =>
  n > 0 ? (
    <>
      {' · '}
      <strong>{n} new</strong>
    </>
  ) : null
