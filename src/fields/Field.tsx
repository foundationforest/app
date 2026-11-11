// One field of an entry, as suits its type on a phone (the markets manual's Types), its name above it:
// text in a line (a box for a description), a number on the number keys with its unit after it, one
// or many as the number typed says (1 night, 3 nights), and where the field takes a range, a small
// Range beside it that turns it into From and To, either left empty for no limit that way, the range
// in the index's words under them (18 years and over); words in a line with commas between them, a
// choice by how many values it has (Choice: side by side, chips, or a picker), one value or several
// as the field itself says (`many`), each value by its label where the field has one, else in words;
// money as an amount with its currency and, only when the field lists what its amount may be for, a
// pick of exactly those, side by side, and once one is picked, how many of it the amount buys, left
// empty for one; a listing's price, always a list (the markets manual's Shared names), as one such
// row per price, each with its remove button while there are two or more, and Add a price under
// them; photos as tiles; and place (one, or several where the field holds a list), moment and hours
// in their own modules. A contact says, beside its name, that it is public; a field whose answer no
// longer fit its market, under its name, that it changed, until it is answered again.

import { useRef, useState } from 'react'

import { Icon } from '../icons.tsx'
import type { Field as MarketField } from '../markets.ts'
import { choiceWords, numberText, perPlural, pricesOf } from '../show.ts'
import { unitWords } from '../units.ts'
import { Seg } from '../ui.tsx'
import { fieldWords } from '../words.ts'
import { Hours } from './Hours.tsx'
import { Moment } from './Moment.tsx'
import { type Picked, Photos } from './Photos.tsx'
import { Picker } from './Picker.tsx'
import { Place, Places } from './Place.tsx'

export type FieldProps = { name: string; field: MarketField; value: unknown; onChange: (value: unknown) => void; picked: Picked; changed?: boolean }

/** Text a person typed, trimmed; left out when empty. */
const given = (text: string) => (text.trim() ? text.trim() : undefined)

/** A choice with more values than this is a row that opens a picker; with at most `SIDE_BY_SIDE`, one of them side by side; else chips, several each with its tick. */
const CHIPS_AT_MOST = 8
const SIDE_BY_SIDE = 3

const CURRENCIES = ['USD', 'EUR', 'GBP', 'MXN', 'CAD', 'AUD', 'BRL', 'INR', 'JPY', 'CHF']

/** What a field whose answer no longer fit says under its name. */
export const CHANGED = 'Changed: answer again.'

export function Field(props: FieldProps) {
  const { name, changed = false } = props
  return (
    <div className={changed ? 'field changed' : 'field'}>
      <span className="label">
        {fieldWords(name)}
        {name === 'contact' && <span className="aside">Public.</span>}
      </span>
      {changed && <span className="changed-line">{CHANGED}</span>}
      <Input {...props} />
    </div>
  )
}

function Input({ name, field, value, onChange, picked }: FieldProps) {
  const label = fieldWords(name)
  switch (field.type) {
    case 'text':
      return name === 'description' ? (
        <textarea aria-label={label} rows={4} defaultValue={typeof value === 'string' ? value : ''} onChange={(e) => onChange(given(e.target.value))} />
      ) : (
        <input aria-label={label} autoComplete="off" defaultValue={typeof value === 'string' ? value : ''} onChange={(e) => onChange(given(e.target.value))} />
      )
    case 'number':
      return <NumberInput label={label} unit={field.unit} range={field.range === true} value={value} onChange={onChange} />
    case 'words':
      return (
        <input
          aria-label={label}
          autoComplete="off"
          defaultValue={Array.isArray(value) ? value.join(', ') : ''}
          onChange={(e) => {
            const words = [...new Set(e.target.value.split(',').map((w) => w.trim()).filter(Boolean))]
            onChange(words.length ? words : undefined)
          }}
        />
      )
    case 'choice':
      return <Choice label={label} field={field} value={value} onChange={onChange} />
    case 'money':
      return name === 'price' ? <Prices label={label} field={field} value={value} onChange={onChange} /> : <Money label={label} field={field} value={value} onChange={onChange} />
    case 'place':
      return field.many ? <Places label={label} field={field} value={value} onChange={onChange} /> : <Place label={label} field={field} value={value} onChange={onChange} />
    case 'moment':
      return <Moment label={label} value={value} onChange={onChange} />
    case 'hours':
      return <Hours label={label} value={value} onChange={onChange} />
    case 'file':
      return <Photos label={label} many={field.many === true} value={value} onChange={onChange} picked={picked} />
  }
}

