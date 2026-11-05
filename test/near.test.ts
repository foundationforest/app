// Where a listing's place is centred (near.ts): an area near the spot it was put on, never on it;
// moved once per place and kept, so listings from one place share one centre, that spot inside even
// a 1 km circle; another place, another centre, and the first again back there; an exact spot, the
// pin itself; the radii an area's slider offers; and the ring the map draws.

import { beforeEach, expect, test } from 'vitest'

import * as device from '../src/device.ts'
import { MOVED, RADII, SAME_PLACE_KM, exactPoint, kmBetween, pointFor, radiusSteps, ring, spotOf } from '../src/near.ts'
import { freshDevice } from './world.ts'

beforeEach(freshDevice)

const HOME = { lat: 40.41678, lon: -3.70379 }
const WORK = { lat: 40.45306, lon: -3.68835 }

test('moved once, a few hundred metres, and kept: the same centre again from that place, a little off, never a new one', () => {
  const first = pointFor(HOME)
  const km = kmBetween(spotOf(first), HOME)
  // Rounded to 3 decimals, about 100 m, after the move.
  expect(km).toBeGreaterThan(MOVED.least - 0.1)
  expect(km).toBeLessThan(MOVED.most + 0.1)
  expect(km, 'the real spot inside even a 1 km circle').toBeLessThan(1)
  expect(first.lat).toMatch(/^-?\d+\.\d{3}$/)
  expect(device.points()).toEqual([first])
  for (const noise of [0.0003, -0.0008, 0.0015]) expect(pointFor({ lat: HOME.lat + noise, lon: HOME.lon - noise })).toEqual(first)
  expect(device.points(), 'nothing new kept').toEqual([first])
})

test('another place, another centre; back home, the first again', () => {
  const home = pointFor(HOME)
  const work = pointFor(WORK)
  expect(work).not.toEqual(home)
  expect(kmBetween(spotOf(work), WORK)).toBeLessThan(SAME_PLACE_KM)
  expect(pointFor(HOME)).toEqual(home)
  expect(device.points()).toEqual([home, work])
})

test('every direction and distance in the ring, as random gives them', () => {
  for (const [a, b] of [[0, 0], [1, 0.25], [0.5, 0.5], [0.999, 0.999]] as const) {
    device.forget()
    const rolls = [a, b]
    const km = kmBetween(spotOf(pointFor(HOME, () => rolls.shift()!)), HOME)
    expect(km).toBeGreaterThan(MOVED.least - 0.1)
    expect(km).toBeLessThan(MOVED.most + 0.1)
  }
})

test('an exact spot: the pin itself, to about a metre, keeping nothing', () => {
  expect(exactPoint(HOME)).toEqual({ lat: '40.41678', lon: '-3.70379' })
  expect(exactPoint({ lat: -0.000001, lon: 180.5 })).toEqual({ lat: '0.00000', lon: '-179.50000' })
  expect(device.points()).toEqual([])
})

test("an area's radii: from 1 km up to 50, with the field's own", () => {
  expect(RADII[0]).toBe(1)
  expect(RADII.at(-1)).toBe(50)
  expect(radiusSteps(5)).toEqual(RADII)
  expect(radiusSteps(4)).toEqual([1, 2, 3, 4, 5, 10, 15, 20, 30, 50])
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
