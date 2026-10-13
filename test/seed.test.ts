// The seed: 24 words made and read back, keys mixed from it by the keys library, and the lock's
// encryption. The passkey and IndexedDB around it need a browser: test/browser/run.ts.

import { describe, expect, test } from 'vitest'

import { mainKey } from '../standard/keys/src/index.ts'
import { seal, unseal } from '../src/seed/locked.ts'
import { makeSeed, seedFromWords } from '../src/seed/seed.ts'

describe('seed', () => {
  test('24 words, which give the same seed and the same keys back', async () => {
    const { seed, words } = makeSeed()
    expect(seed.length).toBe(32)
    expect(words.split(' ')).toHaveLength(24)
    const back = seedFromWords(words.toUpperCase().split(' ').join('  '))
    expect(back).toEqual(seed)
    expect((await mainKey(back, 'tutoring/seller')).address).toBe((await mainKey(seed, 'tutoring/seller')).address)
  })

  test('a wrong word is refused', () => {
    const words = makeSeed().words.split(' ')
    words[3] = words[3] === 'zoo' ? 'abandon' : 'zoo'
    expect(() => seedFromWords(words.join(' '))).toThrow()
  })
})

describe('the lock', () => {
  const secret = crypto.getRandomValues(new Uint8Array(32))

  test('the seed sealed under a PRF secret opens with that secret alone', async () => {
    const { seed } = makeSeed()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const sealed = await seal(seed, secret, iv)
    expect(sealed.length).toBe(32 + 16)
    expect(Buffer.from(sealed).includes(Buffer.from(seed.subarray(0, 8)))).toBe(false)
    expect(await unseal({ iv, sealed }, secret)).toEqual(seed)
    await expect(unseal({ iv, sealed }, crypto.getRandomValues(new Uint8Array(32)))).rejects.toThrow()
    sealed[0]! ^= 1
    await expect(unseal({ iv, sealed }, secret)).rejects.toThrow()
  })
})
