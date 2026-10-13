// The mark, never redrawn: the drawing as it was given, and the same shapes and strokes in the
// app's one component (in the theme's ink), and in the icons made from that component at each build
// (shell.ts): the favicon, ink on paper, 8 units around it, a 56-unit box, and the PNGs from it. No
// copy of it is kept by hand: public/ holds no icon.

import { existsSync, readFileSync, readdirSync } from 'node:fs'

import { Resvg } from '@resvg/resvg-js'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'

import { PNG_SIZES, iconPng, iconSvg } from '../shell.ts'
import { Mark } from '../src/mark.tsx'

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
  const icon = iconSvg()
  expect(shapes(icon)).toEqual(shapes(GIVEN))
  expect(attr(icon, 'viewBox')).toBe('-8 -8 56 56')
  expect(icon).toContain('<rect x="-8" y="-8" width="56" height="56" fill="#EDEAE0"/>')
  const group = icon.slice(icon.indexOf('<g'))
  expect(attr(group, 'stroke')).toBe('#121A15')
  for (const name of ['fill', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']) expect(attr(group, name), name).toBe(attr(GIVEN, name))
})

test('the PNG icons: rendered from that icon, each its size, paper at the edge and ink on the trunk', () => {
  for (const [name, size] of Object.entries(PNG_SIZES)) {
    const png = iconPng(size)
    expect([png.readUInt32BE(16), png.readUInt32BE(20)], name).toEqual([size, size])
  }
  const { pixels, width } = new Resvg(iconSvg(), { fitTo: { mode: 'width', value: 56 } }).render()
  const at = (x: number, y: number) => [...pixels.subarray((y * width + x) * 4, (y * width + x) * 4 + 3)]
  expect(at(1, 1), 'paper').toEqual([0xed, 0xea, 0xe0])
  expect(at(28, 42), 'ink, on the trunk').toEqual([0x12, 0x1a, 0x15])
})

test('no copy of the mark kept by hand', () => {
  const pub = new URL('../public/', import.meta.url)
  expect(existsSync(pub) ? readdirSync(pub).filter((f) => /icon|mark|logo/i.test(f)) : []).toEqual([])
})
