// The order profiles are listed in, on Home and in the sidebar: something new first, then the most
// recently used, then, among those never used here, offers first and by their words.

import { expect, test } from 'vitest'

import { markets, pairOf } from '../src/markets.ts'
import { ordered } from '../src/order.ts'
import { sides, twoSides } from './directory.ts'

// Two markets with both sides, and a third that offers: five profiles, three offering, two requesting.
const one = twoSides(markets)
const two = twoSides(markets, (m) => m.name !== one.market.name)
const three = sides(markets).find((s) => s.offers && s.market.name !== one.market.name && s.market.name !== two.market.name)!
const list = [
  { label: one.request.label, address: 'S' },
  { label: two.offer.label, address: 'C' },
  { label: one.offer.label, address: 'T' },
  { label: two.request.label, address: 'B' },
  { label: three.label, address: 'E' },
]
const labels = (l: Array<{ label: string }>) => l.map((p) => p.label)
const of = (...addresses: string[]) => addresses.map((a) => list.find((p) => p.address === a)!.label)
/** Labels by their words, as the app says them: Goods seller before Tutoring tutor. */
const byWords = (l: string[]) => [...l].sort((a, b) => pairOf(a).words.localeCompare(pairOf(b).words))

test('never used, nothing new: offers first, then by their words', () => {
  expect(labels(ordered(list, () => false, {}))).toEqual([...byWords(of('C', 'T', 'E')), ...byWords(of('S', 'B'))])
})

test('the most recently used first; those never used after, in their order', () => {
  expect(labels(ordered(list, () => false, { S: 30, B: 10, T: 20 }))).toEqual([...of('S', 'T', 'B'), ...byWords(of('C', 'E'))])
})

test('something new before all, the most recently used first among them too', () => {
  const fresh = (a: string) => a === 'E' || a === 'B'
  expect(labels(ordered(list, fresh, { S: 30, B: 10 }))).toEqual([...of('B', 'E', 'S'), ...byWords(of('C', 'T'))])
})
