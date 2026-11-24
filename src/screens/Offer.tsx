// One of the person's offers (or requests), opened from its card on their profile, or from a
// laptop's Home, or from the listing a conversation is about. At the top, Back, and Share, round,
// which hands out its page on the index. On a phone: the offer as one card, its first photo (else its
// market's icon), its title, its first price, or "Needs updating" in yellow for one its market
// outgrew, and a pencil at its right: the whole card opens its edit (Listing.tsx). No details and no
// description: its card is enough to tell it, and the edit holds the rest. Under it, Messages, and
// the conversations about it, as Messages shows them but without its title, since every one is about
// this offer: what is new first, newest first (order.ts); No messages yet, quiet, in the middle, with
// none; before the messages are opened, the lock and Open, as Messages has them (opening.ts).
// On a laptop, three panes beside the sidebar: the offer, big, on the left: its photos one at a time,
// "1 of 4", its title, its price, its answers in words and its place (ListingRead.tsx), its own words,
// and Edit; then its conversations; and, once one is tapped, that conversation beside them, the offer
// staying. A listing that is gone (just deleted) leaves its page. Nothing here asks the passkey
// before Open.

import { useEffect, useState } from 'react'

import { aboutOf } from '../about.ts'
import { config } from '../config.ts'
import { photoUrl, photosIn } from '../flows/photos.ts'
import { useEntries, useMarks, useOpened, useOutgrown, useProfiles, useSteady } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { kindWords, markets, pairOf } from '../markets.ts'
import { isFresh } from '../opened.ts'
import { useOpening, useSeen } from '../opening.ts'
import { newFirst } from '../order.ts'
import { answerLines } from '../show.ts'
import { Line, Top, noteOf } from '../ui.tsx'
import { ListingRead } from './ListingRead.tsx'
import { Closed, ThreadRow } from './Messages.tsx'
import { Thumb, offerShown } from './Offers.tsx'
import type { Posted } from '../flows/entries.ts'
import { ShareButton, pageOf } from './Profile.tsx'
import { Thread } from './Thread.tsx'

type Props = {
  address: string
  /** The listing's path in its folder, `listing/<id>`. */
  entry: string
  wide: boolean
  /** On a laptop, the conversation open beside its conversations: whom it is with. */
  them?: string
  onBack: () => void
  onEdit: (listing: Posted) => void
  onThread: (them: string) => void
  onReview: (mine: string, them: string) => void
  onWho: (address: string) => void
}

