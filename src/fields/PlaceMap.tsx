// The place screen's map (Place.tsx): the one module that loads MapLibre, so its code comes with
// the place screen alone. OpenFreeMap's tiles (config.ts), Positron in light and Dark in dark, its
// attribution always shown in full. The circle stays in the middle, in the strong green, and the
// person moves the map under it: a drag, two fingers to zoom, the arrows and + and -. An exact spot
// is a pin in the middle the same way. Wherever the person or the screen moves it, the screen hears
// its middle where it stops; a fit to a new size says nothing, the place staying where it is. The map
// fits the circle as it opens and as its radius changes, and goes where the screen sends it: a
// place searched for, or the device's spot. What can't load (WebGL, the style) says so, once.

import { type GeoJSONSource, Map as MapLibre, setWorkerUrl } from 'maplibre-gl'
import worker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect, useRef } from 'react'

import { config } from '../config.ts'
import { Icon } from '../icons.tsx'
import { type Spot, ring } from '../near.ts'
import { isDark } from '../theme.ts'

// MapLibre's worker, built by Vite as a file of the app's own: a worker from 'self', as the CSP allows.
setWorkerUrl(worker)

export type MapProps = {
  /** Where the map opens: the place's centre; none, the whole world. */
  opensAt: Spot | null
  /** The circle's radius, in kilometres; 0, an exact spot, a pin. */
  radiusKm: number
  /** Where the screen sends the map, each time it changes: a place searched for, or the device's spot; `sets: false`, only to look there, its middle not yet the place. */
  goTo: { spot: Spot; radiusKm: number; sets?: false } | null
  /** The map's middle, wherever it stops: where the place is; whether the person moved it there, or the screen sent it. */
  onMiddle: (spot: Spot, byPerson: boolean) => void
  /** The map can't be drawn here, or its style can't be had. */
  onFail: () => void
}

/** Room round the circle when the map fits it, in pixels. */
const ROOM = 28
/** How near an exact spot's map opens. */
const SPOT_ZOOM = 16

/** What the circle's source draws: none, or the circle, as MapLibre takes it. */
type Shape = Parameters<GeoJSONSource['setData']>[0]
const NOTHING: Shape = { type: 'FeatureCollection', features: [] }
const circle = (centre: Spot, km: number): Shape => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring(centre, km)] } })

/** The box round the circle `km` round `centre`, [[west, south], [east, north]]. */
function boxOf(centre: Spot, km: number): [[number, number], [number, number]] {
  const edge = ring(centre, km, 16)
  const lons = edge.map(([lon]) => lon)
  const lats = edge.map(([, lat]) => lat)
  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ]
}

const spotAt = (l: { lat: number; lng: number }): Spot => ({ lat: l.lat, lon: l.lng })

export default function PlaceMap(props: MapProps) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibre | null>(null)
  // The latest props, for the map's own handlers, made once.
  const now = useRef(props)
  now.current = props
  const ready = useRef(false)
  // Whether the person moved the map, or the screen sent it somewhere: only then is its middle a place.
  const moved = useRef(false)
  // Whether the person moved it since the screen last sent it somewhere.
  const byPerson = useRef(false)
  // A fit to a new radius under way: its stop is no new place.
  const fitting = useRef(false)

  /** The circle round the map's middle, drawn again as the map moves; none for an exact spot. */
  const draw = () => {
    const m = map.current
    const source = ready.current ? m?.getSource<GeoJSONSource>('area') : undefined
    if (m && source) source.setData(now.current.radiusKm > 0 ? circle(spotAt(m.getCenter()), now.current.radiusKm) : NOTHING)
  }

  /** The map fitted round `spot`: the circle with room round it, an exact spot close. */
  const fit = (spot: Spot, radiusKm: number, duration: number) => {
    const m = map.current
    if (!m) return
    if (radiusKm > 0) m.fitBounds(boxOf(spot, radiusKm), { padding: ROOM, duration })
    else m.jumpTo({ center: [spot.lon, spot.lat], zoom: Math.max(m.getZoom(), SPOT_ZOOM) })
  }

  useEffect(() => {
    const { opensAt: at, radiusKm } = now.current
    let m: MapLibre
    try {
      m = new MapLibre({
        container: box.current!,
        style: `${config.tiles}/styles/${isDark() ? 'dark' : 'positron'}`,
        ...(!at ? { center: [0, 20], zoom: 0.5 } : radiusKm > 0 ? { bounds: boxOf(at, radiusKm), fitBoundsOptions: { padding: ROOM } } : { center: [at.lon, at.lat], zoom: SPOT_ZOOM }),
        attributionControl: { compact: false },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        maxZoom: 18,
      })
    } catch {
      // No WebGL here.
      now.current.onFail()
      return
    }
    map.current = m
    m.touchZoomRotate.disableRotation()
    m.keyboard.disableRotation()
    let styled = false
    m.once('style.load', () => void (styled = true))
    m.on('error', () => void (styled || now.current.onFail()))
    m.on('load', () => {
      const green = getComputedStyle(document.documentElement).getPropertyValue('--forest').trim()
      m.addSource('area', { type: 'geojson', data: NOTHING })
      m.addLayer({ id: 'area', type: 'fill', source: 'area', paint: { 'fill-color': green, 'fill-opacity': 0.15 } })
      m.addLayer({ id: 'area-edge', type: 'line', source: 'area', paint: { 'line-color': green, 'line-width': 2 } })
      ready.current = true
      draw()
    })
    m.on('move', draw)
    // Where the map stops is where the place is, once the person moved it or the screen sent it
    // somewhere: a map that only opened, or fitted a new radius, says nothing.
    m.on('moveend', () => {
      if (fitting.current) return void (fitting.current = false)
      if (moved.current) now.current.onMiddle(spotAt(m.getCenter()), byPerson.current)
    })
    m.on('movestart', (e) => {
      if ((e as { originalEvent?: unknown }).originalEvent) moved.current = byPerson.current = !(fitting.current = false)
    })
    return () => {
      m.remove()
      map.current = null
      ready.current = false
    }
  }, [])

  // The radius: the circle drawn again, and the map fitted to it round its middle.
  const radius = useRef(props.radiusKm)
  useEffect(() => {
    draw()
    const m = map.current
    if (!m || radius.current === props.radiusKm) return
    radius.current = props.radiusKm
    fitting.current = true
    fit(spotAt(m.getCenter()), props.radiusKm, 300)
  }, [props.radiusKm])

  // Where the screen sends it: there, fitted to the circle.
  useEffect(() => {
    if (!props.goTo) return
    moved.current = props.goTo.sets !== false
    byPerson.current = fitting.current = false
    fit(props.goTo.spot, props.goTo.radiusKm, 600)
  }, [props.goTo])

  return (
    <>
      <div ref={box} className="map" />
      {props.radiusKm === 0 && (
        <span className="map-pin middle" aria-hidden>
          <Icon name="map-pin" fill />
        </span>
      )}
    </>
  )
}
