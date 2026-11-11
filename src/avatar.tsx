// A profile's avatar, on its market's color. One of the person's own profiles, wherever it shows, and a
// market's role with no profile behind it (on the role sheet): the market's icon, so a person tells
// their own profiles apart by their markets. Anyone else's profile: its animal (animals.ts), picked
// from its address. Solid, white on the color, when its role's listings are offers; light, in the
// color on a tint of it, when they are requests. The color is the index's, services' own
// (index/src/avatar.ts, imported by path as the host's credits client is): the market's number, from
// its market file, cycled through the index's ten colors, so a market is the same color in the app
// and on the index and markets numbered next to each other differ; a market the directory no longer
// lists takes the quiet ink. The icon is the one its market file names, a Phosphor icon the build
// brings in (build/markets.ts); a market that names none, or one the app doesn't draw, shows its
// name's first letter. The animal is the app's own: the index draws the market's icon for every profile.
// In Messages, the picture of the person a conversation is with carries its market's badge at its
// bottom right: the market's icon, white on its color, the same icon the person's own profile there
// shows, so it says which of their profiles the conversation is with.

import type { CSSProperties } from 'react'

import { colorFor } from '../services/index/src/avatar.ts'
import icons from 'virtual:market-icons'
import { animalOf } from './animals.ts'
import { profiles } from './device.ts'
import { markets, pairOf } from './markets.ts'

/** A market's color: its number's, in the index's palette; the quiet ink for one the directory doesn't list. */
export const colorOf = (market: string): string => colorFor(markets.market(market)?.number)

/** The icon a market's file names, when the app draws it, else null: its avatar then shows its first letter. */
export const iconOf = (market: string): string | null => {
  const name = markets.market(market)?.icon
  return name && Object.hasOwn(icons, name) ? name : null
}

/** A market's icon, filled, by its Phosphor name; hidden from screen readers, as its avatar is. */
export function MarketIcon({ name }: { name: string }) {
  const Drawn = icons[name]!
  return <Drawn className="icon" weight="fill" data-icon={name} focusable="false" aria-hidden />
}

type Size = 'sm' | 'md' | 'lg'

/** The avatar of the profile at `address`, of `label`, at `size`: its animal when it is someone else's; its market's icon when it is one of the person's own (the device lists it), or with no address. Hidden from screen readers: its name beside it says it. */
export function Avatar({ label, address, size = 'md' }: { label: string; address?: string; size?: Size }) {
  const { market, listings } = pairOf(label)
  const icon = iconOf(market)
  const style = { '--h': colorOf(market) } as CSSProperties
  const theirs = address !== undefined && !profiles().some((p) => p.address === address)
  return (
    <span className={`av ${size}${listings === 'offers' ? '' : ' look'}`} style={style} data-market={market} aria-hidden>
      {theirs ? <Animal address={address} /> : icon ? <MarketIcon name={icon} /> : <span className="letter">{market.charAt(0).toUpperCase()}</span>}
    </span>
  )
}

/** An animal, drawn in the color of the text around it. Hidden from screen readers, as its avatar is. */
function Animal({ address }: { address: string }) {
  const [name, paths] = animalOf(address)
  return (
    <svg className="icon animal" viewBox="0 0 32 32" fill="currentColor" data-animal={name} aria-hidden="true">
      {paths.map((p, i) => (typeof p === 'string' ? <path key={i} d={p} /> : <path key={i} d={p.d} fillRule="evenodd" clipRule="evenodd" />))}
    </svg>
  )
}

/** A market's badge on a picture's bottom right corner: its icon (else its first letter), white on its color. Hidden from screen readers, as the avatar is. */
export function MarketBadge({ market }: { market: string }) {
  const icon = iconOf(market)
  return (
    <span className="mb" style={{ '--h': colorOf(market) } as CSSProperties} data-market={market} aria-hidden>
      {icon ? <MarketIcon name={icon} /> : <span className="letter">{market.charAt(0).toUpperCase()}</span>}
    </span>
  )
}
