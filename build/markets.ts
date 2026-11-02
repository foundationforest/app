// The markets, read at build time from the markets checkout (markets/ at MARKETS) and handed to the
// app as data, the module `virtual:markets`: directory.json, build/types.json and the file of each
// market the directory lists, as the markets' browser entry takes them
// (@foundationforest/markets/browser, which src/markets.ts runs in the page, with no eval). The page
// reads no files; this runs in Node, at the build.

import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

import type { Directory, Files, Market } from '@foundationforest/markets/browser'

const CHECKOUT = new URL('../markets/', import.meta.url)
const ID = 'virtual:markets'

const read = (path: string): unknown => JSON.parse(readFileSync(new URL(path, CHECKOUT), 'utf8'))

/** The files the browser entry takes, from the checkout. */
export function files(): Files {
  const directory = read('directory.json') as Directory
  return { directory, types: read('build/types.json'), markets: directory.markets.map(({ name }) => read(`markets/${name}.json`) as Market) }
}

export function markets(): Plugin {
  return {
    name: 'forest:markets',
    resolveId: (id) => (id === ID ? `\0${ID}` : undefined),
    load: (id) => (id === `\0${ID}` ? `export default ${JSON.stringify(files())}` : undefined),
  }
}
