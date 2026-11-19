// A place (the pieces page's place): a circle, its centre and its radius, and no name. Opened in the
// form, a search for a place by its name (places, services/places.ts), the map with the circle fixed
// in its middle, which the person moves under it (PlaceMap.tsx, loaded with it alone), the device's
// own spot a tap away, and a slider for the circle's size: all the way left an exact spot, then 1 km
// up to 100 km, starting where the market starts the field for the role. Under them, the place in
// words, by the name places gives its middle, Within 10 km of Chamberí, Madrid, shown and never
// stored; an exact spot says anyone can see it. The device's location is asked for as the input
// opens, where the browser hasn't been told no: a circle drops round it, so nothing needs typing; an
// exact spot is never set from the location alone, since it would be the door the person posts from,
// so the map goes there and waits to be moved to the spot. The circle set here is posted with its
// centre moved by up to a tenth of its radius (near.ts); one an edit keeps stays where it was posted.
// A field that takes several: its places in a list, each picked to move it or removed, then Add
// another area.

import { Suspense, lazy, useEffect, useRef, useState } from 'react'

import { config } from '../config.ts'
import { useCaptions } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import type { Asked, PlaceValue } from '../markets.ts'
import { type Spot, placeAt, spotOf } from '../near.ts'
import { type Found, captionFor, find, nearest } from '../services/places.ts'
import { isPlace, placeText } from '../show.ts'

const PlaceMap = lazy(() => import('./PlaceMap.tsx'))

/** What the place input says. */
export const PLACE_SAYS = {
  search: 'Search a place',
  size: 'Size',
  exact: 'Exact spot',
  seen: 'Anyone can see this exact spot.',
  toSpot: 'Move the map to the spot.',
  another: 'Add another area',
  move: 'Move the map, or search a place.',
  noMap: "The map isn't available right now.",
}

/** What the person is told when the location can't be had: they said no, or it isn't there now. */
export const NO_LOCATION = { refused: "Your location isn't allowed.", unavailable: "Your location isn't available right now." }

/** How long the search waits after the last key, in milliseconds. */
const TYPED_MS = 250

/** The sizes the slider stops at, in kilometres: 0, an exact spot, then 1 to 100, closer together where a few kilometres matter, so a finger can pick 1 km as easily as 100. */
export const SIZES = [0, 1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 75, 100]

/** The slider's stops: its sizes, with the field's own and the places' own where they are not among them. */
export const sizesFor = (...more: number[]) => [...new Set([...SIZES, ...more])].sort((a, b) => a - b)

/** A size as the slider says it: Exact spot, 10 km. */
export const sizeWords = (km: number) => (km === 0 ? PLACE_SAYS.exact : `${km} km`)

