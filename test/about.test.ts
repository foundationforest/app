// Which listing a message or a review is about (src/about.ts): only one that belongs to someone in
// it. Its rule alone here; inbox.test.ts sends a third person's listing through the host.

import { expect, test } from 'vitest'

import { aboutOf, listingOf } from '../src/about.ts'

const [them, mine, third] = ['TheirAddress1', 'MineAddress2', 'ThirdAddress3']
const of = (profile: string, id = 'a1') => `${profile}/listing/${id}`

test("a review's listing: its subject's or its writer's; a third person's, or anything not a listing's address, left out", () => {
  expect(listingOf(of(them), [them, mine])).toBe(of(them))
  expect(listingOf(of(mine), [them, mine])).toBe(of(mine))
  expect(listingOf(of(third), [them, mine]), "a third person's").toBeUndefined()
  for (const odd of [undefined, 7, '', them, `${them}/review/a1`, `${them}/listing/`, `x/y/listing/a1`]) expect(listingOf(odd, [them, mine]), String(odd)).toBeUndefined()
})

test("a conversation's: the first message naming one of theirs or one of the person's own there, a third person's passed over", () => {
  expect(aboutOf([{}, { listing: of(third) }], mine, them), "a stranger's opening with someone else's listing: no About").toBeUndefined()
  expect(aboutOf([{ listing: of(third) }, {}, { listing: of(them, 'b2') }, { listing: of(mine) }], mine, them)).toBe(of(them, 'b2'))
  expect(aboutOf([{ listing: of(mine) }], mine, them), "the person's own, written to them").toBe(of(mine))
  expect(aboutOf([], mine, them)).toBeUndefined()
})
