// Your AI, from You: one card of the AI apps connected, each on its mint square with its name, how
// many profiles it acts for and since when, opening its own screen (AiApp.tsx). When a profile entry
// lists an access key this device doesn't know (made in another browser with the same seed), one row
// more, Find AI apps, finds them from the seed: one unlock, though a row shows no unlock icon. Then
// Connect another, which opens Connect your AI, with a back.

import { useState } from 'react'

import { config } from '../config.ts'
import { knownKeys, passkey } from '../device.ts'
import { findConnections } from '../flows/connections.ts'
import { useCards, useConnections, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { withSeed } from '../passkey.ts'
import { profileCount } from '../show.ts'
import { Line, Opens, Top, day, useAction } from '../ui.tsx'

type Props = { onBack: () => void; onAiApp: (address: string) => void; onConnect: () => void }

export function AiApps({ onBack, onAiApp, onConnect }: Props) {
  const list = useProfiles()
  const [found, setFound] = useState(0)
  const cards = useCards(list, found)
  const aiApps = useConnections()
  const known = new Set(knownKeys())
  const unknown = Object.values(cards).some((c) => c.keys.some((k) => !known.has(k)))
  const find = useAction(async () => {
    await withSeed(passkey()!, (seed) => findConnections(config, seed))
    setFound((n) => n + 1)
  })
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Your AI</h1>
      </Top>
      <div className="rows">
        {aiApps.map((c) => (
          <button key={c.address} className="row" onClick={() => onAiApp(c.address)}>
            <span className="sq sm mint">
              <Icon name="sparkle" />
            </span>
            <span className="two">
              <strong>{c.name}</strong>
              <span>
                {profileCount(c.labels.length)}, since {day(c.time)}
              </span>
            </span>
            <Icon name="caret-right" className="car" />
          </button>
        ))}
        {unknown && (
          <button className="row" disabled={find.busy} onClick={() => find.run()}>
            <span>Find AI apps</span>
            {find.busy && <Loader />}
          </button>
        )}
        <Opens icon="plus" words="Connect another" caret={false} onClick={onConnect} />
      </div>
      <Line note={find.note} />
    </main>
  )
}
