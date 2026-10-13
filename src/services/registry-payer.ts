// The registry payer, as the app talks to it: the key it pays as, which a row's transaction names as
// payer, and a row sent with one of its credits. Ported from services e2e (register,
// throughRegistryPayer). The person pays no SOL and no dollar: one credit, spent once the row lands.

import { base64 } from '@scure/base'

import { type Credit, authorization } from './credits.ts'
import { postJson } from './http.ts'

/** The registry payer's key, by Kora's `getPayerSigner`, which it answers at its root. */
export async function payerOf(origin: string): Promise<string> {
  const body = await postJson(origin, { jsonrpc: '2.0', id: 1, method: 'getPayerSigner', params: {} })
  if (typeof body?.result?.signer_address !== 'string') throw new Error(`${origin} names no payer`)
  return body.result.signer_address
}

/** A row's `register` transaction, signed by the main key, sent with one credit. The answer is its signature. */
export async function register(origin: string, transaction: Uint8Array, credit: Credit): Promise<string> {
  const body = await postJson(`${origin}/register`, { transaction: base64.encode(transaction) }, { authorization: authorization(credit) })
  if (typeof body?.signature !== 'string') throw new Error('the registry payer gave no signature')
  return body.signature
}
