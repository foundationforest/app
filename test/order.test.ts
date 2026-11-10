// The order profiles are listed in, on Home and in the sidebar: something new first, then the most
// recently used, then, among those never used here, offers first and by their words.

import { expect, test } from 'vitest'

import { ordered } from '../src/order.ts'

const list = [
  { label: 'tutoring/student', address: 'S' },
  { label: 'clothing/seller', address: 'C' },
  { label: 'tutoring/tutor', address: 'T' },
  { label: 'clothing/buyer', address: 'B' },
  { label: 'electronics/seller', address: 'E' },
]
const labels = (l: Array<{ label: string }>) => l.map((p) => p.label)

test('never used, nothing new: offers first, then by their words', () => {
  expect(labels(ordered(list, () => false, {}))).toEqual(['clothing/seller', 'electronics/seller', 'tutoring/tutor', 'clothing/buyer', 'tutoring/student'])
})

test('the most recently used first; those never used after, in their order', () => {
  expect(labels(ordered(list, () => false, { S: 30, B: 10, T: 20 }))).toEqual(['tutoring/student', 'tutoring/tutor', 'clothing/buyer', 'clothing/seller', 'electronics/seller'])
})

test('something new before all, the most recently used first among them too', () => {
  const fresh = (a: string) => a === 'E' || a === 'B'
  expect(labels(ordered(list, fresh, { S: 30, B: 10 }))).toEqual(['clothing/buyer', 'electronics/seller', 'tutoring/student', 'clothing/seller', 'tutoring/tutor'])
})
