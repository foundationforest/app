// New profile, in two steps. First the markets, "Clothing", with a search box over their words and
// their roles', those whose every role the person holds left out. Then a market's roles, "Seller",
// those the person holds left out; one tap asks the passkey, and the app makes the profile: its
// folder funded, its verification proven on the device, its profile entry written, its label in the
// Profiles folder. A person with none yet comes here once they are verified, under "Your first
// profile". The market picked is kept in the page's history (App.tsx), so a reload keeps it.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { makeProfile } from '../flows/profile.ts'
import { useProfiles } from '../hooks.ts'
import { marketsLeft, roleWords } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'

type Props = { market?: string; onMarket: (name: string) => void; onMade: (address: string, first: boolean) => void; onBack: () => void }

export function NewProfile({ market: name, onMarket, onMade, onBack }: Props) {
  const list = useProfiles()
  const [first] = useState(list.length === 0)
  const [query, setQuery] = useState('')
  const [making, setMaking] = useState<string | null>(null)
  const make = useAction(async (label: string) => {
    setMaking(label)
    try {
      const made = await withSeed(passkey()!, (seed) => makeProfile(config, seed, label, proveInWorker))
      onMade(made.address, first)
    } finally {
      setMaking(null)
    }
  })
  // The one being made stays listed, its spinner on it, until its profile opens.
  const left = marketsLeft(new Set(list.map((p) => p.label).filter((label) => label !== making)))
  const market = left.find((m) => m.market === name)

  if (market) {
    return (
      <main>
        <Top onBack={onBack} />
        <h1>{market.words}</h1>
        <Line note={make.note} />
        <div className="rows">
          {market.roles.map((p) => (
            <button key={p.label} className="row" disabled={make.busy} onClick={() => make.run(p.label)}>
              <span>{roleWords(p.role)}</span>
              {making === p.label ? <Spinner /> : <UnlockIcon />}
            </button>
          ))}
        </div>
      </main>
    )
  }
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const shown = left.filter((m) => words.every((w) => [m.words, ...m.roles.map((p) => p.role)].join(' ').toLowerCase().includes(w)))
  return (
    <main>
      <Top onBack={onBack} />
      <h1>{first ? 'Your first profile' : 'New profile'}</h1>
      <input type="search" aria-label="Search" placeholder="Search" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="rows">
        {shown.map((m) => (
          <button key={m.market} className="row" onClick={() => onMarket(m.market)}>
            <span>{m.words}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
