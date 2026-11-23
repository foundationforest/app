// What a market outgrew, against services' own host (world.ts): each entry one of the person's
// profiles posted that its market's file no longer takes as it is, a listing checked against its
// role, a review against the role of the profile it is about too, such as one holding a field its
// market asked once; what still fits of such a review; held in the page once read, and let go after
// Forget; and nothing for a profile whose market left the directory.

import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'

import { post } from '../src/flows/entries.ts'
import { letGoOutgrown, outgrownHeld, outgrownOf, readOutgrown } from '../src/flows/outgrown.ts'
import { fitting } from '../src/form.ts'
import { markets } from '../src/markets.ts'
import { twoSides } from './directory.ts'
import { type World, freshDevice, verifiedWith, world } from './world.ts'

// A market with two sides: the one that offers is reviewed, the one that requests writes.
const { market, offer, request } = twoSides(markets)
const name = market.name
const reviewed = offer.role
const writer = request.role

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

test('a listing and a review a market outgrew, among those it takes, either way between its sides', async () => {
  const seller = (await verifiedWith(w, `${name}/${reviewed}`)).profiles[0]!
  const b = await verifiedWith(w, `${name}/${writer}`)
  const buyer = b.profiles[0]!
  const s = await verifiedWith(w, `${name}/${reviewed}`)
  const other = s.profiles[0]!

  // An older app's check let these through; post writes what it is given.
  await post(w, b.seed, buyer, 'review', { subject: seller.address, score: '9', text: 'Quick and kind.' })
  const oldReview = { subject: seller.address, score: '8', text: 'Quick.', speed: 'fast' }
  const old = await post(w, b.seed, buyer, 'review', oldReview)
  const oldListing = await post(w, b.seed, buyer, 'listing', { description: 'A wool coat.', colour: 'red' })
  await post(w, b.seed, buyer, 'listing', { description: 'A linen shirt.' })
  // A field its market asked once, about the other side too.
  const aboutBuyer = await post(w, s.seed, other, 'review', { subject: buyer.address, score: '7', speed: 'fast' })

  expect((await outgrownOf(w, buyer)).map((e) => e.path).sort(), 'what fits is no notice').toEqual([old, oldListing].sort())
  expect((await outgrownOf(w, other)).map((e) => e.path), 'about the other side').toEqual([aboutBuyer])

  const kept = fitting(name, writer, oldReview, 'review', reviewed)
  expect(kept, 'what still fits of the review').toEqual({ subject: seller.address, score: '8', text: 'Quick.' })
  expect(markets.checkEntry(name, writer, 'review', kept, reviewed)).toBeNull()
})

test('held in the page once read, let go after Forget; a profile whose market left the directory has none', async () => {
  const b = await verifiedWith(w, `${name}/${writer}`)
  const buyer = b.profiles[0]!
  const path = await post(w, b.seed, buyer, 'listing', { description: 'A wool coat.', colour: 'red' })
  expect(outgrownHeld(buyer.address)).toBeUndefined()
  await readOutgrown(w, [buyer])
  expect(outgrownHeld(buyer.address)?.map((e) => e.path)).toEqual([path])
  letGoOutgrown()
  expect(outgrownHeld(buyer.address)).toBeUndefined()
  expect(markets.market('gone'), 'a market the directory does not list').toBeUndefined()
  expect(await outgrownOf(w, { label: 'gone/buyer', address: buyer.address }), 'nothing to update it to').toEqual([])
})
