// Get verified: "So people know you're real.", and two cards, each one tap (Checks.tsx). The selfie
// opens its check in a tab of its own at once, on the tap itself (iPhone Safari blocks a tab opened
// after an await). The ID opens its sheet: its price and tries, and, tapped open, the consent screen
// the verifier serves, word for word, before Pay $5, which sends the person to Stripe's page in this
// tab; Stripe sends them back to /id, where the payment, kept on the device, makes the ID card open
// its check at once too.
//
// While the check is open in its tab, the screen shows only the loader, Waiting for your check, and
// Open it again; when the stamp comes, it moves on by itself. A check that didn't pass brings no
// screen of its own: Get verified again, one line on top in a notice, and its session is done, so
// the next tap opens a new one. Held for review (a face Didit has seen before), Get verified again,
// the notice saying a person is checking, that check's card greyed, and the app asking all the while;
// approved, it moves on by itself too. From Start, Get verified's back goes to Start (App.tsx), and
// the waiting's to Get verified: the asking stops, nothing under way changes, and a tap on the same
// card picks it up where it was (flows/verify.ts, `choose`). From You or Home, a check to add: the
// checks the person has are greyed, the ID's sheet is open when nothing is paid, and back is where
// it came from.
//
// The screen keeps no seed of its own: it uses the one held after an unlock (held.ts), for 5
// minutes since the last action, the check's own tab hiding the page meanwhile. So while a seed is
// held as the screen opens (always, from Start), the seed's number and the wallet are worked out at
// once, and the stamp is asked for with them, needing no seed, until it comes. Once it does, it is
// kept at once if a seed is still held; else "You're verified" and Continue ask for one. With none
// held as the screen opened (from You or Home, back from Stripe's page), the stamp can't be asked for, so
// the waiting shows Continue too: one unlock asks for the stamp, collects its gift, keeps it and
// makes every profile show it.

import { useEffect, useRef, useState } from 'react'

import { config } from '../config.ts'
import { type Check, checks, under } from '../device.ts'
import { type CreditLines, type Step, NotFinished, NotPassed, advance, ask, choose, collect, consentOf, creditsOf, finish, open, pay, stampNumberAt, stepOf } from '../flows/verify.ts'
import { walletKey } from '../flows/profiles.ts'
import { isHeldFor } from '../held.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, type Note, Notice, Quiet, Top, UnlockIcon, YoureVerified, noteOf, useAction } from '../ui.tsx'
import { Reloading } from '../version.ts'
import { CheckCard, IdSheet } from './Checks.tsx'

/** How often the stamp is asked for while the check is open, and for how long; and while it is held for review. */
const AWAY_EVERY_MS = 3_000
const AWAY_FOR_MS = 20 * 60_000
const REVIEW_EVERY_MS = 20_000

/** What Get verified says while a person at Forest checks a face Didit has seen before. */
const REVIEWING = 'A person at Forest is checking your selfie. You can close Forest; it picks up here.'

type Props = {
  /** Opened from Start: back goes there, and the line on adding the other check shows. */
  setup: boolean
  id: string
  step: Step
  /** A check that will never pass, found as Start took the verification up. */
  failed?: NotPassed
  onVerified: () => void
  /** Back from Get verified: to Start; for someone verified already, to You. */
  onBack: () => void
}

/** Didit sends the person back here after the check, only to the app's own address: elsewhere they close the tab. */
const returnUrl = () => (location.origin === config.app ? `${config.app}/back` : undefined)

/** Where Stripe sends the person back, paid or not: this screen, at this address. */
const paidUrl = () => `${location.origin}/id`

/** What asking for the stamp needs, worked out from the seed: the seed's number, and the wallet's address, where its gift goes. */
type Known = { stampNumber: bigint; wallet: string }

const knownOf = async (seed: Uint8Array): Promise<Known> => ({ stampNumber: await stampNumberAt(config, seed), wallet: (await walletKey(seed)).address })

