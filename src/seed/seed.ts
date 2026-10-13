// The seed for each action, asked of the passkey (passkey.ts) and dropped when the action ends; and
// what the device keeps for it: the seed's public fingerprint (local.ts), to check that it is the
// person's own passkey that answered, and, while setup is under way, what setup has got so far
// (flows/setup.ts), sealed (AES-GCM) under a key mixed from the seed, so only the seed opens it;
// removed once the vault is written. JavaScript cannot promise the bytes are erased (keys README,
// Limits): the app zeroes them and holds no other reference.
//
// One passkey per person: the device keeps the id of every passkey it made (local.ts), and a new
// one is refused where the manager holds one of them. A setup under way is taken up with its own
// passkey, the only one offered. One given up (forgotten, or replaced by a sign in with another
// passkey) has its passkey offered to the manager to drop, when this device made it and its check
// never gave a note: once the issuer has given that face a note, only that passkey can finish.

import { base64urlnopad as b64u } from '@scure/base'

import { fingerprint, forgetFingerprint, keepMadePasskey, madePasskeys, saveFingerprint } from '../local.ts'
import { OtherSetup, type Passkey, askSeed, createPasskey, dropPasskey, fingerprintOf, idBytes, idText } from './passkey.ts'

/**
 * The seed for one action, after the person's face or fingerprint, dropped when the action ends,
 * whether it worked or not. A passkey whose seed is not the one this device was set up with is
 * refused before the action runs. The action mixes the one key it needs and keeps none past its
 * end; it is given the passkey's id too, for setup to ask the manager to drop it.
 */
export async function withSeed<T>(action: (seed: Uint8Array, id: Uint8Array<ArrayBuffer>) => Promise<T>): Promise<T> {
  const want = fingerprint()
  if (!want) throw new Error('No setup on this device.')
  const { seed, id } = await askSeed()
  try {
    if ((await fingerprintOf(seed)) !== want) throw new OtherSetup()
    return await action(seed, id)
  } finally {
    seed.fill(0)
  }
}

/**
 * Signing in: the seed of whichever Forest passkey the person picks, for `read`, which keeps what
 * the device needs and says whether a setup was found. Found: the device keeps the fingerprint,
 * and the seed is dropped. Not found, every host having answered: the passkey's setup stopped
 * before its vault, so setup is marked under way with it, and the passkey is handed back, its seed
 * held, for the face check.
 */
export async function signingIn(read: (seed: Uint8Array) => Promise<boolean>): Promise<Passkey | undefined> {
  const passkey = await askSeed()
  try {
    // A setup under way here with this passkey is its own, taken up; with another, it is replaced.
    const own = (await fingerprintOf(passkey.seed)) === fingerprint()
    const found = await read(passkey.seed)
    if (hasSetup() && !own) await dropSetup()
    if (!found) {
      if (!hasSetup()) await underWay(passkey, madePasskeys().includes(idText(passkey.id)))
      return passkey
    }
    endSetup()
    saveFingerprint(await fingerprintOf(passkey.seed))
  } catch (err) {
    passkey.seed.fill(0)
    throw err
  }
  passkey.seed.fill(0)
}

/** Where setup's stages are kept, beside the rest of what the device keeps (local.ts), so forgetting the device removes it too. */
const SETUP = 'forest.setup'
/** What the seed is mixed with to give setup's AES key. */
const SETUP_INFO = new TextEncoder().encode('forest-app/v1/setup')

/**
 * Setup under way: its passkey's id, whether this device made that passkey (not one found at sign
 * in, which may hold another stopped setup's note), whether its check gave a note, and what it has
 * got so far, once it has got something, sealed under a key mixed from the seed.
 */
type SetupKept = { v: 1; made: boolean; id?: Uint8Array<ArrayBuffer>; noted?: true; iv?: Uint8Array<ArrayBuffer>; sealed?: Uint8Array<ArrayBuffer> }

const readKept = (): SetupKept | undefined => {
  const text = localStorage.getItem(SETUP)
  return text === null ? undefined : (unpack(text) as SetupKept)
}

/**
 * Setup's first step: a new passkey and its seed, made only where the person's manager holds none
 * of the passkeys this device made, and its id kept with them. Setup is marked under way with it,
 * so the app comes back to the face check rather than to the board. The caller holds the seed for
 * the face check that follows, and zeroes it after.
 */
