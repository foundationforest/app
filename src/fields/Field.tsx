// One field of an entry in a form, as a row that opens in place (the posting page drawn in Forest's
// design system): its label, then its answer in words (show.ts), or, while there is none, the
// market's question in grey. Tapped, it opens under itself: the market's hint, then the input its
// piece takes, then Done, which closes it; only one is open at a time. The inputs, one per piece:
// text in a line, or a box where the market says it is long; a choice (Choice.tsx); a number
// (Number.tsx); a price (Price.tsx); a place (Place.tsx); a date (Date.tsx); photos as tiles
// (Photos.tsx); a link in a line, for a web address. A contact says, beside its name, that it is
// public; a field whose answer no longer fit its market, under its name, that it changed, until it
// is answered again. The words are the market's own (`ask`), never the app's.

import type { Asked } from '../markets.ts'
import { useCaptions } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { answerLines, isPlace } from '../show.ts'
import { Choice } from './Choice.tsx'
import { DateField } from './Date.tsx'
import { NumberField } from './Number.tsx'
import { type Picked, Photos } from './Photos.tsx'
import { PlaceField } from './Place.tsx'
import { Price } from './Price.tsx'

/** `spots`: the listing's spots field, when the listing holds spots, so each of its times may hold its own (Date.tsx). */
export type FieldProps = { field: Asked; value: unknown; onChange: (value: unknown) => void; picked: Picked; changed?: boolean; request?: boolean; spots?: Asked }

/** What a field whose answer no longer fit says under its name. */
export const CHANGED = 'Changed: answer again.'

/** Text a person typed, trimmed; left out when empty. */
const given = (text: string) => (text.trim() ? text.trim() : undefined)

/** A row that opens in place: its label, its answer or its question, and, open, its hint, its input and Done. */
export function FieldRow({ open, onOpen, onClose, ...props }: FieldProps & { open: boolean; onOpen: () => void; onClose: () => void }) {
  const { field, value, changed = false, request = false } = props
  const places = (Array.isArray(value) ? value : [value]).filter(isPlace)
  const caption = useCaptions(places)
  const lines = field.piece === 'photo' ? photoLines(value) : answerLines(field, value, { request, caption })
  const id = `field-${field.name}`
  return (
    <div className={['field-row', open && 'open', changed && 'changed'].filter(Boolean).join(' ')}>
      <button type="button" className="field-head" aria-expanded={open} aria-controls={id} onClick={open ? onClose : onOpen}>
        <span className="label">
          <span className="name">{field.label}</span>
          {field.name === 'contact' && <span className="aside">Public.</span>}
        </span>
        {changed && !open && <span className="changed-line">{CHANGED}</span>}
        {!open && (lines.length ? lines.map((line, i) => <span key={i} className="answer">{line}</span>) : <span className="answer muted">{field.question}</span>)}
        <Icon name={open ? 'caret-up' : 'caret-down'} className="car" />
      </button>
      {open && (
        <div className="field-open" id={id}>
          {field.question !== field.label && <p className="question">{field.question}</p>}
          {field.hint && <p className="hint">{field.hint}</p>}
          <Input {...props} />
          <button type="button" className="quiet done" onClick={onClose}>
            Done
          </button>
        </div>
      )}
    </div>
  )
}

/** A photo field's answer in words: 1 photo, 3 photos. */
const photoLines = (value: unknown) => {
  const n = Array.isArray(value) ? value.length : typeof value === 'string' ? 1 : 0
  return n ? [n === 1 ? '1 photo' : `${n} photos`] : []
}

/** A long text, the listing's own words, open at the foot of the form: its label, its question, its hint, the box. */
export function LongText({ field, value, onChange }: Pick<FieldProps, 'field' | 'value' | 'onChange'>) {
  return (
    <label className="field long">
      <span className="label">{field.label}</span>
      {field.question !== field.label && <span className="question">{field.question}</span>}
      {field.hint && <span className="hint">{field.hint}</span>}
      <textarea aria-label={field.label} rows={5} defaultValue={typeof value === 'string' ? value : ''} onChange={(e) => onChange(given(e.target.value))} />
    </label>
  )
}

/** The input a field's piece takes. */
export function Input({ field, value, onChange, picked, spots }: FieldProps) {
  switch (field.piece) {
    case 'text':
      return field.ask?.long ? (
        <textarea aria-label={field.label} rows={4} defaultValue={typeof value === 'string' ? value : ''} onChange={(e) => onChange(given(e.target.value))} />
      ) : (
        <input aria-label={field.label} autoComplete="off" defaultValue={typeof value === 'string' ? value : ''} onChange={(e) => onChange(given(e.target.value))} />
      )
    case 'link':
      return <input type="url" aria-label={field.label} placeholder="https://" autoComplete="off" defaultValue={typeof value === 'string' ? value : ''} onChange={(e) => onChange(given(e.target.value))} />
    case 'choice':
      return <Choice field={field} value={value} onChange={onChange} />
    case 'number':
      return <NumberField field={field} value={value} onChange={onChange} />
    case 'price':
      return <Price field={field} value={value} onChange={onChange} />
    case 'place':
      return <PlaceField field={field} value={value} onChange={onChange} />
    case 'date':
      return <DateField field={field} value={value} onChange={onChange} {...(spots && { spots })} />
    case 'photo':
      return <Photos label={field.label} many={field.several === true} value={value} onChange={onChange} picked={picked} />
  }
}
