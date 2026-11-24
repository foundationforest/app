// A listing a message or a review names, as the index holds it (services/index.ts, `readListing`),
// read once a page. Four ways to show it:
// - the About box: "About", the listing's first photo (else its market's icon on its color), its
//   title and its first price; a tap opens it on the index, in a new tab. One the index no longer
//   lists (deleted, or its profile or its fit gone), or doesn't hold: "No longer listed", its
//   market's icon, and no tap. A conversation shows it above its messages, for the first message
//   written from a listing; a review that names its listing, wherever the review shows; each only
//   for a listing of someone in it (about.ts). While it is read, or with the index out of reach,
//   nothing.
// - pinned under a conversation's header (Thread.tsx), a small card: its photo, its title and its
//   price, no "About"; a tap opening it: the person's own listing's page in the app (Offer.tsx), or
//   theirs on the index, in a new tab; "No longer listed" for one the index no longer lists;
// - its title alone, beside who a conversation is with, in Messages' rows, cut with "…";
// - the listing a message is written from, at the top of the writing screen (Message.tsx): its
//   photo, its title, its price, and who posted it, their animal, the person's name for them else
//   their short key, and their rating.
// Of a listing its market outgrew, only what still fits shows (form.ts, `fitting`), so it never breaks
// a screen.

import { useEffect, useState } from 'react'

import { Avatar } from '../avatar.tsx'
import { config } from '../config.ts'
import { fitting } from '../form.ts'
import { markets, pairs } from '../markets.ts'
import { type IndexedListing, readListing } from '../services/index.ts'
import { cardLines, ratingText, titleOf } from '../show.ts'
import { Rating } from '../ui.tsx'
import { Thumb, firstPhoto } from './Offers.tsx'
import { pageOf } from './Profile.tsx'
import { NameOf } from './Who.tsx'

/** Each listing read in this page: the index's answer once it came (null, none there); a read that failed is read again next time. */
const read = new Map<string, Promise<IndexedListing | null | undefined>>()
const came = new Map<string, IndexedListing | null>()

function listingAt(address: string): Promise<IndexedListing | null | undefined> {
  let got = read.get(address)
  if (!got) {
    got = readListing(config.index, address).then(
      (l) => {
        came.set(address, l)
        return l
      },
      () => {
        read.delete(address)
        return undefined
      },
    )
    read.set(address, got)
  }
  return got
}

/** The listing at `address` as the index holds it: undefined while it is read or out of reach, null when the index holds none. */
export function useListing(address: string): IndexedListing | null | undefined {
  const [l, setL] = useState<IndexedListing | null | undefined>(came.get(address))
  useEffect(() => {
    setL(came.get(address))
    let live = true
    void listingAt(address).then((got) => live && setL(got))
    return () => void (live = false)
  }, [address])
  return l
}

/** What a listing shows of itself: its market, its title, its first price and its first photo; null for one whose market or role the directory doesn't hold. */
function shownOf(l: IndexedListing): { market: string; title: string; price: string | null; photo: string | undefined } | null {
  const pair = pairs.find((p) => p.market === l.market && p.role === l.role)
  const market = l.market ? markets.market(l.market) : undefined
  if (!pair || !market) return null
  const body = fitting(pair.market, pair.role, l.body)
  const { title, price } = cardLines(market, body, { request: !pair.offers })
  // Its own title, as the index holds it, even where the market this app reads takes none yet.
  const own = titleOf(l.body)
  return { market: pair.market, title: (typeof l.body.title === 'string' && own) || title || 'A listing', price: price ? [price.amount, price.per].filter(Boolean).join(' ') : null, photo: firstPhoto(market, body) }
}

/** The title of the listing at `address`, cut with "…"; nothing while it is read, or for one the index no longer lists. */
export function ListingTitle({ address }: { address: string }) {
  const l = useListing(address)
  const shown = l?.listed ? shownOf(l) : null
  return <span className="about-title">{shown?.title ?? ''}</span>
}

/** The listing a conversation is about, pinned under its header: its photo, title and price; a tap opens it, the person's own in the app (`onMine`, with its path), theirs on the index. */
export function PinnedListing({ address, mine, onMine }: { address: string; mine: string; onMine?: (path: string) => void }) {
  const l = useListing(address)
  if (l === undefined) return null
  const shown = l?.listed ? shownOf(l) : null
  const inner = (
    <>
      <Thumb market={shown?.market ?? l?.market ?? null} {...(shown && { photo: shown.photo })} />
      <span className="two">
        <strong>{shown ? shown.title : 'No longer listed'}</strong>
        {shown?.price && <span>{shown.price}</span>}
      </span>
    </>
  )
  const [profile, path] = [address.split('/')[0], address.slice(address.indexOf('/') + 1)]
  if (profile === mine && onMine) return <button type="button" className="pinned" onClick={() => onMine(path)}>{inner}</button>
  if (!shown) return <div className="pinned gone">{inner}</div>
  return (
    <a className="pinned" href={pageOf(address)} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  )
}

/** The About box of the listing at `address`. */
export function AboutBox({ address }: { address: string }) {
  const l = useListing(address)
  if (l === undefined) return null
  const shown = l?.listed ? shownOf(l) : null
  if (!shown)
    return (
      <div className="about-box gone">
        <span className="about-word">About</span>
        <span className="about-row">
          <Thumb market={l?.market ?? null} />
          <strong>No longer listed</strong>
        </span>
      </div>
    )
  return (
    <a className="about-box" href={pageOf(address)} target="_blank" rel="noopener noreferrer">
      <span className="about-word">About</span>
      <span className="about-row">
        <Thumb market={shown.market} photo={shown.photo} />
        <span className="two">
          <strong>{shown.title}</strong>
          {shown.price && <span>{shown.price}</span>}
        </span>
      </span>
    </a>
  )
}

/** The listing a message is written from, at the top of the writing screen: its photo, title and price, and who posted it with their rating. "No longer listed" for one the index no longer lists. */
export function ListingTop({ address }: { address: string }) {
  const l = useListing(address)
  const profile = address.split('/')[0]!
  const shown = l?.listed ? shownOf(l) : null
  const label = l?.market && l.role ? `${l.market}/${l.role}` : null
  return (
    <section className="card listing-top" aria-label="The listing">
      <Thumb market={shown?.market ?? l?.market ?? null} photo={shown?.photo} big />
      <span className="two">
        <strong>{shown ? shown.title : l === undefined ? '' : 'No longer listed'}</strong>
        {shown?.price && <span className="d">{shown.price}</span>}
        <span className="by">
          {label && <Avatar label={label} address={profile} size="sm" />}
          <NameOf address={profile} />
          {l?.rating != null && <Rating value={ratingText(l.rating)} />}
        </span>
      </span>
    </section>
  )
}
