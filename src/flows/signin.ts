// Signing in: the vault read from the host with the passkey's seed, its settings taken, and each
// profile's address mixed from the seed, for the board this device shows. Null when every host
// answered and none holds a vault for this seed (openVault throws when one did not answer): the
// passkey's setup stopped before its vault, and its face check is still to do.

import type { LocalProfile } from '../local.ts'
import { type Settings, saveSettings } from '../settings.ts'
import { openVault, profilesOf, settingsOf, vaultKeys } from '../vault.ts'

export async function signIn(seed: Uint8Array, s: Settings): Promise<LocalProfile[] | null> {
  const read = await openVault([s.host], await vaultKeys(seed))
  if (!read) return null
  saveSettings(settingsOf(read.vault))
  return profilesOf(seed, read.vault)
}
