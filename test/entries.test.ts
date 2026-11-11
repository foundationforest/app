// Posting, against services' own host (world.ts): every kind at <kind>/<id>, a random id, checked
// before the unlock against its market (the markets' browser entry, which answers as the Node entry
// does) and, for a review, a vouch or a report, against its subject's profile entry at the host,
// and found again when written about the same person once more;
// paid from the profile's folder, topped up from the wallet; edited at its own path; deleted. A
// listing's photos: named in its files, then each sent to the host, paid the same way; a price's per
// only from its field's list; a place a point and a radius, never an area alone. And a listing
// an older market shaped: not fitting, so not listed, and posted again with what still fits.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { createHash, randomBytes } from 'node:crypto'

import type { Body } from '@foundationforest/folders'

import { loadMarkets } from '../markets/build/dist/index.js'
import * as device from '../src/device.ts'
import { PHOTO_TYPE, newPhotos, sendPhotos, withFiles } from '../src/flows/photos.ts'
import { walletKey } from '../src/flows/profiles.ts'
import { addressIn, check, newPath, post, readEntries, subjectOf, unpost, writtenAbout } from '../src/flows/entries.ts'
import { fits, fitting } from '../src/form.ts'
import { type Field, markets } from '../src/markets.ts'
import { Said, fieldWords } from '../src/words.ts'
import { fieldWith, isFor, lessons as findLessons, oneRole, sides, twoSides } from './directory.ts'
import { type World, freshDevice, verifiedWith, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

/** The first of a role's fields that `fits`, waiting on nothing, as [name, field]. */
const fieldOf = (market: { listing: Record<string, Field> }, role: string, fits: (f: Field, name: string) => boolean) =>
  Object.entries(market.listing).find(([n, f]) => isFor(f, role) && !f.when && fits(f, n))

/** Lessons, as a tutor posts them (directory.ts): the description, a price per its first value, the first of a long list, and a contact. */
const lessons = (() => {
  const found = findLessons(markets)
  const lesson = { description: 'Maths for secondary school, one hour online.', price: { amount: '30', currency: 'USD', per: found.per[0]! }, [found.choice]: [found.market.listing[found.choice]!.values![0]!], contact: 'ada@example.com' }
  return { ...found, lesson }
})()
const MATHS = lessons.lesson
const TUTOR = lessons.offer.label
const STUDENT = lessons.request.label
const NAME = lessons.market.name

/** Another market with two sides. */
const elsewhere = twoSides(markets, (m) => m.name !== NAME)

/** A role whose listings hold photos, a price with no per, and a place, none waiting on another field: things sold, as a seller posts them. */
const shop = (() => {
  for (const side of sides(markets)) {
    const { market, role } = side
    const photos = fieldOf(market, role, (f) => f.type === 'file' && f.many === true)
    const place = fieldOf(market, role, (f) => f.type === 'place' && !f.many)
    if (photos && place && market.listing.price?.type === 'money' && !market.listing.price.per) return { ...side, photos: photos[0], place: place[0] }
  }
  throw new Error('No market in the directory has a role with photos, a price with no per, and a place')
})()

/** Why `check` refused, as the line the screen shows. */
const refusal = async (p: Promise<unknown>) => {
  const err = await p.then(() => null, (e: unknown) => e)
  if (!(err instanceof Said)) throw new Error(`not refused in words: ${String(err)}`)
  return [err.message, err.red]
}

describe('a listing', () => {
  test('checked before the unlock, posted at a random id and paid from its folder; edited at its path; deleted', async () => {
    const p = await verifiedWith(w, TUTOR)
    const me = p.profiles[0]!
    await check(w, me, 'listing', MATHS, [me])
    expect(loadMarkets().checkEntry(NAME, lessons.offer.role, 'listing', MATHS), 'the Node entry agrees').toBeNull()
    const before = await w.balance(me.address)
    const path = await post(w, p.seed, me, 'listing', MATHS)
    expect(path).toMatch(/^listing\/[0-9a-f]{32}$/)
    expect(await w.balance(me.address), "paid from the profile's folder").toBeLessThan(before)
    const [posted] = await readEntries(w, me.address)
    expect([posted?.path, posted?.kind, posted?.body, posted?.key]).toEqual([path, 'listing', MATHS, undefined])

    const edited = { ...MATHS, description: 'Maths and physics, one hour online.' }
    expect(await post(w, p.seed, me, 'listing', edited, path)).toBe(path)
    const after = await readEntries(w, me.address)
    expect(after.map((x) => [x.path, x.body.description])).toEqual([[path, edited.description]])
    expect(after[0]!.time).toBeGreaterThan(posted!.time)

    const kept = await w.balance(me.address)
    await unpost(w, p.seed, me, path)
    expect(await readEntries(w, me.address)).toEqual([])
    expect(await w.balance(me.address), 'a delete is free').toBe(kept)
  })

  test('before the unlock: a field that does not fit, in red, by its name; a listing with nothing in it, quiet; no field demanded', async () => {
    // A role, a many choice its listings hold, and a field kept for another role's listings.
    const theirs = fieldWith(markets, "kept for another role's listings", (f, _, side) => f.roles !== undefined && side.market.listing.price?.type === 'money' && side.market.roles.some((r) => !f.roles!.includes(r.role)))
    const role = theirs.market.roles.find((r) => !theirs.field.roles!.includes(r.role))!.role
    const [many, manyField] = fieldOf(theirs.market, role, (f) => f.type === 'choice' && f.many === true)!
    const p = await verifiedWith(w, `${theirs.market.name}/${role}`)
    const me = p.profiles[0]!
    const value = theirs.field.type === 'choice' ? theirs.field.values![0]! : 'none'
    expect(await refusal(check(w, me, 'listing', { description: 'A leak.', price: { amount: 'thirty', currency: 'USD' } }, [me]))).toEqual(["Price doesn't fit.", true])
    expect(await refusal(check(w, me, 'listing', { description: 'A leak.', [theirs.name]: theirs.field.many ? [value] : value }, [me])), "a field for the other role's listings").toEqual([`${fieldWords(theirs.name)} doesn't fit.`, true])
    expect(await refusal(check(w, me, 'listing', {}, [me]))).toEqual(['Add something first.', false])
    await check(w, me, 'listing', { [many]: [manyField.values![0]!] }, [me])
    expect(theirs.market.listing.colour, 'a field no market has').toBeUndefined()
    expect(await refusal(check(w, me, 'listing', { description: 'A leak.', colour: 'red' }, [me])), 'a field the market does not have').toEqual(["Colour doesn't fit.", true])
  })

  test('a write refused for its price: one more credit from the wallet, and written again', async () => {
    const pricey = await world({ entryPerKb: '0.5' })
    try {
      const p = await verifiedWith(pricey, TUTOR)
      const me = p.profiles[0]!
      const path = await post(pricey, p.seed, me, 'listing', { ...MATHS, description: 'Maths. '.repeat(400) })
      expect((await readEntries(pricey, me.address)).map((x) => x.path)).toEqual([path])
    } finally {
      await pricey.close()
    }
  })

  test("an old listing, as the app wrote it before the markets moved: it doesn't fit, so the index lists it no more; what still fits, posted again at its path, does", async () => {
    const p = await verifiedWith(w, TUTOR)
    const me = p.profiles[0]!
    const today = MATHS
    const old = { ...today, [lessons.place]: { online: true } }
    // An older app's check let it through; post writes what it is given.
    const path = await post(w, p.seed, me, 'listing', old)
    expect(await refusal(check(w, me, 'listing', old, [me]))).toEqual([`${fieldWords(lessons.place)} doesn't fit.`, true])
    const [read] = await readEntries(w, me.address)
    expect(fits(NAME, lessons.offer.role, read!.body)).toBe(false)
    const kept = fitting(NAME, lessons.offer.role, read!.body)
    expect(kept).toEqual(today)
    const updated = { ...kept, [lessons.mode]: [lessons.online] }
    await check(w, me, 'listing', updated, [me])
    expect(await post(w, p.seed, me, 'listing', updated, path)).toBe(path)
    const now = await readEntries(w, me.address)
    expect(now.map((x) => [x.path, fits(NAME, lessons.offer.role, x.body)])).toEqual([[path, true]])
  })
})

describe('a review, a vouch or a report', () => {
  test("about someone on the other side of the same market, never the profile itself nor another of the person's own; a review naming their listing", async () => {
    const tutor = await verifiedWith(w, TUTOR)
    const offer = await post(w, tutor.seed, tutor.profiles[0]!, 'listing', MATHS)
    const student = await verifiedWith(w, STUDENT, TUTOR, elsewhere.request.label)
    const [me, myTutor, myBuyer] = student.profiles as [device.Profile, device.Profile, device.Profile]
    const other = await verifiedWith(w, STUDENT, elsewhere.offer.label)
    const mine = student.profiles

    const review = (subject: string) => check(w, me, 'review', { subject, score: '9', text: 'Clear and patient.' }, mine)
    expect(await refusal(check(w, me, 'review', { score: '9' }, mine))).toEqual(['Add their address.', false])
    expect(await refusal(review('not an address'))).toEqual(["That isn't a profile's address.", true])
    expect(await refusal(review(me.address)), 'never the profile itself, which the index never counts').toEqual(["That's this profile.", true])
    expect(await refusal(review(myTutor.address)), "never one of the person's own other profiles, before the unlock").toEqual(["That's one of your profiles.", true])
    for (const kind of ['vouch', 'report'] as const) expect(await refusal(check(w, me, kind, { subject: myTutor.address }, mine)), kind).toEqual(["That's one of your profiles.", true])
    expect(await refusal(subjectOf(w, me, myBuyer.address, mine)), 'their own in another market too').toEqual(["That's one of your profiles.", true])
    expect(await refusal(review(other.profiles[1]!.address))).toEqual(["This profile isn't in this market.", true])
    expect(await refusal(review(other.profiles[0]!.address))).toEqual(["This profile isn't on the other side of this market.", true])
    expect(await refusal(check(w, me, 'review', { subject: tutor.profiles[0]!.address, score: '11' }, mine))).toEqual(["Score doesn't fit.", true])

    const body = { subject: addressIn(`https://app.forest.foundation/message?to=${tutor.profiles[0]!.address}`), score: '9', text: 'Clear and patient.', listing: `${tutor.profiles[0]!.address}/${offer}` }
    expect(body.subject, 'an older Share link gives its address').toBe(tutor.profiles[0]!.address)
    const page = `https://index.forest.foundation/profiles/${tutor.profiles[0]!.address}`
    expect([addressIn(page), addressIn(` ${page}.json `)], "and so does a profile's page on the index, as Share hands it out, or its JSON twin").toEqual([tutor.profiles[0]!.address, tutor.profiles[0]!.address])
    expect(addressIn(`https://index.forest.foundation/markets/${NAME}`), 'any other page is no address').toBe(`https://index.forest.foundation/markets/${NAME}`)
    await check(w, me, 'review', body, mine)
    const path = await post(w, student.seed, me, 'review', body)
    expect(path).toMatch(/^review\/[0-9a-f]{32}$/)
    for (const kind of ['vouch', 'report'] as const) {
      const said = { subject: body.subject, text: kind === 'vouch' ? 'Real and honest.' : 'Fake.' }
      await check(w, me, kind, said, mine)
      expect(await post(w, student.seed, me, kind, said)).toMatch(new RegExp(`^${kind}/[0-9a-f]{32}$`))
    }
    expect((await readEntries(w, me.address)).map((x) => x.kind).sort()).toEqual(['report', 'review', 'vouch'])
    // Written again about the same person, one goes where that kind was: the index counts one. A
    // review naming a listing, as an older app wrote it, is another one at the index, so it is left be.
    const vouch = (await readEntries(w, me.address)).find((e) => e.kind === 'vouch')!
    expect(await writtenAbout(w, me, 'vouch', body.subject), 'the vouch, in its place').toBe(vouch.path)
    expect(await writtenAbout(w, me, 'review', body.subject), 'the review names a listing').toBeUndefined()
    expect(await writtenAbout(w, me, 'report', other.profiles[0]!.address), 'about no one else').toBeUndefined()
  })

  test("a market with one role: a review is about another of that role, and a review field kept for some roles is checked against the subject's", async () => {
    const one = oneRole(markets)
    const said = fieldWith(markets, 'a choice for reviews in a market with one role', (f, _, side) => f.type === 'choice' && side.market.roles.length === 1, 'review')
    const a = await verifiedWith(w, said.label)
    const b = await verifiedWith(w, said.label)
    expect(said.market.name).toBe(one.market.name)
    await check(w, b.profiles[0]!, 'review', { subject: a.profiles[0]!.address, [said.name]: said.field.values![0]! }, b.profiles)
    // A field kept for reviews of one role, in a market with another, which writes them.
    const kept = fieldWith(markets, 'a choice for reviews of one role, in a market with another', (f, _, side) => f.type === 'choice' && f.roles !== undefined && side.market.roles.some((r) => !f.roles!.includes(r.role)), 'review')
    const writer = kept.market.roles.find((r) => !kept.field.roles!.includes(r.role))!.role
    const answer = { [kept.name]: kept.field.values![0]! }
    const client = await verifiedWith(w, `${kept.market.name}/${writer}`)
    const repairer = await verifiedWith(w, kept.label)
    await check(w, client.profiles[0]!, 'review', { subject: repairer.profiles[0]!.address, ...answer }, client.profiles)
    expect(await refusal(check(w, repairer.profiles[0]!, 'review', { subject: client.profiles[0]!.address, ...answer }, repairer.profiles)), `${kept.name} is for reviews of ${kept.role}`).toEqual([`${fieldWords(kept.name)} doesn't fit.`, true])
    expect(markets.checkEntry(kept.market.name, kept.role, 'review', { subject: 'x', ...answer }, writer)).toBe(loadMarkets().checkEntry(kept.market.name, kept.role, 'review', { subject: 'x', ...answer }, writer))
  })
})

/** A photo's bytes, as the device's redraw gives them: a JPEG, here stand-in bytes of `size`. */
const photo = (size: number) => new Uint8Array(randomBytes(size))
const shaOf = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')

describe('photos', () => {
  test('a listing with two photos: named in its files, written, then each sent to the host, which serves it to anyone; no per; a place a point and a radius, never an area alone', async () => {
    const p = await verifiedWith(w, shop.label)
    const me = p.profiles[0]!
    const [a, b] = [photo(20_000), photo(30_000)]
    const picked = new Map([
      [shaOf(a), a],
      [shaOf(b), b],
    ])
    const given: Body = { description: 'A wool coat, worn twice.', price: { amount: '40', currency: 'EUR' }, [shop.place]: { lat: '40.409', lon: '-3.701', radiusKm: 2, area: 'Lavapiés, Madrid' }, [shop.photos]: [shaOf(a), shaOf(b)] }
    const body = withFiles(given, [shop.photos], picked)
    expect(body.files).toEqual([
      { sha256: shaOf(a), type: PHOTO_TYPE, size: 20_000 },
      { sha256: shaOf(b), type: PHOTO_TYPE, size: 30_000 },
    ])
    await check(w, me, 'listing', body, [me])
    const place = `${fieldWords(shop.place)} doesn't fit.`
    expect(await refusal(check(w, me, 'listing', { ...body, price: { amount: '40', currency: 'EUR', per: 'hour' } }, [me])), 'a jacket takes no per').toEqual(["Price doesn't fit.", true])
    expect(await refusal(check(w, me, 'listing', { ...body, [shop.place]: { area: 'Lavapiés, Madrid' } }, [me])), 'an area alone').toEqual([place, true])
    expect(await refusal(check(w, me, 'listing', { ...body, [shop.place]: { online: true } }, [me])), 'online is never a place').toEqual([place, true])
    const path = await post(w, p.seed, me, 'listing', body, undefined, newPhotos(body, picked))
    for (const bytes of [a, b]) {
      const res = await fetch(`${w.host}/v1/files/${shaOf(bytes)}`)
      expect([res.status, res.headers.get('content-type')]).toEqual([200, PHOTO_TYPE])
      expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes)
    }

    // An edit that keeps one photo: its name kept, nothing new to send.
    const kept = withFiles({ ...body, [shop.photos]: [shaOf(b)] }, [shop.photos], new Map())
    expect(kept.files).toEqual([{ sha256: shaOf(b), type: PHOTO_TYPE, size: 30_000 }])
    expect(newPhotos(kept, picked)).toEqual([b])
    await post(w, p.seed, me, 'listing', kept, path)
    expect((await readEntries(w, me.address)).map((x) => [x.path, x.body[shop.photos]])).toEqual([[path, [shaOf(b)]]])
    expect(withFiles({ description: 'No photos.', [shop.photos]: [] }, [shop.photos], new Map()), 'none: no field and no files').toEqual({ description: 'No photos.' })
  })

  test("a price per one of its field's values; any other, red", async () => {
    const p = await verifiedWith(w, TUTOR)
    const me = p.profiles[0]!
    expect(lessons.per, 'a night is none of them').not.toContain('night')
    await check(w, me, 'listing', { ...MATHS, price: { amount: '30', currency: 'USD', per: lessons.per[1]! } }, [me])
    await check(w, me, 'listing', { ...MATHS, price: { amount: '300', currency: 'USD' } }, [me])
    expect(await refusal(check(w, me, 'listing', { ...MATHS, price: { amount: '30', currency: 'USD', per: 'night' } }, [me]))).toEqual(["Price doesn't fit.", true])
  })

  test('a photo refused for its price: one more credit from the wallet, and sent; posted again at its path after a photo failed, still one listing', async () => {
    const pricey = await world({ filePerKb: '0.01' })
    try {
      const p = await verifiedWith(pricey, shop.label)
      const me = p.profiles[0]!
      const big = photo(150_000)
      const picked = new Map([[shaOf(big), big]])
      const body = withFiles({ description: 'A coat.', [shop.photos]: [shaOf(big)] }, [shop.photos], picked)
      const path = newPath('listing')
      const stray = photo(1_000)
      await expect(post(pricey, p.seed, me, 'listing', body, path, [stray]), 'bytes no entry names').rejects.toThrow()
      const wallet = (await walletKey(p.seed)).address
      const before = await pricey.balance(wallet)
      expect(await post(pricey, p.seed, me, 'listing', body, path, newPhotos(body, picked))).toBe(path)
      expect(await pricey.balance(wallet), 'the wallet topped the profile up for the photo').toBeLessThan(before - 0.9)
      expect((await fetch(`${pricey.host}/v1/files/${shaOf(big)}`)).status).toBe(200)
      expect((await readEntries(pricey, me.address)).map((x) => x.path), 'one listing').toEqual([path])
      await sendPhotos(pricey.host, me.address, (await walletKey(p.seed)), [big])
    } finally {
      await pricey.close()
    }
  })
})
