// A profile deleted, from its ··· menu (screens/MoreMenu.tsx), in an order where each step still finds
// what it needs:
//
//   1. its AI apps: an app that acts for it alone is disconnected, so no connection is left that its
//      notes can't find again; any other stops acting for it (connections.ts, `end`, `removeFrom`), each
//      ending its access key in its profile entry while that entry is there;
//   2. the morning email: it counts the rest of the profiles it counted, or, with none left, it is
//      turned off (email.ts), since the host takes only profiles it still has;
//   3. every live entry in its folder deleted at the host, signed by its main key: its listings, the
//      reviews, vouches and reports it wrote, its AI apps' notes, the locked copies of what it sent;
//      deletes over live entries are free there (services' host/README.md);
//   4. its profile entry deleted last, so nothing it signed counted for a moment without it;
//   5. its label taken out of the Profiles folder: each `label/<id>` naming it deleted, signed by the
//      folder's own key;
//   6. the device lists it no more.
//
// The reviews, vouches and reports others wrote about it live in their folders, and stay. The seed
// gives the same address for the same market and role, so making it again makes the same profile,
// and those come back with it.

import { entry, liveContent, nextTime } from '@foundationforest/folders'
import { mainKey, openingHalf } from '@foundationforest/keys'

import type { Services } from '../config.ts'
import { type Profile, connections, dropProfile, email, profiles } from '../device.ts'
import { readView, writeAll } from '../services/host.ts'
import { type Where, end, removeFrom } from './connections.ts'
import { saveProfiles, turnOff } from './email.ts'
import { opened, walletKey } from './profiles.ts'

/** How many entries go in one write: the host takes up to 100 lines a request. */
const BATCH = 50

/** Deletes of `paths`, signed by `key`, written in batches. */
async function deleteAll(host: string, key: Awaited<ReturnType<typeof mainKey>>, view: Awaited<ReturnType<typeof readView>>, paths: string[]): Promise<void> {
  const now = Date.now()
  const gone = paths.map((path) => entry(key, path, null, nextTime(now, view, path)))
  for (let i = 0; i < gone.length; i += BATCH) await writeAll(host, gone.slice(i, i + BATCH))
}

/** The profile `p` deleted: its AI apps and email first, then everything in its folder, its profile entry last, then its label, and the device's copy. */
export async function removeProfile(s: Services & Where, seed: Uint8Array, p: Profile): Promise<void> {
  // 1. Its AI apps.
  for (const c of connections()) {
    if (!c.labels.includes(p.label)) continue
    if (c.labels.every((l) => l === p.label)) await end(s, seed, c.address)
    else await removeFrom(s, seed, c.address, p.label)
  }
  // 2. The morning email.
  const on = email()
  if (on?.profiles.includes(p.address)) {
    const rest = profiles().filter((q) => q.label !== p.label && on.profiles.includes(q.address))
    if (rest.length) await saveProfiles(s, seed, on, rest.map((q) => q.label))
    else await turnOff(s, seed, on)
  }
  // 3. and 4. Every live entry in its folder, its profile entry last.
  const main = await mainKey(seed, p.label)
  const view = await readView(s.host, main.address)
  const live = [...liveContent(view)].map(([path]) => path)
  await deleteAll(s.host, main, view, live.filter((path) => path !== 'profile'))
  if (live.includes('profile')) await deleteAll(s.host, main, view, ['profile'])
  // 5. Its label, out of the Profiles folder.
  const wallet = await walletKey(seed)
  const folder = await readView(s.host, wallet.address)
  const { identity } = await openingHalf(wallet.secret)
  const labels = (await opened(folder, 'label', identity)).filter((o) => o.body.label === p.label).map((o) => o.path)
  if (labels.length) await deleteAll(s.host, wallet, folder, labels)
  // 6. The device.
  dropProfile(p.label)
}
