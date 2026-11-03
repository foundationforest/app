// Messages: the messages that came to the person's profiles, or to one of them, from its messages
// icon; only messages (reviews, vouches and reports about a profile show on it: Profile.tsx,
// Reviews.tsx). Before the unlock one row, how many are new ("3 new messages", or "No new
// messages"), and Open; one unlock opens every profile's inbox and what it sent, into threads that
// stay open while the page is, each with who it is from, its last message, when, and a dot when it
// holds a new one. At the bottom, New message.

import { config } from '../config.ts'
import { passkey, profiles, saveCursors } from '../device.ts'
import { type Thread, openAll } from '../flows/inbox.ts'
import { useNewMessages, useOpened, useProfiles } from '../hooks.ts'
import { hold, isFresh } from '../opened.ts'
import { withSeed } from '../passkey.ts'
import { checkInWorker } from '../proof/prove.ts'
import { Dot, Line, MessageIcon, Named, type Place, Places, Spinner, Top, UnlockIcon, ago, useAction } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = {
  /** The one profile shown, from its messages icon; else all of them. */
  only?: string
  go: (to: Place) => void
  onBack?: () => void
  onThread: (mine: string, them: string) => void
  onNew: () => void
}

/** How many new messages: No new messages, 1 new message, 3 new messages. */
const newWords = (n: number) => (n === 0 ? 'No new messages' : `${n} new message${n === 1 ? '' : 's'}`)

export function Messages({ only, go, onBack, onThread, onNew }: Props) {
  const all = useProfiles()
  const list = only ? all.filter((p) => p.address === only) : all
  const fresh = useNewMessages()
  const held = useOpened()

  const open = useAction(async () => {
    const ids = Object.values(fresh).flat()
    const got = await withSeed(passkey()!, (seed) => openAll(config, seed, profiles(), checkInWorker))
    hold(got.threads, ids)
    saveCursors(got.cursors)
  })

  const newCount = list.reduce((n, p) => n + (fresh[p.address]?.length ?? 0), 0)
  const threads = (held?.threads ?? []).filter((t) => list.some((p) => p.address === t.mine))

  return (
    <main>
      <Top {...(onBack && { onBack })}>
        <h1>{only && list[0] ? <Named label={list[0].label} /> : 'Messages'}</h1>
      </Top>
      {list.length > 0 && (!held || newCount > 0) && (
        <div className="row messages-row">
          <span>{newWords(newCount)}</span>
          <button className="primary small" disabled={open.busy} onClick={() => open.run()}>
            {open.busy ? <Spinner /> : <><UnlockIcon /> Open</>}
          </button>
        </div>
      )}
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
      {!only && <Places at="messages" go={go} />}
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
