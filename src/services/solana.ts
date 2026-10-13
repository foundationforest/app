// The one thing the app asks a Solana RPC for itself: a recent blockhash, which a transaction names.

import { postJson } from './http.ts'

export async function latestBlockhash(rpc: string): Promise<string> {
  const body = await postJson(rpc, { jsonrpc: '2.0', id: 1, method: 'getLatestBlockhash', params: [{ commitment: 'confirmed' }] })
  const blockhash = body?.result?.value?.blockhash
  if (typeof blockhash !== 'string') throw new Error(`${rpc}: no blockhash`)
  return blockhash
}