/**
 * A choice, one value or several as the field says (`many`), never by market: a long list, a row
 * that opens its picker (Picker.tsx); else one value of two or three side by side (Seg), and of more
 * as chips that behave the same, a pick unpicking the other; several, chips that each show their
 * tick when picked. One picked, tapped again, is picked no more.
 */
export function Choice({ label, field, value, onChange }: { label: string; field: Pick<MarketField, 'values' | 'many' | 'labels'>; value: unknown; onChange: (v: unknown) => void }) {
  const values = field.values ?? []
  const [picked, setPicked] = useState<string[]>(Array.isArray(value) ? value : typeof value === 'string' ? [value] : [])
  const set = (next: string[]) => {
    setPicked(next)
    onChange(field.many ? (next.length ? next : undefined) : next[0])
  }
  if (values.length > CHIPS_AT_MOST) return <Picker label={label} field={field} picked={picked} onPick={set} />
  if (!field.many && values.length <= SIDE_BY_SIDE)
    return <Seg label={label} options={values.map((v) => ({ value: v, words: choiceWords(field, v) }))} value={picked[0]} onPick={(v) => set(v ? [v] : [])} clears />
  const many = field.many === true
  return (
    <div className="chips" role={many ? 'group' : 'radiogroup'} aria-label={label}>
      {values.map((v) => {
        const on = picked.includes(v)
        return (
          <button
            key={v}
            type="button"
            className={on ? 'chip here' : 'chip'}
            {...(many ? { 'aria-pressed': on } : { role: 'radio', 'aria-checked': on })}
            onClick={() => set(many ? (on ? picked.filter((p) => p !== v) : [...picked, v]) : on ? [] : [v])}
          >
            {many && on && <Icon name="check" bold />}
            {choiceWords(field, v)}
          </button>
        )
      })}
    </div>
  )
}

/** A range's two ends as typed: each empty for no limit that way. */
type Ends = { from: string; to: string }

/** A range held in an entry, or null for anything else. */
const endsOf = (value: unknown): Ends | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? { from: String((value as { from?: unknown }).from ?? ''), to: String((value as { to?: unknown }).to ?? '') } : null

/**
 * A number on the number keys, its unit after it in words, one or many as what is typed says. Where
 * the field takes a range: a small Range beside it, which turns it into From and To, the number typed
 * kept as From, either end left empty for no limit that way; with neither, nothing. A range held
 * opens as one.
 */
function NumberInput({ label, unit, range, value, onChange }: { label: string; unit?: string; range: boolean; value: unknown; onChange: (v: unknown) => void }) {
  const [text, setText] = useState(typeof value === 'string' ? value : '')
  const [ends, setEnds] = useState<Ends | null>(range ? endsOf(value) : null)
  if (ends) {
    const set = (change: Partial<Ends>) => {
      const next = { ...ends, ...change }
      setEnds(next)
      const [from, to] = [given(next.from), given(next.to)]
      onChange(from || to ? { ...(from && { from }), ...(to && { to }) } : undefined)
    }
    const words = numberText({ unit }, { from: ends.from.trim(), to: ends.to.trim() })
    return (
      <div className="range" role="group" aria-label={label}>
        <div className="number">
          <input aria-label="From" placeholder="From" inputMode="decimal" value={ends.from} onChange={(e) => set({ from: e.target.value })} />
          <input aria-label="To" placeholder="To" inputMode="decimal" value={ends.to} onChange={(e) => set({ to: e.target.value })} />
          {unit && <span className="unit">{unitWords(unit, ends.to.trim() || ends.from.trim())}</span>}
        </div>
        {words && <span className="range-words">{words}</span>}
      </div>
    )
  }
  const input = (
    <input
      aria-label={label}
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        onChange(given(e.target.value))
      }}
    />
  )
  if (!unit && !range) return input
  return (
    <div className="number">
      {input}
      {unit && <span className="unit">{unitWords(unit, text)}</span>}
      {range && (
        <button
          type="button"
          className="quiet"
          onClick={() => {
            const from = text.trim()
            setEnds({ from, to: '' })
            onChange(from ? { from } : undefined)
          }}
        >
          Range
        </button>
      )}
    </div>
  )
}

/** One price as typed: its amount, its currency, what it is for (empty for the whole deal), and how many of it, empty for one. */
type PriceRow = { id: number; amount: string; currency: string; per: string; count: string }

