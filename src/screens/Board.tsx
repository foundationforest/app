// The board: the person's profiles, the seller side first, each with its offers and its score; the
// buyer side after, compact; then a new profile. A card held down, or the menu on its page, hides
// it from the board; the menu shows it again. The message door opens a new message over it.

import { useEffect, useRef, useState } from 'react'

import type { Nav } from '../App.tsx'
import { type Indexed, type Market, type Own, indexed, marketOf, ownRecords, roleWord, splitLabel, words } from '../cards.ts'
import { CHANGED, type LocalProfile, hiddenProfiles, hideProfile, inboxCounts, localProfiles, seenReviews } from '../local.ts'
import { settings } from '../settings.ts'
import { Mark, MenuIcon, Score } from '../ui.tsx'
import { Compose } from './Compose.tsx'
import { Menu } from './Menu.tsx'
import { Sheet } from './Sheets.tsx'

/** What this device keeps, read again whenever it changes. */
export function useLocal<T>(read: () => T): T {
  const [value, setValue] = useState(read)
  useEffect(() => {
    const changed = () => setValue(read())
    addEventListener(CHANGED, changed)
    return () => removeEventListener(CHANGED, changed)
  }, [])
  return value
}

/** A profile as its card shows it: its market's file, its own records from its hosts, and what the index says of it. */
export function useProfile(p: LocalProfile) {
  const { market: name, role } = splitLabel(p.label)
  const [market, setMarket] = useState<Market | null>()
  const [own, setOwn] = useState<Own>()
  const [index, setIndex] = useState<Indexed | null>()
  const [reads, setReads] = useState(0)
  useEffect(() => {
    let live = true
    const { index: origin } = settings()
    const keep = (set: (v: any) => void) => (v: unknown) => live && set(v)
    marketOf(origin, name).then(keep(setMarket), () => undefined)
    ownRecords(p).then(keep(setOwn), () => undefined)
    indexed(origin, p.address).then(keep(setIndex), () => undefined)
    return () => {
      live = false
    }
  }, [p.address, reads])
  const inbox = useLocal(() => inboxCounts()[p.address]?.count ?? 0)
  const seen = useLocal(() => seenReviews(p.address))
  const newReviews = Math.max(0, (index?.received.length ?? 0) - seen)
  return { name, role, word: roleWord(role, market), market, own, index, inbox, newReviews, reload: () => setReads((n) => n + 1) }
}

/** A profile's own menu: Hide, which takes it off the board and deletes nothing. */
export function ProfileMenu({ p, onClose, onHidden = onClose }: { p: LocalProfile; onClose: () => void; onHidden?: () => void }) {
  return (
    <Sheet label="Profile" onClose={onClose}>
      <div className="item">
        <button
          className="line"
          onClick={() => {
            hideProfile(p.address)
            onHidden()
          }}
        >
          Hide
        </button>
      </div>
    </Sheet>
  )
}

/** How long a press is held before it opens the card's menu rather than the card. */
const HOLD_MS = 500

function ProfileCard({ p, compact, nav }: { p: LocalProfile; compact: boolean; nav: Nav }) {
  const d = useProfile(p)
  const fresh = d.inbox + d.newReviews
  const [menu, setMenu] = useState(false)
  const hold = useRef<number | undefined>(undefined)
  const held = useRef(false)
  const press = () => {
    held.current = false
    hold.current = window.setTimeout(() => {
      held.current = true
      setMenu(true)
    }, HOLD_MS)
  }
  const release = () => clearTimeout(hold.current)
  return (
    <>
      <button
        className={compact ? 'card compact' : 'card'}
        onClick={() => !held.current && nav.go({ name: 'card', address: p.address })}
        onPointerDown={press}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onContextMenu={(e) => {
          e.preventDefault()
          setMenu(true)
        }}
      >
        <span className="card-head">
          <span>
            <span className="title">{words(d.name)}</span>
            <span className="sub">{words(d.word)}</span>
          </span>
          <span>
            {!compact && d.index?.rating && <Score value={d.index.rating.value} />}
            {fresh > 0 && <span className="badge">{fresh}</span>}
          </span>
        </span>
        {!compact && !!d.own?.offers.length && (
          <span className="rows">
            {d.own.offers.map((o) => (
              <span className="tint" key={o.path}>
                <span>{o.title}</span>
                {o.price && <span>{o.price}</span>}
              </span>
            ))}
          </span>
        )}
      </button>
      {menu && <ProfileMenu p={p} onClose={() => setMenu(false)} />}
    </>
  )
}

export function Board({ nav, onForget, compose }: { nav: Nav; onForget: () => void; compose?: string }) {
  const profiles = useLocal(localProfiles)
  const hidden = useLocal(hiddenProfiles)
  const [menu, setMenu] = useState(false)
  const shown = profiles.filter((p) => !hidden.includes(p.address))
  // Peers, the one side of a one-sided market, offer as sellers do, so they sit with them.
  const sellers = shown.filter((p) => splitLabel(p.label).role !== 'buyer')
  const buyers = shown.filter((p) => splitLabel(p.label).role === 'buyer')
  return (
    <main>
      <div className="bar">
        <div className="brand">
          <Mark />
          Forest
        </div>
        <div>
          <button className="icon" aria-label="Menu" onClick={() => setMenu(true)}>
            <MenuIcon />
          </button>
        </div>
      </div>
      {sellers.length > 0 && (
        <div className="cards">
          {sellers.map((p) => (
            <ProfileCard key={p.address} p={p} compact={false} nav={nav} />
          ))}
        </div>
      )}
      {buyers.length > 0 && (
        <div className="cards">
          {buyers.map((p) => (
            <ProfileCard key={p.address} p={p} compact nav={nav} />
          ))}
        </div>
      )}
      <button className="dashed" onClick={() => nav.go({ name: 'new' })}>
        New profile
      </button>
      {menu && <Menu onClose={() => setMenu(false)} onForget={onForget} />}
      {compose && <Compose to={compose} profiles={profiles} onClose={() => nav.reset({ name: 'board' })} />}
    </main>
  )
}
