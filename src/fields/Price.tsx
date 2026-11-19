// A price (the pieces page's price), always a list of one or more: each an amount and its currency,
// then what it is for: "for 1 hour", the length and its unit, from the field's own `per` (hours and
// minutes for `hour`, days, weeks, months, people), or the whole job, the price with no per. Minutes
// are held as hours, the exact decimal (45 minutes is "0.75"), so they go in steps of 3. A few words
// of note if wanted, one line ("at least 2 hours"). A remove button on each while there are two or
// more; Add another price under them, in the last one's currency. A price with no amount is left
// out; none, nothing. A request's reads as the most it would pay (Up to €60 for 3 hours), as its
// market's label says (Budget).

import { useRef, useState } from 'react'

import { Icon } from '../icons.tsx'
import type { Asked, PriceValue } from '../markets.ts'
import { isPrice, perPlural } from '../show.ts'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'MXN', 'CAD', 'AUD', 'BRL', 'INR', 'JPY', 'CHF', 'COP', 'ARS', 'CLP', 'PEN', 'ZAR', 'NGN', 'KES', 'CNY', 'KRW', 'SGD']

/** The most a note holds, as the markets check it. */
export const NOTE_MOST = 80

/** What the amount is for, as picked: one of the field's per, `minutes` for a length per hour given in minutes, or `whole` for the whole job. */
type Unit = string

/** One price as typed: its amount, its currency, how many of its unit, the unit, and its note. */
type Row = { id: number; amount: string; currency: string; count: string; unit: Unit; note: string }

/** A unit's words beside its count: hours or hour, minutes, days, people. */
export function unitText(unit: Unit, count: string): string {
  if (unit === 'whole') return 'the whole job'
  const one = count.trim() === '1'
  if (unit === 'minutes') return one ? 'minute' : 'minutes'
  const word = unit.replaceAll('-', ' ')
  return one ? word : perPlural(word)
}

/** The units a field's price may be for: its per, minutes after hour, then the whole job. */
export const unitsOf = (per: string[] | undefined): Unit[] => [...(per ?? []).flatMap((p) => (p === 'hour' ? ['hour', 'minutes'] : [p])), 'whole']

/** A number of minutes as hours, exact: only a multiple of 3 is a decimal that ends. */
export function minutesAsHours(minutes: string): string | undefined {
  if (!/^[1-9][0-9]*$/.test(minutes.trim())) return undefined
  const m = Number(minutes.trim())
  if (m % 3 !== 0) return undefined
  return String(m / 60)
}

/** A price as typed, from one a listing holds: a length under 2 hours given in minutes. */
function rowOf(id: number, p: PriceValue, per: string[] | undefined): Row {
  const unit = p.per && per?.includes(p.per) ? p.per : 'whole'
  const count = p.count ?? '1'
  const minutes = unit === 'hour' && Number(count) < 1 && Number.isInteger(Number(count) * 60)
  return { id, amount: p.amount, currency: p.currency, count: minutes ? String(Number(count) * 60) : count, unit: minutes ? 'minutes' : unit, note: p.note ?? '' }
}

/** A typed price as a listing holds it, or why not yet. */
export function priceOf(r: Omit<Row, 'id'>): PriceValue | 'minutes' | undefined {
  const amount = r.amount.trim()
  if (!amount) return undefined
  const note = r.note.trim()
  const base = { amount, currency: r.currency, ...(note && { note }) }
  if (r.unit === 'whole') return base
  const count = r.unit === 'minutes' ? minutesAsHours(r.count) : r.count.trim() || '1'
  if (count === undefined) return 'minutes'
  const per = r.unit === 'minutes' ? 'hour' : r.unit
  return { ...base, per, ...(count !== '1' && { count }) }
}

export function Price({ field, value, onChange }: { field: Asked; value: unknown; onChange: (v: unknown) => void }) {
  const next = useRef(0)
  const units = unitsOf(field.per)
  const fresh = (currency: string): Row => ({ id: next.current++, amount: '', currency, count: '1', unit: units[0]!, note: '' })
  const [rows, setRows] = useState<Row[]>(() => {
    const held = (Array.isArray(value) ? value : []).filter(isPrice).map((p) => rowOf(next.current++, p, field.per))
    return held.length ? held : [fresh('USD')]
  })
  const set = (list: Row[]) => {
    setRows(list)
    const prices = list.map(priceOf).filter((p): p is PriceValue => typeof p === 'object')
    onChange(prices.length ? prices : undefined)
  }
  const change = (id: number, to: Partial<Row>) =>
    set(
      rows.map((r) => {
        if (r.id !== id) return r
        const next = { ...r, ...to }
        // Hours to minutes and back, the same length: 1 hour is 60 minutes.
        if (to.unit === 'minutes' && r.unit === 'hour' && Number.isFinite(Number(r.count))) next.count = String(Math.round(Number(r.count) * 60))
        if (to.unit === 'hour' && r.unit === 'minutes' && minutesAsHours(r.count)) next.count = minutesAsHours(r.count)!
        return next
      }),
    )
  return (
    <div className="prices">
      {rows.map((r, i) => {
        const n = rows.length > 1 ? ` ${i + 1}` : ''
        const wrong = priceOf(r) === 'minutes'
        return (
          <div key={r.id} className="price-row">
            <div className="money">
              <input className="amount" aria-label={`Amount${n}`} placeholder="Amount" inputMode="decimal" autoComplete="off" value={r.amount} onChange={(e) => change(r.id, { amount: e.target.value })} />
              <select aria-label={`Currency${n}`} value={r.currency} onChange={(e) => change(r.id, { currency: e.target.value })}>
                {[...new Set([r.currency, ...CURRENCIES])].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {rows.length > 1 && (
                <button type="button" className="round" aria-label={`Remove price${n}`} onClick={() => set(rows.filter((o) => o.id !== r.id))}>
                  <Icon name="x" />
                </button>
              )}
            </div>
            <div className="price-for">
              <span>for</span>
              {r.unit !== 'whole' && <input className="how-many" aria-label={`How many${n}`} inputMode="decimal" autoComplete="off" value={r.count} onChange={(e) => change(r.id, { count: e.target.value })} />}
              <select aria-label={`For${n}`} value={r.unit} onChange={(e) => change(r.id, { unit: e.target.value })}>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {unitText(u, r.unit === 'whole' ? '2' : r.count)}
                  </option>
                ))}
              </select>
            </div>
            {wrong && <p className="hint">Minutes go in steps of 3, such as 45.</p>}
            <input className="note" aria-label={`Note${n}`} placeholder="A note, such as at least 2 hours" maxLength={NOTE_MOST} autoComplete="off" value={r.note} onChange={(e) => change(r.id, { note: e.target.value })} />
          </div>
        )
      })}
      <button type="button" className="quiet add" onClick={() => set([...rows, fresh(rows.at(-1)?.currency ?? 'USD')])}>
        <Icon name="plus" /> Add another price
      </button>
    </div>
  )
}
