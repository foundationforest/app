// Your first profile, once the person is verified, or New profile, from Home: every market as a
// tile, live and beta alike, two to a row, a tint of its color, its icon in its color, its name, and
// a small Beta chip on a beta one's corner, under a search box over the markets' words and their
// roles'. A tile opens its roles on a sheet (RoleSheet.tsx); one tap on a role asks the passkey if
// no seed is held and makes the profile: its folder funded, its verification proven on the device,
// its profile entry written, its label in the Profiles folder. Meanwhile, the loader and "Making
// your Tutoring tutor". Your first profile is a setup step: being verified can't be undone, so it
// has no back, but Later, at its top right, which goes on to Connect your AI, and "You're verified"
// under its title. New profile has a back. The market picked is kept in the page's history
// (App.tsx), so a reload keeps its sheet open.

import { type CSSProperties, useState } from 'react'

import { colorOf, iconOf } from '../avatar.tsx'
import { config } from '../config.ts'
import { checks, passkey } from '../device.ts'
import { makeProfile } from '../flows/profile.ts'
import { useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { marketList, pairOf } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Top, YoureVerified, useAction } from '../ui.tsx'
import { RoleSheet } from './RoleSheet.tsx'

type Props = {
  market?: string
  /** A tile tapped, its sheet open; null, the sheet closed. */
  onMarket: (name: string | null) => void
  onMade: (address: string, first: boolean) => void
  onOpen: (address: string) => void
  onBack: () => void
  onLater: () => void
}

export function NewProfile({ market: name, onMarket, onMade, onOpen, onBack, onLater }: Props) {
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

  if (making)
    return (
      <main>
        <div className="fill" />
        <div className="waiting">
          <Loader big />
          <span>Making your {pairOf(making).words}</span>
        </div>
        <div className="fill" />
      </main>
    )

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const shown = marketList.filter((m) => words.every((w) => [m.words, ...m.roles.map((p) => p.role)].join(' ').toLowerCase().includes(w)))
  return (
    <main>
      {first ? (
        <>
          <div className="titled-row">
            <h1>Your first profile</h1>
            <button className="quiet" onClick={onLater}>
              Later
            </button>
          </div>
          <div>
            <YoureVerified check={checks().includes('id') ? 'id' : 'face'} />
          </div>
        </>
      ) : (
        <>
          <Top onBack={onBack} />
          <h1>New profile</h1>
        </>
      )}
      <input type="search" aria-label="Search" placeholder="Search" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="market-tiles">
        {shown.map((m) => {
          const icon = iconOf(m.market)
          return (
            <button key={m.market} className="market-tile" style={{ '--h': colorOf(m.market) } as CSSProperties} aria-label={m.beta ? `${m.words}, beta` : m.words} onClick={() => onMarket(m.market)}>
              {icon ? <Icon name={icon} fill /> : <span className="letter" aria-hidden>{m.words.charAt(0)}</span>}
              <span className="tile-name">{m.words}</span>
              {m.beta && <span className="chip beta">Beta</span>}
            </button>
          )
        })}
      </div>
      {market && <RoleSheet market={market} mine={list} note={make.note} busy={make.busy} onPick={(label) => void make.run(label)} onOpen={onOpen} onClose={() => onMarket(null)} />}
    </main>
  )
}
