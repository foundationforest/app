// What this device keeps, in localStorage, none of it secret: the id of the passkey in use and of
// every passkey this device has made or used (so Start asks for those), the person's profiles'
// labels and addresses, the Profiles folder's address and the label entries it has read there, with
// when each was made (the entry says), how they are verified, of each ID stamp the kind of document
// and its own name for it, its country, when it runs out and the path of its entry (from the stamp's
// facts, a copy, so Your checks lists them with nothing unlocked; never the name, birth date or number
// on it), their AI apps (each one's name, when it connected, its connection folder's address and its
// profiles' labels), the addresses of the access keys it knows of, where they left off in each
// profile's inbox, the time of the newest review, vouch or report about each profile its Reviews has
// shown, their theme, whether setup has offered Add a backup here, and, while a verification is under
// way, its check and session, the ID check's payment and how many tries it opened, and the gift's
// buy, then an ID check's payment no stamp has used yet (flows/verify.ts); and, of each passkey it
// made or added, its maker, read from the id it sent as it was made, and the name the person gave it
// here (flows/backups.ts, Passkeys.tsx), which no entry holds; the names the person gave other
// profiles, a copy of their Profiles folder's own (flows/names.ts), so they show with nothing
// unlocked; the morning email, if it is on, the same way (flows/email.ts): the host's id for it, the
// email address and the profiles it counts. Nothing of where a listing's place is: its centre is
// moved from the seed alone (near.ts). Never the seed, its 24 words, a key, a stamp or a message.
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
/** The Profiles folder, as this device last opened it: its address (the wallet's), and each label entry it read there, by the random id of its path, with its label, and when it says the profile was made. Never a key. */
export type Folder = { address: string; labels: Record<string, string>; made: Record<string, number> }
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
  // Not forest.verified, nor forest.checks before it: each was kept while the verifier signed with
  // keys it has since replaced (both, when it began signing the standard's facts as a list; the ID
  // key before that), so it can name a check whose stamp counts for nothing. Cleared by cleanOld; until Start or a check works it out
  // again, the person's checks are what their profiles show.
  checks: 'forest.counted',
  read: 'forest.read',
  seen: 'forest.seen',
  connections: 'forest.connections',
  known: 'forest.known',
  folder: 'forest.folder',
  backups: 'forest.backups',
  ids: 'forest.ids',
  names: 'forest.names',
  email: 'forest.email',
  backupAsked: 'forest.backupAsked',
} as const

/** The keys this app keeps in sessionStorage, for one tab: version.ts's. */
export const SESSION_KEYS = [RELOADED]

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

/** A passkey deleted: this device asks for it no more. */
export function unknowPasskey(id: string): void {
  const rest = passkeys().filter((p) => p !== id)
  // The last one gone: the device keeps nothing of Forest's.
  write(KEYS.passkeys, rest.length ? rest : undefined)
}

/** Whether setup has offered Add a backup on this device: it does so once. */
export const backupAsked = (): boolean => read<unknown>(KEYS.backupAsked, false) === true
export const askedBackup = () => write(KEYS.backupAsked, true)

/** The passkey of a person verified here: in use from now, so the app opens on their profiles. */
export function usePasskey(id: string): void {
  knowPasskey(id)
  write(KEYS.passkey, id)
}

export const profiles = (): Profile[] => read<Profile[]>(KEYS.profiles, [])
export const saveProfiles = (list: Profile[]) => write(KEYS.profiles, [...new Map(list.map((p) => [p.label, p])).values()].sort((a, b) => a.label.localeCompare(b.label)))
export const addProfile = (p: Profile) => saveProfiles([...profiles().filter((q) => q.label !== p.label), p])
/** A profile deleted: this device lists it no more. */
export const dropProfile = (label: string) => saveProfiles(profiles().filter((p) => p.label !== label))

