// What every screen draws with: the mark, the icons, setup's progress line, the words' grid, and an
// action's busy and error state.

import { type ReactNode, useState } from 'react'

import { NoPrf } from './seed/passkey.ts'
import { ServiceError } from './services/http.ts'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function Icon({ size = 24, children }: { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      {children}
    </svg>
  )
}

/** The mark: the app's icon, the accent square and the tree. */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="112" fill="var(--accent)" />
      <path d="M256 112 L348 240 H298 L372 352 H140 L214 240 H164 Z" fill="#edeae0" />
      <rect x="238" y="352" width="36" height="56" rx="4" fill="#edeae0" />
    </svg>
  )
}

export const MenuIcon = () => (
  <Icon>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
)

export const BackIcon = () => (
  <Icon>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
)

export const BellIcon = () => (
  <Icon>
    <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </Icon>
)

export const InboxIcon = () => (
  <Icon>
    <path d="M5.5 5h13L21 13v6H3v-6z" />
    <path d="M3 13h5l1.5 3h5L16 13h5" />
  </Icon>
)

export const CopyIcon = () => (
  <Icon size={20}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
  </Icon>
)

export const CheckIcon = () => (
  <Icon size={20}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
)

export const EyeIcon = () => (
  <Icon size={22}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const EyeOffIcon = () => (
  <Icon size={22}>
    <path d="M10 5.7A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 6.6C3.9 8.3 2.5 12 2.5 12S6 18.5 12 18.5a9 9 0 0 0 5.4-1.7" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Icon>
)

export const MoreIcon = () => (
  <Icon>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </Icon>
)

export const ScanFaceIcon = ({ size = 96 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
    <path d="M9 9.5v1M15 9.5v1M12 9.5v3.5h-1" />
    <path d="M9 15.5c1.6 1.3 4.4 1.3 6 0" />
  </Icon>
)

export const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill="currentColor" />
  </svg>
)

export const Spinner = () => <span className="spinner" role="status" aria-label="Working" />

/** Setup's three steps, the current one and those before it filled. */
export function Progress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="progress" aria-label={`Step ${step} of 3`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= step ? 'on' : ''} />
      ))}
    </div>
  )
}

export function Words({ words }: { words: string }) {
  return (
    <ol className="words">
      {words.split(' ').map((word, i) => (
        <li key={i}>
          <span>{i + 1}</span>
          <span>{word}</span>
        </li>
      ))}
    </ol>
  )
}

/** A score from the index: the star and the rating out of 10. */
export const Score = ({ value }: { value: number }) => (
  <span className="score">
    <StarIcon />
    {value.toFixed(1)}
  </span>
)

/** An error in the person's words, where the app has them; a service's own code where it has not. */
export function errorText(err: unknown): string {
  if (err instanceof NoPrf) return err.message
  if (err instanceof DOMException && err.name === 'NotAllowedError') return 'Your face or fingerprint was not given.'
  if (err instanceof DOMException && err.name === 'AbortError') return ''
  if (err instanceof ServiceError) {
    if (err.code === 'duplicate_face') return 'This face was checked before, with other 24 words.'
    if (err.code === 'session_used') return 'This check was used before, with other 24 words.'
    if (err.code === 'try_later') return 'Too many checks from here. Try again later.'
    return `${new URL(err.url).host}: ${err.code}`
  }
  if (err instanceof TypeError && /fetch/i.test(err.message)) return 'No connection.'
  return err instanceof Error ? err.message : String(err)
}

/** An action's run, its busy state and its error, in the person's words. */
export function useAction<A extends unknown[]>(fn: (...args: A) => Promise<void>) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const run = async (...args: A) => {
    setBusy(true)
    setError('')
    try {
      await fn(...args)
    } catch (err) {
      console.error(err)
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }
  return { run, busy, error }
}
