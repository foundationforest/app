// The sheets that write the profile's own records, from the bottom: an offer (its description,
// whose first line is its title, and its price in the devnet dollar, per hour, per day or in
// total) and a review (who, a score from 1 to 10 with one decimal, and text). Opened on a row, the
// same sheet changes or removes it. Post and Remove each take one face.

import { type ReactNode, useState } from 'react'

import { publicKeyFromAddress } from '../../standard/records/src/index.ts'
import type { Offer, Written } from '../cards.ts'
import { withFace } from '../face.ts'
import { type OfferInput, type Per, type ReviewInput, SCORE, amountOk, freshId, writeOffer, writeReview } from '../flows/records.ts'
import type { LocalProfile } from '../local.ts'
import { Spinner, useAction } from '../ui.tsx'

const PERS: [Per, string][] = [
  ['hour', 'Hour'],
  ['day', 'Day'],
  ['job', 'Total'],
]

/** A sheet from the bottom; the backdrop closes it unless it is busy. */
export function Sheet({ label, busy = false, onClose, children }: { label: string; busy?: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <>
      <div className="sheet-back" onClick={() => !busy && onClose()} />
      <div className="sheet" role="dialog" aria-label={label}>
        <div className="grip" />
        {children}
      </div>
    </>
  )
}

/** Post, and Remove when there is something to remove, with their busy state and error. */
type Action = ReturnType<typeof useAction<[]>>

function Actions({ post, remove, ok }: { post: Action; remove?: Action; ok: boolean }) {
  const busy = post.busy || !!remove?.busy
  const error = post.error || remove?.error
  return (
    <>
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={!ok || busy}>
        {post.busy ? <Spinner /> : 'Post'}
      </button>
      {remove && (
        <button type="button" className="quiet wide" onClick={() => remove.run()} disabled={busy}>
          {remove.busy ? <Spinner /> : 'Remove'}
        </button>
      )}
    </>
  )
}

const idOf = (path: string) => path.slice(path.indexOf('/') + 1)

export function OfferSheet({ p, offer, onClose, onDone }: { p: LocalProfile; offer?: Offer; onClose: () => void; onDone: () => void }) {
  const was = offer?.body
  const [description, setDescription] = useState<string>(typeof was?.description === 'string' ? was.description : '')
  const [amount, setAmount] = useState<string>(typeof was?.price?.amount === 'string' ? was.price.amount : '')
  const [per, setPer] = useState<Per>(PERS.some(([x]) => x === was?.price?.per) ? was!.price.per : 'hour')
  // One id for the sheet's life, so posting again after a failure writes the same record.
  const [id] = useState(() => (offer ? idOf(offer.path) : freshId()))
  const input: OfferInput = { description: description.trim(), ...(amount.trim() && { price: { amount: amount.trim(), per } }) }
  const save = async (what: OfferInput | null) => {
    await withFace((seed) => writeOffer(seed, p, id, what))
    onDone()
  }
  const post = useAction(() => save(input))
  const remove = useAction(() => save(null))
  const ok = !!input.description && input.description.length <= 3000 && (!amount.trim() || amountOk(amount.trim()))

  return (
    <Sheet label="Offer" busy={post.busy || remove.busy} onClose={onClose}>
      <form
        className="sheet-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (ok) void post.run()
        }}
      >
        <textarea className="field" rows={5} placeholder="Description" aria-label="Description" maxLength={3000} value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="price">
          <label className="money">
            <span>$</span>
            <input inputMode="decimal" placeholder="Price" aria-label="Price" value={amount} onChange={(e) => setAmount(e.target.value.replace(',', '.'))} />
          </label>
          <div className="segmented" role="radiogroup" aria-label="Per">
            {PERS.map(([value, word]) => (
              <button type="button" key={value} role="radio" aria-checked={per === value} className={per === value ? 'on' : ''} onClick={() => setPer(value)}>
                {word}
              </button>
            ))}
          </div>
        </div>
        <Actions post={post} remove={offer ? remove : undefined} ok={ok} />
      </form>
    </Sheet>
  )
}

export function ReviewSheet({ p, review, subject = '', onClose, onDone }: { p: LocalProfile; review?: Written; subject?: string; onClose: () => void; onDone: () => void }) {
  const was = review?.body
  const [who, setWho] = useState<string>(typeof was?.subject === 'string' ? was.subject : subject)
  const [score, setScore] = useState<string>(typeof was?.ratings?.overall === 'string' ? was.ratings.overall : '')
  const [text, setText] = useState<string>(typeof was?.text === 'string' ? was.text : '')
  const [id] = useState(() => (review ? idOf(review.path) : freshId()))
  const input: ReviewInput = { subject: who.trim(), score: score.trim(), text }
  const save = async (what: ReviewInput | null) => {
    await withFace((seed) => writeReview(seed, p, id, what))
    onDone()
  }
  const post = useAction(() => save(input))
  const remove = useAction(() => save(null))
  const ok = !!publicKeyFromAddress(input.subject) && input.subject !== p.address && SCORE.test(input.score) && text.length <= 3000

  return (
    <Sheet label="Review" busy={post.busy || remove.busy} onClose={onClose}>
      <form
        className="sheet-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (ok) void post.run()
        }}
      >
        <input className="field" placeholder="Address" aria-label="Address" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={who} onChange={(e) => setWho(e.target.value)} />
        <input className="field" inputMode="decimal" placeholder="Score" aria-label="Score" value={score} onChange={(e) => setScore(e.target.value.replace(',', '.'))} />
        <textarea className="field" rows={4} placeholder="Text" aria-label="Text" maxLength={3000} value={text} onChange={(e) => setText(e.target.value)} />
        <Actions post={post} remove={review ? remove : undefined} ok={ok} />
      </form>
    </Sheet>
  )
}
