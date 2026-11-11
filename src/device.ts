// What this device keeps, in localStorage, none of it secret: the id of the passkey in use and of
// every passkey this device has made or used (so Start never makes a second one where one is), the
// person's profiles' labels and addresses, when each was last used here (opened, posted from or
// written from), the Profiles folder's address and the label entries it has read there, how they
// are verified, their AI apps (each one's name, when it connected, its connection folder's address
// and its profiles' labels), the addresses of the access keys it knows of, where they left off in
// each profile's inbox, the time of the newest review, vouch or report about each profile its
// Reviews or Notifications has shown, their theme, and, while a verification is under way, its
// check and session, the ID check's payment and how many tries it opened, and the gift's buy, then
// an ID check's payment no stamp has used yet (flows/verify.ts); and, of each passkey it made or
// added, its maker, read from the id it sent as it was made, and the name the person gave it here
// (flows/backups.ts, Passkeys.tsx), which no entry holds; the names the person gave other
// profiles, a copy of their Profiles folder's own (flows/names.ts), so they show with nothing
// unlocked; and the point listings' places are centred on, one for each place a listing's form
// read the device's location at, moved a little from it (near.ts). And in sessionStorage, for one
// tab: while an AI app's login or a Share link's address waits through Start and the verification,
// that login or address, since the check runs at Stripe and Didit in the same tab. Never the seed,
// its 24 words, a key, a stamp or a message.
//
// A label entry in the Profiles folder that this device never read, or whose label it doesn't list,
// is a profile made elsewhere, on another device with the same seed: Profiles offers to read them
// then (flows/elsewhere.ts). Each entry read is kept with its label, since the folder is opened
// by flows that save no profile here (an AI app's ticks, the verification): read is not listed.
//
// An access key the person's profile entries list that this device doesn't know was made
// elsewhere, by another browser with the same seed: the next unlock finds its AI app
// (elsewhere-ai.ts).
//
// What is new on a profile is what came after those two marks. A profile this device has no mark for
// yet (on a new device, or after Forget) is marked at what it holds when first read, so nothing old
// shows as new; one made here is marked at the start, so all that comes to it is.
//
// Anything else in this origin's storage is not this app's, or no longer: each start clears it
// (`cleanOld`).

import type { Pending } from '../services/host/client/client.ts'
import { PASSKEY, makerBefore } from './managers.ts'
import type { Check } from './services/verifier.ts'
import { RELOADED } from './version.ts'

export type { Check }

export type Profile = { label: string; address: string }
/** The Profiles folder, as this device last opened it: its address (the wallet's), and each label entry it read there, by the random id of its path, with its label. Never a key. */
export type Folder = { address: string; labels: Record<string, string> }
/** An AI app connected: its connection folder's address, the AI app's name, when it connected, and the labels of the profiles it acts for. Never a key. */
export type Connection = { address: string; name: string; time: number; labels: string[] }
export type Theme = 'device' | 'light' | 'dark'
/**
 * A verification under way: its passkey; its check; the ID check's payment, a Stripe Checkout
 * Session's id, kept from the moment it is made, since Stripe sends the person back with none; the
 * check's session at the verifier and its page, so a tab closed midway opens the same check again; the gift's buy, with its
 * ticket once the verifier signs one; and `kept`, once the stamp is in the Profiles folder and only
 * the profiles are left to show it; and `tries`, how many sessions the ID check's payment has opened,
 * so its third that doesn't pass says it was the last.
 */
export type Under = { passkey: string; check: Check; payment?: string; tries?: number; session?: string; url?: string; gift?: { reference: string; pending: Pending; ticket?: string }; kept?: true }

const KEYS = {
  passkey: 'forest.passkey',
  passkeys: 'forest.passkeys',
  profiles: 'forest.profiles',
  theme: 'forest.theme',
  under: 'forest.setup',
  // Not forest.checks, which lists kept before this key counted every stamp the folder held, an old
  // ID key's among them: cleared once by cleanOld, then worked out fresh at the next unlock.
  checks: 'forest.verified',
  read: 'forest.read',
  seen: 'forest.seen',
  connections: 'forest.connections',
  known: 'forest.known',
  folder: 'forest.folder',
  backups: 'forest.backups',
  points: 'forest.points',
  used: 'forest.used',
  names: 'forest.names',
} as const

/** What waits through a check in this tab, in sessionStorage: an AI app's login, or a Share link's address (App.tsx). */
const WAITING = 'forest.waiting'

/** The keys this app keeps in sessionStorage, for one tab: version.ts's, and what waits through a check. */
export const SESSION_KEYS = [RELOADED, WAITING]

/** What waits through Start, the verification and a first profile, kept for this tab while the page closes: the check runs at Stripe and Didit in this tab, and comes back to a new page. */
export const keepWaiting = (waiting: unknown) => globalThis.sessionStorage?.setItem(WAITING, JSON.stringify(waiting))

