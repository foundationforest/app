// Where a passkey lives, from the AAGUID a new passkey's authenticator data carries: the 16 bytes
// each password manager sends as its own maker's id, which a manager may leave as zeros. A short
// table of the managers most people use, each id as its maker publishes it (gathered in
// github.com/passkeydeveloper/passkey-authenticator-aaguids), each by its maker's short name: Apple,
// Google, Microsoft. Any other id names nothing, and the passkey shows as Passkey until renamed.
// Before the device kept makers it kept each manager's full name, from the same ids
// (Google Password Manager): read now as its maker.

import type { IconName } from './icons.tsx'

const MAKERS: Record<string, string> = {
  'ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4': 'Google',
  'adce0002-35bc-c60a-648b-0b25f1f05503': 'Google',
  'fbfc3007-154e-4ecc-8c0b-6e020557d7bd': 'Apple',
  'dd4ec289-e01d-41c9-bb89-70fa845d4bf2': 'Apple',
  '08987058-cadc-4b81-b6e1-30de50dcbe96': 'Microsoft',
  '9ddd1817-af5a-4672-a2b9-3e3dd95000a9': 'Microsoft',
  '6028b017-b1d4-4c02-b4b3-afcdafc96bb2': 'Microsoft',
  'd3452668-01fd-4c12-926c-83a4204853aa': 'Microsoft',
  '771b48fd-d3d4-4f74-9232-fc157ab0507a': 'Microsoft',
  '53414d53-554e-4700-0000-000000000000': 'Samsung',
  'bada5566-a7aa-401f-bd96-45619a55120d': '1Password',
  'd548826e-79b4-db40-a3d8-11116f7e8349': 'Bitwarden',
  '531126d6-e717-415c-9320-3d9aa6981239': 'Dashlane',
  '50726f74-6f6e-5061-7373-50726f746f6e': 'Proton',
  'b84e4048-15dc-4dd0-8640-f4f60813c8af': 'NordPass',
  '0ea242b4-43c4-4a1b-8b17-dd6d0b6baec6': 'Keeper',
  'b78a0a55-6ef8-d246-a042-ba0f6d55050c': 'LastPass',
  'f3809540-7f14-49c1-a8b3-8f813b225541': 'Enpass',
  'b35a26b2-8f6e-4697-ab1d-d44db4da28c6': 'Zoho',
  'fdb141b2-5d84-443e-8a35-4698c205a502': 'KeePassXC',
  'eaecdef2-1c31-5634-8639-f1cbd9c00a08': 'KeePassDX',
}

/** The full names the device kept before it kept makers, from the same ids, each by its maker. */
const BEFORE: Record<string, string> = {
  'Google Password Manager': 'Google',
  'Chrome on Mac': 'Google',
  'Apple Passwords': 'Apple',
  'iCloud Keychain': 'Apple',
  'Windows Hello': 'Microsoft',
  'Microsoft Password Manager': 'Microsoft',
  'Edge on Mac': 'Microsoft',
  'Samsung Pass': 'Samsung',
  '1Password': '1Password',
  Bitwarden: 'Bitwarden',
  Dashlane: 'Dashlane',
  'Proton Pass': 'Proton',
  NordPass: 'NordPass',
  Keeper: 'Keeper',
  LastPass: 'LastPass',
  Enpass: 'Enpass',
  'Zoho Vault': 'Zoho',
  KeePassXC: 'KeePassXC',
  KeePassDX: 'KeePassDX',
}

/** The flag in authenticator data saying attested credential data, and with it the AAGUID, follows. */
const ATTESTED = 0x40

/**
 * The AAGUID in a new passkey's authenticator data, as a lowercase UUID: after the relying party's
 * hash (32 bytes), the flags (1) and the counter (4). Undefined when the data carries none, or zeros.
 */
export function aaguidOf(data: Uint8Array): string | undefined {
  if (data.length < 53 || !(data[32]! & ATTESTED)) return undefined
  const hex = [...data.subarray(37, 53)].map((b) => b.toString(16).padStart(2, '0')).join('')
  if (/^0+$/.test(hex)) return undefined
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** The maker an AAGUID names, if the table has it. */
export const makerOf = (aaguid: string | undefined): string | undefined => (aaguid && Object.hasOwn(MAKERS, aaguid.toLowerCase()) ? MAKERS[aaguid.toLowerCase()] : undefined)

/** The maker a full name the device kept before names, if it is one. */
export const makerBefore = (name: string): string | undefined => (Object.hasOwn(BEFORE, name) ? BEFORE[name] : undefined)

/** A passkey with nothing to name it by. */
export const PASSKEY = 'Passkey'

/** The square a maker's passkey shows: its logo for Apple and Google, else a key. */
export const logoOf = (maker: string | undefined): IconName => (maker === 'Apple' ? 'apple-logo' : maker === 'Google' ? 'google-logo' : 'key')

/** What a passkey is called: the name it was given, else its maker's, else Passkey. */
export const nameOf = (made: { maker?: string; name?: string } | undefined): string => made?.name ?? made?.maker ?? PASSKEY

/** Each passkey's name as a list of them shows it, in its order: a name shown already takes the next number free (Apple, Apple 2). */
export function numbered(names: string[]): string[] {
  const shown = new Set<string>()
  return names.map((name) => {
    let out = name
    for (let n = 2; shown.has(out); n++) out = `${name} ${n}`
    shown.add(out)
    return out
  })
}
