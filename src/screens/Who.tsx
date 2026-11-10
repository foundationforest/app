// Who another profile is, as its profile entry says: its avatar (unless the row it sits in leads with
// one), its market and role, "Clothing seller", and the badge of its strongest check whose
// verification from this app's verifier checks; with its address cut short when asked. Read from
// the host, unless it is known already.

import { useEffect, useState } from 'react'

import { Avatar } from '../avatar.tsx'
import { config } from '../config.ts'
import { type Who as Known, whoIs } from '../flows/inbox.ts'
import { Loader } from '../mark.tsx'
import { checkInWorker } from '../proof/prove.ts'
import { Named, Verified, short } from '../ui.tsx'

export function Who({ address, who: known, withAddress = false, avatar = true }: { address: string; who?: Known; withAddress?: boolean; avatar?: boolean }) {
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
  if (who === undefined) return <Loader />
  return (
    <span className="who">
      {who && avatar && <Avatar label={`${who.market}/${who.role}`} size="xs" />}
      {who ? <Named label={`${who.market}/${who.role}`} /> : <span>A profile Forest can't read</span>}
      {who?.check && <Verified check={who.check} />}
      {withAddress && <span className="addr">{short(address)}</span>}
    </span>
  )
}
