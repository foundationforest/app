// The pieces every screen shares: the one-line note that says why something can't be done (red when
// what was given is wrong, quiet when something is still missing), an action's busy and its note,
// the icons (the shield, drawn once here, is how a profile shows it is verified, by its strongest
// check: an outline for a face check, filled for an ID check, an icon whose words show only when it
// is tapped; the unlock icon goes beside the word on a labeled button that asks the passkey, only
// while a tap will ask, never on a list row), a checkbox's box, the dot that marks what is new (and Add a backup, while there is one passkey), the chips of a review, vouch or
// report, a profile's name (its market in bold, then its role, muted: Clothing seller), the bars,
// how long ago something was, the day something happened, and the time of day.

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useBackups, useHeld, useNews, useProfiles, useRated } from './hooks.ts'
import { marketWords, pairOf } from './markets.ts'
import type { Check } from './services/verifier.ts'
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

const Icon = ({ children, label, className }: { children: ReactNode; label?: string; className?: string }) => (
  <svg
    className={className ? `icon ${className}` : 'icon'}
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

/** Beside the word on a labeled button that asks the passkey, and only while a tap will ask: with a seed held (held.ts), none, unless the tap asks a passkey anyway (`always`: one to make, or another to link to). Never on a list row. */
export function UnlockIcon({ always = false }: { always?: boolean }) {
  const held = useHeld()
  if (held && !always) return null
  return (
    <Icon className="unlock">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 7.6-1.7" />
    </Icon>
  )
}
/** What each check's shield says, tapped: its words, and its accessible name. */
const VERIFIED: Record<Check, string> = { face: 'Verified by face', id: 'Verified with ID' }

/**
 * How a profile is verified, by its strongest check: the one way the app says so, an icon, the
 * shield drawn once here. An outline for a face check; filled, its tick in the paper's color, for an
 * ID check. Tapped, it says its words for a moment, above it; the tap goes no further, so a card or
 * row it sits in does not open. A span, not a button, so it can sit inside one.
 */
export function Verified({ check }: { check: Check }) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null)
  useEffect(() => {
    if (!at) return
    const t = setTimeout(() => setAt(null), 2000)
    return () => clearTimeout(t)
  }, [at])
  const words = VERIFIED[check]
  const id = check === 'id'
  return (
    <span
      className={id ? 'verified id' : 'verified'}
      role="img"
      aria-label={words}
      title={words}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        const r = e.currentTarget.getBoundingClientRect()
        // Its middle, kept far enough from the screen's edges for its words to fit.
        setAt({ x: Math.min(Math.max(r.left + r.width / 2, 80), innerWidth - 80), y: r.top })
      }}
    >
      <svg className="icon shield" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" fill={id ? 'currentColor' : 'none'} />
        <polyline points="9,12 11.2,14.2 15.5,9.8" stroke={id ? 'var(--paper)' : 'currentColor'} />
      </svg>
      {at && (
        <span className="verified-said" style={{ left: at.x, top: at.y }}>
          {words}
        </span>
      )}
    </span>
  )
}
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
export const MessageIcon = () => (
  <Icon>
    <path d="M4 5h16v11H9l-5 4z" />
  </Icon>
)
export const BellIcon = () => (
  <Icon>
    <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z" />
    <path d="M10 21h4" />
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
/** A thread's round Send: an icon-only button shows what it does. */
export const SendIcon = () => (
  <Icon>
    <path d="M21 3L10 14" />
    <path d="M21 3l-7 18-4-7-7-4z" />
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
/** The dot: what is new, said as "New"; or, `flag`, a step still to take, drawn alone, since the words beside it say it (Settings' "1 passkey"). */
export const Dot = ({ flag = false }: { flag?: boolean }) => (flag ? <span className="dot" aria-hidden /> : <span className="dot" role="img" aria-label="New" />)

/** A review's score, a vouch or a report, as its chip. */
export function SaidChip({ kind, score }: { kind: 'review' | 'vouch' | 'report'; score?: unknown }) {
  if (kind === 'report') return <span className="said-chip report">Report</span>
  if (kind === 'vouch') return <span className="said-chip vouch">Vouch</span>
  return <span className="said-chip score">{typeof score === 'string' ? score : '–'} ★</span>
}

/** A profile's name, from its label: its market in bold, then its role in the muted tone, no symbol between: Clothing seller. */
export function Named({ label }: { label: string }) {
  const { market, role } = pairOf(label)
  return (
    <span className="named">
      <strong>{marketWords(market)}</strong>
      {role && <> <span className="role">{role}</span></>}
    </span>
  )
}

/** A newer version of the app is live: one quiet line at the top, with Reload, which opens the same screen in it. */
export const NewVersion = () => (
  <p className="line new-version">
    A new version is ready.{' '}
    <button className="link" onClick={() => location.reload()}>
      Reload
    </button>
  </p>
)

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

export type Place = 'profiles' | 'notifications' | 'settings'

const PLACES: Array<[Place, string, () => ReactNode]> = [
  ['profiles', 'Profiles', ProfilesIcon],
  ['notifications', 'Notifications', BellIcon],
  ['settings', 'Settings', SettingsIcon],
]

/** The places, at the bottom: Profiles, Notifications, with how many things are new (messages, reviews, vouches and reports), and Settings, with the dot while the person has one passkey alone. Opening one reads what the index says of every profile. */
export function Places({ at, go }: { at: Place; go: (to: Place) => void }) {
  const list = useProfiles()
  useRated(list)
  const count = useNews(list).all
  const alone = useBackups()?.length === 0
  return (
    <nav className="places">
      {PLACES.map(([place, words, PlaceIcon]) => (
        <button key={place} className={at === place ? 'here' : ''} aria-current={at === place ? 'page' : undefined} onClick={() => go(place)}>
          <span className="place-icon">
            <PlaceIcon />
            {place === 'notifications' && count > 0 && (
              <span className="count" aria-label={`${count} new`}>
                {count}
              </span>
            )}
            {place === 'settings' && alone && <Dot flag />}
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

/** The time of day `time` was, in the device's words for it: 18:42, or 6:42 PM. */
export const clock = (time: number) => new Date(time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

/** Whether `time` falls on another day than `before`, on the device's calendar; true with nothing before. */
export function newDay(before: number | undefined, time: number): boolean {
  if (before === undefined) return true
  const [a, b] = [new Date(before), new Date(time)]
  return a.getFullYear() !== b.getFullYear() || a.getMonth() !== b.getMonth() || a.getDate() !== b.getDate()
}

/** An address cut short, its start and end: enough to tell two apart at a glance. */
export const short = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`
