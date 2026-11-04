// A place: a point and a radius, and the area's name if wanted (the markets' types, `place`). The
// point is the device's, moved a little once and kept (near.ts); radius 0, an exact spot, is the
// device's own spot, and only when picked on the slider, which starts at the field's radiusKm. No
// map yet: one line says where, "Within 5 km of you", after the area when there is one. The
// location is asked on a tap, never as the form opens: where the browser allows it already, it is
// read at once; otherwise one button, Use my location, asks. Refused, one quiet line says why the
// listing needs it. An edit keeps its listing's point, and needs the location again only when the
// radius moves to or from 0.

import { useEffect, useState } from 'react'

import type { Field } from '../markets.ts'
import { type Point, type Spot, exactPoint, pointFor, radiusSteps } from '../near.ts'
import { Spinner } from '../ui.tsx'

/** A place's point, and whether it is the device's exact spot, for radius 0. */
type Centre = Point & { exact: boolean }

/** A place as it is held, when it is one: a point and a whole radius. */
const placeIn = (v: unknown) => {
  const o = v as { lat?: unknown; lon?: unknown; radiusKm?: unknown; area?: unknown } | null
  return o && typeof o.lat === 'string' && typeof o.lon === 'string' && Number.isInteger(o.radiusKm) ? { lat: o.lat, lon: o.lon, radiusKm: o.radiusKm as number, area: typeof o.area === 'string' ? o.area : '' } : null
}

/** The one line a place reads in its form: "Within 5 km of you", after the area when there is one. */
export function placeLine(area: string, radiusKm: number): string {
  const where = radiusKm === 0 ? 'right where you are' : `within ${radiusKm} km of you`
  const named = area.trim()
  return named ? `${named}, ${where}` : where.charAt(0).toUpperCase() + where.slice(1)
}

/** What the person is told when the location can't be had: refused, why the listing needs it; else that it isn't there now. */
export const NO_LOCATION = { refused: 'Allow your location so people nearby find this listing.', unavailable: "Your location isn't available right now." }

export function Place({ label, field, value, onChange }: { label: string; field: Pick<Field, 'radiusKm'>; value: unknown; onChange: (v: unknown) => void }) {
  const was = placeIn(value)
  const start = field.radiusKm ?? 5
  const steps = radiusSteps(start).concat(was && !radiusSteps(start).includes(was.radiusKm) ? [was.radiusKm] : []).sort((a, b) => a - b)
  const [radius, setRadius] = useState(was?.radiusKm ?? start)
  const [area, setArea] = useState(was?.area ?? '')
  const [centre, setCentre] = useState<Centre | null>(was ? { lat: was.lat, lon: was.lon, exact: was.radiusKm === 0 } : null)
  const [spot, setSpot] = useState<Spot | null>(null)
  // Whether the browser allows the location: null until it says; a browser that can't say counts as never asked.
  const [allowed, setAllowed] = useState<PermissionState | null>(navigator.permissions ? null : 'prompt')
  const [asking, setAsking] = useState(false)
  const [failed, setFailed] = useState<keyof typeof NO_LOCATION | null>(null)

  // Whether the browser allows the location already: then it is read with no button.
  useEffect(() => {
    let live = true
    navigator.permissions?.query({ name: 'geolocation' }).then(
      (status) => live && setAllowed(status.state),
      () => live && setAllowed('prompt'),
    )
    return () => void (live = false)
  }, [])

  const locate = () => {
    if (!navigator.geolocation) return setFailed('unavailable')
    setAsking(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setAsking(false)
        setFailed(null)
        setSpot({ lat: p.coords.latitude, lon: p.coords.longitude })
      },
      (err) => {
        setAsking(false)
        setFailed(err.code === err.PERMISSION_DENIED ? 'refused' : 'unavailable')
      },
      { maximumAge: 600_000, timeout: 20_000 },
    )
  }

  // The centre for the radius: the one held while it suits (exact for 0, moved for any other), else from the device's spot.
  useEffect(() => {
    if (centre && centre.exact === (radius === 0)) return
    setCentre(spot ? (radius === 0 ? { ...exactPoint(spot), exact: true } : { ...pointFor(spot), exact: false }) : null)
  }, [spot, radius])

  // Allowed already: read with no button, whenever a centre is wanted.
  useEffect(() => {
    if (allowed === 'granted' && !centre && !spot && !asking) locate()
  }, [allowed, centre, spot])

  // The place as it is held: nothing until there is a centre.
  useEffect(() => {
    const named = area.trim()
    onChange(centre ? { lat: centre.lat, lon: centre.lon, radiusKm: radius, ...(named && { area: named }) } : undefined)
  }, [centre, radius, area])

  const refused = failed === 'refused' || allowed === 'denied'
  return (
    <div className="place" role="group" aria-label={label}>
      {centre ? (
        <p className="where">{placeLine(area, radius)}</p>
      ) : refused ? (
        <p className="hint">{NO_LOCATION.refused}</p>
      ) : allowed === 'prompt' || failed ? (
        <button type="button" disabled={asking} onClick={locate}>
          {asking ? <Spinner /> : 'Use my location'}
        </button>
      ) : (
        allowed === 'granted' && <Spinner />
      )}
      {failed === 'unavailable' && <p className="hint">{NO_LOCATION.unavailable}</p>}
      {(centre || spot || was) && (
        <>
          <input
            type="range"
            aria-label="Within"
            aria-valuetext={radius === 0 ? 'An exact spot' : `${radius} km`}
            min={0}
            max={steps.length - 1}
            step={1}
            value={steps.indexOf(radius)}
            onChange={(e) => setRadius(steps[Number(e.target.value)]!)}
          />
          <input aria-label="Area" placeholder="Area" autoComplete="off" value={area} onChange={(e) => setArea(e.target.value)} />
        </>
      )}
    </div>
  )
}
