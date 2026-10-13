// Removing an access key from a profile, as the standard's records README says (Removing a key): a
// write or message key made past, its scope kept as `was`, so what it wrote still counts; a read key
// deleted, and dropped from the card's inbox readers, so messages are no longer sealed to it.

import { mainKey } from '../../standard/keys/src/index.ts'
import { type AccessKey, nextTime, ownerRecord, permissionsRecord } from '../../standard/records/src/index.ts'
import type { LocalProfile } from '../local.ts'
import { publishRecords, readOwn } from '../services/host.ts'

export async function removeAccessKey(seed: Uint8Array, profile: LocalProfile, key: string): Promise<void> {
  const main = await mainKey(seed, profile.label)
  const view = await readOwn(profile.hosts, profile.address)
  const hosts = view.hosts.length ? view.hosts : profile.hosts
  const access = view.access.flatMap((e): AccessKey[] => {
    if (e.key !== key || !e.scope) return [e]
    if (e.scope === 'read') return []
    return [{ key: e.key, was: e.scope, ...(e.paths && { paths: e.paths }) }]
  })
  const now = Date.now()
  const notes = view.current.get('permissions')?.record.body?.notes
  const records = [permissionsRecord(main, access, nextTime(now, view, 'permissions'), typeof notes === 'string' ? notes : undefined)]
  const card = view.current.get('profile')?.record.body as { inbox?: { readers?: string[] } } | null | undefined
  if (card?.inbox?.readers?.includes(key)) {
    const readers = card.inbox.readers.filter((r) => r !== key)
    const { readers: _, ...inbox } = card.inbox
    records.push(ownerRecord(main, 'profile', { ...card, inbox: readers.length ? { ...inbox, readers } : inbox }, nextTime(now, view, 'profile')))
  }
  await publishRecords(hosts, records)
}