export function PlaceField({ field, value, onChange }: { field: Asked; value: unknown; onChange: (v: unknown) => void }) {
  const several = field.several === true
  const [list, setList] = useState<PlaceValue[]>(() => (several ? (Array.isArray(value) ? value : []) : [value]).filter(isPlace))
  // Which of them the map moves: one of the list, or a new one, not there until the map is moved.
  const [at, setAt] = useState(0)
  const start = field.start?.radiusKm ?? 5
  const [radius, setRadius] = useState(list[at]?.radiusKm ?? start)
  const [goTo, setGoTo] = useState<{ spot: Spot; radiusKm: number; sets?: false } | null>(null)
  // Where the device said it is, when it is not yet the place: an exact spot waits to be moved.
  const [located, setLocated] = useState<Spot | null>(null)
  const [noMap, setNoMap] = useState(false)
  const captions = useCaptions(list)
  const current = list[at]

  const set = (next: PlaceValue[]) => {
    setList(next)
    onChange(several ? (next.length ? next : undefined) : next[0])
  }
  /** The place the map moves, put at `spot` with `radiusKm`: in its place in the list, or added. */
  const put = (spot: Spot, radiusKm: number) => {
    const place = placeAt(spot, radiusKm)
    set(at < list.length ? list.map((p, i) => (i === at ? place : p)) : [...list, place])
  }

  // The location, asked for as the input opens where there is no place yet: a circle round it; for an
  // exact spot, the map there, waiting to be moved to the spot.
  const radiusNow = useRef(radius)
  radiusNow.current = radius
  // Whether the place the map moves came from the device's location alone, never moved or searched for.
  const fromDevice = useRef(false)
  const sentBy = useRef<'location' | 'search' | null>(null)
  const locator = useLocate((spot) => {
    const exact = radiusNow.current === 0
    sentBy.current = 'location'
    setLocated(exact ? spot : null)
    setGoTo({ spot, radiusKm: radiusNow.current, ...(exact && { sets: false as const }) })
  })
  useEffect(() => {
    if (!list.length) locator.unlessRefused()
  }, [])

  /**
   * The circle's size, from the slider: the place there now, or where the device said it is, at that
   * size. An exact spot never from the location alone: the place goes, and the map waits there.
   */
  const size = (r: number) => {
    setRadius(r)
    if (current && r === 0 && fromDevice.current) {
      set(list.filter((_, i) => i !== at))
      setLocated(spotOf(current))
    } else if (current) put(spotOf(current), r)
    else if (located && r > 0) (put(located, r), setLocated(null))
  }
  const sizes = sizesFor(start, ...list.map((p) => p.radiusKm))
  const [opensAt] = useState<Spot | null>(() => (current ? spotOf(current) : null))
  return (
    <div className="place-input" role="group" aria-label={field.label}>
      {several && (list.length > 1 || (list.length > 0 && at >= list.length)) && (
        <div className="rows place-list">
          {list.map((p, i) => (
            <div key={i} className={i === at ? 'place-row here' : 'place-row'}>
              <button type="button" className="row-button" aria-pressed={i === at} onClick={() => ((sentBy.current = null), setAt(i), setRadius(p.radiusKm), setGoTo({ spot: spotOf(p), radiusKm: p.radiusKm }))}>
                <Icon name="map-pin" />
                <span>{placeText(p, captions(p))}</span>
              </button>
              <button
                type="button"
                className="round"
                aria-label={`Remove ${placeText(p, captions(p))}`}
                onClick={() => {
                  const next = list.filter((_, j) => j !== i)
                  set(next)
                  setAt(Math.min(at > i ? at - 1 : at, next.length))
                }}
              >
                <Icon name="x" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="map-box">
        {noMap ? (
          <p className="line">{PLACE_SAYS.noMap}</p>
        ) : (
          <Suspense fallback={null}>
            <PlaceMap
              opensAt={opensAt}
              radiusKm={radius}
              goTo={goTo}
              onMiddle={(spot, byPerson) => {
                // Waiting for an exact spot: only the person's move, or a place searched for, sets it.
                if (located && !byPerson && sentBy.current !== 'search') return
                fromDevice.current = !byPerson && sentBy.current === 'location'
                setLocated(null)
                put(spot, radius)
              }}
              onFail={() => setNoMap(true)}
            />
          </Suspense>
        )}
        <Search near={current ? spotOf(current) : null} onPick={(f) => ((sentBy.current = 'search'), setGoTo({ spot: { lat: f.lat, lon: f.lon }, radiusKm: radius }))} />
        {!noMap && locator.can && (
          <button type="button" className="locate" aria-label="Your location" disabled={locator.asking} onClick={locator.locate}>
            {locator.asking ? <Loader /> : <Icon name="crosshair" />}
          </button>
        )}
      </div>
      {locator.failed && <p className="line">{NO_LOCATION[locator.failed]}</p>}
      <div className="size">
        <span aria-hidden>{PLACE_SAYS.exact}</span>
        <input
          type="range"
          aria-label={PLACE_SAYS.size}
          aria-valuetext={sizeWords(radius)}
          min={0}
          max={sizes.length - 1}
          step={1}
          value={Math.max(0, sizes.indexOf(radius))}
          onChange={(e) => size(sizes[Number(e.target.value)]!)}
        />
        <span aria-hidden>{sizeWords(sizes.at(-1)!)}</span>
      </div>
      <Caption place={current} radiusKm={radius} waiting={located !== null} />
      {several && current && (
        <button type="button" className="quiet add" onClick={() => ((fromDevice.current = false), setAt(list.length))}>
          <Icon name="plus" /> {PLACE_SAYS.another}
        </button>
      )}
    </div>
  )
}

/** Under the map: the place in words, by places' caption for its middle, or what to do while there is none. */
function Caption({ place, radiusKm, waiting }: { place: PlaceValue | undefined; radiusKm: number; waiting: boolean }) {
  const [caption, setCaption] = useState<string | undefined>()
  useEffect(() => {
    setCaption(undefined)
    if (!place) return
    let live = true
    void nearest(config.places, Number(place.lat), Number(place.lon)).then((found) => live && setCaption(captionFor(found, place.radiusKm)))
    return () => void (live = false)
  }, [place?.lat, place?.lon, place?.radiusKm])
  if (!place) return <p className="hint">{waiting || radiusKm === 0 ? PLACE_SAYS.toSpot : PLACE_SAYS.move}</p>
  return (
    <>
      <p className="place-caption">{placeText(place, caption)}</p>
      {radiusKm === 0 && <p className="hint">{PLACE_SAYS.seen}</p>}
    </>
  )
}

/** The search for a place by name: the places it finds, near the place where there is one; one picked sends the map there. */
function Search({ near, onPick }: { near: Spot | null; onPick: (f: Found) => void }) {
  const [words, setWords] = useState('')
  const [found, setFound] = useState<Found[]>([])
  const asked = useRef(0)
  // The words of a place just picked, which its name fills the box with: nothing to search for.
  const picked = useRef<string | null>(null)
  useEffect(() => {
    const n = ++asked.current
    if (!words.trim() || words === picked.current) return setFound([])
    const t = setTimeout(() => void find(config.places, words, near ?? undefined).then((f) => n === asked.current && setFound(f)), TYPED_MS)
    return () => clearTimeout(t)
  }, [words])
  return (
    <div className="place-search">
      <input type="search" aria-label={PLACE_SAYS.search} placeholder={PLACE_SAYS.search} autoComplete="off" value={words} onChange={(e) => setWords(e.target.value)} />
      {found.length > 0 && (
        <div className="rows found" role="listbox" aria-label="Places found">
          {found.map((f, i) => (
            <button
              key={i}
              type="button"
              role="option"
              aria-selected={false}
              className="row two"
              onClick={() => {
                asked.current++
                picked.current = f.name
                setWords(f.name)
                setFound([])
                onPick(f)
              }}
            >
              <strong>{f.name}</strong>
              <span>{f.context}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** The device's spot: whether it can be had, whether it is being, what went wrong; asked for as the input opens, or by the map's button. */
function useLocate(onSpot: (spot: Spot) => void) {
  const [allowed, setAllowed] = useState<PermissionState | null>(null)
  const [asking, setAsking] = useState(false)
  const [failed, setFailed] = useState<keyof typeof NO_LOCATION | null>(null)
  const live = useRef(true)
  useEffect(() => {
    live.current = true
    return () => void (live.current = false)
  }, [])
  const locate = () => {
    if (!navigator.geolocation) return setFailed('unavailable')
    setAsking(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        if (!live.current) return
        setAsking(false)
        setFailed(null)
        onSpot({ lat: p.coords.latitude, lon: p.coords.longitude })
      },
      (err) => {
        if (!live.current) return
        setAsking(false)
        const refused = err.code === err.PERMISSION_DENIED
        setFailed(refused ? 'refused' : 'unavailable')
        if (refused) setAllowed('denied')
      },
      { maximumAge: 600_000, timeout: 20_000 },
    )
  }
  /** The location asked for at once, the browser's own prompt where it asks, unless the browser was told no before. */
  const unlessRefused = () => {
    if (!navigator.permissions) return locate()
    navigator.permissions.query({ name: 'geolocation' }).then(
      (s) => {
        if (!live.current) return
        setAllowed(s.state)
        if (s.state !== 'denied') locate()
      },
      () => locate(),
    )
  }
  return { can: !!navigator.geolocation && allowed !== 'denied', asking, failed, locate, unlessRefused }
}
