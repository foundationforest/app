// Written by you, a profile's second tab: the reviews, vouches and reports this profile wrote, from
// its own folder, newest first, each a card that says About before who it is about (their avatar,
// market, role and badge), never this profile's own name; a tap edits it. With none, the tab says
// so in one quiet line. Review someone at its foot either way. Nothing here asks the passkey.

import type { Posted } from '../flows/entries.ts'
import { givenOf } from '../flows/feedback.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { SaidCard } from './SaidCard.tsx'
import { Who } from './Who.tsx'

type Props = { entries: Posted[] | null; onEdit: (given: Posted) => void; onReview: () => void }

export function Written({ entries, onEdit, onReview }: Props) {
  const written = entries ? givenOf(entries) : null
  return (
    <>
      {written === null ? (
        <Loader big />
      ) : written.length === 0 ? (
        <p className="line">Reviews you write as this profile show here</p>
      ) : (
        <div className="cards">
          {written.map((g) => (
            <SaidCard key={g.path} kind={g.kind as 'review' | 'vouch' | 'report'} score={g.body.score} text={g.body.text} time={g.time} onClick={() => onEdit(g)}>
              {typeof g.body.subject === 'string' && <Who address={g.body.subject} />}
            </SaidCard>
          ))}
        </div>
      )}
      <div className="foot">
        <button onClick={onReview}>
          <Icon name="star" bold />
          Review someone
        </button>
      </div>
    </>
  )
}
