// How the screens say answers, by their piece: a price as people say it, in the device's own number
// format, for a length of time as people say one (€15 an hour, €60 for 3 hours, €25 for 45 minutes),
// a request's as the most it would pay, every price of a list, and where a listing shows small its
// first and how many more; a number with its unit, one or many, and a range in the markets' words;
// a place by its caption, else its size; a date in the markets' words with its zone where it is not
// the device's; an answer in a shape its field no longer takes, as nothing, never an error; a
// listing's card; what came about a profile with no score yet; whether a day line goes before a
// message, and what it says, and whether a message's time goes under it.

import { expect, test } from 'vitest'

import { UNITS } from '@foundationforest/markets/browser'

import { type Field, choiceWords, markets, previewOf } from '../src/markets.ts'
import { amountText, answerLines, answerText, cardLines, dateText, lengthWords, perPlural, placeText, previewLines, priceParts, priceText, saidCount, zoneWords } from '../src/show.ts'
import { unitWords } from '../src/units.ts'
import { dayWords, lastOfRun, newDay } from '../src/ui.tsx'
import { fieldWith, sides } from './directory.ts'

test('an amount as people write it, in the number format of the device (here, a locale given)', () => {
  expect(amountText({ amount: '20', currency: 'USD' }, 'en-US')).toBe('$20')
  expect(amountText({ amount: '12.5', currency: 'USD' }, 'en-US'), 'cents when it has them').toBe('$12.50')
  expect(amountText({ amount: '30', currency: 'EUR' }, 'es-ES').replace(/\s/g, ' ')).toBe('30 €')
  expect(amountText({ amount: '1500', currency: 'MXN' }, 'es-MX')).toBe('$1,500')
  expect(amountText({ amount: '30', currency: 'coins' }, 'en-US'), 'a currency that is no code, as written').toBe('30 coins')
  expect(amountText({ amount: 'thirty', currency: 'USD' }, 'en-US'), 'an amount that is no number, as written').toBe('thirty USD')
})

test('a price for a length of time, as people say it: an hour, for 3 hours, for 45 minutes, a month, for 2 people; the whole deal alone; a request\'s, Up to', () => {
  const eur = (amount: string, more: object = {}) => ({ amount, currency: 'EUR', ...more })
  expect(priceText(eur('15', { per: 'hour' }), false, 'en-US')).toBe('€15 an hour')
  expect(priceText(eur('60', { per: 'hour', count: '3' }), false, 'en-US')).toBe('€60 for 3 hours')
  expect(priceText(eur('25', { per: 'hour', count: '0.75' }), false, 'en-US')).toBe('€25 for 45 minutes')
  expect(priceText(eur('40', { per: 'hour', count: '1.5' }), false, 'en-US')).toBe('€40 for 90 minutes')
  expect(priceText(eur('70', { per: 'hour', count: '2.5' }), false, 'en-US')).toBe('€70 for 2.5 hours')
  expect(priceText(eur('300', { per: 'month' }), false, 'en-US')).toBe('€300 a month')
  expect(priceText(eur('45', { per: 'person', count: '3' }), false, 'en-US')).toBe('€45 for 3 people')
  expect(priceText(eur('40'), false, 'en-US')).toBe('€40')
  expect(priceText(eur('60', { per: 'hour', count: '3' }), true, 'en-US'), 'a request: the most it would pay').toBe('Up to €60 for 3 hours')
  expect(priceParts(eur('15', { per: 'hour', note: 'at least 2 hours' }), 'en-US'), 'its note apart').toEqual({ amount: '€15', per: 'an hour' })
  expect(['week', 'class', 'box', 'person', 'hour', 'church'].map(perPlural)).toEqual(['weeks', 'classes', 'boxes', 'people', 'hours', 'churches'])
  expect(['1', '2', '0.5', '0.75', '1.5', '2.5'].map(lengthWords)).toEqual(['1 hour', '2 hours', '30 minutes', '45 minutes', '90 minutes', '2.5 hours'])
  const field = fieldWith(markets, 'a price per hour', (f) => f.piece === 'price' && (f.per ?? []).includes('hour')).field
  const two = [eur('15', { per: 'hour' }), eur('25', { per: 'hour', count: '0.75' })]
  expect(answerLines(field, two), 'a listing shows every price').toEqual(two.map((p) => priceText(p)))
  expect(answerLines(field, [eur('20'), 'twenty', null, { amount: 5 }]), 'only what is a price').toEqual([priceText(eur('20'))])
})

