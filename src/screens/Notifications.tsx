// Notifications, the middle place: the reviews, vouches and reports that came to every one of the
// person's profiles, with nothing unlocked; messages are the inbox's, at the top right, with how
// many are new, which opens all their conversations. Every review, vouch and report the index
// counted about any of them, newest first, in full: its score or chip, its text, the profile it is
// about, when, and a dot on those that came after what the device had seen as the screen opened; a
// tap opens it. From now they are seen (device.ts), as Reviews marks them, so the tab, the card and
// the rating line count them new no more.

import { useEffect, useState } from 'react'

import { saveSeen, seen } from '../device.ts'
import { newest, notices } from '../flows/reviews.ts'
import { useHeldRated, useNews, useProfiles } from '../hooks.ts'
import { Dot, Inbox, Named, type Place, Places, SaidChip, Top, ago } from '../ui.tsx'

type Props = { go: (to: Place) => void; onMessages: () => void; onReceived: (address: string, entry: string) => void }

export function Notifications({ go, onMessages, onReceived }: Props) {
  const list = useProfiles()
  const { messages } = useNews(list)
  // Read by the places below as the screen opens (Places), and held in the page meanwhile.
  const rated = useHeldRated(list)
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
  const label = (address: string) => list.find((p) => p.address === address)?.label ?? ''
  const unreached = list.some((p) => {
    const r = rated[p.address]
    return r && 'failed' in r
  })
  return (
    <main>
      <Top right={<Inbox count={messages} onOpen={onMessages} />}>
        <h1>Notifications</h1>
      </Top>
      <div className="rows">
        {rows.map((n) => (
          <button key={n.received.address} className="row said-row" onClick={() => onReceived(n.on, n.received.address)}>
            <SaidChip kind={n.received.kind} score={n.received.body.score} />
            <span className="two">
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
      {unreached ? <p className="line">Can't reach the index.</p> : rows.length === 0 && newestOf.every((n) => n !== null) && <p className="line">Nothing yet.</p>}
      <div className="fill" />
      <Places at="notifications" go={go} />
    </main>
  )
}
