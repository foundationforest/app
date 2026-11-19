// The listing form, from the market file alone (form.ts): its fields as the markets ask them, the
// preview's first, each after the fields its `when` names, contact last, with the market's own words
// for each; a field shown only while the answers it depends on hold, and dropped, through a chain,
// when they no longer do; contact on every listing, though no market lists it; a choice by the
// markets' words for it; days or a range that run backwards; and what still fits of a listing or a
// review an older market shaped. Every market and field is found by its shape (directory.ts), never
// named.

import { expect, test } from 'vitest'

import type { Body } from '@foundationforest/folders'

import { applies, backwards, fits, fitted, fitting, formFields, settled } from '../src/form.ts'
import { type Asked, type Field, askOf, choiceWords, markets, pairs } from '../src/markets.ts'
import { answerText } from '../src/show.ts'
import { fieldWith, labelled, marketWith, opening, sides } from './directory.ts'

/** The fields a form shows for these answers, in its order. */
const shown = (fields: Asked[], values: Body) => fields.filter((f) => applies(f, values)).map((f) => f.name)

test("every form, in every market and role: the markets' own order and words, each field after those its `when` names, contact last", () => {
  for (const p of pairs) {
    const market = markets.market(p.market)!
    const fields = formFields(market, p.role)
    const order = fields.map((f) => f.name)
    expect(order, p.label).toEqual(askOf(p.market, p.role).map((f) => f.name))
    expect(new Set(order).size, p.label).toBe(order.length)
    expect(order.at(-1), p.label).toBe('contact')
    for (const field of fields) {
      for (const other of Object.keys(field.when ?? {})) expect(order.indexOf(other), `${p.label}: ${other} before ${field.name}`).toBeLessThan(order.indexOf(field.name))
      expect(field.label, `${p.label}: ${field.name} has words`).not.toBe('')
      expect(field.question, `${p.label}: ${field.name} asks`).not.toBe('')
    }
  }
})

test('a field that waits on two answers shows only once both hold; one that waits on an answer that waits too, a chain, drops with it; the checker agrees', () => {
  const two = fieldWith(markets, 'shown on two answers', (f) => Object.keys(f.when ?? {}).length >= 2)
  const fields = formFields(two.market, two.role)
  const both = opening(two.market, two.field)
  const other = Object.keys(two.field.when!).at(-1)!
  const { [other]: _, ...oneOnly } = both
  expect(shown(fields, {}), 'no answers').not.toContain(two.name)
  expect(shown(fields, oneOnly), 'one answer').not.toContain(two.name)
  expect(shown(fields, both), 'both').toContain(two.name)

  const chain = fieldWith(markets, 'a choice shown on an answer that is itself shown on one', (f, _, side) => f.piece === 'choice' && Object.keys(f.when ?? {}).some((n) => side.market.listing[n]?.when))
  const chained = formFields(chain.market, chain.role)
  const answers = opening(chain.market, chain.field)
  const value = (markets.ask(chain.market.name, chain.role).find((f) => f.name === chain.name)!.choices ?? [])[0]!.value
  const held = { ...answers, [chain.name]: chain.field.several ? [value] : value } as Body
  expect(settled(chained, held), 'what still applies stays').toEqual(held)
  // The answer at the chain's root changed: what waits on it goes, and what waits on that goes too.
  const middle = Object.keys(chain.field.when!).find((n) => chain.market.listing[n]?.when)!
  const [root] = Object.keys(chain.market.listing[middle]!.when!) as [string]
  const rootValues = markets.ask(chain.market.name, chain.role).find((f) => f.name === root)!.choices!.map((c) => c.value)
  const elsewhere = rootValues.find((v) => !chain.market.listing[middle]!.when![root]!.includes(v))!
  const moved = settled(chained, { ...held, [root]: chain.market.listing[root]!.several ? [elsewhere] : elsewhere } as Body)
  expect(moved[middle], `${middle} dropped`).toBeUndefined()
  expect(moved[chain.name], `${chain.name} dropped with it`).toBeUndefined()
  expect(markets.checkEntry(chain.market.name, chain.role, 'listing', { ...moved, [chain.name]: held[chain.name] })).toMatch(new RegExp(`^${chain.name} is only for`))
})

