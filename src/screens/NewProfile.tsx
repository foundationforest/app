// A new profile: a market from the index's list, grouped by the directory's folders and filtered as
// the person types; then its side, in the market's own words; then Make, with the face.

import { useEffect, useState } from 'react'

import type { Nav } from '../App.tsx'
import { type Market, marketOf, roleWord, rolesOf, words } from '../cards.ts'
import { withFace } from '../face.ts'
import { localProfiles, saveProfiles } from '../local.ts'
import * as indexes from '../services/indexes.ts'
import { settings } from '../settings.ts'
import { BackIcon, Spinner, errorText, useAction } from '../ui.tsx'
import { lazy } from '../version.ts'

type Folder = { folder: string; markets: { name: string }[] }

const MARKETS_REPO = 'https://github.com/foundationforest/markets'

export function NewProfile({ nav, onMade }: { nav: Nav; onMade: () => void }) {
  const [folders, setFolders] = useState<Folder[]>()
  const [failed, setFailed] = useState('')
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState('')
  const [market, setMarket] = useState<Market | null>()
  const [role, setRole] = useState('')
  const held = new Set(localProfiles().map((p) => p.label))

  useEffect(() => {
    indexes.home(settings().index).then(
      (home) => setFolders(home.folders as Folder[]),
      (err) => setFailed(errorText(err)),
    )
  }, [])

  const pick = (name: string) => {
    setPicked(name)
    setMarket(undefined)
    setRole('')
    marketOf(settings().index, name).then(
      (m) => {
        setMarket(m)
        const open = m ? rolesOf(m).filter((r) => !held.has(`${name}/${r}`)) : []
        if (m && rolesOf(m).length === 1 && open.length === 1) setRole(open[0]!)
      },
      (err) => setFailed(errorText(err)),
    )
  }

  const make = useAction(async () => {
    const s = settings()
    const [{ makeProfile }, { proveInWorker }] = await Promise.all([lazy(() => import('../flows/profile.ts')), lazy(() => import('../proof/worker.ts'))])
    await withFace(async (seed) => saveProfiles(await makeProfile(seed, `${picked}/${role}`, s, proveInWorker)))
    onMade()
  })

  const needle = q.trim().toLowerCase()
  const shown = (folders ?? [])
    .map((f) => ({ ...f, markets: f.markets.filter((m) => !needle || words(m.name).toLowerCase().includes(needle) || words(f.folder).toLowerCase().includes(needle)) }))
    .filter((f) => f.markets.length)

  return (
    <main>
      <div className="bar">
        <div>
          <button className="icon" aria-label="Back" onClick={() => (picked && !make.busy ? setPicked('') : nav.back())}>
            <BackIcon />
          </button>
        </div>
      </div>
      <h1>{picked ? words(picked) : 'New profile'}</h1>

      {!picked && (
        <>
          <input className="field" type="search" placeholder="Market" aria-label="Market" value={q} onChange={(e) => setQ(e.target.value)} />
          <div>
            {shown.map((f) => (
              <div className="group" key={f.folder}>
                <h2>{words(f.folder)}</h2>
                {f.markets.map((m) => (
                  <button key={m.name} onClick={() => pick(m.name)}>
                    {words(m.name)}
                  </button>
                ))}
              </div>
            ))}
          </div>
          {!folders && !failed && <Spinner />}
          {failed && <p className="error">{failed}</p>}
          <p>
            <a href={MARKETS_REPO} target="_blank" rel="noreferrer">
              Propose one
            </a>
          </p>
        </>
      )}

      {picked && (
        <>
          {market === undefined && !failed && <Spinner />}
          {market === null && <p className="error">This index does not use this market.</p>}
          {market && (
            <div className="sides" role="radiogroup" aria-label="Side">
              {rolesOf(market).map((r) => (
                <button key={r} role="radio" aria-checked={role === r} className={role === r ? 'on' : ''} disabled={held.has(`${picked}/${r}`) || make.busy} onClick={() => setRole(r)}>
                  {words(roleWord(r, market))}
                </button>
              ))}
            </div>
          )}
          <div className="fill" />
          {(make.error || failed) && <p className="error">{make.error || failed}</p>}
          <button className="primary" disabled={!role || make.busy} onClick={() => make.run()}>
            {make.busy ? <Spinner /> : 'Make'}
          </button>
        </>
      )}
    </main>
  )
}
