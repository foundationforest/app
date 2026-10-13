// The seed from a passkey, with the browser's passkey API stood in for: a given PRF secret is the
// seed as it is; the fingerprint the device keeps is the vault key's public half; a passkey made
// with the secret given at once, or only at the get that follows (as Safari's), or none, each with
// a user id of its own; every action's passkey checked against the fingerprint; a sign in that
// finds a setup, and one that finds none and goes on to the face check; setup's stages sealed
// under the seed. The real passkey, in Chromium with a virtual authenticator: test/browser/app.ts.

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { vaultKey } from '../standard/keys/src/index.ts'
import { NoPrf, SALT, createPasskey, fingerprintOf, rpId, seedOf } from '../src/seed/passkey.ts'
import { beginSetup, endSetup, hasSetup, keepSetup, readSetup, setupMadePasskey, signingIn, withSeed } from '../src/seed/seed.ts'

/** A PRF secret as a passkey gives it: 32 bytes in an ArrayBuffer. */
const secret = (fill: number) => new Uint8Array(32).fill(fill).buffer

type Asked = { create: CredentialCreationOptions[]; get: CredentialRequestOptions[]; dropped: { rpId: string; credentialId: string }[] }

/**
 * The browser's passkey API, stood in for: `create` gives a passkey whose PRF results are `made`,
 * `get` one whose PRF secret is `given`. What each was asked is kept.
 */
function passkeys({ made, given, capabilities = {} }: { made?: { enabled?: boolean; results?: { first: ArrayBuffer } }; given?: () => ArrayBuffer | undefined; capabilities?: Record<string, boolean> }) {
  const asked: Asked = { create: [], get: [], dropped: [] }
  const credential = (prf: unknown) => ({ rawId: new Uint8Array([1, 2, 3]).buffer, getClientExtensionResults: () => (prf === undefined ? {} : { prf }) })
  vi.stubGlobal('navigator', {
    credentials: {
      create: async (o: CredentialCreationOptions) => (asked.create.push(o), credential(made)),
      get: async (o: CredentialRequestOptions) => {
        asked.get.push(o)
        const first = given?.()
        return credential(first ? { results: { first } } : {})
      },
    },
    storage: { persist: async () => true },
  })
  vi.stubGlobal(
    'PublicKeyCredential',
    class {
      static getClientCapabilities = async () => capabilities
      static signalUnknownCredential = async (o: { rpId: string; credentialId: string }) => void asked.dropped.push(o)
    },
  )
  return asked
}

beforeEach(() => {
  vi.stubGlobal('location', { hostname: 'app.forest.foundation' })
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k), key: (i: number) => [...store.keys()][i] ?? null, get length() { return store.size } })
})
afterEach(() => vi.unstubAllGlobals())

describe('the derive path', () => {
  test('the salt is "forest-seed-v1"; the relying party is the page\'s own host: app.forest.foundation for the app, no other subdomain', () => {
    expect(new TextDecoder().decode(SALT)).toBe('forest-seed-v1')
    expect(rpId('app.forest.foundation')).toBe('app.forest.foundation')
    expect(rpId('index.forest.foundation')).toBe('index.forest.foundation')
    expect(rpId('localhost')).toBe('localhost')
  })

  test('a PRF secret is the seed as it is; the fingerprint is the vault key\'s public half', async () => {
    const given = secret(7)
    const seed = seedOf(given)
    expect(seed).toEqual(new Uint8Array(32).fill(7))
    seed.fill(0)
    expect(new Uint8Array(given), 'not copied: zeroing the seed zeroes the secret').toEqual(new Uint8Array(32))
    const again = seedOf(secret(7))
    expect(await fingerprintOf(again)).toBe((await vaultKey(new Uint8Array(32).fill(7))).address)
    expect(await fingerprintOf(seedOf(secret(8)))).not.toBe(await fingerprintOf(again))
    expect(() => seedOf(new Uint8Array(16).buffer)).toThrow(/16 bytes, not 32/)
  })

  test('made with the secret given at once: the seed from the passkey made, no get', async () => {
    const asked = passkeys({ made: { enabled: true, results: { first: secret(1) } } })
    expect(await createPasskey()).toEqual({ seed: new Uint8Array(32).fill(1), id: new Uint8Array([1, 2, 3]) })
    expect(asked.get).toHaveLength(0)
    const { publicKey } = asked.create[0]!
    expect(publicKey!.rp).toEqual({ id: 'app.forest.foundation', name: 'Forest' })
    expect(publicKey!.user.name).toBe('Forest')
    expect(publicKey!.user.id.byteLength).toBe(16)
    await createPasskey()
    const ids = asked.create.map((o) => Buffer.from(o.publicKey!.user.id as Uint8Array).toString('hex'))
    expect(ids[0], 'a user id of its own each time, so a second Start never replaces the first passkey').not.toBe(ids[1])
    expect(publicKey!.authenticatorSelection).toEqual({ residentKey: 'required', requireResidentKey: true, userVerification: 'required' })
    expect(publicKey!.extensions!.prf!.eval!.first).toEqual(SALT)
  })

  test('made with the secret only at a get (Safari): one get, naming the passkey just made', async () => {
    const asked = passkeys({ made: { enabled: true }, given: () => secret(2) })
    expect((await createPasskey()).seed).toEqual(new Uint8Array(32).fill(2))
    expect(asked.get).toHaveLength(1)
    const { publicKey } = asked.get[0]!
    expect(publicKey!.rpId).toBe('app.forest.foundation')
    expect(publicKey!.userVerification).toBe('required')
    expect(publicKey!.allowCredentials!.map((c) => [...new Uint8Array(c.id as ArrayBuffer)])).toEqual([[1, 2, 3]])
    expect(publicKey!.extensions!.prf!.eval!.first).toEqual(SALT)
  })

  test('no PRF from the passkey made: refused, the passkey offered to be dropped, nothing kept', async () => {
    const asked = passkeys({ made: { enabled: false } })
    await expect(beginSetup()).rejects.toThrow(NoPrf)
    expect(asked.dropped).toEqual([{ rpId: 'app.forest.foundation', credentialId: 'AQID' }])
    expect(localStorage.length).toBe(0)
  })

  test('a browser that says it cannot ask for PRF: refused before any passkey is made', async () => {
    const asked = passkeys({ capabilities: { 'extension:prf': false } })
    const refused = await createPasskey().catch((err) => err)
    expect(refused).toBeInstanceOf(NoPrf)
    expect(refused.browser).toBe(true)
    expect(asked.create).toHaveLength(0)
  })
})

