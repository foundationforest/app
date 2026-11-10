// The seed as 24 words (keys/README.md, The seed: exportWords, importWords), against services' own
// verifier and host on loopback (world.ts): exported on one device and imported on another, the new
// passkey added to the seed as a backup is (folders/README.md, The seed entry), so it opens the same
// profiles from then on, and nothing of the words kept; words that can't be used, each refused in
// one line before any passkey is made; a backup's own words, followed one step; and never two seeds
// on one device: words that open a different Forest from the one it lists, refused until Forget.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { exportWords, newSeed } from '@foundationforest/keys'

import * as device from '../src/device.ts'
import { addBackup, backupsAt } from '../src/flows/backups.ts'
import { DifferentForest, WordsNotVerified, seedOfWords, wordCount } from '../src/flows/imported.ts'
import { walletKey } from '../src/flows/profiles.ts'
import { follow, seedFor } from '../src/flows/seed.ts'
import { enter } from '../src/flows/start.ts'
import { Said } from '../src/words.ts'
import { type World, freshDevice, person, proveHere, verifiedWith, world } from './world.ts'

let w: World
beforeAll(async () => void (w = await world()))
afterAll(() => w?.close())
beforeEach(() => {
  freshDevice()
  w.decideAll('approved')
})

/** A copy of a seed, as a passkey gives it again: the flows zero what they follow or are handed for good. */
const copy = (seed: Uint8Array) => new Uint8Array(seed)

/** How the words in `text` are refused: their line, and whether it is red. */
const refusal = async (text: string) => {
  const err = await seedOfWords(w.host, text).then(
    () => null,
    (e: unknown) => e,
  )
  if (!(err instanceof Said)) throw new Error(`not refused in words: ${String(err)}`)
  return [err.message, err.red]
}

/** Everything a device keeps, as one text. */
const kept = () => JSON.stringify(Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])))

describe('24 words', () => {
  test('exported on one device, imported on another: a new passkey, added as a backup, opens the same profiles, and nothing of the words is kept', async () => {
    const p = await verifiedWith(w, 'tutoring/tutor', 'clothing/seller')
    const words = exportWords(p.seed)
    expect(words.split(' ')).toHaveLength(24)

    // Another device, with nothing on it. Case and spacing are forgiven.
    freshDevice()
    const seed = await seedOfWords(w.host, `  ${words.toUpperCase().replaceAll(' ', '\n ')}  `)
    expect(seed, 'the seed the words spell').toEqual(p.seed)
    const made = person()
    await addBackup(w, seed, { ...made, seed: copy(made.seed) })
    expect(await follow(w.host, copy(made.seed)), "the new passkey's seed entry holds the seed").toEqual(p.seed)
    expect(await enter(w, { id: made.id, seed }, proveHere)).toEqual({ to: 'profiles' })
    expect(device.passkey(), 'the new passkey is the one in use').toBe(made.id)
    expect(device.profiles(), 'the same profiles').toEqual(p.profiles.slice().sort((a, b) => a.label.localeCompare(b.label)))
    expect(await seedFor(w.host, copy(made.seed)), 'every unlock from then follows it to the seed').toEqual(p.seed)
    const stored = kept()
    for (let i = 0; i + 3 <= 24; i++) expect(stored, 'no three of the words kept, in order').not.toContain(words.split(' ').slice(i, i + 3).join(' '))

    // The first device lists one passkey more.
    expect(await backupsAt(w.host, (await walletKey(p.seed)).address)).toHaveLength(1)
  })

  test("words that can't be used, each in one line, before any passkey: some missing, quiet; too many, a word wrong or out of place, or none verified, red", async () => {
    const p = await verifiedWith(w, 'tutoring/tutor')
    const words = exportWords(p.seed).split(' ')
    freshDevice()
    expect(await refusal('')).toEqual(['Add all 24 words.', false])
    expect(await refusal(words.slice(0, 23).join(' '))).toEqual(['Add all 24 words.', false])
    expect(await refusal([...words, 'abandon'].join(' '))).toEqual(["That's more than 24 words.", true])
    expect(await refusal([...words.slice(0, 23), 'forest1'].join(' ')), 'no such word').toEqual(['A word is wrong, or in the wrong place.', true])
    expect(await refusal([words[1], words[0], ...words.slice(2)].join(' ')), 'two swapped: the checksum').toEqual(['A word is wrong, or in the wrong place.', true])
    const nobody = newSeed()
    await expect(seedOfWords(w.host, exportWords(nobody)), 'a seed no verifier stamped').rejects.toBeInstanceOf(WordsNotVerified)
    expect(await refusal(exportWords(nobody))).toEqual(["These words aren't verified.", true])
    expect(device.passkeys(), 'no passkey made or known').toEqual([])
  })

  test('Your 24 words counts them as they are typed: between spaces or lines, extra spaces and all', () => {
    expect([wordCount(''), wordCount('  orbit  canvas\nmaple '), wordCount(exportWords(newSeed()).toUpperCase())]).toEqual([0, 3, 24])
  })

  test("a backup's own words: followed one step, to the seed it backs up", async () => {
    const p = await verifiedWith(w, 'tutoring/tutor')
    const b = person()
    await addBackup(w, p.seed, { ...b, seed: copy(b.seed) })
    freshDevice()
    expect(await seedOfWords(w.host, exportWords(b.seed))).toEqual(p.seed)
  })

  test('never two seeds on one device: words that open a different Forest from the one it lists, refused; its own taken; after Forget, the others taken', async () => {
    const a = await verifiedWith(w, 'tutoring/tutor')
    const b = await verifiedWith(w, 'tutoring/student')
    await enter(w, { id: a.id, seed: copy(a.seed) }, proveHere)
    expect(device.folder()?.address).toBe((await walletKey(a.seed)).address)

    await expect(seedOfWords(w.host, exportWords(b.seed))).rejects.toBeInstanceOf(DifferentForest)
    expect(await refusal(exportWords(b.seed))).toEqual(['These words open a different Forest.', true])
    expect(await seedOfWords(w.host, exportWords(a.seed)), 'the Forest it lists').toEqual(a.seed)

    device.forget()
    expect(await seedOfWords(w.host, exportWords(b.seed)), 'after Forget').toEqual(b.seed)
  })
})
