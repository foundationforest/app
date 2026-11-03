// What this device keeps, in localStorage, none of it secret: the id of the passkey in use and of
// every passkey this device has made or used (so Start never makes a second one where one is), the
// person's profiles' labels and addresses, the Profiles folder's address and the label entries it
// has read there, how they are verified, their AI apps (each one's name, when it connected, its
// connection folder's address and its profiles' labels), the addresses of the access keys it knows
// of, where they left off in each profile's inbox, the time of the newest review, vouch or report
// about each profile its Reviews has shown, their theme, and, while a verification is under way, its
// check and session, the ID check's payment and the gift's buy, then an ID check's payment no stamp
// has used yet (flows/verify.ts); and the password manager's name of each backup passkey it added,
// by its entry in the Profiles folder (flows/backups.ts), which the entry itself can't hold. Never the
// seed, a key, a stamp or a message.
//
// A label entry in the Profiles folder that this device never read, or whose label it doesn't list,
// is a profile made elsewhere, on another device with the same seed: Profiles offers to read them
// then (flows/elsewhere.ts). Each entry read is kept with its label, since the folder is opened
// by flows that save no profile here (an AI app's ticks, the verification): read is not listed.
//
// An access key the person's profile entries list that this device doesn't know was made
// elsewhere, by another browser with the same seed: Settings offers to find the AI apps then.
//
// What is new on a profile is what came after those two marks. A profile this device has no mark for
// yet (on a new device, or after Forget) is marked at what it holds when first read, so nothing old
// shows as new; one made here is marked at the start, so all that comes to it is.
//
// Anything else at this origin is the earlier app's, built on an architecture that is gone, and is
// cleared at the first start (`cleanOld`): its passkey ids are kept, under the same name and in the
// same form, so the passkeys made with it count here too.

import type { Pending } from '../services/host/client/client.ts'
import type { Check } from './services/verifier.ts'

export type { Check }

export type Profile = { label: string; address: string }
/** The Profiles folder, as this device last opened it: its address (the wallet's), and each label entry it read there, by the random id of its path, with its label. Never a key. */
export type Folder = { address: string; labels: Record<string, string> }
/** An AI app connected: its connection folder's address, the AI app's name, when it connected, and the labels of the profiles it acts for. Never a key. */
export type Connection = { address: string; name: string; time: number; labels: string[] }
export type Theme = 'device' | 'light' | 'dark'
/**
 * A verification under way: its passkey; its check (the face check when absent, as the earlier
 * version of this app kept it); the ID check's payment, a Stripe Checkout Session's id, kept from
 * the moment it is made, since Stripe sends the person back with none; the check's session at the
 * verifier and its page, so a tab closed midway opens the same check again; the gift's buy, with its
 * ticket once the verifier signs one; and `kept`, once the stamp is in the Profiles folder and only
 * the profiles are left to show it.
 */
export type Under = { passkey: string; check?: Check; payment?: string; session?: string; url?: string; gift?: { reference: string; pending: Pending; ticket?: string }; kept?: true }

/** This app's storage, by the version of what it keeps. The earlier app kept none. */
const VERSION = '2'

