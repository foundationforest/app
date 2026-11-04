// The listing form, from the market file alone (form.ts): its fields in the order a form asks them,
// the preview's first, each after the fields its `when` names, the rest after, contact last; a
// field shown only while the answers it depends on hold, and dropped, through a chain, when they no
// longer do; contact on every listing, though no market lists it; a choice by its label, else in
// words; and what still fits of a listing an older market shaped.

import { expect, test } from 'vitest'

import type { Body } from '@foundationforest/folders'

import { applies, fits, fitting, formFields, settled } from '../src/form.ts'
import { type Field, markets, pairs } from '../src/markets.ts'
import { choiceWords, valueText } from '../src/show.ts'

const clothing = markets.market('clothing')!
const tutoring = markets.market('tutoring')!

/** The fields a form shows for these answers, in its order. */
const shown = (fields: Array<[string, Field]>, values: Body) => fields.filter(([, f]) => applies(f, values)).map(([n]) => n)

test("clothing: the preview's fields first, who it's for and the kind pulled in before the sizes they open, the rest after, contact last; one size question once both are answered", () => {
  const fields = formFields(clothing, 'seller')
  expect(fields.map(([n]) => n)).toEqual(['photos', 'description', 'price', 'wearer', 'kind', 'size', 'waist', 'babySize', 'kidsSize', 'footLength', 'brand', 'condition', 'location', 'delivery', 'contact'])
  const none = ['photos', 'description', 'price', 'wearer', 'kind', 'brand', 'condition', 'location', 'delivery', 'contact']
  expect(shown(fields, {}), 'no size question before who and the kind').toEqual(none)
  expect(shown(fields, { wearer: ['women'] }), 'who alone: still none').toEqual(none)
  expect(shown(fields, { wearer: ['women'], kind: 'coat' }).slice(3, 7), 'one, right after them').toEqual(['wearer', 'kind', 'size', 'brand'])
  expect(shown(fields, { wearer: ['men'], kind: 'jeans' }).slice(5, 6)).toEqual(['waist'])
  expect(shown(fields, { wearer: ['girls'], kind: 'coat' }).slice(5, 6)).toEqual(['kidsSize'])
  expect(shown(fields, { wearer: ['baby'], kind: 'coat' }).slice(5, 6)).toEqual(['babySize'])
  expect(shown(fields, { kind: 'boots' }).slice(4, 6), "a shoe's size needs only the kind").toEqual(['kind', 'footLength'])
  expect(formFields(clothing, 'buyer').map(([n]) => n), "a buyer's request holds no photos").not.toContain('photos')
})

test('an answer changed drops each field that no longer applies, through a chain; the checker agrees it would not fit', () => {
  const fields = formFields(clothing, 'seller')
  const coat = { wearer: ['women'], kind: 'coat', size: 'xl' }
  expect(settled(fields, { ...coat, kind: 'boots' })).toEqual({ wearer: ['women'], kind: 'boots' })
  expect(settled(fields, { ...coat, wearer: ['girls'] })).toEqual({ wearer: ['girls'], kind: 'coat' })
  expect(settled(fields, coat), 'what still applies stays').toEqual(coat)
  expect(markets.checkEntry('clothing', 'seller', 'listing', { ...coat, kind: 'boots' })).toMatch(/^size is only for/)
})

test('tutoring: the place only when sessions are in person, right after how they are held; dropped when that goes', () => {
  const fields = formFields(tutoring, 'tutor')
  expect(fields.map(([n]) => n)).toEqual(['subjects', 'description', 'price', 'mode', 'place', 'levels', 'minutes', 'hours', 'contact'])
  expect(shown(fields, {})).not.toContain('place')
  expect(shown(fields, { mode: ['online'] })).not.toContain('place')
  expect(shown(fields, { mode: ['online', 'in-person'] }), 'a many answer: any of its values').toContain('place')
  const place = { lat: '40.420', lon: '-3.700', radiusKm: 5 }
  expect(settled(fields, { mode: ['online', 'in-person'], place })).toEqual({ mode: ['online', 'in-person'], place })
  expect(settled(fields, { mode: ['online'], place })).toEqual({ mode: ['online'] })
  expect(markets.checkEntry('tutoring', 'tutor', 'listing', { mode: ['online'], place })).toMatch(/^place is only for/)
})

test("contact on every listing, in every market and role, the form's last field, though no market lists it", () => {
  for (const p of pairs) {
    const market = markets.market(p.market)!
    expect(market.listing.contact, p.label).toBeUndefined()
    expect(formFields(market, p.role).at(-1)?.[0], p.label).toBe('contact')
  }
  expect(markets.checkEntry('electronics', 'seller', 'listing', { contact: '@ada' })).toBeNull()
})

test('a choice by its label where its field has one, else its value in words; a many choice holds several', () => {
  expect(choiceWords(clothing.listing.size!, 'xl')).toBe('XL')
  expect(choiceWords(clothing.listing.size!, 'm'), 'no label: in words').toBe('M')
  expect(choiceWords(clothing.listing.babySize!, '0-3m')).toBe('0-3 months')
  expect(choiceWords(markets.market('electronics')!.listing.kind!, 'tv')).toBe('TV')
  expect(choiceWords(clothing.listing.condition!, 'new-with-tags')).toBe('New with tags')
  expect(valueText(clothing.listing.size!, '4xl')).toBe('4XL')
  expect(valueText(clothing.listing.delivery!, ['pickup', 'shipping'])).toBe('Pickup, Shipping')
  expect(markets.checkEntry('clothing', 'seller', 'listing', { delivery: ['pickup', 'shipping'] })).toBeNull()
})

test("an old listing: what still fits its market today, kept, its photos' files among it; the rest dropped", () => {
  const sha = 'a'.repeat(64)
  const files = [{ sha256: sha, type: 'image/jpeg', size: 1000 }]
  const old = { description: 'A wool coat.', price: { amount: '40', currency: 'EUR' }, photos: [sha], files, kind: 'coat', wearer: 'women', size: 'EU 38', condition: 'new', delivery: 'either', location: { area: 'Lyon' }, contact: '@coats' }
  expect(fits('clothing', 'seller', old)).toBe(false)
  const kept = fitting('clothing', 'seller', old)
  expect(kept).toEqual({ description: 'A wool coat.', price: { amount: '40', currency: 'EUR' }, photos: [sha], files, kind: 'coat', contact: '@coats' })
  expect(fits('clothing', 'seller', kept)).toBe(true)
  expect(fitting('tutoring', 'tutor', { description: 'Maths.', subjects: ['maths', 'literature'], place: { online: true } }), 'a list with one value gone, dropped whole').toEqual({ description: 'Maths.' })
})
