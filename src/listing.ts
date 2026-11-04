// The new inbox entries of every profile, listed with nothing unlocked: one listing for the whole
// page, however many screens show what is new (the bottom bar, Profiles, Notifications, a profile,
// Messages, a thread). It starts with the first that follows it and stops with the last; while it
// runs, it lists now, every half minute, and whenever the device changes. A screen that starts
// following while it runs is shown the last listing at once.

import { config } from './config.ts'
import { CHANGED, profiles } from './device.ts'
import { newMessages } from './flows/inbox.ts'

/** The ids of the new inbox entries, by profile address. */
export type Found = Record<string, string[]>

/** How often the inboxes are listed while a screen shows what is new. */
export const LIST_EVERY_MS = 30_000

/** One listing by `list`, shared by all that follow it: now, every `every` ms, and whenever the device changes, while any does. */
export function listing(list: () => Promise<Found>, every = LIST_EVERY_MS) {
  let last: Found = {}
  const followers = new Set<(found: Found) => void>()
  let stop: (() => void) | null = null
  const look = () =>
    list().then(
      (found) => {
        last = found
        for (const show of followers) show(found)
      },
      () => undefined,
    )
  const start = () => {
    void look()
    const timer = setInterval(look, every)
    addEventListener(CHANGED, look)
    return () => {
      clearInterval(timer)
      removeEventListener(CHANGED, look)
    }
  }
  return {
    /** The last listing, so a screen opening shows it at once. */
    last: (): Found => last,
    /** Each listing from now shown with `show`, the first to follow starting it. Gives back what stops following; the last to stop stops the listing. */
    follow(show: (found: Found) => void): () => void {
      followers.add(show)
      stop ??= start()
      return () => {
        followers.delete(show)
        if (followers.size > 0) return
        stop?.()
        stop = null
      }
    },
  }
}

/** Every profile's new inbox entries, as this device lists them at the host. */
export const newMessagesListing = listing(() => newMessages(config.host, profiles()))
