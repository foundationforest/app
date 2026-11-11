// Notifications, the middle place: what came to every one of the person's profiles, with nothing
// unlocked, and what a market outgrew of what they posted, under Today and Earlier, each one card,
// newest first. Messages open from the round button at the top right, with how many are new, which
// opens all their conversations. A review, vouch or report the index counted about any of them, in
// full: the avatar of who wrote it, "Review on your Tutoring tutor" in bold, when, a dot on those
// that came after what the device had seen as the screen opened, then its score or chip with who
// wrote it after it, by the person's name for them or their short key, then what they wrote; a tap
// on who wrote it, their avatar or name, opens their profile (Them.tsx), and anywhere else that
// profile's Reviews. From now they are seen (device.ts), as a
// profile's Reviews marks them, so the tab, the card and the profile's Reviews count them new no
// more. Each entry of the person's own that a market outgrew (flows/outgrown.ts), a listing or a
// review, vouch or report its market's file no longer takes as it is: a sun square, what needs an
// update and that the market changed; a tap opens its edit with what still fits. It shows no time:
// when the market changed, the app can't know; it sits by when it was posted.

import { useEffect, useState } from 'react'

import { saveSeen, seen } from '../device.ts'
import type { Posted } from '../flows/entries.ts'
import { type Notice, newest, notices } from '../flows/feedback.ts'
import { useHeldOutgrown, useHeldRated, useNews, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { kindWords, marketWords, markets, pairOf } from '../markets.ts'
import { cardLines } from '../show.ts'
import { Dot, MessagesButton, Named, SaidChip, Top, ago, newDay } from '../ui.tsx'
import { NameOf, WhoAvatar } from './Who.tsx'

type Props = { onMessages: () => void; onReviews: (address: string) => void; onUpdate: (address: string, posted: Posted) => void; onWho: (address: string) => void }

/** What an outgrown entry's notice says needs an update: a listing by its title, else "Your review". */
function needs(label: string, posted: Posted): string {
  if (posted.kind !== 'listing') return `Your ${posted.kind} needs an update`
  const market = markets.market(pairOf(label).market)
  // Its first line, as a name: "Spanish for adults", a full stop left off.
  const title = market ? cardLines(market, posted.body).title.replace(/[.!]+$/, '') : ''
  return `${title || 'Your listing'} needs an update`
}

/** One row of Notifications: a review, vouch or report that came, or one of the person's entries a market outgrew, and when. */
type Row = { time: number; notice: Notice } | { time: number; outgrown: Posted; label: string; address: string }

export function Notifications({ onMessages, onReviews, onUpdate, onWho }: Props) {
  const list = useProfiles()
  const { messages } = useNews(list)
  // Read by the frame as the screen opens, and held in the page meanwhile.
  const rated = useHeldRated(list)
  const outgrown = useHeldOutgrown(list)
  // What the device had seen of each profile as the screen opened: what came after has its dot while it is open.
  const [since] = useState(() => seen())
  const newestOf = list.map((p) => {
    const held = rated[p.address]
    return held && 'rated' in held ? newest(held.rated) : null
  })
  useEffect(() => {
    const marks: Record<string, number> = {}
    for (const p of list) {
      const held = rated[p.address]
      if (!held || !('rated' in held)) continue
      const last = newest(held.rated)
      if (last > (seen()[p.address] ?? 0)) marks[p.address] = last
    }
    if (Object.keys(marks).length) saveSeen(marks)
  }, [newestOf.join(',')])
  const label = (address: string) => list.find((p) => p.address === address)?.label ?? ''
  const rows: Row[] = [
    ...notices(list, rated, since).map((notice) => ({ time: notice.received.time ?? 0, notice })),
    ...list.flatMap((p) => (outgrown[p.address] ?? []).map((posted) => ({ time: posted.time, outgrown: posted, label: p.label, address: p.address }))),
  ].sort((a, b) => b.time - a.time)
  const now = Date.now()
  const groups = [
    { words: 'Today', rows: rows.filter((r) => !newDay(now, r.time)) },
    { words: 'Earlier', rows: rows.filter((r) => newDay(now, r.time)) },
  ].filter((g) => g.rows.length > 0)
  const unreached = list.some((p) => {
    const r = rated[p.address]
    return r && 'failed' in r
  })
  const read = newestOf.every((n) => n !== null) && list.every((p) => outgrown[p.address] !== undefined)
  return (
    <main>
      <Top right={<MessagesButton count={messages} onOpen={onMessages} />}>
        <h1>Notifications</h1>
      </Top>
      {groups.map((g) => (
        <section key={g.words} className="stack">
          <h2>{g.words}</h2>
          <div className="rows">
            {g.rows.map((r) =>
              'notice' in r ? (
                <Came key={r.notice.received.address} n={r.notice} label={label(r.notice.on)} onOpen={() => onReviews(r.notice.on)} onWho={() => onWho(r.notice.received.writer)} />
              ) : (
                <button key={`${r.address}/${r.outgrown.path}`} className="nrow" onClick={() => onUpdate(r.address, r.outgrown)}>
                  <span className="sq sun">
                    <Icon name="warning" fill />
                  </span>
                  <span className="grow">
                    <span className="nrow-head">
                      <strong>{needs(r.label, r.outgrown)}</strong>
                    </span>
                    <span className="said-text">The {marketWords(pairOf(r.label).market)} market changed. Tap to fix it.</span>
                  </span>
                </button>
              ),
            )}
          </div>
        </section>
      ))}
      {unreached ? <p className="line">Can't reach the index.</p> : rows.length === 0 && read && <p className="line">Nothing yet.</p>}
    </main>
  )
}

/** A review, vouch or report that came to the profile of `label`: who wrote it, what it is, when, its score or chip and who wrote it, what they wrote. The row's tap sits under who wrote it, since a button holds no button. */
function Came({ n, label, onOpen, onWho }: { n: Notice; label: string; onOpen: () => void; onWho: () => void }) {
  const r = n.received
  return (
    <div className="nrow came">
      <button type="button" className="said-open" aria-label={`${kindWords(r.kind, label)} on your ${pairOf(label).words}`} onClick={onOpen} />
      <button type="button" className="said-who" tabIndex={-1} aria-hidden onClick={onWho}>
        <WhoAvatar address={r.writer} />
      </button>
      <span className="grow">
        <span className="nrow-head">
          <strong>
            {kindWords(r.kind, label)} on your <Named label={label} />
          </strong>
          {r.time !== undefined && <span className="xs">{ago(r.time)}</span>}
        </span>
        <span className="said-head">
          <SaidChip kind={r.kind} score={r.body.score} />
          <button type="button" className="said-who" onClick={onWho}>
            <NameOf address={r.writer} />
          </button>
        </span>
        {typeof r.body.text === 'string' && r.body.text && <span className="said-text">{r.body.text}</span>}
      </span>
      {n.fresh && <Dot />}
    </div>
  )
}
