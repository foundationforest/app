// How the app is built and served: Vercel runs ./standard.sh, then the build; the strict content
// security policy lets the page reach only its own origin and the services in its one config file,
// the map's tiles among them, and show photos only from the host, its bucket, and those picked on
// the device; every screen's
// path is the page, and a missing chunk is a 404, never the page, so a page left open across a
// deploy reloads; the markets come from the directory, in each market's words, through the browser
// entry; what the app says is its own line for every code a service answers; the host's credits
// client gets its packages at the host's own versions; and every colour the app writes outside
// theme.css is theme.css's.

import { readFileSync } from 'node:fs'

import { expect, test } from 'vitest'

import { CODES as STANDARD_CODES } from '@foundationforest/folders'

import { CODES as HOST_LIST } from '../services/host/src/codes.ts'
import { CODES as VERIFIER_LIST } from '../services/verifier/src/codes.ts'
import { files } from '../build/markets.ts'
import { proofFiles } from '../build/proofs.ts'
import { BG, INK } from '../build/shell.ts'
import { config } from '../src/config.ts'
import { rfc3339 } from '../src/fields/Moment.tsx'
import { doesWords, kindWords, marketList, marketWords, otherSide, pairOf, pairs, withArticle } from '../src/markets.ts'
import { PATHS } from '../src/paths.ts'
import { contactHref } from '../src/show.ts'
import { BG as THEME_BG } from '../src/theme.ts'
import { HOST_CODES, SOMETHING, VERIFIER_CODES, entrySays, fieldWords, hostSays, verifierSays } from '../src/words.ts'

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const csp: string = vercel.headers.find((h: any) => h.source === '/(.*)').headers.find((h: any) => h.key === 'Content-Security-Policy').value
const directive = (name: string) => csp.split('; ').find((d) => d.startsWith(`${name} `))!.split(' ').slice(1)

test('Vercel installs, then runs ./standard.sh, then the build', () => {
  expect(vercel.installCommand).toBe('npm ci')
  expect(vercel.buildCommand).toBe('./standard.sh && npm run build')
  expect(vercel.outputDirectory).toBe('dist')
})

test("the CSP: the page reaches its own origin, its verifier, host, connector and index, and the map's tiles, and nothing else; it shows photos from the host and its bucket, and those picked here; About Forest's pages are links, never reached", () => {
  expect(config).toEqual({
    app: 'https://app.forest.foundation',
    verifier: 'https://verifier.forest.foundation',
    host: 'https://host.forest.foundation',
    connector: 'https://mcp.forest.foundation',
    index: 'https://index.forest.foundation',
    tiles: 'https://tiles.openfreemap.org',
    privacy: 'https://forest.foundation/privacy',
    terms: 'https://forest.foundation/terms',
    source: 'https://github.com/foundationforest/app',
  })
  const sources = csp.split('; ').flatMap((d) => d.split(' ').slice(1))
  for (const link of [config.privacy, config.terms, config.source]) expect(sources, link).not.toContain(new URL(link).origin)
  expect(directive('connect-src')).toEqual(["'self'", config.verifier, config.host, config.connector, config.index, config.tiles])
  // The host answers a photo with a redirect to its bucket, at either address its FILES_STYLE gives.
  expect(directive('img-src')).toEqual(["'self'", 'blob:', config.host, 'https://t3.storageapi.dev', 'https://reserved-basket-15it-i6omre.t3.storageapi.dev'])
  for (const name of ['default-src', 'style-src', 'font-src', 'worker-src', 'manifest-src']) expect(directive(name), name).toEqual(["'self'"])
  expect(directive('script-src')).toEqual(["'self'", "'wasm-unsafe-eval'"])
  for (const [name, value] of [['object-src', "'none'"], ['base-uri', "'none'"], ['frame-ancestors', "'none'"], ['form-action', "'self'"]]) expect(directive(name!), name).toEqual([value])
  expect(csp).not.toMatch(/unsafe-inline|'unsafe-eval'|data:/)
  expect(csp.match(/blob:/g), 'blob: only for photos picked and not sent yet').toHaveLength(1)
})