/** What waited as the page closed in this tab, taken back once: null when nothing did. */
export function takeWaiting(): unknown {
  const session = globalThis.sessionStorage
  const text = session?.getItem(WAITING)
  if (text == null) return null
  session!.removeItem(WAITING)
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

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

/** How the person is verified: the checks whose stamps their Profiles folder holds from the verifier's current keys, as this device last worked them out. */
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

/** When each profile was last used on this device, by its address: opened, posted from (a listing, a review, a vouch or a report) or written from (a message). */
export const used = (): Record<string, number> => {
  const kept = read<Record<string, unknown>>(KEYS.used, {})
  return Object.fromEntries(Object.entries(kept).filter((e): e is [string, number] => Number.isSafeInteger(e[1])))
}
export const markUsed = (address: string, time = Date.now()) => write(KEYS.used, { ...used(), [address]: time })

/** The time of the newest review, vouch or report about each profile, by its address, that its Reviews or Notifications has shown. */
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

/** The first passkey, among the passkeys this device made or added: the one Yes, I'm new made, which no `backup/<id>` entry names. */
export const FIRST = 'first'

/** What this device knows of a passkey it made or added: its maker, from the id a new passkey sends (Apple, Google), and the name the person gave it. */
export type Made = { maker?: string; name?: string }

/**
 * What this device knows of each passkey it made, added or renamed: by the random id of its entry in
 * the Profiles folder, `backup/<id>`, or FIRST for the first passkey. A note kept before makers were
 * (a manager's full name, alone or with `here`) reads as that name's maker.
 */
export const madeHere = (): Record<string, Made> => {
  const kept = read<Record<string, unknown>>(KEYS.backups, {})
  const out: Record<string, Made> = {}
  for (const [id, v] of Object.entries(kept)) {
    const note = typeof v === 'string' ? { name: v } : typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
    const name = typeof note.name === 'string' && note.name ? note.name : undefined
    // Before makers: a name with no maker beside it may be a manager's full name.
    const before = typeof note.maker !== 'string' && name ? makerBefore(name) : undefined
    const maker = typeof note.maker === 'string' && note.maker ? note.maker : before
    const made: Made = { ...(maker && { maker }), ...(name && !before && { name }) }
    if (made.maker || made.name) out[id] = made
  }
  return out
}
/** A passkey this device made or added, noted: its maker, if its id named one. */
export function noteMade(id: string, made: Made): void {
  const note: Made = { ...(made.maker && { maker: made.maker }), ...(made.name && { name: made.name }) }
  if (note.maker || note.name) write(KEYS.backups, { ...madeHere(), [id]: note })
}
/** A passkey given a name on this device; an empty one, or its maker's, takes its own name back. */
export function nameMade(id: string, name: string): void {
  const { [id]: was, ...rest } = madeHere()
  const given = name.trim()
  const note: Made = { ...(was?.maker && { maker: was.maker }), ...(given && given !== (was?.maker ?? PASSKEY) && { name: given }) }
  write(KEYS.backups, note.maker || note.name ? { ...rest, [id]: note } : rest)
}
export function unnoteMade(id: string): void {
  const { [id]: _, ...rest } = madeHere()
  write(KEYS.backups, rest)
}

/** The names the person gave other profiles, by address, as this device last read them from the Profiles folder or saved them: shown in place of their keys. */
export const names = (): Record<string, string> => {
  const kept = read<Record<string, unknown>>(KEYS.names, {})
  return Object.fromEntries(Object.entries(kept).filter((e): e is [string, string] => typeof e[1] === 'string' && e[1].length > 0))
}
/** The names as the Profiles folder holds them now, in place of what this device kept. */
export const keepNames = (all: Record<string, string>) => write(KEYS.names, Object.keys(all).length ? all : undefined)

/** A listing's place's centre, kept: a point near a place the device posted from, in degrees as decimal text, as a place holds them. */
export type Point = { lat: string; lon: string }
const isPoint = (v: unknown): v is Point => typeof (v as Point | null)?.lat === 'string' && typeof (v as Point).lon === 'string'

/** The points kept for listings' places, oldest first: one for each place a listing's form read the device's location at (near.ts). */
export const points = (): Point[] => read<unknown[]>(KEYS.points, []).filter(isPoint)
export const keepPoint = (p: Point) => write(KEYS.points, [...points(), { lat: p.lat, lon: p.lon }])

export const theme = (): Theme => {
  const t = read<string>(KEYS.theme, 'device')
  return t === 'light' || t === 'dark' ? t : 'device'
}
export const saveTheme = (t: Theme) => write(KEYS.theme, t === 'device' ? undefined : t)

/** The verification under way, if any: one kept without its passkey or its check is none. */
export const under = (): Under | null => {
  const u = read<Under | null>(KEYS.under, null)
  return typeof u?.passkey === 'string' && (u.check === 'face' || u.check === 'id') ? u : null
}
export const keepUnder = (u: Under) => write(KEYS.under, u)
export const endUnder = () => write(KEYS.under, undefined)

/** Forget this device: the profiles, when each was last used, and the Profiles folder, the names given others, how they are verified, the AI apps and the keys it knows of, what was new on each, what it knew of the passkeys it made, the points kept for places, the theme, the passkey in use and any verification under way. The ids of the passkeys it knows stay, so Start asks for them and never makes a second one. */
export function forget(): void {
  for (const key of [KEYS.passkey, KEYS.profiles, KEYS.used, KEYS.folder, KEYS.names, KEYS.checks, KEYS.connections, KEYS.known, KEYS.read, KEYS.seen, KEYS.backups, KEYS.points, KEYS.theme, KEYS.under]) store().removeItem(key)
  globalThis.dispatchEvent?.(new Event(CHANGED))
}

/** Clears, at every start, any key in localStorage or sessionStorage that is not one of this app's, so one it stops using goes too. */
export function cleanOld(): void {
  const s = store()
  const known: string[] = Object.values(KEYS)
  for (const key of Object.keys(s)) if (!known.includes(key)) s.removeItem(key)
  const session = globalThis.sessionStorage
  if (session) for (const key of Object.keys(session)) if (!SESSION_KEYS.includes(key)) session.removeItem(key)
}