export async function beginSetup(): Promise<Passkey> {
  const passkey = await createPasskey(madePasskeys().map(idBytes))
  try {
    keepMadePasskey(idText(passkey.id))
    await underWay(passkey, true)
  } catch (err) {
    passkey.seed.fill(0)
    throw err
  }
  return passkey
}

/**
 * The setup under way, taken up: the seed of its own passkey, the only one the system's sheet
 * offers, after the face, checked against the fingerprint. The caller holds the seed for the face
 * check, and zeroes it after.
 */
export async function resumeSetup(): Promise<Passkey> {
  const want = fingerprint()
  const kept = readKept()
  if (!want || !kept) throw new Error('No setup on this device.')
  const passkey = await askSeed(kept.id && [kept.id])
  try {
    if ((await fingerprintOf(passkey.seed)) !== want) throw new OtherSetup()
    // A setup begun before the device kept its passkey's id: kept now.
    if (!kept.id) {
      localStorage.setItem(SETUP, pack({ ...kept, id: passkey.id } satisfies SetupKept))
      if (kept.made) keepMadePasskey(idText(passkey.id))
    }
  } catch (err) {
    passkey.seed.fill(0)
    throw err
  }
  return passkey
}

/**
 * Setup marked under way with this passkey: the marker first, then the fingerprint, so the device is
 * never taken for set up without its vault. Then asks the browser to keep this site's storage,
 * since setup's stages are kept there.
 */
async function underWay({ seed, id }: Passkey, made: boolean): Promise<void> {
  localStorage.setItem(SETUP, pack({ v: 1, made, id } satisfies SetupKept))
  saveFingerprint(await fingerprintOf(seed))
  await navigator.storage?.persist?.().catch(() => false)
}

/** Whether setup is under way on this device: the passkey's fingerprint kept, the vault not yet written. */
export const hasSetup = () => localStorage.getItem(SETUP) !== null

/** Whether the setup under way made its passkey. */
export const setupMadePasskey = () => readKept()?.made === true

/** Whether giving up the setup under way drops its passkey: this device made it, and its check gave no note. */
export const setupDropsPasskey = () => setupMadePasskey() && !readKept()?.noted

/**
 * The setup under way given up: what it kept removed, and the fingerprint; its passkey offered to
 * the person's passkey manager to drop when `setupDropsPasskey`. Kept otherwise: one with a note is
 * the only passkey that face can finish with, and one from sign in may hold another setup's note.
 */
export async function dropSetup(): Promise<void> {
  const kept = readKept()
  const drops = setupDropsPasskey()
  endSetup()
  forgetFingerprint()
  if (drops && kept?.id) await dropPasskey(kept.id)
}

/** An AES-GCM key, mixed from the seed with HKDF-SHA256. It never leaves Web Crypto. */
async function aesKey(seed: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new Uint8Array(seed), 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: SETUP_INFO }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

/** Bytes as JSON keeps them: `{ "bytes": <base64url> }`. */
export const pack = (value: unknown) => JSON.stringify(value, (_k, v) => (v instanceof Uint8Array ? { bytes: b64u.encode(v) } : v))
export const unpack = (text: string) => JSON.parse(text, (_k, v) => (v && typeof v === 'object' && Object.keys(v).length === 1 && typeof v.bytes === 'string' ? b64u.decode(v.bytes) : v))

/** What setup has got so far, sealed under a key mixed from the seed, in place of what it held; `noted` once it holds the note. */
export async function keepSetup(seed: Uint8Array, value: unknown, noted = false): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(seed), new TextEncoder().encode(pack(value))))
  const was = readKept()
  localStorage.setItem(SETUP, pack({ v: 1, made: was?.made === true, id: was?.id, ...((was?.noted || noted) && { noted: true }), iv, sealed } satisfies SetupKept))
}

/** What setup has got so far, opened with the seed; null when it has got nothing yet, or is not under way. */
export async function readSetup<T>(seed: Uint8Array): Promise<T | null> {
  const kept = readKept()
  if (!kept?.iv || !kept.sealed) return null
  const opened = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: kept.iv }, await aesKey(seed), kept.sealed)
  return unpack(new TextDecoder().decode(opened)) as T
}

/** Setup is done, or given up: what it kept is removed. */
export function endSetup(): void {
  localStorage.removeItem(SETUP)
}
