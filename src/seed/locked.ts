// The locked store: the seed, encrypted (AES-GCM) under a key mixed from a passkey's PRF secret,
// kept in IndexedDB. Only the encrypted seed is ever stored; no key mixed from it is. `withSeed`
// opens it for one action, after the person's face or fingerprint, and drops it when the action
// ends. JavaScript cannot promise the bytes are erased (keys README, Limits): the app zeroes them
// and holds no other reference.

import { createPasskey, passkeySecret } from './passkey.ts'

/** What IndexedDB holds: the passkey's id, the PRF salt, and the seed encrypted. Nothing here opens it without the passkey. */
export type Lock = { v: 1; credential: Uint8Array<ArrayBuffer>; salt: Uint8Array<ArrayBuffer>; iv: Uint8Array<ArrayBuffer>; sealed: Uint8Array<ArrayBuffer> }

const DB = 'forest-app'
const STORE = 'lock'
const SEED = 'seed'
/** What the PRF secret is mixed with to give the AES key, so the secret serves this one purpose. */
const INFO = new TextEncoder().encode('forest-app/v1/seed-lock')

const random = (n: number) => crypto.getRandomValues(new Uint8Array(n))

/** The AES-GCM key, mixed from the PRF secret with HKDF-SHA256. It never leaves Web Crypto. */
async function aesKey(secret: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new Uint8Array(secret), 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: INFO }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

export async function seal(seed: Uint8Array, secret: Uint8Array, iv: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(secret), new Uint8Array(seed)))
}

export async function unseal(lock: Pick<Lock, 'iv' | 'sealed'>, secret: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: lock.iv }, await aesKey(secret), lock.sealed))
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = run(db.transaction(STORE, mode).objectStore(STORE))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } finally {
    db.close()
  }
}

export const readLock = () => tx<Lock | undefined>('readonly', (s) => s.get(SEED))

export async function hasSeed(): Promise<boolean> {
  return (await readLock()) !== undefined
}

/**
 * Lock the seed on this device: a new passkey, the seed encrypted under its PRF secret, stored.
 * Then asks the browser to keep this site's storage, so it is not cleared to free space. The
 * caller zeroes the seed it passed once the person has kept the words.
 */
export async function lockSeed(seed: Uint8Array): Promise<{ persisted: boolean }> {
  // Writing over a locked seed would lose it for good on this device.
  if (await hasSeed()) throw new Error('a seed is already locked on this device')
  const salt = random(32)
  const { id, secret } = await createPasskey(salt)
  try {
    const lock: Lock = { v: 1, credential: id, salt, iv: random(12), sealed: new Uint8Array(0) }
    lock.sealed = await seal(seed, secret, lock.iv)
    await tx('readwrite', (s) => s.put(lock, SEED))
  } finally {
    secret.fill(0)
  }
  return { persisted: (await navigator.storage?.persist?.()) ?? false }
}

/**
 * Open the seed for one action, after the person's face or fingerprint, and drop it when the action
 * ends, whether it worked or not. The action mixes the one key it needs from the seed and keeps
 * none of them past its end.
 */
export async function withSeed<T>(action: (seed: Uint8Array) => Promise<T>): Promise<T> {
  const lock = await readLock()
  if (!lock) throw new Error('no seed is locked on this device')
  const secret = await passkeySecret(lock.credential, lock.salt)
  let seed: Uint8Array
  try {
    seed = await unseal(lock, secret)
  } finally {
    secret.fill(0)
  }
  try {
    return await action(seed)
  } finally {
    seed.fill(0)
  }
}
