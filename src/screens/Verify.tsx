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
// Two ways in. From Start, the seed Start got is held while the check is open, and the stamp is
// asked for until it comes; held for review, the screen lets the seed go. With no seed held (from
// Settings, someone verified adding the ID check, or after a review), opening the check needs none,
// and one unlock at Continue asks for the stamp, collects its gift, keeps it and makes every profile
// show it.

import { useEffect, useRef, useState } from 'react'

import { config } from '../config.ts'
import { CONSENT, TEST_CARD } from '../consent.ts'
import { type Check, under } from '../device.ts'
import { type Step, NotFinished, NotPassed, advance, ask, checkOf, choose, collect, finish, open, pay, stampNumberAt, stepOf } from '../flows/verify.ts'
import { walletKey } from '../flows/profiles.ts'
import { type Passkey, withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Quiet, Spinner, Top, UnlockIcon, noteOf, useAction } from '../ui.tsx'

/** How often the stamp is asked for while the check is open, and for how long; and while it is held for review. */
const AWAY_EVERY_MS = 3_000
const AWAY_FOR_MS = 20 * 60_000
const REVIEW_EVERY_MS = 20_000

type Props = {
  /** The passkey that answered at Start, its seed held for the check; null when none is held. */
  passkey: Passkey | null
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

export function Verify({ passkey, id, step: first, onVerified, onBack }: Props) {
  const seed = useRef<Uint8Array | null>(passkey?.seed ?? null)
  const stampNumber = useRef<bigint | null>(null)
  const live = useRef(true)
  // Each back starts a new turn: what the earlier one was asking or waiting for stops.
  const turn = useRef(0)
  const wake = useRef<(() => void) | null>(null)
  // With a seed held, a check left open is opened again, and asked for from here.
  const [step, setStep] = useState<Step>(first.at === 'away' && seed.current ? { at: 'start' } : first)
  const [away, setAway] = useState(first.at === 'away' && !seed.current)
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

  /** The seed let go: zeroed, held no more. */
  const letGo = () => {
    seed.current?.fill(0)
    seed.current = null
  }
  useEffect(
    () => () => {
      live.current = false
      letGo()
    },
    [],
  )

  /** The stamp, kept with the seed held; the person is verified. */
  const done = async (stamp: string) => {
    await finish(config, id, seed.current!, stamp, proveInWorker)
    letGo()
    onVerified()
  }

  /** Held for review: the seed let go, the stamp asked for now and then, and its gift collected as it comes, when the wallet is known. */
  const review = async (at: number, wallet?: string) => {
    letGo()
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

  /** The stamp asked for while the check is open in its tab, with the seed held, until back. */
  const wait = async (at: number) => {
    stampNumber.current = await stampNumberAt(config, seed.current!)
    const wallet = (await walletKey(seed.current!)).address
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

  // Taken up held for review with the seed: the stamp asked for as it would have been.
  useEffect(() => {
    if (first.at !== 'review' || !seed.current) return
    const s = seed.current
    const at = turn.current
    void (async () => {
      stampNumber.current = await stampNumberAt(config, s)
      await review(at, (await walletKey(s)).address)
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

  /** The check opened in its tab; with the seed held, asked for from here until it comes, or until back. */
  const start = useAction(async () => {
    const at = turn.current
    await openTab()
    if (turn.current !== at) return
    setStep({ at: 'away' })
    setAway(true)
    if (!seed.current) return
    try {
      await wait(at)
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
      stampNumber.current = await stampNumberAt(config, s)
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

  /** The stamp kept, with the seed held from Start, after a review. */
  const keep = useAction(async () => {
    if (step.at !== 'signed') return
    if (seed.current) return done(step.stamp)
    await withSeed(id, (s) => finish(config, id, s, step.stamp, proveInWorker))
    onVerified()
  })

  /** Back to the two checks, the one under way picked: the asking stops, and nothing under way changes. */
  const toChecks = () => {
    turn.current++
    wake.current?.()
    setStep({ at: 'choose' })
    setAway(false)
    setStripe(null)
    setPicked(underWay() ?? picked)
    for (const action of [start, paying, go, keep]) action.setNote(null)
  }

  const title = check === 'id' && step.at !== 'choose' ? 'ID check' : 'Get verified'
  const CHECKS = [
    { c: 'face' as const, name: 'Face', what: 'A selfie', price: 'Free' },
    { c: 'id' as const, name: 'ID', what: 'Your ID and a selfie · counts more', price: '$5' },
  ]
  return (
    <main>
      <Top onBack={passkey && step.at !== 'choose' ? toChecks : onBack} />
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
          <Line note={start.note} />
          <button className="primary" disabled={!picked || start.busy} onClick={() => picked && pick(picked)}>
            {start.busy ? <Spinner /> : 'Continue'}
          </button>
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
      ) : away && !seed.current ? (
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
