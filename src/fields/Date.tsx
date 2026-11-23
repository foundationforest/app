// A date (the pieces page's date): a list of times, each one answer, Add a time under them where
// the field takes several. Each time has an Every week switch: on, its weekday buttons, Monday first,
// and Until, no end unless a day is set; off, a day, or where the market opens the field as a span,
// From and To days, or as a deadline, By. Then its hours, From and To, as exact clock times, the end
// left out for a start alone, an end before the start running past midnight; asked at once where the
// market says hours matter, else behind Add hours. Never a part of the day: "mornings" is no time.
// The zone is the device's own, named under the times, and held only with hours. A time with no
// weekday or no day is left out; none, nothing. What the format holds that this doesn't show, a
// weekly time's first day, stays as it was. In a listing that holds spots (the pieces page's spots:
// how many places an offer has, or how many people a request is for), each time has Advanced, a
// quiet link at its foot, which opens under itself that time's own spots, a whole number from 0
// that wins for that time, by the market's word for the listing's spots (Guests at this time); open
// by itself when the time holds some, and a second tap closes it, keeping them.

import { useId, useRef, useState } from 'react'

import { Icon } from '../icons.tsx'
import { type Asked, type DateValue, WEEKDAYS, type Weekday } from '../markets.ts'
import { deviceZone, zoneWords } from '../show.ts'
import { Seg } from '../ui.tsx'
import { One } from './Number.tsx'

/** `spots`: the listing's spots field as its market asks it, when the listing holds spots, so each time may hold its own. */
type Props = { field: Asked; value: unknown; onChange: (v: unknown) => void; spots?: Asked }

/** What a time's own spots say under Advanced. */
export const SPOTS_HINT = "Only for this time. 0 when it's full."

/** How one time's days are given: weekly, one day, a span of days, or a day it must be done by. */
type Kind = 'weekly' | 'day' | 'span' | 'until'

/** One time as typed: its kind, its weekdays, its days, its hours, its own spots, and what the format holds that this doesn't show. */
type Slot = { id: number; kind: Kind; every: Weekday[]; on: string; from: string; to: string; start: string; end: string; hours: boolean; spots?: string; kept: { from?: string } }

const DAY_SHORT: Record<Weekday, string> = { monday: 'Mo', tuesday: 'Tu', wednesday: 'We', thursday: 'Th', friday: 'Fr', saturday: 'Sa', sunday: 'Su' }
const DAY_NAME = (d: Weekday) => d.charAt(0).toUpperCase() + d.slice(1)

/** The kind a time that is not weekly takes, by where the market opens the field. */
const otherKind = (field: Asked): Kind => (field.start?.way === 'from-to' ? 'span' : field.start?.way === 'until' ? 'until' : 'day')

/** A time as typed, from an answer a listing holds, or a new one where the market opens the field. */
function slotOf(id: number, field: Asked, v: DateValue | undefined): Slot {
  const asksHours = field.start?.hours === true
  const empty: Slot = { id, kind: field.start?.way === 'weekly' ? 'weekly' : otherKind(field), every: [], on: '', from: '', to: '', start: '', end: '', hours: asksHours, kept: {} }
  if (!v) return empty
  const hours = { start: v.start ?? '', end: v.end ?? '', hours: asksHours || v.start !== undefined, ...(v.spots !== undefined && { spots: v.spots }) }
  if ('on' in v) return { ...empty, ...hours, kind: 'day', on: v.on }
  if ('every' in v) return { ...empty, ...hours, kind: 'weekly', every: WEEKDAYS.filter((d) => v.every.includes(d)), to: v.to ?? '', kept: v.from ? { from: v.from } : {} }
  const kind: Kind = v.from === undefined && otherKind(field) === 'until' ? 'until' : 'span'
  return { ...empty, ...hours, kind, from: v.from ?? '', to: v.to ?? '' }
}

/** A time as a listing holds it, with its own spots when it has some, or nothing while its days are missing. */
export function dateOf(s: Omit<Slot, 'id'>, zone: string): DateValue | undefined {
  const spots = s.spots?.trim()
  const hours = { ...(s.hours && s.start ? { start: s.start, ...(s.end && { end: s.end }), zone } : {}), ...(spots && { spots }) }
  switch (s.kind) {
    case 'weekly':
      return s.every.length ? { every: s.every, ...s.kept, ...(s.to && { to: s.to }), ...hours } : undefined
    case 'day':
      return s.on ? { on: s.on, ...hours } : undefined
    case 'until':
      return s.to ? { to: s.to, ...hours } : undefined
    default:
      return s.from || s.to ? { ...(s.from && { from: s.from }), ...(s.to && { to: s.to }), ...hours } : undefined
  }
}

