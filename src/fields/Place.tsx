// A place: an area typed in, which is enough alone (the markets' types, `place`). Near me adds the
// device's location, rounded to the kilometres the person picks, so a search near a point finds it:
// the point says no more than that. Online, too, only where the field lets the place be online.

import { useState } from 'react'

import type { Field } from '../markets.ts'
import { CheckIcon } from '../ui.tsx'

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

/** What a place holds, from what the person gave: an area, with its point if added, online too if picked; online alone; or nothing. */
export function placeOf(area: string, point: Point | null, km: number, online: boolean): Record<string, unknown> | undefined {
  const named = area.trim()
  const also = online ? { online: true } : {}
  if (named && point) return { ...rounded(point, km), precisionKm: km, area: named, ...also }
  if (named) return { area: named, ...also }
  return online ? { online: true } : undefined
}

export function Place({ label, field, value, onChange }: { label: string; field: Pick<Field, 'online'>; value: unknown; onChange: (v: unknown) => void }) {
  const was = (value ?? {}) as { online?: boolean; area?: string; precisionKm?: number; lat?: string; lon?: string }
  const canOnline = field.online !== false
  const [online, setOnline] = useState(canOnline && was.online === true)
  const [area, setArea] = useState(was.area ?? '')
  const [km, setKm] = useState(was.precisionKm && KMS.includes(was.precisionKm) ? was.precisionKm : 5)
  const [point, setPoint] = useState<Point | null>(was.lat && was.lon ? { lat: Number(was.lat), lon: Number(was.lon) } : null)
  const [asking, setAsking] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  const now = { online, area, km, point }
  const set = (change: Partial<typeof now>) => {
    const next = { ...now, ...change }
    if ('online' in change) setOnline(next.online)
    if ('area' in change) setArea(next.area)
    if ('km' in change) setKm(next.km)
    if ('point' in change) setPoint(next.point)
    onChange(placeOf(next.area, next.point, next.km, next.online))
  }
  const locate = () => {
    if (point) return set({ point: null })
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
      <input aria-label="Area" placeholder="Area" autoComplete="off" value={area} onChange={(e) => set({ area: e.target.value })} />
      <div className="chips">
        {area.trim() && (
          <button type="button" className={point ? 'chip here' : 'chip'} aria-pressed={point !== null} disabled={asking} onClick={locate}>
            {point && <CheckIcon />}
            Near me
          </button>
        )}
        {canOnline && (
          <button type="button" className={online ? 'chip here' : 'chip'} aria-pressed={online} onClick={() => set({ online: !online })}>
            Online
          </button>
        )}
      </div>
      {point && area.trim() && (
        <div className="chips" role="radiogroup" aria-label="Within">
          {KMS.map((k) => (
            <button key={k} type="button" role="radio" aria-checked={km === k} className={km === k ? 'chip here' : 'chip'} onClick={() => set({ km: k })}>
              {k} km
            </button>
          ))}
        </div>
      )}
      {unavailable && <p className="hint">Your location isn't available.</p>}
    </div>
  )
}
