// A profile's reviews, from its rating line: the index's rating, big, how many reviews it counted,
// and, quietly, which index rated it. Received: what the index counted about the profile, each
// review with its score, each vouch and report with its chip, its text and when; a tap opens it.
// Given: the profile's own reviews, vouches and reports, from its folder, each with who it is
// about; a tap edits it. Then Review someone. Nothing here asks the passkey.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { type Posted, readPosts } from '../flows/posts.ts'
import { givenOf } from '../flows/reviews.ts'
import { useProfiles, useRated } from '../hooks.ts'
import { ratingText, reviewCount } from '../show.ts'
import { Line, type Note, SaidChip, Spinner, Top, ago, noteOf } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = { address: string; onBack: () => void; onOpen: (at: string) => void; onEdit: (given: Posted) => void; onReview: () => void }

export function Reviews({ address, onBack, onOpen, onEdit, onReview }: Props) {
  const profile = useProfiles().find((p) => p.address === address)
  const held = useRated(profile ? [profile] : [])[address]
  const [tab, setTab] = useState<'received' | 'given'>('received')
  const [given, setGiven] = useState<Posted[] | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  useEffect(() => {
    let live = true
    readPosts(config, address).then(
      (p) => live && setGiven(givenOf(p)),
      (err: unknown) => live && setNote(noteOf(err)),
    )
    return () => void (live = false)
  }, [address])
  if (!profile) return null
  const rated = held && 'rated' in held ? held.rated : null
  return (
    <main className="with-foot">
      <Top onBack={onBack} />
      <div className="stack center">
        {rated?.rating != null ? <strong className="big">{ratingText(rated.rating)}</strong> : <strong className="big">–</strong>}
        <p>{rated?.reviews ? reviewCount(rated.reviews) : 'No reviews yet'}</p>
        <p className="quiet-text">Rated by {new URL(config.index).host}</p>
      </div>
      <div className="tabs" role="tablist">
        {(['received', 'given'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'here' : ''} onClick={() => setTab(t)}>
            {t === 'received' ? 'Received' : 'Given'}
          </button>
        ))}
      </div>
      {tab === 'received' ? (
        !held ? (
          <Spinner />
        ) : 'failed' in held ? (
          <p className="line">Can't reach the index.</p>
        ) : (
          <div className="rows">
            {held.rated.received.map((r) => (
              <button key={r.address} className="row said-row" onClick={() => onOpen(r.address)}>
                <SaidChip kind={r.kind} score={r.body.score} />
                <span className="two">
                  <span>{typeof r.body.text === 'string' ? r.body.text : ''}</span>
                </span>
                {r.time !== undefined && <span className="aside">{ago(r.time)}</span>}
              </button>
            ))}
          </div>
        )
      ) : given === null ? (
        note ? <Line note={note} /> : <Spinner />
      ) : (
        <div className="rows">
          {given.map((g) => (
            <button key={g.path} className="row said-row" onClick={() => onEdit(g)}>
              <SaidChip kind={g.kind as 'review' | 'vouch' | 'report'} score={g.body.score} />
              <span className="two">
                {typeof g.body.subject === 'string' && <Who address={g.body.subject} />}
                {typeof g.body.text === 'string' && <span>{g.body.text}</span>}
              </span>
              <span className="aside">{ago(g.time)}</span>
            </button>
          ))}
        </div>
      )}
      <div className="foot">
        <button className="primary" onClick={onReview}>
          Review someone
        </button>
      </div>
    </main>
  )
}
