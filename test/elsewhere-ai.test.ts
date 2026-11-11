// AI apps connected in another browser with the same seed, found here by themselves
// (src/elsewhere-ai.ts): only once a profile entry read in the page lists a key this device doesn't
// know, at the next unlock, with the seed held, once; a read that failed, at the unlock after.

import { beforeEach, expect, test, vi } from 'vitest'

import { freshDevice } from './world.ts'

const found = vi.hoisted(() => ({ calls: [] as Array<{ seed: Uint8Array; labels: string[] | undefined }>, fail: false }))

vi.mock('../src/flows/connections.ts', () => ({
  findConnections: async (_s: unknown, seed: Uint8Array, labels?: string[]) => {
    found.calls.push({ seed, labels })
    if (found.fail) throw new Error('the host did not answer')
    return []
  },
}))

const ID = 'AbCdEfGhIjKlMnOpQrStUv'
const SEED = () => new Uint8Array(32).fill(5)

beforeEach(() => {
  freshDevice()
  found.calls = []
  found.fail = false
  vi.resetModules()
})

/** The page's modules, as a page just opened has them. */
async function page() {
  const device = await import('../src/device.ts')
  const held = await import('../src/held.ts')
  const ai = await import('../src/elsewhere-ai.ts')
  device.usePasskey(ID)
  device.saveProfiles([{ label: 'tutoring/tutor', address: 'A' }])
  device.saveKnownKeys(['K1'])
  return { device, held, ai }
}

const settled = () => new Promise((r) => setTimeout(r, 0))

test('every key known: an unlock reads nothing', async () => {
  const { held, ai } = await page()
  ai.sawKeys(['K1'])
  held.hold(ID, SEED())
  await settled()
  expect(found.calls).toEqual([])
  expect(ai.toFind()).toBe(false)
})

test('a key made elsewhere: the next unlock finds the AI apps, with the seed held and the profiles listed, once', async () => {
  const { held, ai } = await page()
  ai.sawKeys(['K1', 'K2'])
  expect(ai.toFind()).toBe(true)
  expect(found.calls, 'nothing before an unlock').toEqual([])
  held.hold(ID, SEED())
  await settled()
  expect(found.calls).toHaveLength(1)
  expect(found.calls[0]!.labels).toEqual(['tutoring/tutor'])
  expect([...found.calls[0]!.seed]).toEqual([...SEED()])
  expect(ai.toFind()).toBe(false)
  held.drop()
  held.hold(ID, SEED())
  await settled()
  expect(found.calls, 'once').toHaveLength(1)
})

test('a read that failed: found at the unlock after', async () => {
  const { held, ai } = await page()
  ai.sawKeys(['K2'])
  found.fail = true
  held.hold(ID, SEED())
  await settled()
  expect(found.calls).toHaveLength(1)
  expect(ai.toFind(), 'still to find').toBe(true)
  found.fail = false
  held.drop()
  held.hold(ID, SEED())
  await settled()
  expect(found.calls).toHaveLength(2)
  expect(ai.toFind()).toBe(false)
})

test("another passkey's seed held: nothing read for it", async () => {
  const { held, ai } = await page()
  ai.sawKeys(['K2'])
  held.hold('SomeOtherPasskeyIdHere', SEED())
  await settled()
  expect(found.calls).toEqual([])
  expect(ai.toFind()).toBe(true)
})
