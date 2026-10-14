// The sheets that write the profile's own records, from the bottom: an offer, which a buyer's
// profile calls a request (its description, whose first line is its title, its price in the devnet
// dollar, per hour, per day or in total, and under them the fields its market's file suggests, all
// optional: text, whole numbers, yes or no, and lists as chips, a language's as BCP 47 tags) and a
// review (who, one score from 1 to 10 in half points on a slider, and text of at most 500
// characters). Who a review is about is checked against the index as soon as it is an address, and
// again before the face: a profile it has registered on the other side of this one's market. Opened
// on a row, the same sheet changes or removes it. Post and Remove each take one face. Under them,
// one line says what went wrong, in red, or why Post is not open yet. And a new access key: a
// writing key, an inbox key or both, Make with one face, then the paste for the person's AI, shown
// once, after every host took the keys' records.

import { type ReactNode, useEffect, useState } from 'react'

import { publicKeyFromAddress } from '../../standard/records/src/index.ts'
import { type Field, type Market, type Offer, type Written, marketOf, roleWord, splitLabel, words } from '../cards.ts'
import { withFace } from '../face.ts'
import type { Choice } from '../flows/access.ts'
import {
  type FieldValue,
  type OfferInput,
  type Per,
  REVIEW_TEXT,
  type ReviewInput,
  SCORE,
  amountOk,
  fieldValue,
  freshId,
  itemOf,
  languageTag,
  notOtherSide,
  offerFieldsOf,
  otherRole,
  reviewable,
  shownValue,
  writeOffer,
  writeReview,
} from '../flows/records.ts'
import type { LocalProfile } from '../local.ts'
import { settings } from '../settings.ts'
import { Line, Spinner, type Why, useAction, useCopy } from '../ui.tsx'
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

/** Post, and Remove when there is something to remove, with their busy state, and the one line: their error, or why Post is not open. */
type Action = ReturnType<typeof useAction<[]>>

function Actions({ post, remove, why }: { post: Action; remove?: Action; why: Why }) {
  const busy = post.busy || !!remove?.busy
  return (
    <>
      <Line error={post.error || remove?.error} why={why} />
      <button className="primary" disabled={!!why || busy}>
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

/** Why what is typed is not an item of the field. */
function itemMisfit(f: Field, typed: string): string {
  if (f.items?.format === 'language' && !languageTag(typed)) return `"${typed.trim()}" isn't a language tag, such as en or pt-BR.`
  return f.items?.minLength !== undefined && new TextEncoder().encode(typed.trim()).length < f.items.minLength ? `"${typed.trim()}" is too short.` : `"${typed.trim()}" is too long.`
}

/** Why a value does not fit its field, in words. */
function misfit(f: Field, v: FieldValue): string {
  if (f.type === 'integer') {
    const { minimum: min, maximum: max } = f
    return `a whole number${min !== undefined && max !== undefined ? ` from ${min} to ${max}` : min !== undefined ? `, ${min} or more` : max !== undefined ? `, ${max} or less` : ''}`
  }
  if (f.type === 'array') return Array.isArray(v) && v.length > (f.maxLength ?? Infinity) ? `at most ${f.maxLength}` : 'one of them does not fit'
  return 'too long'
}

/**
 * The items of an array field as chips, each removed by its ×; what is typed becomes one on Enter, a
 * comma, or leaving the field. What it refuses, and why, shows under it; full, it says so.
 */
function Chips({ label, f, items, onChange }: { label: string; f: Field; items: string[]; onChange: (items: string[]) => void }) {
  const [typed, setTyped] = useState('')
  const full = items.length >= (f.maxLength ?? Infinity)
  const refused = !!typed.trim() && !itemOf(f, typed)
  const add = () => {
    const item = itemOf(f, typed)
    if (!item || full) return
    if (!items.includes(item)) onChange([...items, item])
    setTyped('')
  }
  return (
    <>
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
            aria-invalid={refused}
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
      <Line why={refused ? { text: itemMisfit(f, typed), wrong: true } : full ? { text: `${f.maxLength} at most.` } : null} />
    </>
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

/** An offer's sheet; a buyer's profile asks for something, so its sheet is a request's. */
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
  const unfit = fields.find(([name]) => written[name] === null)
  const why: Why = !input.description
    ? { text: 'Write a description.' }
    : input.description.length > 3000
      ? { text: 'The description is over 3000 characters.', wrong: true }
      : amount.trim() && !amountOk(amount.trim())
        ? { text: 'A price is a number above 0, such as 25 or 12.50.', wrong: true }
        : unfit
          ? { text: `${fieldWords(unfit[0])}: ${misfit(unfit[1], valueOf(...unfit))}.`, wrong: true }
          : null

  return (
    <Sheet label={splitLabel(p.label).role === 'buyer' ? 'Request' : 'Offer'} busy={post.busy || remove.busy} onClose={onClose}>
      <form
        className="sheet-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!why) void post.run()
        }}
      >
        <textarea className="field" rows={5} placeholder="Title on the first line" aria-label="Description" maxLength={3000} value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="price">
          <label className="money">
            <span>$</span>
            <input inputMode="decimal" placeholder="Price" aria-label="Price" aria-invalid={!!amount.trim() && !amountOk(amount.trim())} value={amount} onChange={(e) => setAmount(e.target.value.replace(',', '.'))} />
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
        <Actions post={post} remove={offer ? remove : undefined} why={why} />
      </form>
    </Sheet>
  )
}

export function ReviewSheet({ p, review, subject = '', onClose, onDone }: { p: LocalProfile; review?: Written; subject?: string; onClose: () => void; onDone: () => void }) {
  const was = review?.body
  const [who, setWho] = useState<string>(typeof was?.subject === 'string' ? was.subject : subject)
  // The score as the person set it, else as the review holds it: one off the half points (an older 7.3) stays as it is until the slider moves. None until then on a new one.
  const [score, setScore] = useState<string>(typeof was?.ratings?.overall === 'string' && SCORE.test(was.ratings.overall) ? was.ratings.overall : '')
  const [text, setText] = useState<string>(typeof was?.text === 'string' ? was.text : '')
  const [id] = useState(() => (review ? idOf(review.path) : freshId()))
  const { market: name, role } = splitLabel(p.label)
  const market = useMarket(p)
  const refused = notOtherSide(name, roleWord(otherRole(role), market))
  const input: ReviewInput = { subject: who.trim(), score, text }
  const address = !!publicKeyFromAddress(input.subject) && input.subject !== p.address

  // Whether the index has who it is about on the other side of this market, asked as soon as it is an address; Post asks again.
  const [side, setSide] = useState<{ subject: string; ok: boolean }>()
  useEffect(() => {
    if (!address) return
    let live = true
    reviewable(settings().index, p, input.subject).then((ok) => live && setSide({ subject: input.subject, ok }), () => undefined)
    return () => {
      live = false
    }
  }, [input.subject])

  const save = async (what: ReviewInput | null) => {
    await withFace((seed) => writeReview(seed, p, id, what))
    onDone()
  }
  const post = useAction(async () => {
    // Who it is about, checked with the index before the face.
    if (!(await reviewable(settings().index, p, input.subject))) throw new Error(refused)
    await save(input)
  })
  const remove = useAction(() => save(null))
  const why: Why = !input.subject
    ? { text: "Paste the address of who it's about." }
    : !publicKeyFromAddress(input.subject)
      ? { text: "This isn't a profile's address.", wrong: true }
      : input.subject === p.address
        ? { text: "This is this profile's own address.", wrong: true }
        : side?.subject === input.subject && !side.ok
          ? { text: refused, wrong: true }
          : !score
            ? { text: 'Move the slider to give a score.' }
            : text.length > REVIEW_TEXT
              ? { text: `The text is over ${REVIEW_TEXT} characters.`, wrong: true }
              : null

  return (
    <Sheet label="Review" busy={post.busy || remove.busy} onClose={onClose}>
      <form
        className="sheet-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!why) void post.run()
        }}
      >
        <input className="field" placeholder="Address" aria-label="Address" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={who} onChange={(e) => setWho(e.target.value)} />
        <div className="score-pick">
          <output className="big" aria-hidden="true">
            {score}
          </output>
          {/* Untouched, the slider gives no score: a tap where the thumb already is gives that one. */}
          <input
            type="range"
            className={score ? 'slider' : 'slider unset'}
            min={1}
            max={10}
            step={0.5}
            aria-label="Score"
            aria-valuetext={score || 'none'}
            value={score ? Number(score) : 5.5}
            onChange={(e) => setScore(e.target.value)}
            onPointerUp={(e) => !score && setScore(e.currentTarget.value)}
          />
        </div>
        <div className="counted">
          <textarea className="field" rows={4} placeholder="Text" aria-label="Text" maxLength={REVIEW_TEXT} value={text} onChange={(e) => setText(e.target.value)} />
          <span className={text.length > REVIEW_TEXT ? 'count over' : 'count'}>
            {text.length}/{REVIEW_TEXT}
          </span>
        </div>
        <Actions post={post} remove={review ? remove : undefined} why={why} />
      </form>
    </Sheet>
  )
}

