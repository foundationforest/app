// A profile's card: its market and role, how it is verified, and Share, which copies the link anyone
// can tap to message it. Its posts come in a later version.

import { useState } from 'react'

import { config } from '../config.ts'
import { CHECK_WORDS, useChecks, useProfiles } from '../hooks.ts'
import { marketWords, pairOf } from '../markets.ts'
import { Top } from '../ui.tsx'

type Props = { address: string; onBack: () => void }

/** The link that opens the app on a new message to the profile at `address`. */
export const shareLink = (address: string) => `${config.app}/message?to=${address}`

export function Card({ address, onBack }: Props) {
  const list = useProfiles()
  const profile = list.find((p) => p.address === address)
  const checks = useChecks(profile ? [profile] : [])[address] ?? []
  const [copied, setCopied] = useState(false)
  if (!profile) return null
  const pair = pairOf(profile.label)
  const share = async () => {
    await navigator.clipboard.writeText(shareLink(address))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <main>
      <Top onBack={onBack} />
      <div className="stack">
        <h1>{marketWords(pair.market)}</h1>
        <p>{pair.role}</p>
        <span className="badges">
          {checks.map((c) => (
            <span key={c} className="badge">
              {CHECK_WORDS[c]}
            </span>
          ))}
        </span>
      </div>
      <button onClick={() => void share()}>{copied ? 'Copied' : 'Share'}</button>
    </main>
  )
}