describe('the fingerprint check', () => {
  test('setup keeps the fingerprint alone; every action asks the passkey, runs with its seed, and zeroes it', async () => {
    let give = secret(3)
    const asked = passkeys({ made: { enabled: true, results: { first: secret(3) } }, given: () => give })
    const draft = await beginSetup()
    expect(hasSetup()).toBe(true)
    expect(setupMadePasskey(), 'this setup made its passkey').toBe(true)
    expect(JSON.parse(localStorage.getItem('forest.fingerprint')!)).toBe((await vaultKey(new Uint8Array(32).fill(3))).address)
    draft.seed.fill(0)

    let held: Uint8Array | undefined
    let id: Uint8Array | undefined
    const address = await withSeed(async (seed, passkey) => ((held = seed), (id = passkey), (await vaultKey(seed)).address))
    expect(id, "the passkey's id, given with the seed").toEqual(new Uint8Array([1, 2, 3]))
    expect(address).toBe(JSON.parse(localStorage.getItem('forest.fingerprint')!))
    expect(held, 'zeroed after the action').toEqual(new Uint8Array(32))
    expect(asked.get).toHaveLength(1)
    expect(asked.get[0]!.publicKey!.allowCredentials, 'any Forest passkey may answer').toBeUndefined()

    // Another passkey answers: refused before the action runs.
    give = secret(4)
    const action = vi.fn(async () => 'ran')
    await expect(withSeed(action)).rejects.toThrow('This passkey belongs to another setup.')
    expect(action).not.toHaveBeenCalled()
  })

  test('signing in keeps the fingerprint of the passkey that answered, once its setup is found', async () => {
    passkeys({ given: () => secret(5) })
    await expect(signingIn(async () => Promise.reject(new Error('host.example did not answer.')))).rejects.toThrow('did not answer')
    expect(localStorage.length, 'nothing kept when a host did not answer').toBe(0)
    expect(await signingIn(async () => true)).toBeUndefined()
    expect(JSON.parse(localStorage.getItem('forest.fingerprint')!)).toBe((await vaultKey(new Uint8Array(32).fill(5))).address)
    expect(hasSetup()).toBe(false)
    expect(await withSeed(async () => 'ran')).toBe('ran')
  })

  test('signing in with a passkey that has no setup: setup under way with it, its seed held for the face check, not one this setup made', async () => {
    passkeys({ given: () => secret(6) })
    const passkey = await signingIn(async () => false)
    expect(passkey?.seed).toEqual(new Uint8Array(32).fill(6))
    expect(hasSetup()).toBe(true)
    expect(setupMadePasskey(), 'so a duplicate face does not drop it: it may hold another stopped setup').toBe(false)
    expect(JSON.parse(localStorage.getItem('forest.fingerprint')!)).toBe((await vaultKey(new Uint8Array(32).fill(6))).address)
    await keepSetup(passkey!.seed, { note: 1 })
    expect(setupMadePasskey(), 'kept through the stages').toBe(false)
  })

  test("setup's stages, sealed under the seed: opened with it alone, removed at the end", async () => {
    passkeys({ made: { enabled: true, results: { first: secret(6) } } })
    const { seed } = await beginSetup()
    expect(await readSetup(seed)).toBeNull()
    await keepSetup(seed, { note: { noteNumber: '42' }, buy: new Uint8Array([9, 9]) })
    expect(localStorage.getItem('forest.setup')).not.toContain('42')
    expect(await readSetup(seed)).toEqual({ note: { noteNumber: '42' }, buy: new Uint8Array([9, 9]) })
    await expect(readSetup(new Uint8Array(32).fill(1))).rejects.toThrow()
    expect(setupMadePasskey()).toBe(true)
    endSetup()
    expect(hasSetup()).toBe(false)
  })
})
