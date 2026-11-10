// A setup screen on a laptop: from 900px wide, the deep green panel on the left, about 40% of the
// page, with the mark and Forest, and the screen centred on the right, at most 520px wide. On a
// phone, the screen alone: the panel is there, hidden, so the screen keeps its state as the page is
// resized. The setup screens are those App.tsx shows before the frame: Your 24 words, Get verified
// from Start, Your first profile and Making it, and Connect your AI after it.

import type { ReactNode } from 'react'

import { Mark } from '../mark.tsx'

export function Setup({ children }: { children: ReactNode }) {
  return (
    <div className="setup">
      <div className="setup-panel">
        <Mark size={120} />
        <span className="d">Forest</span>
      </div>
      <div className="setup-main">{children}</div>
    </div>
  )
}
