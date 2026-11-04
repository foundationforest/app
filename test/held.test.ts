// The seed held in the page after an unlock (src/held.ts): 5 minutes since the last action, or until
// the page closes; kept while the page is hidden; never zeroed under an action still using it; and
// used by what the page does by itself without restarting the 5 minutes.

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

test('kept while the page is hidden, as a window another covers is, or a tab not in front; dropped at once when it closes; told each time', async () => {
  const held = await load()
  let told = 0
  held.onHeld(() => void told++)
  await held.withHeld('a', unlock, async () => undefined)
  expect(told).toBe(1)
  hide()
  expect([held.isHeld(), told], 'hidden: still held').toEqual([true, 1])
  await held.withHeld('a', unlock, async () => undefined)
  expect(unlocks, 'an action on a hidden page asks nothing').toBe(1)
  page.window.dispatchEvent(new Event('pagehide'))
  expect([held.isHeld(), told], 'closed: dropped').toEqual([false, 2])
  await held.withHeld('a', unlock, async () => undefined)
  expect(unlocks, 'the next action asks again').toBe(2)
})

test('an action running when the page closes finishes with the seed, zeroed only as it ends', async () => {
  const held = await load()
  let release!: () => void
  const running = held.withHeld('a', unlock, async (seed) => {
    page.window.dispatchEvent(new Event('pagehide'))
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

test("what the page does by itself uses the seed held, asks nothing, and never restarts the 5 minutes; with none held, it does nothing", async () => {
  const held = await load()
  expect(await held.ifHeld('a', async () => 'opened'), 'none held: nothing done').toBe(undefined)
  await held.withHeld('a', unlock, async () => undefined)
  await vi.advanceTimersByTimeAsync(4 * 60_000)
  expect(await held.ifHeld('a', async () => 'opened')).toBe('opened')
  expect(await held.ifHeld('b', async () => 'opened'), "another passkey's: nothing").toBe(undefined)
  await vi.advanceTimersByTimeAsync(60_000 + 1)
  expect([held.isHeld(), unlocks], '5 minutes after the last action, the page\'s own use counting for nothing: dropped').toEqual([false, 1])
})

test('moved to another passkey, the same seed: held for that one, asking nothing', async () => {
  const held = await load()
  await held.withHeld('a', unlock, async () => held.moveTo('b'))
  expect([held.isHeldFor('a'), held.isHeldFor('b')]).toEqual([false, true])
  await held.withHeld('b', unlock, async (seed) => expect([...seed].every((x) => x === 7)).toBe(true))
  expect(unlocks).toBe(1)
})
