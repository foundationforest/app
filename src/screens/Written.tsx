// You wrote, from "You wrote 2 ›" on a profile's Reviews: the reviews, vouches and reports this
// profile wrote, from its own folder. Back and You wrote at the top; then each a card: "About", the
// avatar of who it is about, the person's name for them or their short key, never this profile's own
// name, and a pencil at the right, since a tap edits what the person wrote; then its score with its
// star, or its chip, and their words; one its market outgrew says Needs updating, in yellow. The whole
// card opens it to edit (Review.tsx). Those needing the person first, newest first, then the rest
// (order.ts). Nothing here asks the passkey.

import { givenOf } from '../flows/feedback.ts'
import type { Posted } from '../flows/entries.ts'
import { useEntries, useOutgrown, useProfiles, useSteady } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { newFirst } from '../order.ts'
import { Line, SaidChip, Top, noteOf } from '../ui.tsx'
import { NameOf, WhoAvatar } from './Who.tsx'

type Props = { address: string; onBack: () => void; onEdit: (given: Posted) => void }

export function Written({ address, onBack, onEdit }: Props) {
  const me = useProfiles().find((p) => p.address === address)
  const mine = me ? [me] : []
  const read = useEntries(mine)[address]
  const outgrown = useOutgrown(mine)[address] ?? []
  const update = (g: Posted) => outgrown.some((o) => o.path === g.path)
  const written = read && 'entries' in read ? givenOf(read.entries).filter((g) => typeof g.body.subject === 'string') : []
  const shown = useSteady(newFirst(written, update, (g) => g.time), (g) => g.path)
  if (!me) return null
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>You wrote</h1>
      </Top>
      {read && 'failed' in read && <Line note={noteOf(read.failed)} />}
      <div className="cards">
        {shown.map((g) => {
          const subject = g.body.subject as string
          return (
            <button key={g.path} className="card wrote" aria-label={`Edit your ${g.kind}`} onClick={() => onEdit(g)}>
              <span className="wrote-head">
                <span className="about-word">About</span>
                <WhoAvatar address={subject} size="sm" />
                <NameOf address={subject} />
                <span className="grow" />
                <Icon name="pencil-simple" className="pen" />
              </span>
              <SaidChip kind={g.kind as 'review' | 'vouch' | 'report'} score={g.body.score} />
              {typeof g.body.text === 'string' && g.body.text && <span className="said-text">{g.body.text}</span>}
              {update(g) && <span className="needs">Needs updating</span>}
            </button>
          )
        })}
      </div>
    </main>
  )
}
