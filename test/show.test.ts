// How the screens say things that are not words: a price as people write it, in the device's own
// number format; the time of day a message was sent, and whether a day line goes before it.

import { expect, test } from 'vitest'

import { markets } from '../src/markets.ts'
import { priceText, rowLines, valueText } from '../src/show.ts'
import { newDay } from '../src/ui.tsx'

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

test("a post's row in every market: with a price, its preview's first other line, then the price; with none, its preview's first two", () => {
  const tutoring = markets.market('tutoring')!
  const lesson = { description: 'Maths, one hour online.', subjects: ['maths'], price: { amount: '30', currency: 'USD', per: 'hour' }, place: { online: true } }
  expect(rowLines(tutoring, lesson), 'tutoring puts subjects first, and the price after the description: here second').toEqual(['Maths', priceText(lesson.price)])
  const { price: _, ...free } = lesson
  expect(rowLines(tutoring, free), 'no price: as the preview runs').toEqual(['Maths', 'Maths, one hour online.'])
  const clothing = markets.market('clothing')!
  const coat = { amount: '40', currency: 'USD' }
  expect(rowLines(clothing, { description: 'A wool coat.', price: coat, location: { area: 'Lyon' } })).toEqual(['A wool coat.', priceText(coat)])
  expect(rowLines(clothing, { price: coat }), 'the price alone').toEqual([priceText(coat)])
})

test("a day line before a thread's first message, and wherever the day changes on the device's calendar", () => {
  const evening = new Date(2026, 10, 3, 23, 50).getTime()
  expect(newDay(undefined, evening), 'the first').toBe(true)
  expect(newDay(new Date(2026, 10, 3, 8, 0).getTime(), evening), 'the same day').toBe(false)
  expect(newDay(evening, new Date(2026, 10, 4, 0, 5).getTime()), 'past midnight').toBe(true)
  expect(newDay(new Date(2025, 10, 4, 12).getTime(), new Date(2026, 10, 4, 12).getTime()), 'a year on').toBe(true)
})
