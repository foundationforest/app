// A market's roles, a sheet from its tile on Your first profiles or New profile (NewProfile.tsx): the
// market's icon on its color; its name; "Beta" under it for a beta market; its summary (the one line
// its file gives for where someone picks a market). Then each role a row: its avatar (the profile it
// would be, its market's icon on its color, solid when it offers, light when it requests) and its
// name, and at its right Create, strong green, with its plus (or the unlock icon while a tap will ask
// the passkey), or, for a role the person has, a round soft green ✓ that opens it. Create makes the
// profile right there, as New profile always has (flows/profile.ts), and the sheet stays open, the
// row its ✓ now.
//
// When an AI app acts for some of the person's profiles, Create turns the sheet into what was made: a
// round soft green ✓ and "<Role> profile created", the market under it; "Your AI can use it" ("Your
// AIs can use it" for more than one); each AI app a row, its sparkle, its name and a round tick, on;
// a tap turns one off; Done, strong green, gives the new profile to each app ticked (as Your AI's Save
// does, flows/connections.ts, `actFor`, the seed held) and closes the sheet.

import { type CSSProperties, useState } from 'react'

import { Avatar, MarketIcon, colorOf, iconOf } from '../avatar.tsx'
import { config } from '../config.ts'
import { type Profile, passkey } from '../device.ts'
import { actFor } from '../flows/connections.ts'
import { makeProfile } from '../flows/profile.ts'
import { useConnections, useHeld } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { type MarketRoles, roleWords } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { proveInWorker } from '../proof/prove.ts'
import { Sheet } from '../sheet.tsx'
import { Line, UnlockIcon, useAction } from '../ui.tsx'
import { RoundTick } from './Ticks.tsx'

type Props = { market: MarketRoles; mine: Profile[]; onOpen: (address: string) => void; onClose: () => void }

/** A market's icon on its color, white, as a profile of it shows. */
export function MarketMark({ market, words }: { market: string; words: string }) {
  const icon = iconOf(market)
  return (
    <span className="market-icon" style={{ '--h': colorOf(market) } as CSSProperties} aria-hidden>
      {icon ? <MarketIcon name={icon} /> : <span className="letter">{words.charAt(0)}</span>}
    </span>
  )
}

export function MarketSheet({ market, mine, onOpen, onClose }: Props) {
  const held = useHeld()
  const aiApps = useConnections()
  const [making, setMaking] = useState<string | null>(null)
  // The profile just made, while its AI apps are picked.
  const [made, setMade] = useState<string | null>(null)
  const [ticked, setTicked] = useState<Set<string>>(new Set())
  const make = useAction(async (label: string) => {
    setMaking(label)
    try {
      await withSeed(passkey()!, (seed) => makeProfile(config, seed, label, proveInWorker))
    } finally {
      setMaking(null)
    }
    if (aiApps.length) {
      setTicked(new Set(aiApps.map((c) => c.address)))
      setMade(label)
    }
  })
  const done = useAction(async () => {
    const label = made!
    await withSeed(passkey()!, async (seed) => {
      for (const c of aiApps) if (ticked.has(c.address)) await actFor(config, seed, c.address, [label], [])
    })
    onClose()
  })
  const tick = (address: string) =>
    setTicked((was) => {
      const now = new Set(was)
      if (!now.delete(address)) now.add(address)
      return now
    })

  if (made) {
    const role = market.roles.find((p) => p.label === made)!.role
    return (
      <Sheet label={`${roleWords(role)} profile created`} onClose={onClose}>
        <div className="made">
          <span className="done-round" aria-hidden>
            <Icon name="check" bold />
          </span>
          <h2>{roleWords(role)} profile created</h2>
          <p className="s">{market.words}</p>
        </div>
        <h3 className="sec">{aiApps.length > 1 ? 'Your AIs can use it' : 'Your AI can use it'}</h3>
        <div className="rows">
          {aiApps.map((c) => (
            <button key={c.address} type="button" className="row" role="checkbox" aria-checked={ticked.has(c.address)} disabled={done.busy} onClick={() => tick(c.address)}>
              <span className="sq sm plain">
                <Icon name="sparkle" fill />
              </span>
              <strong className="grow">{c.name}</strong>
              <RoundTick ticked={ticked.has(c.address)} />
            </button>
          ))}
        </div>
        <Line note={done.note} />
        <button type="button" className="primary" disabled={done.busy} onClick={() => done.run()}>
          {done.busy ? <Loader /> : 'Done'}
        </button>
      </Sheet>
    )
  }

  return (
    <Sheet label={market.words} onClose={onClose} className="market-sheet">
      <div className="sheet-head">
        <MarketMark market={market.market} words={market.words} />
        <div className="stack">
          <h2>{market.words}</h2>
          {market.beta && <p className="beta-line">Beta</p>}
          {market.summary && <p className="lead">{market.summary}</p>}
        </div>
      </div>
      <Line note={make.note} />
      <div className="rows">
        {market.roles.map((p) => {
          const had = mine.find((q) => q.label === p.label)
          return (
            <div key={p.label} className="row role-row">
              <Avatar label={p.label} size="sm" />
              <strong className="grow">{roleWords(p.role)}</strong>
              {had ? (
                <button type="button" className="round yours-round" aria-label={`Open ${p.role}`} onClick={() => onOpen(had.address)}>
                  <Icon name="check" bold />
                </button>
              ) : (
                <button type="button" className="primary small create" disabled={make.busy} aria-label={`Create ${p.role}`} onClick={() => make.run(p.label)}>
                  {making === p.label ? <Loader /> : <>{held ? <Icon name="plus" bold /> : <UnlockIcon />}Create</>}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}
