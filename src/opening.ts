// Opening the messages: every profile's inbox and what it sent, at once (flows/inbox.ts, openAll).
// Two ways:
// - the person's: a tap on the Messages tab (or the sidebar's Messages, or a profile's messages
//   button) while something is still to open, or Open. With no seed held, the tap itself asks the
//   passkey, since a browser shows its passkey prompt only for a tap; with one held, it opens with
//   it, an action as any other, restarting the 15 minutes. One opening for the whole page, so the
//   screen the tap opens shows it busy, and its note when it fails.
// - the page's own: whenever a seed is held and something is still to open, after any unlock and
//   as new ones come (the frame, useQuietOpening), so every count is exact while it is held. It
//   uses the seed held and restarts nothing: a page left open never keeps the seed past its 15
//   minutes.
// Still to open: not every inbox yet, or new inbox entries since, which none of the threads opened
// holds. Opening moves nothing on: where the person left off in each inbox (device.ts, `cursors`)
// moves past what was opened only once a screen shows the messages (Messages, a conversation, an
// offer's Messages: `useSeen`), so what the page opened by itself and nobody saw is new again after
// a reload.

import { useEffect, useState } from 'react'

import { config } from './config.ts'
import { passkey, profiles, saveCursors } from './device.ts'
import { openAll } from './flows/inbox.ts'
import { ifHeld, isHeldFor } from './held.ts'
import { useHeld, useNewMessages, useOpened } from './hooks.ts'
import { type Found, newMessagesList } from './list.ts'
import { hold, opened, unopenedOf } from './opened.ts'
import { withSeed } from './passkey.ts'
import { checkInWorker } from './proof/prove.ts'
import { type Note, noteOf } from './ui.tsx'
import { Reloading } from './version.ts'

/** Whether something is still to open: not every inbox yet, or new entries since. */
const needed = (found: Found) => !opened()?.all || Object.values(unopenedOf(found)).some((l) => l.length > 0)

/** One opening at a time: the person's, or the page's own. */
let running: Promise<void> | null = null

/** The person's opening: whether it runs, and its note when it failed. */
let shown: { busy: boolean; note: Note | null } = { busy: false, note: null }
const listeners = new Set<() => void>()
const show = (next: typeof shown) => {
  shown = next
  for (const l of listeners) l()
}

/** Where the person will have left off in each inbox once a screen shows what was opened: held until then. */
let unseen: Record<string, number> = {}

/** Every inbox opened with `seed`: its threads held, those new as it opened marked (not one held already and looked at), and where the person will have left off kept for when a screen shows them. */
async function opening(seed: Uint8Array): Promise<void> {
  const before = opened()
  const held = new Set((before?.threads ?? []).flatMap((t) => t.messages.map((m) => m.id)))
  const was = Object.values(newMessagesList.last())
    .flat()
    .filter((id) => !held.has(id) || before!.fresh.has(id))
  const got = await openAll(config, seed, profiles(), checkInWorker)
  hold(got.threads, was)
  unseen = { ...unseen, ...got.cursors }
}

/** The messages opened, shown on a screen: where the person left off in each inbox moved past them. */
export function sawMessages(): void {
  if (Object.keys(unseen).length === 0) return
  saveCursors(unseen)
  unseen = {}
}

/** A screen showing the messages opened (`shown`): seen, as they are opened, and again as more open while it shows them. */
export function useSeen(shown: boolean): void {
  const held = useOpened()
  useEffect(() => {
    if (shown && held?.all) sawMessages()
  }, [shown, held])
}

/** The person's opening: with the seed held, or the one their passkey gives now. Nothing when something already opens them, but that one shown. */
export async function openMessages(): Promise<void> {
  const id = passkey()
  if (!id) return
  show({ busy: true, note: null })
  try {
    if (running) await running
    else await (running = withSeed(id, opening).finally(() => (running = null)))
    show({ busy: false, note: null })
  } catch (err) {
    show({ busy: false, note: err instanceof Reloading ? null : noteOf(err) })
  }
}

/** A tap into Messages: the person's opening, when something is still to open. */
export function intoMessages(): void {
  if (needed(newMessagesList.last())) void openMessages()
}

/**
 * The messages, as a screen that shows them needs them: `open`, the person's opening (Open);
 * `need`, whether something is still to open; `held`, whether a seed is held, so they open by
 * themselves.
 */
export function useOpening() {
  const found = useNewMessages()
  const held = useHeld()
  useOpened()
  const [now, setNow] = useState(shown)
  useEffect(() => {
    const changed = () => setNow(shown)
    listeners.add(changed)
    return () => void listeners.delete(changed)
  }, [])
  return { open: { busy: now.busy, note: now.note, run: openMessages }, need: needed(found), held }
}

/** The page's own opening, in the frame: whenever a seed is held and something is still to open. A try that failed is tried again once more comes. */
export function useQuietOpening(): void {
  const found = useNewMessages()
  const held = useHeld()
  const all = useOpened()?.all ?? false
  const key = Object.values(unopenedOf(found)).flat().sort().join(',')
  useEffect(() => {
    const id = passkey()
    if (!id || !isHeldFor(id) || running || !needed(found)) return
    running = (ifHeld(id, opening) as Promise<void>).catch(() => undefined).finally(() => (running = null))
  }, [held, all, key])
}