export function Verify({ setup, id, step: first, failed: failedFirst, onVerified, onBack }: Props) {
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
  // Each back, and each card tapped, starts a new turn: what the earlier one was asking or waiting for stops.
  const turn = useRef(0)
  const wake = useRef<(() => void) | null>(null)
  // The turn the stamp is being asked for in, from here, if any.
  const loopAt = useRef<number | null>(null)
  const [step, setStep] = useState<Step>(first)
  const [waiting, setWaiting] = useState(first.at === 'away')
  const [asking, setAsking] = useState(false)
  const [failed, setFailed] = useState<NotPassed | null>(failedFirst ?? null)
  const [sheet, setSheet] = useState(!setup && first.at === 'consent')
  const [stripe, setStripe] = useState<string | null>(null)
  // What the asking from here came to, when it stopped short.
  const [note, setNote] = useState<Note | null>(null)
  const [credits, setCredits] = useState<CreditLines | null>(null)
  // The consent screen, as the verifier serves it: Pay shows only once it has come.
  const [consent, setConsent] = useState<string | null>(null)
  const [noConsent, setNoConsent] = useState<Note | null>(null)

  /** The check under way for this passkey, if any. */
  const underWay = (): Check | null => {
    const u = under()
    return u?.passkey === id ? u.check : null
  }
  const paid = () => {
    const u = under()
    return u?.passkey === id && !!u.payment
  }

  useEffect(() => {
    live.current = true
    creditsOf(config).then(
      (lines) => live.current && setCredits(lines),
      () => live.current && setCredits({}),
    )
    return () => void (live.current = false)
  }, [])

  useEffect(() => {
    if (!sheet || consent) return
    let on = true
    setNoConsent(null)
    consentOf(config).then(
      (text) => on && setConsent(text),
      (err: unknown) => on && setNoConsent(noteOf(err)),
    )
    return () => void (on = false)
  }, [sheet])

  /** A pause in the asking, cut short by back. */
  const pause = (ms: number) =>
    new Promise<void>((r) => {
      const t = setTimeout(r, ms)
      wake.current = () => {
        clearTimeout(t)
        r()
      }
    })

  /** A check that will never pass: back to the two checks, saying so. */
  const notPassed = (err: NotPassed) => {
    setFailed(err)
    setWaiting(false)
    setSheet(false)
    setStep(stepOf(id))
  }

  /** What stopped the asking in turn `at`, said: a check that didn't pass on Get verified, anything else in one line. */
  const said = (err: unknown, at: number) => {
    if (!live.current || turn.current !== at || err instanceof Reloading) return
    if (err instanceof NotPassed) return notPassed(err)
    setNote(noteOf(err))
  }

  /** The stamp signed: kept at once while a seed is held, and the person is verified; else Continue asks for one. */
  const done = async (stamp: string) => {
    if (!isHeldFor(id)) return setStep({ at: 'signed', stamp })
    await withSeed(id, (s) => finish(config, id, s, stamp, proveInWorker))
    onVerified()
  }

  /** Held for review: Get verified, saying so; the stamp asked for now and then, its gift collected and the stamp kept as it comes, when the wallet is known. */
  const review = async (at: number, wallet?: string) => {
    setWaiting(false)
    setStep({ at: 'review' })
    try {
      while (live.current && turn.current === at) {
        await pause(REVIEW_EVERY_MS)
        if (!live.current || turn.current !== at) return
        const next = await ask(config, id, stampNumber.current!).catch((err: unknown) => {
          if (err instanceof NotPassed) throw err
          return { at: 'review' } as const
        })
        if (turn.current !== at) return
        if (next.at === 'signed') {
          if (wallet) await collect(config, id, wallet).catch(() => undefined)
          return await done(next.stamp)
        }
        if (next.at !== 'review') return setStep(next)
      }
    } catch (err) {
      said(err, at)
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
      if (next.at !== 'away') {
        setWaiting(false)
        return setStep(next)
      }
      await pause(AWAY_EVERY_MS)
    }
    if (turn.current === at) throw new NotFinished()
  }

  /** The stamp asked for from here in turn `at`, once, while what a held seed gave is known. */
  const askHere = (at: number) => {
    const k = known.current
    if (!k || loopAt.current === at) return
    loopAt.current = at
    setAsking(true)
    setNote(null)
    void (async () => {
      try {
        await wait(at, await k)
      } catch (err) {
        said(err, at)
      } finally {
        if (loopAt.current === at) {
          loopAt.current = null
          if (live.current) setAsking(false)
        }
      }
    })()
  }

  // Taken up with the check open, or held for review, with a seed held: the stamp asked for as it would have been.
  useEffect(() => {
    const k = known.current
    if (!k) return
    if (first.at === 'away') return askHere(0)
    if (first.at !== 'review') return
    void (async () => {
      const { stampNumber: number, wallet } = await k
      stampNumber.current = number
      await review(0, wallet)
    })().catch((err: unknown) => said(err, 0))
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

  /** The check chosen, opened in its tab, then waited for, the stamp asked for from here while a seed was held. */
  const opening = useAction(async (c: Check) => {
    const at = turn.current
    choose(id, c)
    await openTab()
    if (turn.current !== at) return
    setFailed(null)
    setStep({ at: 'away' })
    setWaiting(true)
    askHere(at)
  })

  /** The same check's page again, in a tab of its own; the asking from here taken up if it had stopped. */
  const reopen = useAction(async () => {
    await openTab()
    askHere(turn.current)
  })

  /** A card tapped: what was asked or waited for before stops; the selfie, or the ID paid for, opens its check; the ID not paid for, its sheet. */
  const pick = (c: Check) => {
    turn.current++
    wake.current?.()
    if (c === 'id' && !paid()) return setSheet(true)
    void opening.run(c)
  }

  /** The payment made, then Stripe's page in this tab; in test mode, Stripe's test card said first. */
  const paying = useAction(async () => {
    const { url, test } = await pay(config, id, paidUrl())
    if (test) return setStripe(url)
    location.assign(url)
  })

  /** One unlock: the verification taken on, as far as it goes, and then asked for from here with the seed held. */
  const go = useAction(async () => {
    const at = turn.current
    let next: Step | null
    try {
      next = await withSeed(id, async (s) => {
        const k = await knownOf(s)
        known.current = Promise.resolve(k)
        stampNumber.current = k.stampNumber
        return advance(config, id, s, proveInWorker)
      })
    } catch (err) {
      if (turn.current !== at) return
      if (err instanceof NotPassed) return notPassed(err)
      throw err
    }
    if (next === null) return onVerified()
    if (turn.current !== at) return
    setStep(next)
    if (next.at === 'away') return askHere(at)
    if (next.at === 'review') return review(at)
    setWaiting(false)
  })

  /** The stamp signed kept: one unlock, unless a seed is still held. */
  const keep = useAction(async () => {
    if (step.at !== 'signed') return
    await withSeed(id, (s) => finish(config, id, s, step.stamp, proveInWorker))
    onVerified()
  })

  /** Back to the two checks: the asking stops, and nothing under way changes. */
  const toChecks = () => {
    turn.current++
    wake.current?.()
    setWaiting(false)
    setNote(null)
    setStep(stepOf(id))
    for (const action of [opening, reopen, go, keep]) action.setNote(null)
  }

  const closeSheet = () => {
    if (paying.busy) return
    setSheet(false)
    setStripe(null)
    paying.setNote(null)
  }

  // A stamp signed with no seed held, or kept with its profiles left to show it: one unlock to finish.
  if (step.at === 'signed' || step.at === 'kept') {
    const busy = keep.busy || go.busy
    return (
      <main>
        <div className="fill" />
        <div className="stack center">
          <YoureVerified check={underWay() ?? 'face'} />
        </div>
        <div className="fill" />
        <Line note={keep.note ?? go.note} />
        <div className="foot">
          <button className="primary" disabled={busy} onClick={() => (step.at === 'signed' ? keep.run() : go.run())}>
            {busy ? <Loader /> : <><UnlockIcon /> Continue</>}
          </button>
        </div>
      </main>
    )
  }

  if (waiting) {
    // With no seed held as it opened, the stamp can't be asked for from here: Continue asks for one.
    const needsSeed = !asking && !known.current
    return (
      <main>
        <Top onBack={toChecks} />
        <div className="fill" />
        <div className="waiting">
          {(asking || go.busy) && <Loader big />}
          <span>Waiting for your check</span>
        </div>
        <div className="fill" />
        <Line note={go.note ?? reopen.note ?? note} />
        <div className="foot">
          {needsSeed && (
            <button className="primary" disabled={go.busy} onClick={() => go.run()}>
              {go.busy ? <Loader /> : <><UnlockIcon /> Continue</>}
            </button>
          )}
          <button disabled={reopen.busy} onClick={() => reopen.run()}>
            {reopen.busy ? <Loader /> : <><Icon name="arrow-square-out" /> Open it again</>}
          </button>
        </div>
      </main>
    )
  }

  const reviewing = step.at === 'review' ? underWay() : null
  const held = checks()
  const off = (c: Check) => opening.busy || reviewing === c || (!setup && held.includes(c))
  return (
    <main>
      <Top onBack={onBack} />
      <div className="fill half" />
      <div className="stack">
        <h1>Get verified</h1>
        <p className="lead">So people know you're real.</p>
      </div>
      {reviewing ? <Notice>{REVIEWING}</Notice> : failed && <Notice>{failed.message}</Notice>}
      <Line note={opening.note} />
      <div className="vcards">
        {(['face', 'id'] as const).map((c) => (
          <CheckCard key={c} check={c} credits={credits} off={off(c)} busy={opening.busy && underWay() === c} onPick={() => pick(c)} />
        ))}
      </div>
      <div className="fill" />
      {setup && <p className="quiet-foot">You can add the other one later.</p>}
      {sheet && <IdSheet consent={consent} note={paying.note ?? noConsent} stripe={stripe} paying={paying.busy} onPay={() => paying.run()} onClose={closeSheet} />}
    </main>
  )
}
