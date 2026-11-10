// A choice with a long list (more than eight values, such as a tutor's subjects), as one row in the
// form: what is picked, as chips when several may be, else in words, or Choose; tapped, a sheet
// rises with a search over the values' words. Whether one value or several is the field's own
// (`many`, the markets manual's), never the market's: for one, each value a row with its radio mark,
// and a tap picks it and closes the sheet (the one picked, tapped, is picked no more); for several,
// each with its tick box, each tap ticks or unticks, and Done closes it. The sheet sits in the
// page's body, so no key in it reaches the form.

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Icon } from '../icons.tsx'
import type { Field } from '../markets.ts'
import { choiceWords } from '../show.ts'
import { RadioMark, Sheet, TickBox } from '../ui.tsx'

type Props = { label: string; field: Pick<Field, 'values' | 'many' | 'labels'>; picked: string[]; onPick: (next: string[]) => void }

export function Picker({ label, field, picked, onPick }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const row = useRef<HTMLButtonElement>(null)
  const values = field.values ?? []
  const words = (v: string) => choiceWords(field, v)
  const shown = values.filter((v) => words(v).toLowerCase().includes(search.trim().toLowerCase()))
  const close = () => {
    setOpen(false)
    setSearch('')
    requestAnimationFrame(() => row.current?.focus())
  }
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
      <button ref={row} type="button" className="open-row" onClick={() => setOpen(true)}>
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
      {open &&
        createPortal(
          <Sheet label={label} onClose={close}>
            <h2>{label}</h2>
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
              <button type="button" className="primary" onClick={close}>
                Done
              </button>
            )}
          </Sheet>,
          document.body,
        )}
    </div>
  )
}
