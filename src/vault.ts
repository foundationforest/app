// The person's vault, as this app keeps it (the standard's records README, The vault): the labels of
// their profiles and where each lives, their issuers' notes, and the app's own field,
// `settings.forestApp`: the services the person uses, and `credits`, the credits not yet spent, as
// credits.ts writes them, since a credit is a bearer one and is as safe as the vault. Read and
// written with the vault key and its inbox key, both mixed from the seed for the action and dropped
// with it. A vault an older copy of this app wrote keeps its credits at the top; they are moved into
// `settings.forestApp` when it is read, and written there at its next write.

import { inboxKey, mainKey, vaultKey } from '../standard/keys/src/index.ts'
import type { Key } from '../standard/records/src/index.ts'
import { hostsRecord, readPage } from '../standard/records/src/index.ts'
import { type Vault, readVault, vaultRecord } from '../standard/records/src/private.ts'
import type { LocalProfile } from './local.ts'
import type { Credit } from './services/credits.ts'
import { publishRecords, spend } from './services/host.ts'
import { ServiceError } from './services/http.ts'
import type { Settings } from './settings.ts'

export type AppVault = Vault

/** What the vault keeps for this app: the services, and the credits not yet spent. */
export type AppSettings = Partial<Settings> & { credits?: Credit[] }

export type VaultKeys = { key: Key; identity: string; recipient: string }

export async function vaultKeys(seed: Uint8Array): Promise<VaultKeys> {
  const key = await vaultKey(seed)
  const { identity, recipient } = await inboxKey(key.privateKey)
  return { key, identity, recipient }
}

const isObject = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)

/** This app's field of the vault's settings. */
function mine(vault: AppVault): AppSettings {
  const forestApp = vault.settings?.forestApp
  return isObject(forestApp) ? (forestApp as AppSettings) : {}
}

/** The credits the vault holds, not yet spent. */
export const creditsOf = (vault: AppVault): Credit[] => mine(vault).credits ?? []

/** The vault with these credits, in this app's settings. */
export const withCredits = (vault: AppVault, credits: Credit[]): AppVault => ({ ...vault, settings: { ...vault.settings, forestApp: { ...mine(vault), credits } } })

/** The settings the vault keeps for this app, the services only. */
export function settingsOf(vault: AppVault): Partial<Settings> {
  const { credits: _, ...services } = mine(vault)
  return services
}

/** An older vault's top-level credits, moved into this app's settings. */
function migrated(vault: AppVault): AppVault {
  if (!Array.isArray(vault.credits)) return vault
  const { credits, ...rest } = vault
  return withCredits(rest, [...creditsOf(rest), ...(credits as Credit[])])
}

/**
 * The vault as its hosts hold it now, with its hosts and its record's time for the next write; null
 * when they hold none. The first host must answer: a host that does not would look like no vault,
 * and a person sent on as if they had none would have a new vault written over theirs.
 */
export async function openVault(hosts: string[], keys: VaultKeys): Promise<{ vault: AppVault; hosts: string[]; time: number } | null> {
  await readPage(hosts[0]!, { profile: keys.key.address, post: true })
  const read = await readVault(hosts, { address: keys.key.address, identity: keys.identity }, Date.now(), { post: true })
  return read && { ...read, vault: migrated(read.vault), hosts: read.hosts.length ? read.hosts : hosts }
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
    const merged: AppVault = withCredits(
      {
        ...there.vault,
        issuerNotes: [...(there.vault.issuerNotes ?? []).filter((n) => !notes.some((m) => m.issuer === n.issuer)), ...notes],
        settings: { ...there.vault.settings, ...vault.settings, forestApp: { ...mine(there.vault), ...mine(vault) } },
      },
      [...creditsOf(there.vault), ...creditsOf(vault)],
    )
    await saveVault(keys, there.hosts, merged, there.time)
    return merged
  }
  await publishRecords([host], [hostsRecord(keys.key, [host], Date.now())])
  const { rest } = await spendOne(creditsOf(vault), host, (credit) => spend(host, keys.key.address, [credit]))
  const kept = withCredits(vault, rest)
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

/** The vault's profiles as this device keeps them: each with its address, mixed from the seed and its label. */
export async function profilesOf(seed: Uint8Array, vault: AppVault): Promise<LocalProfile[]> {
  return Promise.all((vault.profiles ?? []).map(async ({ label, hosts }) => ({ label, hosts, address: (await mainKey(seed, label)).address })))
}
