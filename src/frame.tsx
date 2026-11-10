// The places, and the frame every screen past setup sits in. Three places: Home (the person's
// profiles), Notifications and You. On a phone, each place has three tabs at its bottom, Home,
// Notifications and You, the one selected filled on a mint pill; the Notifications tab counts
// everything new, messages included. From 900px wide, no tabs: a sidebar on the left, on every
// screen past setup, with the mark and Forest, the search, Home, Notifications (what came about the
// profiles, and what a market outgrew), Messages and You with their counts, then Profiles, with a
// small round plus beside it while a market's role has no profile of theirs, which opens New
// profile; under it the profiles in the app's order (order.ts), those with something new first, then
// the most recently used here, each with how many things are new on it, eight at most, then All
// profiles with how many there are, which opens Home. The screen sits to its right. A place opening
// reads what the index says of every profile, and what a market outgrew of what each posted; the
// counts elsewhere are what the page holds.

import { type ReactNode, useEffect, useState } from 'react'

import { Avatar } from './avatar.tsx'
import { useHeldOutgrown, useNews, useOrdered, useOutgrown, useProfiles, useRated } from './hooks.ts'
import { Icon, type IconName } from './icons.tsx'
import { Mark } from './mark.tsx'
import { pairs } from './markets.ts'
import { MOST } from './order.ts'
import { Named, Search } from './ui.tsx'

export type Place = 'home' | 'notifications' | 'you'

/** What the frame shows selected: a place, Messages, New profile, or one of the person's profiles. */
export type On = Place | 'messages' | 'new' | { profile: string }

/** Where the frame's buttons go. */
export type FrameGo = { place: (to: Place) => void; messages: () => void; profile: (address: string) => void; newProfile: () => void }

const WIDE = '(min-width: 900px)'

/** Whether the page is wide enough for the sidebar: 900px and more. */
export function useWide(): boolean {
  const [wide, setWide] = useState(() => matchMedia(WIDE).matches)
  useEffect(() => {
    const media = matchMedia(WIDE)
    const changed = () => setWide(media.matches)
    media.addEventListener('change', changed)
    return () => media.removeEventListener('change', changed)
  }, [])
  return wide
}

/** How many things are new, by what counts them: on every profile, its messages and what came about it; in all, what came, what a market outgrew, and the messages. */
function useCounts() {
  const list = useProfiles()
  const news = useNews(list)
  const outgrown = useHeldOutgrown(list)
  const notices = news.received + Object.values(outgrown).reduce((n, o) => n + (o?.length ?? 0), 0)
  return { list, news, notices, messages: news.messages }
}

/** A screen in its frame. `place`, when the screen is one: its tabs on a phone, and the reads it does as it opens. */
export function Frame({ on, place, go, children }: { on: On; place?: Place; go: FrameGo; children: ReactNode }) {
  const wide = useWide()
  // The frame stays as the screens change; what a place reads, it reads each time it opens.
  const opening = place && <Opening key={place} />
  if (!wide)
    return (
      <>
        {opening}
        {children}
        {place && <Tabs at={place} go={go.place} />}
      </>
    )
  return (
    <div className="desk">
      {opening}
      <Side on={on} go={go} />
      <div className="content">{children}</div>
    </div>
  )
}

/** A place opening: what the index says of every profile, and what a market outgrew of what each posted, read. */
function Opening() {
  const list = useProfiles()
  useRated(list)
  useOutgrown(list)
  return null
}

const TABS: Array<[Place, string, IconName]> = [
  ['home', 'Home', 'house'],
  ['notifications', 'Notifications', 'bell'],
  ['you', 'You', 'user-circle'],
]

/** The phone's three tabs. */
function Tabs({ at, go }: { at: Place; go: (to: Place) => void }) {
  const { notices, messages } = useCounts()
  const count = notices + messages
  return (
    <nav className="tabbar" aria-label="Places">
      {TABS.map(([place, words, icon]) => (
        <button key={place} className={at === place ? 'on' : ''} aria-current={at === place ? 'page' : undefined} onClick={() => go(place)}>
          <span className="ti">
            <Icon name={icon} fill={at === place} />
            {place === 'notifications' && count > 0 && (
              <span className="count" aria-label={`${count} new`}>
                {count}
              </span>
            )}
          </span>
          {words}
        </button>
      ))}
    </nav>
  )
}

/** One of the sidebar's places, with its count. */
function Nav({ on, icon, words, count = 0, onClick }: { on: boolean; icon: IconName; words: string; count?: number; onClick: () => void }) {
  return (
    <button className={on ? 'nav on' : 'nav'} aria-current={on ? 'page' : undefined} onClick={onClick}>
      <Icon name={icon} fill={on} />
      <span className="grow">{words}</span>
      {count > 0 && (
        <span className="count" aria-label={`${count} new`}>
          {count}
        </span>
      )}
    </button>
  )
}

/** The laptop's sidebar. */
function Side({ on, go }: { on: On; go: FrameGo }) {
  const { list, news, notices, messages } = useCounts()
  const shown = useOrdered(list)
  const held = new Set(list.map((p) => p.label))
  const at = typeof on === 'string' ? on : null
  return (
    <aside className="side">
      <div className="brand">
        <Mark size={26} />
        <span className="d">Forest</span>
      </div>
      <Search />
      <nav className="navs" aria-label="Places">
        <Nav on={at === 'home'} icon="house" words="Home" onClick={() => go.place('home')} />
        <Nav on={at === 'notifications'} icon="bell" words="Notifications" count={notices} onClick={() => go.place('notifications')} />
        <Nav on={at === 'messages'} icon="chat-circle" words="Messages" count={messages} onClick={go.messages} />
        <Nav on={at === 'you'} icon="user-circle" words="You" onClick={() => go.place('you')} />
      </nav>
      <div className="side-head">
        <h2 className="sect">Profiles</h2>
        {pairs.some((p) => !held.has(p.label)) && (
          <button className={at === 'new' ? 'round tiny on' : 'round tiny'} aria-label="New profile" onClick={go.newProfile}>
            <Icon name="plus" bold />
          </button>
        )}
      </div>
      {shown.slice(0, MOST).map((p) => {
        const n = news.of[p.address]
        const count = n ? n.messages + n.received.length : 0
        const here = typeof on === 'object' && on.profile === p.address
        return (
          <button key={p.address} className={here ? 'nav profile on' : 'nav profile'} aria-current={here ? 'page' : undefined} onClick={() => go.profile(p.address)}>
            <Avatar label={p.label} size="sm" />
            <span className="grow">
              <Named label={p.label} />
            </span>
            {count > 0 && (
              <span className="count" aria-label={`${count} new`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
      {list.length > MOST && (
        <button className="nav all" onClick={() => go.place('home')}>
          All profiles ({list.length})
        </button>
      )}
    </aside>
  )
}
