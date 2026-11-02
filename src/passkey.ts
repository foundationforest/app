// The passkey, and the seed it gives: its PRF secret (the WebAuthn PRF extension) for one fixed
// salt, which the person's password manager gives only after their device's unlock, the same 32
// bytes every time for the same passkey, on every device it syncs to. That secret is the seed, used
// as it is, for one action, and zeroed after it (`withSeed`). No server checks these passkeys: the
// challenge is random and nobody reads the signature; only the PRF secret is used.
//
// One passkey per person. Start asks for one first (`ask`): any Forest passkey the person's managers
// hold, or, through the passkey sheet's QR code, one on another device. Only when none answers does
// it offer to make one (`make`), never where the manager holds one of the passkeys this device knows.
// A passkey whose manager gives no PRF secret is dropped, and the person is told which one does.

import { base64urlnopad } from '@scure/base'

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
export class OldBrowser extends Error {
  constructor() {
    super("This browser can't open Forest. Use a newer one.")
    this.name = 'OldBrowser'
  }
}

/** The passkey's manager gives no PRF secret: the passkey made there was dropped (`made`), or one asked for gave none. */
export class NoPrf extends Error {
  constructor(made: boolean) {
    super(made ? `This password manager can't keep a Forest passkey. Save it in ${apple() ? 'Passwords' : 'another password manager'} instead.` : `This passkey can't open Forest. Use one saved in ${apple() ? 'Passwords' : 'another password manager'}.`)
    this.name = 'NoPrf'
  }
}

/** No passkey answered: none was there, or the person closed the sheet. */
export class NoAnswer extends Error {
  constructor() {
    super('No Forest passkey answered.')
    this.name = 'NoAnswer'
  }
}

/** The manager holds one of the passkeys this device knows: none is made. */
export class HasPasskey extends Error {
  constructor() {
    super('You already have a Forest passkey.')
    this.name = 'HasPasskey'
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

/**
 * Whether this browser can ask for a passkey without showing the sheet when there is none
 * (WebAuthn's immediate mediation, `uiMode: 'immediate'`): then a person with no passkey here goes
 * straight to Make one, and one whose passkey is on another device asks again with the sheet.
 */
export const asksQuietly = async (): Promise<boolean> => (await capabilities()).immediateGet === true

/** The seed from a PRF secret: its 32 bytes, not copied, so zeroing the seed zeroes them. */
function seedOf(secret: BufferSource): Uint8Array {
  const seed = ArrayBuffer.isView(secret) ? new Uint8Array(secret.buffer, secret.byteOffset, secret.byteLength) : new Uint8Array(secret)
  if (seed.length !== 32) throw new Error(`The passkey gave a secret of ${seed.length} bytes, not 32.`)
  return seed
}

const prfOf = (credential: Credential | null) => (credential as PublicKeyCredential | null)?.getClientExtensionResults().prf?.results?.first

/**
 * The seed, from a Forest passkey, after the device's unlock. `allow` names the passkeys that may
 * answer; left out, any Forest passkey the person holds may. `quietly` asks without the sheet,
 * failing at once when this device has none (WebAuthn takes no `allow` that way).
 */
export async function ask({ allow, quietly = false }: { allow?: string[]; quietly?: boolean } = {}): Promise<Passkey> {
  if (await oldBrowser()) throw new OldBrowser()
  const request = {
    publicKey: {
      rpId: rpId(),
      challenge: random(32),
      ...(!quietly && allow?.length && { allowCredentials: descriptors(allow) }),
      userVerification: 'required',
      extensions: { prf: { eval: { first: SALT } } },
    },
    ...(quietly && { uiMode: 'immediate' }),
  } as CredentialRequestOptions
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
 * neither gives it, the manager is asked to drop it, and the person is told to save it elsewhere. A
 * manager that holds one of the passkeys `known` names makes none.
 */
export async function make(known: string[]): Promise<Passkey> {
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
        excludeCredentials: descriptors(known),
        extensions: { prf: { eval: { first: SALT } } },
      },
    })
    .catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'InvalidStateError') throw new HasPasskey()
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
 * The seed for one action, from the passkey in use (`id`), after the device's unlock, zeroed when
 * the action ends, whether it worked or not. The action mixes the keys it needs and keeps none.
 */
export async function withSeed<T>(id: string, action: (seed: Uint8Array) => Promise<T>): Promise<T> {
  const { seed } = await ask({ allow: [id] })
  try {
    return await action(seed)
  } finally {
    seed.fill(0)
  }
}
