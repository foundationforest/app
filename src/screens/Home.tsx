// Home, the person's profiles: on a phone, the mark and Search Forest at the top (on a laptop the
// search is in the sidebar); then Profiles, with the person's badges beside it, once, since every
// profile of one person carries the same checks: a check done its badge (a tap says its words), one
// not done its badge's outline, dashed, which opens Get verified (the ID's only where the verifier
// sells it, GET /'s `forSale`, or once it is done); and at the right New, a small strong green pill
// with a +, Home's one action, while a market's role has no profile of theirs. Then the profiles, in
// the order they were made (order.ts).
// On a phone, one card each: its avatar, its market's icon on its market's color, with its mark on
// the corner (counts.ts: its conversations with something new and its new reviews, vouches and
// reports, the dot while new messages are not opened yet, or the yellow ! when something of it needs
// updating); its market in bold and its role small under it; and at its right the index's rating
// with its star over how many reviews it counted, or what came with no score yet (1 vouch), or No
// reviews. Every card is one height, rated or not, so a list never jumps as ratings come.
// On a laptop, a block each, in columns of about 300px: its header on a light tint of its market's
// color, its avatar with no mark (the sidebar holds it), its market and role, its rating; under it
// its offers (or requests) as lines, each with its own mark: every one with something new, then
// others up to two in all, newest first; then how many more, which opens the profile; or No offers
// yet. Its offers are read from its folder as Home opens.
// Nothing on Home asks the passkey: the device keeps which profiles are the person's, and all it
// shows is public. Under the title, when the Profiles folder holds a profile made on another device,
// one yellow line, Sync profiles, with round arrows at its right: a tap asks the passkey once, the
// arrows spin, then the line goes and the cards show (unlocked.ts); any other unlock does it by
// itself.

import type { CSSProperties } from 'react'

import { Avatar, colorOf } from '../avatar.tsx'
import { type Check, passkey } from '../device.ts'
import type { Posted } from '../flows/entries.ts'
import { useWide } from '../frame.tsx'
import { type News, useChecks, useElsewhere, useEntries, useHeldRated, useIdCheck, useInOrder, useMarks, useOffers, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Mark } from '../mark.tsx'
import { type Pair, kindWords, marketWords, markets, pairs } from '../markets.ts'
import { marked } from '../counts.ts'
import { withSeed } from '../passkey.ts'
import type { Held } from '../rated.ts'
import { ratingText, reviewCount, saidCount } from '../show.ts'
import { Corner, Line, Rating, Search, Unverified, Verified, useAction } from '../ui.tsx'
import { sync } from '../unlocked.ts'
import { OfferCard, offersInOrder } from './Offers.tsx'

type Props = { onOpen: (address: string) => void; onOffer: (address: string, path: string) => void; onNew: () => void; onCheck: (check: Check) => void }

/** How many offers a laptop's block shows at least, when it has them: those with something new, then others up to this. */
const LINES = 2

