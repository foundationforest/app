// The markets directory, read at build time through the markets' own package
// (@foundationforest/markets, markets/build/ at MARKETS) and handed to the app as the module
// `virtual:markets`. The package reads its checkout from disk, so it runs here, in Node, never in
// the page; its dist is loaded as it is, by its path, so its own dependencies come from its own
// node_modules.

import { fileURLToPath, pathToFileURL } from 'node:url'
import type { Plugin } from 'vite'

const CHECKOUT = fileURLToPath(new URL('../markets/', import.meta.url))
const ID = 'virtual:markets'

/** The directory, as the markets' package loads it from the checkout. */
export async function directory(): Promise<import('@foundationforest/markets').Directory> {
  const { loadMarkets } = (await import(pathToFileURL(`${CHECKOUT}build/dist/index.js`).href)) as typeof import('@foundationforest/markets')
  return loadMarkets(CHECKOUT).directory
}

export function markets(): Plugin {
  return {
    name: 'forest:markets',
    resolveId: (id) => (id === ID ? `\0${ID}` : undefined),
    load: async (id) => (id === `\0${ID}` ? `export default ${JSON.stringify(await directory())}` : undefined),
  }
}
