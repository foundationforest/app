// The pieces every screen shares: the one-line note that says why something can't be done (red when
// what was given is wrong, quiet when something is still missing), an action's busy and its note,
// the icons (the shield, drawn once here, is how a profile shows it is verified: an icon, never a
// word), a checkbox's box, the dot that marks what is new, the chips of a review, vouch or report, the
// bottom sheet, the bars, how long ago something was, and the day something happened.

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useNews, useProfiles, useRated } from './hooks.ts'
import { Reloading } from './version.ts'
import { SOMETHING, Said } from './words.ts'

export type Note = { text: string; red: boolean }

/** Something still missing, said in a quiet line. */
export class Quiet extends Said {}

/** What went wrong, as one line: the app's own words for it (words.ts), or, for anything it has no words for, one quiet line; no code ever reaches the screen. */
export function noteOf(err: unknown): Note {
  if (err instanceof Said) return { text: err.message, red: err.red }
  console.error(err)
  return { text: SOMETHING, red: false }
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

const Icon = ({ children, label }: { children: ReactNode; label?: string }) => (
  <svg
    className="icon"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
  >
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
/** A profile that is verified: the one way the app says so. */
export const Shield = () => (
  <svg className="icon shield" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Verified">
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" />
    <polyline points="9,12 11.2,14.2 15.5,9.8" />
  </svg>
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
export const InboxIcon = ({ label }: { label?: string }) => (
  <Icon {...(label && { label })}>
    <path d="M4 13l2.5-8h11L20 13v6H4z" />
    <path d="M4 13h4.5l1 2h5l1-2H20" />
  </Icon>
)
export const MessageIcon = () => (
  <Icon>
    <path d="M4 5h16v11H9l-5 4z" />
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
export const ShareIcon = () => (
  <Icon>
    <path d="M12 15V3" />
    <polyline points="7,8 12,3 17,8" />
    <path d="M5 12v8h14v-8" />
  </Icon>
)
export const PencilIcon = () => (
  <Icon>
    <path d="M4 20l1-5L16 4l4 4L9 19z" />
    <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
  </Icon>
)
export const CheckIcon = ({ label }: { label?: string }) => (
  <Icon {...(label && { label })}>
    <polyline points="5,12.5 10,17.5 19,7" />
  </Icon>
)
/** A checkbox's box: empty, or filled with its tick. */
export const TickBox = ({ ticked }: { ticked: boolean }) => (
  <svg className={ticked ? 'icon tick ticked' : 'icon tick'} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    {ticked && <polyline points="7.5,12.5 10.5,15.5 16.5,9" />}
  </svg>
)
export const PlusIcon = () => (
  <Icon>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
)
export const CloseIcon = () => (
  <Icon>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </Icon>
)
export const DeviceIcon = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <line x1="8" y1="20" x2="16" y2="20" />
    <line x1="12" y1="16" x2="12" y2="20" />
  </Icon>
)
export const LightIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
)
export const DarkIcon = () => (
  <Icon>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </Icon>
)

/** Something new: a message, a review, a vouch or a report not yet looked at. */
export const Dot = () => <span className="dot" role="img" aria-label="New" />

/** A review's score, a vouch or a report, as its chip. */
export function SaidChip({ kind, score }: { kind: 'review' | 'vouch' | 'report'; score?: unknown }) {
  if (kind === 'report') return <span className="said-chip report">Report</span>
  if (kind === 'vouch') return <span className="said-chip vouch">Vouch</span>
  return <span className="said-chip score">{typeof score === 'string' ? score : '–'} ★</span>
}

/** A sheet from the bottom, over the screen; a tap outside it closes it. */
export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="sheet-cover" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

/** A screen's top bar, with a way back, and anything at its right. */
export function Top({ onBack, children, right }: { onBack?: () => void; children?: ReactNode; right?: ReactNode }) {
  return (
    <div className="top">
      {onBack && (
        <button className="plain" aria-label="Back" onClick={onBack}>
          <BackIcon />
        </button>
      )}
      <div className="top-title">{children}</div>
      {right && <div className="top-right">{right}</div>}
    </div>
  )
}

export type Place = 'profiles' | 'inbox' | 'settings'

const PLACES: Array<[Place, string, () => ReactNode]> = [
  ['profiles', 'Profiles', ProfilesIcon],
  ['inbox', 'Inbox', () => <InboxIcon />],
  ['settings', 'Settings', SettingsIcon],
]

/** The places, at the bottom: Profiles, Inbox, with how many new things it holds, and Settings. Opening one reads what the index says of every profile. */
export function Places({ at, go }: { at: Place; go: (to: Place) => void }) {
  const list = useProfiles()
  useRated(list)
  const count = useNews(list).total
  return (
    <nav className="places">
      {PLACES.map(([place, words, PlaceIcon]) => (
        <button key={place} className={at === place ? 'here' : ''} aria-current={at === place ? 'page' : undefined} onClick={() => go(place)}>
          <span className="place-icon">
            <PlaceIcon />
            {place === 'inbox' && count > 0 && (
              <span className="count" aria-label={`${count} new`}>
                {count}
              </span>
            )}
          </span>
          {words}
        </button>
      ))}
    </nav>
  )
}

/** How long ago `time` was, as few words as work: now, 5 min, 2 h, 3 d, then the date. */
export function ago(time: number, now = Date.now()): string {
  const minutes = Math.floor((now - time) / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d`
  return new Date(time).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/** The day `time` was: 3 Nov, and its year when it is not this one. */
export function day(time: number, now = Date.now()): string {
  const d = new Date(time)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', ...(d.getFullYear() !== new Date(now).getFullYear() && { year: 'numeric' }) })
}

/** An address cut short, its start and end: enough to tell two apart at a glance. */
export const short = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`
