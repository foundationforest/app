// One field of a post, as suits its type on a phone (the markets manual's Types): text in a line (a
// box for a description), a number on the number keys, words in a line with commas between them, a
// choice as chips (a long list of one as a menu), money as an amount with its currency and, only
// when the field lists what its amount may be for, a pick of exactly those; photos as tiles; and
// place, moment and hours in their own modules. A contact says, beside its name, that it is public.

import { useState } from 'react'

import type { Field as MarketField } from '../markets.ts'
import { valueWords } from '../show.ts'
import { fieldWords } from '../words.ts'
import { Hours } from './Hours.tsx'
import { Moment } from './Moment.tsx'
import { type Picked, Photos } from './Photos.tsx'
import { Place } from './Place.tsx'

export type FieldProps = { name: string; field: MarketField; value: unknown; onChange: (value: unknown) => void; picked: Picked }

/** Text a person typed, trimmed; left out when empty. */
const given = (text: string) => (text.trim() ? text.trim() : undefined)

/** A single choice with more values than this is a menu; fewer, chips. */
const CHIPS_AT_MOST = 6

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
      return <input aria-label={label} inputMode="decimal" defaultValue={typeof value === 'string' ? value : ''} onChange={(e) => onChange(given(e.target.value))} />
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
      return <Place label={label} field={field} value={value} onChange={onChange} />
    case 'moment':
      return <Moment label={label} value={value} onChange={onChange} />
    case 'hours':
      return <Hours label={label} value={value} onChange={onChange} />
    case 'file':
      return <Photos label={label} many={field.many === true} value={value} onChange={onChange} picked={picked} />
  }
}

/** A choice: chips, any number of them for `many`; one, or a menu when the list is long. */
export function Choice({ label, field, value, onChange }: { label: string; field: Pick<MarketField, 'values' | 'many'>; value: unknown; onChange: (v: unknown) => void }) {
  const values = field.values ?? []
  const [picked, setPicked] = useState<string[]>(Array.isArray(value) ? value : typeof value === 'string' ? [value] : [])
  const set = (next: string[]) => {
    setPicked(next)
    onChange(field.many ? (next.length ? next : undefined) : next[0])
  }
  if (!field.many && values.length > CHIPS_AT_MOST) {
    return (
      <select aria-label={label} value={picked[0] ?? ''} onChange={(e) => set(e.target.value ? [e.target.value] : [])}>
        <option value="" />
        {values.map((v) => (
          <option key={v} value={v}>
            {valueWords(v)}
          </option>
        ))}
      </select>
    )
  }
  return (
    <div className="chips" role="group" aria-label={label}>
      {values.map((v) => {
        const on = picked.includes(v)
        return (
          <button key={v} type="button" className={on ? 'chip here' : 'chip'} aria-pressed={on} onClick={() => set(field.many ? (on ? picked.filter((p) => p !== v) : [...picked, v]) : on ? [] : [v])}>
            {valueWords(v)}
          </button>
        )
      })}
    </div>
  )
}

/** Money: an amount and its currency; and what it is for, one of the field's `per` values, only when it lists them (none picked: the whole deal). */
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
    <>
      <div className="money">
        <input aria-label={label} inputMode="decimal" value={money.amount} onChange={(e) => set({ amount: e.target.value })} />
        <select aria-label="Currency" value={money.currency} onChange={(e) => set({ currency: e.target.value })}>
          {[...new Set([money.currency, ...CURRENCIES])].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {field.per && (
        <div className="chips" role="group" aria-label="Per">
          {field.per.map((p) => {
            const on = money.per === p
            return (
              <button key={p} type="button" className={on ? 'chip here' : 'chip'} aria-pressed={on} onClick={() => set({ per: on ? '' : p })}>
                per {p}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
