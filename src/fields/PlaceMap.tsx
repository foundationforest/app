// The place screen's map (Place.tsx): the one module that loads MapLibre, so its code comes with
// the place screen alone. OpenFreeMap's tiles (config.ts), Positron in light and Dark in dark, its
// attribution always shown in full. An area is a circle in the mint's dark green, light green's ink: a tap puts it there,
// a drag inside it carries it, and wherever it is put the screen answers with the centre it will be
// posted at, which the circle glides to, never a jump; a drag outside it moves the map, two fingers
// zoom it. An exact spot is a pin, none until a tap drops one, which can be dragged. Enter puts
// either at the map's middle. The map fits the circle as it opens, when the first one is put, and
// as its radius changes, and goes to the device's spot when it comes. What can't load (WebGL, the style) says so, once.

import { type GeoJSONSource, Map as MapLibre, type MapMouseEvent, type MapTouchEvent, Marker, setWorkerUrl } from 'maplibre-gl'
import worker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { config } from '../config.ts'
import { Icon } from '../icons.tsx'
import { type Spot, kmBetween, ring } from '../near.ts'
import { isDark } from '../theme.ts'

// MapLibre's worker, built by Vite as a file of the app's own: a worker from 'self', as the CSP allows.
setWorkerUrl(worker)

export type Mode = 'area' | 'spot'

export type MapProps = {
  mode: Mode
  /** The area's centre, where it will be posted. */
  centre: Spot | null
  radiusKm: number
  /** The exact spot's pin. */
  pin: Spot | null
  /** Where the map opens with no circle or pin: the last centre the device kept; none, the whole world. */
  opensAt: Spot | null
  /** The device's spot, once read: the map goes there. */
  here: Spot | null
  /** Where the person put the area: the screen answers with its centre. */
  onArea: (spot: Spot) => void
  /** Where the person put the pin. */
  onPin: (spot: Spot) => void
  /** The map can't be drawn here, or its style can't be had. */
  onFail: () => void
}

/** Room round the circle when the map fits it, in pixels. */
const ROOM = 24
/** How long the circle takes to glide to its centre, in milliseconds. */
const GLIDE_MS = 350
/** A press that moves less than this, in pixels, is a tap. */
const TAP_PX = 4
/** How long after a touch the mouse events a browser makes up for it may come, in milliseconds. */
const TOUCH_MOUSE_MS = 1000

