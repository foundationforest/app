// Messages: the conversations of every one of the person's profiles, from the inbox at the top of
// Profiles and Notifications, or of one profile (`only`), from the inbox at its top; only messages
// (reviews, vouches and reports show in Notifications and a profile's Reviews). Each conversation
// shows who it is with, its last message, when, and a dot when it holds a new one, newest first.
// With a seed held they open by themselves (opening.ts); with none, one row says how many are new
// ("3 new messages", or "No new messages"), with Open: one unlock opens every profile's inbox and
// what it sent, into threads that stay open while the page is. At the bottom, New message.

import { type Thread } from '../flows/inbox.ts'
import { useNewMessages, useOpened, useProfiles } from '../hooks.ts'
import { isFresh } from '../opened.ts'
import { useOpening } from '../opening.ts'
import { Dot, Line, MessageIcon, Named, Spinner, Top, UnlockIcon, ago } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = {
  /** The profile whose messages these are; every profile's, when none is named. */
  only?: string
  onBack: () => void
  onThread: (mine: string, them: string) => void
  onNew: () => void
}

/** How many new messages: No new messages, 1 new message, 3 new messages. */
const newWords = (n: number) => (n === 0 ? 'No new messages' : `${n} new message${n === 1 ? '' : 's'}`)

export function Messages({ only, onBack, onThread, onNew }: Props) {
  const all = useProfiles()
  const list = only ? all.filter((p) => p.address === only) : all
  const fresh = useNewMessages()
  const opened = useOpened()
  const { open, need, held } = useOpening()

  const newCount = list.reduce((n, p) => n + (fresh[p.address]?.length ?? 0), 0)
  const threads = (opened?.threads ?? []).filter((t) => list.some((p) => p.address === t.mine))
  // Something still to open: with a seed held it opens by itself, unless that failed; else Open.
  const asking = need && (!held || open.note !== null)

  return (
    <main>
      <Top onBack={onBack}>
        <h1>{only ? list[0] && <Named label={list[0].label} /> : 'Messages'}</h1>
      </Top>
      {list.length > 0 && asking && (
        <div className="row messages-row">
          <span>{newWords(newCount)}</span>
          <button className="primary small" disabled={open.busy} onClick={() => open.run()}>
            {open.busy ? <Spinner /> : <><UnlockIcon /> Open</>}
          </button>
        </div>
      )}
      {held && open.busy && <Spinner />}
      <Line note={open.note} />
      <div className="rows">
        {threads.map((t) => (
          <ThreadRow key={`${t.mine} ${t.them}`} t={t} onOpen={() => onThread(t.mine, t.them)} />
        ))}
      </div>
      <div className="fill" />
      <button className="primary" onClick={onNew}>
        New message
      </button>
    </main>
  )
}

function ThreadRow({ t, onOpen }: { t: Thread; onOpen: () => void }) {
  const last = t.messages.at(-1)
  return (
    <button className="row said-row" onClick={onOpen}>
      <MessageIcon />
      <span className="two">
        <strong>
          <Who address={t.them} who={t.who} />
        </strong>
        <span className="last">{last?.text}</span>
      </span>
      <span className="aside">
        {last && ago(last.time)}
        {isFresh(t) && <Dot />}
      </span>
    </button>
  )
}
