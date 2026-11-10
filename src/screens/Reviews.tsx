// A profile's Reviews, its second tab: what the index counted about it, reviews, vouches and
// reports together, newest first, each a card: its score with its star, or its chip, when, and a
// dot on those that came after the newest its Reviews or Notifications had shown of it, as the tab
// opened; from now they are seen (device.ts), so the profile's card and its tab count them new no
// more; what they wrote; and who wrote it, its avatar, its name and its badge. A tap opens it. Then,
// quietly, which index rated it. Then what the profile wrote about others, from its own folder,
// under Written by this profile, each with who it is about; a tap edits it. Nothing here asks the
// passkey.

import { type ReactNode, useEffect, useState } from 'react'

import { config } from '../config.ts'
import { type Profile, saveSeen, seen } from '../device.ts'
import type { Posted } from '../flows/entries.ts'
import { newest } from '../flows/feedback.ts'
import { useHeldRated } from '../hooks.ts'
import { Loader } from '../mark.tsx'
import { Dot, SaidChip, ago } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = { profile: Profile; given: Posted[] | null; onOpen: (at: string) => void; onEdit: (given: Posted) => void }

export function Reviews({ profile, given, onOpen, onEdit }: Props) {
  const { address } = profile
  // Read by the profile as it opened, and held in the page meanwhile.
  const held = useHeldRated([profile])[address]
  // The newest its Reviews had shown of this profile as the tab opened: what came after has its dot
  // while it is open. A profile with no mark yet is marked at what the index holds when first read
  // (flows/feedback.ts), so none is new.
  const [since] = useState(() => seen()[address] ?? Infinity)
  useEffect(() => {
    if (!held || !('rated' in held)) return
    const last = newest(held.rated)
    if (last > (seen()[address] ?? 0)) saveSeen({ [address]: last })
  }, [held])
  const written = given?.filter((g) => g.kind !== 'listing') ?? []
  return (
    <>
      {!held ? (
        <Loader big />
      ) : 'failed' in held ? (
        <p className="line">Can't reach the index.</p>
      ) : (
        <div className="cards">
          {held.rated.received.length === 0 && <p className="line">No reviews yet.</p>}
          {held.rated.received.map((r) => (
            <SaidCard key={r.address} kind={r.kind} score={r.body.score} text={r.body.text} {...(r.time !== undefined && { time: r.time })} fresh={(r.time ?? 0) > since} onClick={() => onOpen(r.address)}>
              <Who address={r.writer} />
            </SaidCard>
          ))}
          <p className="quiet-text center">Rated by {new URL(config.index).host}</p>
        </div>
      )}
      {written.length > 0 && (
        <>
          <h2>Written by this profile</h2>
          <div className="cards">
            {written.map((g) => (
              <SaidCard key={g.path} kind={g.kind as 'review' | 'vouch' | 'report'} score={g.body.score} text={g.body.text} time={g.time} onClick={() => onEdit(g)}>
                {typeof g.body.subject === 'string' && <Who address={g.body.subject} />}
              </SaidCard>
            ))}
          </div>
        </>
      )}
    </>
  )
}

/** A review, vouch or report as a card: its score or chip, when and the dot, what they wrote, then who (`children`). */
function SaidCard({ kind, score, text, time, fresh = false, onClick, children }: { kind: 'review' | 'vouch' | 'report'; score: unknown; text: unknown; time?: number; fresh?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button className="card said-card" onClick={onClick}>
      <span className="said-head">
        <SaidChip kind={kind} score={score} />
        <span className="grow" />
        {time !== undefined && <span className="xs">{ago(time)}</span>}
        {fresh && <Dot />}
      </span>
      {typeof text === 'string' && text && <span className="said-text">{text}</span>}
      {children}
    </button>
  )
}
