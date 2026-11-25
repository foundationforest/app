// Your data, from About Forest: Back, and four blocks, each an icon in a soft square, a bold title and
// its words: what is public, what is private, what is kept apart, and what the checks keep.

import { type IconName, Icon } from '../icons.tsx'
import { Top } from '../ui.tsx'

export const BLOCKS: Array<[IconName, string, string]> = [
  ['user', 'Public', 'Your profiles, listings and reviews. Anyone can see them.'],
  ['lock-simple', 'Private', 'Encrypted with your passkey. Only you, and whoever you let in, can read it.'],
  ['shield-check', 'Kept apart', 'No one can tell your profiles belong to the same person.'],
  ['identification-card', 'Your checks', "We only keep what's necessary to stop someone verifying twice."],
]

export function YourData({ onBack }: { onBack: () => void }) {
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Your data</h1>
      </Top>
      <div className="data-blocks">
        {BLOCKS.map(([icon, title, words]) => (
          <section key={title} className="data-block" aria-label={title}>
            <span className="sq plain">
              <Icon name={icon} />
            </span>
            <div className="two">
              <strong>{title}</strong>
              <span>{words}</span>
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
