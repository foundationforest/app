// Reading and writing folders at the host, and leaving inbox entries there, with the standard's own
// client (folders), and what a refusal means: `refused` is the host's price, which a top-up from the
// wallet pays (flows/paid.ts); anything else is said in words.ts's words.

import { type CheckedInbox, type InboxEntry, type Payment, type SignedEntry, type View, leave, readFolder, readInbox, write } from '@foundationforest/folders'

import { hostSays, Said } from '../words.ts'
import { Unreachable } from './http.ts'

/** The host took none of the entries: `code` is its first refusal's, said as words.ts says it. `refused` means the folder's balance does not cover the price. */
export class NotWritten extends Said {
  readonly code: string
  constructor(code: string) {
    const said = hostSays(code)
    super(said.message, said.red)
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

type Outcome = Awaited<ReturnType<typeof write>>[number]

/** Every line taken, else NotWritten naming the first refusal; one already there (`duplicate`, an inbox entry sent again) counts as taken. */
function taken(outcome: Outcome | undefined, lines: number): void {
  if (!outcome || outcome.error || (outcome.status !== 200 && outcome.results.length === 0)) throw new Unreachable('host')
  const refused = outcome.results.find((r) => !r.ok && r.error !== 'duplicate')
  if (refused) throw new NotWritten(refused.error ?? 'refused')
  if (outcome.results.length !== lines) throw new Unreachable('host')
}

/** A batch written, every entry taken; else NotWritten, naming the first refusal. */
export async function writeAll(host: string, entries: SignedEntry[]): Promise<void> {
  const [outcome] = await write([host], entries, { redirect: 'error' })
  taken(outcome, entries.length)
}

/** Inbox entries left at the host, each paid by `payment`; else NotWritten, naming the first refusal. */
export async function leaveAll(host: string, entries: InboxEntry[], payment: Payment): Promise<void> {
  const [outcome] = await leave([host], entries, { redirect: 'error', payment })
  taken(outcome, entries.length)
}

/** A folder's inbox at the host after `after`, every page: its entries in arrival order, and the cursor after the last. */
export async function readAllInbox(host: string, address: string, after = 0): Promise<{ entries: CheckedInbox[]; cursor: number }> {
  const entries: CheckedInbox[] = []
  let cursor = after
  try {
    for (;;) {
      const page = await readInbox(host, address, { after: cursor, redirect: 'error' })
      entries.push(...page.entries)
      if (page.cursor <= cursor) break
      cursor = page.cursor
    }
  } catch {
    throw new Unreachable('host')
  }
  return { entries, cursor }
}
