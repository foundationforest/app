// A profile's avatar: its market's icon on its market's color. Solid, a white icon on the color, when
// its role's listings are offers; light, the icon in the color on a tint of it, when they are
// requests. The color and the icon follow one rule for the app and the index, services' own
// (index/src/avatar.ts, imported by path as the host's credits client is): a market's color from the
// directory, walked in its order, so markets differ up to ten; its icon from a small table of
// Phosphor's names, a nicety. A market the table doesn't list, or whose icon the app doesn't draw,
// shows its name's first letter.

import type { CSSProperties } from 'react'

import { colorIn, colorsFor, iconOf as named } from '../services/index/src/avatar.ts'
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

type Size = 'xs' | 'sm' | 'md' | 'lg'

/** The avatar of a profile of `label`, at `size`. Hidden from screen readers: its name beside it says it. */
export function Avatar({ label, size = 'md' }: { label: string; size?: Size }) {
  const { market, listings } = pairOf(label)
  const icon = iconOf(market)
  const style = { '--h': colorOf(market) } as CSSProperties
  return (
    <span className={`av ${size}${listings === 'offers' ? '' : ' look'}`} style={style} data-market={market} aria-hidden>
      {icon ? <Icon name={icon} fill /> : <span className="letter">{market.charAt(0).toUpperCase()}</span>}
    </span>
  )
}
