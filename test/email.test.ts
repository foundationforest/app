// The morning email, against services' own host on loopback (world.ts), with a stand-in Resend that
// keeps what would be sent: no real email. A code is asked for with each ticked profile's signature
// and typed back; the id, the email address and the ticked profiles then live in one locked entry
// of the Profiles folder, which only the seed opens, never in a profile's folder, with a copy on the
// device; a wrong code is refused in words and spends nothing; unticking a profile and Save change
// what the host counts; a new email address takes the place of the old, which the host drops; turning
// it off deletes it at the host and the entry; a new device has the same state after the unlock that
// opens the Profiles folder; a second code inside a minute waits; an email turned off elsewhere
// shows as Off at the next Save, with no error; and the reference app, which knows no such entry,
// finds the person's profiles and stamps as before.
//
// The host answers `POST /email/<id>` with `{}` by whether it has the id: 404 `unknown`, or 400
// `bad_request` when it does and the body is not whole. `host(id)` asks that, to see what the host holds.

import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest'

import { isLocked, lockCount, openLocked } from '@foundationforest/folders/locked'
import { openingHalf } from '@foundationforest/keys'

import { App } from '../services/mcp/test/app.ts'
import * as device from '../src/device.ts'
import { EMAIL_PATH, askCode, saveProfiles, turnOff, turnOn } from '../src/flows/email.ts'
import { openProfiles, walletKey } from '../src/flows/profiles.ts'
import { Refused } from '../src/services/http.ts'
import { readView } from '../src/services/host.ts'
import { OFFERS, OTHER_OFFERS } from './labels.ts'
import { codeSentTo } from './resend.ts'
import { type World, freshDevice, verifiedWith, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

/** An email address nobody has asked a code for. */
const address = () => `ada-${crypto.randomUUID()}@example.com`

/** The `email` entry the person's Profiles folder holds now, and what it opens to with their seed. */
async function emailEntry(seed: Uint8Array) {
  const key = await walletKey(seed)
  const body = (await readView(w.host, key.address)).current.get(EMAIL_PATH)?.entry.body ?? null
  const opened = body && isLocked(body) ? await openLocked(body, (await openingHalf(key.secret)).identity) : null
  return { body, opened }
}

/** Whether the host holds the email with this id: its answer to a change with no body. */
async function host(id: string): Promise<'there' | 'gone'> {
  const res = await fetch(`${w.host}/email/${id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
  return res.status === 404 ? 'gone' : 'there'
}

/** A person with two profiles, an offer and a market's other, and the email turned on for both, as the Email page does. */
async function on(email = address()) {
  const p = await verifiedWith(w, OFFERS, OTHER_OFFERS)
  const labels = [OFFERS, OTHER_OFFERS]
  const pending = await askCode(w, p.seed, email, labels)
  await turnOn(w, p.seed, pending, codeSentTo(w.sent, email), null)
  return { p, email, labels, id: pending.id, addresses: p.profiles.map((x) => x.address) }
}

test('turning on with two profiles ticked: each signs for the email address, the host emails a code, and until it is typed nothing is on', async () => {
  const p = await verifiedWith(w, OFFERS, OTHER_OFFERS)
  const email = address()
  const pending = await askCode(w, p.seed, email, [OFFERS, OTHER_OFFERS])
  expect(pending.profiles, "the two profiles' addresses").toEqual(p.profiles.map((x) => x.address))
  expect(w.sent.at(-1)!.body.to, 'the code went to the email address').toEqual([email])
  expect(codeSentTo(w.sent, email)).toMatch(/^\d{6}$/)
  expect(await host(pending.id), 'waiting for its code, the host has it').toBe('there')
  expect((await emailEntry(p.seed)).body, 'nothing kept yet').toBeNull()
  expect(device.email()).toBeNull()
})

test('a wrong code is refused in words and spends nothing; the right one turns it on, kept in one locked entry of the Profiles folder and nowhere else', async () => {
  const p = await verifiedWith(w, OFFERS, OTHER_OFFERS)
  const email = address()
  const pending = await askCode(w, p.seed, email, [OFFERS, OTHER_OFFERS])
  const code = codeSentTo(w.sent, email)
  const wrong = code === '000000' ? '111111' : '000000'
  await expect(turnOn(w, p.seed, pending, wrong, null)).rejects.toMatchObject({ message: "That code isn't right, or it has expired. Send a new one.", code: 'code' })
  expect(pending.confirmed, 'not confirmed').toBeUndefined()
  expect((await emailEntry(p.seed)).body, 'nothing kept').toBeNull()
  expect(device.email()).toBeNull()

  await turnOn(w, p.seed, pending, code, null)
  const { body, opened } = await emailEntry(p.seed)
  expect(isLocked(body), 'locked').toBe(true)
  expect(lockCount(body as { private: string }), 'to the folder alone').toBe(1)
  const text = JSON.stringify(body)
  for (const readable of [email, pending.id, ...pending.profiles]) expect(text, 'nothing readable in it').not.toContain(readable)
  expect(opened).toEqual({ id: pending.id, email, profiles: pending.profiles })
  expect(device.email(), 'the device keeps a copy').toEqual({ id: pending.id, email, profiles: pending.profiles })
  for (const profile of p.profiles) {
    const theirs = await readView(w.host, profile.address)
    expect([...theirs.current.keys()].filter((path) => path.startsWith(EMAIL_PATH)), "nothing of it in a profile's folder").toEqual([])
  }
})

test('unticking one profile and Save: the host counts the one that is left, and the entry and the device say so', async () => {
  const t = await on()
  const now = device.email()!
  expect(await saveProfiles(w, t.p.seed, now, [OFFERS])).toBe('saved')
  expect((await emailEntry(t.p.seed)).opened).toEqual({ id: t.id, email: t.email, profiles: [t.addresses[0]] })
  expect(device.email()).toEqual({ id: t.id, email: t.email, profiles: [t.addresses[0]] })
  expect(await host(t.id), 'still on').toBe('there')
  // And ticked again.
  expect(await saveProfiles(w, t.p.seed, device.email()!, [OFFERS, OTHER_OFFERS])).toBe('saved')
  expect((await emailEntry(t.p.seed)).opened).toEqual({ id: t.id, email: t.email, profiles: t.addresses })
})

test('a new email address is turned on as the first was, with a new code; the old one goes once the new one is on, even when the new one counts fewer profiles', async () => {
  const t = await on()
  const old = device.email()!
  const other = address()
  const pending = await askCode(w, t.p.seed, other, [OFFERS])
  expect(await host(old.id), 'the old one stays until the new one is on').toBe('there')
  await turnOn(w, t.p.seed, pending, codeSentTo(w.sent, other), old)
  expect((await emailEntry(t.p.seed)).opened, 'the new id, address and profile').toEqual({ id: pending.id, email: other, profiles: [t.addresses[0]] })
  expect(device.email()).toEqual({ id: pending.id, email: other, profiles: [t.addresses[0]] })
  expect(await host(old.id), 'the old one is gone').toBe('gone')
  expect(await host(pending.id)).toBe('there')
})

test('Turn off: the host deletes it, then the entry; a new device then has none', async () => {
  const t = await on()
  await turnOff(w, t.p.seed, device.email()!)
  expect(await host(t.id), 'deleted at the host').toBe('gone')
  expect((await emailEntry(t.p.seed)).body, 'the entry deleted').toBeNull()
  expect(device.email()).toBeNull()
  freshDevice()
  device.keepEmail({ id: t.id, email: t.email, profiles: t.addresses })
  await openProfiles(t.p.seed, w.host)
  expect(device.email(), "the folder's word in place of the device's").toBeNull()
})

test('a second device: nothing before the unlock; the unlock that opens the Profiles folder brings the same state', async () => {
  const t = await on()
  freshDevice()
  expect(device.email()).toBeNull()
  await openProfiles(t.p.seed, w.host)
  expect(device.email()).toEqual({ id: t.id, email: t.email, profiles: t.addresses })
})

test('a second code to the same email address within a minute waits; one to another does not', async () => {
  const p = await verifiedWith(w, OFFERS)
  const email = address()
  await askCode(w, p.seed, email, [OFFERS])
  const second = askCode(w, p.seed, email, [OFFERS])
  await expect(second).rejects.toBeInstanceOf(Refused)
  await expect(second).rejects.toMatchObject({ message: 'Wait a minute, then send a new code.', code: 'too_soon' })
  await expect(askCode(w, p.seed, address(), [OFFERS])).resolves.toMatchObject({ profiles: [p.profiles[0]!.address] })
})

test("a profile that isn't on this host yet is refused in words", async () => {
  const p = await verifiedWith(w, OFFERS)
  await expect(askCode(w, p.seed, address(), [OTHER_OFFERS])).rejects.toMatchObject({ message: "One of these profiles isn't on this host yet.", code: 'not_here' })
})

test('turned off elsewhere (the email\'s Stop link): the next Save finds out, the entry is deleted and it shows as Off, with no error', async () => {
  const t = await on()
  const stopped = await fetch(`${w.host}/email/stop/${t.id}`, { method: 'POST' })
  expect(stopped.status).toBe(200)
  expect(device.email(), 'until a change finds out, the entry still says on').not.toBeNull()
  expect(await saveProfiles(w, t.p.seed, device.email()!, [OFFERS])).toBe('gone')
  expect((await emailEntry(t.p.seed)).body).toBeNull()
  expect(device.email()).toBeNull()
})

test('the reference app, which knows no such entry, finds the person\'s profiles and stamps as before', async () => {
  const t = await on()
  const found = await App.find(t.p.seed, [w.host])
  expect([...found.labels].sort()).toEqual([OFFERS, OTHER_OFFERS].sort())
  expect(found.stamps).toHaveLength(1)
})
