// How the screens say things that are not words: a price as people write it, in the device's own
// number format, whole or in its two parts, with its count as the index says it, every price of a
// list, and where a listing shows small its first and how many more; a number with its unit, one or
// many, and a range in the index's words, open at either end; a value in a shape its field no longer
// takes, as nothing, never an error; a listing's card; a
// place as its area and how far round it reaches, several in turn, and in a form's row; hours in a
// form's row; what came about a profile with no score yet;
// whether a day line goes before a message, and what it says, and whether a message's time goes under
// it.

import { expect, test } from 'vitest'

import { UNITS } from '@foundationforest/markets/browser'

import { type Field, markets, previewOf } from '../src/markets.ts'
import { cardLines, choiceWords, daysText, hoursLines, numberText, perPlural, placeLines, previewLines, priceParts, priceText, pricesOf, saidCount, valueText } from '../src/show.ts'
import { unitWords } from '../src/units.ts'
import { dayWords, lastOfRun, newDay } from '../src/ui.tsx'
import { fieldWith, sides } from './directory.ts'

test('a price as people write it, in the number format of the device (here, a locale given)', () => {
  expect(priceText({ amount: '20', currency: 'USD' }, 'en-US')).toBe('$20')
  expect(priceText({ amount: '12.5', currency: 'USD' }, 'en-US'), 'cents when it has them').toBe('$12.50')
  expect(priceText({ amount: '30', currency: 'EUR', per: 'hour' }, 'en-US')).toBe('€30 per hour')
  expect(priceText({ amount: '30', currency: 'EUR', per: 'hour' }, 'es-ES').replace(/\s/g, ' ')).toBe('30 € per hour')
  expect(priceText({ amount: '1500', currency: 'MXN' }, 'es-MX')).toBe('$1,500')
  expect(priceText({ amount: '30', currency: 'coins' }, 'en-US'), 'a currency that is no code, as written').toBe('30 coins')
  expect(priceText({ amount: 'thirty', currency: 'USD' }, 'en-US'), 'an amount that is no number, as written').toBe('thirty USD')
})

test("every price on screen reads so: a money field's value, every price of its list, each with its count as the index says it", () => {
  const field = { type: 'money', description: 'The price.' } as Parameters<typeof valueText>[0]
  expect(valueText(field, [{ amount: '20', currency: 'USD' }])).toBe(priceText({ amount: '20', currency: 'USD' }))
  expect(valueText(field, [{ amount: '30', currency: 'EUR', per: 'hour' }])).toMatch(/30.*per hour$/)
  expect(priceText({ amount: '1300', currency: 'MXN', per: 'lesson', count: 5 }, 'en-US')).toBe('MX$1,300 for 5 lessons')
  expect(priceText({ amount: '30', currency: 'USD', per: 'lesson', count: 1 }, 'en-US'), 'a count of one is per one').toBe('$30 per lesson')
  expect(priceParts({ amount: '45', currency: 'USD', per: 'person', count: 3 }, 'en-US')).toEqual({ amount: '$45', per: 'for 3 people' })
  expect(['lesson', 'class', 'box', 'person', 'hour', 'church'].map(perPlural)).toEqual(['lessons', 'classes', 'boxes', 'people', 'hours', 'churches'])
  const two = [{ amount: '30', currency: 'USD', per: 'hour' }, { amount: '1300', currency: 'MXN', per: 'lesson', count: 5 }]
  expect(valueText(field, two), 'a listing shows every price').toBe(two.map((m) => priceText(m)).join(', '))
  // One held as a single money, as before the markets made it a list: shown as a list of one.
  expect(pricesOf({ amount: '20', currency: 'USD' })).toEqual([{ amount: '20', currency: 'USD' }])
  expect(pricesOf([{ amount: '20' }, 'twenty', null, { amount: '5', currency: 'USD' }]), 'only what is money').toEqual([{ amount: '5', currency: 'USD' }])
})

