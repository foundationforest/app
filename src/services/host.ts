// Reading and writing folders at the host, with the standard's own client (folders), and what a
// refusal means: `refused` is the host's price, which a top-up from the wallet pays; anything else
// is a write the app should never have made.

import { type SignedEntry, type View, readFolder, write } from '@foundationforest/folders'

import { Unreachable } from './http.ts'

/** The host took none of the entries: `code` is its first refusal's. `refused` means the folder's balance does not cover the price. */
export class NotWritten extends Error {
  readonly code: string
  constructor(code: string, message?: string) {
    super(`The host did not take it: ${code}${message ? `, ${message}` : ''}.`)
    this.name = 'NotWritten'
    this.code = code
  }
}

/** A folder as the host serves it, viewed now. */
export async function readView(host: string, address: string): Promise<View> {
  const view = await readFolder([host], address, Date.now(), { redirect: 'error' }).catch(() => null)
  if (!view || view.failed.length) throw new Unreachable('host')
  return view
}

/** A batch written, every entry taken; else NotWritten, naming the first refusal. */
export async function writeAll(host: string, entries: SignedEntry[]): Promise<void> {
  const [outcome] = await write([host], entries, { redirect: 'error' })
  if (!outcome || outcome.error || (outcome.status !== 200 && outcome.results.length === 0)) throw new Unreachable('host')
  const refused = outcome.results.find((r) => !r.ok)
  if (refused) throw new NotWritten(refused.error ?? 'refused', refused.message)
  if (outcome.results.length !== entries.length) throw new Unreachable('host')
}
