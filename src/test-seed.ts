// A test seed, for AI testing of the app and for app reviewers (Claude's, OpenAI's): a seed whose
// Profiles folder's address the config lists (config.ts, `testSeeds`). An AI can't approve a
// passkey, and a reviewer may take no extra verification step, so its 24 words open it with no
// passkey, from /type-words (screens/ImportWords.tsx), and it is in use here by an id of its own in a
// passkey's place, `test:<address>`, which no passkey's id can be (theirs are base64url). It is
// held while the tab is open, with no 15 minutes, and kept in the tab's sessionStorage, so a reload
// there asks nothing (device.ts): its words are handed to reviewers, so they are no secret. It skips
// Get verified and makes profiles with no check (flows/profile.ts). Nothing else changes: it posts,
// messages and spends credits like anyone, and since it has no check, the index ignores it, and
// messages it sends show to nobody (flows/inbox.ts). Every other seed is as it always was.

const PREFIX = 'test:'

/** The id a test seed is in use by here, in a passkey's place. */
export const testIdOf = (address: string) => `${PREFIX}${address}`

/** Whether the id in use is a test seed's. */
export const isTestId = (id: string | null | undefined): boolean => typeof id === 'string' && id.startsWith(PREFIX)

/** Whether the Profiles folder at `address` is a test seed's, as `s` lists them. */
export const isTestSeed = (s: { testSeeds?: string[] }, address: string): boolean => !!s.testSeeds?.includes(address)
