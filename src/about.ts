// Which listing a message or a review is about, as the app shows it: only one that belongs to
// someone in it. A conversation's is the listing the first of its messages names under the other
// profile's address or under the person's own there; a review's, one under its subject's address
// or its writer's. Any other listing is left out, and the message or the review shows as ever: so a
// stranger can't open a conversation with someone else's listing, nor a review borrow one. A
// listing's full address is `<profile address>/listing/<id>`, the shape a review's `listing` has.

import { LISTING_ADDRESS } from './services/index.ts'

/** Whether `listing` is a listing's full address. */
export const isListing = (listing: unknown): listing is string => typeof listing === 'string' && LISTING_ADDRESS.test(listing)

/** `listing`, when it is a listing's full address under one of `profiles`' addresses; else nothing. */
export function listingOf(listing: unknown, profiles: readonly string[]): string | undefined {
  if (!isListing(listing)) return undefined
  return profiles.includes(LISTING_ADDRESS.exec(listing)![1]!) ? listing : undefined
}

/** What the conversation between the person's profile `mine` and `them` is about: the listing the first of its messages names under either's address. */
export const aboutOf = (messages: ReadonlyArray<{ listing?: string }>, mine: string, them: string): string | undefined => {
  for (const m of messages) {
    const listing = listingOf(m.listing, [them, mine])
    if (listing) return listing
  }
  return undefined
}
