// The locked store: the seed, encrypted (AES-GCM) under a key mixed from a passkey's PRF secret,
// kept in IndexedDB. Only the encrypted seed is ever stored; no key mixed from it is. `withSeed`
// opens it for one action, after the person's face or fingerprint, and drops it when the action
// ends. JavaScript cannot promise the bytes are erased (keys README, Limits): the app zeroes them
// and holds no other reference. Beside it, while setup is under way, what setup has got so far
// (flows/setup.ts), encrypted under a key mixed from the seed, so only the seed opens it; removed
// once the vault is written.

import { base64urlnopad as b64u } from '@scure/base'

import { createPasskey, dropPasskey, passkeySecret } from './passkey.ts'

/** What IndexedDB holds: the passkey's id, the PRF salt, and the seed encrypted. Nothing here opens it without the passkey. */
export type Lock = { v: 1; credential: Uint8Array<ArrayBuffer>; salt: Uint8Array<ArrayBuffer>; iv: Uint8Array<ArrayBuffer>; sealed: Uint8Array<ArrayBuffer> }

/** Setup under way: what it has got so far, once it has got something, encrypted under a key mixed from the seed. */
export type SetupLock = { v: 1; iv?: Uint8Array<ArrayBuffer>; sealed?: Uint8Array<ArrayBuffer> }

const DB = 'forest-app'
const STORE = 'lock'
const SEED = 'seed'
const SETUP = 'setup'
/** What the PRF secret is mixed with to give the AES key, so the secret serves this one purpose. */
const INFO = new TextEncoder().encode('forest-app/v1/seed-lock')
/** What the seed is mixed with to give setup's AES key. */
const SETUP_INFO = new TextEncoder().encode('forest-app/v1/setup')

const random = (n: number) => crypto.getRandomValues(new Uint8Array(n))

/** An AES-GCM key, mixed from a secret with HKDF-SHA256. It never leaves Web Crypto. */
async function aesKey(secret: Uint8Array, info = INFO): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new Uint8Array(secret), 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

export async function seal(bytes: Uint8Array, secret: Uint8Array, iv: Uint8Array<ArrayBuffer>, info = INFO): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(secret, info), new Uint8Array(bytes)))
}

export async function unseal(lock: Pick<Lock, 'iv' | 'sealed'>, secret: Uint8Array, info = INFO): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: lock.iv }, await aesKey(secret, info), lock.sealed))
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

/** Several entries written in one transaction: all of them or none. */
async function putAll(entries: [string, unknown][]): Promise<void> {
  const db = await open()
  try {
    await new Promise<void>((resolve, reject) => {
      const t = db.transaction(STORE, 'readwrite')
      for (const [key, value] of entries) t.objectStore(STORE).put(value, key)
      t.oncomplete = () => resolve()
      t.onerror = () => reject(t.error)
      t.onabort = () => reject(t.error)
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
 * caller zeroes the seed it passed once the person has kept the words. With `setup`, setup is
 * marked under way in the same write, so the app comes back to it rather than to the board.
 */
export async function lockSeed(seed: Uint8Array, { setup = false } = {}): Promise<{ persisted: boolean }> {
  // Writing over a locked seed would lose it for good on this device.
  if (await hasSeed()) throw new Error('a seed is already locked on this device')
  const salt = random(32)
  const { id, secret } = await createPasskey(salt)
  try {
    const lock: Lock = { v: 1, credential: id, salt, iv: random(12), sealed: new Uint8Array(0) }
    lock.sealed = await seal(seed, secret, lock.iv)
    await putAll(setup ? [[SEED, lock], [SETUP, { v: 1 } satisfies SetupLock]] : [[SEED, lock]])
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

/** Whether setup is under way on this device: the seed locked, the vault not yet written. */
export async function hasSetup(): Promise<boolean> {
  return (await tx<SetupLock | undefined>('readonly', (s) => s.get(SETUP))) !== undefined
}

/** Bytes as JSON keeps them: `{ "bytes": <base64url> }`. */
export const pack = (value: unknown) => JSON.stringify(value, (_k, v) => (v instanceof Uint8Array ? { bytes: b64u.encode(v) } : v))
export const unpack = (text: string) => JSON.parse(text, (_k, v) => (v && typeof v === 'object' && Object.keys(v).length === 1 && typeof v.bytes === 'string' ? b64u.decode(v.bytes) : v))

/** What setup has got so far, encrypted under a key mixed from the seed, in place of what it held. */
export async function keepSetup(seed: Uint8Array, value: unknown): Promise<void> {
  const iv = random(12)
  const sealed = await seal(new TextEncoder().encode(pack(value)), seed, iv, SETUP_INFO)
  await tx('readwrite', (s) => s.put({ v: 1, iv, sealed } satisfies SetupLock, SETUP))
}

/** What setup has got so far, opened with the seed; null when it has got nothing yet, or is not under way. */
export async function readSetup<T>(seed: Uint8Array): Promise<T | null> {
  const kept = await tx<SetupLock | undefined>('readonly', (s) => s.get(SETUP))
  if (!kept?.iv || !kept.sealed) return null
  return unpack(new TextDecoder().decode(await unseal({ iv: kept.iv, sealed: kept.sealed }, seed, SETUP_INFO))) as T
}

/** Setup is done: what it kept is removed. */
export async function endSetup(): Promise<void> {
  await tx('readwrite', (s) => s.delete(SETUP))
}

/**
 * Forgets the seed on this device: the store deleted, and the passkey that opened it offered to the
 * person's passkey manager to drop. The 24 words are then the only way back.
 */
export async function forgetSeed(): Promise<void> {
  const lock = await readLock().catch(() => undefined)
  if (lock) await dropPasskey(lock.credential)
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB)
    req.onsuccess = () => resolve()
    req.onblocked = () => resolve()
    req.onerror = () => reject(req.error)
  })
}
