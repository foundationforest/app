// Feedback: reviews, vouches and reports, against services' own host and a stand-in index
// (world.ts): what the index counted about a profile, newest first, with its rating, read with
// nothing unlocked; what is new on a profile, after the time the device keeps for it, and on a new
// device nothing already there; and what a profile gave, from its own folder.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import * as device from '../src/device.ts'
import { post, readEntries } from '../src/flows/entries.ts'
import { givenOf, newOf, newest, rate } from '../src/flows/feedback.ts'
import { ratedOf } from '../src/rated.ts'
import { readListing, readRated } from '../src/services/index.ts'
import { Unreachable } from '../src/services/http.ts'
import { OTHER_OFFERS, OTHER_REQUESTS } from './labels.ts'
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
function page(address: string, o: { rating?: number; reviews?: Said[]; vouches?: Said[]; reports?: Said[]; listings?: Array<{ id: string; body: Record<string, unknown>; listed?: boolean }>; wrote?: { reviews?: Said[]; vouches?: Said[]; reports?: Said[] } }): IndexPage {
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
    listings: (o.listings ?? []).map((l) => ({ address: `${address}/listing/${l.id}`, body: l.body, listed: l.listed ?? true, time: 1 })),
    reviews: { received: said('review', 'reviewer')(o.reviews), given: said('review', 'reviewer')(o.wrote?.reviews) },
    vouches: { received: said('vouch', 'writer')(o.vouches), given: said('vouch', 'writer')(o.wrote?.vouches) },
    reports: { received: said('report', 'writer')(o.reports), given: said('report', 'writer')(o.wrote?.reports) },
    words: { received: [], given: [] },
    proofs: [],
  }
}

describe('what the index says of a profile', () => {
  test('what it counted, newest first, by kind; its rating and how many reviews; how many listings it lists; how many it wrote; a 404 is nothing yet; down, one quiet line', async () => {
    const seller = (await verifiedWith(w, OTHER_OFFERS)).profiles[0]!
    const buyer = (await verifiedWith(w, OTHER_REQUESTS)).profiles[0]!
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
        listings: [
          { id: 'coat', body: { description: 'A wool coat.' } },
          { id: 'old', body: { description: 'An old shape.' }, listed: false },
        ],
        wrote: { reviews: [{ writer: seller.address, id: 'e', body: { score: '8' }, time: 50 }], vouches: [{ writer: seller.address, id: 'f', body: {}, time: 60 }] },
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
    expect(rated.listed, 'the listings it lists, not one it no longer does').toBe(1)
    expect(rated.written, 'what the profile wrote: a review and a vouch').toBe(2)
    expect(newest(rated)).toBe(300)

    expect(await readRated(w.index, buyer.address), 'nothing yet: the index holds no profile entry for it').toEqual({ rating: null, reviews: 0, received: [], listed: 0, written: 0 })
    w.indexDown(true)
    const err = await readRated(w.index, seller.address).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(Unreachable)
    expect([(err as Unreachable).message, (err as Unreachable).red]).toEqual(["Can't reach the index. Try again.", false])
    await rate(w.index, [seller])
    expect(ratedOf(seller.address), 'held as failed, so a screen says so and shows no rating').toEqual({ failed: true })
  })
})

describe('a listing, from its own page at the index', () => {
  test('its body, whether it is listed, its market and role and its profile\'s rating; one the index holds but no longer lists; one it holds none of; any other shape, nothing asked; down, one quiet line', async () => {
    const seller = (await verifiedWith(w, OTHER_OFFERS)).profiles[0]!
    const [market, role] = seller.label.split('/') as [string, string]
    const at = `${seller.address}/listing/coat`
    const one = (listed: boolean) => ({ index: 'StandInIndexAddress', profile: seller.address, market, role, listing: { address: at, body: { description: 'A wool coat.' }, url: 'x', photos: [], time: 1, listed, ...(!listed && { why: 'deleted' }) }, checks: [], ratings: { value: 8.5, count: 2 } })
    w.indexSays(at, one(true))
    expect(await readListing(w.index, at)).toEqual({ profile: seller.address, market, role, body: { description: 'A wool coat.' }, listed: true, rating: 8.5 })
    w.indexSays(at, one(false))
    expect((await readListing(w.index, at))?.listed, 'kept, deleted: not listed').toBe(false)
    w.indexSays(at, null)
    expect(await readListing(w.index, at), 'none there').toBeNull()
    expect(await readListing(w.index, seller.address), 'a profile, not a listing: nothing asked').toBeNull()
    w.indexDown(true)
    expect(await readListing(w.index, at).catch((e: unknown) => e)).toBeInstanceOf(Unreachable)
    w.indexDown(false)
  })
})

describe('what is new on a profile', () => {
  test('a profile made here: all that comes to it; once the Inbox has shown it, nothing more', async () => {
    const seller = (await verifiedWith(w, OTHER_OFFERS)).profiles[0]!
    const buyer = (await verifiedWith(w, OTHER_REQUESTS)).profiles[0]!
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
    const seller = (await verifiedWith(w, OTHER_OFFERS)).profiles[0]!
    const buyer = (await verifiedWith(w, OTHER_REQUESTS)).profiles[0]!
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

test("what a profile gave: its reviews, vouches and reports, from its own folder, each naming who it is about", async () => {
  const seller = await verifiedWith(w, OTHER_OFFERS)
  const buyer = await verifiedWith(w, OTHER_REQUESTS)
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