/**
 * A new access key for one AI or app: a writing key, an inbox key, or both, then Make, with one
 * face. The paste that follows holds the private halves; it shows until Done, which drops it, and
 * only Done closes it.
 */
export function AccessKeySheet({ p, market, role, onClose, onMade }: { p: LocalProfile; market: string; role: string; onClose: () => void; onMade: () => void }) {
  const [choice, setChoice] = useState<Choice>({ writing: false, inbox: false })
  const [paste, setPaste] = useState('')
  const copy = useCopy()
  const make = useAction(async () => {
    const { makeAccessKeys, pasteOf } = await lazy(() => import('../flows/access.ts'))
    const made = await withFace((seed) => makeAccessKeys(seed, p, choice))
    setPaste(pasteOf(market, role, p.address, made))
    onMade()
  })
  const kinds: [keyof Choice, string, string][] = [
    ['writing', 'Writing key', `Posts and edits ${splitLabel(p.label).role === 'buyer' ? 'requests' : 'offers'} and reviews.`],
    ['inbox', 'Inbox key', 'Reads the inbox, sends messages, asks you for things.'],
  ]
  const why: Why = choice.writing || choice.inbox ? null : { text: 'Pick at least one.' }

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
          <Line error={copy.error} />
          <button className="primary" onClick={() => copy.copy(paste)}>
            {copy.copied ? 'Copied' : 'Copy'}
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
          if (!why) void make.run()
        }}
      >
        <div className="checks">
          {kinds.map(([kind, label, does]) => (
            <label key={kind}>
              <input type="checkbox" checked={choice[kind]} disabled={make.busy} onChange={(e) => setChoice({ ...choice, [kind]: e.target.checked })} />
              <span>
                <strong>{label}</strong>
                <span className="sub">{does}</span>
              </span>
            </label>
          ))}
        </div>
        <Line error={make.error} why={why} />
        <button className="primary" disabled={!!why || make.busy}>
          {make.busy ? <Spinner /> : 'Make'}
        </button>
      </form>
    </Sheet>
  )
}
