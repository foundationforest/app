// Give credits, from a link alone, /#/give-credits/<Profiles folder address> (links.ts): nothing
// else in the app opens it. A back arrow; "Give 20 credits to this account?", the address shortened
// as a short key is (its first 6 characters and "…"); Give 20 credits, strong green, one unlock
// unless the seed is held, then the credits go from the wallet into that folder (flows/give.ts), and
// the page says so, with Done. Only a checked person gives: a test account is told so in one line.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { GIVE, ONLY_CHECKED, giveCredits } from '../flows/give.ts'
import { Loader } from '../mark.tsx'
import { withSeed } from '../passkey.ts'
import { isTestId } from '../test-account.ts'
import { Line, Top, UnlockIcon, short, useAction } from '../ui.tsx'

export function Give({ to, onBack }: { to: string; onBack: () => void }) {
  const [given, setGiven] = useState(false)
  const give = useAction(async () => {
    await withSeed(passkey()!, (seed) => giveCredits(config, seed, to))
    setGiven(true)
  })
  const test = isTestId(passkey())
  return (
    <main>
      <Top onBack={onBack} />
      <h1>Give credits</h1>
      <p>
        {given ? `${GIVE} credits given to` : `Give ${GIVE} credits to this account?`} <strong>{short(to)}</strong>
      </p>
      <div className="fill" />
      <Line note={test ? { text: ONLY_CHECKED, red: false } : give.note} />
      {given ? (
        <button className="primary" onClick={onBack}>
          Done
        </button>
      ) : (
        <button className="primary" disabled={give.busy || test} onClick={() => give.run()}>
          {give.busy ? <Loader /> : <><UnlockIcon /> Give {GIVE} credits</>}
        </button>
      )}
    </main>
  )
}
