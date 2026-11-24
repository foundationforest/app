// Messages, the middle place: the conversations of the person's profiles, or of one (`only`), from
// its messages button, with Back to it. Only messages (what a profile received shows on its Reviews,
// counted on its rating). At the top, the title: a message to someone new starts from their listing
// or their profile, never from an address typed here.
// Before they are opened: an inbox entry shows no one who wrote it (the standard's The inbox), so
// only what is true: the lock, "New messages" when some came, and Open, strong green with the unlock
// icon, one unlock opening every profile's inbox and what it sent, into threads that stay open while
// the page is (opening.ts). A tap into Messages asks the passkey itself, so this shows only once its
// prompt was closed, or after a reload; with a seed held they open by themselves, the loader showing
// once that takes half a second, alone in the middle of the screen: on a laptop across both panes
// (theme.css).
// Opened: chips that pick whose, small, on one row that scrolls sideways: All, then each of the
// person's profiles in the order they were made, a dot in its market's color and its market (Home
// cleaning), its role added only where two of theirs share a market (Goods selling seller, Goods
// selling buyer), the one picked on the soft green; then the conversations, what is new first, newest
// first, then the rest (order.ts), each a row of two lines, as any messaging app has them: who it is
// with, the person's name for them or their short key, bold and never cut, the title of the listing
// it is about beside it when there is one, cut with "…", and when, at the right; then the last
// message on one line, "You: " before the person's own. With something new, that line bold and a
// black dot at its right. Their picture carries their market's badge, the icon of the person's own
// profile there, so it says which of theirs the conversation is with. On a laptop it is the left of
// two panes (`pane`, Panes.tsx), the conversation open on the right, its row on the soft green.
// Before it is opened there is no split: the lock, its line and Open are one block, centred across
// the whole content (theme.css, `closed`).

import type { CSSProperties } from 'react'

import { aboutOf } from '../about.ts'
import { colorOf } from '../avatar.tsx'
import { marked } from '../counts.ts'
import { type Thread } from '../flows/inbox.ts'
import { useInOrder, useMarks, useOpened, useProfiles, useSteady } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { marketWords, pairOf } from '../markets.ts'
import { isFresh } from '../opened.ts'
import { useOpening, useSeen } from '../opening.ts'
import { newFirst } from '../order.ts'
import { Dot, Line, type Note, Top, UnlockIcon, when } from '../ui.tsx'
import { ListingTitle } from './AboutListing.tsx'
import { NameOf, WhoAvatar } from './Who.tsx'

type Props = {
  /** The profile whose messages these are; every profile's, when none is named. */
  only?: string
  /** The left of two panes, on a laptop; `open`, the conversation open on the right. */
  pane?: boolean
  open?: { mine: string; them: string }
  /** Back to the profile these were opened from. */
  onBack?: () => void
  onOnly: (only?: string) => void
  onThread: (mine: string, them: string) => void
}

export function Messages({ only, pane = false, open: shown, onBack, onOnly, onThread }: Props) {
  const all = useProfiles()
  const chips = useInOrder(all)
  const list = only ? all.filter((p) => p.address === only) : all
  const marks = useMarks(list)
  const opened = useOpened()
  const { open, need, held } = useOpening()
  const threads = (opened?.threads ?? []).filter((t) => list.some((p) => p.address === t.mine))
  const ordered = useSteady(
    newFirst(threads, isFresh, (t) => t.messages.at(-1)?.time ?? 0),
    (t) => `${t.mine} ${t.them}`,
  )
  // Something still to open: with a seed held it opens by itself, unless that failed; else Open.
  const closed = list.length > 0 && need && (!held || open.note !== null)
  const fresh = list.some((p) => marked(marks.of[p.address]?.messages ?? 0))
  useSeen(!closed)

  const Root = pane ? 'div' : 'main'
  if (!closed && list.length > 0 && !opened?.all)
    return (
      <Root className={pane ? 'pane-body loading' : 'loading'}>
        <div className="fill" />
        <Loader big />
        <div className="fill" />
      </Root>
    )
  return (
    <Root className={pane ? (closed ? 'pane-body closed' : 'pane-body') : undefined}>
      <Top {...(onBack && { onBack })} clear>
        <h1>Messages</h1>
      </Top>
      {closed ? (
        <Closed fresh={fresh} note={open.note} busy={open.busy} onOpen={() => void open.run()} />
      ) : (
        <>
          <div className="filters" role="group" aria-label="Whose">
            <button className={only ? 'chip' : 'chip here'} aria-pressed={!only} onClick={() => onOnly()}>
              All
            </button>
            {chips.map((p) => (
              <button key={p.address} className={only === p.address ? 'chip here' : 'chip'} aria-pressed={only === p.address} style={{ '--h': colorOf(p.pair.market) } as CSSProperties} onClick={() => onOnly(p.address)}>
                <span className="fdot" aria-hidden />
                {all.some((q) => q.address !== p.address && pairOf(q.label).market === p.pair.market) ? p.pair.words : marketWords(p.pair.market)}
              </button>
            ))}
          </div>
          <Line note={open.note} />
          <div className="threads">
            {ordered.map((t) => (
              <ThreadRow key={`${t.mine} ${t.them}`} t={t} market={pairOf(all.find((p) => p.address === t.mine)!.label).market} here={shown?.mine === t.mine && shown.them === t.them} onOpen={() => onThread(t.mine, t.them)} />
            ))}
          </div>
          {opened?.all && threads.length === 0 && <p className="quiet none">No messages yet</p>}
        </>
      )}
    </Root>
  )
}

/** The messages before they are opened: the lock, "New messages" when some came, and Open, which asks the passkey. */
export function Closed({ fresh, note, busy, onOpen }: { fresh: boolean; note: Note | null; busy: boolean; onOpen: () => void }) {
  return (
    <>
      <div className="fill" />
      <div className="unopened">
        <span className="sq big plain">
          <Icon name="lock-simple" fill />
        </span>
        {fresh && <h2>New messages</h2>}
      </div>
      <Line note={note} />
      <button className="primary" disabled={busy} onClick={onOpen}>
        {busy ? (
          <Loader />
        ) : (
          <>
            <UnlockIcon /> Open
          </>
        )}
      </button>
      <div className="fill" />
    </>
  )
}

/**
 * One conversation, in two lines: who it is with, bold, the title of the listing it is about beside
 * it (unless `titled` is false: an offer's own conversations, all about it), and when; then the last
 * message, "You: " before the person's own; their picture with the market's badge; `here` while it
 * is open beside the list.
 */
export function ThreadRow({ t, market, here, titled = true, onOpen }: { t: Thread; market: string; here: boolean; titled?: boolean; onOpen: () => void }) {
  const last = t.messages.at(-1)
  const fresh = isFresh(t)
  const about = titled ? aboutOf(t.messages, t.mine, t.them) : undefined
  return (
    <button className={`thread-row${here ? ' here' : ''}${fresh ? ' fresh' : ''}`} aria-current={here ? 'true' : undefined} onClick={onOpen}>
      <WhoAvatar address={t.them} who={t.who} badge={market} />
      <span className="two">
        <span className="thread-top">
          <NameOf address={t.them} />
          {about ? <ListingTitle address={about} /> : <span className="grow" />}
          {last && <span className="xs when">{when(last.time)}</span>}
        </span>
        <span className="thread-last">
          <span className={fresh ? 'text fresh' : 'text'}>{last ? (last.mine ? `You: ${last.text}` : last.text) : ''}</span>
          {fresh && <Dot />}
        </span>
      </span>
    </button>
  )
}