/** The Profiles folder, once this device has opened it; else null. */
export const folder = (): Folder | null => {
  const f = read<Folder | null>(KEYS.folder, null)
  if (typeof f?.address !== 'string' || typeof f.labels !== 'object' || f.labels === null) return null
  const made = typeof f.made === 'object' && f.made !== null ? f.made : {}
  return {
    address: f.address,
    labels: Object.fromEntries(Object.entries(f.labels).filter((e): e is [string, string] => typeof e[1] === 'string')),
    made: Object.fromEntries(Object.entries(made).filter((e): e is [string, number] => Number.isSafeInteger(e[1]))),
  }
}
/** The Profiles folder at `address` opened, with these label entries read in it, by id, and when each says its profile was made: kept beside those read before, unless they were another folder's. */
export function readLabels(address: string, labels: Record<string, string>, made: Record<string, number> = {}): void {
  const was = folder()
  const same = was?.address === address
  write(KEYS.folder, { address, labels: { ...(same ? was.labels : {}), ...labels }, made: { ...(same ? was.made : {}), ...made } })
}

/** When the profile of each label was made, as the label entries this device read say: the earliest, for a label written twice. */
export function madeOf(): Record<string, number> {
  const f = folder()
  const out: Record<string, number> = {}
  if (!f) return out
  for (const [id, label] of Object.entries(f.labels)) {
    const t = f.made[id]
    const before = out[label]
    if (label && t !== undefined && (before === undefined || t < before)) out[label] = t
  }
  return out
}

/** How the person is verified: the checks whose stamps their Profiles folder holds from the verifier's current keys, as this device last worked them out. */
export const checks = (): Check[] => {
  const kept = read<unknown[]>(KEYS.checks, [])
  return (['face', 'id'] as const).filter((c) => kept.includes(c))
}
export const saveChecks = (list: Check[]) => write(KEYS.checks, [...new Set(list)].sort())

/**
 * One ID stamp, as Your checks lists it: the kind of document and its own name for it, the country
 * that issued it and the day it runs out, as its facts say them (Didit's `document_type`,
 * `document_subtype`, `issuing_state`, `expiration_date`), none for a stamp kept without its list;
 * and the path of its entry in the Profiles folder, which its page opens. Nothing else of its facts.
 */
export type IdShown = { kind?: string; subtype?: string; country?: string; until?: string; path?: string }

const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0

/** The person's ID stamps from the verifier's current ID key, as this device last read them in the Profiles folder. */
export const ids = (): IdShown[] =>
  read<unknown[]>(KEYS.ids, [])
    .filter((v): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v))
    .map((v) => ({
      ...(isText(v.kind) && { kind: v.kind }),
      ...(isText(v.subtype) && { subtype: v.subtype }),
      ...(isText(v.country) && { country: v.country }),
      ...(isText(v.until) && { until: v.until }),
      ...(isText(v.path) && /^stamp\/[0-9a-f]+$/.test(v.path) && { path: v.path }),
    }))
/** The ID stamps as the Profiles folder holds them now, in place of what this device kept. */
export const keepIds = (list: IdShown[]) => write(KEYS.ids, list.length ? list : undefined)

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

/** The morning email turned on: the id the host made for it (it changes or stops the email), the email address, and the addresses of the profiles it counts. */
export type Email = { id: string; email: string; profiles: string[] }

const isEmail = (v: unknown): v is Email => {
  const e = v as Email | null
  return typeof e?.id === 'string' && typeof e.email === 'string' && e.email.length > 0 && Array.isArray(e.profiles) && e.profiles.every((a) => typeof a === 'string')
}

/** The morning email as the Profiles folder last said it, or none: Off. */
export const email = (): Email | null => {
  const kept = read<unknown>(KEYS.email, null)
  return isEmail(kept) ? { id: kept.id, email: kept.email, profiles: kept.profiles } : null
}
/** The morning email as the Profiles folder holds it now, in place of what this device kept; none, Off. */
export const keepEmail = (e: Email | null) => write(KEYS.email, e ?? undefined)


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

/** Forget this device: the profiles, and the Profiles folder, the names given others, the morning email, how they are verified and their ID stamps, the AI apps and the keys it knows of, what was new on each, what it knew of the passkeys it made, the theme, the passkey in use and any verification under way. The ids of the passkeys it knows stay, so Start asks for them and never makes a second one. */
export function forget(): void {
  for (const key of [KEYS.passkey, KEYS.profiles, KEYS.ids, KEYS.folder, KEYS.names, KEYS.email, KEYS.checks, KEYS.connections, KEYS.known, KEYS.read, KEYS.seen, KEYS.backups, KEYS.theme, KEYS.under]) store().removeItem(key)
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
