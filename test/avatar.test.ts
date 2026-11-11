// A profile's avatar: its market's color, its number from its market file cycled through the index's
// ten colors (services' index/src/avatar.ts), so it is the color the index draws it in and markets
// numbered next to each other differ; a market the directory doesn't list, the quiet ink. Its icon,
// the one its market file names, else its name's first letter, and one the app doesn't draw the
// letter too; every icon the markets accept (their icons.json) in the app's copy of Phosphor, so a
// gap fails here, never on a screen; the page carrying only those its directory names. Solid when its
// role offers, light when it requests. On it, the app draws a profile's animal, its own, picked from
// the profile's address; with no profile behind it (a market, a role), the market's icon.

import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'

import { NO_NUMBER, PALETTE } from '../services/index/src/avatar.ts'
import { accepted, componentOf, drawn } from '../build/markets.ts'
import icons from 'virtual:market-icons'
import { fnv1a } from '../src/animals.ts'
import { Avatar, colorOf, iconOf } from '../src/avatar.tsx'
import { markets } from '../src/markets.ts'
import { OFFERS, REQUESTS, split } from './labels.ts'

/** The directory's markets, in its order. */
const names = markets.directory.markets.map((m) => m.name)

test('FNV-1a, 32 bits, over the UTF-8 bytes: its published values, so a profile is the same animal everywhere', () => {
  expect(fnv1a('')).toBe(0x811c9dc5)
  expect(fnv1a('a')).toBe(0xe40c292c)
  expect(fnv1a('foobar')).toBe(0xbf9cf968)
})

test("a market's color is its number cycled through the index's ten colors, in their order: neighbours differ, every ten it repeats", () => {
  expect(new Set(PALETTE).size).toBe(10)
  for (const n of names) {
    const { number } = markets.market(n)!
    expect(colorOf(n), n).toBe(PALETTE[(number - 1) % 10])
  }
  const numbers = names.map((n) => markets.market(n)!.number)
  for (const n of names) {
    const next = names.find((m) => markets.market(m)!.number === markets.market(n)!.number + 1)
    if (next) expect(colorOf(next), `${n} and ${next}`).not.toBe(colorOf(n))
  }
  expect(new Set(numbers).size, 'no two markets one number').toBe(numbers.length)
})

test('a market the directory does not list takes the quiet ink', () => {
  expect(colorOf('pottery')).toBe(NO_NUMBER)
})

test("a market's icon is the one its file names; one that names none, or one the app doesn't draw, shows its first letter", () => {
  for (const n of names) expect(iconOf(n), n).toBe(markets.market(n)!.icon ?? null)
  const market = names.find((n) => iconOf(n) !== null)!
  expect(renderToStaticMarkup(Avatar({ label: `${market}/${markets.market(market)!.roles[0]!.role}` }))).toContain(`data-icon="${iconOf(market)}"`)
  const unlisted = renderToStaticMarkup(Avatar({ label: 'pottery/potter' }))
  expect(unlisted).not.toMatch(/<svg/)
  expect(unlisted).toMatch(/<span class="letter">P<\/span>/)
  // A name no icon of this copy has, or no icon's name at all, is not drawn: its market shows the letter.
  for (const odd of ['no-such-icon', '../fill/star', 'Star', '']) expect(drawn(odd), odd).toBe(false)
})

test("every icon the markets accept, their icons.json, is in the app's copy of Phosphor", async () => {
  const all = accepted()
  expect(all.length).toBeGreaterThan(1000)
  expect(all.filter((name) => !drawn(name))).toEqual([])
  const phosphor: Record<string, unknown> = await import('@phosphor-icons/react')
  expect(all.filter((name) => !phosphor[`${componentOf(name)}Icon`])).toEqual([])
})

test('the page carries the icons its directory names, and no others', () => {
  expect(Object.keys(icons).sort()).toEqual([...new Set(names.flatMap((n) => markets.market(n)!.icon ?? []))].sort())
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
