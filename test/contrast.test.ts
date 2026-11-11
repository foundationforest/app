// Readable, light and dark: every text 4.5:1 against what is behind it, every icon and every edge
// that alone marks a control 3:1, computed from theme.css's own tokens, and every avatar, solid and
// light, in each of the palette's ten colors. The star beside a rating is decorative, the number
// beside it says the score, so it is left out.

import { readFileSync } from 'node:fs'

import { expect, test } from 'vitest'

import { PALETTE } from '../services/index/src/avatar.ts'

const css = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8')
const block = (selector: string) => css.slice(css.indexOf(selector)).split('}')[0]!

/** The tokens one of the theme's blocks sets, light's under dark's, each var() resolved. */
function tokens(selector: string, under: Record<string, string> = {}): Record<string, string> {
  const set: Record<string, string> = { ...under }
  for (const [, name, value] of block(selector).matchAll(/--([\w-]+):\s*([^;]+);/g)) set[name!] = value!.trim()
  const resolve = (v: string): string => v.replace(/var\(--([\w-]+)\)/g, (_, n: string) => resolve(set[n]!))
  return Object.fromEntries(Object.entries(set).map(([k, v]) => [k, resolve(v)]))
}

const LIGHT = tokens(':root {')
const DARK = tokens(":root[data-theme='dark'] {", LIGHT)

type Rgb = [number, number, number]
const rgb = (hex: string): Rgb => {
  const h = /^#([0-9a-f]{6})$/i.exec(hex)?.[1]
  if (!h) throw new Error(`not a color: ${hex}`)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb
}
/** color-mix(in srgb, a p, b) for opaque colors. */
const mix = (a: Rgb, p: number, b: Rgb): Rgb => a.map((x, i) => x * p + b[i]! * (1 - p)) as Rgb
const luminance = (c: Rgb) => {
  const [r, g, b] = c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)) as Rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: Rgb, b: Rgb) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m) as [number, number]
  return (x + 0.05) / (y + 0.05)
}

/** Text on its ground, by token. */
const TEXT: Array<[string, string]> = [
  ['ink', 'bg'],
  ['ink', 'card'],
  ['ink2', 'bg'],
  ['ink2', 'card'],
  ['ink2', 'sunk'],
  ['ink3', 'bg'],
  ['ink3', 'card'],
  ['ink', 'seg-on'],
  ['on-forest', 'forest'],
  ['forest', 'bg'],
  ['forest', 'card'],
  ['on-mint', 'mint'],
  ['on-sun', 'sun-bg'],
  ['danger', 'bg'],
  ['danger', 'card'],
  ['danger', 'danger-bg'],
  ['on-danger', 'danger'],
  ['on-deep', 'deep'],
  ['on-deep2', 'deep'],
  ['on-deep-danger', 'deep'],
  ['on-cream', 'cream'],
  ['bg', 'ink'],
]

/** Icons and the edges that alone mark a control (a field's, a tick box's), on their ground. */
const ICONS: Array<[string, string]> = [
  ['ink3', 'card'],
  ['ink2', 'card'],
  ['on-mint', 'mint'],
  ['on-forest', 'forest'],
  ['leaf', 'card'],
  ['leaf', 'bg'],
  ['edge', 'card'],
  ['edge', 'bg'],
]

const percent = (v: string) => Number(/^([\d.]+)%$/.exec(v)![1]) / 100

for (const [theme, t] of [
  ['light', LIGHT],
  ['dark', DARK],
] as const) {
  test(`${theme}: every text 4.5:1 against what is behind it`, () => {
    for (const [fg, bg] of TEXT) expect(ratio(rgb(t[fg]!), rgb(t[bg]!)), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5)
  })

  test(`${theme}: every icon, and every edge that alone marks a control, 3:1`, () => {
    for (const [fg, bg] of ICONS) expect(ratio(rgb(t[fg]!), rgb(t[bg]!)), `${fg} on ${bg}`).toBeGreaterThanOrEqual(3)
  })

  test(`${theme}: every avatar, in each of the palette's ten colors, solid and light, its icon 3:1`, () => {
    const card = rgb(t.card!)
    for (const color of PALETTE) {
      const h = rgb(color)
      expect(ratio(rgb('#ffffff'), h), `solid ${color}`).toBeGreaterThanOrEqual(3)
      const ground = mix(h, percent(t['look-tint']!), card)
      const icon = mix(h, percent(t['look-icon']!), rgb(t['look-to']!))
      expect(ratio(icon, ground), `light ${color}`).toBeGreaterThanOrEqual(3)
    }
  })

  test(`${theme}: a market's tile, in each of the palette's ten colors, its first word in its color 4.5:1`, () => {
    const card = rgb(t.card!)
    for (const color of PALETTE) {
      const h = rgb(color)
      const ground = mix(h, percent(t['tile-tint']!), card)
      const word = mix(h, percent(t['tile-word']!), rgb(t['look-to']!))
      expect(ratio(word, ground), color).toBeGreaterThanOrEqual(4.5)
    }
  })
}

test("the device's dark is the chosen dark", () => {
  expect(tokens(":root:not([data-theme='light']) {", LIGHT)).toEqual(DARK)
})
