// What this device keeps besides the locked seed, none of it secret: its copy of the person's
// profiles (each label, its address and its hosts, from the vault at the last face), what the last
// face found in each inbox, how many reviews about each profile the person has seen, and the
// appearance. Forgetting the device removes all of it (`forgetLocal`); the 24 words bring the
// profiles back from the vault.

export type LocalProfile = { label: string; address: string; hosts: string[] }

/** One profile's inbox at the last face: messages found and not yet read, and the cursor reached on each host. */
export type InboxCount = { count: number; after: Record<string, number> }

export type Appearance = 'device' | 'light' | 'dark'

const PREFIX = 'forest.'
const PROFILES = `${PREFIX}profiles`
const INBOX = `${PREFIX}inbox`
const SEEN = `${PREFIX}seen`
const APPEARANCE = `${PREFIX}appearance`

/** The event a change here sends, so what shows it reads it again. */
export const CHANGED = 'forest:local'

function read<T>(key: string, fallback: T): T {
  try {
    const text = localStorage.getItem(key)
    return text === null ? fallback : (JSON.parse(text) as T)
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
  globalThis.dispatchEvent?.(new Event(CHANGED))
}

export const localProfiles = (): LocalProfile[] => read(PROFILES, [])
export const saveProfiles = (profiles: LocalProfile[]) => write(PROFILES, profiles)

export const inboxCounts = (): Record<string, InboxCount> => read(INBOX, {})
export const saveInboxCounts = (counts: Record<string, InboxCount>) => write(INBOX, counts)

/** How many reviews about the profile the person has seen. */
export const seenReviews = (address: string): number => read<Record<string, number>>(SEEN, {})[address] ?? 0
export const markSeen = (address: string, n: number) => write(SEEN, { ...read<Record<string, number>>(SEEN, {}), [address]: n })

export const appearance = (): Appearance => read(APPEARANCE, 'device')
export const saveAppearance = (choice: Appearance) => write(APPEARANCE, choice)

/** Every copy this device keeps, the settings among them. */
export function forgetLocal(): void {
  for (const key of Object.keys(localStorage)) if (key.startsWith(PREFIX)) localStorage.removeItem(key)
  globalThis.dispatchEvent?.(new Event(CHANGED))
}
