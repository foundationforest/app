// What a test needs from the markets, found in the directory instead of named: a market with an
// offers role and a requests role, one with a single role, a field of some shape for some role. The
// markets change (a beta market may change in any way, or go), so a test that named one would break
// with them; one that finds its shape keeps working while any market holds it. Each finder looks at
// the live markets first, since a live market only grows and so keeps every shape it has, then the
// beta ones, each in the directory's order; one that finds nothing throws, naming the shape, so a
// change that takes the last of a shape away fails the test that needs it, never skips it. Used by
// the Vitest tests (with the app's own markets) and the browser test (with the markets' Node entry).

import { type Field, type Lists, type Market, type Markets, labelOf, valuesOf } from '../markets/build/dist/index.js'

type Directory = Pick<Markets, 'directory' | 'market' | 'lists'>

/** A market's role and the label a profile of it has. */
export type Side = { market: Market; role: string; label: string; offers: boolean }

/** A field found: its market, the role whose listings (or reviews of whom) hold it, its name and itself. */
export type Found = Side & { name: string; field: Field }

/** The directory's markets, live first, each in the directory's order. */
export function inOrder(ms: Directory): Market[] {
  const all = ms.directory.markets.map((m) => ms.market(m.name)!)
  return [...all.filter((m) => m.status === 'live'), ...all.filter((m) => m.status !== 'live')]
}

const sideOf = (market: Market, role: string): Side => ({ market, role, label: `${market.name}/${role}`, offers: market.roles.find((r) => r.role === role)?.listings === 'offers' })

/** Every market's every role, live markets first. */
export const sides = (ms: Directory): Side[] => inOrder(ms).flatMap((m) => m.roles.map((r) => sideOf(m, r.role)))

/** The first market `fits`, live first; `what` names the shape when none does. */
export function marketWith(ms: Directory, what: string, fits: (m: Market) => boolean): Market {
  const found = inOrder(ms).find(fits)
  if (!found) throw new Error(`No market in the directory has ${what}`)
  return found
}

/** A market with a role that offers and one that requests: its two sides, offers first. */
export function twoSides(ms: Directory, fits: (m: Market) => boolean = () => true): { market: Market; offer: Side; request: Side } {
  const market = marketWith(ms, 'a role that offers and one that requests', (m) => m.roles.some((r) => r.listings === 'offers') && m.roles.some((r) => r.listings === 'requests') && fits(m))
  return { market, offer: sideOf(market, market.roles.find((r) => r.listings === 'offers')!.role), request: sideOf(market, market.roles.find((r) => r.listings === 'requests')!.role) }
}

/** A market with one role only, whose profiles deal with each other. */
export function oneRole(ms: Directory): Side {
  const market = marketWith(ms, 'one role only', (m) => m.roles.length === 1)
  return sideOf(market, market.roles[0]!.role)
}

/** Whether a field is for a role: it names none, or names that one. */
export const isFor = (field: Field, role: string) => !field.roles || field.roles.includes(role)

/**
 * The first listing field (or review field, with `kind`) that `fits`, in a market and role it is for,
 * live markets first. A review field's role is that of the profile reviewed.
 */
export function fieldWith(ms: Directory, what: string, fits: (field: Field, name: string, side: Side) => boolean, kind: 'listing' | 'review' = 'listing'): Found {
  for (const side of sides(ms)) {
    for (const [name, field] of Object.entries(side.market[kind] ?? {})) if (isFor(field, side.role) && fits(field, name, side)) return { ...side, name, field }
  }
  throw new Error(`No market in the directory has a ${kind} field that is ${what}`)
}

/** Whether a choice field is a long list, more than the chips the form shows: a search over its values. */
export const isLong = (field: Field, lists: Lists) => field.piece === 'choice' && valuesOf(field, lists).length > 8

/** A value of a choice field whose words a label gives, not its name (`es`, Spanish; `xl`, XL), if it has one. */
export function labelled(field: Field, lists: Lists): string | undefined {
  const words = (v: string) => v.replaceAll('-', ' ').toLowerCase()
  return valuesOf(field, lists).find((v) => labelOf(field, v, lists).toLowerCase() !== words(v))
}

/** Answers that make `field` apply in `market`: for each field its `when` names, the first value it lists, through a chain; a field with several as a list. */
export function opening(market: Market, field: Field): Record<string, string | string[]> {
  const answers: Record<string, string | string[]> = {}
  const open = (f: Field) => {
    for (const [other, values] of Object.entries(f.when ?? {})) {
      const into = market.listing[other]!
      open(into)
      answers[other] = into.several ? [values[0]!] : values[0]!
    }
  }
  open(field)
  return answers
}

