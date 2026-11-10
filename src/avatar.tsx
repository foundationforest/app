// A profile's avatar: its market's icon on its market's color. Solid, a white icon on the color, when
// its role's listings are offers; light, the icon in the color on a tint of it, when they are
// requests. A market's color is its name's (colors.ts). Its icon comes from a small table, a nicety:
// a market the table doesn't list shows its name's first letter. The table may hold names the
// directory no longer has, and miss new ones.

import type { CSSProperties } from 'react'

import { colorOf } from './colors.ts'
import { Icon, type IconName } from './icons.tsx'
import { pairOf } from './markets.ts'

/** The markets with an icon of their own. */
const ICONS: Record<string, IconName> = {
  tutoring: 'graduation-cap',
  clothing: 't-shirt',
  electronics: 'laptop',
  'home-cleaning': 'broom',
  'home-repair': 'wrench',
  'software-development': 'code',
  'sports-coaching': 'soccer-ball',
  'tennis-matches': 'tennis-ball',
}

/** A market's icon, or null: its avatar then shows its first letter. */
export const iconOf = (market: string): IconName | null => (Object.hasOwn(ICONS, market) ? ICONS[market]! : null)

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
