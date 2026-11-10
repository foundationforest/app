// Who another profile is, as its profile entry says: its avatar (unless the row it sits in leads with
// one), its market and role, "Clothing seller", and the badge of its strongest check whose
// verification from this app's verifier checks; with its address cut short when asked. Read from
// the host once a page (useWho), unless it is known already: a list of twelve reviews by one writer
// reads them once.

import { useEffect, useState } from 'react'

import { Avatar } from '../avatar.tsx'
import { config } from '../config.ts'
import { type Who as Known, whoIs } from '../flows/inbox.ts'
import { Loader } from '../mark.tsx'
import { checkInWorker } from '../proof/prove.ts'
import { Named, Verified, short } from '../ui.tsx'

/** Who each profile is, as read in this page: what a profile entry says is public, so it is held while the page is open; and each answer once it came. */
const read = new Map<string, Promise<Known>>()
const came = new Map<string, Known>()

/** Who the profile at `address` is: read once a page, a read that failed read again next time. */
function whoAt(address: string): Promise<Known> {
  let got = read.get(address)
  if (!got) {
    got = whoIs(config, address, checkInWorker).then(
      (r) => {
        came.set(address, r.who)
        return r.who
      },
      () => {
        read.delete(address)
        return null
      },
    )
    read.set(address, got)
  }
  return got
}

/** Who the profile at `address` is: undefined while it is read, null when no host here holds its profile entry; `known`, when given, at once. */
export function useWho(address: string, known?: Known): Known | undefined {
  const [who, setWho] = useState<Known | undefined>(known !== undefined ? known : came.get(address))
  useEffect(() => {
    if (known !== undefined) return setWho(known)
    setWho(came.get(address))
    let live = true
    void whoAt(address).then((w) => live && setWho(w))
    return () => void (live = false)
  }, [address, known])
  return who
}

/** The label of a profile someone is, for its avatar. */
export const labelOf = (who: NonNullable<Known>) => `${who.market}/${who.role}`

export function Who({ address, who: known, withAddress = false, avatar = true }: { address: string; who?: Known; withAddress?: boolean; avatar?: boolean }) {
  const who = useWho(address, known)
  if (who === undefined) return <Loader />
  return (
    <span className="who">
      {who && avatar && <Avatar label={labelOf(who)} size="xs" />}
      {who ? <Named label={labelOf(who)} /> : <span>A profile Forest can't read</span>}
      {who?.check && <Verified check={who.check} />}
      {withAddress && <span className="addr">{short(address)}</span>}
    </span>
  )
}

/** The avatar of the profile at `address`, at `size`; a blank square while it is read, or when it can't be. */
export function WhoAvatar({ address, who: known, size }: { address: string; who?: Known; size?: 'xs' | 'sm' | 'md' }) {
  const who = useWho(address, known)
  return who ? <Avatar label={labelOf(who)} {...(size && { size })} /> : <span className={`av ${size ?? 'md'} blank`} aria-hidden />
}
