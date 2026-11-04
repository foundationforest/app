// How the app is built and served: Vercel runs ./standard.sh, then the build; the strict content
// security policy lets the page reach only its own origin and the services in its one config file,
// and show photos only from the host, its bucket, and those picked on the device;
// a missing chunk is a 404, never the page, so a page left open across a deploy reloads; the markets
// come from the directory, in each market's words, through the browser entry; and what the app says
// is the verifier's consent screen word for word, and its own line for every code a service answers.

import { readFileSync } from 'node:fs'

import { expect, test } from 'vitest'

import { files } from '../build/markets.ts'
import { proofFiles } from '../build/proofs.ts'
import { config } from '../src/config.ts'
import { CONSENT } from '../src/consent.ts'
import { placeLine } from '../src/fields/Place.tsx'
import { rfc3339 } from '../src/fields/Moment.tsx'
import { kindWords, marketList, marketWords, otherSide, pairOf, pairs, roleWords } from '../src/markets.ts'
import { contactHref } from '../src/show.ts'
import { HOST_CODES, SOMETHING, VERIFIER_CODES, entrySays, fieldWords, verifierSays } from '../src/words.ts'

const readme = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const csp: string = vercel.headers.find((h: any) => h.source === '/(.*)').headers.find((h: any) => h.key === 'Content-Security-Policy').value
const directive = (name: string) => csp.split('; ').find((d) => d.startsWith(`${name} `))!.split(' ').slice(1)

test('Vercel installs, then runs ./standard.sh, then the build', () => {
  expect(vercel.installCommand).toBe('npm ci')
  expect(vercel.buildCommand).toBe('./standard.sh && npm run build')
  expect(vercel.outputDirectory).toBe('dist')
})

test('the CSP: the page reaches its own origin and its verifier, host, connector and index, and nothing else; it shows photos from the host and its bucket, and those picked here', () => {
  expect(config).toEqual({ app: 'https://app.forest.foundation', verifier: 'https://verifier.forest.foundation', host: 'https://host.forest.foundation', connector: 'https://mcp.forest.foundation', index: 'https://index.forest.foundation' })
  expect(directive('connect-src')).toEqual(["'self'", config.verifier, config.host, config.connector, config.index])
  // The host answers a photo with a redirect to its bucket, at either address its FILES_STYLE gives.
  expect(directive('img-src')).toEqual(["'self'", 'blob:', config.host, 'https://t3.storageapi.dev', 'https://reserved-basket-15it-i6omre.t3.storageapi.dev'])
  for (const name of ['default-src', 'style-src', 'font-src', 'worker-src', 'manifest-src']) expect(directive(name), name).toEqual(["'self'"])
  expect(directive('script-src')).toEqual(["'self'", "'wasm-unsafe-eval'"])
  for (const [name, value] of [['object-src', "'none'"], ['base-uri', "'none'"], ['frame-ancestors', "'none'"], ['form-action', "'self'"]]) expect(directive(name!), name).toEqual([value])
  expect(csp).not.toMatch(/unsafe-inline|'unsafe-eval'|data:/)
  expect(csp.match(/blob:/g), 'blob: only for photos picked and not sent yet').toHaveLength(1)
})

test('every path but a file is the page; a missing chunk or proving file is a 404', () => {
  const [rule] = vercel.rewrites
  const page = (path: string) => new RegExp(`^(?:${rule.source})$`).test(path)
  for (const path of ['/', '/back', '/new', '/settings', '/profile', '/reviews', '/received', '/review', '/inbox', '/message', '/thread', '/post', '/id']) expect(page(path), path).toBe(true)
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
  expect(marketList.find((m) => m.market === 'clothing')?.roles.map((p) => roleWords(p.role))).toEqual(['Seller', 'Buyer'])
  expect(marketList.find((m) => m.market === 'tennis-matches')?.roles.map((p) => p.label)).toEqual(['tennis-matches/player'])
  expect(marketList.flatMap((m) => m.roles)).toEqual(pairs)
})

test('the markets: each role\'s other side, and its post in its own word', () => {
  expect(otherSide('tutoring', 'tutor')).toEqual(['student'])
  expect(otherSide('tennis-matches', 'player'), 'one role: a player plays a player').toEqual(['player'])
  expect(otherSide('tutoring', 'nobody')).toEqual([])
  expect([kindWords('post', 'tutoring/tutor'), kindWords('post', 'tutoring/student'), kindWords('post', 'tennis-matches/player'), kindWords('vouch', 'tutoring/tutor')]).toEqual(['Offer', 'Request', 'Post', 'Vouch'])
})

