// Signing in: the vault read from the host with the passkey's seed, its settings taken, and each
// profile's address mixed from the seed, for the board this device shows. Every host must answer
// (openVault): only then does no vault mean no setup for this passkey.

import type { LocalProfile } from '../local.ts'
import { type Settings, saveSettings } from '../settings.ts'
import { openVault, profilesOf, settingsOf, vaultKeys } from '../vault.ts'

export async function signIn(seed: Uint8Array, s: Settings): Promise<LocalProfile[]> {
  const read = await openVault([s.host], await vaultKeys(seed))
  if (!read) throw new Error('No setup found for this passkey.')
  saveSettings(settingsOf(read.vault))
  return profilesOf(seed, read.vault)
}
