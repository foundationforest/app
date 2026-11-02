// What this device keeps, in localStorage, none of it secret: the id of the passkey in use and of
// every passkey this device has made or used (so Start never makes a second one where one is), the
// person's profiles' labels and addresses, their theme, and, while a verification is under way, its
// check and its gift (flows/verify.ts). Never the seed, a key, a stamp or a message.
//
// Anything else at this origin is the earlier app's, built on an architecture that is gone, and is
// cleared at the first start (`cleanOld`): its passkey ids are kept, under the same name and in the
// same form, so the passkeys made with it count here too.

import type { Pending } from '../services/host/client/client.ts'

export type Profile = { label: string; address: string }
export type Theme = 'device' | 'light' | 'dark'
/** A verification under way: its passkey, the check's session at the verifier, and the gift's buy, with its ticket once the verifier signs one. */
export type Under = { passkey: string; session?: string; gift?: { reference: string; pending: Pending; ticket?: string } }

/** This app's storage, by the version of what it keeps. The earlier app kept none. */
const VERSION = '2'

const KEYS = {
  version: 'forest.v',
  passkey: 'forest.passkey',
  passkeys: 'forest.passkeys',
  profiles: 'forest.profiles',
  theme: 'forest.theme',
  under: 'forest.setup',
} as const

/** The key this app keeps in sessionStorage, for one tab (version.ts). */
export const SESSION_KEYS = ['forest.reloaded']

/** The event a change here sends, so what shows it reads it again. */
export const CHANGED = 'forest:device'

const store = () => globalThis.localStorage

function read<T>(key: string, fallback: T): T {
  try {
    const text = store().getItem(key)
    return text === null ? fallback : (JSON.parse(text) as T)
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  if (value === undefined) store().removeItem(key)
  else store().setItem(key, JSON.stringify(value))
  globalThis.dispatchEvent?.(new Event(CHANGED))
}

const isId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{16,}$/.test(v)

/** The passkey in use here, a verified person's: the one each action asks for. None before Start has verified someone, or after Forget. */
export const passkey = (): string | null => read<string | null>(KEYS.passkey, null)

/** Every passkey this device has made or used, by id: what Start asks for, and what it never makes again. */
export const passkeys = (): string[] => read<unknown[]>(KEYS.passkeys, []).filter(isId)

/** A passkey that answered here, or was made here: known for good, so Start asks for it and never makes another beside it. */
export const knowPasskey = (id: string) => write(KEYS.passkeys, [...new Set([...passkeys(), id])])

/** The passkey of a person verified here: in use from now, so the app opens on their profiles. */
export function usePasskey(id: string): void {
  knowPasskey(id)
  write(KEYS.passkey, id)
}

export const profiles = (): Profile[] => read<Profile[]>(KEYS.profiles, [])
export const saveProfiles = (list: Profile[]) => write(KEYS.profiles, [...new Map(list.map((p) => [p.label, p])).values()].sort((a, b) => a.label.localeCompare(b.label)))
export const addProfile = (p: Profile) => saveProfiles([...profiles().filter((q) => q.label !== p.label), p])

export const theme = (): Theme => {
  const t = read<string>(KEYS.theme, 'device')
  return t === 'light' || t === 'dark' ? t : 'device'
}
export const saveTheme = (t: Theme) => write(KEYS.theme, t === 'device' ? undefined : t)

export const under = (): Under | null => read<Under | null>(KEYS.under, null)
export const keepUnder = (u: Under) => write(KEYS.under, u)
export const endUnder = () => write(KEYS.under, undefined)

/** Forget this device: the profiles, the theme, the passkey in use and any verification under way. The ids of the passkeys it knows stay, so Start asks for them and never makes a second one. */
export function forget(): void {
  for (const key of [KEYS.passkey, KEYS.profiles, KEYS.theme, KEYS.under]) store().removeItem(key)
  globalThis.dispatchEvent?.(new Event(CHANGED))
}

/**
 * Clears what this origin keeps that the app does not know: at the first start, all the earlier
 * app kept but its passkey ids; at every start, any key in localStorage or sessionStorage that is
 * not one of this app's.
 */
export function cleanOld(): void {
  const s = store()
  if (s.getItem(KEYS.version) !== JSON.stringify(VERSION)) {
    const ids = passkeys()
    s.clear()
    if (ids.length) s.setItem(KEYS.passkeys, JSON.stringify(ids))
    s.setItem(KEYS.version, JSON.stringify(VERSION))
  }
  const known: string[] = Object.values(KEYS)
  for (const key of Object.keys(s)) if (!known.includes(key)) s.removeItem(key)
  const session = globalThis.sessionStorage
  if (session) for (const key of Object.keys(session)) if (!SESSION_KEYS.includes(key)) session.removeItem(key)
}

/** The caches the service worker keeps (vite.config.ts): the precache, the shell and the proving files. */
const isOurCache = (name: string) => name === 'shell' || name === 'proofs' || name.startsWith('workbox-precache')

/** Clears the caches and databases this origin keeps that the app does not: the earlier app's proving files among them. */
export async function cleanOldCaches(): Promise<void> {
  try {
    for (const name of await caches.keys()) if (!isOurCache(name)) await caches.delete(name)
  } catch {
    // No caches here.
  }
  try {
    for (const db of await indexedDB.databases()) if (db.name && !db.name.startsWith('workbox')) indexedDB.deleteDatabase(db.name)
  } catch {
    // No IndexedDB here, or it cannot list its databases.
  }
}
