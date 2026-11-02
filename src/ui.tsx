// The pieces every screen shares: the one-line note that says why something can't be done (red when
// what was given is wrong, quiet when something is still missing), an action's busy and its note,
// the icons, and the bars.

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { NotFinished } from './flows/verify.ts'
import { HasPasskey, NoAnswer, OldBrowser } from './passkey.ts'
import { NoCredits } from './services/credits.ts'
import { Unreachable } from './services/http.ts'
import { Reloading } from './version.ts'

export type Note = { text: string; red: boolean }

/** Something still missing, said in a quiet line. */
export class Quiet extends Error {}

/** What went wrong, as one line: quiet for what is still missing (a service that did not answer, credits, a newer browser), red for the rest. */
export function noteOf(err: unknown): Note {
  const quiet = [Quiet, Unreachable, OldBrowser, NoCredits, HasPasskey, NoAnswer, NotFinished].some((kind) => err instanceof kind)
  return { text: err instanceof Error ? err.message : String(err), red: !quiet }
}

export function Line({ note }: { note: Note | null }) {
  if (!note) return null
  return <p className={note.red ? 'line red' : 'line'}>{note.text}</p>
}

/** An action a tap starts: whether it is running, and its note when it failed. A page reloading for a new version says nothing. */
export function useAction<A extends unknown[]>(run: (...args: A) => Promise<void>) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<Note | null>(null)
  const live = useRef(true)
  useEffect(() => () => void (live.current = false), [])
  const go = useCallback(
    async (...args: A) => {
      setBusy(true)
      setNote(null)
      try {
        await run(...args)
      } catch (err) {
        if (live.current && !(err instanceof Reloading)) setNote(noteOf(err))
      } finally {
        if (live.current) setBusy(false)
      }
    },
    [run],
  )
  return { busy, note, setNote, run: go }
}

export const Spinner = () => <span className="spinner" role="status" aria-label="Working" />

const Icon = ({ children }: { children: ReactNode }) => (
  <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

/** Wherever the passkey is asked. */
export const UnlockIcon = () => (
  <Icon>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 7.6-1.7" />
  </Icon>
)
export const BackIcon = () => (
  <Icon>
    <polyline points="15,5 8,12 15,19" />
  </Icon>
)
export const ProfilesIcon = () => (
  <Icon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
)
export const SettingsIcon = () => (
  <Icon>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
    <circle cx="9" cy="6" r="2" fill="var(--paper)" />
    <circle cx="15" cy="12" r="2" fill="var(--paper)" />
    <circle cx="8" cy="18" r="2" fill="var(--paper)" />
  </Icon>
)

/** A screen's top bar, with a way back. */
export function Top({ onBack, children }: { onBack?: () => void; children?: ReactNode }) {
  return (
    <div className="top">
      {onBack && (
        <button className="plain" aria-label="Back" onClick={onBack}>
          <BackIcon />
        </button>
      )}
      {children}
    </div>
  )
}

export type Place = 'profiles' | 'settings'

/** The places, at the bottom: Profiles and Settings. */
export function Places({ at, go }: { at: Place; go: (to: Place) => void }) {
  return (
    <nav className="places">
      <button className={at === 'profiles' ? 'here' : ''} aria-current={at === 'profiles' ? 'page' : undefined} onClick={() => go('profiles')}>
        <ProfilesIcon />
        Profiles
      </button>
      <button className={at === 'settings' ? 'here' : ''} aria-current={at === 'settings' ? 'page' : undefined} onClick={() => go('settings')}>
        <SettingsIcon />
        Settings
      </button>
    </nav>
  )
}
