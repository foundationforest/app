// Hours: when the person is free each week, in this device's time zone (the markets' types,
// `hours`): slots of days, from one time to another, as many as they add.

import { useState } from 'react'

import { DAYS, valueWords } from '../show.ts'

type Slot = { days: string[]; from: string; to: string }

/** This device's time zone, such as Europe/Madrid. */
const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export function Hours({ label, value, onChange }: { label: string; value: unknown; onChange: (v: unknown) => void }) {
  const was = (value ?? {}) as { zone?: string; slots?: Slot[] }
  const [slots, setSlots] = useState<Slot[]>(Array.isArray(was.slots) ? was.slots : [])
  const set = (next: Slot[]) => {
    setSlots(next)
    const full = next.filter((s) => s.days.length && /^\d\d:\d\d$/.test(s.from) && /^\d\d:\d\d$/.test(s.to))
    onChange(full.length ? { zone: was.zone ?? zone(), slots: full.map((s) => ({ ...s, days: DAYS.filter((d) => s.days.includes(d)) })) } : undefined)
  }
  const change = (i: number, slot: Partial<Slot>) => set(slots.map((s, j) => (j === i ? { ...s, ...slot } : s)))
  return (
    <div className="hours" role="group" aria-label={label}>
      {slots.map((slot, i) => (
        <div key={i} className="slot">
          <div className="chips">
            {DAYS.map((d) => {
              const on = slot.days.includes(d)
              return (
                <button key={d} type="button" className={on ? 'chip here' : 'chip'} aria-pressed={on} aria-label={valueWords(d)} onClick={() => change(i, { days: on ? slot.days.filter((x) => x !== d) : [...slot.days, d] })}>
                  {valueWords(d).slice(0, 2)}
                </button>
              )
            })}
          </div>
          <div className="times">
            <input type="time" aria-label="From" value={slot.from} onChange={(e) => change(i, { from: e.target.value })} />
            <input type="time" aria-label="To" value={slot.to} onChange={(e) => change(i, { to: e.target.value })} />
            <button type="button" className="quiet" onClick={() => set(slots.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => set([...slots, { days: [], from: '09:00', to: '17:00' }])}>
        Add hours
      </button>
    </div>
  )
}
