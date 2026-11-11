// The listing form, from the market file alone (form.ts): its fields in the order a form asks them,
// the preview's first, each after the fields its `when` names, the rest after, contact last; a
// field shown only while the answers it depends on hold, and dropped, through a chain, when they no
// longer do; contact on every listing, though no market lists it; a choice by its label, else in
// words; and what still fits of a listing or a review an older market shaped. Every market and field
// is found by its shape (directory.ts), never named.

import { expect, test } from 'vitest'

import type { Body } from '@foundationforest/folders'

import { applies, backwards, fits, fitted, fitting, formFields, settled } from '../src/form.ts'
import { type Field, markets, pairs, previewOf } from '../src/markets.ts'
import { choiceWords, valueText, valueWords } from '../src/show.ts'
import { fieldWith, labelled, marketWith, opening, sides } from './directory.ts'

/** The fields a form shows for these answers, in its order. */
const shown = (fields: Array<[string, Field]>, values: Body) => fields.filter(([, f]) => applies(f, values)).map(([n]) => n)

/** The fields `field`'s `when` names, of those the form holds. */
const waits = (fields: Array<[string, Field]>, field: Field) => Object.keys(field.when ?? {}).filter((n) => fields.some(([m]) => m === n))

test('every form, in every market and role: the preview first, each field after those its `when` names and right after the last of them, the rest in the file\'s order, contact last', () => {
  for (const p of pairs) {
    const market = markets.market(p.market)!
    const fields = formFields(market, p.role)
    const order = fields.map(([n]) => n)
    expect(new Set(order).size, p.label).toBe(order.length)
    expect(order.at(-1), p.label).toBe('contact')
    for (const [name, field] of fields) {
      const before = waits(fields, field)
      for (const other of before) expect(order.indexOf(other), `${p.label}: ${other} before ${name}`).toBeLessThan(order.indexOf(name))
      if (!before.length) continue
      // Right after the last field it waits on: nothing between them but other fields that wait.
      const last = Math.max(...before.map((n) => order.indexOf(n)))
      for (const between of fields.slice(last + 1, order.indexOf(name))) expect(waits(fields, between[1]).length, `${p.label}: ${between[0]} between`).toBeGreaterThan(0)
    }
    // The preview's fields that wait on nothing come first, in its order.
    const first = previewOf(market).filter((n) => order.includes(n) && !waits(fields, fields.find(([m]) => m === n)![1]).length)
    expect(order.filter((n) => !waits(fields, fields.find(([m]) => m === n)![1]).length).slice(0, first.length), p.label).toEqual(first)
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

  const chain = fieldWith(markets, 'shown on an answer that is itself shown on one', (f, _, side) => Object.keys(f.when ?? {}).some((n) => side.market.listing[n]?.when))
  const chained = formFields(chain.market, chain.role)
  const answers = opening(chain.market, chain.field)
  const value = chain.field.type === 'choice' ? chain.field.values![0]! : '1'
  const held = { ...answers, [chain.name]: chain.field.many ? [value] : value } as Body
  expect(settled(chained, held), 'what still applies stays').toEqual(held)
  // The answer at the chain's root changed: what waits on it goes, and what waits on that goes too.
  const middle = Object.keys(chain.field.when!).find((n) => chain.market.listing[n]?.when)!
  const [root] = Object.keys(chain.market.listing[middle]!.when!) as [string]
  const elsewhere = chain.market.listing[root]!.values!.find((v) => !chain.market.listing[middle]!.when![root]!.includes(v))!
  const moved = settled(chained, { ...held, [root]: chain.market.listing[root]!.many ? [elsewhere] : elsewhere } as Body)
  expect(moved[middle], `${middle} dropped`).toBeUndefined()
  expect(moved[chain.name], `${chain.name} dropped with it`).toBeUndefined()
  expect(markets.checkEntry(chain.market.name, chain.role, 'listing', { ...moved, [chain.name]: held[chain.name] })).toMatch(new RegExp(`^${chain.name} is only for`))
})

test('a place only while a many answer holds one of the values it waits on, any of them; dropped when that goes', () => {
  const found = fieldWith(markets, 'a place shown on a many answer', (f, _, side) =>
    f.type === 'place' && !f.many && Object.entries(f.when ?? {}).some(([n, listed]) => side.market.listing[n]?.many && side.market.listing[n]!.values!.some((v) => !listed.includes(v))),
  )
  const fields = formFields(found.market, found.role)
  const [on, listed] = Object.entries(found.field.when!).find(([n]) => found.market.listing[n]?.many)!
  const off = found.market.listing[on]!.values!.find((v) => !listed.includes(v))!
  expect(shown(fields, {})).not.toContain(found.name)
  expect(shown(fields, { [on]: [off] })).not.toContain(found.name)
  expect(shown(fields, { [on]: [off, listed[0]!] }), 'a many answer: any of its values').toContain(found.name)
  const place = { lat: '40.420', lon: '-3.700', radiusKm: 5 }
  expect(settled(fields, { [on]: [off, listed[0]!], [found.name]: place })).toEqual({ [on]: [off, listed[0]!], [found.name]: place })
  expect(settled(fields, { [on]: [off], [found.name]: place })).toEqual({ [on]: [off] })
  expect(markets.checkEntry(found.market.name, found.role, 'listing', { [on]: [off], [found.name]: place })).toMatch(new RegExp(`^${found.name} is only for`))
})

test("contact on every listing, in every market and role, the form's last field, though no market lists it", () => {
  for (const p of pairs) {
    const market = markets.market(p.market)!
    expect(market.listing.contact, p.label).toBeUndefined()
    expect(formFields(market, p.role).at(-1)?.[0], p.label).toBe('contact')
    expect(markets.checkEntry(p.market, p.role, 'listing', { contact: '@ada' }), p.label).toBeNull()
  }
})

test('a choice by its label where its field has one, else its value in words; a many choice holds several', () => {
  const found = fieldWith(markets, 'a choice with a label its words do not say', (f) => labelled(f) !== undefined)
  const value = labelled(found.field)!
  expect(choiceWords(found.field, value)).toBe(found.field.labels![value])
  expect(choiceWords(found.field, value)).not.toBe(valueWords(value))
  expect(valueText(found.field, value)).toBe(found.field.labels![value])
  const plain = fieldWith(markets, 'a choice with a value it has no label for', (f) => f.type === 'choice' && f.values!.some((v) => !f.labels?.[v]))
  const word = plain.field.values!.find((v) => !plain.field.labels?.[v])!
  expect(choiceWords(plain.field, word), 'no label: in words').toBe(valueWords(word))
  const many = fieldWith(markets, 'a many choice with two values or more, waiting on nothing', (f) => f.type === 'choice' && f.many === true && f.values!.length >= 2 && !f.when)
  const [a, b] = many.field.values as [string, string]
  expect(valueText(many.field, [a, b])).toBe(`${choiceWords(many.field, a)}, ${choiceWords(many.field, b)}`)
  expect(markets.checkEntry(many.market.name, many.role, 'listing', { [many.name]: [a, b] })).toBeNull()
})

/** A role whose listings hold photos, a one-value choice, a many choice and a place, none waiting on another field, and a description. */
function shop() {
  const plain = (f: Field) => !f.when
  const side = sides(markets).find(({ market, role }) => {
    const fields = formFields(market, role).map(([, f]) => f)
    return (
      market.listing.description &&
      fields.some((f) => f.type === 'file' && plain(f)) &&
      fields.some((f) => f.type === 'choice' && !f.many && plain(f)) &&
      fields.some((f) => f.type === 'choice' && f.many && plain(f)) &&
      fields.some((f) => f.type === 'place' && !f.many && plain(f))
    )
  })
  if (!side) throw new Error('No market in the directory has a role with photos, a one-value choice, a many choice and a place')
  const fields = formFields(side.market, side.role).filter(([, f]) => plain(f))
  const named = (fits: (f: Field) => boolean) => fields.find(([, f]) => fits(f))![0]
  return {
    ...side,
    photos: named((f) => f.type === 'file'),
    one: named((f) => f.type === 'choice' && !f.many),
    many: named((f) => f.type === 'choice' && f.many === true),
    place: named((f) => f.type === 'place' && !f.many),
  }
}

test("an old listing: what still fits its market today, kept, its photos' files among it; the rest dropped", () => {
  const s = shop()
  const sha = 'a'.repeat(64)
  const files = [{ sha256: sha, type: 'image/jpeg', size: 1000 }]
  const value = s.market.listing[s.many]!.values![0]!
  const old = { description: 'A wool coat.', [s.photos]: [sha], files, [s.one]: 'EU 38', [s.many]: value, [s.place]: { area: 'Lyon' }, colour: 'red', contact: '@coats' }
  expect(fits(s.market.name, s.role, old)).toBe(false)
  const kept = fitting(s.market.name, s.role, old)
  expect(kept).toEqual({ description: 'A wool coat.', [s.photos]: [sha], files, contact: '@coats' })
  expect(fits(s.market.name, s.role, kept)).toBe(true)
  expect(fitting(s.market.name, s.role, { description: 'A wool coat.', [s.many]: [value, 'not-a-value'] }), 'a list with one value gone, dropped whole').toEqual({ description: 'A wool coat.' })
  expect(fitting(s.market.name, s.role, { description: 'A wool coat.', colour: 'red' }), 'a field the market has no more, dropped, the rest kept').toEqual({ description: 'A wool coat.' })
  // Which were dropped, so the form marks each: a price held as one, before every price was a list, among them.
  const { dropped } = fitted(s.market.name, s.role, { ...old, price: { amount: '40', currency: 'USD' } })
  expect(dropped.sort()).toEqual([s.one, s.many, s.place, 'colour', 'price'].sort())
  expect(fitted(s.market.name, s.role, kept).dropped, 'what fits, nothing').toEqual([])
})

test('a span that ends before it starts, and a range from more to less, found by field; in order, open at either end, or one value, none', () => {
  const fields: Record<string, Field> = {
    due: { type: 'moment', description: '.' },
    ages: { type: 'number', description: '.', unit: 'years', range: true },
  }
  expect(backwards(fields, { due: { from: '2026-12-02T10:00:00+01:00', to: '2026-12-01T10:00:00+01:00' } })?.[0]).toBe('due')
  expect(backwards(fields, { ages: { from: '11', to: '9' } })?.[0]).toBe('ages')
  expect(backwards(fields, { due: [{ from: '2026-12-02T10:00:00Z', to: '2026-12-01T10:00:00Z' }] })?.[0], 'one of a list').toBe('due')
  for (const fine of [{ due: { from: '2026-12-01T10:00:00+01:00', to: '2026-12-01T09:30:00+00:00' } }, { ages: { from: '9', to: '11' } }, { ages: { from: '18' } }, { ages: { to: '11' } }, { ages: '10' }, { due: '2026-12-01T10:00:00Z' }] as Body[])
    expect(backwards(fields, fine), JSON.stringify(fine)).toBeUndefined()
})

test('an old review: what still fits, checked against the role of whom it is about', () => {
  const found = fieldWith(
    markets,
    'a choice for reviews of one role, in a market with another',
    (f, _, side) => f.type === 'choice' && f.roles !== undefined && side.market.roles.some((r) => !f.roles!.includes(r.role)),
    'review',
  )
  const other = found.market.roles.find((r) => !found.field.roles!.includes(r.role))!.role
  const old = { subject: 'TheirAddress', score: '8', text: 'Quick.', [found.name]: found.field.values![0]!, speed: 'fast' }
  expect(fitting(found.market.name, other, old, 'review', found.role)).toEqual({ subject: 'TheirAddress', score: '8', text: 'Quick.', [found.name]: found.field.values![0]! })
  expect(fitting(found.market.name, found.role, old, 'review', other), `${found.name} is for reviews of ${found.field.roles!.join(' or ')}`).toEqual({ subject: 'TheirAddress', score: '8', text: 'Quick.' })
})

test('a market the directory has, found by its shape: the finders name what they could not find', () => {
  expect(() => marketWith(markets, 'no roles at all', (m) => m.roles.length === 0)).toThrow('No market in the directory has no roles at all')
})