test("every screen's path is the page; a missing chunk or proving file is a 404", () => {
  const [rule] = vercel.rewrites
  const page = (path: string) => new RegExp(`^(?:${rule.source})$`).test(path)
  expect(Object.keys(PATHS).length, 'the screens with a path of their own').toBeGreaterThan(10)
  for (const path of ['/', '/back', ...Object.values(PATHS)]) expect(page(path), path).toBe(true)
  for (const path of ['/assets/index-abc.js', '/assets/x', '/proofs/abc', '/sw.js', '/manifest.webmanifest']) expect(page(path), path).toBe(false)
  expect(vercel.redirects).toBeUndefined()
})

test("the proving files: the standard's committed setup, each under the SHA-256 setup.json names", () => {
  const files = proofFiles()
  expect(Object.keys(files).sort()).toEqual(['proofs/02b04c7c9dd1240689c72c88294641bccb619fa838fa67d06a7ae79b4093f86f.zkey', 'proofs/547464a052a93451fcd528c255c344cafe453a71443587cd6478ae5ca46683ee.wasm'])
  const total = Object.values(files).reduce((n, b) => n + b.length, 0)
  expect(total / 1e6, 'about 7 MB').toBeCloseTo(6.7, 0)
})

test("the markets: every role in the directory, in its market's words, no symbol between, one pick each", () => {
  const dir = files().directory
  expect(pairs.length).toBe(dir.markets.reduce((n, m) => n + m.roles.length, 0))
  expect(pairOf('tutoring/tutor')).toMatchObject({ words: 'Tutoring tutor', offers: true })
  expect(pairOf('home-cleaning/client')).toMatchObject({ words: 'Home cleaning client', offers: false })
  expect(pairs.some((p) => p.words.includes('/')), 'no slash').toBe(false)
  expect(marketWords('software-development')).toBe('Software development')
  expect(new Set(pairs.map((p) => p.label)).size).toBe(pairs.length)
})

test('New profile: every market, in the directory\'s order, each with every role', () => {
  expect(marketList.map((m) => m.words)).toEqual(files().directory.markets.map((m) => marketWords(m.name)))
  expect(marketList.find((m) => m.market === 'clothing')?.roles.map((p) => `I'm ${withArticle(p.role)}: ${doesWords(p.offers)}`)).toEqual(["I'm a seller: You offer", "I'm a buyer: You look for"])
  expect([withArticle('tutor'), withArticle('owner'), withArticle('employer')]).toEqual(['a tutor', 'an owner', 'an employer'])
  expect(marketList.find((m) => m.market === 'tennis-matches')?.roles.map((p) => p.label)).toEqual(['tennis-matches/player'])
  expect(marketList.flatMap((m) => m.roles)).toEqual(pairs)
})

test('the markets: each role\'s other side, and its listing in its own word', () => {
  expect(otherSide('tutoring', 'tutor')).toEqual(['student'])
  expect(otherSide('tennis-matches', 'player'), 'one role: a player plays a player').toEqual(['player'])
  expect(otherSide('tutoring', 'nobody')).toEqual([])
  expect([kindWords('listing', 'tutoring/tutor'), kindWords('listing', 'tutoring/student'), kindWords('listing', 'tennis-matches/player'), kindWords('vouch', 'tutoring/tutor')]).toEqual(['Offer', 'Request', 'Request', 'Vouch'])
})

