// Links into the app, which services' MCP server hands out to the person's AI: each a path after
// the #, which no server ever sees, so no host's logs keep whose profile or conversation it names.
// App.tsx reads one as the page opens (or as the # changes in a page already open), moves it into
// the page's history, and opens its screen, after Start and the verification when this browser
// isn't in yet:
//
//   #/<market>/<role>                        that profile; with none, New profile, the market's
//                                            sheet open, its Create a tap away
//   #/<market>/<role>/listing/<id>           that listing of theirs: its offer page
//   #/<market>/<role>/messages/<address>     their conversation with that profile
//   #/give-credits/<Profiles folder address> Give credits (screens/Give.tsx)
//
// Each part is read as a URL's path part is, percent-decoded. Anything else after the # is no link.

/** A link, read: what it opens. */
export type Link =
  | { to: 'profile'; label: string }
  | { to: 'listing'; label: string; id: string }
  | { to: 'thread'; label: string; them: string }
  | { to: 'give'; folder: string }

/** An address, as the standard's keys spell one: base58, almost always 43 or 44 characters. */
const ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,50}$/
/** A market's name or a role's, as the markets spell them. */
const NAME = /^[a-z0-9][a-z0-9-]*$/
/** A listing's id: one path part. */
const ID = /^[^/]+$/

/** The link `hash` (a location's, # and all) names, or null. */
export function linkIn(hash: string): Link | null {
  if (!hash.startsWith('#/')) return null
  let parts: string[]
  try {
    parts = hash.slice(2).replace(/\/$/, '').split('/').map(decodeURIComponent)
  } catch {
    return null
  }
  const [a, b, kind, c, ...rest] = parts
  if (rest.length || !a || !b) return null
  if (a === 'give-credits') return kind === undefined && ADDRESS.test(b) ? { to: 'give', folder: b } : null
  if (!NAME.test(a) || !NAME.test(b)) return null
  const label = `${a}/${b}`
  if (kind === undefined) return { to: 'profile', label }
  if (kind === 'listing' && c && ID.test(c)) return { to: 'listing', label, id: c }
  if (kind === 'messages' && c && ADDRESS.test(c)) return { to: 'thread', label, them: c }
  return null
}

/** Whether `value`, from the page's history, is a link as linkIn reads one. */
export function isLink(value: unknown): value is Link {
  const l = value as Partial<Record<string, unknown>> | null
  if (!l || typeof l !== 'object') return false
  const text = (k: string) => typeof l[k] === 'string' && (l[k] as string).length > 0
  switch (l.to) {
    case 'profile':
      return text('label')
    case 'listing':
      return text('label') && text('id')
    case 'thread':
      return text('label') && text('them')
    case 'give':
      return text('folder')
    default:
      return false
  }
}

/** The link that opens `l`, as linkIn reads it back. */
export const linkTo = (l: Link): string =>
  l.to === 'give' ? `#/give-credits/${l.folder}` : `#/${l.label}${l.to === 'listing' ? `/listing/${encodeURIComponent(l.id)}` : l.to === 'thread' ? `/messages/${l.them}` : ''}`
