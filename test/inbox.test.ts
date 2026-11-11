// Messages, against services' own host (world.ts): one person messages another's profile from theirs
// on the other side of the market, or one of their own; the new entries listed with nothing unlocked, and on a new device
// none of those already there; one unlock opens
// every inbox, each message checked against its sender's own profile entry and shown with who they
// are; a reply, paid from the profile's folder by its bytes; and what each sent, kept locked in the
// sender's own folder, showing on any device and never counting as new.

import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'

import { encodeInbox, readFolder } from '@foundationforest/folders'
import { inboxEntry, isLocked, lockCount } from '@foundationforest/folders/locked'
import { mainKey, newAccessKey } from '@foundationforest/keys'

import { inboxPayment } from '../services/host/client/client.ts'
import * as device from '../src/device.ts'
import type { Profile } from '../src/device.ts'
import { newMessages, openAll, send } from '../src/flows/inbox.ts'
import { walletKey } from '../src/flows/profiles.ts'
import { leaveAll } from '../src/services/host.ts'
import { Said } from '../src/words.ts'
import { type World, checkHere, freshDevice, verifiedWith, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

/** How many new inbox entries `list`'s inboxes hold, as the device keeps where each was left off. */
const newCount = async (host: string, list: Profile[]) => Object.values(await newMessages(host, list)).flat().length

const ASK = 'Is Tuesday at six free?'
const YES = 'Tuesday at six, yes.'

test('a message and its reply: counted with nothing unlocked, opened in one unlock, from whom; what each sent shows on any device, never as new', async () => {
  const tutor = await verifiedWith(w, 'tutoring/tutor')
  const student = await verifiedWith(w, 'tutoring/student')
  const [t, s] = [tutor.profiles[0]!, student.profiles[0]!]

  const [fromBefore, toBefore] = [await w.balance(s.address), await w.balance(t.address)]
  const asked = await send(w, student.seed, s.label, t.address, ASK)
  expect(asked).toMatchObject({ text: ASK, mine: true })
  expect(asked.id).toMatch(/^sent\/[0-9a-f]{32}$/)
  expect(await w.balance(s.address), "paid from the sender's folder").toBeLessThan(fromBefore)
  expect(await w.balance(t.address), "and nothing from the recipient's").toBe(toBefore)

  expect(await newCount(w.host, [t]), 'one new, listed with nothing unlocked: the profile was made on this device').toBe(1)
  const opened = await openAll(w, tutor.seed, [t], checkHere)
  device.saveCursors(opened.cursors)
  expect(opened.threads).toHaveLength(1)
  const [thread] = opened.threads
  expect([thread!.mine, thread!.them]).toEqual([t.address, s.address])
  expect(thread!.who, "the sender's market and role, and a badge for each check whose verification checks, the face check's").toEqual({ market: 'tutoring', role: 'student', checks: ['face'] })
  expect(thread!.messages.map((m) => [m.text, m.mine])).toEqual([[ASK, false]])
  expect(await newCount(w.host, [t]), 'none new once opened').toBe(0)

  await send(w, tutor.seed, t.label, s.address, YES)
  expect(await newCount(w.host, [s]), "the reply is new to the student; what they sent is in no inbox").toBe(1)
  const theirs = await openAll(w, student.seed, [s], checkHere)
  expect(theirs.threads[0]!.messages.map((m) => [m.text, m.mine]), 'what they sent, then the reply').toEqual([
    [ASK, true],
    [YES, false],
  ])
  expect(theirs.threads[0]!.who).toEqual({ market: 'tutoring', role: 'tutor', checks: ['face'] })

  freshDevice()
  expect(await newCount(w.host, [s]), 'on a new device, nothing already there is new').toBe(0)
  expect(device.cursors()[s.address], 'and the device marks where the inbox is now').toBeGreaterThan(0)
  await send(w, tutor.seed, t.label, s.address, 'See you then.')
  expect(await newCount(w.host, [s]), 'what comes after is').toBe(1)
  const elsewhere = await openAll(w, tutor.seed, [t], checkHere)
  expect(elsewhere.threads[0]!.messages.map((m) => [m.text, m.mine]), "on another device, the tutor's own reply too").toEqual([
    [ASK, false],
    [YES, true],
    ['See you then.', true],
  ])
  device.saveCursors(opened.cursors)
  expect(await newCount(w.host, [t]), 'and their own replies never count as new').toBe(0)

  const copy = [...(await readFolder([w.host], t.address, Date.now())).current].find(([path]) => path.startsWith('sent/'))![1].entry
  expect(isLocked(copy.body), 'the copy is locked').toBe(true)
  expect(lockCount(copy.body as { private: string }), 'to the main key alone, with no access key that reads').toBe(1)
  expect(JSON.stringify(copy.body).includes(YES)).toBe(false)
  expect(JSON.stringify(copy.body).includes(s.address)).toBe(false)
})

test("one of the person's profiles to another of theirs: it arrives, counted with nothing unlocked, and shows in both threads in one unlock", async () => {
  const me = await verifiedWith(w, 'tutoring/student', 'tutoring/tutor')
  const [s, t] = me.profiles as [Profile, Profile]
  await send(w, me.seed, s.label, t.address, ASK)
  expect(await newMessages(w.host, [s, t]), "new to the tutor; what the student sent is in no inbox").toEqual({ [s.address]: [], [t.address]: [expect.any(String)] })
  const { threads } = await openAll(w, me.seed, [s, t], checkHere)
  const tutors = threads.find((x) => x.mine === t.address)!
  expect([tutors.them, tutors.who, tutors.messages.map((m) => [m.text, m.mine])], "the tutor's: from the student, verified").toEqual([s.address, { market: 'tutoring', role: 'student', checks: ['face'] }, [[ASK, false]]])
  const students = threads.find((x) => x.mine === s.address)!
  expect([students.them, students.messages.map((m) => [m.text, m.mine])], "the student's: what it sent").toEqual([t.address, [[ASK, true]]])
})

test("a message that does not count is not shown: signed by a key its sender's profile entry does not list", async () => {
  const tutor = await verifiedWith(w, 'tutoring/tutor')
  const student = await verifiedWith(w, 'tutoring/student')
  const [t, s] = [tutor.profiles[0]!, student.profiles[0]!]
  const body = (await readFolder([w.host], t.address, Date.now())).current.get('profile')!.entry.body!
  const stranger = await newAccessKey()
  const forged = await inboxEntry({ profile: s.address, key: stranger }, t.address, { text: 'Pay me first.' }, Date.now(), body, w.host)
  await leaveAll(w.host, [forged], inboxPayment(await mainKey(student.seed, s.label)))
  expect(await newCount(w.host, [t]), 'listed, as anyone lists it').toBe(1)
  expect((await openAll(w, tutor.seed, [t], checkHere)).threads, 'but not shown').toEqual([])
  expect(encodeInbox(forged).length).toBeGreaterThan(0)
})

test('to a folder that takes no messages, or to no profile: one line', async () => {
  const student = await verifiedWith(w, 'tutoring/student')
  const s = student.profiles[0]!
  const wallet = (await walletKey(student.seed)).address
  const line = async (to: string) => {
    const err = await send(w, student.seed, s.label, to, ASK).catch((e: unknown) => e)
    return [(err as Said).message, (err as Said).red]
  }
  expect(await line(wallet), 'the Profiles folder has no open key').toEqual(['This profile takes no messages.', false])
  expect(await line((await mainKey(student.seed, 'tutoring/tutor')).address)).toEqual(['No profile is at this address.', true])
})

test('a message refused for its price: one more credit from the wallet, and sent', async () => {
  // Priced so the credit a new profile gets pays its profile entry and not much more.
  const pricey = await world({ entryPerKb: '0.2' })
  try {
    const tutor = await verifiedWith(pricey, 'tutoring/tutor')
    const student = await verifiedWith(pricey, 'tutoring/student')
    const [t, s] = [tutor.profiles[0]!, student.profiles[0]!]
    const wallet = (await walletKey(student.seed)).address
    const before = await pricey.balance(wallet)
    await send(pricey, student.seed, s.label, t.address, 'Hello. '.repeat(100))
    expect(await pricey.balance(wallet), 'the wallet topped the profile up').toBeLessThan(before - 0.9)
    expect(await newCount(pricey.host, [t])).toBe(1)
  } finally {
    await pricey.close()
  }
})
