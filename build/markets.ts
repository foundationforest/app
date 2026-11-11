// The markets, read at build time from the markets checkout (markets/ at MARKETS) and handed to the
// app as data, the module `virtual:markets`: directory.json, build/types.json and the file of each
// market the directory lists, as the markets' browser entry takes them
// (@foundationforest/markets/browser, which src/markets.ts runs in the page, with no eval). The page
// reads no files; this runs in Node, at the build.
//
// And the icons those markets name, the module `virtual:market-icons`: each a Phosphor icon (the
// markets manual's Naming), imported by name from the app's copy of Phosphor, so the page carries
// the icons its own directory names and no others. A name this copy lacks is left out, and its
// market shows its first letter; test/avatar.test.ts fails on any name in the markets' icons.json
// this copy lacks, so a gap fails the checks before any market names it.

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

import type { Directory, Files, Market } from '@foundationforest/markets/browser'

const CHECKOUT = new URL('../markets/', import.meta.url)
const ID = 'virtual:markets'
const ICONS_ID = 'virtual:market-icons'

const read = (path: string): unknown => JSON.parse(readFileSync(new URL(path, CHECKOUT), 'utf8'))

/** The files the browser entry takes, from the checkout. */
export function files(): Files {
  const directory = read('directory.json') as Directory
  return { directory, types: read('build/types.json'), markets: directory.markets.map(({ name }) => read(`markets/${name}.json`) as Market) }
}

/** The icons a market may name: the markets' icons.json, which pins a Phosphor release. */
export const accepted = (): string[] => (read('build/icons.json') as { icons: string[] }).icons

/** A Phosphor icon's name as its React component's file is named: `graduation-cap` is GraduationCap. */
export const componentOf = (name: string) => name.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')

/** Where the app's copy of Phosphor keeps one icon's component, each in a file of its own. */
const PHOSPHOR = fileURLToPath(new URL('../node_modules/@phosphor-icons/react/dist/csr/', import.meta.url))

/** Whether the app's copy of Phosphor draws the icon of this name. */
export const drawn = (name: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) && existsSync(`${PHOSPHOR}${componentOf(name)}.es.js`)

/** The module of the icons the directory's markets name, each by its Phosphor name: those this copy of Phosphor draws. */
export function iconsModule(): string {
  const names = [...new Set(files().markets.flatMap((m) => (m.icon && drawn(m.icon) ? [m.icon] : [])))].sort()
  const imports = names.map((name, i) => `import { ${componentOf(name)}Icon as I${i} } from '@phosphor-icons/react'`)
  return `${imports.join('\n')}\nexport default { ${names.map((name, i) => `${JSON.stringify(name)}: I${i}`).join(', ')} }\n`
}

export function markets(): Plugin {
  return {
    name: 'forest:markets',
    resolveId: (id) => (id === ID || id === ICONS_ID ? `\0${id}` : undefined),
    load: (id) => (id === `\0${ID}` ? `export default ${JSON.stringify(files())}` : id === `\0${ICONS_ID}` ? iconsModule() : undefined),
  }
}
