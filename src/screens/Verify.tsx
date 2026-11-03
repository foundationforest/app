// Get verified: two rows to pick from, the face check, free, or the ID check, $5, then Continue. Each
// check in a tab of its own, opened on the tap itself (iPhone Safari blocks a tab opened after an
// await). The ID check is paid first, on Stripe's page in this tab: before it, its price and tries,
// and, tapped open, the verifier's consent screen, word for word; Stripe sends the person back to
// /id, where the payment, kept on the device, takes them on.
//
// Every step has a back. From Start, Get verified goes back to Start, and every later step to Get
// verified, the check under way still picked: the asking stops, nothing under way changes, and
// Continue picks it up where it was (flows/verify.ts, `choose`). From Settings, back is Settings.
//
// The screen keeps no seed of its own: it uses the one held after an unlock (held.ts), which the
// page drops when it is hidden, as it is while the check is open in its tab. So while a seed is
// still held as the screen opens (from Start, or from an unlock a moment before), the seed's number
// and the wallet are worked out at once, and the stamp is asked for with them, needing no seed,
// until it comes. Once it does, it is kept at once if a seed is still held; else Continue asks for
// one. With none held as the screen opened (from Settings, or after a review), opening the check
// needs none, and one unlock at Continue asks for the stamp, collects its gift, keeps it and makes
// every profile show it.
//
// From Start, with nothing under way for this passkey, the two checks also offer Link to my Forest
// passkey, for a passkey made by mistake: the person's Forest passkey asked for, followed if it is a
// backup itself, and this passkey made a backup of it (flows/backups.ts); then the seed it opens is
// held for this passkey, which stays the one in use here, and the person is in, as from Start.

import { useEffect, useRef, useState } from 'react'

import { config } from '../config.ts'
import { CONSENT, TEST_CARD } from '../consent.ts'
import { type Check, knowPasskey, under } from '../device.ts'
import { linkTo } from '../flows/backups.ts'
import { follow } from '../flows/seed.ts'
import { enter } from '../flows/start.ts'
import { type Step, NotFinished, NotPassed, advance, ask, checkOf, choose, collect, finish, open, pay, stampNumberAt, stepOf } from '../flows/verify.ts'
import { walletKey } from '../flows/profiles.ts'
import { hold, isHeldFor } from '../held.ts'
import { ask as askPasskey, withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Quiet, Spinner, Top, UnlockIcon, noteOf, useAction } from '../ui.tsx'

/** How often the stamp is asked for while the check is open, and for how long; and while it is held for review. */
const AWAY_EVERY_MS = 3_000
const AWAY_FOR_MS = 20 * 60_000
const REVIEW_EVERY_MS = 20_000

type Props = {
  /** Opened from Start, whose back goes there. */
  fromStart: boolean
  id: string
  step: Step
  onVerified: () => void
  /** Back from Get verified: to Start; for someone verified already, to Settings. */
  onBack: () => void
}

/** Didit sends the person back here after the check, only to the app's own address: elsewhere they close the tab. */
const returnUrl = () => (location.origin === config.app ? `${config.app}/back` : undefined)

/** Where Stripe sends the person back, paid or not: this screen, at this address. */
const paidUrl = () => `${location.origin}/id`

/** What asking for the stamp needs, worked out from the seed: the seed's number, and the wallet's address, where its gift goes. */
type Known = { stampNumber: bigint; wallet: string }

const knownOf = async (seed: Uint8Array): Promise<Known> => ({ stampNumber: await stampNumberAt(config, seed), wallet: (await walletKey(seed)).address })

