// Your AI, from You: one card of the AI apps connected, each a row on a mint square with its name and
// how many of this device's profiles it acts for (6 profiles; a profile the device has forgotten is
// not counted, and nothing says since when). A row opens in place, under itself, as a passkey does,
// with its profiles as ticks, Save and Disconnect (AiApp.tsx), and a second tap closes it; then
// Connect another, which opens Connect your AI, a page of its own, with a back. One connected in
// another browser with the same seed shows here after the next unlock, found by itself
// (elsewhere-ai.ts).

import { useState } from 'react'

import { useConnections, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { profileCount } from '../show.ts'
import { Opens, Top } from '../ui.tsx'
import { AiApp } from './AiApp.tsx'

type Props = { onBack: () => void; onConnect: () => void }

export function AiApps({ onBack, onConnect }: Props) {
  const aiApps = useConnections()
  const labels = useProfiles().map((p) => p.label)
  // The AI app open in place, by its connection's address.
  const [open, setOpen] = useState<string | null>(null)
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Your AI</h1>
      </Top>
      <div className="rows" role="list" aria-label="Your AI apps">
        {aiApps.map((c) => (
          <div key={c.address} role="listitem" className="opens">
            <button type="button" className="row" aria-expanded={open === c.address} onClick={() => setOpen(open === c.address ? null : c.address)}>
              <span className="sq sm mint">
                <Icon name="sparkle" />
              </span>
              <span className="two">
                <strong>{c.name}</strong>
                <span>{profileCount(c.labels.filter((l) => labels.includes(l)).length)}</span>
              </span>
              <Icon name={open === c.address ? 'caret-up' : 'caret-right'} className="car" />
            </button>
            {open === c.address && <AiApp conn={c} labels={labels} onDone={() => setOpen(null)} />}
          </div>
        ))}
        <Opens icon="plus" words="Connect another" caret={false} onClick={onConnect} />
      </div>
    </main>
  )
}
