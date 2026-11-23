// A listing, new or edited, from a profile: an offer or a request, as the profile's role names it.
// At the top, Close, its title in the middle (New offer), the profile's avatar at the right; in a
// beta market, one line under it (BETA, said once where a listing is made). Its form: first the
// listing's own words, its description, an open box, since the market asks it first and its first
// line is the listing's title; then the market's own fields and contact, each a row that opens in
// place (Field.tsx), one at a time, in the order the market asks them (form.ts), each shown once
// the answers it depends on hold and dropped when they no longer do, the photos among them; where
// the listing holds spots, each of its times may hold its own (Date.tsx). On a laptop, beside the
// form, How it reads: the listing as others see it, as it is filled in (ListingRead.tsx). An edit
// opens with what still fits its market today, so a listing an older market shaped is posted again
// in today's, in place of the old one; each field whose answer no longer fit says so under its name
// until it is answered again. Everything is checked before the unlock (flows/entries.ts); then one
// unlock moves each circle set on the map by up to a tenth of its radius (near.ts), signs it,
// writes it and sends its new photos. Its path is set as the form opens, so posting again after a
// photo did not go writes the same listing, never a second. Post stays at the foot as the form
// scrolls; an edit's Delete is under it, in red, asking again in its own place: Delete this offer?,
// Cancel and Delete.

import { useRef, useState } from 'react'

import type { Body } from '@foundationforest/folders'

import { Avatar } from '../avatar.tsx'
import { config } from '../config.ts'
import { type Profile, passkey } from '../device.ts'
import { FieldRow, LongText } from '../fields/Field.tsx'
import type { Picked } from '../fields/Photos.tsx'
import { newPhotos, withFiles } from '../flows/photos.ts'
import { type Posted, check, newPath, post, unpost } from '../flows/entries.ts'
import { applies, fitted, formFields, settled } from '../form.ts'
import { useProfiles } from '../hooks.ts'
import { Loader } from '../mark.tsx'
import { BETA, kindWords, markets, pairOf } from '../markets.ts'
import { withPlacesMoved } from '../near.ts'
import { withSeed } from '../passkey.ts'
import { AskAgain, Line, Top, UnlockIcon, useAction } from '../ui.tsx'
import { ListingRead } from './ListingRead.tsx'

type Props = { me: Profile; edit?: Posted; onDone: () => void; onBack: () => void }

/** A body with what was left out left out. */
export const clean = (body: Body): Body => Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)) as Body

export function Listing({ me, edit, onDone, onBack }: Props) {
  const mine = useProfiles()
  const { market: name, role, offers } = pairOf(me.label)
  const market = markets.market(name)
  const fields = market ? formFields(market, role) : []
  // The listing's own words, first; every other field a row. Its spots, when it holds them, which each of its times may hold its own of.
  const about = fields.find((f) => f.name === 'description' && f.piece === 'text')
  const rows = fields.filter((f) => f !== about)
  const spots = fields.find((f) => f.name === 'spots' && f.piece === 'number')
  const [open, setOpen] = useState<string | null>(null)
  // What still fits, and which answers didn't, so their fields are marked.
  const [start] = useState(() => (edit ? fitted(name, role, edit.body) : { body: {}, dropped: [] }))
  const [values, setValues] = useState<Body>(start.body)
  const [path] = useState(() => edit?.path ?? newPath('listing'))
  const picked = useRef<Picked>(new Map()).current

  const photoFields = fields.filter((f) => f.piece === 'photo').map((f) => f.name)
  const send = useAction(async () => {
    const bytes = new Map([...picked].map(([sha, p]) => [sha, p.bytes]))
    const body = withFiles(clean(values), photoFields, bytes)
    await check(config, me, 'listing', body, mine)
    await withSeed(passkey()!, async (seed) => post(config, seed, me, 'listing', await withPlacesMoved(seed, me.label, fields, body), path, newPhotos(body, bytes)))
    onDone()
  })
  const remove = useAction(async () => {
    await withSeed(passkey()!, (seed) => unpost(config, seed, me, path))
    onDone()
  })

  // The device keeps no profile in a market the directory doesn't list (markets.ts, `listed`).
  if (!market) return null
  const set = (n: string, v: unknown) => setValues((was) => settled(fields, { ...was, [n]: v as Body[string] }))
  const word = kindWords('listing', me.label)
  return (
    <main>
      <Top onClose={onBack} right={<Avatar label={me.label} size="sm" />}>
        <h1 className="bar-title">{edit ? word : `New ${word.toLowerCase()}`}</h1>
      </Top>
      {market.status === 'beta' && <p className="hint">{BETA}</p>}
      <div className="posting">
        <form
          id="listing"
          className="form rows-form"
          onSubmit={(e) => {
            e.preventDefault()
            void send.run()
          }}
        >
          {about && <LongText field={about} value={values[about.name]} onChange={(v) => set(about.name, v)} />}
          {rows
            .filter((f) => applies(f, values))
            .map((f) => (
              <FieldRow
                key={f.name}
                field={f}
                value={values[f.name]}
                request={!offers}
                changed={start.dropped.includes(f.name) && values[f.name] === undefined}
                open={open === f.name}
                onOpen={() => setOpen(f.name)}
                onClose={() => setOpen(null)}
                onChange={(v) => set(f.name, v)}
                picked={picked}
                {...(spots && { spots })}
              />
            ))}
        </form>
        <aside className="how-it-reads" aria-label="How it reads">
          <p className="xs muted">How it reads</p>
          <ListingRead label={me.label} address={me.address} body={values} />
        </aside>
      </div>
      <div className="foot">
        <Line note={send.note} />
        <button type="submit" form="listing" className="primary" disabled={send.busy || remove.busy}>
          {send.busy ? <Loader /> : <><UnlockIcon /> Post</>}
        </button>
        {edit && (
          <>
            <AskAgain words="Delete" ask={`Delete this ${word.toLowerCase()}?`} look="danger" unlock busy={remove.busy} disabled={send.busy || remove.busy} note={remove.note} onYes={() => remove.run()} />
          </>
        )}
      </div>
    </main>
  )
}
