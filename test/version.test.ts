// A module that cannot be loaded after a deploy: the page reloads once to take the new version, on
// the same path, so the same screen; the same version failing again shows its error rather than
// reloading in a loop.

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { memoryStorage } from './world.ts'

let reloads = 0

beforeEach(() => {
  reloads = 0
  vi.stubGlobal('sessionStorage', memoryStorage())
  vi.stubGlobal('location', { reload: () => void reloads++ })
})
afterEach(() => vi.unstubAllGlobals())

/** version.ts as a newly loaded page has it. */
const page = async () => {
  vi.resetModules()
  return import('../src/version.ts')
}

test('a module missing: one reload; missing again in the same version: its error', async () => {
  const gone = () => Promise.reject(new TypeError('Failed to fetch dynamically imported module'))

  let v = await page()
  await expect(v.lazy(gone)).rejects.toBeInstanceOf(v.Reloading)
  expect(v.reloadOnce(), 'asked again while the reload is under way: still reloading').toBe(true)
  expect(reloads).toBe(1)

  // The page the reload opened: the same version, so the module is missing for another reason.
  v = await page()
  await expect(v.lazy(gone)).rejects.toThrow('Failed to fetch dynamically imported module')
  expect(reloads).toBe(1)
  expect(await v.lazy(async () => 'loaded')).toBe('loaded')
})
