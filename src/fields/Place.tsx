// A place: online, an area, or both. The type holds an area only with a point (the markets' types,
// `place`), so an area takes the device's location, rounded to the kilometres the person picks:
// the point says no more than that. With no location given, only Online can be written.

import { useState } from 'react'

const KMS = [1, 5, 25]
const KM_PER_DEGREE = 111.32

type Point = { lat: number; lon: number }

/** `p` rounded to a grid `km` kilometres wide, as decimal text: what a place's lat and lon hold. */
export function rounded(p: Point, km: number): { lat: string; lon: string } {
  const latStep = km / KM_PER_DEGREE
  const lat = Math.max(-90, Math.min(90, Math.round(p.lat / latStep) * latStep))
  const lonStep = km / (KM_PER_DEGREE * Math.max(Math.cos((lat * Math.PI) / 180), 0.01))
  let lon = Math.round(p.lon / lonStep) * lonStep
  if (lon > 180) lon -= 360
  if (lon < -180) lon += 360
  const text = (n: number) => {
    const t = n.toFixed(4)
    return /^-0\.0+$/.test(t) ? t.slice(1) : t
  }
  return { lat: text(lat), lon: text(lon) }
}

export function Place({ label, value, onChange }: { label: string; value: unknown; onChange: (v: unknown) => void }) {
  const was = (value ?? {}) as { online?: boolean; area?: string; precisionKm?: number; lat?: string; lon?: string }
  const [online, setOnline] = useState(was.online === true)
  const [area, setArea] = useState(was.area ?? '')
  const [km, setKm] = useState(was.precisionKm && KMS.includes(was.precisionKm) ? was.precisionKm : 5)
  const [point, setPoint] = useState<Point | null>(was.lat && was.lon ? { lat: Number(was.lat), lon: Number(was.lon) } : null)
  const [asking, setAsking] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  const emit = (next: { online: boolean; area: string; km: number; point: Point | null }) => {
    const named = next.area.trim()
    if (named && next.point) onChange({ ...rounded(next.point, next.km), precisionKm: next.km, area: named, ...(next.online && { online: true }) })
    else onChange(next.online ? { online: true } : undefined)
  }
  const now = { online, area, km, point }
  const set = (change: Partial<typeof now>) => {
    const next = { ...now, ...change }
    if ('online' in change) setOnline(next.online)
    if ('area' in change) setArea(next.area)
    if ('km' in change) setKm(next.km)
    if ('point' in change) setPoint(next.point)
    emit(next)
  }
  const locate = () => {
    if (!navigator.geolocation) return setUnavailable(true)
    setAsking(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setAsking(false)
        setUnavailable(false)
        set({ point: { lat: p.coords.latitude, lon: p.coords.longitude } })
      },
      () => {
        setAsking(false)
        setUnavailable(true)
      },
      { maximumAge: 600_000, timeout: 20_000 },
    )
  }
  return (
    <div className="place" role="group" aria-label={label}>
      <div className="chips">
        <button type="button" className={online ? 'chip here' : 'chip'} aria-pressed={online} onClick={() => set({ online: !online })}>
          Online
        </button>
      </div>
      <input aria-label="Area" placeholder="Area" value={area} onChange={(e) => set({ area: e.target.value })} />
      {area.trim() && (
        <>
          <div className="chips" role="radiogroup" aria-label="Within">
            {KMS.map((k) => (
              <button key={k} type="button" role="radio" aria-checked={km === k} className={km === k ? 'chip here' : 'chip'} onClick={() => set({ km: k })}>
                {k} km
              </button>
            ))}
          </div>
          <button type="button" disabled={asking} onClick={locate}>
            {point ? 'Location added' : 'Add my location'}
          </button>
          {!point && <p className="hint">{unavailable ? "Your location isn't available. Choose Online instead." : 'The area needs your location.'}</p>}
        </>
      )}
    </div>
  )
}
