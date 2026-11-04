// The seed, held in this page's memory after an unlock, so the actions that follow ask nothing: for
// 5 minutes since the last action, each action restarting them as it starts and as it ends, or until
// the page closes, and on Forget; it is never stored. Hidden is not closed: a page another window
// covers, or one in another tab, keeps it, as a locked phone does, until the 5 minutes run out. Only
// the passkey in use is held, one at a time.
//
// An action already running when the seed is dropped finishes with it: its bytes are zeroed as the
// last action using them ends, never under one, which would make it mix the wrong keys.

/** How long the seed is held after an unlock, or after the last action that used it. */
export const HOLD_MS = 5 * 60_000

type Held = { id: string; seed: Uint8Array; using: number }

let held: Held | null = null
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

const told = () => {
  for (const l of listeners) l()
}

/** The 5 minutes started again. */
function restart(): void {
  clearTimeout(timer)
  timer = setTimeout(drop, HOLD_MS)
}

/** Whether a seed is held: an action now asks nothing. */
export const isHeld = (): boolean => held !== null

/** Whether the seed of passkey `id` is held. */
export const isHeldFor = (id: string): boolean => held?.id === id

/** The seed of passkey `id`, just given by its unlock, held from now, in place of any other. */
export function hold(id: string, seed: Uint8Array): void {
  if (held?.seed === seed) return
  drop()
  held = { id, seed, using: 0 }
  restart()
  told()
}

/** The seed held now held for passkey `id` instead: the passkey in use here changed, and opens the same seed. */
export function moveTo(id: string): void {
  if (!held) return
  held.id = id
  told()
}

/** The seed dropped: held no more, and zeroed unless an action is still using it. */
export function drop(): void {
  const was = held
  clearTimeout(timer)
  if (!was) return
  held = null
  if (was.using === 0) was.seed.fill(0)
  told()
}

/** `action` with the held seed `h`, which it keeps from being zeroed while it runs; the 5 minutes restarted as it starts and as it ends, unless `quiet`. */
async function using<T>(h: Held, action: (seed: Uint8Array) => Promise<T>, quiet: boolean): Promise<T> {
  h.using++
  if (!quiet) restart()
  try {
    return await action(h.seed)
  } finally {
    h.using--
    if (held !== h) {
      if (h.using === 0) h.seed.fill(0)
    } else if (!quiet) restart()
  }
}

/**
 * `action` with the seed of passkey `id`: the one held, or, with none held, the one `unlock` gives,
 * held from now. Each action restarts the 5 minutes as it starts and as it ends.
 */
export async function withHeld<T>(id: string, unlock: () => Promise<Uint8Array>, action: (seed: Uint8Array) => Promise<T>): Promise<T> {
  if (held && held.id !== id) drop()
  if (!held) hold(id, await unlock())
  return using(held!, action, false)
}

/**
 * `action` with the seed of passkey `id` if it is held, else nothing: what the page does by itself
 * while a seed is held (messages opened again as new ones come), never the person's own action, so
 * it asks nothing and restarts nothing, and a screen left open never keeps the seed past its 5
 * minutes.
 */
export async function ifHeld<T>(id: string, action: (seed: Uint8Array) => Promise<T>): Promise<T | undefined> {
  if (held?.id !== id) return undefined
  return using(held, action, true)
}

/** A listener told whenever a seed is held or dropped. */
export function onHeld(listener: () => void): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

// Closed: dropped at once.
globalThis.addEventListener?.('pagehide', drop)
