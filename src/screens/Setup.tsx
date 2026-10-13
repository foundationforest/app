// Setup, two steps: Open with your face, one tap, which makes the passkey and asks it for the seed,
// the device keeping only the seed's fingerprint; and the face check, each of its stages kept on the
// device as it is got, sealed under a key mixed from the seed, finished in a tab of its own. The
// seed the passkey gave is held from the first step to the check, so the check's tab opens on the
// tap; a face check that stopped is taken up again after one face, until the vault is written. A
// face the issuer has from another setup sends the person back to Start, to sign in with that one.

import { useEffect, useRef, useState } from 'react'

import type { Check, Kept } from '../flows/setup.ts'
import { saveProfiles } from '../local.ts'
import { NoPrf } from '../seed/passkey.ts'
import { beginSetup, endSetup, keepSetup, readSetup, withSeed } from '../seed/seed.ts'
import { ServiceError } from '../services/http.ts'
import { settings } from '../settings.ts'
import { profilesOf } from '../vault.ts'
import { DUPLICATE_FACE, Progress, ScanFaceIcon, Spinner, useAction } from '../ui.tsx'

type Props = {
  step: 1 | 2
  draft: Uint8Array | null
  /** The passkey is made: its seed, for the check. */
  onOpened: (seed: Uint8Array) => void
  /** Back to Start, which says why: no PRF from the passkey, or a face with a setup already. */
  onStopped: (why: string) => void
  onDone: () => void
}

export function Setup({ step, draft, onOpened, onStopped, onDone }: Props) {
  if (step === 1) return <Open onOpened={onOpened} onStopped={onStopped} />
  return <Face draft={draft} onStopped={onStopped} onDone={onDone} />
}

function Open({ onOpened, onStopped }: Pick<Props, 'onOpened' | 'onStopped'>) {
  const open = useAction(async () => {
    try {
      onOpened(await beginSetup())
    } catch (err) {
      if (err instanceof NoPrf) return onStopped(err.message)
      throw err
    }
  })
  return (
    <main>
      <Progress step={1} />
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

function Face({ draft, onStopped, onDone }: Pick<Props, 'draft' | 'onStopped' | 'onDone'>) {
  const check = useRef<Check>({})
  const running = useRef<AbortController | null>(null)
  useEffect(() => () => running.current?.abort(), [])
  // The check's tab is open, and the note not yet here.
  const [away, setAway] = useState(false)

  /** The check from where it stopped, with the seed; `page` is the check's tab when a note is still needed. */
  const run = async (seed: Uint8Array, page: Window | null) => {
    running.current = new AbortController()
    let opened = false
    // Setup's own flow: loaded when first needed, not with the first screen.
    const { faceCheck } = await import('../flows/setup.ts')
    try {
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
            return keepSetup(seed, kept)
          },
        },
      )
      saveProfiles(await profilesOf(seed, vault))
    } catch (err) {
      if (!opened) page?.close()
      throw err
    } finally {
      setAway(false)
    }
    endSetup()
    onDone()
  }

  /** The check's tab, opened while the tap counts, so the seed stays here; Didit sends the person back to /back there. */
  const tab = () => {
    if (check.current.note) return null
    const page = window.open('', '_blank')
    if (!page) throw new Error('Allow Forest to open a tab, then start again.')
    return page
  }

  const start = useAction(async () => {
    try {
      // Setup's own seed, in memory since the passkey gave it.
      if (draft) return await run(draft, tab())
      // Taken up again: the seed and what the device kept, after one face.
      await withSeed(async (seed) => {
        if (!check.current.issuer) Object.assign(check.current, (await readSetup<Kept>(seed)) ?? {})
        await run(seed, tab())
      })
    } catch (err) {
      // This passkey can never get a note: the setup is given up, and the person signs in with theirs.
      if (err instanceof ServiceError && err.code === 'duplicate_face') return onStopped(DUPLICATE_FACE)
      throw err
    }
  })

  return (
    <main>
      <Progress step={2} />
      <h1>One face check</h1>
      <p>This ties your passkey to you: one real person, accountable for it.</p>
      <div className="fill stack center" style={{ alignContent: 'center', color: 'var(--ink-2)' }}>
        <ScanFaceIcon />
      </div>
      {start.busy && away && <p className="center">Finish it in the other tab.</p>}
      {start.error && <p className="error">{start.error}</p>}
      <button className="primary" onClick={() => start.run()} disabled={start.busy}>
        {start.busy ? <Spinner /> : 'Start'}
      </button>
    </main>
  )
}
