// How the app is built and served: Vercel runs ./standard.sh, then the build; the strict content
// security policy lets the page reach only its own origin and the services in its one config file;
// a missing chunk is a 404, never the page, so a page left open across a deploy reloads; and the
// markets come from the directory, in each market's words.

import { readFileSync } from 'node:fs'

import { expect, test } from 'vitest'

import { directory } from '../build/markets.ts'
import { proofFiles } from '../build/proofs.ts'
import { config } from '../src/config.ts'
import { marketWords, pairOf, pairs } from '../src/markets.ts'

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const csp: string = vercel.headers.find((h: any) => h.source === '/(.*)').headers.find((h: any) => h.key === 'Content-Security-Policy').value
const directive = (name: string) => csp.split('; ').find((d) => d.startsWith(`${name} `))!.split(' ').slice(1)

test('Vercel installs, then runs ./standard.sh, then the build', () => {
  expect(vercel.installCommand).toBe('npm ci')
  expect(vercel.buildCommand).toBe('./standard.sh && npm run build')
  expect(vercel.outputDirectory).toBe('dist')
})

test('the CSP: the page reaches its own origin and its verifier, host and connector, and nothing else', () => {
  expect(config).toEqual({ app: 'https://app.forest.foundation', verifier: 'https://verifier.forest.foundation', host: 'https://host.forest.foundation', connector: 'https://mcp.forest.foundation' })
  expect(directive('connect-src')).toEqual(["'self'", config.verifier, config.host, config.connector])
  for (const name of ['default-src', 'style-src', 'img-src', 'font-src', 'worker-src', 'manifest-src']) expect(directive(name), name).toEqual(["'self'"])
  expect(directive('script-src')).toEqual(["'self'", "'wasm-unsafe-eval'"])
  for (const [name, value] of [['object-src', "'none'"], ['base-uri', "'none'"], ['frame-ancestors', "'none'"], ['form-action', "'self'"]]) expect(directive(name!), name).toEqual([value])
  expect(csp).not.toMatch(/unsafe-inline|'unsafe-eval'|data:|blob:/)
})

test('every path but a file is the page; a missing chunk or proving file is a 404', () => {
  const [rule] = vercel.rewrites
  const page = (path: string) => new RegExp(`^(?:${rule.source})$`).test(path)
  for (const path of ['/', '/back', '/new', '/settings', '/profile', '/message']) expect(page(path), path).toBe(true)
  for (const path of ['/assets/index-abc.js', '/assets/x', '/proofs/abc', '/sw.js', '/manifest.webmanifest']) expect(page(path), path).toBe(false)
  expect(vercel.redirects).toBeUndefined()
})

test("the proving files: the standard's committed setup, each under the SHA-256 setup.json names", () => {
  const files = proofFiles()
  expect(Object.keys(files).sort()).toEqual(['proofs/02b04c7c9dd1240689c72c88294641bccb619fa838fa67d06a7ae79b4093f86f.zkey', 'proofs/547464a052a93451fcd528c255c344cafe453a71443587cd6478ae5ca46683ee.wasm'])
  const total = Object.values(files).reduce((n, b) => n + b.length, 0)
  expect(total / 1e6, 'about 7 MB').toBeCloseTo(6.7, 0)
})

test("the markets: every role in the directory, in its market's words, one pick each", async () => {
  const dir = await directory()
  expect(pairs.length).toBe(dir.markets.reduce((n, m) => n + m.roles.length, 0))
  expect(pairOf('tutoring/tutor')).toMatchObject({ words: 'Tutoring · tutor', offers: true })
  expect(pairOf('home-cleaning/client')).toMatchObject({ words: 'Home cleaning · client', offers: false })
  expect(marketWords('software-development')).toBe('Software development')
  expect(new Set(pairs.map((p) => p.label)).size).toBe(pairs.length)
})
