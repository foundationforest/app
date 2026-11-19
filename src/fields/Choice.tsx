// A choice (the pieces page's choice): one value, or with `several` a list of them, each by the
// market's own words for it (`ask`'s choices). Two or three values for one answer side by side
// (Seg); up to eight, chips, each showing its tick when picked where several may be, a pick unpicking
// the other where only one may; a long list, such as the shared languages, a search over the
// values' words, those picked first as chips, then the values that match, each a row with its tick
// box or its radio mark. One picked, tapped again, is picked no more.

import { useState } from 'react'

import { Icon } from '../icons.tsx'
import type { Asked } from '../markets.ts'
import { RadioMark, Seg, TickBox } from '../ui.tsx'

/** A choice with more values than this is searched; with at most `SIDE_BY_SIDE` for one answer, side by side; else chips. */
export const CHIPS_AT_MOST = 8
const SIDE_BY_SIDE = 3
/** How many of a long list show before anything is searched. */
const FIRST_SHOWN = 8

type Props = { field: Asked; value: unknown; onChange: (v: unknown) => void }

export function Choice({ field, value, onChange }: Props) {
  const choices = field.choices ?? []
  const several = field.several === true
  const [picked, setPicked] = useState<string[]>(Array.isArray(value) ? value.filter((v) => typeof v === 'string') : typeof value === 'string' ? [value] : [])
  const set = (next: string[]) => {
    setPicked(next)
    onChange(several ? (next.length ? next : undefined) : next[0])
  }
  const tap = (v: string) => {
    const on = picked.includes(v)
    set(several ? (on ? picked.filter((p) => p !== v) : [...picked, v]) : on ? [] : [v])
  }
  if (choices.length > CHIPS_AT_MOST) return <Long field={field} picked={picked} onTap={tap} />
  if (!several && choices.length <= SIDE_BY_SIDE)
    return <Seg label={field.label} options={choices.map((c) => ({ value: c.value, words: c.label }))} value={picked[0]} onPick={(v) => set(v ? [v] : [])} clears />
  return (
    <div className="chips" role={several ? 'group' : 'radiogroup'} aria-label={field.label}>
      {choices.map((c) => {
        const on = picked.includes(c.value)
        return (
          <button key={c.value} type="button" className={on ? 'chip here' : 'chip'} {...(several ? { 'aria-pressed': on } : { role: 'radio', 'aria-checked': on })} onClick={() => tap(c.value)}>
            {several && on && <Icon name="check" bold />}
            {c.label}
          </button>
        )
      })}
    </div>
  )
}

/** A long list: a search, those picked as chips, then the values its words match, a few until something is typed. */
function Long({ field, picked, onTap }: { field: Asked; picked: string[]; onTap: (v: string) => void }) {
  const [search, setSearch] = useState('')
  const several = field.several === true
  const words = new Map((field.choices ?? []).map((c) => [c.value, c.label]))
  const typed = search.trim().toLowerCase()
  const matching = (field.choices ?? []).filter((c) => !picked.includes(c.value) && c.label.toLowerCase().includes(typed))
  const shown = typed ? matching : matching.slice(0, FIRST_SHOWN)
  return (
    <div className="long-choice" role="group" aria-label={field.label}>
      {picked.length > 0 && (
        <div className="chips">
          {picked.map((v) => (
            <button key={v} type="button" className="chip here" aria-label={`Remove ${words.get(v) ?? v}`} onClick={() => onTap(v)}>
              {words.get(v) ?? v}
              <Icon name="x" bold />
            </button>
          ))}
        </div>
      )}
      <input type="search" aria-label={`Search ${field.label.toLowerCase()}`} placeholder="Search" autoComplete="off" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="rows pick-list" role={several ? 'group' : 'radiogroup'} aria-label={field.label}>
        {shown.map((c) => (
          <button
            key={c.value}
            type="button"
            role={several ? 'checkbox' : 'radio'}
            aria-checked={false}
            className="row pick"
            onClick={() => {
              onTap(c.value)
              setSearch('')
            }}
          >
            <span>{c.label}</span>
            {several ? <TickBox ticked={false} /> : <RadioMark on={false} />}
          </button>
        ))}
      </div>
    </div>
  )
}
