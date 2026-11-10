// Backup passkeys, against services' own verifier and host on loopback (world.ts), as the
// standard's example says (folders/README.md, The seed entry): a backup added, its two entries each
// opening with seedOf alone, its folder funded from the wallet; Start through a backup, one step only;
// the backups counted and dated with nothing unlocked; one removed, its passkey opening its own seed
// again; a passkey made by mistake added to the person's first (New to Forest?), or refused; a backup whose folder can't be written, its
// entry taken back; a passkey that no longer opens the device's profiles, stopped; and a manager's
// name, from its AAGUID.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { b64u, entry, readFolder } from '@foundationforest/folders'
import { SEED_PATH, lock, seedOf } from '@foundationforest/folders/locked'
import { newSeed, openingHalf } from '@foundationforest/keys'

import * as device from '../src/device.ts'
import { NotAdded, NotVerified, SamePasskey, addBackup, backupsAt, linkTo, removeBackup } from '../src/flows/backups.ts'
import { walletKey } from '../src/flows/profiles.ts'
import { NotYours, follow, seedFor } from '../src/flows/seed.ts'
import { enter } from '../src/flows/start.ts'
import { aaguidOf, managerOf } from '../src/managers.ts'
import { fund } from '../src/services/credits.ts'
import { writeAll } from '../src/services/host.ts'
import { type World, freshDevice, person, proveHere, verifiedWith, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

/** A copy of a seed, as a passkey gives it again: the flows zero what they follow or are handed for good. */
const copy = (seed: Uint8Array) => new Uint8Array(seed)
const again = (p: { seed: Uint8Array; id: string }) => ({ seed: copy(p.seed), id: p.id })

/** A seed's Profiles folder, as the host serves it, with the identity its own opening half opens with. */
async function profilesOf(host: string, seed: Uint8Array) {
  const key = await walletKey(seed)
  return { key, view: await readFolder([host], key.address, Date.now()), identity: (await openingHalf(key.secret)).identity }
}

describe('a backup', () => {
  test("added as the standard's example says: backup/<id> holding its seed, its seed entry holding the first, each locked to its own folder alone; its folder funded from the wallet", async () => {
    const p = await verifiedWith(w, 'tutoring/tutor')
    const first = await profilesOf(w.host, p.seed)
    const before = await w.balance(first.key.address)
    const b = person()
    const made = { ...again(b), aaguid: 'bada5566-a7aa-401f-bd96-45619a55120d' }
    await addBackup(w, p.seed, made)
    expect(made.seed.every((x) => x === 0), "the backup's seed zeroed").toBe(true)

    const listed = await backupsAt(w.host, first.key.address)
    expect(listed).toHaveLength(1)
    const mine = await profilesOf(w.host, p.seed)
    expect(await seedOf(mine.view.current.get(`backup/${listed[0]!.id}`)!.entry.body, mine.identity), 'backup/<id> holds the backup seed').toEqual(b.seed)

    const theirs = await profilesOf(w.host, b.seed)
    expect(theirs.view.current.get('profile')!.entry.body, "the backup's profile entry holds only its host").toEqual({ hosts: [w.host] })
    const seedEntry = theirs.view.current.get(SEED_PATH)!.entry.body
    expect(await seedOf(seedEntry, theirs.identity), 'its seed entry holds the first seed').toEqual(p.seed)
    expect(await seedOf(seedEntry, mine.identity), 'locked to its own folder alone').toBeNull()

    const spent = before - (await w.balance(first.key.address))
    expect(spent, "one credit to the backup's folder, and the backup/<id> entry").toBeGreaterThan(1)
    expect(spent).toBeLessThan(1.1)
    expect(await w.balance(theirs.key.address), 'its two entries paid from it').toBeLessThan(1)

    expect(device.passkeys(), 'the device knows it: Start asks for it, the next backup excludes it').toContain(b.id)
    expect(device.backupNames(), "its manager's name, by its entry").toEqual({ [listed[0]!.id]: '1Password' })
  })

  test("Start through a backup: its seed entry followed, one step only, to the first seed's profiles", async () => {
    const p = await verifiedWith(w, 'tutoring/tutor')
    const b = person()
    await addBackup(w, p.seed, again(b))
    expect(await follow(w.host, copy(b.seed)), 'a backup opens the first seed').toEqual(p.seed)
    const own = copy(p.seed)
    expect(await follow(w.host, own), 'the first seed opens itself').toBe(own)

    // A seed entry naming the backup, written by hand: followed one step, to the backup, never on.
    const c = newSeed()
    const ck = await walletKey(c)
    await fund(w.host, ck.address, 1, await walletKey(p.seed))
    const now = Date.now()
    await writeAll(w.host, [entry(ck, 'profile', { hosts: [w.host] }, now), entry(ck, SEED_PATH, await lock({ seed: b64u.encode(b.seed) }, [(await openingHalf(ck.secret)).openKey]), now)])
    expect(await follow(w.host, copy(c)), 'one step only').toEqual(b.seed)

    expect(await enter(w, { id: b.id, seed: await follow(w.host, copy(b.seed)) }, proveHere)).toEqual({ to: 'profiles' })
    expect(device.passkey(), 'the backup is the passkey in use here').toBe(b.id)
    expect(device.profiles().map((x) => x.label)).toEqual(['tutoring/tutor'])
    expect(device.profiles()[0]!.address).toBe(p.profiles[0]!.address)
    expect(device.folder()?.address, "the first seed's Profiles folder").toBe((await walletKey(p.seed)).address)
  })

  test("counted and dated with nothing unlocked; one removed as the standard's example says, and its passkey opens its own seed again, which Start sends to Get verified", async () => {
    const p = await verifiedWith(w)
    const wallet = (await walletKey(p.seed)).address
    const [b1, b2] = [person(), person()]
    const t0 = Date.now()
    await addBackup(w, p.seed, { ...again(b1), aaguid: 'ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4' })
    await addBackup(w, p.seed, again(b2))
    const listed = await backupsAt(w.host, wallet)
    expect(listed).toHaveLength(2)
    expect(listed[0]!.time).toBeGreaterThanOrEqual(t0)
    expect(listed[0]!.time).toBeLessThanOrEqual(listed[1]!.time)
    expect(device.backupNames()).toEqual({ [listed[0]!.id]: 'Google Password Manager' })

    await removeBackup(w, p.seed, listed[0]!.id)
    expect(await backupsAt(w.host, wallet)).toEqual([listed[1]])
    expect((await profilesOf(w.host, b1.seed)).view.current.get(SEED_PATH)?.entry.body, 'its seed entry deleted').toBeNull()
    expect(device.backupNames(), 'its name gone').toEqual({})
    expect(await follow(w.host, copy(b1.seed)), 'its passkey opens its own seed').toEqual(b1.seed)
    expect(await follow(w.host, copy(b2.seed)), 'the other still opens the first').toEqual(p.seed)
    expect((await enter(w, again(b1), proveHere)).to).toBe('verify')
  })

  test("a passkey made by mistake, added to the person's first on New to Forest?: its seed entry and backup/<id>, as when one is added, and its manager's name; the same passkey, or one not verified, refused", async () => {
    const p = await verifiedWith(w, 'tutoring/tutor')
    const x = person()
    expect((await enter(w, again(x), proveHere)).to, 'Start opened it: no stamp, no seed entry').toBe('verify')

    await expect(linkTo(w, x.seed, copy(x.seed))).rejects.toThrow(SamePasskey)
    const y = newSeed()
    const refused = await linkTo(w, x.seed, y).catch((err: unknown) => err)
    expect(refused).toBeInstanceOf(NotVerified)
    expect((refused as NotVerified).message).toBe("That passkey isn't verified.")
    expect((refused as NotVerified).red).toBe(true)
    expect(await backupsAt(w.host, (await walletKey(y)).address)).toEqual([])
    expect(await follow(w.host, copy(x.seed)), 'nothing written').toEqual(x.seed)

    await linkTo(w, x.seed, p.seed, 'bada5566-a7aa-401f-bd96-45619a55120d')
    expect(await follow(w.host, copy(x.seed))).toEqual(p.seed)
    const listed = await backupsAt(w.host, (await walletKey(p.seed)).address)
    expect(listed).toHaveLength(1)
    expect(device.backupNames(), "its manager's name, by its entry, as You shows it").toEqual({ [listed[0]!.id]: '1Password' })
    // As New to Forest? goes on: the first seed, for this passkey, which stays the one in use.
    expect(await enter(w, { id: x.id, seed: copy(p.seed) }, proveHere)).toEqual({ to: 'profiles' })
    expect(device.passkey()).toBe(x.id)
    expect(device.profiles().map((q) => q.label)).toEqual(['tutoring/tutor'])
  })

  test('a passkey that opens a seed other than the one whose profiles this device lists (a backup removed since) goes no further, in one red line', async () => {
    const p = await verifiedWith(w)
    const b = person()
    await addBackup(w, p.seed, again(b))
    await enter(w, { id: b.id, seed: await follow(w.host, copy(b.seed)) }, proveHere)
    expect(await seedFor(w.host, copy(b.seed))).toEqual(p.seed)
    await removeBackup(w, p.seed, (await backupsAt(w.host, (await walletKey(p.seed)).address))[0]!.id)
    const stopped = await seedFor(w.host, copy(b.seed)).catch((err: unknown) => err)
    expect(stopped).toBeInstanceOf(NotYours)
    expect((stopped as NotYours).message).toBe('This passkey no longer opens your profiles.')
    expect((stopped as NotYours).red).toBe(true)
  })
})

describe("a backup whose folder can't be written", () => {
  // Entries free at this host, so only the backup's folder's funding, a whole credit, can fail.
  let free: World
  beforeAll(async () => void (free = await world({ entryPerKb: '0' })))
  afterAll(() => free?.close())

  test("its backup/<id> entry taken back, so the list never counts it, and one red line: the passkey wasn't added", async () => {
    free.decideAll('approved')
    const p = await verifiedWith(free)
    const wallet = await walletKey(p.seed)
    // The wallet spent down below one credit, into a folder of nobody's.
    await fund(free.host, (await walletKey(newSeed())).address, Math.floor(await free.balance(wallet.address)), wallet)
    expect(await free.balance(wallet.address)).toBeLessThan(1)

    const b = person()
    const failed = await addBackup(free, p.seed, again(b)).catch((err: unknown) => err)
    expect(failed).toBeInstanceOf(NotAdded)
    expect((failed as NotAdded).message).toBe("The passkey wasn't added.")
    expect((failed as NotAdded).red).toBe(true)

    expect(await backupsAt(free.host, wallet.address), 'nothing listed').toEqual([])
    const taken = [...(await readFolder([free.host], wallet.address, Date.now())).current].filter(([path]) => path.startsWith('backup/'))
    expect(taken.map(([, c]) => c.entry.body), 'written, then deleted').toEqual([null])
    expect(await follow(free.host, copy(b.seed)), 'its passkey opens nothing more').toEqual(b.seed)
    expect(device.passkeys()).not.toContain(b.id)
  })
})

describe("a manager's name", () => {
  /** Authenticator data as a new passkey's carries it: the relying party's hash, the flags, the counter, then the AAGUID. */
  const data = (flags: number, aaguid: number[]) => new Uint8Array([...new Array<number>(32).fill(7), flags, 0, 0, 0, 0, ...aaguid, 0, 16])
  /** An AAGUID no manager in the table sends. */
  const UNKNOWN = [0xba, 0xda, 0x55, 0x66, 0xa7, 0xaa, 0x4b, 0x8c, 0xb6, 0x6a, 0x6d, 0x4f, 0x1f, 0x54, 0xd1, 0x34]

  test('from the AAGUID a new passkey carries: named when the table has it, nothing for zeros, none, or one it lacks', () => {
    // 1Password's.
    const id = aaguidOf(data(0x45, [0xba, 0xda, 0x55, 0x66, 0xa7, 0xaa, 0x40, 0x1f, 0xbd, 0x96, 0x45, 0x61, 0x9a, 0x55, 0x12, 0x0d]))
    expect(id).toBe('bada5566-a7aa-401f-bd96-45619a55120d')
    expect(managerOf(id)).toBe('1Password')
    expect(managerOf(id!.toUpperCase())).toBe('1Password')
    expect(aaguidOf(data(0x45, new Array<number>(16).fill(0))), 'zeros name nothing').toBeUndefined()
    expect(aaguidOf(data(0x05, UNKNOWN)), 'no attested data').toBeUndefined()
    expect(aaguidOf(new Uint8Array(37)), 'too short').toBeUndefined()
    expect(managerOf(aaguidOf(data(0x45, UNKNOWN))), 'an id the table lacks').toBeUndefined()
    expect(managerOf(undefined)).toBeUndefined()
  })
})
