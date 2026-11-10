// A seed from its 24 words (keys/README.md, The seed: `importWords`), for Your 24 words, typed from Start.
// Everything is checked before a passkey is made: all 24 words, each in its place; the seed they
// spell followed one step, as every unlock follows a passkey (flows/seed.ts), so words that spell a
// backup's own seed open the person's; not a different Forest from the one this device lists; and
// verified, a stamp in its Profiles folder, since the new passkey's folder is paid for from its
// wallet. Then a new passkey is made and added to that seed exactly as a passkey added from
// You is (flows/backups.ts): it opens the seed from then on. The words are never kept.

import { openingHalf, importWords, WORD_COUNT } from '@foundationforest/keys'

import { folder } from '../device.ts'
import { readView } from '../services/host.ts'
import { Said } from '../words.ts'
import { opened, walletKey } from './profiles.ts'
import { follow } from './seed.ts'

/** The words open a seed other than the one whose profiles this device lists: never two seeds on one device. */
export class DifferentForest extends Said {
  constructor() {
    super('These words open a different Forest.', true)
    this.name = 'DifferentForest'
  }
}

/** The words spell a seed whose Profiles folder holds no stamp. */
export class WordsNotVerified extends Said {
  constructor() {
    super("These words aren't verified.", true)
    this.name = 'WordsNotVerified'
  }
}

/** How many words `text` holds, between spaces or lines. */
export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length

/** The seed the 24 words in `text` spell: checked, followed one step, the one this device lists if it lists one, and verified; else why not, in one line. */
export async function seedOfWords(host: string, text: string): Promise<Uint8Array> {
  const count = wordCount(text)
  if (count < WORD_COUNT) throw new Said(`Add all ${WORD_COUNT} words.`)
  if (count > WORD_COUNT) throw new Said(`That's more than ${WORD_COUNT} words.`, true)
  let spelled: Uint8Array
  try {
    spelled = importWords(text)
  } catch {
    throw new Said('A word is wrong, or in the wrong place.', true)
  }
  const seed = await follow(host, spelled)
  try {
    const key = await walletKey(seed)
    const kept = folder()
    if (kept && kept.address !== key.address) throw new DifferentForest()
    const view = await readView(host, key.address)
    if (!(await opened(view, 'stamp', (await openingHalf(key.secret)).identity)).length) throw new WordsNotVerified()
    return seed
  } catch (err) {
    seed.fill(0)
    throw err
  }
}
