// About Forest, from You: Back, and one card: Your data, Privacy and Terms, each a page of the app's
// own, with its caret; Source code, in a new tab. Under the card, centred, small and grey: the mark,
// then who runs this copy (config.ts, `company`), each line only when it is set: its name, in bold;
// where it is registered, and its number; its office's address; and the address to write to, a mailto
// link. Links only: nothing here reaches another site until the person taps one.

import { config } from '../config.ts'
import { Icon } from '../icons.tsx'
import { Mark } from '../mark.tsx'
import { Top } from '../ui.tsx'

type Props = { onBack: () => void; onData: () => void; onPrivacy: () => void; onTerms: () => void }

export function About({ onBack, onData, onPrivacy, onTerms }: Props) {
  const { name, registered, number, office } = config.company
  const where = [registered, number].filter(Boolean).join(', ')
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>About Forest</h1>
      </Top>
      <div className="rows">
        {(
          [
            ['Your data', onData],
            ['Privacy', onPrivacy],
            ['Terms', onTerms],
          ] as const
        ).map(([words, onClick]) => (
          <button key={words} className="row" onClick={onClick}>
            <strong className="grow">{words}</strong>
            <Icon name="caret-right" className="car" />
          </button>
        ))}
        <a className="row" href={config.source} target="_blank" rel="noopener noreferrer">
          <strong className="grow">Source code</strong>
          <Icon name="arrow-up-right" bold />
        </a>
      </div>
      <div className="company">
        <Mark size={28} />
        {name && <strong>{name}</strong>}
        {where && <span>{where}</span>}
        {office && <span>{office}</span>}
        {config.contact && <a href={`mailto:${config.contact}`}>{config.contact}</a>}
      </div>
    </main>
  )
}
