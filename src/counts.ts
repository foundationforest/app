// What a place's corner shows, the same everywhere: how many things inside what a tap opens have
// something new, never how many messages, capped at 9+; or the yellow !, in the count's place, when
// something there needs updating (a listing, or a review written, that its market outgrew). The
// things a count counts:
// - the Messages tab: the conversations with something new, across every profile;
// - a profile (Home's card, the sidebar): its conversations with something new, and its new
//   reviews, vouches and reports;
// - a profile's messages button: its conversations with something new;
// - an offer: its conversations with something new, the ones about it.
// An inbox entry hides who wrote it until the seed opens it (the standard's The inbox), so new
// messages not opened yet can't be told apart into conversations: where they are among what is new,
// the black dot sits in the count's place, until the messages are opened and the exact count takes
// it. An offer shows nothing of its messages until they are opened.

/** What a corner shows: a count (0, nothing), the new dot, or the yellow !. */
export type Mark = number | 'dot' | 'warn'

/** A count as it shows: up to 9, then 9+. */
export const countText = (n: number) => (n > 9 ? '9+' : String(n))

/** How many new, beside a rating: 1 new, up to 9+ new. */
export const newText = (n: number) => `${countText(n)} new`

/** What one profile's messages hold that is new: the conversations with something new, or, with new messages not opened yet, the dot. */
export const messagesMark = (unopened: number, freshThreads: number): Mark => (unopened > 0 ? 'dot' : freshThreads)

/** A profile's mark: the ! when something of it needs updating; the dot when its messages are; else its conversations with something new and its new reviews, vouches and reports. */
export function profileMark(messages: Mark, received: number, outgrown: number): Mark {
  if (outgrown > 0) return 'warn'
  if (messages === 'dot') return 'dot'
  return (messages === 'warn' ? 0 : messages) + received
}

/** The Messages tab's mark: the dot while any profile's new messages are not opened yet, else every profile's conversations with something new. */
export function allMessagesMark(marks: Mark[]): Mark {
  if (marks.includes('dot')) return 'dot'
  return marks.reduce<number>((n, m) => n + (typeof m === 'number' ? m : 0), 0)
}

/** An offer's mark: the ! when its market outgrew it; else, once the messages are opened, its conversations with something new; nothing before. */
export const offerMark = (outgrown: boolean, opened: boolean, freshThreads: number): Mark => (outgrown ? 'warn' : opened ? freshThreads : 0)

/** Whether a mark shows anything. */
export const marked = (m: Mark) => m !== 0

/** A mark in words, for screen readers: 3 new, New, Needs updating. */
export const markWords = (m: Mark) => (m === 'warn' ? 'Needs updating' : m === 'dot' ? 'New' : `${countText(m)} new`)