test('places only while a choice of several holds one of the values they wait on, any of them; dropped when that goes', () => {
  const found = fieldWith(markets, 'a place shown on a choice of several', (f, _, side) =>
    f.piece === 'place' && Object.entries(f.when ?? {}).some(([n, listed]) => side.market.listing[n]?.several && side.market.listing[n]!.values instanceof Array && (side.market.listing[n]!.values as string[]).some((v) => !listed.includes(v))),
  )
  const fields = formFields(found.market, found.role)
  const [on, listed] = Object.entries(found.field.when!).find(([n]) => found.market.listing[n]?.several)!
  const off = (found.market.listing[on]!.values as string[]).find((v) => !listed.includes(v))!
  expect(shown(fields, {})).not.toContain(found.name)
  expect(shown(fields, { [on]: [off] })).not.toContain(found.name)
  expect(shown(fields, { [on]: [off, listed[0]!] }), 'several answers: any of them').toContain(found.name)
  const place = [{ lat: '40.42', lon: '-3.7', radiusKm: 5 }]
  expect(settled(fields, { [on]: [off, listed[0]!], [found.name]: place })).toEqual({ [on]: [off, listed[0]!], [found.name]: place })
  expect(settled(fields, { [on]: [off], [found.name]: place })).toEqual({ [on]: [off] })
  expect(markets.checkEntry(found.market.name, found.role, 'listing', { [on]: [off], [found.name]: place })).toMatch(new RegExp(`^${found.name} is only for`))
})

test("contact on every listing, in every market and role, the form's last field, though no market lists it", () => {
  for (const p of pairs) {
    const market = markets.market(p.market)!
    expect(market.listing.contact, p.label).toBeUndefined()
    expect(formFields(market, p.role).at(-1)?.name, p.label).toBe('contact')
    expect(markets.checkEntry(p.market, p.role, 'listing', { contact: '@ada' }), p.label).toBeNull()
  }
})

test("a choice by the markets' words for it, a label where it has one and a shared list's name else; several in turn", () => {
  const found = fieldWith(markets, 'a choice with a label its words do not say', (f) => labelled(f, markets.lists) !== undefined)
  const value = labelled(found.field, markets.lists)!
  expect(choiceWords(found.field, value)).not.toBe(value)
  expect(answerText(found.field, found.field.several ? [value] : value)).toBe(choiceWords(found.field, value))
  const several = fieldWith(markets, 'a choice of several with two values or more of its own, waiting on nothing', (f) => f.piece === 'choice' && f.several === true && Array.isArray(f.values) && f.values.length >= 2 && !f.when)
  const [a, b] = several.field.values as [string, string]
  expect(answerText(several.field, [a, b])).toBe(`${choiceWords(several.field, a)}, ${choiceWords(several.field, b, false)}`)
  expect(markets.checkEntry(several.market.name, several.role, 'listing', { [several.name]: [a, b] })).toBeNull()
})

/** A role whose listings hold photos, a choice of one, a choice of several and places, none waiting on another field, and a description. */
function plainShop() {
  const plain = (f: Field) => !f.when
  const side = sides(markets).find(({ market, role }) => {
    const fields = formFields(market, role)
    return (
      market.listing.description &&
      fields.some((f) => f.piece === 'photo' && plain(f)) &&
      fields.some((f) => f.piece === 'choice' && !f.several && plain(f)) &&
      fields.some((f) => f.piece === 'choice' && f.several && plain(f)) &&
      fields.some((f) => f.piece === 'place' && plain(f))
    )
  })
  if (!side) throw new Error('No market in the directory has a role with photos, a choice of one, a choice of several and places')
  const fields = formFields(side.market, side.role).filter((f) => plain(f))
  const named = (fits: (f: Asked) => boolean) => fields.find((f) => fits(f))!
  return {
    ...side,
    photos: named((f) => f.piece === 'photo').name,
    one: named((f) => f.piece === 'choice' && !f.several).name,
    several: named((f) => f.piece === 'choice' && f.several === true),
    place: named((f) => f.piece === 'place').name,
  }
}

