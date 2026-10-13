// What this device keeps, none of it secret: the seed's public fingerprint, its copy of the
// person's profiles (each label, its address and its hosts, from the vault at the last face), the
// profiles hidden from the board, what the last face found in each inbox, how many reviews about
// each profile the person has seen, the requests they approved or declined (by message id), the
// appearance, the settings (settings.ts), and, while setup is under way, its stages, sealed
// (seed/seed.ts). Forgetting the device removes all of it (`forgetLocal`); signing in with the
// passkey brings the profiles back from the vault, none of them hidden.

export type LocalProfile = { label: string; address: string; hosts: string[] }

/** One profile's inbox at the last face: messages found and not yet read, and the cursor reached on each host. */
export type InboxCount = { count: number; after: Record<string, number> }

export type Appearance = 'device' | 'light' | 'dark'

const PREFIX = 'forest.'
const FINGERPRINT = `${PREFIX}fingerprint`
const PROFILES = `${PREFIX}profiles`
const HIDDEN = `${PREFIX}hidden`
const INBOX = `${PREFIX}inbox`
const SEEN = `${PREFIX}seen`
const ANSWERED = `${PREFIX}answered`
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

/** The seed's public fingerprint (seed/passkey.ts): null when this device is not set up, or was forgotten. */
export const fingerprint = (): string | null => read(FINGERPRINT, null)
export const saveFingerprint = (value: string) => write(FINGERPRINT, value)
export const forgetFingerprint = () => localStorage.removeItem(FINGERPRINT)

export const localProfiles = (): LocalProfile[] => read(PROFILES, [])
export const saveProfiles = (profiles: LocalProfile[]) => write(PROFILES, profiles)

/** The profiles hidden from the board, by address. Hiding deletes nothing. */
export const hiddenProfiles = (): string[] => read(HIDDEN, [])
export const hideProfile = (address: string) => write(HIDDEN, [...new Set([...hiddenProfiles(), address])])
export const showProfile = (address: string) => write(HIDDEN, hiddenProfiles().filter((a) => a !== address))

export const inboxCounts = (): Record<string, InboxCount> => read(INBOX, {})
export const saveInboxCounts = (counts: Record<string, InboxCount>) => write(INBOX, counts)

/** How many reviews about the profile the person has seen. */
export const seenReviews = (address: string): number => read<Record<string, number>>(SEEN, {})[address] ?? 0
export const markSeen = (address: string, n: number) => write(SEEN, { ...read<Record<string, number>>(SEEN, {}), [address]: n })

/** The requests the person approved or declined, by message id. A host cannot delete a message, so the app leaves these out. */
export const answered = (): Record<string, 'approved' | 'declined'> => read(ANSWERED, {})
export const markAnswered = (id: string, answer: 'approved' | 'declined') => write(ANSWERED, { ...answered(), [id]: answer })

export const appearance = (): Appearance => read(APPEARANCE, 'device')
export const saveAppearance = (choice: Appearance) => write(APPEARANCE, choice)

/** Every copy this device keeps, the settings among them. */
export function forgetLocal(): void {
  for (const key of Object.keys(localStorage)) if (key.startsWith(PREFIX)) localStorage.removeItem(key)
  globalThis.dispatchEvent?.(new Event(CHANGED))
}