export function Verify({ fromStart, id, step: first, onVerified, onBack }: Props) {
  // Worked out at once while a seed is held, before the check's tab hides the page.
  // A failure says itself where it is awaited, as the stamp is asked for.
  const [atOpen] = useState(() => {
    if (!isHeldFor(id)) return null
    const got = withSeed(id, knownOf)
    got.catch(() => undefined)
    return got
  })
  const known = useRef<Promise<Known> | null>(atOpen)
  const stampNumber = useRef<bigint | null>(null)
  const live = useRef(true)
  // Each back starts a new turn: what the earlier one was asking or waiting for stops.
  const turn = useRef(0)
  const wake = useRef<(() => void) | null>(null)
  // With a seed held, a check left open is opened again, and asked for from here.
  const [step, setStep] = useState<Step>(first.at === 'away' && known.current ? { at: 'start' } : first)
  const [away, setAway] = useState(first.at === 'away' && !known.current)
  const [stripe, setStripe] = useState<string | null>(null)
  /** The check under way for this passkey, if any. */
  const underWay = (): Check | null => (under()?.passkey === id ? checkOf(under()) : null)
  const [picked, setPicked] = useState<Check | null>(underWay)
  const check = checkOf(under())

  /** A pause in the asking, cut short by back. */
  const pause = (ms: number) =>
    new Promise<void>((r) => {
      const t = setTimeout(r, ms)
      wake.current = () => {
        clearTimeout(t)
        r()
      }
    })

  useEffect(
    () => () => {
      live.current = false
    },
    [],
  )

  /** The stamp signed: kept at once while a seed is held, and the person is verified; else Continue asks for one. */
  const done = async (stamp: string) => {
    if (!isHeldFor(id)) return setStep({ at: 'signed', stamp })
    await withSeed(id, (s) => finish(config, id, s, stamp, proveInWorker))
    onVerified()
  }

  /** Held for review: the stamp asked for now and then, and its gift collected as it comes, when the wallet is known. */
  const review = async (at: number, wallet?: string) => {
    setStep({ at: 'review' })
    while (live.current && turn.current === at) {
      await pause(REVIEW_EVERY_MS)
      if (!live.current || turn.current !== at) return
      const next = await ask(config, id, stampNumber.current!).catch(() => ({ at: 'review' }) as const)
      if (turn.current !== at) return
      if (next.at === 'signed') {
        if (wallet) await collect(config, id, wallet).catch(() => undefined)
        return setStep(next)
      }
      if (next.at !== 'review') return setStep(next)
    }
  }

  /** The stamp asked for while the check is open in its tab, with what the seed gave, until back. */
  const wait = async (at: number, { stampNumber: number, wallet }: Known) => {
    stampNumber.current = number
    const until = Date.now() + AWAY_FOR_MS
    while (live.current && turn.current === at && Date.now() < until) {
      const next = await ask(config, id, stampNumber.current)
      if (turn.current !== at) return
      if (next.at === 'signed') return done(next.stamp)
      if (next.at === 'review') return review(at, wallet)
      if (next.at !== 'away') return setStep(next)
      await pause(AWAY_EVERY_MS)
    }
    if (turn.current === at) throw new NotFinished()
  }

  // Taken up held for review with a seed held: the stamp asked for as it would have been.
  useEffect(() => {
    if (first.at !== 'review' || !known.current) return
    const k = known.current
    const at = turn.current
    void (async () => {
      const { stampNumber: number, wallet } = await k
      stampNumber.current = number
      await review(at, wallet)
    })().catch((err: unknown) => live.current && turn.current === at && start.setNote(noteOf(err)))
  }, [])

  /** A tab opened on the tap, then sent to the check's page. */
  const openTab = async () => {
    const tab = window.open('', '_blank')
    if (!tab) throw new Quiet('Allow Forest to open a tab, then try again.')
    try {
      const url = await open(config, id, returnUrl())
      tab.opener = null
      tab.location.href = url
    } catch (err) {
      tab.close()
      throw err
    }
  }

  /** The check opened in its tab; with what a held seed gave, asked for from here until it comes, or until back. */
  const start = useAction(async () => {
    const at = turn.current
    await openTab()
    if (turn.current !== at) return
    setStep({ at: 'away' })
    setAway(true)
    if (!known.current) return
    try {
      await wait(at, await known.current)
    } catch (err) {
      if (turn.current !== at) return
      setStep(stepOf(id))
      throw err
    } finally {
      if (live.current && turn.current === at) setAway(false)
    }
  })

  /**
   * A check chosen, or the one under way picked again, and taken to where it stands: the face check
   * opened on the same tap; the ID check to its consent screen, or, paid, to its Start.
   */
  const pick = (c: Check) => {
    choose(id, c)
    const next = stepOf(id)
    if (c === 'face' && (next.at === 'start' || next.at === 'away')) return void start.run()
    setStep(next)
  }

  /** The payment made, then Stripe's page in this tab; in test mode, Stripe's test card said first. */
  const paying = useAction(async () => {
    const { url, test } = await pay(config, id, paidUrl())
    if (test) return setStripe(url)
    location.assign(url)
  })

  /** One unlock: the verification taken on, as far as it goes (with no seed held). */
  const go = useAction(async () => {
    const at = turn.current
    const next = await withSeed(id, async (s) => {
      const k = await knownOf(s)
      known.current = Promise.resolve(k)
      stampNumber.current = k.stampNumber
      return advance(config, id, s, proveInWorker)
    }).catch((err: unknown) => {
      if (turn.current !== at) return undefined
      // A check that will never pass, or a payment to make again: the next step is the device's.
      if (err instanceof NotPassed) {
        setAway(false)
        setStep(stepOf(id))
      }
      throw err
    })
    if (next === null) return onVerified()
    if (!next || turn.current !== at) return
    setStep(next)
    if (next.at === 'away') throw new NotFinished()
    if (next.at === 'review') await review(at)
  })

  /** The stamp signed kept: one unlock, unless a seed is still held. */
  const keep = useAction(async () => {
    if (step.at !== 'signed') return
    await withSeed(id, (s) => finish(config, id, s, step.stamp, proveInWorker))
    onVerified()
  })

  /** Link to my Forest passkey: that passkey asked for, and this one made its backup; then the seed it opens is held for this one, and the person is in. */
  const linking = useAction(async () => {
    const seed = await withSeed(id, async (own) => {
      const answered = await askPasskey()
      const main = await follow(config.host, answered.seed)
      try {
        await linkTo(config, own, main)
      } catch (err) {
        main.fill(0)
        throw err
      }
      knowPasskey(answered.id)
      return main
    })
    hold(id, seed)
    const to = await withSeed(id, (s) => enter(config, { id, seed: s }, proveInWorker))
    if (to.to === 'profiles') return onVerified()
    setStep(to.step)
  })

  /** Nothing under way for this passkey: no check's session, and no payment. */
  const nothingUnderWay = () => {
    const u = under()
    return !u || u.passkey !== id || (!u.session && !u.payment)
  }

  /** Back to the two checks, the one under way picked: the asking stops, and nothing under way changes. */
  const toChecks = () => {
    turn.current++
    wake.current?.()
    setStep({ at: 'choose' })
    setAway(false)
    setStripe(null)
    setPicked(underWay() ?? picked)
    for (const action of [start, paying, go, keep, linking]) action.setNote(null)
  }

  const title = check === 'id' && step.at !== 'choose' ? 'ID check' : 'Get verified'
  const CHECKS = [
    { c: 'face' as const, name: 'Face', what: 'A selfie', price: 'Free' },
    { c: 'id' as const, name: 'ID', what: 'Your ID and a selfie · counts more', price: '$5' },
  ]
  return (
    <main>
      <Top onBack={fromStart && step.at !== 'choose' ? toChecks : onBack} />
      <h1>{title}</h1>
      {step.at === 'consent' && (
        <>
          <p>$5 · up to three tries</p>
          <details>
            <summary>What the check keeps</summary>
            <p className="consent">{CONSENT}</p>
          </details>
        </>
      )}
      <div className="fill" />
      {step.at === 'choose' ? (
        <>
          <div className="rows" role="radiogroup" aria-label="Check">
            {CHECKS.map(({ c, name, what, price }) => (
              <button key={c} role="radio" aria-checked={picked === c} className={picked === c ? 'row pick chosen' : 'row pick'} disabled={start.busy} onClick={() => setPicked(c)}>
                <span className="two">
                  <strong>{name}</strong>
                  <span>{what}</span>
                </span>
                <span className="aside">{price}</span>
              </button>
            ))}
          </div>
          <Line note={start.note ?? linking.note} />
          <button className="primary" disabled={!picked || start.busy || linking.busy} onClick={() => picked && pick(picked)}>
            {start.busy ? <Spinner /> : 'Continue'}
          </button>
          {fromStart && nothingUnderWay() && (
            <button className="quiet" disabled={start.busy || linking.busy} onClick={() => linking.run()}>
              {linking.busy ? <Spinner /> : <><UnlockIcon always /> Link to my Forest passkey</>}
            </button>
          )}
        </>
      ) : step.at === 'consent' ? (
        <>
          <Line note={paying.note} />
          {stripe ? (
            <>
              <p className="line">{TEST_CARD}</p>
              <a className="button primary" href={stripe}>
                Go to Stripe
              </a>
            </>
          ) : (
            <button className="primary" disabled={paying.busy} onClick={() => paying.run()}>
              {paying.busy ? <Spinner /> : 'Pay $5'}
            </button>
          )}
        </>
      ) : step.at === 'review' ? (
        <>
          <p className="line">
            <Spinner />
            Being reviewed
          </p>
          <Line note={start.note ?? go.note} />
        </>
      ) : step.at === 'signed' || step.at === 'kept' ? (
        <>
          <Line note={keep.note ?? go.note} />
          <button className="primary" disabled={keep.busy || go.busy} onClick={() => (step.at === 'signed' ? keep.run() : go.run())}>
            {keep.busy || go.busy ? <Spinner /> : <><UnlockIcon /> Continue</>}
          </button>
        </>
      ) : away && !start.busy ? (
        <>
          <p className="line">Finish in the other tab.</p>
          <Line note={go.note ?? start.note} />
          <button className="primary" disabled={go.busy} onClick={() => go.run()}>
            {go.busy ? <Spinner /> : <><UnlockIcon /> Continue</>}
          </button>
          <button className="quiet" disabled={go.busy || start.busy} onClick={() => start.run()}>
            Open the check
          </button>
        </>
      ) : (
        <>
          {away && <p className="line">Finish in the other tab.</p>}
          <Line note={start.note} />
          <button className="primary" disabled={start.busy} onClick={() => start.run()}>
            {start.busy ? <Spinner /> : 'Start'}
          </button>
        </>
      )}
    </main>
  )
}
