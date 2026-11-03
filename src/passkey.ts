// The passkey, and the seed it gives: its PRF secret (the WebAuthn PRF extension) for one fixed
// salt, which the person's password manager gives only after their device's unlock, the same 32
// bytes every time for the same passkey, on every device it syncs to. That secret is the seed, used
// as it is. After an unlock it is held in the page's memory for 5 minutes, which each action
// restarts, and dropped at once when the page is hidden or closed (held.ts); it is never stored. No
// server checks these passkeys: the challenge is random and nobody reads the signature; only the PRF
// secret is used.
//
// One passkey per person. On a device that knows one, Start asks for the ones it knows, and never
// offers to make another. On a device that knows none, the person says which: make one (`make`), or
// ask for any Forest passkey their managers hold, or, through the passkey sheet's QR code, one on
// another device (`ask`). A browser can't tell a closed sheet from no passkey, so a closed sheet says
// neither. A passkey whose manager gives no PRF secret is dropped, and the person is told which one
// does.

import { base64urlnopad } from '@scure/base'

import { withHeld } from './held.ts'
import { Said } from './words.ts'

/**
 * The PRF salt. Its bytes never change: the same passkey must give the same seed on every device
 * and at every visit, and the passkeys made with the earlier version of this app give theirs for
 * these bytes. "v1" is part of the bytes, not a version of this code.
 */
export const SALT = new TextEncoder().encode('forest-seed-v1')

/**
 * The passkey's relying party: the page's own host, which for the app is app.forest.foundation, so
 * no other site can ask for its passkeys, not even another page under forest.foundation. A copy
 * elsewhere (a preview, localhost) has passkeys of its own.
 */
export const rpId = (hostname = globalThis.location?.hostname ?? ''): string => hostname

const apple = () => /iPhone|iPad|iPod|Macintosh/.test(globalThis.navigator?.userAgent ?? '')

/** This browser cannot ask a passkey for its PRF secret at all. */
export class OldBrowser extends Said {
  constructor() {
    super("This browser can't open Forest. Use a newer one.")
    this.name = 'OldBrowser'
  }
}

/** The passkey's manager gives no PRF secret: the passkey made there was dropped (`made`), or one asked for gave none. */
export class NoPrf extends Said {
  constructor(made: boolean) {
    super(made ? `This password manager can't keep a Forest passkey. Save it in ${apple() ? 'Passwords' : 'another password manager'} instead.` : `This passkey can't open Forest. Use one saved in ${apple() ? 'Passwords' : 'another password manager'}.`, true)
    this.name = 'NoPrf'
  }
}

/** No passkey answered: none was there, or the person closed the sheet, which a browser can't tell apart. */
export class NoAnswer extends Said {
  constructor() {
    super('No passkey chosen.')
    this.name = 'NoAnswer'
  }
}

/** A passkey's answer: the seed it gave, and its id as the device keeps it. */
export type Passkey = { seed: Uint8Array; id: string }

/** A passkey's id as the device keeps it and a manager is told it: base64url, no padding. */
export const idText = (id: Uint8Array): string => base64urlnopad.encode(id)
const idBytes = (text: string): Uint8Array<ArrayBuffer> => new Uint8Array(base64urlnopad.decode(text))
const descriptors = (ids: string[]) => ids.map((id) => ({ type: 'public-key' as const, id: idBytes(id) }))
const random = (n: number) => crypto.getRandomValues(new Uint8Array(n))

type Capabilities = Record<string, boolean>
const capabilities = async (): Promise<Capabilities> =>
  (await (globalThis.PublicKeyCredential as { getClientCapabilities?: () => Promise<Capabilities> } | undefined)?.getClientCapabilities?.().catch(() => undefined)) ?? {}

/** Whether this browser cannot ask a passkey for a PRF secret. One that does not say is let try. */
export async function oldBrowser(): Promise<boolean> {
  if (typeof PublicKeyCredential === 'undefined' || !navigator.credentials) return true
  return (await capabilities())['extension:prf'] === false
}

