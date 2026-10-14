// The start: Start, which sets up with a new passkey, or Sign in, with one the person has: one face,
// the vault read, the board kept on this device, the fingerprint kept. A passkey with no vault, every
// host having answered, stopped before its face check was done: it goes on to the face check, here
// or on another device. Where the browser says it cannot ask a passkey for PRF at all, Start says so
// in place of both, and stops. What a step sent back here says (no PRF from the passkey made, a face
// that has a setup already) shows above them. Start always makes a passkey and never asks for one:
// where the person's manager holds a Forest passkey this device knows, setup sends them back here
// saying so, with Sign in under way, whose sheet takes up the setup that passkey began.

import { useEffect, useRef, useState } from 'react'

import { type Pull, sendPulls, signPulls } from '../inbox.ts'
import { saveProfiles } from '../local.ts'
import { Mark } from '../mark.tsx'
import { NoPrf, type Passkey, browserLacksPrf } from '../seed/passkey.ts'
import { signingIn } from '../seed/seed.ts'
import { settings } from '../settings.ts'
import { Spinner, useAction } from '../ui.tsx'
import { lazy } from '../version.ts'

type Props = {
  said?: string
  /** Sign in at once: Start found a Forest passkey in the person's manager. */
  signInNow?: boolean
  /** Sign in was asked for at once: Start opened again later does not ask again. */
  onSigningIn?: () => void
  onStart: () => void
  onSignedIn: () => void
  /** A passkey with no setup, or the one of the setup under way: its face check, with its seed. */
  onNoSetup: (passkey: Passkey) => void
}

export function Start({ said, signInNow = false, onSigningIn, onStart, onSignedIn, onNoSetup }: Props) {
  const [stopped, setStopped] = useState(false)
  const [note, setNote] = useState(said ?? '')
  useEffect(() => {
    void browserLacksPrf().then(setStopped)
  }, [])

  const signIn = useAction(async (now = false) => {
    if (!now) setNote('')
    const { signIn } = await lazy(() => import('../flows/signin.ts'))
    let pulls: Pull[] = []
    const noSetup = await signingIn(async (seed) => {
      const profiles = await signIn(seed, settings())
      if (!profiles) return false
      saveProfiles(profiles)
      pulls = await signPulls(seed, profiles)
      return true
    }).catch((err) => {
      // The sheet opened on its own, closed, or refused by a browser that wants a tap first: the line says to sign in, and Sign in is there.
      if (now && err instanceof DOMException && err.name === 'NotAllowedError') return null
      throw err
    })
    if (noSetup === null) return
    if (noSetup) return onNoSetup(noSetup)
    void sendPulls(pulls)
    onSignedIn()
  })
  // Once, as Start opens with Sign in under way: the ref outlives React's second run of effects in development.
  const asked = useRef(false)
  useEffect(() => {
    if (!signInNow || asked.current) return
    asked.current = true
    onSigningIn?.()
    void signIn.run(true)
  }, [])
  const shown = signIn.error || note

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
        <p className="error">{new NoPrf('browser').message}</p>
      ) : (
        <div className="stack">
          {shown && <p className="error">{shown}</p>}
          <button className="primary" onClick={onStart} disabled={signIn.busy}>
            Start
          </button>
          <button className="quiet wide" onClick={() => signIn.run()} disabled={signIn.busy}>
            {signIn.busy ? <Spinner /> : 'Sign in'}
          </button>
        </div>
      )}
    </main>
  )
}
