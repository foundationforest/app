// New profile: one list of the markets' roles, in each market's words, those the person holds left
// out. One pick asks the passkey, and the app makes the profile: its folder funded, its
// verification proven on the device, its profile entry written, its label in the Profiles folder.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { makeProfile } from '../flows/profile.ts'
import { useProfiles } from '../hooks.ts'
import { pairs } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'

type Props = { onMade: (address: string) => void; onBack: () => void }

export function NewProfile({ onMade, onBack }: Props) {
  const held = new Set(useProfiles().map((p) => p.label))
  const [making, setMaking] = useState<string | null>(null)
  const make = useAction(async (label: string) => {
    setMaking(label)
    try {
      const made = await withSeed(passkey()!, (seed) => makeProfile(config, seed, label, proveInWorker))
      onMade(made.address)
    } finally {
      setMaking(null)
    }
  })
  return (
    <main>
      <Top onBack={onBack} />
      <h1>New profile</h1>
      <Line note={make.note} />
      <div className="rows">
        {pairs
          .filter((p) => !held.has(p.label))
          .map((p) => (
            <button key={p.label} className="row" disabled={make.busy} onClick={() => make.run(p.label)}>
              <span>{p.words}</span>
              {making === p.label ? <Spinner /> : <UnlockIcon />}
            </button>
          ))}
      </div>
    </main>
  )
}