export function Home({ onOpen, onOffer, onNew, onCheck }: Props) {
  const wide = useWide()
  const list = useProfiles()
  const shown = useInOrder(list)
  const has = useChecks()
  const { forSale } = useIdCheck()
  const rated = useHeldRated(list)
  const marks = useMarks(list)
  const held = new Set(list.map((p) => p.label))
  const unreached = list.some((p) => {
    const r = rated[p.address]
    return r && 'failed' in r
  })
  const elsewhere = useElsewhere()
  const take = useAction(async () => {
    await withSeed(passkey()!, sync)
  })
  const free = pairs.some((p) => !held.has(p.label))
  return (
    <main className="home">
      {!wide && (
        <div className="top">
          <Mark size={30} />
          <Search />
        </div>
      )}
      <div className="titled">
        <h1>Profiles</h1>
        <span className="badges" role="group" aria-label="How you're verified">
          {(['face', 'id'] as const)
            .filter((c) => c === 'face' || forSale || has.has(c))
            .map((c) => (has.has(c) ? <Verified key={c} check={c} big alone /> : <Unverified key={c} check={c} onClick={() => onCheck(c)} />))}
        </span>
        <span className="grow" />
        {free && (
          <button className="primary small new-pill" aria-label="New profile" onClick={onNew}>
            <Icon name="plus" bold />
            New
          </button>
        )}
      </div>
      {elsewhere && (
        <button className="sync" disabled={take.busy} onClick={() => take.run()}>
          <span className="grow">Sync profiles</span>
          <span className={take.busy ? 'arrows spin' : 'arrows'} aria-hidden>
            <Icon name="arrows-clockwise" bold />
          </span>
        </button>
      )}
      <Line note={take.note} />
      {wide ? (
        <div className="blocks">
          {shown.map((p) => (
            <Block key={p.address} p={p} held={rated[p.address]} news={marks.of[p.address]} onOpen={() => onOpen(p.address)} onOffer={(path) => onOffer(p.address, path)} />
          ))}
        </div>
      ) : (
        <div className="cards">
          {shown.map((p) => (
            <button key={p.address} className="card profile-card" onClick={() => onOpen(p.address)}>
              <span className="avwrap">
                <Avatar label={p.label} />
                <Corner mark={marks.of[p.address]?.mark ?? 0} />
              </span>
              <span className="nm2">
                <strong>{marketWords(p.pair.market)}</strong> <span>{p.pair.role}</span>
              </span>
              <span className="rt2">
                <RatingOf held={rated[p.address]} />
              </span>
            </button>
          ))}
        </div>
      )}
      {unreached && <p className="line">Can't reach the index.</p>}
    </main>
  )
}

/** What the index says of a profile, at a card's right: its rating over how many reviews, what came with no score yet, or No reviews; nothing while it is read. */
function RatingOf({ held }: { held: Held | undefined }) {
  const index = held && 'rated' in held ? held.rated : null
  if (!index) return null
  if (index.rating != null)
    return (
      <>
        <Rating value={ratingText(index.rating)} />
        <span className="xs">{reviewCount(index.reviews)}</span>
      </>
    )
  return <span className="xs">{index.received.length > 0 ? saidCount(index.received) : 'No reviews'}</span>
}

/** A profile's block, on a laptop's Home: its header on its market's tint, then its offers as lines. */
function Block({ p, held, news, onOpen, onOffer }: { p: { label: string; address: string; pair: Pair }; held: Held | undefined; news: News | undefined; onOpen: () => void; onOffer: (path: string) => void }) {
  const market = markets.market(p.pair.market)
  const read = useEntries([p])[p.address]
  const listings: Posted[] = read && 'entries' in read ? read.entries.filter((e) => e.kind === 'listing') : []
  const offers = useOffers(p.address, listings, news?.outgrown ?? [])
  const ordered = offersInOrder(listings, offers)
  const fresh = ordered.filter((l) => marked(offers[l.path]?.mark ?? 0))
  const lines = [...fresh, ...ordered.filter((l) => !fresh.includes(l))].slice(0, Math.max(LINES, fresh.length))
  const more = listings.length - lines.length
  const word = kindWords('listing', p.label).toLowerCase()
  return (
    <section className="block" aria-label={p.pair.words}>
      <button className="block-head" style={{ '--h': colorOf(p.pair.market) } as CSSProperties} onClick={onOpen}>
        <Avatar label={p.label} />
        <span className="nm2">
          <strong>{marketWords(p.pair.market)}</strong> <span>{p.pair.role}</span>
        </span>
        <span className="rt2">
          <RatingOf held={held} />
        </span>
      </button>
      {read && 'entries' in read && market && (
        <div className="block-lines">
          {lines.map((l) => (
            <OfferCard key={l.path} market={market} listing={l} request={!p.pair.offers} mark={offers[l.path]?.mark ?? 0} look="line" onClick={() => onOffer(l.path)} />
          ))}
          {more > 0 && (
            <button className="link more" onClick={onOpen}>
              {more} more
            </button>
          )}
          {listings.length === 0 && <p className="quiet none">No {word}s yet</p>}
        </div>
      )}
    </section>
  )
}
