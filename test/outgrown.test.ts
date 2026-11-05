// What a market outgrew, against services' own host (world.ts): each entry one of the person's
// profiles posted that its market's file no longer takes as it is, a listing checked against its
// role, a review against the role of the profile it is about too; what still fits of such a review;
// held in the page once read, and let go after Forget; and nothing for a profile whose market left
// the directory.

import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'

import { post } from '../src/flows/entries.ts'
import { letGoOutgrown, outgrownHeld, outgrownOf, readOutgrown } from '../src/flows/outgrown.ts'
import { fitting } from '../src/form.ts'
import { markets } from '../src/markets.ts'
import { type World, freshDevice, verifiedWith, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

test("a listing and a review a market outgrew, among those it takes: a review's fields checked against whom it is about", async () => {
  const seller = (await verifiedWith(w, 'clothing/seller')).profiles[0]!
  const b = await verifiedWith(w, 'clothing/buyer')
  const buyer = b.profiles[0]!
  const s = await verifiedWith(w, 'clothing/seller')
  const other = s.profiles[0]!

  // An older app's check let these through; post writes what it is given.
  await post(w, b.seed, buyer, 'review', { subject: seller.address, score: '9', asDescribed: 'yes' })
  const oldReview = { subject: seller.address, score: '8', text: 'Quick.', speed: 'fast' }
  const old = await post(w, b.seed, buyer, 'review', oldReview)
  const oldListing = await post(w, b.seed, buyer, 'listing', { description: 'A wool coat.', location: { area: 'Lavapiés, Madrid' } })
  await post(w, b.seed, buyer, 'listing', { description: 'A linen shirt.' })
  // asDescribed is a review field for sellers only: about a buyer it doesn't fit.
  const aboutBuyer = await post(w, s.seed, other, 'review', { subject: buyer.address, score: '7', asDescribed: 'yes' })

  expect((await outgrownOf(w, buyer)).map((e) => e.path).sort(), 'what fits is no notice').toEqual([old, oldListing].sort())
  expect((await outgrownOf(w, other)).map((e) => e.path), 'checked against the role of whom it is about').toEqual([aboutBuyer])

  const kept = fitting('clothing', 'buyer', oldReview, 'review', 'seller')
  expect(kept, 'what still fits of the review').toEqual({ subject: seller.address, score: '8', text: 'Quick.' })
  expect(markets.checkEntry('clothing', 'buyer', 'review', kept, 'seller')).toBeNull()
})

test('held in the page once read, let go after Forget; a profile whose market left the directory has none', async () => {
  const b = await verifiedWith(w, 'clothing/buyer')
  const buyer = b.profiles[0]!
  const path = await post(w, b.seed, buyer, 'listing', { description: 'A wool coat.', location: { area: 'Lavapiés, Madrid' } })
  expect(outgrownHeld(buyer.address)).toBeUndefined()
  await readOutgrown(w, [buyer])
  expect(outgrownHeld(buyer.address)?.map((e) => e.path)).toEqual([path])
  letGoOutgrown()
  expect(outgrownHeld(buyer.address)).toBeUndefined()
  expect(await outgrownOf(w, { label: 'gone/buyer', address: buyer.address }), 'nothing to update it to').toEqual([])
})
