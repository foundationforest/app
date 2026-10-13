// The start: Start, which sets up with a new passkey, or Sign in, with one the person has: one face,
// the vault read, the board kept on this device, the fingerprint kept. Where the browser says it
// cannot ask a passkey for PRF at all, it says so in place of both, and stops. What a step sent back
// here says (no PRF from the passkey made, a face that has a setup already) shows above them.

import { useEffect, useState } from 'react'

import { type Pull, sendPulls, signPulls } from '../inbox.ts'
import { saveProfiles } from '../local.ts'
import { NoPrf, browserLacksPrf } from '../seed/passkey.ts'
import { signingIn } from '../seed/seed.ts'
import { settings } from '../settings.ts'
import { Mark, Spinner, useAction } from '../ui.tsx'

export function Start({ said, onStart, onSignedIn }: { said?: string; onStart: () => void; onSignedIn: () => void }) {
  const [stopped, setStopped] = useState(false)
  const [note, setNote] = useState(said ?? '')
  useEffect(() => {
    void browserLacksPrf().then(setStopped)
  }, [])

  const signIn = useAction(async () => {
    setNote('')
    const { signIn } = await import('../flows/signin.ts')
    let pulls: Pull[] = []
    await signingIn(async (seed) => {
      const profiles = await signIn(seed, settings())
      saveProfiles(profiles)
      pulls = await signPulls(seed, profiles)
    })
    void sendPulls(pulls)
    onSignedIn()
  })
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
        <p className="error">{new NoPrf(true).message}</p>
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
