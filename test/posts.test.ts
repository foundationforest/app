// Posting, against services' own host (world.ts): every kind at <kind>/<id>, a random id, checked
// before the unlock against its market (the markets' browser entry, which answers as the Node entry
// does) and, for a review, a vouch or a report, against its subject's profile entry at the host;
// paid from the profile's folder, topped up from the wallet; edited at its own path; deleted. A
// post's photos: named in its files, then each sent to the host, paid the same way; a price's per
// only from its field's list; a place a point and a radius, never an area alone. And a post an
// older market shaped: not fitting, so not listed, and posted again with what still fits.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { createHash, randomBytes } from 'node:crypto'

import { loadMarkets } from '../markets/build/dist/index.js'
import * as device from '../src/device.ts'
import { PHOTO_TYPE, newPhotos, sendPhotos, withFiles } from '../src/flows/photos.ts'
import { walletKey } from '../src/flows/profiles.ts'
import { addressIn, check, newPath, post, readPosts, subjectOf, unpost } from '../src/flows/posts.ts'
import { fits, fitting } from '../src/form.ts'
import { markets } from '../src/markets.ts'
import { Said } from '../src/words.ts'
import { type World, freshDevice, verifiedWith, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

const MATHS = {
  description: 'Maths for secondary school, one hour online.',
  price: { amount: '30', currency: 'USD', per: 'hour' },
  subjects: ['maths'],
  levels: ['secondary'],
  mode: ['online'],
  contact: 'ada@example.com',
}

/** Why `check` refused, as the line the screen shows. */
const refusal = async (p: Promise<void>) => {
  const err = await p.then(() => null, (e: unknown) => e)
  if (!(err instanceof Said)) throw new Error(`not refused in words: ${String(err)}`)
  return [err.message, err.red]
}

describe('a post', () => {
  test('checked before the unlock, posted at a random id and paid from its folder; edited at its path; deleted', async () => {
    const p = await verifiedWith(w, 'tutoring/tutor')
    const me = p.profiles[0]!
    await check(w, me, 'post', MATHS, [me])
    expect(loadMarkets().checkEntry('tutoring', 'tutor', 'post', MATHS), 'the Node entry agrees').toBeNull()
    const before = await w.balance(me.address)
    const path = await post(w, p.seed, me, 'post', MATHS)
    expect(path).toMatch(/^post\/[0-9a-f]{32}$/)
    expect(await w.balance(me.address), "paid from the profile's folder").toBeLessThan(before)
    const [posted] = await readPosts(w, me.address)
    expect([posted?.path, posted?.kind, posted?.body, posted?.key]).toEqual([path, 'post', MATHS, undefined])

    const edited = { ...MATHS, description: 'Maths and physics, one hour online.' }
    expect(await post(w, p.seed, me, 'post', edited, path)).toBe(path)
    const after = await readPosts(w, me.address)
    expect(after.map((x) => [x.path, x.body.description])).toEqual([[path, edited.description]])
    expect(after[0]!.time).toBeGreaterThan(posted!.time)

    const kept = await w.balance(me.address)
    await unpost(w, p.seed, me, path)
    expect(await readPosts(w, me.address)).toEqual([])
    expect(await w.balance(me.address), 'a delete is free').toBe(kept)
  })

  test('before the unlock: a field that does not fit, in red, by its name; a post with nothing in it, quiet; no field demanded', async () => {
    const p = await verifiedWith(w, 'home-repair/client')
    const me = p.profiles[0]!
    expect(await refusal(check(w, me, 'post', { description: 'A leak.', price: { amount: 'thirty', currency: 'USD' } }, [me]))).toEqual(["Price doesn't fit.", true])
    expect(await refusal(check(w, me, 'post', { description: 'A leak.', licences: 'none' }, [me])), "a field for the other role's posts").toEqual(["Licences doesn't fit.", true])
    expect(await refusal(check(w, me, 'post', {}, [me]))).toEqual(['Add something first.', false])
    await check(w, me, 'post', { repairs: ['plumbing'] }, [me])
    expect(await refusal(check(w, me, 'post', { description: 'A leak.', groupSize: '2' }, [me])), 'a field the market does not have').toEqual(["Group size doesn't fit.", true])
  })

  test('a write refused for its price: one more credit from the wallet, and written again', async () => {
    const pricey = await world({ entryPerKb: '0.5' })
    try {
      const p = await verifiedWith(pricey, 'tutoring/tutor')
      const me = p.profiles[0]!
      const path = await post(pricey, p.seed, me, 'post', { ...MATHS, description: 'Maths. '.repeat(400) })
      expect((await readPosts(pricey, me.address)).map((x) => x.path)).toEqual([path])
    } finally {
      await pricey.close()
    }
  })

  test("an old post, as the app wrote it before the markets moved: it doesn't fit, so the index lists it no more; what still fits, posted again at its path, does", async () => {
    const p = await verifiedWith(w, 'tutoring/tutor')
    const me = p.profiles[0]!
    const { mode: _, ...today } = MATHS
    const old = { ...today, place: { online: true } }
    // An older app's check let it through; post writes what it is given.
    const path = await post(w, p.seed, me, 'post', old)
    expect(await refusal(check(w, me, 'post', old, [me]))).toEqual(["Place doesn't fit.", true])
    const [read] = await readPosts(w, me.address)
    expect(fits('tutoring', 'tutor', read!.body)).toBe(false)
    const kept = fitting('tutoring', 'tutor', read!.body)
    expect(kept).toEqual(today)
    const updated = { ...kept, mode: ['online'] }
    await check(w, me, 'post', updated, [me])
    expect(await post(w, p.seed, me, 'post', updated, path)).toBe(path)
    const now = await readPosts(w, me.address)
    expect(now.map((x) => [x.path, fits('tutoring', 'tutor', x.body)])).toEqual([[path, true]])
  })
})

describe('a review, a vouch or a report', () => {
  test("about someone on the other side of the same market, one's own other profile too, for now, never the profile itself; a review naming their post", async () => {
    const tutor = await verifiedWith(w, 'tutoring/tutor')
    const offer = await post(w, tutor.seed, tutor.profiles[0]!, 'post', MATHS)
    const student = await verifiedWith(w, 'tutoring/student', 'tutoring/tutor', 'clothing/buyer')
    const [me, myTutor, myBuyer] = student.profiles as [device.Profile, device.Profile, device.Profile]
    const other = await verifiedWith(w, 'tutoring/student', 'clothing/seller')
    const mine = student.profiles

    const review = (subject: string) => check(w, me, 'review', { subject, score: '9', text: 'Clear and patient.' }, mine)
    expect(await refusal(check(w, me, 'review', { score: '9' }, mine))).toEqual(['Add their address.', false])
    expect(await refusal(review('not an address'))).toEqual(["That isn't a profile's address.", true])
    expect(await refusal(review(me.address)), 'never the profile itself, which the index never counts').toEqual(["That's this profile.", true])
    await check(w, me, 'review', { subject: myTutor.address, score: '9' }, mine)
    expect((await subjectOf(w, me, myTutor.address, mine)).role, "for now, while Carlos tests, one of the person's own other profiles").toBe('tutor')
    expect(await refusal(review(myBuyer.address)), 'their own in another market, as anyone in another market').toEqual(["This profile isn't in this market.", true])
    expect(await refusal(review(other.profiles[1]!.address))).toEqual(["This profile isn't in this market.", true])
    expect(await refusal(review(other.profiles[0]!.address))).toEqual(["This profile isn't on the other side of this market.", true])
    expect(await refusal(check(w, me, 'review', { subject: tutor.profiles[0]!.address, score: '11' }, mine))).toEqual(["Score doesn't fit.", true])

    const body = { subject: addressIn(`https://app.forest.foundation/message?to=${tutor.profiles[0]!.address}`), score: '9', text: 'Clear and patient.', post: `${tutor.profiles[0]!.address}/${offer}` }
    expect(body.subject, 'an older Share link gives its address').toBe(tutor.profiles[0]!.address)
    const page = `https://index.forest.foundation/profiles/${tutor.profiles[0]!.address}`
    expect([addressIn(page), addressIn(` ${page}.json `)], "and so does a profile's page on the index, as Share hands it out, or its JSON twin").toEqual([tutor.profiles[0]!.address, tutor.profiles[0]!.address])
    expect(addressIn('https://index.forest.foundation/markets/tutoring'), 'any other page is no address').toBe('https://index.forest.foundation/markets/tutoring')
    await check(w, me, 'review', body, mine)
    const path = await post(w, student.seed, me, 'review', body)
    expect(path).toMatch(/^review\/[0-9a-f]{32}$/)
    for (const kind of ['vouch', 'report'] as const) {
      const said = { subject: body.subject, text: kind === 'vouch' ? 'Real and honest.' : 'Fake.' }
      await check(w, me, kind, said, mine)
      expect(await post(w, student.seed, me, kind, said)).toMatch(new RegExp(`^${kind}/[0-9a-f]{32}$`))
    }
    expect((await readPosts(w, me.address)).map((x) => x.kind).sort()).toEqual(['report', 'review', 'vouch'])
  })

  test("a market with one role: a review is about another of that role, and a review field kept for some roles is checked against the subject's", async () => {
    const a = await verifiedWith(w, 'tennis-matches/player')
    const b = await verifiedWith(w, 'tennis-matches/player')
    await check(w, b.profiles[0]!, 'review', { subject: a.profiles[0]!.address, showedUp: 'yes' }, b.profiles)
    const client = await verifiedWith(w, 'home-repair/client')
    const repairer = await verifiedWith(w, 'home-repair/repairer')
    await check(w, client.profiles[0]!, 'review', { subject: repairer.profiles[0]!.address, onTime: 'yes' }, client.profiles)
    expect(await refusal(check(w, repairer.profiles[0]!, 'review', { subject: client.profiles[0]!.address, onTime: 'yes' }, repairer.profiles)), "onTime is for reviews of repairers").toEqual(["On time doesn't fit.", true])
    expect(markets.checkEntry('home-repair', 'repairer', 'review', { subject: 'x', onTime: 'yes' }, 'client')).toBe(loadMarkets().checkEntry('home-repair', 'repairer', 'review', { subject: 'x', onTime: 'yes' }, 'client'))
  })
})

/** A photo's bytes, as the device's redraw gives them: a JPEG, here stand-in bytes of `size`. */
const photo = (size: number) => new Uint8Array(randomBytes(size))
const shaOf = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')

describe('photos', () => {
  test('a clothing post with two photos: named in its files, written, then each sent to the host, which serves it to anyone; no per; a place a point and a radius, never an area alone', async () => {
    const p = await verifiedWith(w, 'clothing/seller')
    const me = p.profiles[0]!
    const [a, b] = [photo(20_000), photo(30_000)]
    const picked = new Map([
      [shaOf(a), a],
      [shaOf(b), b],
    ])
    const given = { description: 'A wool coat, worn twice.', price: { amount: '40', currency: 'EUR' }, location: { lat: '40.409', lon: '-3.701', radiusKm: 2, area: 'Lavapiés, Madrid' }, photos: [shaOf(a), shaOf(b)] }
    const body = withFiles(given, ['photos'], picked)
    expect(body.files).toEqual([
      { sha256: shaOf(a), type: PHOTO_TYPE, size: 20_000 },
      { sha256: shaOf(b), type: PHOTO_TYPE, size: 30_000 },
    ])
    await check(w, me, 'post', body, [me])
    expect(await refusal(check(w, me, 'post', { ...body, price: { amount: '40', currency: 'EUR', per: 'hour' } }, [me])), 'a jacket takes no per').toEqual(["Price doesn't fit.", true])
    expect(await refusal(check(w, me, 'post', { ...body, location: { area: 'Lavapiés, Madrid' } }, [me])), 'an area alone').toEqual(["Location doesn't fit.", true])
    expect(await refusal(check(w, me, 'post', { ...body, location: { online: true } }, [me])), 'online is never a place').toEqual(["Location doesn't fit.", true])
    const path = await post(w, p.seed, me, 'post', body, undefined, newPhotos(body, picked))
    for (const bytes of [a, b]) {
      const res = await fetch(`${w.host}/v1/files/${shaOf(bytes)}`)
      expect([res.status, res.headers.get('content-type')]).toEqual([200, PHOTO_TYPE])
      expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes)
    }

    // An edit that keeps one photo: its name kept, nothing new to send.
    const kept = withFiles({ ...body, photos: [shaOf(b)] }, ['photos'], new Map())
    expect(kept.files).toEqual([{ sha256: shaOf(b), type: PHOTO_TYPE, size: 30_000 }])
    expect(newPhotos(kept, picked)).toEqual([b])
    await post(w, p.seed, me, 'post', kept, path)
    expect((await readPosts(w, me.address)).map((x) => [x.path, x.body.photos])).toEqual([[path, [shaOf(b)]]])
    expect(withFiles({ description: 'No photos.', photos: [] }, ['photos'], new Map()), 'none: no field and no files').toEqual({ description: 'No photos.' })
  })

  test('a price per one of its field\'s values; any other, red', async () => {
    const p = await verifiedWith(w, 'tutoring/tutor')
    const me = p.profiles[0]!
    await check(w, me, 'post', { ...MATHS, price: { amount: '30', currency: 'USD', per: 'session' } }, [me])
    await check(w, me, 'post', { ...MATHS, price: { amount: '300', currency: 'USD' } }, [me])
    expect(await refusal(check(w, me, 'post', { ...MATHS, price: { amount: '30', currency: 'USD', per: 'night' } }, [me]))).toEqual(["Price doesn't fit.", true])
  })

  test('a photo refused for its price: one more credit from the wallet, and sent; posted again at its path after a photo failed, still one post', async () => {
    const pricey = await world({ filePerKb: '0.01' })
    try {
      const p = await verifiedWith(pricey, 'clothing/seller')
      const me = p.profiles[0]!
      const big = photo(150_000)
      const picked = new Map([[shaOf(big), big]])
      const body = withFiles({ description: 'A coat.', photos: [shaOf(big)] }, ['photos'], picked)
      const path = newPath('post')
      const stray = photo(1_000)
      await expect(post(pricey, p.seed, me, 'post', body, path, [stray]), 'bytes no entry names').rejects.toThrow()
      const wallet = (await walletKey(p.seed)).address
      const before = await pricey.balance(wallet)
      expect(await post(pricey, p.seed, me, 'post', body, path, newPhotos(body, picked))).toBe(path)
      expect(await pricey.balance(wallet), 'the wallet topped the profile up for the photo').toBeLessThan(before - 0.9)
      expect((await fetch(`${pricey.host}/v1/files/${shaOf(big)}`)).status).toBe(200)
      expect((await readPosts(pricey, me.address)).map((x) => x.path), 'one post').toEqual([path])
      await sendPhotos(pricey.host, me.address, (await walletKey(p.seed)), [big])
    } finally {
      await pricey.close()
    }
  })
})
