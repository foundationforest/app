// How the app is built and served: Vercel runs ./standard.sh, then the build; the strict content
// security policy lets the page reach only its own origin and the services in its one config file,
// the map's tiles among them, and show photos only from the host, its bucket, and those picked on
// the device; every screen's
// path is the page, and a missing chunk is a 404, never the page, so a page left open across a
// deploy reloads; the markets come from the directory, in each market's words, through the browser
// entry; what the app says is its own line for every code a service answers; the host's credits
// client gets its packages at the host's own versions; and every colour the app writes outside
// theme.css is theme.css's.

import { readFileSync, readdirSync } from 'node:fs'

import { expect, test } from 'vitest'

import { CODES as STANDARD_CODES } from '@foundationforest/folders'

import { CODES as HOST_LIST } from '../services/host/src/codes.ts'
import { CODES as VERIFIER_LIST } from '../services/verifier/src/codes.ts'
import { files } from '../build/markets.ts'
import { proofFiles } from '../build/proofs.ts'
import { BG, INK } from '../build/shell.ts'
import { config } from '../src/config.ts'
import { rfc3339 } from '../src/fields/Moment.tsx'
import { kindWords, listOf, listed, marketList, marketWords, markets, otherSide, pairOf, pairs, roleWords, tileName } from '../src/markets.ts'
import { PATHS, RETURNS } from '../src/paths.ts'
import { contactHref } from '../src/show.ts'
import { BG as THEME_BG } from '../src/theme.ts'
import { HOST_CODES, SOMETHING, VERIFIER_CODES, entrySays, fieldWords, hostSays, verifierSays } from '../src/words.ts'
import { oneRole, twoSides } from './directory.ts'

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

test("every screen's path is the page, and Stripe's and Didit's ways back; a missing chunk or proving file is a 404", () => {
  const [rule] = vercel.rewrites
  const page = (path: string) => new RegExp(`^(?:${rule.source})$`).test(path)
  expect(Object.keys(PATHS).length, 'the screens with a path of their own').toBeGreaterThan(10)
  expect(RETURNS, "Stripe's way back, and Didit's").toEqual({ paid: '/paid', checked: '/back' })
  for (const path of ['/', ...Object.values(RETURNS), ...Object.values(PATHS)]) expect(page(path), path).toBe(true)
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
  const { offer, request } = twoSides(markets)
  expect(pairs.length).toBe(dir.markets.reduce((n, m) => n + m.roles.length, 0))
  expect(pairOf(offer.label)).toMatchObject({ words: `${marketWords(offer.market.name)} ${offer.role}`, offers: true })
  expect(pairOf(request.label)).toMatchObject({ words: `${marketWords(request.market.name)} ${request.role}`, offers: false })
  expect(pairs.some((p) => p.words.includes('/')), 'no slash').toBe(false)
  expect([marketWords('pottery-classes'), marketWords('pottery')]).toEqual(['Pottery classes', 'Pottery'])
  expect(new Set(pairs.map((p) => p.label)).size).toBe(pairs.length)
})

test("New profile: every market, live and beta alike, in the directory's order, each with every role", () => {
  expect(marketList.map((m) => m.words)).toEqual(files().directory.markets.map((m) => marketWords(m.name)))
  const { market, offer, request } = twoSides(markets)
  expect(marketList.find((m) => m.market === market.name)?.roles.map((p) => roleWords(p.role))).toEqual(market.roles.map((r) => roleWords(r.role)))
  expect(market.roles.map((r) => r.role)).toEqual(expect.arrayContaining([offer.role, request.role]))
  expect([roleWords('tutor'), roleWords('house-sitter')]).toEqual(['Tutor', 'House sitter'])
  const one = oneRole(markets)
  expect(marketList.find((m) => m.market === one.market.name)?.roles.map((p) => p.label)).toEqual([one.label])
  expect(marketList.flatMap((m) => m.roles)).toEqual(pairs)
})

test('a beta market is beta, a live one is not; both are listed', () => {
  for (const m of marketList) expect(m.beta, m.market).toBe(markets.market(m.market)!.status === 'beta')
  // The same directory with its first market live: listed still, not beta; the rest as they were.
  const dir = files().directory
  const [first, ...rest] = dir.markets
  const live = listOf({ markets: [{ ...first!, status: 'live' }, ...rest] })
  expect(live.map((m) => m.market)).toEqual(marketList.map((m) => m.market))
  expect(live[0]!.beta).toBe(false)
  expect(live.slice(1).map((m) => m.beta)).toEqual(marketList.slice(1).map((m) => m.beta))
})

test("a profile whose market is gone is not listed, so the device forgets it; every market's role is; one is named from its label", () => {
  for (const p of pairs) expect(listed(p.label), p.label).toBe(true)
  expect(markets.market('pottery'), 'a market the directory does not list').toBeUndefined()
  expect(listed('pottery/potter')).toBe(false)
  expect(pairOf('pottery/potter')).toMatchObject({ words: 'Pottery potter', offers: false })
})

