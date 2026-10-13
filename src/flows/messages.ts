// The inbox, as the app reads and writes it (the standard's records README, Inbox). Read: every page
// of the profile's inbox on each of its hosts, pulled with a pull its main key signs, each message
// opened with its inbox key; a message on two hosts once. Sent: sealed to the other card's inbox key
// and its readers, signed by the main key, delivered to the other's hosts, when the app can reach
// one of them; and a copy, `{ text, to }`, to the profile's own inbox, which a message to itself
// reaches whatever its rules, so a thread survives a new device. Each is paid for from the
// profile's folder there, topped up from the vault when a host says it holds too little. Requests: a message the profile sent itself, by its main key or by a
// message key its permissions record lists now, asking for one of the standard's kinds with
// parameters that fit; the app shows every field of what it would sign, and signs that with the
// main key only when the person approves. Grants: a message whose body hands this profile an access
// key; the app keeps it in the vault (vault.ts, keepGrants) and does nothing else with it yet.

import { type MainKey, inboxKey, mainKey } from '../../standard/keys/src/index.ts'
import { type Body, type Grant, type View, checkGrant, liveContent, pull, pullRequest, publicKeyFromAddress, readProfile } from '../../standard/records/src/index.ts'
import { DOLLAR, localTime, titleOf } from '../cards.ts'
import { message, openMessage } from '../../standard/records/src/private.ts'
import type { LocalProfile } from '../local.ts'
import { deliverMessages, readOwn } from '../services/host.ts'
import { settings } from '../settings.ts'
import { paying } from '../vault.ts'
import { ID, offerFits, reviewFits, writeOwn } from './records.ts'

export type Opened = { id: string; from: string; to: string; time: number; key?: string; body: Body }

export type Inbox = {
  messages: Opened[]
  /** Where each host's pages ended: the next pull starts after it. */
  cursors: Record<string, number>
  /** The message keys the profile's permissions record lists now. */
  listed: string[]
  /** The profile's own records now, body by path, for what a request would sign over them. */
  own: Record<string, Body>
}

/** Every page of the inbox after `after`, on each host, opened. A host that fails leaves what the others hold; none answering throws. */
async function pullAll(main: MainKey, hosts: string[], after: Record<string, number>): Promise<Pick<Inbox, 'messages' | 'cursors'>> {
  const { identity } = await inboxKey(main.privateKey)
  const found = new Map<string, Opened>()
  const cursors: Record<string, number> = {}
  let failed: unknown
  for (const host of hosts) {
    try {
      for (let cursor = after[host] ?? 0; ; ) {
        const page = await pull(host, pullRequest(main, cursor, Date.now()))
        for (const { message: m, id } of page.messages) {
          if (found.has(id)) continue
          const opened = await openMessage(m, identity).catch(() => null)
          if (opened) found.set(id, opened)
        }
        cursors[host] = Math.max(cursor, page.cursor)
        if (!page.messages.length || page.cursor <= cursor) break
        cursor = page.cursor
      }
    } catch (err) {
      failed ??= err
    }
  }
  if (!Object.keys(cursors).length) throw failed
  return { messages: [...found.values()].sort((a, b) => a.time - b.time), cursors }
}

/** The profile's inbox after `after`, opened; the message keys it lists now, and its own records. */
export async function openInbox(seed: Uint8Array, p: LocalProfile, after: Record<string, number> = {}): Promise<Inbox> {
  const main = await mainKey(seed, p.label)
  const view = await readOwn(p.hosts, p.address)
  const pulled = await pullAll(main, view.hosts.length ? view.hosts : p.hosts, after)
  const own = [...liveContent(view)].map(([path, c]) => [path, c.record.body as Body])
  return { ...pulled, listed: view.access.filter((e) => e.scope === 'message').map((e) => e.key), own: Object.fromEntries(own) }
}

/** An offer's title, from the profile's own records; its id when it has none there. */
export const offerTitle = (inbox: Inbox, id: string) => titleOf(inbox.own[`offer/${id}`]?.description) || id

/** The hosts the app knows: the person's own, and the host in its settings. Another profile's hosts record there names the rest. */
export const knownHosts = (host: string, profiles: LocalProfile[]) => [...new Set([host, ...profiles.flatMap((p) => p.hosts)])]

/** Another profile's folder, read by POST from the hosts the app knows, and those its hosts record names. */
export const folderOf = (address: string, known: string[]): Promise<View> => readProfile(known, address, Date.now(), { post: true })

