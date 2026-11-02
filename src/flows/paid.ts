// What a profile writes and sends, paid from its folder's balance at the host, by the bytes: when the
// host refuses for its price, one credit more goes into the folder from the wallet, the Profiles
// folder's balance (the reference app's `fund`), and it is sent again, a few times at most; then the
// wallet is out of credits.

import type { MainKey } from '@foundationforest/keys'

import { NoCredits, fund } from '../services/credits.ts'
import { NotWritten } from '../services/host.ts'

/** How many times a write refused for its price is funded with one more credit and sent again. */
const TOP_UPS = 3

/** `send`, paid from `folder`'s balance at `host`, topped up from `wallet` when the host refuses for price. */
export async function paid(host: string, folder: string, wallet: MainKey, send: () => Promise<void>): Promise<void> {
  for (let tries = 0; ; tries++) {
    try {
      return await send()
    } catch (err) {
      if (!(err instanceof NotWritten && err.code === 'refused')) throw err
      if (tries === TOP_UPS) throw new NoCredits()
      await fund(host, folder, 1, wallet)
    }
  }
}
