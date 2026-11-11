// Labels for the tests that need only some profiles, and which side each is on: found in the
// directory (directory.ts), never named, so a market changing or going leaves them working.

import { markets } from '../src/markets.ts'
import { oneRole, twoSides } from './directory.ts'

const one = twoSides(markets)
const two = twoSides(markets, (m) => m.name !== one.market.name)

/** A role that offers, and its market's role that requests: a tutor and a student. */
export const OFFERS = one.offer.label
export const REQUESTS = one.request.label

/** Another market's role that offers, and its role that requests: a seller and a buyer. */
export const OTHER_OFFERS = two.offer.label
export const OTHER_REQUESTS = two.request.label

/** A market's only role, whose profiles deal with each other: a player. */
export const ONE_ROLE = oneRole(markets).label

/** A label's market and role. */
export const split = (label: string) => {
  const [market, role] = label.split('/') as [string, string]
  return { market, role }
}
