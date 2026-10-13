// The person's profiles back from their 24 words: the vault read from the host, its settings taken,
// and each profile's address mixed from the seed. Null when the host has no vault for this seed,
// as when setup stopped before writing one: the face check is then still to do.

import type { LocalProfile } from '../local.ts'
import { type Settings, saveSettings } from '../settings.ts'
import { openVault, profilesOf, settingsOf, vaultKeys } from '../vault.ts'

export async function restore(seed: Uint8Array, s: Settings): Promise<LocalProfile[] | null> {
  const read = await openVault([s.host], await vaultKeys(seed))
  if (!read) return null
  saveSettings(settingsOf(read.vault))
  return profilesOf(seed, read.vault)
}