export function DateField({ field, value, onChange, spots }: Props) {
  const next = useRef(0)
  const zone = deviceZone()
  const [slots, setSlots] = useState<Slot[]>(() => {
    const held = field.several ? (Array.isArray(value) ? value : []) : value === undefined ? [] : [value]
    return held.length ? held.map((v) => slotOf(next.current++, field, v as DateValue)) : [slotOf(next.current++, field, undefined)]
  })
  const set = (list: Slot[]) => {
    setSlots(list)
    const answers = list.map((s) => dateOf(s, zone)).filter((v) => v !== undefined)
    onChange(field.several ? (answers.length ? answers : undefined) : answers[0])
  }
  const change = (id: number, to: Partial<Slot>) => set(slots.map((s) => (s.id === id ? { ...s, ...to } : s)))
  const withHours = slots.some((s) => s.hours)
  return (
    <div className="date-input">
      {slots.map((s, i) => (
        <SlotInput key={s.id} field={field} spots={spots} slot={s} n={slots.length > 1 ? ` ${i + 1}` : ''} onChange={(to) => change(s.id, to)} onRemove={slots.length > 1 ? () => set(slots.filter((o) => o.id !== s.id)) : undefined} />
      ))}
      {field.several && (
        <button type="button" className="quiet add" onClick={() => set([...slots, slotOf(next.current++, field, undefined)])}>
          <Icon name="plus" /> Add a time
        </button>
      )}
      {withHours && <p className="hint">{zoneWords(zone)}</p>}
    </div>
  )
}

function SlotInput({ field, spots, slot: s, n, onChange, onRemove }: { field: Asked; spots?: Asked; slot: Slot; n: string; onChange: (to: Partial<Slot>) => void; onRemove?: () => void }) {
  const weekly = s.kind === 'weekly'
  return (
    <div className="date-slot" role="group" aria-label={`Time${n}`}>
      <div className="date-slot-top">
        <label className="switch">
          <input type="checkbox" role="switch" checked={weekly} onChange={(e) => onChange({ kind: e.target.checked ? 'weekly' : otherKind(field) })} />
          Every week
        </label>
        {onRemove && (
          <button type="button" className="round" aria-label={`Remove time${n}`} onClick={onRemove}>
            <Icon name="x" />
          </button>
        )}
      </div>
      {weekly ? (
        <div className="weekdays" role="group" aria-label={`Weekdays${n}`}>
          {WEEKDAYS.map((d) => {
            const on = s.every.includes(d)
            return (
              <button key={d} type="button" className={on ? 'day here' : 'day'} aria-pressed={on} aria-label={DAY_NAME(d)} onClick={() => onChange({ every: on ? s.every.filter((x) => x !== d) : WEEKDAYS.filter((x) => x === d || s.every.includes(x)) })}>
                {DAY_SHORT[d]}
              </button>
            )
          })}
        </div>
      ) : s.kind === 'day' ? (
        <label className="date-pair">
          Day
          <input type="date" aria-label={`Day${n}`} value={s.on} onChange={(e) => onChange({ on: e.target.value })} />
        </label>
      ) : s.kind === 'until' ? (
        <label className="date-pair">
          By
          <input type="date" aria-label={`By${n}`} value={s.to} onChange={(e) => onChange({ to: e.target.value })} />
        </label>
      ) : (
        <div className="date-pairs">
          <label className="date-pair">
            From
            <input type="date" aria-label={`First day${n}`} value={s.from} onChange={(e) => onChange({ from: e.target.value })} />
          </label>
          <label className="date-pair">
            To
            <input type="date" aria-label={`Last day${n}`} value={s.to} onChange={(e) => onChange({ to: e.target.value })} />
          </label>
        </div>
      )}
      {s.hours ? (
        <div className="date-pairs">
          <label className="date-pair">
            From
            <input type="time" aria-label={`From${n}`} value={s.start} onChange={(e) => onChange({ start: e.target.value })} />
          </label>
          <label className="date-pair">
            To
            <input type="time" aria-label={`To${n}`} value={s.end} onChange={(e) => onChange({ end: e.target.value })} />
          </label>
        </div>
      ) : (
        <button type="button" className="quiet" onClick={() => onChange({ hours: true })}>
          <Icon name="plus" /> Add hours
        </button>
      )}
      {weekly && <Until slot={s} n={n} onChange={onChange} />}
      {spots && <Advanced spots={spots} slot={s} n={n} onChange={onChange} />}
    </div>
  )
}

/** Advanced, at a time's foot: that time's own spots, open by itself when it holds some. */
function Advanced({ spots, slot: s, n, onChange }: { spots: Asked; slot: Slot; n: string; onChange: (to: Partial<Slot>) => void }) {
  const [open, setOpen] = useState((s.spots ?? '') !== '')
  const id = useId()
  const label = `${spots.label} at this time`
  return (
    <div className="until">
      <button type="button" className="text-link small-link" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        Advanced <Icon name={open ? 'caret-up' : 'caret-down'} />
      </button>
      {open && (
        <div className="until" id={id}>
          <span className="label">{label}</span>
          <p className="hint">{SPOTS_HINT}</p>
          <One label={`${label}${n}`} text={s.spots ?? ''} onText={(spots) => onChange({ spots })} />
        </div>
      )}
    </div>
  )
}

/** A weekly time's last day: No end, unless one is set. */
function Until({ slot: s, n, onChange }: { slot: Slot; n: string; onChange: (to: Partial<Slot>) => void }) {
  const [dated, setDated] = useState(s.to !== '')
  return (
    <div className="until">
      <Seg
        label={`Until${n}`}
        options={[
          { value: 'none', words: 'No end' },
          { value: 'day', words: 'Until a day' },
        ]}
        value={dated ? 'day' : 'none'}
        onPick={(v) => {
          setDated(v === 'day')
          if (v !== 'day') onChange({ to: '' })
        }}
      />
      {dated && <input type="date" aria-label={`Until day${n}`} value={s.to} onChange={(e) => onChange({ to: e.target.value })} />}
    </div>
  )
}
