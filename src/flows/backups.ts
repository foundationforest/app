// Backup passkeys (folders/README.md, The seed entry): a second passkey, whose own seed's Profiles
// folder holds the person's seed in its seed entry, so whatever opens the second opens the first.
// The screens call every one a passkey, the first and each added alike; backup is the standard's
// word for what is underneath, and stays here.
//
// Adding one, as the standard's example says: first a `backup/<id>` entry in the person's Profiles
// folder holding the backup's seed, so the person's seed lists every backup that may open it; then
// the backup's own Profiles folder, funded from the wallet as any folder is, with its profile entry
// (only its host) and its seed entry, at `seed`, holding the person's seed. Each is
// `{ "seed": <base64url> }`, locked to its own folder's opening half alone. If the backup's folder
// can't be written, its `backup/<id>` entry is deleted again, so the list never counts a backup that
// doesn't open.
//
// Their list needs nothing unlocked: the `backup/<id>` entries, and when each was written. The
// entry holds the seed and nothing else, so the device that added a backup keeps its manager's name,
// and whether it made it for itself (device.ts). Removing one deletes its seed entry, signed by its own Profiles folder's key, then its
// `backup/<id>` entry. Whoever opened the seed entry before keeps the seed: removing takes nothing
// back.

import { type View, b64u, entry, liveContent, nextTime } from '@foundationforest/folders'
import { SEED_PATH, isLocked, lock, seedOf } from '@foundationforest/folders/locked'
import { type MainKey, openingHalf } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { FIRST, knowPasskey, madeHere, noteMade, unnoteMade } from '../device.ts'
import { managerOf } from '../managers.ts'
import type { Made } from '../passkey.ts'
import { NoCredits, fund } from '../services/credits.ts'
import { NotWritten, readView, writeAll } from '../services/host.ts'
import { Said } from '../words.ts'
import { paid } from './paid.ts'
import { addTo, opened, walletKey } from './profiles.ts'

/** A backup the Profiles folder lists: the random id of its entry, `backup/<id>`, and when that was written. */
export type Backup = { id: string; time: number }

const KIND = 'backup/'
const pathOf = (id: string) => `${KIND}${id}`

/** The passkey's folder couldn't be written, so its entry was taken back: nothing was added. */
export class NotAdded extends Said {
  constructor() {
    super("The passkey wasn't added.", true)
    this.name = 'NotAdded'
  }
}

/** The passkey asked for opens the same seed as the one in use: it can't be added to itself. */
export class SamePasskey extends Said {
  constructor() {
    super("That's this passkey. Choose the one you use.", true)
    this.name = 'SamePasskey'
  }
}

/** The passkey asked for opens a seed whose Profiles folder holds no stamp: not one the person uses. */
export class NotVerified extends Said {
  constructor() {
    super("That passkey isn't verified.", true)
    this.name = 'NotVerified'
  }
}

/** The backups a view of the Profiles folder lists now, oldest first: each live, locked `backup/<id>` entry. Readable with nothing unlocked. */
export const backupsIn = (view: View): Backup[] =>
  [...liveContent(view)]
    .filter(([path, { entry: e }]) => path.startsWith(KIND) && isLocked(e.body))
    .map(([path, { entry: e }]) => ({ id: path.slice(KIND.length), time: e.time }))
    .sort((a, b) => a.time - b.time)

/** The backups the Profiles folder at `address` lists, as the host serves it: nothing unlocked. */
export async function backupsAt(host: string, address: string): Promise<Backup[]> {
  return backupsIn(await readView(host, address))
}

/** A seed's Profiles folder: its main key, and its folder as the host serves it. */
async function profilesOf(host: string, seed: Uint8Array): Promise<{ key: MainKey; view: View }> {
  const key = await walletKey(seed)
  return { key, view: await readView(host, key.address) }
}

/** `seed` as a seed entry's body, locked to the opening half of `key`'s folder alone. */
const holding = async (key: MainKey, seed: Uint8Array) => lock({ seed: b64u.encode(seed) }, [(await openingHalf(key.secret)).openKey])

