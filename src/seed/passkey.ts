// The passkey, and the seed it gives: its PRF secret (the PRF extension) for one fixed salt, which
// the person's passkey manager gives only after their face or fingerprint, the same 32 bytes each
// time for the same passkey. That secret is the seed, used as it is. Nothing secret is stored on
// the device: the seed is asked for again for every action, and dropped after it (seed.ts). The
// passkey is made for the app's own address, app.forest.foundation, so no page elsewhere under
// forest.foundation can ask for it. No server checks these passkeys: the challenge is random and
// nobody verifies the signature; only the PRF secret is used. A new passkey is refused where the
// person's passkey manager holds one this device knows (seed.ts), so a person has one. One saved
// where no PRF secret can be had, as it is made or at the get that follows, is dropped, and the
// person is told to save it in another manager: Passwords, on an Apple device.

import { base64urlnopad } from '@scure/base'

import { vaultKey } from '../../standard/keys/src/index.ts'

/** The PRF salt, fixed: the same passkey gives the same seed on every device and at every visit. */
export const SALT = new TextEncoder().encode('forest-seed-v1')

/**
 * The passkey's relying party: the page's own host, which for the app is app.forest.foundation.
 * A page on another subdomain (the index, the issuer, a service) cannot ask for its passkeys; one
 * under app.forest.foundation could, so nothing else is served there. A copy elsewhere (localhost,
 * a preview) has passkeys of its own.
 */
export const rpId = (hostname = location.hostname): string => hostname

/** Whether this is an Apple device, where Passwords (iCloud Keychain) gives the PRF secret. */
const apple = () => /iPhone|iPad|iPod|Macintosh/.test(globalThis.navigator?.userAgent ?? '')

/**
 * Refused: no PRF secret. `browser`: this browser cannot ask a passkey for one at all. `saved`: the
 * passkey just made was saved in a manager that gives none, at its making or at the get after.
 * `passkey`: a passkey asked for later gave none.
 */
export class NoPrf extends Error {
  readonly browser: boolean
  constructor(where: 'browser' | 'saved' | 'passkey' = 'passkey') {
    super(
      where === 'browser'
        ? "This browser can't open Forest: it can't ask a passkey for the secret Forest opens with. Open Forest on a newer device."
        : where === 'saved'
          ? `This password manager can't open Forest. Save it in ${apple() ? 'Passwords' : 'another password manager'} instead.`
          : "This device's passkeys can't open Forest. Use a phone with a passkey instead: choose the QR code in the passkey sheet. Or use a newer device.",
    )
    this.name = 'NoPrf'
    this.browser = where === 'browser'
  }
}

/** Refused: the person's passkey manager holds a Forest passkey this device knows. That one opens Forest, through Sign in. */
export class HasPasskey extends Error {
  constructor() {
    super('You already have a Forest passkey. Sign in with it.')
    this.name = 'HasPasskey'
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

/** A passkey's id as the device keeps it, and as a passkey manager is told it: base64url, no padding. */
export const idText = (id: Uint8Array): string => base64urlnopad.encode(id)
export const idBytes = (text: string): Uint8Array<ArrayBuffer> => new Uint8Array(base64urlnopad.decode(text))

type WithCapabilities = { getClientCapabilities?: () => Promise<Record<string, boolean>> }
type WithSignals = { signalUnknownCredential?: (o: { rpId: string; credentialId: string }) => Promise<void> }

/** A passkey's answer: the seed it gave, and its id, to ask the person's passkey manager to drop it. */
export type Passkey = { seed: Uint8Array; id: Uint8Array<ArrayBuffer> }

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
 * Where neither gives it, the person's passkey manager is asked to drop it, nothing is kept, and
 * the person is told to save it in another manager. A manager that holds one of the passkeys
 * `exclude` names makes none, and the person signs in.
 */
export async function createPasskey(exclude: Uint8Array<ArrayBuffer>[] = []): Promise<Passkey> {
  if (await browserLacksPrf()) throw new NoPrf('browser')
  const credential = await navigator.credentials.create({
    publicKey: {
      rp: { id: rpId(), name: 'Forest' },
      // A user id of its own, at random: a manager replaces a passkey made again with the same one, and a second Start would lose the first passkey's seed.
      user: { id: random(16), name: 'Forest', displayName: 'Forest' },
      challenge: random(32),
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      // No attachment named, so the passkey sheet offers a phone (the QR code) where this device has no PRF.
      authenticatorSelection: { residentKey: 'required', requireResidentKey: true, userVerification: 'required' },
      excludeCredentials: exclude.map((id) => ({ type: 'public-key' as const, id })),
      extensions: { prf: { eval: { first: SALT } } },
    },
  }).catch((err) => Promise.reject(err instanceof DOMException && err.name === 'InvalidStateError' ? new HasPasskey() : err))
  if (!credential) throw new Error('No passkey was made.')
  const id = new Uint8Array((credential as PublicKeyCredential).rawId)
  const first = prfOf(credential)?.results?.first
  if (first) return { seed: seedOf(first), id }
  try {
    return await askSeed([id])
  } catch (err) {
    if (!(err instanceof NoPrf)) throw err
    await dropPasskey(id)
    throw new NoPrf('saved')
  }
}

/** Asks the person's passkey manager to drop a passkey that will never give a seed. Some managers do; the rest ignore it. */
export async function dropPasskey(id: Uint8Array): Promise<void> {
  await (PublicKeyCredential as WithSignals | undefined)?.signalUnknownCredential?.({ rpId: rpId(), credentialId: idText(id) }).catch(() => undefined)
}

/** The seed, from the person's passkey after their face or fingerprint: one system prompt. Any Forest passkey they hold may answer, unless `allow` names one. */
export async function askSeed(allow?: Uint8Array<ArrayBuffer>[]): Promise<Passkey> {
  if (typeof PublicKeyCredential === 'undefined' || !navigator.credentials) throw new NoPrf('browser')
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
  return { seed: seedOf(first), id: new Uint8Array((credential as PublicKeyCredential).rawId) }
}
