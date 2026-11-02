// The host's credits, through services' own credits client (host/client/client.ts, used as it is):
// the gift's buy, made before the stamp is asked for and collected with the ticket that comes back
// (as services' loop does, e2e/e2e.ts), and a folder funded from the wallet (the reference app's
// `fund`): a buy paid from the Profiles folder's balance, signed by its main key, its credits spent
// into the folder. The host signed the credits blind, so it cannot tell which folder a buy went to.

import { b64u } from '@foundationforest/folders'
import type { MainKey } from '@foundationforest/keys'

import { BUY_TYPE, PAYMENT_HEADER, type Pending, balancePayment, bought, buy, finish, serviceAt, spendInto } from '../../services/host/client/client.ts'
import { Said } from '../words.ts'
import { Refused, Unreachable } from './http.ts'

/** The most credits the host takes in one spend. */
const SPEND_MAX = 100

async function service(host: string) {
  const s = await serviceAt(host).catch(() => {
    throw new Unreachable('host')
  })
  if (!s) throw new Refused('host', 404, 'no_credits')
  return s
}

/** A buy of exactly `credits`, for a gift: its reference, which the stamp request names, and what finishes it, kept on the device. */
export async function giftBuy(host: string, credits: number): Promise<{ reference: string; pending: Pending }> {
  const { reference, pending } = await buy(await service(host), credits)
  return { reference, pending }
}

/** Credits spent into `folder`, at most a hundred at a time. Credits a spend took before (a setup that stopped after it) are in already. */
async function spend(host: string, folder: string, credits: Parameters<typeof spendInto>[2]): Promise<void> {
  for (let i = 0; i < credits.length; i += SPEND_MAX) {
    await spendInto(host, folder, credits.slice(i, i + SPEND_MAX)).catch((err: Error) => {
      if (!/took no credits: spent\b/.test(err.message)) throw err
    })
  }
}

/**
 * The gift's credits: the buy collected at the host with the verifier's ticket, finished, and spent
 * into the wallet. Collected again, a buy gets the same answer, so a setup that stopped anywhere
 * here does this again and loses nothing. Gives back how many.
 */
export async function collectGift(host: string, pending: Pending, ticket: string, wallet: string): Promise<number> {
  const s = await service(host)
  let res: Response
  try {
    res = await fetch(s.requestUri, { method: 'POST', headers: { 'content-type': BUY_TYPE, [PAYMENT_HEADER]: `ticket ${ticket}` }, body: b64u.decode(pending.buy) as Uint8Array<ArrayBuffer>, redirect: 'error' })
  } catch {
    throw new Unreachable('host')
  }
  if (!res.ok) throw new Refused('host', res.status, ((await res.json().catch(() => ({}))) as { error?: string }).error ?? String(res.status))
  const credits = await finish(pending, new Uint8Array(await res.arrayBuffer()))
  await spend(host, wallet, credits)
  return credits.length
}

/** `n` credits from the wallet into `folder`: a buy paid from the wallet's balance with its main key, spent there. */
export async function fund(host: string, folder: string, n: number, wallet: MainKey): Promise<void> {
  const s = await service(host)
  const credits = await bought(s, n, (reference, count) => balancePayment(host, wallet, reference, count)).catch((err: Error) => {
    throw /not_paid/.test(err.message) ? new NoCredits() : err
  })
  await spend(host, folder, credits)
}

/** The wallet cannot pay for what is asked. */
export class NoCredits extends Said {
  constructor() {
    super('No credits left in your wallet.')
    this.name = 'NoCredits'
  }
}
