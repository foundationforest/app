// The seed: 32 random bytes, written as 24 words the person keeps, made and read by the keys library.

import { exportWords, importWords, newSeed } from '../../standard/keys/src/index.ts'

/** A new seed, and its 24 words for the person to keep somewhere safe, such as a password manager. */
export function makeSeed(): { seed: Uint8Array; words: string } {
  const seed = newSeed()
  return { seed, words: exportWords(seed) }
}

/** The seed back from its 24 words. Case and spacing are forgiven; a wrong word is not. */
export const seedFromWords = importWords
