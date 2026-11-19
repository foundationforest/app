// The listing form, read from the market file alone, never a field by name (the pieces page's market
// file): which fields a role's listing asks, in the order the markets' `ask` gives them, the
// preview's first, each after the fields its `when` names, contact last, which every listing may
// hold. A field with `when` applies only while each answer it names holds one of its values (a
// field with several answers, any of them); an answer changed drops every field that no longer
// applies, through a chain too. A span of days that ends before it starts, or a range from more to
// less, found before anything is posted, so the form says which in one line. And what still fits of
// an entry an older market shaped, a listing or a review: the field checkEntry names, dropped, until
// the rest fits, and which fields were dropped, so the form marks them.

import type { Body } from '@foundationforest/folders'

import { type Asked, type Kind, type Market, askOf, markets } from './markets.ts'

/** A role's listing fields, each with its words, in the order a form asks them. */
export const formFields = (market: Market, role: string): Asked[] => askOf(market.name, role, 'listing')

/** Whether a field applies to the answers so far: each field its `when` names holds one of the values it lists, a list of answers any of them. */
export function applies(field: Pick<Asked, 'when'>, values: Body): boolean {
  return Object.entries(field.when ?? {}).every(([other, listed]) => {
    const held = values[other]
    return (Array.isArray(held) ? held : [held]).some((v) => typeof v === 'string' && listed.includes(v))
  })
}

/** The answers, with each field that no longer applies left out, through a chain: a kind changed drops its size. */
export function settled(fields: Asked[], values: Body): Body {
  let now = values
  for (;;) {
    const gone = fields.filter((field) => now[field.name] !== undefined && !applies(field, now)).map((field) => field.name)
    if (!gone.length) return now
    now = Object.fromEntries(Object.entries(now).filter(([name]) => !gone.includes(name))) as Body
  }
}

/**
 * The first field of `fields` whose answer runs backwards, if one does: a date whose days run from a
 * later day to an earlier one, or a number range whose `from` is more than its `to`. The markets'
 * checkEntry refuses both; this names which, so the form says it in words. Hours that end before they
 * start are not backwards: they run past midnight.
 */
export function backwards(fields: Asked[], body: Body): Asked | undefined {
  const turned = (field: Asked, v: unknown) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return false
    const { from, to } = v as { from?: unknown; to?: unknown }
    if (typeof from !== 'string' || typeof to !== 'string') return false
    if (field.piece === 'date') return from > to
    return field.piece === 'number' && Number(from) > Number(to)
  }
  return fields.find((field) => (Array.isArray(body[field.name]) ? (body[field.name] as unknown[]) : [body[field.name]]).some((v) => turned(field, v)))
}

/** Whether a listing's body fits its market as the file says today: what the index lists. */
export const fits = (market: string, role: string, body: Body) => markets.checkEntry(market, role, 'listing', body) === null

/**
 * What still fits of an entry's body in its market today, a listing's unless `kind` says, and which
 * of its fields were dropped: the field checkEntry names, dropped, one at a time, until the rest fits;
 * a review's checked against the role of the profile it is about (`aboutRole`). Its files stay, which
 * a listing names its photos by.
 */
export function fitted(market: string, role: string, body: Body, kind: Kind = 'listing', aboutRole?: string): { body: Body; dropped: string[] } {
  const now: Body = { ...body }
  const dropped: string[] = []
  for (;;) {
    const why = markets.checkEntry(market, role, kind, now, aboutRole)
    if (!why) return { body: now, dropped }
    // The field it names: first, as most lines say it, or last, for a field the market has no more.
    const named = Object.keys(now).find((name) => name !== 'files' && (why.startsWith(`${name} `) || why.endsWith(` has no field ${name}`)))
    if (!named) return { body: {}, dropped: [...dropped, ...Object.keys(now).filter((name) => name !== 'files')] }
    dropped.push(named)
    delete now[named]
  }
}

/** What still fits of an entry's body in its market today (fitted's body). */
export const fitting = (market: string, role: string, body: Body, kind: Kind = 'listing', aboutRole?: string): Body => fitted(market, role, body, kind, aboutRole).body
