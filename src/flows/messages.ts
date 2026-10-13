// The inbox, as the app reads and writes it (the standard's records README, Inbox). Read: every page
// of the profile's inbox on each of its hosts, pulled with a pull its main key signs, each message
// opened with its inbox key; a message on two hosts once. Sent: sealed to the other card's inbox key
// and its readers, signed by the main key, delivered to the other's hosts; and a copy, `{ text, to }`,
// to the profile's own inbox, which a message to itself reaches whatever its rules, so a thread
// survives a new device. Requests: a message the profile sent itself, by its main key or by a
// message key its permissions record lists now, asking for one of the standard's kinds with
// parameters that fit; the app does it with the main key only when the person approves.

import { type MainKey, inboxKey, mainKey } from '../../standard/keys/src/index.ts'
import { type Body, type View, liveContent, pull, pullRequest, publicKeyFromAddress, readProfile } from '../../standard/records/src/index.ts'
import { titleOf } from '../cards.ts'
import { message, openMessage } from '../../standard/records/src/private.ts'
import type { LocalProfile } from '../local.ts'
import { deliverMessages, readOwn } from '../services/host.ts'
import { ID, offerFits, reviewFits, writeOwn } from './records.ts'

export type Opened = { id: string; from: string; to: string; time: number; key?: string; body: Body }

export type Inbox = {
  messages: Opened[]
  /** Where each host's pages ended: the next pull starts after it. */
  cursors: Record<string, number>
  /** The message keys the profile's permissions record lists now. */
  listed: string[]
  /** The profile's offers' titles, by id, for a request that changes or removes one. */
  offers: Record<string, string>
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

/** The profile's inbox after `after`, opened; the message keys it lists now, and its offers' titles. */
export async function openInbox(seed: Uint8Array, p: LocalProfile, after: Record<string, number> = {}): Promise<Inbox> {
  const main = await mainKey(seed, p.label)
  const view = await readOwn(p.hosts, p.address)
  const pulled = await pullAll(main, view.hosts.length ? view.hosts : p.hosts, after)
  const offers = [...liveContent(view)].filter(([path]) => path.startsWith('offer/')).map(([path, c]) => [path.slice('offer/'.length), titleOf(c.record.body?.description)])
  return { ...pulled, listed: view.access.filter((e) => e.scope === 'message').map((e) => e.key), offers: Object.fromEntries(offers) }
}

/** The hosts the app knows: the person's own, and the host in its settings. Another profile's hosts record there names the rest. */
export const knownHosts = (host: string, profiles: LocalProfile[]) => [...new Set([host, ...profiles.flatMap((p) => p.hosts)])]

/** Another profile's folder, read by POST from the hosts the app knows, and those its hosts record names. */
export const folderOf = (address: string, known: string[]): Promise<View> => readProfile(known, address, Date.now(), { post: true })

/** `body` to `to`, from the profile, with its main key; and a copy, naming `to`, to its own inbox. */
export async function send(seed: Uint8Array, p: LocalProfile, to: string, body: Body, known: string[]): Promise<void> {
  const main = await mainKey(seed, p.label)
  const [theirs, mine] = await Promise.all([folderOf(to, known), readOwn(p.hosts, p.address)])
  const card = theirs.current.get('profile')?.record.body
  if (!card || !theirs.hosts.length) throw new Error(`No card for ${to}.`)
  const now = Date.now()
  await deliverMessages(theirs.hosts, [await message(main, to, body, now, card)])
  const own = mine.current.get('profile')?.record.body
  if (to !== p.address && own) await deliverMessages(mine.hosts.length ? mine.hosts : p.hosts, [await message(main, p.address, { ...body, to }, now, own)])
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

/**
 * What the request asks, done with the main key. A new offer or review with no id of its own takes
 * the request's, so approving it twice writes one record, not two.
 */
export async function approve(seed: Uint8Array, p: LocalProfile, r: Request, known: string[]): Promise<void> {
  const id = (r.params.id as string | undefined) ?? r.id.slice(0, 16)
  const dated = (body: Body, before: Body | null): Body => ({ ...body, createdAt: typeof body.createdAt === 'string' ? body.createdAt : typeof before?.createdAt === 'string' ? before.createdAt : new Date().toISOString() })
  switch (r.kind) {
    case 'post-offer':
    case 'update-offer':
      return writeOwn(seed, p, `offer/${id}`, (before) => dated(r.params.offer, before))
    case 'remove-offer':
      return writeOwn(seed, p, `offer/${id}`, () => null)
    case 'post-review':
      return writeOwn(seed, p, `review/${id}`, (before) => dated(r.params.review, before))
    case 'send':
      return send(seed, p, r.params.to, r.params.text !== undefined ? { text: r.params.text } : r.params.body, known)
    default:
      throw new Error(`${r.kind}: not in this app yet.`)
  }
}
