// The mark, never redrawn: the drawing as it was given, which is the one services' mcp draws its
// icon from (mcp/src/icon.ts); the same shapes and strokes in the app's one component (in the
// theme's ink), and in the icons made from that component at each build (build/shell.ts): the
// favicon, ink on the page's ground, 8 units around it, a 56-unit box, and the PNGs from it. The
// loader is the same drawing, its trunk first, then each chevron from the bottom up. No copy of it
// is kept by hand.

import { existsSync, readFileSync, readdirSync } from 'node:fs'

import { Resvg } from '@resvg/resvg-js'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'

import { SVG as MCP_ICON } from '../services/mcp/src/icon.ts'
import { PNG_SIZES, iconPng, iconSvg } from '../build/shell.ts'
import { Loader, Mark } from '../src/mark.tsx'

/** The drawing, exactly as it was given: chevrons 8,12 20,3 32,12 / 8,22 20,13 32,22 / 8,32 20,23 32,32, trunk 20,24 to 20,38, stroke 4. */
const GIVEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter"><polyline points="8,12 20,3 32,12"/><polyline points="8,22 20,13 32,22"/><polyline points="8,32 20,23 32,32"/><line x1="20" y1="24" x2="20" y2="38"/></svg>'

/** Each shape, by its tag and attributes. */
const shapes = (svg: string) => [...svg.matchAll(/<(polyline|line)\s([^>]*?)\s*\/?>/g)].map(([, tag, attrs]) => `${tag} ${attrs}`)
/** The value of an attribute on the first element that has it. */
const attr = (svg: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(svg)?.[1]

test("the drawing is the one services' mcp draws its icon from", () => {
  expect(shapes(MCP_ICON)).toEqual(shapes(GIVEN))
  expect(attr(MCP_ICON.slice(MCP_ICON.indexOf('<g')), 'stroke-width')).toBe('4')
})

test("the app draws the mark as given, in the theme's ink", () => {
  const drawn = renderToStaticMarkup(Mark({ size: 28 }))
  expect(shapes(drawn)).toEqual(shapes(GIVEN))
  for (const name of ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']) expect(attr(drawn, name), name).toBe(attr(GIVEN, name))
  expect(attr(drawn, 'class')).toBe('mark')
  expect(readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8')).toMatch(/\.mark \{\s*color: var\(--ink\);\s*\}/)
})

test('the icon holds the same drawing, ink #111A15 on the ground #F2F0E8, 8 units around it', () => {
  const icon = iconSvg()
  expect(shapes(icon)).toEqual(shapes(GIVEN))
  expect(attr(icon, 'viewBox')).toBe('-8 -8 56 56')
  expect(icon).toContain('<rect x="-8" y="-8" width="56" height="56" fill="#F2F0E8"/>')
  const group = icon.slice(icon.indexOf('<g'))
  expect(attr(group, 'stroke')).toBe('#111A15')
  for (const name of ['fill', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']) expect(attr(group, name), name).toBe(attr(GIVEN, name))
})

test('the PNG icons: rendered from that icon, each its size, the ground at the edge and ink on the trunk', () => {
  for (const [name, size] of Object.entries(PNG_SIZES)) {
    const png = iconPng(size)
    expect([png.readUInt32BE(16), png.readUInt32BE(20)], name).toEqual([size, size])
  }
  const { pixels, width } = new Resvg(iconSvg(), { fitTo: { mode: 'width', value: 56 } }).render()
  const at = (x: number, y: number) => [...pixels.subarray((y * width + x) * 4, (y * width + x) * 4 + 3)]
  expect(at(1, 1), 'the ground').toEqual([0xf2, 0xf0, 0xe8])
  expect(at(28, 42), 'ink, on the trunk').toEqual([0x11, 0x1a, 0x15])
})

test('the loader draws the same mark, its trunk first, then each chevron from the bottom up, each part in turn', () => {
  const drawn = renderToStaticMarkup(Loader({}))
  const parts = shapes(drawn).map((s) => s.replace(/class="p\d" /, ''))
  expect(parts, 'the trunk, then the bottom chevron, the middle one, the top one').toEqual([...shapes(GIVEN)].reverse())
  expect([...drawn.matchAll(/class="(p\d)"/g)].map(([, c]) => c)).toEqual(['p1', 'p2', 'p3', 'p4'])
  for (const name of ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']) expect(attr(drawn, name), name).toBe(attr(GIVEN, name))
  expect([attr(drawn, 'role'), attr(drawn, 'aria-label')]).toEqual(['status', 'Working'])
  const css = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8')
  expect(css, 'about 1.8 s a loop').toMatch(/\.loader line,\s*\.loader polyline \{[^}]*animation: fill 1\.8s/)
  expect(css, 'still when motion is reduced').toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\.loader line,\s*\.loader polyline \{\s*animation: none;/)
})

test('no copy of the mark kept by hand', () => {
  const pub = new URL('../public/', import.meta.url)
  expect(existsSync(pub) ? readdirSync(pub).filter((f) => /icon|mark|logo/i.test(f)) : []).toEqual([])
})
