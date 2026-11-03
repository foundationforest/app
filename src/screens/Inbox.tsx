// The Inbox: what came to the person's profiles, or to one of them, from its inbox icon. Reviews,
// vouches and reports about them, as the index counted them, with nothing unlocked: the score's chip,
// which of the person's profiles it is about, its text, and when; a dot on those the Inbox had not
// shown before, and from now it has. Messages: before the unlock one row, how many are new, and
// Open; one unlock opens every profile's inbox and what it sent, into threads that stay open while
// the page is, each with who it is from, its last message, when, and a dot when it holds a new one.
// All, Messages or Reviews; and a pencil for a new message.

import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react'

import { config } from '../config.ts'
import { type Profile, passkey, profiles, saveCursors, saveSeen, seen } from '../device.ts'
import { type Thread, openAll } from '../flows/inbox.ts'
import { type Received, newest } from '../flows/reviews.ts'
import { useHeldRated, useNewMessages, useOpened, useProfiles, useRated } from '../hooks.ts'
import { pairOf } from '../markets.ts'
import { hold, isFresh } from '../opened.ts'
import { withSeed } from '../passkey.ts'
import { checkInWorker } from '../proof/prove.ts'
import { Dot, Line, MessageIcon, PencilIcon, type Place, Places, SaidChip, Spinner, Top, UnlockIcon, ago, useAction } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = {
  /** The one profile shown, from its inbox icon; else all of them. */
  only?: string
  go: (to: Place) => void
  onBack?: () => void
  onThread: (mine: string, them: string) => void
  onReceived: (mine: string, at: string) => void
  onNew: () => void
}

type Filter = 'all' | 'messages' | 'reviews'
const FILTERS: Array<[Filter, string]> = [
  ['all', 'All'],
  ['messages', 'Messages'],
  ['reviews', 'Reviews'],
]

type Item = { time: number; key: string; draw: () => ReactNode }

export function Inbox({ only, go, onBack, onThread, onReceived, onNew }: Props) {
  const all = useProfiles()
  const list = only ? all.filter((p) => p.address === only) : all
  useRated(only ? list : [])
  const rated = useHeldRated(list)
  const fresh = useNewMessages()
  const held = useOpened()
  const [filter, setFilter] = useState<Filter>('all')
  // The time of the newest entry the Inbox had shown of each profile, as this screen opened: what is
  // newer has its dot while the screen is open.
  const shown = useRef<Record<string, number>>({})
  useEffect(() => {
    const marks = seen()
    const more: Record<string, number> = {}
    for (const p of list) {
      const h = rated[p.address]
      if (!h || !('rated' in h)) continue
      if (!(p.address in shown.current)) shown.current[p.address] = marks[p.address] ?? 0
      const last = newest(h.rated)
      if (last > (marks[p.address] ?? 0)) more[p.address] = last
    }
    if (Object.keys(more).length) saveSeen(more)
  })

  const open = useAction(async () => {
    const ids = Object.values(fresh).flat()
    const got = await withSeed(passkey()!, (seed) => openAll(config, seed, profiles(), checkInWorker))
    hold(got.threads, ids)
    saveCursors(got.cursors)
  })

  const newCount = list.reduce((n, p) => n + (fresh[p.address]?.length ?? 0), 0)
  const threads = (held?.threads ?? []).filter((t) => list.some((p) => p.address === t.mine))
  const marks = seen()
  const items: Item[] = []
  if (filter !== 'messages') {
    for (const p of list) {
      const h = rated[p.address]
      if (!h || !('rated' in h)) continue
      const since = shown.current[p.address] ?? marks[p.address] ?? 0
      for (const r of h.rated.received) items.push({ time: r.time ?? 0, key: r.address, draw: () => <ReceivedRow p={p} r={r} isNew={(r.time ?? 0) > since} onOpen={() => onReceived(p.address, r.address)} /> })
    }
  }
  if (filter !== 'reviews') {
    for (const t of threads) items.push({ time: t.messages.at(-1)?.time ?? 0, key: `${t.mine} ${t.them}`, draw: () => <ThreadRow t={t} onOpen={() => onThread(t.mine, t.them)} /> })
  }
  items.sort((a, b) => b.time - a.time)
  const failed = list.some((p) => {
    const h = rated[p.address]
    return h && 'failed' in h
  })
  const loading = filter !== 'messages' && list.some((p) => !rated[p.address])

  return (
    <main>
      <Top
        {...(onBack && { onBack })}
        right={
          <button className="plain" aria-label="New message" onClick={onNew}>
            <PencilIcon />
          </button>
        }
      >
        <h1>{only && list[0] ? pairOf(list[0].label).words : 'Inbox'}</h1>
      </Top>
      <div className="tabs" role="tablist">
        {FILTERS.map(([f, words]) => (
          <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'here' : ''} onClick={() => setFilter(f)}>
            {words}
          </button>
        ))}
      </div>
      {filter !== 'reviews' && list.length > 0 && (!held || newCount > 0) && (
        <div className="row messages-row">
          <span>{newCount ? `${newCount} new message${newCount === 1 ? '' : 's'}` : 'Messages'}</span>
          <button className="primary small" disabled={open.busy} onClick={() => open.run()}>
            {open.busy ? <Spinner /> : <><UnlockIcon /> Open</>}
          </button>
        </div>
      )}
      <Line note={open.note} />
      <div className="rows">
        {items.map((i) => (
          <Fragment key={i.key}>{i.draw()}</Fragment>
        ))}
      </div>
      {loading && <Spinner />}
      {failed && filter !== 'messages' && <p className="line">Can't reach the index.</p>}
      <div className="fill" />
      {!only && <Places at="inbox" go={go} />}
    </main>
  )
}

function ReceivedRow({ p, r, isNew, onOpen }: { p: Profile; r: Received; isNew: boolean; onOpen: () => void }) {
  return (
    <button className="row said-row" onClick={onOpen}>
      <SaidChip kind={r.kind} score={r.body.score} />
      <span className="two">
        <strong>{pairOf(p.label).words}</strong>
        {typeof r.body.text === 'string' && <span>{r.body.text}</span>}
      </span>
      <span className="aside">
        {r.time !== undefined && ago(r.time)}
        {isNew && <Dot />}
      </span>
    </button>
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
