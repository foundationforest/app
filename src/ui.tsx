// What every screen draws with: the icons, setup's progress line, and an action's busy and error
// state. The mark has its own file (mark.tsx).

import { type ReactNode, useState } from 'react'

import { NoPrf } from './seed/passkey.ts'
import { ServiceError } from './services/http.ts'
import { Reloading } from './version.ts'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function Icon({ size = 24, children }: { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      {children}
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

/** Setup's two steps, the current one and the one before it filled. */
export function Progress({ step }: { step: 1 | 2 }) {
  return (
    <div className="progress" aria-label={`Step ${step} of 2`}>
      {[1, 2].map((n) => (
        <span key={n} className={n <= step ? 'on' : ''} />
      ))}
    </div>
  )
}

/** A score from the index: the star and the rating out of 10. */
export const Score = ({ value }: { value: number }) => (
  <span className="score">
    <StarIcon />
    {value.toFixed(1)}
  </span>
)

/** What the face check says when the issuer has this face from another setup: that setup's passkey opens it. */
export const DUPLICATE_FACE = 'This face already has a setup. Sign in with that passkey.'

/** What setup says when the issuer gave this note number its welcome gift before: no credits come. */
export const GIFT_GIVEN = 'Your welcome credits were already given once; write to us to get more.'

/** An error in the person's words, where the app has them; a service's own code where it has not. */
export function errorText(err: unknown): string {
  if (err instanceof NoPrf) return err.message
  if (err instanceof Reloading) return ''
  if (err instanceof DOMException && err.name === 'NotAllowedError') return 'Your face or fingerprint was not given.'
  if (err instanceof DOMException && err.name === 'AbortError') return ''
  if (err instanceof ServiceError) {
    if (err.code === 'duplicate_face') return DUPLICATE_FACE
    if (err.code === 'session_used') return 'This check was used before, by another setup.'
    if (err.code === 'try_later') return 'Too many checks from here. Try again later.'
    return `${new URL(err.url).host}: ${err.code}`
  }
  if (err instanceof TypeError && /fetch/i.test(err.message)) return 'No connection.'
  return err instanceof Error ? err.message : String(err)
}

/** An action's run, its busy state and its error, in the person's words. Busy still while the page reloads to take a new version. */
export function useAction<A extends unknown[]>(fn: (...args: A) => Promise<void>) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const run = async (...args: A) => {
    setBusy(true)
    setError('')
    try {
      await fn(...args)
    } catch (err) {
      if (err instanceof Reloading) return
      console.error(err)
      setError(errorText(err))
    }
    setBusy(false)
  }
  return { run, busy, error }
}
