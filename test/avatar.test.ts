// A profile's avatar: its market's color from its name alone, the same on every device; its icon from
// a small table, else its name's first letter; solid when its role offers, light when it requests.
// Nothing here ties the table or the colors to the directory's names, which may change.

import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'

import { Avatar } from '../src/avatar.tsx'
import { PALETTE, colorOf, fnv1a } from '../src/colors.ts'

test('FNV-1a, 32 bits, over the UTF-8 bytes: its published values, so a market has one color everywhere', () => {
  expect(fnv1a('')).toBe(0x811c9dc5)
  expect(fnv1a('a')).toBe(0xe40c292c)
  expect(fnv1a('foobar')).toBe(0xbf9cf968)
})

test('the same name always gives the same color, and any name lands in the palette', () => {
  expect(PALETTE).toHaveLength(10)
  for (const name of ['tutoring', 'clothing', 'pottery', 'dog-walking', 'café', '', 'x'.repeat(200)]) {
    expect(colorOf(name), name).toBe(colorOf(name))
    expect(PALETTE, name).toContain(colorOf(name))
  }
})

test('a market the icon table lists shows its icon; one it does not shows its first letter', () => {
  const listed = renderToStaticMarkup(Avatar({ label: 'tutoring/tutor' }))
  expect(listed).toMatch(/data-icon="graduation-cap"/)
  const unlisted = renderToStaticMarkup(Avatar({ label: 'pottery/potter' }))
  expect(unlisted).not.toMatch(/<svg/)
  expect(unlisted).toMatch(/<span class="letter">P<\/span>/)
})

test("solid when the role's listings are offers, light when they are requests; hidden from screen readers", () => {
  const solid = renderToStaticMarkup(Avatar({ label: 'tutoring/tutor' }))
  const light = renderToStaticMarkup(Avatar({ label: 'tutoring/student' }))
  expect(solid).toMatch(/class="av md"/)
  expect(light).toMatch(/class="av md look"/)
  for (const drawn of [solid, light]) {
    expect(drawn).toContain(`--h:${colorOf('tutoring')}`)
    expect(drawn).toMatch(/aria-hidden="true"/)
  }
})
