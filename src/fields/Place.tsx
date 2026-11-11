// A place (the markets manual's Types, `place`): an area or an exact spot, set on a screen of its
// own with a map (PlaceMap.tsx, loaded with that screen alone). In the form it is one row, with its
// pin: the place in its words, its name and how far round it reaches (show.ts), else Choose on the
// map. Tapped, the place screen opens over the form,
// which keeps all it holds; its back, and the phone's, closes it keeping nothing, and Done keeps
// the place. An area is a circle the person taps or drags into place, from the field's radiusKm up
// to 50 km: its centre is pointFor's (near.ts), moved once and kept, which the circle glides to, so
// it is drawn where it will be posted; an edit keeps its listing's centre until the circle moves. An
// exact spot is a pin, none until one is dropped, exactly where it is (radius 0, as the markets
// hold it), and one quiet line says anyone can see it. The location only centres the map: for a
// new place, read at once where the browser allows it already; else asked by the map's own button,
// which a browser that said no hides. The map opens on the listing's place, else on the person,
// else on the last centre this device kept, else on the whole world; an area starts round where it
// opens, with nothing to go on where it is first tapped, and round the person when the location
// comes and there is no circle yet.

import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { points } from '../device.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import type { Field } from '../markets.ts'
import { type Point, type Spot, exactPoint, pointFor, radiusSteps, spotOf } from '../near.ts'
import { placeLines } from '../show.ts'
import { Top } from '../ui.tsx'
import { useOver } from './Over.tsx'
import type { Mode } from './PlaceMap.tsx'

const PlaceMap = lazy(() => import('./PlaceMap.tsx'))

/** A place as it is held, when it is one: a point and a whole radius, and its name. */
const placeIn = (v: unknown) => {
  const o = v as { lat?: unknown; lon?: unknown; radiusKm?: unknown; area?: unknown } | null
  return o && typeof o.lat === 'string' && typeof o.lon === 'string' && Number.isInteger(o.radiusKm) ? { lat: o.lat, lon: o.lon, radiusKm: o.radiusKm as number, area: typeof o.area === 'string' ? o.area : '' } : null
}
type Held = NonNullable<ReturnType<typeof placeIn>>

/** What the place's row and screen say. */
export const PLACE_SAYS = {
  choose: 'Choose on the map',
  exact: 'Anyone can see this exact spot.',
  noMap: "The map isn't available right now.",
}

/** What the person is told when the location can't be had: they said no, or it isn't there now. */
export const NO_LOCATION = { refused: "Your location isn't allowed.", unavailable: "Your location isn't available right now." }

export function Place({ label, field, value, onChange }: { label: string; field: Pick<Field, 'radiusKm'>; value: unknown; onChange: (v: unknown) => void }) {
  const was = placeIn(value)
  const row = useRef<HTMLButtonElement>(null)
  // The place screen is a step in the page's history, so the phone's back closes it.
  const { open, show, close } = useOver(row)
  const lines = was ? placeLines(was) : null

  return (
    <div className="place" role="group" aria-label={label}>
      <button ref={row} type="button" className="open-row" onClick={show}>
        <Icon name="map-pin" />
        <span className="two">
          <strong className={lines ? undefined : 'muted'}>{lines?.main ?? PLACE_SAYS.choose}</strong>
          {lines?.more && <span>{lines.more}</span>}
        </span>
        <Icon name="caret-right" className="car" />
      </button>
      {open &&
        createPortal(
          <PlaceScreen
            label={label}
            start={Math.max(1, field.radiusKm ?? 5)}
            was={was}
            onDone={(place) => {
              onChange(place)
              close()
            }}
            onBack={close}
          />,
          document.body,
        )}
    </div>
  )
}

