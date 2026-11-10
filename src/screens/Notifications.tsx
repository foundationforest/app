// Notifications, the middle place: first, each entry of the person's own that a market outgrew
// (flows/outgrown.ts), a listing or a review, vouch or report its market's file no longer takes as
// it is, with Update, which opens its edit with what still fits; then the reviews, vouches and
// reports that came to every one of their profiles, with nothing unlocked. Messages open from the
// round button at the top right, with how many are new, which opens all their conversations. Every
// review, vouch and report the index counted about any of them, newest first, in full: the avatar
// of the profile it is about, its score or chip, its text, that profile, when, and a dot on those
// that came after what the device had seen as the screen opened; a tap opens it. From now they are
// seen (device.ts), as a profile's Feedback marks them, so the tab, the card and the rating line
// count them new no more. Each profile's own Feedback stays its own, opened from its rating.

import { useEffect, useState } from 'react'

import { Avatar } from '../avatar.tsx'
import { saveSeen, seen } from '../device.ts'
import type { Posted } from '../flows/entries.ts'
import { newest, notices } from '../flows/feedback.ts'
import { useHeldOutgrown, useHeldRated, useNews, useProfiles } from '../hooks.ts'
import { markets, pairOf } from '../markets.ts'
import { rowLines } from '../show.ts'
import { Dot, MessagesButton, Named, SaidChip, Top, ago } from '../ui.tsx'

type Props = { onMessages: () => void; onReceived: (address: string, entry: string) => void; onUpdate: (address: string, posted: Posted) => void }

/** What an outgrown entry's notice says it needs. */
const update = (posted: Posted) => `Update this ${posted.kind}`

/** The line an outgrown entry's notice shows of it: a listing's first preview line, else its text. */
function lineOf(label: string, posted: Posted): string {
  if (posted.kind !== 'listing') return typeof posted.body.text === 'string' ? posted.body.text : ''
  const market = markets.market(pairOf(label).market)
  return market ? (rowLines(market, posted.body)[0] ?? '') : ''
}

export function Notifications({ onMessages, onReceived, onUpdate }: Props) {
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
  const rows = notices(list, rated, since)
  const updates = list.flatMap((p) => (outgrown[p.address] ?? []).map((posted) => ({ p, posted })))
  const label = (address: string) => list.find((p) => p.address === address)?.label ?? ''
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
      <div className="rows">
        {updates.map(({ p, posted }) => {
          const line = lineOf(p.label, posted)
          return (
            <button key={`${p.address}/${posted.path}`} className="row said-row" onClick={() => onUpdate(p.address, posted)}>
              <Avatar label={p.label} />
              <span className="two">
                <strong>{update(posted)}</strong>
                {line && <span className="said-text">{line}</span>}
                <span>
                  <Named label={p.label} />
                </span>
              </span>
            </button>
          )
        })}
        {rows.map((n) => (
          <button key={n.received.address} className="row said-row" onClick={() => onReceived(n.on, n.received.address)}>
            <Avatar label={label(n.on)} />
            <span className="two">
              <span>
                <SaidChip kind={n.received.kind} score={n.received.body.score} />
              </span>
              {typeof n.received.body.text === 'string' && n.received.body.text && <span className="said-text">{n.received.body.text}</span>}
              <span>
                <Named label={label(n.on)} />
              </span>
            </span>
            <span className="aside">
              {n.received.time !== undefined && ago(n.received.time)}
              {n.fresh && <Dot />}
            </span>
          </button>
        ))}
      </div>
      {unreached ? <p className="line">Can't reach the index.</p> : rows.length === 0 && updates.length === 0 && read && <p className="line">Nothing yet.</p>}
    </main>
  )
}
