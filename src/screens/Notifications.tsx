// Notifications, the middle place: what came to every one of the person's profiles, with nothing
// unlocked. First, for each profile with new messages, one row, "New message · Clothing seller",
// with how many, which opens that profile's messages: a message reads only after an unlock, so
// neither its text nor its time shows here. Then every review, vouch and report the index counted
// about any of them, newest first, in full: its score or chip, its text, the profile it is about,
// when, and a dot on those that came after what the device had seen as the screen opened; a tap
// opens it. From now they are seen (device.ts), as Reviews marks them, so the tab, the card and the
// rating line count them new no more.

import { useEffect, useState } from 'react'

import { saveSeen, seen } from '../device.ts'
import { newest, notices } from '../flows/reviews.ts'
import { useHeldRated, useNewMessages, useProfiles } from '../hooks.ts'
import { Dot, Named, type Place, Places, SaidChip, Top, ago } from '../ui.tsx'

type Props = { go: (to: Place) => void; onMessages: (address: string) => void; onReceived: (address: string, entry: string) => void }

export function Notifications({ go, onMessages, onReceived }: Props) {
  const list = useProfiles()
  const messages = useNewMessages()
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
  const rows = notices(list, messages, rated, since)
  const label = (address: string) => list.find((p) => p.address === address)?.label ?? ''
  const unreached = list.some((p) => {
    const r = rated[p.address]
    return r && 'failed' in r
  })
  return (
    <main>
      <Top>
        <h1>Notifications</h1>
      </Top>
      <div className="rows">
        {rows.map((n) =>
          'messages' in n ? (
            <button key={`messages ${n.on}`} className="row said-row" onClick={() => onMessages(n.on)}>
              <span className="two">
                <span className="notice">
                  {n.messages === 1 ? 'New message' : 'New messages'} · <Named label={label(n.on)} />
                </span>
              </span>
              <span className="aside">
                <span className="count">{n.messages}</span>
              </span>
            </button>
          ) : (
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
          ),
        )}
      </div>
      {unreached ? <p className="line">Can't reach the index.</p> : rows.length === 0 && newestOf.every((n) => n !== null) && <p className="line">Nothing yet.</p>}
      <div className="fill" />
      <Places at="notifications" go={go} />
    </main>
  )
}
