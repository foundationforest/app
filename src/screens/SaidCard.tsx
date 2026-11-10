// A review, vouch or report as a card, on a profile's Reviews and on Written by you: its score with
// its star, or its chip; when, and a dot while it is new; what they wrote; then who, after one word
// that says how (`from`, "From" the writer of what came; else "About" the profile it is about).

import type { ReactNode } from 'react'

import { Dot, SaidChip, ago } from '../ui.tsx'

type Props = { kind: 'review' | 'vouch' | 'report'; score: unknown; text: unknown; time?: number; fresh?: boolean; from?: boolean; onClick: () => void; children: ReactNode }

export function SaidCard({ kind, score, text, time, fresh = false, from = false, onClick, children }: Props) {
  return (
    <button className="card said-card" onClick={onClick}>
      <span className="said-head">
        <SaidChip kind={kind} score={score} />
        <span className="grow" />
        {time !== undefined && <span className="xs">{ago(time)}</span>}
        {fresh && <Dot />}
      </span>
      {typeof text === 'string' && text && <span className="said-text">{text}</span>}
      <span className="said-who">
        <span className="xs">{from ? 'From' : 'About'}</span>
        {children}
      </span>
    </button>
  )
}