/**
 * A listing's price, a list of one or more: each row an amount with its currency, the market's own
 * `per` values side by side where it lists them, and once one is picked, how many of it the amount
 * buys, its per's word after it (5 lessons), left empty for one. A remove button on each row while
 * there are two or more, so the last one stays; Add a price under them, in the last row's currency.
 * A row with no amount is left out; none, nothing.
 */
function Prices({ label, field, value, onChange }: { label: string; field: MarketField; value: unknown; onChange: (v: unknown) => void }) {
  const next = useRef(0)
  const row = (was: Partial<Omit<PriceRow, 'id'>>): PriceRow => ({ id: next.current++, amount: '', currency: 'USD', per: '', count: '', ...was })
  const [rows, setRows] = useState<PriceRow[]>(() => {
    const held = pricesOf(value).map((m) => row({ amount: m.amount, currency: m.currency, per: m.per && field.per?.includes(m.per) ? m.per : '', count: m.per && m.count !== undefined ? String(m.count) : '' }))
    return held.length ? held : [row({})]
  })
  const set = (list: PriceRow[]) => {
    setRows(list)
    const prices = list
      .filter((r) => r.amount.trim())
      .map((r) => ({ amount: r.amount.trim(), currency: r.currency, ...(r.per && { per: r.per }), ...(r.per && r.count.trim() && { count: Number(r.count.trim()) }) }))
    onChange(prices.length ? prices : undefined)
  }
  const change = (id: number, to: Partial<PriceRow>) => set(rows.map((r) => (r.id === id ? { ...r, ...to, ...(to.per === '' && { count: '' }) } : r)))
  return (
    <div className="prices">
      {rows.map((r, i) => {
        // Each row's own words, numbered once there are two or more: Price 2, Per 2.
        const n = rows.length > 1 ? ` ${i + 1}` : ''
        return (
          <div key={r.id} className="price-row">
            <div className="money">
              <div className="money-amount">
                <select aria-label={`Currency${n}`} value={r.currency} onChange={(e) => change(r.id, { currency: e.target.value })}>
                  {[...new Set([r.currency, ...CURRENCIES])].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input aria-label={`${label}${n}`} inputMode="decimal" value={r.amount} onChange={(e) => change(r.id, { amount: e.target.value })} />
              </div>
              {field.per && <Seg label={`Per${n}`} options={field.per.map((p) => ({ value: p, words: `per ${p}` }))} value={r.per || undefined} onPick={(p) => change(r.id, { per: p ?? '' })} clears />}
              {rows.length > 1 && (
                <button type="button" className="round" aria-label={`Remove price${n}`} onClick={() => set(rows.filter((o) => o.id !== r.id))}>
                  <Icon name="x" />
                </button>
              )}
            </div>
            {r.per && (
              <div className="number price-count">
                <span className="aside">How many</span>
                <input aria-label={`How many${n}`} inputMode="numeric" value={r.count} onChange={(e) => change(r.id, { count: e.target.value })} />
                <span className="unit">{r.count.trim() === '1' ? r.per : perPlural(r.per)}</span>
              </div>
            )}
          </div>
        )
      })}
      <button type="button" className="quiet add-price" onClick={() => set([...rows, row({ currency: rows.at(-1)?.currency ?? 'USD' })])}>
        <Icon name="plus" /> Add a price
      </button>
    </div>
  )
}

/** Money: an amount, its currency at its start; and what it is for, one of the field's `per` values side by side, only when it lists them (none picked: the whole deal). */
function Money({ label, field, value, onChange }: { label: string; field: MarketField; value: unknown; onChange: (v: unknown) => void }) {
  const was = (value ?? {}) as { amount?: string; currency?: string; per?: string }
  const [money, setMoney] = useState({ amount: was.amount ?? '', currency: was.currency ?? 'USD', per: was.per && field.per?.includes(was.per) ? was.per : '' })
  const set = (change: Partial<typeof money>) => {
    const next = { ...money, ...change }
    setMoney(next)
    const amount = next.amount.trim()
    onChange(amount ? { amount, currency: next.currency, ...(next.per && { per: next.per }) } : undefined)
  }
  return (
    <div className="money">
      <div className="money-amount">
        <select aria-label="Currency" value={money.currency} onChange={(e) => set({ currency: e.target.value })}>
          {[...new Set([money.currency, ...CURRENCIES])].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input aria-label={label} inputMode="decimal" value={money.amount} onChange={(e) => set({ amount: e.target.value })} />
      </div>
      {field.per && <Seg label="Per" options={field.per.map((p) => ({ value: p, words: `per ${p}` }))} value={money.per || undefined} onPick={(p) => set({ per: p ?? '' })} clears />}
    </div>
  )
}