/** What the area's source draws: none, or the circle, as MapLibre takes it. */
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
  // The circle's centre as drawn: under the finger while it drags, then gliding to its centre.
  const drawn = useRef<Spot | null>(null)
  const ready = useRef(false)
  const glide = useRef(0)
  // The pin's own element: a tap on it is no tap on the map, which would move it.
  const [pinAt] = useState(() => {
    const at = Object.assign(document.createElement('div'), { className: 'map-pin' })
    at.addEventListener('click', (e) => e.stopPropagation())
    return at
  })
  const marker = useRef<Marker | null>(null)

  /** The circle at `at`, or none; drawn once the map can. */
  const draw = (at: Spot | null) => {
    drawn.current = at
    const source = ready.current ? map.current?.getSource<GeoJSONSource>('area') : undefined
    source?.setData(at && now.current.mode === 'area' ? circle(at, now.current.radiusKm) : NOTHING)
  }

  useEffect(() => {
    // Opened on the pin, else on the circle, else on the last centre kept, else on the whole world.
    const p = now.current
    const pinned = p.mode === 'spot' ? p.pin : null
    const at = pinned ? null : (p.centre ?? p.opensAt)
    let m: MapLibre
    try {
      m = new MapLibre({
        container: box.current!,
        style: `${config.tiles}/styles/${isDark() ? 'dark' : 'positron'}`,
        ...(at ? { bounds: boxOf(at, p.radiusKm), fitBoundsOptions: { padding: ROOM } } : pinned ? { center: [pinned.lon, pinned.lat], zoom: 15 } : { center: [0, 20], zoom: 0.5 }),
        attributionControl: { compact: false },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        maxZoom: 18,
      })
    } catch {
      // No WebGL here.
      p.onFail()
      return
    }
    map.current = m
    m.touchZoomRotate.disableRotation()
    m.keyboard.disableRotation()
    let styled = false
    m.once('style.load', () => void (styled = true))
    m.on('error', () => void (styled || now.current.onFail()))
    m.on('load', () => {
      const green = getComputedStyle(document.documentElement).getPropertyValue('--on-mint').trim()
      m.addSource('area', { type: 'geojson', data: NOTHING })
      m.addLayer({ id: 'area', type: 'fill', source: 'area', paint: { 'fill-color': green, 'fill-opacity': 0.15 } })
      m.addLayer({ id: 'area-edge', type: 'line', source: 'area', paint: { 'line-color': green, 'line-width': 2 } })
      ready.current = true
      draw(drawn.current)
    })

    /** A tap, or Enter: the area or the pin, there. */
    const put = (spot: Spot) => (now.current.mode === 'area' ? now.current.onArea(spot) : now.current.onPin(spot))

    // A press inside the circle carries it, and a tap there puts it there, both answered here, so the
    // map's own click for that same press is passed over; anywhere else the map moves, and its click
    // puts the area or the pin. The mouse events a browser makes up after a touch are no press.
    let grab: { dLat: number; dLon: number; x: number; y: number; from: Spot; moved: boolean } | null = null
    let inside = false
    let touchedAt = Number.NEGATIVE_INFINITY
    const press = (e: MapMouseEvent | MapTouchEvent) => {
      const touch = 'points' in e
      if (!touch && performance.now() - touchedAt < TOUCH_MOUSE_MS) return
      inside = false
      const c = drawn.current
      if (now.current.mode !== 'area' || !c || (touch && e.points.length !== 1)) return
      const spot = spotAt(e.lngLat)
      if (kmBetween(spot, c) > now.current.radiusKm) return
      e.preventDefault()
      cancelAnimationFrame(glide.current)
      inside = true
      grab = { dLat: c.lat - spot.lat, dLon: c.lon - spot.lon, x: e.point.x, y: e.point.y, from: spot, moved: false }
      if (!touch) addEventListener('mouseup', release, { once: true })
    }
    const carry = (e: MapMouseEvent | MapTouchEvent) => {
      if (!grab) return
      if (Math.hypot(e.point.x - grab.x, e.point.y - grab.y) > TAP_PX) grab.moved = true
      if (grab.moved) draw({ lat: e.lngLat.lat + grab.dLat, lon: e.lngLat.lng + grab.dLon })
    }
    function release() {
      if (!grab) return
      const { moved, from } = grab
      grab = null
      now.current.onArea(moved ? drawn.current! : from)
    }
    const lifted = () => {
      touchedAt = performance.now()
      release()
    }
    m.on('mousedown', press)
    m.on('touchstart', press)
    m.on('mousemove', carry)
    m.on('touchmove', carry)
    m.on('touchend', lifted)
    m.on('touchcancel', lifted)
    m.on('click', (e) => {
      if (inside) inside = false
      else put(spotAt(e.lngLat))
    })
    // The arrows move the map (MapLibre's own keys); Enter puts the area or the pin at its middle.
    m.getCanvas().addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return
      e.preventDefault()
      put(spotAt(m.getCenter()))
    })
    return () => {
      cancelAnimationFrame(glide.current)
      removeEventListener('mouseup', release)
      m.remove()
      map.current = null
      ready.current = false
    }
  }, [])

  // The area's centre, as the screen answers: the circle glides there from where it is drawn; the
  // first one, put on a map that may show the whole world, is drawn there and the map fits it.
  useEffect(() => {
    const to = props.centre
    const from = drawn.current
    cancelAnimationFrame(glide.current)
    if (to && !from && now.current.mode === 'area') map.current?.fitBounds(boxOf(to, now.current.radiusKm), { padding: ROOM, duration: 600 })
    if (!to || !from) return draw(to)
    const start = performance.now()
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / GLIDE_MS)
      const eased = 1 - (1 - k) ** 3
      draw({ lat: from.lat + (to.lat - from.lat) * eased, lon: from.lon + (to.lon - from.lon) * eased })
      if (k < 1) glide.current = requestAnimationFrame(step)
    }
    glide.current = requestAnimationFrame(step)
  }, [props.centre])

  // The kind and the radius: the circle drawn again, and the map fitted to it when its radius changes.
  const radius = useRef(props.radiusKm)
  useEffect(() => {
    draw(drawn.current)
    if (radius.current === props.radiusKm) return
    radius.current = props.radiusKm
    const m = map.current
    const c = drawn.current ?? (m && spotAt(m.getCenter()))
    if (m && c) m.fitBounds(boxOf(c, props.radiusKm), { padding: ROOM, duration: 300 })
  }, [props.mode, props.radiusKm])

  // The device's spot, once read: the map goes there, at the area's size.
  useEffect(() => {
    if (props.here) map.current?.fitBounds(boxOf(props.here, now.current.radiusKm), { padding: ROOM, duration: 600 })
  }, [props.here])

  // The pin, on the map only for an exact spot, and only once there is one.
  useEffect(() => {
    const m = map.current
    if (!m) return
    if (props.mode !== 'spot' || !props.pin) return void marker.current?.remove()
    if (!marker.current) {
      const made = new Marker({ element: pinAt, anchor: 'bottom', draggable: true })
      made.on('dragend', () => now.current.onPin(spotAt(made.getLngLat())))
      marker.current = made
    }
    marker.current.setLngLat([props.pin.lon, props.pin.lat]).addTo(m)
  }, [props.mode, props.pin])

  return (
    <>
      <div ref={box} className="map" />
      {createPortal(<Icon name="map-pin" fill />, pinAt)}
    </>
  )
}
