// Feedback: reviews, vouches and reports, against services' own host and a stand-in index
// (world.ts): what the index counted about a profile, newest first, with its rating, read with
// nothing unlocked; what is new on a profile, after the time the device keeps for it, and on a new
// device nothing already there; and what a profile gave, from its own folder.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import * as device from '../src/device.ts'
import { post, readEntries } from '../src/flows/entries.ts'
import { givenOf, newOf, newest, notices, rate } from '../src/flows/feedback.ts'
import { ratedOf } from '../src/rated.ts'
import { readRated } from '../src/services/index.ts'
import { Unreachable } from '../src/services/http.ts'
import { type IndexPage, type World, freshDevice, verifiedWith, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
  w.indexDown(false)
})

type Said = { writer: string; id: string; body: Record<string, unknown>; time: number; counted?: boolean }

/** A profile's page as services' index writes it (index/src/pages/profile.ts), holding these. */
function page(address: string, o: { rating?: number; reviews?: Said[]; vouches?: Said[]; reports?: Said[]; listings?: Array<{ id: string; body: Record<string, unknown> }> }): IndexPage {
  const said = (kind: string, by: 'reviewer' | 'writer') => (list: Said[] = []) =>
    list.map((s) => ({ [by]: s.writer, address: `${s.writer}/${kind}/${s.id}`, body: { subject: address, ...s.body }, counted: s.counted ?? true, ...(s.counted === false && { why: 'its writer does not count here' }), time: s.time, ...(kind === 'review' && { weight: 0.28 }) }))
  return {
    index: 'StandInIndexAddress',
    address,
    profile: {},
    checks: [],
    ratings: { value: o.rating ?? null, count: o.reviews?.length ?? 0 },
    trust: 38,
    uniqueness: 75,
    listings: (o.listings ?? []).map((l) => ({ address: `${address}/listing/${l.id}`, body: l.body, listed: true, time: 1 })),
    reviews: { received: said('review', 'reviewer')(o.reviews), given: [] },
    vouches: { received: said('vouch', 'writer')(o.vouches), given: [] },
    reports: { received: said('report', 'writer')(o.reports), given: [] },
    words: { received: [], given: [] },
    proofs: [],
  }
}

describe('what the index says of a profile', () => {
  test('what it counted, newest first, by kind; its rating and how many reviews; its listings by address; a 404 is nothing yet; down, one quiet line', async () => {
    const seller = (await verifiedWith(w, 'clothing/seller')).profiles[0]!
    const buyer = (await verifiedWith(w, 'clothing/buyer')).profiles[0]!
    w.indexSays(
      seller.address,
      page(seller.address, {
        rating: 9.4,
        reviews: [
          { writer: buyer.address, id: 'a', body: { score: '10', text: 'As described.' }, time: 100 },
          { writer: buyer.address, id: 'b', body: { score: '9', text: 'Not counted.' }, time: 400, counted: false },
        ],
        vouches: [{ writer: buyer.address, id: 'c', body: { text: 'Real.' }, time: 300 }],
        reports: [{ writer: buyer.address, id: 'd', body: { text: 'Late.' }, time: 200 }],
        listings: [{ id: 'coat', body: { description: 'A wool coat.' } }],
      }),
    )
    const rated = await readRated(w.index, seller.address)
    expect(rated.rating).toBe(9.4)
    expect(rated.reviews, 'the reviews it counted').toBe(1)
    expect(rated.received.map((r) => [r.kind, r.writer, r.body.text, r.time])).toEqual([
      ['vouch', buyer.address, 'Real.', 300],
      ['report', buyer.address, 'Late.', 200],
      ['review', buyer.address, 'As described.', 100],
    ])
    expect(rated.listings[`${seller.address}/listing/coat`]?.description).toBe('A wool coat.')
    expect(newest(rated)).toBe(300)

    expect(await readRated(w.index, buyer.address), 'nothing yet: the index holds no profile entry for it').toEqual({ rating: null, reviews: 0, received: [], listings: {} })
    w.indexDown(true)
    const err = await readRated(w.index, seller.address).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(Unreachable)
    expect([(err as Unreachable).message, (err as Unreachable).red]).toEqual(["Can't reach the index. Try again.", false])
    await rate(w.index, [seller])
    expect(ratedOf(seller.address), 'held as failed, so a screen says so and shows no rating').toEqual({ failed: true })
  })
})

