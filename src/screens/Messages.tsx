// Messages: the conversations of the person's profiles, from the round button at the top of
// Notifications (or the sidebar, on a laptop), or picked to one profile (`only`), from its own;
// only messages (reviews, vouches and reports show in Notifications and a profile's Reviews). At the
// top, the title and a round New message, always there; on a phone, the tabs at the bottom, with
// Notifications picked, since Messages is reached from there.
// Before the unlock, only what is true: an inbox entry shows no one who wrote it (the standard's
// The inbox), so the avatars are those of the person's own profiles the new ones came to,
// overlapped, with how many ("3 new messages"); with none new, a lock and Open your messages. Open,
// one unlock, opens every profile's inbox and what it sent, into threads that stay open while the
// page is; with a seed held they open by themselves (opening.ts), the loader showing once that takes
// half a second, alone in the middle of the screen: on a laptop across both panes (theme.css).
// Opened: chips that pick whose, All, then each of the person's profiles, a dot in its market's color
// and its market and role (Clothing seller); then the conversations in one card, newest first, each
// as little as tells them apart: who it is with (their avatar, the person's name for them, else
// their short key in the key's face) and when, then the last message on one line, bold with a dot
// while it holds a new one. Their badges, market and role are on their profile, one tap away.
// On a laptop it is the left of two panes (`pane`, Panes.tsx), the sidebar beside it, and the
// conversation open on the right marked here.

import type { CSSProperties } from 'react'

import { Avatar, colorOf } from '../avatar.tsx'
import { type Thread } from '../flows/inbox.ts'
import { useNewMessages, useOpened, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { offersFirst } from '../markets.ts'
import { isFresh } from '../opened.ts'
import { useOpening } from '../opening.ts'
import { Dot, Line, Top, UnlockIcon, when } from '../ui.tsx'
import { NameOf, WhoAvatar } from './Who.tsx'

type Props = {
  /** The profile whose messages these are; every profile's, when none is named. */
  only?: string
  /** The left of two panes, on a laptop: no Back; `open`, the conversation open on the right. */
  pane?: boolean
  open?: { mine: string; them: string }
  onOnly: (only?: string) => void
  onThread: (mine: string, them: string) => void
  onNew: () => void
}

/** How many new messages: 1 new message, 3 new messages. */
const newWords = (n: number) => `${n} new message${n === 1 ? '' : 's'}`

export function Messages({ only, pane = false, open: shown, onOnly, onThread, onNew }: Props) {
  const all = useProfiles()
  const list = only ? all.filter((p) => p.address === only) : all
  const fresh = useNewMessages()
  const opened = useOpened()
  const { open, need, held } = useOpening()

  const newTo = list.filter((p) => (fresh[p.address]?.length ?? 0) > 0)
  const newCount = newTo.reduce((n, p) => n + fresh[p.address]!.length, 0)
  const threads = (opened?.threads ?? []).filter((t) => list.some((p) => p.address === t.mine))
  // Something still to open: with a seed held it opens by itself, unless that failed; else Open.
  const asking = need && (!held || open.note !== null)

  const Root = pane ? 'div' : 'main'
  if (!(list.length > 0 && asking) && held && open.busy && !opened?.all)
    return (
      <Root className={pane ? 'pane-body loading' : 'loading'}>
        <div className="fill" />
        <Loader big />
        <div className="fill" />
      </Root>
    )
  return (
    <Root className={pane ? 'pane-body' : undefined}>
      <Top
        right={
          <button className="round" aria-label="New message" onClick={onNew}>
            <Icon name="note-pencil" />
          </button>
        }
      >
        <h1>Messages</h1>
      </Top>
      {list.length > 0 && asking ? (
        <>
          <div className="fill" />
          <div className="unopened">
            {newCount > 0 ? (
              <span className="stacked">
                {newTo.map((p) => (
                  <Avatar key={p.address} label={p.label} />
                ))}
              </span>
            ) : (
              <span className="sq big mint">
                <Icon name="lock-simple" fill />
              </span>
            )}
            <h2>{newCount > 0 ? newWords(newCount) : 'Open your messages'}</h2>
          </div>
          <Line note={open.note} />
          <button className="primary" disabled={open.busy} onClick={() => open.run()}>
            {open.busy ? <Loader /> : <><UnlockIcon /> Open</>}
          </button>
          <div className="fill" />
        </>
      ) : (
        <>
          <div className="filters" role="group" aria-label="Whose">
            <button className={only ? 'chip' : 'chip here'} aria-pressed={!only} onClick={() => onOnly()}>
              All
            </button>
            {offersFirst(all).map((p) => (
              <button key={p.address} className={only === p.address ? 'chip here' : 'chip'} aria-pressed={only === p.address} style={{ '--h': colorOf(p.pair.market) } as CSSProperties} onClick={() => onOnly(p.address)}>
                <span className="fdot" aria-hidden />
                {p.pair.words}
              </button>
            ))}
          </div>
          <Line note={open.note} />
          <div className="rows">
            {threads.map((t) => (
              <ThreadRow key={`${t.mine} ${t.them}`} t={t} here={shown?.mine === t.mine && shown.them === t.them} onOpen={() => onThread(t.mine, t.them)} />
            ))}
          </div>
          {opened?.all && threads.length === 0 && <p className="line">No messages yet.</p>}
        </>
      )}
    </Root>
  )
}

/** One conversation: who it is with and when, then the last message; `here` while it is open beside the list. */
function ThreadRow({ t, here, onOpen }: { t: Thread; here: boolean; onOpen: () => void }) {
  const last = t.messages.at(-1)
  const fresh = isFresh(t)
  return (
    <button className={here ? 'row thread-row here' : 'row thread-row'} aria-current={here ? 'true' : undefined} onClick={onOpen}>
      <WhoAvatar address={t.them} who={t.who} />
      <span className="two">
        <span className="thread-top">
          <NameOf address={t.them} />
          {last && <span className="xs">{when(last.time)}</span>}
        </span>
        <span className="thread-last">
          <span className={fresh ? 'text fresh' : 'text'}>{last?.text}</span>
          {fresh && <Dot />}
        </span>
      </span>
    </button>
  )
}
