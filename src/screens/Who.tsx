// Who another profile is. Who it is to the person first: the name they gave it, else its short key,
// for them alone (flows/names.ts), never both side by side; then, apart from it, what its profile
// entry says: its market in its color and its role, muted, and a badge for each check whose
// verification from this app's verifier checks. The profile entry is read from the host once a page
// (useWho), unless it is known already: a list of twelve reviews by one writer reads it once. Its
// name or key shows at once; the rest once read. In Messages its market alone, no role: in a market
// a person talks only with the other side.

import { type CSSProperties, type ReactNode, useEffect, useState } from 'react'

import { Avatar, MarketBadge, colorOf } from '../avatar.tsx'
import { config } from '../config.ts'
import { type Who as Known, whoIs } from '../flows/inbox.ts'
import { useNames } from '../hooks.ts'
import { marketWords } from '../markets.ts'
import { checkInWorker } from '../proof/prove.ts'
import { Badges, short } from '../ui.tsx'

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

/** Who the profile at `address` is to the person, alone: the name they gave it, else its short key, in the key's own face. */
export function NameOf({ address }: { address: string }) {
  const name = useNames()[address]
  return name ? <b className="name">{name}</b> : <b className="name key">{short(address)}</b>
}

/** A profile's market in its color, then its role, muted, when given: Tennis matches player. */
export const MarketRole = ({ market, role }: { market: string; role?: string }) => (
  <span className="mkr" style={{ '--h': colorOf(market) } as CSSProperties}>
    <span className="m">{marketWords(market)}</span>
    {role && <> <span className="r">{role}</span></>}
  </span>
)

/** Who another profile is, in two lines: its name or key, with its badges; then its market and role, or its market alone (`market`, in Messages). `aside`, at the first line's right (a time). */
export function Who({ address, who: known, aside, market = false }: { address: string; who?: Known; aside?: ReactNode; market?: boolean }) {
  const who = useWho(address, known)
  return (
    <span className="who">
      <span className="who-line">
        <span className="who-name">
          <NameOf address={address} />
          {who && <Badges checks={who.checks} />}
        </span>
        {aside}
      </span>
      {who && <MarketRole market={who.market} {...(!market && { role: who.role })} />}
    </span>
  )
}

/** The avatar of the profile at `address`, at `size`; a blank square while it is read, or when it can't be. `badge`: a market, its badge on the picture's corner (Messages). */
export function WhoAvatar({ address, who: known, size, badge }: { address: string; who?: Known; size?: 'sm' | 'md' | 'lg'; badge?: string }) {
  const who = useWho(address, known)
  const picture = who ? <Avatar label={labelOf(who)} address={address} {...(size && { size })} /> : <span className={`av ${size ?? 'md'} blank`} aria-hidden />
  if (!badge) return picture
  return (
    <span className="avb">
      {picture}
      <MarketBadge market={badge} />
    </span>
  )
}