test("every code the verifier, the host and the standard list has its own plain line, and none reaches the screen", () => {
  for (const code of VERIFIER_LIST) expect(VERIFIER_CODES, code).toContain(code)
  for (const code of [...STANDARD_CODES, ...HOST_LIST]) expect(HOST_CODES, code).toContain(code)
  for (const code of VERIFIER_CODES) expect(verifierSays(code, 'id').message, code).not.toMatch(/[a-z]+_[a-z]+|\{check\}/)
  for (const code of HOST_CODES) expect(hostSays(code).message, code).not.toMatch(/[a-z]+_[a-z]+/)
  expect(verifierSays('face_check_unavailable').message).toBe("The selfie check isn't available right now. Try again in a minute.")
  expect([verifierSays('declined').message, verifierSays('no_face_match', 'id').message]).toEqual(["That selfie didn't pass. Try again, or use your ID.", "That ID check didn't pass. Try again."])
  expect([verifierSays('duplicate_document').message, verifierSays('duplicate_document').red]).toEqual(["You've already verified with ID in another Forest. Nothing was charged.", true])
  // Ahead of SERVICES: services' next verifier answers face_seen, and not_paid for a hold that ended or was never made.
  expect([verifierSays('face_seen').message, verifierSays('not_paid', 'id').message]).toEqual(['A similar face is already verified. Verify with your ID to continue.', 'Nothing is held on your card for this check. Pay to continue.'])
  expect(verifierSays('not_for_sale').message).toBe("The ID check isn't available yet.")
  expect(verifierSays('a_code_from_tomorrow').message).toBe(SOMETHING)
})

test("the host's credits client: every package it imports but the standard's, at the host's own version", () => {
  const client = readFileSync(new URL('../services/host/client/client.ts', import.meta.url), 'utf8')
  const imported = [...client.matchAll(/^import\b[^;]*?\bfrom '([^']+)'/gm)].map(([, name]) => name!).filter((name) => !/^(\.|node:|@foundationforest\/)/.test(name))
  expect(imported.length, 'it imports some').toBeGreaterThan(0)
  const app = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const host = JSON.parse(readFileSync(new URL('../services/host/package.json', import.meta.url), 'utf8'))
  for (const name of imported) expect(app.dependencies[name], name).toBe(host.dependencies[name])
})

test("every colour the app writes outside theme.css: theme.css's ground and ink, light and dark", () => {
  const css = readFileSync(new URL('../src/theme.css', import.meta.url), 'utf8')
  const block = (selector: string) => css.slice(css.indexOf(selector)).split('}')[0]!
  const token = (selector: string, name: string) => new RegExp(`--${name}:\\s*(#[0-9a-f]{6});`, 'i').exec(block(selector))![1]!.toLowerCase()
  const light = { bg: token(':root {', 'bg'), ink: token(':root {', 'ink') }
  const dark = { bg: token(":root[data-theme='dark'] {", 'bg'), ink: token(":root[data-theme='dark'] {", 'ink') }
  expect(token(":root:not([data-theme='light']) {", 'bg'), "the device's dark, as the chosen one").toBe(dark.bg)
  expect(THEME_BG, 'theme.ts, for the browser bars').toEqual({ light: light.bg, dark: dark.bg })
  expect([BG.toLowerCase(), INK.toLowerCase()], "the icons and the manifest's colours (build/shell.ts)").toEqual([light.bg, light.ink])
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const meta = (scheme: string) => new RegExp(`<meta name="theme-color" content="(#[0-9a-f]{6})" media="\\(prefers-color-scheme: ${scheme}\\)"`, 'i').exec(html)?.[1]?.toLowerCase()
  expect([meta('light'), meta('dark')], "index.html's theme colours").toEqual([light.bg, dark.bg])
})

test("checkEntry's words, as one line naming the field by its name in words", () => {
  expect(fieldWords('groupSize')).toBe('Group size')
  expect(entrySays('subjects takes a list, each different, each one of maths, physics', ['subjects']).message).toBe("Subjects doesn't fit.")
  expect(entrySays('a listing in tutoring has no field colour', ['colour']).message).toBe("Colour doesn't fit.")
  expect(entrySays('tutoring is not a market in the directory', ['description']).message).toBe("This doesn't fit the market.")
})

test('a contact opens with a tap: a phone, an email, a link; a handle shows as it is', () => {
  expect(contactHref('+34 600 123 456')).toBe('tel:+34600123456')
  expect(contactHref('ada@example.com')).toBe('mailto:ada@example.com')
  expect(contactHref('https://example.com/ada')).toBe('https://example.com/ada')
  expect(contactHref('@ada')).toBeUndefined()
})

test('a moment with its offset', () => {
  expect(rfc3339('2026-11-02T18:00')).toMatch(/^2026-11-02T18:00:00[+-]\d\d:\d\d$/)
  expect(rfc3339('')).toBeUndefined()
})
