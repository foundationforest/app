// The seed held in the page after an unlock (src/held.ts): 5 minutes, which each action restarts;
// dropped at once when the page is hidden or closed; never zeroed under an action still using it.

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

/** A page: its document's visibility, and the events it sends. */
let page: { document: EventTarget & { visibilityState: string }; window: EventTarget }
let unlocks = 0

beforeEach(() => {
  vi.useFakeTimers()
  unlocks = 0
  const document = Object.assign(new EventTarget(), { visibilityState: 'visible' })
  const window = new EventTarget()
  page = { document, window }
  vi.stubGlobal('document', document)
  vi.stubGlobal('addEventListener', window.addEventListener.bind(window))
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** held.ts as a newly loaded page has it. */
const load = async () => {
  vi.resetModules()
  return import('../src/held.ts')
}

/** What the passkey gives after an unlock, counted. */
const unlock = async () => {
  unlocks++
  return new Uint8Array(32).fill(7)
}

const hide = () => {
  page.document.visibilityState = 'hidden'
  page.document.dispatchEvent(new Event('visibilitychange'))
}

test('after an unlock, the next actions ask nothing for 5 minutes; each action starts them again', async () => {
  const held = await load()
  const seeds: Uint8Array[] = []
  const act = () => held.withHeld('a', unlock, async (seed) => void seeds.push(seed))
  await act()
  expect([unlocks, held.isHeld(), held.isHeldFor('a')]).toEqual([1, true, true])
  await vi.advanceTimersByTimeAsync(4 * 60_000)
  await act()
  expect(unlocks, 'within 5 minutes: nothing asked').toBe(1)
  await vi.advanceTimersByTimeAsync(4 * 60_000)
  expect(held.isHeld(), 'the second action started the 5 minutes again').toBe(true)
  await vi.advanceTimersByTimeAsync(60_000 + 1)
  expect(held.isHeld(), '5 minutes after the last action: dropped').toBe(false)
  expect([...seeds[0]!].every((b) => b === 0), 'and zeroed').toBe(true)
  await act()
  expect(unlocks, 'the next action asks again').toBe(2)
})

test('dropped at once when the page is hidden, or closed; told each time', async () => {
  const held = await load()
  let told = 0
  held.onHeld(() => void told++)
  await held.withHeld('a', unlock, async () => undefined)
  expect(told).toBe(1)
  hide()
  expect([held.isHeld(), told]).toEqual([false, 2])
  page.document.visibilityState = 'visible'
  await held.withHeld('a', unlock, async () => undefined)
  page.window.dispatchEvent(new Event('pagehide'))
  expect([held.isHeld(), unlocks]).toEqual([false, 2])
})

test('an action running when the page is hidden finishes with the seed, zeroed only as it ends', async () => {
  const held = await load()
  let release!: () => void
  const running = held.withHeld('a', unlock, async (seed) => {
    hide()
    expect(held.isHeld(), 'held no more').toBe(false)
    await new Promise<void>((r) => (release = r))
    expect([...seed].every((b) => b === 7), 'its bytes untouched while it runs').toBe(true)
    return seed
  })
  await vi.advanceTimersByTimeAsync(0)
  release()
  const seed = await running
  expect([...seed].every((b) => b === 0), 'zeroed once it ended').toBe(true)
})

test('only the passkey in use: another one asks, and holds its own in its place', async () => {
  const held = await load()
  await held.withHeld('a', unlock, async () => undefined)
  await held.withHeld('b', unlock, async () => undefined)
  expect([unlocks, held.isHeldFor('a'), held.isHeldFor('b')]).toEqual([2, false, true])
  held.drop()
  expect(held.isHeld(), 'Forget drops it').toBe(false)
})

test('a page already hidden as an unlock answers keeps the seed no longer than its action', async () => {
  const held = await load()
  page.document.visibilityState = 'hidden'
  const seed = await held.withHeld('a', unlock, async (s) => s)
  expect(held.isHeld()).toBe(false)
  expect([...seed].every((b) => b === 0)).toBe(true)
})
