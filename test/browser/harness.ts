// The app's modules on a page, for test/browser/run.ts to drive. Not part of the app.

import { Keypair, VersionedTransaction } from '@solana/web3.js'

import { inboxKey, issuerSecret, mainKey } from '../../standard/keys/src/index.ts'
import { hostsRecord, ownerRecord } from '../../standard/records/src/index.ts'
import { noteFromJson, rowAddress } from '../../standard/registry/client/src/index.ts'
import { proveInWorker } from '../../src/proof/worker.ts'
import { beginSetup, withSeed } from '../../src/seed/seed.ts'
import { publishRecords, pullInbox, readOwn } from '../../src/services/host.ts'
import { note, readIssuer, session } from '../../src/services/issuer.ts'
import { REGISTRY_PROGRAM } from '../../src/settings.ts'

/** Runs `fn` and the longest the page's thread went without running a 10 ms timer meanwhile. */
async function longestStall<T>(fn: () => Promise<T>): Promise<{ result: T; stallMs: number; ms: number }> {
  let last = performance.now()
  let stallMs = 0
  const timer = setInterval(() => {
    const now = performance.now()
    stallMs = Math.max(stallMs, now - last)
    last = now
  }, 10)
  const started = performance.now()
  try {
    const result = await fn()
    return { result, stallMs, ms: performance.now() - started }
  } finally {
    clearInterval(timer)
  }
}

const forest = {
  beginSetup,
  withSeed,
  mainKey,
  inboxKey,
  issuerSecret,
  hostsRecord,
  ownerRecord,
  publishRecords,
  readOwn,
  pullInbox,
  readIssuer,
  session,
  note,
  noteFromJson,
  rowAddress,
  proveInWorker,
  REGISTRY_PROGRAM,
  Keypair,
  VersionedTransaction,
  longestStall,
}

;(globalThis as unknown as { forest: typeof forest }).forest = forest
export type Forest = typeof forest
