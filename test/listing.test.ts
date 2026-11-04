// The new inbox entries' listing, one for the page: started by the first screen that follows it and
// stopped with the last; now, every half minute, and whenever the device changes, however many
// screens follow it.

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { CHANGED } from '../src/device.ts'
import { LIST_EVERY_MS, listing } from '../src/listing.ts'

/** The page's events, as a browser's window has them. */
const page = new EventTarget()
beforeEach(() => {
  vi.useFakeTimers()
  Object.assign(globalThis, { addEventListener: page.addEventListener.bind(page), removeEventListener: page.removeEventListener.bind(page) })
})
afterEach(() => {
  vi.useRealTimers()
  for (const name of ['addEventListener', 'removeEventListener']) delete (globalThis as Record<string, unknown>)[name]
})

test('two screens, one listing: now, every half minute and on a change; still with one left, none with none, and now again for the next first', async () => {
  let lists = 0
  const l = listing(async () => ({ A: [`entry-${++lists}`] }))
  const shown: string[][] = [[], []]
  const leaveA = l.follow((f) => shown[0]!.push(f.A![0]!))
  const leaveB = l.follow((f) => shown[1]!.push(f.A![0]!))
  expect(lists, 'one listing now, for both').toBe(1)
  await vi.advanceTimersByTimeAsync(0)
  expect(shown, 'each shown it').toEqual([['entry-1'], ['entry-1']])

  await vi.advanceTimersByTimeAsync(LIST_EVERY_MS)
  expect(lists, 'one every half minute').toBe(2)
  page.dispatchEvent(new Event(CHANGED))
  expect(lists, 'one on a change of the device').toBe(3)

  leaveA()
  await vi.advanceTimersByTimeAsync(LIST_EVERY_MS)
  expect(lists, 'one screen left: still listing').toBe(4)
  leaveB()
  await vi.advanceTimersByTimeAsync(3 * LIST_EVERY_MS)
  page.dispatchEvent(new Event(CHANGED))
  expect(lists, 'none left: stopped').toBe(4)
  expect(l.last(), 'the last listing kept, for the next screen to show at once').toEqual({ A: ['entry-4'] })

  const leaveC = l.follow(() => undefined)
  expect(lists, 'the next first screen: one listing now').toBe(5)
  leaveC()
})