test("the ID check's consent screen: the verifier's, word for word, at SERVICES", () => {
  const text = readme('../services/verifier/README.md')
  const block = text.slice(text.indexOf('**The consent screen.**')).split('\n\n')[1]!
  expect(CONSENT).toBe(block.split('\n').map((l) => l.replace(/^> /, '')).join(' '))
})

test('every code the verifier and the host answer has its own plain line, and none reaches the screen', () => {
  const verifier = readme('../services/verifier/README.md')
  const errors = verifier.slice(verifier.indexOf('Errors are `{"error": "<code>"}`'), verifier.indexOf('## How we run it'))
  const listed = [...errors.matchAll(/`(?:\d{3} )?([a-zA-Z_]+)`/g)].map(([, code]) => code!)
  expect(listed.length, 'the README lists them').toBeGreaterThan(30)
  for (const code of listed) expect(VERIFIER_CODES, code).toContain(code)
  const folders = readme('../standard/folders/README.md')
  const plug = [...folders.matchAll(/\[`[a-z_]+`(?:,\s+`[a-z_]+`)*\]/g)].flatMap((m) => m[0].match(/[a-z_]+/g)!)
  expect(plug, "the standard's checks, every one").toEqual(expect.arrayContaining(['canonical', 'signature', 'future', 'older', 'no_inbox', 'hash']))
  const host = readme('../services/host/README.md')
  const front = [...host.slice(host.indexOf('## Its API'), host.indexOf('## How we run it')).matchAll(/`([a-z_]+)`(?: \(\d{3})?/g)].map(([, c]) => c!).filter((c) => !/^(profile|after|to|folder|credits|ticket|balance|key|signature|id)$/.test(c) || HOST_CODES.includes(c))
  for (const code of [...plug, ...front]) expect(HOST_CODES, code).toContain(code)
  for (const code of VERIFIER_CODES) {
    const said = verifierSays(code, 'id')
    expect(said.message, code).not.toMatch(/[a-z]+_[a-z]+|\{check\}/)
  }
  expect(verifierSays('face_check_unavailable').message).toBe("The face check isn't available right now. Try again in a minute.")
  expect([verifierSays('duplicate_document').message, verifierSays('duplicate_document').red]).toEqual(['This ID was already used to verify someone else.', true])
  expect(verifierSays('not_for_sale').message).toBe("The ID check isn't available yet.")
  expect(verifierSays('a_code_from_tomorrow').message).toBe(SOMETHING)
})

test("checkEntry's words, as one line naming the field by its name in words", () => {
  expect(fieldWords('groupSize')).toBe('Group size')
  expect(entrySays('subjects takes a list, each different, each one of maths, physics', ['subjects']).message).toBe("Subjects doesn't fit.")
  expect(entrySays('a post in tutoring has no field colour', ['colour']).message).toBe("Colour doesn't fit.")
  expect(entrySays('tutoring is not a market in the directory', ['description']).message).toBe("This doesn't fit the market.")
})

test('a contact opens with a tap: a phone, an email, a link; a handle shows as it is', () => {
  expect(contactHref('+34 600 123 456')).toBe('tel:+34600123456')
  expect(contactHref('ada@example.com')).toBe('mailto:ada@example.com')
  expect(contactHref('https://example.com/ada')).toBe('https://example.com/ada')
  expect(contactHref('@ada')).toBeUndefined()
})

test("a place's one line in its form: how far round it reaches from you, after the area when there is one; a moment with its offset", () => {
  expect(placeLine('', 5)).toBe('Within 5 km of you')
  expect(placeLine(' Lavapiés ', 2)).toBe('Lavapiés, within 2 km of you')
  expect(placeLine('', 0), 'radius 0, picked on the slider: the exact spot').toBe('Right where you are')
  expect(placeLine('Court 3', 0)).toBe('Court 3, right where you are')
  expect(rfc3339('2026-11-02T18:00')).toMatch(/^2026-11-02T18:00:00[+-]\d\d:\d\d$/)
  expect(rfc3339('')).toBeUndefined()
})
