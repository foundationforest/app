// Credits given to a Profiles folder, from a link (/#/give-credits/<its address>, screens/Give.tsx):
// a few credits from the person's wallet into that folder, as a new profile's folder is funded (the
// reference app's `fund`, services/credits.ts): a buy paid from the wallet's balance, its credits
// spent into the folder. How a test account, which has no check and so no gift, gets credits to make
// profiles and write (test-account.ts). Only a checked person gives: a test account gives nothing.

import type { Services } from '../config.ts'
import { fund } from '../services/credits.ts'
import { isTestAccount } from '../test-account.ts'
import { Said } from '../words.ts'
import { walletKey } from './profiles.ts'

/** How many credits a link gives. */
export const GIVE = 20

/** Only a checked person gives credits. */
export const ONLY_CHECKED = 'Only a verified person can give credits.'

/** `GIVE` credits from the wallet of `seed` into the Profiles folder at `to`. */
export async function giveCredits(s: Services, seed: Uint8Array, to: string): Promise<void> {
  const wallet = await walletKey(seed)
  if (isTestAccount(s, wallet.address)) throw new Said(ONLY_CHECKED)
  await fund(s.host, to, GIVE, wallet)
}
