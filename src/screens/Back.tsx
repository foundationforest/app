// Where Didit sends the person when the face check ends, in the tab the check opened. The setup tab
// is waiting for the note; this one closes itself where the browser lets it.

import { useEffect } from 'react'

import { Mark } from '../mark.tsx'

export function Back() {
  useEffect(() => window.close(), [])
  return (
    <main>
      <div className="fill" />
      <div className="stack center">
        <Mark size={56} />
        <h1>Done</h1>
      </div>
      <div className="fill" />
    </main>
  )
}
