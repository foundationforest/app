// How the screens say things that are not words: a price as people write it, in the device's own
// number format, whole or in its two parts; a listing's card; a place as its area and how far round
// it reaches, and in a form's row; hours in a form's row; whether a day line goes before a message,
// and what it says, and whether a message's time goes under it.

import { expect, test } from 'vitest'

import { markets } from '../src/markets.ts'
import { cardLines, daysText, hoursLines, placeLines, priceParts, priceText, valueText } from '../src/show.ts'
import { dayWords, lastOfRun, newDay } from '../src/ui.tsx'

test('a price as people write it, in the number format of the device (here, a locale given)', () => {
  expect(priceText({ amount: '20', currency: 'USD' }, 'en-US')).toBe('$20')
  expect(priceText({ amount: '12.5', currency: 'USD' }, 'en-US'), 'cents when it has them').toBe('$12.50')
  expect(priceText({ amount: '30', currency: 'EUR', per: 'hour' }, 'en-US')).toBe('€30 per hour')
  expect(priceText({ amount: '30', currency: 'EUR', per: 'hour' }, 'es-ES').replace(/\s/g, ' ')).toBe('30 € per hour')
  expect(priceText({ amount: '1500', currency: 'MXN' }, 'es-MX')).toBe('$1,500')
  expect(priceText({ amount: '30', currency: 'coins' }, 'en-US'), 'a currency that is no code, as written').toBe('30 coins')
  expect(priceText({ amount: 'thirty', currency: 'USD' }, 'en-US'), 'an amount that is no number, as written').toBe('thirty USD')
})

test("every price on screen reads so: a money field's value", () => {
  const field = { type: 'money', description: 'The price.' } as Parameters<typeof valueText>[0]
  expect(valueText(field, { amount: '20', currency: 'USD' })).toBe(priceText({ amount: '20', currency: 'USD' }))
  expect(valueText(field, { amount: '30', currency: 'EUR', per: 'hour' })).toMatch(/30.*per hour$/)
})

test("a listing's card in every market: its description's first line, else its preview's first; the next of its preview it holds; its price in two parts", () => {
  const tutoring = markets.market('tutoring')!
  const lesson = { description: 'Maths, one hour online.\nBring a notebook.', subjects: ['maths'], price: { amount: '30', currency: 'USD', per: 'hour' }, mode: ['online'] }
  expect(cardLines(tutoring, lesson), 'the description first, then the preview: subjects').toEqual({ title: 'Maths, one hour online.', line: 'Maths', price: priceParts(lesson.price) })
  const { description: _, price: __, ...bare } = lesson
  expect(cardLines(tutoring, bare), 'no description, no price: the preview as it runs').toEqual({ title: 'Maths', line: 'Online', price: null })
  const clothing = markets.market('clothing')!
  const coat = { amount: '40', currency: 'USD' }
  expect(cardLines(clothing, { description: 'A wool coat.', photos: ['ab'], price: coat, location: { lat: '45.764', lon: '4.836', radiusKm: 2, area: 'Lyon' } }), 'photos and the price never a line').toEqual({ title: 'A wool coat.', line: 'Lyon, within 2 km', price: priceParts(coat) })
  expect(priceParts({ amount: '30', currency: 'USD', per: 'hour' }, 'en-US')).toEqual({ amount: '$30', per: 'per hour' })
  expect(priceParts(coat, 'en-US'), 'the whole deal').toEqual({ amount: '$40', per: '' })
})

test('a place: its area, then how far round it reaches; radius 0, that exact spot; an older place, its area', () => {
  const field = markets.market('clothing')!.listing.location!
  expect(valueText(field, { lat: '45.764', lon: '4.836', radiusKm: 2, area: 'Lyon' })).toBe('Lyon, within 2 km')
  expect(valueText(field, { lat: '45.764', lon: '4.836', radiusKm: 2 })).toBe('Within 2 km')
  expect(valueText(field, { lat: '45.76412', lon: '4.83601', radiusKm: 0, area: 'Court 3' })).toBe('Court 3')
  expect(valueText(field, { lat: '45.76412', lon: '4.83601', radiusKm: 0 })).toBe('An exact spot')
  expect([valueText(field, { area: 'Lyon' }), valueText(field, { online: true })]).toEqual(['Lyon', ''])
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
