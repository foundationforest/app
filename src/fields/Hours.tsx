// Hours: when the person is free each week, in this device's time zone (the markets' types,
// `hours`): slots of days, from one time to another, as many as they add. In the form, one row with
// its clock: the first slot's days and times (show.ts), else Add hours. Tapped, its screen opens over
// the form (Over.tsx); its back, and the phone's, closes it keeping nothing, and Done keeps the hours.

import { useRef, useState } from 'react'

import { Icon } from '../icons.tsx'
import { DAYS, hoursLines, valueWords } from '../show.ts'
import { Top } from '../ui.tsx'
import { Over, useOver } from './Over.tsx'

type Slot = { days: string[]; from: string; to: string }

/** This device's time zone, such as Europe/Madrid. */
const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

/** Hours as they are held, from the slots that are whole: none, nothing. */
function heldOf(slots: Slot[], was: string | undefined): unknown {
  const full = slots.filter((s) => s.days.length && /^\d\d:\d\d$/.test(s.from) && /^\d\d:\d\d$/.test(s.to))
  return full.length ? { zone: was ?? zone(), slots: full.map((s) => ({ ...s, days: DAYS.filter((d) => s.days.includes(d)) })) } : undefined
}

export function Hours({ label, value, onChange }: { label: string; value: unknown; onChange: (v: unknown) => void }) {
  const row = useRef<HTMLButtonElement>(null)
  const { open, show, close } = useOver(row)
  const lines = hoursLines(value)
  return (
    <div className="hours" role="group" aria-label={label}>
      <button ref={row} type="button" className="open-row" onClick={show}>
        <Icon name="clock" />
        <span className="two">
          <strong className={lines ? undefined : 'muted'}>{lines?.main ?? 'Add hours'}</strong>
          {lines?.more && <span>{lines.more}</span>}
        </span>
        <Icon name="caret-right" className="car" />
      </button>
      {open && (
        <HoursScreen
          label={label}
          value={value}
          onDone={(v) => {
            onChange(v)
            close()
          }}
          onBack={close}
        />
      )}
    </div>
  )
}

/** The hours' screen: each slot's days and times, Remove, Add hours, and Done. */
function HoursScreen({ label, value, onDone, onBack }: { label: string; value: unknown; onDone: (v: unknown) => void; onBack: () => void }) {
  const was = (value ?? {}) as { zone?: string; slots?: Slot[] }
  const [slots, setSlots] = useState<Slot[]>(Array.isArray(was.slots) ? was.slots : [{ days: [], from: '09:00', to: '17:00' }])
  const change = (i: number, slot: Partial<Slot>) => setSlots(slots.map((s, j) => (j === i ? { ...s, ...slot } : s)))
  return (
    <Over label={label}>
      <Top onBack={onBack}>
        <h1>{label}</h1>
      </Top>
      {slots.map((slot, i) => (
        <div key={i} className="slot" role="group" aria-label={`${label} ${i + 1}`}>
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
            <button type="button" className="quiet" onClick={() => setSlots(slots.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setSlots([...slots, { days: [], from: '09:00', to: '17:00' }])}>
        Add hours
      </button>
      <div className="fill" />
      <button type="button" className="primary" onClick={() => onDone(heldOf(slots, was.zone))}>
        Done
      </button>
    </Over>
  )
}
