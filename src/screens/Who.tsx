// Who another profile is, as its profile entry says: its market and role, and Verified when a
// verification from this app's verifier checks. Read from the host, unless it is known already.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { type Who as Known, whoIs } from '../flows/inbox.ts'
import { marketWords } from '../markets.ts'
import { checkInWorker } from '../proof/prove.ts'
import { Spinner } from '../ui.tsx'

export function Who({ address, who: known }: { address: string; who?: Known }) {
  const [who, setWho] = useState<Known | undefined>(known)
  useEffect(() => {
    if (known !== undefined) return setWho(known)
    let live = true
    whoIs(config, address, checkInWorker).then(
      (r) => live && setWho(r.who),
      () => live && setWho(null),
    )
    return () => void (live = false)
  }, [address, known])
  if (who === undefined) return <Spinner />
  if (who === null) return <span className="who">A profile Forest can't read</span>
  return (
    <span className="who">
      <span>
        {marketWords(who.market)} · {who.role}
      </span>
      {who.verified && <span className="badge">Verified</span>}
    </span>
  )
}
