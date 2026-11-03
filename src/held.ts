// The seed, held in this page's memory after an unlock, so the actions that follow ask nothing: for
// 5 minutes, which each action restarts, as it starts and as it ends. It is dropped at once when the
// page is hidden (another app, another tab, the phone locked) or closed, and on Forget; it is never
// stored. Only the passkey in use is held, one at a time.
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

const hidden = () => globalThis.document?.visibilityState === 'hidden'

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

/** The seed dropped: held no more, and zeroed unless an action is still using it. */
export function drop(): void {
  const was = held
  clearTimeout(timer)
  if (!was) return
  held = null
  if (was.using === 0) was.seed.fill(0)
  told()
}

/**
 * `action` with the seed of passkey `id`: the one held, or, with none held, the one `unlock` gives,
 * held from now. Each action restarts the 5 minutes as it starts and as it ends. On a page already
 * hidden, it is held for no longer than this action.
 */
export async function withHeld<T>(id: string, unlock: () => Promise<Uint8Array>, action: (seed: Uint8Array) => Promise<T>): Promise<T> {
  if (held && held.id !== id) drop()
  if (!held) hold(id, await unlock())
  const h = held!
  h.using++
  restart()
  if (hidden()) drop()
  try {
    return await action(h.seed)
  } finally {
    h.using--
    if (held === h) restart()
    else if (h.using === 0) h.seed.fill(0)
  }
}

/** A listener told whenever a seed is held or dropped. */
export function onHeld(listener: () => void): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

// Hidden or closed: dropped at once.
globalThis.document?.addEventListener('visibilitychange', () => hidden() && drop())
globalThis.addEventListener?.('pagehide', drop)