test("a number with its unit, and a range in the index's words: 9 to 11 years, 18 years and over, 11 years and under", () => {
  const years = { unit: 'years' }
  expect(numberText(years, '1')).toBe('1 year')
  expect(numberText(years, { from: '9', to: '11' })).toBe('9 to 11 years')
  expect(numberText(years, { from: '18' })).toBe('18 years and over')
  expect(numberText(years, { to: '11' })).toBe('11 years and under')
  expect(numberText(years, { from: '1', to: '1' })).toBe('1 to 1 year')
  expect(numberText({}, { from: '2', to: '4' }), 'with no unit').toBe('2 to 4')
  for (const odd of [{}, { from: 9 }, [], 3, true]) expect(numberText(years, odd), JSON.stringify(odd)).toBe('')
})

test('a value in a shape its field no longer takes reads as nothing, or as much of it as fits: no screen breaks on a listing a market outgrew', () => {
  const odd = [{ amount: 3 }, { a: 1 }, ['x', { y: 2 }], 7, true, 'text', { from: 'x' }, { slots: [{ days: 'monday' }] }]
  for (const type of ['text', 'number', 'words', 'choice', 'place', 'money', 'moment', 'file', 'hours'] as const) {
    const field = { type, description: '.', unit: type === 'number' ? 'nights' : undefined } as unknown as Field
    for (const value of odd) {
      const text = valueText(field, value)
      expect(typeof text, `${type} ${JSON.stringify(value)}`).toBe('string')
      expect(text, `${type} ${JSON.stringify(value)}`).not.toMatch(/\[object|undefined|NaN/)
    }
  }
})

/** A role whose preview, past its description and price, opens with fields that wait on nothing and are not photos, of these types: its market, role, and those fields' names. */
function previewing(types: Field['type'][]) {
  for (const side of sides(markets)) {
    const { market, role } = side
    const first = previewOf(market).filter((n) => n !== 'description' && n !== 'price' && market.listing[n] && market.listing[n]!.type !== 'file' && (!market.listing[n]!.roles || market.listing[n]!.roles!.includes(role)))
    const names = first.slice(0, types.length)
    const plain = names.every((n, i) => market.listing[n]!.type === types[i] && !market.listing[n]!.when)
    if (names.length === types.length && plain && market.listing.description && market.listing.price?.type === 'money') return { ...side, names }
  }
  throw new Error(`No market in the directory previews ${types.join(', then ')} first`)
}

test("a listing's card in every market: its description's first line, else its preview's first; the next of its preview it holds; its price in two parts", () => {
  const { market, names } = previewing(['choice', 'choice'])
  const [a, b] = names as [string, string]
  const value = (n: string) => market.listing[n]!.values![0]!
  const held = (n: string) => (market.listing[n]!.many ? [value(n)] : value(n))
  const price = { amount: '30', currency: 'USD', per: 'hour' }
  const lesson = { description: 'One hour online.\nBring a notebook.', [a]: held(a), price: [price], [b]: held(b) }
  expect(cardLines(market, lesson), `the description first, then the preview: ${a}`).toEqual({ title: 'One hour online.', line: choiceWords(market.listing[a]!, value(a)), price: { ...priceParts(price), more: 0 } })
  // Shown small, the first price and how many more.
  const pack = { amount: '130', currency: 'USD', per: 'hour', count: 5 }
  expect(cardLines(market, { ...lesson, price: [price, pack] }).price, 'its first price, then +1 more').toEqual({ ...priceParts(price), more: 1 })
  expect(cardLines(market, { [a]: held(a), [b]: held(b) }), 'no description, no price: the preview as it runs').toEqual({ title: choiceWords(market.listing[a]!, value(a)), line: choiceWords(market.listing[b]!, value(b)), price: null })
  // A place its preview names, anywhere in it: the only one of its fields the listing holds, so its line.
  const shop = fieldWith(markets, 'a place its preview names', (f, n, side) => f.type === 'place' && !f.many && !f.when && previewOf(side.market).includes(n) && side.market.listing.price?.type === 'money')
  const photos = Object.entries(shop.market.listing).find(([, f]) => f.type === 'file')?.[0]
  const coat = { amount: '40', currency: 'USD' }
  const body = { description: 'A wool coat.', ...(photos && { [photos]: ['ab'] }), price: [coat], [shop.name]: { lat: '45.764', lon: '4.836', radiusKm: 2, area: 'Lyon' } }
  expect(cardLines(shop.market, body), 'photos and the price never a line').toEqual({ title: 'A wool coat.', line: 'Lyon, within 2 km', price: { ...priceParts(coat), more: 0 } })
  const priced = { ...shop.market, preview: ['price'] }
  expect(previewLines(priced, { ...body, price: [coat, { amount: '60', currency: 'USD' }] }), 'small: the first and +1 more').toEqual([`${priceText(coat)}, +1 more`])
  expect(previewLines(priced, body), 'one price alone').toEqual([priceText(coat)])
  expect(priceParts({ amount: '30', currency: 'USD', per: 'hour' }, 'en-US')).toEqual({ amount: '$30', per: 'per hour' })
  expect(priceParts(coat, 'en-US'), 'the whole deal').toEqual({ amount: '$40', per: '' })
})

test('a place: its area, then how far round it reaches; radius 0, that exact spot; an older place, its area', () => {
  const { field } = fieldWith(markets, 'a place', (f) => f.type === 'place' && !f.many)
  expect(valueText(field, { lat: '45.764', lon: '4.836', radiusKm: 2, area: 'Lyon' })).toBe('Lyon, within 2 km')
  expect(valueText(field, { lat: '45.764', lon: '4.836', radiusKm: 2 })).toBe('Within 2 km')
  expect(valueText(field, { lat: '45.76412', lon: '4.83601', radiusKm: 0, area: 'Court 3' })).toBe('Court 3')
  expect(valueText(field, { lat: '45.76412', lon: '4.83601', radiusKm: 0 })).toBe('An exact spot')
  expect([valueText(field, { area: 'Lyon' }), valueText(field, { online: true })]).toEqual(['Lyon', ''])
})

test('several places in one field: each in turn, as one place reads; what is no place, left out', () => {
  const { field } = fieldWith(markets, 'a list of places', (f) => f.type === 'place' && f.many === true)
  const lisbon = { lat: '38.722', lon: '-9.139', radiusKm: 10, area: 'Lisbon' }
  const porto = { lat: '41.150', lon: '-8.611', radiusKm: 10, area: 'Porto' }
  expect(valueText(field, [lisbon, porto])).toBe('Lisbon, within 10 km; Porto, within 10 km')
  expect(valueText(field, [lisbon, 'Porto', { lat: '41.150', lon: '-8.611', radiusKm: 0 }])).toBe('Lisbon, within 10 km; An exact spot')
  expect(valueText(field, [])).toBe('')
})

test("a number with its unit, one when it is 1, else many; a unit the app has no words for, as its own name", () => {
  expect([unitWords('nights', '1'), unitWords('nights', '3'), unitWords('nights', '1.5'), unitWords('nights')]).toEqual(['night', 'nights', 'nights', 'nights'])
  expect([unitWords('people', '1'), unitWords('people', '4')]).toEqual(['person', 'people'])
  expect([unitWords('square-metres', '1'), unitWords('square-metres', '30')]).toEqual(['square metre', 'square metres'])
  expect([unitWords('minutes', '1'), unitWords('minutes', '60')]).toEqual(['minute', 'minutes'])
  // One the markets add later: its name, hyphens as spaces, one or many; it never stops the app.
  expect([unitWords('cubic-metres', '1'), unitWords('cubic-metres', '3')]).toEqual(['cubic metres', 'cubic metres'])
  for (const unit of UNITS) expect(unitWords(unit, '2'), unit).toMatch(/^[a-z]+( [a-z]+)*$/)
  const { field } = fieldWith(markets, 'a number with a unit', (f) => f.type === 'number' && f.unit !== undefined)
  expect(valueText(field, '3')).toBe(`3 ${unitWords(field.unit!, '3')}`)
  expect(valueText(field, '1')).toBe(`1 ${unitWords(field.unit!, '1')}`)
  expect(valueText({ type: 'number', description: 'An older number, with no unit.' }, '7')).toBe('7')
})

test("a day line before a thread's first message, and wherever the day changes on the device's calendar", () => {
  const evening = new Date(2026, 10, 3, 23, 50).getTime()
  expect(newDay(undefined, evening), 'the first').toBe(true)
  expect(newDay(new Date(2026, 10, 3, 8, 0).getTime(), evening), 'the same day').toBe(false)
  expect(newDay(evening, new Date(2026, 10, 4, 0, 5).getTime()), 'past midnight').toBe(true)
  expect(newDay(new Date(2025, 10, 4, 12).getTime(), new Date(2026, 10, 4, 12).getTime()), 'a year on').toBe(true)
})

test("a place's row in a form: its name, then how far round it reaches; with no name, what it is", () => {
  expect(placeLines({ radiusKm: 5, area: 'Chamberí' })).toEqual({ main: 'Chamberí', more: 'Within 5 km' })
  expect(placeLines({ radiusKm: 5 })).toEqual({ main: 'Within 5 km', more: '' })
  expect(placeLines({ radiusKm: 0, area: 'Court 3' })).toEqual({ main: 'Court 3', more: 'Exact spot' })
  expect(placeLines({ radiusKm: 0 })).toEqual({ main: 'An exact spot', more: '' })
})

test("hours' row in a form: the first slot's days, a run from one to another; its times, and how many more", () => {
  expect(daysText(['thursday', 'monday', 'tuesday', 'wednesday'])).toBe('Monday to Thursday')
  expect(daysText(['monday', 'wednesday'])).toBe('Monday, Wednesday')
  expect(daysText(['saturday', 'sunday']), 'two are each').toBe('Saturday, Sunday')
  const one = { days: ['monday', 'tuesday', 'wednesday', 'thursday'], from: '16:00', to: '20:00' }
  expect(hoursLines({ zone: 'Europe/Madrid', slots: [one] })).toEqual({ main: 'Monday to Thursday', more: '16:00 to 20:00' })
  expect(hoursLines({ zone: 'Europe/Madrid', slots: [one, { days: ['saturday'], from: '10:00', to: '12:00' }] })?.more).toBe('16:00 to 20:00, and 1 more')
  expect(hoursLines(undefined)).toBe(null)
})

test("a thread's day line says Today, else the day; a message's time shows under the last of its run", () => {
  const now = new Date(2026, 10, 3, 20, 0).getTime()
  expect(dayWords(new Date(2026, 10, 3, 9, 0).getTime(), now)).toBe('Today')
  expect(dayWords(new Date(2026, 10, 2, 9, 0).getTime(), now)).not.toBe('Today')
  const at = (h: number, d = 3) => new Date(2026, 10, d, h).getTime()
  const thread = [
    { mine: false, time: at(9) },
    { mine: false, time: at(10) },
    { mine: true, time: at(11) },
    { mine: true, time: at(12) },
    { mine: true, time: at(9, 4) },
  ]
  expect(thread.map((_, i) => lastOfRun(thread, i)), 'the side changes, the day changes, the last').toEqual([false, true, false, true, true])
})

test('what came about a profile with no score yet, by kind: how many of each, one or more', () => {
  expect(saidCount([{ kind: 'vouch' }])).toBe('1 vouch')
  expect(saidCount([{ kind: 'vouch' }, { kind: 'report' }, { kind: 'vouch' }])).toBe('2 vouches, 1 report')
  expect(saidCount([{ kind: 'report' }, { kind: 'report' }])).toBe('2 reports')
  expect(saidCount([])).toBe('')
})
