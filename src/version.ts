// This version of the app, and the next. Every open takes the newest version deployed (index.html
// comes from the network first, vite.config.ts), but a page left open across a deploy keeps its
// own, until it needs a module only its version had, loaded when first needed. That module is gone
// from the server, a 404 (vercel.json), so the page reloads once, back on the screen it was on, and
// takes the new version there. A flag for this tab names the version it reloaded from: a module
// missing for another reason (no connection) reloads once, then shows its error.

/** This version: the main module's own address, which every build names anew. */
const VERSION = import.meta.url
/** The version this tab last reloaded from, to take a newer one. */
const RELOADED = 'forest.reloaded'
/** Set just before that reload, so the page it opens goes back to the screen the person was on. */
const RESUME = 'forest.resume'

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
    sessionStorage.setItem(RESUME, '1')
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

/** Whether this page was opened by that reload: then it opens on the screen the person was on. Asked once, at the start. */
export function resuming(): boolean {
  try {
    const was = sessionStorage.getItem(RESUME) !== null
    sessionStorage.removeItem(RESUME)
    return was
  } catch {
    return false
  }
}