/** The place screen: the kind of place, the map, the area's radius or the exact spot's line, the name, and Done. */
function PlaceScreen({ label, start, was, onDone, onBack }: { label: string; start: number; was: Held | null; onDone: (place: unknown) => void; onBack: () => void }) {
  const area = was && was.radiusKm > 0 ? was : null
  const exact = was?.radiusKm === 0 ? was : null
  const [steps] = useState(() => [...new Set([...radiusSteps(start), ...(area ? [area.radiusKm] : [])])].sort((a, b) => a - b))
  const [mode, setMode] = useState<Mode>(exact ? 'spot' : 'area')
  const [centre, setCentre] = useState<Point | null>(area && { lat: area.lat, lon: area.lon })
  const [pin, setPin] = useState<Point | null>(exact && { lat: exact.lat, lon: exact.lon })
  const [radius, setRadius] = useState(area?.radiusKm ?? start)
  const [name, setName] = useState(was?.area ?? '')
  const [here, setHere] = useState<Spot | null>(null)
  const [last] = useState(() => points().at(-1) ?? null)
  // Whether the browser allows the location: null until it says; a browser that can't say counts as never asked.
  const [allowed, setAllowed] = useState<PermissionState | null>(navigator.permissions ? null : 'prompt')
  const [asking, setAsking] = useState(false)
  const [failed, setFailed] = useState<keyof typeof NO_LOCATION | null>(null)
  const [noMap, setNoMap] = useState(false)
  const self = useRef<HTMLDivElement>(null)
  const live = useRef(true)
  const circled = useRef(centre !== null)
  circled.current = centre !== null

  // Over the form, which nothing reaches meanwhile; this screen takes the focus.
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.inert = true
    self.current?.focus()
    return () => {
      live.current = false
      if (root) root.inert = false
    }
  }, [])

  const locate = () => {
    if (!navigator.geolocation) return setFailed('unavailable')
    setAsking(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        if (!live.current) return
        setAsking(false)
        setFailed(null)
        const spot = { lat: p.coords.latitude, lon: p.coords.longitude }
        setHere(spot)
        if (!circled.current) setCentre(pointFor(spot))
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

  // With no place yet and the location allowed already, it is read at once, with no button; else the
  // area starts on the last centre kept, if it has none.
  useEffect(() => {
    let live = true
    const said = (state: PermissionState) => {
      if (!live) return
      setAllowed(state)
      if (state === 'granted' && !was) locate()
      else if (!circled.current && last) setCentre(last)
    }
    if (!navigator.permissions) said('prompt')
    else navigator.permissions.query({ name: 'geolocation' }).then((s) => said(s.state), () => said('prompt'))
    return () => void (live = false)
  }, [])

  const centreSpot = useMemo(() => centre && spotOf(centre), [centre])
  const pinSpot = useMemo(() => pin && spotOf(pin), [pin])
  const [opensAt] = useState(() => last && spotOf(last))
  const point = mode === 'area' ? centre : pin
  const done = () => {
    const named = name.trim()
    if (point) onDone({ lat: point.lat, lon: point.lon, radiusKm: mode === 'area' ? radius : 0, ...(named && { area: named }) })
  }
  const kinds: Array<[Mode, string]> = [
    ['area', 'Area'],
    ['spot', 'Exact spot'],
  ]
  return (
    <div className="placing" role="dialog" aria-modal="true" aria-label={label} ref={self} tabIndex={-1}>
      <div className="placing-screen">
        <Top onBack={onBack}>
          <h1>{label}</h1>
        </Top>
        <div className="chips" role="group" aria-label="Kind of place">
          {kinds.map(([kind, words]) => (
            <button key={kind} type="button" className={mode === kind ? 'chip here' : 'chip'} aria-pressed={mode === kind} onClick={() => setMode(kind)}>
              {words}
            </button>
          ))}
        </div>
        <div className="map-box">
          {noMap ? (
            <p className="line">{PLACE_SAYS.noMap}</p>
          ) : (
            allowed !== null && (
              <Suspense fallback={null}>
                <PlaceMap
                  mode={mode}
                  centre={centreSpot}
                  radiusKm={radius}
                  pin={pinSpot}
                  opensAt={opensAt}
                  here={here}
                  onArea={(spot) => setCentre(pointFor(spot))}
                  onPin={(spot) => setPin(exactPoint(spot))}
                  onFail={() => setNoMap(true)}
                />
              </Suspense>
            )
          )}
          {!noMap && allowed !== null && allowed !== 'denied' && navigator.geolocation && (
            <button type="button" className="locate" aria-label="Your location" disabled={asking} onClick={locate}>
              {asking ? <Loader /> : <Icon name="crosshair" />}
            </button>
          )}
        </div>
        {failed && <p className="line">{NO_LOCATION[failed]}</p>}
        <div className="place-detail">
          <label className={mode === 'area' ? 'within' : 'within gone'}>
            Within {radius} km
            <input type="range" aria-label="Within" aria-valuetext={`${radius} km`} min={0} max={steps.length - 1} step={1} value={steps.indexOf(radius)} onChange={(e) => setRadius(steps[Number(e.target.value)]!)} />
          </label>
          <p className={mode === 'spot' ? 'hint' : 'hint gone'}>{PLACE_SAYS.exact}</p>
        </div>
        <input aria-label="Place name" placeholder="Place name" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" className="primary" disabled={!point} onClick={done}>
          Done
        </button>
      </div>
    </div>
  )
}
