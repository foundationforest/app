// One field of an entry, as suits its type on a phone (the markets manual's Types), its name above it:
// text in a line (a box for a description), a number on the number keys with its unit after it, one
// or many as the number typed says (1 night, 3 nights), words in a line with commas between them, a
// choice by how many values it has (Choice: side by side, chips, or a picker), one value or several
// as the field itself says (`many`), each value by its label where the field has one, else in words;
// money as an amount with its currency and, only when the field lists what its amount may be for, a
// pick of exactly those, side by side; photos as tiles; and place (one, or several where the field
// holds a list), moment and hours in their own modules. A contact says, beside its name, that it is
// public.

import { useState } from 'react'

import { Icon } from '../icons.tsx'
import type { Field as MarketField } from '../markets.ts'
import { choiceWords } from '../show.ts'
import { unitWords } from '../units.ts'
import { Seg } from '../ui.tsx'
import { fieldWords } from '../words.ts'
import { Hours } from './Hours.tsx'
import { Moment } from './Moment.tsx'
import { type Picked, Photos } from './Photos.tsx'
import { Picker } from './Picker.tsx'
import { Place, Places } from './Place.tsx'

export type FieldProps = { name: string; field: MarketField; value: unknown; onChange: (value: unknown) => void; picked: Picked }

/** Text a person typed, trimmed; left out when empty. */
const given = (text: string) => (text.trim() ? text.trim() : undefined)

/** A choice with more values than this is a row that opens a picker; with at most `SIDE_BY_SIDE`, one of them side by side; else chips, several each with its tick. */
const CHIPS_AT_MOST = 8
const SIDE_BY_SIDE = 3

const CURRENCIES = ['USD', 'EUR', 'GBP', 'MXN', 'CAD', 'AUD', 'BRL', 'INR', 'JPY', 'CHF']

export function Field(props: FieldProps) {
  const { name } = props
  return (
    <div className="field">
      <span className="label">
        {fieldWords(name)}
        {name === 'contact' && <span className="aside">Public.</span>}
      </span>
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
      return <NumberInput label={label} unit={field.unit} value={value} onChange={onChange} />
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
      return <Money label={label} field={field} value={value} onChange={onChange} />
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

/** A number on the number keys, its unit after it in words, one or many as what is typed says. */
function NumberInput({ label, unit, value, onChange }: { label: string; unit?: string; value: unknown; onChange: (v: unknown) => void }) {
  const [text, setText] = useState(typeof value === 'string' ? value : '')
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
  if (!unit) return input
  return (
    <div className="number">
      {input}
      <span className="unit">{unitWords(unit, text)}</span>
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
