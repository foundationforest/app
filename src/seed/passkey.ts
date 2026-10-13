// A passkey on this device, used for one thing: its PRF extension, a secret the device's secure
// hardware gives only after the person's face or fingerprint, the same secret each time for the
// same passkey and salt. The seed is locked under it (locked.ts). No server checks these passkeys:
// the challenge is random and nobody verifies the signature; only the PRF secret is used.

/** Refused: this device's passkeys give no PRF secret, and there is no password route. */
export class NoPrf extends Error {
  constructor() {
    super(
      "This device can't lock a seed. Forest locks it under a secret your device's passkeys give after your face or fingerprint (their PRF extension), and these passkeys don't give one. Forest has no password fallback. Use a phone or computer whose passkeys support PRF, in an up-to-date browser.",
    )
    this.name = 'NoPrf'
  }
}

const random = (n: number) => crypto.getRandomValues(new Uint8Array(n))
const b64u = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

type WithCapabilities = { getClientCapabilities?: () => Promise<Record<string, boolean>> }
type WithSignals = { signalUnknownCredential?: (o: { rpId: string; credentialId: string }) => Promise<void> }

function prfOf(credential: Credential | null) {
  return (credential as PublicKeyCredential | null)?.getClientExtensionResults().prf
}

/**
 * A new passkey on this device's own authenticator, asked for PRF, and its secret for `salt`. Some
 * authenticators give the secret when the passkey is made; the others need it asked for once more,
 * so the person may see two prompts. Refuses, before anything is stored, where PRF is missing.
 */
export async function createPasskey(salt: Uint8Array<ArrayBuffer>): Promise<{ id: Uint8Array<ArrayBuffer>; secret: Uint8Array }> {
  if (typeof PublicKeyCredential === 'undefined' || !navigator.credentials) throw new NoPrf()
  const capabilities = await (PublicKeyCredential as WithCapabilities).getClientCapabilities?.().catch(() => undefined)
  if (capabilities?.['extension:prf'] === false) throw new NoPrf()
  const credential = await navigator.credentials.create({
    publicKey: {
      rp: { name: 'Forest' },
      user: { id: random(16), name: 'Forest seed', displayName: 'Forest seed' },
      challenge: random(32),
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: { authenticatorAttachment: 'platform', residentKey: 'preferred', userVerification: 'required' },
      extensions: { prf: { eval: { first: salt } } },
    },
  })
  if (!credential) throw new Error('no passkey was made')
  const id = new Uint8Array((credential as PublicKeyCredential).rawId)
  const prf = prfOf(credential)
  if (!prf?.enabled) {
    // A passkey that can never open the seed: ask the person's passkey manager to drop it.
    await (PublicKeyCredential as WithSignals).signalUnknownCredential?.({ rpId: location.hostname, credentialId: b64u(id) }).catch(() => undefined)
    throw new NoPrf()
  }
  const first = prf.results?.first
  return { id, secret: first ? new Uint8Array(first as ArrayBuffer) : await passkeySecret(id, salt) }
}

/** The passkey's PRF secret for `salt`, after the person's face or fingerprint. */
export async function passkeySecret(id: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: random(32),
      allowCredentials: [{ type: 'public-key', id }],
      userVerification: 'required',
      extensions: { prf: { eval: { first: salt } } },
    },
  })
  const first = prfOf(credential)?.results?.first
  if (!first) throw new NoPrf()
  return new Uint8Array(first as ArrayBuffer)
}
