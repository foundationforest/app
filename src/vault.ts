// The person's vault, as this app keeps it (the standard's records README, The vault): the labels of
// their profiles and where each lives, their issuers' notes, and two fields of the app's own, kept by
// any other app that shares the vault: `credits`, the credits not yet spent, as credits.ts writes
// them, since a credit is a bearer one and is as safe as the vault; and `settings.forestApp`, the
// services the person uses. Read and written with the vault key and its inbox key, both mixed from
// the seed for the action and dropped with it.

import { inboxKey, mainKey, vaultKey } from '../standard/keys/src/index.ts'
import type { Key } from '../standard/records/src/index.ts'
import { hostsRecord, readPage } from '../standard/records/src/index.ts'
import { type Vault, readVault, vaultRecord } from '../standard/records/src/private.ts'
import type { LocalProfile } from './local.ts'
import type { Credit } from './services/credits.ts'
import { publishRecords, spend } from './services/host.ts'
import { ServiceError } from './services/http.ts'
import type { Settings } from './settings.ts'

export type AppVault = Vault & { credits?: Credit[] }

export type VaultKeys = { key: Key; identity: string; recipient: string }

export async function vaultKeys(seed: Uint8Array): Promise<VaultKeys> {
  const key = await vaultKey(seed)
  const { identity, recipient } = await inboxKey(key.privateKey)
  return { key, identity, recipient }
}

/**
 * The vault as its hosts hold it now, with its hosts and its record's time for the next write; null
 * when they hold none. The first host must answer: a host that does not would look like no vault,
 * and a person sent on as if they had none would have a new vault written over theirs.
 */
export async function openVault(hosts: string[], keys: VaultKeys): Promise<{ vault: AppVault; hosts: string[]; time: number } | null> {
  await readPage(hosts[0]!, { profile: keys.key.address, post: true })
  const read = await readVault(hosts, { address: keys.key.address, identity: keys.identity }, Date.now(), { post: true })
  return read && { ...read, vault: read.vault as AppVault, hosts: read.hosts.length ? read.hosts : hosts }
}

/** The vault written to every host its hosts record names, at a time past the one it replaces. */
export async function saveVault(keys: VaultKeys, hosts: string[], vault: AppVault, after = 0): Promise<void> {
  await publishRecords(hosts, [await vaultRecord(keys.key, keys.recipient, vault, Math.max(Date.now(), after + 1))])
}

/**
 * The vault after a face check, with its note, credits and settings. A new one on `host`: its hosts
 * record, which is free; one host credit into its folder, since every other write costs; then the
 * vault. Where one is there already, these are added to it, and nothing in it is lost.
 */
export async function firstVault(keys: VaultKeys, host: string, vault: AppVault): Promise<AppVault> {
  const there = await openVault([host], keys)
  if (there) {
    const notes = vault.issuerNotes ?? []
    const merged: AppVault = {
      ...there.vault,
      issuerNotes: [...(there.vault.issuerNotes ?? []).filter((n) => !notes.some((m) => m.issuer === n.issuer)), ...notes],
      credits: [...(there.vault.credits ?? []), ...(vault.credits ?? [])],
      settings: { ...there.vault.settings, ...vault.settings },
    }
    await saveVault(keys, there.hosts, merged, there.time)
    return merged
  }
  await publishRecords([host], [hostsRecord(keys.key, [host], Date.now())])
  const { rest } = await spendOne(vault.credits ?? [], host, (credit) => spend(host, keys.key.address, [credit]))
  const kept = { ...vault, credits: rest }
  await saveVault(keys, [host], kept)
  return kept
}

/**
 * One credit of `service` used by `use`, trying them in turn: a credit the service says is spent is
 * dropped, since the vault can still list one spent just before a write of it failed. The credits
 * left. Throws when none is left.
 */
export async function spendOne(credits: Credit[], service: string, use: (credit: Credit) => Promise<unknown>, done: string[] = ['spent']): Promise<{ rest: Credit[] }> {
  let rest = credits
  for (;;) {
    const credit = rest.find((c) => c.service === service)
    if (!credit) throw new NoCredits(service)
    rest = rest.filter((c) => c !== credit)
    try {
      await use(credit)
      return { rest }
    } catch (err) {
      if (err instanceof ServiceError && done.includes(err.code)) continue
      throw err
    }
  }
}

export class NoCredits extends Error {
  constructor(service: string) {
    super(`No credits left at ${new URL(service).host}.`)
    this.name = 'NoCredits'
  }
}

/** The settings the vault keeps for this app. */
export function settingsOf(vault: AppVault): Partial<Settings> {
  const mine = vault.settings?.forestApp
  return mine && typeof mine === 'object' && !Array.isArray(mine) ? (mine as Partial<Settings>) : {}
}

/** The vault's profiles as this device keeps them: each with its address, mixed from the seed and its label. */
export async function profilesOf(seed: Uint8Array, vault: AppVault): Promise<LocalProfile[]> {
  return Promise.all((vault.profiles ?? []).map(async ({ label, hosts }) => ({ label, hosts, address: (await mainKey(seed, label)).address })))
}
