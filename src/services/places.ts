// Places (services' places/README.md, Its API): words to towns, city sections and colonias, for the
// place screen's search, and a point to the places nearest it, for the caption under a place. Plain
// GETs, open to any origin, needing nothing unlocked; what is asked is a few words or a point, rounded
// by places itself to about a kilometre. Only ever a help: a listing's place is three numbers and no
// name, so a place reads by its size wherever places can't answer, and nothing it says is stored.
// Each point's caption is asked once a page, at the two decimals places rounds it to.

import type { PlaceValue } from '../markets.ts'

/** A place places found: the name that matched, the line saying where it is, the name that stands alone, its point and size, its country, and the place as a listing holds it. */
export type Found = { name: string; context: string; caption: string; lat: number; lon: number; radiusKm: number; country: string; place: PlaceValue }

const isFound = (v: unknown): v is Found => {
  const f = v as Found | null
  return !!f && typeof f.name === 'string' && typeof f.caption === 'string' && typeof f.context === 'string' && Number.isFinite(f.lat) && Number.isFinite(f.lon) && Number.isInteger(f.radiusKm)
}

/** The places an answer holds, or none for any answer that isn't one. */
async function placesAt(url: string): Promise<Found[]> {
  try {
    const res = await fetch(url, { redirect: 'error' })
    if (!res.ok) return []
    const body = (await res.json()) as { places?: unknown }
    return Array.isArray(body.places) ? body.places.filter(isFound) : []
  } catch {
    return []
  }
}

/** A point as places takes it: `<lat>,<lon>`, to two decimals, as places rounds it anyway. */
const near = (lat: number, lon: number) => `${lat.toFixed(2)},${lon.toFixed(2)}`

/** The places `words` find, best first, those near `point` first; none for fewer than two letters. */
export function find(origin: string, words: string, point?: { lat: number; lon: number }): Promise<Found[]> {
  const q = words.trim()
  if ([...q].filter((c) => /\p{L}/u.test(c)).length < 2) return Promise.resolve([])
  return placesAt(`${origin}/v1/find?q=${encodeURIComponent(q.slice(0, 100))}${point ? `&near=${near(point.lat, point.lon)}` : ''}`)
}

/**
 * The caption for a circle: the nearest place to its centre that is not much smaller than it, by
 * places' sizes (a tenth of a district for a 10 km circle would read as a street), else the nearest.
 */
export function captionFor(places: Found[], radiusKm: number): string | undefined {
  return (places.find((p) => p.radiusKm * 5 >= radiusKm) ?? places[0])?.caption
}

const asked = new Map<string, Promise<Found[]>>()

/** The places nearest a point, asked once a page for each point at places' two decimals. */
export function nearest(origin: string, lat: number, lon: number): Promise<Found[]> {
  const key = `${origin} ${near(lat, lon)}`
  let got = asked.get(key)
  if (!got) {
    got = placesAt(`${origin}/v1/name?near=${near(lat, lon)}`)
    asked.set(key, got)
    // An answer of none may be places down for a moment: asked again next time.
    void got.then((list) => {
      if (!list.length) asked.delete(key)
    })
  }
  return got
}

/** A place's caption, by places, or undefined when places can't say. */
export async function captionOf(origin: string, place: PlaceValue): Promise<string | undefined> {
  return captionFor(await nearest(origin, Number(place.lat), Number(place.lon)), place.radiusKm)
}
