// The names the person gives other profiles: shown in place of a profile's short key, for them alone,
// wherever it appears. The app's own entry, which the standard leaves to it ("any other" path, one
// readers ignore when they don't know it): one locked entry at `names` in the person's Profiles
// folder, holding { "names": [{ "address", "name" }] }, one for each profile named, in the order
// they were first named (a list, since an entry's keys are words, not addresses), locked to the
// folder's own open key alone, as every entry there is, so only their seed opens it and every
// device they unlock on gets them. Never in a profile's folder, so nothing public links a name to a profile of theirs; never sent to an
// index or handed to an AI app, whose access keys open profiles, not this folder.
//
// Saving reads the entry as the host holds it now, so names given on another device stay, changes
// one, and writes it again over the last, paid from the wallet; the last name taken back deletes it,
// which is free. The device keeps a copy, so names show with nothing unlocked; every unlock that
// opens the Profiles folder (flows/profiles.ts) puts what the entry holds in its place.

import { type View, entry, nextTime, publicKeyFromAddress } from '@foundationforest/folders'
import { isLocked, lock, openLocked } from '@foundationforest/folders/locked'
import { mainKey, openingHalf } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { keepNames } from '../device.ts'
import { NoCredits } from '../services/credits.ts'
import { NotWritten, readView, writeAll } from '../services/host.ts'

/** The entry's path in the Profiles folder: the app's own. */
export const NAMES_PATH = 'names'

/** The longest name, in characters. */
export const NAME_MOST = 40

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** The names a view of the Profiles folder holds, opened with its `identity`: none when it holds no entry, or one that doesn't open. Each to a profile's address, never empty. */
export async function namesIn(view: View, identity: string): Promise<Record<string, string>> {
  const body = view.current.get(NAMES_PATH)?.entry.body
  if (!body || !isLocked(body)) return {}
  const opened = await openLocked(body, identity).catch(() => null)
  const list = Array.isArray(opened?.names) ? opened.names : []
  const out: Record<string, string> = {}
  for (const n of list) if (isObject(n) && typeof n.address === 'string' && typeof n.name === 'string' && n.name.length > 0 && publicKeyFromAddress(n.address) !== null) out[n.address] = n.name
  return out
}

/** A name as it is kept: trimmed and cut to NAME_MOST characters; empty, none. */
export const nameFrom = (typed: string): string => [...typed.trim()].slice(0, NAME_MOST).join('').trim()

/** The person's name for the profile at `address` saved, or taken back with `name` empty: in their Profiles folder, then on the device. */
export async function saveName(s: Services, seed: Uint8Array, address: string, name: string): Promise<void> {
  const key = await mainKey(seed, '')
  const view = await readView(s.host, key.address)
  const { identity, openKey } = await openingHalf(key.secret)
  const all = await namesIn(view, identity)
  const given = nameFrom(name)
  if (given) all[address] = given
  else delete all[address]
  const held = !!view.current.get(NAMES_PATH)?.entry.body
  if (Object.keys(all).length > 0 || held) {
    const now = Date.now()
    const first = view.current.has('profile') ? [] : [entry(key, 'profile', { hosts: [s.host] }, now)]
    const body = Object.keys(all).length > 0 ? await lock({ names: Object.entries(all).map(([address, name]) => ({ address, name })) }, [openKey]) : null
    await writeAll(s.host, [...first, entry(key, NAMES_PATH, body, nextTime(now, view, NAMES_PATH))]).catch((err: unknown) => {
      throw err instanceof NotWritten && err.code === 'refused' ? new NoCredits() : err
    })
  }
  keepNames(all)
}
