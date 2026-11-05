// The listing form, read from the market file alone, never a field by name (the markets manual's
// The file and Preview). Which fields a role's listing asks, in the order a form asks them: the
// preview's first, each after the fields its `when` names, and a field with `when` right after the
// last of them; then the rest, in the file's order; contact last, which every listing may hold. A
// field with `when` applies only while each answer it names holds one of its values (a `many`
// answer, any of them); an answer changed drops every field that no longer applies, through a chain
// too. And what still fits of an entry an older market shaped, a listing or a review: the field
// checkEntry names, dropped, until the rest fits.

import type { Body } from '@foundationforest/folders'

import { type Field, type Kind, type Market, fieldsOf, markets, previewOf } from './markets.ts'

/** A role's listing fields, each with its name, in the order a form asks them. */
export function formFields(market: Market, role: string): Array<[string, Field]> {
  const fields = fieldsOf(market, 'listing', role)
  const waits = (name: string) => Object.keys(fields[name]!.when ?? {}).filter((other) => other in fields)
  // The preview's first, then the rest, each after the fields it waits on.
  const first: string[] = []
  const visit = (name: string, path: Set<string>) => {
    if (first.includes(name) || path.has(name)) return
    path.add(name)
    for (const other of waits(name)) visit(other, path)
    first.push(name)
  }
  for (const name of [...previewOf(market).filter((n) => n in fields), ...Object.keys(fields)]) visit(name, new Set())
  // Then each field that waits, right after the last of those it waits on.
  const last = (name: string) => waits(name).reduce((a, b) => (first.indexOf(b) > first.indexOf(a) ? b : a))
  const out: string[] = []
  const emit = (name: string) => {
    if (out.includes(name)) return
    out.push(name)
    for (const next of first) if (waits(next).length && last(next) === name) emit(next)
  }
  for (const name of first) if (!waits(name).length) emit(name)
  for (const name of first) emit(name)
  return out.map((name) => [name, fields[name]!])
}

/** Whether a field applies to the answers so far: each field its `when` names holds one of the values it lists, a `many` answer any of them. */
export function applies(field: Field, values: Body): boolean {
  return Object.entries(field.when ?? {}).every(([other, listed]) => {
    const held = values[other]
    return (Array.isArray(held) ? held : [held]).some((v) => typeof v === 'string' && listed.includes(v))
  })
}

/** The answers, with each field that no longer applies left out, through a chain: a kind changed drops its size. */
export function settled(fields: Array<[string, Field]>, values: Body): Body {
  let now = values
  for (;;) {
    const gone = fields.filter(([name, field]) => now[name] !== undefined && !applies(field, now)).map(([name]) => name)
    if (!gone.length) return now
    now = Object.fromEntries(Object.entries(now).filter(([name]) => !gone.includes(name))) as Body
  }
}

/** Whether a listing's body fits its market as the file says today: what the index lists. */
export const fits = (market: string, role: string, body: Body) => markets.checkEntry(market, role, 'listing', body) === null

/**
 * What still fits of an entry's body in its market today, a listing's unless `kind` says: the field
 * checkEntry names, dropped, one at a time, until the rest fits; a review's checked against the role
 * of the profile it is about (`aboutRole`). Its files stay, which a listing names its photos by.
 */
export function fitting(market: string, role: string, body: Body, kind: Kind = 'listing', aboutRole?: string): Body {
  const now: Body = { ...body }
  for (;;) {
    const why = markets.checkEntry(market, role, kind, now, aboutRole)
    if (!why) return now
    // The field it names: first, as most lines say it, or last, for a field the market has no more.
    const named = Object.keys(now).find((name) => name !== 'files' && (why.startsWith(`${name} `) || why.endsWith(` has no field ${name}`)))
    if (!named) return {}
    delete now[named]
  }
}
