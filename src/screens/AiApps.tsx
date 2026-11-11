// Your AI, from You: one card of the AI apps connected, each on its mint square with its name, how
// many profiles it acts for and since when, opening its own screen (AiApp.tsx); then Connect
// another, which opens Connect your AI, with a back. One connected in another browser with the same
// seed shows here after the next unlock, found by itself (elsewhere-ai.ts).

import { useConnections } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { profileCount } from '../show.ts'
import { Opens, Top, day } from '../ui.tsx'

type Props = { onBack: () => void; onAiApp: (address: string) => void; onConnect: () => void }

export function AiApps({ onBack, onAiApp, onConnect }: Props) {
  const aiApps = useConnections()
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
        <Opens icon="plus" words="Connect another" caret={false} onClick={onConnect} />
      </div>
    </main>
  )
}
