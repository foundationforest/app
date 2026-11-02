// Profiles, the person's home: one card per profile, its market, its role and how it is verified,
// those that offer first. Nothing here asks the passkey: the device keeps which profiles are the
// person's, and each card's profile entry is public.

import { CHECK_WORDS, useChecks, useProfiles } from '../hooks.ts'
import { Mark } from '../mark.tsx'
import { marketWords, pairOf, pairs } from '../markets.ts'
import { type Place, Places, Top } from '../ui.tsx'

type Props = { onOpen: (address: string) => void; onNew: () => void; go: (to: Place) => void }

export function Profiles({ onOpen, onNew, go }: Props) {
  const list = useProfiles()
  const checks = useChecks(list)
  const shown = list.map((p) => ({ ...p, pair: pairOf(p.label) })).sort((a, b) => Number(b.pair.offers) - Number(a.pair.offers) || a.pair.words.localeCompare(b.pair.words))
  const held = new Set(list.map((p) => p.label))
  return (
    <main>
      <Top>
        <Mark />
      </Top>
      <div className="cards">
        {shown.map((p) => (
          <button key={p.address} className="card" onClick={() => onOpen(p.address)}>
            <strong>{marketWords(p.pair.market)}</strong>
            <span>{p.pair.role}</span>
            <span className="badges">
              {(checks[p.address] ?? []).map((c) => (
                <span key={c} className="badge">
                  {CHECK_WORDS[c]}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
      <div className="fill" />
      {pairs.some((p) => !held.has(p.label)) && (
        <button className="primary" onClick={onNew}>
          New profile
        </button>
      )}
      <Places at="profiles" go={go} />
    </main>
  )
}
