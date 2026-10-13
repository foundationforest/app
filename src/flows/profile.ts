// A new profile, made in one face: its main key mixed from the seed and its label; the person proof
// made in the worker from the vault's note; its row written through the registry payer with one of
// the vault's credits; its folder on the host (the hosts record, which is free, one host credit
// into its balance, then a card with no name, its inbox open to people holding a row from the same
// issuer); and the vault written again with the profile and without the credits spent.

import { Keypair, VersionedTransaction } from '@solana/web3.js'

import { inboxKey, issuerSecret, mainKey } from '../../standard/keys/src/index.ts'
import { hostsRecord, ownerRecord } from '../../standard/records/src/index.ts'
import { noteFromJson } from '../../standard/registry/client/src/person.ts'
import type { LocalProfile } from '../local.ts'
import type { ProveRequest, Proved } from '../proof/prove.ts'
import { publishRecords, spend } from '../services/host.ts'
import { ServiceError } from '../services/http.ts'
import { payerOf, register } from '../services/registry-payer.ts'
import { latestBlockhash } from '../services/solana.ts'
import { REGISTRY_PROGRAM, type Settings } from '../settings.ts'
import { type AppVault, NoCredits, openVault, profilesOf, saveVault, spendOne, vaultKeys } from '../vault.ts'

export type Prove = (request: ProveRequest) => Promise<Proved>

/** Makes the profile at `label`, `market/role`; the person's profiles after, as the vault now lists them. */
export async function makeProfile(seed: Uint8Array, label: string, s: Settings, prove: Prove): Promise<LocalProfile[]> {
  const keys = await vaultKeys(seed)
  const read = await openVault([s.host], keys)
  if (!read) throw new Error('No vault was found on your host.')
  let vault: AppVault = read.vault
  const issued = vault.issuerNotes?.[0]
  if (!issued) throw new Error('Your vault holds no note.')
  const note = noteFromJson(issued.note)
  // Both are spent below; none spent when either is missing.
  for (const service of [s.registryPayer, s.host]) if (!vault.credits?.some((c) => c.service === service)) throw new NoCredits(service)

  const main = await mainKey(seed, label)
  const { secret } = await issuerSecret(seed, issued.issuer)
  const [payer, recentBlockhash] = await Promise.all([payerOf(s.registryPayer), latestBlockhash(s.rpc)])
  const proved = await prove({ secret, note, label, profile: main.address, payer, recentBlockhash, programId: REGISTRY_PROGRAM })
  const tx = VersionedTransaction.deserialize(proved.transaction)
  tx.sign([Keypair.fromSeed(main.privateKey)])

  // The row. Made already, it is this profile's: the same seed and label give the same main key.
  let credits = vault.credits ?? []
  try {
    credits = (await spendOne(credits, s.registryPayer, (credit) => register(s.registryPayer, tx.serialize(), credit))).rest
  } catch (err) {
    if (!(err instanceof ServiceError && err.code === 'row_exists')) throw err
  }

  const hosts = [s.host]
  const [market, role] = label.split('/') as [string, string]
  const now = Date.now()
  await publishRecords(hosts, [hostsRecord(main, hosts, now)])
  credits = (await spendOne(credits, s.host, (credit) => spend(s.host, main.address, [credit]))).rest
  const card = {
    market,
    role,
    inboxKey: (await inboxKey(main.privateKey)).recipient,
    inbox: { senders: { issuer: issued.note.issuer as string } },
    createdAt: new Date(now).toISOString(),
  }
  await publishRecords(hosts, [ownerRecord(main, 'profile', card, now)])

  vault = { ...vault, credits, profiles: [...(vault.profiles ?? []).filter((p) => p.label !== label), { label, hosts }] }
  await saveVault(keys, read.hosts, vault, read.time)
  return profilesOf(seed, vault)
}
