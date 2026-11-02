// Get verified: the face check, in a tab of its own, opened on the tap itself (iPhone Safari blocks
// a tab opened after an await), then the stamp asked for until it comes, its gift collected and the
// stamp kept. The seed Start got is held only while the check is open: held for review, which can
// take a while, the screen lets it go and asks the passkey again once the stamp comes.

import { useEffect, useRef, useState } from 'react'

import { config } from '../config.ts'
import { type Step, NotFinished, NotPassed, ask, collect, finish, open, stampNumberAt } from '../flows/verify.ts'
import { walletKey } from '../flows/profiles.ts'
import { type Passkey, withSeed, ask as askPasskey } from '../passkey.ts'
import { Line, Quiet, Spinner, UnlockIcon, noteOf, useAction } from '../ui.tsx'

/** How often the stamp is asked for while the check is open, and for how long; and while it is held for review. */
const AWAY_EVERY_MS = 3_000
const AWAY_FOR_MS = 20 * 60_000
const REVIEW_EVERY_MS = 20_000

type Props = {
  /** The passkey that answered at Start, its seed held for the check; null once let go. */
  passkey: Passkey | null
  id: string
  step: Step
  onVerified: () => void
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Didit sends the person back here after the check, only to the app's own address: elsewhere they close the tab. */
const returnUrl = () => (location.origin === config.app ? `${config.app}/back` : undefined)

export function Verify({ passkey, id, step: first, onVerified }: Props) {
  const seed = useRef<Uint8Array | null>(passkey?.seed ?? null)
  const live = useRef(true)
  const [step, setStep] = useState<Step>(first.at === 'away' ? { at: 'start' } : first)
  const [away, setAway] = useState(false)

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
    await finish(config, id, seed.current!, stamp)
    letGo()
    onVerified()
  }

  /** Held for review: the seed let go, the stamp asked for now and then, and its gift collected as it comes. */
  const review = async (stampNumber: bigint, wallet: string) => {
    letGo()
    setStep({ at: 'review' })
    while (live.current) {
      await sleep(REVIEW_EVERY_MS)
      if (!live.current) return
      const next = await ask(config, id, stampNumber).catch(() => ({ at: 'review' }) as const)
      if (next.at === 'signed') {
        await collect(config, id, wallet).catch(() => undefined)
        return setStep(next)
      }
      if (next.at !== 'review') {
        setStep({ at: 'start' })
        throw new NotPassed()
      }
    }
  }

  /** The stamp asked for while the check is open in its tab. */
  const wait = async () => {
    const stampNumber = await stampNumberAt(config, seed.current!)
    const wallet = (await walletKey(seed.current!)).address
    const until = Date.now() + AWAY_FOR_MS
    while (live.current && Date.now() < until) {
      const next = await ask(config, id, stampNumber)
      if (next.at === 'signed') return done(next.stamp)
      if (next.at === 'review') return review(stampNumber, wallet)
      if (next.at === 'start') break
      await sleep(AWAY_EVERY_MS)
    }
    throw new NotFinished()
  }

  // Taken up held for review: the stamp asked for as it would have been.
  useEffect(() => {
    if (first.at !== 'review' || !seed.current) return
    const s = seed.current
    void (async () => {
      const stampNumber = await stampNumberAt(config, s)
      const wallet = (await walletKey(s)).address
      await review(stampNumber, wallet)
    })().catch((err: unknown) => live.current && check.setNote(noteOf(err)))
  }, [])

  const check = useAction(async () => {
    if (!seed.current) {
      // Let go after a review: the passkey first; the next tap opens the check.
      seed.current = (await askPasskey({ allow: [id] })).seed
      return
    }
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
    setAway(true)
    try {
      await wait()
    } finally {
      if (live.current) setAway(false)
    }
  })

  const keep = useAction(async () => {
    if (step.at !== 'signed') return
    await withSeed(id, (s) => finish(config, id, s, step.stamp))
    onVerified()
  })

  const unlockFirst = !seed.current
  return (
    <main>
      <div className="fill" />
      <div className="stack">
        <h1>Get verified</h1>
        <p>This ties your seed to you: one real person, accountable for it.</p>
      </div>
      <div className="fill" />
      {step.at === 'review' ? (
        <>
          <p className="line">
            <Spinner />
            Being reviewed
          </p>
          <Line note={check.note} />
        </>
      ) : step.at === 'signed' ? (
        <>
          <Line note={keep.note} />
          <button className="primary" disabled={keep.busy} onClick={() => keep.run()}>
            {keep.busy ? <Spinner /> : <><UnlockIcon /> Continue</>}
          </button>
        </>
      ) : (
        <>
          {away && <p className="line">Finish in the other tab.</p>}
          <Line note={check.note} />
          <button className="primary" disabled={check.busy} onClick={() => check.run()}>
            {check.busy ? <Spinner /> : unlockFirst ? <><UnlockIcon /> Start</> : 'Start'}
          </button>
        </>
      )}
    </main>
  )
}
