// The mark, never redrawn: the drawing as it was given, and the same shapes and strokes in the
// app's component (in the theme's ink) and in public/icon.svg (ink on paper, 8 units around it, a
// 56-unit box), from which the PWA icons are made.

import { readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'

import { Mark } from '../src/ui.tsx'

/** The drawing, exactly as it was given. */
const GIVEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter"><polyline points="8,12 20,3 32,12"/><polyline points="8,22 20,13 32,22"/><polyline points="8,32 20,23 32,32"/><line x1="20" y1="24" x2="20" y2="38"/></svg>'

/** Each shape, by its tag and attributes. */
const shapes = (svg: string) => [...svg.matchAll(/<(polyline|line)\s([^>]*?)\s*\/?>/g)].map(([, tag, attrs]) => `${tag} ${attrs}`)
/** The value of an attribute on the first element that has it. */
const attr = (svg: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(svg)?.[1]

test('the app draws the mark as given, in the theme\'s ink', () => {
  const drawn = renderToStaticMarkup(Mark({ size: 28 }))
  expect(shapes(drawn)).toEqual(shapes(GIVEN))
  for (const name of ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']) expect(attr(drawn, name), name).toBe(attr(GIVEN, name))
  expect(attr(drawn, 'class')).toBe('mark')
  expect(readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8')).toMatch(/\.mark \{\s*color: var\(--ink\);\s*\}/)
})

test('the icon holds the same drawing, ink #121A15 on paper #EDEAE0, 8 units around it', () => {
  const icon = readFileSync(new URL('../public/icon.svg', import.meta.url), 'utf8')
  expect(shapes(icon)).toEqual(shapes(GIVEN))
  expect(attr(icon, 'viewBox')).toBe('-8 -8 56 56')
  expect(icon).toContain('<rect x="-8" y="-8" width="56" height="56" fill="#EDEAE0"/>')
  expect(attr(icon, 'stroke')).toBe('#121A15')
  for (const name of ['fill', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']) expect(attr(icon.slice(icon.indexOf('<g')), name), name).toBe(attr(GIVEN, name))
})
