// Opening the messages: every profile's inbox and what it sent, at once (flows/inbox.ts, openAll).
// With no seed held, one unlock, Open. With one held (held.ts), they open by themselves: as the
// screen that shows them opens, which is the person's own tap, so it restarts the 5 minutes as any
// action does; and again whenever new ones come while it is open, which the page does by itself, so
// it uses the seed held and restarts nothing: a screen left open never keeps the seed past them.

import { useEffect, useRef } from 'react'

import { config } from './config.ts'
import { passkey, profiles, saveCursors } from './device.ts'
import { openAll } from './flows/inbox.ts'
import { ifHeld, isHeldFor } from './held.ts'
import { useHeld, useNewMessages, useOpened } from './hooks.ts'
import { hold } from './opened.ts'
import { withSeed } from './passkey.ts'
import { checkInWorker } from './proof/prove.ts'
import { useAction } from './ui.tsx'

/**
 * The messages, opened: `open`, the one unlock (or the seed held); `need`, whether something is
 * still to open (not every inbox yet, or new ones since); `held`, whether a seed is held, so they
 * open by themselves.
 */
export function useOpening() {
  const fresh = useNewMessages()
  const held = useHeld()
  const opened = useOpened()
  const ids = Object.values(fresh).flat()
  const need = !opened?.all || ids.length > 0
  // One opening at a time: the person's, or the page's own.
  const running = useRef(false)
  const opening = async (seed: Uint8Array) => {
    const was = ids
    const got = await openAll(config, seed, profiles(), checkInWorker)
    hold(got.threads, was)
    saveCursors(got.cursors)
  }
  const open = useAction(async () => {
    running.current = true
    try {
      await withSeed(passkey()!, opening)
    } finally {
      running.current = false
    }
  })
  const shown = useRef(false)
  useEffect(() => {
    const id = passkey()
    const first = !shown.current
    shown.current = true
    if (!id || !isHeldFor(id) || running.current) return
    // As the screen opens: the person's tap, as Open is.
    if (first) return void (need && open.run())
    if (ids.length === 0) return
    // New ones while it is open: the page's own doing, restarting nothing.
    running.current = true
    void ifHeld(id, opening)
      .catch(() => undefined)
      .finally(() => (running.current = false))
  }, [ids.join(',')])
  return { open, need, held }
}
