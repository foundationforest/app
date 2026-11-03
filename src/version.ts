// This version of the app, and the next. Every open takes the newest version deployed (the page
// comes from the network first, vite.config.ts), but a page left open across a deploy keeps its
// own. So, now and then, the page asks the server for the page it would give now: when that names
// another entry script than this page's, a newer version is live, and one quiet line says so, with
// Reload (App.tsx). Until then, the page goes on as it was, until it needs a module only its
// version had, loaded when first needed. That module is gone from the server, a 404 (vercel.json),
// so the page reloads once, back on the screen it was on, and takes the new version there: each
// screen has its own path, so the reload opens on it. A flag for this tab names the version it
// reloaded from: a module missing for another reason (no connection) reloads once, then shows its
// error.

/** This version: the main module's own address, which every build names anew. */
const VERSION = import.meta.url
/** The version this tab last reloaded from, to take a newer one. */
const RELOADED = 'forest.reloaded'

/** The page is reloading to take the new version: nothing to say, and nothing more to do here. */
export class Reloading extends Error {
  constructor() {
    super('Forest is opening its new version.')
    this.name = 'Reloading'
  }
}

let reloading = false

/** Reloads the page to take the new version, once for this version. False when it did already, so the module is missing for another reason. */
export function reloadOnce(): boolean {
  if (reloading) return true
  try {
    if (sessionStorage.getItem(RELOADED) === VERSION) return false
    sessionStorage.setItem(RELOADED, VERSION)
  } catch {
    return false
  }
  reloading = true
  location.reload()
  return true
}

/** A module of the app's own, loaded when first needed. When it cannot be, the page reloads once to take the new version, and this throws `Reloading`. */
export async function lazy<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load()
  } catch (err) {
    if (reloadOnce()) throw new Reloading()
    throw err
  }
}

/** The entry script a page's HTML names: the src of its first module script, or null. */
export function entryIn(html: string): string | null {
  for (const [tag] of html.matchAll(/<script\b[^>]*>/gi)) {
    if (!/\btype=["']?module\b/i.test(tag)) continue
    const src = /\bsrc=["']?([^"'\s>]+)/i.exec(tag)?.[1]
    if (src) return src
  }
  return null
}

/** Whether a newer version than this page's (`mine`, its entry script) is live: the page the server gives now names another. False when it can't tell. */
export async function newerLive(mine: string | null, page: () => Promise<Response> = () => fetch('/', { cache: 'no-store' })): Promise<boolean> {
  if (!mine) return false
  try {
    const res = await page()
    if (!res.ok) return false
    const live = entryIn(await res.text())
    return live !== null && live !== mine
  } catch {
    return false
  }
}
