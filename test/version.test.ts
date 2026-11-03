// A module that cannot be loaded after a deploy: the page reloads once to take the new version, on
// the same path, so the same screen; the same version failing again shows its error rather than
// reloading in a loop. And a newer version live, told by the page the server gives now.

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

test("a newer version live: the server's page names another entry script; the same one, or no answer, is none", async () => {
  const v = await page()
  const html = (entry: string) => `<!doctype html><html><head><script type="module" crossorigin src="${entry}"></script><script id="vite-plugin-pwa:register-sw" src="/registerSW.js"></script></head></html>`
  expect(v.entryIn(html('/assets/index-B1.js')), 'its module script, not the service worker\'s').toBe('/assets/index-B1.js')
  expect(v.entryIn('<script src="/registerSW.js"></script>')).toBeNull()
  const serving = (body: string, status = 200) => async () => new Response(body, { status })
  expect(await v.newerLive('/assets/index-B1.js', serving(html('/assets/index-C2.js')))).toBe(true)
  expect(await v.newerLive('/assets/index-B1.js', serving(html('/assets/index-B1.js'))), 'the same version').toBe(false)
  expect(await v.newerLive('/assets/index-B1.js', serving('', 503)), 'the server not answering well').toBe(false)
  expect(await v.newerLive('/assets/index-B1.js', () => Promise.reject(new TypeError('offline'))), 'no connection').toBe(false)
  expect(await v.newerLive(null, serving(html('/assets/index-C2.js'))), 'a page that names none, as in development').toBe(false)
})
