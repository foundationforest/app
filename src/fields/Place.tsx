// A place (the pieces page's place): a circle, its centre and its radius, and no name. Opened in the
// form, a search for a place by its name (places, services/places.ts), the map with the circle fixed
// in its middle, which the person moves under it (PlaceMap.tsx, loaded with it alone), the device's
// own spot a tap away, and How far: an exact spot, then 1 to 50 km. Under them, the caption places
// gives the circle's middle, Around Chamberí, Madrid, shown and never stored, else nothing; an exact
// spot says anyone can see it. The circle set here is posted with its centre moved by up to a tenth
// of its radius (near.ts); one an edit keeps stays where it was posted. The map opens on the place,
// else on the device's spot where the browser allows it already, else on the whole world. A field
// that takes several: its places in a list, each picked to move it or removed, then Add another area.

import { Suspense, lazy, useEffect, useRef, useState } from 'react'

import { config } from '../config.ts'
import { useCaptions } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import type { Asked, PlaceValue } from '../markets.ts'
import { RADII, type Spot, placeAt, spotOf } from '../near.ts'
import { type Found, captionFor, find, nearest } from '../services/places.ts'
import { isPlace, placeText } from '../show.ts'

const PlaceMap = lazy(() => import('./PlaceMap.tsx'))

/** What the place input says. */
export const PLACE_SAYS = {
  search: 'Search a place',
  far: 'How far',
  exact: 'Anyone can see this exact spot.',
  another: 'Add another area',
  move: 'Move the map to where you mean.',
  noMap: "The map isn't available right now.",
}

/** What the person is told when the location can't be had: they said no, or it isn't there now. */
export const NO_LOCATION = { refused: "Your location isn't allowed.", unavailable: "Your location isn't available right now." }

/** How long the search waits after the last key, in milliseconds. */
const TYPED_MS = 250

/** The radius chips: an exact spot, then each radius, with the field's own and the place's own where they are not among them. */
export const radiiFor = (...more: number[]) => [...new Set([0, ...RADII, ...more])].sort((a, b) => a - b)

export function PlaceField({ field, value, onChange }: { field: Asked; value: unknown; onChange: (v: unknown) => void }) {
  const several = field.several === true
  const [list, setList] = useState<PlaceValue[]>(() => (several ? (Array.isArray(value) ? value : []) : [value]).filter(isPlace))
  // Which of them the map moves: one of the list, or a new one, not there until the map is moved.
  const [at, setAt] = useState(0)
  const start = field.start?.radiusKm ?? 5
  const [radius, setRadius] = useState(list[at]?.radiusKm ?? start)
  const [goTo, setGoTo] = useState<{ spot: Spot; radiusKm: number } | null>(null)
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

  // Where the browser allows the location already and there is no place yet, the map goes there at once.
  const locator = useLocate((spot) => setGoTo({ spot, radiusKm: radius }))
  useEffect(() => {
    if (!list.length) locator.ifAllowed()
  }, [])

  const radii = radiiFor(start, ...list.map((p) => p.radiusKm))
  const [opensAt] = useState<Spot | null>(() => (current ? spotOf(current) : null))
  return (
    <div className="place-input" role="group" aria-label={field.label}>
      {several && (list.length > 1 || (list.length > 0 && at >= list.length)) && (
        <div className="rows place-list">
          {list.map((p, i) => (
            <div key={i} className={i === at ? 'place-row here' : 'place-row'}>
              <button type="button" className="row-button" aria-pressed={i === at} onClick={() => (setAt(i), setRadius(p.radiusKm), setGoTo({ spot: spotOf(p), radiusKm: p.radiusKm }))}>
                <Icon name="map-pin" />
                <span>{placeText(p, captions(p))}</span>
                {p.radiusKm > 0 && captions(p) && <span className="aside">{p.radiusKm} km</span>}
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
      <Search near={current ? spotOf(current) : null} onPick={(f) => setGoTo({ spot: { lat: f.lat, lon: f.lon }, radiusKm: radius })} />
      <div className="map-box">
        {noMap ? (
          <p className="line">{PLACE_SAYS.noMap}</p>
        ) : (
          <Suspense fallback={null}>
            <PlaceMap opensAt={opensAt} radiusKm={radius} goTo={goTo} onMiddle={(spot) => put(spot, radius)} onFail={() => setNoMap(true)} />
          </Suspense>
        )}
        {!noMap && locator.can && (
          <button type="button" className="locate" aria-label="Your location" disabled={locator.asking} onClick={locator.locate}>
            {locator.asking ? <Loader /> : <Icon name="crosshair" />}
          </button>
        )}
      </div>
      {locator.failed && <p className="line">{NO_LOCATION[locator.failed]}</p>}
      <div className="chips" role="radiogroup" aria-label={PLACE_SAYS.far}>
        <span className="chips-label">{PLACE_SAYS.far}</span>
        {radii.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={r === radius}
            className={r === radius ? 'chip here' : 'chip'}
            onClick={() => {
              setRadius(r)
              if (current) put(spotOf(current), r)
            }}
          >
            {r === 0 ? 'Exact spot' : `${r} km`}
          </button>
        ))}
      </div>
      <Caption place={current} radiusKm={radius} />
      {several && current && (
        <button type="button" className="quiet add" onClick={() => setAt(list.length)}>
          <Icon name="plus" /> {PLACE_SAYS.another}
        </button>
      )}
    </div>
  )
}

/** Under the map: the place in words, by places' caption for its middle, or what to do while there is none. */
function Caption({ place, radiusKm }: { place: PlaceValue | undefined; radiusKm: number }) {
  const [caption, setCaption] = useState<string | undefined>()
  useEffect(() => {
    setCaption(undefined)
    if (!place) return
    let live = true
    void nearest(config.places, Number(place.lat), Number(place.lon)).then((found) => live && setCaption(captionFor(found, place.radiusKm)))
    return () => void (live = false)
  }, [place?.lat, place?.lon, place?.radiusKm])
  if (!place) return <p className="hint">{PLACE_SAYS.move}</p>
  return (
    <>
      <p className="place-caption">{placeText(place, caption)}</p>
      {radiusKm === 0 && <p className="hint">{PLACE_SAYS.exact}</p>}
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

/** The device's spot, asked only when wanted: whether it can be, whether it is being, what went wrong, and a read at once where the browser allows it already. */
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
  const ifAllowed = () => {
    if (!navigator.permissions) return setAllowed('prompt')
    navigator.permissions.query({ name: 'geolocation' }).then(
      (s) => {
        if (!live.current) return
        setAllowed(s.state)
        if (s.state === 'granted') locate()
      },
      () => setAllowed('prompt'),
    )
  }
  return { can: !!navigator.geolocation && allowed !== 'denied', asking, failed, locate, ifAllowed }
}
