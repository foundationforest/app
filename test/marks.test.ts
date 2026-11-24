// What a place's corner shows (src/counts.ts), and how an ID reads in Your checks
// (src/documents.ts): a count of things with something new, never of messages, capped at 9+; the
// new dot while new messages are not opened yet, since an inbox entry hides who wrote it; the
// yellow ! in the count's place while something there needs updating; and a profile's name for
// someone, its short key, a name cut that was saved longer.

import { expect, test } from 'vitest'

import { allMessagesMark, countText, markWords, messagesMark, newText, offerMark, profileMark } from '../src/counts.ts'
import { countryOf, documentWords, idLine, idName } from '../src/documents.ts'
import { NAME_MOST, nameShown } from '../src/flows/names.ts'
import { idShownOf } from '../src/flows/verify.ts'
import { short } from '../src/ui.tsx'

test('a count up to 9, then 9+; beside a rating, 1 new up to 9+ new; in words for screen readers', () => {
  expect([1, 9, 10, 42].map(countText)).toEqual(['1', '9', '9+', '9+'])
  expect([newText(1), newText(12)]).toEqual(['1 new', '9+ new'])
  expect([markWords(3), markWords('dot'), markWords('warn')]).toEqual(['3 new', 'New', 'Needs updating'])
})

test("a profile's messages: the conversations with something new once opened; the dot while new ones are not", () => {
  expect(messagesMark(0, 2), 'opened: two conversations, however many messages').toBe(2)
  expect(messagesMark(3, 2), 'three new messages not opened: how many conversations is not known').toBe('dot')
  expect(messagesMark(0, 0)).toBe(0)
})

test("a profile's mark: the ! first, then the dot, then its conversations and its new reviews, vouches and reports", () => {
  expect(profileMark(2, 3, 0), 'two conversations and three reviews').toBe(5)
  expect(profileMark(0, 3, 0), 'reviews alone, known with nothing unlocked: counted').toBe(3)
  expect(profileMark('dot', 3, 0), 'new messages among them, not opened: the dot').toBe('dot')
  expect(profileMark('dot', 0, 1), 'something to update: the !').toBe('warn')
  expect(profileMark(0, 0, 0)).toBe(0)
})

test('the Messages tab: every profile\'s conversations with something new; the dot while any profile\'s are not opened', () => {
  expect(allMessagesMark([1, 0, 2])).toBe(3)
  expect(allMessagesMark([1, 'dot', 2])).toBe('dot')
  expect(allMessagesMark([])).toBe(0)
})

test('an offer: the ! when its market outgrew it; nothing before the messages are opened; then its conversations with something new', () => {
  expect(offerMark(true, false, 0)).toBe('warn')
  expect(offerMark(false, false, 4), 'not opened: nothing').toBe(0)
  expect(offerMark(false, true, 2)).toBe(2)
})

test("an ID in words: its kind, its country by name, the year it runs out; a stamp kept without its list, just ID", () => {
  expect(['Identity Card', 'ID', 'National ID Card', 'Passport', "Driver's License", 'RESIDENCE PERMIT'].map(documentWords)).toEqual(['ID card', 'ID card', 'ID card', 'Passport', "Driver's license", 'Residence permit'])
  expect(['MEX', 'esp', 'KGZ', 'GBR', 'XKX', 'ZZZ'].map(countryOf)).toEqual(['Mexico', 'Spain', 'Kyrgyzstan', 'United Kingdom', 'Kosovo', 'ZZZ'])
  expect(idName({ kind: 'Identity Card' })).toBe('ID card')
  expect(idLine({ kind: 'Identity Card', country: 'MEX', until: '2031-04-30' })).toBe('Mexico · until 2031')
  expect(idLine({ country: 'ESP' })).toBe('Spain')
  expect([idName({}), idLine({})]).toEqual(['ID', ''])
})

test("an ID stamp's three facts, from the list beside it; none for one kept without its list", () => {
  const list = [
    { name: 'model', value: 'm', salt: '1' },
    { name: 'document_type', value: 'Identity Card', salt: '2' },
    { name: 'issuing_state', value: 'MEX', salt: '3' },
    { name: 'expiration_date', value: '2031-04-30', salt: '4' },
    { name: 'full_name', value: 'Someone', salt: '5' },
  ]
  expect(idShownOf(JSON.stringify({ stampNumber: '1', factList: list })), 'those three, nothing else').toEqual({ kind: 'Identity Card', country: 'MEX', until: '2031-04-30' })
  expect(idShownOf(JSON.stringify({ stampNumber: '1' }))).toEqual({})
})

test("someone's short key, the first 6 characters of their address; a name at most 12, one saved longer cut until edited", () => {
  expect(short('7Hq2xPm9Vd3kLw8NbR4tYz')).toBe('7Hq2xP…')
  expect(NAME_MOST).toBe(12)
  expect([nameShown('Rodrigo'), nameShown('Rodrigo the plumber')]).toEqual(['Rodrigo', 'Rodrigo the…'])
})
