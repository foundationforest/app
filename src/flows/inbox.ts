// The person's messages: one inbox for all their profiles.
//
// An inbox's list needs nothing unlocked: anyone lists any inbox, and only the envelopes protect it
// (folders/README.md, The inbox). So the app lists what each profile's inbox holds after where the
// person left off there (device.ts), with no seed: those are new. A profile the device has no mark
// for yet is marked at the end of its inbox, so nothing old shows as new on a new device.
//
// Opening takes the seed, once for every profile: each profile's main key opens its inbox entries,
// each message checked as the standard says (openInbox: to this folder, its signature), then
// against the sender's own profile entry (senderCounts), read from the host. That entry also says
// who the sender is: their market and role, and their strongest check whose verification, from this
// app's verifier, checks: the ID check's, else the face check's. The message's own `host` names
// where their folder is; the app reaches its one host only (the CSP), so it reads them there. A
// message whose body has no text, or that does not count, is not shown.
//
// Sending signs with the profile's main key, locks to the recipient's keys (inboxEntry), and leaves
// the message with their host, paid from the sending profile's folder by its bytes (the credits
// client's inboxPayment), topped up from the wallet when the host refuses for price (paid.ts). Then
// a copy of what was sent goes in the sending profile's own folder, at sent/<id>, a random id,
// locked to the keys that read the folder (lockKeysOf): every device that opens the profile shows
// it, and since it is no inbox entry, it never counts as new. Its cost: anyone sees that the profile
// wrote a locked entry at that moment, never what or to whom.

import { type Body, type VerificationCheck, entry, liveContent, lockKeysOf, nextTime, proofsOf, senderCounts, verificationCheck } from '@foundationforest/folders'
import { inboxEntry, isLocked, lock, openInbox, openLocked } from '@foundationforest/folders/locked'
import { mainKey, openingHalf } from '@foundationforest/keys'

import { inboxPayment } from '../../services/host/client/client.ts'
import type { Services } from '../config.ts'
import { type Profile, cursors, markUsed, saveCursors } from '../device.ts'
import { leaveAll, readAllInbox, readView, writeAll } from '../services/host.ts'
import { type Check, about } from '../services/verifier.ts'
import { Said, hostSays } from '../words.ts'
import { paid } from './paid.ts'
import { randomId, walletKey } from './profiles.ts'

/** One message in a thread: from the other side, or one of the person's own (`mine`), with its text. */
export type Message = { id: string; time: number; text: string; mine: boolean }

/** Who a profile is, as its profile entry says: its market and role, and its strongest check whose verification from this app's verifier checks, or null. Null when no host here holds its profile entry. */
export type Who = { market: string; role: string; check: Check | null } | null

/** The messages between one of the person's profiles (`mine`, its address) and another (`them`), oldest first. */
export type Thread = { mine: string; them: string; who: Who; messages: Message[] }

/**
 * The inbox entries each profile's inbox holds after where the person left off there, by the
 * profile's address: their ids, nothing unlocked. A profile with no mark yet is marked at the end of
 * its inbox, and has none.
 */
export async function newMessages(host: string, list: Profile[]): Promise<Record<string, string[]>> {
  const kept = cursors()
  const out: Record<string, string[]> = {}
  const marked: Record<string, number> = {}
  await Promise.all(
    list.map(async (p) => {
      const known = p.address in kept
      const { entries, cursor } = await readAllInbox(host, p.address, kept[p.address] ?? 0)
      out[p.address] = known ? entries.map((e) => e.id) : []
      if (!known) marked[p.address] = cursor
    }),
  )
  if (Object.keys(marked).length) saveCursors(marked)
  return out
}

/** A profile's current profile entry at the host, or null. */
async function profileEntry(host: string, address: string): Promise<Body | null> {
  return (await readView(host, address)).current.get('profile')?.entry.body ?? null
}

/** Whether one of `checks` checks, as the standard's checkVerification checks it: in the page, the proofs' worker (proof/prove.ts), since snarkjs there would start workers the CSP refuses. */
export type CheckProofs = (checks: VerificationCheck[]) => Promise<boolean>

/** The strongest check whose verification in `body`, from this app's verifier, checks for `address`: the ID key's, else the face key's; null with neither. */
async function strongestOf(s: Services, address: string, body: Body, check: CheckProofs): Promise<Check | null> {
  const a = await about(s.verifier)
  for (const [c, key] of [['id', a.id.key], ['face', a.face.key]] as const) {
    const ours = proofsOf(body)
      .filter((p) => p.circuit === 'verification' && p.verifier === key)
      .map((p) => verificationCheck(p, address))
      .filter((v): v is VerificationCheck => v !== null)
    if (ours.length > 0 && (await check(ours).catch(() => false))) return c
  }
  return null
}

