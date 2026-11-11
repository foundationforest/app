// A profile's avatar, on its market's color. One of the person's own profiles, wherever it shows, and a
// market's role with no profile behind it (on the role sheet): the market's icon, so a person tells
// their own profiles apart by their markets. Anyone else's profile: its animal (animals.ts), picked
// from its address. Solid, white on the color, when its role's listings are offers; light, in the
// color on a tint of it, when they are requests. The color and the icon follow one rule for the app
// and the index, services' own (index/src/avatar.ts, imported by path as the host's credits client
// is): a market's color from the directory, walked in its order, so markets differ up to ten; its
// icon from a small table of Phosphor's names, a nicety. A market the table doesn't list, or whose
// icon the app doesn't draw, shows its name's first letter. The animal is the app's own: the index
// draws the market's icon for every profile.

import type { CSSProperties } from 'react'

import { colorIn, colorsFor, iconOf as named } from '../services/index/src/avatar.ts'
import { animalOf } from './animals.ts'
import { profiles } from './device.ts'
import { Icon, type IconName, isIcon } from './icons.tsx'
import { markets, pairOf } from './markets.ts'

/** Every market's color, from the directory in its order. */
const COLORS = colorsFor(markets.directory.markets.map((m) => m.name))

/** A market's color: the directory's, else its first choice. */
export const colorOf = (market: string): string => colorIn(COLORS, market)

/** A market's icon, among those the app draws, or null: its avatar then shows its first letter. */
export const iconOf = (market: string): IconName | null => {
  const name = named(market)
  return name && isIcon(name) ? name : null
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
      {theirs ? <Animal address={address} /> : icon ? <Icon name={icon} fill /> : <span className="letter">{market.charAt(0).toUpperCase()}</span>}
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