describe('what is new on a profile', () => {
  test('a profile made here: all that comes to it; once the Inbox has shown it, nothing more', async () => {
    const seller = (await verifiedWith(w, 'clothing/seller')).profiles[0]!
    const buyer = (await verifiedWith(w, 'clothing/buyer')).profiles[0]!
    device.saveProfiles([seller])
    expect(device.seen()[seller.address], 'marked at the start as it was made').toBe(0)
    w.indexSays(seller.address, page(seller.address, { rating: 10, reviews: [{ writer: buyer.address, id: 'a', body: { score: '10' }, time: 1_000 }] }))
    await rate(w.index, [seller])
    const held = ratedOf(seller.address)!
    if (!('rated' in held)) throw new Error('not read')
    expect(newOf(held.rated, device.seen()[seller.address]!).map((r) => r.address)).toEqual([`${buyer.address}/review/a`])
    device.saveSeen({ [seller.address]: newest(held.rated) })
    expect(newOf(held.rated, device.seen()[seller.address]!), 'shown once, new no more').toEqual([])
  })

  test('a new device: nothing already there is new; what comes after is', async () => {
    const seller = (await verifiedWith(w, 'clothing/seller')).profiles[0]!
    const buyer = (await verifiedWith(w, 'clothing/buyer')).profiles[0]!
    const first = { writer: buyer.address, id: 'a', body: { score: '8' }, time: 5_000 }
    w.indexSays(seller.address, page(seller.address, { reviews: [first] }))
    freshDevice()
    device.saveProfiles([seller])
    expect(seller.address in device.seen(), 'no mark on a new device').toBe(false)
    await rate(w.index, [seller])
    expect(device.seen()[seller.address], 'marked at the newest the index holds').toBe(5_000)
    w.indexSays(seller.address, page(seller.address, { reviews: [first], vouches: [{ writer: buyer.address, id: 'b', body: { text: 'Real.' }, time: 6_000 }] }))
    await rate(w.index, [seller])
    const held = ratedOf(seller.address)!
    if (!('rated' in held)) throw new Error('not read')
    expect(newOf(held.rated, device.seen()[seller.address]!).map((r) => r.kind)).toEqual(['vouch'])
    device.forget()
    expect(device.seen(), 'Forget lets the marks go').toEqual({})
  })
})

test("Notifications: every review, vouch and report about any of the person's profiles, newest first, those after the marks new; no message among them", async () => {
  const p = await verifiedWith(w, 'clothing/seller', 'tutoring/tutor')
  const [seller, tutor] = p.profiles as [device.Profile, device.Profile]
  const other = (await verifiedWith(w, 'clothing/buyer', 'tutoring/student')).profiles
  w.indexSays(seller.address, page(seller.address, { reviews: [{ writer: other[0]!.address, id: 'a', body: { score: '9' }, time: 100 }], reports: [{ writer: other[0]!.address, id: 'b', body: { text: 'Late.' }, time: 300 }] }))
  w.indexSays(tutor.address, page(tutor.address, { vouches: [{ writer: other[1]!.address, id: 'c', body: { text: 'Real.' }, time: 200 }] }))
  const list = [seller, tutor]
  await rate(w.index, list)
  const rated = Object.fromEntries(list.map((x) => [x.address, ratedOf(x.address)]))
  const rows = notices(list, rated, { [seller.address]: 150, [tutor.address]: 200 })
  expect(rows.map((n) => [n.received.kind, n.on, n.fresh])).toEqual([
    ['report', seller.address, true],
    ['vouch', tutor.address, false],
    ['review', seller.address, false],
  ])
  expect(notices(list, rated, {}).every((n) => !n.fresh), 'a profile with no mark: nothing new').toBe(true)
  expect(notices(list, {}, {}), 'nothing read yet: no rows').toEqual([])
})

test("what a profile gave: its reviews, vouches and reports, from its own folder, each naming who it is about", async () => {
  const seller = await verifiedWith(w, 'clothing/seller')
  const buyer = await verifiedWith(w, 'clothing/buyer')
  const [s, b] = [seller.profiles[0]!, buyer.profiles[0]!]
  await post(w, seller.seed, s, 'listing', { description: 'A wool coat.' })
  await post(w, buyer.seed, b, 'review', { subject: s.address, score: '9.5', asDescribed: 'yes' })
  await post(w, buyer.seed, b, 'vouch', { subject: s.address, text: 'Real.' })
  await post(w, buyer.seed, b, 'report', { subject: s.address, text: 'Late.' })
  const given = givenOf(await readEntries(w, b.address))
  expect(given.map((g) => [g.kind, g.body.subject]).sort()).toEqual([
    ['report', s.address],
    ['review', s.address],
    ['vouch', s.address],
  ])
  expect(givenOf(await readEntries(w, s.address)), 'a listing is no review').toEqual([])
})
