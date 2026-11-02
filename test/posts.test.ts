// Posting, against services' own host (world.ts): every kind at <kind>/<id>, a random id, checked
// before the unlock against its market (the markets' browser entry, which answers as the Node entry
// does) and, for a review, a vouch or a report, against its subject's profile entry at the host;
// paid from the profile's folder, topped up from the wallet; edited at its own path; deleted.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { loadMarkets } from '../markets/build/dist/index.js'
import * as device from '../src/device.ts'
import { addressIn, check, post, readPosts, unpost } from '../src/flows/posts.ts'
import { markets } from '../src/markets.ts'
import { Said } from '../src/words.ts'
import { type World, freshDevice, verifiedWith, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

const MATHS = {
  description: 'Maths for secondary school, one hour online.',
  price: { amount: '30', currency: 'USD', per: 'hour' },
  subjects: ['maths'],
  levels: ['secondary'],
  place: { online: true },
  contact: 'ada@example.com',
}

/** Why `check` refused, as the line the screen shows. */
const refusal = async (p: Promise<void>) => {
  const err = await p.then(() => null, (e: unknown) => e)
  if (!(err instanceof Said)) throw new Error(`not refused in words: ${String(err)}`)
  return [err.message, err.red]
}

describe('a post', () => {
  test('checked before the unlock, posted at a random id and paid from its folder; edited at its path; deleted', async () => {
    const p = await verifiedWith(w, 'tutoring/tutor')
    const me = p.profiles[0]!
    await check(w, me, 'post', MATHS, [me])
    expect(loadMarkets().checkEntry('tutoring', 'tutor', 'post', MATHS), 'the Node entry agrees').toBeNull()
    const before = await w.balance(me.address)
    const path = await post(w, p.seed, me, 'post', MATHS)
    expect(path).toMatch(/^post\/[0-9a-f]{32}$/)
    expect(await w.balance(me.address), "paid from the profile's folder").toBeLessThan(before)
    const [posted] = await readPosts(w, me.address)
    expect([posted?.path, posted?.kind, posted?.body, posted?.key]).toEqual([path, 'post', MATHS, undefined])

    const edited = { ...MATHS, description: 'Maths and physics, one hour online.' }
    expect(await post(w, p.seed, me, 'post', edited, path)).toBe(path)
    const after = await readPosts(w, me.address)
    expect(after.map((x) => [x.path, x.body.description])).toEqual([[path, edited.description]])
    expect(after[0]!.time).toBeGreaterThan(posted!.time)

    const kept = await w.balance(me.address)
    await unpost(w, p.seed, me, path)
    expect(await readPosts(w, me.address)).toEqual([])
    expect(await w.balance(me.address), 'a delete is free').toBe(kept)
  })

  test('before the unlock: a field that does not fit, in red, by its name; a required one left empty, quiet', async () => {
    const p = await verifiedWith(w, 'home-repair/client')
    const me = p.profiles[0]!
    expect(await refusal(check(w, me, 'post', { description: 'A leak.', price: { amount: 'thirty', currency: 'USD' } }, [me]))).toEqual(["Price doesn't fit.", true])
    expect(await refusal(check(w, me, 'post', { description: 'A leak.', licences: 'none' }, [me])), "a field for the other role's posts").toEqual(["Licences doesn't fit.", true])
    expect(await refusal(check(w, me, 'post', { repairs: ['plumbing'] }, [me]))).toEqual(['Description is empty.', false])
    expect(await refusal(check(w, me, 'post', { description: 'A leak.', groupSize: '2' }, [me])), 'a field the market does not have').toEqual(["Group size doesn't fit.", true])
  })

  test('a write refused for its price: one more credit from the wallet, and written again', async () => {
    const pricey = await world({ entryPerKb: '0.5' })
    try {
      const p = await verifiedWith(pricey, 'tutoring/tutor')
      const me = p.profiles[0]!
      const path = await post(pricey, p.seed, me, 'post', { ...MATHS, description: 'Maths. '.repeat(400) })
      expect((await readPosts(pricey, me.address)).map((x) => x.path)).toEqual([path])
    } finally {
      await pricey.close()
    }
  })
})

describe('a review, a vouch or a report', () => {
  test("about someone on the other side of the same market, never one's own; a review naming their post", async () => {
    const tutor = await verifiedWith(w, 'tutoring/tutor')
    const offer = await post(w, tutor.seed, tutor.profiles[0]!, 'post', MATHS)
    const student = await verifiedWith(w, 'tutoring/student', 'tutoring/tutor', 'clothing/buyer')
    const [me, myTutor, myBuyer] = student.profiles as [device.Profile, device.Profile, device.Profile]
    const other = await verifiedWith(w, 'tutoring/student', 'clothing/seller')
    const mine = student.profiles

    const review = (subject: string) => check(w, me, 'review', { subject, score: '9', text: 'Clear and patient.' }, mine)
    expect(await refusal(check(w, me, 'review', { score: '9' }, mine))).toEqual(['Add their address.', false])
    expect(await refusal(review('not an address'))).toEqual(["That isn't a profile's address.", true])
    expect(await refusal(review(myTutor.address))).toEqual(["That's one of your own profiles.", true])
    expect(await refusal(review(myBuyer.address)), 'none of their own, even in another market').toEqual(["That's one of your own profiles.", true])
    expect(await refusal(review(other.profiles[1]!.address))).toEqual(["This profile isn't in this market.", true])
    expect(await refusal(review(other.profiles[0]!.address))).toEqual(["This profile isn't on the other side of this market.", true])
    expect(await refusal(check(w, me, 'review', { subject: tutor.profiles[0]!.address, score: '11' }, mine))).toEqual(["Score doesn't fit.", true])

    const body = { subject: addressIn(`https://app.forest.foundation/message?to=${tutor.profiles[0]!.address}`), score: '9', text: 'Clear and patient.', post: `${tutor.profiles[0]!.address}/${offer}` }
    expect(body.subject, 'a Share link gives its address').toBe(tutor.profiles[0]!.address)
    await check(w, me, 'review', body, mine)
    const path = await post(w, student.seed, me, 'review', body)
    expect(path).toMatch(/^review\/[0-9a-f]{32}$/)
    for (const kind of ['vouch', 'report'] as const) {
      const said = { subject: body.subject, text: kind === 'vouch' ? 'Real and honest.' : 'Fake.' }
      await check(w, me, kind, said, mine)
      expect(await post(w, student.seed, me, kind, said)).toMatch(new RegExp(`^${kind}/[0-9a-f]{32}$`))
    }
    expect((await readPosts(w, me.address)).map((x) => x.kind).sort()).toEqual(['report', 'review', 'vouch'])
  })

  test("a market with one role: a review is about another of that role, and a review field kept for some roles is checked against the subject's", async () => {
    const a = await verifiedWith(w, 'tennis-matches/player')
    const b = await verifiedWith(w, 'tennis-matches/player')
    await check(w, b.profiles[0]!, 'review', { subject: a.profiles[0]!.address, showedUp: 'yes' }, b.profiles)
    const client = await verifiedWith(w, 'home-repair/client')
    const repairer = await verifiedWith(w, 'home-repair/repairer')
    await check(w, client.profiles[0]!, 'review', { subject: repairer.profiles[0]!.address, onTime: 'yes' }, client.profiles)
    expect(await refusal(check(w, repairer.profiles[0]!, 'review', { subject: client.profiles[0]!.address, onTime: 'yes' }, repairer.profiles)), "onTime is for reviews of repairers").toEqual(["On time doesn't fit.", true])
    expect(markets.checkEntry('home-repair', 'repairer', 'review', { subject: 'x', onTime: 'yes' }, 'client')).toBe(loadMarkets().checkEntry('home-repair', 'repairer', 'review', { subject: 'x', onTime: 'yes' }, 'client'))
  })
})
