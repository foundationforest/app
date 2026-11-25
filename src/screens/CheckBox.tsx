// A check happens in one box: a white card with rounded corners filling the screen (on a laptop, the
// side Get verified sits in), under a round × at its top left. Everything of the check happens inside
// it, one step after another, and the app never leaves the page, so the seed held at its start is
// still held at its end and nothing asks the passkey again.
//
// 1. Before: its title; the verifier's words as GET / serves them (the face check's own, or the ID
//    check's), scrolling, with a fade at their foot; above a line, one tick holding the verifier's
//    line to agree to (and for the ID, its right to cancel, right after it, in the same tick),
//    unticked at first; Start, or Continue to pay, strong green, working once ticked, asking the
//    passkey only while no seed is held (its unlock icon then); under it, small, Terms · Privacy,
//    each the site's page in a new tab.
// 2. Paying (the ID check only): the verifier's payment page framed in the box, with its client
//    secret after the #, which no request carries. Its one message, "payment_done", taken from the
//    verifier's origin and that frame alone, moves on: the session is opened with the payment, and
//    the verifier asks Stripe whether the money is held. A payment kept, paid and under a day old,
//    skips this step.
// 3. Didit: the session's page framed in the box, with what a camera check needs. Its retakes happen
//    inside it. Its messages are taken from Didit's origin (config.ts) and that frame alone: the
//    moment didit:completed comes, the frame goes, so Didit's own result never shows (the verifier
//    may still refuse what Didit approved); didit:cancelled or didit:close_request close the box.
//    Each of its messages restarts the seed's 15 minutes, as an action does (held.ts).
// 4. Checking: the loader and Checking, while the stamp is asked for, again while it isn't finished.
// 5. Then: the stamps kept, every profile made to show them, and back to Get verified, the card
//    Verified; or an answer, in the box (answers.ts).
//
// The × closes the box at any step: a check left unfinished uses no try, and a payment made waits.
// A check whose session is kept opens at Checking once, then its page, as it was.

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { type Act, type Answer, answerOf } from '../answers.ts'
import { config } from '../config.ts'
import type { Check } from '../device.ts'
import { type Consent, NotPassed, Unpaid, ask, cancel, choose, consentOf, finish, finishShowing, open, pay, paymentKept, stampNumberAt, stepOf } from '../flows/verify.ts'
import { stillHere } from '../held.ts'
import { useHeld } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { NoAnswer, withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, TickBox, UnlockIcon, useAction } from '../ui.tsx'
import { Reloading } from '../version.ts'

/** How often the stamp is asked for while the check isn't finished, and for how long. */
const ASK_EVERY_MS = 2_000
const ASK_FOR_MS = 10 * 60_000

/** What Didit's page may do, framed. */
export const DIDIT_ALLOWS = 'camera; microphone; geolocation; clipboard-write; fullscreen; autoplay; encrypted-media; digital-credentials-get'

/** The one message the verifier's payment page posts: the person has paid (services' verifier/src/codes.ts, PAYMENT_DONE). */
export const PAYMENT_DONE = 'payment_done'

const originOf = (url: string) => new URL(url).origin

/** The face check's answers that use its one free try: Didit's refusals, and the try used already. */
const FACE_USED = new Set(['known_person', 'known_face', 'too_young', 'face_mismatch', 'id_unclear', 'face_unclear', 'other', 'face_tries_used'])

type Props = {
  /** The check the box opens on. */
  check: Check
  passkey: string
  /** From setup: Use my other passkey can show. */
  setup: boolean
  idForSale: boolean
  /** Whether this passkey holds a stamp already: Delete this passkey shows only while it holds none. */
  holdsStamp: boolean
  /** The box closed: back to Get verified. */
  onClose: () => void
  /** The stamps kept and shown: back to Get verified, the card Verified. */
  onVerified: (check: Check) => void
  /** Use my other passkey: the one the person uses asked for, and this one added to it. */
  onOtherPasskey: () => Promise<void>
  /** Delete this passkey: the browser told, this device forgotten, back to Start. */
  onDeletePasskey: () => Promise<void>
  /** The face check refused for good: its card greyed. */
  onFaceUsed: () => void
}

type Step = { at: 'loading' } | { at: 'before'; consent: Consent } | { at: 'paying'; clientSecret: string } | { at: 'didit'; url: string } | { at: 'checking' } | { at: 'answer'; answer: Answer; retry?: () => Promise<void> }

