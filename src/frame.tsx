// The places, and the frame every screen past setup sits in. Three places: Home (the person's
// profiles), Messages and You. On a phone, each place has three tabs at its bottom, Home, Messages
// and You, the one selected filled on a soft green pill; the Messages tab carries its mark, the
// conversations with something new across every profile (counts.ts). From 900px wide, no tabs: a
// sidebar on the left, on every screen past setup. Its first line: the mark alone, a link to Home,
// and Search Forest beside it, filling the rest. Then Home, Messages, with its mark, and You, the
// one where the person is on the soft green; then Profiles, with a small outlined + New at its right
// while a market's role has no profile of theirs, which opens New profile; under it every profile,
// in the order they were made (order.ts), each with its mark, the sidebar scrolling on its own when
// they run long. The screen sits to its right. A tap into Messages, the tab or the sidebar's, opens
// them: with no seed held, the tap itself asks the passkey (opening.ts). A place opening reads what
// the index says of every profile, and what a market outgrew of what each posted; and whenever a
// seed is held, the messages open by themselves, so every mark is exact.

import { type ReactNode, useEffect, useState } from 'react'

import { Avatar } from './avatar.tsx'
import { useInOrder, useMarks, useOutgrown, useProfiles, useRated } from './hooks.ts'
import { Icon, type IconName } from './icons.tsx'
import { Mark } from './mark.tsx'
import type { Mark as Marked } from './counts.ts'
import { pairs } from './markets.ts'
import { useQuietOpening } from './opening.ts'
import { Corner, Named, Search } from './ui.tsx'

export type Place = 'home' | 'messages' | 'you'

/** What the frame shows selected: a place, New profile, or one of the person's profiles. */
export type On = Place | 'new' | { profile: string }

/** Where the frame's buttons go. */
export type FrameGo = { place: (to: Place) => void; profile: (address: string) => void; newProfile: () => void }

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

/** A screen in its frame. `place`, when the screen is one: its tabs on a phone, and the reads it does as it opens. */
export function Frame({ on, place, go, children }: { on: On; place?: Place; go: FrameGo; children: ReactNode }) {
  const wide = useWide()
  useQuietOpening()
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
  ['messages', 'Messages', 'chat-circle'],
  ['you', 'You', 'user-circle'],
]

/** The phone's three tabs. */
function Tabs({ at, go }: { at: Place; go: (to: Place) => void }) {
  const { messages } = useMarks(useProfiles())
  return (
    <nav className="tabbar" aria-label="Places">
      {TABS.map(([place, words, icon]) => (
        <button key={place} className={at === place ? 'on' : ''} aria-current={at === place ? 'page' : undefined} onClick={() => go(place)}>
          <span className="ti">
            <Icon name={icon} fill={at === place} />
            {place === 'messages' && <Corner mark={messages} />}
          </span>
          {words}
        </button>
      ))}
    </nav>
  )
}

/** One of the sidebar's places, with its mark. */
function Nav({ on, icon, words, mark = 0, onClick }: { on: boolean; icon: IconName; words: string; mark?: Marked; onClick: () => void }) {
  return (
    <button className={on ? 'nav on' : 'nav'} aria-current={on ? 'page' : undefined} onClick={onClick}>
      <Icon name={icon} fill={on} />
      <span className="grow">{words}</span>
      <Corner mark={mark} />
    </button>
  )
}

/** The laptop's sidebar. */
function Side({ on, go }: { on: On; go: FrameGo }) {
  const list = useProfiles()
  const marks = useMarks(list)
  const shown = useInOrder(list)
  const held = new Set(list.map((p) => p.label))
  const at = typeof on === 'string' ? on : null
  return (
    <aside className="side">
      <div className="brand">
        <button type="button" className="mark-home" aria-label="Forest home" onClick={() => go.place('home')}>
          <Mark size={26} />
        </button>
        <Search />
      </div>
      <nav className="navs" aria-label="Places">
        <Nav on={at === 'home'} icon="house" words="Home" onClick={() => go.place('home')} />
        <Nav on={at === 'messages'} icon="chat-circle" words="Messages" mark={marks.messages} onClick={() => go.place('messages')} />
        <Nav on={at === 'you'} icon="user-circle" words="You" onClick={() => go.place('you')} />
      </nav>
      <div className="side-head">
        <h2 className="sect">Profiles</h2>
        {pairs.some((p) => !held.has(p.label)) && (
          <button className={at === 'new' ? 'minipill on' : 'minipill'} aria-label="New profile" onClick={go.newProfile}>
            <Icon name="plus" bold />
            New
          </button>
        )}
      </div>
      {shown.map((p) => {
        const here = typeof on === 'object' && on.profile === p.address
        return (
          <button key={p.address} className={here ? 'nav profile on' : 'nav profile'} aria-current={here ? 'page' : undefined} onClick={() => go.profile(p.address)}>
            <Avatar label={p.label} size="sm" />
            <span className="grow">
              <Named label={p.label} />
            </span>
            <Corner mark={marks.of[p.address]?.mark ?? 0} />
          </button>
        )
      })}
    </aside>
  )
}
