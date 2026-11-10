// New profile, in two steps. First every market, "Clothing", with a search box over their words and
// their roles'. Then a market's roles, "Seller": one the person has shows "Yours", quietly, and a
// tap opens that profile; any other shows a +, and one tap asks the passkey (a row never shows the
// unlock icon) and makes the profile: its folder funded, its verification proven on the device, its
// profile entry written, its label in the Profiles folder. A person with none yet comes here once
// they are verified, under "Your first profile". The market picked is kept in the page's history
// (App.tsx), so a reload keeps it.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { makeProfile } from '../flows/profile.ts'
import { useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { marketList, roleWords } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Line, Top, useAction } from '../ui.tsx'

type Props = { market?: string; onMarket: (name: string) => void; onMade: (address: string, first: boolean) => void; onOpen: (address: string) => void; onBack: () => void }

export function NewProfile({ market: name, onMarket, onMade, onOpen, onBack }: Props) {
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
  const market = marketList.find((m) => m.market === name)

  if (market) {
    return (
      <main>
        <Top onBack={onBack} />
        <h1>{market.words}</h1>
        <Line note={make.note} />
        <div className="rows">
          {market.roles.map((p) => {
            // The one being made keeps its loader until its profile opens.
            const had = making === p.label ? undefined : list.find((q) => q.label === p.label)
            return (
              <button key={p.label} className="row" disabled={make.busy} onClick={() => (had ? onOpen(had.address) : make.run(p.label))}>
                <span>{roleWords(p.role)}</span>
                {making === p.label ? <Loader /> : had ? <span className="aside">Yours</span> : <Icon name="plus" />}
              </button>
            )
          })}
        </div>
      </main>
    )
  }
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const shown = marketList.filter((m) => words.every((w) => [m.words, ...m.roles.map((p) => p.role)].join(' ').toLowerCase().includes(w)))
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
