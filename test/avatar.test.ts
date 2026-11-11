// A profile's avatar, by the one rule the app and the index share (services' index/src/avatar.ts):
// its market's color from the directory, walked in its order, each market its name's first choice or
// the next one free, the same on every device; its icon from a small table, else its name's first
// letter; solid when its role offers, light when it requests. Nothing here ties the table or the
// colors to the directory's names, which may change. On it, the app draws a profile's animal, its own,
// picked from the profile's address; with no profile behind it (a market, a role), the market's icon.

import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'

import { ICONS, PALETTE, colorIn, colorsFor, fnv1a, iconOf as shared } from '../services/index/src/avatar.ts'
import { Avatar, colorOf, iconOf } from '../src/avatar.tsx'
import { isIcon } from '../src/icons.tsx'
import { markets } from '../src/markets.ts'
import { OFFERS, REQUESTS, split } from './labels.ts'

/** The directory's markets, in its order. */
const names = markets.directory.markets.map((m) => m.name)

test('FNV-1a, 32 bits, over the UTF-8 bytes: its published values, so a market has one color everywhere', () => {
  expect(fnv1a('')).toBe(0x811c9dc5)
  expect(fnv1a('a')).toBe(0xe40c292c)
  expect(fnv1a('foobar')).toBe(0xbf9cf968)
})

test("the directory's markets each get a color of their own, up to ten, then a new round", () => {
  const colors = names.map(colorOf)
  expect(new Set(colors).size).toBe(Math.min(names.length, PALETTE.length))
  for (const color of colors) expect(PALETTE).toContain(color)
})

test('the same directory always gives the same colors: each market its first choice, else the next one free', () => {
  expect(colorsFor(names)).toEqual(colorsFor([...names]))
  expect(Object.fromEntries(names.map((n) => [n, colorOf(n)]))).toEqual(colorsFor(names))
  expect(colorsFor(names)[names[0]!], 'the first market, its first choice').toBe(PALETTE[fnv1a(names[0]!) % PALETTE.length])
  // Two names whose first choices are the same: the second takes the next color.
  const [a, b] = sameFirstChoice()
  const at = fnv1a(a) % PALETTE.length
  expect(colorsFor([a, b])).toEqual({ [a]: PALETTE[at], [b]: PALETTE[(at + 1) % PALETTE.length] })
})

test('past ten markets, colors repeat: each ten in a round of its own', () => {
  const many = Array.from({ length: 25 }, (_, i) => `market-${i}`)
  const colors = colorsFor(many)
  for (const round of [many.slice(0, 10), many.slice(10, 20)]) expect(new Set(round.map((n) => colors[n])).size).toBe(10)
  expect(new Set(many.slice(20).map((n) => colors[n])).size).toBe(5)
})

test('a market the directory does not list takes its first choice', () => {
  expect(colorOf('pottery')).toBe(PALETTE[fnv1a('pottery') % PALETTE.length])
  expect(colorIn({}, 'pottery')).toBe(colorOf('pottery'))
})

/** Two names with the same first choice. */
function sameFirstChoice(): [string, string] {
  const seen = new Map<number, string>()
  for (let i = 0; ; i++) {
    const name = `m${i}`
    const at = fnv1a(name) % PALETTE.length
    if (seen.has(at)) return [seen.get(at)!, name]
    seen.set(at, name)
  }
}

test("the app's colors and icons are the shared rule's: each market's color as services' colorsFor gives it, its icon as its table names it", () => {
  const colors = colorsFor(names)
  for (const n of [...names, 'pottery']) expect(colorOf(n), n).toBe(colorIn(colors, n))
  for (const n of [...names, 'pottery']) expect(iconOf(n), n).toBe(shared(n))
})

test('every icon the shared table names is one the app draws; a name it does not draw is none', () => {
  for (const [market, icon] of Object.entries(ICONS)) expect(isIcon(icon), `${market}: ${icon}`).toBe(true)
  expect(isIcon('no-such-icon')).toBe(false)
})

test('a market the icon table lists shows its icon; one it does not shows its first letter', () => {
  const market = names.find((n) => shared(n) !== null)!
  const listed = renderToStaticMarkup(Avatar({ label: `${market}/${markets.market(market)!.roles[0]!.role}` }))
  expect(listed).toContain(`data-icon="${shared(market)}"`)
  const unlisted = renderToStaticMarkup(Avatar({ label: 'pottery/potter' }))
  expect(unlisted).not.toMatch(/<svg/)
  expect(unlisted).toMatch(/<span class="letter">P<\/span>/)
})