/** `backup`'s Profiles folder made to hold `seed` in its seed entry, its profile entry first when it has none; its first write funded from `wallet`, and topped up from it. */
async function writeSeedEntry(host: string, wallet: MainKey, backup: Uint8Array, seed: Uint8Array): Promise<void> {
  const { key, view } = await profilesOf(host, backup)
  const now = Date.now()
  const first = view.current.has('profile') ? [] : [entry(key, 'profile', { hosts: [host] }, now)]
  const body = await holding(key, seed)
  if (view.current.size === 0) await fund(host, key.address, 1, wallet)
  await paid(host, key.address, wallet, () => writeAll(host, [...first, entry(key, SEED_PATH, body, nextTime(now, view, SEED_PATH))]))
}

/** The `backup/<id>` entry deleted from the Profiles folder whose key is `key`, paid from its balance; nothing when it is gone already. */
async function unlist(host: string, key: MainKey, id: string): Promise<void> {
  const view = await readView(host, key.address)
  if (!view.current.get(pathOf(id))?.entry.body) return
  await writeAll(host, [entry(key, pathOf(id), null, nextTime(Date.now(), view, pathOf(id)))]).catch((err: unknown) => {
    throw err instanceof NotWritten && err.code === 'refused' ? new NoCredits() : err
  })
}

/** `backup` made a backup of `seed`, whose Profiles folder is `folder`: its `backup/<id>` entry, then its seed entry, or neither. Gives back the entry's id. */
async function link(host: string, folder: { key: MainKey; view: View }, seed: Uint8Array, backup: Uint8Array): Promise<string> {
  const id = await addTo(folder, host, 'backup', { seed: b64u.encode(backup) })
  try {
    await writeSeedEntry(host, folder.key, backup, seed)
  } catch {
    await unlist(host, folder.key, id).catch(() => undefined)
    throw new NotAdded()
  }
  return id
}

/**
 * The passkey just made, `made`, added as a backup of `seed`: from now the device knows it, so Start
 * asks for it too and the next backup excludes it, and keeps its manager's name when its AAGUID
 * names one, and whether it was made for this device (`here`). Its seed is zeroed.
 */
export async function addBackup(s: Services, seed: Uint8Array, made: Made, { here = false }: { here?: boolean } = {}): Promise<void> {
  try {
    const id = await link(s.host, await profilesOf(s.host, seed), seed, made.seed)
    const name = managerOf(made.aaguid)
    noteMade(id, { ...(name && { name }), ...(here && { here: true }) })
    knowPasskey(made.id)
  } finally {
    made.seed.fill(0)
  }
}

const same = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((x, i) => x === b[i])

/**
 * The passkey made here by mistake (Yes, I'm new, for someone who already uses Forest), whose seed
 * `own` holds no stamp, added as a backup of `seed`, the one the person uses, which must hold one:
 * from now it opens their profiles. What the device noted of it as the first passkey it made (its
 * manager's name, This device) moves to its `backup/<id>` entry, since it is a backup now.
 */
export async function linkTo(s: Services, own: Uint8Array, seed: Uint8Array): Promise<void> {
  if (same(own, seed)) throw new SamePasskey()
  const folder = await profilesOf(s.host, seed)
  if (!(await opened(folder.view, 'stamp', (await openingHalf(folder.key.secret)).identity)).length) throw new NotVerified()
  const id = await link(s.host, folder, seed, own)
  const note = madeHere()[FIRST]
  if (note) {
    noteMade(id, note)
    unnoteMade(FIRST)
  }
}

/**
 * The backup at `backup/<id>` ended, as the standard's example says: its seed entry deleted, signed
 * by its own Profiles folder's key and paid from the wallet, then its entry. An entry that doesn't
 * open as a seed entry is only deleted.
 */
export async function removeBackup(s: Services, seed: Uint8Array, id: string): Promise<void> {
  const { key, view } = await profilesOf(s.host, seed)
  const backup = await seedOf(view.current.get(pathOf(id))?.entry.body, (await openingHalf(key.secret)).identity)
  if (backup) {
    try {
      const own = await profilesOf(s.host, backup)
      if (own.view.current.get(SEED_PATH)?.entry.body) {
        await paid(s.host, own.key.address, key, () => writeAll(s.host, [entry(own.key, SEED_PATH, null, nextTime(Date.now(), own.view, SEED_PATH))]))
      }
    } finally {
      backup.fill(0)
    }
  }
  await unlist(s.host, key, id)
  unnoteMade(id)
}
