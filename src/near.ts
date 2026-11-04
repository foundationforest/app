// Where a post's place is centred (the markets manual's Types, place): near the person, never on
// them. The first time the device posts from somewhere, the app moves its spot once, about 0.2 to
// 0.6 km in a random direction, and keeps that point on the device (device.ts); a post from within
// 0.8 km of a kept point is centred on it again. So posts from one place share one centre and never
// average out to the person's home, and their real spot stays inside even a 1 km circle. Radius 0,
// an exact spot, is where the device is: with no map, the one spot a person can mean. And the radii a
// place's slider offers.

import { type Point, keepPoint, points } from './device.ts'

export type { Point }

/** Where the device is, in degrees. */
export type Spot = { lat: number; lon: number }

/** How far a new centre is moved from the device's spot, in kilometres. */
export const MOVED = { least: 0.2, most: 0.6 }

/** A post from within this many kilometres of a kept centre is centred on it again. */
export const SAME_PLACE_KM = 0.8

/** The radii a place's slider offers, in kilometres: 0, that exact spot, then up to 50. */
export const RADII = [0, 1, 2, 3, 5, 10, 15, 20, 30, 50]

const EARTH_KM = 6371
const rad = (deg: number) => (deg * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** The distance between two spots, in kilometres. */
export function kmBetween(a: Spot, b: Spot): number {
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** A point as a spot. */
export const spotOf = (p: Point): Spot => ({ lat: Number(p.lat), lon: Number(p.lon) })

/** A spot as a place holds it, to `places` decimals: lat and lon as decimal text, never "-0". */
export function pointOf(spot: Spot, places: number): Point {
  const lat = Math.max(-90, Math.min(90, spot.lat))
  const lon = ((((spot.lon + 180) % 360) + 360) % 360) - 180
  const text = (n: number) => {
    const t = n.toFixed(places)
    return /^-0(\.0+)?$/.test(t) ? t.slice(1) : t
  }
  return { lat: text(lat), lon: text(lon) }
}

/** `spot` moved `km` kilometres toward `bearing`, in radians from north. */
function moved(spot: Spot, km: number, bearing: number): Spot {
  const d = km / EARTH_KM
  return { lat: spot.lat + deg(d * Math.cos(bearing)), lon: spot.lon + deg((d * Math.sin(bearing)) / Math.max(Math.cos(rad(spot.lat)), 0.01)) }
}

/**
 * The centre of a post's place, for the device at `spot`: the point kept near it, else a new one,
 * moved once and kept. To 3 decimals, about 100 m, since it is rough anyway.
 */
export function pointFor(spot: Spot, random: () => number = Math.random): Point {
  const kept = points().find((p) => kmBetween(spotOf(p), spot) <= SAME_PLACE_KM)
  if (kept) return kept
  // Evenly over the ring's area, in any direction.
  const km = Math.sqrt(MOVED.least ** 2 + random() * (MOVED.most ** 2 - MOVED.least ** 2))
  const point = pointOf(moved(spot, km, random() * 2 * Math.PI), 3)
  keepPoint(point)
  return point
}

/** The device's spot itself, for radius 0: to 5 decimals, about a metre. */
export const exactPoint = (spot: Spot): Point => pointOf(spot, 5)

/** The radii a place's slider offers, with the one its field starts at. */
export const radiusSteps = (start: number): number[] => [...new Set([...RADII, start])].sort((a, b) => a - b)
