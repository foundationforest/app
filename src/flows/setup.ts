// Setup's face check, in stages the app can come back to: a buy at each service the issuer's
// welcome gift names; the note, asked for until the check passes, with the buys' references; the
// gift's credits collected with the tickets the note came with; then the first vault. The passkey
// is made before it starts; `keep` puts each stage on the device as it is got, sealed under a key
// mixed from the seed (the buys before the note is asked for, the note and its tickets once they
// come), so a setup that stops before the vault is written comes back to where it was, on this
// device, after one face. The issuer gives the same tickets for the same buys, and a service the same credits for
// the same ticket, so nothing is lost.

import { issuerSecret } from '../../standard/keys/src/index.ts'
import type { NoteJson } from '../../standard/registry/client/src/person.ts'
import { type Credit, type Pending, type Service, buy } from '../services/credits.ts'
import { collect, serviceAt } from '../services/buys.ts'
import { ServiceError } from '../services/http.ts'
import { type Issuer, note, readIssuer, session } from '../services/issuer.ts'
import type { Settings } from '../settings.ts'
import { type AppVault, firstVault, vaultKeys } from '../vault.ts'

export type GiftBuy = { service: string; at: Service; buy: Uint8Array; reference: string; pending: Pending }

/** Where the check has got to: each stage is kept, so trying again starts where it stopped. */
export type Check = { issuer?: Issuer; buys?: GiftBuy[]; note?: NoteJson; tickets?: Record<string, string>; credits?: Credit[]; vault?: AppVault }

/** What the device keeps of a check, sealed: what cannot be got again. The credits come again from the tickets. */
export type Kept = Pick<Check, 'issuer' | 'buys' | 'note' | 'tickets'>

export const keptOf = ({ issuer, buys, note, tickets }: Check): Kept => ({ issuer, buys, note, tickets })

/** One buy at each service the gift names, for exactly the credits a ticket there gives. */
export async function giftBuys(issuer: Issuer): Promise<GiftBuy[]> {
  return Promise.all(
    Object.entries(issuer.gift ?? {}).map(async ([service, g]) => {
      const at = await serviceAt(g.origin)
      const b = await buy(at, g.credits)
      return { service, at, buy: b.buy, reference: b.reference, pending: b.pending }
    }),
  )
}

/** What the issuer answers while the person is still in the check, or while Didit does not answer. */
const WAITING = new Set(['no_liveness', 'liveness_not_passed', 'not_approved', 'face_check_unavailable'])

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => (clearTimeout(timer), reject(signal.reason)), { once: true })
  })

/** The note, asked for every `every` ms until the check passes, for at most `forMs`. A refusal that is not a wait ends it. */
export async function waitForNote(issuer: Issuer, sessionId: string, noteNumber: bigint, buys: GiftBuy[], { every = 3000, forMs = 20 * 60_000, signal }: { every?: number; forMs?: number; signal?: AbortSignal } = {}) {
  const gift = buys.length ? Object.fromEntries(buys.map((b) => [b.service, b.reference])) : undefined
  const until = Date.now() + forMs
  for (;;) {
    signal?.throwIfAborted()
    try {
      return await note(issuer, sessionId, noteNumber, gift)
    } catch (err) {
      if (!(err instanceof ServiceError && WAITING.has(err.code)) || Date.now() > until) throw err
    }
    await sleep(every, signal)
  }
}

/** The gift's credits, each buy collected with its ticket. None when the issuer gave no tickets. */
export async function collectGift(buys: GiftBuy[], tickets: Record<string, string> | undefined): Promise<Credit[]> {
  if (!tickets || 'error' in tickets) return []
  const credits: Credit[] = []
  for (const b of buys) if (tickets[b.service]) credits.push(...(await collect(b.at, b.buy, b.pending, tickets[b.service]!)))
  return credits
}

/**
 * The face check from where `check` stopped. `open` is called with the check's page, a session at
 * the issuer that sends the person back to `returnUrl`, only when a note is still needed. `keep` is
 * given what to keep each time a stage is got that cannot be got again.
 */
export async function faceCheck(
  seed: Uint8Array,
  s: Settings,
  check: Check,
  open: (url: string) => void,
  returnUrl: string,
  { signal, keep = async () => undefined }: { signal?: AbortSignal; keep?: (kept: Kept) => Promise<void> } = {},
): Promise<AppVault> {
  if (!check.note) {
    check.issuer ??= await readIssuer(s.issuer)
    // An issuer sends people back only to the apps it lists; from anywhere else, the check's tab stays open.
    const { sessionId, url } = await session(check.issuer, returnUrl).catch((err) =>
      err instanceof ServiceError && err.code === 'bad_return_url' ? session(check.issuer!) : Promise.reject(err),
    )
    open(url)
    if (!check.buys) {
      check.buys = await giftBuys(check.issuer)
      await keep(keptOf(check))
    }
    const { noteNumber } = await issuerSecret(seed, check.issuer.name)
    const got = await waitForNote(check.issuer, sessionId, noteNumber, check.buys, { signal })
    check.note = got.json
    check.tickets = got.gift
    await keep(keptOf(check))
  }
  check.credits ??= await collectGift(check.buys ?? [], check.tickets)
  check.vault ??= await firstVault(await vaultKeys(seed), s.host, {
    issuerNotes: [{ issuer: check.issuer!.name, note: check.note }],
    settings: { forestApp: { ...s, credits: check.credits } },
  })
  return check.vault
}
