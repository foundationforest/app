// The person proof and the row's `register` transaction, made the way the registry client makes them
// (buildRegistration), from the person's secret for one issuer and that issuer's note. It runs in a
// Web Worker (prove.worker.ts), off the page's thread; here it is plain, so a test can run it too.
// It is given the issuer secret, never the seed or a main key, and zeroes the secret when done.

import { PublicKey } from '@solana/web3.js'

import { buildRegistration, proofBytes, type SignedNote } from '../../standard/registry/client/src/index.ts'
import { type Artifact, PERSON } from './circuit.ts'

export type ProveRequest = {
  /** `issuerSecret(seed, issuer name).secret`: 32 bytes. */
  secret: Uint8Array
  note: SignedNote
  label: string
  /** The main key's address: the proof counts for it alone, and it signs the transaction. */
  profile: string
  /** The registry payer's key, or whoever pays the row's deposit. */
  payer: string
  recentBlockhash: string
  programId: string
}

export type Proved = {
  /** The unsigned `register` transaction; the main key and the payer sign it. */
  transaction: Uint8Array
  /** The row's address, and the stamp it sits at. */
  row: string
  stamp: bigint
  tier: bigint
  /** The proof's 256 bytes, as a profile record's `person` proof carries it. */
  proof: Uint8Array
  /** How long the proof took to make, in milliseconds, files fetched. */
  ms: number
}

/** A proving file's bytes, refused unless their SHA-256 is the one the pinned setup names. */
export async function fetchArtifact(artifact: Artifact, base: string): Promise<Uint8Array> {
  const res = await fetch(new URL(artifact.path, base))
  if (!res.ok) throw new Error(`${artifact.path}: ${res.status}`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  const got = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (b) => b.toString(16).padStart(2, '0')).join('')
  if (got !== artifact.sha256) throw new Error(`${artifact.path}: not the pinned setup's file`)
  return bytes
}

export async function prove(request: ProveRequest, load: (artifact: Artifact) => Promise<Uint8Array>): Promise<Proved> {
  try {
    const [wasm, zkey] = await Promise.all([load(PERSON.wasm), load(PERSON.zkey)])
    const started = performance.now()
    const r = await buildRegistration({
      secret: request.secret,
      note: request.note,
      label: request.label,
      profile: new PublicKey(request.profile),
      artifacts: { wasm, zkey },
      payer: new PublicKey(request.payer),
      recentBlockhash: request.recentBlockhash,
      programId: new PublicKey(request.programId),
    })
    const ms = performance.now() - started
    return { transaction: r.transaction.serialize(), row: r.row.toBase58(), stamp: r.stamp, tier: r.tier, proof: proofBytes(r.proof), ms }
  } finally {
    request.secret.fill(0)
  }
}