const KEYS = {
  version: 'forest.v',
  passkey: 'forest.passkey',
  passkeys: 'forest.passkeys',
  profiles: 'forest.profiles',
  theme: 'forest.theme',
  under: 'forest.setup',
  checks: 'forest.checks',
  read: 'forest.read',
  seen: 'forest.seen',
  connections: 'forest.connections',
  known: 'forest.known',
  folder: 'forest.folder',
  backups: 'forest.backups',
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

/** The Profiles folder, once this device has opened it; else null. */
export const folder = (): Folder | null => {
  const f = read<Folder | null>(KEYS.folder, null)
  if (typeof f?.address !== 'string' || typeof f.labels !== 'object' || f.labels === null) return null
  return { address: f.address, labels: Object.fromEntries(Object.entries(f.labels).filter((e): e is [string, string] => typeof e[1] === 'string')) }
}
/** The Profiles folder at `address` opened, with these label entries read in it, by id: kept beside those read before, unless they were another folder's. */
export function readLabels(address: string, labels: Record<string, string>): void {
  const was = folder()
  write(KEYS.folder, { address, labels: { ...(was?.address === address ? was.labels : {}), ...labels } })
}

/** How the person is verified: the checks whose stamps their Profiles folder holds, as this device last saw it. */
export const checks = (): Check[] => {
  const kept = read<unknown[]>(KEYS.checks, [])
  return (['face', 'id'] as const).filter((c) => kept.includes(c))
}
export const saveChecks = (list: Check[]) => write(KEYS.checks, [...new Set(list)].sort())

const isConnection = (v: unknown): v is Connection => {
  const c = v as Connection | null
  return typeof c?.address === 'string' && typeof c.name === 'string' && Number.isSafeInteger(c.time) && Array.isArray(c.labels) && c.labels.every((l) => typeof l === 'string')
}

/** The person's AI apps, as this device last saw them, oldest first. */
export const connections = (): Connection[] => read<unknown[]>(KEYS.connections, []).filter(isConnection)
export const saveConnections = (list: Connection[]) => write(KEYS.connections, [...new Map(list.map((c) => [c.address, { ...c, labels: [...new Set(c.labels)].sort() }])).values()].sort((a, b) => a.time - b.time))
export const keepConnection = (c: Connection) => saveConnections([...connections().filter((d) => d.address !== c.address), c])
export const dropConnection = (address: string) => saveConnections(connections().filter((c) => c.address !== address))

/** The access keys this device knows of, by address: those it made, and every one the person's profile entries listed when it last found their AI apps. Addresses only, never a key. */
export const knownKeys = (): string[] => read<unknown[]>(KEYS.known, []).filter((a): a is string => typeof a === 'string')
export const saveKnownKeys = (addresses: string[]) => write(KEYS.known, [...new Set(addresses)].sort())
export const knowKeys = (addresses: string[]) => saveKnownKeys([...knownKeys(), ...addresses])

/** Where the person left off in each profile's inbox, by the profile's address: the host's cursor after the last entry they opened. */
export const cursors = (): Record<string, number> => {
  const kept = read<Record<string, unknown>>(KEYS.read, {})
  return Object.fromEntries(Object.entries(kept).filter((e): e is [string, number] => Number.isSafeInteger(e[1])))
}
export const saveCursors = (more: Record<string, number>) => write(KEYS.read, { ...cursors(), ...more })

/** The time of the newest review, vouch or report about each profile, by its address, that its Reviews has shown. */
export const seen = (): Record<string, number> => {
  const kept = read<Record<string, unknown>>(KEYS.seen, {})
  return Object.fromEntries(Object.entries(kept).filter((e): e is [string, number] => Number.isSafeInteger(e[1])))
}
export const saveSeen = (more: Record<string, number>) => write(KEYS.seen, { ...seen(), ...more })

/** A profile made on this device: marked at the start, so every message, review, vouch and report that comes to it is new. */
export function markNew(address: string): void {
  if (!(address in cursors())) saveCursors({ [address]: 0 })
  if (!(address in seen())) saveSeen({ [address]: 0 })
}

/** The password manager's name of each backup this device added, by the random id of its entry in the Profiles folder, `backup/<id>`. */
export const backupNames = (): Record<string, string> => {
  const kept = read<Record<string, unknown>>(KEYS.backups, {})
  return Object.fromEntries(Object.entries(kept).filter((e): e is [string, string] => typeof e[1] === 'string'))
}
export const nameBackup = (id: string, name: string) => write(KEYS.backups, { ...backupNames(), [id]: name })
export function unnameBackup(id: string): void {
  const { [id]: _, ...rest } = backupNames()
  write(KEYS.backups, rest)
}

export const theme = (): Theme => {
  const t = read<string>(KEYS.theme, 'device')
  return t === 'light' || t === 'dark' ? t : 'device'
}
export const saveTheme = (t: Theme) => write(KEYS.theme, t === 'device' ? undefined : t)

export const under = (): Under | null => read<Under | null>(KEYS.under, null)
export const keepUnder = (u: Under) => write(KEYS.under, u)
export const endUnder = () => write(KEYS.under, undefined)

/** Forget this device: the profiles and the Profiles folder, how they are verified, the AI apps and the keys it knows of, what was new on each, the backups' names, the theme, the passkey in use and any verification under way. The ids of the passkeys it knows stay, so Start asks for them and never makes a second one. */
export function forget(): void {
  for (const key of [KEYS.passkey, KEYS.profiles, KEYS.folder, KEYS.checks, KEYS.connections, KEYS.known, KEYS.read, KEYS.seen, KEYS.backups, KEYS.theme, KEYS.under]) store().removeItem(key)
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
