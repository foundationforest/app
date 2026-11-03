// A password manager's name, from the AAGUID a new passkey's authenticator data carries: the 16
// bytes each manager sends as its own, which a manager may leave as zeros. A short table of the
// managers most people use, each id as its maker publishes it (gathered in
// github.com/passkeydeveloper/passkey-authenticator-aaguids); any other id names nothing, and the
// backup shows without a name.

const NAMES: Record<string, string> = {
  'ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4': 'Google Password Manager',
  'adce0002-35bc-c60a-648b-0b25f1f05503': 'Chrome on Mac',
  'fbfc3007-154e-4ecc-8c0b-6e020557d7bd': 'Apple Passwords',
  'dd4ec289-e01d-41c9-bb89-70fa845d4bf2': 'iCloud Keychain',
  '08987058-cadc-4b81-b6e1-30de50dcbe96': 'Windows Hello',
  '9ddd1817-af5a-4672-a2b9-3e3dd95000a9': 'Windows Hello',
  '6028b017-b1d4-4c02-b4b3-afcdafc96bb2': 'Windows Hello',
  'd3452668-01fd-4c12-926c-83a4204853aa': 'Microsoft Password Manager',
  '771b48fd-d3d4-4f74-9232-fc157ab0507a': 'Edge on Mac',
  '53414d53-554e-4700-0000-000000000000': 'Samsung Pass',
  'bada5566-a7aa-401f-bd96-45619a55120d': '1Password',
  'd548826e-79b4-db40-a3d8-11116f7e8349': 'Bitwarden',
  '531126d6-e717-415c-9320-3d9aa6981239': 'Dashlane',
  '50726f74-6f6e-5061-7373-50726f746f6e': 'Proton Pass',
  'b84e4048-15dc-4dd0-8640-f4f60813c8af': 'NordPass',
  '0ea242b4-43c4-4a1b-8b17-dd6d0b6baec6': 'Keeper',
  'b78a0a55-6ef8-d246-a042-ba0f6d55050c': 'LastPass',
  'f3809540-7f14-49c1-a8b3-8f813b225541': 'Enpass',
  'b35a26b2-8f6e-4697-ab1d-d44db4da28c6': 'Zoho Vault',
  'fdb141b2-5d84-443e-8a35-4698c205a502': 'KeePassXC',
  'eaecdef2-1c31-5634-8639-f1cbd9c00a08': 'KeePassDX',
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

/** The password manager an AAGUID names, if the table has it. */
export const managerOf = (aaguid: string | undefined): string | undefined => (aaguid ? NAMES[aaguid.toLowerCase()] : undefined)
