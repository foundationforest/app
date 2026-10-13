// The seed for each action, asked of the passkey (passkey.ts) and dropped when the action ends; and
// what the device keeps for it: the seed's public fingerprint (local.ts), to check that it is the
// person's own passkey that answered, and, while setup is under way, what setup has got so far
// (flows/setup.ts), sealed (AES-GCM) under a key mixed from the seed, so only the seed opens it;
// removed once the vault is written. JavaScript cannot promise the bytes are erased (keys README,
// Limits): the app zeroes them and holds no other reference.

import { base64urlnopad as b64u } from '@scure/base'

import { fingerprint, saveFingerprint } from '../local.ts'
import { OtherSetup, askSeed, createPasskey, fingerprintOf } from './passkey.ts'

/**
 * The seed for one action, after the person's face or fingerprint, dropped when the action ends,
 * whether it worked or not. A passkey whose seed is not the one this device was set up with is
 * refused before the action runs. The action mixes the one key it needs and keeps none past its end.
 */
export async function withSeed<T>(action: (seed: Uint8Array) => Promise<T>): Promise<T> {
  const want = fingerprint()
  if (!want) throw new Error('No setup on this device.')
  const seed = await askSeed()
  try {
    if ((await fingerprintOf(seed)) !== want) throw new OtherSetup()
    return await action(seed)
  } finally {
    seed.fill(0)
  }
}

/** Signing in: the seed of whichever Forest passkey the person picks, for `action`; the device keeps its fingerprint once the action has worked. */
export async function signingIn<T>(action: (seed: Uint8Array) => Promise<T>): Promise<T> {
  const seed = await askSeed()
  try {
    const out = await action(seed)
    saveFingerprint(await fingerprintOf(seed))
    return out
  } finally {
    seed.fill(0)
  }
}

/** Where setup's stages are kept, beside the rest of what the device keeps (local.ts), so forgetting the device removes it too. */
const SETUP = 'forest.setup'
/** What the seed is mixed with to give setup's AES key. */
const SETUP_INFO = new TextEncoder().encode('forest-app/v1/setup')

/** Setup under way: what it has got so far, once it has got something, sealed under a key mixed from the seed. */
type SetupKept = { v: 1; iv?: Uint8Array<ArrayBuffer>; sealed?: Uint8Array<ArrayBuffer> }

/**
 * Setup's first step: a new passkey and its seed. The device keeps its fingerprint, with setup
 * marked under way first, so the app comes back to the face check rather than to the board. The
 * caller holds the seed for the face check that follows, and zeroes it after. Then asks the browser
 * to keep this site's storage, since setup's stages are kept there.
 */
export async function beginSetup(): Promise<Uint8Array> {
  const seed = await createPasskey()
  try {
    localStorage.setItem(SETUP, pack({ v: 1 } satisfies SetupKept))
    saveFingerprint(await fingerprintOf(seed))
  } catch (err) {
    seed.fill(0)
    throw err
  }
  await navigator.storage?.persist?.().catch(() => false)
  return seed
}

/** Whether setup is under way on this device: the passkey made, the vault not yet written. */
export const hasSetup = () => localStorage.getItem(SETUP) !== null

/** An AES-GCM key, mixed from the seed with HKDF-SHA256. It never leaves Web Crypto. */
async function aesKey(seed: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new Uint8Array(seed), 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: SETUP_INFO }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

/** Bytes as JSON keeps them: `{ "bytes": <base64url> }`. */
export const pack = (value: unknown) => JSON.stringify(value, (_k, v) => (v instanceof Uint8Array ? { bytes: b64u.encode(v) } : v))
export const unpack = (text: string) => JSON.parse(text, (_k, v) => (v && typeof v === 'object' && Object.keys(v).length === 1 && typeof v.bytes === 'string' ? b64u.decode(v.bytes) : v))

/** What setup has got so far, sealed under a key mixed from the seed, in place of what it held. */
export async function keepSetup(seed: Uint8Array, value: unknown): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(seed), new TextEncoder().encode(pack(value))))
  localStorage.setItem(SETUP, pack({ v: 1, iv, sealed } satisfies SetupKept))
}

/** What setup has got so far, opened with the seed; null when it has got nothing yet, or is not under way. */
export async function readSetup<T>(seed: Uint8Array): Promise<T | null> {
  const text = localStorage.getItem(SETUP)
  const kept = text === null ? undefined : (unpack(text) as SetupKept)
  if (!kept?.iv || !kept.sealed) return null
  const opened = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: kept.iv }, await aesKey(seed), kept.sealed)
  return unpack(new TextDecoder().decode(opened)) as T
}

/** Setup is done, or given up: what it kept is removed. */
export function endSetup(): void {
  localStorage.removeItem(SETUP)
}