/** The seed from a PRF secret: its 32 bytes, not copied, so zeroing the seed zeroes them. */
function seedOf(secret: BufferSource): Uint8Array {
  const seed = ArrayBuffer.isView(secret) ? new Uint8Array(secret.buffer, secret.byteOffset, secret.byteLength) : new Uint8Array(secret)
  if (seed.length !== 32) throw new Said("This passkey can't open Forest.", true)
  return seed
}

const prfOf = (credential: Credential | null) => (credential as PublicKeyCredential | null)?.getClientExtensionResults().prf?.results?.first

/**
 * The seed, from a Forest passkey, after the device's unlock. `allow` names the passkeys that may
 * answer; left out, any Forest passkey the person holds may.
 */
export async function ask({ allow }: { allow?: string[] } = {}): Promise<Passkey> {
  if (await oldBrowser()) throw new OldBrowser()
  const request: CredentialRequestOptions = {
    publicKey: {
      rpId: rpId(),
      challenge: random(32),
      ...(allow?.length && { allowCredentials: descriptors(allow) }),
      userVerification: 'required',
      extensions: { prf: { eval: { first: SALT } } },
    },
  }
  const credential = await navigator.credentials.get(request).catch((err: unknown) => {
    throw err instanceof DOMException && err.name === 'NotAllowedError' ? new NoAnswer() : err
  })
  if (!credential) throw new NoAnswer()
  const first = prfOf(credential)
  if (!first) throw new NoPrf(false)
  return { seed: seedOf(first), id: idText(new Uint8Array((credential as PublicKeyCredential).rawId)) }
}

/**
 * A new passkey, named Forest, and its seed. Some managers give the PRF secret as the passkey is
 * made; the others (Safari's) only when it is asked for, so one ask follows, naming it. Where
 * neither gives it, the manager is asked to drop it, and the person is told to save it elsewhere.
 * Only Start calls it, on a device that knows no passkey.
 */
export async function make(): Promise<Passkey> {
  if (await oldBrowser()) throw new OldBrowser()
  const credential = await navigator.credentials
    .create({
      publicKey: {
        rp: { id: rpId(), name: 'Forest' },
        // A user id of its own, at random: a manager replaces a passkey made again with the same one.
        user: { id: random(16), name: 'Forest', displayName: 'Forest' },
        challenge: random(32),
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        // No attachment named, so the sheet offers a phone (the QR code) where this device has no PRF.
        authenticatorSelection: { residentKey: 'required', requireResidentKey: true, userVerification: 'required' },
        extensions: { prf: { eval: { first: SALT } } },
      },
    })
    .catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'NotAllowedError') throw new NoAnswer()
      throw err
    })
  if (!credential) throw new NoAnswer()
  const id = idText(new Uint8Array((credential as PublicKeyCredential).rawId))
  const first = prfOf(credential)
  if (first) return { seed: seedOf(first), id }
  try {
    return await ask({ allow: [id] })
  } catch (err) {
    if (!(err instanceof NoPrf)) throw err
    await drop(id)
    throw new NoPrf(true)
  }
}

/** Asks the manager to drop a passkey that will never give a seed. Some managers do; the rest ignore it. */
async function drop(id: string): Promise<void> {
  const signals = globalThis.PublicKeyCredential as { signalUnknownCredential?: (o: { rpId: string; credentialId: string }) => Promise<void> } | undefined
  await signals?.signalUnknownCredential?.({ rpId: rpId(), credentialId: id }).catch(() => undefined)
}

/**
 * The seed for an action, from the passkey in use (`id`): the one held from an unlock less than 5
 * minutes ago, or, with none held, asked for now, after the device's unlock, and held from then
 * (held.ts). The action mixes the keys it needs and keeps none.
 */
export async function withSeed<T>(id: string, action: (seed: Uint8Array) => Promise<T>): Promise<T> {
  return withHeld(id, async () => (await ask({ allow: [id] })).seed, action)
}
