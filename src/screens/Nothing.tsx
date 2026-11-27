// A link that matches nothing the person has (links.ts): a back arrow, to Home, and one plain line
// saying so. A listing or conversation link whose profile isn't theirs comes here; one whose profile
// is theirs says it on the screen it opens (Offer.tsx, Thread.tsx).

import { Line, Top } from '../ui.tsx'

/** What a link that matches nothing says. */
export const NOT_YOUR_LISTING = "This listing isn't one of yours."
export const NO_CONVERSATION = 'You have no conversation with this profile.'
export const NO_MARKET = 'Forest has no such market.'

export function Nothing({ said, onBack }: { said: string; onBack: () => void }) {
  return (
    <main>
      <Top onBack={onBack} />
      <Line note={{ text: said, red: false }} />
    </main>
  )
}
