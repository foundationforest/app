// Messages: the conversations of the person's profiles, from the round button at the top of
// Notifications (or the sidebar, on a laptop), or picked to one profile (`only`), from its own;
// only messages (reviews, vouches and reports show in Notifications and a profile's Reviews). At the
// top, Back, the title, and a round New message, always there.
// Before the unlock, only what is true: an inbox entry shows no one who wrote it (the standard's
// The inbox), so the avatars are those of the person's own profiles the new ones came to,
// overlapped, with how many ("3 new messages"); with none new, a lock and Open your messages. Open,
// one unlock, opens every profile's inbox and what it sent, into threads that stay open while the
// page is; with a seed held they open by themselves (opening.ts).
// Opened: chips that pick whose, All, then each of the person's profiles by its avatar and role; then
// the conversations in one card, newest first: who each is with (their avatar, market and role, the
// badge), when, the last message, bold with a dot while it holds a new one, and to which profile.

import { Avatar } from '../avatar.tsx'
import { type Thread } from '../flows/inbox.ts'
import { useNewMessages, useOpened, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { offersFirst } from '../markets.ts'
import { isFresh } from '../opened.ts'
import { useOpening } from '../opening.ts'
import { Dot, Line, Named, Top, UnlockIcon, ago } from '../ui.tsx'
import { Who, WhoAvatar } from './Who.tsx'

type Props = {
  /** The profile whose messages these are; every profile's, when none is named. */
  only?: string
  onOnly: (only?: string) => void
  onBack: () => void
  onThread: (mine: string, them: string) => void
  onNew: () => void
}

/** How many new messages: 1 new message, 3 new messages. */
const newWords = (n: number) => `${n} new message${n === 1 ? '' : 's'}`

export function Messages({ only, onOnly, onBack, onThread, onNew }: Props) {
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
  const labelOf = (address: string) => all.find((p) => p.address === address)?.label ?? ''

  return (
    <main>
      <Top
        onBack={onBack}
        clear
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
      ) : held && open.busy && !opened?.all ? (
        <Loader big />
      ) : (
        <>
          <div className="filters" role="group" aria-label="Whose">
            <button className={only ? 'chip' : 'chip here'} aria-pressed={!only} onClick={() => onOnly()}>
              All
            </button>
            {offersFirst(all).map((p) => (
              <button key={p.address} className={only === p.address ? 'chip here' : 'chip'} aria-pressed={only === p.address} aria-label={p.pair.words} onClick={() => onOnly(p.address)}>
                <Avatar label={p.label} size="xs" />
                {p.pair.role}
              </button>
            ))}
          </div>
          <Line note={open.note} />
          <div className="rows">
            {threads.map((t) => (
              <ThreadRow key={`${t.mine} ${t.them}`} t={t} mine={labelOf(t.mine)} onOpen={() => onThread(t.mine, t.them)} />
            ))}
          </div>
          {opened?.all && threads.length === 0 && <p className="line">No messages yet.</p>}
        </>
      )}
    </main>
  )
}

/** One conversation: who it is with, when, the last message, and to which of the person's profiles (`mine`, its label). */
function ThreadRow({ t, mine, onOpen }: { t: Thread; mine: string; onOpen: () => void }) {
  const last = t.messages.at(-1)
  const fresh = isFresh(t)
  return (
    <button className="row thread-row" onClick={onOpen}>
      <WhoAvatar address={t.them} who={t.who} />
      <span className="two">
        <span className="thread-head">
          <Who address={t.them} who={t.who} avatar={false} />
          {last && <span className="xs">{ago(last.time)}</span>}
        </span>
        <span className="thread-last">
          <span className={fresh ? 'text fresh' : 'text'}>{last?.text}</span>
          {fresh && <Dot />}
        </span>
        <span className="xs">
          to your <Named label={mine} />
        </span>
      </span>
    </button>
  )
}
