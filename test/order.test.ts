// The orders things are listed in (src/order.ts): the person's own profiles in the order they were
// made, those whose time isn't known yet after, offers first and by their words; everything else
// what is new or needs the person first, newest first, then the rest, newest first; and a list shown
// keeping its order while it is on screen, anything new on top.

import { expect, test } from 'vitest'

import { markets, pairOf } from '../src/markets.ts'
import { inMadeOrder, newFirst, steady } from '../src/order.ts'
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
const made = (times: Record<string, number>) => Object.fromEntries(Object.entries(times).map(([a, t]) => [of(a)[0]!, t]))

test('no time known: offers first, then by their words', () => {
  expect(labels(inMadeOrder(list, {}))).toEqual([...byWords(of('C', 'T', 'E')), ...byWords(of('S', 'B'))])
})

test('the order they were made in; those whose time is not known after, in their order', () => {
  expect(labels(inMadeOrder(list, made({ S: 30, B: 10, T: 20 })))).toEqual([...of('B', 'T', 'S'), ...byWords(of('C', 'E'))])
})

test('what is new or needs the person first, newest first; then the rest, newest first', () => {
  const items = [
    { k: 'a', t: 1, f: false },
    { k: 'b', t: 5, f: true },
    { k: 'c', t: 9, f: false },
    { k: 'd', t: 2, f: true },
  ]
  expect(newFirst(items, (i) => i.f, (i) => i.t).map((i) => i.k)).toEqual(['b', 'd', 'c', 'a'])
})

test('a list on screen keeps its order: what goes is gone, what comes is on top, in its own order', () => {
  expect(steady(null, ['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
  expect(steady(['a', 'b', 'c'], ['c', 'b', 'a']), 'the same things, no new order').toEqual(['a', 'b', 'c'])
  expect(steady(['a', 'b', 'c'], ['e', 'c', 'd', 'a']), 'b gone; e and d new, on top').toEqual(['e', 'd', 'a', 'c'])
})
