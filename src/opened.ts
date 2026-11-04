// The messages the person opened, held in this page's memory while it is open, so a thread shows
// again without a second unlock; never stored. With them, the ids of those that were new when they
// were opened, so a thread shows its dot until it is looked at, and whether every inbox was opened
// (`all`) or only a thread the person wrote in before opening them, which leaves the rest still to
// open. Forget, or a closed page, lets them go.

import type { Thread } from './flows/inbox.ts'

type Held = { threads: Thread[]; fresh: Set<string>; all: boolean } | null

let held: Held = null
const listeners = new Set<() => void>()

const told = () => {
  for (const l of listeners) l()
}

/** The threads opened, or null when none was opened in this page. */
export const opened = (): Held => held

/** Every inbox opened: its threads, in place of any before them, with the ids of the messages that were new. */
export function hold(threads: Thread[], fresh: Iterable<string> = []): void {
  held = { threads, fresh: new Set([...(held?.fresh ?? []), ...fresh]), all: true }
  told()
}

/** One thread changed: a message the person sent added to it, or a new thread; the rest as they were, opened or not. */
export function holdThread(thread: Thread): void {
  const rest = (held?.threads ?? []).filter((t) => !(t.mine === thread.mine && t.them === thread.them))
  held = { threads: [thread, ...rest], fresh: held?.fresh ?? new Set(), all: held?.all ?? false }
  told()
}

/** Whether every inbox was opened in this page, not only a thread written in before. */
export const allOpened = (): boolean => held?.all === true

/** Whether a thread holds a message that was new when it was opened. */
export const isFresh = (thread: Thread): boolean => thread.messages.some((m) => held?.fresh.has(m.id))

/** A thread looked at: its messages new no more. */
export function looked(thread: Thread): void {
  if (!held || !isFresh(thread)) return
  for (const m of thread.messages) held.fresh.delete(m.id)
  told()
}

/** Nothing held: after Forget. */
export function letGo(): void {
  held = null
  told()
}

export function onOpened(listener: () => void): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}
