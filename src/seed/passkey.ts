// The passkey, and the seed it gives: its PRF secret (the PRF extension) for one fixed salt, which
// the person's passkey manager gives only after their face or fingerprint, the same 32 bytes each
// time for the same passkey. That secret is the seed, used as it is. Nothing secret is stored on
// the device: the seed is asked for again for every action, and dropped after it (seed.ts). The
// passkey is made for forest.foundation, so the app finds it on every subdomain. No server checks
// these passkeys: the challenge is random and nobody verifies the signature; only the PRF secret is
// used.

import { vaultKey } from '../../standard/keys/src/index.ts'

/** The PRF salt, fixed: the same passkey gives the same seed on every device and at every visit. */
export const SALT = new TextEncoder().encode('forest-seed-v1')

/** The passkey's relying party: forest.foundation, on it and on every subdomain; elsewhere (localhost, a preview), the page's own host. */
export function rpId(hostname = location.hostname): string {
  return hostname === 'forest.foundation' || hostname.endsWith('.forest.foundation') ? 'forest.foundation' : hostname
}

/** Refused: no PRF secret. `browser` when this browser cannot ask a passkey for one at all, so no passkey here can give it. */
export class NoPrf extends Error {
  readonly browser: boolean
  constructor(browser = false) {
    super(
      browser
        ? "This browser can't open Forest: it can't ask a passkey for the secret Forest opens with. Open Forest on a newer device."
        : "This device's passkeys can't open Forest. Use a phone with a passkey instead: choose the QR code in the passkey sheet. Or use a newer device.",
    )
    this.name = 'NoPrf'
    this.browser = browser
  }
}

/** The passkey that answered is not the one this device was set up with. */
export class OtherSetup extends Error {
  constructor() {
    super('This passkey belongs to another setup.')
    this.name = 'OtherSetup'
  }
}

const random = (n: number) => crypto.getRandomValues(new Uint8Array(n))
const b64u = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

type WithCapabilities = { getClientCapabilities?: () => Promise<Record<string, boolean>> }
type WithSignals = { signalUnknownCredential?: (o: { rpId: string; credentialId: string }) => Promise<void> }

/** The seed from a passkey's PRF secret: its 32 bytes as they are, not copied, so zeroing the seed zeroes them. */
export function seedOf(secret: BufferSource): Uint8Array {
  const seed = ArrayBuffer.isView(secret) ? new Uint8Array(secret.buffer, secret.byteOffset, secret.byteLength) : new Uint8Array(secret)
  if (seed.length !== 32) throw new Error(`The passkey gave a secret of ${seed.length} bytes, not 32.`)
  return seed
}

/** The seed's public fingerprint: the vault key's public half, as its address. The device keeps this, and nothing else of the seed. */
export async function fingerprintOf(seed: Uint8Array): Promise<string> {
  return (await vaultKey(seed)).address
}

/** Whether this browser says it cannot ask a passkey for a PRF secret at all. A browser that does not say is let try. */
export async function browserLacksPrf(): Promise<boolean> {
  if (typeof PublicKeyCredential === 'undefined' || !navigator.credentials) return true
  const capabilities = await (PublicKeyCredential as WithCapabilities).getClientCapabilities?.().catch(() => undefined)
  return capabilities?.['extension:prf'] === false
}

function prfOf(credential: Credential | null) {
  return (credential as PublicKeyCredential | null)?.getClientExtensionResults().prf
}

/**
 * A new passkey, and its seed. Some passkey managers give the PRF secret as the passkey is made;
 * the others (Safari's) only when it is asked for, so one get follows, naming the new passkey.
 * Where it gives none, the person's passkey manager is asked to drop it, and nothing is kept.
 */
export async function createPasskey(): Promise<Uint8Array> {
  if (await browserLacksPrf()) throw new NoPrf(true)
  const credential = await navigator.credentials.create({
    publicKey: {
      rp: { id: rpId(), name: 'Forest' },
      // An id of its own: a second passkey made with the same one would replace the first, and its seed with it.
      user: { id: random(16), name: 'Forest', displayName: 'Forest' },
      challenge: random(32),
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      // No attachment named, so the passkey sheet offers a phone (the QR code) where this device has no PRF.
      authenticatorSelection: { residentKey: 'required', requireResidentKey: true, userVerification: 'required' },
      extensions: { prf: { eval: { first: SALT } } },
    },
  })
  if (!credential) throw new Error('No passkey was made.')
  const id = new Uint8Array((credential as PublicKeyCredential).rawId)
  const prf = prfOf(credential)
  try {
    if (prf?.results?.first) return seedOf(prf.results.first)
    if (!prf?.enabled) throw new NoPrf()
    return await askSeed([id])
  } catch (err) {
    if (err instanceof NoPrf) await dropPasskey(id)
    throw err
  }
}

/** Asks the person's passkey manager to drop a passkey that will never give a seed. Some managers do; the rest ignore it. */
export async function dropPasskey(id: Uint8Array): Promise<void> {
  await (PublicKeyCredential as WithSignals | undefined)?.signalUnknownCredential?.({ rpId: rpId(), credentialId: b64u(id) }).catch(() => undefined)
}

/** The seed, from the person's passkey after their face or fingerprint: one system prompt. Any Forest passkey they hold may answer, unless `allow` names one. */
export async function askSeed(allow?: Uint8Array<ArrayBuffer>[]): Promise<Uint8Array> {
  if (typeof PublicKeyCredential === 'undefined' || !navigator.credentials) throw new NoPrf(true)
  const credential = await navigator.credentials.get({
    publicKey: {
      rpId: rpId(),
      challenge: random(32),
      ...(allow && { allowCredentials: allow.map((id) => ({ type: 'public-key' as const, id })) }),
      userVerification: 'required',
      extensions: { prf: { eval: { first: SALT } } },
    },
  })
  const first = prfOf(credential)?.results?.first
  if (!first) throw new NoPrf()
  return seedOf(first)
}
