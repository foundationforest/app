// A module that cannot be loaded: the page reloads once to take the new version, and opens back on
// its screen; the same version failing again shows its error rather than reloading in a loop.

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

let reloads = 0

beforeEach(() => {
  reloads = 0
  const store = new Map<string, string>()
  vi.stubGlobal('sessionStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) })
  vi.stubGlobal('location', { reload: () => void reloads++ })
})
afterEach(() => vi.unstubAllGlobals())

/** version.ts as a newly loaded page has it. */
const page = async () => {
  vi.resetModules()
  return import('../src/version.ts')
}

test('a module missing: one reload, back on the screen; missing again in the same version: its error', async () => {
  const gone = () => Promise.reject(new TypeError('Failed to fetch dynamically imported module'))

  let v = await page()
  await expect(v.lazy(gone)).rejects.toBeInstanceOf(v.Reloading)
  expect(v.reloadOnce(), 'asked again while the reload is under way: still reloading').toBe(true)
  expect(reloads).toBe(1)

  // The page the reload opened: back on the screen it was on, once.
  v = await page()
  expect([v.resuming(), v.resuming()]).toEqual([true, false])
  // The same version, so the module is missing for another reason: its error, and no reload.
  await expect(v.lazy(gone)).rejects.toThrow('Failed to fetch dynamically imported module')
  expect(reloads).toBe(1)
  expect(await v.lazy(async () => 'loaded')).toBe('loaded')
})
