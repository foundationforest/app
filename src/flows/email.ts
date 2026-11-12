// The morning email (services' host/README.md, Email): once a day, in the person's morning, the host
// emails them a count of what's new on the profiles they chose. Off until they turn it on, here.
//
// - Send a code: each ticked profile's main key signs the email address for this host
//   (services' host/client/email.ts, as it is), and the host emails a 6-digit code and answers an
//   id. That id is held in the page until the code is typed, and nowhere else: the host drops an
//   email nobody confirmed in 15 minutes.
// - Turn on: the code confirms it at the host, and the id, the email address and the ticked profiles'
//   addresses are kept in one locked entry of the person's Profiles folder, the app's own, at
//   `email`: { "id", "email", "profiles": [address] }, locked to the folder's own open key alone,
//   as `names` is (names.ts, locked.ts), so only their seed opens it and every device they unlock on
//   shows the same state. The standard leaves paths like it to the app that writes them, and other
//   apps ignore it. The device keeps a copy (device.ts), so Off or Every morning shows with nothing
//   unlocked; every unlock that opens the Profiles folder puts the entry's in its place
//   (profiles.ts). Never in a profile's folder, never sent to an index, never handed to an AI app,
//   and the id never in a URL: the host puts it in the stop link of its own emails.
// - Save: the profiles ticked now sign again and the host counts those, with the device's time zone.
//   Turned off elsewhere (the host answers `unknown`, which only a change can find out), the entry
//   is deleted and it shows as Off, with no error.
// - Change the email address: a new one is turned on as the first was, with a new code; the old one
//   is stopped once the new one is on, since the host takes the old one's profiles only as far as
//   the new one counts them.
// - Turn off: the host deletes all of it, then the entry does.
//
// Every step that signs, or writes the entry, is one unlock (the seed held, or asked for); the code
// is confirmed only once that is held, so a passkey closed at Turn on spends nothing. Its
// writes are paid from the wallet, as `names` is; taking it back deletes the entry, which is free.

import { type View, publicKeyFromAddress } from '@foundationforest/folders'
import { isLocked, openLocked } from '@foundationforest/folders/locked'
import { mainKey, openingHalf } from '@foundationforest/keys'

import { signEmail } from '../../services/host/client/email.ts'
import type { Services } from '../config.ts'
import { type Email, keepEmail } from '../device.ts'
import { Refused } from '../services/http.ts'
import { ID, changeProfiles, confirmCode, sendCode, stopEmail } from '../services/email.ts'
import { readView } from '../services/host.ts'
import { setLocked } from './locked.ts'

/** The entry's path in the Profiles folder: the app's own. */
export const EMAIL_PATH = 'email'

/** The longest email address, as the host takes one. */
export const EMAIL_MOST = 254

/** What the host takes for an email address, as it checks one. */
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** The email address as typed, if it is one the host takes. */
export const emailFrom = (typed: string): string | null => {
  const email = typed.trim()
  return email.length <= EMAIL_MOST && EMAIL.test(email) ? email : null
}

/** The morning email a view of the Profiles folder holds, opened with its `identity`: none when it holds no entry, or one that doesn't open or isn't whole. */
export async function emailIn(view: View, identity: string): Promise<Email | null> {
  const body = view.current.get(EMAIL_PATH)?.entry.body
  if (!body || !isLocked(body)) return null
  const opened = await openLocked(body, identity).catch(() => null)
  if (!isObject(opened) || typeof opened.id !== 'string' || !ID.test(opened.id) || typeof opened.email !== 'string' || !opened.email) return null
  if (!Array.isArray(opened.profiles) || !opened.profiles.every((a) => typeof a === 'string' && publicKeyFromAddress(a) !== null)) return null
  return { id: opened.id, email: opened.email, profiles: opened.profiles as string[] }
}

/** The device's own time zone, such as America/Mexico_City: where the morning is. */
export const timeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone

/** The morning email set to `next`, or deleted with none: in the Profiles folder, then on the device. */
async function write(s: Services, seed: Uint8Array, next: Email | null): Promise<void> {
  const key = await mainKey(seed, '')
  const view = await readView(s.host, key.address)
  await setLocked(s.host, key, view, EMAIL_PATH, next && { id: next.id, email: next.email, profiles: next.profiles })
  keepEmail(next)
}

/** Each of these profiles' main key's signature for `email` at this host. */
const signed = (s: Services, seed: Uint8Array, labels: string[], email: string) => Promise.all(labels.map(async (label) => signEmail(await mainKey(seed, label), s.host, email)))

/** A code on its way: the host's id for it, the email address and the addresses of the profiles to count; `confirmed` once the host has taken the code, so a write that failed after it is tried again alone. */
export type Pending = { id: string; email: string; profiles: string[]; confirmed?: boolean }

/** A code emailed to `email`, to count the profiles at `labels`, each of which signs. */
export async function askCode(s: Services, seed: Uint8Array, email: string, labels: string[]): Promise<Pending> {
  const profiles = await signed(s, seed, labels, email)
  const id = await sendCode(s.host, email, timeZone(), profiles)
  return { id, email, profiles: profiles.map((p) => p.profile) }
}

/**
 * The code confirmed and the morning email kept: on. `was`, the email it was on for, is stopped once
 * the new one is on (a new email address takes the place of the old). A pending that was confirmed
 * and not kept goes on from the keeping.
 */
export async function turnOn(s: Services, seed: Uint8Array, pending: Pending, code: string, was: Email | null): Promise<void> {
  if (!pending.confirmed) {
    await confirmCode(s.host, pending.id, code)
    pending.confirmed = true
  }
  await write(s, seed, { id: pending.id, email: pending.email, profiles: pending.profiles })
  if (was && was.id !== pending.id) await stopEmail(s.host, was.id).catch(() => undefined)
}

/** The profiles at `labels` counted from now, with the device's time zone: `saved`, or `gone` when the host no longer has it (turned off elsewhere), which is Off now. */
export async function saveProfiles(s: Services, seed: Uint8Array, now: Email, labels: string[]): Promise<'saved' | 'gone'> {
  const profiles = await signed(s, seed, labels, now.email)
  try {
    await changeProfiles(s.host, now.id, timeZone(), profiles)
  } catch (err) {
    if (!(err instanceof Refused) || err.code !== 'unknown') throw err
    await write(s, seed, null)
    return 'gone'
  }
  await write(s, seed, { ...now, profiles: profiles.map((p) => p.profile) })
  return 'saved'
}

/** The morning email turned off: all of it deleted at the host, then the entry. */
export async function turnOff(s: Services, seed: Uint8Array, now: Email): Promise<void> {
  await stopEmail(s.host, now.id)
  await write(s, seed, null)
}