/** `body` to `to`, from the profile, with its main key; and a copy, naming `to`, to its own inbox. */
export async function send(seed: Uint8Array, p: LocalProfile, to: string, body: Body, known: string[]): Promise<void> {
  const main = await mainKey(seed, p.label)
  const [theirs, mine] = await Promise.all([folderOf(to, known), readOwn(p.hosts, p.address)])
  const card = theirs.current.get('profile')?.record.body
  // The app reaches the hosts it knows, and its CSP lets it reach no other.
  if (theirs.hosts.length && !theirs.hosts.some((h) => known.includes(h))) throw new Error("That host isn't reachable from this app yet.")
  if (!card || !theirs.hosts.length) throw new Error(`No card for ${to}.`)
  const now = Date.now()
  const sent = await message(main, to, body, now, card)
  await paying(seed, settings().host, p.address, () => deliverMessages(theirs.hosts, [sent]))
  const own = mine.current.get('profile')?.record.body
  if (to === p.address || !own) return
  const copy = await message(main, p.address, { ...body, to }, now, own)
  await paying(seed, settings().host, p.address, () => deliverMessages(mine.hosts.length ? mine.hosts : p.hosts, [copy]))
}

/** Who a message is with: who sent it; for one the profile sent itself, whom it is a copy for, else the access key that signed it, else the profile itself. */
export function withOf(m: Opened, me: string): string {
  if (m.from !== me) return m.from
  if (!('request' in m.body) && typeof m.body.to === 'string' && publicKeyFromAddress(m.body.to)) return m.body.to
  return m.key ?? me
}

export type Thread = { with: string; messages: Opened[]; last: number }

/** The messages by whom they are with, each thread oldest first, the threads newest first. A grant is a key, never shown. */
export function threadsOf(messages: Opened[], me: string): Thread[] {
  const by = new Map<string, Opened[]>()
  for (const m of [...messages].sort((a, b) => a.time - b.time)) {
    if ('grant' in m.body) continue
    const w = withOf(m, me)
    by.set(w, [...(by.get(w) ?? []), m])
  }
  return [...by].map(([w, ms]) => ({ with: w, messages: ms, last: ms.at(-1)!.time })).sort((a, b) => b.last - a.last)
}

/** A message's words: its text, or what it holds in its place. */
export function textOf(body: Body): string {
  if (typeof body.text === 'string') return body.text
  const { to: _, ...rest } = body
  return JSON.stringify(rest)
}

// ---------------------------------------------------------------------------------------------
// Requests

type Param = { name: string; type: 'string' | 'object' | 'integer'; required?: boolean }

/** The standard's request kinds and their parameters, as services' mcp/ asks for them. */
const KINDS: Record<string, Param[]> = {
  'post-offer': [{ name: 'offer', type: 'object', required: true }, { name: 'id', type: 'string' }],
  'update-offer': [{ name: 'id', type: 'string', required: true }, { name: 'offer', type: 'object', required: true }],
  'remove-offer': [{ name: 'id', type: 'string', required: true }],
  'post-review': [{ name: 'review', type: 'object', required: true }, { name: 'id', type: 'string' }],
  send: [{ name: 'to', type: 'string', required: true }, { name: 'text', type: 'string' }, { name: 'body', type: 'object' }],
  private: [{ name: 'path', type: 'string' }],
  inbox: [{ name: 'after', type: 'object' }],
  pay: [{ name: 'offer', type: 'string', required: true }, { name: 'units', type: 'integer' }, { name: 'note', type: 'string' }],
}

/** The kinds the app does on approval. The rest (a private record, the inbox, a payment) it shows, and the person can only decline. */
export const DOES = new Set(['post-offer', 'update-offer', 'remove-offer', 'post-review', 'send'])

export type Request = { id: string; kind: string; params: Record<string, any> }

const fits = (p: Param, v: unknown) =>
  p.type === 'string' ? typeof v === 'string' : p.type === 'integer' ? Number.isSafeInteger(v) && (v as number) >= 1 : v !== null && typeof v === 'object' && !Array.isArray(v)

/**
 * The request a message makes, or null when it is a plain message: sent to the profile by itself,
 * with its main key or a message key it lists now; a standard kind; its parameters, each there
 * when needed, of its type, and nothing else; an id that is a path's segment, an offer or a review
 * that fits its shape, a recipient that is an address with text or a body, one of the two.
 */