export function CheckBox({ check: first, passkey, setup, idForSale, holdsStamp, onClose, onVerified, onOtherPasskey, onDeletePasskey, onFaceUsed }: Props) {
  const [check, setCheck] = useState<Check>(first)
  const [step, setStep] = useState<Step>({ at: 'loading' })
  const [ticked, setTicked] = useState(false)
  const held = useHeld()
  const frame = useRef<HTMLIFrameElement | null>(null)
  const live = useRef(true)
  // Each step started is a turn: what an earlier one was waiting for stops.
  const turn = useRef(0)
  const number = useRef<bigint | null>(null)

  /** The seed's stamp number, worked out once: with the seed held, or one unlock. */
  const stampNumber = async (): Promise<bigint> => (number.current ??= await withSeed(passkey, (seed) => stampNumberAt(config, seed)))

  /** A step on, unless the box was closed or another step started meanwhile. */
  const to = (at: number, next: Step) => {
    if (live.current && turn.current === at) setStep(next)
  }
  const next = () => ++turn.current

  /** What stopped a step, in the box: an answer, with what Try again runs again; or back to Get verified. */
  const stopped = (at: number, c: Check, err: unknown, retry?: () => Promise<void>) => {
    if (!live.current || turn.current !== at || err instanceof Reloading) return
    // The passkey's window closed, at Before: Before again, nothing said.
    if (err instanceof NoAnswer) return void showBefore(at, c).catch(() => onClose())
    if (err instanceof NotPassed && c === 'face' && FACE_USED.has(err.code)) onFaceUsed()
    const answer = answerOf(err, c, { setup, idForSale, holdsStamp })
    if (answer === 'back') return onClose()
    setStep({ at: 'answer', answer, ...(retry && { retry }) })
  }

  /** A step that may fail, run in a new turn: what stops it said in the box. */
  const run = (c: Check, steps: (at: number) => Promise<void>) => {
    const at = next()
    const again = () => run(c, steps)
    return steps(at).catch((err: unknown) => stopped(at, c, err, again))
  }

  /** The stamps signed kept, and every profile made to show them; then the card Verified. */
  const keep = async (at: number, c: Check, stamps: string[]) => {
    to(at, { at: 'checking' })
    await withSeed(passkey, (seed) => finish(config, passkey, seed, stamps, proveInWorker))
    if (live.current && turn.current === at) onVerified(c)
  }

  /** The stamp asked for until it comes, while the check isn't finished. */
  const checking = (c: Check) =>
    run(c, async (at) => {
      to(at, { at: 'checking' })
      const n = await stampNumber()
      const until = Date.now() + ASK_FOR_MS
      while (live.current && turn.current === at && Date.now() < until) {
        const got = await ask(config, passkey, n)
        if (turn.current !== at) return
        if (got.at === 'signed') return keep(at, c, got.stamps)
        if (got.at !== 'away') throw new NotPassed('expired', c)
        await new Promise((r) => setTimeout(r, ASK_EVERY_MS))
      }
      if (live.current && turn.current === at) throw new Error('Not finished.')
    })

  /** The check's session opened, and its page framed. A payment kept that was never paid: the payment page. */
  const opening = (c: Check) =>
    run(c, async (at) => {
      to(at, { at: 'loading' })
      let url
      try {
        url = await open(config, passkey, stampNumber)
      } catch (err) {
        if (err instanceof Unpaid) return void paying(c)
        throw err
      }
      to(at, { at: 'didit', url })
    })

  /** The ID check paid for: stamps the verifier signed already kept, nothing paid; else its payment page. */
  const paying = (c: Check) =>
    run(c, async (at) => {
      to(at, { at: 'loading' })
      const n = await stampNumber()
      const got = await pay(config, passkey, n)
      if ('stamps' in got) return keep(at, c, got.stamps)
      to(at, { at: 'paying', clientSecret: got.clientSecret })
    })

  /** The check `c` chosen, and the box at its step: a check kept, its last steps; a session kept, Checking once, then its page; else Before. */
  const begin = (c: Check) => {
    setCheck(c)
    setTicked(false)
    choose(passkey, c)
    const at = stepOf(passkey).at
    if (at === 'kept')
      return void run(c, async (t) => {
        to(t, { at: 'checking' })
        await withSeed(passkey, (seed) => finishShowing(config, passkey, seed, proveInWorker))
        if (live.current && turn.current === t) onVerified(c)
      })
    if (at === 'away')
      return void run(c, async (t) => {
        to(t, { at: 'checking' })
        const got = await ask(config, passkey, await stampNumber())
        if (turn.current !== t) return
        if (got.at === 'signed') return keep(t, c, got.stamps)
        if (got.at === 'away') return void opening(c)
        await showBefore(t, c)
      })
    void run(c, (t) => showBefore(t, c))
  }

  const showBefore = async (at: number, c: Check) => {
    to(at, { at: 'loading' })
    to(at, { at: 'before', consent: await consentOf(config, c) })
  }

  useEffect(() => {
    live.current = true
    begin(first)
    return () => {
      live.current = false
      turn.current++
    }
  }, [])

  // The framed pages' messages, each only from its own origin and its own frame.
  useEffect(() => {
    const told = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return
      if (step.at === 'paying' && e.origin === originOf(config.verifier) && e.data === PAYMENT_DONE) {
        stillHere()
        return void opening('id')
      }
      if (step.at !== 'didit' || e.origin !== originOf(config.didit)) return
      const type = (e.data as { type?: unknown } | null)?.type
      if (typeof type !== 'string' || !type.startsWith('didit:')) return
      stillHere()
      if (type === 'didit:completed') return void checking(check)
      if (type === 'didit:cancelled' || type === 'didit:close_request') return onClose()
    }
    addEventListener('message', told)
    return () => removeEventListener('message', told)
  }, [step, check])

  /** Start, or Continue to pay, once ticked. */
  const go = useAction(async () => {
    if (check === 'face') return void (await opening('face'))
    if (paymentKept(passkey)) return void (await opening('id'))
    await paying('id')
  })

  /** What a button or a link in an answer does. */
  const act = useAction(async (a: Act) => {
    if (step.at !== 'answer') return
    switch (a) {
      case 'other-passkey':
        return onOtherPasskey()
      case 'verify-id':
        return begin('id')
      case 'keep-trying':
        return void (await opening('id'))
      case 'skip':
        await cancel(config, passkey)
        return onClose()
      case 'close':
        return onClose()
      case 'delete-passkey':
        return onDeletePasskey()
      case 'try-again':
        return void (await step.retry?.())
    }
  })

  return (
    <div className="box-shell" role="dialog" aria-modal="true" aria-label={check === 'face' ? 'Face check' : 'ID check'}>
      <button type="button" className="round box-x" aria-label="Close" onClick={onClose}>
        <Icon name="x" />
      </button>
      <div className={step.at === 'paying' || step.at === 'didit' ? 'box framed' : 'box'}>
        {step.at === 'loading' && (
          <Middle>
            <Loader big />
          </Middle>
        )}
        {step.at === 'before' && (
          <div className="before">
            <h1>{check === 'face' ? 'Before your face check' : 'Before your ID check'}</h1>
            <div className="consent-scroll">
              <p className="consent">{step.consent.consent}</p>
            </div>
            <hr />
            <button type="button" className="tick-row" role="checkbox" aria-checked={ticked} onClick={() => setTicked(!ticked)}>
              <TickBox ticked={ticked} />
              <span className="agree">
                <span>{step.consent.agree}</span>
                {step.consent.cancelRight && <span>{step.consent.cancelRight}</span>}
              </span>
            </button>
            <Line note={go.note} />
            <button type="button" className="primary" disabled={!ticked || go.busy} onClick={() => go.run()}>
              {go.busy ? <Loader /> : <>{!held && <UnlockIcon />} {check === 'face' ? 'Start' : 'Continue to pay'}</>}
            </button>
            <p className="xs center legal">
              <a href={config.terms} target="_blank" rel="noopener noreferrer">
                Terms
              </a>{' '}
              ·{' '}
              <a href={config.privacy} target="_blank" rel="noopener noreferrer">
                Privacy
              </a>
            </p>
          </div>
        )}
        {step.at === 'paying' && <iframe ref={frame} title="Pay for your ID check" src={`${config.verifier}/id/pay#${step.clientSecret}`} allow="payment" />}
        {step.at === 'didit' && <iframe ref={frame} title={check === 'face' ? 'Your face check' : 'Your ID check'} src={step.url} allow={DIDIT_ALLOWS} />}
        {step.at === 'checking' && (
          <Middle>
            <div className="waiting">
              <Loader big />
              <span>Checking</span>
            </div>
          </Middle>
        )}
        {step.at === 'answer' && (
          <div className="answer">
            <div className="fill" />
            <span className="sun-round" aria-hidden>
              <Icon name="exclamation-mark" bold />
            </span>
            <h1>{step.answer.title}</h1>
            <p className="lead">{step.answer.line}</p>
            <div className="fill" />
            <Line note={act.note} />
            <div className="stack">
              {step.answer.buttons.map((b) => (
                <button key={b.act} type="button" className={b.look === 'primary' ? 'primary' : b.look === 'danger' ? 'danger solid' : undefined} disabled={act.busy} onClick={() => act.run(b.act)}>
                  {act.busy ? <Loader /> : b.words}
                </button>
              ))}
              {step.answer.link &&
                (step.answer.link.act === 'contact' ? (
                  <a className="text-link center" href={`mailto:${config.contact}`}>
                    {step.answer.link.words}
                  </a>
                ) : (
                  <button type="button" className="text-link" disabled={act.busy} onClick={() => act.run(step.answer.link!.act)}>
                    {step.answer.link.words}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Something alone in the middle of the box. */
const Middle = ({ children }: { children: ReactNode }) => <div className="box-middle">{children}</div>
