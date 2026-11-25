// Get verified: a back arrow, its title, "So people know you're real.", and two cards (Checks.tsx),
// a page the person comes back to. A card's button opens its check's box (CheckBox.tsx), where all of
// the check happens; closed, it is the cards again, a check done Verified.
//
// The face check's one free try: while the seed is held as the page opens, the verifier says whether
// it is left (POST /stamp's faceTriesLeft), and a refusal in the box uses it; with none left and no
// face stamp, its card is greyed, its name alone.
//
// From Start (`setup`), once a check is done, Continue at the foot: an underlined link while the ID
// is still to do, strong green once both are done (or while the ID isn't for sale); it goes on, to Add
// a backup, then the first profiles (App.tsx), and back is gone, since being verified can't be undone.
// Before that, back goes to Start. From You or Home: back to where it came from, and no Continue.
// Someone whose earlier stamps all count for nothing (the verifier's keys changed since) is sent here
// from Start with one line at the top saying so, until a check is done.
//
// In the box, a face seen before (known_face), from setup, offers Use my other passkey, for someone
// who made a passkey here by mistake: it asks for the passkey they use, and adds this one to it
// (flows/backups.ts, `linkTo`), and they're in. An ID already verified with another passkey
// (known_person), while this one holds no stamp, offers Delete this passkey: the browser told it's
// gone, this device forgotten, and back to Start.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { type Check, knowPasskey, unknowPasskey } from '../device.ts'
import { linkTo } from '../flows/backups.ts'
import { follow } from '../flows/seed.ts'
import { type Entered, enter } from '../flows/start.ts'
import { type CreditLines, creditsOf, faceTryLeft, stampNumberAt } from '../flows/verify.ts'
import { forgetDevice } from '../forget.ts'
import { hold, ifHeld } from '../held.ts'
import { useChecks, useIdCheck } from '../hooks.ts'
import { ask as askPasskey, drop, withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Notice, Top } from '../ui.tsx'
import { CHECK_AGAIN } from '../words.ts'
import { CheckBox } from './CheckBox.tsx'
import { CheckCard, type Standing } from './Checks.tsx'

type Props = {
  /** Opened from Start: back goes there, Continue shows once a check is done, and Use my other passkey where it can help. */
  setup: boolean
  id: string
  /** From Start, for someone whose stamps all count for nothing: one line at the top says so, until a check is done. */
  again?: boolean
  /** Continue, from Start, once a check is done. */
  onVerified: () => void
  /** In with the passkey the person uses, this one added to it: where Start would have taken them. */
  onIn: (entered: Entered) => void
  /** Back from Get verified: to Start; for someone verified already, to where they came from. */
  onBack: () => void
  /** This passkey deleted: back to Start. */
  onDeleted: () => void
}

export function Verify({ setup, id, again, onVerified, onIn, onBack, onDeleted }: Props) {
  const held = useChecks()
  const idCheck = useIdCheck()
  const [credits, setCredits] = useState<CreditLines | null>(null)
  const [open, setOpen] = useState<Check | null>(null)
  const [faceLeft, setFaceLeft] = useState(true)

  useEffect(() => {
    let live = true
    creditsOf(config).then(
      (lines) => live && setCredits(lines),
      () => live && setCredits({}),
    )
    // With the seed held, whether the free face check is left: asked quietly, restarting nothing.
    void ifHeld(id, async (seed) => faceTryLeft(config, await stampNumberAt(config, seed)))
      .then((left) => live && left === false && setFaceLeft(false))
      .catch(() => undefined)
    return () => void (live = false)
  }, [])

  /** Use my other passkey: the passkey the person uses asked for, followed, and this one added to it; then in, with the seed it opens held for this one. */
  const otherPasskey = async () => {
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
    onIn(await withSeed(id, (s) => enter(config, { id, seed: s }, proveInWorker)))
  }

  /** Delete this passkey: the browser told it's gone, this device's Forest forgotten, and this passkey with it. */
  const deletePasskey = async () => {
    await drop(id)
    forgetDevice()
    unknowPasskey(id)
    onDeleted()
  }

  const anyDone = held.has('face') || held.has('id')
  const standing = (c: Check): Standing => (held.has(c) ? 'done' : c === 'face' && !faceLeft ? 'used' : 'open')
  // The ID shows where it is for sale, or once it is done.
  const shown = (['face', 'id'] as const).filter((c) => c === 'face' || idCheck.forSale || held.has(c))
  const idToDo = idCheck.forSale && !held.has('id')
  return (
    <main className="verify">
      {setup && anyDone ? <Top /> : <Top onBack={onBack} />}
      <div className="stack">
        <h1>Get verified</h1>
        <p className="lead">So people know you're real.</p>
      </div>
      {again && !anyDone && <Notice>{CHECK_AGAIN}</Notice>}
      <div className="vcards">
        {shown.map((c) => (
          <CheckCard key={c} check={c} standing={standing(c)} credits={credits} {...(idCheck.price && { price: idCheck.price })} testPayments={idCheck.testPayments} disabled={open !== null} onPick={() => setOpen(c)} />
        ))}
      </div>
      <div className="fill" />
      {setup && anyDone && (
        <div className="foot">
          <button className={idToDo ? 'text-link' : 'primary'} onClick={onVerified}>
            Continue
          </button>
        </div>
      )}
      {open && (
        <CheckBox
          check={open}
          passkey={id}
          setup={setup}
          idForSale={idCheck.forSale}
          holdsStamp={anyDone}
          onClose={() => setOpen(null)}
          onVerified={() => setOpen(null)}
          onOtherPasskey={otherPasskey}
          onDeletePasskey={deletePasskey}
          onFaceUsed={() => setFaceLeft(false)}
        />
      )}
    </main>
  )
}
