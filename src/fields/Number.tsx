// A number (the pieces page's number), as decimal text: on the number keys, with − and + beside it,
// its unit after it in words, one or many as the number says (1 hour, 3 hours). Where the market
// starts the field as a range (`ask`'s start): From and To, either left empty for no limit that way,
// the range in the markets' words under them (18 years or more). A range held opens as one, a number
// as one. A field that takes several: each answer its own line with a remove button while there are
// two, then Add another.

import { useRef, useState } from 'react'

import { Icon } from '../icons.tsx'
import type { Asked } from '../markets.ts'
import { answerText } from '../show.ts'
import { unitWords } from '../units.ts'

type Props = { field: Asked; value: unknown; onChange: (v: unknown) => void }

/** One answer as typed: a number, or a range's two ends, each empty for no limit that way. */
type Typed = { id: number; one: string } | { id: number; from: string; to: string }

/** Text a person typed, trimmed; left out when empty. */
const given = (text: string) => (text.trim() ? text.trim() : undefined)

/** A typed answer as a listing holds it, or nothing. */
function held(t: Typed): unknown {
  if ('one' in t) return given(t.one)
  const [from, to] = [given(t.from), given(t.to)]
  return from || to ? { ...(from && { from }), ...(to && { to }) } : undefined
}

export function NumberField({ field, value, onChange }: Props) {
  const next = useRef(0)
  const range = field.start?.range === true
  const typed = (v: unknown): Typed =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? { id: next.current++, from: String((v as { from?: unknown }).from ?? ''), to: String((v as { to?: unknown }).to ?? '') }
      : range && v === undefined
        ? { id: next.current++, from: '', to: '' }
        : { id: next.current++, one: typeof v === 'string' ? v : '' }
  const [list, setList] = useState<Typed[]>(() => {
    const answers = field.several ? (Array.isArray(value) ? value : []) : value === undefined ? [] : [value]
    return answers.length ? answers.map(typed) : [typed(undefined)]
  })
  const set = (next: Typed[]) => {
    setList(next)
    const answers = next.map(held).filter((v) => v !== undefined)
    onChange(field.several ? (answers.length ? answers : undefined) : answers[0])
  }
  const change = (id: number, to: Partial<{ one: string; from: string; to: string }>) => set(list.map((t) => (t.id === id ? ({ ...t, ...to } as Typed) : t)))
  return (
    <div className="numbers">
      {list.map((t, i) => {
        const n = list.length > 1 ? ` ${i + 1}` : ''
        return (
          <div key={t.id} className="number-row">
            {'one' in t ? <One label={`${field.label}${n}`} unit={field.unit} text={t.one} onText={(one) => change(t.id, { one })} /> : <Range field={field} n={n} from={t.from} to={t.to} onEnds={(ends) => change(t.id, ends)} />}
            {list.length > 1 && (
              <button type="button" className="round" aria-label={`Remove ${field.label.toLowerCase()}${n}`} onClick={() => set(list.filter((o) => o.id !== t.id))}>
                <Icon name="x" />
              </button>
            )}
          </div>
        )
      })}
      {field.several && (
        <button type="button" className="quiet add" onClick={() => set([...list, typed(undefined)])}>
          <Icon name="plus" /> Add another
        </button>
      )}
    </div>
  )
}

/** One number, − and + beside it, its unit after it. */
function One({ label, unit, text, onText }: { label: string; unit?: string; text: string; onText: (t: string) => void }) {
  const step = (by: number) => {
    const n = Number(text.trim() || '0')
    if (Number.isFinite(n)) onText(String(Math.max(0, Math.round((n + by) * 100) / 100)))
  }
  return (
    <div className="number stepper">
      <button type="button" className="round" aria-label={`Less ${label.toLowerCase()}`} onClick={() => step(-1)}>
        <Icon name="minus" />
      </button>
      <input aria-label={label} inputMode="decimal" autoComplete="off" value={text} onChange={(e) => onText(e.target.value)} />
      <button type="button" className="round" aria-label={`More ${label.toLowerCase()}`} onClick={() => step(1)}>
        <Icon name="plus" />
      </button>
      {unit && <span className="unit">{unitWords(unit, text)}</span>}
    </div>
  )
}

/** A range: From and To, either empty for no limit that way, its words under them. */
function Range({ field, n, from, to, onEnds }: { field: Asked; n: string; from: string; to: string; onEnds: (ends: { from?: string; to?: string }) => void }) {
  const value = held({ id: 0, from, to })
  const words = value === undefined ? '' : answerText({ ...field, several: undefined }, value)
  return (
    <div className="range" role="group" aria-label={`${field.label}${n}`}>
      <div className="number">
        <input aria-label={`From${n}`} placeholder="From" inputMode="decimal" autoComplete="off" value={from} onChange={(e) => onEnds({ from: e.target.value })} />
        <input aria-label={`To${n}`} placeholder="To" inputMode="decimal" autoComplete="off" value={to} onChange={(e) => onEnds({ to: e.target.value })} />
        {field.unit && <span className="unit">{unitWords(field.unit, to.trim() || from.trim())}</span>}
      </div>
      {words && <span className="range-words">{words}</span>}
    </div>
  )
}