test("an old listing: what still fits its market today, kept, its photos' files among it; the rest dropped", () => {
  const s = plainShop()
  const sha = 'a'.repeat(64)
  const files = [{ sha256: sha, type: 'image/jpeg', size: 1000 }]
  const value = s.several.choices![0]!.value
  const old = { description: 'A wool coat.', [s.photos]: [sha], files, [s.one]: 'EU 38', [s.several.name]: value, [s.place]: { area: 'Lyon' }, colour: 'red', contact: '@coats' }
  expect(fits(s.market.name, s.role, old)).toBe(false)
  const kept = fitting(s.market.name, s.role, old)
  expect(kept).toEqual({ description: 'A wool coat.', [s.photos]: [sha], files, contact: '@coats' })
  expect(fits(s.market.name, s.role, kept)).toBe(true)
  expect(fitting(s.market.name, s.role, { description: 'A wool coat.', [s.several.name]: [value, 'not-a-value'] }), 'a list with one value gone, dropped whole').toEqual({ description: 'A wool coat.' })
  expect(fitting(s.market.name, s.role, { description: 'A wool coat.', colour: 'red' }), 'a field the market has no more, dropped, the rest kept').toEqual({ description: 'A wool coat.' })
  // Which were dropped, so the form marks each: a price held as one, before every price was a list, among them.
  const { dropped } = fitted(s.market.name, s.role, { ...old, price: { amount: '40', currency: 'USD' } })
  expect(dropped.sort()).toEqual([s.one, s.several.name, s.place, 'colour', 'price'].sort())
  expect(fitted(s.market.name, s.role, kept).dropped, 'what fits, nothing').toEqual([])
})

test('days that run from a later day to an earlier one, and a range from more to less, found by field; in order, open at either end, or one value, none; hours past midnight are fine', () => {
  const date = fieldWith(markets, 'a date of several', (f) => f.piece === 'date' && f.several === true)
  const range = fieldWith(markets, 'a number a role answers as a range', (f) => f.piece === 'number')
  const fields = [...askOf(date.market.name, date.role).filter((f) => f.name === date.name), ...askOf(range.market.name, range.role).filter((f) => f.name === range.name)]
  expect(backwards(fields, { [date.name]: [{ from: '2027-06-02', to: '2027-06-01' }] })?.name).toBe(date.name)
  expect(backwards(fields, { [date.name]: [{ every: ['monday'], from: '2027-09-01', to: '2027-06-01' }] })?.name, 'weekly, its days').toBe(date.name)
  expect(backwards(fields, { [range.name]: { from: '11', to: '9' } })?.name).toBe(range.name)
  for (const fine of [
    { [date.name]: [{ from: '2027-06-01', to: '2027-06-01' }] },
    { [date.name]: [{ every: ['friday'], start: '22:00', end: '02:00', zone: 'Europe/Lisbon' }] },
    { [range.name]: { from: '9', to: '11' } },
    { [range.name]: { from: '18' } },
    { [range.name]: '10' },
  ] as Body[])
    expect(backwards(fields, fine), JSON.stringify(fine)).toBeUndefined()
})

test('an old review: what still fits, checked against the role of whom it is about', () => {
  const found = fieldWith(
    markets,
    'a choice for reviews of one role, in a market with another',
    (f, _, side) => f.piece === 'choice' && f.roles !== undefined && side.market.roles.some((r) => !f.roles!.includes(r.role)),
    'review',
  )
  const other = found.market.roles.find((r) => !found.field.roles!.includes(r.role))!.role
  const yes = (found.field.values as string[])[0]!
  const old = { subject: 'TheirAddress', score: '8', text: 'Quick.', [found.name]: yes, speed: 'fast' }
  expect(fitting(found.market.name, other, old, 'review', found.role)).toEqual({ subject: 'TheirAddress', score: '8', text: 'Quick.', [found.name]: yes })
  expect(fitting(found.market.name, found.role, old, 'review', other), `${found.name} is for reviews of ${found.field.roles!.join(' or ')}`).toEqual({ subject: 'TheirAddress', score: '8', text: 'Quick.' })
})

test('a market the directory has, found by its shape: the finders name what they could not find', () => {
  expect(() => marketWith(markets, 'no roles at all', (m) => m.roles.length === 0)).toThrow('No market in the directory has no roles at all')
})