test("a market's name on its tile, from the directory alone: its first word small over the rest where another market shares it", () => {
  const names = ['stays-work', 'stays-free', 'home-cleaning', 'language-exchange', 'goods']
  expect(names.map((n) => tileName(n, names))).toEqual([
    { family: 'Stays', kind: 'Work' },
    { family: 'Stays', kind: 'Free' },
    { kind: 'Home cleaning' },
    { kind: 'Language exchange' },
    { kind: 'Goods' },
  ])
  expect(tileName('stays', ['stays', 'stays-free']), 'one word alone: nothing to split').toEqual({ kind: 'Stays' })
  // Each tile in the directory at MARKETS: its words whole, for the search and its name, and split only where shared.
  for (const m of marketList) {
    expect([m.family, m.kind].filter(Boolean).join(' ').toLowerCase(), m.market).toBe(m.words.toLowerCase())
    const first = m.market.split('-')[0]
    expect(!!m.family, m.market).toBe(m.market.includes('-') && marketList.some((o) => o.market !== m.market && o.market.split('-')[0] === first))
  }
})

test("a market's page: its summary, the line its file gives for where someone picks a market", () => {
  for (const m of marketList) {
    const { summary } = markets.directory.markets.find((d) => d.name === m.market)!
    expect(summary.length, m.market).toBeGreaterThan(0)
    expect(m.summary, m.market).toBe(summary)
  }
})

test("the markets: each role's other side, and its listing in its own word", () => {
  const { market, offer, request } = twoSides(markets)
  expect(otherSide(market.name, offer.role)).toContain(request.role)
  expect(otherSide(market.name, offer.role)).not.toContain(offer.role)
  const one = oneRole(markets)
  expect(otherSide(one.market.name, one.role), 'one role: its profiles deal with each other').toEqual([one.role])
  expect(otherSide(market.name, 'nobody')).toEqual([])
  expect(otherSide('pottery', 'potter'), 'a market that is gone has no other side').toEqual([])
  const word = (s: { offers: boolean }) => (s.offers ? 'Offer' : 'Request')
  expect([kindWords('listing', offer.label), kindWords('listing', request.label), kindWords('listing', one.label), kindWords('listing', 'pottery/potter'), kindWords('vouch', offer.label)]).toEqual(['Offer', 'Request', word(one), 'Listing', 'Vouch'])
})

test("every code the verifier, the host and the standard list has its own plain line, and none reaches the screen", () => {
  for (const code of VERIFIER_LIST) expect(VERIFIER_CODES, code).toContain(code)
  for (const code of [...STANDARD_CODES, ...HOST_LIST]) expect(HOST_CODES, code).toContain(code)
  for (const code of VERIFIER_CODES) expect(verifierSays(code, 'id').message, code).not.toMatch(/[a-z]+_[a-z]+|\{check\}/)
  for (const code of HOST_CODES) expect(hostSays(code).message, code).not.toMatch(/[a-z]+_[a-z]+/)
  expect(verifierSays('face_check_unavailable').message).toBe("The selfie check isn't available right now. Try again in a minute.")
  expect([verifierSays('declined').message, verifierSays('no_face_match', 'id').message]).toEqual(["That selfie didn't pass. Try again, or use your ID.", "That ID check didn't pass. Try again."])
  expect(verifierSays('duplicate_document', 'id').message).toBe('This ID is already verified with another passkey. Nothing was charged.')
  expect(verifierSays('face_seen').message).toBe('A similar face is already verified. Verify with your ID instead.')
  for (const code of ['not_paid', 'payment_used']) expect(verifierSays(code, 'id').message, code).toBe('Your tries are used up. Nothing was charged. Pay again to continue.')
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

test('nothing floats: no sheet, no dialog, no scrim, anywhere in the app; only the device\'s own passkey prompt floats', () => {
  const code = (dir: URL): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? code(new URL(`${e.name}/`, dir)) : /\.(tsx?|css)$/.test(e.name) ? [readFileSync(new URL(e.name, dir), 'utf8')] : []))
  const all = code(new URL('../src/', import.meta.url)).join('\n')
  expect(all).not.toMatch(/role="dialog"|aria-modal|<Sheet\b|\.sheet\b|\.scrim\b|--scrim/)
})

test("CI runs in Playwright's own image at the version package.json pins, so its Chromium is the one the browser test drives", () => {
  const workflow = readFileSync(new URL('../.github/workflows/checks.yml', import.meta.url), 'utf8')
  const pinned = (JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { devDependencies: Record<string, string> }).devDependencies.playwright
  expect(workflow.match(/image: mcr\.microsoft\.com\/playwright:v([^\s-]+)-noble/)?.[1]).toBe(pinned)
  expect(workflow, 'nothing installed from Ubuntu at run time').not.toMatch(/playwright install/)
})

test("checkEntry's words, as one line naming the field by its name in words", () => {
  expect(fieldWords('groupSize')).toBe('Group size')
  expect(entrySays('subjects takes a list, each different, each one of maths, physics', ['subjects']).message).toBe("Subjects doesn't fit.")
  expect(entrySays('a listing in pottery has no field colour', ['colour']).message).toBe("Colour doesn't fit.")
  expect(entrySays('pottery is not a market in the directory', ['description']).message).toBe("This doesn't fit the market.")
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
