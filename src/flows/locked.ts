// A locked entry of the person's own in their Profiles folder, an app's own path the standard leaves
// to it (`names`, `email`): set to a body, locked to the folder's own open key alone so only their
// seed opens it and any device they unlock on gets it, or deleted with none, which is free. Its
// first write is paid from the wallet, which is this folder's own balance; a folder with no profile
// entry gets its one first. Never in a profile's folder, never sent to an index or an AI app.

import { type Body, type View, entry, nextTime } from '@foundationforest/folders'
import { lock } from '@foundationforest/folders/locked'
import { type MainKey, openingHalf } from '@foundationforest/keys'

import { NoCredits } from '../services/credits.ts'
import { NotWritten, writeAll } from '../services/host.ts'

/** The entry at `path` of the Profiles folder `key` (read now as `view`) set to `body`, or deleted with null; nothing written to delete what is not there. */
export async function setLocked(host: string, key: MainKey, view: View, path: string, body: Body | null): Promise<void> {
  if (!body && !view.current.get(path)?.entry.body) return
  const now = Date.now()
  const first = view.current.has('profile') ? [] : [entry(key, 'profile', { hosts: [host] }, now)]
  const locked = body ? await lock(body, [(await openingHalf(key.secret)).openKey]) : null
  await writeAll(host, [...first, entry(key, path, locked, nextTime(now, view, path))]).catch((err: unknown) => {
    throw err instanceof NotWritten && err.code === 'refused' ? new NoCredits() : err
  })
}