/** Who the profile at `address` is, from its profile entry. */
export async function whoIs(s: Services, address: string, check: CheckProofs): Promise<{ who: Who; body: Body | null }> {
  const body = await profileEntry(s.host, address).catch(() => null)
  if (!body || typeof body.market !== 'string' || typeof body.role !== 'string') return { who: null, body }
  return { who: { market: body.market, role: body.role, check: await strongestOf(s, address, body, check) }, body }
}

const textOf = (body: unknown): string | null => {
  const text = (body as { text?: unknown } | null)?.text
  return typeof text === 'string' && text.length > 0 ? text : null
}

/**
 * Every profile's inbox opened with its main key, and its sent copies, into threads, newest first;
 * with the cursor after the last inbox entry each profile's inbox holds now, where the person has
 * left off once they see them.
 */
export async function openAll(s: Services, seed: Uint8Array, list: Profile[], check: CheckProofs): Promise<{ threads: Thread[]; cursors: Record<string, number> }> {
  const threads = new Map<string, Thread>()
  const senders = new Map<string, Promise<{ who: Who; body: Body | null }>>()
  const sender = (address: string) => {
    let got = senders.get(address)
    if (!got) senders.set(address, (got = whoIs(s, address, check)))
    return got
  }
  const add = async (mine: string, them: string, message: Message) => {
    const key = `${mine} ${them}`
    let thread = threads.get(key)
    if (!thread) threads.set(key, (thread = { mine, them, who: (await sender(them)).who, messages: [] }))
    if (!thread.messages.some((m) => m.id === message.id)) thread.messages.push(message)
  }
  const at: Record<string, number> = {}
  for (const p of list) {
    const main = await mainKey(seed, p.label)
    const { identity } = await openingHalf(main.secret)
    const { entries, cursor } = await readAllInbox(s.host, p.address)
    at[p.address] = cursor
    for (const e of entries) {
      const opened = await openInbox(e.entry, identity).catch(() => null)
      if (!opened) continue
      const { message } = opened
      const text = textOf(message.body)
      if (!text || !senderCounts(message, (await sender(message.from)).body)) continue
      await add(p.address, message.from, { id: e.id, time: message.time, text, mine: false })
    }
    for (const [path, { entry: e }] of liveContent(await readView(s.host, p.address))) {
      if (!path.startsWith('sent/') || !isLocked(e.body)) continue
      const copy = await openLocked(e.body, identity).catch(() => null)
      const text = textOf(copy?.body)
      if (!copy || typeof copy.to !== 'string' || typeof copy.time !== 'number' || !text) continue
      await add(p.address, copy.to, { id: path, time: copy.time, text, mine: true })
    }
  }
  const out = [...threads.values()]
  for (const t of out) t.messages.sort((a, b) => a.time - b.time)
  out.sort((a, b) => b.messages.at(-1)!.time - a.messages.at(-1)!.time)
  return { threads: out, cursors: at }
}

/**
 * `text`, from the person's profile `label` to the profile at `to`, left with its host and paid from
 * the profile's folder; then its copy in that folder. The profile written from is used (device.ts).
 * Gives back the message as its thread shows it.
 */
export async function send(s: Services, seed: Uint8Array, label: string, to: string, text: string): Promise<Message> {
  const theirs = await profileEntry(s.host, to)
  if (!theirs) throw new Said('No profile is at this address.', true)
  if (!(theirs.hosts as unknown[] | undefined)?.includes(s.host)) throw new Said("This profile is on another host, which Forest can't reach yet.")
  if (typeof theirs.openKey !== 'string') throw hostSays('no_inbox')
  const [main, wallet] = await Promise.all([mainKey(seed, label), walletKey(seed)])
  const time = Date.now()
  const left = await inboxEntry(main, to, { text }, time, theirs, s.host)
  await paid(s.host, main.address, wallet, () => leaveAll(s.host, [left], inboxPayment(main)))
  const view = await readView(s.host, main.address)
  const path = `sent/${randomId()}`
  const copy = await lock({ to, time, body: { text } }, lockKeysOf(view.current.get('profile')?.entry.body))
  await paid(s.host, main.address, wallet, () => writeAll(s.host, [entry(main, path, copy, nextTime(time, view, path))]))
  markUsed(main.address)
  return { id: path, time, text, mine: true }
}
