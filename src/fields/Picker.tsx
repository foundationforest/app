// A choice with a long list (more than eight values, such as a tutor's subjects), as one row in the
// form: what is picked, as chips when several may be, else in words, or Choose; tapped, its own
// screen opens over the form (Over.tsx), which keeps all it holds: back, the list's name, a search
// over the values' words, then the values. Whether one value or several is the field's own (`many`,
// the markets manual's), never the market's: for one, each value a row with its radio mark, and a
// tap picks it and closes the screen (the one picked, tapped, is picked no more); for several, each
// with its tick box, each tap ticks or unticks, and Done, or back, closes it. Nothing floats.

import { useRef, useState } from 'react'

import { Icon } from '../icons.tsx'
import type { Field } from '../markets.ts'
import { choiceWords } from '../show.ts'
import { RadioMark, TickBox, Top } from '../ui.tsx'
import { Over, useOver } from './Over.tsx'

type Props = { label: string; field: Pick<Field, 'values' | 'many' | 'labels'>; picked: string[]; onPick: (next: string[]) => void }

export function Picker({ label, field, picked, onPick }: Props) {
  const [search, setSearch] = useState('')
  const row = useRef<HTMLButtonElement>(null)
  // The list's screen is a step in the page's history, so the phone's back closes it.
  const { open, show, close } = useOver(row)
  const values = field.values ?? []
  const words = (v: string) => choiceWords(field, v)
  const shown = values.filter((v) => words(v).toLowerCase().includes(search.trim().toLowerCase()))
  const tap = (v: string) => {
    const on = picked.includes(v)
    if (!field.many) {
      onPick(on ? [] : [v])
      return close()
    }
    onPick(on ? picked.filter((p) => p !== v) : [...picked, v])
  }
  return (
    <div role="group" aria-label={label}>
      <button
        ref={row}
        type="button"
        className="open-row"
        onClick={() => {
          setSearch('')
          show()
        }}
      >
        <span className="grow">
          {picked.length === 0 ? (
            <span className="muted">Choose</span>
          ) : field.many ? (
            <span className="chips">
              {picked.map((v) => (
                <span key={v} className="chip">
                  {words(v)}
                </span>
              ))}
            </span>
          ) : (
            words(picked[0]!)
          )}
        </span>
        <Icon name="caret-right" className="car" />
      </button>
      {open && (
        <Over label={label}>
          <Top onBack={close}>
            <h1>{label}</h1>
          </Top>
          <input type="search" aria-label="Search" placeholder="Search" autoComplete="off" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="rows pick-list" role={field.many ? 'group' : 'radiogroup'} aria-label={label}>
            {shown.map((v) => (
              <button key={v} type="button" role={field.many ? 'checkbox' : 'radio'} aria-checked={picked.includes(v)} className="row pick" onClick={() => tap(v)}>
                <span>{words(v)}</span>
                {field.many ? <TickBox ticked={picked.includes(v)} /> : <RadioMark on={picked.includes(v)} />}
              </button>
            ))}
          </div>
          {field.many && (
            <div className="foot">
              <button type="button" className="primary" onClick={close}>
                Done
              </button>
            </div>
          )}
        </Over>
      )}
    </div>
  )
}
