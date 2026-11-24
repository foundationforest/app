// A listing as others read it, beside its form on a laptop (How it reads): the profile's avatar, its
// short key, its market and role; then each field it holds, in the order its market asks them, by
// the market's label for the role that wrote it, each answer in its own words (show.ts): a price as
// people say it, its note under it, a place by its caption, a date with its zone where it is not the
// reader's; its photos counted; and its own words in full at the foot. `bare`, on an offer's page on
// a laptop, which shows its photos and who posted it itself: its answers and its words alone.

import type { Body } from '@foundationforest/folders'

import { Avatar } from '../avatar.tsx'
import { useCaptions } from '../hooks.ts'
import { askOf, pairOf } from '../markets.ts'
import { answerLines, isPlace, isPrice } from '../show.ts'
import { Named, short } from '../ui.tsx'

export function ListingRead({ label, address, body, bare = false }: { label: string; address: string; body: Body; bare?: boolean }) {
  const { market, role, offers } = pairOf(label)
  const fields = askOf(market, role, 'listing')
  const places = fields.filter((f) => f.piece === 'place').flatMap((f) => (Array.isArray(body[f.name]) ? (body[f.name] as unknown[]) : [body[f.name]]).filter(isPlace))
  const caption = useCaptions(places)
  const about = typeof body.description === 'string' ? body.description : ''
  const shown = fields.filter((f) => f.name !== 'description' && f.name !== 'contact' && body[f.name] !== undefined && !(bare && (f.piece === 'photo' || f.name === 'price')))
  return (
    <article className={bare ? 'listing-read bare' : 'card listing-read'}>
      {!bare && <header className="read-head">
        <Avatar label={label} address={address} size="sm" />
        <span className="two">
          <strong className="mono">{short(address)}</strong>
          <Named label={label} />
        </span>
      </header>}
      {shown.length === 0 && !about && !bare ? <p className="hint">What you fill in shows here.</p> : null}
      <dl className="read-rows">
        {shown.map((f) => {
          const lines = f.piece === 'photo' ? [(body[f.name] as unknown[]).length === 1 ? '1 photo' : `${(body[f.name] as unknown[]).length} photos`] : answerLines(f, body[f.name], { request: !offers, caption })
          const notes = f.piece === 'price' ? (body[f.name] as unknown[]).filter(isPrice).map((p) => p.note ?? '') : []
          if (!lines.length) return null
          return (
            <div key={f.name} className="read-row">
              <dt>{f.label}</dt>
              {lines.map((line, i) => (
                <dd key={i}>
                  {line}
                  {notes[i] && <span className="xs muted"> {notes[i]}</span>}
                </dd>
              ))}
            </div>
          )
        })}
      </dl>
      {about && <p className="read-about">{about}</p>}
      {typeof body.contact === 'string' && body.contact && <p className="xs muted">{body.contact}</p>}
    </article>
  )
}