/** A value in words, hyphens as spaces and a capital first. */
export const valueWords = (value: string) => {
  const words = value.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** A choice's value as the app shows it: the markets' words for it, with a capital (labelOf). */
export const choiceWords = (field: Field, value: string, lists: Lists) => labelOf(field, value, lists, true)

/** A market's name in words, as the app says it (markets.ts): `home-cleaning` is Home cleaning. */
export const marketWords = valueWords

/** A role as a title says it (markets.ts): Tutor. */
export const roleWords = valueWords

/** A field of a role's listings that `fits`, by name, or undefined. */
const named = (market: Market, role: string, fits: (f: Field, name: string) => boolean): string | undefined => Object.entries(market.listing).find(([n, f]) => isFor(f, role) && fits(f, n))?.[0]

/**
 * Lessons, as a tutor posts them: a market with two sides whose offers hold a description, a price
 * per one of two values or more, a long list of several values waiting on nothing (a search), and
 * places shown only on one value or more of another choice of several (in person, not online).
 */
export function lessons(ms: Directory) {
  const shape = (m: Market) => {
    const role = m.roles.find((r) => r.listings === 'offers')?.role
    if (!role || !m.listing.description || (m.listing.price?.per?.length ?? 0) < 2) return null
    const place = named(m, role, (f) => f.piece === 'place' && Object.keys(f.when ?? {}).length === 1 && m.listing[Object.keys(f.when!)[0]!]?.several === true)
    if (!place) return null
    const mode = Object.keys(m.listing[place]!.when!)[0]!
    const choice = named(m, role, (f, n) => n !== mode && f.several === true && isLong(f, ms.lists) && !f.when)
    const online = valuesOf(m.listing[mode]!, ms.lists).find((v) => !m.listing[place]!.when![mode]!.includes(v))
    return choice && online ? { place, mode, choice, online, inPerson: m.listing[place]!.when![mode]![0]!, per: m.listing.price!.per! } : null
  }
  const found = twoSides(ms, (m) => shape(m) !== null)
  return { ...found, ...shape(found.market)! }
}

/**
 * Things sold, as a seller posts them: a market with two sides whose offers hold photos, a price with
 * no per, and places both sides may hold, shown on a choice of several (in person); a long list of
 * one value (a kind) that opens a few values of several (who it's for) and a labelled list (a size),
 * and with who it's for a long list further down the chain; a few values of several waiting on
 * nothing; and a review field kept for reviews of the side that offers.
 */
export function shop(ms: Directory) {
  const shape = (m: Market) => {
    const [seller, buyer] = [m.roles.find((r) => r.listings === 'offers')?.role, m.roles.find((r) => r.listings === 'requests')?.role]
    if (!seller || !buyer || !m.listing.description || m.listing.price?.piece !== 'price' || m.listing.price.per) return null
    const has = (fits: (f: Field, name: string) => boolean) => named(m, seller, fits)
    const long = (f: Field) => isLong(f, ms.lists)
    const photos = has((f) => f.piece === 'photo' && f.several === true)
    const place = has((f) => f.piece === 'place' && Object.keys(f.when ?? {}).length === 1 && isFor(f, buyer))
    const opener = has((f) => f.piece === 'choice' && !f.several && !f.when && long(f))
    if (!photos || !place || !opener) return null
    const handover = Object.keys(m.listing[place]!.when!)[0]!
    const on = (f: Field, ...names: string[]) => Object.keys(f.when ?? {}).sort().join() === [...names].sort().join()
    const follow = has((f) => f.piece === 'choice' && f.several === true && !long(f) && on(f, opener))
    const sized = has((f) => f.piece === 'choice' && Object.keys(f.ask?.labels ?? {}).length > 0 && on(f, opener))
    const chain = follow && has((f) => f.piece === 'choice' && long(f) && on(f, opener, follow))
    const several = has((f, n) => f.piece === 'choice' && f.several === true && !f.when && !long(f) && valuesOf(f, ms.lists).length >= 3 && n !== handover)
    const review = Object.entries(m.review ?? {}).find(([, f]) => f.piece === 'choice' && f.roles?.includes(seller) && !f.roles.includes(buyer))?.[0]
    if (!follow || !sized || !chain || !several || !review) return null
    const L = m.listing
    // A kind that opens who it's for, the size, and the chain's list: clothes.
    const kind = valuesOf(L[opener]!, ms.lists).find((v) => [follow, sized, chain].every((n) => L[n]!.when![opener]!.includes(v)))
    // Who it's for, one that opens the chain's list (children) and one that doesn't (women).
    const opens = L[chain]!.when![follow]![0]!
    const other = valuesOf(L[follow]!, ms.lists).find((v) => !L[chain]!.when![follow]!.includes(v))
    const inPerson = L[place]!.when![handover]![0]!
    const away = valuesOf(L[handover]!, ms.lists).find((v) => v !== inPerson)
    if (!kind || !other || !away) return null
    return { seller, buyer, photos, place, handover, inPerson, away, opener, kind, follow, opens, other, sized, chain, several, review }
  }
  const market = marketWith(ms, 'things sold, with photos, a chain of lists and chips', (m) => shape(m) !== null)
  return { market, ...shape(market)! }
}
