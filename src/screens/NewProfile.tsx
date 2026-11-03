// New profile: a search box over one list of the markets' roles, "Clothing / seller", those the
// person holds left out. A person with none yet comes here once they are verified, under "Your
// first profile". One pick asks the passkey, and the app makes the profile: its folder funded, its
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
  const list = useProfiles()
  const [first] = useState(list.length === 0)
  const held = new Set(list.map((p) => p.label))
  const [query, setQuery] = useState('')
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
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const shown = pairs.filter((p) => !held.has(p.label) && words.every((w) => p.words.toLowerCase().includes(w)))
  return (
    <main>
      <Top {...(!first && { onBack })} />
      <h1>{first ? 'Your first profile' : 'New profile'}</h1>
      <input type="search" aria-label="Search" placeholder="Search" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
      <Line note={make.note} />
      <div className="rows">
        {shown.map((p) => (
          <button key={p.label} className="row" disabled={make.busy} onClick={() => make.run(p.label)}>
            <span>{p.words}</span>
            {making === p.label ? <Spinner /> : <UnlockIcon />}
          </button>
        ))}
      </div>
    </main>
  )
}
