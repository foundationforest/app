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
import { fieldWith } from './directory.ts'
import { type World, freshDevice, verifiedWith, world } from './world.ts'

// A market with a review field kept for reviews of one role, and another role, which writes them.
const found = fieldWith(markets, 'a choice for reviews of one role, in a market with another', (f, _, side) => f.type === 'choice' && f.roles !== undefined && side.market.roles.some((r) => !f.roles!.includes(r.role)), 'review')
const name = found.market.name
const reviewed = found.role
const writer = found.market.roles.find((r) => !found.field.roles!.includes(r.role))!.role
const answer = { [found.name]: found.field.values![0]! }

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

test("a listing and a review a market outgrew, among those it takes: a review's fields checked against whom it is about", async () => {
  const seller = (await verifiedWith(w, `${name}/${reviewed}`)).profiles[0]!
  const b = await verifiedWith(w, `${name}/${writer}`)
  const buyer = b.profiles[0]!
  const s = await verifiedWith(w, `${name}/${reviewed}`)
  const other = s.profiles[0]!

  // An older app's check let these through; post writes what it is given.
  await post(w, b.seed, buyer, 'review', { subject: seller.address, score: '9', ...answer })
  const oldReview = { subject: seller.address, score: '8', text: 'Quick.', speed: 'fast' }
  const old = await post(w, b.seed, buyer, 'review', oldReview)
  const oldListing = await post(w, b.seed, buyer, 'listing', { description: 'A wool coat.', colour: 'red' })
  await post(w, b.seed, buyer, 'listing', { description: 'A linen shirt.' })
  // The field is for reviews of the other role only: about this one it doesn't fit.
  const aboutBuyer = await post(w, s.seed, other, 'review', { subject: buyer.address, score: '7', ...answer })

  expect((await outgrownOf(w, buyer)).map((e) => e.path).sort(), 'what fits is no notice').toEqual([old, oldListing].sort())
  expect((await outgrownOf(w, other)).map((e) => e.path), 'checked against the role of whom it is about').toEqual([aboutBuyer])

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
