// The sheets that write the profile's own records, from the bottom: an offer (its description,
// whose first line is its title, its price in the devnet dollar, per hour, per day or in total, and
// under them the fields its market's file suggests, all optional: text, whole numbers, yes or no,
// and lists as chips, a language's as BCP 47 tags) and a review (who, a row of ten scores for each
// rating name the market lists, overall first, and text). Who a review is about is checked against
// the index before the face: a profile it has registered on the other side of this one's market.
// Opened on a row, the same sheet changes or removes it. Post and Remove each take one face. And a
// new access key: what it may do, Make with one face, then the paste for the person's AI, shown
// once, after every host took the keys' records.

import { type ReactNode, useEffect, useState } from 'react'

import { publicKeyFromAddress } from '../../standard/records/src/index.ts'
import { type Field, type Market, type Offer, type Written, marketOf, splitLabel, words } from '../cards.ts'
import { withFace } from '../face.ts'
import type { Choice } from '../flows/access.ts'
import {
  type FieldValue,
  type OfferInput,
  OTHER_SIDE,
  type Per,
  type ReviewInput,
  SCORE,
  amountOk,
  fieldValue,
  freshId,
  itemOf,
  offerFieldsOf,
  ratingNames,
  reviewable,
  shownValue,
  writeOffer,
  writeReview,
} from '../flows/records.ts'
import type { LocalProfile } from '../local.ts'
import { settings } from '../settings.ts'
import { Spinner, useAction } from '../ui.tsx'
import { lazy } from '../version.ts'

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

/** The profile's market's file, from the index; null when it has none, undefined until known. */
function useMarket(p: LocalProfile): Market | null | undefined {
  const [market, setMarket] = useState<Market | null>()
  useEffect(() => {
    let live = true
    marketOf(settings().index, splitLabel(p.label).market).then(
      (m) => live && setMarket(m),
      () => live && setMarket(null),
    )
    return () => {
      live = false
    }
  }, [p.label])
  return market
}

/** A field's name as words: `appointmentWindowHours` is "Appointment window hours". */
const fieldWords = (name: string) => words(name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase())

/** The items of an array field as chips, each removed by its ×; what is typed becomes one on Enter, a comma, or leaving the field. */
function Chips({ label, f, items, onChange }: { label: string; f: Field; items: string[]; onChange: (items: string[]) => void }) {
  const [typed, setTyped] = useState('')
  const full = items.length >= (f.maxLength ?? Infinity)
  const add = () => {
    const item = itemOf(f, typed)
    if (!item || full) return
    if (!items.includes(item)) onChange([...items, item])
    setTyped('')
  }
  return (
    <div className="chips">
      {items.map((item) => (
        <button type="button" className="chip" key={item} aria-label={`Remove ${item}`} onClick={() => onChange(items.filter((i) => i !== item))}>
          {item} <span aria-hidden="true">×</span>
        </button>
      ))}
      {!full && (
        <input
          placeholder={label}
          aria-label={label}
          aria-invalid={!!typed.trim() && !itemOf(f, typed)}
          autoCapitalize={f.items?.format === 'language' ? 'off' : undefined}
          value={typed}
          onChange={(e) => setTyped(e.target.value.replace(',', ''))}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ',') return
            e.preventDefault()
            add()
          }}
          onBlur={add}
        />
      )}
    </div>
  )
}

/** One of the market's fields, as its type asks, with the market's own words for it under. */
function FieldInput({ name, f, value, onChange }: { name: string; f: Field; value: FieldValue; onChange: (v: FieldValue) => void }) {
  const label = fieldWords(name)
  const wrong = fieldValue(f, value) === null
  const input =
    f.type === 'boolean' ? (
      <label className="check">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
    ) : f.type === 'array' ? (
      <Chips label={label} f={f} items={Array.isArray(value) ? value : []} onChange={onChange} />
    ) : (
      <>
        <input
          className="field"
          placeholder={label}
          aria-label={label}
          aria-invalid={wrong}
          inputMode={f.type === 'integer' ? 'numeric' : undefined}
          list={f.knownValues?.length ? `known-${name}` : undefined}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
        {!!f.knownValues?.length && (
          <datalist id={`known-${name}`}>
            {f.knownValues.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        )}
      </>
    )
  return (
    <div className="extra">
      {input}
      {f.description && <p className="hint">{f.description}</p>}
    </div>
  )
}

export function OfferSheet({ p, offer, onClose, onDone }: { p: LocalProfile; offer?: Offer; onClose: () => void; onDone: () => void }) {
  const was = offer?.body
  const [description, setDescription] = useState<string>(typeof was?.description === 'string' ? was.description : '')
  const [amount, setAmount] = useState<string>(typeof was?.price?.amount === 'string' ? was.price.amount : '')
  const [per, setPer] = useState<Per>(PERS.some(([x]) => x === was?.price?.per) ? was!.price.per : 'hour')
  // The market's fields, each as the person set it, else as the offer holds it.
  const fields = offerFieldsOf(useMarket(p))
  const [set, setSet] = useState<Record<string, FieldValue>>({})
  const valueOf = (name: string, f: Field) => set[name] ?? shownValue(f, was?.[name])
  // One id for the sheet's life, so posting again after a failure writes the same record.
  const [id] = useState(() => (offer ? idOf(offer.path) : freshId()))
  const written = Object.fromEntries(fields.map(([name, f]) => [name, fieldValue(f, valueOf(name, f))]))
  const input: OfferInput = { description: description.trim(), ...(amount.trim() && { price: { amount: amount.trim(), per } }), fields: written }
  const save = async (what: OfferInput | null) => {
    await withFace((seed) => writeOffer(seed, p, id, what))
    onDone()
  }
  const post = useAction(() => save(input))
  const remove = useAction(() => save(null))
  const ok = !!input.description && input.description.length <= 3000 && (!amount.trim() || amountOk(amount.trim())) && Object.values(written).every((v) => v !== null)

  return (
    <Sheet label="Offer" busy={post.busy || remove.busy} onClose={onClose}>
      <form
        className="sheet-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (ok) void post.run()
        }}
      >
        <textarea className="field" rows={5} placeholder="Title on the first line" aria-label="Description" maxLength={3000} value={description} onChange={(e) => setDescription(e.target.value)} />
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
        {fields.map(([name, f]) => (
          <FieldInput key={name} name={name} f={f} value={valueOf(name, f)} onChange={(v) => setSet({ ...set, [name]: v })} />
        ))}
        <Actions post={post} remove={offer ? remove : undefined} ok={ok} />
      </form>
    </Sheet>
  )
}

const TEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function ReviewSheet({ p, review, subject = '', onClose, onDone }: { p: LocalProfile; review?: Written; subject?: string; onClose: () => void; onDone: () => void }) {
  const was = review?.body
  const [who, setWho] = useState<string>(typeof was?.subject === 'string' ? was.subject : subject)
  // The scores as the person set them, else as the review holds them: a score not on the ten (an older 8.5) stays as it is until one is tapped.
  const [scores, setScores] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(was?.ratings ?? {}).filter(([, v]) => typeof v === 'string')) as Record<string, string>)
  const [text, setText] = useState<string>(typeof was?.text === 'string' ? was.text : '')
  const [id] = useState(() => (review ? idOf(review.path) : freshId()))
  const names = ratingNames(useMarket(p))
  const input: ReviewInput = { subject: who.trim(), ratings: Object.fromEntries(names.map((n) => [n, scores[n] ?? ''])), text }
  const save = async (what: ReviewInput | null) => {
    await withFace((seed) => writeReview(seed, p, id, what))
    onDone()
  }
  const post = useAction(async () => {
    // Who it is about, checked with the index before the face.
    if (!(await reviewable(settings().index, p, input.subject))) throw new Error(OTHER_SIDE)
    await save(input)
  })
  const remove = useAction(() => save(null))
  const ok = !!publicKeyFromAddress(input.subject) && input.subject !== p.address && SCORE.test(input.ratings.overall ?? '') && Object.values(input.ratings).every((r) => !r || SCORE.test(r)) && text.length <= 3000
  // Tapped: that score; tapped again, none, but overall, which a review here always gives.
  const tap = (name: string, n: number) => setScores({ ...scores, [name]: scores[name] === String(n) && name !== 'overall' ? '' : String(n) })

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
        {names.map((name) => (
          <div className="rating" key={name}>
            <span>{words(name)}</span>
            <div className="segmented tens" role="radiogroup" aria-label={words(name)}>
              {TEN.map((n) => (
                <button type="button" key={n} role="radio" aria-checked={scores[name] === String(n)} className={scores[name] === String(n) ? 'on' : ''} onClick={() => tap(name, n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
        <textarea className="field" rows={4} placeholder="Text" aria-label="Text" maxLength={3000} value={text} onChange={(e) => setText(e.target.value)} />
        <Actions post={post} remove={review ? remove : undefined} ok={ok} />
      </form>
    </Sheet>
  )
}

const CAN: [keyof Choice, string][] = [
  ['write', 'Post offers and reviews'],
  ['message', 'Send messages'],
  ['read', 'Read the inbox'],
]

/**
 * A new access key for one AI or app: what it may do, then Make, with one face. The paste that
 * follows holds the private halves; it shows until Done, which drops it, and only Done closes it.
 */
export function AccessKeySheet({ p, market, role, onClose, onMade }: { p: LocalProfile; market: string; role: string; onClose: () => void; onMade: () => void }) {
  const [choice, setChoice] = useState<Choice>({ write: false, message: false, read: false })
  const [paste, setPaste] = useState('')
  const [copied, setCopied] = useState(false)
  const make = useAction(async () => {
    const { makeAccessKeys, pasteOf } = await lazy(() => import('../flows/access.ts'))
    const made = await withFace((seed) => makeAccessKeys(seed, p, choice))
    setPaste(pasteOf(settings().mcp, market, role, p.address, made))
    onMade()
  })
  const ok = choice.write || choice.message || choice.read

  if (paste) {
    const done = () => {
      setPaste('')
      onClose()
    }
    return (
      <Sheet label="Access key" busy onClose={done}>
        <div className="sheet-form">
          <p>Shown once. Paste it into your AI.</p>
          <pre className="paste">{paste}</pre>
          <button className="primary" onClick={() => navigator.clipboard.writeText(paste).then(() => setCopied(true), () => undefined)}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="quiet wide" onClick={done}>
            Done
          </button>
        </div>
      </Sheet>
    )
  }
  return (
    <Sheet label="Access key" busy={make.busy} onClose={onClose}>
      <form
        className="sheet-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (ok) void make.run()
        }}
      >
        <div className="checks">
          {CAN.map(([scope, label]) => (
            <label key={scope}>
              <input type="checkbox" checked={choice[scope]} disabled={make.busy} onChange={(e) => setChoice({ ...choice, [scope]: e.target.checked })} />
              {label}
            </label>
          ))}
        </div>
        {make.error && <p className="error">{make.error}</p>}
        <button className="primary" disabled={!ok || make.busy}>
          {make.busy ? <Spinner /> : 'Make'}
        </button>
      </form>
    </Sheet>
  )
}
