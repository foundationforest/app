// Who another profile is, as its profile entry says: its market and role, "Clothing seller", and
// the shield of its strongest check whose verification from this app's verifier checks; with its
// address cut short when asked. Read from the host, unless it is known already.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { type Who as Known, whoIs } from '../flows/inbox.ts'
import { checkInWorker } from '../proof/prove.ts'
import { Named, Spinner, Verified, short } from '../ui.tsx'

export function Who({ address, who: known, withAddress = false }: { address: string; who?: Known; withAddress?: boolean }) {
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
  return (
    <span className="who">
      {who ? <Named label={`${who.market}/${who.role}`} /> : <span>A profile Forest can't read</span>}
      {who?.check && <Verified check={who.check} />}
      {withAddress && <span className="addr">{short(address)}</span>}
    </span>
  )
}
