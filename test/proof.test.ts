// The person proof and the row's transaction, made as the proof's worker makes them (src/proof/
// prove.ts), here in Node, from a note signed by a throwaway issuer key, as the registry client's own
// tests sign one. The worker itself, in a browser: test/browser/run.ts.

import { readFile } from 'node:fs/promises'

import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js'
import { expect, test } from 'vitest'

import { issuerSecret, mainKey, newSeed } from '../standard/keys/src/index.ts'
import { rowAddress, stampOf, verifyPerson } from '../standard/registry/client/src/index.ts'
import { type Artifact } from '../src/proof/circuit.ts'
import { prove } from '../src/proof/prove.ts'
import { REGISTRY_PROGRAM } from '../src/settings.ts'
import { throwawayIssuer } from './stand-ins.ts'

const load = async (artifact: Artifact) => new Uint8Array(await readFile(new URL(`../public${artifact.path}`, import.meta.url)))
const label = 'tutoring/seller'

test('a person proof from a throwaway issuer\'s note, and the register transaction the main key signs', async () => {
  const seed = newSeed()
  const main = await mainKey(seed, label)
  const issuer = throwawayIssuer()
  const { secret, noteNumber } = await issuerSecret(seed, issuer.name)
  const note = issuer.sign(noteNumber)
  const payer = Keypair.generate().publicKey.toBase58()
  const given = new Uint8Array(secret)

  const started = performance.now()
  const proved = await prove({ secret: given, note, label, profile: main.address, payer, recentBlockhash: PublicKey.default.toBase58(), programId: REGISTRY_PROGRAM }, load)
  console.log(`  proof in Node: ${proved.ms.toFixed(0)} ms to prove, ${(performance.now() - started).toFixed(0)} ms with the files read`)

  expect(given.every((b) => b === 0)).toBe(true)
  expect(proved.stamp).toBe(stampOf(secret, label))
  expect(proved.row).toBe(rowAddress(proved.stamp, new PublicKey(REGISTRY_PROGRAM)).toBase58())
  expect(proved.tier).toBe(1n)
  expect(await verifyPerson({ proof: proved.proof, issuer: note.issuer, label, profile: main.publicKey, stamp: proved.stamp, tier: 1n })).toBe(true)
  expect(await verifyPerson({ proof: proved.proof, issuer: note.issuer, label: 'tutoring/buyer', profile: main.publicKey, stamp: proved.stamp, tier: 1n })).toBe(false)

  const tx = VersionedTransaction.deserialize(proved.transaction)
  expect(tx.message.header.numRequiredSignatures).toBe(2)
  expect(tx.message.staticAccountKeys[0]!.toBase58()).toBe(payer)
  tx.sign([Keypair.fromSeed(main.privateKey)])
  const at = tx.message.staticAccountKeys.findIndex((k) => k.toBase58() === main.address)
  expect(tx.signatures[at]!.some((b) => b !== 0)).toBe(true)
})

test('a note for another secret is refused before anything is proved', async () => {
  const seed = newSeed()
  const issuer = throwawayIssuer()
  const { secret } = await issuerSecret(seed, issuer.name)
  const note = issuer.sign((await issuerSecret(newSeed(), issuer.name)).noteNumber)
  const request = { secret, note, label, profile: (await mainKey(seed, label)).address, payer: PublicKey.default.toBase58(), recentBlockhash: PublicKey.default.toBase58(), programId: REGISTRY_PROGRAM }
  await expect(prove(request, load)).rejects.toThrow(/not for this secret/)
  expect(secret.every((b) => b === 0)).toBe(true)
})
