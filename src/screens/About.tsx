// About Forest, from You: three rows, Privacy, Terms and Source code, each a link that opens in a new
// tab (config.ts names them), and this build's version, quietly at the foot: the commit it was built
// from (vite.config.ts). Links only: nothing here reaches another site until the person taps one.

import { config } from '../config.ts'
import { Icon } from '../icons.tsx'
import { Top } from '../ui.tsx'

const LINKS = [
  ['Privacy', config.privacy],
  ['Terms', config.terms],
  ['Source code', config.source],
] as const

export function About({ onBack }: { onBack: () => void }) {
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>About Forest</h1>
      </Top>
      <div className="rows">
        {LINKS.map(([words, href]) => (
          <a key={words} className="row" href={href} target="_blank" rel="noopener noreferrer">
            <span>{words}</span>
            <Icon name="arrow-up-right" bold />
          </a>
        ))}
      </div>
      <div className="fill" />
      <p className="xs center">Version {__COMMIT__}</p>
    </main>
  )
}
