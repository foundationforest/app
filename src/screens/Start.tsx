// The start: Start, which sets up with a new passkey, or Sign in, with one the person has: one face,
// the vault read, the board kept on this device, the fingerprint kept. A passkey with no vault, every
// host having answered, stopped before its face check was done: it goes on to the face check. Where
// the browser says it cannot ask a passkey for PRF at all, Start says so in place of both, and stops.
// What a step sent back here says (no PRF from the passkey made, one made before, a face that has a
// setup already) shows above them. With a setup under way on this device, Start takes it up with its
// own passkey, after one face, never making another; and Forget this device gives it up.

import { useEffect, useState } from 'react'

import { applyAppearance } from '../appearance.ts'
import { type Pull, sendPulls, signPulls } from '../inbox.ts'
import { forgetLocal, saveProfiles } from '../local.ts'
import { Mark } from '../mark.tsx'
import { NoPrf, type Passkey, browserLacksPrf } from '../seed/passkey.ts'
import { dropSetup, resumeSetup, setupDropsPasskey, signingIn } from '../seed/seed.ts'
import { settings } from '../settings.ts'
import { Spinner, useAction } from '../ui.tsx'
import { lazy } from '../version.ts'

type Props = {
  said?: string
  /** A setup is under way on this device: Start takes it up. */
  underWay: boolean
  onStart: () => void
  onSignedIn: () => void
  /** A passkey with no setup, or the one of the setup under way: its face check, with its seed. */
  onNoSetup: (passkey: Passkey) => void
  /** The setup under way given up. */
  onForgotten: () => void
}

export function Start({ said, underWay, onStart, onSignedIn, onNoSetup, onForgotten }: Props) {
  const [stopped, setStopped] = useState(false)
  const [note, setNote] = useState(said ?? '')
  const [sure, setSure] = useState(false)
  useEffect(() => {
    void browserLacksPrf().then(setStopped)
  }, [])

  const start = useAction(async () => {
    setNote('')
    if (!underWay) return onStart()
    onNoSetup(await resumeSetup())
  })
  const signIn = useAction(async () => {
    setNote('')
    const { signIn } = await lazy(() => import('../flows/signin.ts'))
    let pulls: Pull[] = []
    const noSetup = await signingIn(async (seed) => {
      const profiles = await signIn(seed, settings())
      if (!profiles) return false
      saveProfiles(profiles)
      pulls = await signPulls(seed, profiles)
      return true
    })
    if (noSetup) return onNoSetup(noSetup)
    void sendPulls(pulls)
    onSignedIn()
  })
  const forget = async () => {
    await dropSetup()
    forgetLocal()
    applyAppearance('device')
    setSure(false)
    onForgotten()
  }
  const shown = start.error || signIn.error || note
  const busy = start.busy || signIn.busy

  return (
    <main>
      <div className="fill" />
      <div className="stack center">
        <Mark size={72} />
        <h1>Forest</h1>
        <p>One human, one record, any market, no one in between.</p>
      </div>
      <div className="fill" />
      {stopped ? (
        <p className="error">{new NoPrf(true).message}</p>
      ) : (
        <div className="stack">
          {shown && <p className="error">{shown}</p>}
          <button className="primary" onClick={() => start.run()} disabled={busy}>
            {start.busy ? <Spinner /> : 'Start'}
          </button>
          <button className="quiet wide" onClick={() => signIn.run()} disabled={busy}>
            {signIn.busy ? <Spinner /> : 'Sign in'}
          </button>
          {underWay &&
            (sure ? (
              <>
                <p>{setupDropsPasskey() ? 'Your setup stops here, and the passkey it made is dropped from your password manager.' : 'Your passkey stays in your password manager. Sign in with it to come back.'}</p>
                <button className="line" onClick={forget} disabled={busy}>
                  Forget this device
                </button>
              </>
            ) : (
              <button className="line" onClick={() => setSure(true)} disabled={busy}>
                Forget this device
              </button>
            ))}
        </div>
      )}
    </main>
  )
}
