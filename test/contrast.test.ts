// Readable, light and dark: every text 4.5:1 against what is behind it, every icon and every edge
// that alone marks a control 3:1, computed from theme.css's own tokens, and every avatar, solid and
// light, and every market's badge on a picture, in each of the palette's ten colors. The star beside
// a rating is decorative, the number beside it says the score, so it is left out, and so is the
// star on Review, its word beside it. A market's tile: its name white on its color, large (19px at
// 800, WCAG's large text), so 3:1, the black laid over it in the dark look counted; its big faint
// icon is decorative, the name saying it. And the greens: two in each look, the strong one (forest)
// the ink on the soft one (mint), 4.5:1, and the ink too, on your own messages; Start's ground is
// one of them, with its text on it. The strong green as a ground does something, nowhere else. That
// nothing else is green is the build test's (build.test.ts).

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
  ['on-forest', 'forest'],
  ['forest', 'bg'],
  ['forest', 'card'],
  ['forest', 'mint'],
  ['ink', 'mint'],
  ['ink', 'sunk'],
  ['on-sun', 'sun-bg'],
  ['on-sun-mark', 'sun'],
  ['danger', 'bg'],
  ['danger', 'card'],
  ['danger', 'danger-bg'],
  ['on-danger', 'danger'],
  ['on-start', 'start'],
  ['on-start2', 'start'],
  ['on-start-danger', 'start'],
  ['on-cream', 'cream'],
  ['bg', 'ink'],
]

/** Icons and the edges that alone mark a control (a field's, a tick box's), on their ground. */
const ICONS: Array<[string, string]> = [
  ['ink3', 'card'],
  ['ink2', 'card'],
  ['forest', 'mint'],
  ['on-forest', 'forest'],
  ['bg', 'ink'],
  ['ink', 'sunk'],
  ['ink', 'card'],
  ['forest', 'card'],
  ['forest', 'bg'],
  ['on-start', 'start'],
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

  test(`${theme}: a market's badge on a picture, in each of the palette's ten colors, its white icon 3:1`, () => {
    for (const color of PALETTE) expect(ratio(rgb('#ffffff'), mix(rgb(color), percent(/\.avb > \.mb \{[^}]*color-mix\(in srgb, var\(--h\) ([\d.]+%), black\)/.exec(css)![1]!), rgb('#000000'))), color).toBeGreaterThanOrEqual(3)
  })

  test(`${theme}: a market's tile, in each of the palette's ten colors, its name white on it 3:1, large text`, () => {
    const name = block('button.market-tile .tile-name {')
    expect([/font-size:\s*([\d.]+)px/.exec(name)![1], /font-weight:\s*(\d+)/.exec(name)![1], /color:\s*([^;]+);/.exec(name)![1]], "large: WCAG's 14pt bold and over").toEqual(['19', '800', '#ffffff'])
    const dark = Number(t['tile-dark'])
    for (const color of PALETTE) expect(ratio(rgb('#ffffff'), mix(rgb(color), 1 - dark, rgb('#000000'))), color).toBeGreaterThanOrEqual(3)
  })
}

test("the device's dark is the chosen dark", () => {
  expect(tokens(":root:not([data-theme='light']) {", LIGHT)).toEqual(DARK)
})

/** The score a review is given, set on its slider: the fill and the thumb, on the page's ground, where the soft green would not be seen (3:1) and the strong one is. */
const SLIDER = ["input[type='range']::-webkit-slider-runnable-track", "input[type='range']::-webkit-slider-thumb", "input[type='range']::-moz-range-thumb", "input[type='range']::-moz-range-track"].map((s) => `.score ${s}`)
/** What acts, the one place the strong green is a ground: a screen's main button (Home's New among them), Send, Create. And the radio picked, its dot the strong green on the soft. */
/** What acts, the one place the strong green is a ground: a screen's main button, Send, Create, and Home's round +, its one action. And the radio picked, its dot the strong green on the soft. */
const ACTS = ['button.primary', 'a.button.primary', 'button.create', '.radio.on']

/** Counts, the new dot, the check badges and the score's slider: in ink, never green. */
const INK = ['.corner', '.dot', '.vb', '.vico', '.sq.ink', ...SLIDER]

test('the greens: the strong green is a ground only where tapping it acts; the soft one is the strong one\'s ground, or the ink\'s on your own messages; counts, the dot, badges and the slider in ink', () => {
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector!.split('*/').at(-1)!.trim(), body: body! }))
  const strong = rules.filter(({ body }) => /background:[^;]*var\(--forest\)/.test(body)).map((r) => r.selector)
  expect(strong.sort()).toEqual([...ACTS].sort())
  // The soft green's text is the strong green, or on your own messages the ink: the pairs the contrast tests above measure.
  for (const { selector, body } of rules.filter(({ body }) => /background:\s*var\(--mint\)\s*;/.test(body))) {
    if (/\bcolor:/.test(body)) expect(body, `${selector}: on the soft green, the strong green or the ink`).toMatch(selector === '.said.mine' ? /[^-]color:\s*var\(--ink\)/ : /[^-]color:\s*var\(--forest\)/)
  }
  for (const selector of INK) {
    const bodies = rules.filter((r) => r.selector === selector).map((r) => r.body)
    expect(bodies.some((b) => /background:[^;]*var\(--ink\)/.test(b)), `${selector}: in ink`).toBe(true)
  }
  for (const gone of ['--on-mint', '--leaf', '--deep', '--on-deep']) expect(css, gone).not.toContain(gone)
})
