// An index, as the app reads it: its JSON twins, the very objects its pages are rendered from. Each
// index answers in its own format, not the standard's, so these are the foundation's shapes, passed
// through. Ported from services e2e (the loop index's /profiles/<address>.json).

import { getJson } from './http.ts'

/** The home page's twin: the folders, their markets and live offer counts, and the index's own key. */
export function home(origin: string): Promise<any> {
  return getJson(`${origin}/index.json`)
}

/** A market's twin: its description, its two sides, and its live offers. */
export function market(origin: string, name: string): Promise<any> {
  return getJson(`${origin}/markets/${encodeURIComponent(name)}.json`)
}

/** A profile's twin: its rows, scores, proofs, offers and reviews. */
export function profile(origin: string, address: string): Promise<any> {
  return getJson(`${origin}/profiles/${encodeURIComponent(address)}.json`)
}
