// A profile's access keys, as the standard's records README says (Permissions), in two kinds: a
// writing key, a write key that posts and changes offers and reviews; and an inbox key, a message
// key and a read key made together, which reads the inbox, sends messages and sends the person
// requests. Made: each key at random, for one AI or app; listed in the permissions record by its
// public half and its scope, a write key with the paths it writes under, and nothing else (no names,
// no dates); an inbox key's read key also added to the card's inbox readers, so every message sent
// to the profile is sealed to it too, and listed right after its message key, which is how the card
// shows the two as one. The private halves are given back once, written as a grant writes them, for
// the person to paste, and only once every host took the records; when one did not, the keys made
// are taken out again, since no one will hold them. The app keeps none of them. Removed (Removing a
// key): a write or message key made past, its scope kept as `was`, so what it wrote still counts; a
// read key deleted, and dropped from the card's inbox readers, so messages are no longer sealed to
// it. An inbox key's two go in one write.

import { type MainKey, inboxKey, mainKey } from '../../standard/keys/src/index.ts'
import { type AccessKey, type SignedRecord, type View, b64u, keyFromPrivate, nextTime, ownerRecord, permissionsRecord } from '../../standard/records/src/index.ts'
import type { LocalProfile } from '../local.ts'
import { publishRecords, readOwn } from '../services/host.ts'
import { settings } from '../settings.ts'
import { paying } from '../vault.ts'

/** The keys to make: a writing key, an inbox key, or both. */
export type Choice = { writing: boolean; inbox: boolean }

/**
 * The private halves made, as a grant writes them: a writing key's 32 bytes in base64url; an inbox
 * key's message key the same way, a dot, then its read key's age identity. Neither base64url nor an
 * age identity has a dot, so the dot splits them.
 */
export type Made = { writing?: string; inbox?: string }

/** Where a write key made here writes: offers and reviews. */
export const WRITE_PATHS = ['offer', 'review']

type Card = { inbox?: { readers?: string[] } }

export async function makeAccessKeys(seed: Uint8Array, profile: LocalProfile, choice: Choice): Promise<Made> {
  if (!choice.writing && !choice.inbox) throw new Error('Pick at least one.')
  const main = await mainKey(seed, profile.label)
  const view = await readOwn(profile.hosts, profile.address)
  const hosts = view.hosts.length ? view.hosts : profile.hosts
  const card = view.current.get('profile')?.record.body as Card | null | undefined
  if (choice.inbox && !card?.inbox) throw new Error('This profile has no inbox to read.')

  const made: Made = {}
  const added: AccessKey[] = []
  const signing = (scope: 'write' | 'message') => {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    added.push({ key: keyFromPrivate(bytes).address, scope, ...(scope === 'write' && { paths: [...WRITE_PATHS] }) })
    const key = b64u.encode(bytes)
    bytes.fill(0)
    return key
  }
  if (choice.writing) made.writing = signing('write')
  let reader: string | undefined
  if (choice.inbox) {
    const message = signing('message')
    // Its read key, listed right after it: an age hybrid identity from 32 random bytes, made as the keys library makes an inbox key.
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    const { identity, recipient } = await inboxKey(bytes)
    bytes.fill(0)
    added.push({ key: recipient, scope: 'read' })
    made.inbox = `${message}.${identity}`
    reader = recipient
  }

  const now = Date.now()
  const notes = view.current.get('permissions')?.record.body?.notes
  const records = [permissionsRecord(main, [...view.access, ...added], nextTime(now, view, 'permissions'), typeof notes === 'string' ? notes : undefined)]
  if (reader && card?.inbox) {
    records.push(ownerRecord(main, 'profile', { ...card, inbox: { ...card.inbox, readers: [...(card.inbox.readers ?? []), reader] } }, nextTime(now, view, 'profile')))
  }
  try {
    await paying(seed, settings().host, profile.address, () => publishRecords(hosts, records))
  } catch (err) {
    // What a host took of them is taken out again; the permissions record costs nothing to write.
    const after = await readOwn(profile.hosts, profile.address).catch(() => null)
    const undo = after ? without(main, after, added.map((e) => e.key), false) : []
    if (undo.length) await publishRecords(hosts, undo).catch((e) => console.error(e))
    throw err
  }
  return made
}

/** What the person pastes into their AI: the profile, by its address and its market and role in words, and a line for each kind made. */
export function pasteOf(market: string, role: string, address: string, made: Made): string {
  return [`Forest profile: ${address} (${market}, ${role})`, ...(made.writing ? [`writingKey: ${made.writing}`] : []), ...(made.inbox ? [`inboxKey: ${made.inbox}`] : [])].join('\n')
}

/** The keys removed in one write: a writing key's one, or an inbox key's two. */
export async function removeAccessKey(seed: Uint8Array, profile: LocalProfile, keys: string[]): Promise<void> {
  const main = await mainKey(seed, profile.label)
  const view = await readOwn(profile.hosts, profile.address)
  const records = without(main, view, keys, true)
  if (records.length) await paying(seed, settings().host, profile.address, () => publishRecords(view.hosts.length ? view.hosts : profile.hosts, records))
}

/**
 * The permissions record without `keys`, and the card when they are among its inbox readers; none
 * when it lists none of them. A write or message key is made past when `past`, so what it wrote
 * still counts; else, as a read key always is, it is deleted.
 */
function without(main: MainKey, view: View, keys: string[], past: boolean): SignedRecord[] {
  const card = view.current.get('profile')?.record.body as Card | null | undefined
  if (!view.access.some((e) => keys.includes(e.key) && e.scope) && !card?.inbox?.readers?.some((r) => keys.includes(r))) return []
  const access = view.access.flatMap((e): AccessKey[] => {
    if (!keys.includes(e.key) || !e.scope) return [e]
    if (!past || e.scope === 'read') return []
    return [{ key: e.key, was: e.scope, ...(e.paths && { paths: e.paths }) }]
  })
  const now = Date.now()
  const notes = view.current.get('permissions')?.record.body?.notes
  const records = [permissionsRecord(main, access, nextTime(now, view, 'permissions'), typeof notes === 'string' ? notes : undefined)]
  if (card?.inbox?.readers?.some((r) => keys.includes(r))) {
    const readers = card.inbox.readers.filter((r) => !keys.includes(r))
    const { readers: _, ...inbox } = card.inbox
    records.push(ownerRecord(main, 'profile', { ...card, inbox: readers.length ? { ...inbox, readers } : inbox }, nextTime(now, view, 'profile')))
  }
  return records
}
