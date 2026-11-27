// Links into the app (src/links.ts), as services' MCP server hands them out: a path after the #,
// read back into what it opens; anything else is no link.

import { expect, test } from 'vitest'

import { type Link, isLink, linkIn, linkTo } from '../src/links.ts'

const ADDRESS = '2KsR6wpfN78YfGgvdmt2C1Hxzquj3DQXwsjVn4o31TDY'

test('each shape, read back into what it opens', () => {
  expect(linkIn('#/tutoring/tutor')).toEqual({ to: 'profile', label: 'tutoring/tutor' })
  expect(linkIn('#/tutoring/tutor/'), 'a trailing slash').toEqual({ to: 'profile', label: 'tutoring/tutor' })
  expect(linkIn('#/goods-selling/seller/listing/0a1b2c')).toEqual({ to: 'listing', label: 'goods-selling/seller', id: '0a1b2c' })
  expect(linkIn(`#/tutoring/tutor/messages/${ADDRESS}`)).toEqual({ to: 'thread', label: 'tutoring/tutor', them: ADDRESS })
  expect(linkIn(`#/give-credits/${ADDRESS}`)).toEqual({ to: 'give', folder: ADDRESS })
  expect(linkIn('#/tutoring/tutor/listing/a%20b'), 'percent-decoded').toEqual({ to: 'listing', label: 'tutoring/tutor', id: 'a b' })
})

test('anything else is no link', () => {
  for (const hash of ['', '#', '#/', '#/tutoring', '#market=tutoring&role=tutor', '#/Tutoring/tutor', '#/tutoring/tutor/listing', '#/tutoring/tutor/listing/a/b', '#/tutoring/tutor/messages/not-an-address', '#/tutoring/tutor/reviews', `#/give-credits/${ADDRESS}/more`, '#/give-credits/nobody', '#/tutoring/tutor/listing/%E0%A4%A'])
    expect(linkIn(hash), hash).toBeNull()
})

test('linkTo writes what linkIn reads; isLink takes back what the history kept', () => {
  const links: Link[] = [
    { to: 'profile', label: 'tutoring/tutor' },
    { to: 'listing', label: 'tutoring/tutor', id: 'x y' },
    { to: 'thread', label: 'tutoring/tutor', them: ADDRESS },
    { to: 'give', folder: ADDRESS },
  ]
  for (const l of links) {
    expect(linkIn(linkTo(l))).toEqual(l)
    expect(isLink(structuredClone(l))).toBe(true)
  }
  expect(isLink({ to: 'listing', label: 'tutoring/tutor' })).toBe(false)
  expect(isLink(null)).toBe(false)
})
