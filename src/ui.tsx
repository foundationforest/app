// The pieces every screen shares: the one-line note that says why something can't be done (red when
// what was given is wrong, quiet when something is still missing), an action's busy and its note;
// the two badges, drawn once here, how a profile shows it is verified, by its strongest check (a
// selfie check's light, an ID check's solid, whose words show only when tapped); the unlock icon,
// the fingerprint before the word on a labeled button that asks the passkey, only while a tap will
// ask, never on a list row; the round way into messages, always there, with how many are new once
// any is; a checkbox's box, the dot that marks what is new, a rating with its star, the chips of a
// review, vouch or report, a profile's name (its market in bold, then its role, muted: Clothing
// seller), Search Forest (the index, in a new tab), the bars, how long ago something was, the day
// something happened, and the time of day.

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { config } from './config.ts'
import { useHeld } from './hooks.ts'
import { Icon } from './icons.tsx'
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

/** Beside the word on a labeled button that asks the passkey, before it, and only while a tap will ask: with a seed held (held.ts), none, unless the tap asks a passkey anyway (`always`: one to make, or another to link to). Never on a list row. */
export function UnlockIcon({ always = false }: { always?: boolean }) {
  const held = useHeld()
  if (held && !always) return null
  return <Icon name="fingerprint-simple" className="unlock" />
}
/** What each check's badge says, tapped: its words, and its accessible name. */
const VERIFIED: Record<Check, string> = { face: 'Verified with a selfie', id: 'Verified with ID' }

/**
 * How a profile is verified, by its strongest check: the one way the app says so, one of two badges.
 * A selfie check's is light, a face on mint; an ID check's solid, an ID card on the forest green.
 * Tapped, it says its words for a moment, above it; the tap goes no further, so a card or row it
 * sits in does not open. A span, not a button, so it can sit inside one. `big` beside a title.
 */
export function Verified({ check, big = false }: { check: Check; big?: boolean }) {
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
      className={`vb${id ? ' id' : ''}${big ? ' lg' : ''}`}
      role="img"
      aria-label={words}
      title={words}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        const r = e.currentTarget.getBoundingClientRect()
        // Its middle, kept far enough from the screen's edges for its words to fit.
        setAt({ x: Math.min(Math.max(r.left + r.width / 2, 90), innerWidth - 90), y: r.top })
      }}
    >
      <Icon name={id ? 'identification-card' : 'smiley'} fill />
      {at && (
        <span className="verified-said" style={{ left: at.x, top: at.y }}>
          {words}
        </span>
      )}
    </span>
  )
}

/** The way into messages, at a screen's top right: a round button with its own icon, always there, and how many are new once any is. */
export function MessagesButton({ count, onOpen }: { count: number; onOpen: () => void }) {
  return (
    <button className="round" aria-label={count > 0 ? `Messages, ${count} new` : 'Messages'} onClick={onOpen}>
      <Icon name="chat-circle" />
      {count > 0 && (
        <span className="count" aria-hidden>
          {count}
        </span>
      )}
    </button>
  )
}

/** A checkbox's box: empty, or filled with its tick. */
export const TickBox = ({ ticked }: { ticked: boolean }) => (
  <span className={ticked ? 'tick on' : 'tick'} aria-hidden>
    <Icon name="check" bold />
  </span>
)

/** A rating or a score, with its star: the number says it, so the star is hidden from screen readers. */
export const Rating = ({ value }: { value: string }) => (
  <span className="rate">
    <Icon name="star" fill />
    {value}
  </span>
)

/** The dot: something new, a message, a review, a vouch or a report not yet looked at, said as "New". */
export const Dot = () => <span className="dot" role="img" aria-label="New" />

/** A review's score with its star, a vouch or a report, each on its chip. */
export function SaidChip({ kind, score }: { kind: 'review' | 'vouch' | 'report'; score?: unknown }) {
  if (kind === 'report')
    return (
      <span className="said-chip chip bad">
        <Icon name="flag" bold />
        Report
      </span>
    )
  if (kind === 'vouch')
    return (
      <span className="said-chip chip new">
        <Icon name="handshake" bold />
        Vouch
      </span>
    )
  return (
    <span className="said-chip">
      <Rating value={typeof score === 'string' ? score : '–'} />
    </span>
  )
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

/** Search Forest: the index, in a new tab. */
export const Search = () => (
  <a className="search" href={config.index} target="_blank" rel="noopener noreferrer">
    <Icon name="magnifying-glass" />
    <span className="grow">Search Forest</span>
    <Icon name="arrow-up-right" bold />
  </a>
)

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
        <button className="round" aria-label="Back" onClick={onBack}>
          <Icon name="arrow-left" />
        </button>
      )}
      <div className="top-title">{children}</div>
      {right && <div className="top-right">{right}</div>}
    </div>
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
