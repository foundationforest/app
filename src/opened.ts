// The messages the person opened, held in this page's memory while it is open, so a thread shows
// again without a second unlock; never stored. Forget, or a closed page, lets them go.

import type { Thread } from './flows/inbox.ts'

type Held = { threads: Thread[] } | null

let held: Held = null
const listeners = new Set<() => void>()

/** The threads opened, or null when none was opened in this page. */
export const opened = (): Held => held

/** The threads now opened, in place of any before them. */
export function hold(threads: Thread[]): void {
  held = { threads }
  for (const l of listeners) l()
}

/** One thread changed: a message the person sent added to it, or a new thread. */
export function holdThread(thread: Thread): void {
  const rest = (held?.threads ?? []).filter((t) => !(t.mine === thread.mine && t.them === thread.them))
  hold([thread, ...rest])
}

/** Nothing held: after Forget. */
export function letGo(): void {
  held = null
  for (const l of listeners) l()
}

export function onOpened(listener: () => void): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}