test("solid when the role's listings are offers, light when they are requests; hidden from screen readers", () => {
  const solid = renderToStaticMarkup(Avatar({ label: OFFERS }))
  const light = renderToStaticMarkup(Avatar({ label: REQUESTS }))
  expect(solid).toMatch(/class="av md"/)
  expect(light).toMatch(/class="av md look"/)
  for (const drawn of [solid, light]) {
    expect(drawn).toContain(`--h:${colorOf(split(OFFERS).market)}`)
    expect(drawn).toMatch(/aria-hidden="true"/)
  }
})

test('a profile is its animal, picked from its address alone: the same address, the same animal, every time', async () => {
  const { ANIMALS, animalOf } = await import('../src/animals.ts')
  expect(ANIMALS.length, 'forty').toBe(40)
  expect(new Set(ANIMALS.map(([name]) => name)).size, 'each one once').toBe(40)
  const address = '46aPq9mVd2XoA7'
  expect(animalOf(address)).toBe(animalOf(address))
  expect(animalOf(address)).toBe(ANIMALS[fnv1a(address) % ANIMALS.length])
  const drawn = (a: string) => renderToStaticMarkup(Avatar({ label: OFFERS, address: a }))
  expect(drawn(address)).toBe(drawn(address))
  expect(drawn(address)).toContain(`data-animal="${animalOf(address)[0]}"`)
})

test('different addresses spread across all forty: 2,000 at random use every animal, none more than twice its share', async () => {
  const { ANIMALS, animalOf } = await import('../src/animals.ts')
  const counts = new Map<string, number>()
  for (let i = 0; i < 2000; i++) {
    const address = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url')
    const [name] = animalOf(address)
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  expect(counts.size).toBe(ANIMALS.length)
  for (const [name, n] of counts) expect(n, name).toBeLessThanOrEqual((2 * 2000) / ANIMALS.length)
})

test("an animal on its market's color, solid or light as the market's icon was; each drawn in the text's color, one path or more", async () => {
  const { ANIMALS } = await import('../src/animals.ts')
  const solid = renderToStaticMarkup(Avatar({ label: OFFERS, address: 'A1' }))
  const light = renderToStaticMarkup(Avatar({ label: REQUESTS, address: 'A1' }))
  expect(solid).toMatch(/class="av md"/)
  expect(light).toMatch(/class="av md look"/)
  for (const drawn of [solid, light]) {
    expect(drawn).toContain(`--h:${colorOf(split(OFFERS).market)}`)
    expect(drawn).toMatch(/fill="currentColor"/)
    expect(drawn).not.toMatch(/data-icon=/)
  }
  for (const [name, paths] of ANIMALS) {
    expect(paths.length, name).toBeGreaterThan(0)
    for (const p of paths) expect(typeof p === 'string' ? p : p.d, name).toMatch(/^M[-\d.\sMLHVCZ]+$/)
  }
})

test("the person's own profiles show their market's icon, wherever they show; anyone else's its animal", async () => {
  const device = await import('../src/device.ts')
  const { freshDevice } = await import('./world.ts')
  freshDevice()
  try {
    device.saveProfiles([{ label: OFFERS, address: 'MINE' }])
    const mine = renderToStaticMarkup(Avatar({ label: OFFERS, address: 'MINE' }))
    const theirs = renderToStaticMarkup(Avatar({ label: OFFERS, address: 'THEIRS' }))
    expect(mine).not.toMatch(/data-animal=/)
    const icon = iconOf(split(OFFERS).market)
    if (icon) expect(mine).toContain(`data-icon="${icon}"`)
    expect(theirs).toMatch(/data-animal=/)
  } finally {
    freshDevice()
  }
})

test('markets keep their icons: an avatar with no profile behind it (a market, a role) draws its market', () => {
  for (const n of names) {
    const icon = iconOf(n)
    const drawn = renderToStaticMarkup(Avatar({ label: `${n}/x` }))
    expect(drawn).not.toMatch(/data-animal=/)
    if (icon) expect(drawn, n).toContain(`data-icon="${icon}"`)
  }
})
