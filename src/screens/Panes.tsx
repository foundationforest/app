// Messages on a laptop: two panes beside the sidebar, the conversations on the left (Messages.tsx,
// with its chips) and the one open on the right (Thread.tsx), each scrolling on its own; with none
// open, one quiet line. Opening Messages opens no conversation by itself, so none is read unseen. A
// phone shows one screen at a time instead (App.tsx).

import type { ReactNode } from 'react'

export function Panes({ list, open }: { list: ReactNode; open: ReactNode | null }) {
  return (
    <main className="panes">
      <section className="pane-list" aria-label="Conversations">
        {list}
      </section>
      <section className="pane-open" aria-label="Conversation">
        {open ?? <p className="line pick-one">Pick a conversation.</p>}
      </section>
    </main>
  )
}