export function requestOf(m: Opened, me: string, listed: string[]): Request | null {
  if (m.from !== me || m.to !== me || (m.key !== undefined && !listed.includes(m.key))) return null
  const { request: kind, ...params } = m.body
  const takes = typeof kind === 'string' ? KINDS[kind] : undefined
  if (!takes) return null
  if (Object.keys(params).some((k) => !takes.some((p) => p.name === k))) return null
  if (takes.some((p) => (params[p.name] === undefined ? p.required : !fits(p, params[p.name])))) return null
  if (typeof params.id === 'string' && !ID.test(params.id)) return null
  if ((kind === 'post-offer' || kind === 'update-offer') && !offerFits(params.offer)) return null
  if (kind === 'post-review' && !reviewFits(params.review)) return null
  if (kind === 'send' && (!publicKeyFromAddress(params.to) || (params.text === undefined) === (params.body === undefined) || (params.body !== undefined && 'grant' in (params.body as Body)))) return null
  return { id: m.id, kind: kind as string, params }
}

/** What approving a request signs with the main key: a record, its path and body (null removes it); or a message, to whom and its body. */
export type Signed = { path: string; body: Body | null } | { to: string; body: Body }

/**
 * What approving `r` would sign, over the profile's own records now (`own`, body by path), at
 * `now`; null for a kind the app does not do. A new offer or review with no id of its own takes the
 * request's, so approving it twice writes one record, not two. One with no `createdAt` keeps the
 * record's, or is dated `now`.
 */
export function toSign(r: Request, own: Record<string, Body | null | undefined>, now = Date.now()): Signed | null {
  const id = (r.params.id as string | undefined) ?? r.id.slice(0, 16)
  const dated = (path: string, body: Body): Signed => {
    const before = own[path]?.createdAt
    return { path, body: { ...body, createdAt: typeof body.createdAt === 'string' ? body.createdAt : typeof before === 'string' ? before : new Date(now).toISOString() } }
  }
  switch (r.kind) {
    case 'post-offer':
    case 'update-offer':
      return dated(`offer/${id}`, r.params.offer)
    case 'remove-offer':
      return { path: `offer/${id}`, body: null }
    case 'post-review':
      return dated(`review/${id}`, r.params.review)
    case 'send':
      return { to: r.params.to, body: r.params.text !== undefined ? { text: r.params.text } : r.params.body }
    default:
      return null
  }
}

/** A time as a record writes it: RFC 3339, in UTC or with its offset. */
const TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

/** A field's value as the person reads it: the index's dollar by its name, a time in their own clock, other text as it is. */
function valueText(name: string, v: unknown): string {
  if (typeof v !== 'string') return JSON.stringify(v)
  if ((name === 'mint' || name.endsWith('.mint')) && v === DOLLAR) return 'devnet dollar'
  if (TIME.test(v) && !Number.isNaN(Date.parse(v))) return localTime(Date.parse(v))
  return v
}

/** Every field of what would be signed, as the person reads it: the path or the recipient, then the body's fields, nested ones by their dotted names. */
export function fieldsOf(signed: Signed): [name: string, value: string][] {
  const out: [string, string][] = 'to' in signed ? [['to', signed.to]] : [['path', signed.path]]
  const add = (name: string, v: unknown) => {
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length) for (const [k, x] of Object.entries(v)) add(name ? `${name}.${k}` : k, x)
    else out.push([name, valueText(name, v)])
  }
  if (signed.body === null) out.push(['body', 'none: the record is removed'])
  else add('', signed.body)
  return out
}

/**
 * The request done with the main key: `shown`, what its card showed, signed as it is; with none,
 * what it asks over the record there now. Sent, a message is copied to the profile's own inbox.
 */
export async function approve(seed: Uint8Array, p: LocalProfile, r: Request, known: string[], shown?: Signed): Promise<void> {
  const signed = shown ?? toSign(r, {})
  if (!signed) throw new Error(`${r.kind}: not in this app yet.`)
  if ('to' in signed) return send(seed, p, signed.to, signed.body, known)
  return writeOwn(seed, p, signed.path, (before) => (shown ? signed.body : toSign(r, { [signed.path]: before })!.body))
}

// ---------------------------------------------------------------------------------------------
// Grants

/** The grants among the messages: each body `{ grant }` of a grant's shape, handed over by the profile that sent it. */
export function grantsOf(messages: Opened[]): Grant[] {
  return messages.flatMap((m) => {
    const g: unknown = m.body.grant
    try {
      checkGrant(g)
    } catch {
      return []
    }
    return g.from === m.from ? [g] : []
  })
}