test("a number with its unit, and a range in the markets' words: 9 to 11 years, 18 years or more, up to 11 years", () => {
  const { field } = fieldWith(markets, 'a number in years', (f) => f.piece === 'number' && f.unit === 'years')
  const one = { ...field, several: undefined }
  expect(answerText(one, '1')).toBe('1 year')
  expect(answerText(one, { from: '9', to: '11' })).toBe('9 to 11 years')
  expect(answerText(one, { from: '18' })).toBe('18 years or more')
  expect(answerText(one, { to: '11' })).toBe('Up to 11 years')
  for (const odd of [{}, { from: 9 }, [], 3, true]) expect(answerText(one, odd), JSON.stringify(odd)).toBe('')
})

test('an answer in a shape its field no longer takes reads as nothing, or as much of it as fits: no screen breaks on a listing a market outgrew', () => {
  const odd = [{ amount: 3 }, { a: 1 }, ['x', { y: 2 }], 7, true, 'text', { from: 'x' }, { slots: [{ days: 'monday' }] }, { lat: 1, lon: 2 }, { every: 'monday' }]
  for (const piece of ['text', 'number', 'choice', 'place', 'price', 'date', 'photo', 'link'] as const) {
    for (const several of [false, true]) {
      const field = { piece, ...(several && { several: true }), ...(piece === 'choice' && { values: ['a', 'b'] }), ...(piece === 'number' && { unit: 'hours' }) } as Field
      for (const value of odd) {
        const text = answerText(field, value)
        expect(typeof text, `${piece} ${JSON.stringify(value)}`).toBe('string')
        expect(text, `${piece} ${JSON.stringify(value)}`).not.toMatch(/\[object|undefined|NaN/)
      }
    }
  }
})

test('a place by the caption places gives it, never stored: Around it, an exact spot Near it; with none, by its size', () => {
  const area = { lat: '40.4342', lon: '-3.7031', radiusKm: 10 }
  const spot = { lat: '40.41672', lon: '-3.70358', radiusKm: 0 }
  expect(placeText(area, 'Chamberí, Madrid')).toBe('Around Chamberí, Madrid')
  expect(placeText(spot, 'Sol, Madrid')).toBe('Near Sol, Madrid')
  expect([placeText(area), placeText(spot)]).toEqual(['Within 10 km', 'An exact spot'])
  const { field } = fieldWith(markets, 'places', (f) => f.piece === 'place' && f.several === true)
  const caption = (p: { lat: string }) => (p.lat === area.lat ? 'Chamberí, Madrid' : undefined)
  expect(answerLines(field, [area, spot, { area: 'Lyon' }], { caption })).toEqual(['Around Chamberí, Madrid', 'An exact spot'])
})

test("a date in the markets' words, its zone named where it is not the device's own", () => {
  const { field } = fieldWith(markets, 'a date of several', (f) => f.piece === 'date' && f.several === true)
  const weekly = { every: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const, start: '09:00', end: '13:00', zone: 'Europe/Madrid' }
  expect(dateText(field, { ...weekly, every: [...weekly.every] }, 'Europe/Madrid')).toBe('Monday to Friday, 9:00 to 13:00')
  expect(dateText(field, { ...weekly, every: [...weekly.every] }, 'America/Monterrey')).toBe('Monday to Friday, 9:00 to 13:00, Madrid time')
  expect(zoneWords('America/Argentina/Buenos_Aires')).toBe('Buenos Aires time')
  expect(dateText(field, { from: '2027-06-01', to: '2027-08-31' }, 'Europe/Madrid'), 'no hours, no zone').toMatch(/^1 June( 2027)? to 31 August( 2027)?$/)
})

/** A role whose preview, past its description and price, opens with fields that wait on nothing and are not photos, of these pieces: its market, role, and those fields' names. */
function previewing(pieces: Field['piece'][]) {
  for (const side of sides(markets)) {
    const { market, role } = side
    const first = previewOf(market).filter((n) => n !== 'description' && n !== 'price' && market.listing[n] && market.listing[n]!.piece !== 'photo' && (!market.listing[n]!.roles || market.listing[n]!.roles!.includes(role)))
    const names = first.slice(0, pieces.length)
    const plain = names.every((n, i) => market.listing[n]!.piece === pieces[i] && !market.listing[n]!.when && Array.isArray(market.listing[n]!.values))
    if (names.length === pieces.length && plain && market.listing.description && market.listing.price?.piece === 'price') return { ...side, names }
  }
  throw new Error(`No market in the directory previews ${pieces.join(', then ')} first`)
}

test("a listing's card in every market: its description's first line, else its preview's first; the next of its preview it holds; its price in two parts, a request's Up to", () => {
  const { market, names } = previewing(['choice', 'choice'])
  const [a, b] = names as [string, string]
  const value = (n: string) => (market.listing[n]!.values as string[])[0]!
  const held = (n: string) => (market.listing[n]!.several ? [value(n)] : value(n))
  const price = { amount: '30', currency: 'USD', per: 'hour' }
  const lesson = { description: 'One hour online.\nBring a notebook.', [a]: held(a), price: [price], [b]: held(b) }
  expect(cardLines(market, lesson), `the description first, then the preview: ${a}`).toEqual({ title: 'One hour online.', line: choiceWords(market.listing[a]!, value(a)), price: { ...priceParts(price), more: 0 } })
  const pack = { amount: '130', currency: 'USD', per: 'hour', count: '5' }
  expect(cardLines(market, { ...lesson, price: [price, pack] }).price, 'its first price, then +1 more').toEqual({ ...priceParts(price), more: 1 })
  expect(cardLines(market, lesson, { request: true }).price, 'a request').toEqual({ amount: `Up to ${priceParts(price).amount}`, per: priceParts(price).per, more: 0 })
  expect(cardLines(market, { [a]: held(a), [b]: held(b) }), 'no description, no price: the preview as it runs').toEqual({ title: choiceWords(market.listing[a]!, value(a)), line: choiceWords(market.listing[b]!, value(b)), price: null })
  const priced = { ...market, preview: ['price'] }
  expect(previewLines(priced, { ...lesson, price: [price, pack] }), 'small: the first and +1 more').toEqual([`${priceText(price)}, +1 more`])
})

test('a number with its unit, one when it is 1, else many; a unit the app has no words for, as its own name', () => {
  expect([unitWords('nights', '1'), unitWords('nights', '3'), unitWords('nights', '1.5'), unitWords('nights')]).toEqual(['night', 'nights', 'nights', 'nights'])
  expect([unitWords('square-metres', '1'), unitWords('square-metres', '30')]).toEqual(['square metre', 'square metres'])
  expect([unitWords('cubic-metres', '1'), unitWords('cubic-metres', '3')]).toEqual(['cubic metres', 'cubic metres'])
  for (const unit of UNITS) expect(unitWords(unit, '2'), unit).toMatch(/^[a-z]+( [a-z]+)*$/)
})

test("a day line before a thread's first message, and wherever the day changes on the device's calendar", () => {
  const evening = new Date(2026, 10, 3, 23, 50).getTime()
  expect(newDay(undefined, evening), 'the first').toBe(true)
  expect(newDay(new Date(2026, 10, 3, 8, 0).getTime(), evening), 'the same day').toBe(false)
  expect(newDay(evening, new Date(2026, 10, 4, 0, 5).getTime()), 'past midnight').toBe(true)
  expect(newDay(new Date(2025, 10, 4, 12).getTime(), new Date(2026, 10, 4, 12).getTime()), 'a year on').toBe(true)
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
