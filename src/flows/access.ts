// A profile's access keys, as the standard's records README says (Permissions). Made: each one at
// random, for one AI or app; listed in the permissions record by its public half and its scope, a
// write key with the paths it writes under, and nothing else (no names, no dates); a read key also
// added to the card's inbox readers, so every message sent to the profile is sealed to it too. The
// private halves are given back once, written as a grant writes them, for the person to paste; the
// app keeps none of them. Removed (Removing a key): a write or message key made past, its scope
// kept as `was`, so what it wrote still counts; a read key deleted, and dropped from the card's
// inbox readers, so messages are no longer sealed to it.

import { inboxKey, mainKey } from '../../standard/keys/src/index.ts'
import { type AccessKey, b64u, keyFromPrivate, nextTime, ownerRecord, permissionsRecord } from '../../standard/records/src/index.ts'
import type { LocalProfile } from '../local.ts'
import { publishRecords, readOwn } from '../services/host.ts'

/** The keys to make: a write key for offers and reviews, a message key, a read key for the inbox. */
export type Choice = { write: boolean; message: boolean; read: boolean }

/** The private halves made, as a grant writes them: 32 bytes in base64url, or a read key's age identity. */
export type Made = { write?: string; message?: string; read?: string }

/** Where a write key made here writes: offers and reviews. */
export const WRITE_PATHS = ['offer', 'review']

type Card = { inbox?: { readers?: string[] } }

export async function makeAccessKeys(seed: Uint8Array, profile: LocalProfile, choice: Choice): Promise<Made> {
  if (!choice.write && !choice.message && !choice.read) throw new Error('Pick at least one.')
  const main = await mainKey(seed, profile.label)
  const view = await readOwn(profile.hosts, profile.address)
  const hosts = view.hosts.length ? view.hosts : profile.hosts
  const card = view.current.get('profile')?.record.body as Card | null | undefined
  if (choice.read && !card?.inbox) throw new Error('This profile has no inbox to read.')

  const made: Made = {}
  const added: AccessKey[] = []
  const signing = (scope: 'write' | 'message') => {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    added.push({ key: keyFromPrivate(bytes).address, scope, ...(scope === 'write' && { paths: [...WRITE_PATHS] }) })
    made[scope] = b64u.encode(bytes)
    bytes.fill(0)
  }
  if (choice.write) signing('write')
  if (choice.message) signing('message')
  let reader: string | undefined
  if (choice.read) {
    // A read key is an age hybrid identity from 32 random bytes, made as the keys library makes an inbox key.
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    const { identity, recipient } = await inboxKey(bytes)
    bytes.fill(0)
    added.push({ key: recipient, scope: 'read' })
    made.read = identity
    reader = recipient
  }

  const now = Date.now()
  const notes = view.current.get('permissions')?.record.body?.notes
  const records = [permissionsRecord(main, [...view.access, ...added], nextTime(now, view, 'permissions'), typeof notes === 'string' ? notes : undefined)]
  if (reader && card?.inbox) {
    records.push(ownerRecord(main, 'profile', { ...card, inbox: { ...card.inbox, readers: [...(card.inbox.readers ?? []), reader] } }, nextTime(now, view, 'profile')))
  }
  await publishRecords(hosts, records)
  return made
}

/** What the person pastes into their AI: the profile, by its market and role in words and its address, and a line for each key made. */
export function pasteOf(market: string, role: string, address: string, made: Made): string {
  return [
    `Forest, act for my profile (${market}, ${role}).`,
    `profile: ${address}`,
    ...(made.write ? [`writeKey: ${made.write}`] : []),
    ...(made.message ? [`messageKey: ${made.message}`] : []),
    ...(made.read ? [`readKey: ${made.read}`] : []),
    "Anything else, send me a request and I'll approve it in the app.",
  ].join('\n')
}

export async function removeAccessKey(seed: Uint8Array, profile: LocalProfile, key: string): Promise<void> {
  const main = await mainKey(seed, profile.label)
  const view = await readOwn(profile.hosts, profile.address)
  const hosts = view.hosts.length ? view.hosts : profile.hosts
  const access = view.access.flatMap((e): AccessKey[] => {
    if (e.key !== key || !e.scope) return [e]
    if (e.scope === 'read') return []
    return [{ key: e.key, was: e.scope, ...(e.paths && { paths: e.paths }) }]
  })
  const now = Date.now()
  const notes = view.current.get('permissions')?.record.body?.notes
  const records = [permissionsRecord(main, access, nextTime(now, view, 'permissions'), typeof notes === 'string' ? notes : undefined)]
  const card = view.current.get('profile')?.record.body as Card | null | undefined
  if (card?.inbox?.readers?.includes(key)) {
    const readers = card.inbox.readers.filter((r) => r !== key)
    const { readers: _, ...inbox } = card.inbox
    records.push(ownerRecord(main, 'profile', { ...card, inbox: readers.length ? { ...inbox, readers } : inbox }, nextTime(now, view, 'profile')))
  }
  await publishRecords(hosts, records)
}
