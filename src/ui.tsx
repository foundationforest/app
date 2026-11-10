// The pieces every screen shares: the one-line note that says why something can't be done (red when
// what was given is wrong, quiet when something is still missing), an action's busy and its note;
// the two badges, drawn once here, how a profile shows it is verified, by its strongest check (a
// selfie check's light, an ID check's solid; their words a label, shown on a tap only where a badge
// stands alone); the unlock icon, the fingerprint before the word on a labeled button that asks the
// passkey, only while a tap will ask, never on a list row; the round way into messages, always
// there, with how many are new once any is; a checkbox's box, the dot that marks what is new, a
// rating with its star, the chips of a review, vouch or report, You're verified, a profile's name
// (its market in bold, then its role, muted: Clothing seller), Search Forest (the index, in a new
// tab), a sheet risen over the screen, a notice in the sun, the bars, a choice of a few side by
// side, how long ago something was, the day something happened (Today in a thread), the time of
// day, and whether a message's time shows under it.

import { type MouseEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { config } from './config.ts'
import { useHeld } from './hooks.ts'
import { Icon, type IconName } from './icons.tsx'
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

/** Beside the word on a labeled button that asks the passkey, before it, and only while a tap will ask: with a seed held (held.ts), none, unless the tap asks a passkey anyway (`always`: one to make). Never on a list row, nor on Start and its sheets, where every button asks. */
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
 * Its words are its label for screen readers and its title on hover. Inside a row or a card it
 * takes no tap of its own: tapped, it does what the row or card does (tick, open). Only where it
 * stands alone (`alone`: a profile's header) does a tap say its words for a moment, above it. A
 * span, not a button, so it can sit inside one. `big` beside a title.
 */
export function Verified({ check, big = false, alone = false }: { check: Check; big?: boolean; alone?: boolean }) {
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
      className={`vb${id ? ' id' : ''}${big ? ' lg' : ''}${alone ? ' alone' : ''}`}
      role="img"
      aria-label={words}
      title={words}
      {...(alone && {
        onClick: (e: MouseEvent<HTMLSpanElement>) => {
          const r = e.currentTarget.getBoundingClientRect()
          // Its middle, kept far enough from the screen's edges for its words to fit.
          setAt({ x: Math.min(Math.max(r.left + r.width / 2, 90), innerWidth - 90), y: r.top })
        },
      })}
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

/** You're verified: the mint chip, with the badge's icon of the check that verified the person. */
export const YoureVerified = ({ check }: { check: Check }) => (
  <span className="chip new">
    <Icon name={check === 'id' ? 'identification-card' : 'smiley'} fill />
    You're verified
  </span>
)

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

/**
 * A sheet, risen from the screen's bottom over a scrim: its grab, then what it holds, named by its
 * title (`label`). Tapping the scrim, or Escape, closes it. It takes the focus as it opens.
 */
export function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const at = useRef<HTMLElement>(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    at.current?.focus()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close.current()
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [])
  return (
    <>
      <div className="scrim" onClick={() => close.current()} />
      <section className="sheet" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={at}>
        <div className="grab" />
        {children}
      </section>
    </>
  )
}

/** A notice: one line on what came of something, in the sun, with its warning icon. */
export const Notice = ({ children }: { children: ReactNode }) => (
  <p className="notice" role="status">
    <Icon name="warning-circle" fill />
    <span>{children}</span>
  </p>
)

/** A screen's top bar, with a way back (`onBack`, an arrow; `onClose`, a cross, for a screen that closes over another; with no ring when `clear`), and anything at its right. */
export function Top({ onBack, onClose, clear = false, children, right }: { onBack?: () => void; onClose?: () => void; clear?: boolean; children?: ReactNode; right?: ReactNode }) {
  const away = onClose ?? onBack
  return (
    <div className="top">
      {away && (
        <button type="button" className={clear || onClose ? 'round clear' : 'round'} aria-label={onClose ? 'Close' : 'Back'} onClick={away}>
          <Icon name={onClose ? 'x' : 'arrow-left'} />
        </button>
      )}
      <div className="top-title">{children}</div>
      {right && <div className="top-right">{right}</div>}
    </div>
  )
}

/** One choice of a few, side by side on the sunk ground, the one picked raised on a card: each option its words, and its icon, filled when picked. `clears`: the one picked, tapped again, leaves none. */
export function Seg<V extends string>({ label, options, value, onPick, clears = false }: { label: string; options: Array<{ value: V; words: string; icon?: IconName }>; value: V | undefined; onPick: (v: V | undefined) => void; clears?: boolean }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <button key={o.value} type="button" className={on ? 'here' : ''} aria-pressed={on} onClick={() => onPick(on && clears ? undefined : o.value)}>
            {o.icon && <Icon name={o.icon} fill={on} />}
            {o.words}
          </button>
        )
      })}
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

/** The day `time` was, as a thread's line says it: Today, else the day. */
export const dayWords = (time: number, now = Date.now()) => (newDay(now, time) ? day(time, now) : 'Today')

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

/** Whether the message at `i` ends its run, so its time shows under it: the next is from the other side, on another day, or there is none. */
export function lastOfRun(messages: Array<{ mine: boolean; time: number }>, i: number): boolean {
  const [m, next] = [messages[i]!, messages[i + 1]]
  return !next || next.mine !== m.mine || newDay(m.time, next.time)
}

/** An address cut short, its start and end: enough to tell two apart at a glance. */
export const short = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`
