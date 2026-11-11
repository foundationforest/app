// A profile's second tab, Reviews: the reviews, vouches and reports this profile wrote, from its own
// folder, newest first, under one quiet line that says what they are. Each a card: its score or
// chip, who it is about, by the person's name for them or their short key, never this profile's own
// name; a tap on the card edits it, a tap on who opens their profile. Review someone at its foot.
// Nothing here asks the passkey.

import type { Posted } from '../flows/entries.ts'
import { givenOf } from '../flows/feedback.ts'
import { Icon } from '../icons.tsx'
import { SaidCard } from './SaidCard.tsx'

type Props = { entries: Posted[] | null; onEdit: (given: Posted) => void; onReview?: () => void; onWho: (address: string) => void }

export function Written({ entries, onEdit, onReview, onWho }: Props) {
  const written = entries ? givenOf(entries) : null
  return (
    <>
      <p className="ctx">Reviews you've written about others.</p>
      {written && written.length > 0 && (
        <div className="cards">
          {written.map((g) => {
            const subject = typeof g.body.subject === 'string' ? g.body.subject : null
            return subject ? (
              <SaidCard key={g.path} kind={g.kind as 'review' | 'vouch' | 'report'} score={g.body.score} text={g.body.text} who={subject} time={g.time} onClick={() => onEdit(g)} does={`Edit your ${g.kind}`} onWho={() => onWho(subject)} />
            ) : null
          })}
        </div>
      )}
      {onReview && (
        <div className="foot">
          <button className="soft" onClick={onReview}>
            <Icon name="star" bold />
            Review someone
          </button>
        </div>
      )}
    </>
  )
}
