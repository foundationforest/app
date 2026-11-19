// Where a listing's place is centred (near.ts): a circle set on the map is posted with its centre
// moved by up to a tenth of its radius, worked out from the seed, the same way every time for that
// profile and radius, so nothing is kept on the device and listings from one spot share one centre;
// another profile or another radius, another way; an exact spot, as it is; only a place set on the
// map in this page is moved, never one an edit keeps; the radii the place screen offers; and the
// ring the map draws.

import { expect, test } from 'vitest'

import { newSeed } from '@foundationforest/keys'

import { MOVED, PLACE_TEXT, RADII, kmBetween, moveOf, placeAt, pointOf, postedAt, ring, setOnMap, spotOf, wasSet, withPlacesMoved } from '../src/near.ts'

const HOME = { lat: 40.41678, lon: -3.70379 }
const LABEL = 'home-cleaning/cleaner'

test('a circle moved by up to a tenth of its radius, the same way every time for one profile and radius; another profile, or another radius, another way', async () => {
  const seed = newSeed()
  for (const radiusKm of RADII) {
    const place = { ...pointOf(HOME, 4), radiusKm }
    const once = await postedAt(seed, LABEL, place)
    expect(await postedAt(seed, LABEL, place), 'the same way again').toEqual(once)
    const km = kmBetween(HOME, spotOf(once))
    expect(km, `${radiusKm} km`).toBeLessThanOrEqual(radiusKm * MOVED + 0.02)
    expect(once.radiusKm).toBe(radiusKm)
  }
  const at = { ...pointOf(HOME, 4), radiusKm: 10 }
  const mine = await postedAt(seed, LABEL, at)
  expect(await postedAt(newSeed(), LABEL, at), 'another seed').not.toEqual(mine)
  expect(await postedAt(seed, 'home-cleaning/client', at), 'another profile').not.toEqual(mine)
  const [five, ten] = [await moveOf(seed, LABEL, 5), await moveOf(seed, LABEL, 10)]
  expect(five.bearing, 'another radius, another direction, so two radii never point back to the spot').not.toBe(ten.bearing)
  expect(PLACE_TEXT(10, LABEL)).toBe('forest-app/place/10/home-cleaning/cleaner')
})

test('over many seeds, the moves spread evenly over the small disc: every direction, near and far', async () => {
  const moves = await Promise.all(Array.from({ length: 400 }, () => moveOf(newSeed(), LABEL, 10)))
  for (const m of moves) expect(m.km).toBeLessThanOrEqual(1)
  const quarter = (b: number) => Math.floor(b / (Math.PI / 2))
  for (const q of [0, 1, 2, 3]) expect(moves.filter((m) => quarter(m.bearing) === q).length, `quarter ${q}`).toBeGreaterThan(60)
  expect(moves.filter((m) => m.km < 0.5).length, 'a quarter of the disc is within half its radius').toBeGreaterThan(60)
  expect(moves.filter((m) => m.km < 0.5).length).toBeLessThan(140)
})

test('an exact spot, as it is; only a place set on the map in this page is moved, an edit\'s kept one and an AI\'s as they are', async () => {
  const seed = newSeed()
  const spot = { lat: '40.41678', lon: '-3.70379', radiusKm: 0 }
  expect(await postedAt(seed, LABEL, spot)).toEqual(spot)
  const set = placeAt(HOME, 2)
  expect(wasSet(set)).toBe(true)
  const kept = { lat: '40.4342', lon: '-3.7031', radiusKm: 1 }
  expect(wasSet(kept)).toBe(false)
  const fields = [
    { name: 'area', piece: 'place' },
    { name: 'jobs', piece: 'choice' },
  ]
  const body = { area: [kept, set], jobs: ['windows'] }
  const out = await withPlacesMoved(seed, LABEL, fields, body)
  expect(out.jobs).toEqual(['windows'])
  expect(out.area[0], 'kept as posted').toEqual(kept)
  expect(out.area[1]).toEqual(await postedAt(seed, LABEL, set))
  expect(out.area[1]).not.toEqual(set)
  const one = await withPlacesMoved(seed, LABEL, fields, { area: setOnMap({ ...kept }) })
  expect(one.area, 'a field of one').toEqual(await postedAt(seed, LABEL, kept))
})

test('a point as a place holds it: decimal text, no trailing zeros, never -0; the longitude wrapped', () => {
  expect(pointOf(HOME, 4)).toEqual({ lat: '40.4168', lon: '-3.7038' })
  expect(pointOf({ lat: -0.000001, lon: 180.5 }, 4)).toEqual({ lat: '0', lon: '-179.5' })
  expect(pointOf({ lat: 40.1, lon: 100 }, 4)).toEqual({ lat: '40.1', lon: '100' })
})

test('the radii the place screen offers: from 1 km up to 50', () => {
  expect(RADII).toEqual([1, 2, 5, 10, 20, 50])
})

test('the ring the map draws: every point at the radius, closed', () => {
  for (const km of [1, 5, 50]) {
    const edge = ring(HOME, km)
    expect(edge).toHaveLength(65)
    expect(edge.at(-1)).toEqual(edge[0])
    for (const [lon, lat] of edge) expect(Math.abs(kmBetween(HOME, { lat, lon }) - km) / km).toBeLessThan(0.01)
  }
  const [north] = ring(HOME, 5)
  expect(north![0], 'the first point due north').toBeCloseTo(HOME.lon, 6)
  expect(north![1]).toBeGreaterThan(HOME.lat)
})
