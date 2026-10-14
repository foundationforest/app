// Setup, two steps, each with a way back to Start: Open with your face, one tap, which makes the
// passkey and asks it for the seed, the device keeping only the seed's fingerprint; and the face
// check, each of its stages kept on the device as it is got, sealed under a key mixed from the seed,
// finished in a tab of its own. Where the person's manager holds a Forest passkey this device knows,
// none is made, and Start signs in with it at once. Back from the face check keeps the passkey:
// Start is refused it then, so Sign in takes it up. The seed the passkey gave is held from the first
// step to the check, so the check's tab opens on the tap; a face check opened again asks for the
// face first, the seed held from then, and takes it up from where it stopped. The tab is never left
// blank: whatever fails before the check is in it closes it, and the screen says what failed, with
// Try again. The passkey may also come from Sign in, one whose setup stopped before its vault. A
// face the issuer has from another setup sends the person back to Start, to sign in with that one,
// and the passkey this setup made, which can never get a note, is offered to the manager to drop. A
// note number whose gift was given before gets no credits: setup ends anyway if the vault's folder
// can pay for the vault, and says so; if it cannot, setup waits, nothing lost, and says so too.

import { useEffect, useRef, useState } from 'react'

import type { Check, Kept } from '../flows/setup.ts'
import { saveProfiles } from '../local.ts'
import { HasPasskey, NoPrf, type Passkey } from '../seed/passkey.ts'
import { beginSetup, dropSetup, endSetup, keepSetup, readSetup, resumeSetup } from '../seed/seed.ts'
import { ServiceError } from '../services/http.ts'
import { settings } from '../settings.ts'
import { NoVaultWrites, profilesOf } from '../vault.ts'
import { lazy } from '../version.ts'
import { BackIcon, DUPLICATE_FACE, GIFT_GIVEN, Progress, ScanFaceIcon, Spinner, useAction } from '../ui.tsx'

type Props = {
  step: 1 | 2
  draft: Passkey | null
  /** The passkey is made, or asked for again: it and its seed, held for the check. */
  onOpened: (passkey: Passkey) => void
  /** Back to Start, which says why: no PRF from the passkey, or a face with a setup already; or a passkey this device knows in the manager, and Start signs in at once. */
  onStopped: (why: string, signIn?: boolean) => void
  onDone: () => void
  /** Back to Start, setup kept as it is. */
  onBack: () => void
}

export function Setup({ step, draft, onOpened, onStopped, onDone, onBack }: Props) {
  if (step === 1) return <Open onOpened={onOpened} onStopped={onStopped} onBack={onBack} />
  return <Face draft={draft} onOpened={onOpened} onStopped={onStopped} onDone={onDone} onBack={onBack} />
}

function Top({ step, onBack }: { step: 1 | 2; onBack: () => void }) {
  return (
    <>
      <div className="bar">
        <div>
          <button className="icon" aria-label="Back" onClick={onBack}>
            <BackIcon />
          </button>
        </div>
      </div>
      <Progress step={step} />
    </>
  )
}

function Open({ onOpened, onStopped, onBack }: Pick<Props, 'onOpened' | 'onStopped' | 'onBack'>) {
  const open = useAction(async () => {
    try {
      onOpened(await beginSetup())
    } catch (err) {
      if (err instanceof HasPasskey) return onStopped(err.message, true)
      if (err instanceof NoPrf) return onStopped(err.message)
      throw err
    }
  })
  return (
    <main>
      <Top step={1} onBack={onBack} />
      <h1>Your passkey</h1>
      <p>Forest opens with your face or fingerprint, through a passkey your password manager keeps. This passkey is you: lose it and nothing brings it back.</p>
      <div className="fill" />
      {open.error && <p className="error">{open.error}</p>}
      <button className="primary" onClick={() => open.run()} disabled={open.busy}>
        {open.busy ? <Spinner /> : 'Open with your face'}
      </button>
    </main>
  )
}

