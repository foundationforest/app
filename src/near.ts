// Where a listing's place is centred (the pieces page's place). An area: a circle the person puts
// where they mean, which is often round their door, so the centre is moved before it is posted, by up
// to a tenth of the radius, the same way each time for that profile and radius: the direction and
// how far, worked out from the seed with HKDF, so no one but the person can undo it, and nothing is
// kept on the device. Listings from one spot at one radius share one centre, so they never average
// back to it; the spot stays well inside even a 1 km circle. Only a place set on the map in this form
// is moved: one an edit keeps, or an AI wrote, is posted as it is. An exact spot, radius 0, a public
// place, is exactly where the person put it. And the radii the place screen offers, and the ring the
// map draws for a circle.

import { hkdf } from '@foundationforest/keys'

import type { PlaceValue } from '@foundationforest/markets/browser'

/** A point in degrees, as decimal text, as a place holds it. */
export type Point = { lat: string; lon: string }

/** Where something is, in degrees. */
export type Spot = { lat: number; lon: number }

/** The most a centre is moved, as a part of its radius. */
export const MOVED = 0.1

/** The radii the place screen offers, in kilometres: 0 is an exact spot. */
export const RADII = [1, 2, 5, 10, 20, 50]

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
    const t = n.toFixed(places).replace(/\.?0+$/, '')
    return /^-0$/.test(t) ? '0' : t
  }
  return { lat: text(lat), lon: text(lon) }
}

/** `spot` moved `km` kilometres toward `bearing`, in radians from north. */
export function moved(spot: Spot, km: number, bearing: number): Spot {
  const d = km / EARTH_KM
  return { lat: spot.lat + deg(d * Math.cos(bearing)), lon: spot.lon + deg((d * Math.sin(bearing)) / Math.max(Math.cos(rad(spot.lat)), 0.01)) }
}

/**
 * The text HKDF mixes the seed with for a place's move: the app's own, not one of the standard's
 * (whose all start `forest/`), the radius before the label, so no label spells another radius's.
 */
export const PLACE_TEXT = (radiusKm: number, label: string) => `forest-app/place/${radiusKm}/${label}`

/** How a profile's circles of `radiusKm` are moved: a direction, in radians from north, and how far, in kilometres, up to a tenth of the radius, evenly over that small disc. */
export async function moveOf(seed: Uint8Array, label: string, radiusKm: number): Promise<{ bearing: number; km: number }> {
  const bytes = await hkdf(seed, PLACE_TEXT(radiusKm, label), 8)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const [a, b] = [view.getUint32(0) / 2 ** 32, view.getUint32(4) / 2 ** 32]
  return { bearing: a * 2 * Math.PI, km: radiusKm * MOVED * Math.sqrt(b) }
}

/** A circle as it is posted: its centre moved as the profile moves circles of its radius, to 4 decimals, about 10 m. An exact spot, as it is. */
export async function postedAt(seed: Uint8Array, label: string, place: PlaceValue): Promise<PlaceValue> {
  if (place.radiusKm === 0) return place
  const { bearing, km } = await moveOf(seed, label, place.radiusKm)
  return { ...pointOf(moved(spotOf(place), km, bearing), 4), radiusKm: place.radiusKm }
}

/** The places set on the map in a form open now, which are moved as they are posted: any other, kept by an edit or written by an AI, is posted as it is. */
const set = new WeakSet<object>()

/** A place set on the map, to be moved as it is posted. */
export function setOnMap(place: PlaceValue): PlaceValue {
  set.add(place)
  return place
}

/** Whether a place was set on the map in this page. */
export const wasSet = (place: unknown) => typeof place === 'object' && place !== null && set.has(place)

/**
 * A body as it is posted: each place in `fields` set on the map, a field's one or each of its
 * several, moved (postedAt); the rest as they are.
 */
export async function withPlacesMoved<B extends Record<string, unknown>>(seed: Uint8Array, label: string, fields: Array<{ name: string; piece: string }>, body: B): Promise<B> {
  const out: Record<string, unknown> = { ...body }
  const move = async (v: unknown) => (wasSet(v) ? postedAt(seed, label, v as PlaceValue) : v)
  for (const { name, piece } of fields) {
    if (piece !== 'place' || out[name] === undefined) continue
    const v = out[name]
    out[name] = Array.isArray(v) ? await Promise.all(v.map(move)) : await move(v)
  }
  return out as B
}

/** A spot where the map's middle is, as a place holds it: to 4 decimals, about 10 m. */
export const placeAt = (spot: Spot, radiusKm: number): PlaceValue => setOnMap({ ...pointOf(spot, 4), radiusKm })

/** The edge of the circle `km` round `centre`, as the map draws it: `sides` points, [lon, lat], the first again at the end. */
export function ring(centre: Spot, km: number, sides = 64): Array<[number, number]> {
  const points = Array.from({ length: sides }, (_, i) => moved(centre, km, (i / sides) * 2 * Math.PI))
  return [...points, points[0]!].map((p) => [p.lon, p.lat])
}
