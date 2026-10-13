// A host, as the app talks to it: records signed on the device, published to every host the profile
// names and read back; the inbox, pulled with a pull the main key signs and opened with the inbox key;
// and the host's credits, spent into a folder's balance. Ported from services e2e (publishCard,
// inbox, fundFolder). The records library does the work; this only gathers what the app needs.

import { inboxKey, type MainKey } from '../../standard/keys/src/index.ts'
import { type PublishOutcome, type SignedMessage, type SignedRecord, type View, deliver, publish, pull, pullRequest, readProfile } from '../../standard/records/src/index.ts'
import { openMessage } from '../../standard/records/src/private.ts'
import { type Credit, creditList } from './credits.ts'
import { getJson, postJson } from './http.ts'

/** A host refused a record: which host, and its codes. */
export class Refused extends Error {
  readonly outcomes: PublishOutcome[]
  constructor(outcomes: PublishOutcome[]) {
    const codes = outcomes.flatMap((o) => (o.error ? [`${o.host}: ${o.error}`] : o.results.filter((r) => !r.ok).map((r) => `${o.host}: ${r.error}`)))
    super(`refused, ${codes.join(', ')}`)
    this.outcomes = outcomes
  }
}

/** Records to every host the profile names, the hosts and permissions records first (the library orders them). Throws if any host refused any. */
export async function publishRecords(hosts: string[], records: SignedRecord[]): Promise<PublishOutcome[]> {
  const outcomes = await publish(hosts, records)
  if (outcomes.some((o) => o.error || o.results.some((r) => !r.ok))) throw new Refused(outcomes)
  return outcomes
}

/** Messages to every host the recipient names. Throws unless some host took each, or had it already. */
export async function deliverMessages(hosts: string[], messages: SignedMessage[]): Promise<PublishOutcome[]> {
  const outcomes = await deliver(hosts, messages)
  const taken = (i: number) => outcomes.some((o) => o.results[i]?.ok || o.results[i]?.error === 'duplicate')
  if (messages.some((_, i) => !taken(i))) throw new Refused(outcomes)
  return outcomes
}

/**
 * One of the person's own profiles, read by POST, so its address stays out of URLs and logs. Every
 * host must answer: what the app writes next is built on this view, and a host left out may hold a
 * newer permissions record or card than the others.
 */
export async function readOwn(hosts: string[], address: string, now = Date.now()): Promise<View> {
  const view = await readProfile(hosts, address, now, { post: true })
  if (view.failed.length) throw new Error(`${view.failed.map((f) => new URL(f.host).host).join(', ')} did not answer.`)
  return view
}

/** What arrived in the profile's inbox at `host` after the cursor `after`, each message opened with its inbox key. */
export async function pullInbox(host: string, main: MainKey, after = 0, now = Date.now()) {
  const page = await pull(host, pullRequest(main, after, now))
  const { identity } = await inboxKey(main.privateKey)
  const messages = await Promise.all(page.messages.map((m) => openMessage(m.message, identity)))
  return { cursor: page.cursor, messages }
}

/** Host credits into a folder's balance, up to 100 a request, as the host takes them; what the folder then holds. */
export async function spend(host: string, folder: string, credits: Credit[]): Promise<number> {
  let held = 0
  for (let i = 0; i < credits.length; i += 100) {
    const body = await postJson(`${host}/credits/spend`, { folder, credits: creditList(credits.slice(i, i + 100)) })
    held = body.credits
  }
  return held
}

/** The folder's balance at the host. */
export async function balance(host: string, folder: string): Promise<number> {
  return (await getJson(`${host}/credits/balance/${folder}`)).credits
}