function Face({ draft, onOpened, onStopped, onDone, onBack }: Omit<Props, 'step'>) {
  const check = useRef<Check>({})
  /** What the device kept of this check, opened with the seed once, so the check goes on from where it stopped. */
  const opening = useRef<Promise<void> | undefined>(undefined)
  const running = useRef<AbortController | null>(null)
  useEffect(() => () => running.current?.abort(), [])
  // The check's tab is open, and the note not yet here.
  const [away, setAway] = useState(false)
  // Setup ended with no credits: the gift was given before. Continue goes on to the board.
  const [given, setGiven] = useState(false)

  const kept = (seed: Uint8Array) =>
    (opening.current ??= readSetup<Kept>(seed).then(
      (k) => void Object.assign(check.current, k ?? {}),
      (err) => ((opening.current = undefined), Promise.reject(err)),
    ))
  // Held since the passkey gave it: what the device kept is opened now, before the tap.
  useEffect(() => {
    if (draft) kept(draft.seed).catch(() => undefined)
  }, [draft])

  /** The check from where it stopped, with the seed; `page` is the check's tab, while a note is still needed. Closed unless the check went into it. */
  const run = async (seed: Uint8Array, page: Window | null) => {
    running.current = new AbortController()
    let opened = false
    try {
      await kept(seed)
      // Setup's own flow: loaded when first needed, not with the first screen.
      const { faceCheck, giftGiven } = await lazy(() => import('../flows/setup.ts'))
      const vault = await faceCheck(
        seed,
        settings(),
        check.current,
        (url) => {
          page!.opener = null
          page!.location.href = url
          opened = true
          setAway(true)
        },
        `${location.origin}/back`,
        {
          signal: running.current.signal,
          keep: (kept) => {
            if (kept.note) setAway(false)
            return keepSetup(seed, kept, Boolean(kept.note))
          },
        },
      )
      saveProfiles(await profilesOf(seed, vault))
      endSetup()
      if (giftGiven(check.current)) setGiven(true)
      else onDone()
    } catch (err) {
      page?.close()
      throw err
    } finally {
      if (!opened) page?.close()
      setAway(false)
    }
  }

  /** The check's tab, while a note is still needed, opened on the tap so the browser lets it. One asked for after a face may be refused; the seed is held by then, so the next tap opens it. */
  const tab = (afterFace = false) => {
    if (check.current.note) return null
    const page = window.open('', '_blank')
    if (!page) throw new Error(afterFace ? 'Try again to open the check.' : 'Allow Forest to open a tab, then try again.')
    return page
  }

  const start = useAction(async () => {
    try {
      // Setup's own seed, in memory since the passkey gave it.
      if (draft) return await run(draft.seed, tab())
      // Opened again: the seed of this setup's own passkey, after one face, held from here.
      const passkey = await resumeSetup()
      onOpened(passkey)
      await kept(passkey.seed)
      await run(passkey.seed, tab(true))
    } catch (err) {
      // This passkey can never get a note: the setup is given up, and the person signs in with theirs.
      if (err instanceof ServiceError && err.code === 'duplicate_face') {
        await dropSetup()
        return onStopped(DUPLICATE_FACE)
      }
      // No credits, and the vault's folder cannot pay for the vault: setup waits, and Try again tries again.
      if (err instanceof NoVaultWrites && (await lazy(() => import('../flows/setup.ts'))).giftGiven(check.current)) throw new Error(GIFT_GIVEN)
      throw err
    }
  })

  return (
    <main>
      <Top step={2} onBack={onBack} />
      <h1>One face check</h1>
      <p>This ties your passkey to you: one real person, accountable for it.</p>
      <div className="fill stack center" style={{ alignContent: 'center', color: 'var(--ink-2)' }}>
        <ScanFaceIcon />
      </div>
      {start.busy && away && <p className="center">Finish it in the other tab.</p>}
      {given ? <p className="center">{GIFT_GIVEN}</p> : start.error && <p className="error">{start.error}</p>}
      <button className="primary" onClick={() => (given ? onDone() : start.run())} disabled={start.busy}>
        {start.busy ? <Spinner /> : given ? 'Continue' : start.error ? 'Try again' : 'Start'}
      </button>
    </main>
  )
}