export function Offer({ address, entry, wide, them, onBack, onEdit, onThread, onReview, onWho }: Props) {
  const me = useProfiles().find((p) => p.address === address)
  const mine = me ? [me] : []
  const read = useEntries(mine)[address]
  useOutgrown(mine)
  const news = useMarks(mine).of[address]
  const listing = read && 'entries' in read ? read.entries.find((e) => e.path === entry && e.kind === 'listing') : undefined
  const gone = !!read && 'entries' in read && !listing
  useEffect(() => {
    if (gone) onBack()
  }, [gone])
  const outgrown = (news?.outgrown ?? []).some((o) => o.path === entry)
  if (read && 'failed' in read)
    return (
      <main>
        <Top onBack={onBack} clear />
        <Line note={noteOf(read.failed)} />
      </main>
    )
  if (!me || !listing) return null
  const pair = pairOf(me.label)
  const market = markets.market(pair.market)
  if (!market) return null
  const at = `${address}/${entry}`
  const { title, photo, price } = offerShown(market, listing.body, !pair.offers)
  const top = <Top onBack={onBack} clear right={<ShareButton url={pageOf(at)} />} />
  const talks = <Talks address={address} market={pair.market} at={at} {...(wide && them && { open: them })} onThread={onThread} />
  if (!wide)
    return (
      <main className="offer-page">
        {top}
        <button className="card offer-big" aria-label={`Edit your ${kindWords('listing', me.label).toLowerCase()}`} onClick={() => onEdit(listing)}>
          <Thumb market={market.name} photo={photo} big />
          <span className="offer-words">
            <strong className="offer-title">{title}</strong>
            {outgrown ? (
              <span className="needs">Needs updating</span>
            ) : (
              price && (
                <span className="offer-price">
                  <span className="d">{price.amount}</span>
                  {price.per && <span className="xs"> {price.per}</span>}
                </span>
              )
            )}
          </span>
          <Icon name="pencil-simple" className="pen" />
        </button>
        <h2 className="sect">Messages</h2>
        {talks}
      </main>
    )
  const photos = Object.entries(market.listing).flatMap(([name, f]) => (f.piece === 'photo' ? photosIn(listing.body[name]) : []))
  const prices = market.listing.price ? answerLines(market.listing.price, listing.body.price, { request: !pair.offers }) : []
  return (
    <main className={them ? 'offer-panes three' : 'offer-panes'}>
      <section className="offer-detail" aria-label={kindWords('listing', me.label)}>
        {top}
        <Photos market={market.name} photos={photos} />
        <h1 className="offer-title">{title}</h1>
        {outgrown ? <span className="needs">Needs updating</span> : prices.length > 0 && <p className="offer-prices">{prices.join(' · ')}</p>}
        <ListingRead label={me.label} address={address} body={listing.body} bare />
        <div className="foot">
          <button onClick={() => onEdit(listing)}>
            <Icon name="pencil-simple" />
            Edit
          </button>
        </div>
      </section>
      <section className="pane-list" aria-label="Conversations">
        <div className="top">
          <h2 className="sect">Messages</h2>
        </div>
        {talks}
      </section>
      {them && (
        <section className="pane-open" aria-label="Conversation">
          <Thread key={them} mine={address} them={them} pane onBack={onBack} onReview={onReview} onWho={onWho} />
        </section>
      )}
    </main>
  )
}

/** An offer's photos, one at a time, "1 of 4", with round buttons to the one before and after; its market's icon with none. */
function Photos({ market, photos }: { market: string; photos: string[] }) {
  const [i, setI] = useState(0)
  if (photos.length === 0) return <Thumb market={market} big />
  const at = Math.min(i, photos.length - 1)
  return (
    <div className="photos">
      <img className="photo" src={photoUrl(config.host, photos[at]!)} alt="" />
      {photos.length > 1 && (
        <div className="photos-bar">
          <button className="round" aria-label="The photo before" disabled={at === 0} onClick={() => setI(at - 1)}>
            <Icon name="caret-left" />
          </button>
          <span className="xs">
            {at + 1} of {photos.length}
          </span>
          <button className="round" aria-label="The photo after" disabled={at === photos.length - 1} onClick={() => setI(at + 1)}>
            <Icon name="caret-right" />
          </button>
        </div>
      )}
    </div>
  )
}

/** The conversations about the listing at `at`, of the person's profile `address`: what is new first, newest first; No messages yet; the lock and Open before they are opened. */
function Talks({ address, market, at, open: shown, onThread }: { address: string; market: string; at: string; open?: string; onThread: (them: string) => void }) {
  const opened = useOpened()
  const { open, held } = useOpening()
  useSeen(true)
  const threads = (opened?.threads ?? []).filter((t) => t.mine === address && aboutOf(t.messages, t.mine, t.them) === at)
  const ordered = useSteady(
    newFirst(threads, isFresh, (t) => t.messages.at(-1)?.time ?? 0),
    (t) => t.them,
  )
  if (!opened?.all) {
    if (held && !open.note) return <Loader big />
    return <Closed fresh={false} note={open.note} busy={open.busy} onOpen={() => void open.run()} />
  }
  if (threads.length === 0)
    return (
      <>
        <Line note={open.note} />
        <p className="quiet none">No messages yet</p>
      </>
    )
  return (
    <div className="threads">
      {ordered.map((t) => (
        <ThreadRow key={t.them} t={t} market={market} here={shown === t.them} titled={false} onOpen={() => onThread(t.them)} />
      ))}
    </div>
  )
}
